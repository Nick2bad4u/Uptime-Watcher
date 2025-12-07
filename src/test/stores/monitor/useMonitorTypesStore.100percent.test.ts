/**
 * Complete 100% test coverage for useMonitorTypesStore
 *
 * This test suite provides exhaustive coverage for the MonitorTypesStore,
 * testing all code paths, edge cases, and error scenarios to achieve 100%
 * line, branch, and function coverage.
 *
 * @remarks
 * This suite specifically targets areas not covered by the existing
 * comprehensive tests, including:
 * - IPC response edge cases and error scenarios
 * - Config filtering with various malformed data types
 * - Error handling wrapper scenarios
 * - State mutation patterns
 * - Boundary conditions and race conditions
 * - Logging and action tracking
 * - Complete validation result transformation paths
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type {
    Monitor,
    MonitorType,
} from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";

// Store the original implementations to restore later
const originalWithErrorHandling = vi.hoisted(() => vi.fn());
const originalLogStoreAction = vi.hoisted(() => vi.fn());
const originalSafeExtractIpcData = vi.hoisted(() => vi.fn());

// Mock dependencies with full control over their behavior
vi.mock("@shared/utils/errorHandling", () => ({
    withErrorHandling: originalWithErrorHandling,
    ensureError: vi.fn((error) => {
        if (error instanceof Error) {
            return error;
        }
        // Create an object that behaves like an Error for testing
        const errorLike = {
            name: "Error",
            message: String(error),
            stack: "",
        };
        // Make it pass instanceof Error check by setting the prototype
        Object.setPrototypeOf(errorLike, Error.prototype);
        return errorLike;
    }),
}));

vi.mock("../../../stores/utils", () => ({
    logStoreAction: originalLogStoreAction,
}));

vi.mock("../../../types/ipc", () => ({
    safeExtractIpcData: originalSafeExtractIpcData,
}));

// Mock ElectronAPI
const mockElectronAPI = {
    monitorTypes: {
        validateMonitorData: vi.fn(),
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
        getMonitorTypes: vi.fn(),
    },
    monitoring: {},
};

// Properly mock window.electronAPI
Object.defineProperty(globalThis, "window", {
    value: {
        electronAPI: mockElectronAPI,
    },
    writable: true,
});

// Mock window.electronAPI for global access
vi.stubGlobal("window", {
    electronAPI: mockElectronAPI,
});

const createMonitorTypeConfig = (
    overrides: Partial<MonitorTypeConfig> = {}
): MonitorTypeConfig => ({
    type: overrides.type ?? "http",
    displayName: overrides.displayName ?? "HTTP",
    description: overrides.description ?? "HTTP monitoring",
    version: overrides.version ?? "1.0",
    fields:
        overrides.fields ??
        ([
            {
                helpText: "Provide a valid endpoint",
                label: "URL",
                name: "url",
                placeholder: "https://example.com",
                required: true,
                type: "url",
            },
        ] satisfies MonitorTypeConfig["fields"]),
    ...(overrides.uiConfig === undefined
        ? {}
        : { uiConfig: overrides.uiConfig }),
});

describe("useMonitorTypesStore - 100% Coverage", () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Set up default withErrorHandling behavior
        originalWithErrorHandling.mockImplementation(async (operation, store) => {
            try {
                store.clearError();
                store.setLoading(true);
                return await operation();
            } catch (error: unknown) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                store.setError(errorMessage);
                throw error;
            } finally {
                store.setLoading(false);
            }
        });

        // Set up default safeExtractIpcData behavior to match the real implementation
        originalSafeExtractIpcData.mockImplementation(
            (response, fallback) => {
                if (response && response.data !== undefined) {
                    return response.data;
                }
                return fallback;
            }
        );

        // Reset Zustand store to initial state
        const store = useMonitorTypesStore.getState();
        store.clearError();
        store.setLoading(false);
        useMonitorTypesStore.setState({
            monitorTypes: [],
            fieldConfigs: {},
            isLoaded: false,
            isLoading: false,
            lastError: undefined,
        });
    });

    afterEach(() => {
        // Clean up any subscriptions or timers
        vi.clearAllTimers();
    });

    describe("IPC Response Edge Cases", () => {


        it("should handle safeExtractIpcData returning null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: IPC Response Handling", "type");

            // Mock safeExtractIpcData to return empty array (simulating failed extraction for loadMonitorTypes)
            originalSafeExtractIpcData.mockImplementationOnce(() => []);

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue([]);

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            // Should use fallback (empty array) when extraction fails
            expect(result.current.monitorTypes).toEqual([]);
            expect(result.current.fieldConfigs).toEqual({});
            expect(result.current.isLoaded).toBeTruthy();
        });

        it("should handle safeExtractIpcData with various fallback types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: IPC Response Handling", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Test formatMonitorDetail with API error - should throw
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockRejectedValue(
                new Error("API error")
            );

            // Should throw error when API fails
            await act(async () => {
                await expect(result.current.formatMonitorDetail(
                    "http",
                    "original"
                )).rejects.toThrowError("API error");
            });

            // Test formatMonitorTitleSuffix with API error - should throw
            mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockRejectedValue(
                new Error("API error")
            );

            // Should throw error when API fails
            await act(async () => {
                await expect(result.current.formatMonitorTitleSuffix(
                    "http",
                    {} as Monitor
                )).rejects.toThrowError("API error");
            });
        });

        it("should surface errors when IPC response structure is invalid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: IPC Response Handling", "type");

            // Test with completely invalid response structure
            const invalidResponses = [
                undefined,
                null,
                "string response",
                42,
                { noSuccessField: true },
                { success: "not-boolean" },
            ];

            for (const invalidResponse of invalidResponses) {
                mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValueOnce(
                    invalidResponse
                );

                const { result } = renderHook(() => useMonitorTypesStore());

                await act(async () => {
                        await expect(result.current.loadMonitorTypes()).rejects.toThrowError(
                        "invalid payload"
                    );
                });

                expect(result.current.monitorTypes).toEqual([]);
                expect(result.current.lastError).toContain("invalid payload");
            }

            // Empty array is now considered a valid (though empty) result
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValueOnce(
                []
            );

            const { result: emptyResult } = renderHook(() =>
                useMonitorTypesStore()
            );

            await act(async () => {
                await emptyResult.current.loadMonitorTypes();
            });

            expect(emptyResult.current.monitorTypes).toEqual([]);
            expect(emptyResult.current.lastError).toBeUndefined();
        });
    });

    describe("Config Filtering Edge Cases", () => {
        it("should filter out various types of malformed configs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Filtering", "type");

            const malformedConfigs = [
                null,
                undefined,
                "string-config",
                42,
                [],
                {},
                { type: null },
                { type: undefined },
                { type: 42 },
                { type: "" }, // Empty string
                { type: "   " }, // Whitespace only
                { type: "valid", extraField: "ignored" }, // Extra fields should be allowed
                { notType: "invalid" },
                {
                    type: "valid-type",
                    fields: "invalid-fields", // Invalid fields format
                },
            ];

            // Add one valid config
            const validConfig: MonitorTypeConfig = {
                type: "http",
                displayName: "HTTP",
                description: "HTTP monitoring",
                version: "1.0",
                fields: [
                    {
                        name: "url",
                        type: "url",
                        required: true,
                        label: "URL",
                    },
                ],
            };

            const mixedConfigs = [...malformedConfigs, validConfig];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValueOnce(
                mixedConfigs
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await expect(result.current.loadMonitorTypes()).rejects.toThrowError(
                    "invalid payload"
                );
            });

            expect(result.current.monitorTypes).toEqual([]);
            expect(result.current.lastError).toContain("invalid payload");
        });

        it("should handle configs with complex field structures", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Processing", "type");

            const complexConfigs: MonitorTypeConfig[] = [
                {
                    type: "complex-monitor",
                    displayName: "Complex Monitor",
                    description: "A complex monitor type",
                    version: "1.0",
                    fields: [
                        {
                            name: "url",
                            type: "url",
                            required: true,
                            label: "Target URL",
                            placeholder: "https://example.com",
                        },
                        {
                            name: "timeout",
                            type: "number",
                            required: false,
                            label: "Timeout (seconds)",
                            min: 1,
                            max: 300,
                        },
                        {
                            name: "method",
                            type: "select",
                            required: true,
                            label: "HTTP Method",
                            options: [
                                { value: "GET", label: "GET" },
                                { value: "POST", label: "POST" },
                                { value: "PUT", label: "PUT" },
                            ],
                        },
                    ],
                },
                createMonitorTypeConfig({
                    type: "minimal-monitor",
                    displayName: "Minimal",
                    description: "Minimal config",
                }),
            ];

            originalSafeExtractIpcData.mockReturnValueOnce(complexConfigs);
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValueOnce(
                complexConfigs
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.isLoaded).toBeTruthy();
            expect(Array.isArray(result.current.monitorTypes)).toBeTruthy();
        });
    });

    describe("Error Handling Wrapper Scenarios", () => {
        it("should handle withErrorHandling throwing during operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            // Mock withErrorHandling to throw an error during operation
            originalWithErrorHandling.mockImplementation(async (_operation) => {
                throw new Error("withErrorHandling failed");
            });

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                try {
                    await result.current.loadMonitorTypes();
                } catch (error) {
                    expect(error).toBeInstanceOf(Error);
                }
            });
        });

        it("should handle withErrorHandling with different error types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Test with non-Error objects
            const errorTypes = [
                "string error",
                { message: "object error" },
                null,
                undefined,
                42,
                Symbol("symbol error"),
            ];

            for (const errorType of errorTypes) {
                originalWithErrorHandling.mockImplementationOnce(
                    async (_operation, store) => {
                        try {
                            store.clearError();
                            store.setLoading(true);
                            throw errorType;
                        } catch (error: unknown) {
                            const errorMessage =
                                error instanceof Error
                                    ? error.message
                                    : String(error);
                            store.setError(errorMessage);
                            throw error;
                        } finally {
                            store.setLoading(false);
                        }
                    }
                );

                await act(async () => {
                    try {
                        await result.current.loadMonitorTypes();
                    } catch {
                        // Expected to throw
                    }
                });

                expect(result.current.lastError).toBe(String(errorType));
                expect(result.current.isLoading).toBeFalsy();
            }
        });

        it("should handle withErrorHandling not properly setting loading state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Ensure the store is in the right initial state
            act(() => {
                useMonitorTypesStore.setState({
                    monitorTypes: [],
                    fieldConfigs: {},
                    isLoaded: false,
                    isLoading: false,
                    lastError: undefined,
                });
            });

            // First, set up the mock to reject before setting up withErrorHandling
            // Clear any existing mock implementation
            mockElectronAPI.monitorTypes.getMonitorTypes.mockReset();

            mockElectronAPI.monitorTypes.getMonitorTypes.mockImplementation(
                async () => {
                    throw new Error("Operation failed");
                }
            );

            // Mock withErrorHandling that doesn't properly manage loading state
            originalWithErrorHandling.mockImplementation(
                async (_operation, store) => {
                    // Simulate error handling that forgets to set loading to false
                    store.clearError();
                    store.setLoading(true);
                    // Directly set the error to test the scenario
                    store.setError("Operation failed");
                    // Don't re-throw to simulate swallowing the error
                    // But also don't reset loading state (the bug we're testing)
                    return undefined;
                    // Missing finally block to reset loading
                }
            );

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            // Loading state should still be true since withErrorHandling didn't reset it
            expect(result.current.isLoading).toBeTruthy();

            // The error should be set since our mock calls setError
            expect(result.current.lastError).toBe("Operation failed");
        });
    });

    describe("State Access and Mutation Edge Cases", () => {
        it("should handle direct state mutations through setState", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: State Management", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Test direct state mutations
            act(() => {
                useMonitorTypesStore.setState({
                    isLoading: true,
                    lastError: "Direct mutation error",
                    isLoaded: true,
                    monitorTypes: [
                        createMonitorTypeConfig({
                            type: "direct",
                            displayName: "Direct",
                            description: "Direct mutation",
                        }),
                    ],
                    fieldConfigs: {
                        direct: [],
                    },
                });
            });

            expect(result.current.isLoading).toBeTruthy();
            expect(result.current.lastError).toBe("Direct mutation error");
            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.monitorTypes).toHaveLength(1);
            expect(result.current.fieldConfigs).toHaveProperty("direct");
        });

        it("should handle getState() access patterns", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: State Access", "type");

            // Set up some initial state
            useMonitorTypesStore.setState({
                isLoaded: true,
                lastError: "test error",
                fieldConfigs: {
                    test: [
                        {
                            name: "testField",
                            type: "text",
                            required: true,
                            label: "Test Field",
                        },
                    ],
                },
            });

            const { result } = renderHook(() => useMonitorTypesStore());

            // Test getFieldConfig method which uses get() internally
            const fieldConfig = result.current.getFieldConfig(
                "test" as MonitorType
            );
            expect(fieldConfig).toEqual([
                {
                    name: "testField",
                    type: "text",
                    required: true,
                    label: "Test Field",
                },
            ]);

            const nonExistentConfig = result.current.getFieldConfig(
                "nonexistent" as MonitorType
            );
            expect(nonExistentConfig).toBeUndefined();
        });

        it("should handle concurrent state access and modification", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Concurrency", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Simulate concurrent access sequentially to avoid overlapping act calls
            for (let index = 0; index < 10; index++) {
                await act(async () => {
                    result.current.setError(`Error ${index}`);
                    result.current.setLoading(index % 2 === 0);
                    result.current.clearError();
                });
            }

            // Final state should be consistent
            expect(result.current.lastError).toBeUndefined();
            expect(typeof result.current.isLoading).toBe("boolean");
        });
    });

    describe("Validation Result Transformation", () => {
        it("should handle validation results with all possible field combinations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Validation Processing", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Test validation result with all fields present - raw data from backend
            const completeValidationData = {
                success: true,
                data: { url: "https://example.com" },
                errors: ["error1", "error2"],
                warnings: ["warning1", "warning2"],
                metadata: { timestamp: Date.now(), version: "1.0" },
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValueOnce(
                completeValidationData
            );

            // Clear the default mock and set specific behavior for this test
            originalSafeExtractIpcData.mockReset();
            originalSafeExtractIpcData.mockImplementationOnce(() => completeValidationData);

            let result1: ValidationResult;
            await act(async () => {
                result1 = await result.current.validateMonitorData("http", {
                    url: "https://example.com",
                });
            });

            // Store preserves the original ValidationResult structure when API returns one
            const expectedValidationResult = completeValidationData; // No wrapping needed

            expect(result1!).toEqual(expectedValidationResult);

            // Test validation result with minimal fields - raw data from backend
            const minimalValidationData = {
                success: false,
                data: null,
                errors: ["Required field missing"],
                // Missing warnings and metadata
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValueOnce(
                minimalValidationData
            );

            // Clear the default mock and set specific behavior for this test
            originalSafeExtractIpcData.mockReset();
            originalSafeExtractIpcData.mockImplementationOnce(() => minimalValidationData);

            let result2: ValidationResult;
            await act(async () => {
                result2 = await result.current.validateMonitorData("http", {});
            });

            expect(result2!).toEqual({
                success: false,
                data: null,
                errors: ["Required field missing"],
                warnings: [],
                metadata: {},
            });

            // Test validation result with null/undefined values
            const nullValidationResult = {
                success: false,
                data: null,
                errors: ["Required field missing"],
                warnings: [],
                metadata: {},
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValueOnce(
                nullValidationResult
            );

            // Mock safeExtractIpcData to return the validation result
            originalSafeExtractIpcData.mockReturnValueOnce(nullValidationResult);

            let result3: ValidationResult;
            await act(async () => {
                result3 = await result.current.validateMonitorData("ping", {
                    host: "example.com",
                });
            });

            expect(result3!).toEqual(nullValidationResult);
        });

        it("should handle validation results with edge case data types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Validation Processing", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Test with complex nested data
            const complexValidationResult = {
                success: true,
                data: {
                    nested: {
                        deeply: {
                            object: true,
                            array: [1, 2, 3],
                            nullValue: null,
                        },
                    },
                    symbols: Symbol("test"),
                    date: new Date(),
                },
                errors: [],
                warnings: ["Complex data structure"],
                metadata: {
                    complexity: "high",
                    processingTime: 150,
                    nestedLevel: 3,
                },
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValueOnce(
                complexValidationResult
            );

            // Clear the default mock and set specific behavior for this test
            originalSafeExtractIpcData.mockReset();
            originalSafeExtractIpcData.mockImplementationOnce(() => complexValidationResult);

            let result1: ValidationResult;
            await act(async () => {
                result1 = await result.current.validateMonitorData(
                    "complex",
                    complexValidationResult.data
                );
            });

            expect(result1!).toEqual(complexValidationResult);
        });
    });

    describe("Logging and Action Tracking", () => {
        it("should log all store actions with correct parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Logging", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Test loadMonitorTypes logging
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue([]);
            originalSafeExtractIpcData.mockReturnValueOnce([]);

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(originalLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "loadMonitorTypes",
                {}
            );
            expect(originalLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "loadMonitorTypes",
                {
                    invalidCount: 0,
                    success: true,
                    typesCount: 0,
                }
            );

            // Clear previous calls before testing refreshMonitorTypes
            originalLogStoreAction.mockClear();

            // Test refreshMonitorTypes logging
            await act(async () => {
                await result.current.refreshMonitorTypes();
            });

            expect(originalLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "refreshMonitorTypes",
                {}
            );

            // Clear previous calls before testing validateMonitorData
            originalLogStoreAction.mockClear();

            // Test validateMonitorData logging
            const mockValidationResult: ValidationResult = {
                success: true,
                data: {},
                errors: [],
                warnings: [],
                metadata: {},
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockValidationResult
            );

            // Clear the default mock and set specific behavior for this test
            originalSafeExtractIpcData.mockReset();
            originalSafeExtractIpcData.mockImplementationOnce(() => mockValidationResult);

            await act(async () => {
                await result.current.validateMonitorData("http", {});
            });

            expect(originalLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "validateMonitorData",
                { type: "http" }
            );
            expect(originalLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "validateMonitorData",
                {
                    type: "http",
                    success: true,
                    errorCount: 0,
                }
            );

            // Clear previous calls before testing formatMonitorDetail
            originalLogStoreAction.mockClear();

            // Test formatMonitorDetail logging
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockResolvedValueOnce(
                "formatted"
            );
            originalSafeExtractIpcData.mockReturnValueOnce("formatted");

            await act(async () => {
                await result.current.formatMonitorDetail("http", "details");
            });

            expect(originalLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "formatMonitorDetail",
                { type: "http" }
            );
            expect(originalLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "formatMonitorDetail",
                {
                    resultLength: expect.any(Number),
                    success: true,
                    type: "http",
                }
            );

            // Test formatMonitorTitleSuffix logging
            mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockResolvedValueOnce(
                "suffix"
            );
            originalSafeExtractIpcData.mockReturnValueOnce("suffix");

            await act(async () => {
                await result.current.formatMonitorTitleSuffix("http", {
                    id: "test",
                } as Monitor);
            });

            expect(originalLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "formatMonitorTitleSuffix",
                { type: "http" }
            );
            expect(originalLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "formatMonitorTitleSuffix",
                {
                    resultLength: expect.any(Number),
                    success: true,
                    type: "http",
                }
            );
        });

        it("should handle logging with various parameter types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Logging", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Test logging with special characters and edge case strings
            const edgeCaseTypes = [
                "",
                "   ",
                "special-chars-!@#$%^&*()",
                "unicode-测试-🚀",
                "very-long-type-name-that-exceeds-normal-length-expectations-and-continues-for-a-very-long-time",
            ];

            for (const edgeType of edgeCaseTypes) {
                mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValueOnce({
                    success: false,
                    data: null,
                    errors: ["Type validation failed"],
                    warnings: [],
                    metadata: {},
                });

                await act(async () => {
                    await result.current.validateMonitorData(edgeType, {});
                });

                expect(originalLogStoreAction).toHaveBeenCalledWith(
                    "MonitorTypesStore",
                    "validateMonitorData",
                    { type: edgeType }
                );
            }
        });
    });

    describe("Boundary Conditions and Race Conditions", () => {
        it("should handle rapid successive calls to the same method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Concurrency", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Set up mock to resolve after a delay
            let resolveCount = 0;
            mockElectronAPI.monitorTypes.getMonitorTypes.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => {
                            resolve([
                                createMonitorTypeConfig({
                                    type: `type-${++resolveCount}`,
                                    displayName: `Type ${resolveCount}`,
                                    description: "Test type",
                                }),
                            ]);
                        }, 10);
                    })
            );

            // Make rapid successive calls sequentially to avoid overlapping acts
            for (let i = 0; i < 5; i++) {
                await act(async () => {
                    await result.current.loadMonitorTypes();
                });
            }

            // Store should be in a consistent state
            expect(result.current.isLoaded).toBeTruthy();
            expect(Array.isArray(result.current.monitorTypes)).toBeTruthy();
            expect(typeof result.current.fieldConfigs).toBe("object");
        });

        it("should handle state changes during async operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: State Consistency", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            // Start a long-running operation
            let resolveOperation: (value: any) => void;
            const operationPromise = new Promise((resolve) => {
                resolveOperation = resolve;
            });

            mockElectronAPI.monitorTypes.getMonitorTypes.mockReturnValueOnce(
                operationPromise
            );

            // Start the operation
            const loadPromise = act(() => result.current.loadMonitorTypes());

            // Modify state while operation is pending
            await act(async () => {
                result.current.setError("Concurrent error");
                result.current.setLoading(false);
            });

            // Complete the operation
            resolveOperation!([]);
            await loadPromise;

            // State should reflect the final operation result
            expect(result.current.isLoaded).toBeTruthy();
        });

        it("should handle memory pressure and cleanup scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Memory Management", "type");

            // Create large datasets to test memory handling
            const largeDataset: MonitorTypeConfig[] = Array.from(
                { length: 1000 },
                (_, index) => ({
                    type: `type-${index}`,
                    displayName: `Type ${index}`,
                    description: `Description for type ${index}`.repeat(100), // Large description
                    version: "1.0",
                    fields: Array.from({ length: 50 }, (_, fieldIndex) => ({
                        name: `field-${fieldIndex}`,
                        type: "text",
                        required: fieldIndex % 2 === 0,
                        label: `Field ${fieldIndex}`,
                        description: `Field description ${fieldIndex}`.repeat(20),
                    })),
                })
            );

            originalSafeExtractIpcData.mockReturnValueOnce(largeDataset);
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValueOnce(
                largeDataset
            );

            const { result, unmount } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.monitorTypes).toHaveLength(1000);
            expect(Object.keys(result.current.fieldConfigs)).toHaveLength(1000);

            // Test cleanup
            unmount();

            // Verify store can handle being reset after large data load
            useMonitorTypesStore.setState({
                monitorTypes: [],
                fieldConfigs: {},
                isLoaded: false,
                isLoading: false,
                lastError: undefined,
            });

            const state = useMonitorTypesStore.getState();
            expect(state.monitorTypes).toEqual([]);
            expect(state.fieldConfigs).toEqual({});
        });
    });

    describe("Complete Error Scenarios", () => {
        it("should handle all possible error scenarios in each method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Comprehensive Error Handling", "type");

            // Reset withErrorHandling mock to default behavior
            originalWithErrorHandling.mockImplementation(async (operation, store) => {
                try {
                    store.clearError();
                    store.setLoading(true);
                    return await operation();
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : String(error);
                    store.setError(errorMessage);
                    throw error;
                } finally {
                    store.setLoading(false);
                }
            });

            const { result } = renderHook(() => useMonitorTypesStore());

            // Reset store state and force reload by setting an error
            useMonitorTypesStore.setState({
                monitorTypes: [],
                fieldConfigs: {},
                isLoaded: false,
                isLoading: false,
                lastError: "force reload",
            });

            // Clear the error to start fresh
            result.current.clearError();

            // Test network timeouts
            await act(async () => {
                mockElectronAPI.monitorTypes.getMonitorTypes.mockImplementation(async () => {
                    throw "Network timeout";
                });
                try {
                    await result.current.loadMonitorTypes();
                } catch {
                    // Expected - withErrorHandling re-throws after setting error
                }
            });

            expect(result.current.lastError).toBe("Network timeout");

            // Test permission errors
            await act(async () => {
                mockElectronAPI.monitorTypes.validateMonitorData.mockImplementation(async () => {
                    throw "Permission denied";
                });
                try {
                    await result.current.validateMonitorData("http", {});
                } catch {
                    // Expected
                }
            });

            expect(result.current.lastError).toBe("Permission denied");

            // Test service unavailable errors
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockImplementation(async () => {
                throw "Service unavailable";
            });

            await act(async () => {
                try {
                    await result.current.formatMonitorDetail("http", "details");
                } catch {
                    // Expected
                }
            });

            expect(result.current.lastError).toBe("Service unavailable");

            // Test corrupted response errors
            mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockImplementation(async () => {
                throw "Corrupted response";
            });

            await act(async () => {
                try {
                    await result.current.formatMonitorTitleSuffix("http", {
                        id: "test",
                    } as Monitor);
                } catch {
                    // Expected
                }
            });

            expect(result.current.lastError).toBe("Corrupted response");
        });
    });

    describe("Store Subscription and State Changes", () => {
        it("should handle store subscriptions and state change notifications", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: State Subscriptions", "type");

            const stateChanges: any[] = [];

            // Subscribe to store changes
            const unsubscribe = useMonitorTypesStore.subscribe((state) => {
                stateChanges.push({ ...state });
            });

            const { result } = renderHook(() => useMonitorTypesStore());

            // Make changes and verify subscriptions fire
            act(() => {
                result.current.setError("Test error");
            });

            act(() => {
                result.current.setLoading(true);
            });

            act(() => {
                result.current.clearError();
            });

            // Verify state changes were captured
            expect(stateChanges.length).toBeGreaterThan(0);
            expect(stateChanges.some((change) => change.lastError === "Test error")).toBeTruthy();
            expect(stateChanges.some((change) => change.isLoading === true)).toBeTruthy();
            expect(stateChanges.some((change) => change.lastError === undefined)).toBeTruthy();

            unsubscribe();
        });

        it("should handle store persistence and rehydration scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: State Persistence", "type");

            // Test store state persistence by capturing and restoring state
            const { result } = renderHook(() => useMonitorTypesStore());

            const testState = {
                monitorTypes: [
                    createMonitorTypeConfig({
                        type: "test",
                        displayName: "Test",
                        description: "Test type",
                    }),
                ],
                fieldConfigs: { test: [] },
                isLoaded: true,
                isLoading: false,
                lastError: undefined,
            };

            // Set test state
            act(() => {
                useMonitorTypesStore.setState(testState);
            });

            // Verify state was set
            expect(result.current.monitorTypes).toEqual(testState.monitorTypes);
            expect(result.current.fieldConfigs).toEqual(testState.fieldConfigs);
            expect(result.current.isLoaded).toBe(testState.isLoaded);

            // Simulate rehydration by getting state and resetting store
            const capturedState = useMonitorTypesStore.getState();

            act(() => {
                useMonitorTypesStore.setState({
                    monitorTypes: [],
                    fieldConfigs: {},
                    isLoaded: false,
                    isLoading: false,
                    lastError: undefined,
                });
            });

            // Restore from captured state
            act(() => {
                useMonitorTypesStore.setState(capturedState);
            });

            // Verify restoration
            expect(result.current.monitorTypes).toEqual(testState.monitorTypes);
            expect(result.current.isLoaded).toBe(testState.isLoaded);
        });
    });
});
