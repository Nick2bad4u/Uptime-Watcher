/**
 * Factory for creating standardized error handling contexts for store
 * operations. Eliminates duplication of error handling patterns across
 * different store modules.
 */

import type { ErrorHandlingFrontendStore } from "@shared/utils/errorHandling";

import { useErrorStore } from "../error/useErrorStore";

/**
 * Creates a standardized error handling context for store operations.
 * Provides consistent error state management across different store modules.
 *
 * @param storeKey - The key identifying the store for error tracking (e.g., "sites-operations", "sites-monitoring")
 * @param operationName - The name of the specific operation being performed (e.g., "createSite", "deleteSite")
 * @returns Error handling context compatible with `withErrorHandling` function
 *
 * @example
 * ```typescript
 * await withErrorHandling(
 *     async () => {
 *         // Your async operation
 *         await window.electronAPI.sites.addSite(site);
 *     },
 *     createStoreErrorHandler("sites-operations", "createSite")
 * );
 * ```
 *
 * @remarks
 * This factory eliminates the need to repeatedly define the same error
 * handling object structure across different store operations. It provides:
 * - Consistent error clearing before operations
 * - Standardized error state management on failures
 * - Proper loading state tracking during async operations
 */
export function createStoreErrorHandler(
    storeKey: string,
    operationName: string
): ErrorHandlingFrontendStore {
    const errorStore = useErrorStore.getState();

    return {
        clearError: (): void => {
            errorStore.clearStoreError(storeKey);
        },
        setError: (error): void => {
            errorStore.setStoreError(storeKey, error);
        },
        setLoading: (loading): void => {
            errorStore.setOperationLoading(operationName, loading);
        },
    };
}
