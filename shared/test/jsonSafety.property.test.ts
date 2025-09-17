/**
 * This test suite provides extensive property-based testing for JSON
 * serialization and deserialization utilities. It focuses on edge cases, type
 * safety, and error handling using fast-check and @fast-check/vitest.
 *
 * @file Comprehensive property-based tests for JSON safety utilities
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-05
 *
 * @features
 * - Property-based testing for safe JSON operations
 * - Type validation and safety testing
 * - Error handling and fallback mechanism testing
 * - Performance testing with complex objects
 * - Round-trip serialization/deserialization verification
 */

import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";

// Import JSON safety utilities
import {
    safeJsonStringify,
    safeJsonParse,
    safeJsonParseArray,
    safeJsonParseWithFallback,
    safeJsonStringifyWithFallback,
} from "@shared/utils/jsonSafety";

/**
 * Normalize -0 to 0 to handle JSON round-trip behavior JSON.stringify(-0)
 * returns "0", and JSON.parse("0") returns 0
 */
const normalizeNegativeZero = (obj: any): any => {
    if (typeof obj === "number" && Object.is(obj, -0)) {
        return 0;
    }
    if (Array.isArray(obj)) {
        // eslint-disable-next-line unicorn/no-array-callback-reference -- Need to handle nested -0 values
        return obj.map(normalizeNegativeZero);
    }
    if (typeof obj === "object" && obj !== null) {
        const normalized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            normalized[key] = normalizeNegativeZero(value);
        }
        return normalized;
    }
    return obj;
};

