/**
 * Pre-built middleware functions and types for the TypedEventBus event system.
 *
 * @remarks
 * Provides common middleware for logging, metrics, filtering, validation, error
 * handling, and more. All middleware is type-safe and composable for robust
 * event-driven architectures.
 *
 * @packageDocumentation
 */

import type { UnknownRecord } from "type-fest";

import { isDevelopment } from "@shared/utils/environment";

import type { EventMiddleware } from "./TypedEventBus";

import { logger as baseLogger } from "../utils/logger";

/**
 * Safely serialize data for logging, handling circular references and type
 * preservation.
 *
 * @remarks
 * This function is specifically designed for logging purposes to avoid circular
 * reference errors during JSON serialization. It returns the original object
 * when possible for better debugger inspection, or a safe placeholder string
 * when serialization fails.
 *
 * **Behavior:**
 *
 * - **Primitives**: Returned as-is (string, number, boolean, null, undefined)
 * - **Objects**: Original object returned if JSON-serializable, placeholder if
 *   not - **Circular References**: Returns descriptive placeholder string
 * - **Functions/Symbols**: Converted to string representation
 *
 * @param data - Data to serialize
 *
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

    // Fallback for any remaining types
    return JSON.stringify(data);
}

/**
 * Interface for middleware stack functions.
 */
interface MiddlewareStacks {
    custom: (middlewares: EventMiddleware[]) => EventMiddleware;
    development: () => EventMiddleware;
    production: () => EventMiddleware;
    testing: () => EventMiddleware;
}

// Helper functions for metrics middleware (reduces complexity by composition)

type MetricsCallback = (metric: {
    name: string;
    type: "counter" | "timing";
    value: number;
}) => void;

const trackEventCount = (
    event: string,
    eventCounts: Map<string, number>,
    metricsCallback?: MetricsCallback
): void => {
    const count = eventCounts.get(event) ?? 0;
    const newCount = count + 1;
    eventCounts.set(event, newCount);

    if (metricsCallback) {
        metricsCallback({
            name: `events.${event}.count`,
            type: "counter",
            value: newCount,
        });
    }
};

const trackEventTiming = (
    event: string,
    duration: number,
    eventTimings: Map<string, number[]>,
    metricsCallback?: MetricsCallback
): void => {
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
};

/**
 * Result type for event data validation.
 *
 * @remarks
 * Can be a boolean (true/false) or an object with `isValid` and optional
 * `error` message. Used by validator functions to indicate if event data is
 * valid.
 *
 * Validators can return:
 *
 * - `true` for successful validation
 * - `false` for failed validation (generic error)
 * - `{ isValid: true }` for successful validation with context
 * - `{ isValid: false, error?: string }` for failed validation with specific
 *   error message
 */
type ValidationResult = boolean | { error?: string; isValid: boolean };

/**
 * Type for a function that validates event data.
 *
 * @example
 *
 * ```typescript
 * const userValidator: ValidatorFunction<{ userId: string }> = (data) => {
 *     return data.userId
 *         ? true
 *         : { isValid: false, error: "userId is required" };
 * };
 * ```
 *
 * @typeParam TData - The type of event data to validate
 *
 * @param data - The event data to validate
 *
 * @returns ValidationResult indicating if the data is valid
 */

type ValidatorFunction<TData = unknown> = (data: TData) => ValidationResult;

/**
 * Map of event names to their validator functions.
 *
 * @example
 *
 * ```typescript
 * interface EventMap {
 *     "user:login": { userId: string };
 *     "data:update": { table: string; data: unknown };
 * }
 *
 * const validators: ValidatorMap<EventMap> = {
 *     "user:login": (data) => !!data.userId,
 *     "data:update": (data) =>
 *         data.table
 *             ? { isValid: true }
 *             : { isValid: false, error: "Table required" },
 * };
 * ```
 *
 * @typeParam T - Record type defining event names and their data types
 */
type ValidatorMap<T extends UnknownRecord> = Partial<{
    [K in keyof T]: ValidatorFunction<T[K]>;
}>;

