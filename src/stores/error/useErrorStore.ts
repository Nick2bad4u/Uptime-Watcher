/**
 * Centralized error store for managing application errors and loading states.
 * Provides global error handling and store-specific error tracking.
 */

import { create } from "zustand";

import type { ErrorStore } from "./types";

import { logStoreAction } from "../utils";

export const useErrorStore = create<ErrorStore>((set, get) => ({
    // Actions
    clearAllErrors: () => {
        logStoreAction("ErrorStore", "clearAllErrors");
        set({
            lastError: undefined,
            storeErrors: {},
        });
    },
    clearError: () => {
        logStoreAction("ErrorStore", "clearError");
        set({ lastError: undefined });
    },
    clearStoreError: (store: string) => {
        logStoreAction("ErrorStore", "clearStoreError", { store });
        set((state) => {
            const newStoreErrors = { ...state.storeErrors };
            // Use destructuring to avoid dynamic delete
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [store]: _, ...remainingErrors } = newStoreErrors;
            return { storeErrors: remainingErrors };
        });
    },
    getOperationLoading: (operation: string) => {
        const loading = get().operationLoading;
        // eslint-disable-next-line security/detect-object-injection
        return loading[operation] ?? false;
    },
    getStoreError: (store: string) => {
        const errors = get().storeErrors;
        // eslint-disable-next-line security/detect-object-injection
        return errors[store];
    },
    // State
    isLoading: false,
    lastError: undefined,
    operationLoading: {},
    setError: (error: string | undefined) => {
        logStoreAction("ErrorStore", "setError", { error });
        set({ lastError: error });
    },
    setLoading: (loading: boolean) => {
        logStoreAction("ErrorStore", "setLoading", { loading });
        set({ isLoading: loading });
    },
    setOperationLoading: (operation: string, loading: boolean) => {
        logStoreAction("ErrorStore", "setOperationLoading", { loading, operation });
        set((state) => ({
            operationLoading: {
                ...state.operationLoading,
                [operation]: loading,
            },
        }));
    },
    setStoreError: (store: string, error: string | undefined) => {
        logStoreAction("ErrorStore", "setStoreError", { error, store });
        set((state) => ({
            storeErrors: {
                ...state.storeErrors,
                [store]: error,
            },
        }));
    },
    storeErrors: {},
}));
