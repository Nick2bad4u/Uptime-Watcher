/**
 * Operational hooks utility for standardizing error handling, retries, and event emission.
 * Provides consistent patterns for async operations with observability.
 */

import { TypedEventBus } from "../events/TypedEventBus";
import { UptimeEvents } from "../events/eventTypes";
import { logger } from "./logger";

/**
 * Configuration for operational hooks.
 */
export interface OperationalHooksConfig<T = unknown> {
    /**
     * Name of the operation for logging and event emission.
     */
    operationName: string;

    /**
     * Maximum number of retry attempts.
     * @default 3
     */
    maxRetries?: number;

    /**
     * Initial delay between retries in milliseconds.
     * @default 100
     */
    initialDelay?: number;

    /**
     * Backoff strategy for retry delays.
     * @default "exponential"
     */
    backoff?: "linear" | "exponential";

    /**
     * Event emitter for operation events.
     */
    eventEmitter?: TypedEventBus<UptimeEvents>;

    /**
     * Context data to include in events.
     */
    context?: Record<string, unknown>;

    /**
     * Callback when retry is attempted.
     */
    onRetry?: (attempt: number, error: Error) => void | Promise<void>;

    /**
     * Callback when operation succeeds.
     */
    onSuccess?: (result: T) => void | Promise<void>;

    /**
     * Callback when operation fails permanently.
     */
    onFailure?: (error: Error, attempts: number) => void | Promise<void>;

    /**
     * Whether to emit events for this operation.
     * @default true
     */
    emitEvents?: boolean;

    /**
     * Whether to throw on final failure.
     * @default true
     */
    throwOnFailure?: boolean;
}

/**
 * Emit operation start event safely.
 */
async function emitStartEvent(
    eventEmitter: TypedEventBus<UptimeEvents>,
    operationName: string,
    startTime: number,
    context: Record<string, unknown>
): Promise<void> {
    try {
        await eventEmitter.emitTyped("database:transaction-completed", {
            operation: `${operationName}:start`,
            duration: 0,
            timestamp: startTime,
            success: true,
            ...context,
        });
    } catch (eventError) {
        logger.debug(`[OperationalHooks] Failed to emit start event for ${operationName}`, eventError);
    }
}

/**
 * Handle successful operation completion.
 */
async function handleSuccess<T>(
    result: T,
    config: OperationalHooksConfig<T>,
    operationName: string,
    startTime: number,
    attempt: number,
    operationId: string
): Promise<T> {
    const { onSuccess, emitEvents, eventEmitter, context = {} } = config;
    const duration = Date.now() - startTime;

    // Call success callback
    if (onSuccess) {
        try {
            await onSuccess(result);
        } catch (callbackError) {
            logger.debug(`[OperationalHooks] Success callback failed for ${operationName}`, callbackError);
        }
    }

    // Emit success event
    if (emitEvents && eventEmitter) {
        try {
            await eventEmitter.emitTyped("database:transaction-completed", {
                operation: operationName,
                duration,
                timestamp: Date.now(),
                success: true,
                recordsAffected: typeof result === "number" ? result : undefined,
                ...context,
            });
        } catch (eventError) {
            logger.debug(`[OperationalHooks] Failed to emit success event for ${operationName}`, eventError);
        }
    }

    logger.debug(`[OperationalHooks] ${operationName} succeeded after ${attempt} attempt(s)`, {
        duration,
        operationId,
    });

    return result;
}

/**
 * Handle operation failure.
 */
