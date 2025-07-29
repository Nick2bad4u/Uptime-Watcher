/**
 * @fileoverview Tests for monitorTypeHelper utility functions
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
    type MonitorTypeConfig,
} from "../../utils/monitorTypeHelper";

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

Object.defineProperty(global, "window", {
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
                    type: "string",
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
                    type: "string",
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
                    type: "string",
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
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("clearMonitorTypeCache", () => {
        it("should call cache clear method", () => {
            clearMonitorTypeCache();

            expect(AppCaches.monitorTypes.clear).toHaveBeenCalledTimes(1);
        });

        it("should clear cache when called multiple times", () => {
            clearMonitorTypeCache();
            clearMonitorTypeCache();
            clearMonitorTypeCache();

            expect(AppCaches.monitorTypes.clear).toHaveBeenCalledTimes(3);
        });
    });

    describe("getAvailableMonitorTypes", () => {
        it("should return cached data when available", async () => {
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(mockMonitorTypes);

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(mockMonitorTypes);
            expect(AppCaches.monitorTypes.get).toHaveBeenCalledWith("all-monitor-types");
            expect(mockElectronAPI.monitorTypes.getMonitorTypes).not.toHaveBeenCalled();
        });

        it("should fetch from backend when cache is empty", async () => {
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockImplementation(async (fn) => await fn());
            vi.mocked(ipcTypes.safeExtractIpcData).mockReturnValue(mockMonitorTypes);
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockMonitorTypes,
            });

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(mockMonitorTypes);
            expect(AppCaches.monitorTypes.get).toHaveBeenCalledWith("all-monitor-types");
            expect(mockElectronAPI.monitorTypes.getMonitorTypes).toHaveBeenCalledTimes(1);
            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith("all-monitor-types", mockMonitorTypes);
        });

        it("should handle backend fetch errors gracefully", async () => {
            const fallbackValue: MonitorTypeConfig[] = [];

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue(fallbackValue);

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(fallbackValue);
            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith("all-monitor-types", fallbackValue);
        });

        it("should cache fetched data for subsequent calls", async () => {
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockImplementation(async (fn) => await fn());
            vi.mocked(ipcTypes.safeExtractIpcData).mockReturnValue(mockMonitorTypes);
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockMonitorTypes,
            });

            await getAvailableMonitorTypes();

            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith("all-monitor-types", mockMonitorTypes);
        });

        it("should handle empty response from backend", async () => {
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockImplementation(async (fn) => await fn());
            vi.mocked(ipcTypes.safeExtractIpcData).mockReturnValue([]);
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: [],
            });

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual([]);
            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith("all-monitor-types", []);
        });

        it("should handle invalid cache data gracefully", async () => {
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(null);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockImplementation(async (fn) => await fn());
            vi.mocked(ipcTypes.safeExtractIpcData).mockReturnValue(mockMonitorTypes);
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockMonitorTypes,
            });

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(mockMonitorTypes);
            expect(mockElectronAPI.monitorTypes.getMonitorTypes).toHaveBeenCalledTimes(1);
        });
    });

    describe("getMonitorTypeConfig", () => {
        beforeEach(() => {
            // Mock getAvailableMonitorTypes by directly mocking the cache
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(mockMonitorTypes);
        });

        it("should return config for existing monitor type", async () => {
            const result = await getMonitorTypeConfig("http");

            expect(result).toEqual(mockMonitorTypes[0]);
        });

        it("should return config for different monitor types", async () => {
            const pingResult = await getMonitorTypeConfig("ping");
            const tcpResult = await getMonitorTypeConfig("tcp");

            expect(pingResult).toEqual(mockMonitorTypes[1]);
            expect(tcpResult).toEqual(mockMonitorTypes[2]);
        });

        it("should return undefined for non-existent monitor type", async () => {
            const result = await getMonitorTypeConfig("nonexistent");

            expect(result).toBeUndefined();
        });

        it("should return undefined for empty string", async () => {
            const result = await getMonitorTypeConfig("");

            expect(result).toBeUndefined();
        });

        it("should handle case-sensitive type matching", async () => {
            const result = await getMonitorTypeConfig("HTTP");

            expect(result).toBeUndefined();
        });

        it("should work with whitespace in type names", async () => {
            const result = await getMonitorTypeConfig(" http ");

            expect(result).toBeUndefined();
        });

        it("should handle special characters in type names", async () => {
            const result = await getMonitorTypeConfig("http-monitor");

            expect(result).toBeUndefined();
        });

        it("should return undefined when monitor types list is empty", async () => {
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue([]);

            const result = await getMonitorTypeConfig("http");

            expect(result).toBeUndefined();
        });
    });

    describe("getMonitorTypeOptions", () => {
        beforeEach(() => {
            // Mock getAvailableMonitorTypes by directly mocking the cache
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(mockMonitorTypes);
        });

        it("should return options array for all monitor types", async () => {
            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "HTTP Monitor", value: "http" },
                { label: "Ping Monitor", value: "ping" },
                { label: "TCP Monitor", value: "tcp" },
            ]);
        });

        it("should return empty array when no monitor types available", async () => {
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue([]);

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([]);
        });

        it("should handle monitor types with complex display names", async () => {
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

        it("should preserve order of monitor types from backend", async () => {
            const reversedTypes = [...mockMonitorTypes].reverse();
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(reversedTypes);

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "TCP Monitor", value: "tcp" },
                { label: "Ping Monitor", value: "ping" },
                { label: "HTTP Monitor", value: "http" },
            ]);
        });

        it("should handle monitor types with empty display names", async () => {
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
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(typesWithEmptyNames);

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "", value: "empty-name" },
                { label: "Normal Monitor", value: "normal" },
            ]);
        });

        it("should handle monitor types with special characters in names", async () => {
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

            expect(result).toEqual([{ label: "Monitor (v2.0) - Advanced & Fast", value: "special" }]);
        });
    });

    describe("error handling integration", () => {
        it("should pass correct parameters to withUtilityErrorHandling", async () => {
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue([]);

            await getAvailableMonitorTypes();

            expect(errorHandling.withUtilityErrorHandling).toHaveBeenCalledWith(
                expect.any(Function),
                "Fetch monitor types from backend",
                []
            );
        });

        it("should use fallback value from error handler", async () => {
            const fallbackValue = [mockMonitorTypes[0]];

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue(fallbackValue);

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(fallbackValue);
        });
    });

    describe("IPC integration", () => {
        it("should call electronAPI with correct method", async () => {
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockImplementation(async (fn) => await fn());
            vi.mocked(ipcTypes.safeExtractIpcData).mockReturnValue(mockMonitorTypes);
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockMonitorTypes,
            });

            await getAvailableMonitorTypes();

            expect(mockElectronAPI.monitorTypes.getMonitorTypes).toHaveBeenCalledTimes(1);
            expect(ipcTypes.safeExtractIpcData).toHaveBeenCalledWith({ success: true, data: mockMonitorTypes }, []);
        });
    });
});
