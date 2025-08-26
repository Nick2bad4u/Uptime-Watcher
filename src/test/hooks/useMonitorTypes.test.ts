/**
 * @file Comprehensive tests for useMonitorTypes hook Tests monitor type
 *   configuration loading with error handling and fallback behavior
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { FALLBACK_MONITOR_TYPE_OPTIONS } from "../../constants";
import logger from "../../services/logger";
import { getMonitorTypeOptions } from "../../utils/monitorTypeHelper";
import { useMonitorTypes } from "../../hooks/useMonitorTypes";

// Mock dependencies
vi.mock("../../services/logger");
vi.mock("../../utils/monitorTypeHelper");

const mockLogger = vi.mocked(logger);
const mockGetMonitorTypeOptions = vi.mocked(getMonitorTypeOptions);

describe("useMonitorTypes Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset logger methods
        mockLogger.error = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Successful Loading", () => {
        it("should load monitor types successfully on mount", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            const mockOptions = [
                { label: "HTTP", value: "http" },
                { label: "Port", value: "port" },
                { label: "Custom", value: "custom" },
            ];
            mockGetMonitorTypeOptions.mockResolvedValue(mockOptions);

            const { result } = renderHook(() => useMonitorTypes());

            // Initially loading
            expect(result.current.isLoading).toBe(true);
            expect(result.current.options).toEqual([]);
            expect(result.current.error).toBeUndefined();

            // Wait for loading to complete
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Should have loaded options successfully
            expect(result.current.options).toEqual(mockOptions);
            expect(result.current.error).toBeUndefined();
            expect(mockGetMonitorTypeOptions).toHaveBeenCalledOnce();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it("should provide refresh functionality", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const initialOptions = [
                { label: "HTTP", value: "http" },
                { label: "Port", value: "port" },
            ];
            const refreshedOptions = [
                { label: "HTTP", value: "http" },
                { label: "Port", value: "port" },
                { label: "WebSocket", value: "websocket" },
            ];

            mockGetMonitorTypeOptions
                .mockResolvedValueOnce(initialOptions)
                .mockResolvedValueOnce(refreshedOptions);

            const { result } = renderHook(() => useMonitorTypes());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
            expect(result.current.options).toEqual(initialOptions);

            // Test refresh
            act(() => {
                result.current.refresh();
            });

            // Should be loading again
            expect(result.current.isLoading).toBe(true);

            // Wait for refresh to complete
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.options).toEqual(refreshedOptions);
            expect(mockGetMonitorTypeOptions).toHaveBeenCalledTimes(2);
        });

        it("should handle empty options array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockGetMonitorTypeOptions.mockResolvedValue([]);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.options).toEqual([]);
            expect(result.current.error).toBeUndefined();
        });

        it("should handle options with special characters and formatting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const specialOptions = [
                { label: "HTTP/HTTPS Monitor", value: "http" },
                { label: "TCP Port (Custom)", value: "port" },
                { label: "API & WebSocket", value: "api" },
            ];
            mockGetMonitorTypeOptions.mockResolvedValue(specialOptions);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.options).toEqual(specialOptions);
        });
    });

    describe("Error Handling", () => {
        it("should handle Error objects and use fallback options", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const testError = new Error("Network connection failed");
            mockGetMonitorTypeOptions.mockRejectedValue(testError);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.options).toEqual([
                ...FALLBACK_MONITOR_TYPE_OPTIONS,
            ]);
            expect(result.current.error).toBe(
                "Monitor types loading failed: Network connection failed. Using fallback options."
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to load monitor types from backend",
                testError
            );
        });

        it("should handle non-Error objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const testError = "String error message";
            mockGetMonitorTypeOptions.mockRejectedValue(testError);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.options).toEqual([
                ...FALLBACK_MONITOR_TYPE_OPTIONS,
            ]);
            expect(result.current.error).toBe(
                "Monitor types loading failed: Failed to load monitor types. Using fallback options."
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to load monitor types from backend",
                new Error("String error message")
            );
        });

        it("should handle null/undefined errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            mockGetMonitorTypeOptions.mockRejectedValue(null);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.options).toEqual([
                ...FALLBACK_MONITOR_TYPE_OPTIONS,
            ]);
            expect(result.current.error).toBe(
                "Monitor types loading failed: Failed to load monitor types. Using fallback options."
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to load monitor types from backend",
                new Error("null")
            );
        });

        it("should handle object errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const objectError = {
                code: "NETWORK_ERROR",
                message: "Connection timeout",
            };
            mockGetMonitorTypeOptions.mockRejectedValue(objectError);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.options).toEqual([
                ...FALLBACK_MONITOR_TYPE_OPTIONS,
            ]);
            expect(result.current.error).toBe(
                "Monitor types loading failed: Failed to load monitor types. Using fallback options."
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to load monitor types from backend",
                new Error("[object Object]")
            );
        });

        it("should clear error on successful refresh", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const testError = new Error("Initial error");
            const successOptions = [{ label: "HTTP", value: "http" }];

            mockGetMonitorTypeOptions
                .mockRejectedValueOnce(testError)
                .mockResolvedValueOnce(successOptions);

            const { result } = renderHook(() => useMonitorTypes());

            // Wait for initial error
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
            expect(result.current.error).toBeDefined();
            expect(result.current.options).toEqual([
                ...FALLBACK_MONITOR_TYPE_OPTIONS,
            ]);

            // Refresh successfully
            act(() => {
                result.current.refresh();
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBeUndefined();
            expect(result.current.options).toEqual(successOptions);
        });

        it("should handle error during refresh", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const initialOptions = [{ label: "HTTP", value: "http" }];
            const refreshError = new Error("Refresh failed");

            mockGetMonitorTypeOptions
                .mockResolvedValueOnce(initialOptions)
                .mockRejectedValueOnce(refreshError);

            const { result } = renderHook(() => useMonitorTypes());

            // Wait for initial success
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
            expect(result.current.options).toEqual(initialOptions);
            expect(result.current.error).toBeUndefined();

            // Refresh with error
            act(() => {
                result.current.refresh();
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe(
                "Monitor types loading failed: Refresh failed. Using fallback options."
            );
            expect(result.current.options).toEqual([
                ...FALLBACK_MONITOR_TYPE_OPTIONS,
            ]);
        });
    });

    describe("Loading States", () => {
        it("should manage loading state correctly during initial load", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            let resolvePromise: (
                value: { label: string; value: string }[]
            ) => void;
            const loadPromise = new Promise<{ label: string; value: string }[]>(
                (resolve) => {
                    resolvePromise = resolve;
                }
            );
            mockGetMonitorTypeOptions.mockReturnValue(loadPromise);

            const { result } = renderHook(() => useMonitorTypes());

            // Should start loading
            expect(result.current.isLoading).toBe(true);
            expect(result.current.options).toEqual([]);

            // Resolve the promise
            act(() => {
                resolvePromise([{ label: "HTTP", value: "http" }]);
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });

        it("should manage loading state correctly during refresh", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            const initialOptions = [{ label: "HTTP", value: "http" }];
            mockGetMonitorTypeOptions.mockResolvedValue(initialOptions);

            const { result } = renderHook(() => useMonitorTypes());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Start refresh
            let resolveRefresh: (
                value: { label: string; value: string }[]
            ) => void;
            const refreshPromise = new Promise<
                { label: string; value: string }[]
            >((resolve) => {
                resolveRefresh = resolve;
            });
            mockGetMonitorTypeOptions.mockReturnValue(refreshPromise);

            act(() => {
                result.current.refresh();
            });

            // Should be loading during refresh
            expect(result.current.isLoading).toBe(true);

            // Complete refresh
            act(() => {
                resolveRefresh([{ label: "Port", value: "port" }]);
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });

        it("should handle rapid consecutive refresh calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const options = [{ label: "HTTP", value: "http" }];
            mockGetMonitorTypeOptions.mockResolvedValue(options);

            const { result } = renderHook(() => useMonitorTypes());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Make multiple rapid refresh calls
            act(() => {
                result.current.refresh();
                result.current.refresh();
                result.current.refresh();
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Should still work correctly
            expect(result.current.options).toEqual(options);
            expect(result.current.error).toBeUndefined();
        });
    });

    describe("Fallback Behavior", () => {
        it("should use fallback options when backend fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            mockGetMonitorTypeOptions.mockRejectedValue(
                new Error("Backend unavailable")
            );

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.options).toEqual([
                ...FALLBACK_MONITOR_TYPE_OPTIONS,
            ]);
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        it("should not mutate the original fallback options array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const originalFallbackOptions = [...FALLBACK_MONITOR_TYPE_OPTIONS];
            mockGetMonitorTypeOptions.mockRejectedValue(
                new Error("Test error")
            );

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Modify the returned options
            result.current.options.push({
                label: "Modified",
                value: "modified",
            });

            // Original fallback should be unchanged
            expect(FALLBACK_MONITOR_TYPE_OPTIONS).toEqual(
                originalFallbackOptions
            );
        });
    });

    describe("Integration Scenarios", () => {
        it("should handle hook unmounting during loading", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            let resolvePromise: (
                value: { label: string; value: string }[]
            ) => void;
            const loadPromise = new Promise<{ label: string; value: string }[]>(
                (resolve) => {
                    resolvePromise = resolve;
                }
            );
            mockGetMonitorTypeOptions.mockReturnValue(loadPromise);

            const { result, unmount } = renderHook(() => useMonitorTypes());

            expect(result.current.isLoading).toBe(true);

            // Unmount while loading
            unmount();

            // Complete the promise after unmounting
            act(() => {
                resolvePromise([{ label: "HTTP", value: "http" }]);
            });

            // Should not cause any errors or warnings
            expect(mockGetMonitorTypeOptions).toHaveBeenCalledOnce();
        });

        it("should work with real-world monitor type data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const realWorldOptions = [
                { label: "HTTP/HTTPS Website", value: "http" },
                { label: "TCP Port Check", value: "port" },
                { label: "Database Connection", value: "database" },
                { label: "API Endpoint", value: "api" },
                { label: "DNS Resolution", value: "dns" },
            ];
            mockGetMonitorTypeOptions.mockResolvedValue(realWorldOptions);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.options).toEqual(realWorldOptions);
            expect(result.current.options).toHaveLength(5);
            expect(
                result.current.options.every(
                    (opt) =>
                        typeof opt.label === "string" &&
                        typeof opt.value === "string"
                )
            ).toBe(true);
        });
    });

    describe("Return Value Interface", () => {
        it("should have correct return value interface", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockGetMonitorTypeOptions.mockResolvedValue([]);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Check that all expected properties exist with correct types
            expect(typeof result.current.isLoading).toBe("boolean");
            expect(Array.isArray(result.current.options)).toBe(true);
            expect(typeof result.current.refresh).toBe("function");
            expect(
                result.current.error === undefined ||
                    typeof result.current.error === "string"
            ).toBe(true);
        });

        it("should have refresh function that returns a Promise", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockGetMonitorTypeOptions.mockResolvedValue([]);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const refreshPromise = result.current.refresh();
            expect(refreshPromise).toBeInstanceOf(Promise);
            await refreshPromise;
        });
    });
});
