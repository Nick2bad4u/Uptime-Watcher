/**
 * @file Comprehensive tests for chartUtils utility functions Tests type-safe
 *   Chart.js configuration utilities for 100% branch coverage Enhanced with
 *   fast-check property-based testing to systematically explore chart
 *   configuration edge cases, nested property access, scale type validation,
 *   and Chart.js configuration object handling under various conditions.
 */

import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
    getNestedScaleProperty,
    getScaleConfig,
    getScaleProperty,
} from "../../utils/chartUtils";
import { hasScales } from "../../../shared/types/chartConfig";

describe("Chart Utilities", () => {
    describe(hasScales, () => {
        it("should return true for valid scale configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {
                    x: { title: { text: "X Axis" } },
                    y: { title: { text: "Y Axis" } },
                },
            };
            expect(hasScales(config)).toBeTruthy();
        });

        it("should return true for partial scale configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {
                    x: { title: { text: "X Axis" } },
                    // Y is optional
                },
            };
            expect(hasScales(config)).toBeTruthy();
        });

        it("should return true for empty scales object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {},
            };
            expect(hasScales(config)).toBeTruthy();
        });

        it("should return false for null config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales(null)).toBeFalsy();
        });

        it("should return false for undefined config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales(undefined)).toBeFalsy();
        });

        it("should return false for non-object config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasScales("string")).toBeFalsy();
            expect(hasScales(123)).toBeFalsy();
            expect(hasScales(true)).toBeFalsy();
            expect(hasScales([])).toBeFalsy();
        });

        it("should return false for config without scales property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                type: "line",
                data: {},
            };
            expect(hasScales(config)).toBeFalsy();
        });

        it("should return false for config with null scales", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: null,
            };
            expect(hasScales(config)).toBeFalsy();
        });

        it("should return false for config with non-object scales", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: "invalid",
            };
            expect(hasScales(config)).toBeFalsy();
        });
    });

    describe(getScaleConfig, () => {
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

        it("should return x scale configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = getScaleConfig(validConfig, "x");
            expect(result).toEqual({
                type: "linear",
                title: { text: "X Axis" },
                min: 0,
                max: 100,
            });
        });

        it("should return y scale configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = getScaleConfig(validConfig, "y");
            expect(result).toEqual({
                type: "linear",
                title: { text: "Y Axis" },
                beginAtZero: true,
            });
        });

        it("should return undefined for config without scales", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                type: "line",
                data: {},
            };
            expect(getScaleConfig(config, "x")).toBeUndefined();
            expect(getScaleConfig(config, "y")).toBeUndefined();
        });

        it("should return undefined for null/undefined config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getScaleConfig(null, "x")).toBeUndefined();
            expect(getScaleConfig(undefined, "x")).toBeUndefined();
        });

        it("should return undefined for non-existent axis", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {
                    x: { type: "linear" },
                    // Y is missing
                },
            };
            expect(getScaleConfig(config, "y")).toBeUndefined();
        });

        it("should return undefined for null scale value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {
                    x: null,
                    y: { type: "linear" },
                },
            };
            expect(getScaleConfig(config, "x")).toBeUndefined();
        });

        it("should return undefined for non-object scale value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {
                    x: "invalid",
                    y: 123,
                },
            };
            expect(getScaleConfig(config, "x")).toBeUndefined();
            expect(getScaleConfig(config, "y")).toBeUndefined();
        });

        it("should handle empty scales object", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {},
            };
            expect(getScaleConfig(config, "x")).toBeUndefined();
            expect(getScaleConfig(config, "y")).toBeUndefined();
        });
    });

    describe(getScaleProperty, () => {
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

        it("should return existing property from x scale", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getScaleProperty(validConfig, "x", "type")).toBe("linear");
            expect(getScaleProperty(validConfig, "x", "min")).toBe(0);
            expect(getScaleProperty(validConfig, "x", "max")).toBe(100);
            expect(getScaleProperty(validConfig, "x", "title")).toEqual({
                text: "X Axis",
            });
        });

        it("should return existing property from y scale", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getScaleProperty(validConfig, "y", "type")).toBe("category");
            expect(
                getScaleProperty(validConfig, "y", "beginAtZero")
            ).toBeTruthy();
        });

        it("should return undefined for non-existent property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                getScaleProperty(validConfig, "x", "nonExistent")
            ).toBeUndefined();
            expect(
                getScaleProperty(validConfig, "y", "missingProp")
            ).toBeUndefined();
        });

        it("should return undefined for config without scales", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = { type: "line", data: {} };
            expect(getScaleProperty(config, "x", "type")).toBeUndefined();
        });

        it("should return undefined for null/undefined config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getScaleProperty(null, "x", "type")).toBeUndefined();
            expect(getScaleProperty(undefined, "x", "type")).toBeUndefined();
        });

        it("should return undefined for non-existent scale", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {
                    x: { type: "linear" },
                    // Y is missing
                },
            };
            expect(getScaleProperty(config, "y", "type")).toBeUndefined();
        });

        it("should handle falsy property values correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
            expect(getScaleProperty(config, "x", "falseValue")).toBeFalsy();
            expect(getScaleProperty(config, "x", "emptyString")).toBe("");
            expect(getScaleProperty(config, "x", "nullValue")).toBe(null);
        });
    });

    describe(getNestedScaleProperty, () => {
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

        it("should return nested property from x scale - single level", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getNestedScaleProperty(validConfig, "x", "title")).toEqual({
                text: "X Axis Title",
                display: true,
                font: {
                    size: 14,
                    weight: "bold",
                },
            });
        });

        it("should return nested property from x scale - multiple levels", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getNestedScaleProperty(validConfig, "x", "title.text")).toBe(
                "X Axis Title"
            );
            expect(
                getNestedScaleProperty(validConfig, "x", "title.display")
            ).toBeTruthy();
            expect(
                getNestedScaleProperty(validConfig, "x", "title.font.size")
            ).toBe(14);
            expect(
                getNestedScaleProperty(validConfig, "x", "title.font.weight")
            ).toBe("bold");
        });

        it("should return nested property from y scale", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getNestedScaleProperty(validConfig, "y", "title.text")).toBe(
                "Y Axis Title"
            );
            expect(
                getNestedScaleProperty(validConfig, "y", "title.display")
            ).toBeFalsy();
        });

        it("should return undefined for non-existent nested property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should return undefined for config without scales", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = { type: "line", data: {} };
            expect(
                getNestedScaleProperty(config, "x", "title.text")
            ).toBeUndefined();
        });

        it("should return undefined for null/undefined config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                getNestedScaleProperty(null, "x", "title.text")
            ).toBeUndefined();
            expect(
                getNestedScaleProperty(undefined, "x", "title.text")
            ).toBeUndefined();
        });

        it("should return undefined for non-existent scale", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const config = {
                scales: {
                    x: { title: { text: "X Axis" } },
                    // Y is missing
                },
            };
            expect(
                getNestedScaleProperty(config, "y", "title.text")
            ).toBeUndefined();
        });

        it("should handle null/undefined intermediate properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle non-object intermediate properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle empty path gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                getNestedScaleProperty(validConfig, "x", "")
            ).toBeUndefined();
        });

        it("should handle single property path", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getNestedScaleProperty(validConfig, "x", "grid")).toEqual({
                color: "#e0e0e0",
                lineWidth: 1,
            });
        });

        it("should handle very deep nesting", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle falsy values in nested path", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
            expect(
                getNestedScaleProperty(config, "x", "values.false")
            ).toBeFalsy();
            expect(getNestedScaleProperty(config, "x", "values.empty")).toBe(
                ""
            );
            expect(getNestedScaleProperty(config, "x", "values.null")).toBe(
                null
            );
        });
    });

    describe("Edge cases and integration", () => {
        it("should handle complex Chart.js configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const complexConfig = {
                type: "line",
                data: {
                    labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                    ],
                    datasets: [
                        {
                            label: "Sales",
                            data: [
                                10,
                                20,
                                30,
                            ],
                        },
                    ],
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
                                return `$${value}`;
                            },
                        },
                    },
                },
            };

            // Test hasScales
            expect(hasScales(complexConfig)).toBeTruthy();

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
            expect(
                getScaleProperty(complexConfig, "y", "beginAtZero")
            ).toBeTruthy();

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

        it("should handle all function combinations with invalid inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
                        : Boolean(
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

    /**
     * Fast-check property-based tests for comprehensive edge case coverage.
     * These tests systematically explore chart configuration behavior under
     * various conditions including invalid inputs, complex nested structures,
     * different scale types, and edge cases in property access patterns.
     */
    describe("Property-based tests", () => {
        describe("hasScales function", () => {
            test.prop([fc.anything()])(
                "should handle arbitrary input types safely",
                (input) => {
                    // Property: Function should never throw, always return boolean
                    const result = hasScales(input);
                    expect(typeof result).toBe("boolean");

                    // Property: Only object with 'scales' property should return true
                    const expected = Boolean(
                        input &&
                            typeof input === "object" &&
                            input !== null &&
                            "scales" in input
                    );
                    expect(result).toBe(expected);
                }
            );

            test.prop([
                fc.record({
                    scales: fc.oneof(
                        fc.record({
                            x: fc.anything(),
                            y: fc.anything(),
                        }),
                        fc.record({}),
                        fc.anything()
                    ),
                }),
            ])(
                "should validate scales property existence and type",
                (config) => {
                    const result = hasScales(config);

                    // Property: Should return true only if scales is an object
                    const expected = Boolean(
                        config.scales &&
                            typeof config.scales === "object" &&
                            config.scales !== null
                    );
                    expect(result).toBe(expected);
                }
            );

            test.prop([
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.string(),
                    fc.integer(),
                    fc.float(),
                    fc.boolean(),
                    fc.array(fc.anything()),
                    fc.record({ otherProp: fc.anything() }) // Object without scales
                ),
            ])("should return false for non-scale configurations", (input) => {
                fc.pre(
                    !(input && typeof input === "object" && "scales" in input)
                ); // Ensure no scales property

                const result = hasScales(input);

                // Property: Should return false for objects without scales
                expect(result).toBeFalsy();
            });
        });

        describe("getScaleConfig function", () => {
            test.prop([
                fc.anything(),
                fc.oneof(fc.constant("x"), fc.constant("y")),
            ])(
                "should handle arbitrary config inputs safely",
                (config, axis) => {
                    // Property: Function should never throw
                    const result = getScaleConfig(config, axis);

                    // Property: Should return undefined for invalid configs
                    if (!hasScales(config)) {
                        expect(result).toBeUndefined();
                    }
                }
            );

            test.prop([
                fc.record({
                    scales: fc.record(
                        {
                            x: fc.oneof(fc.record({}), fc.anything()),
                            y: fc.oneof(fc.record({}), fc.anything()),
                        },
                        { requiredKeys: [] }
                    ),
                }),
                fc.oneof(fc.constant("x"), fc.constant("y")),
            ])(
                "should extract correct scale configurations",
                (config, axis) => {
                    const result = getScaleConfig(config, axis);

                    if (axis in config.scales) {
                        const scaleValue = config.scales[axis];
                        if (
                            typeof scaleValue === "object" &&
                            scaleValue !== null
                        ) {
                            // Property: Should return the scale object when valid
                            expect(result).toBe(scaleValue);
                        } else {
                            // Property: Should return undefined for non-object scales
                            expect(result).toBeUndefined();
                        }
                    } else {
                        // Property: Should return undefined when axis doesn't exist
                        expect(result).toBeUndefined();
                    }
                }
            );

            test.prop([
                fc.record({
                    scales: fc.record({
                        x: fc.record({
                            type: fc.oneof(
                                fc.constant("linear"),
                                fc.constant("category")
                            ),
                            title: fc.record({ text: fc.string() }),
                            min: fc.float({
                                min: Math.fround(-1000),
                                max: Math.fround(1000),
                            }),
                            max: fc.float({
                                min: Math.fround(-1000),
                                max: Math.fround(1000),
                            }),
                        }),
                        y: fc.record({
                            type: fc.oneof(
                                fc.constant("linear"),
                                fc.constant("logarithmic")
                            ),
                            beginAtZero: fc.boolean(),
                        }),
                    }),
                }),
            ])("should preserve scale properties accurately", (config) => {
                const xScale = getScaleConfig(config, "x");
                const yScale = getScaleConfig(config, "y");

                // Property: Returned scale should match original structure
                expect(xScale).toEqual(config.scales.x);
                expect(yScale).toEqual(config.scales.y);

                // Property: Properties should be accessible
                if (xScale && typeof xScale === "object") {
                    const xScaleObj = xScale as Record<string, unknown>;
                    expect(xScaleObj["type"]).toEqual(config.scales.x.type);
                }
                if (yScale && typeof yScale === "object") {
                    const yScaleObj = yScale as Record<string, unknown>;
                    expect(yScaleObj["type"]).toEqual(config.scales.y.type);
                }
            });
        });

        describe("getScaleProperty function", () => {
            test.prop([
                fc.anything(),
                fc.oneof(fc.constant("x"), fc.constant("y")),
                fc.string(),
            ])(
                "should handle arbitrary inputs safely",
                (config, axis, property) => {
                    // Property: Function should never throw
                    const result = getScaleProperty(config, axis, property);

                    // Property: Should return undefined for invalid configs
                    if (!hasScales(config)) {
                        expect(result).toBeUndefined();
                    }
                }
            );

            test.prop([
                fc.record({
                    scales: fc.record({
                        x: fc.record({
                            type: fc.string(),
                            min: fc.float(),
                            max: fc.float(),
                            display: fc.boolean(),
                            grid: fc.record({ color: fc.string() }),
                        }),
                        y: fc.record({
                            type: fc.string(),
                            beginAtZero: fc.boolean(),
                            stacked: fc.boolean(),
                        }),
                    }),
                }),
                fc.oneof(fc.constant("x"), fc.constant("y")),
            ])(
                "should extract specific properties correctly",
                (config, axis) => {
                    const scale = config.scales[axis];

                    // Test each known property
                    for (const [key, value] of Object.entries(scale)) {
                        const result = getScaleProperty(config, axis, key);

                        // Property: Should return exact property value
                        expect(result).toBe(value);
                    }

                    // Property: Should return undefined for non-existent properties
                    const nonExistentResult = getScaleProperty(
                        config,
                        axis,
                        "nonExistentProperty"
                    );
                    expect(nonExistentResult).toBeUndefined();
                }
            );

            test.prop([
                fc.record({
                    scales: fc.record({
                        x: fc.record({
                            nullValue: fc.constant(null),
                            undefinedValue: fc.constant(undefined),
                            falseValue: fc.constant(false),
                            zeroValue: fc.constant(0),
                            emptyString: fc.constant(""),
                        }),
                    }),
                }),
            ])("should handle falsy values correctly", (config) => {
                // Property: Should distinguish between undefined and other falsy values
                expect(getScaleProperty(config, "x", "nullValue")).toBe(null);
                expect(getScaleProperty(config, "x", "undefinedValue")).toBe(
                    undefined
                );
                expect(getScaleProperty(config, "x", "falseValue")).toBeFalsy();
                expect(getScaleProperty(config, "x", "zeroValue")).toBe(0);
                expect(getScaleProperty(config, "x", "emptyString")).toBe("");

                // Property: Non-existent property should return undefined
                expect(
                    getScaleProperty(config, "x", "nonExistent")
                ).toBeUndefined();
            });
        });

        describe("getNestedScaleProperty function", () => {
            test.prop([
                fc.anything(),
                fc.oneof(fc.constant("x"), fc.constant("y")),
                fc.string(),
            ])(
                "should handle arbitrary inputs safely",
                (config, axis, path) => {
                    // Property: Function should never throw
                    const result = getNestedScaleProperty(config, axis, path);

                    // Property: Should return undefined for invalid configs
                    if (!hasScales(config)) {
                        expect(result).toBeUndefined();
                    }
                }
            );

            test.prop([
                fc.record({
                    scales: fc.record({
                        x: fc.record({
                            title: fc.record({
                                text: fc.string(),
                                display: fc.boolean(),
                                font: fc.record({
                                    size: fc.integer({ min: 8, max: 32 }),
                                    weight: fc.oneof(
                                        fc.constant("normal"),
                                        fc.constant("bold")
                                    ),
                                    family: fc.string(),
                                }),
                            }),
                            grid: fc.record({
                                color: fc.string(),
                                display: fc.boolean(),
                                lineWidth: fc.integer({ min: 1, max: 10 }),
                            }),
                        }),
                    }),
                }),
            ])("should access nested properties correctly", (config) => {
                const expectedTitle = config.scales.x.title;
                const expectedFont = config.scales.x.title.font;
                const expectedGrid = config.scales.x.grid;

                // Property: Single-level access should work
                expect(getNestedScaleProperty(config, "x", "title")).toEqual(
                    expectedTitle
                );
                expect(getNestedScaleProperty(config, "x", "grid")).toEqual(
                    expectedGrid
                );

                // Property: Multi-level access should work
                expect(getNestedScaleProperty(config, "x", "title.text")).toBe(
                    expectedTitle.text
                );
                expect(
                    getNestedScaleProperty(config, "x", "title.display")
                ).toBe(expectedTitle.display);
                expect(
                    getNestedScaleProperty(config, "x", "title.font")
                ).toEqual(expectedFont);

                // Property: Deep nesting should work
                expect(
                    getNestedScaleProperty(config, "x", "title.font.size")
                ).toBe(expectedFont.size);
                expect(
                    getNestedScaleProperty(config, "x", "title.font.weight")
                ).toBe(expectedFont.weight);
                expect(
                    getNestedScaleProperty(config, "x", "title.font.family")
                ).toBe(expectedFont.family);

                // Property: Grid properties should be accessible
                expect(getNestedScaleProperty(config, "x", "grid.color")).toBe(
                    expectedGrid.color
                );
                expect(
                    getNestedScaleProperty(config, "x", "grid.display")
                ).toBe(expectedGrid.display);
                expect(
                    getNestedScaleProperty(config, "x", "grid.lineWidth")
                ).toBe(expectedGrid.lineWidth);
            });

            test.prop([
                fc.record({
                    scales: fc.record({
                        x: fc.record({
                            level1: fc.record({
                                level2: fc.record({
                                    level3: fc.record({
                                        level4: fc.record({
                                            deepValue: fc.string(),
                                            deepNumber: fc.integer(),
                                            deepBoolean: fc.boolean(),
                                        }),
                                    }),
                                }),
                            }),
                        }),
                    }),
                }),
            ])("should handle very deep nesting", (config) => {
                const expectedDeep =
                    config.scales.x.level1.level2.level3.level4;

                // Property: Deep path access should work
                expect(
                    getNestedScaleProperty(
                        config,
                        "x",
                        "level1.level2.level3.level4.deepValue"
                    )
                ).toBe(expectedDeep.deepValue);
                expect(
                    getNestedScaleProperty(
                        config,
                        "x",
                        "level1.level2.level3.level4.deepNumber"
                    )
                ).toBe(expectedDeep.deepNumber);
                expect(
                    getNestedScaleProperty(
                        config,
                        "x",
                        "level1.level2.level3.level4.deepBoolean"
                    )
                ).toBe(expectedDeep.deepBoolean);

                // Property: Intermediate levels should be accessible
                expect(
                    getNestedScaleProperty(
                        config,
                        "x",
                        "level1.level2.level3.level4"
                    )
                ).toEqual(expectedDeep);
                expect(
                    getNestedScaleProperty(config, "x", "level1.level2.level3")
                ).toEqual(config.scales.x.level1.level2.level3);
            });

            test.prop([
                fc.record({
                    scales: fc.record({
                        x: fc.record({
                            validProp: fc.string(),
                        }),
                    }),
                }),
                fc.string().filter((s) => s.length > 0),
            ])(
                "should return undefined for invalid paths",
                (config, invalidPath) => {
                    fc.pre(!invalidPath.startsWith("validProp")); // Ensure path doesn't match existing property

                    // Property: Invalid paths should return undefined
                    const result = getNestedScaleProperty(
                        config,
                        "x",
                        invalidPath
                    );
                    expect(result).toBeUndefined();

                    // Property: Paths that start valid but become invalid should return undefined
                    const invalidExtension = getNestedScaleProperty(
                        config,
                        "x",
                        `validProp.nonExistent`
                    );
                    expect(invalidExtension).toBeUndefined();
                }
            );

            test.prop([
                fc.record({
                    scales: fc.record({
                        x: fc.record({
                            emptyString: fc.constant(""),
                            nullValue: fc.constant(null),
                            falseValue: fc.constant(false),
                            zeroValue: fc.constant(0),
                            nested: fc.record({
                                emptyString: fc.constant(""),
                                nullValue: fc.constant(null),
                            }),
                        }),
                    }),
                }),
            ])("should handle falsy nested values correctly", (config) => {
                // Property: Should return exact falsy values, not undefined
                expect(getNestedScaleProperty(config, "x", "emptyString")).toBe(
                    ""
                );
                expect(getNestedScaleProperty(config, "x", "nullValue")).toBe(
                    null
                );
                expect(
                    getNestedScaleProperty(config, "x", "falseValue")
                ).toBeFalsy();
                expect(getNestedScaleProperty(config, "x", "zeroValue")).toBe(
                    0
                );

                // Property: Nested falsy values should be accessible
                expect(
                    getNestedScaleProperty(config, "x", "nested.emptyString")
                ).toBe("");
                expect(
                    getNestedScaleProperty(config, "x", "nested.nullValue")
                ).toBe(null);
            });

            test.prop([
                fc.string().filter((s) => s.trim() === "" || s === "."),
            ])("should handle empty or invalid path strings", (path) => {
                const config = {
                    scales: {
                        x: { title: { text: "Test" } },
                    },
                };

                // Property: Empty or invalid paths should return undefined
                const result = getNestedScaleProperty(config, "x", path);
                expect(result).toBeUndefined();
            });
        });

        describe("Cross-function consistency", () => {
            test.prop([
                fc.record({
                    scales: fc.record({
                        x: fc.record({
                            type: fc.string(),
                            title: fc.record({
                                text: fc.string(),
                                display: fc.boolean(),
                            }),
                            min: fc.float(),
                            max: fc.float(),
                        }),
                        y: fc.record({
                            type: fc.string(),
                            beginAtZero: fc.boolean(),
                        }),
                    }),
                }),
            ])(
                "should maintain consistency across all utility functions",
                (config) => {
                    // Property: hasScales should return true for valid config
                    expect(hasScales(config)).toBeTruthy();

                    // Property: getScaleConfig should return valid scale objects
                    const xScale = getScaleConfig(config, "x");
                    const yScale = getScaleConfig(config, "y");
                    expect(xScale).toBeDefined();
                    expect(yScale).toBeDefined();

                    // Property: getScaleProperty should match getScaleConfig results
                    for (const axis of ["x", "y"] as const) {
                        const scale = getScaleConfig(config, axis);
                        if (scale && typeof scale === "object") {
                            for (const [key, value] of Object.entries(scale)) {
                                const propertyResult = getScaleProperty(
                                    config,
                                    axis,
                                    key
                                );
                                expect(propertyResult).toBe(value);
                            }
                        }
                    }

                    // Property: getNestedScaleProperty should match getScaleProperty for single properties
                    expect(getNestedScaleProperty(config, "x", "type")).toBe(
                        getScaleProperty(config, "x", "type")
                    );
                    expect(
                        getNestedScaleProperty(config, "y", "beginAtZero")
                    ).toBe(getScaleProperty(config, "y", "beginAtZero"));

                    // Property: getNestedScaleProperty should access nested properties correctly
                    const expectedTitleText = (
                        config.scales.x.title as Record<string, unknown>
                    )["text"];
                    expect(
                        getNestedScaleProperty(config, "x", "title.text")
                    ).toBe(expectedTitleText);
                }
            );

            test.prop([fc.anything().filter((v) => !hasScales(v))])(
                "should consistently handle invalid configurations",
                (invalidConfig) => {
                    // Property: All functions should handle invalid configs consistently
                    expect(hasScales(invalidConfig)).toBeFalsy();
                    expect(getScaleConfig(invalidConfig, "x")).toBeUndefined();
                    expect(getScaleConfig(invalidConfig, "y")).toBeUndefined();
                    expect(
                        getScaleProperty(invalidConfig, "x", "type")
                    ).toBeUndefined();
                    expect(
                        getScaleProperty(invalidConfig, "y", "type")
                    ).toBeUndefined();
                    expect(
                        getNestedScaleProperty(invalidConfig, "x", "title.text")
                    ).toBeUndefined();
                    expect(
                        getNestedScaleProperty(invalidConfig, "y", "title.text")
                    ).toBeUndefined();
                }
            );
        });

        describe("Chart.js scale type compatibility", () => {
            test.prop([
                fc.record({
                    scales: fc.record({
                        x: fc.record({
                            type: fc.oneof(
                                fc.constant("linear"),
                                fc.constant("logarithmic"),
                                fc.constant("category"),
                                fc.constant("time"),
                                fc.constant("timeseries"),
                                fc.constant("radialLinear")
                            ),
                            position: fc.oneof(
                                fc.constant("top"),
                                fc.constant("bottom"),
                                fc.constant("left"),
                                fc.constant("right")
                            ),
                            grid: fc.record({
                                display: fc.boolean(),
                                color: fc.string(),
                                lineWidth: fc.integer({ min: 1, max: 5 }),
                            }),
                            ticks: fc.record({
                                callback: fc.constantFrom(
                                    (value: number) => `${value}`,
                                    (value: number) => `$${value}`,
                                    (value: number) => `${value}%`
                                ),
                                color: fc.string(),
                                font: fc.record({
                                    family: fc.string(),
                                    size: fc.integer({ min: 8, max: 24 }),
                                    weight: fc.oneof(
                                        fc.constant("normal"),
                                        fc.constant("bold")
                                    ),
                                }),
                            }),
                        }),
                        y: fc.record({
                            type: fc.oneof(
                                fc.constant("linear"),
                                fc.constant("logarithmic")
                            ),
                            beginAtZero: fc.boolean(),
                            min: fc.option(fc.float({ min: -100, max: 0 })),
                            max: fc.option(fc.float({ min: 100, max: 1000 })),
                            stacked: fc.boolean(),
                        }),
                    }),
                }),
            ])("should handle realistic Chart.js configurations", (config) => {
                // Property: Should handle complex Chart.js scale configurations
                expect(hasScales(config)).toBeTruthy();

                const xScale = getScaleConfig(config, "x");
                const yScale = getScaleConfig(config, "y");

                expect(xScale).toBeDefined();
                expect(yScale).toBeDefined();

                // Property: Scale types should be preserved
                expect(getScaleProperty(config, "x", "type")).toBe(
                    config.scales.x.type
                );
                expect(getScaleProperty(config, "y", "type")).toBe(
                    config.scales.y.type
                );

                // Property: Complex nested properties should be accessible
                expect(
                    getNestedScaleProperty(config, "x", "grid.display")
                ).toBe(config.scales.x.grid.display);
                expect(getNestedScaleProperty(config, "x", "ticks.color")).toBe(
                    config.scales.x.ticks.color
                );
                expect(
                    getNestedScaleProperty(config, "x", "ticks.font.family")
                ).toBe(config.scales.x.ticks.font.family);

                // Property: Functions should be preserved
                const callbackFn = getNestedScaleProperty(
                    config,
                    "x",
                    "ticks.callback"
                );
                expect(typeof callbackFn).toBe("function");

                // Property: Optional properties should be handled correctly
                const yMin = getScaleProperty(config, "y", "min");
                const yMax = getScaleProperty(config, "y", "max");

                if (config.scales.y.min !== undefined) {
                    expect(yMin).toBe(config.scales.y.min);
                }
                if (config.scales.y.max !== undefined) {
                    expect(yMax).toBe(config.scales.y.max);
                }
            });
        });
    });
});
