/**
 * @file Comprehensive tests for monitor UI helper utilities
 */

import type { MonitorType } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { fc, test } from "@fast-check/vitest";
import { secureRandomFloat } from "@shared/test/testHelpers";
import { arrayFirst, isEmpty  } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppCaches } from "../../utils/cache";
import { getMonitorTypeConfig } from "../../utils/monitorTypeHelper";
import * as monitorUiHelpers from "../../utils/monitorUiHelpers";
import { installElectronApiMock } from "./electronApiMock";

const MONITOR_TYPES_UNDER_TEST = [
    "http",
    "port",
    "dns",
    "ping",
] as const satisfies readonly MonitorType[];

vi.mock(import('@shared/utils/errorHandling'), () => ({
    withUtilityErrorHandling: vi.fn(async (fn, _description, fallback) => {
        try {
            return await fn();
        } catch {
            return fallback;
        }
    }),
}));

vi.mock(import('../../utils/monitorTypeHelper'), () => ({
    getAvailableMonitorTypes: vi.fn(),
    getMonitorTypeConfig: vi.fn(),
}));

// Helper function to create complete MonitorTypeConfig objects
function createMockConfig(overrides: Partial<MonitorTypeConfig> = {}) {
    const defaultFields: MonitorTypeConfig["fields"] = [
        {
            helpText: "Enter the endpoint to monitor",
            label: "Endpoint",
            name: "endpoint",
            placeholder: "https://status.example.com",
            required: true,
            type: "url",
        },
    ];

    const defaultUiConfig = {
        detailFormats: {
            analyticsLabel: "HTTP Response Time",
        },
        display: { showUrl: true },
        helpTexts: {
            primary: "Primary help text",
            secondary: "Secondary help text",
        },
        supportsAdvancedAnalytics: false,
        supportsResponseTime: false,
    } satisfies NonNullable<MonitorTypeConfig["uiConfig"]>;

    const mergedUiConfig = overrides.uiConfig
        ? {
              detailFormats: {
                  ...defaultUiConfig.detailFormats,
                  ...overrides.uiConfig.detailFormats,
              },
              display: {
                  ...defaultUiConfig.display,
                  ...overrides.uiConfig.display,
              },
              helpTexts: {
                  ...defaultUiConfig.helpTexts,
                  ...overrides.uiConfig.helpTexts,
              },
              supportsAdvancedAnalytics:
                  overrides.uiConfig.supportsAdvancedAnalytics ??
                  defaultUiConfig.supportsAdvancedAnalytics,
              supportsResponseTime:
                  overrides.uiConfig.supportsResponseTime ??
                  defaultUiConfig.supportsResponseTime,
          }
        : defaultUiConfig;

    return {
        description: overrides.description ?? "HTTP monitoring",
        displayName: overrides.displayName ?? "HTTP Monitor",
        fields: overrides.fields ?? defaultFields,
        type: overrides.type ?? "http",
        uiConfig: mergedUiConfig,
        version: overrides.version ?? "1.0.0",
    } satisfies MonitorTypeConfig;
}

const monitorTypesApiMock = {
    monitorTypes: {
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
    },
};
let restoreElectronApi: (() => void) | undefined;

