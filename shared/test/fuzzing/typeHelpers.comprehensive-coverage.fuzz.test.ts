/**
 * Comprehensive fast-check fuzzing tests for typeHelpers utilities.
 *
 * @remarks
 * These property-based tests use fast-check to systematically explore edge
 * cases and verify type helper function invariants across all possible
 * JavaScript values.
 *
 * Focuses on achieving 100% coverage for typeHelpers module functions:
 *
 * - CastIpcResponse
 * - IsArray
 * - IsRecord
 * - SafePropertyAccess
 * - ValidateAndConvert
 *
 * @packageDocumentation
 */

import fc from "fast-check";
import { test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import {
    castIpcResponse,
    isArray,
    isRecord,
    safePropertyAccess,
    validateAndConvert,
} from "../../utils/typeHelpers";

describe("TypeHelpers Complete Coverage Fuzzing Tests", () => {
    describe(castIpcResponse, () => {
        test.prop([fc.anything()])(
            "should return input when no validator provided",
            (input) => {
                const result = castIpcResponse(input);
                expect(result).toBe(input);
            }
        );

        test.prop([fc.anything()])(
            "should return input when validator returns true",
            (input) => {
                const alwaysTrue = (_: unknown): _ is any => true;
                const result = castIpcResponse(input, alwaysTrue);
                expect(result).toBe(input);
            }
        );

        test.prop([fc.anything()])(
            "should throw when validator returns false",
            (input) => {
                const alwaysFalse = (_: unknown): _ is any => false;
                expect(() => castIpcResponse(input, alwaysFalse)).toThrowError(
                    "IPC response validation failed"
                );
            }
        );

        test.prop([fc.anything(), fc.func(fc.boolean())])(
            "should handle any validator function",
            (input, validatorFunc) => {
                const validator = (val: unknown): val is typeof input =>
                    validatorFunc(val);

                if (validatorFunc(input)) {
                    expect(() =>
                        castIpcResponse(input, validator)).not.toThrowError();
                    expect(castIpcResponse(input, validator)).toBe(input);
                } else {
                    expect(() =>
                        castIpcResponse(input, validator)).toThrowError();
                }
            }
        );

        test.prop([
            fc.oneof(
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined),
                fc.object(),
                fc.array(fc.anything())
            ),
        ])("should preserve type information through casting", (input) => {
            const result = castIpcResponse(input);
            expect(typeof result).toBe(typeof input);
            if (Array.isArray(input)) {
                expect(Array.isArray(result)).toBeTruthy();
            }
            if (input === null) {
                expect(result).toBe(null);
            }
        });
    });

    describe(isArray, () => {
        test.prop([fc.array(fc.anything())])(
            "should return true for all arrays",
            (arr) => {
                expect(isArray(arr)).toBeTruthy();
            }
        );

        test.prop([
            fc.oneof(
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined),
                fc.object(),
                fc.func(fc.anything()),
                fc.bigInt(),
                fc.constant(Symbol("test"))
            ),
        ])("should return false for non-arrays", (nonArray) => {
            expect(isArray(nonArray)).toBeFalsy();
        });

        test.prop([fc.anything()])(
            "should match Array.isArray behavior exactly",
            (value) => {
                expect(isArray(value)).toBe(Array.isArray(value));
            }
        );

        it("should handle edge cases", () => {
            expect(isArray([])).toBeTruthy();
            expect(isArray([])).toBeTruthy();
            expect(
                isArray([
                    1,
                    2,
                    3,
                ])
            ).toBeTruthy();
            expect(isArray({})).toBeFalsy();
            // Test with arguments-like object instead of 'arguments' keyword
            const argumentsLike = { 0: "a", 1: "b", length: 2 };
            expect(isArray(argumentsLike)).toBeFalsy();
            expect(isArray("[]")).toBeFalsy();
        });
    });

    describe(isRecord, () => {
        test.prop([fc.object()])("should return true for plain objects", (
            obj
        ) => {
            expect(isRecord(obj)).toBeTruthy();
        });

        test.prop([fc.array(fc.anything())])("should return false for arrays", (
            arr
        ) => {
            expect(isRecord(arr)).toBeFalsy();
        });

        test.prop([
            fc.oneof(
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined),
                fc.func(fc.anything()),
                fc.bigInt(),
                fc.constant(Symbol("test"))
            ),
        ])("should return false for non-objects", (nonObject) => {
            expect(isRecord(nonObject)).toBeFalsy();
        });

        it("should handle specific edge cases", () => {
            expect(isRecord({})).toBeTruthy();
            expect(isRecord(Object.create(null))).toBeTruthy();
            expect(isRecord(new Date())).toBeTruthy();
            expect(isRecord(/(?:)/)).toBeTruthy();
            expect(isRecord(null)).toBeFalsy();
            expect(isRecord([])).toBeFalsy();
            expect(isRecord(() => {})).toBeFalsy();
        });

        test.prop([fc.anything()])("should be consistent with internal logic", (
            value
        ) => {
            const result = isRecord(value);
            const expected =
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value);
            expect(result).toBe(expected);
        });
    });

    describe(safePropertyAccess, () => {
        test.prop([fc.object(), fc.string()])(
            "should return property value when property exists",
            (obj, key) => {
                // Add the key to guarantee it exists
                const testObj = { ...obj, [key]: "test-value" };
                const result = safePropertyAccess(testObj, key);
                expect(result).toBe("test-value");
            }
        );

        test.prop([fc.object(), fc.string()])(
            "should return undefined when property doesn't exist",
            (obj, key) => {
                // Ensure the key doesn't exist by creating a fresh object without it
                const testObj = { ...obj };
                // Use Reflect.deleteProperty for safe dynamic deletion
                Reflect.deleteProperty(testObj, key);

                if (!(key in testObj)) {
                    const result = safePropertyAccess(testObj, key);
                    expect(result).toBeUndefined();
                }
            }
        );

        test.prop([
            fc.oneof(
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined),
                fc.array(fc.anything()),
                fc.func(fc.anything())
            ),
            fc.string(),
        ])("should return undefined for non-objects", (nonObject, key) => {
            const result = safePropertyAccess(nonObject, key);
            expect(result).toBeUndefined();
        });

        it("should handle edge cases", () => {
            const obj = { a: 1, b: null, c: undefined, d: false, e: 0, f: "" };

            expect(safePropertyAccess(obj, "a")).toBe(1);
            expect(safePropertyAccess(obj, "b")).toBe(null);
            expect(safePropertyAccess(obj, "c")).toBe(undefined);
            expect(safePropertyAccess(obj, "d")).toBeFalsy();
            expect(safePropertyAccess(obj, "e")).toBe(0);
            expect(safePropertyAccess(obj, "f")).toBe("");
            expect(safePropertyAccess(obj, "nonexistent")).toBeUndefined();
        });

        test.prop([fc.string()])("should handle inherited properties", (
            key
        ) => {
            const parent = { [key]: "inherited" };
            const child = Object.create(parent);
            child.own = "own-property";

            const result = safePropertyAccess(child, key);
            expect(result).toBe("inherited");
        });
    });

    describe(validateAndConvert, () => {
        test.prop([fc.string()])(
            "should return validated value when validator passes",
            (str) => {
                const isString = (val: unknown): val is string =>
                    typeof val === "string";
                const result = validateAndConvert(str, isString);
                expect(result).toBe(str);
                expect(typeof result).toBe("string");
            }
        );

        test.prop([fc.integer()])("should throw when validator fails", (
            num
        ) => {
            const isString = (val: unknown): val is string =>
                typeof val === "string";
            expect(() => validateAndConvert(num, isString)).toThrowError(
                "Type validation failed"
            );
        });

        test.prop([fc.anything(), fc.string()])(
            "should use custom error message when provided",
            (value, errorMessage) => {
                const alwaysFail = (_: unknown): _ is never => false;
                expect(() =>
                    validateAndConvert(
                        value,
                        alwaysFail,
                        errorMessage
                    )).toThrowError(errorMessage);
            }
        );

        test.prop([fc.anything()])("should work with complex validators", (
            value
        ) => {
            const isArrayOfNumbers = (val: unknown): val is number[] =>
                Array.isArray(val) &&
                val.every((item) => typeof item === "number");

            if (
                Array.isArray(value) &&
                value.every((item) => typeof item === "number")
            ) {
                expect(() =>
                    validateAndConvert(
                        value,
                        isArrayOfNumbers
                    )).not.toThrowError();
                const result = validateAndConvert(value, isArrayOfNumbers);
                expect(Array.isArray(result)).toBeTruthy();
            } else {
                expect(() =>
                    validateAndConvert(value, isArrayOfNumbers)).toThrowError();
            }
        });

        it("should handle type narrowing correctly", () => {
            const mixed: unknown = "hello";
            const isString = (val: unknown): val is string =>
                typeof val === "string";

            const result = validateAndConvert(mixed, isString);
            // TypeScript should now know result is a string
            expect(result.toUpperCase()).toBe("HELLO");
        });

        test.prop([fc.func(fc.boolean()), fc.anything()])(
            "should respect validator function behavior",
            (validatorFunc, value) => {
                const validator = (val: unknown): val is typeof value =>
                    validatorFunc(val);

                if (validatorFunc(value)) {
                    expect(() =>
                        validateAndConvert(
                            value,
                            validator
                        )).not.toThrowError();
                    expect(validateAndConvert(value, validator)).toBe(value);
                } else {
                    expect(() =>
                        validateAndConvert(value, validator)).toThrowError();
                }
            }
        );
    });

    describe("Integration Tests", () => {
        test.prop([fc.anything()])("should work together in common patterns", (
            value
        ) => {
            // Pattern: Check if array, then access properties safely
            if (isArray(value)) {
                expect(Array.isArray(value)).toBeTruthy();
                const length = safePropertyAccess(value, "length");
                expect(typeof length).toBe("number");
            }

            // Pattern: Check if record, then validate and convert
            if (isRecord(value)) {
                const isRecordValidator = (
                    val: unknown
                ): val is Record<string, unknown> => isRecord(val);

                expect(() =>
                    validateAndConvert(
                        value,
                        isRecordValidator
                    )).not.toThrowError();
                const converted = validateAndConvert(value, isRecordValidator);
                expect(isRecord(converted)).toBeTruthy();
            }
        });

        test.prop([fc.object(), fc.string()])(
            "should handle IPC response pattern",
            (mockResponse, propertyKey) => {
                // Simulate IPC response handling
                const validator = (val: unknown): val is typeof mockResponse =>
                    isRecord(val);

                if (isRecord(mockResponse)) {
                    const validated = validateAndConvert(
                        mockResponse,
                        validator
                    );
                    const casted = castIpcResponse(validated, validator);
                    const property = safePropertyAccess(casted, propertyKey);

                    expect(isRecord(casted)).toBeTruthy();
                    if (propertyKey in mockResponse) {
                        expect(property).toBe(mockResponse[propertyKey]);
                    } else {
                        expect(property).toBeUndefined();
                    }
                }
            }
        );
    });
});
