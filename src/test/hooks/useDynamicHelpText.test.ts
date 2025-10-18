/**
 * Tests for useDynamicHelpText hook
 *
 * @file Comprehensive tests covering all branches and edge cases for the
 *   dynamic help text loading hook.
 */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorType } from "@shared/types";

import { useDynamicHelpText } from "../../hooks/useDynamicHelpText";
import { getMonitorHelpTexts } from "../../utils/monitorUiHelpers";

// Mock the logger module
vi.mock("../../services/logger", () => ({
    logger: {
        warn: vi.fn(),
    },
}));

// Mock the getMonitorHelpTexts utility
vi.mock("../../utils/monitorUiHelpers", () => ({
    getMonitorHelpTexts: vi.fn(),
}));

describe("useDynamicHelpText Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic functionality", () => {
        it("should return initial loading state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            vi.mocked(getMonitorHelpTexts).mockImplementation(
                () => new Promise(() => {})
            ); // Never resolves

            const { result } = renderHook(() => useDynamicHelpText("http"));

            expect(result.current.isLoading).toBeTruthy();
            expect(result.current.error).toBeUndefined();
            expect(result.current.primary).toBeUndefined();
            expect(result.current.secondary).toBeUndefined();
        });

        it("should load help texts successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            const mockHelpTexts = {
                primary: "HTTP monitor primary help",
                secondary: "HTTP monitor secondary help",
            };
            vi.mocked(getMonitorHelpTexts).mockResolvedValue(mockHelpTexts);

            const { result } = renderHook(() => useDynamicHelpText("http"));

            // Initial state
            expect(result.current.isLoading).toBeTruthy();

            // Wait for loading to complete
            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.primary).toBe("HTTP monitor primary help");
            expect(result.current.secondary).toBe(
                "HTTP monitor secondary help"
            );
            expect(result.current.error).toBeUndefined();
        });

        it("should handle empty help texts", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(getMonitorHelpTexts).mockResolvedValue({});

            const { result } = renderHook(() => useDynamicHelpText("http"));

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.primary).toBeUndefined();
            expect(result.current.secondary).toBeUndefined();
            expect(result.current.error).toBeUndefined();
        });

        it("should handle partial help texts", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(getMonitorHelpTexts).mockResolvedValue({
                primary: "Only primary help text",
            });

            const { result } = renderHook(() =>
                useDynamicHelpText("http" as any)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.primary).toBe("Only primary help text");
            expect(result.current.secondary).toBeUndefined();
            expect(result.current.error).toBeUndefined();
        });
    });

    describe("Error handling", () => {
        it("should handle Error instances", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Network error");
            vi.mocked(getMonitorHelpTexts).mockRejectedValue(error);

            const { result } = renderHook(() => useDynamicHelpText("http"));

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.error).toBe("Network error");
            expect(result.current.primary).toBe(
                "Help text could not be loaded"
            );
            expect(result.current.secondary).toBe(
                "Please check your connection and try again"
            );
        });

        it("should handle non-Error objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(getMonitorHelpTexts).mockRejectedValue("String error");

            const { result } = renderHook(() =>
                useDynamicHelpText("port" as any)
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.error).toBe("Help text unavailable");
            expect(result.current.primary).toBe(
                "Help text could not be loaded"
            );
            expect(result.current.secondary).toBe(
                "Please check your connection and try again"
            );
        });

        it("should handle null/undefined errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(getMonitorHelpTexts).mockRejectedValue(null);

            const { result } = renderHook(() => useDynamicHelpText("http"));

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.error).toBe("Help text unavailable");
            expect(result.current.primary).toBe(
                "Help text could not be loaded"
            );
            expect(result.current.secondary).toBe(
                "Please check your connection and try again"
            );
        });
    });

    describe("Monitor type changes", () => {
        it("should reload help texts when monitor type changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            vi.mocked(getMonitorHelpTexts)
                .mockResolvedValueOnce({ primary: "HTTP help" })
                .mockResolvedValueOnce({ primary: "Ping help" });

            const { result, rerender } = renderHook(
                ({ monitorType }: { monitorType: MonitorType }) =>
                    useDynamicHelpText(monitorType),
                { initialProps: { monitorType: "http" as MonitorType } }
            );

            // Wait for first load
            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });
            expect(result.current.primary).toBe("HTTP help");

            // Change monitor type
            rerender({ monitorType: "ping" as MonitorType });

            // Should start loading again
            expect(result.current.isLoading).toBeTruthy();

            // Wait for second load
            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });
            expect(result.current.primary).toBe("Ping help");

            // Verify both calls were made
            expect(vi.mocked(getMonitorHelpTexts)).toHaveBeenCalledTimes(2);
            expect(vi.mocked(getMonitorHelpTexts)).toHaveBeenNthCalledWith(
                1,
                "http",
                expect.any(AbortSignal)
            );
            expect(vi.mocked(getMonitorHelpTexts)).toHaveBeenNthCalledWith(
                2,
                "ping",
                expect.any(AbortSignal)
            );
        });

        it("should reset error state when monitor type changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(getMonitorHelpTexts)
                .mockRejectedValueOnce(new Error("First error"))
                .mockResolvedValueOnce({ primary: "Success help" });

            const { result, rerender } = renderHook(
                ({ monitorType }: { monitorType: MonitorType }) =>
                    useDynamicHelpText(monitorType),
                { initialProps: { monitorType: "http" as MonitorType } }
            );

            // Wait for first load to fail
            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });
            expect(result.current.error).toBe("First error");

            // Change monitor type
            rerender({ monitorType: "ping" as MonitorType });

            // Should clear error during loading
            expect(result.current.isLoading).toBeTruthy();
            expect(result.current.error).toBeUndefined();

            // Wait for successful load
            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });
            expect(result.current.error).toBeUndefined();
            expect(result.current.primary).toBe("Success help");
        });
    });

    describe("Cleanup and cancellation", () => {
        it("should cancel pending requests on unmount", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            let resolvePromise: (value: {
                primary?: string;
                secondary?: string;
            }) => void;
            const pendingPromise = new Promise<{
                primary?: string;
                secondary?: string;
            }>((resolve) => {
                resolvePromise = resolve;
            });
            vi.mocked(getMonitorHelpTexts).mockReturnValue(pendingPromise);

            const { result, unmount } = renderHook(() =>
                useDynamicHelpText("http")
            );

            // Should be loading
            expect(result.current.isLoading).toBeTruthy();

            // Unmount before promise resolves
            unmount();

            // Resolve the promise after unmount
            resolvePromise!({ primary: "Should not be set" });

            // Wait a bit to ensure the promise resolves
            await new Promise((resolve) => setTimeout(resolve, 10));

            // The component should still show loading state from last render
            expect(result.current.isLoading).toBeTruthy();
            expect(result.current.primary).toBeUndefined();
        });

        it("should cancel pending requests when monitor type changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            let resolveFirstPromise: (value: {
                primary?: string;
                secondary?: string;
            }) => void;
            const firstPromise = new Promise<{
                primary?: string;
                secondary?: string;
            }>((resolve) => {
                resolveFirstPromise = resolve;
            });

            vi.mocked(getMonitorHelpTexts)
                .mockReturnValueOnce(firstPromise)
                .mockResolvedValueOnce({ primary: "Second result" });

            const { result, rerender } = renderHook(
                ({ monitorType }: { monitorType: MonitorType }) =>
                    useDynamicHelpText(monitorType),
                { initialProps: { monitorType: "http" as MonitorType } }
            );

            // Should be loading first request
            expect(result.current.isLoading).toBeTruthy();

            // Change monitor type before first request resolves
            rerender({ monitorType: "ping" as MonitorType });

            // Should start loading second request
            expect(result.current.isLoading).toBeTruthy();

            // Resolve first promise (should be ignored)
            resolveFirstPromise!({
                primary: "First result - should be ignored",
            });

            // Wait for second request to complete
            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            // Should only show result from second request
            expect(result.current.primary).toBe("Second result");
        });
    });

    describe("Different monitor types", () => {
        const monitorTypes: MonitorType[] = ["http", "port"];

        it.each(monitorTypes)(
            "should handle %s monitor type",
            async (monitorType) => {
                const expectedHelp = {
                    primary: `${monitorType.toUpperCase()} primary help`,
                    secondary: `${monitorType.toUpperCase()} secondary help`,
                };
                vi.mocked(getMonitorHelpTexts).mockResolvedValue(expectedHelp);

                const { result } = renderHook(() =>
                    useDynamicHelpText(monitorType)
                );

                await waitFor(() => {
                    expect(result.current.isLoading).toBeFalsy();
                });

                expect(result.current.primary).toBe(expectedHelp.primary);
                expect(result.current.secondary).toBe(expectedHelp.secondary);
                expect(vi.mocked(getMonitorHelpTexts)).toHaveBeenCalledWith(
                    monitorType,
                    expect.any(AbortSignal)
                );
            }
        );
    });

    describe("State transitions", () => {
        it("should properly transition through loading states", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            let resolvePromise: (value: {
                primary?: string;
                secondary?: string;
            }) => void;
            const controllablePromise = new Promise<{
                primary?: string;
                secondary?: string;
            }>((resolve) => {
                resolvePromise = resolve;
            });
            vi.mocked(getMonitorHelpTexts).mockReturnValue(controllablePromise);

            const { result } = renderHook(() => useDynamicHelpText("http"));

            // Initial state
            expect(result.current.isLoading).toBeTruthy();
            expect(result.current.error).toBeUndefined();
            expect(result.current.primary).toBeUndefined();
            expect(result.current.secondary).toBeUndefined();

            // Resolve the promise
            resolvePromise!({ primary: "Loaded help" });

            // Wait for completion
            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            // Final state
            expect(result.current.isLoading).toBeFalsy();
            expect(result.current.error).toBeUndefined();
            expect(result.current.primary).toBe("Loaded help");
        });

        it("should handle rapid monitor type changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useDynamicHelpText", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            // Mock multiple quick responses
            vi.mocked(getMonitorHelpTexts)
                .mockResolvedValueOnce({ primary: "HTTP help" })
                .mockResolvedValueOnce({ primary: "Ping help" })
                .mockResolvedValueOnce({ primary: "TCP help" });

            const { result, rerender } = renderHook(
                ({ monitorType }: { monitorType: MonitorType }) =>
                    useDynamicHelpText(monitorType),
                { initialProps: { monitorType: "http" as MonitorType } }
            );

            // Quickly change types
            rerender({ monitorType: "ping" as MonitorType });
            rerender({ monitorType: "tcp" as MonitorType });

            // Wait for final result
            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            // Should show result from final request
            expect(result.current.primary).toBe("TCP help");
            expect(vi.mocked(getMonitorHelpTexts)).toHaveBeenCalledTimes(3);
        });
    });
});
