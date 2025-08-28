/**
 * Shared error handling utilities for async operations.
 *
 * @remarks
 * Provides a unified pattern for error logging, reporting, and state management
 * across frontend and backend code.
 *
 * @example
 *
 * Frontend usage:
 *
 * ```typescript
 * await withErrorHandling(() => doSomethingAsync(), store);
 * ```
 *
 * Backend usage:
 *
 * ```typescript
 * await withErrorHandling(() => doSomethingAsync(), {
 *     logger,
 *     operationName: "operation",
 * });
 * ```
 *
 * @packageDocumentation
 */

export interface ErrorHandlingBackendContext {
    logger: {
        error: (msg: string, err: unknown) => void;
    };
    operationName?: string;
}

export interface ErrorHandlingFrontendStore {
    clearError: () => void;
    setError: (err: string | undefined) => void;
    setLoading: (loading: boolean) => void;
}

/**
 * Shared error handling utility for async operations. Provides a unified
 * pattern for error logging, reporting, and state management.
 *
 * @remarks
 * This utility provides two overloaded signatures for different contexts:
 *
 * - Frontend: Integrates with store state management (loading, error states)
 * - Backend: Integrates with logging infrastructure for operation tracking
 *
 * @example Frontend usage:
 *
 * ```typescript
 * await withErrorHandling(() => doSomethingAsync(), store);
 * ```
 *
 * Backend usage:
 *
 * ```typescript
 * await withErrorHandling(() => doSomethingAsync(), {
 *     logger,
 *     operationName: "operation",
 * });
 * ```
 */

/**
 * Safely execute store operations with error logging.
 *
 * @remarks
 * Protects against store operation failures that could interfere with the main
 * operation flow. Uses console logging to avoid dependencies on external
 * loggers in shared utilities. Logs both store operation failures and original
 * error context when provided for comprehensive debugging information.
 *
 * @param storeOperation - Store operation function to execute safely
 * @param operationName - Descriptive name for the operation (used in error
 *   logging)
 * @param originalError - Optional original error context for enhanced debugging
 *
 * @internal
 */
function safeStoreOperation(
    storeOperation: () => void,
    operationName: string,
    originalError?: unknown
): void {
    try {
        storeOperation();
    } catch (error) {
        // Use basic console for shared utilities to avoid dependencies
        // This is acceptable in shared utilities that can't import loggers
        console.warn("Store operation failed for:", operationName, error);
        if (originalError) {
            console.error("Original operation error:", originalError);
        }
    }
}

/**
 * Handle backend operations with logger integration.
 *
 * @remarks
 * Logs operation failures with contextual information using the provided
 * logger. Does not modify the original error, ensuring stack traces and error
 * details are preserved for upstream error handling.
 *
 * @typeParam T - The return type of the async operation
 *
 * @param operation - Async operation to execute
 * @param context - Backend context with logger and optional operation name
 *
 * @returns Promise resolving to operation result
 *
 * @throws Re-throws the original error after logging
 */
async function handleBackendOperation<T>(
    operation: () => Promise<T>,
    context: ErrorHandlingBackendContext
): Promise<T> {
    // Extract properties safely
    const logger = context.logger;
    const operationName = context.operationName;

    try {
        return await operation();
    } catch (error) {
        // Check if logger exists and has error method
        if (
            logger &&
            typeof logger === "object" &&
            "error" in logger &&
            typeof logger.error === "function"
        ) {
            logger.error(
                operationName
                    ? `Failed to ${operationName}`
                    : "Async operation failed",
                error
            );
        } else {
            console.error(
                operationName
                    ? `Failed to ${operationName}`
                    : "Async operation failed",
                error
            );
        }
        throw error;
    }
}

/**
 * Handle frontend operations with store state management integration.
 *
 * @remarks
 * Provides comprehensive state management for frontend operations:
 *
 * - Clears error state before operation
 * - Sets loading state during execution
 * - Handles error state on failure
 * - Ensures loading state is always cleared in finally block Uses safe store
 *   operations to prevent state management errors from breaking the operation.
 *
 * @typeParam T - The return type of the async operation
 *
 * @param operation - Async operation to execute
 * @param store - Frontend store with state management methods
 *
 * @returns Promise resolving to operation result
 *
 * @throws Re-throws the original error after setting error state
 */
async function handleFrontendOperation<T>(
    operation: () => Promise<T>,
    store: ErrorHandlingFrontendStore
): Promise<T> {
    // Prepare store state
    safeStoreOperation(() => {
        store.clearError();
    }, "clear error state");
    safeStoreOperation(() => {
        store.setLoading(true);
    }, "set loading state");

    try {
        return await operation();
    } catch (error) {
        // Handle operation error
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        safeStoreOperation(
            () => {
                store.setError(errorMessage);
            },
            "set error state",
            error
        );
        throw error;
    } finally {
        // Always clear loading state
        safeStoreOperation(() => {
            store.setLoading(false);
        }, "clear loading state in finally block");
    }
}

/**
 * Handle async operations with frontend store or backend context integration.
 *
 * @remarks
 * - For frontend stores: Automatically manages loading state and error state in
 *   the provided store. Clears error state before operation, sets loading
 *   during execution, and handles error state on failure while preserving the
 *   original error.
 * - For backend contexts: Logs operation failures using the provided logger with
 *   contextual information. Preserves original error for upstream handling
 *   while ensuring proper logging.
 *
 * @typeParam T - The return type of the async operation
 *
 * @param operation - Async operation to execute with error handling
 * @param storeOrContext - Either frontend store with error/loading state
 *   management or backend context with logger
 *
 * @returns Promise resolving to operation result
 */
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    storeOrContext: ErrorHandlingBackendContext | ErrorHandlingFrontendStore
): Promise<T>;

/**
 * Implementation of the overloaded withErrorHandling function.
 *
 * @typeParam T - The return type of the async operation
 *
 * @param operation - Async operation to execute
 * @param storeOrContext - Either frontend store or backend context
 *
 * @returns Promise resolving to operation result
 *
 * @throws Re-throws the original error after handling (logging or state
 *   management)
 *
 * @internal
 */
// eslint-disable-next-line no-redeclare -- Function overload implementation is legitimate TypeScript pattern
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    storeOrContext: ErrorHandlingBackendContext | ErrorHandlingFrontendStore
): Promise<T> {
    // Check if it's a frontend store (has setError, clearError, setLoading
    // methods)
    const isFrontendStore = Boolean(
        storeOrContext &&
            typeof storeOrContext === "object" &&
            storeOrContext !== null &&
            typeof storeOrContext === "object" &&
            "setError" in storeOrContext &&
            "clearError" in storeOrContext &&
            "setLoading" in storeOrContext
    );

    return isFrontendStore
        ? handleFrontendOperation(
              operation,
              storeOrContext as ErrorHandlingFrontendStore
          )
        : handleBackendOperation(
              operation,
              storeOrContext as ErrorHandlingBackendContext
          );
}