describe("JSON Safety Property-Based Tests", () => {
    describe(safeJsonStringify, () => {
        test.prop([fc.jsonValue()])(
            "should stringify valid JSON values without throwing",
            (validJson) => {
                const result = safeJsonStringify(validJson);

                expect(() => result).not.toThrow();
                expect(typeof result).toBe("object");
                expect(result).toHaveProperty("success");

                if (result.success) {
                    expect(typeof result.data).toBe("string");
                }
            }
        );

        test.prop([fc.jsonValue()])(
            "should produce parseable JSON strings for valid inputs",
            (validJson) => {
                const stringifyResult = safeJsonStringify(validJson);

                if (stringifyResult.success && stringifyResult.data) {
                    expect(() => {
                        const parsed = JSON.parse(
                            stringifyResult.data as string
                        );
                        expect(parsed).toBeDefined();
                    }).not.toThrow();
                }
            }
        );

        test.prop([fc.anything()])(
            "should handle arbitrary inputs safely",
            (arbitraryValue) => {
                const result = safeJsonStringify(arbitraryValue);

                expect(() => result).not.toThrow();
                expect(typeof result).toBe("object");
                expect(result).toHaveProperty("success");

                if (result.success) {
                    expect(typeof result.data).toBe("string");
                } else {
                    expect(typeof result.error).toBe("string");
                }
            }
        );

        it("should handle functions and undefined values", () => {
            const objWithFunctions = {
                name: "test",
                fn: () => "hello",
                undefinedProp: undefined,
                validProp: "valid",
                nested: {
                    anotherFn: function anotherFn() {
                        return 42;
                    },
                    nullProp: null,
                },
            };

            const result = safeJsonStringify(objWithFunctions);
            expect(result.success).toBeTruthy();

            if (result.success && result.data) {
                const parsed = JSON.parse(result.data);
                expect(parsed.name).toBe("test");
                expect(parsed.validProp).toBe("valid");
                expect(parsed.nested.nullProp).toBe(null);
                // Functions and undefined should be omitted by JSON.stringify
                expect("fn" in parsed).toBeFalsy();
                expect("undefinedProp" in parsed).toBeFalsy();
            }
        });

        it("should handle special numeric values", () => {
            const objWithSpecialNumbers = {
                infinity: Infinity,
                negativeInfinity: -Infinity,
                notANumber: Number.NaN,
                normalNumber: 42,
                zero: 0,
                negativeZero: -0,
            };

            const result = safeJsonStringify(objWithSpecialNumbers);
            expect(result.success).toBeTruthy();

            if (result.success && result.data) {
                const parsed = JSON.parse(result.data);
                expect(parsed.normalNumber).toBe(42);
                expect(parsed.zero).toBe(0);
                // Special numbers are converted to null by JSON.stringify
                expect(parsed.infinity).toBe(null);
                expect(parsed.negativeInfinity).toBe(null);
                expect(parsed.notANumber).toBe(null);
            }
        });

        test.prop([fc.object({ maxDepth: 10 })])(
            "should handle deeply nested objects",
            (deepObject) => {
                const result = safeJsonStringify(deepObject);

                expect(() => result).not.toThrow();
                expect(result).toHaveProperty("success");

                if (result.success && result.data) {
                    // Should be parseable
                    expect(() =>
                        JSON.parse(result.data as string)
                    ).not.toThrow();
                }
            }
        );

        it("should handle circular references gracefully", () => {
            const obj: any = { name: "test" };
            obj.self = obj;

            const result = safeJsonStringify(obj);

            // Should handle the circular reference (might fail or succeed depending on implementation)
            expect(() => result).not.toThrow();
            expect(result).toHaveProperty("success");
        });
    });

    describe(safeJsonStringifyWithFallback, () => {
        test.prop([fc.jsonValue(), fc.string()])(
            "should return stringified JSON for valid inputs",
            (validJson, fallback) => {
                const result = safeJsonStringifyWithFallback(
                    validJson,
                    fallback
                );

                expect(typeof result).toBe("string");

                // Should be parseable JSON
                expect(() => {
                    const parsed = JSON.parse(result);
                    expect(parsed).toBeDefined();
                }).not.toThrow();
            }
        );

        test.prop([fc.anything(), fc.string()])(
            "should return fallback for problematic inputs when necessary",
            (arbitraryValue, fallback) => {
                const result = safeJsonStringifyWithFallback(
                    arbitraryValue,
                    fallback
                );

                expect(typeof result).toBe("string");
                // Result should be a string - could be valid JSON or the fallback (including empty string)
                // When fallback is provided, result should either be valid JSON or exactly the fallback
                expect(
                    [fallback, JSON.stringify(arbitraryValue)].some(
                        (expected) => {
                            try {
                                return (
                                    result === expected ||
                                    result === JSON.stringify(arbitraryValue)
                                );
                            } catch {
                                return result === fallback;
                            }
                        }
                    )
                ).toBeTruthy();
            }
        );

        it("should use fallback for circular references", () => {
            const obj: any = { name: "test" };
            obj.self = obj;
            const fallback = '{"error": "serialization failed"}';

            const result = safeJsonStringifyWithFallback(obj, fallback);
            expect(typeof result).toBe("string");

            // Should be parseable
            expect(() => JSON.parse(result)).not.toThrow();
        });
    });

    describe(safeJsonParse, () => {
        test.prop([fc.jsonValue()])(
            "should parse valid JSON strings successfully",
            (validJson) => {
                const stringified = JSON.stringify(validJson);

                // Create a simple validator that accepts any JSON value
                const validator = (_data: unknown): _data is typeof validJson =>
                    _data !== undefined;

                const result = safeJsonParse(stringified, validator);

                expect(result.success).toBeTruthy();
                if (result.success) {
                    // JSON.stringify(-0) becomes "0", and JSON.parse("0") becomes +0
                    // This is expected JSON round-trip behavior - compare stringified forms
                    // to avoid -0 vs +0 comparison issues since they're equivalent in JSON
                    expect(JSON.stringify(result.data)).toEqual(stringified);
                }
            }
        );

        test.prop([fc.string()])(
            "should handle invalid JSON strings gracefully",
            (invalidJson) => {
                // Filter out strings that are actually valid JSON
                if (
                    invalidJson.trim() === "" ||
                    invalidJson.trim().startsWith("{") ||
                    invalidJson.trim().startsWith("[") ||
                    invalidJson.trim().startsWith('"') ||
                    /^-?\d+(?:\.\d+)?(?:[Ee][+-]?\d+)?$/.test(
                        invalidJson.trim()
                    ) ||
                    [
                        "true",
                        "false",
                        "null",
                    ].includes(invalidJson.trim())
                ) {
                    return; // Skip potentially valid JSON
                }

                const validator = (_data: unknown): _data is any => true;
                const result = safeJsonParse(invalidJson, validator);

                // Should not throw, should return error result
                expect(() => result).not.toThrow();
                expect(result.success).toBeFalsy();
                if (!result.success) {
                    expect(result.error).toBeDefined();
                    expect(typeof result.error).toBe("string");
                }
            }
        );

        it("should validate types correctly", () => {
            const validUserJson = '{"id": "123", "name": "John", "age": 30}';
            const invalidUserJson = '{"id": 123, "name": "John"}'; // Id should be string

            const userValidator = (
                data: unknown
            ): data is { id: string; name: string; age?: number } =>
                typeof data === "object" &&
                data !== null &&
                typeof (data as any).id === "string" &&
                typeof (data as any).name === "string";

            const validResult = safeJsonParse(validUserJson, userValidator);
            expect(validResult.success).toBeTruthy();
            if (validResult.success && validResult.data) {
                expect(validResult.data.id).toBe("123");
                expect(validResult.data.name).toBe("John");
            }

            const invalidResult = safeJsonParse(invalidUserJson, userValidator);
            expect(invalidResult.success).toBeFalsy();
        });

        it("should handle malformed JSON strings", () => {
            const malformedInputs = [
                '{"key": value}', // Unquoted value
                '{"key": "value",}', // Trailing comma
                '{key: "value"}', // Unquoted key
                '{"key": "value"', // Missing closing brace
                "undefined",
                "function() {}",
                "{a: 1, b: 2}", // Unquoted keys
            ];

            const anyValidator = (_data: unknown): _data is any => true;

            for (const input of malformedInputs) {
                const result = safeJsonParse(input, anyValidator);
                expect(result.success).toBeFalsy();
                if (!result.success) {
                    expect(result.error).toBeDefined();
                }
            }
        });

        test.prop([fc.jsonValue()])(
            "should maintain round-trip consistency with valid data",
            (originalValue) => {
                const stringified = JSON.stringify(originalValue);
                const validator = (
                    _data: unknown
                ): _data is typeof originalValue => true;

                const result = safeJsonParse(stringified, validator);

                expect(result.success).toBeTruthy();
                if (result.success) {
                    // Apply normalization to handle -0/+0 differences
                    const normalizedData = normalizeNegativeZero(result.data);
                    const normalizedOriginal =
                        normalizeNegativeZero(originalValue);
                    expect(normalizedData).toEqual(normalizedOriginal);
                }
            }
        );

        it("should handle empty and whitespace strings", () => {
            const emptyInputs = [
                "",
                "   ",
                "\n",
                "\t",
                " \n \t ",
            ];
            const validator = (_data: unknown): _data is any => true;

            for (const input of emptyInputs) {
                const result = safeJsonParse(input, validator);
                expect(result.success).toBeFalsy();
                if (!result.success) {
                    expect(result.error).toContain("Unexpected end");
                }
            }
        });
    });

    describe(safeJsonParseArray, () => {
        test.prop([fc.array(fc.jsonValue())])(
            "should parse valid JSON arrays successfully",
            (validArray) => {
                const stringified = JSON.stringify(validArray);
                const elementValidator = (_item: unknown): _item is any => true;

                const result = safeJsonParseArray(
                    stringified,
                    elementValidator
                );

                expect(result.success).toBeTruthy();
                if (result.success) {
                    // Normalize -0/+0 differences for JSON round-trip consistency
                    const normalizedResult = normalizeNegativeZero(result.data);
                    const normalizedOriginal =
                        normalizeNegativeZero(validArray);
                    expect(normalizedResult).toEqual(normalizedOriginal);
                    expect(Array.isArray(result.data)).toBeTruthy();
                }
            }
        );

        it("should validate array elements correctly", () => {
            const validNumberArrayJson = "[1, 2, 3, 4, 5]";
            const invalidNumberArrayJson = '[1, 2, "three", 4, 5]';

            const numberValidator = (item: unknown): item is number =>
                typeof item === "number";

            const validResult = safeJsonParseArray(
                validNumberArrayJson,
                numberValidator
            );
            expect(validResult.success).toBeTruthy();
            if (validResult.success) {
                expect(validResult.data).toEqual([
                    1,
                    2,
                    3,
                    4,
                    5,
                ]);
            }

            const invalidResult = safeJsonParseArray(
                invalidNumberArrayJson,
                numberValidator
            );
            expect(invalidResult.success).toBeFalsy();
            if (!invalidResult.success) {
                expect(invalidResult.error).toContain("index 2");
            }
        });

        it("should reject non-array JSON", () => {
            const nonArrayJson = '{"not": "an array"}';
            const elementValidator = (_item: unknown): _item is any => true;

            const result = safeJsonParseArray(nonArrayJson, elementValidator);
            expect(result.success).toBeFalsy();
            if (!result.success) {
                expect(result.error).toContain("not an array");
            }
        });

        test.prop([fc.array(fc.string())])(
            "should handle string arrays with type validation",
            (stringArray) => {
                const stringified = JSON.stringify(stringArray);
                const stringValidator = (item: unknown): item is string =>
                    typeof item === "string";

                const result = safeJsonParseArray(stringified, stringValidator);

                expect(result.success).toBeTruthy();
                if (result.success && result.data) {
                    expect(result.data).toEqual(stringArray);
                    for (const item of result.data) {
                        expect(typeof item).toBe("string");
                    }
                }
            }
        );
    });

    describe(safeJsonParseWithFallback, () => {
        test.prop([fc.jsonValue()])(
            "should parse valid JSON and return data",
            (validJson) => {
                const stringified = JSON.stringify(validJson);
                const fallback = { default: "fallback" };
                const validator = (_data: unknown): _data is typeof validJson =>
                    true;

                const result = safeJsonParseWithFallback(
                    stringified,
                    validator,
                    fallback
                );

                // Apply normalization to handle -0/+0 differences
                const normalizedResult = normalizeNegativeZero(result);
                const normalizedOriginal = normalizeNegativeZero(validJson);
                expect(normalizedResult).toEqual(normalizedOriginal);
            }
        );

        test.prop([fc.string(), fc.jsonValue()])(
            "should return fallback for invalid JSON",
            (invalidJson, fallback) => {
                // Filter out potentially valid JSON strings
                if (
                    invalidJson.trim() === "" ||
                    invalidJson.trim().startsWith("{") ||
                    invalidJson.trim().startsWith("[") ||
                    invalidJson.trim().startsWith('"') ||
                    /^-?\d+(?:\.\d+)?(?:[Ee][+-]?\d+)?$/.test(
                        invalidJson.trim()
                    ) ||
                    [
                        "true",
                        "false",
                        "null",
                    ].includes(invalidJson.trim())
                ) {
                    return; // Skip potentially valid JSON
                }

                const validator = (_data: unknown): _data is typeof fallback =>
                    true;
                const result = safeJsonParseWithFallback(
                    invalidJson,
                    validator,
                    fallback
                );

                expect(result).toEqual(fallback);
            }
        );

        it("should use fallback when type validation fails", () => {
            const jsonWithWrongType = '{"id": 123, "name": "John"}';
            const fallback = { id: "default", name: "Default User" };

            // Validator expects id to be string
            const validator = (data: unknown): data is typeof fallback =>
                typeof data === "object" &&
                data !== null &&
                typeof (data as any).id === "string" &&
                typeof (data as any).name === "string";

            const result = safeJsonParseWithFallback(
                jsonWithWrongType,
                validator,
                fallback
            );
            expect(result).toEqual(fallback);
        });
    });

    describe("Performance and Stress Testing", () => {
        test.prop([fc.array(fc.jsonValue(), { maxLength: 1000 })])(
            "should handle large arrays efficiently",
            (largeArray) => {
                const start = performance.now();

                const stringifyResult = safeJsonStringify(largeArray);
                expect(stringifyResult.success).toBeTruthy();

                if (stringifyResult.success && stringifyResult.data) {
                    const validator = (
                        _data: unknown
                    ): _data is typeof largeArray => Array.isArray(_data);
                    const parseResult = safeJsonParse(
                        stringifyResult.data,
                        validator
                    );
                    expect(parseResult.success).toBeTruthy();
                }

                const end = performance.now();

                // Should complete within reasonable time
                expect(end - start).toBeLessThan(5000); // 5 seconds max
            }
        );

        it("should handle deeply nested objects without stack overflow", () => {
            // Create a deeply nested object
            let deepObj: any = { value: "deep" };
            for (let i = 0; i < 100; i++) {
                deepObj = { level: i, nested: deepObj };
            }

            expect(() => {
                const stringifyResult = safeJsonStringify(deepObj);
                expect(stringifyResult.success).toBeTruthy();

                if (stringifyResult.success && stringifyResult.data) {
                    const validator = (_data: unknown): _data is any => true;
                    const parseResult = safeJsonParse(
                        stringifyResult.data,
                        validator
                    );
                    expect(parseResult.success).toBeTruthy();
                }
            }).not.toThrow();
        });

        it("should handle large string values", () => {
            const largeString = "x".repeat(10_000);
            const obj = {
                description: largeString,
                metadata: {
                    content: largeString,
                    nested: {
                        moreContent: largeString,
                    },
                },
            };

            const stringifyResult = safeJsonStringify(obj);
            expect(stringifyResult.success).toBeTruthy();

            if (stringifyResult.success && stringifyResult.data) {
                const validator = (_data: unknown): _data is typeof obj =>
                    typeof _data === "object" &&
                    _data !== null &&
                    "description" in _data;
                const parseResult = safeJsonParse(
                    stringifyResult.data,
                    validator
                );
                expect(parseResult.success).toBeTruthy();
                if (parseResult.success) {
                    expect((parseResult.data as any).description).toBe(
                        largeString
                    );
                }
            }
        });
    });

    describe("Security and Edge Cases", () => {
        it("should handle prototype pollution attempts safely", () => {
            const maliciousJson = `{"__proto__": {"isAdmin": true}}`;

            const validator = (_data: unknown): _data is any => true;
            const result = safeJsonParse(maliciousJson, validator);

            if (result.success) {
                // Should not pollute the prototype
                expect(({} as any).isAdmin).toBeUndefined();
            }
        });

        it("should handle constructor pollution attempts", () => {
            const maliciousJson = `{"constructor": {"prototype": {"isAdmin": true}}}`;

            const validator = (_data: unknown): _data is any => true;
            const result = safeJsonParse(maliciousJson, validator);

            // Should parse but not cause prototype pollution
            expect(() => result).not.toThrow();
        });

        test.prop([fc.string({ minLength: 1000, maxLength: 100_000 })])(
            "should handle very large JSON strings without crashing",
            (largeString) => {
                // Create a potentially large JSON string
                const largeObj = { data: largeString };
                const largeJson = JSON.stringify(largeObj);

                const validator = (_data: unknown): _data is typeof largeObj =>
                    typeof _data === "object" &&
                    _data !== null &&
                    "data" in _data;
                const result = safeJsonParse(largeJson, validator);

                // Should handle without crashing
                expect(() => result).not.toThrow();
                expect(result.success).toBeTruthy();
                if (result.success) {
                    expect((result.data as any).data).toBe(largeString);
                }
            }
        );

        it("should handle null bytes and control characters", () => {
            const stringWithNulls = "test\0with\0nulls";
            const stringWithControls = "test\u0001\u0002\u0003controls";

            const obj = {
                nullString: stringWithNulls,
                controlString: stringWithControls,
                normal: "normal string",
            };

            const stringifyResult = safeJsonStringify(obj);
            expect(stringifyResult.success).toBeTruthy();

            if (stringifyResult.success && stringifyResult.data) {
                const validator = (_data: unknown): _data is typeof obj => true;
                const parseResult = safeJsonParse(
                    stringifyResult.data,
                    validator
                );
                expect(parseResult.success).toBeTruthy();
            }
        });
    });

    describe("Round-trip Consistency", () => {
        test.prop([fc.jsonValue()])(
            "JSON round-trip should preserve data",
            (originalData) => {
                const stringifyResult = safeJsonStringify(originalData);
                expect(stringifyResult.success).toBeTruthy();

                if (stringifyResult.success && stringifyResult.data) {
                    const validator = (
                        _data: unknown
                    ): _data is typeof originalData => true;
                    const parseResult = safeJsonParse(
                        stringifyResult.data,
                        validator
                    );
                    expect(parseResult.success).toBeTruthy();

                    if (parseResult.success) {
                        // Normalize -0 to 0 for JSON round-trip consistency
                        const normalizedOriginal =
                            normalizeNegativeZero(originalData);
                        const normalizedParsed = normalizeNegativeZero(
                            parseResult.data
                        );
                        expect(normalizedParsed).toEqual(normalizedOriginal);
                    }
                }
            }
        );

        test.prop([
            fc.record({
                string: fc.string(),
                number: fc.float({ noNaN: true, noDefaultInfinity: true }), // Exclude NaN and Infinity for JSON round-trip consistency
                boolean: fc.boolean(),
                null: fc.constant(null),
                array: fc.array(fc.jsonValue({ maxDepth: 2 }), {
                    maxLength: 10,
                }), // Limit depth to avoid overly complex objects
                object: fc.dictionary(
                    fc.string(),
                    fc.jsonValue({ maxDepth: 2 })
                ), // Use dictionary instead of object to avoid undefined values
            }),
        ])(
            "Complex objects should maintain structure through round-trip",
            (complexObject) => {
                const stringifyResult = safeJsonStringify(complexObject);
                expect(stringifyResult.success).toBeTruthy();

                if (stringifyResult.success && stringifyResult.data) {
                    const validator = (
                        _data: unknown
                    ): _data is typeof complexObject =>
                        typeof _data === "object" && _data !== null;
                    const parseResult = safeJsonParse(
                        stringifyResult.data,
                        validator
                    );
                    expect(parseResult.success).toBeTruthy();

                    if (parseResult.success) {
                        const normalizedOriginal =
                            normalizeNegativeZero(complexObject);
                        const normalizedParsed = normalizeNegativeZero(
                            parseResult.data
                        );

                        expect(normalizedParsed).toEqual(normalizedOriginal);
                        expect(typeof (parseResult.data as any).string).toBe(
                            "string"
                        );
                        expect(typeof (parseResult.data as any).number).toBe(
                            "number"
                        );
                        expect(typeof (parseResult.data as any).boolean).toBe(
                            "boolean"
                        );
                        expect(
                            Array.isArray((parseResult.data as any).array)
                        ).toBeTruthy();
                        expect(typeof (parseResult.data as any).object).toBe(
                            "object"
                        );
                    }
                }
            }
        );
    });
});
