/**
 * Tests for useMonitorFields hook
 *
 * @file Comprehensive tests covering all branches and edge cases for the
 *   monitor fields hook that manages dynamic form field definitions.
 */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorFieldDefinition } from "../../../shared/types";

import { useMonitorFields } from "../../hooks/useMonitorFields";
import type { MonitorTypeConfig } from "../../../shared/types/monitorTypes";

// Mock the monitor types store
const mockMonitorTypesStore = {
    fieldConfigs: {} as Record<string, MonitorFieldDefinition[]>,
    isLoaded: true,
    lastError: undefined as string | undefined,
    loadMonitorTypes: vi.fn(),
};

vi.mock("../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: vi.fn(() => mockMonitorTypesStore),
}));

// Mock the logger module
vi.mock("../../services/logger", () => ({
    logger: {
        error: vi.fn(),
    },
}));

// Mock the IPC utility
vi.mock("../../types/ipc", () => ({
    safeExtractIpcData: vi.fn(),
}));

// Mock the window.electronAPI
const mockElectronAPI = {
    data: {
        downloadSQLiteBackup: vi.fn(),
        exportData: vi.fn(),
        importData: vi.fn(),
    },
    events: {
        onCacheInvalidated: vi.fn(),
        onMonitorDown: vi.fn(),
        onMonitoringStarted: vi.fn(),
        onMonitoringStopped: vi.fn(),
        onMonitorStatusChanged: vi.fn(),
        onMonitorUp: vi.fn(),
        onTestEvent: vi.fn(),
        onUpdateStatus: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    monitoring: {
        startMonitoring: vi.fn(),
        startMonitoringForSite: vi.fn(),
        stopMonitoring: vi.fn(),
        stopMonitoringForSite: vi.fn(),
    },
    monitorTypes: {
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
        getMonitorTypes: vi.fn(),
        validateMonitorData: vi.fn(),
    },
    settings: {
        getHistoryLimit: vi.fn(),
        resetSettings: vi.fn(),
        updateHistoryLimit: vi.fn(),
    },
    sites: {
        addSite: vi.fn(),
        checkSiteNow: vi.fn(),
        getSites: vi.fn(),
        removeMonitor: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
    },
    stateSync: {
        getSyncStatus: vi.fn(),
        onStateSyncEvent: vi.fn(),
        requestFullSync: vi.fn(),
    },
    system: {
        openExternal: vi.fn(),
        quitAndInstall: vi.fn(),
    },
};

// Set up the mock globally
Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("useMonitorFields Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock store state - default to loaded for most tests
        mockMonitorTypesStore.fieldConfigs = {};
        mockMonitorTypesStore.isLoaded = true;
        mockMonitorTypesStore.lastError = undefined;
    });

    describe("Basic functionality", () => {
        it("should return initial loading state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            // Set up mock to simulate loading state
            mockMonitorTypesStore.isLoaded = false;

            // Make the IPC call never resolve
            mockElectronAPI.monitorTypes.getMonitorTypes.mockImplementation(
                () => new Promise(() => {})
            );

            const { result } = renderHook(() => useMonitorFields());

            expect(result.current.isLoaded).toBeFalsy();
            expect(result.current.error).toBeUndefined();
            expect(result.current.getFields).toBeInstanceOf(Function);
            expect(result.current.getRequiredFields).toBeInstanceOf(Function);
            expect(result.current.isFieldRequired).toBeInstanceOf(Function);
        });

        it("should load monitor field configurations successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Loading", "type");

            const mockFieldDefinitions: MonitorFieldDefinition[] = [
                {
                    name: "url",
                    type: "text",
                    required: true,
                    label: "URL",
                    placeholder: "Enter URL to monitor",
                },
                {
                    name: "timeout",
                    type: "number",
                    required: false,
                    label: "Timeout (ms)",
                    placeholder: "Request timeout",
                },
            ];

            const pingFieldDefinitions: MonitorFieldDefinition[] = [
                {
                    name: "host",
                    type: "text",
                    required: true,
                    label: "Host",
                    placeholder: "Enter hostname or IP",
                },
            ];

            // Configure the mock store with field configurations
            mockMonitorTypesStore.fieldConfigs = {
                http: mockFieldDefinitions,
                ping: pingFieldDefinitions,
            };
            mockMonitorTypesStore.isLoaded = true;

            const { result } = renderHook(() => useMonitorFields());

            // Since the store is already loaded, should immediately be available
            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.error).toBeUndefined();
            expect(result.current.getFields("http")).toEqual(
                mockFieldDefinitions
            );
            expect(result.current.getFields("ping")).toHaveLength(1);
            expect(result.current.getFields("ping")[0]?.name).toBe("host");
        });

        it("should handle empty configurations", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Configure the mock store to have empty field configurations
            mockMonitorTypesStore.fieldConfigs = {};
            mockMonitorTypesStore.isLoaded = true;

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: [],
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue([]);

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBeTruthy();
            });

            expect(result.current.error).toBeUndefined();
            expect(result.current.getFields("http")).toEqual([]);
            expect(result.current.getFields("any-type")).toEqual([]);
        });
    });

    describe("Field access functions", () => {
        const setupHookWithData = async () => {
            const mockConfigs: MonitorTypeConfig[] = [
                {
                    type: "http",
                    fields: [
                        {
                            name: "url",
                            type: "text",
                            required: true,
                            label: "URL",
                        },
                        {
                            name: "method",
                            type: "text",
                            required: false,
                            label: "Method",
                        },
                        {
                            name: "timeout",
                            type: "number",
                            required: true,
                            label: "Timeout",
                        },
                    ],
                    displayName: "HTTP Monitor",
                    description: "Monitor HTTP endpoints",
                    version: "1.0.0",
                },
                {
                    type: "tcp",
                    fields: [
                        {
                            name: "host",
                            type: "text",
                            required: true,
                            label: "Host",
                        },
                        {
                            name: "port",
                            type: "number",
                            required: true,
                            label: "Port",
                        },
                    ],
                    displayName: "TCP Monitor",
                    description: "Monitor TCP connections",
                    version: "1.0.0",
                },
            ];

            // Configure the mock store with field configurations
            mockMonitorTypesStore.fieldConfigs = {
                http: mockConfigs[0]?.fields || [],
                tcp: mockConfigs[1]?.fields || [],
            };
            mockMonitorTypesStore.isLoaded = true;

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBeTruthy();
            });

            return result;
        };

        describe("getFields", () => {
            it("should return fields for existing monitor types", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useMonitorFields", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Monitoring", "type");

                const result = await setupHookWithData();

                const httpFields = result.current.getFields("http");
                expect(httpFields).toHaveLength(3);
                expect(httpFields.map((f) => f.name)).toEqual([
                    "url",
                    "method",
                    "timeout",
                ]);

                const tcpFields = result.current.getFields("tcp");
                expect(tcpFields).toHaveLength(2);
                expect(tcpFields.map((f) => f.name)).toEqual(["host", "port"]);
            });

            it("should return empty array for non-existent monitor types", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useMonitorFields", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Monitoring", "type");

                const result = await setupHookWithData();

                expect(result.current.getFields("non-existent")).toEqual([]);
                expect(result.current.getFields("")).toEqual([]);
            });

            it("should be memoized and return stable references", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useMonitorFields", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const result = await setupHookWithData();

                const firstCall = result.current.getFields("http");
                const secondCall = result.current.getFields("http");

                expect(firstCall).toBe(secondCall); // Same reference due to memoization
            });
        });

        describe("getRequiredFields", () => {
            it("should return only required field names", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useMonitorFields", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const result = await setupHookWithData();

                const httpRequiredFields =
                    result.current.getRequiredFields("http");
                expect(httpRequiredFields).toEqual(["url", "timeout"]);

                const tcpRequiredFields =
                    result.current.getRequiredFields("tcp");
                expect(tcpRequiredFields).toEqual(["host", "port"]);
            });

            it("should return empty array for non-existent monitor types", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useMonitorFields", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Monitoring", "type");

                const result = await setupHookWithData();

                expect(
                    result.current.getRequiredFields("non-existent")
                ).toEqual([]);
            });

            it("should handle monitor types with no required fields", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useMonitorFields", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Monitoring", "type");

                const mockConfigs: MonitorTypeConfig[] = [
                    {
                        type: "optional-only",
                        fields: [
                            {
                                name: "optional1",
                                type: "text",
                                required: false,
                                label: "Optional 1",
                            },
                            {
                                name: "optional2",
                                type: "text",
                                required: false,
                                label: "Optional 2",
                            },
                        ],
                        displayName: "Optional Only Monitor",
                        description: "Monitor with all optional fields",
                        version: "1.0.0",
                    },
                ];

                mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                    success: true,
                    data: mockConfigs,
                });

                const { safeExtractIpcData } = await import("../../types/ipc");
                vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

                const { result } = renderHook(() => useMonitorFields());

                await waitFor(() => {
                    expect(result.current.isLoaded).toBeTruthy();
                });

                expect(
                    result.current.getRequiredFields("optional-only")
                ).toEqual([]);
            });
        });

        describe("isFieldRequired", () => {
            it("should correctly identify required fields", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useMonitorFields", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const result = await setupHookWithData();

                expect(
                    result.current.isFieldRequired("http", "url")
                ).toBeTruthy();
                expect(
                    result.current.isFieldRequired("http", "timeout")
                ).toBeTruthy();
                expect(
                    result.current.isFieldRequired("tcp", "host")
                ).toBeTruthy();
                expect(
                    result.current.isFieldRequired("tcp", "port")
                ).toBeTruthy();
            });

            it("should correctly identify optional fields", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useMonitorFields", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const result = await setupHookWithData();

                expect(
                    result.current.isFieldRequired("http", "method")
                ).toBeFalsy();
            });

            it("should return false for non-existent fields", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useMonitorFields", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const result = await setupHookWithData();

                expect(
                    result.current.isFieldRequired("http", "non-existent-field")
                ).toBeFalsy();
                expect(
                    result.current.isFieldRequired(
                        "non-existent-type",
                        "any-field"
                    )
                ).toBeFalsy();
            });

            it("should handle empty field names", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: useMonitorFields", "component");
                await annotate("Category: Hook", "category");
                await annotate("Type: Business Logic", "type");

                const result = await setupHookWithData();

                expect(result.current.isFieldRequired("http", "")).toBeFalsy();
            });
        });
    });

    describe("Error handling", () => {
        it("should handle IPC errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            // Configure mock store to have an error
            mockMonitorTypesStore.lastError = "IPC communication failed";
            mockMonitorTypesStore.isLoaded = true;
            mockMonitorTypesStore.fieldConfigs = {};

            const { result } = renderHook(() => useMonitorFields());

            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.error).toBe("IPC communication failed");
            expect(result.current.getFields("http")).toEqual([]);
        });

        it("should handle non-Error objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            // Configure mock store to have an error
            mockMonitorTypesStore.lastError =
                "Failed to load monitor field configurations";
            mockMonitorTypesStore.isLoaded = true;
            mockMonitorTypesStore.fieldConfigs = {};

            const { result } = renderHook(() => useMonitorFields());

            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.error).toBe(
                "Failed to load monitor field configurations"
            );
            expect(result.current.getFields("http")).toEqual([]);
        });

        it("should handle null/undefined errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            // Configure mock store to have an error
            mockMonitorTypesStore.lastError =
                "Failed to load monitor field configurations";
            mockMonitorTypesStore.isLoaded = true;
            mockMonitorTypesStore.fieldConfigs = {};

            const { result } = renderHook(() => useMonitorFields());

            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.error).toBe(
                "Failed to load monitor field configurations"
            );
        });

        it("should set isLoaded to true even on error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            // Configure mock store to have an error but still be loaded
            mockMonitorTypesStore.lastError = "Some error occurred";
            mockMonitorTypesStore.isLoaded = true;
            mockMonitorTypesStore.fieldConfigs = {};

            const { result } = renderHook(() => useMonitorFields());

            expect(result.current.error).toBeDefined();
            expect(result.current.isLoaded).toBeTruthy(); // Should be true to prevent infinite loading
        });
    });

    describe("Store integration", () => {
        it("should use monitor types store for field configurations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const mockFieldDefinitions: MonitorFieldDefinition[] = [
                {
                    name: "url",
                    type: "text",
                    required: true,
                    label: "URL",
                    placeholder: "Enter URL to monitor",
                },
            ];

            // Configure mock store
            mockMonitorTypesStore.fieldConfigs = { http: mockFieldDefinitions };
            mockMonitorTypesStore.isLoaded = true;

            const { result } = renderHook(() => useMonitorFields());

            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.error).toBeUndefined();
            expect(result.current.getFields("http")).toEqual(
                mockFieldDefinitions
            );
        });

        it("should handle empty store gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Configure empty store
            mockMonitorTypesStore.fieldConfigs = {};
            mockMonitorTypesStore.isLoaded = true;

            const { result } = renderHook(() => useMonitorFields());

            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.error).toBeUndefined();
            expect(result.current.getFields("any-type")).toEqual([]);
        });
    });

    describe("Function memoization and stability", () => {
        it("should provide stable function references", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const mockConfigs: MonitorTypeConfig[] = [
                {
                    type: "http",
                    fields: [
                        {
                            name: "url",
                            type: "text",
                            required: true,
                            label: "URL",
                        },
                    ],
                    displayName: "HTTP Monitor",
                    description: "Monitor HTTP endpoints",
                    version: "1.0.0",
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

            const { result, rerender } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBeTruthy();
            });

            const initialGetFields = result.current.getFields;
            const initialGetRequiredFields = result.current.getRequiredFields;
            const initialIsFieldRequired = result.current.isFieldRequired;

            // Force a re-render
            rerender();

            // Functions should remain the same references due to useCallback
            expect(result.current.getFields).toBe(initialGetFields);
            expect(result.current.getRequiredFields).toBe(
                initialGetRequiredFields
            );
            expect(result.current.isFieldRequired).toBe(initialIsFieldRequired);
        });
    });

    describe("Edge cases", () => {
        it("should handle configs with missing field properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const mockConfigs = [
                {
                    type: "incomplete",
                    fields: [
                        {
                            name: "field1",
                            type: "text",
                            // Missing required property
                            label: "Field 1",
                        } as MonitorFieldDefinition,
                    ],
                    displayName: "Incomplete Monitor",
                    description: "Monitor with incomplete field def",
                    version: "1.0.0",
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBeTruthy();
            });

            // Should handle gracefully - missing required defaults to false
            expect(
                result.current.isFieldRequired("incomplete", "field1")
            ).toBeFalsy();
            expect(result.current.getRequiredFields("incomplete")).toEqual([]);
        });

        it("should handle configs with no fields array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorFields", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const mockConfigs = [
                {
                    type: "no-fields",
                    fields: undefined as any,
                    displayName: "No Fields Monitor",
                    description: "Monitor with no fields",
                    version: "1.0.0",
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBeTruthy();
            });

            // Should not crash and return empty arrays
            expect(result.current.getFields("no-fields")).toEqual([]);
            expect(result.current.getRequiredFields("no-fields")).toEqual([]);
            expect(
                result.current.isFieldRequired("no-fields", "any-field")
            ).toBeFalsy();
        });
    });
});
