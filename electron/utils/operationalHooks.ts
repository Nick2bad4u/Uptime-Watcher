/**
 * Operational hooks utility for standardizing error handling, retries, and event emission.
 * Provides consistent patterns for async operations with observability.
 */

import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";
import { logger } from "./logger";

/**
 * Configuration for operational hooks.
 */
export interface OperationalHooksConfig<T = unknown> {
    /**
     * Backoff strategy for retry delays.
     * @defaultValue "exponential"
     */
    backoff?: "exponential" | "linear";

    /**
     * Context data to include in events.
     */
    context?: Record<string, unknown>;

    /**
     * Whether to emit events for this operation.
     * @defaultValue true
     */
    emitEvents?: boolean;

    /**
     * Event emitter for operation events.
     */
    eventEmitter?: TypedEventBus<UptimeEvents>;

    /**
     * Initial delay between retries in milliseconds.
     * @defaultValue 100
     */
    initialDelay?: number;

    /**
     * Maximum number of retry attempts.
     * @defaultValue 3
     */
    maxRetries?: number;

    /**
     * Callback when operation fails permanently.
     */
    onFailure?: (error: Error, attempts: number) => Promise<void> | void;

    /**
     * Callback when retry is attempted.
     */
    onRetry?: (attempt: number, error: Error) => Promise<void> | void;

    /**
     * Callback when operation succeeds.
     */
    onSuccess?: (result: T) => Promise<void> | void;

    /**
     * Name of the operation for logging and event emission.
     */
    operationName: string;

    /**
     * Whether to throw on final failure.
     * @defaultValue true
     */
    throwOnFailure?: boolean;
}

/**
 * Specialized wrapper for database operations with database-specific defaults.
 *
 * @remarks
 * This function is a convenience wrapper around withOperationalHooks that applies
 * database-optimized settings and adds a "database:" prefix to operation names for
 * consistent event naming. While the underlying implementation is generic, this
 * wrapper should only be used for actual database operations to maintain clear
 * semantic boundaries and event categorization.
 *
 * @typeParam T - The return type of the database operation
 * @param operation - Database operation to execute with retry logic
 * @param operationName - Name of the database operation (will be prefixed with "database:")
 * @param eventEmitter - Optional event emitter for operation lifecycle events
 * @param context - Optional context data to include in events
 * @returns Promise resolving to the operation result
 */
export async function withDatabaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    eventEmitter?: TypedEventBus<UptimeEvents>,
    context?: Record<string, unknown>
): Promise<T> {
    return withOperationalHooks(operation, {
        backoff: "exponential",
        initialDelay: 100,
        maxRetries: 3,
        operationName: `database:${operationName}`,
        ...(eventEmitter && { eventEmitter }),
        ...(context && { context }),
        emitEvents: Boolean(eventEmitter),
    });
}

/**
 * Wraps an async operation with retry logic, error handling, and event emission.
 */
export async function withOperationalHooks<T>(
    operation: () => Promise<T>,
    config: OperationalHooksConfig<T>
): Promise<T> {
    const {
        backoff = "exponential",
        context = {},
        emitEvents = true,
        eventEmitter,
        initialDelay = 100,
        maxRetries = 3,
        operationName,
        throwOnFailure = true,
    } = config;

    const operationId = generateOperationId();
    const startTime = Date.now();

    // Emit operation start event
    if (emitEvents && eventEmitter) {
        await emitStartEvent(eventEmitter, operationName, startTime, context);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            /* v8 ignore next 2 */ logger.debug(
                `[OperationalHooks] ${operationName} attempt ${attempt}/${maxRetries}`,
                {
                    context,
                    operationId,
                }
            );

            const result = await operation();
            return await handleSuccess(result, config, operationName, startTime, attempt, operationId);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            /* v8 ignore next 2 */ logger.debug(
                `[OperationalHooks] ${operationName} failed on attempt ${attempt}/${maxRetries}`,
                {
                    error: lastError,
                    operationId,
                }
            );

            // If this was the last attempt, handle failure
            if (attempt === maxRetries) {
                return handleFailure(lastError, config, operationName, startTime, attempt, operationId, throwOnFailure);
            }

            // Handle retry
            await handleRetry(lastError, config, operationName, attempt, operationId, backoff, initialDelay);
        }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError ?? new Error(`Operation ${operationName} completed without success or error`);
}

