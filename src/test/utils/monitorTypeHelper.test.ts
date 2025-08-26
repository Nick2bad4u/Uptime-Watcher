/**
 * @file Tests for monitorTypeHelper utility functions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppCaches } from "../../utils/cache";
import * as errorHandling from "../../utils/errorHandling";
import * as ipcTypes from "../../types/ipc";
import {
    clearMonitorTypeCache,
    getAvailableMonitorTypes,
    getMonitorTypeConfig,
    getMonitorTypeOptions,
} from "../../utils/monitorTypeHelper";
import type { MonitorTypeConfig } from "../../../shared/types/monitorTypes";

// Mock the monitor types store
const mockMonitorTypesStore = {
    monitorTypes: [] as MonitorTypeConfig[],
    isLoaded: false,
    loadMonitorTypes: vi.fn(),
};

vi.mock("../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: {
        getState: vi.fn(() => mockMonitorTypesStore),
    },
}));

// Mock dependencies
vi.mock("../../utils/cache", () => ({
    AppCaches: {
        monitorTypes: {
            get: vi.fn(),
            set: vi.fn(),
            clear: vi.fn(),
        },
    },
}));

vi.mock("../../types/ipc", () => ({
    safeExtractIpcData: vi.fn(),
}));

vi.mock("../../utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(),
}));

// Mock global electronAPI
const mockElectronAPI = {
    monitorTypes: {
        getMonitorTypes: vi.fn(),
    },
};

Object.defineProperty(globalThis, "window", {
    value: {
        electronAPI: mockElectronAPI,
    },
    writable: true,
});

describe("monitorTypeHelper", () => {
    const mockMonitorTypes: MonitorTypeConfig[] = [
        {
            type: "http",
            displayName: "HTTP Monitor",
            description: "Monitors HTTP endpoints",
            version: "1.0.0",
            fields: [
                {
                    name: "url",
                    type: "text",
                    required: true,
                    label: "URL",
                    placeholder: "https://example.com",
                },
            ],
            uiConfig: {
                display: {
                    showUrl: true,
                    showAdvancedMetrics: true,
                },
                supportsResponseTime: true,
                supportsAdvancedAnalytics: true,
                helpTexts: {
                    primary: "Enter the URL to monitor",
                    secondary: "Must be a valid HTTP/HTTPS URL",
                },
                detailFormats: {
                    analyticsLabel: "HTTP: {url}",
                },
            },
        },
        {
            type: "ping",
            displayName: "Ping Monitor",
            description: "Monitors server connectivity via ping",
            version: "1.0.0",
            fields: [
                {
                    name: "host",
                    type: "text",
                    required: true,
                    label: "Host",
                    placeholder: "example.com",
                },
            ],
            uiConfig: {
                display: {
                    showUrl: false,
                    showAdvancedMetrics: false,
                },
                supportsResponseTime: true,
                supportsAdvancedAnalytics: false,
                helpTexts: {
                    primary: "Enter hostname or IP address",
                },
            },
        },
        {
            type: "tcp",
            displayName: "TCP Monitor",
            description: "Monitors TCP port connectivity",
            version: "1.0.0",
            fields: [
                {
                    name: "host",
                    type: "text",
                    required: true,
                    label: "Host",
                    placeholder: "example.com",
                },
                {
                    name: "port",
                    type: "number",
                    required: true,
                    label: "Port",
                    placeholder: "80",
                },
            ],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock store state
        mockMonitorTypesStore.monitorTypes = [];
        mockMonitorTypesStore.isLoaded = false;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("clearMonitorTypeCache", () => {
        it("should call cache clear method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            clearMonitorTypeCache();

            expect(AppCaches.monitorTypes.clear).toHaveBeenCalledTimes(1);
        });

        it("should clear cache when called multiple times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            clearMonitorTypeCache();
            clearMonitorTypeCache();
            clearMonitorTypeCache();

            expect(AppCaches.monitorTypes.clear).toHaveBeenCalledTimes(3);
        });
    });

    describe("getAvailableMonitorTypes", () => {
        it("should return cached data when available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                mockMonitorTypes
            );

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(mockMonitorTypes);
            expect(AppCaches.monitorTypes.get).toHaveBeenCalledWith(
                "config:all-monitor-types"
            );
            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).not.toHaveBeenCalled();
        });

        it("should fetch from backend when cache is empty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);

            // Configure mock store to return the expected monitor types
            mockMonitorTypesStore.monitorTypes = mockMonitorTypes;
            mockMonitorTypesStore.isLoaded = true;

            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(mockMonitorTypes);
            expect(AppCaches.monitorTypes.get).toHaveBeenCalledWith(
                "config:all-monitor-types"
            );
            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith(
                "config:all-monitor-types",
                mockMonitorTypes
            );
        });

        it("should handle backend fetch errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const fallbackValue: MonitorTypeConfig[] = [];

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue(
                fallbackValue
            );

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(fallbackValue);
            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith(
                "config:all-monitor-types",
                fallbackValue
            );
        });

        it("should cache fetched data for subsequent calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);

            // Configure mock store to return the expected monitor types
            mockMonitorTypesStore.monitorTypes = mockMonitorTypes;
            mockMonitorTypesStore.isLoaded = true;

            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());

            await getAvailableMonitorTypes();

            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith(
                "config:all-monitor-types",
                mockMonitorTypes
            );
        });

        it("should handle empty response from backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());
            vi.mocked(ipcTypes.safeExtractIpcData).mockReturnValue([]);

            // Configure the mock store to return empty data
            mockMonitorTypesStore.monitorTypes = [];
            mockMonitorTypesStore.isLoaded = true;

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: [],
            });

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual([]);
            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith(
                "config:all-monitor-types",
                []
            );
        });

        it("should handle invalid cache data gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(null);

            // Configure mock store to return the expected monitor types
            mockMonitorTypesStore.monitorTypes = mockMonitorTypes;
            mockMonitorTypesStore.isLoaded = true;

            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(mockMonitorTypes);
        });
    });

    describe("getMonitorTypeConfig", () => {
        beforeEach(() => {
            // Mock getAvailableMonitorTypes by directly mocking the cache
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                mockMonitorTypes
            );
        });

        it("should return config for existing monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await getMonitorTypeConfig("http");

            expect(result).toEqual(mockMonitorTypes[0]);
        });

        it("should return config for different monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const pingResult = await getMonitorTypeConfig("ping");
            const tcpResult = await getMonitorTypeConfig("tcp");

            expect(pingResult).toEqual(mockMonitorTypes[1]);
            expect(tcpResult).toEqual(mockMonitorTypes[2]);
        });

        it("should return undefined for non-existent monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await getMonitorTypeConfig("nonexistent");

            expect(result).toBeUndefined();
        });

        it("should return undefined for empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig("");

            expect(result).toBeUndefined();
        });

        it("should handle case-sensitive type matching", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig("HTTP");

            expect(result).toBeUndefined();
        });

        it("should work with whitespace in type names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig(" http ");

            expect(result).toBeUndefined();
        });

        it("should handle special characters in type names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig("http-monitor");

            expect(result).toBeUndefined();
        });

        it("should return undefined when monitor types list is empty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue([]);

            const result = await getMonitorTypeConfig("http");

            expect(result).toBeUndefined();
        });
    });

    describe("getMonitorTypeOptions", () => {
        beforeEach(() => {
            // Mock getAvailableMonitorTypes by directly mocking the cache
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                mockMonitorTypes
            );
        });

        it("should return options array for all monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "HTTP Monitor", value: "http" },
                { label: "Ping Monitor", value: "ping" },
                { label: "TCP Monitor", value: "tcp" },
            ]);
        });

        it("should return empty array when no monitor types available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue([]);

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([]);
        });

        it("should handle monitor types with complex display names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const complexTypes: MonitorTypeConfig[] = [
                {
                    type: "special-http",
                    displayName: "HTTP Monitor (Advanced)",
                    description: "Advanced HTTP monitoring",
                    version: "2.0.0",
                    fields: [],
                },
                {
                    type: "custom_ping",
                    displayName: "Custom Ping Service",
                    description: "Custom ping implementation",
                    version: "1.1.0",
                    fields: [],
                },
            ];
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(complexTypes);

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "HTTP Monitor (Advanced)", value: "special-http" },
                { label: "Custom Ping Service", value: "custom_ping" },
            ]);
        });

        it("should preserve order of monitor types from backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const reversedTypes = [...mockMonitorTypes].toReversed();
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                reversedTypes
            );

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "TCP Monitor", value: "tcp" },
                { label: "Ping Monitor", value: "ping" },
                { label: "HTTP Monitor", value: "http" },
            ]);
        });

        it("should handle monitor types with empty display names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const typesWithEmptyNames: MonitorTypeConfig[] = [
                {
                    type: "empty-name",
                    displayName: "",
                    description: "Monitor with empty display name",
                    version: "1.0.0",
                    fields: [],
                },
                {
                    type: "normal",
                    displayName: "Normal Monitor",
                    description: "Normal monitor",
                    version: "1.0.0",
                    fields: [],
                },
            ];
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                typesWithEmptyNames
            );

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "", value: "empty-name" },
                { label: "Normal Monitor", value: "normal" },
            ]);
        });

        it("should handle monitor types with special characters in names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const specialTypes: MonitorTypeConfig[] = [
                {
                    type: "special",
                    displayName: "Monitor (v2.0) - Advanced & Fast",
                    description: "Special monitor",
                    version: "2.0.0",
                    fields: [],
                },
            ];
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(specialTypes);

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "Monitor (v2.0) - Advanced & Fast", value: "special" },
            ]);
        });
    });

    describe("error handling integration", () => {
        it("should pass correct parameters to withUtilityErrorHandling", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue(
                []
            );

            await getAvailableMonitorTypes();

            expect(errorHandling.withUtilityErrorHandling).toHaveBeenCalledWith(
                expect.any(Function),
                "Fetch monitor types from backend",
                []
            );
        });

        it("should use fallback value from error handler", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const fallbackValue = [mockMonitorTypes[0]];

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue(
                fallbackValue
            );

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(fallbackValue);
        });
    });

    describe("Store integration", () => {
        it("should use monitor types store correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);

            // Configure mock store to simulate unloaded state initially
            mockMonitorTypesStore.monitorTypes = [];
            mockMonitorTypesStore.isLoaded = false;

            const loadMonitorTypesMock = vi.fn().mockImplementation(() => {
                // Simulate loading completing
                mockMonitorTypesStore.monitorTypes = mockMonitorTypes;
                mockMonitorTypesStore.isLoaded = true;
            });
            mockMonitorTypesStore.loadMonitorTypes = loadMonitorTypesMock;

            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());

            await getAvailableMonitorTypes();

            expect(loadMonitorTypesMock).toHaveBeenCalledTimes(1);
        });
    });
});
