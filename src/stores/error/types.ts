/**
 * Error store types and interfaces for centralized error management.
 *
 * @remarks
 * Defines the structure for error state management across the application,
 * including global errors, store-specific errors, and operation loading
 * states.
 *
 * @packageDocumentation
 */

/**
 * Error management actions for the error store.
 *
 * @remarks
 * Provides methods for managing application-wide error states and loading
 * indicators. Supports both global errors and store-specific error isolation.
 *
 * @public
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

/**
 * Error state structure for centralized error management.
 *
 * @remarks
 * Maintains global error state, store-specific errors, and operation loading
 * states to provide comprehensive error tracking across the application.
 *
 * @public
 */
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

/**
 * Combined error store interface with state and actions.
 *
 * @remarks
 * Merges error state and actions into a single interface for the Zustand store.
 * Provides complete error management functionality for the application.
 *
 * @public
 */
export type ErrorStore = ErrorActions & ErrorState;