/**
 * Calculate retry delay based on attempt number and backoff strategy.
 */
function calculateDelay(attempt: number, initialDelay: number, backoff: "exponential" | "linear"): number {
    if (backoff === "exponential") {
        return initialDelay * Math.pow(2, attempt - 1);
    }
    return initialDelay * attempt;
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
            duration: 0,
            operation: `${operationName}:started`,
            success: true,
            timestamp: startTime,
            ...context,
        });
    } catch (eventError) {
        /* v8 ignore next 2 */ logger.debug(
            `[OperationalHooks] Failed to emit start event for ${operationName}`,
            eventError
        );
    }
}

/**
 * Generate a unique operation ID for tracking.
 * Uses crypto.randomUUID() when available, falls back to timestamp-based ID.
 */
function generateOperationId(): string {
    try {
        // Prefer crypto.randomUUID() for better uniqueness
        return `op_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    } catch (error) {
        // Fallback for environments where crypto.randomUUID() is not available
        logger.debug("[OperationalHooks] crypto.randomUUID() not available, using fallback", error);
        // eslint-disable-next-line sonarjs/pseudo-random
        return `op_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }
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
    operationId: string,
    throwOnFailure: boolean = true
): Promise<T> {
    const { context = {}, emitEvents, eventEmitter, onFailure } = config;
    const duration = Date.now() - startTime;

    if (onFailure) {
        try {
            await onFailure(error, attempt);
        } catch (callbackError) {
            /* v8 ignore next 2 */ logger.debug(
                `[OperationalHooks] Failure callback failed for ${operationName}`,
                callbackError
            );
        }
    }

    // Emit failure event
    if (emitEvents && eventEmitter) {
        try {
            await eventEmitter.emitTyped("database:transaction-completed", {
                duration,
                operation: `${operationName}:failed`,
                success: false,
                timestamp: Date.now(),
                ...context,
            });
        } catch (eventError) {
            /* v8 ignore next 2 */ logger.debug(
                `[OperationalHooks] Failed to emit failure event for ${operationName}`,
                eventError
            );
        }
    }

    /* v8 ignore next 2 */ logger.error(
        `[OperationalHooks] ${operationName} failed permanently after ${attempt} attempts`,
        {
            duration,
            error,
            operationId,
        }
    );

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
    operationId: string,
    backoff: "exponential" | "linear" = "exponential",
    initialDelay: number = 100
): Promise<void> {
    const { onRetry } = config;

    if (onRetry) {
        try {
            await onRetry(attempt, error);
        } catch (callbackError) {
            /* v8 ignore next 2 */ logger.debug(
                `[OperationalHooks] Retry callback failed for ${operationName}`,
                callbackError
            );
        }
    }

    const delay = calculateDelay(attempt, initialDelay, backoff);

    if (delay > 0) {
        /* v8 ignore next 2 */ logger.debug(`[OperationalHooks] Retrying ${operationName} in ${delay}ms`, {
            attempt: attempt + 1,
            operationId,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
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
    const { context = {}, emitEvents, eventEmitter, onSuccess } = config;
    const duration = Date.now() - startTime;

    // Call success callback
    if (onSuccess) {
        try {
            await onSuccess(result);
        } catch (callbackError) {
            /* v8 ignore next 2 */ logger.debug(
                `[OperationalHooks] Success callback failed for ${operationName}`,
                callbackError
            );
        }
    }

    // Emit success event
    if (emitEvents && eventEmitter) {
        try {
            await eventEmitter.emitTyped("database:transaction-completed", {
                duration,
                operation: `${operationName}:completed`,
                success: true,
                timestamp: Date.now(),
                ...(typeof result === "number" && { recordsAffected: result }),
                ...context,
            });
        } catch (eventError) {
            /* v8 ignore next 2 */ logger.debug(
                `[OperationalHooks] Failed to emit success event for ${operationName}`,
                eventError
            );
        }
    }

    /* v8 ignore next 2 */ logger.debug(`[OperationalHooks] ${operationName} succeeded after ${attempt} attempt(s)`, {
        duration,
        operationId,
    });

    return result;
}
