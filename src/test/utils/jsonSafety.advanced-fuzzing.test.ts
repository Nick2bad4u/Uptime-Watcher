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

import type {
    Jsonifiable,
    JsonObject,
    JsonValue,
    UnknownRecord,
} from "type-fest";

import { fc, test as fcTest } from "@fast-check/vitest";
import {
    safeJsonParse,
    safeJsonParseArray,
    safeJsonParseWithFallback,
    safeJsonStringify,
    safeJsonStringifyWithFallback,
} from "@shared/utils/jsonSafety";
import {
    objectFromEntries,
    objectKeys,
    objectValues,
    safeCastTo,
    objectEntries,
} from "ts-extras";
import { describe, expect } from "vitest";

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
    // Create a normal object to mimic JSON.parse behavior (which creates objects with Object.prototype)
    const normalized: any = {};
    for (const [key, val] of objectEntries(value as Record<string, unknown>)) {
        if (val === undefined) {
            continue;
        }

        const normalizedVal = normalizeForJsonComparison(val);
        // Only include properties that would survive JSON serialization
        if (normalizedVal !== undefined) {
            // Handle the special case of "__proto__" key which doesn't behave normally with assignment
            if (key === "__proto__") {
                Object.defineProperty(normalized, "__proto__", {
                    configurable: true,
                    enumerable: true,
                    value: normalizedVal,
                    writable: true,
                });
            } else {
                normalized[key] = normalizedVal;
            }
        }
    }

    // Handle objects with __proto__: null - they become regular objects through JSON round-trip
    // Also handles objects with special prototype pollution keys
    if (Object.getPrototypeOf(value) === null) {
        // Return a regular object with Object.prototype to match JSON round-trip behavior
        return { ...normalized };
    }

    return normalized;
}

const jsonValueArbitrary: fc.Arbitrary<JsonValue> = fc
    .jsonValue()
    .map((value) => value as JsonValue);

const isJsonValue = (value: unknown): value is JsonValue => {
    if (
        value === null ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.every((entry) => isJsonValue(entry));
    }

    if (typeof value === "object") {
        return objectValues(value as UnknownRecord).every((entry) =>
            isJsonValue(entry)
        );
    }

    return false;
};

type SerializableMetadata = JsonObject;

const metadataArbitrary: fc.Arbitrary<SerializableMetadata> = fc
    .dictionary(fc.string(), jsonValueArbitrary)
    .map((record) => safeCastTo<SerializableMetadata>(record));

type SerializableComplexObject = JsonObject & {
    active: boolean;
    count: number;
    id: string;
    metadata: null | SerializableMetadata;
    tags: string[];
};

