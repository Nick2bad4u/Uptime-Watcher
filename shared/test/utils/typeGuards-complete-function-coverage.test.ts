/**
 * @file Complete Function Coverage Tests for typeGuards.ts
 *
 *   This test ensures 100% function coverage for the typeGuards module using the
 *   proven Function Coverage Validation pattern with namespace imports and
 *   systematic function calls.
 */

import { describe, expect, it } from "vitest";
import * as guardsTestModule from "@shared/utils/typeGuards";

describe("TypeGuards - Complete Function Coverage", () => {
    describe("Function Coverage Validation", () => {
        it("should call every exported function for complete coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            // Verify the module exports we expect
            expect(typeof guardsTestModule).toBe("object");
            expect(guardsTestModule).toBeDefined();

            // Test isObject function
            expect(typeof guardsTestModule.isObject).toBe("function");
            expect(guardsTestModule.isObject({})).toBeTruthy();
            expect(guardsTestModule.isObject({ key: "value" })).toBeTruthy();
            expect(guardsTestModule.isObject(null)).toBeFalsy();
            expect(guardsTestModule.isObject([])).toBeFalsy();
            expect(guardsTestModule.isObject("string")).toBeFalsy();
            expect(guardsTestModule.isObject(123)).toBeFalsy();
            expect(guardsTestModule.isObject(undefined)).toBeFalsy();

            // Test isNumber function
            expect(typeof guardsTestModule.isNumber).toBe("function");
            expect(guardsTestModule.isNumber(123)).toBeTruthy();
            expect(guardsTestModule.isNumber(0)).toBeTruthy();
            expect(guardsTestModule.isNumber(-456)).toBeTruthy();
            expect(guardsTestModule.isNumber(3.14)).toBeTruthy();
            expect(guardsTestModule.isNumber(Number.NaN)).toBeFalsy();
            expect(guardsTestModule.isNumber("123")).toBeFalsy();
            expect(guardsTestModule.isNumber(null)).toBeFalsy();
            expect(guardsTestModule.isNumber(undefined)).toBeFalsy();

            // Test hasProperties function
            expect(typeof guardsTestModule.hasProperties).toBe("function");
            const obj = { a: 1, b: 2, c: 3 };
            expect(
                guardsTestModule.hasProperties(obj, ["a", "b"])
            ).toBeTruthy();
            expect(
                guardsTestModule.hasProperties(obj, [
                    "a",
                    "b",
                    "c",
                ])
            ).toBeTruthy();
            expect(guardsTestModule.hasProperties(obj, ["a", "d"])).toBeFalsy();
            expect(guardsTestModule.hasProperties(obj, [])).toBeTruthy();
            expect(guardsTestModule.hasProperties(null, ["a"])).toBeFalsy();
            expect(
                guardsTestModule.hasProperties("not object", ["a"])
            ).toBeFalsy();

            // Test hasProperty function
            expect(typeof guardsTestModule.hasProperty).toBe("function");
            expect(guardsTestModule.hasProperty(obj, "a")).toBeTruthy();
            expect(guardsTestModule.hasProperty(obj, "z")).toBeFalsy();
            expect(guardsTestModule.hasProperty(null, "a")).toBeFalsy();
            expect(
                guardsTestModule.hasProperty("string", "length")
            ).toBeFalsy(); // IsObject excludes strings
            expect(guardsTestModule.hasProperty([], "length")).toBeFalsy(); // IsObject excludes arrays

            // Test isArray function
            expect(typeof guardsTestModule.isArray).toBe("function");
            expect(guardsTestModule.isArray([])).toBeTruthy();
            expect(
                guardsTestModule.isArray([
                    1,
                    2,
                    3,
                ])
            ).toBeTruthy();
            expect(guardsTestModule.isArray({})).toBeFalsy();
            expect(guardsTestModule.isArray("string")).toBeFalsy();
            expect(guardsTestModule.isArray(null)).toBeFalsy();
            expect(guardsTestModule.isArray(undefined)).toBeFalsy();

            // Test isBoolean function
            expect(typeof guardsTestModule.isBoolean).toBe("function");
            expect(guardsTestModule.isBoolean(true)).toBeTruthy();
            expect(guardsTestModule.isBoolean(false)).toBeTruthy();
            expect(guardsTestModule.isBoolean(0)).toBeFalsy();
            expect(guardsTestModule.isBoolean(1)).toBeFalsy();
            expect(guardsTestModule.isBoolean("true")).toBeFalsy();
            expect(guardsTestModule.isBoolean(null)).toBeFalsy();

            // Test isDate function
            expect(typeof guardsTestModule.isDate).toBe("function");
            const date = new Date();
            expect(guardsTestModule.isDate(date)).toBeTruthy();
            expect(
                guardsTestModule.isDate(new Date("2023-01-01"))
            ).toBeTruthy();
            expect(guardsTestModule.isDate("2023-01-01")).toBeFalsy();
            expect(guardsTestModule.isDate(1_672_531_200_000)).toBeFalsy();
            expect(guardsTestModule.isDate({})).toBeFalsy();
            expect(guardsTestModule.isDate(null)).toBeFalsy();

            // Test isError function
            expect(typeof guardsTestModule.isError).toBe("function");
            const error = new Error("test");
            expect(guardsTestModule.isError(error)).toBeTruthy();
            expect(
                guardsTestModule.isError(new TypeError("type error"))
            ).toBeTruthy();
            expect(
                guardsTestModule.isError(new RangeError("range error"))
            ).toBeTruthy();
            expect(guardsTestModule.isError("error string")).toBeFalsy();
            expect(guardsTestModule.isError({ message: "error" })).toBeFalsy();
            expect(guardsTestModule.isError(null)).toBeFalsy();

            // Test isFiniteNumber function
            expect(typeof guardsTestModule.isFiniteNumber).toBe("function");
            expect(guardsTestModule.isFiniteNumber(123)).toBeTruthy();
            expect(guardsTestModule.isFiniteNumber(0)).toBeTruthy();
            expect(guardsTestModule.isFiniteNumber(-456)).toBeTruthy();
            expect(guardsTestModule.isFiniteNumber(3.14)).toBeTruthy();
            expect(guardsTestModule.isFiniteNumber(Infinity)).toBeFalsy();
            expect(guardsTestModule.isFiniteNumber(-Infinity)).toBeFalsy();
            expect(guardsTestModule.isFiniteNumber(Number.NaN)).toBeFalsy();
            expect(guardsTestModule.isFiniteNumber("123")).toBeFalsy();

            // Test isFunction function
            expect(typeof guardsTestModule.isFunction).toBe("function");
            const fn = () => {};
            const namedFn = function namedFn() {};
            const asyncFn = async () => {};
            expect(guardsTestModule.isFunction(fn)).toBeTruthy();
            expect(guardsTestModule.isFunction(namedFn)).toBeTruthy();
            expect(guardsTestModule.isFunction(asyncFn)).toBeTruthy();
            expect(guardsTestModule.isFunction(Math.max)).toBeTruthy();
            expect(guardsTestModule.isFunction("function")).toBeFalsy();
            expect(guardsTestModule.isFunction({})).toBeFalsy();
            expect(guardsTestModule.isFunction(null)).toBeFalsy();

            // Test isNonNegativeNumber function
            expect(typeof guardsTestModule.isNonNegativeNumber).toBe(
                "function"
            );
            expect(guardsTestModule.isNonNegativeNumber(0)).toBeTruthy();
            expect(guardsTestModule.isNonNegativeNumber(123)).toBeTruthy();
            expect(guardsTestModule.isNonNegativeNumber(3.14)).toBeTruthy();
            expect(guardsTestModule.isNonNegativeNumber(-1)).toBeFalsy();
            expect(guardsTestModule.isNonNegativeNumber(-0.1)).toBeFalsy();
            expect(
                guardsTestModule.isNonNegativeNumber(Number.NaN)
            ).toBeFalsy();
            expect(guardsTestModule.isNonNegativeNumber("0")).toBeFalsy();

            // Test isNonNullObject function
            expect(typeof guardsTestModule.isNonNullObject).toBe("function");
            expect(guardsTestModule.isNonNullObject({})).toBeTruthy();
            expect(
                guardsTestModule.isNonNullObject({ key: "value" })
            ).toBeTruthy();
            expect(guardsTestModule.isNonNullObject([])).toBeFalsy(); // Arrays excluded by isObject
            expect(guardsTestModule.isNonNullObject(new Date())).toBeTruthy();
            expect(guardsTestModule.isNonNullObject(null)).toBeFalsy();
            expect(guardsTestModule.isNonNullObject("string")).toBeFalsy();
            expect(guardsTestModule.isNonNullObject(123)).toBeFalsy();
            expect(guardsTestModule.isNonNullObject(undefined)).toBeFalsy();

            // Test isPositiveNumber function
            expect(typeof guardsTestModule.isPositiveNumber).toBe("function");
            expect(guardsTestModule.isPositiveNumber(1)).toBeTruthy();
            expect(guardsTestModule.isPositiveNumber(123)).toBeTruthy();
            expect(guardsTestModule.isPositiveNumber(0.1)).toBeTruthy();
            expect(guardsTestModule.isPositiveNumber(0)).toBeFalsy();
            expect(guardsTestModule.isPositiveNumber(-1)).toBeFalsy();
            expect(guardsTestModule.isPositiveNumber(Number.NaN)).toBeFalsy();
            expect(guardsTestModule.isPositiveNumber("1")).toBeFalsy();

            // Test isString function
            expect(typeof guardsTestModule.isString).toBe("function");
            expect(guardsTestModule.isString("")).toBeTruthy();
            expect(guardsTestModule.isString("hello")).toBeTruthy();
            expect(guardsTestModule.isString("123")).toBeTruthy();
            expect(guardsTestModule.isString(123)).toBeFalsy();
            expect(guardsTestModule.isString(null)).toBeFalsy();
            expect(guardsTestModule.isString(undefined)).toBeFalsy();
            expect(guardsTestModule.isString({})).toBeFalsy();

            // Test isValidPort function
            expect(typeof guardsTestModule.isValidPort).toBe("function");
            expect(guardsTestModule.isValidPort(80)).toBeTruthy();
            expect(guardsTestModule.isValidPort(443)).toBeTruthy();
            expect(guardsTestModule.isValidPort(1)).toBeTruthy();
            expect(guardsTestModule.isValidPort(65_535)).toBeTruthy();
            expect(guardsTestModule.isValidPort(0)).toBeFalsy();
            expect(guardsTestModule.isValidPort(65_536)).toBeFalsy();
            expect(guardsTestModule.isValidPort(-1)).toBeFalsy();
            expect(guardsTestModule.isValidPort(3.14)).toBeFalsy();
            expect(guardsTestModule.isValidPort("80")).toBeFalsy();
            expect(guardsTestModule.isValidPort(Number.NaN)).toBeFalsy();

            // Test isValidTimestamp function
            expect(typeof guardsTestModule.isValidTimestamp).toBe("function");
            const now = Date.now();
            expect(guardsTestModule.isValidTimestamp(now)).toBeTruthy();
            expect(
                guardsTestModule.isValidTimestamp(now - 86_400_000)
            ).toBeTruthy(); // 1 day ago
            expect(
                guardsTestModule.isValidTimestamp(1_672_531_200_000)
            ).toBeTruthy(); // Valid past timestamp
            expect(guardsTestModule.isValidTimestamp(0)).toBeFalsy(); // Must be > 0
            expect(guardsTestModule.isValidTimestamp(-1)).toBeFalsy();
            expect(guardsTestModule.isValidTimestamp(3.14)).toBeTruthy(); // Decimal numbers are valid
            expect(guardsTestModule.isValidTimestamp(Number.NaN)).toBeFalsy();
            expect(guardsTestModule.isValidTimestamp("timestamp")).toBeFalsy();
            expect(guardsTestModule.isValidTimestamp(null)).toBeFalsy();
        });

        it("should handle edge cases for complex type guards", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test hasProperties with edge cases
            const complexObj = {
                a: 1,
                b: null,
                c: undefined,
                d: false,
                e: 0,
                [Symbol("symbol")]: "symbol value",
            };

            expect(
                guardsTestModule.hasProperties(complexObj, [
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                ])
            ).toBeTruthy();
            expect(
                guardsTestModule.hasProperties(complexObj, ["a", "nonexistent"])
            ).toBeFalsy();

            // Test with array-like objects
            const arrayLike = { 0: "a", 1: "b", length: 2 };
            expect(
                guardsTestModule.hasProperty(arrayLike, "length")
            ).toBeTruthy();
            expect(guardsTestModule.hasProperty(arrayLike, "0")).toBeTruthy();
            expect(
                guardsTestModule.hasProperties(arrayLike, [
                    "0",
                    "1",
                    "length",
                ])
            ).toBeTruthy();

            // Test with inherited properties - Object.hasOwn only checks own properties
            const obj = Object.create({ inherited: "prop" });
            obj.own = "value";
            expect(guardsTestModule.hasProperty(obj, "own")).toBeTruthy();
            expect(guardsTestModule.hasProperty(obj, "inherited")).toBeFalsy(); // Object.hasOwn excludes inherited
        });

        it("should properly handle numeric edge cases", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test isNumber with special numeric values
            expect(guardsTestModule.isNumber(Number.MAX_VALUE)).toBeTruthy();
            expect(guardsTestModule.isNumber(Number.MIN_VALUE)).toBeTruthy();
            expect(
                guardsTestModule.isNumber(Number.POSITIVE_INFINITY)
            ).toBeTruthy();
            expect(
                guardsTestModule.isNumber(Number.NEGATIVE_INFINITY)
            ).toBeTruthy();
            expect(guardsTestModule.isNumber(Number.NaN)).toBeFalsy();

            // Test isFiniteNumber with same values
            expect(
                guardsTestModule.isFiniteNumber(Number.MAX_VALUE)
            ).toBeTruthy();
            expect(
                guardsTestModule.isFiniteNumber(Number.MIN_VALUE)
            ).toBeTruthy();
            expect(
                guardsTestModule.isFiniteNumber(Number.POSITIVE_INFINITY)
            ).toBeFalsy();
            expect(
                guardsTestModule.isFiniteNumber(Number.NEGATIVE_INFINITY)
            ).toBeFalsy();

            // Test isValidPort with edge values
            expect(guardsTestModule.isValidPort(1)).toBeTruthy();
            expect(guardsTestModule.isValidPort(65_535)).toBeTruthy();
            expect(guardsTestModule.isValidPort(0)).toBeFalsy();
            expect(guardsTestModule.isValidPort(65_536)).toBeFalsy();
            expect(guardsTestModule.isValidPort(1.5)).toBeFalsy();

            // Test isValidTimestamp with edge values (must be positive and not future)
            const now = Date.now();
            expect(guardsTestModule.isValidTimestamp(now)).toBeTruthy();
            expect(guardsTestModule.isValidTimestamp(now - 1000)).toBeTruthy(); // Past timestamp
            expect(guardsTestModule.isValidTimestamp(0)).toBeFalsy(); // Must be > 0
            expect(
                guardsTestModule.isValidTimestamp(Number.MAX_SAFE_INTEGER)
            ).toBeFalsy(); // Too far in future
            expect(guardsTestModule.isValidTimestamp(-1)).toBeFalsy();
            expect(guardsTestModule.isValidTimestamp(1.5)).toBeTruthy(); // Decimal numbers are valid
        });

        it("should handle type guard consistency", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Verify that type guards are consistent with each other
            const testValues = [
                null,
                undefined,
                true,
                false,
                0,
                1,
                -1,
                3.14,
                Number.NaN,
                Infinity,
                "",
                "string",
                [],
                [
                    1,
                    2,
                    3,
                ],
                {},
                { key: "value" },
                new Date(),
                new Error("test error"),
                () => {},
                Symbol("test"),
            ];

            for (const value of testValues) {
                // All functions should return boolean
                expect(typeof guardsTestModule.isObject(value)).toBe("boolean");
                expect(typeof guardsTestModule.isNumber(value)).toBe("boolean");
                expect(typeof guardsTestModule.isArray(value)).toBe("boolean");
                expect(typeof guardsTestModule.isBoolean(value)).toBe(
                    "boolean"
                );
                expect(typeof guardsTestModule.isDate(value)).toBe("boolean");
                expect(typeof guardsTestModule.isError(value)).toBe("boolean");
                expect(typeof guardsTestModule.isFiniteNumber(value)).toBe(
                    "boolean"
                );
                expect(typeof guardsTestModule.isFunction(value)).toBe(
                    "boolean"
                );
                expect(typeof guardsTestModule.isNonNegativeNumber(value)).toBe(
                    "boolean"
                );
                expect(typeof guardsTestModule.isNonNullObject(value)).toBe(
                    "boolean"
                );
                expect(typeof guardsTestModule.isPositiveNumber(value)).toBe(
                    "boolean"
                );
                expect(typeof guardsTestModule.isString(value)).toBe("boolean");
                expect(typeof guardsTestModule.isValidPort(value)).toBe(
                    "boolean"
                );
                expect(typeof guardsTestModule.isValidTimestamp(value)).toBe(
                    "boolean"
                );
            }
        });
    });
});
