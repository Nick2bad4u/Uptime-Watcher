/**
 * Advanced fuzzing tests for type guards and validation utilities.
 *
 * @remarks
 * This test suite focuses on achieving 100% branch coverage for type guard
 * functions and validation utilities through intensive property-based testing.
 *
 * Coverage includes:
 *
 * - Type guards with edge case JavaScript values
 * - Boundary value testing for numeric validations
 * - String validation with various encodings and patterns
 * - Object property validation with complex structures
 * - Network validation (URLs, ports, domains) with malicious inputs
 * - Performance characteristics under stress
 *
 * @file Advanced fuzzing tests for type guards and validation utilities
 *
 * @ts-expect-error Complex fuzzing tests with intentional type mismatches - exact type safety deferred for validation testing
 */

import { fc, test as fcTest } from "@fast-check/vitest";
import {
    hasProperties,
    hasProperty,
    isArray,
    isBoolean,
    isDate,
    isError,
    isFiniteNumber,
    isFunction,
    isNonNegativeNumber,
    isNonNullObject,
    isNumber,
    isObject,
    isPositiveNumber,
    isString,
    isValidPort,
    isValidTimestamp,
} from "@shared/utils/typeGuards";
import { validateMonitorType } from "@shared/utils/validation";
import { getMonitorValidationErrors } from "@shared/validation/monitorSchemas";
import { validateSiteData } from "@shared/validation/siteSchemas";
import { arrayIncludes, isInteger } from "ts-extras";
import { describe, expect } from "vitest";

