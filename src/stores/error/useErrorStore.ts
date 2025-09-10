/**
 * Centralized error store for managing application errors and loading states.
 * Provides global error handling and store-specific error tracking.
 *
 * @remarks
 * This store implements a comprehensive error management system that supports:
 *
 * - Global error state for application-wide error display
 * - Store-specific error isolation to prevent error cross-contamination
 * - Operation-specific loading states for fine-grained UI feedback
 * - Centralized error clearing and recovery mechanisms
 *
 * The store integrates with the application's error boundary system and
 * provides standardized error handling patterns across all application stores.
 *
 * @example
 *
 * ```typescript
 * // Basic error handling
 * const { setError, clearError, isLoading } = useErrorStore();
 *
 * // Store-specific error management
 * const { setStoreError, clearStoreError } = useErrorStore();
 * setStoreError("sites", "Failed to load sites");
 *
 * // Operation-specific loading
 * const { setOperationLoading, getOperationLoading } = useErrorStore();
 * setOperationLoading("fetchSites", true);
 * const isLoadingSites = getOperationLoading("fetchSites");
 * ```
 *
 * @public
 */

import { create, type StoreApi, type UseBoundStore } from "zustand";

import type { ErrorStore } from "./types";

import { logStoreAction } from "../utils";

/**
 * Zustand store for centralized error management across the application.
 *
 * @remarks
 * This store provides a unified interface for handling errors and loading
 * states throughout the application. It supports both global error states and
 * store-specific error isolation to prevent error cross-contamination between
 * different parts of the application.
 *
 * @public
 */
export const useErrorStore: UseBoundStore<StoreApi<ErrorStore>> =
    create<ErrorStore>()((set, get) => ({
        // Actions
        clearAllErrors: (): void => {
            logStoreAction("ErrorStore", "clearAllErrors");
            set({
                isLoading: false,
                lastError: undefined,
                operationLoading: {},
                storeErrors: {},
            });
        },
        clearError: (): void => {
            logStoreAction("ErrorStore", "clearError");
            set({ lastError: undefined });
        },
        clearStoreError: (store: string): void => {
            logStoreAction("ErrorStore", "clearStoreError", { store });
            set((state) => {
                const newStoreErrors = {
                    ...state.storeErrors,
                };
                // Filter out the specified store error
                const remainingErrors = Object.fromEntries(
                    Object.entries(newStoreErrors).filter(
                        ([key]) => key !== store
                    )
                );
                return { storeErrors: remainingErrors };
            });
        },
        getOperationLoading: (operation: string): boolean => {
            const loading = get().operationLoading;

            return loading[operation] ?? false;
        },
        getStoreError: (store: string): string | undefined => {
            const errors = get().storeErrors;

            return errors[store];
        },
        // State
        isLoading: false,
        lastError: undefined,
        operationLoading: {},
        setError: (error: string | undefined): void => {
            logStoreAction("ErrorStore", "setError", { error });
            set({ lastError: error });
        },
        setLoading: (loading: boolean): void => {
            logStoreAction("ErrorStore", "setLoading", { loading });
            set({ isLoading: loading });
        },
        setOperationLoading: (operation: string, loading: boolean): void => {
            logStoreAction("ErrorStore", "setOperationLoading", {
                loading,
                operation,
            });
            set((state) => ({
                operationLoading: {
                    ...state.operationLoading,
                    [operation]: loading,
                },
            }));
        },
        setStoreError: (store: string, error: string | undefined): void => {
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
