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
        expect(chartConfig.hasPlugins(configWithPlugins)).toBeTruthy();
        expect(chartConfig.hasPlugins(configWithoutPlugins)).toBeFalsy();
        expect(chartConfig.hasPlugins(null)).toBeFalsy();
        expect(chartConfig.hasPlugins(undefined)).toBeFalsy();
        expect(chartConfig.hasPlugins("string")).toBeFalsy();

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
        expect(chartConfig.hasScales(configWithScales)).toBeTruthy();
        expect(chartConfig.hasScales(configWithoutScales)).toBeFalsy();
        expect(chartConfig.hasScales(null)).toBeFalsy();
        expect(chartConfig.hasScales(undefined)).toBeFalsy();
        expect(chartConfig.hasScales("string")).toBeFalsy();

        // Test DEFAULT_CHART_THEMES access for coverage
        expect(chartConfig.DEFAULT_CHART_THEMES).toBeDefined();
        expect(chartConfig.DEFAULT_CHART_THEMES.dark).toBeDefined();
        expect(chartConfig.DEFAULT_CHART_THEMES.light).toBeDefined();

        // Validate default theme structure for complete coverage
        expect(
            Array.isArray(
                chartConfig.DEFAULT_CHART_THEMES.dark.backgroundColors
            )
        ).toBeTruthy();
        expect(
            Array.isArray(chartConfig.DEFAULT_CHART_THEMES.dark.borderColors)
        ).toBeTruthy();
        expect(
            Array.isArray(
                chartConfig.DEFAULT_CHART_THEMES.light.backgroundColors
            )
        ).toBeTruthy();
        expect(
            Array.isArray(chartConfig.DEFAULT_CHART_THEMES.light.borderColors)
        ).toBeTruthy();

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
