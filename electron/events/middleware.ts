/**
 * Pre-built middleware functions for the TypedEventBus.
 * Provides common functionality like logging, metrics, and filtering.
 */

import type { EventMiddleware } from "../events/index";

import { logger as baseLogger } from "../utils/index";

const logger = baseLogger;
const EVENT_EMITTED_MSG = "[EventBus] Event emitted";

/**
 * Logging middleware that logs all events with configurable detail levels.
 */
export function createLoggingMiddleware(options: {
    level?: "debug" | "info" | "warn" | "error";
    includeData?: boolean;
    filter?: (eventName: string) => boolean;
}): EventMiddleware {
    const { filter, includeData = false, level = "info" } = options;

    return async (event: string, data: unknown, next: () => void | Promise<void>) => {
        // Apply filter if provided
        if (filter && !filter(event)) {
            await next();
            return;
        }

        const logData = includeData ? { data, event } : { event };

        switch (level) {
            case "debug":
                logger.debug(EVENT_EMITTED_MSG, logData);
                break;
            case "info":
                logger.info(EVENT_EMITTED_MSG, logData);
                break;
            case "warn":
                logger.warn(EVENT_EMITTED_MSG, logData);
                break;
            case "error":
                logger.error(EVENT_EMITTED_MSG, logData);
                break;
        }

        await next();
    };
}

/**
 * Metrics middleware that tracks event counts and timing.
 */
export function createMetricsMiddleware(options: {
    trackCounts?: boolean;
    trackTiming?: boolean;
    metricsCallback?: (metric: { name: string; value: number; type: "counter" | "timing" }) => void;
}): EventMiddleware {
    const { metricsCallback, trackCounts = true, trackTiming = true } = options;
    const eventCounts = new Map<string, number>();
    const eventTimings = new Map<string, number[]>();

    return async (event: string, _data: unknown, next: () => void | Promise<void>) => {
        const startTime = Date.now();

        // Track event counts
        if (trackCounts) {
            const count = eventCounts.get(event) || 0;
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
            const timings = eventTimings.get(event) || [];
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
 * Error handling middleware that catches and logs middleware errors.
 */
export function createErrorHandlingMiddleware(options: {
    onError?: (error: Error, event: string, data: unknown) => void;
    continueOnError?: boolean;
}): EventMiddleware {
    const { continueOnError = true, onError } = options;

    return async (event: string, data: unknown, next: () => void | Promise<void>) => {
        try {
            await next();
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));

            logger.error(`[EventBus] Middleware error for event '${event}'`, {
                data: typeof data === "object" ? JSON.stringify(data) : data,
                error: err,
                event,
            });

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
 * Rate limiting middleware to prevent event spam.
 */
export function createRateLimitMiddleware(options: {
    maxEventsPerSecond?: number;
    burstLimit?: number;
    onRateLimit?: (event: string, data: unknown) => void;
}): EventMiddleware {
    const { burstLimit = 10, maxEventsPerSecond = 100, onRateLimit } = options;
    const eventTimes = new Map<string, number[]>();

    return async (event: string, data: unknown, next: () => void | Promise<void>) => {
        const now = Date.now();
        const times = eventTimes.get(event) || [];

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
 * Validation middleware that validates event data against schemas.
 */
export function createValidationMiddleware<T extends Record<string, unknown>>(
    validators: Partial<{ [K in keyof T]: (data: T[K]) => boolean | { isValid: boolean; error?: string } }>
): EventMiddleware {
    return async (event: string, data: unknown, next: () => void | Promise<void>) => {
        const validator = validators[event as keyof T];

        if (validator) {
            const result = validator(data as T[keyof T]);

            if (typeof result === "boolean") {
                if (!result) {
                    logger.error(`[EventBus] Validation failed for event '${event}'`, { data, event });
                    throw new Error(`Validation failed for event '${event}'`);
                }
            } else if (!result.isValid) {
                logger.error(`[EventBus] Validation failed for event '${event}': ${result.error}`, { data, event });
                throw new Error(`Validation failed for event '${event}': ${result.error}`);
            }
        }

        await next();
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

    return async (event: string, data: unknown, next: () => void | Promise<void>) => {
        // Check allow list
        if (allowList && !allowList.includes(event)) {
            logger.debug(`[EventBus] Event '${event}' blocked by allow list`);
            return;
        }

        // Check block list
        if (blockList && blockList.includes(event)) {
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
 * Debug middleware that provides detailed debugging information.
 */
export function createDebugMiddleware(options: { enabled?: boolean; verbose?: boolean }): EventMiddleware {
    const { enabled = process.env.NODE_ENV === "development", verbose = false } = options;

    return async (event: string, data: unknown, next: () => void | Promise<void>) => {
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
 * Middleware composer to combine multiple middleware functions.
 */
export function composeMiddleware(...middlewares: EventMiddleware[]): EventMiddleware {
    return async (event: string, data: unknown, next: () => void | Promise<void>) => {
        const state = { index: 0 };

        const processNext = async (): Promise<void> => {
            if (state.index < middlewares.length) {
                const middleware = middlewares[state.index++];
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
 * Pre-configured middleware stacks for common use cases.
 */
export const MIDDLEWARE_STACKS = {
    /**
     * Custom stack builder.
     */
    custom: (middlewares: EventMiddleware[]) => composeMiddleware(...middlewares),
    /**
     * Development stack with debugging, logging, and error handling.
     */
    development: () =>
        composeMiddleware(
            createErrorHandlingMiddleware({ continueOnError: true }),
            createDebugMiddleware({ enabled: true, verbose: true }),
            createLoggingMiddleware({ includeData: true, level: "debug" })
        ),
    /**
     * Production stack with metrics, rate limiting, and error handling.
     */
    production: () =>
        composeMiddleware(
            createErrorHandlingMiddleware({ continueOnError: true }),
            createRateLimitMiddleware({ burstLimit: 5, maxEventsPerSecond: 50 }),
            createMetricsMiddleware({ trackCounts: true, trackTiming: true }),
            createLoggingMiddleware({ includeData: false, level: "info" })
        ),
    /**
     * Testing stack with minimal overhead.
     */
    testing: () =>
        composeMiddleware(
            createErrorHandlingMiddleware({ continueOnError: false }),
            createLoggingMiddleware({ includeData: false, level: "warn" })
        ),
};
