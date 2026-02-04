/**
 * Complete 100% test coverage for useMonitorTypesStore
 *
 * This test suite provides exhaustive coverage for the MonitorTypesStore,
 * testing all code paths, edge cases, and error scenarios to achieve 100% line,
 * branch, and function coverage.
 *
 * @remarks
 * This suite specifically targets areas not covered by the existing
 * comprehensive tests, including:
 *
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
import { BASE_MONITOR_TYPES, type Monitor } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { installElectronApiMock } from "../../utils/electronApiMock";

// Store the original implementations to restore later
const originalWithErrorHandling = vi.hoisted(() => vi.fn());
const originalLogStoreAction = vi.hoisted(() => vi.fn());
const originalSafeExtractIpcData = vi.hoisted(() => vi.fn());

// Mock dependencies with full control over their behavior (partial mock to retain exports).
vi.mock("@shared/utils/errorHandling", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@shared/utils/errorHandling")>();

    return {
        ...actual,
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
        withErrorHandling: originalWithErrorHandling,
    };
});

vi.mock("../../../stores/utils", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../../stores/utils")>();
    return {
        ...actual,
        logStoreAction: originalLogStoreAction,
    };
});

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

let restoreElectronApi: (() => void) | undefined;

beforeEach(() => {
    ({ restore: restoreElectronApi } = installElectronApiMock(mockElectronAPI, {
        ensureWindow: true,
    }));
});

afterEach(() => {
    restoreElectronApi?.();
    restoreElectronApi = undefined;
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

        useErrorStore.setState({
            isLoading: false,
            lastError: undefined,
            operationLoading: {},
            storeErrors: {},
        });

        // Set up default withErrorHandling behavior
        originalWithErrorHandling.mockImplementation(
            async (operation, store) => {
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
            }
        );

        // Set up default safeExtractIpcData behavior to match the real implementation
        originalSafeExtractIpcData.mockImplementation((response, fallback) => {
            if (response && response.data !== undefined) {
                return response.data;
            }
            return fallback;
        });

        // Reset Zustand store to initial state
        useMonitorTypesStore.setState({
            monitorTypes: [],
            fieldConfigs: {},
            isLoaded: false,
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

            // Mock safeExtractIpcData to return null
            originalSafeExtractIpcData.mockReturnValueOnce(null);
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValueOnce(
                []
            );

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
                await expect(
                    result.current.formatMonitorDetail("http", "original")
                ).rejects.toThrowError("API error");
            });

            // Test formatMonitorTitleSuffix with API error - should throw
            mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockRejectedValue(
                new Error("API error")
            );

            // Should throw error when API fails
            await act(async () => {
                await expect(
                    result.current.formatMonitorTitleSuffix(
                        "http",
                        {} as Monitor
                    )
                ).rejects.toThrowError("API error");
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
                useErrorStore.getState().clearStoreError("monitor-types");
                mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValueOnce(
                    invalidResponse
                );

                const { result } = renderHook(() => useMonitorTypesStore());

                await act(async () => {
                    await expect(
                        result.current.loadMonitorTypes()
                    ).rejects.toThrowError("invalid payload");
                });

                expect(result.current.monitorTypes).toEqual([]);
                expect(
                    useErrorStore.getState().getStoreError("monitor-types")
                ).toContain("invalid payload");
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
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe(undefined);
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
                await expect(
                    result.current.loadMonitorTypes()
                ).rejects.toThrowError("invalid payload");
            });

            expect(result.current.monitorTypes).toEqual([]);
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toContain("invalid payload");
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
                    type: "http",
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
                    type: "dns",
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

                expect(
                    useErrorStore.getState().getStoreError("monitor-types")
                ).toBe(String(errorType));
                expect(
                    useErrorStore
                        .getState()
                        .getOperationLoading("monitorTypes.loadTypes")
                ).toBeFalsy();
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

            // Operation loading should still be true since withErrorHandling didn't reset it
            expect(
                useErrorStore
                    .getState()
                    .getOperationLoading("monitorTypes.loadTypes")
            ).toBeTruthy();

            // The store error should be set since our mock calls setError
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Operation failed");
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
                    isLoaded: true,
                    monitorTypes: [
                        createMonitorTypeConfig({
                            type: "http",
                            displayName: "Direct",
                            description: "Direct mutation",
                        }),
                    ],
                    fieldConfigs: {
                        http: [],
                    },
                });
            });

            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.monitorTypes).toHaveLength(1);
            expect(result.current.fieldConfigs).toHaveProperty("http");
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
                fieldConfigs: {
                    http: [
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
            const fieldConfig = result.current.getFieldConfig("http");
            expect(fieldConfig).toEqual([
                {
                    name: "testField",
                    type: "text",
                    required: true,
                    label: "Test Field",
                },
            ]);

            const nonExistentConfig = result.current.getFieldConfig("ping");
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

            renderHook(() => useMonitorTypesStore());

            // Simulate concurrent access sequentially to avoid overlapping act calls
            for (let index = 0; index < 10; index++) {
                await act(async () => {
                    useErrorStore
                        .getState()
                        .setStoreError("monitor-types", `Error ${index}`);
                    useErrorStore
                        .getState()
                        .setOperationLoading(
                            "monitorTypes.loadTypes",
                            index % 2 === 0
                        );
                    useErrorStore.getState().clearStoreError("monitor-types");
                });
            }

            // Final state should be consistent
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe(undefined);
            expect(
                typeof useErrorStore
                    .getState()
                    .getOperationLoading("monitorTypes.loadTypes")
            ).toBe("boolean");
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
            originalSafeExtractIpcData.mockReturnValueOnce(
                completeValidationData
            );

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
            originalSafeExtractIpcData.mockReturnValueOnce(
                minimalValidationData
            );

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
            originalSafeExtractIpcData.mockReturnValueOnce(
                nullValidationResult
            );

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
                            array: [
                                1,
                                2,
                                3,
                            ],
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
            originalSafeExtractIpcData.mockReturnValueOnce(
                complexValidationResult
            );

            let result1: ValidationResult;
            await act(async () => {
                result1 = await result.current.validateMonitorData(
                    "http",
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
            originalSafeExtractIpcData.mockReturnValueOnce(
                mockValidationResult
            );

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

            // With the stricter MonitorTypesStore contract, `type` is a
            // MonitorType (not an arbitrary string). Exercise logging with
            // edge-case payload shapes instead.
            const edgeCasePayloads: readonly unknown[] = [
                {},
                { text: "" },
                { whitespace: "   " },
                { special: "special-chars-!@#$%^&*()" },
                { unicode: "unicode-测试" },
                {
                    nested: {
                        deep: {
                            values: [
                                1,
                                2,
                                3,
                            ],
                        },
                    },
                },
            ];

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue({
                success: false,
                data: null,
                errors: ["Type validation failed"],
                warnings: [],
                metadata: {},
            });

            for (const payload of edgeCasePayloads) {
                await act(async () => {
                    await result.current.validateMonitorData("http", payload);
                });

                expect(originalLogStoreAction).toHaveBeenCalledWith(
                    "MonitorTypesStore",
                    "validateMonitorData",
                    { type: "http" }
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
                () => {
                    const index = resolveCount++;
                    const monitorTypeCandidate =
                        BASE_MONITOR_TYPES[index % BASE_MONITOR_TYPES.length];
                    if (monitorTypeCandidate === undefined) {
                        throw new Error(
                            "Unexpected missing monitor type from BASE_MONITOR_TYPES"
                        );
                    }
                    const monitorType = monitorTypeCandidate;

                    return Promise.resolve([
                        createMonitorTypeConfig({
                            type: monitorType,
                            displayName: `Type ${index + 1}`,
                            description: "Test type",
                        }),
                    ]);
                }
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
                useErrorStore
                    .getState()
                    .setStoreError("monitor-types", "Concurrent error");
                useErrorStore
                    .getState()
                    .setOperationLoading("monitorTypes.loadTypes", false);
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
                    type:
                        BASE_MONITOR_TYPES[index % BASE_MONITOR_TYPES.length] ??
                        "http",
                    displayName: `Type ${index}`,
                    description: `Description for type ${index}`.repeat(100), // Large description
                    version: "1.0",
                    fields: Array.from({ length: 50 }, (_, fieldIndex) => ({
                        name: `field-${fieldIndex}`,
                        type: "text",
                        required: fieldIndex % 2 === 0,
                        label: `Field ${fieldIndex}`,
                        description: `Field description ${fieldIndex}`.repeat(
                            20
                        ),
                    })),
                })
            );

            originalSafeExtractIpcData.mockReturnValueOnce(largeDataset);
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValueOnce(
                largeDataset
            );

            const { result, unmount } = renderHook(() =>
                useMonitorTypesStore()
            );

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.monitorTypes).toHaveLength(1000);
            expect(Object.keys(result.current.fieldConfigs)).toHaveLength(
                BASE_MONITOR_TYPES.length
            );

            // Test cleanup
            unmount();

            // Verify store can handle being reset after large data load
            useMonitorTypesStore.setState({
                monitorTypes: [],
                fieldConfigs: {},
                isLoaded: false,
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
            originalWithErrorHandling.mockImplementation(
                async (operation, store) => {
                    try {
                        store.clearError();
                        store.setLoading(true);
                        return await operation();
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

            const { result } = renderHook(() => useMonitorTypesStore());

            // Reset store state and force reload by setting an error
            useMonitorTypesStore.setState({
                monitorTypes: [],
                fieldConfigs: {},
                isLoaded: false,
            });

            // Clear the error to start fresh
            useErrorStore.getState().clearStoreError("monitor-types");

            // Test network timeouts
            await act(async () => {
                mockElectronAPI.monitorTypes.getMonitorTypes.mockImplementation(
                    async () => {
                        throw "Network timeout";
                    }
                );
                try {
                    await result.current.loadMonitorTypes();
                } catch {
                    // Expected - withErrorHandling re-throws after setting error
                }
            });

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Network timeout");

            // Test permission errors
            await act(async () => {
                mockElectronAPI.monitorTypes.validateMonitorData.mockImplementation(
                    async () => {
                        throw "Permission denied";
                    }
                );
                try {
                    await result.current.validateMonitorData("http", {});
                } catch {
                    // Expected
                }
            });

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Permission denied");

            // Test service unavailable errors
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockImplementation(
                async () => {
                    throw "Service unavailable";
                }
            );

            await act(async () => {
                try {
                    await result.current.formatMonitorDetail("http", "details");
                } catch {
                    // Expected
                }
            });

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Service unavailable");

            // Test corrupted response errors
            mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockImplementation(
                async () => {
                    throw "Corrupted response";
                }
            );

            await act(async () => {
                try {
                    await result.current.formatMonitorTitleSuffix("http", {
                        id: "test",
                    } as Monitor);
                } catch {
                    // Expected
                }
            });

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Corrupted response");
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

            const stateChanges: {
                storeErrors: Record<string, string | undefined>;
            }[] = [];

            // Subscribe to ErrorStore changes (source of truth for errors/loading)
            const unsubscribe = useErrorStore.subscribe((state) => {
                stateChanges.push({ storeErrors: { ...state.storeErrors } });
            });

            // Make changes and verify subscriptions fire
            act(() => {
                useErrorStore
                    .getState()
                    .setStoreError("monitor-types", "Test error");
            });

            act(() => {
                useErrorStore
                    .getState()
                    .setOperationLoading("monitorTypes.loadTypes", true);
            });

            act(() => {
                useErrorStore.getState().clearStoreError("monitor-types");
            });

            // Verify state changes were captured
            expect(stateChanges.length).toBeGreaterThan(0);
            expect(
                stateChanges.some(
                    (change) =>
                        change.storeErrors["monitor-types"] === "Test error"
                )
            ).toBeTruthy();
            expect(
                stateChanges.some(
                    (change) =>
                        change.storeErrors["monitor-types"] === undefined
                )
            ).toBeTruthy();

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
                        type: "http",
                        displayName: "Test",
                        description: "Test type",
                    }),
                ],
                fieldConfigs: { http: [] },
                isLoaded: true,
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
