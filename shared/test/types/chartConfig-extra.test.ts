/**
 * Function coverage validation test for shared/types/chartConfig.ts
 *
 * This test ensures all exported functions are called to achieve 100% function
 * coverage.
 *
 * @file Function coverage validation for chartConfig type guards
 */

import { describe, it, expect } from "vitest";
import * as chartConfig from "@shared/types/chartConfig";

describe("Function Coverage Validation", () => {
    it("should call all exported functions to ensure 100% function coverage", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: chartConfig-extra", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Export Operation", "type");

        // Verify all functions are accessible
        expect(typeof chartConfig.hasPlugins).toBe("function");
        expect(typeof chartConfig.hasScales).toBe("function");

        // Test hasPlugins function
        const configWithPlugins = {
            plugins: {
                legend: { display: true },
                tooltip: { enabled: true },
            },
        };

        const configWithoutPlugins = {
            scales: { x: { display: true } },
        };

        // Call functions to register coverage
        expect(chartConfig.hasPlugins(configWithPlugins)).toBe(true);
        expect(chartConfig.hasPlugins(configWithoutPlugins)).toBe(false);
        expect(chartConfig.hasPlugins(null)).toBe(false);
        expect(chartConfig.hasPlugins(undefined)).toBe(false);
        expect(chartConfig.hasPlugins("string")).toBe(false);

        // Test hasScales function
        const configWithScales = {
            scales: {
                x: { display: true },
                y: { display: true },
            },
        };

        const configWithoutScales = {
            plugins: { legend: { display: true } },
        };

        // Call functions to register coverage
        expect(chartConfig.hasScales(configWithScales)).toBe(true);
        expect(chartConfig.hasScales(configWithoutScales)).toBe(false);
        expect(chartConfig.hasScales(null)).toBe(false);
        expect(chartConfig.hasScales(undefined)).toBe(false);
        expect(chartConfig.hasScales("string")).toBe(false);

        // Test DEFAULT_CHART_THEMES access for coverage
        expect(chartConfig.DEFAULT_CHART_THEMES).toBeDefined();
        expect(chartConfig.DEFAULT_CHART_THEMES.dark).toBeDefined();
        expect(chartConfig.DEFAULT_CHART_THEMES.light).toBeDefined();

        // Validate default theme structure for complete coverage
        expect(
            Array.isArray(
                chartConfig.DEFAULT_CHART_THEMES.dark.backgroundColors
            )
        ).toBe(true);
        expect(
            Array.isArray(chartConfig.DEFAULT_CHART_THEMES.dark.borderColors)
        ).toBe(true);
        expect(
            Array.isArray(
                chartConfig.DEFAULT_CHART_THEMES.light.backgroundColors
            )
        ).toBe(true);
        expect(
            Array.isArray(chartConfig.DEFAULT_CHART_THEMES.light.borderColors)
        ).toBe(true);

        // Verify theme properties exist
        expect(
            chartConfig.DEFAULT_CHART_THEMES.dark.backgroundColors.length
        ).toBeGreaterThan(0);
        expect(
            chartConfig.DEFAULT_CHART_THEMES.dark.borderColors.length
        ).toBeGreaterThan(0);
        expect(
            chartConfig.DEFAULT_CHART_THEMES.light.backgroundColors.length
        ).toBeGreaterThan(0);
        expect(
            chartConfig.DEFAULT_CHART_THEMES.light.borderColors.length
        ).toBeGreaterThan(0);
    });
});
