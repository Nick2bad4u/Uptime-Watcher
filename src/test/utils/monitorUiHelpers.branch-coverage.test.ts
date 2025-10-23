/**
 * Comprehensive branch coverage tests for monitorUiHelpers.ts. Focuses on
 * exercising the ternary logic in getTypesWithFeature so both the responseTime
 * and advancedAnalytics branches are covered under varied inputs.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

/**
 * Creates a minimal {@link MonitorTypeConfig} suitable for branch-coverage
 * scenarios. Ensures required properties such as `description` and `version`
 * are always populated while allowing targeted overrides per test.
 */
const createMonitorConfig = (
    type: MonitorTypeConfig["type"],
    overrides: Partial<Omit<MonitorTypeConfig, "type">> = {}
): MonitorTypeConfig => {
    const baseConfig: MonitorTypeConfig = {
        description: overrides.description ?? `${type.toUpperCase()} monitor`,
        displayName: overrides.displayName ?? type.toUpperCase(),
        fields: overrides.fields ?? ([] as MonitorTypeConfig["fields"]),
        type,
        version: overrides.version ?? "1.0.0",
    };

    if (overrides.uiConfig) {
        baseConfig.uiConfig = overrides.uiConfig;
    }

    return baseConfig;
};

interface MonitorMockContext {
    getTypesWithFeature: (
        feature: "responseTime" | "advancedAnalytics"
    ) => Promise<string[]>;
    spy: ReturnType<typeof vi.spyOn>;
}

async function setupMonitorTypesMock(
    configs: MonitorTypeConfig[]
): Promise<MonitorMockContext> {
    const monitorModule = await import("../../utils/monitorTypeHelper");
    const spy = vi.spyOn(
        monitorModule,
        "getAvailableMonitorTypes"
    );
    spy.mockResolvedValue(configs);

    const { getTypesWithFeature } = await import(
        "../../utils/monitorUiHelpers"
    );

    return {
        getTypesWithFeature,
        spy,
    };
}

describe("monitorUiHelpers - Branch Coverage", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    describe("getTypesWithFeature - Ternary Branch Coverage", () => {
        it("should hit responseTime branch in ternary operator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorUiHelpers.branch-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const { getTypesWithFeature, spy } = await setupMonitorTypesMock([
                createMonitorConfig("http", {
                    description: "HTTP monitor",
                    displayName: "HTTP",
                    uiConfig: {
                        supportsAdvancedAnalytics: false,
                        supportsResponseTime: true,
                    },
                }),
                createMonitorConfig("port", {
                    description: "Port monitor",
                    displayName: "Port",
                    uiConfig: {
                        supportsAdvancedAnalytics: true,
                        supportsResponseTime: false,
                    },
                }),
            ]);

            const result = await getTypesWithFeature("responseTime");

            expect(spy).toHaveBeenCalledTimes(1);
            expect(Array.isArray(result)).toBeTruthy();
            expect(result).toContain("http");
        });

        it("should hit advancedAnalytics branch in ternary operator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorUiHelpers.branch-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const { getTypesWithFeature, spy } = await setupMonitorTypesMock([
                createMonitorConfig("http", {
                    description: "HTTP monitor",
                    displayName: "HTTP",
                    uiConfig: {
                        supportsAdvancedAnalytics: true,
                        supportsResponseTime: false,
                    },
                }),
                createMonitorConfig("ping", {
                    description: "Ping monitor",
                    displayName: "Ping",
                    uiConfig: {
                        supportsAdvancedAnalytics: false,
                        supportsResponseTime: true,
                    },
                }),
            ]);

            const result = await getTypesWithFeature("advancedAnalytics");

            expect(spy).toHaveBeenCalledTimes(1);
            expect(Array.isArray(result)).toBeTruthy();
            expect(result).toContain("http");
        });

        it("should handle both branches with mixed support", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorUiHelpers.branch-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const baseConfigs: MonitorTypeConfig[] = [
                createMonitorConfig("http", {
                    description: "HTTP monitor",
                    displayName: "HTTP",
                    uiConfig: {
                        supportsAdvancedAnalytics: true,
                        supportsResponseTime: true,
                    },
                }),
                createMonitorConfig("port", {
                    description: "Port monitor",
                    displayName: "Port",
                    uiConfig: {
                        supportsAdvancedAnalytics: false,
                        supportsResponseTime: false,
                    },
                }),
                createMonitorConfig("ping", {
                    description: "Ping monitor",
                    displayName: "Ping",
                    uiConfig: {
                        supportsAdvancedAnalytics: false,
                        supportsResponseTime: true,
                    },
                }),
            ];

            const { getTypesWithFeature, spy } =
                await setupMonitorTypesMock(baseConfigs);

            const responseTimeResult =
                await getTypesWithFeature("responseTime");
            expect(Array.isArray(responseTimeResult)).toBeTruthy();
            expect(responseTimeResult).toEqual(["http", "ping"]);

            spy.mockResolvedValue([
                baseConfigs[0]!,
                baseConfigs[1]!,
                createMonitorConfig("ssl", {
                    description: "SSL monitor",
                    displayName: "SSL",
                    uiConfig: {
                        supportsAdvancedAnalytics: true,
                        supportsResponseTime: false,
                    },
                }),
            ]);

            const analyticsResult =
                await getTypesWithFeature("advancedAnalytics");
            expect(Array.isArray(analyticsResult)).toBeTruthy();
            expect(analyticsResult).toEqual(["http", "ssl"]);
        });

        it("should handle undefined uiConfig values in both branches", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorUiHelpers.branch-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const { getTypesWithFeature, spy } = await setupMonitorTypesMock([
                createMonitorConfig("http", {
                    description: "HTTP monitor",
                    displayName: "HTTP",
                    uiConfig: {},
                }),
                createMonitorConfig("port", {
                    description: "Port monitor",
                    displayName: "Port",
                    uiConfig: {},
                }),
                createMonitorConfig("ping", {
                    description: "Ping monitor",
                    displayName: "Ping",
                }),
            ]);

            const responseTimeResult =
                await getTypesWithFeature("responseTime");
            const analyticsResult =
                await getTypesWithFeature("advancedAnalytics");

            expect(spy).toHaveBeenCalledTimes(2);
            expect(Array.isArray(responseTimeResult)).toBeTruthy();
            expect(Array.isArray(analyticsResult)).toBeTruthy();
            expect(responseTimeResult).toHaveLength(0);
            expect(analyticsResult).toHaveLength(0);
        });
    });
});
