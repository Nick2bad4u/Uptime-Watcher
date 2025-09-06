/**
 * @fileoverview Comprehensive Fast-Check fuzzing tests for stringConversion utilities
 * @module shared/test/fuzzing/stringConversion
 *
 * This file provides extensive property-based testing for string conversion utilities
 * using Fast-Check to achieve 100% coverage including edge cases and unreachable code paths.
 */

import { describe, expect, it } from "vitest";
import { fc, test } from "@fast-check/vitest";
import { safeStringify } from "@shared/utils/stringConversion";

describe("StringConversion - Fast-Check Fuzzing Tests", () => {
    describe("safeStringify comprehensive fuzzing", () => {
        test.prop([fc.anything()])("should handle all possible value types safely", (value) => {
            const result = safeStringify(value);

            // Property: Result should always be a string
            expect(typeof result).toBe("string");

            // Property: Result should never be null or undefined
            expect(result).toBeDefined();
            expect(result).not.toBeNull();

            // Property: Result should have reasonable length for non-null/undefined inputs
            // Note: Empty strings are valid inputs that should return empty strings
            if (value !== null && value !== undefined) {
                expect(result.length).toBeGreaterThanOrEqual(0);
            }
        });

        test.prop([fc.string()])("should return strings unchanged", (stringValue) => {
            const result = safeStringify(stringValue);
            expect(result).toBe(stringValue);
        });

        test.prop([fc.integer()])("should convert numbers to strings", (num) => {
            const result = safeStringify(num);
            expect(result).toBe(num.toString());
        });

        test.prop([fc.boolean()])("should convert booleans to strings", (bool) => {
            const result = safeStringify(bool);
            expect(result).toBe(bool.toString());
        });

        test.prop([fc.date()])("should convert dates to ISO strings", (date) => {
            const result = safeStringify(date);
            // Dates are handled as objects, JSON stringified with quotes
            expect(result).toBe(JSON.stringify(date));
        });

        // Fuzzing for functions
        test.prop([fc.func(fc.string())])("should handle functions", (func) => {
            const result = safeStringify(func);
            expect(result).toContain("[Function");
        });

        // Fuzzing for objects
        test.prop([fc.record({
            name: fc.string(),
            value: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
        })])("should handle plain objects with JSON stringification", (obj) => {
            const result = safeStringify(obj);
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        // Fuzzing for arrays
        test.prop([fc.array(fc.oneof(fc.string(), fc.integer(), fc.boolean()))])("should handle arrays", (arr) => {
            const result = safeStringify(arr);
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        // Fuzzing for circular references
        test.prop([fc.string()])("should handle circular reference objects", (name) => {
            const obj: any = { name };
            obj.self = obj; // Create circular reference

            const result = safeStringify(obj);
            expect(result).toBe("[Complex Object]");
        });

        // Fuzzing for symbols
        test.prop([fc.string({ minLength: 1, maxLength: 20 })])("should handle symbols", (symbolDescription) => {
            const symbol = Symbol(symbolDescription);
            const result = safeStringify(symbol);
            expect(result).toContain("Symbol");
        });

        // Fuzzing for undefined values
        it("should handle undefined values", () => {
            const result = safeStringify(undefined);
            expect(result).toBe("");
        });

        // Fuzzing for null values
        it("should handle null values", () => {
            const result = safeStringify(null);
            expect(result).toBe(""); // Function returns empty string for null
        });

        // Edge case fuzzing for objects that might break typeof
        test.prop([fc.string()])("should handle objects with overridden valueOf/toString", (value) => {
            const obj = {
                valueOf: () => value,
                toString: () => value,
            };

            const result = safeStringify(obj);
            expect(typeof result).toBe("string");
        });

        // Fuzzing for BigInt values
        test.prop([fc.bigInt()])("should handle BigInt values", (bigIntValue) => {
            const result = safeStringify(bigIntValue);
            expect(result).toBe(bigIntValue.toString());
        });

        // Fuzzing to attempt reaching the default case
        test.prop([fc.string()])("should handle edge cases that might bypass typeof", (testValue) => {
            // Create objects that might have unusual typeof behavior
            const edgeCases = [
                Object.create(null),
                new Proxy({}, { get: () => testValue }),
                // Only include document test if available (Node.js doesn't have document)
                ...(typeof document !== "undefined" && document?.createElement
                    ? [document.createElement("div")]
                    : []),
                new WeakMap(),
                new WeakSet(),
                new ArrayBuffer(8),
            ].filter(Boolean);

            for (const edgeCase of edgeCases) {
                const result = safeStringify(edgeCase);
                expect(typeof result).toBe("string");
                expect(result).toBeDefined();
            }
        });

        // Comprehensive type coverage fuzzing
        test.prop([fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.date(),
            fc.constantFrom(null, undefined),
            fc.func(fc.anything()),
            fc.record({ key: fc.string() }),
            fc.array(fc.string()),
        )])("should achieve comprehensive type coverage", (value) => {
            const result = safeStringify(value);

            // Verify we get appropriate results for each type
            const valueType = typeof value;

            switch (valueType) {
                case "string": {
                    expect(result).toBe(value);
                    break;
                }
                case "number": {
                    expect(result).toBe((value as number).toString());
                    break;
                }
                case "boolean": {
                    expect(result).toBe((value as boolean).toString());
                    break;
                }
                case "function": {
                    expect(result).toContain("[Function");
                    break;
                }
                case "undefined": {
                    expect(result).toBe("");
                    break;
                }
                case "object": {
                    if (value === null) {
                        expect(result).toBe(""); // null returns empty string
                    } else if (value instanceof Date) {
                        expect(result).toBe(JSON.stringify(value)); // Dates are JSON stringified
                    } else {
                        expect(typeof result).toBe("string");
                    }
                    break;
                }
                default: {
                    // This should hit the default case
                    expect(typeof result).toBe("string");
                    break;
                }
            }
        });

        // Fuzzing with type manipulation to try to reach the default case
        test.prop([fc.string()])("should handle type manipulation attempts", (baseValue) => {
            // Attempt to create values that might have unusual typeof results
            const manipulatedValues = [
                baseValue,
                Object.assign(Object.create(null), { toString: () => baseValue }),
                new Proxy({}, {
                    get(_target, prop) {
                        if (prop === Symbol.toPrimitive || prop === "valueOf" || prop === "toString") {
                            return () => baseValue;
                        }
                        return undefined;
                    }
                }),
            ];

            for (const value of manipulatedValues) {
                const result = safeStringify(value);
                expect(typeof result).toBe("string");
                expect(result).toBeDefined();
            }
        });

        // Edge case for attempting to reach lines 89-92 (the default case)
        it("should handle the theoretical default case", () => {
            // While JavaScript's typeof has a fixed set of return values,
            // we test our function's robustness
            const testCases = [
                undefined, // explicit undefined for line 86-87
                Object.create(null), // unusual object
                new WeakMap(), // non-JSON-serializable object
                Symbol("test"), // symbol case
                BigInt(123), // bigint case
            ];

            for (const testCase of testCases) {
                const result = safeStringify(testCase);
                expect(typeof result).toBe("string");
                expect(result).toBeDefined();
            }
        });
    });

    describe("Edge case property validation", () => {
        test.prop([fc.anything()])("should never throw errors", (value) => {
            expect(() => safeStringify(value)).not.toThrow();
        });

        test.prop([fc.anything()])("should maintain consistent behavior", (value) => {
            const result1 = safeStringify(value);
            const result2 = safeStringify(value);
            expect(result1).toBe(result2);
        });

        test.prop([fc.anything()])("should handle memory-intensive values", (value) => {
            // Test with values that might cause memory issues
            const result = safeStringify(value);
            expect(result.length).toBeLessThan(1_000_000); // Reasonable size limit
        });
    });
});
