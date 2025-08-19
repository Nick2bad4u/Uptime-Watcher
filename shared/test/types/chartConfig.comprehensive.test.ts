/**
 * Comprehensive tests for chartConfig utilities
 */
import { describe, it, expect } from "vitest";
import { hasPlugins, hasScales } from "../../types/chartConfig";

describe("chartConfig utilities", () => {
    describe("hasPlugins", () => {
        it("should return true for objects with valid plugins configuration", () => {
            const config = {
                plugins: {
                    title: {
                        display: true,
                        text: "Chart Title",
                    },
                },
            };

            expect(hasPlugins(config)).toBe(true);
        });

        it("should return true for objects with empty plugins object", () => {
            const config = {
                plugins: {},
            };

            expect(hasPlugins(config)).toBe(true);
        });

        it("should return true for complex plugins configuration", () => {
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

            expect(hasPlugins(config)).toBe(true);
        });

        it("should return false for objects without plugins property", () => {
            const config = {
                scales: {
                    x: { display: true },
                    y: { display: true },
                },
            };

            expect(hasPlugins(config)).toBe(false);
        });

        it("should return false for objects with null plugins", () => {
            const config = {
                plugins: null,
            };

            // hasPlugins correctly includes null check to return false for null plugins
            expect(hasPlugins(config)).toBe(false);
        });

        it("should return false for objects with non-object plugins", () => {
            const configs = [
                { plugins: "string" },
                { plugins: 123 },
                { plugins: true },
                { plugins: false },
                { plugins: Symbol("test") },
            ];

            for (const config of configs) {
                expect(hasPlugins(config)).toBe(false);
            }

            // Arrays are objects in JavaScript, so these would return true
            expect(hasPlugins({ plugins: [] })).toBe(true);
        });

        it("should return false for null input", () => {
            expect(hasPlugins(null)).toBe(false);
        });

        it("should return false for undefined input", () => {
            expect(hasPlugins(undefined)).toBe(false);
        });

        it("should return false for primitive inputs", () => {
            expect(hasPlugins("string")).toBe(false);
            expect(hasPlugins(123)).toBe(false);
            expect(hasPlugins(true)).toBe(false);
            expect(hasPlugins(false)).toBe(false);
            expect(hasPlugins(Symbol("test"))).toBe(false);
        });

        it("should return false for array inputs", () => {
            expect(hasPlugins([])).toBe(false);
            expect(
                hasPlugins([
                    1,
                    2,
                    3,
                ])
            ).toBe(false);
            expect(hasPlugins([{ plugins: {} }])).toBe(false);
        });

        it("should work as type guard", () => {
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

        it("should handle mixed object with plugins and other properties", () => {
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

            expect(hasPlugins(config)).toBe(true);
        });
    });

    describe("hasScales", () => {
        it("should return true for objects with valid scales configuration", () => {
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

            expect(hasScales(config)).toBe(true);
        });

        it("should return true for objects with empty scales object", () => {
            const config = {
                scales: {},
            };

            expect(hasScales(config)).toBe(true);
        });

        it("should return true for complex scales configuration", () => {
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

            expect(hasScales(config)).toBe(true);
        });

        it("should return false for objects without scales property", () => {
            const config = {
                plugins: {
                    title: { display: true },
                },
            };

            expect(hasScales(config)).toBe(false);
        });

        it("should return false for objects with null scales", () => {
            const config = {
                scales: null,
            };

            expect(hasScales(config)).toBe(false);
        });

        it("should return false for objects with non-object scales", () => {
            const configs = [
                { scales: "string" },
                { scales: 123 },
                { scales: true },
                { scales: false },
                { scales: Symbol("test") },
            ];

            for (const config of configs) {
                expect(hasScales(config)).toBe(false);
            }

            // Arrays are objects in JavaScript, so these would return true
            expect(hasScales({ scales: [] })).toBe(true);
        });

        it("should return false for null input", () => {
            expect(hasScales(null)).toBe(false);
        });

        it("should return false for undefined input", () => {
            expect(hasScales(undefined)).toBe(false);
        });

        it("should return false for primitive inputs", () => {
            expect(hasScales("string")).toBe(false);
            expect(hasScales(123)).toBe(false);
            expect(hasScales(true)).toBe(false);
            expect(hasScales(false)).toBe(false);
            expect(hasScales(Symbol("test"))).toBe(false);
        });

        it("should return false for array inputs", () => {
            expect(hasScales([])).toBe(false);
            expect(
                hasScales([
                    1,
                    2,
                    3,
                ])
            ).toBe(false);
            expect(hasScales([{ scales: {} }])).toBe(false);
        });

        it("should work as type guard", () => {
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

        it("should handle mixed object with scales and other properties", () => {
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

            expect(hasScales(config)).toBe(true);
        });
    });

    describe("integration tests", () => {
        it("should handle chart config with both plugins and scales", () => {
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

            expect(hasPlugins(config)).toBe(true);
            expect(hasScales(config)).toBe(true);
        });

        it("should handle chart config with neither plugins nor scales", () => {
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

            expect(hasPlugins(config)).toBe(false);
            expect(hasScales(config)).toBe(false);
        });

        it("should handle real-world chart configuration patterns", () => {
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

            expect(hasPlugins(uptimeChartConfig.options)).toBe(true);
            expect(hasScales(uptimeChartConfig.options)).toBe(true);
        });

        it("should handle edge cases with complex nested structures", () => {
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

            expect(hasPlugins(complexConfig)).toBe(true);
            expect(hasScales(complexConfig)).toBe(true);
        });
    });
});
