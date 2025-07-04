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
export const debounce = <T extends unknown[]>(func: (...args: T) => void, wait: number): ((...args: T) => void) => {
    const timeouts = new Map<string, NodeJS.Timeout>();
    return (...args: T) => {
        const key = JSON.stringify(args);
        const existingTimeout = timeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        const timeout = setTimeout(() => {
            func(...args);
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
        console.log(`[${storeName}] ${actionName}`, data);
    }
};
