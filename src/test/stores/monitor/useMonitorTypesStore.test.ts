/**
 * @file Basic tests for useMonitorTypesStore
 */

import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Monitor, MonitorType } from "../../../../shared/types";
import type { MonitorTypeConfig } from "../../../../shared/types/monitorTypes";
import type { ValidationResult } from "../../../../shared/types/validation";
import type { IpcResponse } from "../../../types/ipc";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";

// Mock the electron API
const mockElectronAPI = {
    monitorTypes: {
        getMonitorTypes: vi.fn(),
        validateMonitorData: vi.fn(),
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
    },
};

// Mock the global window object
globalThis.window = {
    electronAPI: mockElectronAPI,
} as never;

describe(useMonitorTypesStore, () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should initialize with default state", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Initialization", "type");

        const { result } = renderHook(() => useMonitorTypesStore());

        expect(result.current.monitorTypes).toEqual([]);
        expect(result.current.fieldConfigs).toEqual({});
        expect(result.current.isLoaded).toBeFalsy();
        expect(result.current.isLoading).toBeFalsy();
        expect(result.current.lastError).toBeUndefined();
    });

    it("should load monitor types successfully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Data Loading", "type");

        const mockMonitorTypes: MonitorTypeConfig[] = [
            {
                type: "http" as MonitorType,
                displayName: "HTTP",
                description: "HTTP monitoring",
                version: "1.0.0",
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

        const mockResponse: IpcResponse<MonitorTypeConfig[]> = {
            success: true,
            data: mockMonitorTypes,
        };

        mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
            mockResponse
        );

        const { result } = renderHook(() => useMonitorTypesStore());

        await act(async () => {
            await result.current.loadMonitorTypes();
        });

        expect(result.current.monitorTypes).toEqual(mockMonitorTypes);
        expect(result.current.isLoaded).toBeTruthy();
        expect(result.current.fieldConfigs["http"]).toEqual([
            { name: "url", type: "url", required: true, label: "URL" },
        ]);
    });

    it("should handle basic store actions", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Business Logic", "type");

        const { result } = renderHook(() => useMonitorTypesStore());

        act(() => {
            result.current.setError("Test error");
        });
        expect(result.current.lastError).toBe("Test error");

        act(() => {
            result.current.clearError();
        });
        expect(result.current.lastError).toBeUndefined();

        act(() => {
            result.current.setLoading(true);
        });
        expect(result.current.isLoading).toBeTruthy();

        act(() => {
            result.current.setLoading(false);
        });
        expect(result.current.isLoading).toBeFalsy();
    });

    it("should refresh monitor types", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Monitoring", "type");

        const mockMonitorTypes: MonitorTypeConfig[] = [];
        const mockResponse: IpcResponse<MonitorTypeConfig[]> = {
            success: true,
            data: mockMonitorTypes,
        };

        mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
            mockResponse
        );

        const { result } = renderHook(() => useMonitorTypesStore());

        await act(async () => {
            await result.current.refreshMonitorTypes();
        });

        expect(result.current.isLoaded).toBeTruthy();
    });

    it("should validate monitor data", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Validation", "type");

        const mockValidationResult: ValidationResult = {
            success: true,
            data: { url: "https://example.com" },
            errors: [],
            warnings: [],
            metadata: {},
        };

        // Mock the IPC response structure that the store expects
        const mockIpcResponse: IpcResponse<ValidationResult> = {
            success: true,
            data: mockValidationResult,
            metadata: {
                timestamp: Date.now(),
                correlationId: "test-correlation-id",
                operation: "validate-monitor-data",
            },
        };

        mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
            mockIpcResponse
        );

        const { result } = renderHook(() => useMonitorTypesStore());

        let validationResult: ValidationResult;
        await act(async () => {
            validationResult = await result.current.validateMonitorData(
                "http",
                { url: "https://example.com" }
            );
        });

        expect(validationResult!).toEqual(mockValidationResult);
    });

    it("should format monitor detail", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Monitoring", "type");

        const mockResponse: IpcResponse<string> = {
            success: true,
            data: "Formatted detail",
        };

        mockElectronAPI.monitorTypes.formatMonitorDetail.mockResolvedValue(
            mockResponse
        );

        const { result } = renderHook(() => useMonitorTypesStore());

        let formatted: string;
        await act(async () => {
            formatted = await result.current.formatMonitorDetail(
                "http",
                "Raw detail"
            );
        });

        expect(formatted!).toBe("Formatted detail");
    });

    it("should format monitor title suffix", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Monitoring", "type");

        const mockMonitor: Monitor = {
            id: "test-monitor",
            type: "http",
            checkInterval: 300,
            timeout: 30,
            retryAttempts: 3,
            monitoring: true,
            status: "up",
            responseTime: 150,
            history: [],
            url: "https://example.com",
        };

        const mockResponse: IpcResponse<string> = {
            success: true,
            data: "(https://example.com)",
        };

        mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockResolvedValue(
            mockResponse
        );

        const { result } = renderHook(() => useMonitorTypesStore());

        let formatted: string;
        await act(async () => {
            formatted = await result.current.formatMonitorTitleSuffix(
                "http",
                mockMonitor
            );
        });

        expect(formatted!).toBe("(https://example.com)");
    });

    it("should get field config", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Data Retrieval", "type");

        const { result } = renderHook(() => useMonitorTypesStore());

        // Test the basic functionality without relying on loadMonitorTypes state
        const nonExistentConfig = result.current.getFieldConfig(
            "nonexistent" as MonitorType
        );
        expect(nonExistentConfig).toBeUndefined();
    });

    it("should handle errors in formatting functions", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Error Handling", "type");

        const mockErrorResponse: IpcResponse<string> = {
            success: false,
            error: "Formatting failed",
        };

        mockElectronAPI.monitorTypes.formatMonitorDetail.mockResolvedValue(
            mockErrorResponse
        );

        const { result } = renderHook(() => useMonitorTypesStore());

        let formatted: string;
        await act(async () => {
            formatted = await result.current.formatMonitorDetail(
                "http",
                "Raw detail"
            );
        });

        expect(formatted!).toBe("Raw detail"); // Fallback value
    });

    describe("IPC Response Handling", () => {
        it("should properly unwrap IPC validation responses for success case", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: IPC Response Handling", "type");

            // Mock the actual IPC response structure with wrapped validation data
            const mockIpcResponse: IpcResponse<ValidationResult> = {
                success: true, // IPC operation succeeded
                data: {
                    success: true, // Validation passed
                    data: { url: "https://example.com" },
                    errors: [],
                    warnings: [],
                    metadata: {},
                },
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockIpcResponse
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    { url: "https://example.com" }
                );
            });

            expect(validationResult!.success).toBeTruthy();
            expect(validationResult!.data).toEqual({
                url: "https://example.com",
            });
            expect(validationResult!.errors).toEqual([]);
        });

        it("should properly unwrap IPC validation responses for validation failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: IPC Response Handling", "type");

            // Mock the actual IPC response structure with validation failure
            const mockIpcResponse: IpcResponse<ValidationResult> = {
                success: true, // IPC operation succeeded
                data: {
                    success: false, // Validation failed
                    data: undefined,
                    errors: ["URL is required"],
                    warnings: [],
                    metadata: {},
                },
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockIpcResponse
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    {} // Invalid empty data
                );
            });

            // This is the critical test - validation should fail
            expect(validationResult!.success).toBeFalsy();
            expect(validationResult!.errors).toEqual(["URL is required"]);
            expect(validationResult!.data).toBeUndefined();
        });

        it("should handle IPC operation failure with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: IPC Response Handling", "type");

            // Mock IPC operation failure
            const mockIpcResponse = {
                success: false, // IPC operation failed
                error: "Backend unavailable",
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockIpcResponse
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    { url: "https://example.com" }
                );
            });

            // Should use fallback values when IPC operation fails
            expect(validationResult!.success).toBeFalsy();
            expect(validationResult!.errors).toEqual([
                "Failed to validate monitor data",
            ]);
        });
    });
});
