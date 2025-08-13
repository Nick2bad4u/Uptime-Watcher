/**
 * @fileoverview Comprehensive tests for chartUtils utility functions
 * Tests type-safe Chart.js configuration utilities for 100% branch coverage
 */

import { describe, it, expect } from "vitest";
import {
    getNestedScaleProperty,
    getScaleConfig,
    getScaleProperty,
} from "../../utils/chartUtils";
import { hasScales } from "../../../shared/types/chartConfig";

describe("Chart Utilities", () => {
    describe("hasScales", () => {
        it("should return true for valid scale configuration", () => {
            const config = {
                scales: {
                    x: { title: { text: "X Axis" } },
                    y: { title: { text: "Y Axis" } },
                },
            };
            expect(hasScales(config)).toBe(true);
        });

        it("should return true for partial scale configuration", () => {
            const config = {
                scales: {
                    x: { title: { text: "X Axis" } },
                    // y is optional
                },
            };
            expect(hasScales(config)).toBe(true);
        });

        it("should return true for empty scales object", () => {
            const config = {
                scales: {},
            };
            expect(hasScales(config)).toBe(true);
        });

        it("should return false for null config", () => {
            expect(hasScales(null)).toBe(false);
        });

        it("should return false for undefined config", () => {
            expect(hasScales(undefined)).toBe(false);
        });

        it("should return false for non-object config", () => {
            expect(hasScales("string")).toBe(false);
            expect(hasScales(123)).toBe(false);
            expect(hasScales(true)).toBe(false);
            expect(hasScales([])).toBe(false);
        });

        it("should return false for config without scales property", () => {
            const config = {
                type: "line",
                data: {},
            };
            expect(hasScales(config)).toBe(false);
        });

        it("should return false for config with null scales", () => {
            const config = {
                scales: null,
            };
            expect(hasScales(config)).toBe(false);
        });

        it("should return false for config with non-object scales", () => {
            const config = {
                scales: "invalid",
            };
            expect(hasScales(config)).toBe(false);
        });
    });

    describe("getScaleConfig", () => {
        const validConfig = {
            scales: {
                x: {
                    type: "linear",
                    title: { text: "X Axis" },
                    min: 0,
                    max: 100,
                },
                y: {
                    type: "linear",
                    title: { text: "Y Axis" },
                    beginAtZero: true,
                },
            },
        };

        it("should return x scale configuration", () => {
            const result = getScaleConfig(validConfig, "x");
            expect(result).toEqual({
                type: "linear",
                title: { text: "X Axis" },
                min: 0,
                max: 100,
            });
        });

        it("should return y scale configuration", () => {
            const result = getScaleConfig(validConfig, "y");
            expect(result).toEqual({
                type: "linear",
                title: { text: "Y Axis" },
                beginAtZero: true,
            });
        });

        it("should return undefined for config without scales", () => {
            const config = {
                type: "line",
                data: {},
            };
            expect(getScaleConfig(config, "x")).toBeUndefined();
            expect(getScaleConfig(config, "y")).toBeUndefined();
        });

        it("should return undefined for null/undefined config", () => {
            expect(getScaleConfig(null, "x")).toBeUndefined();
            expect(getScaleConfig(undefined, "x")).toBeUndefined();
        });

        it("should return undefined for non-existent axis", () => {
            const config = {
                scales: {
                    x: { type: "linear" },
                    // y is missing
                },
            };
            expect(getScaleConfig(config, "y")).toBeUndefined();
        });

        it("should return undefined for null scale value", () => {
            const config = {
                scales: {
                    x: null,
                    y: { type: "linear" },
                },
            };
            expect(getScaleConfig(config, "x")).toBeUndefined();
        });

        it("should return undefined for non-object scale value", () => {
            const config = {
                scales: {
                    x: "invalid",
                    y: 123,
                },
            };
            expect(getScaleConfig(config, "x")).toBeUndefined();
            expect(getScaleConfig(config, "y")).toBeUndefined();
        });

        it("should handle empty scales object", () => {
            const config = {
                scales: {},
            };
            expect(getScaleConfig(config, "x")).toBeUndefined();
            expect(getScaleConfig(config, "y")).toBeUndefined();
        });
    });

    describe("getScaleProperty", () => {
        const validConfig = {
            scales: {
                x: {
                    type: "linear",
                    title: { text: "X Axis" },
                    min: 0,
                    max: 100,
                },
                y: {
                    type: "category",
                    beginAtZero: true,
                },
            },
        };

        it("should return existing property from x scale", () => {
            expect(getScaleProperty(validConfig, "x", "type")).toBe("linear");
            expect(getScaleProperty(validConfig, "x", "min")).toBe(0);
            expect(getScaleProperty(validConfig, "x", "max")).toBe(100);
            expect(getScaleProperty(validConfig, "x", "title")).toEqual({
                text: "X Axis",
            });
        });

        it("should return existing property from y scale", () => {
            expect(getScaleProperty(validConfig, "y", "type")).toBe("category");
            expect(getScaleProperty(validConfig, "y", "beginAtZero")).toBe(
                true
            );
        });

        it("should return undefined for non-existent property", () => {
            expect(
                getScaleProperty(validConfig, "x", "nonExistent")
            ).toBeUndefined();
            expect(
                getScaleProperty(validConfig, "y", "missingProp")
            ).toBeUndefined();
        });

        it("should return undefined for config without scales", () => {
            const config = { type: "line", data: {} };
            expect(getScaleProperty(config, "x", "type")).toBeUndefined();
        });

        it("should return undefined for null/undefined config", () => {
            expect(getScaleProperty(null, "x", "type")).toBeUndefined();
            expect(getScaleProperty(undefined, "x", "type")).toBeUndefined();
        });

        it("should return undefined for non-existent scale", () => {
            const config = {
                scales: {
                    x: { type: "linear" },
                    // y is missing
                },
            };
            expect(getScaleProperty(config, "y", "type")).toBeUndefined();
        });

        it("should handle falsy property values correctly", () => {
            const config = {
                scales: {
                    x: {
                        zeroValue: 0,
                        falseValue: false,
                        emptyString: "",
                        nullValue: null,
                    },
                },
            };
            expect(getScaleProperty(config, "x", "zeroValue")).toBe(0);
            expect(getScaleProperty(config, "x", "falseValue")).toBe(false);
            expect(getScaleProperty(config, "x", "emptyString")).toBe("");
            expect(getScaleProperty(config, "x", "nullValue")).toBe(null);
        });
    });

    describe("getNestedScaleProperty", () => {
        const validConfig = {
            scales: {
                x: {
                    title: {
                        text: "X Axis Title",
                        display: true,
                        font: {
                            size: 14,
                            weight: "bold",
                        },
                    },
                    grid: {
                        color: "#e0e0e0",
                        lineWidth: 1,
                    },
                },
                y: {
                    title: {
                        text: "Y Axis Title",
                        display: false,
                    },
                },
            },
        };

        it("should return nested property from x scale - single level", () => {
            expect(getNestedScaleProperty(validConfig, "x", "title")).toEqual({
                text: "X Axis Title",
                display: true,
                font: {
                    size: 14,
                    weight: "bold",
                },
            });
        });

        it("should return nested property from x scale - multiple levels", () => {
            expect(getNestedScaleProperty(validConfig, "x", "title.text")).toBe(
                "X Axis Title"
            );
            expect(
                getNestedScaleProperty(validConfig, "x", "title.display")
            ).toBe(true);
            expect(
                getNestedScaleProperty(validConfig, "x", "title.font.size")
            ).toBe(14);
            expect(
                getNestedScaleProperty(validConfig, "x", "title.font.weight")
            ).toBe("bold");
        });

        it("should return nested property from y scale", () => {
            expect(getNestedScaleProperty(validConfig, "y", "title.text")).toBe(
                "Y Axis Title"
            );
            expect(
                getNestedScaleProperty(validConfig, "y", "title.display")
            ).toBe(false);
        });

        it("should return undefined for non-existent nested property", () => {
            expect(
                getNestedScaleProperty(validConfig, "x", "title.nonExistent")
            ).toBeUndefined();
            expect(
                getNestedScaleProperty(validConfig, "x", "nonExistent.property")
            ).toBeUndefined();
            expect(
                getNestedScaleProperty(
                    validConfig,
                    "x",
                    "title.font.nonExistent"
                )
            ).toBeUndefined();
        });

        it("should return undefined for config without scales", () => {
            const config = { type: "line", data: {} };
            expect(
                getNestedScaleProperty(config, "x", "title.text")
            ).toBeUndefined();
        });

        it("should return undefined for null/undefined config", () => {
            expect(
                getNestedScaleProperty(null, "x", "title.text")
            ).toBeUndefined();
            expect(
                getNestedScaleProperty(undefined, "x", "title.text")
            ).toBeUndefined();
        });

        it("should return undefined for non-existent scale", () => {
            const config = {
                scales: {
                    x: { title: { text: "X Axis" } },
                    // y is missing
                },
            };
            expect(
                getNestedScaleProperty(config, "y", "title.text")
            ).toBeUndefined();
        });

        it("should handle null/undefined intermediate properties", () => {
            const config = {
                scales: {
                    x: {
                        title: null,
                        grid: {
                            color: null,
                        },
                    },
                },
            };
            expect(
                getNestedScaleProperty(config, "x", "title.text")
            ).toBeUndefined();
            expect(
                getNestedScaleProperty(config, "x", "grid.color.value")
            ).toBeUndefined();
        });

        it("should handle non-object intermediate properties", () => {
            const config = {
                scales: {
                    x: {
                        title: "string instead of object",
                        number: 123,
                    },
                },
            };
            expect(
                getNestedScaleProperty(config, "x", "title.text")
            ).toBeUndefined();
            expect(
                getNestedScaleProperty(config, "x", "number.value")
            ).toBeUndefined();
        });

        it("should handle empty path gracefully", () => {
            expect(
                getNestedScaleProperty(validConfig, "x", "")
            ).toBeUndefined();
        });

        it("should handle single property path", () => {
            expect(getNestedScaleProperty(validConfig, "x", "grid")).toEqual({
                color: "#e0e0e0",
                lineWidth: 1,
            });
        });

        it("should handle very deep nesting", () => {
            const deepConfig = {
                scales: {
                    x: {
                        level1: {
                            level2: {
                                level3: {
                                    level4: {
                                        value: "deep value",
                                    },
                                },
                            },
                        },
                    },
                },
            };
            expect(
                getNestedScaleProperty(
                    deepConfig,
                    "x",
                    "level1.level2.level3.level4.value"
                )
            ).toBe("deep value");
            expect(
                getNestedScaleProperty(
                    deepConfig,
                    "x",
                    "level1.level2.level3.level4.nonExistent"
                )
            ).toBeUndefined();
        });

        it("should handle falsy values in nested path", () => {
            const config = {
                scales: {
                    x: {
                        values: {
                            zero: 0,
                            false: false,
                            empty: "",
                            null: null,
                        },
                    },
                },
            };
            expect(getNestedScaleProperty(config, "x", "values.zero")).toBe(0);
            expect(getNestedScaleProperty(config, "x", "values.false")).toBe(
                false
            );
            expect(getNestedScaleProperty(config, "x", "values.empty")).toBe(
                ""
            );
            expect(getNestedScaleProperty(config, "x", "values.null")).toBe(
                null
            );
        });
    });

    describe("Edge cases and integration", () => {
        it("should handle complex Chart.js configuration", () => {
            const complexConfig = {
                type: "line",
                data: {
                    labels: ["Jan", "Feb", "Mar"],
                    datasets: [{ label: "Sales", data: [10, 20, 30] }],
                },
                options: {
                    responsive: true,
                },
                scales: {
                    x: {
                        type: "category",
                        title: {
                            display: true,
                            text: "Months",
                            font: {
                                size: 16,
                                weight: "normal",
                            },
                        },
                        grid: {
                            display: true,
                            color: "#f0f0f0",
                        },
                    },
                    y: {
                        type: "linear",
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Revenue ($)",
                        },
                        ticks: {
                            callback: function (value: number) {
                                return "$" + value;
                            },
                        },
                    },
                },
            };

            // Test hasScales
            expect(hasScales(complexConfig)).toBe(true);

            // Test getScaleConfig
            const xScale = getScaleConfig(complexConfig, "x");
            const yScale = getScaleConfig(complexConfig, "y");
            expect(xScale).toBeDefined();
            expect(yScale).toBeDefined();
            expect(xScale?.["type"]).toBe("category");
            expect(yScale?.["type"]).toBe("linear");

            // Test getScaleProperty
            expect(getScaleProperty(complexConfig, "x", "type")).toBe(
                "category"
            );
            expect(getScaleProperty(complexConfig, "y", "beginAtZero")).toBe(
                true
            );

            // Test getNestedScaleProperty
            expect(
                getNestedScaleProperty(complexConfig, "x", "title.text")
            ).toBe("Months");
            expect(
                getNestedScaleProperty(complexConfig, "x", "title.font.size")
            ).toBe(16);
            expect(
                getNestedScaleProperty(complexConfig, "y", "title.text")
            ).toBe("Revenue ($)");
            expect(
                getNestedScaleProperty(complexConfig, "y", "ticks.callback")
            ).toBeTypeOf("function");
        });

        it("should handle all function combinations with invalid inputs", () => {
            const invalidInputs = [
                null,
                undefined,
                "",
                0,
                false,
                [],
                {},
            ];

            for (const input of invalidInputs) {
                expect(hasScales(input)).toBe(
                    input === false
                        ? false
                        : !!(
                              input &&
                              typeof input === "object" &&
                              "scales" in input
                          )
                );
                expect(getScaleConfig(input, "x")).toBeUndefined();
                expect(getScaleProperty(input, "x", "type")).toBeUndefined();
                expect(
                    getNestedScaleProperty(input, "x", "title.text")
                ).toBeUndefined();
            }
        });
    });
});
