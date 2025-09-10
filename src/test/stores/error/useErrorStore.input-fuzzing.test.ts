/**
 * @remarks
 * Tests all error store operations with property-based testing using fast-check
 * to discover edge cases in error handling, loading state management, and
 * store-specific error isolation. Validates state consistency, error recovery,
 * and operation tracking patterns.
 *
 * Coverage areas:
 *
 * - Global error state management with arbitrary errors
 * - Store-specific error isolation and tracking
 * - Operation-specific loading state management
 * - Error clearing and recovery mechanisms
 * - Concurrent error and loading operations
 * - State consistency and invariants
 * - Error boundary integration
 *
 * @file Comprehensive property-based fuzzing tests for error store management
 *
 * @author AI Assistant
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { test as fcTest } from "@fast-check/vitest";
import * as fc from "fast-check";
import { useErrorStore } from "../../../stores/error/useErrorStore";

// Test utilities for error store state management
const createTestErrorStore = () => {
    // Get the store instance and call clearAllErrors to reset state
    useErrorStore.getState().clearAllErrors();

    // Verify the state is actually cleared
    const clearedState = useErrorStore.getState();
    if (
        clearedState.lastError !== undefined ||
        Object.keys(clearedState.storeErrors).length > 0 ||
        Object.keys(clearedState.operationLoading).length > 0 ||
        clearedState.isLoading !== false
    ) {
        throw new Error(
            `Store not properly cleared: ${JSON.stringify({
                lastError: clearedState.lastError,
                storeErrors: clearedState.storeErrors,
                operationLoading: clearedState.operationLoading,
                isLoading: clearedState.isLoading,
            })}`
        );
    }

    // Return the store state after clearing
    return clearedState;
};

// Property-based test arbitraries for error store
const arbitraries = {
    /** Generate error message */
    errorMessage: fc
        .string({ minLength: 1, maxLength: 500 })
        .filter((s) => s.trim().length > 0),

    /** Generate empty error message */
    emptyError: fc.constantFrom("", "   ", "\n", "\t"),

    /** Generate store name */
    storeName: fc.constantFrom(
        "sites",
        "ui",
        "settings",
        "monitors",
        "analytics",
        "sync",
        "auth",
        "cache"
    ),

    /** Generate operation name */
    operationName: fc.constantFrom(
        "fetchSites",
        "createSite",
        "updateSite",
        "deleteSite",
        "startMonitoring",
        "stopMonitoring",
        "checkStatus",
        "syncData",
        "backupData",
        "loadSettings",
        "saveSettings",
        "authenticate",
        "refreshToken",
        "clearCache",
        "validateData"
    ),

    /** Generate boolean loading state */
    loadingState: fc.boolean(),

    /** Generate store error configuration */
    storeErrorConfig: fc.record({
        store: fc.constantFrom(
            "sites",
            "ui",
            "settings",
            "monitors",
            "analytics",
            "sync",
            "auth",
            "cache"
        ),
        error: fc.option(
            fc
                .string({ minLength: 1, maxLength: 500 })
                .filter((s) => s.trim().length > 0)
        ),
    }),

    /** Generate operation loading configuration */
    operationLoadingConfig: fc.record({
        operation: fc.constantFrom(
            "fetchSites",
            "createSite",
            "updateSite",
            "deleteSite",
            "startMonitoring",
            "stopMonitoring",
            "checkStatus",
            "syncData",
            "backupData",
            "loadSettings",
            "saveSettings",
            "authenticate",
            "refreshToken",
            "clearCache",
            "validateData"
        ),
        loading: fc.boolean(),
    }),

    /** Generate multiple store errors */
    multipleStoreErrors: fc.array(
        fc.record({
            store: fc.constantFrom(
                "sites",
                "ui",
                "settings",
                "monitors",
                "analytics",
                "sync",
                "auth",
                "cache"
            ),
            error: fc.option(
                fc
                    .string({ minLength: 1, maxLength: 500 })
                    .filter((s) => s.trim().length > 0)
            ),
        }),
        { minLength: 1, maxLength: 8 }
    ),

    /** Generate multiple operation loadings */
    multipleOperationLoadings: fc.array(
        fc.record({
            operation: fc.constantFrom(
                "fetchSites",
                "createSite",
                "updateSite",
                "deleteSite",
                "startMonitoring",
                "stopMonitoring",
                "checkStatus",
                "syncData",
                "backupData",
                "loadSettings",
                "saveSettings",
                "authenticate",
                "refreshToken",
                "clearCache",
                "validateData"
            ),
            loading: fc.boolean(),
        }),
        { minLength: 1, maxLength: 14 }
    ),
};

