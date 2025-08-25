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
    describe("hasPlugins", () => {
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

            expect(hasPlugins(config)).toBe(true);
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

            expect(hasPlugins(config)).toBe(false);
        });

        it("should return false for null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasPlugins(null)).toBe(false);
        });

        it("should return false for undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasPlugins(undefined)).toBe(false);
        });

        it("should return false for primitive values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasPlugins("string")).toBe(false);
            expect(hasPlugins(123)).toBe(false);
            expect(hasPlugins(true)).toBe(false);
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

            expect(hasPlugins(config)).toBe(false);
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

            expect(hasPlugins(config)).toBe(false);
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

            expect(hasPlugins(config)).toBe(true);
        });
    });

    describe("hasScales", () => {
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

            expect(hasScales(config)).toBe(true);
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

            expect(hasScales(config)).toBe(false);
        });

        it("should return false for null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales(null)).toBe(false);
        });

        it("should return false for undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales(undefined)).toBe(false);
        });

        it("should return false for primitive values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales("string")).toBe(false);
            expect(hasScales(123)).toBe(false);
            expect(hasScales(true)).toBe(false);
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

            expect(hasScales(config)).toBe(false);
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

            expect(hasScales(config)).toBe(false);
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

            expect(hasScales(config)).toBe(true);
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

            expect(hasScales(config)).toBe(true);
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
            ).toBe(true);
            expect(Array.isArray(DEFAULT_CHART_THEMES.dark.borderColors)).toBe(
                true
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
            ).toBe(true);
            expect(Array.isArray(DEFAULT_CHART_THEMES.light.borderColors)).toBe(
                true
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

            expect(DEFAULT_CHART_THEMES.dark.backgroundColors.length).toBe(
                DEFAULT_CHART_THEMES.dark.borderColors.length
            );
            expect(DEFAULT_CHART_THEMES.light.backgroundColors.length).toBe(
                DEFAULT_CHART_THEMES.light.borderColors.length
            );
        });

        it("should have valid color strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const colorRegex = /^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)$/;

            DEFAULT_CHART_THEMES.dark.backgroundColors.forEach((color) => {
                expect(typeof color).toBe("string");
                expect(color).toMatch(colorRegex);
            });

            DEFAULT_CHART_THEMES.dark.borderColors.forEach((color) => {
                expect(typeof color).toBe("string");
                expect(color).toMatch(colorRegex);
            });
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

            expect(hasPlugins(fullConfig)).toBe(true);
            expect(hasScales(fullConfig)).toBe(true);
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

            expect(hasPlugins(pluginsOnlyConfig)).toBe(true);
            expect(hasScales(pluginsOnlyConfig)).toBe(false);

            expect(hasPlugins(scalesOnlyConfig)).toBe(false);
            expect(hasScales(scalesOnlyConfig)).toBe(true);
        });
    });
});
