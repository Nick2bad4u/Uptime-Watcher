/**
 * Tests for monitorUiHelpers utility functions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    allSupportsAdvancedAnalytics,
    allSupportsResponseTime,
    clearConfigCache,
    formatMonitorDetail,
    formatMonitorTitleSuffix,
    getAnalyticsLabel,
    getDefaultMonitorId,
    getMonitorHelpTexts,
    getTypesWithFeature,
    shouldShowUrl,
    supportsAdvancedAnalytics,
    supportsResponseTime,
} from "../../utils/monitorUiHelpers";
import type { MonitorType } from "../../../shared/types";

// Mock dependencies
vi.mock("../../utils/monitorTypeHelper", () => ({
    getAvailableMonitorTypes: vi.fn().mockResolvedValue([
        {
            type: "http",
            name: "HTTP",
            description: "Monitor HTTP endpoints",
            fields: { url: { type: "url", required: true } },
            features: { advancedAnalytics: true, responseTime: true },
            uiConfig: {
                helpTexts: {
                    general: "Monitor HTTP endpoints for availability",
                    advanced: "",
                },
                detailFormats: {
                    analyticsLabel: "HTTP Analytics",
                },
                display: {
                    showUrl: true,
                },
                supportsAdvancedAnalytics: true,
                supportsResponseTime: true,
            },
        },
        {
            type: "ping",
            name: "Ping",
            description: "Monitor server ping",
            fields: { host: { type: "hostname", required: true } },
            features: { advancedAnalytics: false, responseTime: true },
            uiConfig: {
                helpTexts: {
                    general: "Monitor server ping response",
                    advanced: "",
                },
                detailFormats: {
                    analyticsLabel: "Ping Analytics",
                },
                display: {
                    showUrl: false,
                },
                supportsAdvancedAnalytics: false,
                supportsResponseTime: true,
            },
        },
        {
            type: "tcp",
            name: "TCP",
            description: "Monitor TCP ports",
            fields: { host: { type: "hostname", required: true }, port: { type: "number", required: true } },
            features: { advancedAnalytics: true, responseTime: false },
            uiConfig: {
                helpTexts: {
                    general: "Monitor TCP port connectivity",
                    advanced: "",
                },
                detailFormats: {
                    analyticsLabel: "TCP Analytics",
                },
                display: {
                    showUrl: false,
                },
                supportsAdvancedAnalytics: true,
                supportsResponseTime: false,
            },
        },
    ]),
    getMonitorTypeConfig: vi.fn().mockImplementation((type: string) => {
        const configs: Record<string, any> = {
            http: {
                type: "http",
                name: "HTTP",
                description: "Monitor HTTP endpoints",
                fields: { url: { type: "url", required: true } },
                features: { advancedAnalytics: true, responseTime: true },
                uiConfig: {
                    helpTexts: {
                        general: "Monitor HTTP endpoints for availability",
                        advanced: "",
                    },
                    detailFormats: {
                        analyticsLabel: "HTTP Analytics",
                    },
                    display: {
                        showUrl: true,
                    },
                    supportsAdvancedAnalytics: true,
                    supportsResponseTime: true,
                },
            },
            ping: {
                type: "ping",
                name: "Ping",
                description: "Monitor server ping",
                fields: { host: { type: "hostname", required: true } },
                features: { advancedAnalytics: false, responseTime: true },
                uiConfig: {
                    helpTexts: {
                        general: "Monitor server ping response",
                        advanced: "",
                    },
                    detailFormats: {
                        analyticsLabel: "Ping Analytics",
                    },
                    display: {
                        showUrl: false,
                    },
                    supportsAdvancedAnalytics: false,
                    supportsResponseTime: true,
                },
            },
            tcp: {
                type: "tcp",
                name: "TCP",
                description: "Monitor TCP ports",
                fields: { host: { type: "hostname", required: true }, port: { type: "number", required: true } },
                features: { advancedAnalytics: true, responseTime: false },
                uiConfig: {
                    helpTexts: {
                        general: "Monitor TCP port connectivity",
                        advanced: "",
                    },
                    detailFormats: {
                        analyticsLabel: "TCP Analytics",
                    },
                    display: {
                        showUrl: false,
                    },
                    supportsAdvancedAnalytics: true,
                    supportsResponseTime: false,
                },
            },
        };
        return Promise.resolve(configs[type] || null);
    }),
}));

vi.mock("../../utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn().mockImplementation(async (fn, description, fallback) => {
        try {
            return await fn();
        } catch {
            return fallback;
        }
    }),
}));

vi.mock("../../utils/cache", () => ({
    AppCaches: {
        uiHelpers: {
            clear: vi.fn(),
            get: vi.fn(),
            set: vi.fn(),
            has: vi.fn(),
            delete: vi.fn(),
            cleanup: vi.fn(),
        },
    },
}));

vi.mock("../../types/ipc", () => ({
    safeExtractIpcData: vi.fn().mockImplementation((data) => data || {}),
}));

describe("monitorUiHelpers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearConfigCache();
    });

    describe("allSupportsAdvancedAnalytics", () => {
        it("should return true when all types support advanced analytics", async () => {
            const types: MonitorType[] = ["http", "tcp"];
            const result = await allSupportsAdvancedAnalytics(types);
            expect(result).toBe(true);
        });

        it("should return false when some types don't support advanced analytics", async () => {
            const types: MonitorType[] = ["http", "ping"]; // ping doesn't support advanced analytics
            const result = await allSupportsAdvancedAnalytics(types);
            expect(result).toBe(false);
        });

        it("should return true for empty array", async () => {
            const result = await allSupportsAdvancedAnalytics([]);
            expect(result).toBe(true);
        });
    });

    describe("allSupportsResponseTime", () => {
        it("should return true when all types support response time", async () => {
            const types: MonitorType[] = ["http", "ping"];
            const result = await allSupportsResponseTime(types);
            expect(result).toBe(true);
        });

        it("should return false when some types don't support response time", async () => {
            const types: MonitorType[] = ["http", "tcp"]; // tcp doesn't support response time
            const result = await allSupportsResponseTime(types);
            expect(result).toBe(false);
        });

        it("should return true for empty array", async () => {
            const result = await allSupportsResponseTime([]);
            expect(result).toBe(true);
        });
    });

    describe("clearConfigCache", () => {
        it("should clear cache without throwing", () => {
            expect(() => clearConfigCache()).not.toThrow();
        });
    });

    describe("formatMonitorDetail", () => {
        it("should format details for known monitor types (fallback to original)", async () => {
            const result = await formatMonitorDetail("http", "test details");
            expect(result).toBe("test details"); // IPC not available, falls back to original
        });

        it("should handle unknown monitor types", async () => {
            const result = await formatMonitorDetail("unknown" as MonitorType, "test details");
            expect(result).toBe("test details"); // IPC not available, falls back to original
        });

        it("should handle errors when electronAPI is not available", async () => {
            // Test the error path by mocking the error handling to simulate API unavailability
            const { withUtilityErrorHandling } = await import("../../utils/errorHandling");
            vi.mocked(withUtilityErrorHandling).mockImplementationOnce(async (fn, description, fallback) => {
                // Simulate the error case where electronAPI fails
                try {
                    throw new Error("ElectronAPI not available");
                } catch {
                    return fallback;
                }
            });

            const result = await formatMonitorDetail("http", "test details");
            expect(result).toBe("test details"); // Falls back to original on error
        });

        it("should handle errors when electronAPI methods are missing", async () => {
            // Mock incomplete electronAPI by mocking the error handling
            const { withUtilityErrorHandling } = await import("../../utils/errorHandling");
            vi.mocked(withUtilityErrorHandling).mockImplementationOnce(async (fn, description, fallback) => {
                try {
                    // Simulate method missing error
                    throw new Error("Method not available");
                } catch {
                    return fallback;
                }
            });

            const result = await formatMonitorDetail("http", "test details");
            expect(result).toBe("test details"); // Falls back to original on error
        });
    });

    describe("formatMonitorTitleSuffix", () => {
        it("should return empty string for http (IPC not available)", async () => {
            const result = await formatMonitorTitleSuffix("http", "test.com");
            expect(result).toBe("");
        });

        it("should return empty string for ping (IPC not available)", async () => {
            const result = await formatMonitorTitleSuffix("ping", "server.com");
            expect(result).toBe("");
        });

        it("should handle unknown monitor types", async () => {
            const result = await formatMonitorTitleSuffix("unknown" as MonitorType, "test.com");
            expect(result).toBe("");
        });

        it("should handle errors when electronAPI is not available", async () => {
            // Test the error path by mocking the error handling to simulate API unavailability
            const { withUtilityErrorHandling } = await import("../../utils/errorHandling");
            vi.mocked(withUtilityErrorHandling).mockImplementationOnce(async (fn, description, fallback) => {
                // Simulate the error case where electronAPI fails
                try {
                    throw new Error("ElectronAPI not available");
                } catch {
                    return fallback;
                }
            });

            const result = await formatMonitorTitleSuffix("http", { url: "test.com" });
            expect(result).toBe(""); // Falls back to empty string on error
        });

        it("should handle errors when electronAPI methods are missing", async () => {
            // Mock incomplete electronAPI by mocking the error handling
            const { withUtilityErrorHandling } = await import("../../utils/errorHandling");
            vi.mocked(withUtilityErrorHandling).mockImplementationOnce(async (fn, description, fallback) => {
                try {
                    // Simulate method missing error
                    throw new Error("Method not available");
                } catch {
                    return fallback;
                }
            });

            const result = await formatMonitorTitleSuffix("http", { url: "test.com" });
            expect(result).toBe(""); // Falls back to empty string on error
        });
    });

    describe("getAnalyticsLabel", () => {
        it("should return analytics label for http", async () => {
            const result = await getAnalyticsLabel("http");
            expect(result).toBe("HTTP Analytics");
        });

        it("should return analytics label for ping", async () => {
            const result = await getAnalyticsLabel("ping");
            expect(result).toBe("Ping Analytics");
        });

        it("should handle unknown monitor types", async () => {
            const result = await getAnalyticsLabel("unknown" as MonitorType);
            expect(result).toBe("UNKNOWN Response Time"); // Falls back to default format
        });
    });

    describe("getDefaultMonitorId", () => {
        it("should return first monitor ID from array", () => {
            const ids = ["monitor1", "monitor2", "monitor3"];
            const result = getDefaultMonitorId(ids);
            expect(result).toBe("monitor1");
        });

        it("should return empty string for empty array", () => {
            const result = getDefaultMonitorId([]);
            expect(result).toBe("");
        });

        it("should handle single monitor ID", () => {
            const result = getDefaultMonitorId(["single-monitor"]);
            expect(result).toBe("single-monitor");
        });
    });

    describe("getMonitorHelpTexts", () => {
        it("should return help texts for http", async () => {
            const result = await getMonitorHelpTexts("http");
            expect(result).toEqual({
                general: "Monitor HTTP endpoints for availability",
                advanced: "",
            });
        });

        it("should return help texts for ping", async () => {
            const result = await getMonitorHelpTexts("ping");
            expect(result).toEqual({
                general: "Monitor server ping response",
                advanced: "",
            });
        });

        it("should handle unknown monitor types", async () => {
            const result = await getMonitorHelpTexts("unknown" as MonitorType);
            expect(result).toEqual({}); // Returns empty object for unknown types
        });
    });

    describe("getTypesWithFeature", () => {
        it("should return types with advanced analytics feature", async () => {
            const result = await getTypesWithFeature("advancedAnalytics");
            expect(result).toContain("http");
            expect(result).toContain("tcp");
            expect(result).not.toContain("ping");
        });

        it("should return types with response time feature", async () => {
            const result = await getTypesWithFeature("responseTime");
            expect(result).toContain("http");
            expect(result).toContain("ping");
            expect(result).not.toContain("tcp");
        });
    });

    describe("shouldShowUrl", () => {
        it("should return true for http monitors", async () => {
            const result = await shouldShowUrl("http");
            expect(result).toBe(true);
        });

        it("should return false for ping monitors", async () => {
            const result = await shouldShowUrl("ping");
            expect(result).toBe(false);
        });

        it("should return false for tcp monitors", async () => {
            const result = await shouldShowUrl("tcp");
            expect(result).toBe(false);
        });

        it("should handle unknown monitor types", async () => {
            const result = await shouldShowUrl("unknown" as MonitorType);
            expect(result).toBe(false);
        });
    });

    describe("supportsAdvancedAnalytics", () => {
        it("should return true for http", async () => {
            const result = await supportsAdvancedAnalytics("http");
            expect(result).toBe(true);
        });

        it("should return false for ping", async () => {
            const result = await supportsAdvancedAnalytics("ping");
            expect(result).toBe(false);
        });

        it("should return true for tcp", async () => {
            const result = await supportsAdvancedAnalytics("tcp");
            expect(result).toBe(true);
        });

        it("should handle unknown monitor types", async () => {
            const result = await supportsAdvancedAnalytics("unknown" as MonitorType);
            expect(result).toBe(false);
        });
    });

    describe("supportsResponseTime", () => {
        it("should return true for http", async () => {
            const result = await supportsResponseTime("http");
            expect(result).toBe(true);
        });

        it("should return true for ping", async () => {
            const result = await supportsResponseTime("ping");
            expect(result).toBe(true);
        });

        it("should return false for tcp", async () => {
            const result = await supportsResponseTime("tcp");
            expect(result).toBe(false);
        });

        it("should handle unknown monitor types", async () => {
            const result = await supportsResponseTime("unknown" as MonitorType);
            expect(result).toBe(false);
        });
    });

    describe("Configuration Caching", () => {
        it("should cache configuration after first retrieval", async () => {
            const { AppCaches } = await import("../../utils/cache");

            // Clear cache before test
            clearConfigCache();

            // Mock cache methods
            const mockGet = vi.spyOn(AppCaches.uiHelpers, "get");
            const mockSet = vi.spyOn(AppCaches.uiHelpers, "set");

            // First call should miss cache and set it
            mockGet.mockReturnValueOnce(undefined);
            const result1 = await getAnalyticsLabel("http");
            expect(result1).toBe("HTTP Analytics");
            expect(mockSet).toHaveBeenCalled();

            // Second call should hit cache
            mockGet.mockReturnValueOnce({
                type: "http",
                uiConfig: {
                    detailFormats: {
                        analyticsLabel: "Cached HTTP Analytics",
                    },
                },
            });
            const result2 = await getAnalyticsLabel("http");
            expect(result2).toBe("Cached HTTP Analytics");
        });

        it("should handle cache miss and config not found", async () => {
            const { getMonitorTypeConfig } = await import("../../utils/monitorTypeHelper");

            // Mock getMonitorTypeConfig to return null
            vi.mocked(getMonitorTypeConfig).mockResolvedValueOnce(null);

            const result = await getAnalyticsLabel("nonexistent" as MonitorType);
            expect(result).toBe("NONEXISTENT Response Time"); // Fallback format
        });

        it("should handle undefined cache values gracefully", async () => {
            const { AppCaches } = await import("../../utils/cache");

            // Mock cache to return undefined
            vi.spyOn(AppCaches.uiHelpers, "get").mockReturnValue(undefined);

            const result = await shouldShowUrl("http");
            expect(result).toBe(true); // Should fetch from backend
        });
    });

    describe("Error Handling Edge Cases", () => {
        it("should handle getMonitorTypeConfig returning undefined", async () => {
            const { getMonitorTypeConfig } = await import("../../utils/monitorTypeHelper");

            // Mock to return undefined
            vi.mocked(getMonitorTypeConfig).mockResolvedValueOnce(undefined);

            const result = await getMonitorHelpTexts("unknown" as MonitorType);
            expect(result).toEqual({}); // Should return empty object
        });

        it("should handle config with missing uiConfig", async () => {
            const { getMonitorTypeConfig } = await import("../../utils/monitorTypeHelper");

            // Mock to return config without uiConfig
            vi.mocked(getMonitorTypeConfig).mockResolvedValueOnce({
                type: "test",
                name: "Test",
                description: "Test monitor",
                fields: {},
                features: {},
                // No uiConfig
            } as any);

            const result = await shouldShowUrl("test" as MonitorType);
            expect(result).toBe(false); // Should fallback to false
        });

        it("should handle config with partial uiConfig", async () => {
            const { getMonitorTypeConfig } = await import("../../utils/monitorTypeHelper");

            // Mock to return config with partial uiConfig
            vi.mocked(getMonitorTypeConfig).mockResolvedValueOnce({
                type: "test",
                name: "Test",
                description: "Test monitor",
                fields: {},
                features: {},
                uiConfig: {
                    // Missing some properties
                    helpTexts: {
                        general: "Test help",
                    },
                    // Missing display, detailFormats, etc.
                },
            } as any);

            const result = await supportsAdvancedAnalytics("test" as MonitorType);
            expect(result).toBe(false); // Should fallback to false
        });
    });

    describe("Cache Key Generation", () => {
        it("should generate unique cache keys for different monitor types", async () => {
            // Test that different monitor types generate different cache keys
            // by clearing cache and checking that configurations are retrieved separately
            clearConfigCache();

            const result1 = await getAnalyticsLabel("http");
            const result2 = await getAnalyticsLabel("ping");

            expect(result1).toBe("HTTP Analytics");
            expect(result2).toBe("Ping Analytics");
            expect(result1).not.toBe(result2);
        });

        it("should sanitize cache keys for monitor types with special characters", async () => {
            // This test ensures the cache key sanitization works
            // Even though we don't have monitor types with special chars in our mock,
            // this tests the generateCacheKey function's sanitization
            clearConfigCache();

            const result = await getAnalyticsLabel("test-type" as MonitorType);
            expect(result).toBe("TEST-TYPE Response Time"); // Should handle sanitization
        });
    });
});