/**
 * Constant log message for event emission.
 *
 * @internal
 */
const EVENT_EMITTED_MSG = "[EventBus] Event emitted";

/**
 * Middleware composer to combine multiple middleware functions.
 *
 * @remarks
 * Executes middlewares in the order they are provided. Each middleware must
 * call `next()` to continue the chain, or omit it to stop execution.
 *
 * @example
 *
 * ```typescript
 * const combinedMiddleware = composeMiddleware(
 *     createLoggingMiddleware({ level: "info" }),
 *     createValidationMiddleware(validators),
 *     createMetricsMiddleware({ trackTiming: true })
 * );
 *
 * eventBus.use(combinedMiddleware);
 * ```
 *
 * @param middlewares - Array of middleware functions to compose into a single
 *   middleware chain
 *
 * @returns Combined middleware function that executes all provided middlewares
 *   in sequence
 */
/**
 * Compose multiple middleware functions into a single middleware chain.
 *
 * @remarks
 * Executes middlewares in the order they are provided. Each middleware must
 * call `next()` to continue the chain, or omit it to stop execution.
 *
 * @example
 *
 * ```typescript
 * const combinedMiddleware = composeMiddleware(
 *     createLoggingMiddleware({ level: "info" }),
 *     createValidationMiddleware(validators),
 *     createMetricsMiddleware({ trackTiming: true })
 * );
 *
 * eventBus.use(combinedMiddleware);
 * ```
 *
 * @param middlewares - Array of middleware functions to compose into a single
 *   chain
 *
 * @returns Combined middleware function that executes all provided middlewares
 *   in sequence
 */
/* eslint-disable n/callback-return -- Middleware pattern doesn't follow Node.js callback convention */

