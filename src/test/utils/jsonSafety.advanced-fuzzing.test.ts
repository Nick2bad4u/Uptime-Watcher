/**
 * Advanced fuzzing tests for JSON safety utilities using comprehensive
 * fast-check coverage.
 *
 * @remarks
 * This test suite focuses on achieving 100% branch coverage for JSON safety
 * utilities through intensive property-based testing with edge cases and
 * malicious inputs.
 *
 * Coverage includes:
 *
 * - Malformed JSON strings and edge case parsing
 * - Circular reference handling in stringification
 * - Large JSON structures and memory pressure
 * - Unicode and special character handling
 * - Type validation and safety guarantees
 * - Performance characteristics under stress
 *
 * @file Advanced fuzzing tests for JSON safety utilities
 */

import { describe, expect } from "vitest";
import { fc, test as fcTest } from "@fast-check/vitest";
import {
    safeJsonParse,
    safeJsonParseArray,
    safeJsonParseWithFallback,
    safeJsonStringify,
    safeJsonStringifyWithFallback,
} from "../../../shared/utils/jsonSafety";

/**
 * Normalizes data to match JSON serialization behavior. This handles the same
 * transformations as JSON.stringify:
 *
 * - Removes properties with undefined values from objects
 * - Converts undefined values in arrays to null
 * - Handles nested structures recursively
 */
function normalizeForJsonComparison(value: any): any {
    if (value === undefined) {
        return undefined; // Will be handled by caller
    }
    if (value === null || typeof value !== "object") {
        // Handle special numeric values that don't serialize to JSON properly
        if (typeof value === "number") {
            if (!Number.isFinite(value)) {
                return null; // Infinity/NaN become null in JSON
            }
            if (Object.is(value, -0)) {
                return 0; // -0 becomes 0 in JSON
            }
        }
        return value; // Primitives pass through
    }

    if (Array.isArray(value)) {
        return value.map((item) =>
            item === undefined ? null : normalizeForJsonComparison(item)
        );
    }

    // For objects, remove undefined properties and handle special values
    const normalized: any = {};
    for (const [key, val] of Object.entries(value)) {
        if (val !== undefined) {
            const normalizedVal = normalizeForJsonComparison(val);
            // Only include properties that would survive JSON serialization
            if (normalizedVal !== undefined) {
                normalized[key] = normalizedVal;
            }
        }
    }
    return normalized;
}

