/**
 * Tests for useDynamicHelpText hook
 *
 * @fileoverview Comprehensive tests covering all branches and edge cases
 * for the dynamic help text loading hook.
 */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorType } from "../../types";

import { useDynamicHelpText } from "../../hooks/useDynamicHelpText";
import { getMonitorHelpTexts } from "../../utils/monitorUiHelpers";

// Mock the logger module
vi.mock("../../services/logger", () => ({
    default: {
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
        it("should return initial loading state", () => {
            vi.mocked(getMonitorHelpTexts).mockImplementation(() => new Promise(() => {})); // Never resolves

            const { result } = renderHook(() => useDynamicHelpText("http"));

            expect(result.current.isLoading).toBe(true);
            expect(result.current.error).toBeUndefined();
            expect(result.current.primary).toBeUndefined();
            expect(result.current.secondary).toBeUndefined();
        });

        it("should load help texts successfully", async () => {
            const mockHelpTexts = {
                primary: "HTTP monitor primary help",
                secondary: "HTTP monitor secondary help",
            };
            vi.mocked(getMonitorHelpTexts).mockResolvedValue(mockHelpTexts);

            const { result } = renderHook(() => useDynamicHelpText("http"));

            // Initial state
            expect(result.current.isLoading).toBe(true);

            // Wait for loading to complete
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.primary).toBe("HTTP monitor primary help");
            expect(result.current.secondary).toBe("HTTP monitor secondary help");
            expect(result.current.error).toBeUndefined();
        });

        it("should handle empty help texts", async () => {
            vi.mocked(getMonitorHelpTexts).mockResolvedValue({});

            const { result } = renderHook(() => useDynamicHelpText("http"));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.primary).toBeUndefined();
            expect(result.current.secondary).toBeUndefined();
            expect(result.current.error).toBeUndefined();
        });

        it("should handle partial help texts", async () => {
            vi.mocked(getMonitorHelpTexts).mockResolvedValue({
                primary: "Only primary help text",
            });

            const { result } = renderHook(() => useDynamicHelpText("ping"));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.primary).toBe("Only primary help text");
            expect(result.current.secondary).toBeUndefined();
            expect(result.current.error).toBeUndefined();
        });
    });

    describe("Error handling", () => {
        it("should handle Error instances", async () => {
            const error = new Error("Network error");
            vi.mocked(getMonitorHelpTexts).mockRejectedValue(error);

            const { result } = renderHook(() => useDynamicHelpText("http"));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe("Network error");
            expect(result.current.primary).toBe("Help text could not be loaded");
            expect(result.current.secondary).toBe("Please check your connection and try again");
        });

        it("should handle non-Error objects", async () => {
            vi.mocked(getMonitorHelpTexts).mockRejectedValue("String error");

            const { result } = renderHook(() => useDynamicHelpText("tcp"));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe("Help text unavailable");
            expect(result.current.primary).toBe("Help text could not be loaded");
            expect(result.current.secondary).toBe("Please check your connection and try again");
        });

        it("should handle null/undefined errors", async () => {
            vi.mocked(getMonitorHelpTexts).mockRejectedValue(null);

            const { result } = renderHook(() => useDynamicHelpText("http"));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe("Help text unavailable");
            expect(result.current.primary).toBe("Help text could not be loaded");
            expect(result.current.secondary).toBe("Please check your connection and try again");
        });
    });

    describe("Monitor type changes", () => {
        it("should reload help texts when monitor type changes", async () => {
            vi.mocked(getMonitorHelpTexts)
                .mockResolvedValueOnce({ primary: "HTTP help" })
                .mockResolvedValueOnce({ primary: "Ping help" });

            const { result, rerender } = renderHook(
                ({ monitorType }: { monitorType: MonitorType }) => useDynamicHelpText(monitorType),
                { initialProps: { monitorType: "http" as MonitorType } }
            );

            // Wait for first load
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
            expect(result.current.primary).toBe("HTTP help");

            // Change monitor type
            rerender({ monitorType: "ping" as MonitorType });

            // Should start loading again
            expect(result.current.isLoading).toBe(true);

            // Wait for second load
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
            expect(result.current.primary).toBe("Ping help");

            // Verify both calls were made
            expect(vi.mocked(getMonitorHelpTexts)).toHaveBeenCalledTimes(2);
            expect(vi.mocked(getMonitorHelpTexts)).toHaveBeenNthCalledWith(1, "http");
            expect(vi.mocked(getMonitorHelpTexts)).toHaveBeenNthCalledWith(2, "ping");
        });

        it("should reset error state when monitor type changes", async () => {
            vi.mocked(getMonitorHelpTexts)
                .mockRejectedValueOnce(new Error("First error"))
                .mockResolvedValueOnce({ primary: "Success help" });

            const { result, rerender } = renderHook(
                ({ monitorType }: { monitorType: MonitorType }) => useDynamicHelpText(monitorType),
                { initialProps: { monitorType: "http" as MonitorType } }
            );

            // Wait for first load to fail
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
            expect(result.current.error).toBe("First error");

            // Change monitor type
            rerender({ monitorType: "ping" as MonitorType });

            // Should clear error during loading
            expect(result.current.isLoading).toBe(true);
            expect(result.current.error).toBeUndefined();

            // Wait for successful load
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
            expect(result.current.error).toBeUndefined();
            expect(result.current.primary).toBe("Success help");
        });
    });

    describe("Cleanup and cancellation", () => {
        it("should cancel pending requests on unmount", async () => {
            let resolvePromise: (value: any) => void;
            const pendingPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            vi.mocked(getMonitorHelpTexts).mockReturnValue(pendingPromise);

            const { result, unmount } = renderHook(() => useDynamicHelpText("http"));

            // Should be loading
            expect(result.current.isLoading).toBe(true);

            // Unmount before promise resolves
            unmount();

            // Resolve the promise after unmount
            resolvePromise!({ primary: "Should not be set" });

            // Wait a bit to ensure the promise resolves
            await new Promise((resolve) => setTimeout(resolve, 10));

            // The component should still show loading state from last render
            expect(result.current.isLoading).toBe(true);
            expect(result.current.primary).toBeUndefined();
        });

        it("should cancel pending requests when monitor type changes", async () => {
            let resolveFirstPromise: (value: any) => void;
            const firstPromise = new Promise((resolve) => {
                resolveFirstPromise = resolve;
            });

            vi.mocked(getMonitorHelpTexts)
                .mockReturnValueOnce(firstPromise)
                .mockResolvedValueOnce({ primary: "Second result" });

            const { result, rerender } = renderHook(
                ({ monitorType }: { monitorType: MonitorType }) => useDynamicHelpText(monitorType),
                { initialProps: { monitorType: "http" as MonitorType } }
            );

            // Should be loading first request
            expect(result.current.isLoading).toBe(true);

            // Change monitor type before first request resolves
            rerender({ monitorType: "ping" as MonitorType });

            // Should start loading second request
            expect(result.current.isLoading).toBe(true);

            // Resolve first promise (should be ignored)
            resolveFirstPromise!({ primary: "First result - should be ignored" });

            // Wait for second request to complete
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Should only show result from second request
            expect(result.current.primary).toBe("Second result");
        });
    });

    describe("Different monitor types", () => {
        const monitorTypes: MonitorType[] = ["http", "ping", "tcp"];

        it.each(monitorTypes)("should handle %s monitor type", async (monitorType) => {
            const expectedHelp = {
                primary: `${monitorType.toUpperCase()} primary help`,
                secondary: `${monitorType.toUpperCase()} secondary help`,
            };
            vi.mocked(getMonitorHelpTexts).mockResolvedValue(expectedHelp);

            const { result } = renderHook(() => useDynamicHelpText(monitorType));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.primary).toBe(expectedHelp.primary);
            expect(result.current.secondary).toBe(expectedHelp.secondary);
            expect(vi.mocked(getMonitorHelpTexts)).toHaveBeenCalledWith(monitorType);
        });
    });

    describe("State transitions", () => {
        it("should properly transition through loading states", async () => {
            let resolvePromise: (value: any) => void;
            const controllablePromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            vi.mocked(getMonitorHelpTexts).mockReturnValue(controllablePromise);

            const { result } = renderHook(() => useDynamicHelpText("http"));

            // Initial state
            expect(result.current.isLoading).toBe(true);
            expect(result.current.error).toBeUndefined();
            expect(result.current.primary).toBeUndefined();
            expect(result.current.secondary).toBeUndefined();

            // Resolve the promise
            resolvePromise!({ primary: "Loaded help" });

            // Wait for completion
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Final state
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeUndefined();
            expect(result.current.primary).toBe("Loaded help");
        });

        it("should handle rapid monitor type changes", async () => {
            // Mock multiple quick responses
            vi.mocked(getMonitorHelpTexts)
                .mockResolvedValueOnce({ primary: "HTTP help" })
                .mockResolvedValueOnce({ primary: "Ping help" })
                .mockResolvedValueOnce({ primary: "TCP help" });

            const { result, rerender } = renderHook(
                ({ monitorType }: { monitorType: MonitorType }) => useDynamicHelpText(monitorType),
                { initialProps: { monitorType: "http" as MonitorType } }
            );

            // Quickly change types
            rerender({ monitorType: "ping" as MonitorType });
            rerender({ monitorType: "tcp" as MonitorType });

            // Wait for final result
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Should show result from final request
            expect(result.current.primary).toBe("TCP help");
            expect(vi.mocked(getMonitorHelpTexts)).toHaveBeenCalledTimes(3);
        });
    });
});
