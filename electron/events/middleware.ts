/**
 * Pre-built middleware functions for the TypedEventBus.
 * Provides common functionality like logging, metrics, and filtering.
 */

/* eslint-disable n/callback-return -- Middleware pattern doesn't follow Node.js callback convention */

import type { EventMiddleware } from "./TypedEventBus";

import { isDevelopment } from "../../shared/utils/environment";
import { logger as baseLogger } from "../utils/logger";

/**
 * Type alias for validation result that can be either a boolean or detailed result object.
 *
 * @remarks
 * Validators can return:
 * - `true` for successful validation
 * - `false` for failed validation (generic error)
 * - `{ isValid: true }` for successful validation with context
 * - `{ isValid: false, error?: string }` for failed validation with specific error message
 */
type ValidationResult = boolean | { error?: string; isValid: boolean };

/**
 * Type alias for validator function that validates event data.
 */
type ValidatorFunction<TData = unknown> = (data: TData) => ValidationResult;

/**
 * Type alias for validator map that maps event names to their validator functions.
 */
type ValidatorMap<T extends Record<string, unknown>> = Partial<{
    [K in keyof T]: ValidatorFunction<T[K]>;
}>;

const logger = baseLogger;
const EVENT_EMITTED_MSG = "[EventBus] Event emitted";

/**
 * Middleware composer to combine multiple middleware functions.
 */
export function composeMiddleware(...middlewares: EventMiddleware[]): EventMiddleware {
    return async (event: string, data: unknown, next: () => Promise<void> | void) => {
        const state = {
            index: 0,
        };

        const processNext = async (): Promise<void> => {
            if (state.index < middlewares.length) {
                const middleware = middlewares[state.index++];
                if (middleware) {
                    await middleware(event, data, processNext);
                    return;
                }
            } else {
                await next();
            }
        };

        await processNext();
    };
}

/**
 * Debug middleware that provides detailed debugging information.
 */
export function createDebugMiddleware(options: { enabled?: boolean; verbose?: boolean }): EventMiddleware {
    const { enabled = isDevelopment(), verbose = false } = options;

    return async (event: string, data: unknown, next: () => Promise<void> | void) => {
        if (!enabled) {
            await next();
            return;
        }

        const startTime = Date.now();

        if (verbose) {
            logger.debug(`[EventBus:Debug] Processing event '${event}'`, {
                data,
                event,
                timestamp: startTime,
            });
        } else {
            logger.debug(`[EventBus:Debug] Processing event '${event}'`);
        }

        await next();

        const duration = Date.now() - startTime;
        logger.debug(`[EventBus:Debug] Completed event '${event}' in ${duration}ms`);
    };
}

/**
 * Error handling middleware that catches and logs middleware errors.
 */
export function createErrorHandlingMiddleware(options: {
    continueOnError?: boolean;
    onError?: (error: Error, event: string, data: unknown) => void;
}): EventMiddleware {
    const { continueOnError = true, onError } = options;

    return async (event: string, data: unknown, next: () => Promise<void> | void) => {
        try {
            await next();
            return;
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));

            logger.error(`[EventBus] Middleware error for event '${event}'`, {
                data: safeSerialize(data),
                error: err,
                event,
            });

            if (onError) {
                onError(err, event, data);
            }

            if (!continueOnError) {
                throw err;
            }
            return;
        }
    };
}

/**
 * Filter middleware that can block certain events based on conditions.
 */
export function createFilterMiddleware(options: {
    allowList?: string[];
    blockList?: string[];
    condition?: (event: string, data: unknown) => boolean;
}): EventMiddleware {
    const { allowList, blockList, condition } = options;

    return async (event: string, data: unknown, next: () => Promise<void> | void) => {
        // Check allow list
        if (allowList && !allowList.includes(event)) {
            logger.debug(`[EventBus] Event '${event}' blocked by allow list`);
            return;
        }

        // Check block list
        if (blockList?.includes(event)) {
            logger.debug(`[EventBus] Event '${event}' blocked by block list`);
            return;
        }

        // Check custom condition
        if (condition && !condition(event, data)) {
            logger.debug(`[EventBus] Event '${event}' blocked by custom condition`);
            return;
        }

        await next();
    };
}

/**
 * Logging middleware that logs all events with configurable detail levels.
 */
