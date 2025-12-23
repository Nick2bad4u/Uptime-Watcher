/**
 * Comprehensive tests for useErrorStore. Ensures complete coverage of error
 * management functionality.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useErrorStore } from "../../../stores/error/useErrorStore";

// Mock the shared utils
vi.mock("../../../stores/shared/utils", () => ({
    logStoreAction: vi.fn(),
}));

describe(useErrorStore, () => {
    beforeEach(() => {
        // Reset store state before each test
        const store = useErrorStore.getState();
        act(() => {
            // Ensure complete state reset
            store.clearAllErrors();
            store.setLoading(false);

            // Clear all operation loading states by setting them to false
            const currentOperations = Object.keys(store.operationLoading);
            for (const operation of currentOperations) {
                store.setOperationLoading(operation, false);
            }

            // Double-check that the state is clean
            const finalState = useErrorStore.getState();
            if (
                finalState.lastError !== undefined ||
                finalState.isLoading !== false ||
                Object.keys(finalState.storeErrors).length > 0 ||
                Object.values(finalState.operationLoading).includes(true)
            ) {
                // Force a complete reset if the standard clear didn't work
                useErrorStore.setState({
                    isLoading: false,
                    lastError: undefined,
                    operationLoading: {},
                    storeErrors: {},
                });
            }
        });
        vi.clearAllMocks();
    });

    describe("Basic Error Management", () => {
        it("should initialize with no errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() => useErrorStore());
            expect(result.current.lastError).toBeUndefined();
            expect(result.current.storeErrors).toEqual({});
            expect(result.current.isLoading).toBeFalsy();
        });

        it("should set and get global error", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());
            const errorMessage = "Test error message";

            act(() => {
                result.current.setError(errorMessage);
            });

            expect(result.current.lastError).toBe(errorMessage);
        });

        it("should clear global error", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());
            const errorMessage = "Test error message";

            act(() => {
                result.current.setError(errorMessage);
            });
            expect(result.current.lastError).toBe(errorMessage);

            act(() => {
                result.current.clearError();
            });
            expect(result.current.lastError).toBeUndefined();
        });

        it("should handle undefined errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError(undefined);
            });

            expect(result.current.lastError).toBeUndefined();
        });

        it("should handle empty string errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError("");
            });

            expect(result.current.lastError).toBe("");
        });
    });

    describe("Store-Specific Error Management", () => {
        it("should set store-specific errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());
            const errorMessage = "Sites store error";

            act(() => {
                result.current.setStoreError("sites", errorMessage);
            });

            expect(result.current.storeErrors["sites"]).toBe(errorMessage);
        });

        it("should get store-specific errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());
            const errorMessage = "Sites store error";

            act(() => {
                result.current.setStoreError("sites", errorMessage);
            });

            const sitesError = result.current.getStoreError("sites");
            expect(sitesError).toBe(errorMessage);
        });

        it("should return undefined for non-existent store errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());
            const error = result.current.getStoreError("nonexistent");
            expect(error).toBeUndefined();
        });

        it("should clear specific store errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setStoreError("sites", "Sites error");
                result.current.setStoreError("monitors", "Monitors error");
            });

            expect(result.current.storeErrors["sites"]).toBe("Sites error");
            expect(result.current.storeErrors["monitors"]).toBe(
                "Monitors error"
            );

            act(() => {
                result.current.clearStoreError("sites");
            });

            expect(result.current.storeErrors["sites"]).toBeUndefined();
            expect(result.current.storeErrors["monitors"]).toBe(
                "Monitors error"
            );
        });

        it("should handle multiple store errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setStoreError("sites", "Sites error");
                result.current.setStoreError("monitors", "Monitors error");
                result.current.setStoreError("settings", "Settings error");
            });

            expect(result.current.storeErrors["sites"]).toBe("Sites error");
            expect(result.current.storeErrors["monitors"]).toBe(
                "Monitors error"
            );
            expect(result.current.storeErrors["settings"]).toBe(
                "Settings error"
            );
        });

        it("should handle store error keys with special characters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setStoreError(
                    "store-with-dashes",
                    "Error message"
                );
                result.current.setStoreError(
                    "store_with_underscores",
                    "Another error"
                );
                result.current.setStoreError(
                    "store.with.dots",
                    "Yet another error"
                );
            });

            expect(result.current.getStoreError("store-with-dashes")).toBe(
                "Error message"
            );
            expect(result.current.getStoreError("store_with_underscores")).toBe(
                "Another error"
            );
            expect(result.current.getStoreError("store.with.dots")).toBe(
                "Yet another error"
            );
        });
    });

    describe("Loading State Management", () => {
        it("should set global loading state", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setLoading(true);
            });

            expect(result.current.isLoading).toBeTruthy();

            act(() => {
                result.current.setLoading(false);
            });

            expect(result.current.isLoading).toBeFalsy();
        });

        it("should set operation loading state", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setOperationLoading("fetchSites", true);
            });

            expect(
                result.current.getOperationLoading("fetchSites")
            ).toBeTruthy();
        });

        it("should get operation loading state", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            const { result } = renderHook(() => useErrorStore());

            expect(
                result.current.getOperationLoading("fetchSites")
            ).toBeFalsy();

            act(() => {
                result.current.setOperationLoading("fetchSites", true);
            });

            expect(
                result.current.getOperationLoading("fetchSites")
            ).toBeTruthy();
        });

        it("should handle multiple operations", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setOperationLoading("fetchSites", true);
                result.current.setOperationLoading("saveSite", true);
                result.current.setOperationLoading("deleteSite", false);
            });

            expect(
                result.current.getOperationLoading("fetchSites")
            ).toBeTruthy();
            expect(result.current.getOperationLoading("saveSite")).toBeTruthy();
            expect(
                result.current.getOperationLoading("deleteSite")
            ).toBeFalsy();
        });

        it("should handle operation keys with special characters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setOperationLoading(
                    "operation-with-dashes",
                    true
                );
                result.current.setOperationLoading(
                    "operation_with_underscores",
                    true
                );
                result.current.setOperationLoading("operation.with.dots", true);
            });

            expect(
                result.current.getOperationLoading("operation-with-dashes")
            ).toBeTruthy();
            expect(
                result.current.getOperationLoading("operation_with_underscores")
            ).toBeTruthy();
            expect(
                result.current.getOperationLoading("operation.with.dots")
            ).toBeTruthy();
        });
    });

    describe("Combined Error and Loading Management", () => {
        it("should clear all errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError("Global error");
                result.current.setStoreError("sites", "Sites error");
            });

            expect(result.current.lastError).toBe("Global error");
            expect(result.current.storeErrors["sites"]).toBe("Sites error");

            act(() => {
                result.current.clearAllErrors();
            });

            expect(result.current.lastError).toBeUndefined();
            expect(result.current.storeErrors).toEqual({});
        });

        it("should maintain separate state for errors and loading", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setStoreError("sites", "Sites error");
                result.current.setOperationLoading("fetchSites", true);
            });

            act(() => {
                result.current.clearStoreError("sites");
            });

            expect(result.current.storeErrors["sites"]).toBeUndefined();
            expect(
                result.current.getOperationLoading("fetchSites")
            ).toBeTruthy();
        });

        it("should handle simultaneous error and loading state changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError("Global error");
                result.current.setStoreError("sites", "Sites error");
                result.current.setStoreError("monitors", "Monitors error");
                result.current.setOperationLoading("fetchSites", true);
                result.current.setOperationLoading("saveMonitor", true);
                result.current.setLoading(true);
            });

            expect(result.current.lastError).toBe("Global error");
            expect(result.current.storeErrors["sites"]).toBe("Sites error");
            expect(result.current.storeErrors["monitors"]).toBe(
                "Monitors error"
            );
            expect(
                result.current.getOperationLoading("fetchSites")
            ).toBeTruthy();
            expect(
                result.current.getOperationLoading("saveMonitor")
            ).toBeTruthy();
            expect(result.current.isLoading).toBeTruthy();
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle setting the same error multiple times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());
            const errorMessage = "Same error";

            act(() => {
                result.current.setError(errorMessage);
            });
            expect(result.current.lastError).toBe(errorMessage);

            act(() => {
                result.current.setError(errorMessage);
            });
            expect(result.current.lastError).toBe(errorMessage);
        });

        it("should handle whitespace-only string errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError("   ");
            });

            expect(result.current.lastError).toBe("   ");
        });

        it("should handle overwriting store errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setStoreError("sites", "First error");
            });
            expect(result.current.getStoreError("sites")).toBe("First error");

            act(() => {
                result.current.setStoreError("sites", "Second error");
            });
            expect(result.current.getStoreError("sites")).toBe("Second error");
        });

        it("should handle toggling operation loading states", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setOperationLoading("toggle-operation", true);
            });
            expect(
                result.current.getOperationLoading("toggle-operation")
            ).toBeTruthy();

            act(() => {
                result.current.setOperationLoading("toggle-operation", false);
            });
            expect(
                result.current.getOperationLoading("toggle-operation")
            ).toBeFalsy();

            act(() => {
                result.current.setOperationLoading("toggle-operation", true);
            });
            expect(
                result.current.getOperationLoading("toggle-operation")
            ).toBeTruthy();
        });

        it("should handle undefined store errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setStoreError("sites", undefined);
            });

            expect(result.current.getStoreError("sites")).toBeUndefined();
        });
    });

    describe("State Persistence and Reactivity", () => {
        it("should maintain state across multiple hook instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result: result1 } = renderHook(() => useErrorStore());
            const { result: result2 } = renderHook(() => useErrorStore());

            act(() => {
                result1.current.setError("Shared error");
            });

            expect(result2.current.lastError).toBe("Shared error");
        });

        it("should maintain loading states across hook instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            // Ensure clean state for this test
            act(() => {
                useErrorStore.getState().clearAllErrors();
            });

            const { result: result1, rerender: rerender1 } = renderHook(() =>
                useErrorStore()
            );
            const { result: result2, rerender: rerender2 } = renderHook(() =>
                useErrorStore()
            );

            // Verify initial state is clean
            expect(
                result1.current.getOperationLoading("shared-operation")
            ).toBeFalsy();
            expect(
                result2.current.getOperationLoading("shared-operation")
            ).toBeFalsy();

            act(() => {
                result1.current.setOperationLoading("shared-operation", true);
            });

            // Force re-renders to ensure both hooks see the updated state
            rerender1();
            rerender2();

            // Now both hooks should see the shared state
            expect(
                result2.current.getOperationLoading("shared-operation")
            ).toBeTruthy();

            // Also verify that the first hook still sees the state
            expect(
                result1.current.getOperationLoading("shared-operation")
            ).toBeTruthy();
        });

        it("should react to state changes", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useErrorStore());

            expect(result.current.isLoading).toBeFalsy();

            act(() => {
                result.current.setLoading(true);
            });

            expect(result.current.isLoading).toBeTruthy();
        });
    });

    describe("Complex Scenarios", () => {
        it("should handle clearing operations while maintaining errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError("Persistent error");
                result.current.setStoreError("sites", "Sites error");
                result.current.setOperationLoading("fetchSites", true);
            });

            // Clear operation loading by setting to false
            act(() => {
                result.current.setOperationLoading("fetchSites", false);
            });

            expect(result.current.lastError).toBe("Persistent error");
            expect(result.current.storeErrors["sites"]).toBe("Sites error");
            expect(
                result.current.getOperationLoading("fetchSites")
            ).toBeFalsy();
        });

        it("should handle clearing errors while maintaining loading states", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError("Temporary error");
                result.current.setStoreError("sites", "Sites error");
                result.current.setOperationLoading("fetchSites", true);
            });

            act(() => {
                result.current.clearAllErrors();
            });

            // Debug: Verify the operation loading is preserved
            const operationLoading =
                result.current.getOperationLoading("fetchSites");
            console.log(
                "Operation loading after clearAllErrors:",
                operationLoading
            );

            expect(result.current.lastError).toBeUndefined();
            expect(result.current.storeErrors).toEqual({});
            expect(operationLoading).toBeTruthy();
        });

        it("should handle complex state transitions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useErrorStore());

            // Set initial state
            act(() => {
                result.current.setError("Initial error");
                result.current.setStoreError("sites", "Sites error");
                result.current.setOperationLoading("fetchSites", true);
                result.current.setLoading(true);
            });

            // Clear specific error
            act(() => {
                result.current.clearStoreError("sites");
            });

            // Set new error
            act(() => {
                result.current.setStoreError("monitors", "Monitors error");
            });

            // Clear global error
            act(() => {
                result.current.clearError();
            });

            expect(result.current.lastError).toBeUndefined();
            expect(result.current.storeErrors["sites"]).toBeUndefined();
            expect(result.current.storeErrors["monitors"]).toBe(
                "Monitors error"
            );
            expect(
                result.current.getOperationLoading("fetchSites")
            ).toBeTruthy();
            expect(result.current.isLoading).toBeTruthy();
        });
    });
});
