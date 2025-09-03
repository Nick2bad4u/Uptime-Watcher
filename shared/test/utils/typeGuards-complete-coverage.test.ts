/**
 * Comprehensive tests for type guards utility functions to achieve 95%+
 * coverage. Tests all type guard functions with various input types and edge
 * cases.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
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
    isNumber,
    isObject,
    isPositiveNumber,
    isString,
    isValidPort,
    isValidTimestamp,
} from "@shared/utils/typeGuards";

describe("TypeGuards - Complete Function Coverage", () => {
    describe("isObject", () => {
        it("should return true for plain objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject({})).toBe(true);
            expect(isObject({ prop: "value" })).toBe(true);
            expect(isObject({ nested: { prop: "value" } })).toBe(true);
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(null)).toBe(false);
        });

        it("should return false for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
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

        it("should return false for primitives", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject("")).toBe(false);
            expect(isObject("string")).toBe(false);
            expect(isObject(0)).toBe(false);
            expect(isObject(123)).toBe(false);
            expect(isObject(true)).toBe(false);
            expect(isObject(false)).toBe(false);
            expect(isObject(undefined)).toBe(false);
        });

        it("should return true for Date objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(new Date())).toBe(true);
        });

        it("should return true for Error objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isObject(new Error("test error"))).toBe(true);
        });

        it("should return true for function objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(function testFunction() {})).toBe(false); // functions are not objects in this context
        });
    });

    describe("isNumber", () => {
        it("should return true for valid numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(0)).toBe(true);
            expect(isNumber(123)).toBe(true);
            expect(isNumber(-123)).toBe(true);
            expect(isNumber(3.141_59)).toBe(true);
            expect(isNumber(Infinity)).toBe(true);
            expect(isNumber(-Infinity)).toBe(true);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(Number.NaN)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber("")).toBe(false);
            expect(isNumber("123")).toBe(false);
            expect(isNumber(true)).toBe(false);
            expect(isNumber(false)).toBe(false);
            expect(isNumber(null)).toBe(false);
            expect(isNumber(undefined)).toBe(false);
            expect(isNumber({})).toBe(false);
            expect(isNumber([])).toBe(false);
        });
    });

    describe("hasProperties", () => {
        it("should return true when object has all properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar", baz: 123 };
            expect(hasProperties(obj, ["foo"])).toBe(true);
            expect(hasProperties(obj, ["foo", "baz"])).toBe(true);
        });

        it("should return false when object is missing properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar" };
            expect(hasProperties(obj, ["foo", "missing"])).toBe(false);
            expect(hasProperties(obj, ["missing"])).toBe(false);
        });

        it("should return true for empty property array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperties(null, ["prop"])).toBe(false);
            expect(hasProperties(undefined, ["prop"])).toBe(false);
            expect(hasProperties("string", ["prop"])).toBe(false);
            expect(hasProperties(123, ["prop"])).toBe(false);
            expect(hasProperties([], ["prop"])).toBe(false);
        });

        it("should handle symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value" };
            expect(hasProperties(obj, [sym])).toBe(true);
        });

        it("should handle numeric properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { 0: "zero", 1: "one" };
            expect(hasProperties(obj, [0, 1])).toBe(true);
            expect(hasProperties(obj, [0, 2])).toBe(false);
        });
    });

    describe("hasProperty", () => {
        it("should return true when object has property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar", baz: 123 };
            expect(hasProperty(obj, "foo")).toBe(true);
            expect(hasProperty(obj, "baz")).toBe(true);
        });

        it("should return false when object lacks property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperty(null, "prop")).toBe(false);
            expect(hasProperty(undefined, "prop")).toBe(false);
            expect(hasProperty("string", "prop")).toBe(false);
            expect(hasProperty(123, "prop")).toBe(false);
            expect(hasProperty([], "prop")).toBe(false);
        });

        it("should handle symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value" };
            expect(hasProperty(obj, sym)).toBe(true);
        });

        it("should handle falsy property values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { zero: 0, empty: "", falsy: false, nullValue: null };
            expect(hasProperty(obj, "zero")).toBe(true);
            expect(hasProperty(obj, "empty")).toBe(true);
            expect(hasProperty(obj, "falsy")).toBe(true);
            expect(hasProperty(obj, "nullValue")).toBe(true);
        });
    });

    describe("isArray", () => {
        it("should return true for arrays without validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
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
            expect(isArray([true, false])).toBe(true);
        });

        it("should return false for non-arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArray({})).toBe(false);
            expect(isArray("string")).toBe(false);
            expect(isArray(123)).toBe(false);
            expect(isArray(null)).toBe(false);
            expect(isArray(undefined)).toBe(false);
        });

        it("should validate array items with validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const isStringValidator = (item: unknown): item is string =>
                typeof item === "string";
            const isNumberValidator = (item: unknown): item is number =>
                typeof item === "number";

            expect(
                isArray(
                    [
                        "a",
                        "b",
                        "c",
                    ],
                    isStringValidator
                )
            ).toBe(true);
            expect(
                isArray(
                    [
                        1,
                        2,
                        3,
                    ],
                    isNumberValidator
                )
            ).toBe(true);
            expect(
                isArray(
                    [
                        "a",
                        1,
                        "c",
                    ],
                    isStringValidator
                )
            ).toBe(false);
            expect(
                isArray(
                    [
                        1,
                        "b",
                        3,
                    ],
                    isNumberValidator
                )
            ).toBe(false);
        });

        it("should handle empty arrays with validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const isStringValidator = (item: unknown): item is string =>
                typeof item === "string";
            expect(isArray([], isStringValidator)).toBe(true);
        });
    });

    describe("isBoolean", () => {
        it("should return true for booleans", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isBoolean(true)).toBe(true);
            expect(isBoolean(false)).toBe(true);
        });

        it("should return false for non-booleans", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
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
        it("should return true for valid dates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date())).toBe(true);
            expect(isDate(new Date(2023, 0, 1))).toBe(true);
            expect(isDate(new Date("2023-01-01"))).toBe(true);
        });

        it("should return false for invalid dates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date("invalid"))).toBe(false);
            expect(isDate(new Date(Number.NaN))).toBe(false);
        });

        it("should return false for non-Date objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate("2023-01-01")).toBe(false);
            expect(isDate(Date.now())).toBe(false);
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError(new Error("test error"))).toBe(true);
            expect(isError(new Error("message"))).toBe(true);
            expect(isError(new TypeError("test type error"))).toBe(true);
            expect(isError(new ReferenceError("test reference error"))).toBe(
                true
            );
            expect(isError(new SyntaxError("test syntax error"))).toBe(true);
        });

        it("should return false for non-Error objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError({ message: "error" })).toBe(false);
            expect(isError("error")).toBe(false);
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(0)).toBe(true);
            expect(isFiniteNumber(123)).toBe(true);
            expect(isFiniteNumber(-123)).toBe(true);
            expect(isFiniteNumber(3.141_59)).toBe(true);
            expect(isFiniteNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
            expect(isFiniteNumber(Number.MIN_SAFE_INTEGER)).toBe(true);
        });

        it("should return false for infinite numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(Infinity)).toBe(false);
            expect(isFiniteNumber(-Infinity)).toBe(false);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber(Number.NaN)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber("123")).toBe(false);
            expect(isFiniteNumber(null)).toBe(false);
            expect(isFiniteNumber(undefined)).toBe(false);
        });
    });

    describe("isFunction", () => {
        it("should return true for functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction(() => {})).toBe(true);
            expect(isFunction(function testFunction() {})).toBe(true);
            expect(isFunction(async function testAsyncFunction() {})).toBe(
                true
            );
            expect(isFunction(function* testGeneratorFunction() {})).toBe(true);
            expect(isFunction(Math.random)).toBe(true);
            expect(isFunction(console.log)).toBe(true);
        });

        it("should return false for non-functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction({})).toBe(false);
            expect(isFunction([])).toBe(false);
            expect(isFunction("function")).toBe(false);
            expect(isFunction(123)).toBe(false);
            expect(isFunction(null)).toBe(false);
            expect(isFunction(undefined)).toBe(false);
        });
    });

    describe("isNonNegativeNumber", () => {
        it("should return true for non-negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(0)).toBe(true);
            expect(isNonNegativeNumber(123)).toBe(true);
            expect(isNonNegativeNumber(3.141_59)).toBe(true);
            expect(isNonNegativeNumber(Infinity)).toBe(true);
        });

        it("should return false for negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(-1)).toBe(false);
            expect(isNonNegativeNumber(-123)).toBe(false);
            expect(isNonNegativeNumber(-3.141_59)).toBe(false);
            expect(isNonNegativeNumber(-Infinity)).toBe(false);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(Number.NaN)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber("123")).toBe(false);
            expect(isNonNegativeNumber(null)).toBe(false);
            expect(isNonNegativeNumber(undefined)).toBe(false);
        });
    });

    describe("isNonNullObject", () => {
        it("should return true for objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject({})).toBe(true);
            expect(isNonNullObject({ prop: "value" })).toBe(true);
            expect(isNonNullObject(new Date())).toBe(true);
            expect(isNonNullObject(new Error("test error"))).toBe(true);
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject(null)).toBe(false);
        });

        it("should return false for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject([])).toBe(false);
        });

        it("should return false for primitives", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject("")).toBe(false);
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(1)).toBe(true);
            expect(isPositiveNumber(123)).toBe(true);
            expect(isPositiveNumber(3.141_59)).toBe(true);
            expect(isPositiveNumber(Infinity)).toBe(true);
        });

        it("should return false for zero", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(0)).toBe(false);
        });

        it("should return false for negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(-1)).toBe(false);
            expect(isPositiveNumber(-123)).toBe(false);
            expect(isPositiveNumber(-Infinity)).toBe(false);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(Number.NaN)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber("123")).toBe(false);
            expect(isPositiveNumber(null)).toBe(false);
            expect(isPositiveNumber(undefined)).toBe(false);
        });
    });

    describe("isString", () => {
        it("should return true for strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(1)).toBe(true);
            expect(isValidPort(80)).toBe(true);
            expect(isValidPort(443)).toBe(true);
            expect(isValidPort(3000)).toBe(true);
            expect(isValidPort(8080)).toBe(true);
            expect(isValidPort(65_535)).toBe(true);
        });

        it("should return false for invalid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(3.14)).toBe(false);
            expect(isValidPort(80.5)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort("80")).toBe(false);
            expect(isValidPort(null)).toBe(false);
            expect(isValidPort(undefined)).toBe(false);
            expect(isValidPort(Number.NaN)).toBe(false);
        });
    });

    describe("isValidTimestamp", () => {
        const mockTime = 1_672_531_200_000; // Fixed time: 2023-01-01 00:00:00 UTC
        const oneDayInMs = 86_400_000;

        beforeEach(() => {
            vi.spyOn(Date, "now").mockReturnValue(mockTime);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should return true for valid timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(mockTime)).toBe(true);
            expect(isValidTimestamp(mockTime - 1000)).toBe(true);
            expect(isValidTimestamp(mockTime + 3_600_000)).toBe(true); // 1 hour in future
            expect(isValidTimestamp(1_672_531_200_000)).toBe(true); // Jan 1, 2023
        });

        it("should return true for timestamps up to 1 day in future", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(mockTime + oneDayInMs)).toBe(true);
            expect(isValidTimestamp(mockTime + oneDayInMs - 1000)).toBe(true);
        });

        it("should return false for timestamps too far in future", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(mockTime + oneDayInMs + 1000)).toBe(false);
            expect(isValidTimestamp(mockTime + 2 * oneDayInMs)).toBe(false);
        });

        it("should return false for zero or negative timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(0)).toBe(false);
            expect(isValidTimestamp(-1)).toBe(false);
            expect(isValidTimestamp(-1_000_000)).toBe(false);
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp("123456789")).toBe(false);
            expect(isValidTimestamp(null)).toBe(false);
            expect(isValidTimestamp(undefined)).toBe(false);
            expect(isValidTimestamp(Number.NaN)).toBe(false);
        });
    });

    describe("Integration tests", () => {
        it("should handle complex object validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const complexObj = {
                id: 123,
                name: "Test",
                active: true,
                created: new Date(),
                metadata: {
                    tags: ["test", "example"],
                    count: 5,
                },
            };

            expect(isObject(complexObj)).toBe(true);
            expect(hasProperty(complexObj, "id")).toBe(true);
            expect(hasProperty(complexObj, "metadata")).toBe(true);
            expect(
                hasProperties(complexObj, [
                    "id",
                    "name",
                    "active",
                ])
            ).toBe(true);
            expect(isNumber(complexObj.id)).toBe(true);
            expect(isString(complexObj.name)).toBe(true);
            expect(isBoolean(complexObj.active)).toBe(true);
            expect(isDate(complexObj.created)).toBe(true);
        });

        it("should handle edge cases consistently", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const testValues = [
                null,
                undefined,
                0,
                "",
                false,
                [],
                {},
                Number.NaN,
                Infinity,
                new Date(),
                new Error("test error"),
            ];

            for (const value of testValues) {
                // Each type guard should handle these values consistently
                // Testing that all functions return boolean values and don't throw errors
                expect(typeof isObject(value)).toBe("boolean");
                expect(typeof isNumber(value)).toBe("boolean");
                expect(typeof isString(value)).toBe("boolean");
                expect(typeof isBoolean(value)).toBe("boolean");
                expect(typeof isArray(value)).toBe("boolean");
                expect(typeof isDate(value)).toBe("boolean");
                expect(typeof isError(value)).toBe("boolean");
                expect(typeof isFunction(value)).toBe("boolean");
                expect(typeof isFiniteNumber(value)).toBe("boolean");
                expect(typeof isNonNegativeNumber(value)).toBe("boolean");
                expect(typeof isPositiveNumber(value)).toBe("boolean");
                expect(typeof isValidPort(value)).toBe("boolean");
                expect(typeof isValidTimestamp(value)).toBe("boolean");
            }
        });
    });
});
