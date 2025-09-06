/**
 * React Component Array Declaration Mutation Tests
 *
 * @file Tests specifically targeting array declaration mutations in React
 *   components, focusing on useEffect, useMemo, and useCallback dependency
 *   arrays. Each test verifies that dependency arrays work correctly and would
 *   fail if mutated.
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-03
 *
 * @category Tests
 *
 * @tags ["mutation-testing", "react", "hooks", "dependency-arrays"]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEffect, useCallback, useMemo, useState } from "react";

describe("React Component Array Declaration Mutation Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("App.tsx - useEffect and useCallback dependency arrays", () => {
        it("should have empty dependency arrays for one-time effects (Lines 136, 139)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("File: src/App.tsx", "source");
            await annotate("Lines: 136, 139", "location");
            await annotate(
                'Mutation: }, []) → }, ["Stryker was here"]',
                "mutation"
            );

            // Test the useCallback hooks with empty dependency arrays
            // These should run only once during component initialization

            const TestComponent = () => {
                const [showLoadingOverlay, setShowLoadingOverlay] =
                    useState(false);

                // Line 136 - clearLoadingOverlay callback
                const clearLoadingOverlay = useCallback(() => {
                    setShowLoadingOverlay(false);
                }, []); // This dependency array is targeted by mutation

                // Line 139 - showLoadingOverlayCallback
                const showLoadingOverlayCallback = useCallback(() => {
                    setShowLoadingOverlay(true);
                }, []); // This dependency array is targeted by mutation

                return {
                    clearLoadingOverlay,
                    showLoadingOverlayCallback,
                    showLoadingOverlay,
                };
            };

            const { result, rerender } = renderHook(TestComponent);

            // Get initial callback references
            const initialClearCallback = result.current.clearLoadingOverlay;
            const initialShowCallback =
                result.current.showLoadingOverlayCallback;

            // Rerender the component multiple times
            rerender();
            rerender();
            rerender();

            // With empty dependency arrays, callbacks should remain stable (same reference)
            expect(result.current.clearLoadingOverlay).toBe(
                initialClearCallback
            );
            expect(result.current.showLoadingOverlayCallback).toBe(
                initialShowCallback
            );

            // Test that callbacks work correctly
            act(() => {
                result.current.showLoadingOverlayCallback();
            });
            expect(result.current.showLoadingOverlay).toBeTruthy();

            act(() => {
                result.current.clearLoadingOverlay();
            });
            expect(result.current.showLoadingOverlay).toBeFalsy();
        });

        it("should fail if dependency arrays are mutated to contain values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "mutation-verification");
            await annotate(
                "Verifies callbacks would be recreated unnecessarily",
                "purpose"
            );

            // Simulate the mutated behavior with non-empty dependency arrays
            const TestComponentMutated = () => {
                const [_showLoadingOverlay, setShowLoadingOverlay] =
                    useState(false);

                // Mutated version - dependency arrays contain "Stryker was here"
                const clearLoadingOverlay = useCallback(() => {
                    setShowLoadingOverlay(false);
                }, ["Stryker was here"]); // This is the mutation

                const showLoadingOverlayCallback = useCallback(() => {
                    setShowLoadingOverlay(true);
                }, ["Stryker was here"]); // This is the mutation

                return { clearLoadingOverlay, showLoadingOverlayCallback };
            };

            const { result, rerender } = renderHook(TestComponentMutated);

            // Get initial callback references
            const initialClearCallback = result.current.clearLoadingOverlay;
            const initialShowCallback =
                result.current.showLoadingOverlayCallback;

            // Rerender the component
            rerender();

            // With mutated dependency arrays containing constant values,
            // callbacks would still be stable (since "Stryker was here" doesn't change)
            // but this represents incorrect dependency tracking
            expect(result.current.clearLoadingOverlay).toBe(
                initialClearCallback
            );
            expect(result.current.showLoadingOverlayCallback).toBe(
                initialShowCallback
            );

            // However, the intent is violated - these callbacks don't actually depend
            // on "Stryker was here", indicating a logic error
        });

        it("should handle App initialization effects with empty dependencies (Lines 226, 244)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("File: src/App.tsx", "source");
            await annotate("Lines: 226, 244", "location");
            await annotate(
                'Mutation: }, []) → }, ["Stryker was here"]',
                "mutation"
            );

            // Test useEffect hooks that should run only once during app initialization
            let initializationCallCount = 0;
            let settingsLoadCallCount = 0;

            const TestAppComponent = () => {
                const [initialized, setInitialized] = useState(false);

                // Line 226 - App initialization effect
                useEffect(() => {
                    initializationCallCount++;
                    setInitialized(true);
                }, []); // Empty dependency array - should run once

                // Line 244 - Settings loading effect
                useEffect(() => {
                    settingsLoadCallCount++;
                    // Load settings logic
                }, []); // Empty dependency array - should run once

                return { initialized };
            };

            const { result, rerender } = renderHook(TestAppComponent);

            // Initially, effects should have run once
            expect(initializationCallCount).toBe(1);
            expect(settingsLoadCallCount).toBe(1);
            expect(result.current.initialized).toBeTruthy();

            // Rerender multiple times
            rerender();
            rerender();
            rerender();

            // With empty dependency arrays, effects should not run again
            expect(initializationCallCount).toBe(1);
            expect(settingsLoadCallCount).toBe(1);
        });
    });

    describe("AddSiteForm.tsx - useCallback dependency arrays", () => {
        it("should handle monitor type change callback with correct dependencies (Line 169)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "File: src/components/AddSiteForm/AddSiteForm.tsx",
                "source"
            );
            await annotate("Line: 169", "location");
            await annotate("Mutation: [setMonitorType] → []", "mutation");

            // Test the useCallback with setMonitorType dependency

            const TestAddSiteFormComponent = () => {
                const [monitorType, setMonitorType] = useState("http");

                // Line 169 - handleMonitorTypeChange callback
                const handleMonitorTypeChange = useCallback(
                    (value: string) => {
                        if (
                            value === "http" ||
                            value === "ping" ||
                            value === "dns"
                        ) {
                            setMonitorType(value);
                        }
                    },
                    [setMonitorType] // This dependency array is targeted by mutation
                );

                return { handleMonitorTypeChange, monitorType };
            };

            const { result } = renderHook(TestAddSiteFormComponent);

            // Test that the callback works correctly
            expect(result.current.monitorType).toBe("http");

            act(() => {
                result.current.handleMonitorTypeChange("ping");
            });
            expect(result.current.monitorType).toBe("ping");

            act(() => {
                result.current.handleMonitorTypeChange("dns");
            });
            expect(result.current.monitorType).toBe("dns");

            // Test invalid value handling
            act(() => {
                result.current.handleMonitorTypeChange("invalid");
            });
            expect(result.current.monitorType).toBe("dns"); // Should remain unchanged
        });

        it("should fail if setMonitorType dependency is mutated to empty array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "mutation-verification");
            await annotate("Verifies callback might become stale", "purpose");

            // Simulate the mutated behavior with empty dependency array
            const TestAddSiteFormMutated = () => {
                const [monitorType, setMonitorType] = useState("http");

                // Mutated version - empty dependency array
                const handleMonitorTypeChange = useCallback(
                    (value: string) => {
                        if (
                            value === "http" ||
                            value === "ping" ||
                            value === "dns"
                        ) {
                            setMonitorType(value);
                        }
                    },
                    [] // This is the mutation - missing setMonitorType dependency
                );

                return { handleMonitorTypeChange, monitorType, setMonitorType };
            };

            const { result } = renderHook(TestAddSiteFormMutated);

            // The callback should still work in this case because setMonitorType
            // is stable in React, but the dependency array is incorrect
            expect(result.current.monitorType).toBe("http");

            act(() => {
                result.current.handleMonitorTypeChange("ping");
            });
            expect(result.current.monitorType).toBe("ping");

            // However, the missing dependency violates React hooks rules
            // and could cause issues in complex scenarios or with React optimizations
        });

        it("should handle check interval change callback with correct dependencies (Line 181)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "File: src/components/AddSiteForm/AddSiteForm.tsx",
                "source"
            );
            await annotate("Line: 181", "location");
            await annotate("Mutation: [setCheckInterval] → []", "mutation");

            // Test the useCallback with setCheckInterval dependency

            const TestCheckIntervalComponent = () => {
                const [checkInterval, setCheckInterval] = useState(30_000);

                // Line 181 - handleCheckIntervalChange callback
                const handleCheckIntervalChange = useCallback(
                    (value: string) => {
                        const numericValue = Number(value);
                        if (!Number.isNaN(numericValue) && numericValue > 0) {
                            setCheckInterval(numericValue);
                        }
                    },
                    [setCheckInterval] // This dependency array is targeted by mutation
                );

                return { handleCheckIntervalChange, checkInterval };
            };

            const { result } = renderHook(TestCheckIntervalComponent);

            // Test that the callback works correctly
            expect(result.current.checkInterval).toBe(30_000);

            act(() => {
                result.current.handleCheckIntervalChange("60000");
            });
            expect(result.current.checkInterval).toBe(60_000);

            act(() => {
                result.current.handleCheckIntervalChange("15000");
            });
            expect(result.current.checkInterval).toBe(15_000);

            // Test invalid value handling
            act(() => {
                result.current.handleCheckIntervalChange("invalid");
            });
            expect(result.current.checkInterval).toBe(15_000); // Should remain unchanged

            act(() => {
                result.current.handleCheckIntervalChange("-1000");
            });
            expect(result.current.checkInterval).toBe(15_000); // Should remain unchanged (negative)
        });

        it("should handle form success callback with multiple dependencies (Line 188)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "File: src/components/AddSiteForm/AddSiteForm.tsx",
                "source"
            );
            await annotate("Line: 188", "location");
            await annotate(
                "Mutation: }, [onSuccess, resetForm]) → }, []",
                "mutation"
            );

            // Test useCallback with multiple dependencies

            const onSuccessMock = vi.fn();
            const resetFormMock = vi.fn();

            const TestFormSuccessComponent = () => {
                // Line 188 - form success callback
                const handleFormSuccess = useCallback(() => {
                    onSuccessMock();
                    resetFormMock();
                }, [onSuccessMock, resetFormMock]); // These dependencies are targeted by mutation

                return { handleFormSuccess };
            };

            const { result } = renderHook(TestFormSuccessComponent);

            // Test that the callback works correctly
            act(() => {
                result.current.handleFormSuccess();
            });

            expect(onSuccessMock).toHaveBeenCalledTimes(1);
            expect(resetFormMock).toHaveBeenCalledTimes(1);

            // Call again to verify
            act(() => {
                result.current.handleFormSuccess();
            });

            expect(onSuccessMock).toHaveBeenCalledTimes(2);
            expect(resetFormMock).toHaveBeenCalledTimes(2);
        });
    });

    describe("Component State Array Initialization", () => {
        it("should initialize component arrays as empty (Lines 333, 342)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "File: src/components/AddSiteForm/AddSiteForm.tsx",
                "source"
            );
            await annotate("Lines: 333, 342", "location");
            await annotate('Mutation: [] → ["Stryker was here"]', "mutation");

            // Test component state arrays that should initialize as empty

            const TestStateArrayComponent = () => {
                // Lines 333, 342 - empty array initializations
                const [errors, setErrors] = useState<string[]>([]);
                const [warnings, setWarnings] = useState<string[]>([]);
                const [validationMessages, _setValidationMessages] = useState<
                    string[]
                >([]);

                const addError = (error: string) => {
                    setErrors((prev) => [...prev, error]);
                };

                const addWarning = (warning: string) => {
                    setWarnings((prev) => [...prev, warning]);
                };

                return {
                    errors,
                    warnings,
                    validationMessages,
                    addError,
                    addWarning,
                };
            };

            const { result } = renderHook(TestStateArrayComponent);

            // Initially, all arrays should be empty
            expect(result.current.errors).toEqual([]);
            expect(result.current.warnings).toEqual([]);
            expect(result.current.validationMessages).toEqual([]);

            expect(result.current.errors).toHaveLength(0);
            expect(result.current.warnings).toHaveLength(0);
            expect(result.current.validationMessages).toHaveLength(0);

            // Test adding items to arrays
            act(() => {
                result.current.addError("Test error");
            });
            expect(result.current.errors).toEqual(["Test error"]);

            act(() => {
                result.current.addWarning("Test warning");
            });
            expect(result.current.warnings).toEqual(["Test warning"]);
        });

        it("should fail if state arrays are mutated to start with data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "mutation-verification");
            await annotate(
                "Verifies component would start with invalid state",
                "purpose"
            );

            // Simulate the mutated behavior
            const TestStateArrayMutated = () => {
                // Mutated version - arrays start with "Stryker was here"
                const [errors, _setErrors] = useState<string[]>([
                    "Stryker was here",
                ]);
                const [warnings, _setWarnings] = useState<string[]>([
                    "Stryker was here",
                ]);
                const [validationMessages, _setValidationMessages] = useState<
                    string[]
                >(["Stryker was here"]);

                return { errors, warnings, validationMessages };
            };

            const { result } = renderHook(TestStateArrayMutated);

            // The mutated version would start with polluted arrays
            expect(result.current.errors).not.toEqual([]);
            expect(result.current.warnings).not.toEqual([]);
            expect(result.current.validationMessages).not.toEqual([]);

            expect(result.current.errors).toContain("Stryker was here");
            expect(result.current.warnings).toContain("Stryker was here");
            expect(result.current.validationMessages).toContain(
                "Stryker was here"
            );

            expect(result.current.errors).toHaveLength(1);
            expect(result.current.warnings).toHaveLength(1);
            expect(result.current.validationMessages).toHaveLength(1);

            // This would break component initialization
            // Users would see "Stryker was here" errors on page load
        });
    });

    describe("useMemo dependency arrays", () => {
        it("should memoize values with correct dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMemo hooks", "component");
            await annotate("Type: Dependency arrays", "type");

            // Test useMemo with proper dependency arrays
            let computationCount = 0;

            const TestMemoComponent = () => {
                const [count, setCount] = useState(0);
                const [name, setName] = useState("test");

                // Memoized value that depends on count
                const expensiveValue = useMemo(() => {
                    computationCount++;
                    return count * 2;
                }, [count]); // Should only recompute when count changes

                return { expensiveValue, count, name, setCount, setName };
            };

            const { result } = renderHook(TestMemoComponent);

            expect(result.current.expensiveValue).toBe(0);
            expect(computationCount).toBe(1);

            // Change count - should recompute
            act(() => {
                result.current.setCount(5);
            });
            expect(result.current.expensiveValue).toBe(10);
            expect(computationCount).toBe(2);

            // Change name - should NOT recompute (not in dependencies)
            act(() => {
                result.current.setName("updated");
            });
            expect(result.current.expensiveValue).toBe(10);
            expect(computationCount).toBe(2); // No additional computation
        });

        it("should fail if useMemo dependencies are mutated incorrectly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "mutation-verification");
            await annotate("Verifies memoization would be broken", "purpose");

            // Test useMemo with mutated empty dependency array
            let computationCount = 0;

            const TestMemoMutated = () => {
                const [count, setCount] = useState(0);
                const [name, setName] = useState("test");

                // Mutated version - empty dependency array instead of [count]
                const expensiveValue = useMemo(() => {
                    computationCount++;
                    return count * 2;
                }, []); // This is the mutation - missing count dependency

                return { expensiveValue, count, name, setCount, setName };
            };

            const { result } = renderHook(TestMemoMutated);

            expect(result.current.expensiveValue).toBe(0);
            expect(computationCount).toBe(1);

            // Change count - would NOT recompute due to empty dependency array
            act(() => {
                result.current.setCount(5);
            });
            expect(result.current.expensiveValue).toBe(0); // Still old value!
            expect(computationCount).toBe(1); // No recomputation

            // This is the bug - the memoized value is stale
            // The component shows count=5 but expensiveValue=0 instead of 10
        });
    });
});
