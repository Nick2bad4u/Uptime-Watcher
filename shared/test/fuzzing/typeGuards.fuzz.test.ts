/**
 * Comprehensive fast-check fuzzing tests for typeGuards utilities.
 *
 * @remarks
 * These property-based tests use fast-check to systematically explore edge cases
 * and verify type guard invariants across all possible JavaScript values.
 *
 * @packageDocumentation
 */

import fc from "fast-check";
import { test } from "@fast-check/vitest";
import { describe, expect } from "vitest";

import {
    isObject,
    isNumber,
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
    isPositiveNumber,
    isString,
    isValidPort,
    isValidTimestamp,
} from "../../utils/typeGuards";

describe("TypeGuards Fuzzing Tests", () => {
    describe("isObject", () => {
        test.prop([fc.anything()])(
            "should return true only for plain objects (not null, arrays, or primitives)",
            (value) => {
                const result = isObject(value);

                if (result) {
                    // If isObject returns true, it must be an object
                    expect(typeof value).toBe("object");
                    expect(value).not.toBeNull();
                    expect(Array.isArray(value)).toBe(false);
                } else {
                    // If isObject returns false, it's either null, array, or not object
                    const isValidFalse =
                        value === null ||
                        Array.isArray(value) ||
                        typeof value !== "object";
                    expect(isValidFalse).toBe(true);
                }
            }
        );

        test.prop([fc.dictionary(fc.string(), fc.anything())])(
            "should return true for all plain objects",
            (plainObject) => {
                expect(isObject(plainObject)).toBe(true);
            }
        );

        test.prop([fc.array(fc.anything())])(
            "should return false for all arrays",
            (array) => {
                expect(isObject(array)).toBe(false);
            }
        );

        test.prop([fc.constantFrom(null, undefined)])(
            "should return false for null and undefined",
            (nullish) => {
                expect(isObject(nullish)).toBe(false);
            }
        );
    });

    describe("isNumber", () => {
        test.prop([fc.anything()])(
            "should return true only for finite numbers (excluding NaN)",
            (value) => {
                const result = isNumber(value);

                if (result) {
                    expect(typeof value).toBe("number");
                    expect(Number.isNaN(value)).toBe(false);
                } else {
                    const isValidFalse =
                        typeof value !== "number" ||
                        Number.isNaN(value);
                    expect(isValidFalse).toBe(true);
                }
            }
        );

        test.prop([fc.float()])(
            "should return true for all finite numbers",
            (num) => {
                fc.pre(!Number.isNaN(num)); // Skip NaN inputs
                expect(isNumber(num)).toBe(true);
            }
        );

        test.prop([fc.constantFrom(Number.NaN, Infinity, -Infinity)])(
            "should handle special number values correctly",
            (specialNum) => {
                const result = isNumber(specialNum);
                if (Number.isNaN(specialNum)) {
                    expect(result).toBe(false);
                } else {
                    expect(result).toBe(true); // Infinity is still a number
                }
            }
        );
    });

    describe("hasProperties", () => {
        test.prop([
            fc.anything(),
            fc.array(fc.oneof(fc.string(), fc.constantFrom(Symbol("test"))))
        ])(
            "should return true only when object has all specified properties",
            (value, properties) => {
                const result = hasProperties(value, properties);

                if (result) {
                    // If hasProperties returns true, value must be object with all props
                    expect(isObject(value)).toBe(true);
                    for (const prop of properties) {
                        expect(Object.hasOwn(value as object, prop)).toBe(true);
                    }
                }

                if (isObject(value)) {
                    const allPropsExist = properties.every(prop => Object.hasOwn(value, prop));
                    expect(result).toBe(allPropsExist);
                }
            }
        );

        test.prop([fc.dictionary(fc.string(), fc.anything())])(
            "should return true when checking for properties that exist",
            (obj) => {
                const existingProps = Object.keys(obj);
                if (existingProps.length > 0) {
                    const someProps = existingProps.slice(0, Math.min(3, existingProps.length));
                    expect(hasProperties(obj, someProps)).toBe(true);
                }
            }
        );

        test.prop([fc.dictionary(fc.string(), fc.anything()), fc.string()])(
            "should return false when checking for non-existent property",
            (obj, nonExistentProp) => {
                fc.pre(!Object.hasOwn(obj, nonExistentProp)); // Ensure prop doesn't exist
                expect(hasProperties(obj, [nonExistentProp])).toBe(false);
            }
        );
    });

    describe("hasProperty", () => {
        test.prop([fc.anything(), fc.string()])(
            "should return true only when object has the specified property",
            (value, property) => {
                const result = hasProperty(value, property);

                if (result) {
                    expect(isObject(value)).toBe(true);
                    expect(Object.hasOwn(value as object, property)).toBe(true);
                } else {
                    // If not has property, either not an object or property doesn't exist
                    const isValidFalse =
                        !isObject(value) ||
                        !Object.hasOwn(value as object, property);
                    expect(isValidFalse).toBe(true);
                }
            }
        );

        test.prop([fc.dictionary(fc.string(), fc.anything())])(
            "should detect existing properties",
            (obj) => {
                const keys = Object.keys(obj);
                for (const key of keys) {
                    expect(hasProperty(obj, key)).toBe(true);
                }
            }
        );
    });

    describe("isArray", () => {
        test.prop([fc.anything()])(
            "should return true only for arrays",
            (value) => {
                const result = isArray(value);
                expect(result).toBe(Array.isArray(value));
            }
        );

        test.prop([fc.array(fc.anything())])(
            "should return true for all arrays without validator",
            (array) => {
                expect(isArray(array)).toBe(true);
            }
        );

        test.prop([fc.array(fc.string())])(
            "should validate array items when validator provided",
            (stringArray) => {
                const isStringValidator = (item: unknown): item is string => typeof item === "string";
                expect(isArray(stringArray, isStringValidator)).toBe(true);
            }
        );

        test.prop([fc.array(fc.oneof(fc.string(), fc.integer()))])(
            "should return false when items don't match validator",
            (mixedArray) => {
                fc.pre(mixedArray.some(item => typeof item !== "string")); // Ensure mixed types
                const isStringValidator = (item: unknown): item is string => typeof item === "string";
                expect(isArray(mixedArray, isStringValidator)).toBe(false);
            }
        );
    });

    describe("isBoolean", () => {
        test.prop([fc.anything()])(
            "should return true only for boolean values",
            (value) => {
                const result = isBoolean(value);
                expect(result).toBe(typeof value === "boolean");
            }
        );

        test.prop([fc.boolean()])(
            "should return true for all boolean values",
            (bool) => {
                expect(isBoolean(bool)).toBe(true);
            }
        );
    });

    describe("isDate", () => {
        test.prop([fc.anything()])(
            "should return true only for valid Date instances",
            (value) => {
                const result = isDate(value);

                if (result) {
                    expect(value instanceof Date).toBe(true);
                    expect(Number.isNaN((value as Date).getTime())).toBe(false);
                } else {
                    // If not a date, ensure it's either not a Date instance or invalid
                    const isValidFalse =
                        !(value instanceof Date) ||
                        Number.isNaN((value as Date).getTime());
                    expect(isValidFalse).toBe(true);
                }
            }
        );

        test.prop([fc.date()])(
            "should return true for valid Date instances",
            (date) => {
                expect(isDate(date)).toBe(true);
            }
        );

        test("should return false for invalid dates", () => {
            const invalidDate = new Date("invalid");
            expect(isDate(invalidDate)).toBe(false);
        });
    });

    describe("isError", () => {
        test.prop([fc.anything()])(
            "should return true only for Error instances",
            (value) => {
                const result = isError(value);
                expect(result).toBe(value instanceof Error);
            }
        );

        test.prop([fc.oneof(
            fc.constant(new Error("test")),
            fc.constant(new TypeError("test")),
            fc.constant(new RangeError("test"))
        )])(
            "should return true for all Error types",
            (error) => {
                expect(isError(error)).toBe(true);
            }
        );
    });

    describe("isFiniteNumber", () => {
        test.prop([fc.anything()])(
            "should return true only for finite numbers",
            (value) => {
                const result = isFiniteNumber(value);

                if (result) {
                    expect(typeof value).toBe("number");
                    expect(Number.isNaN(value)).toBe(false);
                    expect(Number.isFinite(value)).toBe(true);
                } else {
                    // If not finite, it's either not a number, NaN, or infinite
                    const isValidFalse =
                        typeof value !== "number" ||
                        Number.isNaN(value) ||
                        !Number.isFinite(value);
                    expect(isValidFalse).toBe(true);
                }
            }
        );

        test.prop([fc.float({ min: Math.fround(-1e10), max: Math.fround(1e10) })])(
            "should return true for finite numbers",
            (finiteNum) => {
                fc.pre(Number.isFinite(finiteNum) && !Number.isNaN(finiteNum));
                expect(isFiniteNumber(finiteNum)).toBe(true);
            }
        );

        test.prop([fc.constantFrom(Infinity, -Infinity, Number.NaN)])(
            "should return false for infinite numbers and NaN",
            (infiniteOrNaN) => {
                expect(isFiniteNumber(infiniteOrNaN)).toBe(false);
            }
        );
    });

    describe("isFunction", () => {
        test.prop([fc.anything()])(
            "should return true only for functions",
            (value) => {
                const result = isFunction(value);
                expect(result).toBe(typeof value === "function");
            }
        );

        test.prop([fc.func(fc.anything())])(
            "should return true for generated functions",
            (func) => {
                expect(isFunction(func)).toBe(true);
            }
        );
    });

    describe("isNonNegativeNumber", () => {
        test.prop([fc.anything()])(
            "should return true only for non-negative numbers",
            (value) => {
                const result = isNonNegativeNumber(value);

                if (result) {
                    expect(typeof value).toBe("number");
                    expect(Number.isNaN(value)).toBe(false);
                    expect((value as number) >= 0).toBe(true);
                } else {
                    // If not non-negative, it's either not a number, NaN, or negative
                    const isValidFalse =
                        typeof value !== "number" ||
                        Number.isNaN(value) ||
                        (value as number) < 0;
                    expect(isValidFalse).toBe(true);
                }
            }
        );

        test.prop([fc.float({ min: 0, max: Math.fround(1e10) })])(
            "should return true for non-negative numbers",
            (nonNegative) => {
                fc.pre(!Number.isNaN(nonNegative) && nonNegative >= 0);
                expect(isNonNegativeNumber(nonNegative)).toBe(true);
            }
        );

        test.prop([fc.float({ min: Math.fround(-1e10), max: Math.fround(-0.001) })])(
            "should return false for negative numbers",
            (negative) => {
                fc.pre(!Number.isNaN(negative) && negative < 0);
                expect(isNonNegativeNumber(negative)).toBe(false);
            }
        );
    });

    describe("isNonNullObject", () => {
        test.prop([fc.anything()])(
            "should be equivalent to isObject",
            (value) => {
                expect(isNonNullObject(value)).toBe(isObject(value));
            }
        );
    });

    describe("isPositiveNumber", () => {
        test.prop([fc.anything()])(
            "should return true only for positive numbers",
            (value) => {
                const result = isPositiveNumber(value);

                if (result) {
                    expect(typeof value).toBe("number");
                    expect(Number.isNaN(value)).toBe(false);
                    expect((value as number) > 0).toBe(true);
                } else {
                    // If not positive, it's either not a number, NaN, or <= 0
                    const isValidFalse =
                        typeof value !== "number" ||
                        Number.isNaN(value) ||
                        (value as number) <= 0;
                    expect(isValidFalse).toBe(true);
                }
            }
        );

        test.prop([fc.float({ min: Math.fround(0.001), max: Math.fround(1e10) })])(
            "should return true for positive numbers",
            (positive) => {
                fc.pre(!Number.isNaN(positive) && positive > 0);
                expect(isPositiveNumber(positive)).toBe(true);
            }
        );

        test.prop([fc.float({ min: Math.fround(-1e10), max: 0 })])(
            "should return false for zero and negative numbers",
            (nonPositive) => {
                fc.pre(!Number.isNaN(nonPositive) && nonPositive <= 0);
                expect(isPositiveNumber(nonPositive)).toBe(false);
            }
        );
    });

    describe("isString", () => {
        test.prop([fc.anything()])(
            "should return true only for strings",
            (value) => {
                const result = isString(value);
                expect(result).toBe(typeof value === "string");
            }
        );

        test.prop([fc.string()])(
            "should return true for all strings",
            (str) => {
                expect(isString(str)).toBe(true);
            }
        );
    });

    describe("isValidPort", () => {
        test.prop([fc.anything()])(
            "should return true only for valid port numbers (1-65535)",
            (value) => {
                const result = isValidPort(value);

                if (result) {
                    expect(typeof value).toBe("number");
                    expect(Number.isNaN(value)).toBe(false);
                    expect(Number.isInteger(value)).toBe(true);
                    expect((value as number) >= 1).toBe(true);
                    expect((value as number) <= 65_535).toBe(true);
                } else {
                    // If not a valid port, it's either not a number, NaN, not integer, or out of range
                    const isValidFalse =
                        typeof value !== "number" ||
                        Number.isNaN(value) ||
                        !Number.isInteger(value) ||
                        (value as number) < 1 ||
                        (value as number) > 65_535;
                    expect(isValidFalse).toBe(true);
                }
            }
        );

        test.prop([fc.integer({ min: 1, max: 65_535 })])(
            "should return true for valid port range",
            (port) => {
                expect(isValidPort(port)).toBe(true);
            }
        );

        test.prop([fc.oneof(
            fc.integer({ min: -1000, max: 0 }),
            fc.integer({ min: 65_536, max: 100_000 }),
            fc.float()
        )])(
            "should return false for invalid ports",
            (invalidPort) => {
                fc.pre(
                    typeof invalidPort === "number" &&
                    !Number.isNaN(invalidPort) &&
                    (invalidPort < 1 || invalidPort > 65_535 || !Number.isInteger(invalidPort))
                );
                expect(isValidPort(invalidPort)).toBe(false);
            }
        );
    });

    describe("isValidTimestamp", () => {
        test.prop([fc.anything()])(
            "should return true only for valid timestamps",
            (value) => {
                const result = isValidTimestamp(value);
                const maxValidTime = Date.now() + 86_400_000; // 1 day from now

                if (result) {
                    expect(typeof value).toBe("number");
                    expect(Number.isNaN(value)).toBe(false);
                    expect((value as number) > 0).toBe(true);
                    expect((value as number) <= maxValidTime).toBe(true);
                } else {
                    // If not a valid timestamp, it's either not a number, NaN, <= 0, or too far in future
                    const isValidFalse =
                        typeof value !== "number" ||
                        Number.isNaN(value) ||
                        (value as number) <= 0 ||
                        (value as number) > maxValidTime;
                    expect(isValidFalse).toBe(true);
                }
            }
        );

        test.prop([fc.integer({ min: 1, max: Date.now() })])(
            "should return true for valid past timestamps",
            (pastTimestamp) => {
                expect(isValidTimestamp(pastTimestamp)).toBe(true);
            }
        );

        test("should return true for current timestamp", () => {
            expect(isValidTimestamp(Date.now())).toBe(true);
        });

        test.prop([fc.oneof(
            fc.integer({ min: -1000, max: 0 }),
            fc.integer({ min: Date.now() + 86_400_000 + 1000, max: Date.now() + 86_400_000 * 30 }) // More than 1 day + buffer in future
        )])(
            "should return false for invalid timestamps",
            (invalidTimestamp) => {
                expect(isValidTimestamp(invalidTimestamp)).toBe(false);
            }
        );
    });

    describe("Edge Cases and Invariants", () => {
        test.prop([fc.anything()])(
            "all type guards should never throw errors",
            (value) => {
                expect(() => {
                    isObject(value);
                    isNumber(value);
                    isArray(value);
                    isBoolean(value);
                    isDate(value);
                    isError(value);
                    isFiniteNumber(value);
                    isFunction(value);
                    isNonNegativeNumber(value);
                    isNonNullObject(value);
                    isPositiveNumber(value);
                    isString(value);
                    isValidPort(value);
                    isValidTimestamp(value);
                }).not.toThrow();
            }
        );

        test.prop([fc.anything()])(
            "all type guards should return boolean values",
            (value) => {
                const results = [
                    isObject(value),
                    isNumber(value),
                    isArray(value),
                    isBoolean(value),
                    isDate(value),
                    isError(value),
                    isFiniteNumber(value),
                    isFunction(value),
                    isNonNegativeNumber(value),
                    isNonNullObject(value),
                    isPositiveNumber(value),
                    isString(value),
                    isValidPort(value),
                    isValidTimestamp(value),
                ];

                for (const result of results) {
                    expect(typeof result).toBe("boolean");
                }
            }
        );

        test.prop([fc.anything(), fc.array(fc.string())])(
            "hasProperties should be consistent with hasProperty",
            (value, props) => {
                // Always run at least one assertion
                expect(typeof hasProperties(value, props)).toBe("boolean");

                if (props.length === 1) {
                    const singlePropResult = hasProperty(value, props[0]!);
                    const multiPropResult = hasProperties(value, props);
                    expect(singlePropResult).toBe(multiPropResult);
                }
            }
        );

        test.prop([fc.anything()])(
            "number type guards should have proper hierarchy",
            (value) => {
                // Always run at least one assertion
                expect(typeof isPositiveNumber(value)).toBe("boolean");

                if (isPositiveNumber(value)) {
                    expect(isNonNegativeNumber(value)).toBe(true);
                    expect(isFiniteNumber(value)).toBe(true);
                    expect(isNumber(value)).toBe(true);
                }

                if (isFiniteNumber(value)) {
                    expect(isNumber(value)).toBe(true);
                }

                if (isNonNegativeNumber(value) && (value as number) > 0) {
                    expect(isPositiveNumber(value)).toBe(true);
                }
            }
        );
    });
});