export function composeMiddleware(
    ...middlewares: EventMiddleware[]
): EventMiddleware {
    return async (
        event: string,
        data: unknown,
        next: () => Promise<void> | void
    ) => {
        let index = 0;

        const processNext = async (): Promise<void> => {
            if (index < middlewares.length) {
                const middleware = middlewares[index];
                index++;
                if (middleware) {
                    await middleware(event, data, processNext);
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
 *
 * @remarks
 * Options include:
 *
 * - `enabled`: Whether debug logging is enabled (defaults to development mode)
 * - `verbose`: Whether to include event data in debug logs
 *
 * @example
 *
 * ```typescript
 * const debugMiddleware = createDebugMiddleware({
 *     enabled: true,
 *     verbose: true,
 * });
 * eventBus.use(debugMiddleware);
 * ```
 *
 * @param options - Configuration options for debug middleware
 *
 * @returns EventMiddleware function that logs event processing with timing
 *   information
 */

export function createDebugMiddleware(options: {
    enabled?: boolean;
    verbose?: boolean;
}): EventMiddleware {
    const { enabled = isDevelopment(), verbose = false } = options;

    return async (
        event: string,
        data: unknown,
        next: () => Promise<void> | void
    ) => {
        if (!enabled) {
            await next();
            return;
        }

        const startTime = Date.now();

        if (verbose) {
            baseLogger.debug(`[EventBus:Debug] Processing event '${event}'`, {
                data,
                event,
                timestamp: startTime,
            });
        } else {
            baseLogger.debug(`[EventBus:Debug] Processing event '${event}'`);
        }

        await next();

        const duration = Date.now() - startTime;
        baseLogger.debug(
            `[EventBus:Debug] Completed event '${event}' in ${duration}ms`
        );
    };
}

/**
 * Error handling middleware that catches and logs middleware errors.
 *
 * @remarks
 * Options include:
 *
 * - `continueOnError`: Whether to continue processing after an error (default:
 *   true) - `onError`: Optional callback function to handle errors with custom
 *   logic
 *
 * @example
 *
 * ```typescript
 * import { logger } from "../utils/logger";
 *
 * const errorMiddleware = createErrorHandlingMiddleware({
 *     continueOnError: false,
 *     onError: (error, event, data) => {
 *         logger.error("Failed processing event", { data, error, event });
 *     },
 * });
 * eventBus.use(errorMiddleware);
 * ```
 *
 * @param options - Configuration options for error handling
 *
 * @returns EventMiddleware function that provides error handling and logging
 */
export function createErrorHandlingMiddleware(options: {
    continueOnError?: boolean;
    onError?: (error: Error, event: string, data: unknown) => void;
}): EventMiddleware {
    const { continueOnError = true, onError } = options;

    return async (
        event: string,
        data: unknown,
        next: () => Promise<void> | void
    ) => {
        try {
            await next();
        } catch (error) {
            const err =
                error instanceof Error ? error : new Error(String(error));

            baseLogger.error(
                `[EventBus] Middleware error for event '${event}'`,
                {
                    data: safeSerialize(data),
                    error: err,
                    event,
                }
            );

            if (onError) {
                onError(err, event, data);
            }

            if (!continueOnError) {
                throw err;
            }
        }
    };
}

/**
 * Filter middleware that can block certain events based on conditions.
 *
 * @remarks
 * Options include:
 *
 * - `allowList`: Array of event names to allow (blocks all others)
 * - `blockList`: Array of event names to block
 * - `condition`: Custom function to determine if an event should be processed
 *
 * @example
 *
 * ```typescript
 * const filterMiddleware = createFilterMiddleware({
 *     allowList: ["user:login", "user:logout"],
 *     condition: (event, data) => event.startsWith("user:"),
 * });
 * eventBus.use(filterMiddleware);
 * ```
 *
 * @param options - Configuration options for event filtering
 *
 * @returns EventMiddleware function that filters events based on allow/block
 *   lists or custom conditions
 */
export function createFilterMiddleware(options: {
    allowList?: string[];
    blockList?: string[];
    condition?: (event: string, data: unknown) => boolean;
}): EventMiddleware {
    const { allowList, blockList, condition } = options;

    return async (
        event: string,
        data: unknown,
        next: () => Promise<void> | void
    ) => {
        // Check allow list
        if (allowList && !allowList.includes(event)) {
            baseLogger.debug(
                `[EventBus] Event '${event}' blocked by allow list`
            );
            return;
        }

        // Check block list
        if (blockList?.includes(event)) {
            baseLogger.debug(
                `[EventBus] Event '${event}' blocked by block list`
            );
            return;
        }

        // Check custom condition
        if (condition && !condition(event, data)) {
            baseLogger.debug(
                `[EventBus] Event '${event}' blocked by custom condition`
            );
            return;
        }

        await next();
    };
}

/**
 * Logging middleware that logs all events with configurable detail levels.
 *
 * @remarks
 * Options include:
 *
 * - `filter`: Function to determine which events to log
 * - `includeData`: Whether to include event data in logs (default: false)
 * - `level`: Log level to use ('debug', 'info', 'warn', 'error') (default:
 *   'info')
 *
 * @example
 *
 * ```typescript
 * const loggingMiddleware = createLoggingMiddleware({
 *     level: "debug",
 *     includeData: true,
 *     filter: (eventName) => eventName.startsWith("user:"),
 * });
 * eventBus.use(loggingMiddleware);
 * ```
 *
 * @param options - Configuration options for event logging
 *
 * @returns EventMiddleware function that logs events at the specified level
 */
export function createLoggingMiddleware(options: {
    filter?: (eventName: string) => boolean;
    includeData?: boolean;
    level?: "debug" | "error" | "info" | "warn";
}): EventMiddleware {
    const { filter, includeData = false, level = "info" } = options;

    return async (
        event: string,
        data: unknown,
        next: () => Promise<void> | void
    ) => {
        // Apply filter if provided
        if (filter && !filter(event)) {
            await next();
            return;
        }

        const logData = includeData ? { data, event } : { event };

        switch (level) {
            case "debug": {
                baseLogger.debug(EVENT_EMITTED_MSG, logData);
                break;
            }
            case "error": {
                baseLogger.error(EVENT_EMITTED_MSG, logData);
                break;
            }
            case "info": {
                baseLogger.info(EVENT_EMITTED_MSG, logData);
                break;
            }
            case "warn": {
                baseLogger.warn(EVENT_EMITTED_MSG, logData);
                break;
            }
            default: {
                baseLogger.info(EVENT_EMITTED_MSG, logData);
                break;
            }
        }

        await next();
    };
}

/**
 * Metrics middleware that tracks event counts and timing.
 *
 * @remarks
 * Options include:
 *
 * - `trackCounts`: Whether to track event occurrence counts (default: true)
 * - `trackTiming`: Whether to track event processing duration (default: true)
 * - `metricsCallback`: Optional callback to receive metric data for external
 *   systems
 *
 * @example
 *
 * ```typescript
 * import { logger } from "../utils/logger";
 *
 * const metricsMiddleware = createMetricsMiddleware({
 *     trackCounts: true,
 *     trackTiming: true,
 *     metricsCallback: (metric) => {
 *         logger.debug("Metric update", metric);
 *     },
 * });
 * eventBus.use(metricsMiddleware);
 * ```
 *
 * @param options - Configuration options for metrics collection
 *
 * @returns EventMiddleware function that collects event metrics
 */
export function createMetricsMiddleware(options: {
    metricsCallback?: (metric: {
        name: string;
        type: "counter" | "timing";
        value: number;
    }) => void;
    trackCounts?: boolean;
    trackTiming?: boolean;
}): EventMiddleware {
    const { metricsCallback, trackCounts = true, trackTiming = true } = options;
    const eventCounts = new Map<string, number>();
    const eventTimings = new Map<string, number[]>();

    return async (
        event: string,
        _data: unknown,
        next: () => Promise<void> | void
    ) => {
        const startTime = Date.now();

        // Track event counts
        if (trackCounts) {
            trackEventCount(event, eventCounts, metricsCallback);
        }

        await next();

        // Track event timing
        if (trackTiming) {
            const duration = Date.now() - startTime;
            trackEventTiming(event, duration, eventTimings, metricsCallback);
        }
    };
}

/**
 * Creates middleware that rate-limits event processing.
 *
 * @remarks
 * Options include:
 *
 * - `burstLimit`: Maximum number of events allowed in a burst (default: 10).
 * - `maxEventsPerSecond`: Maximum number of events allowed per second (default:
 *   100). - `onRateLimit`: Optional callback invoked when an event is
 *   rate-limited.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "../utils/logger";
 *
 * const rateLimitMiddleware = createRateLimitMiddleware({
 *     burstLimit: 5,
 *     maxEventsPerSecond: 50,
 *     onRateLimit: (event, data) => {
 *         logger.warn("Rate limit hit", { data, event });
 *     },
 * });
 * eventBus.use(rateLimitMiddleware);
 * ```
 *
 * @param options - Configuration options for rate limiting.
 *
 * @returns EventMiddleware function that enforces rate limits on events.
 */
export function createRateLimitMiddleware(options: {
    burstLimit?: number;
    maxEventsPerSecond?: number;
    onRateLimit?: (event: string, data: unknown) => void;
}): EventMiddleware {
    const { burstLimit = 10, maxEventsPerSecond = 100, onRateLimit } = options;
    const eventTimes = new Map<string, number[]>();

    return async (
        event: string,
        data: unknown,
        next: () => Promise<void> | void
    ) => {
        const now = Date.now();
        const times = eventTimes.get(event) ?? [];

        // Remove old entries (older than 1 second)
        const recent = times.filter((time) => now - time < 1000);

        // Check burst limit
        if (burstLimit <= recent.length) {
            baseLogger.warn(
                `[EventBus] Rate limit exceeded for event '${event}' (burst limit: ${burstLimit})`
            );
            if (onRateLimit) {
                onRateLimit(event, data);
            }
            return; // Don't continue to next middleware
        }

        // Check rate limit
        if (maxEventsPerSecond <= recent.length) {
            baseLogger.warn(
                `[EventBus] Rate limit exceeded for event '${event}' (rate limit: ${maxEventsPerSecond}/sec)`
            );
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
 * Creates middleware that validates event data using a map of validator
 * functions.
 *
 * @remarks
 * If validation fails, the event is blocked and an error is logged. Throws on
 * validation failure.
 *
 * @example
 *
 * ```typescript
 * const validators = {
 *     "user:login": (data: { userId: string }) => !!data.userId,
 *     "data:update": (data: { table: string }) =>
 *         data.table
 *             ? { isValid: true }
 *             : { isValid: false, error: "Table name required" },
 * };
 *
 * const validationMiddleware = createValidationMiddleware(validators);
 * eventBus.use(validationMiddleware);
 * ```
 *
 * @typeParam T - Record type defining event names and their data types.
 *
 * @param validators - Map of event names to their validator functions.
 *
 * @returns EventMiddleware function that validates event data before
 *   processing.
 */
export function createValidationMiddleware<T extends UnknownRecord>(
    validators: ValidatorMap<T>
): EventMiddleware {
    return async (
        event: string,
        data: unknown,
        next: () => Promise<void> | void
    ) => {
        // Type-safe validator lookup with runtime validation
        if (!Object.hasOwn(validators, event)) {
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
            // This assertion is necessary because:
            // 1. We've verified the validator exists for this event name
            // 2. The validator is designed to handle T[K] for some specific K
            // 3. TypeScript can't statically prove which K, but runtime
            //    guarantees it's correct
            // 4. The validator will perform its own runtime validation anyway
            // 5. instanceof narrowing is not applicable here since T[keyof T]
            //    can be primitives or plain objects, not just class instances

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe due to immediate validation by validator function
            const result = validator(data as T[keyof T]);

            if (typeof result === "boolean") {
                if (!result) {
                    baseLogger.error(
                        `[EventBus] Validation failed for event '${event}'`,
                        {
                            data: safeSerialize(data),
                            event,
                        }
                    );
                    throw new Error(`Validation failed for event '${event}'`);
                }
            } else if (result.isValid) {
                // Validation passed (result.isValid === true)
            } else {
                const errorMsg = result.error ?? "Validation failed";
                baseLogger.error(
                    `[EventBus] Validation failed for event '${event}': ${errorMsg}`,
                    {
                        data: safeSerialize(data),
                        event,
                    }
                );
                throw new Error(
                    `Validation failed for event '${event}': ${errorMsg}`,
                    { cause: new Error(errorMsg) }
                );
            }
        } catch (error) {
            // Re-throw validation errors, wrap unexpected errors
            if (
                error instanceof Error &&
                error.message.includes("Validation failed")
            ) {
                throw error;
            }

            const wrappedError =
                error instanceof Error ? error : new Error(String(error));
            baseLogger.error(
                `[EventBus] Validator threw unexpected error for event '${event}'`,
                {
                    data: safeSerialize(data),
                    error: wrappedError,
                    event,
                }
            );
            throw new Error(
                `Validator error for event '${event}': ${wrappedError.message}`,
                { cause: error }
            );
        }

        await next();
    };
}
/* eslint-enable n/callback-return -- re-enable callback return */

/**
 * Predefined middleware stacks for different environments.
 *
 * @remarks
 * Provides convenient factory functions for common middleware stacks: custom,
 * development, production, and testing. Each stack returns a composed
 * middleware chain suitable for the target environment.
 *
 * @example
 *
 * ```typescript
 * // Use a pre-configured stack
 * const eventBus = new TypedEventBus("my-bus");
 * eventBus.use(MIDDLEWARE_STACKS.development());
 *
 * // Create a custom stack
 * const customStack = MIDDLEWARE_STACKS.custom([
 *     createLoggingMiddleware({ level: "info" }),
 *     createValidationMiddleware(validators),
 * ]);
 * eventBus.use(customStack);
 * ```
 */
export const MIDDLEWARE_STACKS: MiddlewareStacks = {
    /**
     * Custom stack builder that composes multiple middleware functions.
     *
     * @example
     *
     * ```typescript
     * const customStack = MIDDLEWARE_STACKS.custom([
     *     createLoggingMiddleware({ level: "info" }),
     *     createMetricsMiddleware({ trackTiming: true }),
     *     createValidationMiddleware(myValidators),
     * ]);
     * ```
     *
     * @param middlewares - Array of middleware functions to compose
     *
     * @returns Composed middleware function
     */
    custom: (middlewares: EventMiddleware[]): EventMiddleware =>
        composeMiddleware(...middlewares),

    /**
     * Development stack with comprehensive debugging, verbose logging, and
     * error handling.
     *
     * @remarks
     * Includes:
     *
     * - Error handling (continues on errors)
     * - Debug middleware (verbose logging)
     * - Detailed logging with event data
     *
     * @returns Middleware stack optimized for development
     */
    development: (): EventMiddleware => {
        try {
            return composeMiddleware(
                createErrorHandlingMiddleware({ continueOnError: true }),
                createDebugMiddleware({ enabled: true, verbose: true }),
                createLoggingMiddleware({ includeData: true, level: "debug" })
            );
        } catch (error) {
            baseLogger.error(
                "[MiddlewareStacks] Failed to create development stack",
                error
            );
            return createLoggingMiddleware({
                includeData: true,
                level: "debug",
            });
        }
    },

    /**
     * Production stack with metrics, rate limiting, and error handling.
     *
     * @remarks
     * Includes:
     *
     * - Error handling (continues on errors)
     * - Rate limiting (5 burst, 50/sec)
     * - Metrics tracking (counts and timing)
     * - Info-level logging (no data included)
     *
     * @returns Middleware stack optimized for production
     */
    production: (): EventMiddleware => {
        try {
            return composeMiddleware(
                createErrorHandlingMiddleware({ continueOnError: true }),
                createRateLimitMiddleware({
                    burstLimit: 5,
                    maxEventsPerSecond: 50,
                }),
                createMetricsMiddleware({
                    trackCounts: true,
                    trackTiming: true,
                }),
                createLoggingMiddleware({ includeData: false, level: "info" })
            );
        } catch (error) {
            baseLogger.error(
                "[MiddlewareStacks] Failed to create production stack",
                error
            );
            return createLoggingMiddleware({
                includeData: false,
                level: "info",
            });
        }
    },

    /**
     * Testing stack with minimal overhead and strict error handling.
     *
     * @remarks
     * Includes:
     *
     * - Error handling (fails fast on errors)
     * - Warning-level logging (no data included)
     * - Minimal performance impact for fast test execution
     *
     * @returns Middleware stack optimized for testing
     */
    testing: (): EventMiddleware => {
        try {
            return composeMiddleware(
                createErrorHandlingMiddleware({ continueOnError: false }),
                createLoggingMiddleware({ includeData: false, level: "warn" })
            );
        } catch (error) {
            baseLogger.error(
                "[MiddlewareStacks] Failed to create testing stack",
                error
            );
            return createLoggingMiddleware({
                includeData: false,
                level: "warn",
            });
        }
    },
};

/**
 * Safely serialize data for logging, handling circular references and type
 * preservation.
 *
 * @remarks
 * This function is specifically designed for logging purposes to avoid circular
 * reference errors during JSON serialization. It returns the original object
 * when possible for better debugger inspection, or a safe placeholder string
 * when serialization fails.
 *
 * **Behavior:**
 *
 * - **Primitives**: Returned as-is (string, number, boolean, null, undefined)
 * - **Objects**: Original object returned if JSON-serializable, placeholder if
 *   not - **Circular References**: Returns descriptive placeholder string
 * - **Functions/Symbols**: Converted to string representation
 *
 * @param data - Data to serialize
 *
 * @returns Serialized data safe for logging
 */