describe("Error Store - Property-Based Fuzzing Tests", () => {
    let store: ReturnType<typeof useErrorStore.getState>;

    beforeEach(() => {
        vi.clearAllMocks();
        store = createTestErrorStore();
    });

    describe("Global Error Management", () => {
        fcTest.prop([arbitraries.errorMessage])(
            "should handle setting global errors",
            (errorMessage) => {
                store = createTestErrorStore();
                // Act
                store.setError(errorMessage);

                // Assert
                expect(useErrorStore.getState().lastError).toBe(errorMessage);
            }
        );

        fcTest.prop([arbitraries.errorMessage])(
            "should handle clearing global errors",
            (errorMessage) => {
                store = createTestErrorStore();
                // Arrange
                store.setError(errorMessage);
                expect(useErrorStore.getState().lastError).toBe(errorMessage);

                // Act
                store.clearError();

                // Assert
                expect(useErrorStore.getState().lastError).toBeUndefined();
            }
        );

        fcTest.prop([
            fc.array(arbitraries.errorMessage, { minLength: 1, maxLength: 10 }),
        ])("should handle rapid error updates", (errorMessages) => {
            store = createTestErrorStore();
            // Act - rapidly update errors
            for (const error of errorMessages) store.setError(error);

            // Assert - last error should win
            const lastError = errorMessages.at(-1);
            expect(useErrorStore.getState().lastError).toBe(lastError);
        });

        fcTest.prop([arbitraries.errorMessage])(
            "should handle setting error to undefined",
            (errorMessage) => {
                store = createTestErrorStore();
                // Arrange
                store.setError(errorMessage);
                expect(useErrorStore.getState().lastError).toBe(errorMessage);

                // Act
                store.setError(undefined);

                // Assert
                expect(useErrorStore.getState().lastError).toBeUndefined();
            }
        );

        fcTest.prop([arbitraries.emptyError])(
            "should handle empty error messages",
            (emptyError) => {
                store = createTestErrorStore();
                // Act
                store.setError(emptyError);

                // Assert - empty strings should still be set
                expect(useErrorStore.getState().lastError).toBe(emptyError);
            }
        );
    });

    describe("Global Loading State Management", () => {
        fcTest.prop([arbitraries.loadingState])(
            "should handle global loading state changes",
            (loading) => {
                store = createTestErrorStore();
                // Act
                store.setLoading(loading);

                // Assert
                expect(useErrorStore.getState().isLoading).toBe(loading);
            }
        );

        fcTest.prop([
            fc.array(arbitraries.loadingState, { minLength: 1, maxLength: 20 }),
        ])("should handle rapid loading state changes", (loadingStates) => {
            store = createTestErrorStore();
            // Act - rapidly toggle loading states
            for (const loading of loadingStates) store.setLoading(loading);

            // Assert - last state should win
            const lastLoadingState = loadingStates.at(-1);
            expect(useErrorStore.getState().isLoading).toBe(lastLoadingState);
        });

        fcTest.prop([arbitraries.loadingState, arbitraries.errorMessage])(
            "should handle loading state with error",
            (loading, errorMessage) => {
                store = createTestErrorStore();
                // Act
                store.setLoading(loading);
                store.setError(errorMessage);

                // Assert
                expect(useErrorStore.getState().isLoading).toBe(loading);
                expect(useErrorStore.getState().lastError).toBe(errorMessage);
            }
        );
    });

    describe("Store-Specific Error Management", () => {
        fcTest.prop([arbitraries.storeErrorConfig])(
            "should handle store-specific error setting",
            (config) => {
                store = createTestErrorStore();
                // Act
                store.setStoreError(config.store, config.error ?? undefined);

                // Assert
                const retrievedError = useErrorStore
                    .getState()
                    .getStoreError(config.store);
                expect(retrievedError).toBe(config.error ?? undefined);
                expect(useErrorStore.getState().storeErrors[config.store]).toBe(
                    config.error ?? undefined
                );
            }
        );

        fcTest.prop([arbitraries.storeName, arbitraries.errorMessage])(
            "should handle clearing store-specific errors",
            (storeName, errorMessage) => {
                store = createTestErrorStore();
                // Arrange
                store.setStoreError(storeName, errorMessage);
                expect(store.getStoreError(storeName)).toBe(errorMessage);

                // Act
                store.clearStoreError(storeName);

                // Assert
                expect(store.getStoreError(storeName)).toBeUndefined();
                expect(
                    useErrorStore.getState().storeErrors[storeName]
                ).toBeUndefined();
            }
        );

        fcTest.prop([arbitraries.multipleStoreErrors])(
            "should handle multiple store errors simultaneously",
            (storeErrors) => {
                store = createTestErrorStore();
                // Act
                for (const config of storeErrors) {
                    store.setStoreError(
                        config.store,
                        config.error ?? undefined
                    );
                }

                // Assert - build expected final state (last wins for each store)
                const expectedFinalState = new Map<
                    string,
                    string | undefined
                >();
                for (const config of storeErrors) {
                    expectedFinalState.set(
                        config.store,
                        config.error ?? undefined
                    );
                }

                for (const [storeName, expectedError] of expectedFinalState) {
                    const retrievedError = useErrorStore
                        .getState()
                        .getStoreError(storeName);
                    expect(retrievedError).toBe(expectedError);
                }
            }
        );

        fcTest.prop([
            arbitraries.storeName,
            fc.array(arbitraries.errorMessage, { minLength: 1, maxLength: 5 }),
        ])(
            "should handle rapid store error updates",
            (storeName, errorMessages) => {
                store = createTestErrorStore();
                // Act - rapidly update store errors
                for (const error of errorMessages) store.setStoreError(storeName, error)
                ;

                // Assert - last error should win
                const lastError = errorMessages.at(-1);
                expect(store.getStoreError(storeName)).toBe(lastError);
            }
        );

        fcTest.prop([arbitraries.storeName])(
            "should handle getting non-existent store errors",
            (storeName) => {
                store = createTestErrorStore();
                // Ensure store is clean
                store.clearStoreError(storeName);

                // Act & Assert
                const error = store.getStoreError(storeName);
                expect(error).toBeUndefined();
            }
        );
    });

    describe("Operation Loading State Management", () => {
        fcTest.prop([arbitraries.operationLoadingConfig])(
            "should handle operation loading state setting",
            (config) => {
                store = createTestErrorStore();
                // Act
                store.setOperationLoading(config.operation, config.loading);

                // Assert
                const retrievedLoading = useErrorStore
                    .getState()
                    .getOperationLoading(config.operation);
                expect(retrievedLoading).toBe(config.loading);
                expect(
                    useErrorStore.getState().operationLoading[config.operation]
                ).toBe(config.loading);
            }
        );

        fcTest.prop([arbitraries.multipleOperationLoadings])(
            "should handle multiple operation loadings simultaneously",
            (operationLoadings) => {
                store = createTestErrorStore();
                // Act
                for (const config of operationLoadings) {
                    store.setOperationLoading(config.operation, config.loading);
                }

                // Assert - build expected final state (last wins for each operation)
                const expectedFinalState = new Map<string, boolean>();
                for (const config of operationLoadings) {
                    expectedFinalState.set(config.operation, config.loading);
                }

                for (const [
                    operationName,
                    expectedLoading,
                ] of expectedFinalState) {
                    const retrievedLoading = useErrorStore
                        .getState()
                        .getOperationLoading(operationName);
                    expect(retrievedLoading).toBe(expectedLoading);
                }
            }
        );

        fcTest.prop([
            arbitraries.operationName,
            fc.array(arbitraries.loadingState, { minLength: 1, maxLength: 10 }),
        ])(
            "should handle rapid operation loading updates",
            (operationName, loadingStates) => {
                store = createTestErrorStore();
                // Act - rapidly update operation loading
                for (const loading of loadingStates) store.setOperationLoading(operationName, loading)
                ;

                // Assert - last state should win
                const lastLoadingState =
                    loadingStates.at(-1);
                expect(store.getOperationLoading(operationName)).toBe(
                    lastLoadingState
                );
            }
        );

        fcTest.prop([arbitraries.operationName])(
            "should handle getting non-existent operation loading",
            (operationName) => {
                store = createTestErrorStore();
                // Ensure operation is not set
                expect(
                    useErrorStore.getState().operationLoading[operationName]
                ).toBeUndefined();

                // Act & Assert - should return false for non-existent operations
                const loading = store.getOperationLoading(operationName);
                expect(loading).toBeFalsy();
            }
        );

        fcTest.prop([arbitraries.operationName, arbitraries.loadingState])(
            "should handle operation loading state transitions",
            (operationName, targetState) => {
                store = createTestErrorStore();
                // Arrange - set opposite state
                store.setOperationLoading(operationName, !targetState);
                expect(store.getOperationLoading(operationName)).toBe(
                    !targetState
                );

                // Act - transition to target state
                store.setOperationLoading(operationName, targetState);

                // Assert
                expect(store.getOperationLoading(operationName)).toBe(
                    targetState
                );
            }
        );
    });

    describe("Clear All Errors Functionality", () => {
        fcTest.prop([
            arbitraries.errorMessage,
            arbitraries.multipleStoreErrors,
            arbitraries.multipleOperationLoadings,
            arbitraries.loadingState,
        ])(
            "should clear all errors and states",
            (globalError, storeErrors, operationLoadings, globalLoading) => {
                store = createTestErrorStore();
                // Arrange - set up complex error state
                store.setError(globalError);
                store.setLoading(globalLoading);
                for (const config of storeErrors) {
                    store.setStoreError(
                        config.store,
                        config.error ?? undefined
                    );
                }
                for (const config of operationLoadings) {
                    store.setOperationLoading(config.operation, config.loading);
                }

                // Verify state is set
                expect(useErrorStore.getState().lastError).toBe(globalError);
                expect(useErrorStore.getState().isLoading).toBe(globalLoading);

                // Act
                store.clearAllErrors();

                // Assert - all errors should be cleared
                expect(useErrorStore.getState().lastError).toBeUndefined();
                expect(useErrorStore.getState().isLoading).toBeFalsy();

                // Store errors should be cleared
                for (const config of storeErrors) {
                    expect(store.getStoreError(config.store)).toBeUndefined();
                }

                // Operation loadings should be cleared
                for (const config of operationLoadings) {
                    expect(store.getOperationLoading(config.operation)).toBeFalsy(
                        
                    );
                }
            }
        );

        fcTest.prop([arbitraries.multipleStoreErrors])(
            "should handle clearing empty error state",
            (storeErrors) => {
                store = createTestErrorStore();
                // Ensure clean state
                store.clearAllErrors();

                // Act - clear again should not crash
                expect(() => store.clearAllErrors()).not.toThrow();

                // Assert - state should remain clean
                expect(useErrorStore.getState().lastError).toBeUndefined();
                expect(useErrorStore.getState().isLoading).toBeFalsy();
                expect(
                    Object.keys(useErrorStore.getState().storeErrors)
                ).toHaveLength(0);
                expect(
                    Object.keys(useErrorStore.getState().operationLoading)
                ).toHaveLength(0);
            }
        );
    });

    describe("Complex State Interactions", () => {
        fcTest.prop([
            arbitraries.errorMessage,
            arbitraries.storeName,
            arbitraries.errorMessage,
            arbitraries.operationName,
            arbitraries.loadingState,
        ])(
            "should handle complex state combinations",
            (globalError, storeName, storeError, operationName, loading) => {
                store = createTestErrorStore();
                // Act - set complex state combination
                store.setError(globalError);
                store.setStoreError(storeName, storeError);
                store.setOperationLoading(operationName, loading);
                store.setLoading(loading);

                // Assert - all state should be consistent
                expect(useErrorStore.getState().lastError).toBe(globalError);
                expect(store.getStoreError(storeName)).toBe(storeError);
                expect(store.getOperationLoading(operationName)).toBe(loading);
                expect(useErrorStore.getState().isLoading).toBe(loading);
            }
        );

        fcTest.prop([
            fc.array(arbitraries.storeErrorConfig, {
                minLength: 1,
                maxLength: 5,
            }),
            fc.array(arbitraries.operationLoadingConfig, {
                minLength: 1,
                maxLength: 5,
            }),
        ])(
            "should handle mixed store errors and operation loadings",
            (storeConfigs, operationConfigs) => {
                store = createTestErrorStore();
                // Act - interleave store errors and operation loadings
                for (
                    let i = 0;
                    i < Math.max(storeConfigs.length, operationConfigs.length);
                    i++
                ) {
                    if (i < storeConfigs.length) {
                        const config = storeConfigs[i];
                        store.setStoreError(
                            config.store,
                            config.error ?? undefined
                        );
                    }
                    if (i < operationConfigs.length) {
                        const config = operationConfigs[i];
                        store.setOperationLoading(
                            config.operation,
                            config.loading
                        );
                    }
                }

                // Assert - build expected final states (last wins for each store/operation)
                const expectedStoreErrors = new Map<
                    string,
                    string | undefined
                >();
                for (const config of storeConfigs) {
                    expectedStoreErrors.set(
                        config.store,
                        config.error ?? undefined
                    );
                }

                const expectedOperationLoadings = new Map<string, boolean>();
                for (const config of operationConfigs) {
                    expectedOperationLoadings.set(
                        config.operation,
                        config.loading
                    );
                }

                for (const [storeName, expectedError] of expectedStoreErrors) {
                    expect(store.getStoreError(storeName)).toBe(expectedError);
                }
                for (const [
                    operationName,
                    expectedLoading,
                ] of expectedOperationLoadings) {
                    expect(store.getOperationLoading(operationName)).toBe(
                        expectedLoading
                    );
                }
            }
        );
    });

    describe("Concurrent Operations", () => {
        fcTest.prop([
            fc.array(arbitraries.errorMessage, { minLength: 2, maxLength: 10 }),
        ])("should handle concurrent global error updates", (errorMessages) => {
            store = createTestErrorStore();
            // Act - set all errors rapidly
            for (const error of errorMessages) store.setError(error);

            // Assert - final error should be set
            const finalError = errorMessages.at(-1);
            expect(useErrorStore.getState().lastError).toBe(finalError);
        });

        fcTest.prop([
            arbitraries.storeName,
            fc.array(arbitraries.errorMessage, { minLength: 2, maxLength: 5 }),
            arbitraries.operationName,
            fc.array(arbitraries.loadingState, { minLength: 2, maxLength: 5 }),
        ])(
            "should handle concurrent store and operation updates",
            (storeName, storeErrors, operationName, loadingStates) => {
                store = createTestErrorStore();
                // Act - interleave store error and operation loading updates
                for (
                    let i = 0;
                    i < Math.max(storeErrors.length, loadingStates.length);
                    i++
                ) {
                    if (i < storeErrors.length) {
                        store.setStoreError(storeName, storeErrors[i]);
                    }
                    if (i < loadingStates.length) {
                        store.setOperationLoading(
                            operationName,
                            loadingStates[i]
                        );
                    }
                }

                // Assert - final states should be set
                const finalStoreError = storeErrors.at(-1);
                const finalLoadingState =
                    loadingStates.at(-1);

                expect(store.getStoreError(storeName)).toBe(finalStoreError);
                expect(store.getOperationLoading(operationName)).toBe(
                    finalLoadingState
                );
            }
        );
    });

    describe("Edge Cases and Error Scenarios", () => {
        fcTest.prop([arbitraries.storeName])(
            "should handle undefined store error setting",
            (storeName) => {
                store = createTestErrorStore();
                // Act
                store.setStoreError(storeName, undefined);

                // Assert
                expect(store.getStoreError(storeName)).toBeUndefined();
            }
        );

        fcTest.prop([fc.string({ minLength: 0, maxLength: 1000 })])(
            "should handle very long error messages",
            (longError) => {
                store = createTestErrorStore();
                // Act
                store.setError(longError);

                // Assert
                expect(useErrorStore.getState().lastError).toBe(longError);
            }
        );

        fcTest.prop([arbitraries.operationName])(
            "should handle operation loading state consistency",
            (operationName) => {
                store = createTestErrorStore();
                // Act - set to true then false
                store.setOperationLoading(operationName, true);
                expect(store.getOperationLoading(operationName)).toBeTruthy();

                store.setOperationLoading(operationName, false);
                expect(store.getOperationLoading(operationName)).toBeFalsy();
            }
        );

        fcTest.prop([
            fc.array(arbitraries.multipleStoreErrors, {
                minLength: 1,
                maxLength: 5,
            }),
        ])("should handle rapid clear all operations", (storeErrorArrays) => {
            store = createTestErrorStore();
            // Act - set errors then clear rapidly
            for (const storeErrors of storeErrorArrays) {
                for (const config of storeErrors) {
                    store.setStoreError(
                        config.store,
                        config.error ?? undefined
                    );
                }
                store.clearAllErrors();
            }

            // Assert - store should be clean
            expect(useErrorStore.getState().lastError).toBeUndefined();
            expect(useErrorStore.getState().isLoading).toBeFalsy();
            expect(
                Object.keys(useErrorStore.getState().storeErrors)
            ).toHaveLength(0);
            expect(
                Object.keys(useErrorStore.getState().operationLoading)
            ).toHaveLength(0);
        });
    });

    describe("State Invariants", () => {
        fcTest.prop([
            arbitraries.errorMessage,
            arbitraries.loadingState,
            arbitraries.multipleStoreErrors,
            arbitraries.multipleOperationLoadings,
        ])(
            "should maintain state type consistency",
            (globalError, globalLoading, storeErrors, operationLoadings) => {
                store = createTestErrorStore();
                // Act
                store.setError(globalError);
                store.setLoading(globalLoading);
                for (const config of storeErrors) {
                    store.setStoreError(
                        config.store,
                        config.error ?? undefined
                    );
                }
                for (const config of operationLoadings) {
                    store.setOperationLoading(config.operation, config.loading);
                }

                // Assert invariants
                expect(
                    typeof store.lastError === "string" ||
                        store.lastError === undefined
                ).toBeTruthy();
                expect(typeof store.isLoading).toBe("boolean");
                expect(typeof store.storeErrors).toBe("object");
                expect(typeof store.operationLoading).toBe("object");

                // Store errors should all be strings or undefined
                for (const error of Object.values(store.storeErrors)) {
                    expect(
                        typeof error === "string" || error === undefined
                    ).toBeTruthy();
                }

                // Operation loadings should all be booleans
                for (const loading of Object.values(store.operationLoading)) {
                    expect(typeof loading).toBe("boolean");
                }
            }
        );

        fcTest.prop([arbitraries.multipleStoreErrors])(
            "should maintain store error isolation",
            (storeErrors) => {
                store = createTestErrorStore();
                // Arrange - ensure fresh state for each property test execution
                store = createTestErrorStore();

                // Act
                for (const config of storeErrors) {
                    store.setStoreError(
                        config.store,
                        config.error ?? undefined
                    );
                }

                // Build expected final state (last wins for each store)
                const expectedFinalState = new Map<
                    string,
                    string | undefined
                >();
                for (const config of storeErrors) {
                    expectedFinalState.set(
                        config.store,
                        config.error ?? undefined
                    );
                }

                // Assert - each store error should be isolated
                const allStoreNames = [
                    "sites",
                    "ui",
                    "settings",
                    "monitors",
                    "analytics",
                    "sync",
                    "auth",
                    "cache",
                ];

                for (const storeName of allStoreNames) {
                    const retrievedError = useErrorStore
                        .getState()
                        .getStoreError(storeName);
                    const expectedError = expectedFinalState.get(storeName);

                    if (expectedFinalState.has(storeName)) {
                        expect(retrievedError).toBe(expectedError);
                    } else {
                        expect(retrievedError).toBeUndefined();
                    }
                }
            }
        );

        fcTest.prop([arbitraries.multipleOperationLoadings])(
            "should maintain operation loading isolation",
            (operationLoadings) => {
                store = createTestErrorStore();
                // Act
                for (const config of operationLoadings) {
                    store.setOperationLoading(config.operation, config.loading);
                }

                // Build expected final state (last wins for each operation)
                const expectedFinalState = new Map<string, boolean>();
                for (const config of operationLoadings) {
                    expectedFinalState.set(config.operation, config.loading);
                }

                // Assert - each operation loading should be isolated
                for (const [
                    operationName,
                    expectedLoading,
                ] of expectedFinalState) {
                    const retrievedLoading = useErrorStore
                        .getState()
                        .getOperationLoading(operationName);
                    expect(retrievedLoading).toBe(expectedLoading);
                }

                // Non-existent operations should return false
                const nonExistentOperation = "nonExistentOperation";
                expect(
                    store.getOperationLoading(nonExistentOperation)
                ).toBeFalsy();
            }
        );
    });
});