export function createLoggingMiddleware(options: {
    filter?: (eventName: string) => boolean;
    includeData?: boolean;
    level?: "debug" | "error" | "info" | "warn";
}): EventMiddleware {
    const { filter, includeData = false, level = "info" } = options;

    return async (event: string, data: unknown, next: () => Promise<void> | void) => {
        // Apply filter if provided
        if (filter && !filter(event)) {
            await next();
            return;
        }

        const logData = includeData ? { data, event } : { event };

        switch (level) {
            case "debug": {
                logger.debug(EVENT_EMITTED_MSG, logData);
                break;
            }
            case "error": {
                logger.error(EVENT_EMITTED_MSG, logData);
                break;
            }
            case "info": {
                logger.info(EVENT_EMITTED_MSG, logData);
                break;
            }
            case "warn": {
                logger.warn(EVENT_EMITTED_MSG, logData);
                break;
            }
        }

        await next();
    };
}

/**
 * Metrics middleware that tracks event counts and timing.
 */
export function createMetricsMiddleware(options: {
    metricsCallback?: (metric: { name: string; type: "counter" | "timing"; value: number }) => void;
    trackCounts?: boolean;
    trackTiming?: boolean;
}): EventMiddleware {
    const { metricsCallback, trackCounts = true, trackTiming = true } = options;
    const eventCounts = new Map<string, number>();
    const eventTimings = new Map<string, number[]>();

    return async (event: string, _data: unknown, next: () => Promise<void> | void) => {
        const startTime = Date.now();

        // Track event counts
        if (trackCounts) {
            const count = eventCounts.get(event) ?? 0;
            eventCounts.set(event, count + 1);

            if (metricsCallback) {
                metricsCallback({
                    name: `events.${event}.count`,
                    type: "counter",
                    value: count + 1,
                });
            }
        }

        await next();

        // Track event timing
        if (trackTiming) {
            const duration = Date.now() - startTime;
            const timings = eventTimings.get(event) ?? [];
            timings.push(duration);
            eventTimings.set(event, timings);

            if (metricsCallback) {
                metricsCallback({
                    name: `events.${event}.duration`,
                    type: "timing",
                    value: duration,
                });
            }
        }
    };
}

/**
 * Rate limiting middleware to prevent event spam.
 */
export function createRateLimitMiddleware(options: {
    burstLimit?: number;
    maxEventsPerSecond?: number;
    onRateLimit?: (event: string, data: unknown) => void;
}): EventMiddleware {
    const { burstLimit = 10, maxEventsPerSecond = 100, onRateLimit } = options;
    const eventTimes = new Map<string, number[]>();

    return async (event: string, data: unknown, next: () => Promise<void> | void) => {
        const now = Date.now();
        const times = eventTimes.get(event) ?? [];

        // Remove old entries (older than 1 second)
        const recent = times.filter((time) => now - time < 1000);

        // Check burst limit
        if (recent.length >= burstLimit) {
            logger.warn(`[EventBus] Rate limit exceeded for event '${event}' (burst limit: ${burstLimit})`);
            if (onRateLimit) {
                onRateLimit(event, data);
            }
            return; // Don't continue to next middleware
        }

        // Check rate limit
        if (recent.length >= maxEventsPerSecond) {
            logger.warn(`[EventBus] Rate limit exceeded for event '${event}' (rate limit: ${maxEventsPerSecond}/sec)`);
            if (onRateLimit) {
                onRateLimit(event, data);
            }
            return; // Don't continue to next middleware
        }

        // Update event times
        recent.push(now);
        eventTimes.set(event, recent);

        await next();
    };
}

/**
 * Validation middleware that validates event data against schemas with type safety.
 *
 * @param validators - Map of event names to validator functions
 * @returns EventMiddleware function
 *
 * @remarks
 * This middleware validates event data before processing. It supports both simple boolean
 * validators and detailed validators that can provide specific error messages.
 *
 * @example
 * ```typescript
 * const validators = {
 *   'user:login': (data: { userId: string }) => !!data.userId,
 *   'data:update': (data: { table: string }) =>
 *     data.table ? { isValid: true } : { isValid: false, error: 'Table name required' }
 * };
 *
 * const validationMiddleware = createValidationMiddleware(validators);
 * ```
 */