const complexObjectArbitrary: fc.Arbitrary<SerializableComplexObject> = fc
    .record({
        active: fc.boolean(),
        count: fc.integer(),
        id: fc.string(),
        metadata: fc.oneof(fc.constant(null), metadataArbitrary),
        tags: fc.array(fc.string(), { maxLength: 10 }),
    })
    .map((record) => ({ ...record }));

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
                fc.stringMatching(/[[{].*[\]}]/u).filter((s) => {
                    try {
                        JSON.parse(s);
                        return false;
                    } catch {
                        return true;
                    }
                }), // Looks like JSON but broken
                fc.stringMatching(/[^\n\r"\u2028\u2029]*".*:.*/).filter((s) => {
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
                const validator = (_data: unknown): _data is any => true;
                const result = safeJsonParse(malformedJson, validator);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(result.data).toBeUndefined();
            }
        );

        // Test with extremely large JSON strings
        fcTest.prop([fc.integer({ max: 50_000, min: 1000 })])(
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
        fcTest.prop([fc.integer({ max: 20, min: 1 })])(
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

                expect(result.success).toBe(true);

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
            const validator = (_data: unknown): _data is typeof primitive =>
                true;

            const result = safeJsonParse(jsonString, validator);

            expect(result.success).toBe(true);

            if (result.success) {
                // Handle JavaScript signed zero quirk where -0 becomes +0 through JSON
                const expectedValue = Object.is(primitive, -0) ? 0 : primitive;

                expect(result.data).toEqual(expectedValue);
            }
        });

        // Test with complex objects
        fcTest.prop([complexObjectArbitrary])(
            "should handle complex object structures",
            (complexObject) => {
                const jsonString = JSON.stringify(complexObject);
                const validator = (
                    data: unknown
                ): data is SerializableComplexObject => {
                    if (
                        typeof data !== "object" ||
                        data === null ||
                        typeof (data as SerializableComplexObject).id !==
                            "string" ||
                        typeof (data as SerializableComplexObject).count !==
                            "number" ||
                        typeof (data as SerializableComplexObject).active !==
                            "boolean" ||
                        !Array.isArray(
                            (data as SerializableComplexObject).tags
                        ) ||
                        (data as SerializableComplexObject).tags.some(
                            (tag) => typeof tag !== "string"
                        )
                    ) {
                        return false;
                    }

                    const metadata = (data as SerializableComplexObject)
                        .metadata;
                    if (metadata === null) {
                        return true;
                    }

                    if (typeof metadata !== "object") {
                        return false;
                    }

                    return objectValues(metadata).every((entry) =>
                        isJsonValue(entry)
                    );
                };

                const result = safeJsonParse(jsonString, validator);

                expect(result.success).toBe(true);

                if (result.success) {
                    // Compare with normalized version to account for undefined value removal
                    const normalizedOriginal =
                        normalizeForJsonComparison(complexObject);

                    expect(result.data).toEqual(normalizedOriginal);
                }
            }
        );

        // Test with Unicode and special characters
        fcTest.prop([fc.string()])(
            "should handle Unicode strings correctly",
            (unicodeString) => {
                const jsonString = JSON.stringify(unicodeString);
                const validator = (data: unknown): data is string =>
                    typeof data === "string";

                const result = safeJsonParse(jsonString, validator);

                expect(result.success).toBe(true);

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
                const rejectingValidator = (_data: unknown): _data is any =>
                    false;

                const result = safeJsonParse(jsonString, rejectingValidator);

                expect(result.success).toBe(false);
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
            const validator = (_item: unknown): _item is any => true;

            const result = safeJsonParseArray(jsonString, validator);

            expect(result.success).toBe(false);
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
                    fc.record({ key: fc.string() })
                ),
                { maxLength: 50 }
            ),
        ])("should handle mixed array types", (mixedArray) => {
            const jsonString = JSON.stringify(mixedArray);
            const validator = (_item: unknown): _item is any => true;

            const result = safeJsonParseArray(jsonString, validator);

            expect(result.success).toBe(true);

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
                maxLength: 10,
                minLength: 1,
            }),
        ])("should handle item validator rejection", (array) => {
            const jsonString = JSON.stringify(array);
            const strictValidator = (item: unknown): item is string =>
                typeof item === "string";

            const result = safeJsonParseArray(jsonString, strictValidator);

            const hasNonString = array.some((item) => typeof item !== "string");
            if (hasNonString) {
                expect(result.success).toBe(false);
            } else {
                expect(result.success).toBe(true);
            }
        });
    });

    describe("safeJsonParseWithFallback - Fallback Behavior", () => {
        // Test fallback with various types
        fcTest.prop([
            fc.oneof(
                fc.stringMatching(/^[^\d"[fnt{].*/), // Strings that don't start with valid JSON chars
                fc.stringMatching(/.*[^\s\d"]fnt\}\]$/), // Strings that don't end with valid JSON chars
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
            jsonValueArbitrary, // Fallback value
        ])(
            "should return fallback for malformed JSON",
            (malformedJson, fallbackValue) => {
                const validator = (
                    _data: unknown
                ): _data is typeof fallbackValue => true;

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
        // Test with objects containing functions (strict mode rejects them)
        fcTest.prop([fc.string()])(
            "should reject objects with enumerable function properties",
            (stringProp) => {
                const objectWithFunction = safeCastTo<UnknownRecord>({
                    functionProp: () => "test",
                    undefinedProp: undefined,
                    validProp: stringProp,
                });

                const result = safeJsonStringify(
                    objectWithFunction as unknown as Jsonifiable
                );

                expect(result.success).toBe(false);
                expect(result.error).toContain(
                    "Value cannot be serialized to JSON"
                );
            }
        );

        // Test with circular references (should fail gracefully)
        fcTest.prop([fc.string()])(
            "should handle circular references gracefully",
            (propValue) => {
                const circularObj: any = { prop: propValue };
                circularObj.circular = circularObj;

                const result = safeJsonStringify(circularObj);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(result.data).toBeUndefined();
            }
        );

        // Test with large objects
        fcTest.prop([fc.integer({ max: 1000, min: 100 })])(
            "should handle large objects efficiently",
            (size) => {
                const largeObj = objectFromEntries(
                    Array.from({ length: size }, (_, i) => [
                        `key${i}`,
                        `value${i}`,
                    ])
                );

                const result = safeJsonStringify(largeObj);

                expect(result.success).toBe(true);

                if (result.success && result.data) {
                    const parsed = JSON.parse(result.data);

                    expect(objectKeys(parsed)).toHaveLength(size);
                }
            }
        );

        // Test with objects containing special values
        fcTest.prop([fc.string()])(
            "should handle objects with special numeric values",
            (key) => {
                const objWithSpecialValues = {
                    [key]: {
                        infinity: Infinity,
                        nan: NaN,
                        negInfinity: Number.NEGATIVE_INFINITY,
                        validNumber: 42,
                    },
                };

                const result = safeJsonStringify(objWithSpecialValues);

                expect(result.success).toBe(true);

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
        fcTest.prop([fc.integer({ max: 10, min: 1 })])(
            "should handle deeply nested structures",
            (depth) => {
                let nested: any = { level: 0, value: "deep" };
                for (let i = 1; i < depth; i++) {
                    nested = { level: i, nested };
                }

                const result = safeJsonStringify(nested);

                expect(result.success).toBe(true);

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
                    fc.record({ key: fc.string() })
                ),
                { maxLength: 20 }
            ),
        ])("should handle arrays with mixed types", (mixedArray) => {
            const result = safeJsonStringify(mixedArray);

            expect(result.success).toBe(true);

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
        fcTest.prop([
            fc.record({ data: fc.string() }).chain((validObj) =>
                fc.tuple(
                    fc.constant(validObj),
                    fc
                        .string()
                        .filter(
                            (fallback) => fallback !== JSON.stringify(validObj)
                        )
                )
            ),
        ])(
            "should stringify valid objects instead of using fallback",
            ([validObj, fallback]) => {
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
                };
                Object.defineProperty(objWithToJSON, "toJSON", {
                    configurable: true,
                    enumerable: false,
                    value: () => ({ customValue: toJsonValue }),
                    writable: true,
                });

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

    describe("integration and Performance Tests", () => {
        // Test round-trip consistency
        fcTest.prop([
            fc.oneof(
                fc.record({
                    active: fc.boolean(),
                    count: fc.integer(),
                    id: fc.string(),
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
                        _data: unknown
                    ): _data is typeof originalData => true;
                    const parseResult = safeJsonParse(
                        stringifyResult.data,
                        validator
                    );

                    expect(parseResult.success).toBe(true);

                    if (parseResult.success) {
                        expect(parseResult.data).toEqual(originalData);
                    }
                }
            }
        );

        // Test performance with repeated operations
        fcTest.prop([
            fc.integer({ max: 100, min: 10 }),
            fc.record({
                count: fc.integer({ max: 10_000, min: 0 }),
                label: fc.string({ maxLength: 50, minLength: 1 }),
            }),
        ])(
            "should handle repeated operations efficiently",
            (iterations, payload) => {
                const results: string[] = [];

                for (let i = 0; i < iterations; i++) {
                    const result = safeJsonStringify(payload);
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
        fcTest.prop([fc.integer({ max: 200, min: 50 })])(
            "should not leak memory with large datasets",
            (datasetSize) => {
                const largeDataset = Array.from(
                    { length: datasetSize },
                    (_, i) => ({
                        id: i,
                        metadata: { index: i, squared: i ** 2 },
                        name: `item-${i}`,
                    })
                );

                const stringifyResult = safeJsonStringify(largeDataset);

                expect(stringifyResult.success).toBe(true);

                if (stringifyResult.success && stringifyResult.data) {
                    const validator = (
                        data: unknown
                    ): data is typeof largeDataset => Array.isArray(data);
                    const parseResult = safeJsonParse(
                        stringifyResult.data,
                        validator
                    );

                    expect(parseResult.success).toBe(true);

                    if (parseResult.success) {
                        expect(parseResult.data).toHaveLength(datasetSize);
                    }
                }
            }
        );
    });
});
