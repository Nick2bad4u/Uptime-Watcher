/**
 * @fileoverview Comprehensive tests for monitor UI helper utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as monitorUiHelpers from "../../utils/monitorUiHelpers";
import { AppCaches } from "../../utils/cache";
import { getMonitorTypeConfig } from "../../utils/monitorTypeHelper";

// Mock dependencies
vi.mock("../../types/ipc", () => ({
    safeExtractIpcData: vi.fn((response, fallback) => response.data || fallback),
}));

vi.mock("../../utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(async (fn, _description, fallback) => {
        try {
            return await fn();
        } catch {
            return fallback;
        }
    }),
}));

vi.mock("../../utils/monitorTypeHelper", () => ({
    getAvailableMonitorTypes: vi.fn(),
    getMonitorTypeConfig: vi.fn(),
}));

// Helper function to create complete MonitorTypeConfig objects
function createMockConfig(overrides: any = {}) {
    return {
        type: "http",
        displayName: "HTTP Monitor",
        description: "HTTP monitoring",
        version: "1.0.0",
        fields: [],
        uiConfig: {
            supportsAdvancedAnalytics: false,
            supportsResponseTime: false,
            display: { showUrl: false },
            helpTexts: {},
            detailFormats: {},
            ...overrides.uiConfig,
        },
        ...overrides,
    };
}

// Mock window.electronAPI
const mockElectronAPI = {
    monitorTypes: {
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
    },
};

Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("Monitor UI Helpers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        AppCaches.uiHelpers.clear();
        // Reset getMonitorTypeConfig mock to default implementation
        vi.mocked(getMonitorTypeConfig).mockImplementation(async () => undefined);
    });

    afterEach(() => {
        vi.clearAllMocks();
        AppCaches.uiHelpers.clear();
    });

    describe("allSupportsAdvancedAnalytics", () => {
        it("should return true when all monitor types support advanced analytics", async () => {
            vi.mocked(getMonitorTypeConfig).mockImplementation(async (type) => {
                if (type === "http" || type === "port") {
                    return createMockConfig({
                        type,
                        uiConfig: { supportsAdvancedAnalytics: true },
                    });
                }
                return undefined;
            });

            const result = await monitorUiHelpers.allSupportsAdvancedAnalytics(["http", "port"]);

            expect(result).toBe(true);
        });

        it("should return false when some monitor types don't support advanced analytics", async () => {
            vi.mocked(getMonitorTypeConfig).mockImplementation(async (type) => {
                if (type === "http") {
                    return createMockConfig({
                        type,
                        uiConfig: { supportsAdvancedAnalytics: true },
                    });
                }
                if (type === "port") {
                    return createMockConfig({
                        type,
                        uiConfig: { supportsAdvancedAnalytics: false },
                    });
                }
                return undefined;
            });

            const result = await monitorUiHelpers.allSupportsAdvancedAnalytics(["http", "port"]);

            expect(result).toBe(false);
        });

        it("should return true for empty array", async () => {
            const result = await monitorUiHelpers.allSupportsAdvancedAnalytics([]);

            expect(result).toBe(true);
        });
    });

    describe("allSupportsResponseTime", () => {
        it("should return true when all monitor types support response time", async () => {
            vi.mocked(getMonitorTypeConfig).mockImplementation(async (type) => {
                if (type === "http" || type === "port") {
                    return createMockConfig({
                        type,
                        uiConfig: { supportsResponseTime: true },
                    });
                }
                return undefined;
            });

            const result = await monitorUiHelpers.allSupportsResponseTime(["http", "port"]);

            expect(result).toBe(true);
        });

        it("should return false when some monitor types don't support response time", async () => {
            vi.mocked(getMonitorTypeConfig).mockImplementation(async (type) => {
                if (type === "http") {
                    return createMockConfig({
                        type,
                        uiConfig: { supportsResponseTime: true },
                    });
                }
                if (type === "port") {
                    return createMockConfig({
                        type,
                        uiConfig: { supportsResponseTime: false },
                    });
                }
                return undefined;
            });

            const result = await monitorUiHelpers.allSupportsResponseTime(["http", "port"]);

            expect(result).toBe(false);
        });

        it("should return true for empty array", async () => {
            const result = await monitorUiHelpers.allSupportsResponseTime([]);

            expect(result).toBe(true);
        });
    });

    describe("supportsAdvancedAnalytics", () => {
        it("should return true when monitor type supports advanced analytics", async () => {
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { supportsAdvancedAnalytics: true },
                })
            );

            const result = await monitorUiHelpers.supportsAdvancedAnalytics("http");

            expect(result).toBe(true);
        });

        it("should return false when monitor type doesn't support advanced analytics", async () => {
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { supportsAdvancedAnalytics: false },
                })
            );

            const result = await monitorUiHelpers.supportsAdvancedAnalytics("http");

            expect(result).toBe(false);
        });

        it("should return false when config is undefined", async () => {
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            const result = await monitorUiHelpers.supportsAdvancedAnalytics("http");

            expect(result).toBe(false);
        });
    });

    describe("supportsResponseTime", () => {
        it("should return true when monitor type supports response time", async () => {
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { supportsResponseTime: true },
                })
            );

            const result = await monitorUiHelpers.supportsResponseTime("http");

            expect(result).toBe(true);
        });

        it("should return false when monitor type doesn't support response time", async () => {
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { supportsResponseTime: false },
                })
            );

            const result = await monitorUiHelpers.supportsResponseTime("http");

            expect(result).toBe(false);
        });

        it("should return false when config is undefined", async () => {
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            const result = await monitorUiHelpers.supportsResponseTime("http");

            expect(result).toBe(false);
        });
    });

    describe("shouldShowUrl", () => {
        it("should return true when monitor type should show URL", async () => {
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { display: { showUrl: true } },
                })
            );

            const result = await monitorUiHelpers.shouldShowUrl("http");

            expect(result).toBe(true);
        });

        it("should return false when monitor type shouldn't show URL", async () => {
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { display: { showUrl: false } },
                })
            );

            const result = await monitorUiHelpers.shouldShowUrl("http");

            expect(result).toBe(false);
        });

        it("should return false when config is undefined", async () => {
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            const result = await monitorUiHelpers.shouldShowUrl("http");

            expect(result).toBe(false);
        });
    });

    describe("clearConfigCache", () => {
        it("should clear the ui helpers cache", () => {
            // Set some data in cache
            AppCaches.uiHelpers.set("test-key", "test-value");
            expect(AppCaches.uiHelpers.has("test-key")).toBe(true);

            // Clear cache
            monitorUiHelpers.clearConfigCache();

            // Verify cache is cleared
            expect(AppCaches.uiHelpers.has("test-key")).toBe(false);
        });
    });

    describe("getDefaultMonitorId", () => {
        it("should return first monitor ID from non-empty array", () => {
            const result = monitorUiHelpers.getDefaultMonitorId(["monitor-1", "monitor-2", "monitor-3"]);

            expect(result).toBe("monitor-1");
        });

        it("should return empty string for empty array", () => {
            const result = monitorUiHelpers.getDefaultMonitorId([]);

            expect(result).toBe("");
        });

        it("should handle array with single element", () => {
            const result = monitorUiHelpers.getDefaultMonitorId(["only-monitor"]);

            expect(result).toBe("only-monitor");
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle errors gracefully in basic functions", async () => {
            vi.mocked(getMonitorTypeConfig).mockRejectedValue(new Error("Config fetch failed"));

            // All functions should return their fallback values on error
            expect(await monitorUiHelpers.supportsAdvancedAnalytics("http")).toBe(false);
            expect(await monitorUiHelpers.supportsResponseTime("http")).toBe(false);
            expect(await monitorUiHelpers.shouldShowUrl("http")).toBe(false);
            expect(await monitorUiHelpers.getAnalyticsLabel("http")).toBe("HTTP Response Time");
            expect(await monitorUiHelpers.getMonitorHelpTexts("http")).toEqual({});
        });

        it("should handle invalid monitor types", async () => {
            const invalidType = "invalid-type" as any; // Cast to test edge case

            // Mock to return undefined for invalid types (this is the default, but let's be explicit)
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            expect(await monitorUiHelpers.supportsAdvancedAnalytics(invalidType)).toBe(false);
            expect(await monitorUiHelpers.supportsResponseTime(invalidType)).toBe(false);
            expect(await monitorUiHelpers.shouldShowUrl(invalidType)).toBe(false);
        });
    });

    describe("Caching behavior", () => {
        it("should cache configuration results", async () => {
            const mockConfig = createMockConfig({
                type: "http",
                uiConfig: {
                    supportsAdvancedAnalytics: true,
                    supportsResponseTime: true,
                    display: { showUrl: true },
                },
            });

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(mockConfig);

            // First call should fetch from backend
            await monitorUiHelpers.supportsAdvancedAnalytics("http");
            expect(vi.mocked(getMonitorTypeConfig)).toHaveBeenCalledTimes(1);

            // Second call should use cached result
            await monitorUiHelpers.supportsResponseTime("http");
            expect(vi.mocked(getMonitorTypeConfig)).toHaveBeenCalledTimes(1); // Still 1, not 2
        });

        it("should clear cache when clearConfigCache is called", async () => {
            const mockConfig = createMockConfig({
                type: "http",
                uiConfig: {
                    supportsAdvancedAnalytics: true,
                    supportsResponseTime: true,
                    display: { showUrl: true },
                },
            });

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(mockConfig);

            // First call
            await monitorUiHelpers.supportsAdvancedAnalytics("http");
            expect(vi.mocked(getMonitorTypeConfig)).toHaveBeenCalledTimes(1);

            // Clear cache
            monitorUiHelpers.clearConfigCache();

            // Next call should fetch again
            await monitorUiHelpers.supportsResponseTime("http");
            expect(vi.mocked(getMonitorTypeConfig)).toHaveBeenCalledTimes(2);
        });
    });
});