describe("monitor UI Helpers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        AppCaches.uiHelpers.clear();
        // Reset getMonitorTypeConfig mock to default implementation
        vi.mocked(getMonitorTypeConfig).mockImplementation(
            async () => undefined
        );
        ({ restore: restoreElectronApi } = installElectronApiMock({
            monitorTypes: {
                formatMonitorDetail:
                    monitorTypesApiMock.monitorTypes.formatMonitorDetail,
                formatMonitorTitleSuffix:
                    monitorTypesApiMock.monitorTypes.formatMonitorTitleSuffix,
            },
        }));
    });

    afterEach(() => {
        vi.clearAllMocks();
        AppCaches.uiHelpers.clear();
        restoreElectronApi?.();
        restoreElectronApi = undefined;
    });

    describe("allSupportsAdvancedAnalytics", () => {
        it("should return true when all monitor types support advanced analytics", async ({
            annotate,
            task,
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

            const isResult = await monitorUiHelpers.allSupportsAdvancedAnalytics([
                "http",
                "port",
            ]);

            expect(isResult).toBe(true);
        });

        it("should return false when some monitor types don't support advanced analytics", async ({
            annotate,
            task,
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

            const isResult = await monitorUiHelpers.allSupportsAdvancedAnalytics([
                "http",
                "port",
            ]);

            expect(isResult).toBe(false);
        });

        it("should return true for empty array", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const isResult = await monitorUiHelpers.allSupportsAdvancedAnalytics(
                []
            );

            expect(isResult).toBe(true);
        });
    });

    describe("allSupportsResponseTime", () => {
        it("should return true when all monitor types support response time", async ({
            annotate,
            task,
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

            const isResult = await monitorUiHelpers.allSupportsResponseTime([
                "http",
                "port",
            ]);

            expect(isResult).toBe(true);
        });

        it("should return false when some monitor types don't support response time", async ({
            annotate,
            task,
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

            const isResult = await monitorUiHelpers.allSupportsResponseTime([
                "http",
                "port",
            ]);

            expect(isResult).toBe(false);
        });

        it("should return true for empty array", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const isResult = await monitorUiHelpers.allSupportsResponseTime([]);

            expect(isResult).toBe(true);
        });
    });

    describe("supportsAdvancedAnalytics", () => {
        it("should return true when monitor type supports advanced analytics", async ({
            annotate,
            task,
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

            const isResult =
                await monitorUiHelpers.supportsAdvancedAnalytics("http");

            expect(isResult).toBe(true);
        });

        it("should return false when monitor type doesn't support advanced analytics", async ({
            annotate,
            task,
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

            const isResult =
                await monitorUiHelpers.supportsAdvancedAnalytics("http");

            expect(isResult).toBe(false);
        });

        it("should return false when config is undefined", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            const isResult =
                await monitorUiHelpers.supportsAdvancedAnalytics("http");

            expect(isResult).toBe(false);
        });
    });

    describe("supportsResponseTime", () => {
        it("should return true when monitor type supports response time", async ({
            annotate,
            task,
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

            const isResult = await monitorUiHelpers.supportsResponseTime("http");

            expect(isResult).toBe(true);
        });

        it("should return false when monitor type doesn't support response time", async ({
            annotate,
            task,
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

            const isResult = await monitorUiHelpers.supportsResponseTime("http");

            expect(isResult).toBe(false);
        });

        it("should return false when config is undefined", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            const isResult = await monitorUiHelpers.supportsResponseTime("http");

            expect(isResult).toBe(false);
        });
    });

    describe("shouldShowUrl", () => {
        it("should return true when monitor type should show URL", async ({
            annotate,
            task,
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

            const isResult = await monitorUiHelpers.shouldShowUrl("http");

            expect(isResult).toBe(true);
        });

        it("should return false when monitor type shouldn't show URL", async ({
            annotate,
            task,
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

            const isResult = await monitorUiHelpers.shouldShowUrl("http");

            expect(isResult).toBe(false);
        });

        it("should return false when config is undefined", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            const isResult = await monitorUiHelpers.shouldShowUrl("http");

            expect(isResult).toBe(false);
        });
    });

    describe("clearConfigCache", () => {
        it("should clear the ui helpers cache", async ({ annotate, task }) => {
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
            annotate,
            task,
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
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = monitorUiHelpers.getDefaultMonitorId([]);

            expect(result).toBe("");
        });

        it("should handle array with single element", async ({
            annotate,
            task,
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

    describe("error handling and edge cases", () => {
        it("should handle errors gracefully in basic functions", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(getMonitorTypeConfig).mockRejectedValue(
                new Error("Config fetch failed")
            );

            // All functions should return their fallback values on error
            await expect(
                monitorUiHelpers.supportsAdvancedAnalytics("http")
            ).resolves.toBe(false);
            await expect(
                monitorUiHelpers.supportsResponseTime("http")
            ).resolves.toBe(false);
            await expect(
                monitorUiHelpers.shouldShowUrl("http")
            ).resolves.toBe(false);
            await expect(
                monitorUiHelpers.getAnalyticsLabel("http")
            ).resolves.toBe("HTTP Response Time");
            await expect(
                monitorUiHelpers.getMonitorHelpTexts("http")
            ).resolves.toEqual({});
        });

        it("should handle invalid monitor types", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const invalidType = "invalid-type" as any; // Cast to test edge case

            // Mock to return undefined for invalid types (this is the default, but let's be explicit)
            vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

            await expect(
                monitorUiHelpers.supportsAdvancedAnalytics(invalidType)
            ).resolves.toBe(false);
            await expect(
                monitorUiHelpers.supportsResponseTime(invalidType)
            ).resolves.toBe(false);
            await expect(
                monitorUiHelpers.shouldShowUrl(invalidType)
            ).resolves.toBe(false);
        });
    });

    describe("caching behavior", () => {
        it("should cache configuration results", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            const mockConfig = createMockConfig({
                type: "http",
                uiConfig: {
                    display: { showUrl: true },
                    supportsAdvancedAnalytics: true,
                    supportsResponseTime: true,
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
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorUiHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            const mockConfig = createMockConfig({
                type: "http",
                uiConfig: {
                    display: { showUrl: true },
                    supportsAdvancedAnalytics: true,
                    supportsResponseTime: true,
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

    describe("property-based Tests", () => {
        beforeEach(() => {
            vi.clearAllMocks();
            AppCaches.uiHelpers.clear();
        });

        test.prop([
            fc.array(fc.string({ maxLength: 20, minLength: 1 }), {
                maxLength: 10,
                minLength: 0,
            }),
        ])(
            "should handle getDefaultMonitorId with various array configurations",
            (monitorIds) => {
                // Property: First element should be returned for non-empty arrays, empty string for empty arrays
                const result = monitorUiHelpers.getDefaultMonitorId(monitorIds);

                if (isEmpty(monitorIds)) {
                    expect(result).toBe("");
                } else {
                    expect(result).toBe(arrayFirst(monitorIds));
                }

                // Property: Function should be deterministic for same input
                const result2 =
                    monitorUiHelpers.getDefaultMonitorId(monitorIds);

                expect(result2).toBe(result);
            }
        );

        test.prop([
            fc.record({
                showUrl: fc.boolean(),
                supportsAdvancedAnalytics: fc.boolean(),
                supportsResponseTime: fc.boolean(),
            }),
        ])(
            "should handle monitor feature support queries with various configurations",
            async (features) => {
                // Clear cache before each test run to prevent interference
                AppCaches.uiHelpers.clear();

                const mockConfig = createMockConfig({
                    type: "http",
                    uiConfig: {
                        display: { showUrl: features.showUrl },
                        supportsAdvancedAnalytics:
                            features.supportsAdvancedAnalytics,
                        supportsResponseTime: features.supportsResponseTime,
                    },
                });

                vi.mocked(getMonitorTypeConfig).mockResolvedValue(mockConfig);

                // Property: Feature support should match configuration exactly
                const isAnalyticsResult =
                    await monitorUiHelpers.supportsAdvancedAnalytics("http");

                expect(isAnalyticsResult).toBe(
                    features.supportsAdvancedAnalytics
                );

                const isResponseTimeResult =
                    await monitorUiHelpers.supportsResponseTime("http");

                expect(isResponseTimeResult).toBe(features.supportsResponseTime);

                const showUrlResult =
                    await monitorUiHelpers.shouldShowUrl("http");

                expect(showUrlResult).toBe(features.showUrl);
            }
        );

        test.prop([
            fc.array(
                fc.constantFrom<MonitorType>(...MONITOR_TYPES_UNDER_TEST),
                {
                    maxLength: 5,
                    minLength: 0,
                }
            ),
        ])(
            "should handle allSupportsAdvancedAnalytics with various monitor type arrays",
            async (monitorTypes) => {
                // Mock all types to support advanced analytics
                vi.mocked(getMonitorTypeConfig).mockImplementation(
                    async (type) =>
                        createMockConfig({
                            type: type as MonitorType,
                            uiConfig: { supportsAdvancedAnalytics: true },
                        })
                );

                const isResult =
                    await monitorUiHelpers.allSupportsAdvancedAnalytics(
                        monitorTypes
                    );

                // Property: Empty array should return true (vacuous truth)
                if (isEmpty(monitorTypes)) {
                    expect(isResult).toBe(true);
                } else {
                    // Property: All types supporting analytics should return true
                    expect(isResult).toBe(true);
                }
            }
        );

        test.prop([
            fc.array(
                fc.constantFrom<MonitorType>(...MONITOR_TYPES_UNDER_TEST),
                {
                    maxLength: 5,
                    minLength: 1,
                }
            ),
        ])(
            "should handle allSupportsResponseTime with mixed support configurations",
            async (monitorTypes) => {
                // Mock some types to support response time, others not
                vi.mocked(getMonitorTypeConfig).mockImplementation(
                    async (type) => {
                        const isSupports = type === "http" || type === "port"; // Only HTTP and port support response time
                        return createMockConfig({
                            type: type as MonitorType,
                            uiConfig: { supportsResponseTime: isSupports },
                        });
                    }
                );

                const isResult =
                    await monitorUiHelpers.allSupportsResponseTime(
                        monitorTypes
                    );

                // Property: Should only return true if all types are HTTP or port
                const isExpectedResult = monitorTypes.every(
                    (type) => type === "http" || type === "port"
                );

                expect(isResult).toBe(isExpectedResult);
            }
        );

        test.prop([
            fc.constantFrom<MonitorType>(...MONITOR_TYPES_UNDER_TEST),
            fc
                .string({ maxLength: 50, minLength: 1 })
                .filter((str) => str.trim().length > 0),
        ])(
            "should handle getAnalyticsLabel with various monitor types",
            async (monitorType, customLabel) => {
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

                const result =
                    await monitorUiHelpers.getAnalyticsLabel(monitorType);

                // Property: Should return custom label when configured
                expect(result).toBe(customLabel);
            }
        );

        test.prop([fc.constantFrom<MonitorType>(...MONITOR_TYPES_UNDER_TEST)])(
            "should handle getAnalyticsLabel fallback with undefined config",
            async (monitorType) => {
                vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);

                const result =
                    await monitorUiHelpers.getAnalyticsLabel(monitorType);

                // Property: Should return fallback format when config is undefined
                const expectedFallback = `${monitorType.toUpperCase()} Response Time`;

                expect(result).toBe(expectedFallback);
            }
        );

        test.prop([
            fc
                .record({
                    primary: fc.string({ maxLength: 100, minLength: 1 }),
                    secondary: fc.string({ maxLength: 100, minLength: 1 }),
                })
                .map((full) => {
                    // Create a proper partial object that satisfies exactOptionalPropertyTypes
                    const partial: { primary?: string; secondary?: string } =
                        {};
                    if (secureRandomFloat() > 0.3)
                        partial.primary = full.primary;
                    if (secureRandomFloat() > 0.3)
                        partial.secondary = full.secondary;
                    return partial;
                }),
        ])(
            "should handle getMonitorHelpTexts with various help text configurations",
            async (helpTexts) => {
                // Clear cache before each test
                AppCaches.uiHelpers.clear();

                const config = createMockConfig({
                    type: "http",
                    uiConfig: {
                        helpTexts: helpTexts,
                    },
                });

                vi.mocked(getMonitorTypeConfig).mockResolvedValue(config);

                const result =
                    await monitorUiHelpers.getMonitorHelpTexts("http");

                // Property: Should return configured help texts or match structure
                if (
                    helpTexts.primary !== undefined ||
                    helpTexts.secondary !== undefined
                ) {
                    // If we have defined values, they should be preserved
                    if (helpTexts.primary !== undefined) {
                        expect(result.primary).toBe(helpTexts.primary);
                    }
                    if (helpTexts.secondary !== undefined) {
                        expect(result.secondary).toBe(helpTexts.secondary);
                    }
                } else {
                    // If all values are undefined, result could be empty object
                    expect(result).toBeTypeOf("object");
                }
            }
        );

        test.prop([
            fc.array(fc.string({ maxLength: 20, minLength: 1 }), {
                maxLength: 20,
                minLength: 0,
            }),
        ])(
            "should handle clearConfigCache with various cache states",
            async (cacheKeys) => {
                // Populate cache with test data using valid MonitorTypeConfig objects
                for (const key of cacheKeys) {
                    AppCaches.uiHelpers.set(
                        key,
                        createMockConfig({ type: "http" })
                    );
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
            }
        );

        test.prop([fc.constantFrom<MonitorType>(...MONITOR_TYPES_UNDER_TEST)])(
            "should handle error scenarios gracefully",
            async (monitorType) => {
                const testError = new Error("Configuration fetch failed");
                vi.mocked(getMonitorTypeConfig).mockRejectedValue(testError);

                // Property: All functions should return fallback values on error
                const isAnalyticsResult =
                    await monitorUiHelpers.supportsAdvancedAnalytics(
                        monitorType
                    );

                expect(isAnalyticsResult).toBe(false);

                const isResponseTimeResult =
                    await monitorUiHelpers.supportsResponseTime(monitorType);

                expect(isResponseTimeResult).toBe(false);

                const showUrlResult =
                    await monitorUiHelpers.shouldShowUrl(monitorType);

                expect(showUrlResult).toBe(false);

                const analyticsLabel =
                    await monitorUiHelpers.getAnalyticsLabel(monitorType);

                expect(analyticsLabel).toBe(
                    `${monitorType.toUpperCase()} Response Time`
                );

                const helpTexts =
                    await monitorUiHelpers.getMonitorHelpTexts(monitorType);

                expect(helpTexts).toEqual({});
            }
        );
    });
});
