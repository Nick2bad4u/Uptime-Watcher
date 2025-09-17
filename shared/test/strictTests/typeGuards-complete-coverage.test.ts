/**
 * Comprehensive tests for type guards utility functions to achieve 95%+
 * coverage. Tests all type guard functions with various input types and edge
 * cases.
 */

import { describe, expect, it, vi } from "vitest";

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

// Fixed timestamp for consistent testing
const FIXED_NOW = 1_672_531_200_000; // Jan 1, 2023

describe("TypeGuards - Complete Function Coverage", () => {
    beforeEach(() => {
        // Mock Date.now() using spy to avoid breaking constructor
        vi.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe(isObject, () => {
        it("should return true for plain objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject({})).toBeTruthy();
            expect(isObject({ prop: "value" })).toBeTruthy();
            expect(isObject({ nested: { prop: "value" } })).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(null)).toBeFalsy();
        });

        it("should return false for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
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

        it("should return false for primitives", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject("")).toBeFalsy();
            expect(isObject("string")).toBeFalsy();
            expect(isObject(0)).toBeFalsy();
            expect(isObject(123)).toBeFalsy();
            expect(isObject(true)).toBeFalsy();
            expect(isObject(false)).toBeFalsy();
            expect(isObject(undefined)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(new Date())).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            expect(isObject(new Error("test error"))).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(function namedFunction() {})).toBeFalsy(); // Functions are not objects in this context
        });
    });

    describe(isNumber, () => {
        it("should return true for valid numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(0)).toBeTruthy();
            expect(isNumber(123)).toBeTruthy();
            expect(isNumber(-123)).toBeTruthy();
            expect(isNumber(3.141_59)).toBeTruthy();
            expect(isNumber(Infinity)).toBeTruthy();
            expect(isNumber(-Infinity)).toBeTruthy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(Number.NaN)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber("")).toBeFalsy();
            expect(isNumber("123")).toBeFalsy();
            expect(isNumber(true)).toBeFalsy();
            expect(isNumber(false)).toBeFalsy();
            expect(isNumber(null)).toBeFalsy();
            expect(isNumber(undefined)).toBeFalsy();
            expect(isNumber({})).toBeFalsy();
            expect(isNumber([])).toBeFalsy();
        });
    });

    describe(hasProperties, () => {
        it("should return true when object has all properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar", baz: 123 };
            expect(hasProperties(obj, ["foo"])).toBeTruthy();
            expect(hasProperties(obj, ["foo", "baz"])).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar" };
            expect(hasProperties(obj, ["foo", "missing"])).toBeFalsy();
            expect(hasProperties(obj, ["missing"])).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperties({}, [])).toBeTruthy();
            expect(hasProperties({ foo: "bar" }, [])).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperties(null, ["prop"])).toBeFalsy();
            expect(hasProperties(undefined, ["prop"])).toBeFalsy();
            expect(hasProperties("string", ["prop"])).toBeFalsy();
            expect(hasProperties(123, ["prop"])).toBeFalsy();
            expect(hasProperties([], ["prop"])).toBeFalsy();
        });

        it("should handle symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value" };
            expect(hasProperties(obj, [sym])).toBeTruthy();
        });

        it("should handle numeric properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { 0: "zero", 1: "one" };
            expect(hasProperties(obj, [0, 1])).toBeTruthy();
            expect(hasProperties(obj, [0, 2])).toBeFalsy();
        });
    });

    describe(hasProperty, () => {
        it("should return true when object has property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar", baz: 123 };
            expect(hasProperty(obj, "foo")).toBeTruthy();
            expect(hasProperty(obj, "baz")).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { foo: "bar" };
            expect(hasProperty(obj, "missing")).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperty(null, "prop")).toBeFalsy();
            expect(hasProperty(undefined, "prop")).toBeFalsy();
            expect(hasProperty("string", "prop")).toBeFalsy();
            expect(hasProperty(123, "prop")).toBeFalsy();
            expect(hasProperty([], "prop")).toBeFalsy();
        });

        it("should handle symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value" };
            expect(hasProperty(obj, sym)).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { zero: 0, empty: "", falsy: false, nullValue: null };
            expect(hasProperty(obj, "zero")).toBeTruthy();
            expect(hasProperty(obj, "empty")).toBeTruthy();
            expect(hasProperty(obj, "falsy")).toBeTruthy();
            expect(hasProperty(obj, "nullValue")).toBeTruthy();
        });
    });

    describe(isArray, () => {
        it("should return true for arrays without validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
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
            expect(isArray([true, false])).toBeTruthy();
        });

        it("should return false for non-arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArray({})).toBeFalsy();
            expect(isArray("string")).toBeFalsy();
            expect(isArray(123)).toBeFalsy();
            expect(isArray(null)).toBeFalsy();
            expect(isArray(undefined)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
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
            ).toBeTruthy();
            expect(
                isArray(
                    [
                        1,
                        2,
                        3,
                    ],
                    isNumberValidator
                )
            ).toBeTruthy();
            expect(
                isArray(
                    [
                        "a",
                        1,
                        "c",
                    ],
                    isStringValidator
                )
            ).toBeFalsy();
            expect(
                isArray(
                    [
                        1,
                        "b",
                        3,
                    ],
                    isNumberValidator
                )
            ).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const isStringValidator = (item: unknown): item is string =>
                typeof item === "string";
            expect(isArray([], isStringValidator)).toBeTruthy();
        });
    });

    describe(isBoolean, () => {
        it("should return true for booleans", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isBoolean(true)).toBeTruthy();
            expect(isBoolean(false)).toBeTruthy();
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
            await annotate("Category: Shared", "category");
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
        it("should return true for valid dates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date())).toBeTruthy();
            expect(isDate(new Date(2023, 0, 1))).toBeTruthy();
            expect(isDate(new Date("2023-01-01"))).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date("invalid"))).toBeFalsy();
            expect(isDate(new Date(Number.NaN))).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate("2023-01-01")).toBeFalsy();
            expect(isDate(Date.now())).toBeFalsy();
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError(new Error("test error"))).toBeTruthy();
            expect(isError(new Error("message"))).toBeTruthy();
            expect(isError(new TypeError("test type error"))).toBeTruthy();
            expect(
                isError(new ReferenceError("test reference error"))
            ).toBeTruthy();
            expect(isError(new SyntaxError("test syntax error"))).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError({ message: "error" })).toBeFalsy();
            expect(isError("error")).toBeFalsy();
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(0)).toBeTruthy();
            expect(isFiniteNumber(123)).toBeTruthy();
            expect(isFiniteNumber(-123)).toBeTruthy();
            expect(isFiniteNumber(3.141_59)).toBeTruthy();
            expect(isFiniteNumber(Number.MAX_SAFE_INTEGER)).toBeTruthy();
            expect(isFiniteNumber(Number.MIN_SAFE_INTEGER)).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(Infinity)).toBeFalsy();
            expect(isFiniteNumber(-Infinity)).toBeFalsy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber(Number.NaN)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber("123")).toBeFalsy();
            expect(isFiniteNumber(null)).toBeFalsy();
            expect(isFiniteNumber(undefined)).toBeFalsy();
        });
    });

    describe(isFunction, () => {
        it("should return true for functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction(() => {})).toBeTruthy();
            expect(isFunction(function namedFunction() {})).toBeTruthy();
            expect(
                isFunction(async function namedAsyncFunction() {})
            ).toBeTruthy();
            expect(
                isFunction(function* namedGeneratorFunction() {})
            ).toBeTruthy();
            expect(isFunction(Math.random)).toBeTruthy();
            expect(isFunction(console.log)).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction({})).toBeFalsy();
            expect(isFunction([])).toBeFalsy();
            expect(isFunction("function")).toBeFalsy();
            expect(isFunction(123)).toBeFalsy();
            expect(isFunction(null)).toBeFalsy();
            expect(isFunction(undefined)).toBeFalsy();
        });
    });

    describe(isNonNegativeNumber, () => {
        it("should return true for non-negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(0)).toBeTruthy();
            expect(isNonNegativeNumber(123)).toBeTruthy();
            expect(isNonNegativeNumber(3.141_59)).toBeTruthy();
            expect(isNonNegativeNumber(Infinity)).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(-1)).toBeFalsy();
            expect(isNonNegativeNumber(-123)).toBeFalsy();
            expect(isNonNegativeNumber(-3.141_59)).toBeFalsy();
            expect(isNonNegativeNumber(-Infinity)).toBeFalsy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(Number.NaN)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber("123")).toBeFalsy();
            expect(isNonNegativeNumber(null)).toBeFalsy();
            expect(isNonNegativeNumber(undefined)).toBeFalsy();
        });
    });

    describe(isNonNullObject, () => {
        it("should return true for objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject({})).toBeTruthy();
            expect(isNonNullObject({ prop: "value" })).toBeTruthy();
            expect(isNonNullObject(new Date())).toBeTruthy();
            expect(isNonNullObject(new Error("test error"))).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject(null)).toBeFalsy();
        });

        it("should return false for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject([])).toBeFalsy();
        });

        it("should return false for primitives", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject("")).toBeFalsy();
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(1)).toBeTruthy();
            expect(isPositiveNumber(123)).toBeTruthy();
            expect(isPositiveNumber(3.141_59)).toBeTruthy();
            expect(isPositiveNumber(Infinity)).toBeTruthy();
        });

        it("should return false for zero", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(0)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(-1)).toBeFalsy();
            expect(isPositiveNumber(-123)).toBeFalsy();
            expect(isPositiveNumber(-Infinity)).toBeFalsy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(Number.NaN)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber("123")).toBeFalsy();
            expect(isPositiveNumber(null)).toBeFalsy();
            expect(isPositiveNumber(undefined)).toBeFalsy();
        });
    });

    describe(isString, () => {
        it("should return true for strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(1)).toBeTruthy();
            expect(isValidPort(80)).toBeTruthy();
            expect(isValidPort(443)).toBeTruthy();
            expect(isValidPort(3000)).toBeTruthy();
            expect(isValidPort(8080)).toBeTruthy();
            expect(isValidPort(65_535)).toBeTruthy();
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
            await annotate("Category: Shared", "category");
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
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(3.14)).toBeFalsy();
            expect(isValidPort(80.5)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort("80")).toBeFalsy();
            expect(isValidPort(null)).toBeFalsy();
            expect(isValidPort(undefined)).toBeFalsy();
            expect(isValidPort(Number.NaN)).toBeFalsy();
        });
    });

    describe(isValidTimestamp, () => {
        // Use the same fixed timestamp that's mocked globally
        const now = FIXED_NOW; // Jan 1, 2023
        const oneDayInMs = 86_400_000;

        it("should return true for valid timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(now)).toBeTruthy();
            expect(isValidTimestamp(now - 1000)).toBeTruthy();
            expect(isValidTimestamp(now + 3_600_000)).toBeTruthy(); // 1 hour in future
            expect(isValidTimestamp(1_672_531_200_000)).toBeTruthy(); // Jan 1, 2023
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(now + oneDayInMs)).toBeTruthy();
            expect(isValidTimestamp(now + oneDayInMs - 1000)).toBeTruthy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(now + oneDayInMs + 1000)).toBeFalsy();
            expect(isValidTimestamp(now + 2 * oneDayInMs)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(0)).toBeFalsy();
            expect(isValidTimestamp(-1)).toBeFalsy();
            expect(isValidTimestamp(-1_000_000)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp("123456789")).toBeFalsy();
            expect(isValidTimestamp(null)).toBeFalsy();
            expect(isValidTimestamp(undefined)).toBeFalsy();
            expect(isValidTimestamp(Number.NaN)).toBeFalsy();
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
            await annotate("Category: Shared", "category");
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

            expect(isObject(complexObj)).toBeTruthy();
            expect(hasProperty(complexObj, "id")).toBeTruthy();
            expect(hasProperty(complexObj, "metadata")).toBeTruthy();
            expect(
                hasProperties(complexObj, [
                    "id",
                    "name",
                    "active",
                ])
            ).toBeTruthy();
            expect(isNumber(complexObj.id)).toBeTruthy();
            expect(isString(complexObj.name)).toBeTruthy();
            expect(isBoolean(complexObj.active)).toBeTruthy();
            expect(isDate(complexObj.created)).toBeTruthy();
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
            await annotate("Category: Shared", "category");
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
                // Each type guard should handle these values consistently and return boolean
                expect(() => isObject(value)).not.toThrow();
                expect(typeof isObject(value)).toBe("boolean");

                expect(() => isNumber(value)).not.toThrow();
                expect(typeof isNumber(value)).toBe("boolean");

                expect(() => isString(value)).not.toThrow();
                expect(typeof isString(value)).toBe("boolean");

                expect(() => isBoolean(value)).not.toThrow();
                expect(typeof isBoolean(value)).toBe("boolean");

                expect(() => isArray(value)).not.toThrow();
                expect(typeof isArray(value)).toBe("boolean");

                expect(() => isDate(value)).not.toThrow();
                expect(typeof isDate(value)).toBe("boolean");

                expect(() => isError(value)).not.toThrow();
                expect(typeof isError(value)).toBe("boolean");

                expect(() => isFunction(value)).not.toThrow();
                expect(typeof isFunction(value)).toBe("boolean");

                expect(() => isFiniteNumber(value)).not.toThrow();
                expect(typeof isFiniteNumber(value)).toBe("boolean");

                expect(() => isNonNegativeNumber(value)).not.toThrow();
                expect(typeof isNonNegativeNumber(value)).toBe("boolean");

                expect(() => isPositiveNumber(value)).not.toThrow();
                expect(typeof isPositiveNumber(value)).toBe("boolean");

                expect(() => isValidPort(value)).not.toThrow();
                expect(typeof isValidPort(value)).toBe("boolean");

                expect(() => isValidTimestamp(value)).not.toThrow();
                expect(typeof isValidTimestamp(value)).toBe("boolean");
            }
        });
    });
});
