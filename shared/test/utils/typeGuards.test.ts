/**
 * Comprehensive test suite for typeGuards utility functions
 *
 * Tests all type guard functions with edge cases, typical values, and boundary
 * conditions to ensure 100% function coverage and robust type checking
 * behavior.
 */

import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
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
    describe("isObject", () => {
        it("should return true for plain objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject({})).toBe(true);
            expect(isObject({ foo: "bar" })).toBe(true);
            expect(isObject({ nested: { object: true } })).toBe(true);
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(null)).toBe(false);
        });

        it("should return false for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject([])).toBe(false);
            expect(
                isObject([
                    1,
                    2,
                    3,
                ])
            ).toBe(false);
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject("string")).toBe(false);
            expect(isObject(123)).toBe(false);
            expect(isObject(true)).toBe(false);
            expect(isObject(undefined)).toBe(false);
        });

        it("should return true for built-in object types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(new Date())).toBe(true);
            expect(isObject(new Error())).toBe(true);
            expect(isObject(/regex/)).toBe(true);
        });
    });

    describe("isNumber", () => {
        it("should return true for valid numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(0)).toBe(true);
            expect(isNumber(123)).toBe(true);
            expect(isNumber(-456)).toBe(true);
            expect(isNumber(3.14)).toBe(true);
            expect(isNumber(Infinity)).toBe(true);
            expect(isNumber(-Infinity)).toBe(true);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(Number.NaN)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber("123")).toBe(false);
            expect(isNumber(true)).toBe(false);
            expect(isNumber(null)).toBe(false);
            expect(isNumber(undefined)).toBe(false);
            expect(isNumber({})).toBe(false);
            expect(isNumber([])).toBe(false);
        });
    });

    describe("hasProperties", () => {
        it("should return true when object has all specified properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar", baz: 123, nested: { key: "value" } };
            expect(hasProperties(obj, ["foo"])).toBe(true);
            expect(hasProperties(obj, ["foo", "baz"])).toBe(true);
            expect(
                hasProperties(obj, [
                    "foo",
                    "baz",
                    "nested",
                ])
            ).toBe(true);
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
            expect(hasProperties(obj, ["missing"])).toBe(false);
            expect(hasProperties(obj, ["foo", "missing"])).toBe(false);
        });

        it("should return true for empty property array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperties({}, [])).toBe(true);
            expect(hasProperties({ foo: "bar" }, [])).toBe(true);
        });

        it("should return false for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperties(null, ["prop"])).toBe(false);
            expect(hasProperties("string", ["length"])).toBe(false);
            expect(hasProperties(123, ["prop"])).toBe(false);
            expect(hasProperties([], ["length"])).toBe(false);
        });

        it("should work with symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value" };
            expect(hasProperties(obj, [sym])).toBe(true);
        });
    });

    describe("hasProperty", () => {
        it("should return true when object has the specified property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar", baz: 123 };
            expect(hasProperty(obj, "foo")).toBe(true);
            expect(hasProperty(obj, "baz")).toBe(true);
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
            expect(hasProperty(obj, "missing")).toBe(false);
        });

        it("should return false for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperty(null, "prop")).toBe(false);
            expect(hasProperty("string", "length")).toBe(false);
            expect(hasProperty(123, "prop")).toBe(false);
            expect(hasProperty([], "length")).toBe(false);
        });

        it("should work with symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value" };
            expect(hasProperty(obj, sym)).toBe(true);
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
            expect(hasProperty(obj, 0)).toBe(true);
            expect(hasProperty(obj, 42)).toBe(true);
        });
    });

    describe("isArray", () => {
        it("should return true for arrays without item validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArray([])).toBe(true);
            expect(
                isArray([
                    1,
                    2,
                    3,
                ])
            ).toBe(true);
            expect(
                isArray([
                    "a",
                    "b",
                    "c",
                ])
            ).toBe(true);
            expect(
                isArray([
                    1,
                    "mixed",
                    true,
                ])
            ).toBe(true);
        });

        it("should return false for non-arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArray({})).toBe(false);
            expect(isArray("string")).toBe(false);
            expect(isArray(123)).toBe(false);
            expect(isArray(null)).toBe(false);
            expect(isArray(undefined)).toBe(false);
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
            ).toBe(true);
            expect(
                isArray(
                    [
                        "a",
                        "b",
                        "c",
                    ],
                    isString
                )
            ).toBe(true);
            expect(isArray([true, false], isBoolean)).toBe(true);
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
            ).toBe(false);
            expect(
                isArray(
                    [
                        "a",
                        123,
                        "c",
                    ],
                    isString
                )
            ).toBe(false);
            expect(isArray([true, "not boolean"], isBoolean)).toBe(false);
        });

        it("should return true for empty array with validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArray([], isNumber)).toBe(true);
            expect(isArray([], isString)).toBe(true);
        });
    });

    describe("isBoolean", () => {
        it("should return true for boolean values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isBoolean(true)).toBe(true);
            expect(isBoolean(false)).toBe(true);
        });

        it("should return false for non-boolean values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isBoolean(1)).toBe(false);
            expect(isBoolean(0)).toBe(false);
            expect(isBoolean("true")).toBe(false);
            expect(isBoolean("false")).toBe(false);
            expect(isBoolean(null)).toBe(false);
            expect(isBoolean(undefined)).toBe(false);
            expect(isBoolean({})).toBe(false);
            expect(isBoolean([])).toBe(false);
        });
    });

    describe("isDate", () => {
        it("should return true for valid Date objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date())).toBe(true);
            expect(isDate(new Date("2023-01-01"))).toBe(true);
            expect(isDate(new Date(2023, 0, 1))).toBe(true);
        });

        it("should return false for invalid Date objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date("invalid"))).toBe(false);
            expect(isDate(new Date(Number.NaN))).toBe(false);
        });

        it("should return false for non-Date values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate("2023-01-01")).toBe(false);
            expect(isDate(1_672_531_200_000)).toBe(false); // timestamp
            expect(isDate({})).toBe(false);
            expect(isDate(null)).toBe(false);
            expect(isDate(undefined)).toBe(false);
        });
    });

    describe("isError", () => {
        it("should return true for Error instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError(new Error())).toBe(true);
            expect(isError(new Error("message"))).toBe(true);
            expect(isError(new TypeError())).toBe(true);
            expect(isError(new ReferenceError())).toBe(true);
            expect(isError(new SyntaxError())).toBe(true);
        });

        it("should return false for non-Error values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError("Error message")).toBe(false);
            expect(isError({ message: "error" })).toBe(false);
            expect(isError(null)).toBe(false);
            expect(isError(undefined)).toBe(false);
            expect(isError({})).toBe(false);
        });
    });

    describe("isFiniteNumber", () => {
        it("should return true for finite numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(0)).toBe(true);
            expect(isFiniteNumber(123)).toBe(true);
            expect(isFiniteNumber(-456)).toBe(true);
            expect(isFiniteNumber(3.14)).toBe(true);
            expect(isFiniteNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
            expect(isFiniteNumber(Number.MIN_SAFE_INTEGER)).toBe(true);
        });

        it("should return false for infinite numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(Infinity)).toBe(false);
            expect(isFiniteNumber(-Infinity)).toBe(false);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber(Number.NaN)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber("123")).toBe(false);
            expect(isFiniteNumber(true)).toBe(false);
            expect(isFiniteNumber(null)).toBe(false);
            expect(isFiniteNumber(undefined)).toBe(false);
        });
    });

    describe("isFunction", () => {
        it("should return true for functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction(() => {})).toBe(true);
            expect(isFunction(function () {})).toBe(true);
            expect(isFunction(function named() {})).toBe(true);
            expect(isFunction(async () => {})).toBe(true);
            expect(isFunction(function* generator() {})).toBe(true);
            expect(isFunction(Math.max)).toBe(true);
            expect(isFunction(console.log)).toBe(true);
        });

        it("should return false for non-functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction("function")).toBe(false);
            expect(isFunction({})).toBe(false);
            expect(isFunction([])).toBe(false);
            expect(isFunction(null)).toBe(false);
            expect(isFunction(undefined)).toBe(false);
            expect(isFunction(123)).toBe(false);
        });
    });

    describe("isNonNegativeNumber", () => {
        it("should return true for non-negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(0)).toBe(true);
            expect(isNonNegativeNumber(123)).toBe(true);
            expect(isNonNegativeNumber(3.14)).toBe(true);
            expect(isNonNegativeNumber(Infinity)).toBe(true);
        });

        it("should return false for negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(-1)).toBe(false);
            expect(isNonNegativeNumber(-123)).toBe(false);
            expect(isNonNegativeNumber(-Infinity)).toBe(false);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(Number.NaN)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber("0")).toBe(false);
            expect(isNonNegativeNumber(true)).toBe(false);
            expect(isNonNegativeNumber(null)).toBe(false);
            expect(isNonNegativeNumber(undefined)).toBe(false);
        });
    });

    describe("isNonNullObject", () => {
        it("should return true for objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject({})).toBe(true);
            expect(isNonNullObject({ foo: "bar" })).toBe(true);
            expect(isNonNullObject(new Date())).toBe(true);
            expect(isNonNullObject(new Error())).toBe(true);
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject(null)).toBe(false);
        });

        it("should return false for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject([])).toBe(false);
            expect(
                isNonNullObject([
                    1,
                    2,
                    3,
                ])
            ).toBe(false);
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject("string")).toBe(false);
            expect(isNonNullObject(123)).toBe(false);
            expect(isNonNullObject(true)).toBe(false);
            expect(isNonNullObject(undefined)).toBe(false);
        });
    });

    describe("isPositiveNumber", () => {
        it("should return true for positive numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(1)).toBe(true);
            expect(isPositiveNumber(123)).toBe(true);
            expect(isPositiveNumber(3.14)).toBe(true);
            expect(isPositiveNumber(Infinity)).toBe(true);
        });

        it("should return false for zero", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(0)).toBe(false);
        });

        it("should return false for negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(-1)).toBe(false);
            expect(isPositiveNumber(-123)).toBe(false);
            expect(isPositiveNumber(-Infinity)).toBe(false);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(Number.NaN)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber("1")).toBe(false);
            expect(isPositiveNumber(true)).toBe(false);
            expect(isPositiveNumber(null)).toBe(false);
            expect(isPositiveNumber(undefined)).toBe(false);
        });
    });

    describe("isString", () => {
        it("should return true for strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isString("")).toBe(true);
            expect(isString("hello")).toBe(true);
            expect(isString("123")).toBe(true);
            expect(isString("true")).toBe(true);
            expect(isString(String(123))).toBe(true);
        });

        it("should return false for non-strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isString(123)).toBe(false);
            expect(isString(true)).toBe(false);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
            expect(isString({})).toBe(false);
            expect(isString([])).toBe(false);
        });
    });

    describe("isValidPort", () => {
        it("should return true for valid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(1)).toBe(true);
            expect(isValidPort(80)).toBe(true);
            expect(isValidPort(443)).toBe(true);
            expect(isValidPort(8080)).toBe(true);
            expect(isValidPort(65_535)).toBe(true);
        });

        it("should return false for port numbers outside valid range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(0)).toBe(false);
            expect(isValidPort(-1)).toBe(false);
            expect(isValidPort(65_536)).toBe(false);
            expect(isValidPort(100_000)).toBe(false);
        });

        it("should return false for non-integer numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(80.5)).toBe(false);
            expect(isValidPort(3.14)).toBe(false);
            expect(isValidPort(Infinity)).toBe(false);
            expect(isValidPort(-Infinity)).toBe(false);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(Number.NaN)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort("80")).toBe(false);
            expect(isValidPort(true)).toBe(false);
            expect(isValidPort(null)).toBe(false);
            expect(isValidPort(undefined)).toBe(false);
        });
    });

    describe("isValidTimestamp", () => {
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
            expect(isValidTimestamp(now)).toBe(true);
            expect(isValidTimestamp(now - 1000)).toBe(true); // 1 second ago
            expect(isValidTimestamp(now - 86_400_000)).toBe(true); // 1 day ago
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
            expect(isValidTimestamp(now + 1000)).toBe(true); // 1 second in future
            expect(isValidTimestamp(now + 86_400_000)).toBe(true); // exactly 1 day in future
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
            expect(isValidTimestamp(now + 86_400_001)).toBe(false); // just over 1 day in future
            expect(isValidTimestamp(now + 172_800_000)).toBe(false); // 2 days in future
        });

        it("should return false for zero and negative timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(0)).toBe(false);
            expect(isValidTimestamp(-1)).toBe(false);
            expect(isValidTimestamp(-86_400_000)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp("1672531200000")).toBe(false);
            expect(isValidTimestamp(new Date())).toBe(false);
            expect(isValidTimestamp(null)).toBe(false);
            expect(isValidTimestamp(undefined)).toBe(false);
        });

        it("should return false for NaN and infinite values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isValidTimestamp(Number.NaN)).toBe(false);
            expect(isValidTimestamp(Infinity)).toBe(false);
            expect(isValidTimestamp(-Infinity)).toBe(false);
        });
    });
});
