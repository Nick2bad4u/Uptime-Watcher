/**
 * Tests for chart configuration type guards and utility functions
 */

import { describe, expect, it } from "vitest";
import {
    hasPlugins,
    hasScales,
    DEFAULT_CHART_THEMES,
} from "../../types/chartConfig.js";

describe("Chart Config Utilities", () => {
    describe(hasPlugins, () => {
        it("should return true for object with plugins property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                plugins: {
                    legend: { display: true },
                    tooltip: { enabled: true },
                },
            };

            expect(hasPlugins(config)).toBeTruthy();
        });

        it("should return false for object without plugins property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {},
                responsive: true,
            };

            expect(hasPlugins(config)).toBeFalsy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasPlugins(null)).toBeFalsy();
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasPlugins(undefined)).toBeFalsy();
        });

        it("should return false for primitive values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasPlugins("string")).toBeFalsy();
            expect(hasPlugins(123)).toBeFalsy();
            expect(hasPlugins(true)).toBeFalsy();
        });

        it("should return false for object with plugins as non-object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                plugins: "not an object",
            };

            expect(hasPlugins(config)).toBeFalsy();
        });

        it("should return false for object with plugins as null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                plugins: null,
            };

            expect(hasPlugins(config)).toBeFalsy();
        });

        it("should return true for object with empty plugins object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                plugins: {},
            };

            expect(hasPlugins(config)).toBeTruthy();
        });
    });

    describe(hasScales, () => {
        it("should return true for object with scales property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {
                    x: { type: "linear" },
                    y: { type: "linear" },
                },
            };

            expect(hasScales(config)).toBeTruthy();
        });

        it("should return false for object without scales property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                plugins: {},
                responsive: true,
            };

            expect(hasScales(config)).toBeFalsy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales(null)).toBeFalsy();
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales(undefined)).toBeFalsy();
        });

        it("should return false for primitive values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales("string")).toBeFalsy();
            expect(hasScales(123)).toBeFalsy();
            expect(hasScales(true)).toBeFalsy();
        });

        it("should return false for object with scales as non-object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: "not an object",
            };

            expect(hasScales(config)).toBeFalsy();
        });

        it("should return false for object with scales as null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: null,
            };

            expect(hasScales(config)).toBeFalsy();
        });

        it("should return true for object with empty scales object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {},
            };

            expect(hasScales(config)).toBeTruthy();
        });

        it("should handle complex nested scales configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {
                    x: {
                        type: "category",
                        display: true,
                        title: {
                            display: true,
                            text: "Time",
                        },
                    },
                    y: {
                        type: "linear",
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Value",
                        },
                    },
                },
            };

            expect(hasScales(config)).toBeTruthy();
        });
    });

    describe("DEFAULT_CHART_THEMES", () => {
        it("should have dark theme configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEFAULT_CHART_THEMES.dark).toBeDefined();
            expect(DEFAULT_CHART_THEMES.dark.backgroundColors).toBeDefined();
            expect(DEFAULT_CHART_THEMES.dark.borderColors).toBeDefined();
            expect(
                Array.isArray(DEFAULT_CHART_THEMES.dark.backgroundColors)
            ).toBeTruthy();
            expect(Array.isArray(DEFAULT_CHART_THEMES.dark.borderColors)).toBeTruthy(
                
            );
        });

        it("should have light theme configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEFAULT_CHART_THEMES.light).toBeDefined();
            expect(DEFAULT_CHART_THEMES.light.backgroundColors).toBeDefined();
            expect(DEFAULT_CHART_THEMES.light.borderColors).toBeDefined();
            expect(
                Array.isArray(DEFAULT_CHART_THEMES.light.backgroundColors)
            ).toBeTruthy();
            expect(Array.isArray(DEFAULT_CHART_THEMES.light.borderColors)).toBeTruthy(
                
            );
        });

        it("should have multiple colors in each theme", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                DEFAULT_CHART_THEMES.dark.backgroundColors.length
            ).toBeGreaterThan(0);
            expect(
                DEFAULT_CHART_THEMES.dark.borderColors.length
            ).toBeGreaterThan(0);
            expect(
                DEFAULT_CHART_THEMES.light.backgroundColors.length
            ).toBeGreaterThan(0);
            expect(
                DEFAULT_CHART_THEMES.light.borderColors.length
            ).toBeGreaterThan(0);
        });

        it("should have matching number of background and border colors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEFAULT_CHART_THEMES.dark.backgroundColors).toHaveLength(
                DEFAULT_CHART_THEMES.dark.borderColors.length
            );
            expect(DEFAULT_CHART_THEMES.light.backgroundColors).toHaveLength(
                DEFAULT_CHART_THEMES.light.borderColors.length
            );
        });

        it("should have valid color strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const colorRegex = /^rgba?\((?:\d+,\s*){2}\d+(?:,\s*[\d.]+)?\)$/;

            for (const color of DEFAULT_CHART_THEMES.dark.backgroundColors) {
                expect(typeof color).toBe("string");
                expect(color).toMatch(colorRegex);
            }

            for (const color of DEFAULT_CHART_THEMES.dark.borderColors) {
                expect(typeof color).toBe("string");
                expect(color).toMatch(colorRegex);
            }
        });
    });

    describe("Type Guards Integration", () => {
        it("should work together with complete chart config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Data Retrieval", "type");

            const fullConfig = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                    tooltip: { enabled: true },
                },
                scales: {
                    x: { type: "category" },
                    y: { type: "linear" },
                },
            };

            expect(hasPlugins(fullConfig)).toBeTruthy();
            expect(hasScales(fullConfig)).toBeTruthy();
        });

        it("should handle partial configurations correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const pluginsOnlyConfig = {
                plugins: { legend: { display: false } },
            };

            const scalesOnlyConfig = {
                scales: { x: { type: "linear" } },
            };

            expect(hasPlugins(pluginsOnlyConfig)).toBeTruthy();
            expect(hasScales(pluginsOnlyConfig)).toBeFalsy();

            expect(hasPlugins(scalesOnlyConfig)).toBeFalsy();
            expect(hasScales(scalesOnlyConfig)).toBeTruthy();
        });
    });
});
