/**
 * @file Complete Function Coverage Tests for typeGuards.ts
 *
 *   This test ensures 100% function coverage for the typeGuards module using the
 *   proven Function Coverage Validation pattern with namespace imports and
 *   systematic function calls.
 */

import { describe, expect, it } from "vitest";
import * as typeGuardsModule from "@shared/utils/typeGuards";

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
            expect(typeof typeGuardsModule).toBe("object");
            expect(typeGuardsModule).toBeDefined();

            // Test isObject function
            expect(typeof typeGuardsModule.isObject).toBe("function");
            expect(typeGuardsModule.isObject({})).toBe(true);
            expect(typeGuardsModule.isObject({ key: "value" })).toBe(true);
            expect(typeGuardsModule.isObject(null)).toBe(false);
            expect(typeGuardsModule.isObject([])).toBe(false);
            expect(typeGuardsModule.isObject("string")).toBe(false);
            expect(typeGuardsModule.isObject(123)).toBe(false);
            expect(typeGuardsModule.isObject(undefined)).toBe(false);

            // Test isNumber function
            expect(typeof typeGuardsModule.isNumber).toBe("function");
            expect(typeGuardsModule.isNumber(123)).toBe(true);
            expect(typeGuardsModule.isNumber(0)).toBe(true);
            expect(typeGuardsModule.isNumber(-456)).toBe(true);
            expect(typeGuardsModule.isNumber(3.14)).toBe(true);
            expect(typeGuardsModule.isNumber(Number.NaN)).toBe(false);
            expect(typeGuardsModule.isNumber("123")).toBe(false);
            expect(typeGuardsModule.isNumber(null)).toBe(false);
            expect(typeGuardsModule.isNumber(undefined)).toBe(false);

            // Test hasProperties function
            expect(typeof typeGuardsModule.hasProperties).toBe("function");
            const obj = { a: 1, b: 2, c: 3 };
            expect(typeGuardsModule.hasProperties(obj, ["a", "b"])).toBe(true);
            expect(
                typeGuardsModule.hasProperties(obj, [
                    "a",
                    "b",
                    "c",
                ])
            ).toBe(true);
            expect(typeGuardsModule.hasProperties(obj, ["a", "d"])).toBe(false);
            expect(typeGuardsModule.hasProperties(obj, [])).toBe(true);
            expect(typeGuardsModule.hasProperties(null, ["a"])).toBe(false);
            expect(typeGuardsModule.hasProperties("not object", ["a"])).toBe(
                false
            );

            // Test hasProperty function
            expect(typeof typeGuardsModule.hasProperty).toBe("function");
            expect(typeGuardsModule.hasProperty(obj, "a")).toBe(true);
            expect(typeGuardsModule.hasProperty(obj, "z")).toBe(false);
            expect(typeGuardsModule.hasProperty(null, "a")).toBe(false);
            expect(typeGuardsModule.hasProperty("string", "length")).toBe(
                false
            ); // isObject excludes strings
            expect(typeGuardsModule.hasProperty([], "length")).toBe(false); // isObject excludes arrays

            // Test isArray function
            expect(typeof typeGuardsModule.isArray).toBe("function");
            expect(typeGuardsModule.isArray([])).toBe(true);
            expect(
                typeGuardsModule.isArray([
                    1,
                    2,
                    3,
                ])
            ).toBe(true);
            expect(typeGuardsModule.isArray({})).toBe(false);
            expect(typeGuardsModule.isArray("string")).toBe(false);
            expect(typeGuardsModule.isArray(null)).toBe(false);
            expect(typeGuardsModule.isArray(undefined)).toBe(false);

            // Test isBoolean function
            expect(typeof typeGuardsModule.isBoolean).toBe("function");
            expect(typeGuardsModule.isBoolean(true)).toBe(true);
            expect(typeGuardsModule.isBoolean(false)).toBe(true);
            expect(typeGuardsModule.isBoolean(0)).toBe(false);
            expect(typeGuardsModule.isBoolean(1)).toBe(false);
            expect(typeGuardsModule.isBoolean("true")).toBe(false);
            expect(typeGuardsModule.isBoolean(null)).toBe(false);

            // Test isDate function
            expect(typeof typeGuardsModule.isDate).toBe("function");
            const date = new Date();
            expect(typeGuardsModule.isDate(date)).toBe(true);
            expect(typeGuardsModule.isDate(new Date("2023-01-01"))).toBe(true);
            expect(typeGuardsModule.isDate("2023-01-01")).toBe(false);
            expect(typeGuardsModule.isDate(1_672_531_200_000)).toBe(false);
            expect(typeGuardsModule.isDate({})).toBe(false);
            expect(typeGuardsModule.isDate(null)).toBe(false);

            // Test isError function
            expect(typeof typeGuardsModule.isError).toBe("function");
            const error = new Error("test");
            expect(typeGuardsModule.isError(error)).toBe(true);
            expect(typeGuardsModule.isError(new TypeError("type error"))).toBe(
                true
            );
            expect(
                typeGuardsModule.isError(new RangeError("range error"))
            ).toBe(true);
            expect(typeGuardsModule.isError("error string")).toBe(false);
            expect(typeGuardsModule.isError({ message: "error" })).toBe(false);
            expect(typeGuardsModule.isError(null)).toBe(false);

            // Test isFiniteNumber function
            expect(typeof typeGuardsModule.isFiniteNumber).toBe("function");
            expect(typeGuardsModule.isFiniteNumber(123)).toBe(true);
            expect(typeGuardsModule.isFiniteNumber(0)).toBe(true);
            expect(typeGuardsModule.isFiniteNumber(-456)).toBe(true);
            expect(typeGuardsModule.isFiniteNumber(3.14)).toBe(true);
            expect(typeGuardsModule.isFiniteNumber(Infinity)).toBe(false);
            expect(typeGuardsModule.isFiniteNumber(-Infinity)).toBe(false);
            expect(typeGuardsModule.isFiniteNumber(Number.NaN)).toBe(false);
            expect(typeGuardsModule.isFiniteNumber("123")).toBe(false);

            // Test isFunction function
            expect(typeof typeGuardsModule.isFunction).toBe("function");
            const fn = () => {};
            const namedFn = function test() {};
            const asyncFn = async () => {};
            expect(typeGuardsModule.isFunction(fn)).toBe(true);
            expect(typeGuardsModule.isFunction(namedFn)).toBe(true);
            expect(typeGuardsModule.isFunction(asyncFn)).toBe(true);
            expect(typeGuardsModule.isFunction(Math.max)).toBe(true);
            expect(typeGuardsModule.isFunction("function")).toBe(false);
            expect(typeGuardsModule.isFunction({})).toBe(false);
            expect(typeGuardsModule.isFunction(null)).toBe(false);

            // Test isNonNegativeNumber function
            expect(typeof typeGuardsModule.isNonNegativeNumber).toBe(
                "function"
            );
            expect(typeGuardsModule.isNonNegativeNumber(0)).toBe(true);
            expect(typeGuardsModule.isNonNegativeNumber(123)).toBe(true);
            expect(typeGuardsModule.isNonNegativeNumber(3.14)).toBe(true);
            expect(typeGuardsModule.isNonNegativeNumber(-1)).toBe(false);
            expect(typeGuardsModule.isNonNegativeNumber(-0.1)).toBe(false);
            expect(typeGuardsModule.isNonNegativeNumber(Number.NaN)).toBe(false);
            expect(typeGuardsModule.isNonNegativeNumber("0")).toBe(false);

            // Test isNonNullObject function
            expect(typeof typeGuardsModule.isNonNullObject).toBe("function");
            expect(typeGuardsModule.isNonNullObject({})).toBe(true);
            expect(typeGuardsModule.isNonNullObject({ key: "value" })).toBe(
                true
            );
            expect(typeGuardsModule.isNonNullObject([])).toBe(false); // Arrays excluded by isObject
            expect(typeGuardsModule.isNonNullObject(new Date())).toBe(true);
            expect(typeGuardsModule.isNonNullObject(null)).toBe(false);
            expect(typeGuardsModule.isNonNullObject("string")).toBe(false);
            expect(typeGuardsModule.isNonNullObject(123)).toBe(false);
            expect(typeGuardsModule.isNonNullObject(undefined)).toBe(false);

            // Test isPositiveNumber function
            expect(typeof typeGuardsModule.isPositiveNumber).toBe("function");
            expect(typeGuardsModule.isPositiveNumber(1)).toBe(true);
            expect(typeGuardsModule.isPositiveNumber(123)).toBe(true);
            expect(typeGuardsModule.isPositiveNumber(0.1)).toBe(true);
            expect(typeGuardsModule.isPositiveNumber(0)).toBe(false);
            expect(typeGuardsModule.isPositiveNumber(-1)).toBe(false);
            expect(typeGuardsModule.isPositiveNumber(Number.NaN)).toBe(false);
            expect(typeGuardsModule.isPositiveNumber("1")).toBe(false);

            // Test isString function
            expect(typeof typeGuardsModule.isString).toBe("function");
            expect(typeGuardsModule.isString("")).toBe(true);
            expect(typeGuardsModule.isString("hello")).toBe(true);
            expect(typeGuardsModule.isString("123")).toBe(true);
            expect(typeGuardsModule.isString(123)).toBe(false);
            expect(typeGuardsModule.isString(null)).toBe(false);
            expect(typeGuardsModule.isString(undefined)).toBe(false);
            expect(typeGuardsModule.isString({})).toBe(false);

            // Test isValidPort function
            expect(typeof typeGuardsModule.isValidPort).toBe("function");
            expect(typeGuardsModule.isValidPort(80)).toBe(true);
            expect(typeGuardsModule.isValidPort(443)).toBe(true);
            expect(typeGuardsModule.isValidPort(1)).toBe(true);
            expect(typeGuardsModule.isValidPort(65_535)).toBe(true);
            expect(typeGuardsModule.isValidPort(0)).toBe(false);
            expect(typeGuardsModule.isValidPort(65_536)).toBe(false);
            expect(typeGuardsModule.isValidPort(-1)).toBe(false);
            expect(typeGuardsModule.isValidPort(3.14)).toBe(false);
            expect(typeGuardsModule.isValidPort("80")).toBe(false);
            expect(typeGuardsModule.isValidPort(Number.NaN)).toBe(false);

            // Test isValidTimestamp function
            expect(typeof typeGuardsModule.isValidTimestamp).toBe("function");
            const now = Date.now();
            expect(typeGuardsModule.isValidTimestamp(now)).toBe(true);
            expect(typeGuardsModule.isValidTimestamp(now - 86_400_000)).toBe(
                true
            ); // 1 day ago
            expect(typeGuardsModule.isValidTimestamp(1_672_531_200_000)).toBe(true); // Valid past timestamp
            expect(typeGuardsModule.isValidTimestamp(0)).toBe(false); // Must be > 0
            expect(typeGuardsModule.isValidTimestamp(-1)).toBe(false);
            expect(typeGuardsModule.isValidTimestamp(3.14)).toBe(true); // Decimal numbers are valid
            expect(typeGuardsModule.isValidTimestamp(Number.NaN)).toBe(false);
            expect(typeGuardsModule.isValidTimestamp("timestamp")).toBe(false);
            expect(typeGuardsModule.isValidTimestamp(null)).toBe(false);
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
                typeGuardsModule.hasProperties(complexObj, [
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                ])
            ).toBe(true);
            expect(
                typeGuardsModule.hasProperties(complexObj, ["a", "nonexistent"])
            ).toBe(false);

            // Test with array-like objects
            const arrayLike = { 0: "a", 1: "b", length: 2 };
            expect(typeGuardsModule.hasProperty(arrayLike, "length")).toBe(
                true
            );
            expect(typeGuardsModule.hasProperty(arrayLike, "0")).toBe(true);
            expect(
                typeGuardsModule.hasProperties(arrayLike, [
                    "0",
                    "1",
                    "length",
                ])
            ).toBe(true);

            // Test with inherited properties - Object.hasOwn only checks own properties
            const obj = Object.create({ inherited: "prop" });
            obj.own = "value";
            expect(typeGuardsModule.hasProperty(obj, "own")).toBe(true);
            expect(typeGuardsModule.hasProperty(obj, "inherited")).toBe(false); // Object.hasOwn excludes inherited
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
            expect(typeGuardsModule.isNumber(Number.MAX_VALUE)).toBe(true);
            expect(typeGuardsModule.isNumber(Number.MIN_VALUE)).toBe(true);
            expect(typeGuardsModule.isNumber(Number.POSITIVE_INFINITY)).toBe(
                true
            );
            expect(typeGuardsModule.isNumber(Number.NEGATIVE_INFINITY)).toBe(
                true
            );
            expect(typeGuardsModule.isNumber(Number.NaN)).toBe(false);

            // Test isFiniteNumber with same values
            expect(typeGuardsModule.isFiniteNumber(Number.MAX_VALUE)).toBe(
                true
            );
            expect(typeGuardsModule.isFiniteNumber(Number.MIN_VALUE)).toBe(
                true
            );
            expect(
                typeGuardsModule.isFiniteNumber(Number.POSITIVE_INFINITY)
            ).toBe(false);
            expect(
                typeGuardsModule.isFiniteNumber(Number.NEGATIVE_INFINITY)
            ).toBe(false);

            // Test isValidPort with edge values
            expect(typeGuardsModule.isValidPort(1)).toBe(true);
            expect(typeGuardsModule.isValidPort(65_535)).toBe(true);
            expect(typeGuardsModule.isValidPort(0)).toBe(false);
            expect(typeGuardsModule.isValidPort(65_536)).toBe(false);
            expect(typeGuardsModule.isValidPort(1.5)).toBe(false);

            // Test isValidTimestamp with edge values (must be positive and not future)
            const now = Date.now();
            expect(typeGuardsModule.isValidTimestamp(now)).toBe(true);
            expect(typeGuardsModule.isValidTimestamp(now - 1000)).toBe(true); // Past timestamp
            expect(typeGuardsModule.isValidTimestamp(0)).toBe(false); // Must be > 0
            expect(
                typeGuardsModule.isValidTimestamp(Number.MAX_SAFE_INTEGER)
            ).toBe(false); // Too far in future
            expect(typeGuardsModule.isValidTimestamp(-1)).toBe(false);
            expect(typeGuardsModule.isValidTimestamp(1.5)).toBe(true); // Decimal numbers are valid
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
                new Error(),
                () => {},
                Symbol("test"),
            ];

            for (const value of testValues) {
                // All functions should return boolean
                expect(typeof typeGuardsModule.isObject(value)).toBe("boolean");
                expect(typeof typeGuardsModule.isNumber(value)).toBe("boolean");
                expect(typeof typeGuardsModule.isArray(value)).toBe("boolean");
                expect(typeof typeGuardsModule.isBoolean(value)).toBe(
                    "boolean"
                );
                expect(typeof typeGuardsModule.isDate(value)).toBe("boolean");
                expect(typeof typeGuardsModule.isError(value)).toBe("boolean");
                expect(typeof typeGuardsModule.isFiniteNumber(value)).toBe(
                    "boolean"
                );
                expect(typeof typeGuardsModule.isFunction(value)).toBe(
                    "boolean"
                );
                expect(typeof typeGuardsModule.isNonNegativeNumber(value)).toBe(
                    "boolean"
                );
                expect(typeof typeGuardsModule.isNonNullObject(value)).toBe(
                    "boolean"
                );
                expect(typeof typeGuardsModule.isPositiveNumber(value)).toBe(
                    "boolean"
                );
                expect(typeof typeGuardsModule.isString(value)).toBe("boolean");
                expect(typeof typeGuardsModule.isValidPort(value)).toBe(
                    "boolean"
                );
                expect(typeof typeGuardsModule.isValidTimestamp(value)).toBe(
                    "boolean"
                );
            }
        });
    });
});
