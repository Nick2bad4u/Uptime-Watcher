/**
 * Comprehensive test suite for typeGuards utility functions
 *
 * Tests all type guard functions with edge cases, typical values, and boundary
 * conditions to ensure 100% function coverage and robust type checking
 * behavior.
 */

import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { test, fc } from "@fast-check/vitest";
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
} from "@shared/utils/typeGuards";

describe("typeGuards", () => {
    describe(isObject, () => {
        it("should return true for plain objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject({})).toBeTruthy();
            expect(isObject({ foo: "bar" })).toBeTruthy();
            expect(isObject({ nested: { object: true } })).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(null)).toBeFalsy();
        });

        it("should return false for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject([])).toBeFalsy();
            expect(
                isObject([
                    1,
                    2,
                    3,
                ])
            ).toBeFalsy();
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject("string")).toBeFalsy();
            expect(isObject(123)).toBeFalsy();
            expect(isObject(true)).toBeFalsy();
            expect(isObject(undefined)).toBeFalsy();
        });

        it("should return true for built-in object types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(new Date())).toBeTruthy();
            expect(isObject(new Error("test error"))).toBeTruthy();
            expect(isObject(/regex/)).toBeTruthy();
        });
    });

    describe(isNumber, () => {
        it("should return true for valid numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(0)).toBeTruthy();
            expect(isNumber(123)).toBeTruthy();
            expect(isNumber(-456)).toBeTruthy();
            expect(isNumber(3.14)).toBeTruthy();
            expect(isNumber(Infinity)).toBeTruthy();
            expect(isNumber(-Infinity)).toBeTruthy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(Number.NaN)).toBeFalsy();
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber("123")).toBeFalsy();
            expect(isNumber(true)).toBeFalsy();
            expect(isNumber(null)).toBeFalsy();
            expect(isNumber(undefined)).toBeFalsy();
            expect(isNumber({})).toBeFalsy();
            expect(isNumber([])).toBeFalsy();
        });

        // Property-based testing for number validation
        test.prop({
            num: fc.float(),
        })("should return true for any valid float (excluding NaN)", (
            props
        ) => {
            // Skip NaN values since isNumber should reject them
            if (Number.isNaN(props.num)) {
                expect(isNumber(props.num)).toBeFalsy();
            } else {
                expect(isNumber(props.num)).toBeTruthy();
            }
        });

        test.prop({
            num: fc.integer(),
        })("should return true for any integer", (props) => {
            expect(isNumber(props.num)).toBeTruthy();
        });

        test.prop({
            nonNumber: fc.oneof(
                fc.string(),
                fc.boolean(),
                fc.array(fc.anything()),
                fc.object(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        })("should return false for any non-number value", (props) => {
            expect(isNumber(props.nonNumber)).toBeFalsy();
        });
    });

    describe(hasProperties, () => {
        it("should return true when object has all specified properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar", baz: 123, nested: { key: "value" } };
            expect(hasProperties(obj, ["foo"])).toBeTruthy();
            expect(hasProperties(obj, ["foo", "baz"])).toBeTruthy();
            expect(
                hasProperties(obj, [
                    "foo",
                    "baz",
                    "nested",
                ])
            ).toBeTruthy();
        });

        it("should return false when object is missing properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar" };
            expect(hasProperties(obj, ["missing"])).toBeFalsy();
            expect(hasProperties(obj, ["foo", "missing"])).toBeFalsy();
        });

        it("should return true for empty property array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperties({}, [])).toBeTruthy();
            expect(hasProperties({ foo: "bar" }, [])).toBeTruthy();
        });

        it("should return false for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperties(null, ["prop"])).toBeFalsy();
            expect(hasProperties("string", ["length"])).toBeFalsy();
            expect(hasProperties(123, ["prop"])).toBeFalsy();
            expect(hasProperties([], ["length"])).toBeFalsy();
        });

        it("should work with symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value" };
            expect(hasProperties(obj, [sym])).toBeTruthy();
        });
    });

    describe(hasProperty, () => {
        it("should return true when object has the specified property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar", baz: 123 };
            expect(hasProperty(obj, "foo")).toBeTruthy();
            expect(hasProperty(obj, "baz")).toBeTruthy();
        });

        it("should return false when object is missing the property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar" };
            expect(hasProperty(obj, "missing")).toBeFalsy();
        });

        it("should return false for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperty(null, "prop")).toBeFalsy();
            expect(hasProperty("string", "length")).toBeFalsy();
            expect(hasProperty(123, "prop")).toBeFalsy();
            expect(hasProperty([], "length")).toBeFalsy();
        });

        it("should work with symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value" };
            expect(hasProperty(obj, sym)).toBeTruthy();
        });

        it("should work with numeric property keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { 0: "zero", 42: "answer" };
            expect(hasProperty(obj, 0)).toBeTruthy();
            expect(hasProperty(obj, 42)).toBeTruthy();
        });
    });

    describe(isArray, () => {
        it("should return true for arrays without item validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArray([])).toBeTruthy();
            expect(
                isArray([
                    1,
                    2,
                    3,
                ])
            ).toBeTruthy();
            expect(
                isArray([
                    "a",
                    "b",
                    "c",
                ])
            ).toBeTruthy();
            expect(
                isArray([
                    1,
                    "mixed",
                    true,
                ])
            ).toBeTruthy();
        });

        it("should return false for non-arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArray({})).toBeFalsy();
            expect(isArray("string")).toBeFalsy();
            expect(isArray(123)).toBeFalsy();
            expect(isArray(null)).toBeFalsy();
            expect(isArray(undefined)).toBeFalsy();
        });

        it("should validate array items when validator is provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            expect(
                isArray(
                    [
                        1,
                        2,
                        3,
                    ],
                    isNumber
                )
            ).toBeTruthy();
            expect(
                isArray(
                    [
                        "a",
                        "b",
                        "c",
                    ],
                    isString
                )
            ).toBeTruthy();
            expect(isArray([true, false], isBoolean)).toBeTruthy();
        });

        it("should return false when array items fail validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(
                isArray(
                    [
                        1,
                        "string",
                        3,
                    ],
                    isNumber
                )
            ).toBeFalsy();
            expect(
                isArray(
                    [
                        "a",
                        123,
                        "c",
                    ],
                    isString
                )
            ).toBeFalsy();
            expect(isArray([true, "not boolean"], isBoolean)).toBeFalsy();
        });

        it("should return true for empty array with validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArray([], isNumber)).toBeTruthy();
            expect(isArray([], isString)).toBeTruthy();
        });
    });

    describe(isBoolean, () => {
        it("should return true for boolean values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isBoolean(true)).toBeTruthy();
            expect(isBoolean(false)).toBeTruthy();
        });

        it("should return false for non-boolean values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isBoolean(1)).toBeFalsy();
            expect(isBoolean(0)).toBeFalsy();
            expect(isBoolean("true")).toBeFalsy();
            expect(isBoolean("false")).toBeFalsy();
            expect(isBoolean(null)).toBeFalsy();
            expect(isBoolean(undefined)).toBeFalsy();
            expect(isBoolean({})).toBeFalsy();
            expect(isBoolean([])).toBeFalsy();
        });
    });

    describe(isDate, () => {
        it("should return true for valid Date objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date())).toBeTruthy();
            expect(isDate(new Date("2023-01-01"))).toBeTruthy();
            expect(isDate(new Date(2023, 0, 1))).toBeTruthy();
        });

        it("should return false for invalid Date objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date("invalid"))).toBeFalsy();
            expect(isDate(new Date(Number.NaN))).toBeFalsy();
        });

        it("should return false for non-Date values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate("2023-01-01")).toBeFalsy();
            expect(isDate(1_672_531_200_000)).toBeFalsy(); // Timestamp
            expect(isDate({})).toBeFalsy();
            expect(isDate(null)).toBeFalsy();
            expect(isDate(undefined)).toBeFalsy();
        });
    });

    describe(isError, () => {
        it("should return true for Error instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError(new Error("test error"))).toBeTruthy();
            expect(isError(new Error("message"))).toBeTruthy();
            expect(isError(new TypeError("type error"))).toBeTruthy();
            expect(isError(new ReferenceError("reference error"))).toBeTruthy();
            expect(isError(new SyntaxError("syntax error"))).toBeTruthy();
        });

        it("should return false for non-Error values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError("Error message")).toBeFalsy();
            expect(isError({ message: "error" })).toBeFalsy();
            expect(isError(null)).toBeFalsy();
            expect(isError(undefined)).toBeFalsy();
            expect(isError({})).toBeFalsy();
        });
    });

    describe(isFiniteNumber, () => {
        it("should return true for finite numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(0)).toBeTruthy();
            expect(isFiniteNumber(123)).toBeTruthy();
            expect(isFiniteNumber(-456)).toBeTruthy();
            expect(isFiniteNumber(3.14)).toBeTruthy();
            expect(isFiniteNumber(Number.MAX_SAFE_INTEGER)).toBeTruthy();
            expect(isFiniteNumber(Number.MIN_SAFE_INTEGER)).toBeTruthy();
        });

        it("should return false for infinite numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(Infinity)).toBeFalsy();
            expect(isFiniteNumber(-Infinity)).toBeFalsy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber(Number.NaN)).toBeFalsy();
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber("123")).toBeFalsy();
            expect(isFiniteNumber(true)).toBeFalsy();
            expect(isFiniteNumber(null)).toBeFalsy();
            expect(isFiniteNumber(undefined)).toBeFalsy();
        });
    });

    describe(isFunction, () => {
        it("should return true for functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction(() => {})).toBeTruthy();
            expect(isFunction(function namedFunction() {})).toBeTruthy();
            expect(isFunction(function named() {})).toBeTruthy();
            expect(isFunction(async () => {})).toBeTruthy();
            expect(isFunction(function* generator() {})).toBeTruthy();
            expect(isFunction(Math.max)).toBeTruthy();
            expect(isFunction(console.log)).toBeTruthy();
        });

        it("should return false for non-functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction("function")).toBeFalsy();
            expect(isFunction({})).toBeFalsy();
            expect(isFunction([])).toBeFalsy();
            expect(isFunction(null)).toBeFalsy();
            expect(isFunction(undefined)).toBeFalsy();
            expect(isFunction(123)).toBeFalsy();
        });
    });

    describe(isNonNegativeNumber, () => {
        it("should return true for non-negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(0)).toBeTruthy();
            expect(isNonNegativeNumber(123)).toBeTruthy();
            expect(isNonNegativeNumber(3.14)).toBeTruthy();
            expect(isNonNegativeNumber(Infinity)).toBeTruthy();
        });

        it("should return false for negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(-1)).toBeFalsy();
            expect(isNonNegativeNumber(-123)).toBeFalsy();
            expect(isNonNegativeNumber(-Infinity)).toBeFalsy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(Number.NaN)).toBeFalsy();
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber("0")).toBeFalsy();
            expect(isNonNegativeNumber(true)).toBeFalsy();
            expect(isNonNegativeNumber(null)).toBeFalsy();
            expect(isNonNegativeNumber(undefined)).toBeFalsy();
        });
    });

    describe(isNonNullObject, () => {
        it("should return true for objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject({})).toBeTruthy();
            expect(isNonNullObject({ foo: "bar" })).toBeTruthy();
            expect(isNonNullObject(new Date())).toBeTruthy();
            expect(isNonNullObject(new Error("test error"))).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject(null)).toBeFalsy();
        });

        it("should return false for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject([])).toBeFalsy();
            expect(
                isNonNullObject([
                    1,
                    2,
                    3,
                ])
            ).toBeFalsy();
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject("string")).toBeFalsy();
            expect(isNonNullObject(123)).toBeFalsy();
            expect(isNonNullObject(true)).toBeFalsy();
            expect(isNonNullObject(undefined)).toBeFalsy();
        });
    });

    describe(isPositiveNumber, () => {
        it("should return true for positive numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(1)).toBeTruthy();
            expect(isPositiveNumber(123)).toBeTruthy();
            expect(isPositiveNumber(3.14)).toBeTruthy();
            expect(isPositiveNumber(Infinity)).toBeFalsy();
        });

        it("should return false for zero", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(0)).toBeFalsy();
        });

        it("should return false for negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(-1)).toBeFalsy();
            expect(isPositiveNumber(-123)).toBeFalsy();
            expect(isPositiveNumber(-Infinity)).toBeFalsy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(Number.NaN)).toBeFalsy();
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber("1")).toBeFalsy();
            expect(isPositiveNumber(true)).toBeFalsy();
            expect(isPositiveNumber(null)).toBeFalsy();
            expect(isPositiveNumber(undefined)).toBeFalsy();
        });
    });

    describe(isString, () => {
        it("should return true for strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isString("")).toBeTruthy();
            expect(isString("hello")).toBeTruthy();
            expect(isString("123")).toBeTruthy();
            expect(isString("true")).toBeTruthy();
            expect(isString(String(123))).toBeTruthy();
        });

        it("should return false for non-strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isString(123)).toBeFalsy();
            expect(isString(true)).toBeFalsy();
            expect(isString(null)).toBeFalsy();
            expect(isString(undefined)).toBeFalsy();
            expect(isString({})).toBeFalsy();
            expect(isString([])).toBeFalsy();
        });
    });

    describe(isValidPort, () => {
        it("should return true for valid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(1)).toBeTruthy();
            expect(isValidPort(80)).toBeTruthy();
            expect(isValidPort(443)).toBeTruthy();
            expect(isValidPort(8080)).toBeTruthy();
            expect(isValidPort(65_535)).toBeTruthy();
        });

        it("should return false for port numbers outside valid range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(0)).toBeFalsy();
            expect(isValidPort(-1)).toBeFalsy();
            expect(isValidPort(65_536)).toBeFalsy();
            expect(isValidPort(100_000)).toBeFalsy();
        });

        it("should return false for non-integer numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(80.5)).toBeFalsy();
            expect(isValidPort(3.14)).toBeFalsy();
            expect(isValidPort(Infinity)).toBeFalsy();
            expect(isValidPort(-Infinity)).toBeFalsy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(Number.NaN)).toBeFalsy();
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort("80")).toBeFalsy();
            expect(isValidPort(true)).toBeFalsy();
            expect(isValidPort(null)).toBeFalsy();
            expect(isValidPort(undefined)).toBeFalsy();
        });

        // Property-based testing for port validation
        test.prop({
            validPort: fc.integer({ min: 1, max: 65_535 }),
        })("should return true for all valid port numbers (1-65535)", (
            props
        ) => {
            expect(isValidPort(props.validPort)).toBeTruthy();
        });

        test.prop({
            invalidPort: fc.oneof(
                fc.integer({ max: 0 }), // <= 0
                fc.integer({ min: 65_536 }) // > 65535
            ),
        })("should return false for port numbers outside valid range", (
            props
        ) => {
            expect(isValidPort(props.invalidPort)).toBeFalsy();
        });

        test.prop({
            nonIntegerNumber: fc
                .float()
                .filter((n) => !Number.isInteger(n) && !Number.isNaN(n)),
        })("should return false for non-integer numbers", (props) => {
            expect(isValidPort(props.nonIntegerNumber)).toBeFalsy();
        });

        test.prop({
            nonNumber: fc.oneof(
                fc.string(),
                fc.boolean(),
                fc.array(fc.anything()),
                fc.object(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        })("should return false for any non-number value", (props) => {
            expect(isValidPort(props.nonNumber)).toBeFalsy();
        });
    });

    describe(isValidTimestamp, () => {
        beforeAll(() => {
            // Mock Date.now to ensure consistent test results
            vi.spyOn(Date, "now").mockReturnValue(1_672_531_200_000); // 2023-01-01 00:00:00 UTC
        });

        afterAll(() => {
            vi.restoreAllMocks();
        });

        it("should return true for valid current timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const now = Date.now();
            expect(isValidTimestamp(now)).toBeTruthy();
            expect(isValidTimestamp(now - 1000)).toBeTruthy(); // 1 second ago
            expect(isValidTimestamp(now - 86_400_000)).toBeTruthy(); // 1 day ago
        });

        it("should return true for timestamps up to 1 day in the future", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const now = Date.now();
            expect(isValidTimestamp(now + 1000)).toBeTruthy(); // 1 second in future
            expect(isValidTimestamp(now + 86_400_000)).toBeTruthy(); // exactly 1 day in future
        });

        it("should return false for timestamps too far in the future", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const now = Date.now();
            expect(isValidTimestamp(now + 86_400_000 + 1000)).toBeFalsy(); // 1 day + 1 second in future
            expect(isValidTimestamp(now + 172_800_000)).toBeFalsy(); // 2 days in future
        });

        it("should return false for zero and negative timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(0)).toBeFalsy();
            expect(isValidTimestamp(-1)).toBeFalsy();
            expect(isValidTimestamp(-86_400_000)).toBeFalsy();
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp("1672531200000")).toBeFalsy();
            expect(isValidTimestamp(new Date())).toBeFalsy();
            expect(isValidTimestamp(null)).toBeFalsy();
            expect(isValidTimestamp(undefined)).toBeFalsy();
        });

        it("should return false for NaN and infinite values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isValidTimestamp(Number.NaN)).toBeFalsy();
            expect(isValidTimestamp(Infinity)).toBeFalsy();
            expect(isValidTimestamp(-Infinity)).toBeFalsy();
        });
    });
});
