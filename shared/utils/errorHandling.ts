/**
 * Shared error handling utility for async operations.
 * Provides a unified pattern for error logging, reporting, and state management.
 *
 * Usage (frontend):
 *   await withErrorHandling(() => doSomethingAsync(), store)
 *
 * Usage (backend):
 *   await withErrorHandling(() => doSomethingAsync(), { logger, operationName: "operation" })
 */

export interface ErrorHandlingFrontendStore {
  setError: (err: string | undefined) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export interface ErrorHandlingBackendContext {
  logger: {
    error: (msg: string, err: unknown) => void;
  };
  operationName?: string;
}

// Overloaded function signatures for better type safety
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  store: ErrorHandlingFrontendStore
): Promise<T>;

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorHandlingBackendContext
): Promise<T>;

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  storeOrContext: ErrorHandlingFrontendStore | ErrorHandlingBackendContext
): Promise<T> {
  // Check if it's a frontend store (has setError, clearError, setLoading methods)
  if ('setError' in storeOrContext && 'clearError' in storeOrContext && 'setLoading' in storeOrContext) {
    const store = storeOrContext as ErrorHandlingFrontendStore;
    
    // Clear any previous error state before starting
    try {
      store.clearError();
    } catch (error) {
      // If clearError fails, log but continue
      console.warn('Failed to clear error state:', error);
    }

    // Set loading state to true
    try {
      store.setLoading(true);
    } catch (error) {
      // If setLoading fails, log but continue
      console.warn('Failed to set loading state:', error);
    }

    try {
      const result = await operation();
      return result;
    } catch (error) {
      // Handle the error from the operation
      try {
        const errorMessage = error instanceof Error ? error.message : String(error);
        store.setError(errorMessage);
      } catch (storeError) {
        // If setError fails, log both errors
        console.error('Failed to set error state:', storeError);
        console.error('Original operation error:', error);
      }
      throw error;
    } finally {
      // Always clear loading state, with error handling
      try {
        store.setLoading(false);
      } catch (error) {
        console.warn('Failed to clear loading state in finally block:', error);
      }
    }
  } else {
    // Backend context
    const context = storeOrContext as ErrorHandlingBackendContext;
    const { logger, operationName } = context;
    
    try {
      const result = await operation();
      return result;
    } catch (error) {
      logger.error(
        operationName ? `Failed to ${operationName}` : 'Async operation failed',
        error
      );
      throw error;
    }
  }
}
