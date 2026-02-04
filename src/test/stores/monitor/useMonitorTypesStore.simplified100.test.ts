/**
 * Simplified 100% test coverage for useMonitorTypesStore
 *
 * This test suite provides comprehensive coverage focusing on actual
 * functionality rather than mock complexity, ensuring all code paths are
 * exercised.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
    BASE_MONITOR_TYPES,
    type Monitor,
    type MonitorFieldDefinition,
    type MonitorType,
} from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";
import { useErrorStore } from "../../../stores/error/useErrorStore";

// Hoisted mocks
const mockWithErrorHandling = vi.hoisted(() => vi.fn());
const mockLogStoreAction = vi.hoisted(() => vi.fn());
const mockSafeExtractIpcData = vi.hoisted(() => vi.fn());

// Mock dependencies (partial mock to preserve exports like ApplicationError)
vi.mock("@shared/utils/errorHandling", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@shared/utils/errorHandling")>();

    return {
        ...actual,
        ensureError: vi.fn((error) =>
            error instanceof Error ? error : new Error(String(error))
        ),
        withErrorHandling: mockWithErrorHandling,
    };
});

vi.mock("../../../stores/utils", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../../stores/utils")>();
    return {
        ...actual,
        logStoreAction: mockLogStoreAction,
    };
});

// Mock ElectronAPI
const mockElectronAPI = {
    monitorTypes: {
        getMonitorTypes: vi.fn(),
        validateMonitorData: vi.fn(),
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
    },
    monitoring: {},
};

// Mock window.electronAPI
vi.stubGlobal("window", {
    electronAPI: mockElectronAPI,
});

const createMonitorTypeConfig = (
    overrides: Partial<MonitorTypeConfig> = {}
): MonitorTypeConfig => ({
    type: overrides.type ?? "http",
    displayName: overrides.displayName ?? "HTTP Monitor",
    description: overrides.description ?? "HTTP endpoint monitoring",
    version: overrides.version ?? "1.0",
    fields:
        overrides.fields ??
        ([
            {
                helpText: "Enter the target URL",
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

describe("useMonitorTypesStore - 100% Coverage Simplified", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useErrorStore.setState({
            isLoading: false,
            lastError: undefined,
            operationLoading: {},
            storeErrors: {},
        });

        // Default withErrorHandling implementation
        mockWithErrorHandling.mockImplementation(async (operation, store) => {
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

        // Default safeExtractIpcData implementation
        mockSafeExtractIpcData.mockImplementation(
            (response, fallback) => response || fallback
        );

        // Reset store state
        useMonitorTypesStore.setState({
            monitorTypes: [],
            fieldConfigs: {},
            isLoaded: false,
        });
    });

    describe("Store Initialization and Basic Operations", () => {
        it("should initialize with correct default state", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            expect(result.current.monitorTypes).toEqual([]);
            expect(result.current.fieldConfigs).toEqual({});
            expect(result.current.isLoaded).toBeFalsy();
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe(undefined);
        });

        it("should handle successful monitor types loading", async () => {
            const mockConfigs: MonitorTypeConfig[] = [
                {
                    type: "http",
                    displayName: "HTTP Monitor",
                    description: "HTTP endpoint monitoring",
                    version: "1.0",
                    fields: [
                        {
                            name: "url",
                            type: "url",
                            required: true,
                            label: "URL",
                        },
                    ],
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockConfigs
            );
            mockSafeExtractIpcData.mockReturnValue(mockConfigs);

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.monitorTypes).toEqual(mockConfigs);
            expect(result.current.fieldConfigs["http"]).toEqual(
                mockConfigs[0]!.fields
            );
            expect(result.current.isLoaded).toBeTruthy();
            expect(
                useErrorStore
                    .getState()
                    .getOperationLoading("monitorTypes.loadTypes")
            ).toBeFalsy();
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe(undefined);
        });
    });

    describe("Error Handling and Edge Cases", () => {
        it("should handle loading errors properly", async () => {
            const testError = new Error("Loading failed");
            mockElectronAPI.monitorTypes.getMonitorTypes.mockRejectedValue(
                testError
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                try {
                    await result.current.loadMonitorTypes();
                } catch {
                    // Expected to throw
                }
            });

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Loading failed");
            expect(
                useErrorStore
                    .getState()
                    .getOperationLoading("monitorTypes.loadTypes")
            ).toBeFalsy();
        });

        it("should surface an error when backend returns invalid monitor configs", async () => {
            const mixedConfigs = [
                { type: null },
                { type: "" },
                { notType: "invalid" },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
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

        it("should propagate errors when backend returns null", async () => {
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                null
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
    });

    describe("Validation Operations", () => {
        it("should handle successful validation", async () => {
            const mockValidationResult: ValidationResult = {
                success: true,
                data: { url: "https://example.com" },
                errors: [],
                warnings: [],
                metadata: {},
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockValidationResult
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    {
                        url: "https://example.com",
                    }
                );
            });

            expect(validationResult!).toEqual(mockValidationResult);
        });

        it("should handle validation with missing optional fields", async () => {
            const mockResult = {
                success: false,
                data: null,
                errors: ["URL required"],
                // Missing warnings and metadata
            } satisfies ValidationResult;

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockResult
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    {}
                );
            });

            expect(validationResult!.success).toBeFalsy();
            expect(validationResult!.errors).toEqual(["URL required"]);
            expect(validationResult!.warnings).toEqual([]); // Should default to empty array
            expect(validationResult!.metadata).toEqual({}); // Should default to empty object
        });

        it("should handle validation errors", async () => {
            const testError = new Error("Validation service unavailable");
            mockElectronAPI.monitorTypes.validateMonitorData.mockRejectedValue(
                testError
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                try {
                    await result.current.validateMonitorData("http", {});
                } catch {
                    // Expected to throw
                }
            });

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Validation service unavailable");
        });
    });

    describe("Formatting Operations", () => {
        it("should format monitor details successfully", async () => {
            const formattedDetail = "Formatted detail text";
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockResolvedValue(
                formattedDetail
            );
            mockSafeExtractIpcData.mockReturnValue(formattedDetail);

            const { result } = renderHook(() => useMonitorTypesStore());

            let formatted: string;
            await act(async () => {
                formatted = await result.current.formatMonitorDetail(
                    "http",
                    "raw detail"
                );
            });

            expect(formatted!).toBe(formattedDetail);
        });

        it("should handle format detail errors", async () => {
            const testError = new Error("Format service error");
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockRejectedValue(
                testError
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await expect(
                    result.current.formatMonitorDetail("http", "details")
                ).rejects.toThrowError("Format service error");
            });

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Format service error");
        });

        it("should format monitor title suffix", async () => {
            const suffix = " - example.com";
            mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockResolvedValue(
                suffix
            );
            mockSafeExtractIpcData.mockReturnValue(suffix);

            const { result } = renderHook(() => useMonitorTypesStore());

            let formatted: string;
            await act(async () => {
                formatted = await result.current.formatMonitorTitleSuffix(
                    "http",
                    {
                        id: "test",
                        url: "https://example.com",
                    } as Monitor
                );
            });

            expect(formatted!).toBe(suffix);
        });

        it("should handle fallback values for formatting", async () => {
            // Mock rejection to test error propagation
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockRejectedValue(
                new Error("Formatting failed")
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // Should throw error when API fails
            await act(async () => {
                await expect(
                    result.current.formatMonitorDetail("http", "details")
                ).rejects.toThrowError("Formatting failed");
            });
        });
    });

    describe("Store Actions and State Management", () => {
        it("should allow ErrorStore store error lifecycle", () => {
            useErrorStore
                .getState()
                .setStoreError("monitor-types", "Test error");
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Test error");

            useErrorStore.getState().clearStoreError("monitor-types");
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe(undefined);
        });

        it("should allow ErrorStore operation loading lifecycle", () => {
            useErrorStore
                .getState()
                .setOperationLoading("monitorTypes.loadTypes", true);
            expect(
                useErrorStore
                    .getState()
                    .getOperationLoading("monitorTypes.loadTypes")
            ).toBeTruthy();

            useErrorStore
                .getState()
                .setOperationLoading("monitorTypes.loadTypes", false);
            expect(
                useErrorStore
                    .getState()
                    .getOperationLoading("monitorTypes.loadTypes")
            ).toBeFalsy();
        });

        it("should handle getFieldConfig", () => {
            const testFields: MonitorFieldDefinition[] = [
                {
                    name: "url",
                    type: "url",
                    required: true,
                    label: "URL",
                },
            ];

            // Set up state with field configs
            useMonitorTypesStore.setState({
                fieldConfigs: {
                    http: testFields,
                },
            });

            const { result } = renderHook(() => useMonitorTypesStore());

            const config = result.current.getFieldConfig("http" as MonitorType);
            expect(config).toEqual(testFields);

            const nonExistent = result.current.getFieldConfig(
                "nonexistent" as MonitorType
            );
            expect(nonExistent).toBeUndefined();
        });

        it("should handle refreshMonitorTypes", async () => {
            const mockConfigs: MonitorTypeConfig[] = [
                createMonitorTypeConfig({
                    type: "http",
                    displayName: "HTTP",
                    description: "HTTP monitoring",
                }),
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockConfigs
            );
            mockSafeExtractIpcData.mockReturnValue(mockConfigs);

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.refreshMonitorTypes();
            });

            expect(result.current.monitorTypes).toEqual(mockConfigs);
            expect(result.current.isLoaded).toBeTruthy();
        });

        it("should skip loading if already loaded and no error", async () => {
            // Set up already loaded state
            useMonitorTypesStore.setState({
                isLoaded: true,
            });

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            // Should not call the API since already loaded
            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).not.toHaveBeenCalled();
        });

        it("should reload via refreshMonitorTypes even if already loaded", async () => {
            const mockConfigs: MonitorTypeConfig[] = [];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockConfigs
            );
            mockSafeExtractIpcData.mockReturnValue(mockConfigs);

            // Set up already loaded state
            useMonitorTypesStore.setState({
                isLoaded: true,
            });

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.refreshMonitorTypes();
            });

            // RefreshMonitorTypes should force a reload
            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalled();
        });
    });

    describe("Logging Verification", () => {
        it("should log all operations correctly", async () => {
            const mockConfigs: MonitorTypeConfig[] = [];
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockConfigs
            );
            mockSafeExtractIpcData.mockReturnValue(mockConfigs);

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "loadMonitorTypes",
                {}
            );
            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "loadMonitorTypes",
                {
                    success: true,
                    typesCount: 0,
                }
            );

            // Clear previous calls before testing validation logging
            mockLogStoreAction.mockClear();
            mockSafeExtractIpcData.mockClear();

            // Test validation logging
            const expectedValidationResult: ValidationResult = {
                success: true,
                data: {},
                errors: [],
                warnings: [],
                metadata: {},
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                expectedValidationResult
            );

            // Mock safeExtractIpcData to return the validation result directly
            mockSafeExtractIpcData.mockReturnValueOnce(
                expectedValidationResult
            );

            await act(async () => {
                await result.current.validateMonitorData("http", {});
            });

            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "validateMonitorData",
                { type: "http" }
            );
            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "MonitorTypesStore",
                "validateMonitorData",
                {
                    type: "http",
                    success: true,
                    errorCount: 0,
                }
            );
        });
    });

    describe("Complex Data Scenarios", () => {
        it("should handle large datasets", async () => {
            const largeDataset: MonitorTypeConfig[] = Array.from(
                { length: 100 },
                (_, i) => ({
                    type:
                        BASE_MONITOR_TYPES[i % BASE_MONITOR_TYPES.length] ??
                        "http",
                    displayName: `Type ${i}`,
                    description: `Description ${i}`,
                    version: "1.0",
                    fields: Array.from({ length: 10 }, (_, fieldIndex) => ({
                        name: `field-${fieldIndex}`,
                        type: "text",
                        required: fieldIndex % 2 === 0,
                        label: `Field ${fieldIndex}`,
                    })),
                })
            );

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                largeDataset
            );
            mockSafeExtractIpcData.mockReturnValue(largeDataset);

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(Object.keys(result.current.fieldConfigs)).toHaveLength(
                BASE_MONITOR_TYPES.length
            );
            expect(result.current.isLoaded).toBeTruthy();
        });

        it("should handle special character types and fields", async () => {
            const specialConfigs: MonitorTypeConfig[] = [
                {
                    type: "http",
                    displayName: "Special Characters",
                    description:
                        "Testing special characters in field definitions",
                    version: "1.0",
                    fields: [
                        {
                            name: "field-with-unicode-测试",
                            type: "text",
                            required: true,
                            label: "Unicode Field 🚀",
                        },
                    ],
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                specialConfigs
            );
            mockSafeExtractIpcData.mockReturnValue(specialConfigs);

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.monitorTypes).toHaveLength(1);
            expect(result.current.monitorTypes[0]!.type).toBe("http");
            expect(result.current.monitorTypes[0]!.fields[0]!.name).toBe(
                "field-with-unicode-测试"
            );
        });
    });
});