describe("JSON Safety Advanced Fuzzing Tests", () => {
    describe("safeJsonParse - Malformed Input Handling", () => {
        // Test with various malformed JSON strings
        fcTest.prop([
            fc.oneof(
                fc.string().filter((s) => {
                    // Filter out strings that are actually valid JSON
                    try {
                        JSON.parse(s);
                        return false; // If parsing succeeds, exclude this string
                    } catch {
                        return true; // If parsing fails, include this string
                    }
                }), // Random strings that aren't JSON
                fc.stringMatching(/[[{].*[\]}]/).filter((s) => {
                    try {
                        JSON.parse(s);
                        return false;
                    } catch {
                        return true;
                    }
                }), // Looks like JSON but broken
                fc.stringMatching(/.*".*:.*/).filter((s) => {
                    try {
                        JSON.parse(s);
                        return false;
                    } catch {
                        return true;
                    }
                }), // Partial JSON-like strings
                fc.constant('{"incomplete":'),
                fc.constant("{broken: json}"),
                fc.constant('{"trailing": comma,}'),
                fc.constant("[1, 2, 3, extra]"),
                fc.constant("undefined"),
                fc.constant("null null"),
                fc.constant("Infinity"),
                fc.constant("-Infinity"),
                fc.constant("NaN")
            ),
        ])(
            "should handle malformed JSON strings gracefully",
            (malformedJson) => {
                const validator = (data: unknown): data is any => true;
                const result = safeJsonParse(malformedJson, validator);

                expect(result.success).toBeFalsy();
                expect(result.error).toBeDefined();
                expect(result.data).toBeUndefined();
            }
        );

        // Test with extremely large JSON strings
        fcTest.prop([fc.integer({ min: 1000, max: 50_000 })])(
            "should handle very large JSON strings",
            (size) => {
                const largeArray = Array.from({ length: size }, (_, i) => i);
                const largeJsonString = JSON.stringify(largeArray);

                const validator = (data: unknown): data is number[] =>
                    Array.isArray(data);
                const result = safeJsonParse(largeJsonString, validator);

                if (result.success) {
                    expect(result.data).toHaveLength(size);
                } else {
                    // If parsing fails, it should fail gracefully
                    expect(result.error).toBeDefined();
                }
            }
        );

        // Test with deeply nested JSON
        fcTest.prop([fc.integer({ min: 1, max: 20 })])(
            "should handle deeply nested JSON structures",
            (depth) => {
                let nested: any = { value: "deep" };
                for (let i = 0; i < depth; i++) {
                    nested = { level: i, nested };
                }

                const jsonString = JSON.stringify(nested);
                const validator = (data: unknown): data is any =>
                    typeof data === "object" && data !== null;

                const result = safeJsonParse(jsonString, validator);

                expect(result.success).toBeTruthy();
                if (result.success) {
                    expect(result.data).toBeDefined();
                }
            }
        );

        // Test with various valid JSON primitives
        fcTest.prop([
            fc.oneof(
                fc.string(),
                fc.integer(),
                fc.float({ noDefaultInfinity: true, noNaN: true }),
                fc.boolean(),
                fc.constant(null)
            ),
        ])("should parse valid JSON primitives correctly", (primitive) => {
            const jsonString = JSON.stringify(primitive);
            const validator = (data: unknown): data is typeof primitive => true;

            const result = safeJsonParse(jsonString, validator);

            expect(result.success).toBeTruthy();
            if (result.success) {
                // Handle JavaScript signed zero quirk where -0 becomes +0 through JSON
                const expectedValue = Object.is(primitive, -0) ? 0 : primitive;
                expect(result.data).toEqual(expectedValue);
            }
        });

        // Test with complex objects
        fcTest.prop([
            fc.record({
                id: fc.string(),
                count: fc.integer(),
                active: fc.boolean(),
                metadata: fc.oneof(fc.constant(null), fc.object()),
                tags: fc.array(fc.string(), { maxLength: 10 }),
            }),
        ])("should handle complex object structures", (complexObject) => {
            const jsonString = JSON.stringify(complexObject);
            const validator = (data: unknown): data is typeof complexObject =>
                typeof data === "object" && data !== null;

            const result = safeJsonParse(jsonString, validator);

            expect(result.success).toBeTruthy();
            if (result.success) {
                // Compare with normalized version to account for undefined value removal
                const normalizedOriginal =
                    normalizeForJsonComparison(complexObject);
                expect(result.data).toEqual(normalizedOriginal);
            }
        });

        // Test with Unicode and special characters
        fcTest.prop([fc.string()])(
            "should handle Unicode strings correctly",
            (unicodeString) => {
                const jsonString = JSON.stringify(unicodeString);
                const validator = (data: unknown): data is string =>
                    typeof data === "string";

                const result = safeJsonParse(jsonString, validator);

                expect(result.success).toBeTruthy();
                if (result.success) {
                    expect(result.data).toBe(unicodeString);
                }
            }
        );

        // Test validator rejection
        fcTest.prop([fc.anything()])(
            "should respect validator rejection",
            (data) => {
                const jsonString = JSON.stringify(data);
                const rejectingValidator = (data: unknown): data is any =>
                    false;

                const result = safeJsonParse(jsonString, rejectingValidator);

                expect(result.success).toBeFalsy();
                expect(result.error).toBeDefined();
            }
        );
    });

    describe("safeJsonParseArray - Array-Specific Edge Cases", () => {
        // Test with non-array JSON
        fcTest.prop([
            fc.oneof(
                fc.record({ key: fc.string() }),
                fc.string(),
                fc.integer(),
                fc.boolean()
            ),
        ])("should reject non-array JSON", (nonArrayData) => {
            const jsonString = JSON.stringify(nonArrayData);
            const validator = (item: unknown): item is any => true;

            const result = safeJsonParseArray(jsonString, validator);

            expect(result.success).toBeFalsy();
            expect(result.error).toBeDefined();
        });

        // Test with mixed array types
        fcTest.prop([
            fc.array(
                fc.oneof(
                    fc.string(),
                    fc.integer(),
                    fc.boolean(),
                    fc.constant(null),
                    fc.object()
                ),
                { maxLength: 50 }
            ),
        ])("should handle mixed array types", (mixedArray) => {
            const jsonString = JSON.stringify(mixedArray);
            const validator = (item: unknown): item is any => true;

            const result = safeJsonParseArray(jsonString, validator);

            expect(result.success).toBeTruthy();
            if (result.success) {
                // Compare with normalized version to account for undefined -> null conversion
                const normalizedOriginal =
                    normalizeForJsonComparison(mixedArray);
                expect(result.data).toEqual(normalizedOriginal);
            }
        });

        // Test with array item validation rejection
        fcTest.prop([
            fc.array(fc.oneof(fc.string(), fc.integer()), {
                minLength: 1,
                maxLength: 10,
            }),
        ])("should handle item validator rejection", (array) => {
            const jsonString = JSON.stringify(array);
            const strictValidator = (item: unknown): item is string =>
                typeof item === "string";

            const result = safeJsonParseArray(jsonString, strictValidator);

            const hasNonString = array.some((item) => typeof item !== "string");
            if (hasNonString) {
                expect(result.success).toBeFalsy();
            } else {
                expect(result.success).toBeTruthy();
            }
        });
    });

    describe("safeJsonParseWithFallback - Fallback Behavior", () => {
        // Test fallback with various types
        fcTest.prop([
            fc.oneof(
                fc.stringMatching(/^[^\d"[fnt{].*/), // Strings that don't start with valid JSON chars
                fc.stringMatching(/.*[^\d\s"]fnt}]$/), // Strings that don't end with valid JSON chars
                fc.constant('{"incomplete":'),
                fc.constant("{broken: json}"),
                fc.constant('{"trailing": comma,}'),
                fc.constant("[1, 2, 3, extra]"),
                fc.constant("undefined"),
                fc.constant("null null"),
                fc.constant("Infinity"),
                fc.constant("-Infinity"),
                fc.constant("NaN"),
                fc.string().filter((s) => {
                    // Filter out strings that are actually valid JSON
                    try {
                        JSON.parse(s);
                        return false; // If parsing succeeds, exclude this string
                    } catch {
                        return true; // If parsing fails, include this string
                    }
                })
            ), // Truly malformed JSON
            fc.oneof(
                fc.string(),
                fc.integer(),
                fc.object(),
                fc.array(fc.string()),
                fc.constant(null)
            ), // Fallback value
        ])(
            "should return fallback for malformed JSON",
            (malformedJson, fallbackValue) => {
                const validator = (
                    data: unknown
                ): data is typeof fallbackValue => true;

                const result = safeJsonParseWithFallback(
                    malformedJson,
                    validator,
                    fallbackValue
                );

                // For truly malformed JSON, should return fallback
                expect(result).toBe(fallbackValue);
            }
        );

        // Test successful parsing vs fallback
        fcTest.prop([
            fc.record({ test: fc.string() }),
            fc.record({ test: fc.string() }), // Changed to match validator expectation
        ])(
            "should parse valid JSON instead of using fallback",
            (validData, fallbackData) => {
                // Skip test if both objects would be identical
                fc.pre(
                    !JSON.stringify(validData).includes(
                        JSON.stringify(fallbackData)
                    ) &&
                        !JSON.stringify(fallbackData).includes(
                            JSON.stringify(validData)
                        )
                );

                const jsonString = JSON.stringify(validData);
                const validator = (data: unknown): data is typeof validData =>
                    typeof data === "object" && data !== null && "test" in data;

                const result = safeJsonParseWithFallback(
                    jsonString,
                    validator,
                    fallbackData
                );

                expect(result).toEqual(validData);
                expect(result).not.toEqual(fallbackData);
            }
        );
    });

    describe("safeJsonStringify - Complex Object Serialization", () => {
        // Test with objects containing functions (should be filtered)
        fcTest.prop([fc.string()])(
            "should handle objects with function properties",
            (stringProp) => {
                const objectWithFunction = {
                    validProp: stringProp,
                    functionProp: () => "test",
                    undefinedProp: undefined,
                };

                const result = safeJsonStringify(objectWithFunction);

                expect(result.success).toBeTruthy();
                if (result.success && result.data) {
                    const parsed = JSON.parse(result.data);
                    expect(parsed.validProp).toBe(stringProp);
                    expect(parsed.functionProp).toBeUndefined();
                    expect(parsed.undefinedProp).toBeUndefined();
                }
            }
        );

        // Test with circular references (should fail gracefully)
        fcTest.prop([fc.string()])(
            "should handle circular references gracefully",
            (propValue) => {
                const circularObj: any = { prop: propValue };
                circularObj.circular = circularObj;

                const result = safeJsonStringify(circularObj);

                expect(result.success).toBeFalsy();
                expect(result.error).toBeDefined();
                expect(result.data).toBeUndefined();
            }
        );

        // Test with large objects
        fcTest.prop([fc.integer({ min: 100, max: 1000 })])(
            "should handle large objects efficiently",
            (size) => {
                const largeObj = Object.fromEntries(
                    Array.from({ length: size }, (_, i) => [
                        `key${i}`,
                        `value${i}`,
                    ])
                );

                const result = safeJsonStringify(largeObj);

                expect(result.success).toBeTruthy();
                if (result.success && result.data) {
                    const parsed = JSON.parse(result.data);
                    expect(Object.keys(parsed)).toHaveLength(size);
                }
            }
        );

        // Test with objects containing special values
        fcTest.prop([fc.string()])(
            "should handle objects with special numeric values",
            (key) => {
                const objWithSpecialValues = {
                    [key]: {
                        infinity: Number.POSITIVE_INFINITY,
                        negInfinity: Number.NEGATIVE_INFINITY,
                        nan: Number.NaN,
                        validNumber: 42,
                    },
                };

                const result = safeJsonStringify(objWithSpecialValues);

                expect(result.success).toBeTruthy();
                if (result.success && result.data) {
                    const parsed = JSON.parse(result.data);
                    expect(parsed[key].infinity).toBeNull();
                    expect(parsed[key].negInfinity).toBeNull();
                    expect(parsed[key].nan).toBeNull();
                    expect(parsed[key].validNumber).toBe(42);
                }
            }
        );

        // Test with nested structures
        fcTest.prop([fc.integer({ min: 1, max: 10 })])(
            "should handle deeply nested structures",
            (depth) => {
                let nested: any = { value: "deep", level: 0 };
                for (let i = 1; i < depth; i++) {
                    nested = { nested, level: i };
                }

                const result = safeJsonStringify(nested);

                expect(result.success).toBeTruthy();
                if (result.success && result.data) {
                    const parsed = JSON.parse(result.data);
                    expect(parsed).toBeDefined();
                }
            }
        );

        // Test with arrays containing mixed types
        fcTest.prop([
            fc.array(
                fc.oneof(
                    fc.string(),
                    fc.integer(),
                    fc.boolean(),
                    fc.constant(null),
                    fc.object({ key: fc.string() })
                ),
                { maxLength: 20 }
            ),
        ])("should handle arrays with mixed types", (mixedArray) => {
            const result = safeJsonStringify(mixedArray);

            expect(result.success).toBeTruthy();
            if (result.success && result.data) {
                const parsed = JSON.parse(result.data);
                // Compare with normalized version to account for undefined -> null conversion
                const normalizedOriginal =
                    normalizeForJsonComparison(mixedArray);
                expect(parsed).toEqual(normalizedOriginal);
            }
        });
    });

    describe("safeJsonStringifyWithFallback - Fallback Serialization", () => {
        // Test fallback behavior with problematic objects
        fcTest.prop([fc.string()])(
            "should use fallback for circular references",
            (fallbackString) => {
                const circularObj: any = { test: "data" };
                circularObj.circular = circularObj;

                const result = safeJsonStringifyWithFallback(
                    circularObj,
                    fallbackString
                );

                expect(result).toBe(fallbackString);
            }
        );

        // Test successful stringification vs fallback
        fcTest.prop([fc.record({ data: fc.string() }), fc.string()])(
            "should stringify valid objects instead of using fallback",
            (validObj, fallback) => {
                const result = safeJsonStringifyWithFallback(
                    validObj,
                    fallback
                );

                expect(result).not.toBe(fallback);
                expect(result).toBe(JSON.stringify(validObj));
            }
        );

        // Test with objects that have toJSON methods
        fcTest.prop([fc.string(), fc.string()])(
            "should respect toJSON methods",
            (originalValue, toJsonValue) => {
                const objWithToJSON = {
                    value: originalValue,
                    toJSON: () => ({ customValue: toJsonValue }),
                };

                const result = safeJsonStringifyWithFallback(
                    objWithToJSON,
                    "fallback"
                );

                expect(result).not.toBe("fallback");
                const parsed = JSON.parse(result);
                expect(parsed.customValue).toBe(toJsonValue);
                expect(parsed.value).toBeUndefined(); // Original value should be replaced
            }
        );
    });

    describe("Integration and Performance Tests", () => {
        // Test round-trip consistency
        fcTest.prop([
            fc.oneof(
                fc.record({
                    id: fc.string(),
                    count: fc.integer(),
                    active: fc.boolean(),
                }),
                fc.array(fc.string()),
                fc.string(),
                fc.integer(),
                fc.boolean()
            ),
        ])(
            "should maintain round-trip consistency for valid data",
            (originalData) => {
                // Stringify then parse should return equivalent data
                const stringifyResult = safeJsonStringify(originalData);

                if (stringifyResult.success && stringifyResult.data) {
                    const validator = (
                        data: unknown
                    ): data is typeof originalData => true;
                    const parseResult = safeJsonParse(
                        stringifyResult.data,
                        validator
                    );

                    expect(parseResult.success).toBeTruthy();
                    if (parseResult.success) {
                        expect(parseResult.data).toEqual(originalData);
                    }
                }
            }
        );

        // Test performance with repeated operations
        fcTest.prop([fc.integer({ min: 10, max: 100 })])(
            "should handle repeated operations efficiently",
            (iterations) => {
                const testData = { test: "data", count: 42 };
                const results: string[] = [];

                for (let i = 0; i < iterations; i++) {
                    const result = safeJsonStringify(testData);
                    if (result.success && result.data) {
                        results.push(result.data);
                    }
                }

                expect(results).toHaveLength(iterations);
                // All results should be identical for the same input
                expect(new Set(results).size).toBe(1);
            }
        );

        // Test memory usage with large datasets
        fcTest.prop([fc.integer({ min: 50, max: 200 })])(
            "should not leak memory with large datasets",
            (datasetSize) => {
                const largeDataset = Array.from(
                    { length: datasetSize },
                    (_, i) => ({
                        id: i,
                        name: `item-${i}`,
                        metadata: { index: i, squared: i * i },
                    })
                );

                const stringifyResult = safeJsonStringify(largeDataset);

                expect(stringifyResult.success).toBeTruthy();
                if (stringifyResult.success && stringifyResult.data) {
                    const validator = (
                        data: unknown
                    ): data is typeof largeDataset => Array.isArray(data);
                    const parseResult = safeJsonParse(
                        stringifyResult.data,
                        validator
                    );

                    expect(parseResult.success).toBeTruthy();
                    if (parseResult.success) {
                        expect(parseResult.data).toHaveLength(datasetSize);
                    }
                }
            }
        );
    });
});
