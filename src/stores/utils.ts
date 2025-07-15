/**
 * Utility functions for store management and composition.
 *
 * @remarks
 * Provides common functionality for error handling, persistence, and store composition
 * across all Zustand stores in the application. These utilities ensure consistent
 * patterns for async operations, error states, and data persistence.
 *
 * @packageDocumentation
 */

import { BaseStore } from "./types";
import logger from "../services/logger";

/**
 * Creates a base store slice with common error handling functionality.
 *
 * @param set - Zustand set function for updating store state
 * @returns Object containing common store methods and initial state values
 *
 * @remarks
 * This function provides a standardized way to add error handling, loading states,
 * and error management to any Zustand store. It ensures consistent error handling
 * patterns across all stores in the application.
 *
 * @example
 * ```typescript
 * const useMyStore = create<MyStore>((set, get) => ({
 *   ...createBaseStore(set),
 *   // ... other store properties
 * }));
 * ```
 *
 * @public
 */
export const createBaseStore = <T extends BaseStore>(
    set: (partial: Partial<T>) => void
): Pick<T, "lastError" | "isLoading" | "setError" | "setLoading" | "clearError"> => ({
    clearError: () => set({ lastError: undefined } as Partial<T>),
    isLoading: false,
    lastError: undefined,
    setError: (error: string | undefined) => set({ lastError: error } as Partial<T>),
    setLoading: (loading: boolean) => set({ isLoading: loading } as Partial<T>),
});

/**
 * Wrapper for async operations with standardized error handling.
 *
 * @param operation - Async function to execute with error handling
 * @param store - Store instance with error handling methods
 * @returns Promise resolving to the operation result
 *
 * @throws Re-throws the original error after setting it in the store
 *
 * @remarks
 * This utility automatically manages loading states and error handling for async
 * operations. It sets loading to true at the start, clears any previous errors,
 * and properly handles both success and failure scenarios.
 *
 * The loading state is always cleared in the finally block with proper error
 * handling to prevent state corruption if the finally block itself throws.
 *
 * @example
 * ```typescript
 * const fetchData = async () => {
 *   return withErrorHandling(
 *     () => api.getData(),
 *     store
 *   );
 * };
 * ```
 *
 * @public
 */
export const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    store: Pick<BaseStore, "setError" | "setLoading" | "clearError">
): Promise<T> => {
    // Clear any previous error state before starting
    try {
        store.clearError();
    } catch (error) {
        // If clearError fails, log it but don't prevent the operation
        logger.error("Failed to clear error state", error instanceof Error ? error : new Error(String(error)));
    }

    // Set loading state to true
    try {
        store.setLoading(true);
    } catch (error) {
        // If setLoading fails, log it but don't prevent the operation
        logger.error("Failed to set loading state", error instanceof Error ? error : new Error(String(error)));
    }

    try {
        const result = await operation();
        return result;
    } catch (error) {
        // Handle the error from the operation
        const errorMessage = error instanceof Error ? error.message : String(error);

        try {
            store.setError(errorMessage);
        } catch (storeError) {
            // If setError fails, log both errors
            logger.error(
                "Failed to set error state",
                storeError instanceof Error ? storeError : new Error(String(storeError))
            );
            logger.error("Original operation error", error instanceof Error ? error : new Error(String(error)));
        }

        throw error;
    } finally {
        // Always clear loading state, with error handling
        try {
            store.setLoading(false);
        } catch (error) {
            // If setLoading fails in finally, log it but don't throw
            // to avoid masking the original error
            logger.error(
                "Failed to clear loading state in finally block",
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }
};

/**
 * Creates a persistence configuration for Zustand store persistence.
 *
 * @param name - Unique name for the persisted store data
 * @param partialize - Optional function to select which parts of state to persist
 * @returns Configuration object for zustand/middleware/persist
 *
 * @remarks
 * This utility creates a standardized persistence configuration that prefixes
 * all store names with 'uptime-watcher-' to avoid conflicts with other applications.
 * The partialize function allows selective persistence of store properties.
 *
 * @example
 * ```typescript
 * const useMyStore = create(
 *   persist(
 *     (set, get) => ({ }),
 *     createPersistConfig('my-store')
 *   )
 * );
 * ```
 *
 * @public
 */
export const createPersistConfig = <T>(name: string, partialize?: (state: T) => Partial<T>) => ({
    name: `uptime-watcher-${name}`,
    partialize: partialize as ((state: T) => T) | undefined,
});

/**
 * Debounce utility for store actions with automatic cleanup.
 *
 * @param function_ - Function to debounce
 * @param wait - Wait time in milliseconds before executing
 * @returns Debounced version of the input function
 *
 * @remarks
 * This utility prevents rapid successive calls to expensive operations like
 * API requests or state updates. It uses a Map to track timeouts per unique
 * argument combination, allowing different argument sets to be debounced independently.
 *
 * @example
 * ```typescript
 * const debouncedSave = debounce(saveSettings, 500);
 * debouncedSave(newSettings); // Will only execute after 500ms of no new calls
 * ```
 *
 * @public
 */
export const debounce = <T extends unknown[]>(
    function_: (...arguments_: T) => void,
    wait: number
): ((...arguments_: T) => void) => {
    const timeouts = new Map<string, NodeJS.Timeout>();
    return (...arguments_: T) => {
        const key = JSON.stringify(arguments_);
        const existingTimeout = timeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        const timeout = setTimeout(() => {
            function_(...arguments_);
            timeouts.delete(key);
        }, wait);
        timeouts.set(key, timeout);
    };
};

/**
 * Logger utility for store actions in development mode.
 *
 * @param storeName - Name of the store performing the action
 * @param actionName - Name of the action being performed
 * @param data - Optional data associated with the action
 *
 * @remarks
 * This utility provides consistent logging for store actions during development.
 * It only logs when NODE_ENV is set to 'development' to avoid performance
 * impact in production builds.
 *
 * @example
 * ```typescript
 * logStoreAction('SitesStore', 'addSite', { id: 'site-123' });
 * ```
 *
 * @public
 */
export const logStoreAction = (storeName: string, actionName: string, data?: unknown) => {
    if (process.env.NODE_ENV === "development") {
        if (data !== undefined) {
            logger.info(`[${storeName}] ${actionName}`, data);
        } else {
            logger.info(`[${storeName}] ${actionName}`);
        }
    }
};

/**
 * Utility function to wait for electronAPI to be available.
 *
 * @param maxAttempts - Maximum number of polling attempts
 * @param baseDelay - Base delay in milliseconds for exponential backoff
 * @returns Promise that resolves when electronAPI is available
 *
 * @throws Error when electronAPI is not available after maximum attempts
 *
 * @remarks
 * Polls for the API with exponential backoff to handle timing issues during
 * application startup. This is necessary because the preload script may not
 * have finished executing when React components first mount.
 *
 * @defaultValue maxAttempts - 50
 * @defaultValue baseDelay - 100
 *
 * @example
 * ```typescript
 * try {
 *   await waitForElectronAPI();
 *   // Safe to use window.electronAPI
 * } catch (error) {
 *   logger.error('ElectronAPI not available', error as Error);
 * }
 * ```
 *
 * @public
 */
export async function waitForElectronAPI(maxAttempts = 50, baseDelay = 100): Promise<void> {
    for (const attempt of Array.from({ length: maxAttempts }, (_, index) => index)) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (typeof window.electronAPI?.sites?.getSites === "function") {
                return; // API is ready
            }
        } catch {
            // window.electronAPI not available yet
        }

        // Wait with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(1.5, attempt), 2000);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error(
        "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment."
    );
}
