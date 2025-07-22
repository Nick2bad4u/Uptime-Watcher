/**
 * Shared error handling utility for async operations.
 * Provides a unified pattern for error logging, reporting, and state management.
 *
 * Usage (frontend):
 *   await withErrorHandling(() =\> doSomethingAsync(), store)
 *
 * Usage (backend):
 *   await withErrorHandling(() =\> doSomethingAsync(), \{ logger, operationName: "operation" \})
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

// Overloaded function signatures for better type safety
export async function withErrorHandling<T>(operation: () => Promise<T>, store: ErrorHandlingFrontendStore): Promise<T>;

export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorHandlingBackendContext
): Promise<T>;

export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    storeOrContext: ErrorHandlingBackendContext | ErrorHandlingFrontendStore
): Promise<T> {
    // Check if it's a frontend store (has setError, clearError, setLoading methods)
    return "setError" in storeOrContext && "clearError" in storeOrContext && "setLoading" in storeOrContext
        ? handleFrontendOperation(operation, storeOrContext)
        : handleBackendOperation(operation, storeOrContext);
}

/**
 * Handle backend operations with logger.
 */
async function handleBackendOperation<T>(
    operation: () => Promise<T>,
    context: ErrorHandlingBackendContext
): Promise<T> {
    const { logger, operationName } = context;

    try {
        const result = await operation();
        return result;
    } catch (error) {
        logger.error(operationName ? `Failed to ${operationName}` : "Async operation failed", error);
        throw error;
    }
}

/**
 * Handle frontend operations with store state management.
 */
async function handleFrontendOperation<T>(operation: () => Promise<T>, store: ErrorHandlingFrontendStore): Promise<T> {
    // Prepare store state
    safeStoreOperation(() => store.clearError(), "clear error state");
    safeStoreOperation(() => store.setLoading(true), "set loading state");

    try {
        const result = await operation();
        return result;
    } catch (error) {
        // Handle operation error
        const errorMessage = error instanceof Error ? error.message : String(error);
        safeStoreOperation(() => store.setError(errorMessage), "set error state", error);
        throw error;
    } finally {
        // Always clear loading state
        safeStoreOperation(() => store.setLoading(false), "clear loading state in finally block");
    }
}

/**
 * Safely execute store operations with error logging.
 */
function safeStoreOperation(storeOperation: () => void, operationName: string, originalError?: unknown): void {
    try {
        storeOperation();
    } catch (error) {
        // Use basic console for shared utilities to avoid dependencies
        // This is acceptable in shared utilities that can't import loggers
        console.warn(`Failed to ${operationName}:`, error);
        if (originalError) {
            console.error("Original operation error:", originalError);
        }
    }
}
