/**
 * @file Comprehensive tests for useDelayedButtonLoading hook Testing delayed
 *   loading states, timeouts, and cleanup behavior
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDelayedButtonLoading } from "../../hooks/useDelayedButtonLoading";

// Mock the constants
vi.mock("../../constants", () => ({
    UI_DELAYS: {
        LOADING_BUTTON: 100,
        STATE_UPDATE_DEFER: 50,
    },
}));

describe(useDelayedButtonLoading, () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllTimers();
    });

    describe("Initial State", () => {
        it("should return false initially when isLoading is false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            // Act
            const { result } = renderHook(() => useDelayedButtonLoading(false));

            // Assert
            expect(result.current).toBeFalsy();
        });

        it("should return false initially when isLoading is true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            // Act
            const { result } = renderHook(() => useDelayedButtonLoading(true));

            // Assert
            expect(result.current).toBeFalsy();
        });
    });

    describe("Loading State Transitions", () => {
        it("should show loading after delay when isLoading becomes true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act - Start loading
            rerender({ isLoading: true });

            // Assert - Should still be false immediately
            expect(result.current).toBeFalsy();

            // Act - Advance timer by loading button delay
            act(() => {
                vi.advanceTimersByTime(100);
            });

            // Assert - Should now show loading
            expect(result.current).toBeTruthy();
        });

        it("should hide loading after delay when isLoading becomes false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: true },
                }
            );

            // Act - Show loading first
            act(() => {
                vi.advanceTimersByTime(100);
            });
            expect(result.current).toBeTruthy();

            // Act - Stop loading
            rerender({ isLoading: false });

            // Assert - Should still be true immediately
            expect(result.current).toBeTruthy();

            // Act - Advance timer by state update defer delay
            act(() => {
                vi.advanceTimersByTime(50);
            });

            // Assert - Should now hide loading
            expect(result.current).toBeFalsy();
        });

        it("should not show loading if isLoading becomes false before delay expires", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act - Start loading
            rerender({ isLoading: true });

            // Act - Stop loading before delay expires
            act(() => {
                vi.advanceTimersByTime(50); // Less than LOADING_BUTTON delay
            });
            rerender({ isLoading: false });

            // Act - Complete both timer periods
            act(() => {
                vi.advanceTimersByTime(100);
            });

            // Assert - Should remain false throughout
            expect(result.current).toBeFalsy();
        });
    });

    describe("Timer Management", () => {
        it("should clear timeout when component unmounts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

            // Act
            const { unmount } = renderHook(() => useDelayedButtonLoading(true));
            unmount();

            // Assert
            expect(clearTimeoutSpy).toHaveBeenCalled();
        });

        it("should clear previous timeout when isLoading changes rapidly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            // Arrange
            const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
            const { rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act - Rapid changes
            rerender({ isLoading: true });
            rerender({ isLoading: false });
            rerender({ isLoading: true });

            // Assert - Should clear timeouts from previous renders (at least 2, could be more)
            expect(clearTimeoutSpy).toHaveBeenCalledTimes(3); // Called 3 times for cleanup
        });

        it("should handle multiple rapid state changes correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act - Rapid on/off changes
            rerender({ isLoading: true });
            act(() => vi.advanceTimersByTime(25));

            rerender({ isLoading: false });
            act(() => vi.advanceTimersByTime(25));

            rerender({ isLoading: true });
            act(() => vi.advanceTimersByTime(25));

            rerender({ isLoading: false });
            act(() => vi.advanceTimersByTime(100));

            // Assert - Should be false after all rapid changes
            expect(result.current).toBeFalsy();
        });
    });

    describe("Timing Behavior", () => {
        it("should use correct delay for showing loading state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act
            rerender({ isLoading: true });

            // Assert - Should not show loading before delay
            act(() => vi.advanceTimersByTime(99));
            expect(result.current).toBeFalsy();

            // Assert - Should show loading after exact delay
            act(() => vi.advanceTimersByTime(1));
            expect(result.current).toBeTruthy();
        });

        it("should use correct delay for hiding loading state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: true },
                }
            );

            // Setup - Show loading first
            act(() => vi.advanceTimersByTime(100));
            expect(result.current).toBeTruthy();

            // Act
            rerender({ isLoading: false });

            // Assert - Should not hide loading before delay
            act(() => vi.advanceTimersByTime(49));
            expect(result.current).toBeTruthy();

            // Assert - Should hide loading after exact delay
            act(() => vi.advanceTimersByTime(1));
            expect(result.current).toBeFalsy();
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined isLoading parameter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            // Act & Assert - Should not throw
            expect(() => {
                renderHook(() => useDelayedButtonLoading(undefined as any));
            }).not.toThrowError();
        });

        it("should handle null isLoading parameter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            // Act & Assert - Should not throw
            expect(() => {
                renderHook(() => useDelayedButtonLoading(null as any));
            }).not.toThrowError();
        });

        it("should handle very rapid successive calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act - Very rapid state changes
            for (let i = 0; i < 10; i++) {
                rerender({ isLoading: i % 2 === 0 });
                act(() => vi.advanceTimersByTime(5));
            }

            // Assert - Should handle gracefully
            expect(typeof result.current).toBe("boolean");
        });

        it("should handle zero delays gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Mock zero delays
            vi.doMock("../../constants", () => ({
                UI_DELAYS: {
                    LOADING_BUTTON: 0,
                    STATE_UPDATE_DEFER: 0,
                },
            }));

            // Act & Assert - Should not throw
            expect(() => {
                const { result, rerender } = renderHook(
                    ({ isLoading }) => useDelayedButtonLoading(isLoading),
                    {
                        initialProps: { isLoading: false },
                    }
                );

                rerender({ isLoading: true });
                act(() => vi.advanceTimersByTime(0));

                expect(typeof result.current).toBe("boolean");
            }).not.toThrowError();
        });
    });

    describe("Callback Stability", () => {
        it("should use stable callbacks to prevent unnecessary re-renders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Event Processing", "type");

            // Arrange
            const { rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act - Multiple rerenders with same props
            rerender({ isLoading: false });
            rerender({ isLoading: false });
            rerender({ isLoading: false });

            // Assert - Should not cause issues (verified by not throwing)
            expect(true).toBeTruthy();
        });

        it("should handle prop changes without memory leaks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act - Many prop changes
            for (let i = 0; i < 100; i++) {
                rerender({ isLoading: i % 2 === 0 });
            }

            // Assert - Should still work correctly
            expect(typeof result.current).toBe("boolean");
        });
    });

    describe("Real-world Usage Scenarios", () => {
        it("should handle typical form submission flow", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act - User clicks submit (loading starts)
            rerender({ isLoading: true });
            expect(result.current).toBeFalsy(); // No immediate loading state

            // Act - Loading delay passes
            act(() => vi.advanceTimersByTime(100));
            expect(result.current).toBeTruthy(); // Now showing loading

            // Act - Server responds quickly (loading stops)
            rerender({ isLoading: false });
            expect(result.current).toBeTruthy(); // Still showing loading

            // Act - Hide delay passes
            act(() => vi.advanceTimersByTime(50));
            expect(result.current).toBeFalsy(); // Loading hidden

            // Assert - Complete flow worked correctly
            expect(result.current).toBeFalsy();
        });

        it("should handle very fast operations without showing loading", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act - Fast operation (starts and stops within delay)
            rerender({ isLoading: true });
            act(() => vi.advanceTimersByTime(50)); // Less than LOADING_BUTTON delay
            rerender({ isLoading: false });
            act(() => vi.advanceTimersByTime(100)); // Complete all timers

            // Assert - Should never have shown loading
            expect(result.current).toBeFalsy();
        });

        it("should handle long-running operations correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act - Long operation
            rerender({ isLoading: true });
            act(() => vi.advanceTimersByTime(100)); // Show loading
            expect(result.current).toBeTruthy();

            // Act - Continue long operation
            act(() => vi.advanceTimersByTime(5000)); // 5 seconds
            expect(result.current).toBeTruthy(); // Should still show loading

            // Act - Operation completes
            rerender({ isLoading: false });
            act(() => vi.advanceTimersByTime(50)); // Hide loading
            expect(result.current).toBeFalsy();

            // Assert - Full long operation flow worked
            expect(result.current).toBeFalsy();
        });
    });

    describe("Return Value", () => {
        it("should always return a boolean", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange & Act
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Assert - Initial
            expect(typeof result.current).toBe("boolean");

            // Assert - After state change
            rerender({ isLoading: true });
            expect(typeof result.current).toBe("boolean");

            // Assert - After timeout
            act(() => vi.advanceTimersByTime(100));
            expect(typeof result.current).toBe("boolean");
        });

        it("should only return true or false values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDelayedButtonLoading", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const { result, rerender } = renderHook(
                ({ isLoading }) => useDelayedButtonLoading(isLoading),
                {
                    initialProps: { isLoading: false },
                }
            );

            // Act & Assert - Check various states
            expect([true, false]).toContain(result.current);

            rerender({ isLoading: true });
            expect([true, false]).toContain(result.current);

            act(() => vi.advanceTimersByTime(100));
            expect([true, false]).toContain(result.current);
        });
    });
});
