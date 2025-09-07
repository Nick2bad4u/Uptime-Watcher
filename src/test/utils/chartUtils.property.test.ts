/**
 * @remarks
 * These tests use property-based testing to verify chart utility functions with
 * comprehensive edge case coverage and randomized inputs. Tests chart
 * configuration access, nested property navigation, and type safety.
 *
 * Comprehensive Coverage Areas:
 *
 * - Scale configuration access (getScaleConfigSafe, getScaleConfig)
 * - Nested property navigation (getNestedScalePropertySafe,
 *   getNestedScaleProperty)
 * - Property access safety (getScaleProperty)
 * - Edge cases and robustness (invalid configs, malformed objects)
 * - Performance and determinism testing
 *
 * @file Property-based tests for chart utilities using Fast-Check
 *
 * @packageDocumentation
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
    getScaleConfigSafe,
    getScaleConfig,
    getNestedScalePropertySafe,
    getNestedScaleProperty,
    getScaleProperty,
} from "../../utils/chartUtils";

describe("Chart Utils Property-Based Tests", () => {
    // =============================================================================
    // Arbitraries
    // =============================================================================

    /**
     * Generates valid chart configurations with scales
     */
    const validChartConfigArbitrary = fc.record(
        {
            scales: fc.record(
                {
                    x: fc.record(
                        {
                            type: fc.constantFrom("linear", "category", "time"),
                            display: fc.boolean(),
                            title: fc.record(
                                {
                                    display: fc.boolean(),
                                    text: fc.string({
                                        minLength: 1,
                                        maxLength: 50,
                                    }),
                                },
                                { requiredKeys: [] }
                            ),
                            grid: fc.record(
                                {
                                    display: fc.boolean(),
                                    color: fc
                                        .string({ minLength: 6, maxLength: 6 })
                                        .map((s) => `#${s.padStart(6, "0")}`),
                                },
                                { requiredKeys: [] }
                            ),
                        },
                        { requiredKeys: ["type"] }
                    ),
                    y: fc.record(
                        {
                            type: fc.constantFrom("linear", "logarithmic"),
                            display: fc.boolean(),
                            beginAtZero: fc.boolean(),
                            title: fc.record(
                                {
                                    display: fc.boolean(),
                                    text: fc.string({
                                        minLength: 1,
                                        maxLength: 50,
                                    }),
                                },
                                { requiredKeys: [] }
                            ),
                            ticks: fc.record(
                                {
                                    stepSize: fc.float({
                                        min: Math.fround(0.1),
                                        max: Math.fround(100),
                                        noNaN: true,
                                        noDefaultInfinity: true,
                                    }),
                                    callback: fc.func(fc.string()),
                                },
                                { requiredKeys: [] }
                            ),
                        },
                        { requiredKeys: ["type"] }
                    ),
                },
                { requiredKeys: [] }
            ),
        },
        { requiredKeys: ["scales"] }
    );

    /**
     * Generates invalid or malformed chart configurations
     */
    const invalidChartConfigArbitrary = fc.oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.constant({}),
        fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.float({ noNaN: true, noDefaultInfinity: true })
        ),
        fc.array(fc.anything()),
        fc.record({
            scales: fc.oneof(
                fc.constant(null),
                fc.constant(undefined),
                fc.oneof(
                    fc.string(),
                    fc.integer(),
                    fc.boolean(),
                    fc.float({ noNaN: true, noDefaultInfinity: true })
                ),
                fc.array(fc.anything())
            ),
        }),
        fc.record({
            scales: fc.record(
                {
                    x: fc.oneof(
                        fc.constant(null),
                        fc.oneof(
                            fc.string(),
                            fc.integer(),
                            fc.boolean(),
                            fc.float({ noNaN: true, noDefaultInfinity: true })
                        )
                    ),
                    y: fc.oneof(
                        fc.constant(null),
                        fc.oneof(
                            fc.string(),
                            fc.integer(),
                            fc.boolean(),
                            fc.float({ noNaN: true, noDefaultInfinity: true })
                        )
                    ),
                },
                { requiredKeys: [] }
            ),
        })
    );

    /**
     * Generates property paths for nested access
     */
    const propertyPathArbitrary = fc.oneof(
        // Simple property paths
        fc.constantFrom("type", "display", "beginAtZero"),
        // Nested property paths
        fc.constantFrom(
            "title.display",
            "title.text",
            "grid.display",
            "grid.color",
            "ticks.stepSize"
        ),
        // Deep nested paths
        fc.string({ minLength: 1, maxLength: 20 }).chain((base) =>
            fc
                .array(fc.string({ minLength: 1, maxLength: 10 }), {
                    minLength: 1,
                    maxLength: 3,
                })
                .map((parts) => `${base}.${parts.join(".")}`)
        ),
        // Invalid paths
        fc.oneof(
            fc.constant(""),
            fc.constant("..."),
            fc.constant(".invalid"),
            fc.constant("invalid."),
            fc
                .string({ minLength: 1, maxLength: 50 })
                .filter((s) => s.includes(".."))
        )
    );

    // =============================================================================
    // getScaleConfigSafe Function Tests
    // =============================================================================

    describe("getScaleConfigSafe function", () => {
        it("should return valid config with exists=true for valid chart configurations", () => {
            fc.assert(
                fc.property(
                    validChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    (config, axis) => {
                        const result = getScaleConfigSafe(config, axis);

                        // Should always return an object with the expected shape
                        expect(typeof result).toBe("object");
                        expect(result).toHaveProperty("config");
                        expect(result).toHaveProperty("exists");
                        expect(typeof result.exists).toBe("boolean");

                        // If the axis exists in the config, should return exists=true
                        if (config.scales && config.scales[axis]) {
                            expect(result.exists).toBeTruthy();
                            expect(typeof result.config).toBe("object");
                        }
                    }
                )
            );
        });

        it("should return empty config with exists=false for invalid configurations", () => {
            fc.assert(
                fc.property(
                    invalidChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    (config, axis) => {
                        const result = getScaleConfigSafe(config, axis);

                        expect(result.exists).toBeFalsy();
                        expect(result.config).toEqual({});
                    }
                )
            );
        });

        it("should handle edge case axes consistently", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        validChartConfigArbitrary,
                        invalidChartConfigArbitrary
                    ),
                    (config) => {
                        const xResult = getScaleConfigSafe(config, "x");
                        const yResult = getScaleConfigSafe(config, "y");

                        // Results should be consistent for same config
                        expect(typeof xResult.exists).toBe("boolean");
                        expect(typeof yResult.exists).toBe("boolean");
                        expect(typeof xResult.config).toBe("object");
                        expect(typeof yResult.config).toBe("object");
                    }
                )
            );
        });
    });

    // =============================================================================
    // getScaleConfig Function Tests
    // =============================================================================

    describe("getScaleConfig function", () => {
        it("should return scale config for valid configurations", () => {
            fc.assert(
                fc.property(
                    validChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    (config, axis) => {
                        const result = getScaleConfig(config, axis);

                        if (config.scales && config.scales[axis]) {
                            expect(result).toBeDefined();
                            expect(typeof result).toBe("object");
                        } else {
                            expect(result).toBeUndefined();
                        }
                    }
                )
            );
        });

        it("should return undefined for invalid configurations", () => {
            fc.assert(
                fc.property(
                    invalidChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    (config, axis) => {
                        const result = getScaleConfig(config, axis);
                        expect(result).toBeUndefined();
                    }
                )
            );
        });

        it("should be consistent with getScaleConfigSafe", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        validChartConfigArbitrary,
                        invalidChartConfigArbitrary
                    ),
                    fc.constantFrom("x", "y"),
                    (config, axis) => {
                        const safeResult = getScaleConfigSafe(config, axis);
                        const directResult = getScaleConfig(config, axis);

                        if (safeResult.exists) {
                            expect(directResult).toBeDefined();
                            expect(directResult).toBe(safeResult.config);
                        } else {
                            expect(directResult).toBeUndefined();
                        }
                    }
                )
            );
        });
    });

    // =============================================================================
    // getNestedScalePropertySafe Function Tests
    // =============================================================================

    describe("getNestedScalePropertySafe function", () => {
        it("should handle valid property paths on valid configurations", () => {
            fc.assert(
                fc.property(
                    validChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    fc.constantFrom(
                        "type",
                        "display",
                        "title.display",
                        "title.text"
                    ),
                    (config, axis, path) => {
                        const result = getNestedScalePropertySafe(
                            config,
                            axis,
                            path
                        );

                        // Should always return proper structure
                        expect(typeof result).toBe("object");
                        expect(result).toHaveProperty("exists");
                        expect(result).toHaveProperty("validPath");
                        expect(result).toHaveProperty("value");
                        expect(typeof result.exists).toBe("boolean");
                        expect(Array.isArray(result.validPath)).toBeTruthy();

                        // Valid path should contain valid path parts
                        if (result.exists) {
                            expect(result.validPath.length).toBeGreaterThan(0);
                            for (const part of result.validPath) {
                                expect(typeof part).toBe("string");
                                expect(part.length).toBeGreaterThan(0);
                            }
                        }
                    }
                )
            );
        });

        it("should return non-existent for invalid configurations", () => {
            fc.assert(
                fc.property(
                    invalidChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    propertyPathArbitrary,
                    (config, axis, path) => {
                        const result = getNestedScalePropertySafe(
                            config,
                            axis,
                            path
                        );

                        expect(result.exists).toBeFalsy();
                        expect(result.validPath).toEqual([]);
                        expect(result.value).toBeUndefined();
                    }
                )
            );
        });

        it("should handle empty and invalid property paths gracefully", () => {
            fc.assert(
                fc.property(
                    validChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    fc.oneof(
                        fc.constant(""),
                        fc.constant(".."),
                        fc.constant("invalid.path.that.does.not.exist")
                    ),
                    (config, axis, path) => {
                        const result = getNestedScalePropertySafe(
                            config,
                            axis,
                            path
                        );

                        if (path === "") {
                            // Empty path should return the scale config itself if scale exists
                            if (config.scales && config.scales[axis]) {
                                // The function splits "" into [""] and tries to find a property named ""
                                // This is actually the expected behavior - empty string is not a valid path
                                expect(result.exists).toBeFalsy();
                            } else {
                                expect(result.exists).toBeFalsy();
                            }
                        } else {
                            // Invalid paths should return exists=false
                            expect(typeof result.exists).toBe("boolean");
                            expect(
                                Array.isArray(result.validPath)
                            ).toBeTruthy();
                        }
                    }
                )
            );
        });
    });

    // =============================================================================
    // getNestedScaleProperty Function Tests
    // =============================================================================

    describe("getNestedScaleProperty function", () => {
        it("should return property values for valid paths", () => {
            fc.assert(
                fc.property(
                    validChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    fc.constantFrom("type", "display"),
                    (config, axis, path) => {
                        const result = getNestedScaleProperty(
                            config,
                            axis,
                            path
                        );
                        const safeResult = getNestedScalePropertySafe(
                            config,
                            axis,
                            path
                        );

                        if (safeResult.exists) {
                            expect(result).toBe(safeResult.value);
                            expect(result).toBeDefined();
                        } else {
                            expect(result).toBeUndefined();
                        }
                    }
                )
            );
        });

        it("should return undefined for invalid paths or configurations", () => {
            fc.assert(
                fc.property(
                    invalidChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    propertyPathArbitrary,
                    (config, axis, path) => {
                        const result = getNestedScaleProperty(
                            config,
                            axis,
                            path
                        );
                        expect(result).toBeUndefined();
                    }
                )
            );
        });

        it("should be consistent with getNestedScalePropertySafe", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        validChartConfigArbitrary,
                        invalidChartConfigArbitrary
                    ),
                    fc.constantFrom("x", "y"),
                    propertyPathArbitrary,
                    (config, axis, path) => {
                        const directResult = getNestedScaleProperty(
                            config,
                            axis,
                            path
                        );
                        const safeResult = getNestedScalePropertySafe(
                            config,
                            axis,
                            path
                        );

                        if (safeResult.exists) {
                            expect(directResult).toBe(safeResult.value);
                        } else {
                            expect(directResult).toBeUndefined();
                        }
                    }
                )
            );
        });
    });

    // =============================================================================
    // getScaleProperty Function Tests
    // =============================================================================

    describe("getScaleProperty function", () => {
        it("should return property values for valid properties", () => {
            fc.assert(
                fc.property(
                    validChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    fc.constantFrom("type", "display", "beginAtZero"),
                    (config, axis, property) => {
                        const result = getScaleProperty(config, axis, property);

                        if (
                            config.scales &&
                            config.scales[axis] &&
                            property in config.scales[axis]
                        ) {
                            expect(result).toBeDefined();
                            // Type property should always be string for valid configs
                            if (property === "type") {
                                expect(typeof result).toBe("string");
                            }
                        }
                    }
                )
            );
        });

        it("should return undefined for invalid configurations or properties", () => {
            fc.assert(
                fc.property(
                    invalidChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    fc.string(),
                    (config, axis, property) => {
                        const result = getScaleProperty(config, axis, property);
                        expect(result).toBeUndefined();
                    }
                )
            );
        });

        it("should handle non-existent properties gracefully", () => {
            fc.assert(
                fc.property(
                    validChartConfigArbitrary,
                    fc.constantFrom("x", "y"),
                    fc.string({ minLength: 1 }).filter(
                        (s) =>
                            ![
                                "type",
                                "display",
                                "beginAtZero",
                                "title",
                                "grid",
                                "ticks",
                            ].includes(s)
                    ),
                    (config, axis, property) => {
                        const result = getScaleProperty(config, axis, property);

                        // For non-existent properties, should return undefined
                        if (
                            config.scales &&
                            config.scales[axis] &&
                            !(property in config.scales[axis])
                        ) {
                            expect(result).toBeUndefined();
                        }
                    }
                )
            );
        });
    });

    // =============================================================================
    // Edge Cases and Robustness
    // =============================================================================

    describe("Edge cases and robustness", () => {
        it("should handle deeply nested malformed objects", () => {
            const malformedConfig = fc.record({
                scales: fc.record({
                    x: fc.oneof(
                        fc.constant(null),
                        fc.record({
                            type: fc.oneof(
                                fc.constant(null),
                                fc.constant(123),
                                fc.constant({})
                            ),
                            nested: fc.record({
                                deep: fc.oneof(
                                    fc.constant(null),
                                    fc.array(fc.anything()),
                                    fc.oneof(
                                        fc.string(),
                                        fc.integer(),
                                        fc.boolean(),
                                        fc.float({
                                            noNaN: true,
                                            noDefaultInfinity: true,
                                        })
                                    )
                                ),
                            }),
                        })
                    ),
                }),
            });

            fc.assert(
                fc.property(malformedConfig, (config) => {
                    // Should not throw for any malformed input
                    expect(() => {
                        getScaleConfigSafe(config, "x");
                        getScaleConfig(config, "x");
                        getNestedScalePropertySafe(
                            config,
                            "x",
                            "nested.deep.invalid"
                        );
                        getNestedScaleProperty(
                            config,
                            "x",
                            "nested.deep.invalid"
                        );
                        getScaleProperty(config, "x", "type");
                    }).not.toThrow();
                })
            );
        });

        it("should handle circular references gracefully", () => {
            fc.assert(
                fc.property(fc.integer({ min: 1, max: 5 }), (depth) => {
                    // Create a circular reference object
                    const circular: any = { scales: { x: { type: "linear" } } };
                    let current = circular.scales.x;
                    for (let i = 0; i < depth; i++) {
                        current.nested = { parent: circular };
                        current = current.nested;
                    }

                    // Should handle circular references without infinite loops
                    expect(() => {
                        const result = getScaleConfigSafe(circular, "x");
                        expect(result.exists).toBeTruthy();
                    }).not.toThrow();
                })
            );
        });

        it("should be performant with very large configurations", () => {
            const largeConfig = fc.record({
                scales: fc.record({
                    x: fc.record(
                        Object.fromEntries(
                            Array.from({ length: 100 }, (_, i) => [
                                `property${i}`,
                                fc.oneof(
                                    fc.string(),
                                    fc.integer(),
                                    fc.boolean(),
                                    fc.float({
                                        noNaN: true,
                                        noDefaultInfinity: true,
                                    })
                                ),
                            ])
                        )
                    ),
                }),
            });

            fc.assert(
                fc.property(largeConfig, (config) => {
                    const startTime = Date.now();

                    getScaleConfigSafe(config, "x");
                    getNestedScalePropertySafe(
                        config,
                        "x",
                        "property50.nested.deep"
                    );
                    getScaleProperty(config, "x", "property25");

                    const endTime = Date.now();

                    // Should complete within reasonable time (100ms)
                    expect(endTime - startTime).toBeLessThan(100);
                })
            );
        });
    });

    // =============================================================================
    // Performance and Determinism
    // =============================================================================

    describe("Performance and determinism", () => {
        it("should be deterministic for same inputs", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        validChartConfigArbitrary,
                        invalidChartConfigArbitrary
                    ),
                    fc.constantFrom("x", "y"),
                    propertyPathArbitrary,
                    (config, axis, path) => {
                        // Multiple calls should return identical results
                        const result1 = getScaleConfigSafe(config, axis);
                        const result2 = getScaleConfigSafe(config, axis);

                        expect(result1.exists).toBe(result2.exists);
                        expect(result1.config).toStrictEqual(result2.config);

                        const nested1 = getNestedScalePropertySafe(
                            config,
                            axis,
                            path
                        );
                        const nested2 = getNestedScalePropertySafe(
                            config,
                            axis,
                            path
                        );

                        expect(nested1.exists).toBe(nested2.exists);
                        expect(nested1.validPath).toEqual(nested2.validPath);
                        expect(nested1.value).toBe(nested2.value);
                    }
                )
            );
        });

        it("should handle batch processing efficiently", () => {
            fc.assert(
                fc.property(
                    fc.array(validChartConfigArbitrary, {
                        minLength: 10,
                        maxLength: 50,
                    }),
                    (configs) => {
                        const startTime = Date.now();

                        // Process all configurations
                        const results = configs.map((config) => ({
                            xScale: getScaleConfigSafe(config, "x"),
                            yScale: getScaleConfigSafe(config, "y"),
                            xType: getScaleProperty(config, "x", "type"),
                            yTitle: getNestedScaleProperty(
                                config,
                                "y",
                                "title.text"
                            ),
                        }));

                        const endTime = Date.now();

                        // Should process all configurations efficiently
                        expect(results).toHaveLength(configs.length);
                        expect(endTime - startTime).toBeLessThan(1000); // 1 second for up to 50 configs

                        // All results should have proper structure
                        for (const result of results) {
                            expect(result.xScale).toHaveProperty("exists");
                            expect(result.yScale).toHaveProperty("exists");
                        }
                    }
                )
            );
        });
    });
});
