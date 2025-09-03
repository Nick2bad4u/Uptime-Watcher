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
            expect(guardsTestModule.isObject({})).toBe(true);
            expect(guardsTestModule.isObject({ key: "value" })).toBe(true);
            expect(guardsTestModule.isObject(null)).toBe(false);
            expect(guardsTestModule.isObject([])).toBe(false);
            expect(guardsTestModule.isObject("string")).toBe(false);
            expect(guardsTestModule.isObject(123)).toBe(false);
            expect(guardsTestModule.isObject(undefined)).toBe(false);

            // Test isNumber function
            expect(typeof guardsTestModule.isNumber).toBe("function");
            expect(guardsTestModule.isNumber(123)).toBe(true);
            expect(guardsTestModule.isNumber(0)).toBe(true);
            expect(guardsTestModule.isNumber(-456)).toBe(true);
            expect(guardsTestModule.isNumber(3.14)).toBe(true);
            expect(guardsTestModule.isNumber(Number.NaN)).toBe(false);
            expect(guardsTestModule.isNumber("123")).toBe(false);
            expect(guardsTestModule.isNumber(null)).toBe(false);
            expect(guardsTestModule.isNumber(undefined)).toBe(false);

            // Test hasProperties function
            expect(typeof guardsTestModule.hasProperties).toBe("function");
            const obj = { a: 1, b: 2, c: 3 };
            expect(guardsTestModule.hasProperties(obj, ["a", "b"])).toBe(true);
            expect(
                guardsTestModule.hasProperties(obj, [
                    "a",
                    "b",
                    "c",
                ])
            ).toBe(true);
            expect(guardsTestModule.hasProperties(obj, ["a", "d"])).toBe(false);
            expect(guardsTestModule.hasProperties(obj, [])).toBe(true);
            expect(guardsTestModule.hasProperties(null, ["a"])).toBe(false);
            expect(guardsTestModule.hasProperties("not object", ["a"])).toBe(
                false
            );

            // Test hasProperty function
            expect(typeof guardsTestModule.hasProperty).toBe("function");
            expect(guardsTestModule.hasProperty(obj, "a")).toBe(true);
            expect(guardsTestModule.hasProperty(obj, "z")).toBe(false);
            expect(guardsTestModule.hasProperty(null, "a")).toBe(false);
            expect(guardsTestModule.hasProperty("string", "length")).toBe(
                false
            ); // isObject excludes strings
            expect(guardsTestModule.hasProperty([], "length")).toBe(false); // isObject excludes arrays

            // Test isArray function
            expect(typeof guardsTestModule.isArray).toBe("function");
            expect(guardsTestModule.isArray([])).toBe(true);
            expect(
                guardsTestModule.isArray([
                    1,
                    2,
                    3,
                ])
            ).toBe(true);
            expect(guardsTestModule.isArray({})).toBe(false);
            expect(guardsTestModule.isArray("string")).toBe(false);
            expect(guardsTestModule.isArray(null)).toBe(false);
            expect(guardsTestModule.isArray(undefined)).toBe(false);

            // Test isBoolean function
            expect(typeof guardsTestModule.isBoolean).toBe("function");
            expect(guardsTestModule.isBoolean(true)).toBe(true);
            expect(guardsTestModule.isBoolean(false)).toBe(true);
            expect(guardsTestModule.isBoolean(0)).toBe(false);
            expect(guardsTestModule.isBoolean(1)).toBe(false);
            expect(guardsTestModule.isBoolean("true")).toBe(false);
            expect(guardsTestModule.isBoolean(null)).toBe(false);

            // Test isDate function
            expect(typeof guardsTestModule.isDate).toBe("function");
            const date = new Date();
            expect(guardsTestModule.isDate(date)).toBe(true);
            expect(guardsTestModule.isDate(new Date("2023-01-01"))).toBe(true);
            expect(guardsTestModule.isDate("2023-01-01")).toBe(false);
            expect(guardsTestModule.isDate(1_672_531_200_000)).toBe(false);
            expect(guardsTestModule.isDate({})).toBe(false);
            expect(guardsTestModule.isDate(null)).toBe(false);

            // Test isError function
            expect(typeof guardsTestModule.isError).toBe("function");
            const error = new Error("test");
            expect(guardsTestModule.isError(error)).toBe(true);
            expect(guardsTestModule.isError(new TypeError("type error"))).toBe(
                true
            );
            expect(
                guardsTestModule.isError(new RangeError("range error"))
            ).toBe(true);
            expect(guardsTestModule.isError("error string")).toBe(false);
            expect(guardsTestModule.isError({ message: "error" })).toBe(false);
            expect(guardsTestModule.isError(null)).toBe(false);

            // Test isFiniteNumber function
            expect(typeof guardsTestModule.isFiniteNumber).toBe("function");
            expect(guardsTestModule.isFiniteNumber(123)).toBe(true);
            expect(guardsTestModule.isFiniteNumber(0)).toBe(true);
            expect(guardsTestModule.isFiniteNumber(-456)).toBe(true);
            expect(guardsTestModule.isFiniteNumber(3.14)).toBe(true);
            expect(guardsTestModule.isFiniteNumber(Infinity)).toBe(false);
            expect(guardsTestModule.isFiniteNumber(-Infinity)).toBe(false);
            expect(guardsTestModule.isFiniteNumber(Number.NaN)).toBe(false);
            expect(guardsTestModule.isFiniteNumber("123")).toBe(false);

            // Test isFunction function
            expect(typeof guardsTestModule.isFunction).toBe("function");
            const fn = () => {};
            const namedFn = function namedFn() {};
            const asyncFn = async () => {};
            expect(guardsTestModule.isFunction(fn)).toBe(true);
            expect(guardsTestModule.isFunction(namedFn)).toBe(true);
            expect(guardsTestModule.isFunction(asyncFn)).toBe(true);
            expect(guardsTestModule.isFunction(Math.max)).toBe(true);
            expect(guardsTestModule.isFunction("function")).toBe(false);
            expect(guardsTestModule.isFunction({})).toBe(false);
            expect(guardsTestModule.isFunction(null)).toBe(false);

            // Test isNonNegativeNumber function
            expect(typeof guardsTestModule.isNonNegativeNumber).toBe(
                "function"
            );
            expect(guardsTestModule.isNonNegativeNumber(0)).toBe(true);
            expect(guardsTestModule.isNonNegativeNumber(123)).toBe(true);
            expect(guardsTestModule.isNonNegativeNumber(3.14)).toBe(true);
            expect(guardsTestModule.isNonNegativeNumber(-1)).toBe(false);
            expect(guardsTestModule.isNonNegativeNumber(-0.1)).toBe(false);
            expect(guardsTestModule.isNonNegativeNumber(Number.NaN)).toBe(
                false
            );
            expect(guardsTestModule.isNonNegativeNumber("0")).toBe(false);

            // Test isNonNullObject function
            expect(typeof guardsTestModule.isNonNullObject).toBe("function");
            expect(guardsTestModule.isNonNullObject({})).toBe(true);
            expect(guardsTestModule.isNonNullObject({ key: "value" })).toBe(
                true
            );
            expect(guardsTestModule.isNonNullObject([])).toBe(false); // Arrays excluded by isObject
            expect(guardsTestModule.isNonNullObject(new Date())).toBe(true);
            expect(guardsTestModule.isNonNullObject(null)).toBe(false);
            expect(guardsTestModule.isNonNullObject("string")).toBe(false);
            expect(guardsTestModule.isNonNullObject(123)).toBe(false);
            expect(guardsTestModule.isNonNullObject(undefined)).toBe(false);

            // Test isPositiveNumber function
            expect(typeof guardsTestModule.isPositiveNumber).toBe("function");
            expect(guardsTestModule.isPositiveNumber(1)).toBe(true);
            expect(guardsTestModule.isPositiveNumber(123)).toBe(true);
            expect(guardsTestModule.isPositiveNumber(0.1)).toBe(true);
            expect(guardsTestModule.isPositiveNumber(0)).toBe(false);
            expect(guardsTestModule.isPositiveNumber(-1)).toBe(false);
            expect(guardsTestModule.isPositiveNumber(Number.NaN)).toBe(false);
            expect(guardsTestModule.isPositiveNumber("1")).toBe(false);

            // Test isString function
            expect(typeof guardsTestModule.isString).toBe("function");
            expect(guardsTestModule.isString("")).toBe(true);
            expect(guardsTestModule.isString("hello")).toBe(true);
            expect(guardsTestModule.isString("123")).toBe(true);
            expect(guardsTestModule.isString(123)).toBe(false);
            expect(guardsTestModule.isString(null)).toBe(false);
            expect(guardsTestModule.isString(undefined)).toBe(false);
            expect(guardsTestModule.isString({})).toBe(false);

            // Test isValidPort function
            expect(typeof guardsTestModule.isValidPort).toBe("function");
            expect(guardsTestModule.isValidPort(80)).toBe(true);
            expect(guardsTestModule.isValidPort(443)).toBe(true);
            expect(guardsTestModule.isValidPort(1)).toBe(true);
            expect(guardsTestModule.isValidPort(65_535)).toBe(true);
            expect(guardsTestModule.isValidPort(0)).toBe(false);
            expect(guardsTestModule.isValidPort(65_536)).toBe(false);
            expect(guardsTestModule.isValidPort(-1)).toBe(false);
            expect(guardsTestModule.isValidPort(3.14)).toBe(false);
            expect(guardsTestModule.isValidPort("80")).toBe(false);
            expect(guardsTestModule.isValidPort(Number.NaN)).toBe(false);

            // Test isValidTimestamp function
            expect(typeof guardsTestModule.isValidTimestamp).toBe("function");
            const now = Date.now();
            expect(guardsTestModule.isValidTimestamp(now)).toBe(true);
            expect(guardsTestModule.isValidTimestamp(now - 86_400_000)).toBe(
                true
            ); // 1 day ago
            expect(guardsTestModule.isValidTimestamp(1_672_531_200_000)).toBe(
                true
            ); // Valid past timestamp
            expect(guardsTestModule.isValidTimestamp(0)).toBe(false); // Must be > 0
            expect(guardsTestModule.isValidTimestamp(-1)).toBe(false);
            expect(guardsTestModule.isValidTimestamp(3.14)).toBe(true); // Decimal numbers are valid
            expect(guardsTestModule.isValidTimestamp(Number.NaN)).toBe(false);
            expect(guardsTestModule.isValidTimestamp("timestamp")).toBe(false);
            expect(guardsTestModule.isValidTimestamp(null)).toBe(false);
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
            ).toBe(true);
            expect(
                guardsTestModule.hasProperties(complexObj, ["a", "nonexistent"])
            ).toBe(false);

            // Test with array-like objects
            const arrayLike = { 0: "a", 1: "b", length: 2 };
            expect(guardsTestModule.hasProperty(arrayLike, "length")).toBe(
                true
            );
            expect(guardsTestModule.hasProperty(arrayLike, "0")).toBe(true);
            expect(
                guardsTestModule.hasProperties(arrayLike, [
                    "0",
                    "1",
                    "length",
                ])
            ).toBe(true);

            // Test with inherited properties - Object.hasOwn only checks own properties
            const obj = Object.create({ inherited: "prop" });
            obj.own = "value";
            expect(guardsTestModule.hasProperty(obj, "own")).toBe(true);
            expect(guardsTestModule.hasProperty(obj, "inherited")).toBe(false); // Object.hasOwn excludes inherited
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
            expect(guardsTestModule.isNumber(Number.MAX_VALUE)).toBe(true);
            expect(guardsTestModule.isNumber(Number.MIN_VALUE)).toBe(true);
            expect(guardsTestModule.isNumber(Number.POSITIVE_INFINITY)).toBe(
                true
            );
            expect(guardsTestModule.isNumber(Number.NEGATIVE_INFINITY)).toBe(
                true
            );
            expect(guardsTestModule.isNumber(Number.NaN)).toBe(false);

            // Test isFiniteNumber with same values
            expect(guardsTestModule.isFiniteNumber(Number.MAX_VALUE)).toBe(
                true
            );
            expect(guardsTestModule.isFiniteNumber(Number.MIN_VALUE)).toBe(
                true
            );
            expect(
                guardsTestModule.isFiniteNumber(Number.POSITIVE_INFINITY)
            ).toBe(false);
            expect(
                guardsTestModule.isFiniteNumber(Number.NEGATIVE_INFINITY)
            ).toBe(false);

            // Test isValidPort with edge values
            expect(guardsTestModule.isValidPort(1)).toBe(true);
            expect(guardsTestModule.isValidPort(65_535)).toBe(true);
            expect(guardsTestModule.isValidPort(0)).toBe(false);
            expect(guardsTestModule.isValidPort(65_536)).toBe(false);
            expect(guardsTestModule.isValidPort(1.5)).toBe(false);

            // Test isValidTimestamp with edge values (must be positive and not future)
            const now = Date.now();
            expect(guardsTestModule.isValidTimestamp(now)).toBe(true);
            expect(guardsTestModule.isValidTimestamp(now - 1000)).toBe(true); // Past timestamp
            expect(guardsTestModule.isValidTimestamp(0)).toBe(false); // Must be > 0
            expect(
                guardsTestModule.isValidTimestamp(Number.MAX_SAFE_INTEGER)
            ).toBe(false); // Too far in future
            expect(guardsTestModule.isValidTimestamp(-1)).toBe(false);
            expect(guardsTestModule.isValidTimestamp(1.5)).toBe(true); // Decimal numbers are valid
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
