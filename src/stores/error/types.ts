/**
 * Error store types and interfaces.
 */

export interface ErrorActions {
    /** Clear all errors */
    clearAllErrors: () => void;
    /** Clear global error */
    clearError: () => void;
    /** Clear error for specific store */
    clearStoreError: (store: string) => void;
    /** Get loading state for specific operation */
    getOperationLoading: (operation: string) => boolean;
    /** Get error for specific store */
    getStoreError: (store: string) => string | undefined;
    /** Set global error message */
    setError: (error: string | undefined) => void;
    /** Set global loading state */
    setLoading: (loading: boolean) => void;
    /** Set loading state for specific operation */
    setOperationLoading: (operation: string, loading: boolean) => void;
    /** Set error for specific store */
    setStoreError: (store: string, error: string | undefined) => void;
}

export interface ErrorState {
    /** Global loading state */
    isLoading: boolean;
    /** Last error message to display */
    lastError: string | undefined;
    /** Loading states for specific operations */
    operationLoading: Record<string, boolean>;
    /** Store-specific error states */
    storeErrors: Record<string, string | undefined>;
}

export type ErrorStore = ErrorActions & ErrorState;
