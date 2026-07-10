/**
 * Centralized error store for managing app errors and loading states. Provides
 * global error handling and store-specific error tracking.
 *
 * @remarks
 * This store implements a comprehensive error management system that supports:
 *
 * - Global error state for application-wide error display
 * - Store-specific error isolation to prevent error cross-contamination
 * - Operation-specific loading states for fine-grained UI feedback
 * - Centralized error clearing and recovery mechanisms
 *
 * The store integrates with the app's error boundary system and provides
 * standardized error handling patterns across all app stores.
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

import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { isPresent, objectEntries, objectValues } from "ts-extras";
import { create, type StoreApi, type UseBoundStore } from "zustand";

import type { ErrorStore } from "./types";

import { logStoreAction } from "../utils";

const normalizeStoredErrorMessage = (
    error: string | undefined
): string | undefined =>
    error === undefined || error.trim().length === 0
        ? error
        : getUserFacingErrorDetail(error);

const createOperationLoadingMap = (): ErrorStore["operationLoading"] =>
    createNullPrototypeObject<ErrorStore["operationLoading"]>();

const createStoreErrorMap = (): ErrorStore["storeErrors"] =>
    createNullPrototypeObject<ErrorStore["storeErrors"]>();

const hasActiveOperation = (
    operationLoading: ErrorStore["operationLoading"]
): boolean => objectValues(operationLoading).includes(true);

const setOperationLoadingEntry = (
    target: ErrorStore["operationLoading"],
    operation: string,
    loading: boolean
): void => {
    Object.defineProperty(target, operation, {
        configurable: true,
        enumerable: true,
        value: loading,
        writable: true,
    });
};

const setStoreErrorEntry = (
    target: ErrorStore["storeErrors"],
    store: string,
    error: string | undefined
): void => {
    Object.defineProperty(target, store, {
        configurable: true,
        enumerable: true,
        value: error,
        writable: true,
    });
};

const cloneOperationLoading = (
    operationLoading: ErrorStore["operationLoading"]
): ErrorStore["operationLoading"] => {
    const nextOperationLoading = createOperationLoadingMap();

    for (const [operation, loading] of objectEntries(operationLoading)) {
        if (typeof loading === "boolean") {
            setOperationLoadingEntry(nextOperationLoading, operation, loading);
        }
    }

    return nextOperationLoading;
};

const cloneStoreErrors = (
    storeErrors: ErrorStore["storeErrors"]
): ErrorStore["storeErrors"] => {
    const nextStoreErrors = createStoreErrorMap();

    for (const [store, error] of objectEntries(storeErrors)) {
        if (error === undefined || typeof error === "string") {
            setStoreErrorEntry(nextStoreErrors, store, error);
        }
    }

    return nextStoreErrors;
};

/**
 * Zustand store for centralized error management across the app.
 *
 * @remarks
 * This store provides a unified interface for handling errors and loading
 * states throughout the app. It supports both global error states and
 * store-specific error isolation to prevent error cross-contamination between
 * different parts of the app.
 *
 * @public
 */
export const useErrorStore: UseBoundStore<StoreApi<ErrorStore>> =
    create<ErrorStore>()((set, get) => {
        let explicitLoading = false;

        return {
            // Actions
            clearAllErrors: (): void => {
                logStoreAction("ErrorStore", "clearAllErrors");
                set({
                    lastError: undefined,
                    storeErrors: createStoreErrorMap(),
                    // Note: isLoading and operationLoading are NOT cleared as they track loading states, not errors
                });
            },
            clearError: (): void => {
                logStoreAction("ErrorStore", "clearError");
                set({ lastError: undefined });
            },
            clearStoreError: (store: string): void => {
                logStoreAction("ErrorStore", "clearStoreError", { store });
                set((state) => {
                    const remainingErrors = cloneStoreErrors(state.storeErrors);
                    Reflect.deleteProperty(remainingErrors, store);
                    return { storeErrors: remainingErrors };
                });
            },
            getOperationLoading: (operation: string): boolean => {
                const loading = get().operationLoading;

                return loading[operation] ?? false;
            },
            getStoreError: (store: string): string | undefined => {
                const raw = get().storeErrors[store] as unknown;

                if (typeof raw === "string") {
                    return normalizeStoredErrorMessage(raw);
                }

                if (isPresent(raw)) {
                    return getUserFacingErrorDetail(raw);
                }

                return undefined;
            },
            // State
            isLoading: false,
            lastError: undefined,
            operationLoading: createOperationLoadingMap(),
            setError: (error: string | undefined): void => {
                const lastError = normalizeStoredErrorMessage(error);
                logStoreAction("ErrorStore", "setError", { error: lastError });
                set({ lastError });
            },
            setLoading: (loading: boolean): void => {
                logStoreAction("ErrorStore", "setLoading", { loading });
                explicitLoading = loading;
                set((state) => ({
                    isLoading:
                        explicitLoading ||
                        hasActiveOperation(state.operationLoading),
                }));
            },
            setOperationLoading: (
                operation: string,
                loading: boolean
            ): void => {
                logStoreAction("ErrorStore", "setOperationLoading", {
                    loading,
                    operation,
                });
                set((state) => {
                    const operationLoading = cloneOperationLoading(
                        state.operationLoading
                    );
                    setOperationLoadingEntry(
                        operationLoading,
                        operation,
                        loading
                    );

                    return {
                        isLoading:
                            explicitLoading ||
                            hasActiveOperation(operationLoading),
                        operationLoading,
                    };
                });
            },
            setStoreError: (store: string, error: string | undefined): void => {
                const storeError = normalizeStoredErrorMessage(error);
                logStoreAction("ErrorStore", "setStoreError", {
                    error: storeError,
                    store,
                });
                set((state) => ({
                    storeErrors: (() => {
                        const storeErrors = cloneStoreErrors(state.storeErrors);
                        setStoreErrorEntry(storeErrors, store, storeError);
                        return storeErrors;
                    })(),
                }));
            },
            storeErrors: createStoreErrorMap(),
        };
    });
