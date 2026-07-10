/**
 * Comprehensive tests for useErrorStore. Ensures complete coverage of error
 * management functionality.
 */

import { act, renderHook } from "@testing-library/react";
import { objectKeys, objectValues } from "ts-extras";
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
            const currentOperations = objectKeys(store.operationLoading);
            for (const operation of currentOperations) {
                store.setOperationLoading(operation, false);
            }

            // Double-check that the state is clean
            const finalState = useErrorStore.getState();
            if (
                finalState.lastError !== undefined ||
                finalState.isLoading ||
                objectKeys(finalState.storeErrors).length > 0 ||
                objectValues(finalState.operationLoading).includes(true)
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

        it("should sanitize global error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError(
                    `refresh_token=SUPER_SECRET_TOKEN&status=failed\n\t${"x".repeat(1200)}`
                );
            });

            const message = result.current.lastError ?? "";
            expect(message).not.toContain("SUPER_SECRET_TOKEN");
            expect(message).not.toContain("\n");
            expect(message).not.toContain("\t");
            expect(message).toContain("refresh_token=[redacted]&status=failed");
            expect(message.endsWith("...")).toBeTruthy();
            expect(message.length).toBeLessThanOrEqual(1003);
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

        it("should sanitize store-specific errors", async ({
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
                    "sites",
                    `refresh_token=SUPER_SECRET_TOKEN&status=failed\n\t${"x".repeat(1200)}`
                );
            });

            const stored = result.current.storeErrors["sites"] ?? "";
            const retrieved = result.current.getStoreError("sites") ?? "";
            expect(stored).toBe(retrieved);
            expect(retrieved).not.toContain("SUPER_SECRET_TOKEN");
            expect(retrieved).not.toContain("\n");
            expect(retrieved).not.toContain("\t");
            expect(retrieved).toContain(
                "refresh_token=[redacted]&status=failed"
            );
            expect(retrieved.endsWith("...")).toBeTruthy();
            expect(retrieved.length).toBeLessThanOrEqual(1003);
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

        it("should store prototype-named store errors as own entries", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Security: Prototype-named store keys", "security");

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setStoreError("__proto__", "Prototype error");
            });

            expect(
                Object.getPrototypeOf(result.current.storeErrors)
            ).toBeNull();
            expect(Object.hasOwn(result.current.storeErrors, "__proto__")).toBe(
                true
            );
            expect(Reflect.get(result.current.storeErrors, "__proto__")).toBe(
                "Prototype error"
            );
            expect(result.current.getStoreError("__proto__")).toBe(
                "Prototype error"
            );
            expect(Object.hasOwn({}, "__proto__")).toBe(false);
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
            expect(result.current.isLoading).toBeTruthy();
        });

        it("should remain globally loading until all operations finish", () => {
            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setOperationLoading("fetchSites", true);
                result.current.setOperationLoading("saveSite", true);
                result.current.setOperationLoading("fetchSites", false);
            });

            expect(result.current.isLoading).toBeTruthy();

            act(() => {
                result.current.setOperationLoading("saveSite", false);
            });

            expect(result.current.isLoading).toBeFalsy();
        });

        it("should preserve explicit loading while operations settle", () => {
            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setLoading(true);
                result.current.setOperationLoading("fetchSites", true);
                result.current.setOperationLoading("fetchSites", false);
            });

            expect(result.current.isLoading).toBeTruthy();

            act(() => {
                result.current.setLoading(false);
            });

            expect(result.current.isLoading).toBeFalsy();
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

        it("should store inherited-name operation loading keys as own entries", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate(
                "Security: Inherited-name operation keys",
                "security"
            );

            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setOperationLoading("toString", true);
            });

            expect(
                Object.getPrototypeOf(result.current.operationLoading)
            ).toBeNull();
            expect(
                Object.hasOwn(result.current.operationLoading, "toString")
            ).toBe(true);
            expect(result.current.operationLoading["toString"]).toBe(true);
            expect(result.current.getOperationLoading("toString")).toBe(true);
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
                result.current.setError(" ".repeat(3));
            });

            expect(result.current.lastError).toBe(" ".repeat(3));
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

            const isOperationLoading =
                result.current.getOperationLoading("fetchSites");

            expect(result.current.lastError).toBeUndefined();
            expect(result.current.storeErrors).toEqual({});
            expect(isOperationLoading).toBeTruthy();
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
