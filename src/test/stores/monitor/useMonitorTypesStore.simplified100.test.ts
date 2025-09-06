/**
 * Simplified 100% test coverage for useMonitorTypesStore
 *
 * This test suite provides comprehensive coverage focusing on actual
 * functionality rather than mock complexity, ensuring all code paths are
 * exercised.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type {
    Monitor,
    MonitorFieldDefinition,
    MonitorType,
} from "../../../../shared/types";
import type { MonitorTypeConfig } from "../../../../shared/types/monitorTypes";
import type { ValidationResult } from "../../../../shared/types/validation";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";

// Hoisted mocks
const mockWithErrorHandling = vi.hoisted(() => vi.fn());
const mockLogStoreAction = vi.hoisted(() => vi.fn());
const mockSafeExtractIpcData = vi.hoisted(() => vi.fn());

// Mock dependencies
vi.mock("@shared/utils/errorHandling", () => ({
    withErrorHandling: mockWithErrorHandling,
}));

vi.mock("../../../stores/utils", () => ({
    logStoreAction: mockLogStoreAction,
}));

vi.mock("../../../types/ipc", () => ({
    safeExtractIpcData: mockSafeExtractIpcData,
}));

// Mock ElectronAPI
const mockElectronAPI = {
    monitorTypes: {
        getMonitorTypes: vi.fn(),
        validateMonitorData: vi.fn(),
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
    },
};

// Mock window.electronAPI
vi.stubGlobal("window", {
    electronAPI: mockElectronAPI,
});

describe("useMonitorTypesStore - 100% Coverage Simplified", () => {
    beforeEach(() => {
        vi.clearAllMocks();

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
            isLoading: false,
            lastError: undefined,
        });
    });

    describe("Store Initialization and Basic Operations", () => {
        it("should initialize with correct default state", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            expect(result.current.monitorTypes).toEqual([]);
            expect(result.current.fieldConfigs).toEqual({});
            expect(result.current.isLoaded).toBeFalsy();
            expect(result.current.isLoading).toBeFalsy();
            expect(result.current.lastError).toBeUndefined();
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

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });
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
            expect(result.current.isLoading).toBeFalsy();
            expect(result.current.lastError).toBeUndefined();
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

            expect(result.current.lastError).toBe("Loading failed");
            expect(result.current.isLoading).toBeFalsy();
        });

        it("should filter out invalid configurations", async () => {
            const mixedConfigs = [
                // Invalid configs that should be filtered out
                { type: null },
                { type: "" },
                { notType: "invalid" },
                // Valid config that should remain
                {
                    type: "valid",
                    displayName: "Valid",
                    description: "Valid config",
                    version: "1.0",
                    fields: [],
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mixedConfigs,
            });
            mockSafeExtractIpcData.mockReturnValue(mixedConfigs);

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            // Only valid config should remain
            expect(result.current.monitorTypes).toHaveLength(1);
            expect(result.current.monitorTypes[0]!.type).toBe("valid");
        });

        it("should handle safeExtractIpcData returning fallback", async () => {
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                null
            );
            mockSafeExtractIpcData.mockReturnValue([]); // Fallback value

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.monitorTypes).toEqual([]);
            expect(result.current.isLoaded).toBeTruthy();
        });
    });

    describe("Validation Operations", () => {
        it("should handle successful validation", async () => {
            const mockResult: ValidationResult = {
                success: true,
                data: { url: "https://example.com" },
                errors: [],
                warnings: [],
                metadata: {},
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockResult
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

            expect(validationResult!).toEqual(mockResult);
        });

        it("should handle validation with missing optional fields", async () => {
            const mockResult = {
                success: false,
                data: null,
                errors: ["URL required"],
                // Missing warnings and metadata
            };

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

            expect(result.current.lastError).toBe(
                "Validation service unavailable"
            );
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
                try {
                    await result.current.formatMonitorDetail("http", "details");
                } catch {
                    // Expected to throw
                }
            });

            expect(result.current.lastError).toBe("Format service error");
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
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockResolvedValue(
                null
            );
            mockSafeExtractIpcData.mockReturnValue("fallback");

            const { result } = renderHook(() => useMonitorTypesStore());

            let formatted: string;
            await act(async () => {
                formatted = await result.current.formatMonitorDetail(
                    "http",
                    "details"
                );
            });

            expect(formatted!).toBe("fallback");
        });
    });

    describe("Store Actions and State Management", () => {
        it("should handle setError and clearError", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            act(() => {
                result.current.setError("Test error");
            });

            expect(result.current.lastError).toBe("Test error");

            act(() => {
                result.current.clearError();
            });

            expect(result.current.lastError).toBeUndefined();
        });

        it("should handle setLoading", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            act(() => {
                result.current.setLoading(true);
            });

            expect(result.current.isLoading).toBeTruthy();

            act(() => {
                result.current.setLoading(false);
            });

            expect(result.current.isLoading).toBeFalsy();
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
                {
                    type: "http",
                    displayName: "HTTP",
                    description: "HTTP monitoring",
                    version: "1.0",
                    fields: [],
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });
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
                lastError: undefined,
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

        it("should reload if there was an error", async () => {
            const mockConfigs: MonitorTypeConfig[] = [];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });
            mockSafeExtractIpcData.mockReturnValue(mockConfigs);

            // Set up state with error
            useMonitorTypesStore.setState({
                isLoaded: true,
                lastError: "Previous error",
            });

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            // Should call the API to reload due to error
            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalled();
        });
    });

    describe("Logging Verification", () => {
        it("should log all operations correctly", async () => {
            const mockConfigs: MonitorTypeConfig[] = [];
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });
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

            // Test validation logging
            const mockResult: ValidationResult = {
                success: true,
                data: {},
                errors: [],
                warnings: [],
                metadata: {},
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockResult
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
            const largeConfigs: MonitorTypeConfig[] = Array.from(
                { length: 100 },
                (_, index) => ({
                    type: `type-${index}`,
                    displayName: `Type ${index}`,
                    description: `Description ${index}`,
                    version: "1.0",
                    fields: Array.from({ length: 10 }, (_, fieldIndex) => ({
                        name: `field-${fieldIndex}`,
                        type: "text",
                        required: fieldIndex % 2 === 0,
                        label: `Field ${fieldIndex}`,
                    })),
                })
            );

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: largeConfigs,
            });
            mockSafeExtractIpcData.mockReturnValue(largeConfigs);

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.monitorTypes).toHaveLength(100);
            expect(Object.keys(result.current.fieldConfigs)).toHaveLength(100);
            expect(result.current.isLoaded).toBeTruthy();
        });

        it("should handle special character types and fields", async () => {
            const specialConfigs: MonitorTypeConfig[] = [
                {
                    type: "special-chars-!@#$%",
                    displayName: "Special Characters",
                    description: "Testing special characters",
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

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: specialConfigs,
            });
            mockSafeExtractIpcData.mockReturnValue(specialConfigs);

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.monitorTypes).toHaveLength(1);
            expect(result.current.monitorTypes[0]!.type).toBe(
                "special-chars-!@#$%"
            );
        });
    });
});