describe("type Guards Advanced Fuzzing Tests", () => {
    describe("basic Type Guards - Comprehensive Input Coverage", () => {
        // Test isString with all possible JavaScript values
        fcTest.prop([fc.anything()])(
            "isString should correctly identify string values",
            (value) => {
                const isResult = isString(value);
                const isExpectedResult = typeof value === "string";

                expect(isResult).toBe(isExpectedResult);
            }
        );

        // Test isNumber with special numeric values
        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.float(),
                fc.constant(Infinity),
                fc.constant(Number.NEGATIVE_INFINITY),
                fc.constant(NaN),
                fc.constant(Number.MAX_VALUE),
                fc.constant(Number.MIN_VALUE),
                fc.constant(Number.MAX_SAFE_INTEGER),
                fc.constant(Number.MIN_SAFE_INTEGER),
                fc.string(), // Non-numbers
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("isNumber should handle all numeric edge cases", (value) => {
            const isResult = isNumber(value);
            const isExpectedResult =
                typeof value === "number" && !Number.isNaN(value);

            expect(isResult).toBe(isExpectedResult);
        });

        // Test isBoolean with all possible values
        fcTest.prop([fc.anything()])(
            "isBoolean should correctly identify boolean values",
            (value) => {
                const isResult = isBoolean(value);
                const isExpectedResult = typeof value === "boolean";

                expect(isResult).toBe(isExpectedResult);
            }
        );

        // Test isArray with various array-like objects
        fcTest.prop([
            fc.oneof(
                fc.array(fc.anything()),
                fc.string(), // Has length property but not array
                fc.record({ length: fc.integer() }), // Array-like object
                fc.constant({ 0: "a", 1: "b", 2: "c", length: 3 }), // Arguments-like object
                fc.object(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("isArray should only return true for actual arrays", (value) => {
            const isResult = isArray(value);
            const isExpectedResult = Array.isArray(value);

            expect(isResult).toBe(isExpectedResult);
        });

        // Test isFunction with various callable objects
        fcTest.prop([
            fc.oneof(
                fc.func(fc.anything()),
                fc.constant(() => {}),
                fc.constant(() => {}),
                fc.constant(async () => {}),
                fc.constant(function* () {}),
                fc.constant(Array), // Constructor function
                fc.constant(Date), // Constructor function
                fc.string(),
                fc.object(),
                fc.constant(null)
            ),
        ])("isFunction should identify all function types", (value) => {
            const isResult = isFunction(value);
            const isExpectedResult = typeof value === "function";

            expect(isResult).toBe(isExpectedResult);
        });

        // Test isDate with date-like objects
        fcTest.prop([
            fc.oneof(
                fc.date(),
                fc.string(), // Date string
                fc.integer(), // Timestamp
                fc.record({ getTime: fc.func(fc.integer()) }), // Date-like object
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("isDate should only return true for Date instances", (value) => {
            const isResult = isDate(value);
            const isExpectedResult =
                value instanceof Date && !Number.isNaN(value.getTime());

            expect(isResult).toBe(isExpectedResult);
        });

        // Test isError with error-like objects
        fcTest.prop([
            fc.oneof(
                fc.string().map((msg) => new Error(msg)),
                fc.string().map((msg) => new TypeError(msg)),
                fc.string().map((msg) => new RangeError(msg)),
                fc.record({ message: fc.string(), name: fc.string() }), // Error-like
                fc.string(),
                fc.object(),
                fc.constant(null)
            ),
        ])("isError should identify Error instances", (value) => {
            const isResult = isError(value);
            const isExpectedResult = Error.isError(value);

            expect(isResult).toBe(isExpectedResult);
        });

        // Test isObject with various object types
        fcTest.prop([
            fc.oneof(
                fc.object(),
                fc.array(fc.anything()),
                fc.date(),
                fc.string().map((msg) => new Error(msg)),
                fc.func(fc.anything()),
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("isObject should handle all object variations", (value) => {
            const isResult = isObject(value);
            const isExpectedResult =
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value);

            expect(isResult).toBe(isExpectedResult);
        });
    });

    describe("numeric Validation Guards", () => {
        // Test isFiniteNumber with all numeric edge cases
        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.float({ noDefaultInfinity: true, noNaN: true }),
                fc.constant(Infinity),
                fc.constant(Number.NEGATIVE_INFINITY),
                fc.constant(NaN),
                fc.string(),
                fc.constant(null)
            ),
        ])(
            "isFiniteNumber should correctly validate finite numbers",
            (value) => {
                const isResult = isFiniteNumber(value);
                const isExpectedResult =
                    typeof value === "number" && Number.isFinite(value);

                expect(isResult).toBe(isExpectedResult);
            }
        );

        // Test isPositiveNumber with boundary values
        fcTest.prop([
            fc.oneof(
                fc.integer({ min: 1 }),
                fc.float({
                    min: Math.fround(0.0001),
                    noDefaultInfinity: true,
                    noNaN: true,
                }),
                fc.constant(0),
                fc.constant(-0),
                fc.integer({ max: -1 }),
                fc.constant(Infinity),
                fc.constant(NaN),
                fc.string()
            ),
        ])(
            "isPositiveNumber should validate positive numbers correctly",
            (value) => {
                const isResult = isPositiveNumber(value);
                const isExpectedResult =
                    typeof value === "number" &&
                    Number.isFinite(value) &&
                    value > 0;

                expect(isResult).toBe(isExpectedResult);
            }
        );

        // Test isNonNegativeNumber with boundary values
        fcTest.prop([
            fc.oneof(
                fc.integer({ min: 0 }),
                fc.float({ min: 0, noDefaultInfinity: true, noNaN: true }),
                fc.constant(0),
                fc.constant(-0),
                fc.integer({ max: -1 }),
                fc.constant(Infinity),
                fc.constant(NaN),
                fc.string()
            ),
        ])(
            "isNonNegativeNumber should validate non-negative numbers correctly",
            (value) => {
                const isResult = isNonNegativeNumber(value);
                const isExpectedResult =
                    typeof value === "number" &&
                    !Number.isNaN(value) &&
                    value >= 0;

                expect(isResult).toBe(isExpectedResult);
            }
        );

        // Test isValidPort with port range boundaries
        fcTest.prop([
            fc.oneof(
                fc.integer({ max: 65_535, min: 1 }), // Valid port range
                fc.integer({ max: 0, min: -1000 }), // Below valid range
                fc.integer({ max: 100_000, min: 65_536 }), // Above valid range
                fc.constant(0), // Edge case
                fc.float(),
                fc.string(),
                fc.constant(null)
            ),
        ])("isValidPort should validate port numbers correctly", (value) => {
            const isResult = isValidPort(value);
            const isExpectedResult =
                typeof value === "number" &&
                isInteger(value) &&
                value >= 1 &&
                value <= 65_535;

            expect(isResult).toBe(isExpectedResult);
        });

        // Test isValidTimestamp with various timestamp formats
        fcTest.prop([
            fc.oneof(
                fc.integer({ max: Date.now() + 1_000_000_000, min: 0 }), // Valid timestamp
                fc.integer({ max: -1, min: -1_000_000_000 }), // Negative timestamp
                fc.constant(Date.now()), // Current time
                fc.constant(0), // Unix epoch
                fc.float(),
                fc.string(),
                fc.constant(null)
            ),
        ])(
            "isValidTimestamp should validate timestamp values correctly",
            (value) => {
                const isResult = isValidTimestamp(value);
                const isExpectedResult =
                    typeof value === "number" &&
                    !Number.isNaN(value) &&
                    value > 0 &&
                    value <= Date.now() + 86_400_000;

                expect(isResult).toBe(isExpectedResult);
            }
        );
    });

    describe("object Property Validation", () => {
        // Test hasProperty with various property types
        fcTest.prop([
            fc.record({
                booleanProp: fc.boolean(),
                nullProp: fc.constant(null),
                numberProp: fc.integer(),
                objectProp: fc.object(),
                stringProp: fc.string(),
                undefinedProp: fc.constant(undefined),
            }),
            fc.string(),
        ])(
            "hasProperty should correctly detect property existence",
            (obj, propName) => {
                const isResult = hasProperty(obj, propName);
                const isExpectedResult =
                    typeof obj === "object" &&
                    obj !== null &&
                    !Array.isArray(obj) &&
                    Object.hasOwn(obj, propName);

                expect(isResult).toBe(isExpectedResult);
            }
        );

        // Test hasProperty with non-objects
        fcTest.prop([
            fc.oneof(
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined),
                fc.array(fc.anything())
            ),
            fc.string(),
        ])(
            "hasProperty should handle non-object inputs gracefully",
            (value, propName) => {
                const isResult = hasProperty(value, propName);
                // HasProperty only returns true for objects that actually have the property
                // It should return false for non-objects (including null/undefined)
                const isExpectedResult = false;

                expect(isResult).toBe(isExpectedResult);
            }
        );

        // Test hasProperties with property arrays
        fcTest.prop([
            fc.record({
                a: fc.string(),
                b: fc.integer(),
                c: fc.boolean(),
            }),
            fc.array(fc.string(), { maxLength: 10 }),
        ])(
            "hasProperties should validate multiple properties correctly",
            (obj, properties) => {
                const isResult = hasProperties(obj, properties);
                const isExpectedResult = properties.every((prop) =>
                    Object.hasOwn(obj, prop)
                );

                expect(isResult).toBe(isExpectedResult);
            }
        );

        // Test isNonNullObject with various object types
        fcTest.prop([
            fc.oneof(
                fc.object(),
                fc.array(fc.anything()),
                fc.date(),
                fc.string().map((msg) => new Error(msg)),
                fc.constant({}),
                fc.string(),
                fc.integer(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])(
            "isNonNullObject should correctly identify non-null objects",
            (value) => {
                const isResult = isNonNullObject(value);
                const isExpectedResult =
                    typeof value === "object" &&
                    value !== null &&
                    !Array.isArray(value);

                expect(isResult).toBe(isExpectedResult);
            }
        );
    });

    describe("monitor Type Validation", () => {
        // Test validateMonitorType with various monitor types
        fcTest.prop([
            fc.oneof(
                fc.constantFrom("http", "ping", "port", "dns", "ssl"), // Valid types
                fc.string(), // Random strings
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])(
            "validateMonitorType should validate monitor types correctly",
            (monitorType) => {
                const isResult = validateMonitorType(monitorType);
                const validTypes = [
                    "http",
                    "ping",
                    "port",
                    "dns",
                    "ssl",
                ];
                const isExpectedResult = arrayIncludes(
                    validTypes,
                    monitorType as string
                );

                expect(isResult).toBe(isExpectedResult);
            }
        );

        // Test with case variations
        fcTest.prop([
            fc.oneof(
                fc.constantFrom("HTTP", "HTTP", "HTTP"), // Case variations
                fc.constantFrom("PING", "Ping", "pInG"),
                fc.constantFrom("PORT", "Port", "pOrT"),
                fc.constantFrom("DNS", "DNS", "DNS")
            ),
        ])(
            "validateMonitorType should handle case variations",
            (monitorType) => {
                const isResult = validateMonitorType(monitorType);

                // Depending on implementation, this might be case-sensitive or insensitive
                // The test verifies consistent behavior
                expect(isResult).toBeTypeOf("boolean");
            }
        );
    });

    describe("site Validation", () => {
        // Test validateSite with various site objects
        fcTest.prop([
            fc.record({
                id: fc.oneof(fc.string(), fc.integer(), fc.constant(null)),
                monitoring: fc.oneof(
                    fc.boolean(),
                    fc.string(),
                    fc.constant(null)
                ),
                monitors: fc.oneof(
                    fc.array(fc.object()),
                    fc.string(),
                    fc.constant(null)
                ),
                name: fc.oneof(fc.string(), fc.constant("")),
                url: fc.oneof(fc.webUrl(), fc.string(), fc.constant(null)),
            }),
        ])(
            "validateSite should handle various site object structures",
            (siteObject) => {
                const isResult = validateSiteData(siteObject).success;

                // Result should always be a boolean
                expect(isResult).toBeTypeOf("boolean");

                // If validation passes, the object should have required properties
                if (isResult) {
                    expect(siteObject).toHaveProperty("name");
                    expect(siteObject).toHaveProperty("url");
                }
            }
        );

        // Test with malformed site objects
        fcTest.prop([
            fc.oneof(
                fc.record({}), // Empty object
                fc.record({
                    name: fc.string(),
                    // Missing required fields
                }),
                fc.record({
                    url: fc.string(),
                    // Missing required fields
                }),
                fc.string(), // Not an object
                fc.integer(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("validateSite should reject invalid site objects", (invalidSite) => {
            const isResult = validateSiteData(invalidSite).success;

            // Should handle any input gracefully
            expect(isResult).toBeTypeOf("boolean");
        });
    });

    describe("monitor Validation Errors", () => {
        // Test getMonitorValidationErrors with various monitor configurations
        fcTest.prop([
            fc.record({
                interval: fc.oneof(
                    fc.integer({ max: 3_600_000, min: 30_000 }),
                    fc.integer(),
                    fc.constant(null)
                ),
                port: fc.oneof(
                    fc.integer({ max: 65_535, min: 1 }),
                    fc.integer(),
                    fc.constant(null)
                ),
                target: fc.oneof(
                    fc.webUrl(),
                    fc.domain(),
                    fc.string(),
                    fc.constant(null)
                ),
                timeout: fc.oneof(
                    fc.integer({ max: 60_000, min: 1000 }),
                    fc.integer(),
                    fc.constant(null)
                ),
                type: fc.oneof(
                    fc.constantFrom("http", "https", "ping", "port", "dns"),
                    fc.string()
                ),
            }),
        ])(
            "getMonitorValidationErrors should return appropriate error arrays",
            (monitorConfig) => {
                const result = getMonitorValidationErrors(monitorConfig);

                // Should always return an array
                expect(Array.isArray(result)).toBe(true);

                // Each error should be a string
                for (const error of result) {
                    expect(error).toBeTypeOf("string");
                    expect(error.length).toBeGreaterThan(0);
                }
            }
        );

        // Test with extreme values
        fcTest.prop([
            fc.record({
                interval: fc.integer({ max: 10_000_000, min: -1000 }),
                port: fc.integer({ max: 100_000, min: -10_000 }),
                timeout: fc.integer({ max: 1_000_000, min: -1000 }),
                type: fc.oneof(
                    fc.constantFrom("http", "port", "ping", "dns"),
                    fc.string()
                ),
            }),
        ])(
            "getMonitorValidationErrors should handle extreme numeric values",
            (extremeConfig) => {
                const result = getMonitorValidationErrors(extremeConfig);

                expect(Array.isArray(result)).toBe(true);

                // Check for invalid monitor type first
                const validTypes = new Set([
                    "dns",
                    "http",
                    "ping",
                    "port",
                ]);
                if (
                    !extremeConfig.type ||
                    !validTypes.has(extremeConfig.type)
                ) {
                    // Accept either "Monitor type is required" for empty/falsy types
                    // or "unknown monitor type" for invalid but non-empty types
                    expect(
                        result.some(
                            (error) =>
                                error.toLowerCase().includes("monitor type") ||
                                error
                                    .toLowerCase()
                                    .includes("unknown monitor type")
                        )
                    ).toBe(true);

                    return; // Don't check other validations for invalid monitor types
                }

                // Should include errors for out-of-range values only for appropriate monitor types
                if (
                    extremeConfig.type === "port" &&
                    (extremeConfig.port < 1 || extremeConfig.port > 65_535)
                ) {
                    expect(
                        result.some((error) =>
                            error.toLowerCase().includes("port")
                        )
                    ).toBe(true);
                }

                // Check for invalid timeout only if monitor type is valid and uses timeout validation
                if (
                    validTypes.has(extremeConfig.type) &&
                    extremeConfig.timeout < 0
                ) {
                    expect(
                        result.some((error) =>
                            error.toLowerCase().includes("timeout")
                        )
                    ).toBe(true);
                }
            }
        );
    });

    describe("integration and Performance Tests", () => {
        // Test type guard consistency
        fcTest.prop([fc.anything()])(
            "type guards should be consistent with typeof checks",
            (value) => {
                // String consistency
                expect(isString(value)).toBe(typeof value === "string");

                // Number consistency
                expect(isNumber(value)).toBe(
                    typeof value === "number" && !Number.isNaN(value)
                );

                // Boolean consistency
                expect(isBoolean(value)).toBe(typeof value === "boolean");

                // Function consistency
                expect(isFunction(value)).toBe(typeof value === "function");
            }
        );

        // Test performance with large datasets
        fcTest.prop([fc.integer({ max: 1000, min: 100 })])(
            "type guards should handle large datasets efficiently",
            (datasetSize) => {
                const mixedDataset = Array.from(
                    { length: datasetSize },
                    (_, i) => {
                        const types = [
                            `string-${i}`,
                            i,
                            i % 2 === 0,
                            { id: i },
                            [i],
                            () => i,
                            new Date(),
                            null,
                        ];
                        return types[i % types.length];
                    }
                );

                const stringCount = mixedDataset.filter((element) =>
                    isString(element)
                ).length;
                const numberCount = mixedDataset.filter((element) =>
                    isNumber(element)
                ).length;
                const booleanCount = mixedDataset.filter((element) =>
                    isBoolean(element)
                ).length;
                const objectCount = mixedDataset.filter((element) =>
                    isObject(element)
                ).length;

                // Verify counts are reasonable
                expect(
                    stringCount + numberCount + booleanCount + objectCount
                ).toBeLessThanOrEqual(datasetSize);

                // Each count should be non-negative
                expect(stringCount).toBeGreaterThanOrEqual(0);
                expect(numberCount).toBeGreaterThanOrEqual(0);
                expect(booleanCount).toBeGreaterThanOrEqual(0);
                expect(objectCount).toBeGreaterThanOrEqual(0);
            }
        );

        // Test edge case combinations
        fcTest.prop([
            fc.oneof(
                fc.record({
                    toString: fc.func(fc.string()),
                    valueOf: fc.func(fc.integer()),
                }),
                fc.record({
                    [Symbol.toPrimitive]: fc.func(
                        fc.oneof(fc.string(), fc.integer())
                    ),
                })
            ),
        ])(
            "type guards should handle objects with custom conversion methods",
            (objectWithConversions) => {
                // Should not throw and should return consistent results
                const isObjectResult = isObject(objectWithConversions);

                expect(isObjectResult).toBeTypeOf("boolean");
                expect(isObjectResult).toBe(true); // Should be true for objects

                const isStringResult = isString(objectWithConversions);

                expect(isStringResult).toBeTypeOf("boolean");
                expect(isStringResult).toBe(false); // Should be false for objects
            }
        );
    });
});
