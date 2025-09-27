/**
 * @file Comprehensive tests for useMonitorTypes hook Tests monitor type
 *   configuration loading with error handling and fallback behavior
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { test, fc } from "@fast-check/vitest";

import { FALLBACK_MONITOR_TYPE_OPTIONS } from "../../constants";
import { logger } from "../../services/logger";
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
            expect(result.current.isLoading).toBeTruthy();
            expect(result.current.options).toEqual([]);
            expect(result.current.error).toBeUndefined();

            // Wait for loading to complete
            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            // Should have loaded options successfully
            expect(result.current.options).toEqual(mockOptions);
            expect(result.current.error).toBeUndefined();
            expect(mockGetMonitorTypeOptions).toHaveBeenCalledTimes(1);
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
                expect(result.current.isLoading).toBeFalsy();
            });
            expect(result.current.options).toEqual(initialOptions);

            // Test refresh
            act(() => {
                result.current.refresh();
            });

            // Should be loading again
            expect(result.current.isLoading).toBeTruthy();

            // Wait for refresh to complete
            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.options).toEqual(refreshedOptions);
            expect(mockGetMonitorTypeOptions).toHaveBeenCalledTimes(2);
        });

        it("should handle empty options array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockGetMonitorTypeOptions.mockResolvedValue([]);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
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
                expect(result.current.isLoading).toBeFalsy();
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
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.options).toEqual(Array.from(FALLBACK_MONITOR_TYPE_OPTIONS));
            expect(result.current.error).toBe(
                "Monitor types loading failed: Network connection failed. Using fallback options."
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to load monitor types from backend",
                testError
            );
        });

        it("should handle non-Error objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypes", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const testError = "String error message";
            mockGetMonitorTypeOptions.mockRejectedValue(testError);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.options).toEqual(Array.from(FALLBACK_MONITOR_TYPE_OPTIONS));
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
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.options).toEqual(Array.from(FALLBACK_MONITOR_TYPE_OPTIONS));
            expect(result.current.error).toBe(
                "Monitor types loading failed: Failed to load monitor types. Using fallback options."
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to load monitor types from backend",
                new Error("null")
            );
        });

        it("should handle object errors", async ({ task, annotate }) => {
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
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.options).toEqual(Array.from(FALLBACK_MONITOR_TYPE_OPTIONS));
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
                expect(result.current.isLoading).toBeFalsy();
            });
            expect(result.current.error).toBeDefined();
            expect(result.current.options).toEqual(Array.from(FALLBACK_MONITOR_TYPE_OPTIONS));

            // Refresh successfully
            act(() => {
                result.current.refresh();
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.error).toBeUndefined();
            expect(result.current.options).toEqual(successOptions);
        });

        it("should handle error during refresh", async ({ task, annotate }) => {
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
                expect(result.current.isLoading).toBeFalsy();
            });
            expect(result.current.options).toEqual(initialOptions);
            expect(result.current.error).toBeUndefined();

            // Refresh with error
            act(() => {
                result.current.refresh();
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.error).toBe(
                "Monitor types loading failed: Refresh failed. Using fallback options."
            );
            expect(result.current.options).toEqual(Array.from(FALLBACK_MONITOR_TYPE_OPTIONS));
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
            expect(result.current.isLoading).toBeTruthy();
            expect(result.current.options).toEqual([]);

            // Resolve the promise
            act(() => {
                resolvePromise([{ label: "HTTP", value: "http" }]);
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
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
                expect(result.current.isLoading).toBeFalsy();
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
            expect(result.current.isLoading).toBeTruthy();

            // Complete refresh
            act(() => {
                resolveRefresh([{ label: "Port", value: "port" }]);
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
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
                expect(result.current.isLoading).toBeFalsy();
            });

            // Make multiple rapid refresh calls
            act(() => {
                result.current.refresh();
                result.current.refresh();
                result.current.refresh();
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
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
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.options).toEqual(Array.from(FALLBACK_MONITOR_TYPE_OPTIONS));
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

            const originalFallbackOptions = Array.from(FALLBACK_MONITOR_TYPE_OPTIONS);
            mockGetMonitorTypeOptions.mockRejectedValue(
                new Error("Test error")
            );

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
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

            expect(result.current.isLoading).toBeTruthy();

            // Unmount while loading
            unmount();

            // Complete the promise after unmounting
            act(() => {
                resolvePromise([{ label: "HTTP", value: "http" }]);
            });

            // Should not cause any errors or warnings
            expect(mockGetMonitorTypeOptions).toHaveBeenCalledTimes(1);
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
                expect(result.current.isLoading).toBeFalsy();
            });

            expect(result.current.options).toEqual(realWorldOptions);
            expect(result.current.options).toHaveLength(5);
            expect(
                result.current.options.every(
                    (opt) =>
                        typeof opt.label === "string" &&
                        typeof opt.value === "string"
                )
            ).toBeTruthy();
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
                expect(result.current.isLoading).toBeFalsy();
            });

            // Check that all expected properties exist with correct types
            expect(typeof result.current.isLoading).toBe("boolean");
            expect(Array.isArray(result.current.options)).toBeTruthy();
            expect(typeof result.current.refresh).toBe("function");
            expect(
                result.current.error === undefined ||
                    typeof result.current.error === "string"
            ).toBeTruthy();
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
                expect(result.current.isLoading).toBeFalsy();
            });

            let refreshPromise: Promise<void> | undefined;
            act(() => {
                refreshPromise = result.current.refresh();
            });
            expect(refreshPromise).toBeInstanceOf(Promise);
            if (refreshPromise) {
                await refreshPromise;
            }
        });
    });

    describe("Property-Based Testing with Fast-Check", () => {
        test.prop(
            [
                fc.array(
                    fc.record({
                        label: fc.string({ minLength: 1, maxLength: 50 }),
                        value: fc
                            .string({ minLength: 1, maxLength: 20 })
                            .filter((s) => /^[\w-]+$/.test(s)),
                    }),
                    { minLength: 0, maxLength: 10 }
                ),
            ],
            {
                timeout: 1500,
                numRuns: 5,
            }
        )(
            "should handle various monitor type option configurations",
            async (monitorOptions) => {
                mockGetMonitorTypeOptions.mockResolvedValue(monitorOptions);

                const { result } = renderHook(() => useMonitorTypes());

                await waitFor(() => {
                    expect(result.current.isLoading).toBeFalsy();
                });

                expect(result.current.options).toEqual(monitorOptions);
                expect(Array.isArray(result.current.options)).toBeTruthy();
                expect(result.current.error).toBeUndefined();

                // Verify monitor options properties
                expect(monitorOptions.length).toBeLessThanOrEqual(10);
                for (const option of monitorOptions) {
                    expect(typeof option.label).toBe("string");
                    expect(option.label.length).toBeGreaterThan(0);
                    expect(option.label.length).toBeLessThanOrEqual(50);
                    expect(typeof option.value).toBe("string");
                    expect(option.value.length).toBeGreaterThan(0);
                    expect(option.value.length).toBeLessThanOrEqual(20);
                    expect(/^[\w-]+$/.test(option.value)).toBeTruthy();
                }
            }
        );

        test.prop(
            [
                fc.oneof(
                    fc.string().map((msg) => new Error(msg)),
                    fc
                        .record({ message: fc.string() })
                        .map((obj) => new Error(obj.message)),
                    fc.constantFrom(
                        new Error("Network error"),
                        new Error("API unavailable"),
                        new Error("Timeout"),
                        new Error("Unknown error")
                    )
                ),
            ],
            { timeout: 5000, numRuns: 10 }
        )("should handle various error types gracefully", async (testError) => {
            mockGetMonitorTypeOptions.mockRejectedValue(testError);

            const { result } = renderHook(() => useMonitorTypes());

            await waitFor(() => {
                expect(result.current.isLoading).toBeFalsy();
            });

            // Hook transforms error into a contextual string message
            const expectedMessage = `Monitor types loading failed: ${testError.message}. Using fallback options.`;
            expect(result.current.error).toBe(expectedMessage);
            expect(result.current.options).toEqual(
                FALLBACK_MONITOR_TYPE_OPTIONS
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to load monitor types from backend",
                testError
            );

            // Verify error properties
            expect(testError).toBeInstanceOf(Error);
            expect(typeof testError.message).toBe("string");
        });

        test.prop([fc.integer({ min: 0, max: 20 })], {
            timeout: 1500,
            numRuns: 5,
        })(
            "should handle different monitor type counts correctly",
            async (optionCount) => {
                const monitorOptions = Array.from(
                    { length: optionCount },
                    (_, i) => ({
                        label: `Monitor Type ${i + 1}`,
                        value: `type-${i + 1}`,
                    })
                );

                mockGetMonitorTypeOptions.mockResolvedValue(monitorOptions);

                const { result } = renderHook(() => useMonitorTypes());

                await waitFor(() => {
                    expect(result.current.isLoading).toBeFalsy();
                });

                expect(result.current.options).toHaveLength(optionCount);
                expect(result.current.error).toBeUndefined();

                // Verify option count properties
                expect(optionCount).toBeGreaterThanOrEqual(0);
                expect(optionCount).toBeLessThanOrEqual(20);
                expect(result.current.options).toHaveLength(optionCount);
            }
        );

        test.prop(
            [
                fc.array(
                    fc.oneof(
                        fc.record({
                            label: fc.string({ minLength: 1, maxLength: 30 }),
                            value: fc.string({ minLength: 1, maxLength: 15 }),
                        }),
                        fc.record({
                            label: fc.string(),
                            value: fc.string(),
                            extraProperty: fc.string(),
                        }),
                        fc.record({
                            label: fc.constant(""),
                            value: fc.string({ minLength: 1 }),
                        }),
                        fc.record({
                            label: fc.string({ minLength: 1 }),
                            value: fc.constant(""),
                        })
                    ),
                    { minLength: 1, maxLength: 5 }
                ),
            ],
            {
                timeout: 1500,
                numRuns: 5,
            }
        )(
            "should handle various option formats and edge cases",
            async (mixedOptions) => {
                mockGetMonitorTypeOptions.mockResolvedValue(
                    mixedOptions as any
                );

                const { result } = renderHook(() => useMonitorTypes());

                await waitFor(() => {
                    expect(result.current.isLoading).toBeFalsy();
                });

                expect(result.current.options).toEqual(mixedOptions);
                expect(result.current.error).toBeUndefined();

                // Verify mixed options array properties
                expect(Array.isArray(mixedOptions)).toBeTruthy();
                expect(mixedOptions.length).toBeGreaterThanOrEqual(1);
                expect(mixedOptions.length).toBeLessThanOrEqual(5);
            }
        );

        test.prop([fc.integer({ min: 1, max: 5 })], {
            timeout: 5000, // Increase fast-check timeout to 5s
            numRuns: 3, // Reduce number of test runs
        })(
            "should handle multiple refresh calls correctly",
            async (refreshCount) => {
                // Suppress React act warnings for this property-based test
                const originalConsoleError = console.error;

                console.error = (message: string, ...args: unknown[]) => {
                    if (
                        typeof message === "string" &&
                        message.includes("act(")
                    ) {
                        return; // Suppress act warnings
                    }
                    originalConsoleError(message, ...args);
                };

                try {
                    // Clear mocks at start of each property test execution
                    vi.clearAllMocks();

                    const mockOptions = [{ label: "Test", value: "test" }];
                    mockGetMonitorTypeOptions.mockResolvedValue(mockOptions);

                    const { result } = renderHook(() => useMonitorTypes());

                    // Wait for initial load
                    await waitFor(() => {
                        expect(result.current.isLoading).toBeFalsy();
                    });

                    // Clear mocks after initial load to count only refresh calls
                    mockGetMonitorTypeOptions.mockClear();
                    // Re-set the mock implementation for refresh calls
                    mockGetMonitorTypeOptions.mockResolvedValue(mockOptions);

                    // Perform multiple refreshes sequentially to avoid race conditions
                    for (let i = 0; i < refreshCount; i++) {
                        act(() => {
                            result.current.refresh();
                        });
                    }

                    // Wait for all refreshes to complete
                    await waitFor(
                        () => {
                            expect(result.current.isLoading).toBeFalsy();
                        },
                        { timeout: 5000 }
                    );

                    expect(result.current.options).toEqual(mockOptions);
                    expect(result.current.error).toBeUndefined();
                    expect(mockGetMonitorTypeOptions).toHaveBeenCalledTimes(
                        refreshCount
                    );

                    // Verify refresh count properties
                    expect(refreshCount).toBeGreaterThanOrEqual(1);
                    expect(refreshCount).toBeLessThanOrEqual(5);
                } finally {
                    // Restore original console.error
                    // eslint-disable-next-line require-atomic-updates -- console restore for test
                    console.error = originalConsoleError;
                }
            }
        );

        test.prop(
            [
                fc.record({
                    successOptions: fc.array(
                        fc.constantFrom(
                            { label: "HTTP", value: "http" },
                            { label: "Port", value: "port" },
                            { label: "Ping", value: "ping" },
                            { label: "DNS", value: "dns" }
                        ),
                        { minLength: 1, maxLength: 3 }
                    ),
                    errorMessage: fc.constantFrom(
                        "Network error",
                        "Connection failed",
                        "Timeout occurred",
                        "Server unavailable",
                        "API error"
                    ),
                }),
            ],
            {
                timeout: 1500,
                numRuns: 5,
            }
        )(
            "should handle alternating success and error scenarios",
            async ({ successOptions, errorMessage }) => {
                // Clear mocks and reset completely
                vi.clearAllMocks();
                vi.resetAllMocks();
                mockGetMonitorTypeOptions.mockClear();

                // First call succeeds with explicit mock setup
                mockGetMonitorTypeOptions.mockImplementationOnce(
                    async () => successOptions
                );

                const { result } = renderHook(() => useMonitorTypes());

                await waitFor(() => {
                    expect(result.current.isLoading).toBeFalsy();
                });

                expect(result.current.options).toEqual(successOptions);
                expect(result.current.error).toBeUndefined();

                // Second call (refresh) fails with explicit mock setup
                mockGetMonitorTypeOptions.mockImplementationOnce(async () => {
                    throw new Error(errorMessage);
                });

                // Trigger refresh and wait for completion
                await act(async () => {
                    await result.current.refresh();
                });

                // Wait for loading to complete
                await waitFor(() => {
                    expect(result.current.isLoading).toBeFalsy();
                });

                expect(typeof result.current.error).toBe("string");
                expect(result.current.error).toBe(
                    `Monitor types loading failed: ${errorMessage}. Using fallback options.`
                );
                expect(result.current.options).toEqual(
                    FALLBACK_MONITOR_TYPE_OPTIONS
                ); // Verify scenario properties
                expect(Array.isArray(successOptions)).toBeTruthy();
                expect(successOptions.length).toBeGreaterThanOrEqual(1);
                expect(successOptions.length).toBeLessThanOrEqual(3);
                expect(typeof errorMessage).toBe("string");
                expect(errorMessage.trim().length).toBeGreaterThan(1);
                expect(errorMessage.length).toBeLessThanOrEqual(100);
            }
        );

        test.prop([fc.constantFrom(null, undefined, [], {}, "invalid", 123)], {
            timeout: 1500, // Increase fast-check timeout to 1.5s
            numRuns: 5, // Reduce number of test runs
        })(
            "should handle invalid API responses gracefully",
            async (invalidResponse) => {
                mockGetMonitorTypeOptions.mockResolvedValue(
                    invalidResponse as any
                );

                const { result } = renderHook(() => useMonitorTypes());

                await waitFor(() => {
                    expect(result.current.isLoading).toBeFalsy();
                });

                // Should accept the invalid response as-is (validation happens elsewhere)
                expect(result.current.options).toEqual(invalidResponse);
                expect(result.current.error).toBeUndefined();
            }
        );

        test.prop([fc.integer({ min: 20, max: 50 })], {
            timeout: 1500, // Increase fast-check timeout to 1.5s
            numRuns: 5, // Reduce number of test runs
        })("should handle loading state timing correctly", async (delayMs) => {
            // Clear mocks at start of each property test execution
            vi.clearAllMocks();

            const mockOptions = [{ label: "Delayed", value: "delayed" }];

            mockGetMonitorTypeOptions.mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(() => resolve(mockOptions), delayMs)
                    )
            );

            const { result } = renderHook(() => useMonitorTypes());

            // Should be loading initially
            expect(result.current.isLoading).toBeTruthy();
            expect(result.current.options).toEqual([]);
            expect(result.current.error).toBeUndefined();

            // Wait for completion with sufficient timeout
            await waitFor(
                () => {
                    expect(result.current.isLoading).toBeFalsy();
                },
                { timeout: delayMs + 200 } // More generous buffer time
            );

            expect(result.current.options).toEqual(mockOptions);
            expect(result.current.error).toBeUndefined();

            // Verify delay properties
            expect(delayMs).toBeGreaterThanOrEqual(20);
            expect(delayMs).toBeLessThanOrEqual(50);
        });
    });
});
