/**
 * Standardized error handling utilities for consistent error management.
 *
 * @remarks
 * Provides consistent error handling patterns across all services, with support
 * for different contexts (transactional, non-transactional, async operations).
 *
 * Key patterns:
 * - **Consistent logging**: Standardized error message formatting
 * - **Error wrapping**: Convert unknown errors to Error instances
 * - **Context-aware handling**: Different strategies for different operation types
 * - **Event emission**: Automatic error event emission where appropriate
 */

import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";
import { logger } from "./logger";

/**
 * Error context information for better error tracking.
 */
export interface ErrorContext {
    /** Service/component where error occurred */
    component?: string;
    /** Additional context data */
    context?: Record<string, unknown>;
    /** Whether this error occurred in a transaction */
    inTransaction?: boolean;
    /** Operation that failed */
    operation: string;
}

/**
 * Options for error handling behavior.
 */
export interface ErrorHandlingOptions {
    /** Whether to emit error events */
    emitEvents?: boolean;
    /** Event emitter for error events */
    eventEmitter?: TypedEventBus<UptimeEvents>;
    /** Whether to log the error */
    logError?: boolean;
    /** Custom error message prefix */
    messagePrefix?: string;
    /** Whether to re-throw the error after handling */
    rethrow?: boolean;
}

/**
 * Format error message with context.
 */
export function formatErrorMessage(baseMessage: string, context: ErrorContext, error: Error): string {
    const prefix = context.component ? `[${context.component}]` : "";
    const operation = context.operation;
    const errorInfo = error.message;

    return `${prefix} ${baseMessage} during ${operation}: ${errorInfo}`;
}

/**
 * Centralized error handling utility.
 *
 * @example
 * ```typescript
 * // In a service method
 * try {
 *   await someOperation();
 * } catch (error) {
 *   return handleError(error, {
 *     operation: "create-site",
 *     component: "SiteManager",
 *     context: { siteId: "example" }
 *   }, {
 *     rethrow: true,
 *     emitEvents: true,
 *     eventEmitter: this.eventEmitter
 *   });
 * }
 * ```
 */
export async function handleError(
    error: unknown,
    context: ErrorContext,
    options: ErrorHandlingOptions = {}
): Promise<void> {
    const { emitEvents = false, logError = true, messagePrefix = "Operation failed", rethrow = true } = options;
    const eventEmitter = options.eventEmitter;

    // Wrap unknown errors
    const wrappedError = wrapError(error, `Unknown error during ${context.operation}`);

    // Format error message
    const formattedMessage = formatErrorMessage(messagePrefix, context, wrappedError);

    // Log error with context
    if (logError) {
        logger.error(formattedMessage, {
            component: context.component,
            context: context.context,
            error: wrappedError,
            inTransaction: context.inTransaction,
            operation: context.operation,
        });
    }

    // Emit error events if requested
    if (emitEvents && eventEmitter) {
        try {
            await eventEmitter.emitTyped("database:error", {
                details: formattedMessage,
                error: wrappedError,
                operation: context.operation,
                timestamp: Date.now(),
            });
        } catch (emitError) {
            // Don't let event emission errors break error handling
            logger.warn("Failed to emit error event", emitError);
        }
    }

    // Re-throw if requested
    if (rethrow) {
        throw wrappedError;
    }
}

/**
 * Error handling specifically for operational hooks.
 */
export async function handleOperationalError(
    error: unknown,
    context: ErrorContext,
    options: ErrorHandlingOptions = {}
): Promise<never> {
    // Operational errors typically need event emission
    const operationalOptions: ErrorHandlingOptions = {
        emitEvents: true,
        logError: true,
        rethrow: true,
        ...options,
    };

    await handleError(error, context, operationalOptions);
    // Will never reach here due to rethrow=true
    throw error;
}

/**
 * Special error handling for database transactions.
 *
 * @remarks
 * Transactions have special requirements:
 * - Errors should always be re-thrown to trigger rollback
 * - Logging should include transaction context
 * - No event emission during transaction (wait for commit/rollback)
 */
export function handleTransactionError(error: unknown, context: Omit<ErrorContext, "inTransaction">): never {
    const transactionContext: ErrorContext = {
        ...context,
        inTransaction: true,
    };

    const wrappedError = wrapError(error, `Transaction failed during ${context.operation}`);
    const formattedMessage = formatErrorMessage("Transaction error", transactionContext, wrappedError);

    // Always log transaction errors
    logger.error(formattedMessage, {
        component: context.component,
        context: context.context,
        error: wrappedError,
        inTransaction: true,
        operation: context.operation,
    });

    // Always re-throw transaction errors to trigger rollback
    throw wrappedError;
}

/**
 * Wrapper for async operations with standardized error handling.
 *
 * @example
 * ```typescript
 * const result = await withErrorHandling(
 *   async () => await someAsyncOperation(),
 *   {
 *     operation: "fetch-sites",
 *     component: "SiteRepository"
 *   },
 *   {
 *     emitEvents: true,
 *     eventEmitter: this.eventEmitter
 *   }
 * );
 * ```
 */
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    options: ErrorHandlingOptions = {}
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        await handleError(error, context, options);
        // This will never execute if rethrow=true (default)
        throw error;
    }
}

/**
 * Wrapper for sync operations with standardized error handling.
 */
export function withSyncErrorHandling<T>(
    operation: () => T,
    context: ErrorContext,
    options: ErrorHandlingOptions = {}
): T {
    try {
        return operation();
    } catch (error) {
        // Use void to handle async error handling in sync context
        void handleError(error, context, options);
        throw error; // Re-throw for sync operations
    }
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