async function handleFailure<T>(
    error: Error,
    config: OperationalHooksConfig<T>,
    operationName: string,
    startTime: number,
    attempt: number,
    operationId: string
): Promise<T> {
    const { onFailure, emitEvents, eventEmitter, context = {}, throwOnFailure = true } = config;
    const duration = Date.now() - startTime;

    if (onFailure) {
        try {
            await onFailure(error, attempt);
        } catch (callbackError) {
            logger.debug(`[OperationalHooks] Failure callback failed for ${operationName}`, callbackError);
        }
    }

    // Emit failure event
    if (emitEvents && eventEmitter) {
        try {
            await eventEmitter.emitTyped("database:transaction-completed", {
                operation: operationName,
                duration,
                timestamp: Date.now(),
                success: false,
                ...context,
            });
        } catch (eventError) {
            logger.debug(`[OperationalHooks] Failed to emit failure event for ${operationName}`, eventError);
        }
    }

    logger.error(`[OperationalHooks] ${operationName} failed permanently after ${attempt} attempts`, {
        error,
        duration,
        operationId,
    });

    if (throwOnFailure) {
        throw error;
    }

    return null as T;
}

/**
 * Handle retry attempt.
 */
async function handleRetry<T>(
    error: Error,
    config: OperationalHooksConfig<T>,
    operationName: string,
    attempt: number,
    operationId: string
): Promise<void> {
    const { onRetry, initialDelay = 100, backoff = "exponential" } = config;

    if (onRetry) {
        try {
            await onRetry(attempt, error);
        } catch (callbackError) {
            logger.debug(`[OperationalHooks] Retry callback failed for ${operationName}`, callbackError);
        }
    }

    const delay = calculateDelay(attempt, initialDelay, backoff);

    if (delay > 0) {
        logger.debug(`[OperationalHooks] Retrying ${operationName} in ${delay}ms`, {
            attempt: attempt + 1,
            operationId,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
    }
}

/**
 * Wraps an async operation with retry logic, error handling, and event emission.
 */
export async function withOperationalHooks<T>(
    operation: () => Promise<T>,
    config: OperationalHooksConfig<T>
): Promise<T> {
    const { operationName, maxRetries = 3, emitEvents = true, eventEmitter, context = {} } = config;

    const operationId = generateOperationId();
    const startTime = Date.now();

    // Emit operation start event
    if (emitEvents && eventEmitter) {
        await emitStartEvent(eventEmitter, operationName, startTime, context);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            logger.debug(`[OperationalHooks] ${operationName} attempt ${attempt}/${maxRetries}`, {
                operationId,
                context,
            });

            const result = await operation();
            return await handleSuccess(result, config, operationName, startTime, attempt, operationId);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            logger.debug(`[OperationalHooks] ${operationName} failed on attempt ${attempt}/${maxRetries}`, {
                error: lastError,
                operationId,
            });

            // If this was the last attempt, handle failure
            if (attempt === maxRetries) {
                return handleFailure(lastError, config, operationName, startTime, attempt, operationId);
            }

            // Handle retry
            await handleRetry(lastError, config, operationName, attempt, operationId);
        }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError ?? new Error(`Operation ${operationName} completed without success or error`);
}

/**
 * Calculate retry delay based on attempt number and backoff strategy.
 */
function calculateDelay(attempt: number, initialDelay: number, backoff: "linear" | "exponential"): number {
    if (backoff === "exponential") {
        return initialDelay * Math.pow(2, attempt - 1);
    }
    return initialDelay * attempt;
}

/**
 * Generate a unique operation ID for tracking.
 */
function generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Specialized wrapper for database operations with common patterns.
 */
export async function withDatabaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    eventEmitter?: TypedEventBus<UptimeEvents>,
    context?: Record<string, unknown>
): Promise<T> {
    return withOperationalHooks(operation, {
        operationName: `database:${operationName}`,
        maxRetries: 3,
        initialDelay: 100,
        backoff: "exponential",
        eventEmitter,
        context,
        emitEvents: Boolean(eventEmitter),
    });
}

/**
 * Specialized wrapper for cache operations with background loading.
 */
export async function withCacheOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    eventEmitter?: TypedEventBus<UptimeEvents>,
    context?: Record<string, unknown>
): Promise<T> {
    return withOperationalHooks(operation, {
        operationName: `cache:${operationName}`,
        maxRetries: 1, // Cache operations typically don't retry
        initialDelay: 0,
        eventEmitter,
        context,
        emitEvents: Boolean(eventEmitter),
        throwOnFailure: false, // Cache operations should not throw
    });
}
