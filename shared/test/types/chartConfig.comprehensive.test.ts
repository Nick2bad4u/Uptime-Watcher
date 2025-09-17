/**
 * Comprehensive tests for chartConfig utilities
 */
import { describe, it, expect } from "vitest";
import { hasPlugins, hasScales } from "../../types/chartConfig";

describe("chartConfig utilities", () => {
    describe(hasPlugins, () => {
        it("should return true for objects with valid plugins configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                plugins: {
                    title: {
                        display: true,
                        text: "Chart Title",
                    },
                },
            };

            expect(hasPlugins(config)).toBeTruthy();
        });

        it("should return true for objects with empty plugins object", async ({
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

        it("should return true for complex plugins configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                plugins: {
                    title: {
                        display: true,
                        text: "Response Time Chart",
                        font: {
                            size: 16,
                            weight: "bold" as const,
                        },
                    },
                    legend: {
                        display: true,
                        position: "top" as const,
                    },
                    tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleColor: "white",
                        bodyColor: "white",
                    },
                },
            };

            expect(hasPlugins(config)).toBeTruthy();
        });

        it("should return false for objects without plugins property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {
                    x: { display: true },
                    y: { display: true },
                },
            };

            expect(hasPlugins(config)).toBeFalsy();
        });

        it("should return false for objects with null plugins", async ({
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

            // HasPlugins correctly includes null check to return false for null plugins
            expect(hasPlugins(config)).toBeFalsy();
        });

        it("should return false for objects with non-object plugins", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const configs = [
                { plugins: "string" },
                { plugins: 123 },
                { plugins: true },
                { plugins: false },
                { plugins: Symbol("test") },
            ];

            for (const config of configs) {
                expect(hasPlugins(config)).toBeFalsy();
            }

            // Arrays are objects in JavaScript, so these would return true
            expect(hasPlugins({ plugins: [] })).toBeTruthy();
        });

        it("should return false for null input", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasPlugins(null)).toBeFalsy();
        });

        it("should return false for undefined input", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasPlugins(undefined)).toBeFalsy();
        });

        it("should return false for primitive inputs", async ({
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
            expect(hasPlugins(false)).toBeFalsy();
            expect(hasPlugins(Symbol("test"))).toBeFalsy();
        });

        it("should return false for array inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasPlugins([])).toBeFalsy();
            expect(
                hasPlugins([
                    1,
                    2,
                    3,
                ])
            ).toBeFalsy();
            expect(hasPlugins([{ plugins: {} }])).toBeFalsy();
        });

        it("should work as type guard", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config: unknown = {
                plugins: {
                    title: { display: true },
                },
            };

            if (hasPlugins(config)) {
                // TypeScript should now know config has plugins property
                expect((config as any).plugins).toBeDefined();
                expect(typeof (config as any).plugins).toBe("object");
            }
        });

        it("should handle mixed object with plugins and other properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                type: "line",
                data: {
                    labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                    ],
                    datasets: [],
                },
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    x: { display: true },
                },
            };

            expect(hasPlugins(config)).toBeTruthy();
        });
    });

    describe(hasScales, () => {
        it("should return true for objects with valid scales configuration", async ({
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
                        display: true,
                        type: "category" as const,
                    },
                    y: {
                        display: true,
                        type: "linear" as const,
                    },
                },
            };

            expect(hasScales(config)).toBeTruthy();
        });

        it("should return true for objects with empty scales object", async ({
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

        it("should return true for complex scales configuration", async ({
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
                        display: true,
                        title: {
                            display: true,
                            text: "Time",
                        },
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: "Response Time (ms)",
                        },
                        ticks: {
                            stepSize: 100,
                        },
                    },
                    y1: {
                        type: "linear" as const,
                        display: true,
                        position: "right" as const,
                    },
                },
            };

            expect(hasScales(config)).toBeTruthy();
        });

        it("should return false for objects without scales property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                plugins: {
                    title: { display: true },
                },
            };

            expect(hasScales(config)).toBeFalsy();
        });

        it("should return false for objects with null scales", async ({
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

        it("should return false for objects with non-object scales", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const configs = [
                { scales: "string" },
                { scales: 123 },
                { scales: true },
                { scales: false },
                { scales: Symbol("test") },
            ];

            for (const config of configs) {
                expect(hasScales(config)).toBeFalsy();
            }

            // Arrays are objects in JavaScript, so these would return true
            expect(hasScales({ scales: [] })).toBeTruthy();
        });

        it("should return false for null input", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales(null)).toBeFalsy();
        });

        it("should return false for undefined input", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales(undefined)).toBeFalsy();
        });

        it("should return false for primitive inputs", async ({
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
            expect(hasScales(false)).toBeFalsy();
            expect(hasScales(Symbol("test"))).toBeFalsy();
        });

        it("should return false for array inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales([])).toBeFalsy();
            expect(
                hasScales([
                    1,
                    2,
                    3,
                ])
            ).toBeFalsy();
            expect(hasScales([{ scales: {} }])).toBeFalsy();
        });

        it("should work as type guard", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config: unknown = {
                scales: {
                    x: { display: true },
                    y: { display: true },
                },
            };

            if (hasScales(config)) {
                // TypeScript should now know config has scales property
                expect((config as any).scales).toBeDefined();
                expect(typeof (config as any).scales).toBe("object");
            }
        });

        it("should handle mixed object with scales and other properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                type: "bar",
                data: {
                    labels: [
                        "A",
                        "B",
                        "C",
                    ],
                    datasets: [],
                },
                plugins: {
                    legend: { display: true },
                },
                scales: {
                    x: {
                        display: true,
                        stacked: true,
                    },
                    y: {
                        display: true,
                        stacked: true,
                    },
                },
            };

            expect(hasScales(config)).toBeTruthy();
        });
    });

    describe("integration tests", () => {
        it("should handle chart config with both plugins and scales", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                plugins: {
                    title: {
                        display: true,
                        text: "Site Monitoring Chart",
                    },
                    legend: {
                        display: true,
                        position: "bottom" as const,
                    },
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: "Time Period",
                        },
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: "Response Time (ms)",
                        },
                    },
                },
            };

            expect(hasPlugins(config)).toBeTruthy();
            expect(hasScales(config)).toBeTruthy();
        });

        it("should handle chart config with neither plugins nor scales", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                type: "line",
                data: {
                    labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                    ],
                    datasets: [],
                },
            };

            expect(hasPlugins(config)).toBeFalsy();
            expect(hasScales(config)).toBeFalsy();
        });

        it("should handle real-world chart configuration patterns", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const uptimeChartConfig = {
                type: "line",
                data: {
                    labels: [],
                    datasets: [],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: "Site Uptime Overview",
                        },
                        legend: {
                            display: true,
                            position: "top" as const,
                        },
                        tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            displayColors: true,
                        },
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                display: true,
                                color: "rgba(0, 0, 0, 0.1)",
                            },
                        },
                        y: {
                            display: true,
                            min: 0,
                            max: 100,
                            ticks: {
                                stepSize: 10,
                            },
                        },
                    },
                },
            };

            expect(hasPlugins(uptimeChartConfig.options)).toBeTruthy();
            expect(hasScales(uptimeChartConfig.options)).toBeTruthy();
        });

        it("should handle edge cases with complex nested structures", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const complexConfig = {
                plugins: {
                    customPlugin: {
                        enabled: true,
                        options: {
                            nested: {
                                property: "value",
                            },
                        },
                    },
                },
                scales: {
                    "custom-scale": {
                        type: "linear" as const,
                        position: "left" as const,
                        ticks: {
                            callback: (value: number) => `${value}ms`,
                        },
                    },
                },
                otherProperty: "should not interfere",
            };

            expect(hasPlugins(complexConfig)).toBeTruthy();
            expect(hasScales(complexConfig)).toBeTruthy();
        });
    });
});
