/**
 * Error store types and interfaces.
 */

export interface ErrorState {
    /** Last error message to display */
    lastError: string | undefined;
    /** Global loading state */
    isLoading: boolean;
    /** Store-specific error states */
    storeErrors: Record<string, string | undefined>;
    /** Loading states for specific operations */
    operationLoading: Record<string, boolean>;
}

export interface ErrorActions {
    /** Set global error message */
    setError: (error: string | undefined) => void;
    /** Set global loading state */
    setLoading: (loading: boolean) => void;
    /** Clear global error */
    clearError: () => void;
    /** Set error for specific store */
    setStoreError: (store: string, error: string | undefined) => void;
    /** Clear error for specific store */
    clearStoreError: (store: string) => void;
    /** Set loading state for specific operation */
    setOperationLoading: (operation: string, loading: boolean) => void;
    /** Clear all errors */
    clearAllErrors: () => void;
    /** Get error for specific store */
    getStoreError: (store: string) => string | undefined;
    /** Get loading state for specific operation */
    getOperationLoading: (operation: string) => boolean;
}

export type ErrorStore = ErrorState & ErrorActions;
