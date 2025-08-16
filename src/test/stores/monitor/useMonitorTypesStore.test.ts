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

describe("useMonitorTypesStore", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should initialize with default state", () => {
        const { result } = renderHook(() => useMonitorTypesStore());

        expect(result.current.monitorTypes).toEqual([]);
        expect(result.current.fieldConfigs).toEqual({});
        expect(result.current.isLoaded).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.lastError).toBeUndefined();
    });

    it("should load monitor types successfully", async () => {
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
        expect(result.current.isLoaded).toBe(true);
        expect(result.current.fieldConfigs["http"]).toEqual([
            { name: "url", type: "url", required: true, label: "URL" },
        ]);
    });

    it("should handle basic store actions", () => {
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
        expect(result.current.isLoading).toBe(true);

        act(() => {
            result.current.setLoading(false);
        });
        expect(result.current.isLoading).toBe(false);
    });

    it("should refresh monitor types", async () => {
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

        expect(result.current.isLoaded).toBe(true);
    });

    it("should validate monitor data", async () => {
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
                { url: "https://example.com" }
            );
        });

        expect(validationResult!).toEqual(mockValidationResult);
    });

    it("should format monitor detail", async () => {
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

    it("should format monitor title suffix", async () => {
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

    it("should get field config", () => {
        const { result } = renderHook(() => useMonitorTypesStore());

        // Test the basic functionality without relying on loadMonitorTypes state
        const nonExistentConfig = result.current.getFieldConfig(
            "nonexistent" as MonitorType
        );
        expect(nonExistentConfig).toBeUndefined();
    });

    it("should handle errors in formatting functions", async () => {
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
});
