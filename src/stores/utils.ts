/**
 * Utility functions for store management and composition.
 * Provides common functionality for error handling, persistence, and store composition.
 */

import { BaseStore } from "./types";

/**
 * Creates a base store slice with common error handling functionality
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
 * Wrapper for async operations with error handling
 */
export const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    store: Pick<BaseStore, "setError" | "setLoading" | "clearError">
): Promise<T> => {
    store.setLoading(true);
    store.clearError();

    try {
        const result = await operation();
        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        store.setError(errorMessage);
        throw error;
    } finally {
        store.setLoading(false);
    }
};

/**
 * Creates a persistence configuration for a store
 */
export const createPersistConfig = <T>(name: string, partialize?: (state: T) => Partial<T>) => ({
    name: `uptime-watcher-${name}`,
    partialize: partialize as ((state: T) => T) | undefined,
});

/**
 * Debounce utility for store actions
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
 * Logger utility for store actions in development
 */
export const logStoreAction = (storeName: string, actionName: string, data?: unknown) => {
    if (process.env.NODE_ENV === "development") {
        const timestamp = new Date().toLocaleTimeString();
        if (data !== undefined) {
            console.log(`[${timestamp}] [${storeName}] ${actionName}`, data);
        } else {
            console.log(`[${timestamp}] [${storeName}] ${actionName}`);
        }
    }
};

/**
 * Utility function to wait for electronAPI to be available.
 * Polls for the API with exponential backoff to handle timing issues.
 *
 * @param maxAttempts - Maximum number of polling attempts (default: 50)
 * @param baseDelay - Base delay in milliseconds for exponential backoff (default: 100)
 * @throws Error when electronAPI is not available after maximum attempts
 */
export async function waitForElectronAPI(maxAttempts = 50, baseDelay = 100): Promise<void> {
    for (const attempt of Array.from({ length: maxAttempts }, (_, index) => index)) {
        if (typeof window.electronAPI.sites.getSites === "function") {
            return; // API is ready
        }

        // Wait with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(1.5, attempt), 2000);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error(
        "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment."
    );
}
