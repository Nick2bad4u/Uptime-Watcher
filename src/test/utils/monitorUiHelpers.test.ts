/**
 * @file Comprehensive tests for monitor UI helper utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fc, test } from "@fast-check/vitest";
import * as monitorUiHelpers from "../../utils/monitorUiHelpers";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import { AppCaches } from "../../utils/cache";
import { getMonitorTypeConfig } from "../../utils/monitorTypeHelper";

// Mock dependencies
vi.mock("../../types/ipc", () => ({
    safeExtractIpcData: vi.fn(
        (response, fallback) => response.data || fallback
    ),
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
function createMockConfig(overrides: Partial<MonitorTypeConfig> = {}) {
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

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("Monitor UI Helpers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        AppCaches.uiHelpers.clear();
        // Reset getMonitorTypeConfig mock to default implementation
        vi.mocked(getMonitorTypeConfig).mockImplementation(
            async () => undefined
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
        AppCaches.uiHelpers.clear();
    });

    describe("allSupportsAdvancedAnalytics", () => {
        it("should return true when all monitor types support advanced analytics", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(getMonitorTypeConfig).mockImplementation(async (type) => {
                if (type === "http" || type === "port") {
                    return createMockConfig({
                        type,
                        uiConfig: { supportsAdvancedAnalytics: true },
                    });
                }
                return undefined;
            });

            const result = await monitorUiHelpers.allSupportsAdvancedAnalytics([
                "http",
                "port",
            ]);

            expect(result).toBe(true);
        });

        it("should return false when some monitor types don't support advanced analytics", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

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

            const result = await monitorUiHelpers.allSupportsAdvancedAnalytics([
                "http",
                "port",
            ]);

            expect(result).toBe(false);
        });

        it("should return true for empty array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await monitorUiHelpers.allSupportsAdvancedAnalytics(
                []
            );

            expect(result).toBe(true);
        });
    });

    describe("allSupportsResponseTime", () => {
        it("should return true when all monitor types support response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(getMonitorTypeConfig).mockImplementation(async (type) => {
                if (type === "http" || type === "port") {
                    return createMockConfig({
                        type,
                        uiConfig: { supportsResponseTime: true },
                    });
                }
                return undefined;
            });

            const result = await monitorUiHelpers.allSupportsResponseTime([
                "http",
                "port",
            ]);

            expect(result).toBe(true);
        });

        it("should return false when some monitor types don't support response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

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

            const result = await monitorUiHelpers.allSupportsResponseTime([
                "http",
                "port",
            ]);

            expect(result).toBe(false);
        });

        it("should return true for empty array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await monitorUiHelpers.allSupportsResponseTime([]);

            expect(result).toBe(true);
        });
    });

    describe("supportsAdvancedAnalytics", () => {
        it("should return true when monitor type supports advanced analytics", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { supportsAdvancedAnalytics: true },
                })
            );

            const result =
                await monitorUiHelpers.supportsAdvancedAnalytics("http");

            expect(result).toBe(true);
        });

        it("should return false when monitor type doesn't support advanced analytics", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { supportsAdvancedAnalytics: false },
                })
            );

            const result =
                await monitorUiHelpers.supportsAdvancedAnalytics("http");

            expect(result).toBe(false);
        });

        it("should return false when config is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            const result =
                await monitorUiHelpers.supportsAdvancedAnalytics("http");

            expect(result).toBe(false);
        });
    });

    describe("supportsResponseTime", () => {
        it("should return true when monitor type supports response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { supportsResponseTime: true },
                })
            );

            const result = await monitorUiHelpers.supportsResponseTime("http");

            expect(result).toBe(true);
        });

        it("should return false when monitor type doesn't support response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { supportsResponseTime: false },
                })
            );

            const result = await monitorUiHelpers.supportsResponseTime("http");

            expect(result).toBe(false);
        });

        it("should return false when config is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            const result = await monitorUiHelpers.supportsResponseTime("http");

            expect(result).toBe(false);
        });
    });

    describe("shouldShowUrl", () => {
        it("should return true when monitor type should show URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { display: { showUrl: true } },
                })
            );

            const result = await monitorUiHelpers.shouldShowUrl("http");

            expect(result).toBe(true);
        });

        it("should return false when monitor type shouldn't show URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(
                createMockConfig({
                    type: "http",
                    uiConfig: { display: { showUrl: false } },
                })
            );

            const result = await monitorUiHelpers.shouldShowUrl("http");

            expect(result).toBe(false);
        });

        it("should return false when config is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            const result = await monitorUiHelpers.shouldShowUrl("http");

            expect(result).toBe(false);
        });
    });

    describe("clearConfigCache", () => {
        it("should clear the ui helpers cache", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

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
        it("should return first monitor ID from non-empty array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = monitorUiHelpers.getDefaultMonitorId([
                "monitor-1",
                "monitor-2",
                "monitor-3",
            ]);

            expect(result).toBe("monitor-1");
        });

        it("should return empty string for empty array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = monitorUiHelpers.getDefaultMonitorId([]);

            expect(result).toBe("");
        });

        it("should handle array with single element", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = monitorUiHelpers.getDefaultMonitorId([
                "only-monitor",
            ]);

            expect(result).toBe("only-monitor");
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle errors gracefully in basic functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(getMonitorTypeConfig).mockRejectedValue(
                new Error("Config fetch failed")
            );

            // All functions should return their fallback values on error
            expect(
                await monitorUiHelpers.supportsAdvancedAnalytics("http")
            ).toBe(false);
            expect(await monitorUiHelpers.supportsResponseTime("http")).toBe(
                false
            );
            expect(await monitorUiHelpers.shouldShowUrl("http")).toBe(false);
            expect(await monitorUiHelpers.getAnalyticsLabel("http")).toBe(
                "HTTP Response Time"
            );
            expect(await monitorUiHelpers.getMonitorHelpTexts("http")).toEqual(
                {}
            );
        });

        it("should handle invalid monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const invalidType = "invalid-type" as any; // Cast to test edge case

            // Mock to return undefined for invalid types (this is the default, but let's be explicit)
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            expect(
                await monitorUiHelpers.supportsAdvancedAnalytics(invalidType)
            ).toBe(false);
            expect(
                await monitorUiHelpers.supportsResponseTime(invalidType)
            ).toBe(false);
            expect(await monitorUiHelpers.shouldShowUrl(invalidType)).toBe(
                false
            );
        });
    });

    describe("Caching behavior", () => {
        it("should cache configuration results", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

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

        it("should clear cache when clearConfigCache is called", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

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

    describe("Property-based Tests", () => {
        beforeEach(() => {
            vi.clearAllMocks();
            AppCaches.uiHelpers.clear();
        });

        test.prop([
            fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 })
        ])("should handle getDefaultMonitorId with various array configurations", (monitorIds) => {
            // Property: First element should be returned for non-empty arrays, empty string for empty arrays
            const result = monitorUiHelpers.getDefaultMonitorId(monitorIds);

            if (monitorIds.length === 0) {
                expect(result).toBe("");
            } else {
                expect(result).toBe(monitorIds[0]);
            }

            // Property: Function should be deterministic for same input
            const result2 = monitorUiHelpers.getDefaultMonitorId(monitorIds);
            expect(result2).toBe(result);
        });

        test.prop([
            fc.record({
                supportsAdvancedAnalytics: fc.boolean(),
                supportsResponseTime: fc.boolean(),
                showUrl: fc.boolean(),
            })
        ])("should handle monitor feature support queries with various configurations", async (features) => {
            // Clear cache before each test run to prevent interference
            AppCaches.uiHelpers.clear();

            const mockConfig = createMockConfig({
                type: "http",
                uiConfig: {
                    supportsAdvancedAnalytics: features.supportsAdvancedAnalytics,
                    supportsResponseTime: features.supportsResponseTime,
                    display: { showUrl: features.showUrl },
                },
            });

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(mockConfig);

            // Property: Feature support should match configuration exactly
            const analyticsResult = await monitorUiHelpers.supportsAdvancedAnalytics("http");
            expect(analyticsResult).toBe(features.supportsAdvancedAnalytics);

            const responseTimeResult = await monitorUiHelpers.supportsResponseTime("http");
            expect(responseTimeResult).toBe(features.supportsResponseTime);

            const showUrlResult = await monitorUiHelpers.shouldShowUrl("http");
            expect(showUrlResult).toBe(features.showUrl);
        });

        test.prop([
            fc.array(fc.constantFrom("http", "port", "dns", "ping"), { minLength: 0, maxLength: 5 })
        ])("should handle allSupportsAdvancedAnalytics with various monitor type arrays", async (monitorTypes) => {
            // Mock all types to support advanced analytics
            vi.mocked(getMonitorTypeConfig).mockImplementation(async (type) =>
                createMockConfig({
                    type,
                    uiConfig: { supportsAdvancedAnalytics: true },
                })
            );

            const result = await monitorUiHelpers.allSupportsAdvancedAnalytics(monitorTypes as any);

            // Property: Empty array should return true (vacuous truth)
            if (monitorTypes.length === 0) {
                expect(result).toBe(true);
            } else {
                // Property: All types supporting analytics should return true
                expect(result).toBe(true);
            }
        });

        test.prop([
            fc.array(fc.constantFrom("http", "port", "dns", "ping"), { minLength: 1, maxLength: 5 })
        ])("should handle allSupportsResponseTime with mixed support configurations", async (monitorTypes) => {
            // Mock some types to support response time, others not
            vi.mocked(getMonitorTypeConfig).mockImplementation(async (type) => {
                const supports = type === "http" || type === "port"; // Only HTTP and port support response time
                return createMockConfig({
                    type,
                    uiConfig: { supportsResponseTime: supports },
                });
            });

            const result = await monitorUiHelpers.allSupportsResponseTime(monitorTypes as any);

            // Property: Should only return true if all types are http or port
            const expectedResult = monitorTypes.every(type => type === "http" || type === "port");
            expect(result).toBe(expectedResult);
        });

        test.prop([
            fc.constantFrom("http", "port", "dns", "ping"),
            fc.string({ minLength: 1, maxLength: 50 }).filter(str => str.trim().length > 0)
        ])("should handle getAnalyticsLabel with various monitor types", async (monitorType, customLabel) => {
            // Clear cache before each test
            AppCaches.uiHelpers.clear();

            const config = createMockConfig({
                type: monitorType,
                uiConfig: {
                    detailFormats: {
                        analyticsLabel: customLabel,
                    },
                },
            });

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(config);

            const result = await monitorUiHelpers.getAnalyticsLabel(monitorType as any);

            // Property: Should return custom label when configured
            expect(result).toBe(customLabel);
        });

        test.prop([
            fc.constantFrom("http", "port", "dns", "ping")
        ])("should handle getAnalyticsLabel fallback with undefined config", async (monitorType) => {
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            const result = await monitorUiHelpers.getAnalyticsLabel(monitorType as any);

            // Property: Should return fallback format when config is undefined
            const expectedFallback = `${monitorType.toUpperCase()} Response Time`;
            expect(result).toBe(expectedFallback);
        });

        test.prop([
            fc.record({
                primary: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
                secondary: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
            })
        ])("should handle getMonitorHelpTexts with various help text configurations", async (helpTexts) => {
            // Clear cache before each test
            AppCaches.uiHelpers.clear();

            const config = createMockConfig({
                type: "http",
                uiConfig: {
                    helpTexts: helpTexts,
                },
            });

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(config);

            const result = await monitorUiHelpers.getMonitorHelpTexts("http");

            // Property: Should return configured help texts or match structure
            if (helpTexts.primary !== undefined || helpTexts.secondary !== undefined) {
                // If we have defined values, they should be preserved
                if (helpTexts.primary !== undefined) {
                    expect(result.primary).toBe(helpTexts.primary);
                }
                if (helpTexts.secondary !== undefined) {
                    expect(result.secondary).toBe(helpTexts.secondary);
                }
            } else {
                // If all values are undefined, result could be empty object
                expect(typeof result).toBe("object");
            }
        });

        test.prop([
            fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 20 })
        ])("should handle clearConfigCache with various cache states", async (cacheKeys) => {
            // Populate cache with test data using valid MonitorTypeConfig objects
            for (const key of cacheKeys) {
                AppCaches.uiHelpers.set(key, createMockConfig({ type: "http" }));
            }

            // Property: Cache should have content before clearing
            if (cacheKeys.length > 0) {
                expect(AppCaches.uiHelpers.size).toBeGreaterThan(0);
            }

            // Clear cache
            monitorUiHelpers.clearConfigCache();

            // Property: Cache should be empty after clearing
            expect(AppCaches.uiHelpers.size).toBe(0);

            // Property: Previously cached keys should no longer exist
            for (const key of cacheKeys) {
                expect(AppCaches.uiHelpers.has(key)).toBe(false);
            }
        });

        test.prop([
            fc.constantFrom("http", "port", "dns", "ping")
        ])("should handle error scenarios gracefully", async (monitorType) => {
            const testError = new Error("Configuration fetch failed");
            vi.mocked(getMonitorTypeConfig).mockRejectedValue(testError);

            // Property: All functions should return fallback values on error
            const analyticsResult = await monitorUiHelpers.supportsAdvancedAnalytics(monitorType as any);
            expect(analyticsResult).toBe(false);

            const responseTimeResult = await monitorUiHelpers.supportsResponseTime(monitorType as any);
            expect(responseTimeResult).toBe(false);

            const showUrlResult = await monitorUiHelpers.shouldShowUrl(monitorType as any);
            expect(showUrlResult).toBe(false);

            const analyticsLabel = await monitorUiHelpers.getAnalyticsLabel(monitorType as any);
            expect(analyticsLabel).toBe(`${monitorType.toUpperCase()} Response Time`);

            const helpTexts = await monitorUiHelpers.getMonitorHelpTexts(monitorType as any);
            expect(helpTexts).toEqual({});
        });
    });
});
