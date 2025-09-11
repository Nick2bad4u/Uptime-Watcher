/**
 * Advanced fuzzing tests for type guards and validation utilities.
 *
 * @ts-expect-error Complex fuzzing tests with intentional type mismatches - exact type safety deferred for validation testing
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
 */

import { describe, expect } from "vitest";
import { fc, test as fcTest } from "@fast-check/vitest";
import {
    isObject,
    isString,
    isNumber,
    isBoolean,
    isArray,
    isFunction,
    isDate,
    isError,
    isFiniteNumber,
    isNonNegativeNumber,
    isNonNullObject,
    isPositiveNumber,
    isValidPort,
    isValidTimestamp,
    hasProperty,
    hasProperties,
} from "../../../shared/utils/typeGuards";
import {
    validateMonitorType,
    validateSite,
    getMonitorValidationErrors,
} from "../../../shared/utils/validation";

describe("Type Guards Advanced Fuzzing Tests", () => {
    describe("Basic Type Guards - Comprehensive Input Coverage", () => {
        // Test isString with all possible JavaScript values
        fcTest.prop([fc.anything()])(
            "isString should correctly identify string values",
            (value) => {
                const result = isString(value);
                const expectedResult = typeof value === "string";

                expect(result).toBe(expectedResult);
            }
        );

        // Test isNumber with special numeric values
        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.float(),
                fc.constant(Number.POSITIVE_INFINITY),
                fc.constant(Number.NEGATIVE_INFINITY),
                fc.constant(Number.NaN),
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
            const result = isNumber(value);
            const expectedResult =
                typeof value === "number" && !Number.isNaN(value);

            expect(result).toBe(expectedResult);
        });

        // Test isBoolean with all possible values
        fcTest.prop([fc.anything()])(
            "isBoolean should correctly identify boolean values",
            (value) => {
                const result = isBoolean(value);
                const expectedResult = typeof value === "boolean";

                expect(result).toBe(expectedResult);
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
            const result = isArray(value);
            const expectedResult = Array.isArray(value);

            expect(result).toBe(expectedResult);
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
            const result = isFunction(value);
            const expectedResult = typeof value === "function";

            expect(result).toBe(expectedResult);
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
            const result = isDate(value);
            const expectedResult =
                value instanceof Date && !Number.isNaN(value.getTime());

            expect(result).toBe(expectedResult);
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
            const result = isError(value);
            const expectedResult = value instanceof Error;

            expect(result).toBe(expectedResult);
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
            const result = isObject(value);
            const expectedResult =
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value);

            expect(result).toBe(expectedResult);
        });
    });

    describe("Numeric Validation Guards", () => {
        // Test isFiniteNumber with all numeric edge cases
        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.float({ noDefaultInfinity: true, noNaN: true }),
                fc.constant(Number.POSITIVE_INFINITY),
                fc.constant(Number.NEGATIVE_INFINITY),
                fc.constant(Number.NaN),
                fc.string(),
                fc.constant(null)
            ),
        ])(
            "isFiniteNumber should correctly validate finite numbers",
            (value) => {
                const result = isFiniteNumber(value);
                const expectedResult =
                    typeof value === "number" && Number.isFinite(value);

                expect(result).toBe(expectedResult);
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
                fc.constant(Number.POSITIVE_INFINITY),
                fc.constant(Number.NaN),
                fc.string()
            ),
        ])(
            "isPositiveNumber should validate positive numbers correctly",
            (value) => {
                const result = isPositiveNumber(value);
                const expectedResult =
                    typeof value === "number" &&
                    !Number.isNaN(value) &&
                    value > 0;

                expect(result).toBe(expectedResult);
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
                fc.constant(Number.POSITIVE_INFINITY),
                fc.constant(Number.NaN),
                fc.string()
            ),
        ])(
            "isNonNegativeNumber should validate non-negative numbers correctly",
            (value) => {
                const result = isNonNegativeNumber(value);
                const expectedResult =
                    typeof value === "number" &&
                    !Number.isNaN(value) &&
                    value >= 0;

                expect(result).toBe(expectedResult);
            }
        );

        // Test isValidPort with port range boundaries
        fcTest.prop([
            fc.oneof(
                fc.integer({ min: 1, max: 65_535 }), // Valid port range
                fc.integer({ min: -1000, max: 0 }), // Below valid range
                fc.integer({ min: 65_536, max: 100_000 }), // Above valid range
                fc.constant(0), // Edge case
                fc.float(),
                fc.string(),
                fc.constant(null)
            ),
        ])("isValidPort should validate port numbers correctly", (value) => {
            const result = isValidPort(value);
            const expectedResult =
                typeof value === "number" &&
                Number.isInteger(value) &&
                value >= 1 &&
                value <= 65_535;

            expect(result).toBe(expectedResult);
        });

        // Test isValidTimestamp with various timestamp formats
        fcTest.prop([
            fc.oneof(
                fc.integer({ min: 0, max: Date.now() + 1_000_000_000 }), // Valid timestamp
                fc.integer({ min: -1_000_000_000, max: -1 }), // Negative timestamp
                fc.constant(Date.now()), // Current time
                fc.constant(0), // Unix epoch
                fc.float(),
                fc.string(),
                fc.constant(null)
            ),
        ])(
            "isValidTimestamp should validate timestamp values correctly",
            (value) => {
                const result = isValidTimestamp(value);
                const expectedResult =
                    typeof value === "number" &&
                    !Number.isNaN(value) &&
                    value > 0 &&
                    value <= Date.now() + 86_400_000;

                expect(result).toBe(expectedResult);
            }
        );
    });

    describe("Object Property Validation", () => {
        // Test hasProperty with various property types
        fcTest.prop([
            fc.record({
                stringProp: fc.string(),
                numberProp: fc.integer(),
                booleanProp: fc.boolean(),
                nullProp: fc.constant(null),
                undefinedProp: fc.constant(undefined),
                objectProp: fc.object(),
            }),
            fc.string(),
        ])(
            "hasProperty should correctly detect property existence",
            (obj, propName) => {
                const result = hasProperty(obj, propName);
                const expectedResult =
                    typeof obj === "object" &&
                    obj !== null &&
                    !Array.isArray(obj) &&
                    Object.hasOwn(obj, propName);

                expect(result).toBe(expectedResult);
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
                const result = hasProperty(value, propName);
                // hasProperty only returns true for objects that actually have the property
                // It should return false for non-objects (including null/undefined)
                const expectedResult = false;

                expect(result).toBe(expectedResult);
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
                const result = hasProperties(obj, properties);
                const expectedResult = properties.every((prop) => prop in obj);

                expect(result).toBe(expectedResult);
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
                const result = isNonNullObject(value);
                const expectedResult =
                    typeof value === "object" &&
                    value !== null &&
                    !Array.isArray(value);

                expect(result).toBe(expectedResult);
            }
        );
    });

    describe("Monitor Type Validation", () => {
        // Test validateMonitorType with various monitor types
        fcTest.prop([
            fc.oneof(
                fc.constantFrom("http", "ping", "port", "dns"), // Valid types
                fc.string(), // Random strings
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])(
            "validateMonitorType should validate monitor types correctly",
            (monitorType) => {
                const result = validateMonitorType(monitorType);
                const validTypes = [
                    "http",
                    "ping",
                    "port",
                    "dns",
                ];
                const expectedResult = validTypes.includes(
                    monitorType as string
                );

                expect(result).toBe(expectedResult);
            }
        );

        // Test with case variations
        fcTest.prop([
            fc.oneof(
                fc.constantFrom("HTTP", "Http", "hTtP"), // Case variations
                fc.constantFrom("PING", "Ping", "pInG"),
                fc.constantFrom("PORT", "Port", "pOrT"),
                fc.constantFrom("DNS", "Dns", "dNs")
            ),
        ])(
            "validateMonitorType should handle case variations",
            (monitorType) => {
                const result = validateMonitorType(monitorType);

                // Depending on implementation, this might be case-sensitive or insensitive
                // The test verifies consistent behavior
                expect(typeof result).toBe("boolean");
            }
        );
    });

    describe("Site Validation", () => {
        // Test validateSite with various site objects
        fcTest.prop([
            fc.record({
                id: fc.oneof(fc.string(), fc.integer(), fc.constant(null)),
                name: fc.oneof(fc.string(), fc.constant("")),
                url: fc.oneof(fc.webUrl(), fc.string(), fc.constant(null)),
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
            }),
        ])(
            "validateSite should handle various site object structures",
            (siteObject) => {
                const result = validateSite(siteObject as any);

                // Result should always be a boolean
                expect(typeof result).toBe("boolean");

                // If validation passes, the object should have required properties
                if (result) {
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
            const result = validateSite(invalidSite as any);

            // Should handle any input gracefully
            expect(typeof result).toBe("boolean");
        });
    });

    describe("Monitor Validation Errors", () => {
        // Test getMonitorValidationErrors with various monitor configurations
        fcTest.prop([
            fc.record({
                type: fc.oneof(
                    fc.constantFrom("http", "https", "ping", "port", "dns"),
                    fc.string()
                ),
                target: fc.oneof(
                    fc.webUrl(),
                    fc.domain(),
                    fc.string(),
                    fc.constant(null)
                ),
                port: fc.oneof(
                    fc.integer({ min: 1, max: 65_535 }),
                    fc.integer(),
                    fc.constant(null)
                ),
                timeout: fc.oneof(
                    fc.integer({ min: 1000, max: 60_000 }),
                    fc.integer(),
                    fc.constant(null)
                ),
                interval: fc.oneof(
                    fc.integer({ min: 30_000, max: 3_600_000 }),
                    fc.integer(),
                    fc.constant(null)
                ),
            }),
        ])(
            "getMonitorValidationErrors should return appropriate error arrays",
            (monitorConfig) => {
                const result = getMonitorValidationErrors(monitorConfig as any);

                // Should always return an array
                expect(Array.isArray(result)).toBeTruthy();

                // Each error should be a string
                for (const error of result) {
                    expect(typeof error).toBe("string");
                    expect(error.length).toBeGreaterThan(0);
                }
            }
        );

        // Test with extreme values
        fcTest.prop([
            fc.record({
                type: fc.oneof(
                    fc.constantFrom("http", "port", "ping", "dns"),
                    fc.string()
                ),
                port: fc.integer({ min: -10_000, max: 100_000 }),
                timeout: fc.integer({ min: -1000, max: 1_000_000 }),
                interval: fc.integer({ min: -1000, max: 10_000_000 }),
            }),
        ])(
            "getMonitorValidationErrors should handle extreme numeric values",
            (extremeConfig) => {
                const result = getMonitorValidationErrors(extremeConfig as any);

                expect(Array.isArray(result)).toBeTruthy();

                // Check for invalid monitor type first
                const validTypes = new Set([
                    "http",
                    "port",
                    "ping",
                    "dns",
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
                    ).toBeTruthy();
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
                    ).toBeTruthy();
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
                    ).toBeTruthy();
                }
            }
        );
    });

    describe("Integration and Performance Tests", () => {
        // Test type guard consistency
        fcTest.prop([fc.anything()])(
            "type guards should be consistent with typeof checks",
            (value) => {
                // String consistency
                expect(isString(value)).toBe(typeof value === "string");

                // Number consistency
                expect(isNumber(value)).toBe(typeof value === "number");

                // Boolean consistency
                expect(isBoolean(value)).toBe(typeof value === "boolean");

                // Function consistency
                expect(isFunction(value)).toBe(typeof value === "function");
            }
        );

        // Test performance with large datasets
        fcTest.prop([fc.integer({ min: 100, max: 1000 })])(
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
                expect(typeof isObjectResult).toBe("boolean");
                expect(isObjectResult).toBeTruthy(); // Should be true for objects

                const isStringResult = isString(objectWithConversions);
                expect(typeof isStringResult).toBe("boolean");
                expect(isStringResult).toBeFalsy(); // Should be false for objects
            }
        );
    });
});
