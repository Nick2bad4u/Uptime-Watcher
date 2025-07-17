/**
 * Unified error handling patterns for consistent error management across all layers.
 *
 * @remarks
 * This module provides standardized error handling patterns that can be used across
 * frontend stores, backend services, and database operations. It ensures consistent
 * error logging, event emission, and recovery behavior throughout the application.
 */

import { TypedEventBus } from "../events/TypedEventBus";
import { UptimeEvents } from "../events/eventTypes";
import { logger } from "./logger";
import { generateCorrelationId } from "./correlation";

/**
 * Context information for error handling.
 */
export interface ErrorContext {
    /** Operation that failed */
    operation: string;
    /** Component where error occurred */
    component: string;
    /** Additional context data */
    context?: Record<string, unknown>;
    /** Correlation ID for tracing */
    correlationId?: string;
    /** Whether this is a database operation */
    isDatabaseOperation?: boolean;
}

/**
 * Configuration for error handling behavior.
 */
export interface ErrorHandlingConfig {
    /** Whether to re-throw the error after handling */
    rethrow?: boolean;
    /** Whether to emit error events */
    emitEvents?: boolean;
    /** Whether to log the error */
    logError?: boolean;
    /** Event emitter for error events */
    eventEmitter?: TypedEventBus<UptimeEvents>;
    /** Retry configuration */
    retry?: {
        maxRetries: number;
        initialDelay: number;
        backoff: "linear" | "exponential";
    };
}

/**
 * Standardized error wrapper that ensures errors are Error instances.
 */
export function wrapError(error: unknown, defaultMessage: string): Error {
    if (error instanceof Error) {
        return error;
    }

    const message = typeof error === "string" ? error : defaultMessage;
    const wrappedError = new Error(message);

    // Preserve original error as cause if possible
    if (error && typeof error === "object") {
        (wrappedError as Error & { cause?: unknown }).cause = error;
    }

    return wrappedError;
}

/**
 * Format error message with context.
 */
export function formatErrorMessage(error: Error, context: ErrorContext): string {
    const prefix = `[${context.component}]`;
    const operation = context.operation;
    const errorInfo = error.message;
    const correlationId = context.correlationId ?? generateCorrelationId();

    return `${prefix} ${operation} failed [${correlationId}]: ${errorInfo}`;
}

/**
 * Emit error event with standardized format.
 */
async function emitErrorEvent(error: Error, context: ErrorContext, config: ErrorHandlingConfig): Promise<void> {
    if (!config.emitEvents || !config.eventEmitter) {
        return;
    }

    try {
        const eventType = context.isDatabaseOperation ? "database:error" : "operation:error";

        await config.eventEmitter.emitTyped(
            eventType as keyof UptimeEvents,
            {
                operation: context.operation,
                component: context.component,
                error: error.message,
                correlationId: context.correlationId ?? generateCorrelationId(),
                timestamp: Date.now(),
                context: context.context,
            } as UptimeEvents[keyof UptimeEvents]
        );
    } catch (eventError) {
        // Don't let event emission errors break the main flow
        logger.error("Failed to emit error event", eventError);
    }
}

/**
 * Emit success event for retry scenarios.
 */
async function emitSuccessEvent(
    eventEmitter: TypedEventBus<UptimeEvents>,
    context: ErrorContext,
    correlationId: string,
    attempt: number
): Promise<void> {
    await eventEmitter.emitTyped("operation:success", {
        operation: context.operation,
        component: context.component,
        correlationId,
        attempt,
        timestamp: Date.now(),
    } as UptimeEvents[keyof UptimeEvents]);
}

/**
 * Handle error logging and formatting.
 */
function handleErrorLogging(error: Error, context: ErrorContext, attempt: number, maxRetries: number): void {
    const errorMessage = formatErrorMessage(error, context);
    logger.error(errorMessage, {
        error,
        context,
        attempt,
        maxRetries,
    });
}

/**
 * Calculate retry delay based on backoff strategy.
 */
function calculateRetryDelay(retry: NonNullable<ErrorHandlingConfig["retry"]>, attempt: number): number {
    return retry.backoff === "exponential"
        ? retry.initialDelay * Math.pow(2, attempt - 1)
        : retry.initialDelay * attempt;
}

/**
 * Handle retry logic with delay.
 */
async function handleRetry(
    retry: NonNullable<ErrorHandlingConfig["retry"]>,
    context: ErrorContext,
    correlationId: string,
    attempt: number,
    maxRetries: number
): Promise<void> {
    const delay = calculateRetryDelay(retry, attempt);

    logger.debug(`Retrying ${context.operation} in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`, {
        correlationId,
        delay,
    });

    await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Handle final error processing and return/throw logic.
 */
function handleFinalError<T>(
    error: Error,
    context: ErrorContext,
    config: ErrorHandlingConfig,
    rethrow: boolean
): Promise<T> {
    return emitErrorEvent(error, context, config).then(() => {
        if (rethrow) {
            throw error;
        }
        return null as T;
    });
}

/**
 * Handle successful operation result.
 */
async function handleOperationSuccess<T>(
    result: T,
    attempt: number,
    emitEvents: boolean,
    eventEmitter: TypedEventBus<UptimeEvents> | undefined,
    context: ErrorContext,
    correlationId: string
): Promise<T> {
    // Emit success event if this was a retry
    if (attempt > 1 && emitEvents && eventEmitter) {
        await emitSuccessEvent(eventEmitter, context, correlationId, attempt);
    }

    return result;
}

/**
 * Unified error handling utility that can be used across all layers.
 */
export async function withUnifiedErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    config: ErrorHandlingConfig = {}
): Promise<T> {
    const { rethrow = true, emitEvents = true, logError = true, eventEmitter, retry } = config;

    const correlationId = context.correlationId ?? generateCorrelationId();
    const enhancedContext = { ...context, correlationId };

    let lastError: Error | null = null;
    const maxRetries = retry?.maxRetries ?? 1;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await operation();
            return await handleOperationSuccess(result, attempt, emitEvents, eventEmitter, context, correlationId);
        } catch (error) {
            lastError = wrapError(error, `${context.operation} failed`);

            if (logError) {
                handleErrorLogging(lastError, enhancedContext, attempt, maxRetries);
            }

            // If this is the last attempt, handle final error
            if (attempt === maxRetries) {
                return handleFinalError(lastError, enhancedContext, config, rethrow);
            }

            // Handle retry
            if (retry) {
                await handleRetry(retry, context, correlationId, attempt, maxRetries);
            }
        }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError ?? new Error(`Operation ${context.operation} completed without success or error`);
}

/**
 * Specialized wrapper for database operations.
 */
export async function withDatabaseErrorHandling<T>(
    operation: () => Promise<T>,
    context: Omit<ErrorContext, "isDatabaseOperation">,
    config: ErrorHandlingConfig = {}
): Promise<T> {
    return withUnifiedErrorHandling(
        operation,
        { ...context, isDatabaseOperation: true },
        {
            retry: {
                maxRetries: 3,
                initialDelay: 100,
                backoff: "exponential",
            },
            ...config,
        }
    );
}

/**
 * Specialized wrapper for frontend store operations.
 */
export async function withStoreErrorHandling<T>(
    operation: () => Promise<T>,
    context: Omit<ErrorContext, "isDatabaseOperation">,
    config: ErrorHandlingConfig = {}
): Promise<T> {
    return withUnifiedErrorHandling(
        operation,
        { ...context, isDatabaseOperation: false },
        {
            retry: {
                maxRetries: 1,
                initialDelay: 0,
                backoff: "linear",
            },
            ...config,
        }
    );
}
