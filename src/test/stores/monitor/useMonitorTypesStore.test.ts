/**
 * @file Basic tests for useMonitorTypesStore
 */

import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Monitor, MonitorType } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";

// Mock the store utils module
vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { createMonitorTypeConfig } from "../../utils/createMonitorTypeConfig";

// Mock the electron API
const mockElectronAPI = {
    monitorTypes: {
        getMonitorTypes: vi.fn().mockResolvedValue([
            createMonitorTypeConfig({
                description: "HTTP monitoring",
                displayName: "HTTP",
                fields: [
                    {
                        label: "URL",
                        name: "url",
                        required: true,
                        type: "url",
                    },
                ],
                type: "http",
            }),
            createMonitorTypeConfig({
                description: "Port monitoring",
                displayName: "Port",
                fields: [
                    {
                        label: "Host",
                        name: "host",
                        required: true,
                        type: "text",
                    },
                    {
                        label: "Port",
                        name: "port",
                        required: true,
                        type: "number",
                    },
                ],
                type: "port",
            }),
        ] as MonitorTypeConfig[]),
        validateMonitorData: vi.fn().mockResolvedValue({
            success: true,
            errors: [],
            warnings: [],
        } as ValidationResult),
        formatMonitorDetail: vi.fn().mockResolvedValue("Formatted detail"),
        formatMonitorTitleSuffix: vi.fn().mockResolvedValue(" (formatted)"),
    },
    monitoring: {},
};

// Mock the global window object
globalThis.window = {
    electronAPI: mockElectronAPI,
} as never;

describe(useMonitorTypesStore, () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useErrorStore.setState({
            isLoading: false,
            lastError: undefined,
            operationLoading: {},
            storeErrors: {},
        });

        useMonitorTypesStore.setState({
            fieldConfigs: {},
            isLoaded: false,
            monitorTypes: [],
        });

        // Ensure electronAPI is properly set (protect against global state pollution)
        if (!globalThis.window) {
            globalThis.window = {} as never;
        }
        (globalThis.window as any).electronAPI = mockElectronAPI;
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
        expect(useErrorStore.getState().getStoreError("monitor-types")).toBe(
            undefined
        );
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

        mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
            mockMonitorTypes
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

    it("should record load failures in ErrorStore", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Business Logic", "type");

        mockElectronAPI.monitorTypes.getMonitorTypes.mockRejectedValueOnce(
            new Error("Backend unavailable")
        );

        const { result } = renderHook(() => useMonitorTypesStore());

        await act(async () => {
            await expect(
                result.current.loadMonitorTypes()
            ).rejects.toThrowError("Backend unavailable");
        });

        expect(useErrorStore.getState().getStoreError("monitor-types")).toBe(
            "Backend unavailable"
        );
        expect(
            useErrorStore
                .getState()
                .getOperationLoading("monitorTypes.loadTypes")
        ).toBeFalsy();
    });

    it("should refresh monitor types", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Monitoring", "type");

        const mockMonitorTypes: MonitorTypeConfig[] = [
            createMonitorTypeConfig({ type: "http" }),
        ];

        mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
            mockMonitorTypes
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

    it("should format monitor detail", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useMonitorTypesStore", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Monitoring", "type");

        mockElectronAPI.monitorTypes.formatMonitorDetail.mockResolvedValue(
            "Formatted detail"
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

        mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockResolvedValue(
            "(https://example.com)"
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

        // Simulate service error handling by throwing error (service now re-throws)
        mockElectronAPI.monitorTypes.formatMonitorDetail.mockRejectedValue(
            new Error("Formatting failed")
        );

        const { result } = renderHook(() => useMonitorTypesStore());

        await act(async () => {
            await expect(
                result.current.formatMonitorDetail("http", "Raw detail")
            ).rejects.toThrowError("Formatting failed");
        });

        // Error should be set in store state
        expect(useErrorStore.getState().getStoreError("monitor-types")).toBe(
            "Formatting failed"
        );
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

            // Mock the raw validation failure data that backend would return
            const mockValidationFailureData = {
                success: false,
                data: undefined,
                errors: ["URL is required"],
                warnings: [],
                metadata: {},
            } satisfies ValidationResult;

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockValidationFailureData
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    {} // Invalid empty data
                );
            });

            // Store now preserves the original ValidationResult structure when API returns one
            expect(validationResult!.success).toBeFalsy(); // Preserves original validation failure
            expect(validationResult!.data).toEqual(
                mockValidationFailureData.data
            ); // Validation failure data
            expect(validationResult!.errors).toEqual(
                mockValidationFailureData.errors
            ); // Validation errors
        });

        it("should handle IPC operation failure with error throwing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: IPC Response Handling", "type");

            // Mock service error handling by throwing error (service now re-throws)
            mockElectronAPI.monitorTypes.validateMonitorData.mockRejectedValue(
                new Error("Backend unavailable")
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await expect(
                    result.current.validateMonitorData("http", {
                        url: "https://example.com",
                    })
                ).rejects.toThrowError("Backend unavailable");
            });

            // Error should be set in store state
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Backend unavailable");
        });
    });
});
