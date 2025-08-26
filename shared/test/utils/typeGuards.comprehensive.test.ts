import { describe, it, expect } from "vitest";
import { isValidUrl } from "../../validation/validatorUtils";
// Import ALL functions from typeGuards to ensure coverage
import * as typeGuards from "../../utils/typeGuards";
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
} from "../../utils/typeGuards";

describe("Type Guards - Comprehensive Coverage", () => {
    // COVERAGE CRITICAL: Call every function to ensure 100% coverage
    describe("Function Coverage Validation", () => {
        it("should call every exported function for complete coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            // Call ALL functions using both named imports and namespace import
            // This ensures that every function in typeGuards.ts is executed

            // Test basic object for multiple functions
            const testObj = { a: 1, b: 2 };
            const testArray = [
                1,
                2,
                3,
            ];
            const testDate = new Date();
            const testError = new Error("test");

            // Call every function with various inputs to ensure coverage
            expect(typeGuards.isObject(testObj)).toBe(true);
            expect(typeGuards.isNumber(42)).toBe(true);
            expect(typeGuards.hasProperties(testObj, ["a"])).toBe(true);
            expect(typeGuards.hasProperty(testObj, "a")).toBe(true);
            expect(typeGuards.isArray(testArray)).toBe(true);
            expect(typeGuards.isBoolean(true)).toBe(true);
            expect(typeGuards.isDate(testDate)).toBe(true);
            expect(typeGuards.isError(testError)).toBe(true);
            expect(typeGuards.isFiniteNumber(42)).toBe(true);
            expect(typeGuards.isFunction(() => {})).toBe(true);
            expect(typeGuards.isNonNegativeNumber(0)).toBe(true);
            expect(typeGuards.isNonNullObject(testObj)).toBe(true);
            expect(typeGuards.isPositiveNumber(1)).toBe(true);
            expect(typeGuards.isString("test")).toBe(true);
            expect(typeGuards.isValidPort(80)).toBe(true);
            expect(typeGuards.isValidTimestamp(Date.now())).toBe(true);

            // Also test with false cases to ensure all branches are covered
            expect(typeGuards.isObject(null)).toBe(false);
            expect(typeGuards.isNumber("not a number")).toBe(false);
            expect(typeGuards.hasProperties(testObj, ["nonexistent"])).toBe(
                false
            );
            expect(typeGuards.hasProperty(testObj, "nonexistent")).toBe(false);
            expect(typeGuards.isArray("not an array")).toBe(false);
            expect(typeGuards.isBoolean("not a boolean")).toBe(false);
            expect(typeGuards.isDate("not a date")).toBe(false);
            expect(typeGuards.isError("not an error")).toBe(false);
            expect(typeGuards.isFiniteNumber(Infinity)).toBe(false);
            expect(typeGuards.isFunction("not a function")).toBe(false);
            expect(typeGuards.isNonNegativeNumber(-1)).toBe(false);
            expect(typeGuards.isNonNullObject(null)).toBe(false);
            expect(typeGuards.isPositiveNumber(0)).toBe(false);
            expect(typeGuards.isString(123)).toBe(false);
            expect(typeGuards.isValidPort(99999)).toBe(false);
            expect(typeGuards.isValidTimestamp(-1)).toBe(false);
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

            const obj = { a: 1, b: 2, c: 3 };
            expect(hasProperties(obj, ["a", "b"])).toBe(true);
            expect(
                hasProperties(obj, [
                    "a",
                    "b",
                    "c",
                ])
            ).toBe(true);
            expect(hasProperties(obj, [])).toBe(true); // Empty array - vacuous truth
        });

        it("should return false when object is missing some properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2 };
            expect(
                hasProperties(obj, [
                    "a",
                    "b",
                    "c",
                ])
            ).toBe(false);
            expect(hasProperties(obj, ["d"])).toBe(false);
        });

        it("should return false for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperties(null, ["a"])).toBe(false);
            expect(hasProperties(undefined, ["a"])).toBe(false);
            expect(hasProperties("string", ["a"])).toBe(false);
            expect(hasProperties(42, ["a"])).toBe(false);
            expect(hasProperties([], ["a"])).toBe(false);
            expect(hasProperties(true, ["a"])).toBe(false);
        });

        it("should handle symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value", regular: "prop" };
            expect(hasProperties(obj, [sym])).toBe(true);
            expect(hasProperties(obj, ["regular", sym])).toBe(true);
        });

        it("should handle inherited properties correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Create proper prototype inheritance
            const parent = { inherited: "parentValue" };
            const child = Object.create(parent);
            child.own = "childValue";

            // hasProperties uses Object.hasOwn, so inherited properties should not count
            expect(hasProperties(child, ["own"])).toBe(true);
            expect(hasProperties(child, ["inherited"])).toBe(false); // inherited, not own
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = Object.create(null); // Object without prototype
            obj.prop = "value";
            expect(hasProperties(obj, ["prop"])).toBe(true);

            // Empty properties array
            expect(hasProperties({}, [])).toBe(true);
            expect(hasProperties(null, [])).toBe(false); // Still need valid object
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

            const obj = { a: 1, b: undefined, c: null };
            expect(hasProperty(obj, "a")).toBe(true);
            expect(hasProperty(obj, "b")).toBe(true); // undefined is still a property
            expect(hasProperty(obj, "c")).toBe(true); // null is still a property
        });

        it("should return false when object doesn't have the property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1 };
            expect(hasProperty(obj, "b")).toBe(false);
            expect(hasProperty(obj, "toString")).toBe(false); // inherited property
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
            expect(hasProperty(undefined, "prop")).toBe(false);
            expect(hasProperty("string", "prop")).toBe(false);
            expect(hasProperty(42, "prop")).toBe(false);
            expect(hasProperty([], "prop")).toBe(false);
            expect(hasProperty(true, "prop")).toBe(false);
        });

        it("should handle symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value" };
            expect(hasProperty(obj, sym)).toBe(true);
        });

        it("should handle numeric property keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { 0: "zero", 1: "one" };
            expect(hasProperty(obj, 0)).toBe(true);
            expect(hasProperty(obj, 1)).toBe(true);
            expect(hasProperty(obj, 2)).toBe(false);
        });
    });

    describe("isArray", () => {
        it("should return true for arrays without validator", async ({
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
            expect(isArray(42)).toBe(false);
            expect(isArray(null)).toBe(false);
            expect(isArray(undefined)).toBe(false);
            expect(isArray(true)).toBe(false);
        });

        it("should validate array items when validator is provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const isString = (value: unknown): value is string =>
                typeof value === "string";
            const isNumber = (value: unknown): value is number =>
                typeof value === "number";

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
            expect(isArray([], isString)).toBe(true); // Empty array passes any validator

            // Mixed arrays should fail type-specific validators
            expect(isArray([1, "mixed"], isString)).toBe(false);
            expect(isArray(["mixed", 1], isNumber)).toBe(false);
            expect(
                isArray(
                    [
                        1,
                        2,
                        "not number",
                    ],
                    isNumber
                )
            ).toBe(false);
        });

        it("should handle complex validators", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const isPositiveNumber = (value: unknown): value is number =>
                typeof value === "number" && value > 0;

            expect(
                isArray(
                    [
                        1,
                        2,
                        3,
                    ],
                    isPositiveNumber
                )
            ).toBe(true);
            expect(
                isArray(
                    [
                        0,
                        1,
                        2,
                    ],
                    isPositiveNumber
                )
            ).toBe(false); // 0 is not positive
            expect(
                isArray(
                    [
                        -1,
                        1,
                        2,
                    ],
                    isPositiveNumber
                )
            ).toBe(false); // -1 is not positive
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

        it("should handle Boolean object instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Boolean objects are not primitive booleans
            // eslint-disable-next-line unicorn/new-for-builtins
            expect(isBoolean(new Boolean(true))).toBe(false);
            // eslint-disable-next-line unicorn/new-for-builtins
            expect(isBoolean(new Boolean(false))).toBe(false);
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
            expect(isDate(new Date(0))).toBe(true); // Unix epoch
            expect(isDate(new Date(Date.now()))).toBe(true);
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
            expect(isDate(1_672_531_200_000)).toBe(false); // Valid timestamp but not Date
            expect(isDate(null)).toBe(false);
            expect(isDate(undefined)).toBe(false);
            expect(isDate({})).toBe(false);
            expect(isDate([])).toBe(false);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Date.prototype is a Date but invalid
            expect(isDate(Date.prototype)).toBe(false);

            // Date-like objects should fail
            const dateLike = { getTime: () => Date.now() };
            expect(isDate(dateLike)).toBe(false);
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

            expect(isError(new Error("test error"))).toBe(true);
            expect(isError(new Error("message"))).toBe(true);
            expect(isError(new TypeError("type error"))).toBe(true);
            expect(isError(new ReferenceError("reference error"))).toBe(true);
            expect(isError(new SyntaxError("syntax error"))).toBe(true);
            expect(isError(new RangeError("range error"))).toBe(true);
        });

        it("should return false for non-Error values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError("error")).toBe(false);
            expect(isError({ message: "error" })).toBe(false);
            expect(isError(null)).toBe(false);
            expect(isError(undefined)).toBe(false);
            expect(isError({})).toBe(false);
            expect(isError([])).toBe(false);
        });

        it("should handle custom Error subclasses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            class CustomError extends Error {
                constructor(message?: string) {
                    super(message);
                    this.name = "CustomError";
                }
            }

            expect(isError(new CustomError())).toBe(true);
            expect(isError(new CustomError("custom message"))).toBe(true);
        });

        it("should handle Error-like objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const errorLike = {
                name: "Error",
                message: "Something went wrong",
                stack: "Error: Something went wrong\n    at ...",
            };

            expect(isError(errorLike)).toBe(false); // Not instanceof Error
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
            expect(isFiniteNumber(42)).toBe(true);
            expect(isFiniteNumber(-42)).toBe(true);
            expect(isFiniteNumber(3.14)).toBe(true);
            expect(isFiniteNumber(-3.14)).toBe(true);
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
            expect(isFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false);
            expect(isFiniteNumber(Number.NEGATIVE_INFINITY)).toBe(false);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber(Number.NaN)).toBe(false);
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

            expect(isFiniteNumber("42")).toBe(false);
            expect(isFiniteNumber(null)).toBe(false);
            expect(isFiniteNumber(undefined)).toBe(false);
            expect(isFiniteNumber(true)).toBe(false);
            expect(isFiniteNumber({})).toBe(false);
            expect(isFiniteNumber([])).toBe(false);
        });

        it("should handle edge number values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber(Number.MIN_VALUE)).toBe(true);
            expect(isFiniteNumber(-Number.MIN_VALUE)).toBe(true);
            expect(isFiniteNumber(Number.MAX_VALUE)).toBe(true);
            expect(isFiniteNumber(-Number.MAX_VALUE)).toBe(true);
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
            expect(isFunction(async () => {})).toBe(true);
            expect(isFunction(function* () {})).toBe(true);
            expect(isFunction(console.log)).toBe(true);
            expect(isFunction(Math.max)).toBe(true);
        });

        it("should return true for constructors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            expect(isFunction(Array)).toBe(true);
            expect(isFunction(Object)).toBe(true);
            expect(isFunction(Date)).toBe(true);
            expect(isFunction(function Constructor() {})).toBe(true);
        });

        it("should return false for non-functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction({})).toBe(false);
            expect(isFunction([])).toBe(false);
            expect(isFunction("function")).toBe(false);
            expect(isFunction(42)).toBe(false);
            expect(isFunction(null)).toBe(false);
            expect(isFunction(undefined)).toBe(false);
            expect(isFunction(true)).toBe(false);
        });

        it("should handle class constructors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            class TestClass {
                public name = "test";
            }
            expect(isFunction(TestClass)).toBe(true);
        });

        it("should handle bound functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            function testFn() {}
            const boundFn = testFn.bind(null);
            expect(isFunction(boundFn)).toBe(true);
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
            expect(isNonNegativeNumber(1)).toBe(true);
            expect(isNonNegativeNumber(42)).toBe(true);
            expect(isNonNegativeNumber(3.14)).toBe(true);
            expect(isNonNegativeNumber(Number.MAX_VALUE)).toBe(true);
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
            expect(isNonNegativeNumber(-42)).toBe(false);
            expect(isNonNegativeNumber(-3.14)).toBe(false);
            expect(isNonNegativeNumber(Number.MIN_SAFE_INTEGER)).toBe(false);
        });

        it("should return false for NaN and non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(Number.NaN)).toBe(false);
            expect(isNonNegativeNumber("5")).toBe(false);
            expect(isNonNegativeNumber(null)).toBe(false);
        });

        it("should handle infinity correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            // Infinity is a number in JavaScript, so these should return true
            expect(isNonNegativeNumber(Infinity)).toBe(true);
            expect(isNonNegativeNumber(-Infinity)).toBe(false); // negative
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
            expect(isNonNegativeNumber(null)).toBe(false);
            expect(isNonNegativeNumber(undefined)).toBe(false);
            expect(isNonNegativeNumber(true)).toBe(false);
            expect(isNonNegativeNumber({})).toBe(false);
            expect(isNonNegativeNumber([])).toBe(false);
        });
    });

    describe("isNonNullObject", () => {
        it("should return true for plain objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject({})).toBe(true);
            expect(isNonNullObject({ a: 1 })).toBe(true);
            expect(isNonNullObject(Object.create(null))).toBe(true);
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

        it("should return false for primitives", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject("string")).toBe(false);
            expect(isNonNullObject(42)).toBe(false);
            expect(isNonNullObject(true)).toBe(false);
            expect(isNonNullObject(undefined)).toBe(false);
        });

        it("should return true for object instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject(new Date())).toBe(true);
            expect(isNonNullObject(new Error("test error"))).toBe(true);
            expect(isNonNullObject(/regex/)).toBe(true);
        });

        it("should return false for functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject(() => {})).toBe(false);
            expect(isNonNullObject(function () {})).toBe(false);
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
            expect(isNumber(42)).toBe(true);
            expect(isNumber(-42)).toBe(true);
            expect(isNumber(3.14)).toBe(true);
            expect(isNumber(-3.14)).toBe(true);
            expect(isNumber(Infinity)).toBe(true);
            expect(isNumber(-Infinity)).toBe(true);
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(Number.NaN)).toBe(false);
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

            expect(isNumber("42")).toBe(false);
            expect(isNumber(null)).toBe(false);
            expect(isNumber(undefined)).toBe(false);
            expect(isNumber(true)).toBe(false);
            expect(isNumber({})).toBe(false);
            expect(isNumber([])).toBe(false);
        });

        it("should handle Number object instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // eslint-disable-next-line unicorn/new-for-builtins
            expect(isNumber(new Number(42))).toBe(false); // Objects, not primitives
        });

        it("should handle edge number values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(Number.MAX_VALUE)).toBe(true);
            expect(isNumber(Number.MIN_VALUE)).toBe(true);
            expect(isNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
            expect(isNumber(Number.MIN_SAFE_INTEGER)).toBe(true);
        });
    });

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
            expect(isObject({ a: 1 })).toBe(true);
            expect(isObject(Object.create(null))).toBe(true);
        });

        it("should return true for object instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(new Date())).toBe(true);
            expect(isObject(new Error("test error"))).toBe(true);
            expect(isObject(/regex/)).toBe(true);
            expect(isObject(new Map())).toBe(true);
            expect(isObject(new Set())).toBe(true);
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

        it("should return false for primitives", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject("string")).toBe(false);
            expect(isObject(42)).toBe(false);
            expect(isObject(true)).toBe(false);
            expect(isObject(undefined)).toBe(false);
        });

        it("should return false for functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(() => {})).toBe(false);
            expect(isObject(function () {})).toBe(false);
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
            expect(isPositiveNumber(42)).toBe(true);
            expect(isPositiveNumber(3.14)).toBe(true);
            expect(isPositiveNumber(0.1)).toBe(true);
            expect(isPositiveNumber(Number.MAX_VALUE)).toBe(true);
        });

        it("should return false for zero", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(0)).toBe(false);
            expect(isPositiveNumber(-0)).toBe(false);
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
            expect(isPositiveNumber(-42)).toBe(false);
            expect(isPositiveNumber(-3.14)).toBe(false);
            expect(isPositiveNumber(Number.MIN_SAFE_INTEGER)).toBe(false);
        });

        it("should return false for NaN, zero, and non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(Number.NaN)).toBe(false);
            expect(isPositiveNumber(0)).toBe(false);
            expect(isPositiveNumber("5")).toBe(false);
            expect(isPositiveNumber(null)).toBe(false);
        });

        it("should handle infinity correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            // Infinity is a number in JavaScript, so positive infinity should return true
            expect(isPositiveNumber(Infinity)).toBe(true);
            expect(isPositiveNumber(-Infinity)).toBe(false); // negative
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
            expect(isPositiveNumber(null)).toBe(false);
            expect(isPositiveNumber(undefined)).toBe(false);
            expect(isPositiveNumber(true)).toBe(false);
            expect(isPositiveNumber({})).toBe(false);
            expect(isPositiveNumber([])).toBe(false);
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
            expect(isString("null")).toBe(true);
        });

        it("should return false for non-strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isString(42)).toBe(false);
            expect(isString(true)).toBe(false);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
            expect(isString({})).toBe(false);
            expect(isString([])).toBe(false);
        });

        it("should handle String object instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // eslint-disable-next-line unicorn/new-for-builtins
            expect(isString(new String("hello"))).toBe(false); // Objects, not primitives
        });

        it("should handle template literals", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const name = "world";
            expect(isString(`Hello ${name}`)).toBe(true);
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
            expect(isValidPort(3000)).toBe(true);
            expect(isValidPort(8080)).toBe(true);
            expect(isValidPort(65_535)).toBe(true); // Maximum port
        });

        it("should return false for invalid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(0)).toBe(false); // Too low
            expect(isValidPort(65_536)).toBe(false); // Too high
            expect(isValidPort(-1)).toBe(false); // Negative
            expect(isValidPort(3.14)).toBe(false); // Not integer
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
            expect(isValidPort(null)).toBe(false);
            expect(isValidPort(undefined)).toBe(false);
            expect(isValidPort(true)).toBe(false);
            expect(isValidPort({})).toBe(false);
            expect(isValidPort([])).toBe(false);
        });

        it("should return false for NaN and infinity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isValidPort(Number.NaN)).toBe(false);
            expect(isValidPort(Infinity)).toBe(false);
            expect(isValidPort(-Infinity)).toBe(false);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(1)).toBe(true); // Still integer
            expect(isValidPort(1.1)).toBe(false); // Not integer
        });
    });

    describe("isValidTimestamp", () => {
        const now = Date.now();
        const dayInMs = 86_400_000;

        it("should return true for valid timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(1)).toBe(true); // Very old but positive
            expect(isValidTimestamp(now)).toBe(true); // Current time
            expect(isValidTimestamp(now - dayInMs)).toBe(true); // Yesterday
            expect(isValidTimestamp(now + dayInMs)).toBe(true); // Tomorrow (within allowed future)
        });

        it("should return false for invalid timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(0)).toBe(false); // Not positive
            expect(isValidTimestamp(-1)).toBe(false); // Negative
            expect(isValidTimestamp(now + dayInMs + 1000)).toBe(false); // Too far in future
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
            expect(isValidTimestamp(null)).toBe(false);
            expect(isValidTimestamp(undefined)).toBe(false);
            expect(isValidTimestamp(true)).toBe(false);
            expect(isValidTimestamp({})).toBe(false);
            expect(isValidTimestamp([])).toBe(false);
        });

        it("should return false for NaN and infinity", async ({
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

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(3.14)).toBe(true); // Decimal numbers are still valid
            expect(isValidTimestamp(now + dayInMs - 1000)).toBe(true); // Well under limit
            expect(isValidTimestamp(now + dayInMs + 10_000)).toBe(false); // Well over limit
        });
    });

    describe("Integration Tests", () => {
        it("should work together for complex type validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const data: unknown = {
                id: 1,
                name: "Test",
                port: 8080,
                url: "https://example.com",
                active: true,
                created: new Date(),
                tags: ["web", "api"],
                config: { timeout: 5000 },
            };

            if (
                hasProperties(data, [
                    "id",
                    "name",
                    "port",
                    "url",
                    "active",
                    "created",
                    "tags",
                    "config",
                ])
            ) {
                expect(isPositiveNumber(data.id)).toBe(true);
                expect(isString(data.name)).toBe(true);
                expect(isValidPort(data.port)).toBe(true);
                expect(isValidUrl(data.url)).toBe(true);
                expect(isBoolean(data.active)).toBe(true);
                expect(isDate(data.created)).toBe(true);
                expect(isArray(data.tags, isString)).toBe(true);
                expect(isObject(data.config)).toBe(true);
            }
        });

        it("should handle mixed type validation scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: typeGuards", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            // Test complex scenarios without using eval
            expect(
                isString("123") && !isNumber("123") && !isValidPort("123")
            ).toBe(true);
            expect(!isString(123) && isNumber(123) && isValidPort(123)).toBe(
                true
            );
            expect(isArray([]) && !isObject([]) && !isString([])).toBe(true);
            expect(!isArray({}) && isObject({}) && !isFunction({})).toBe(true);

            const testFn = () => {};
            expect(
                isFunction(testFn) && !isObject(testFn) && !isString(testFn)
            ).toBe(true);

            const testDate = new Date();
            expect(
                isDate(testDate) && isObject(testDate) && !isString(testDate)
            ).toBe(true);

            expect(!isObject(null) && !isString(null) && !isNumber(null)).toBe(
                true
            );
        });
    });
});