export function createValidationMiddleware<T extends Record<string, unknown>>(
    validators: ValidatorMap<T>
): EventMiddleware {
    return async (event: string, data: unknown, next: () => Promise<void> | void) => {
        // Type-safe validator lookup with runtime validation
        if (!Object.prototype.hasOwnProperty.call(validators, event)) {
            // No validator for this event - continue processing
            await next();
            return;
        }

        const validator = validators[event as keyof T];

        if (!validator) {
            // Validator is undefined - continue processing
            await next();
            return;
        }

        try {
            const result = validator(data as T[keyof T]);

            if (typeof result === "boolean") {
                if (!result) {
                    logger.error(`[EventBus] Validation failed for event '${event}'`, {
                        data: safeSerialize(data),
                        event,
                    });
                    throw new Error(`Validation failed for event '${event}'`);
                }
            } else if (!result.isValid) {
                const errorMsg = result.error ?? "Validation failed";
                logger.error(`[EventBus] Validation failed for event '${event}': ${errorMsg}`, {
                    data: safeSerialize(data),
                    event,
                });
                throw new Error(`Validation failed for event '${event}': ${errorMsg}`);
            }
        } catch (error) {
            // Re-throw validation errors, wrap unexpected errors
            if (error instanceof Error && error.message.includes("Validation failed")) {
                throw error;
            }

            const wrappedError = error instanceof Error ? error : new Error(String(error));
            logger.error(`[EventBus] Validator threw unexpected error for event '${event}'`, {
                data: safeSerialize(data),
                error: wrappedError,
                event,
            });
            throw new Error(`Validator error for event '${event}': ${wrappedError.message}`);
        }

        await next();
    };
}

/**
 * Pre-configured middleware stacks for common use cases.
 *
 * @remarks
 * These middleware stacks provide sensible defaults for different environments
 * and can be used directly with TypedEventBus or as starting points for custom configurations.
 *
 * @example
 * ```typescript
 * // Use a pre-configured stack
 * const eventBus = new TypedEventBus('my-bus');
 * eventBus.use(MIDDLEWARE_STACKS.development());
 *
 * // Create a custom stack
 * const customStack = MIDDLEWARE_STACKS.custom([
 *   createLoggingMiddleware({ level: 'info' }),
 *   createValidationMiddleware(validators)
 * ]);
 * eventBus.use(customStack);
 * ```
 */
export const MIDDLEWARE_STACKS = {
    /**
     * Custom stack builder that composes multiple middleware functions.
     *
     * @param middlewares - Array of middleware functions to compose
     * @returns Composed middleware function
     *
     * @example
     * ```typescript
     * const customStack = MIDDLEWARE_STACKS.custom([
     *   createLoggingMiddleware({ level: 'info' }),
     *   createMetricsMiddleware({ trackTiming: true }),
     *   createValidationMiddleware(myValidators)
     * ]);
     * ```
     */
    custom: (middlewares: EventMiddleware[]) => composeMiddleware(...middlewares),

    /**
     * Development stack with comprehensive debugging, verbose logging, and error handling.
     *
     * @returns Middleware stack optimized for development
     *
     * @remarks
     * Includes:
     * - Error handling (continues on errors)
     * - Debug middleware (verbose logging)
     * - Detailed logging with event data
     */
    development: () =>
        composeMiddleware(
            createErrorHandlingMiddleware({ continueOnError: true }),
            createDebugMiddleware({ enabled: true, verbose: true }),
            createLoggingMiddleware({ includeData: true, level: "debug" })
        ),

    /**
     * Production stack with metrics, rate limiting, and error handling.
     *
     * @returns Middleware stack optimized for production
     *
     * @remarks
     * Includes:
     * - Error handling (continues on errors)
     * - Rate limiting (5 burst, 50/sec)
     * - Metrics tracking (counts and timing)
     * - Info-level logging (no data included)
     */
    production: () =>
        composeMiddleware(
            createErrorHandlingMiddleware({ continueOnError: true }),
            createRateLimitMiddleware({ burstLimit: 5, maxEventsPerSecond: 50 }),
            createMetricsMiddleware({ trackCounts: true, trackTiming: true }),
            createLoggingMiddleware({ includeData: false, level: "info" })
        ),

    /**
     * Testing stack with minimal overhead and strict error handling.
     *
     * @returns Middleware stack optimized for testing
     *
     * @remarks
     * Includes:
     * - Error handling (fails fast on errors)
     * - Warning-level logging (no data included)
     * - Minimal performance impact for fast test execution
     */
    testing: () =>
        composeMiddleware(
            createErrorHandlingMiddleware({ continueOnError: false }),
            createLoggingMiddleware({ includeData: false, level: "warn" })
        ),
};

/**
 * Safely serialize data for logging, handling circular references and type preservation.
 *
 * @param data - Data to serialize
 * @returns Serialized data safe for logging
 */
function safeSerialize(data: unknown): unknown {
    if (data === null || data === undefined) {
        return data;
    }

    if (typeof data === "string") {
        return data;
    }

    if (typeof data === "number" || typeof data === "boolean") {
        return data;
    }

    if (typeof data === "object") {
        try {
            // Try to serialize, but catch circular reference errors
            JSON.stringify(data);
            return data; // Return original object for better inspection
        } catch {
            return "[Circular Reference or Non-Serializable Object]";
        }
    }

    return String(data);
}

/* eslint-enable n/callback-return */
