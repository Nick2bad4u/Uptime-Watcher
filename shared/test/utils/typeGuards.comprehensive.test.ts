import { describe, it, expect, beforeAll } from "vitest";
import { isValidUrl } from "../../validation/validatorUtils";
// Import ALL functions from typeGuards to ensure coverage
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
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            // Call ALL functions using both named imports and namespace import
            // This ensures that every function in ts is executed

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
            expect(isObject(testObj)).toBeTruthy();
            expect(isNumber(42)).toBeTruthy();
            expect(hasProperties(testObj, ["a"])).toBeTruthy();
            expect(hasProperty(testObj, "a")).toBeTruthy();
            expect(isArray(testArray)).toBeTruthy();
            expect(isBoolean(true)).toBeTruthy();
            expect(isDate(testDate)).toBeTruthy();
            expect(isError(testError)).toBeTruthy();
            expect(isFiniteNumber(42)).toBeTruthy();
            expect(isFunction(() => {})).toBeTruthy();
            expect(isNonNegativeNumber(0)).toBeTruthy();
            expect(isNonNullObject(testObj)).toBeTruthy();
            expect(isPositiveNumber(1)).toBeTruthy();
            expect(isString("test")).toBeTruthy();
            expect(isValidPort(80)).toBeTruthy();
            expect(isValidTimestamp(Date.now())).toBeTruthy();

            // Also test with false cases to ensure all branches are covered
            expect(isObject(null)).toBeFalsy();
            expect(isNumber("not a number")).toBeFalsy();
            expect(hasProperties(testObj, ["nonexistent"])).toBeFalsy();
            expect(hasProperty(testObj, "nonexistent")).toBeFalsy();
            expect(isArray("not an array")).toBeFalsy();
            expect(isBoolean("not a boolean")).toBeFalsy();
            expect(isDate("not a date")).toBeFalsy();
            expect(isError("not an error")).toBeFalsy();
            expect(isFiniteNumber(Infinity)).toBeFalsy();
            expect(isFunction("not a function")).toBeFalsy();
            expect(isNonNegativeNumber(-1)).toBeFalsy();
            expect(isNonNullObject(null)).toBeFalsy();
            expect(isPositiveNumber(0)).toBeFalsy();
            expect(isString(123)).toBeFalsy();
            expect(isValidPort(99_999)).toBeFalsy();
            expect(isValidTimestamp(-1)).toBeFalsy();
        });
    });

    describe(hasProperties, () => {
        it("should return true when object has all specified properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2, c: 3 };
            expect(hasProperties(obj, ["a", "b"])).toBeTruthy();
            expect(
                hasProperties(obj, [
                    "a",
                    "b",
                    "c",
                ])
            ).toBeTruthy();
            expect(hasProperties(obj, [])).toBeTruthy(); // Empty array - vacuous truth
        });

        it("should return false when object is missing some properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2 };
            expect(
                hasProperties(obj, [
                    "a",
                    "b",
                    "c",
                ])
            ).toBeFalsy();
            expect(hasProperties(obj, ["d"])).toBeFalsy();
        });

        it("should return false for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperties(null, ["a"])).toBeFalsy();
            expect(hasProperties(undefined, ["a"])).toBeFalsy();
            expect(hasProperties("string", ["a"])).toBeFalsy();
            expect(hasProperties(42, ["a"])).toBeFalsy();
            expect(hasProperties([], ["a"])).toBeFalsy();
            expect(hasProperties(true, ["a"])).toBeFalsy();
        });

        it("should handle symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value", regular: "prop" };
            expect(hasProperties(obj, [sym])).toBeTruthy();
            expect(hasProperties(obj, ["regular", sym])).toBeTruthy();
        });

        it("should handle inherited properties correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Create proper prototype inheritance
            const parent = { inherited: "parentValue" };
            const child = Object.create(parent);
            child.own = "childValue";

            // HasProperties uses Object.hasOwn, so inherited properties should not count
            expect(hasProperties(child, ["own"])).toBeTruthy();
            expect(hasProperties(child, ["inherited"])).toBeFalsy(); // Inherited, not own
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = Object.create(null); // Object without prototype
            obj.prop = "value";
            expect(hasProperties(obj, ["prop"])).toBeTruthy();

            // Empty properties array
            expect(hasProperties({}, [])).toBeTruthy();
            expect(hasProperties(null, [])).toBeFalsy(); // Still need valid object
        });
    });

    describe(hasProperty, () => {
        it("should return true when object has the specified property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: undefined, c: null };
            expect(hasProperty(obj, "a")).toBeTruthy();
            expect(hasProperty(obj, "b")).toBeTruthy(); // Undefined is still a property
            expect(hasProperty(obj, "c")).toBeTruthy(); // null is still a property
        });

        it("should return false when object doesn't have the property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1 };
            expect(hasProperty(obj, "b")).toBeFalsy();
            expect(hasProperty(obj, "toString")).toBeFalsy(); // Inherited property
        });

        it("should return false for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperty(null, "prop")).toBeFalsy();
            expect(hasProperty(undefined, "prop")).toBeFalsy();
            expect(hasProperty("string", "prop")).toBeFalsy();
            expect(hasProperty(42, "prop")).toBeFalsy();
            expect(hasProperty([], "prop")).toBeFalsy();
            expect(hasProperty(true, "prop")).toBeFalsy();
        });

        it("should handle symbol properties", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const sym = Symbol("test");
            const obj = { [sym]: "value" };
            expect(hasProperty(obj, sym)).toBeTruthy();
        });

        it("should handle numeric property keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { 0: "zero", 1: "one" };
            expect(hasProperty(obj, 0)).toBeTruthy();
            expect(hasProperty(obj, 1)).toBeTruthy();
            expect(hasProperty(obj, 2)).toBeFalsy();
        });
    });

    describe(isArray, () => {
        it("should return true for arrays without validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
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
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArray({})).toBeFalsy();
            expect(isArray("string")).toBeFalsy();
            expect(isArray(42)).toBeFalsy();
            expect(isArray(null)).toBeFalsy();
            expect(isArray(undefined)).toBeFalsy();
            expect(isArray(true)).toBeFalsy();
        });

        it("should validate array items when validator is provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const localIsString = (value: unknown): value is string =>
                typeof value === "string";
            const localIsNumber = (value: unknown): value is number =>
                typeof value === "number";

            expect(
                isArray(
                    [
                        "a",
                        "b",
                        "c",
                    ],
                    localIsString
                )
            ).toBeTruthy();
            expect(
                isArray(
                    [
                        1,
                        2,
                        3,
                    ],
                    localIsNumber
                )
            ).toBeTruthy();
            expect(isArray([], isString)).toBeTruthy(); // Empty array passes any validator

            // Mixed arrays should fail type-specific validators
            expect(isArray([1, "mixed"], isString)).toBeFalsy();
            expect(isArray(["mixed", 1], isNumber)).toBeFalsy();
            expect(
                isArray(
                    [
                        1,
                        2,
                        "not number",
                    ],
                    isNumber
                )
            ).toBeFalsy();
        });

        it("should handle complex validators", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const localIsPositiveNumber = (value: unknown): value is number =>
                typeof value === "number" && value > 0;

            expect(
                isArray(
                    [
                        1,
                        2,
                        3,
                    ],
                    localIsPositiveNumber
                )
            ).toBeTruthy();
            expect(
                isArray(
                    [
                        0,
                        1,
                        2,
                    ],
                    localIsPositiveNumber
                )
            ).toBeFalsy(); // 0 is not positive
            expect(
                isArray(
                    [
                        -1,
                        1,
                        2,
                    ],
                    localIsPositiveNumber
                )
            ).toBeFalsy(); // -1 is not positive
        });
    });

    describe(isBoolean, () => {
        it("should return true for boolean values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
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
            await annotate("Component: guardFunctions", "component");
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

        it("should handle Boolean object instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test with object wrappers (non-primitive values that aren't booleans)
            const objectValue = { valueOf: () => true };
            expect(isBoolean(objectValue)).toBeFalsy();
            const objectValueFalse = { valueOf: () => false };
            expect(isBoolean(objectValueFalse)).toBeFalsy();
        });
    });

    describe(isDate, () => {
        it("should return true for valid Date objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date())).toBeTruthy();
            expect(isDate(new Date("2023-01-01"))).toBeTruthy();
            expect(isDate(new Date(0))).toBeTruthy(); // Unix epoch
            expect(isDate(new Date(Date.now()))).toBeTruthy();
        });

        it("should return false for invalid Date objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
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
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate("2023-01-01")).toBeFalsy();
            expect(isDate(1_672_531_200_000)).toBeFalsy(); // Valid timestamp but not Date
            expect(isDate(null)).toBeFalsy();
            expect(isDate(undefined)).toBeFalsy();
            expect(isDate({})).toBeFalsy();
            expect(isDate([])).toBeFalsy();
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Date.prototype is a Date but invalid
            expect(isDate(Date.prototype)).toBeFalsy();

            // Date-like objects should fail
            const dateLike = { getTime: () => Date.now() };
            expect(isDate(dateLike)).toBeFalsy();
        });
    });

    describe(isError, () => {
        it("should return true for Error instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError(new Error("test error"))).toBeTruthy();
            expect(isError(new Error("message"))).toBeTruthy();
            expect(isError(new TypeError("type error"))).toBeTruthy();
            expect(isError(new ReferenceError("reference error"))).toBeTruthy();
            expect(isError(new SyntaxError("syntax error"))).toBeTruthy();
            expect(isError(new RangeError("range error"))).toBeTruthy();
        });

        it("should return false for non-Error values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError("error")).toBeFalsy();
            expect(isError({ message: "error" })).toBeFalsy();
            expect(isError(null)).toBeFalsy();
            expect(isError(undefined)).toBeFalsy();
            expect(isError({})).toBeFalsy();
            expect(isError([])).toBeFalsy();
        });

        it("should handle custom Error subclasses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            class CustomError extends Error {
                constructor(message?: string) {
                    super(message);
                    this.name = "CustomError";
                }
            }

            expect(isError(new CustomError())).toBeTruthy();
            expect(isError(new CustomError("custom message"))).toBeTruthy();
        });

        it("should handle Error-like objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const errorLike = {
                name: "Error",
                message: "Something went wrong",
                stack: "Error: Something went wrong\n    at ...",
            };

            expect(isError(errorLike)).toBeFalsy(); // Not instanceof Error
        });
    });

    describe(isFiniteNumber, () => {
        it("should return true for finite numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(0)).toBeTruthy();
            expect(isFiniteNumber(42)).toBeTruthy();
            expect(isFiniteNumber(-42)).toBeTruthy();
            expect(isFiniteNumber(3.14)).toBeTruthy();
            expect(isFiniteNumber(-3.14)).toBeTruthy();
            expect(isFiniteNumber(Number.MAX_SAFE_INTEGER)).toBeTruthy();
            expect(isFiniteNumber(Number.MIN_SAFE_INTEGER)).toBeTruthy();
        });

        it("should return false for infinite numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(Infinity)).toBeFalsy();
            expect(isFiniteNumber(-Infinity)).toBeFalsy();
            expect(isFiniteNumber(Number.POSITIVE_INFINITY)).toBeFalsy();
            expect(isFiniteNumber(Number.NEGATIVE_INFINITY)).toBeFalsy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber(Number.NaN)).toBeFalsy();
            expect(isFiniteNumber(Number.NaN)).toBeFalsy();
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber("42")).toBeFalsy();
            expect(isFiniteNumber(null)).toBeFalsy();
            expect(isFiniteNumber(undefined)).toBeFalsy();
            expect(isFiniteNumber(true)).toBeFalsy();
            expect(isFiniteNumber({})).toBeFalsy();
            expect(isFiniteNumber([])).toBeFalsy();
        });

        it("should handle edge number values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFiniteNumber(Number.MIN_VALUE)).toBeTruthy();
            expect(isFiniteNumber(-Number.MIN_VALUE)).toBeTruthy();
            expect(isFiniteNumber(Number.MAX_VALUE)).toBeTruthy();
            expect(isFiniteNumber(-Number.MAX_VALUE)).toBeTruthy();
        });
    });

    describe(isFunction, () => {
        it("should return true for functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction(() => {})).toBeTruthy();
            expect(isFunction(function normalFunction() {})).toBeTruthy();
            expect(isFunction(async () => {})).toBeTruthy();
            expect(isFunction(function* generatorFunction() {})).toBeTruthy();
            expect(isFunction(console.log)).toBeTruthy();
            expect(isFunction(Math.max)).toBeTruthy();
        });

        it("should return true for constructors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            expect(isFunction(Array)).toBeTruthy();
            expect(isFunction(Object)).toBeTruthy();
            expect(isFunction(Date)).toBeTruthy();
            expect(isFunction(function Constructor() {})).toBeTruthy();
        });

        it("should return false for non-functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction({})).toBeFalsy();
            expect(isFunction([])).toBeFalsy();
            expect(isFunction("function")).toBeFalsy();
            expect(isFunction(42)).toBeFalsy();
            expect(isFunction(null)).toBeFalsy();
            expect(isFunction(undefined)).toBeFalsy();
            expect(isFunction(true)).toBeFalsy();
        });

        it("should handle class constructors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            class TestClass {
                public name = "test";
            }
            expect(isFunction(TestClass)).toBeTruthy();
        });

        it("should handle bound functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            function testFn() {}
            const boundFn = testFn.bind(null);
            expect(isFunction(boundFn)).toBeTruthy();
        });
    });

    describe(isNonNegativeNumber, () => {
        it("should return true for non-negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(0)).toBeTruthy();
            expect(isNonNegativeNumber(1)).toBeTruthy();
            expect(isNonNegativeNumber(42)).toBeTruthy();
            expect(isNonNegativeNumber(3.14)).toBeTruthy();
            expect(isNonNegativeNumber(Number.MAX_VALUE)).toBeTruthy();
        });

        it("should return false for negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(-1)).toBeFalsy();
            expect(isNonNegativeNumber(-42)).toBeFalsy();
            expect(isNonNegativeNumber(-3.14)).toBeFalsy();
            expect(isNonNegativeNumber(Number.MIN_SAFE_INTEGER)).toBeFalsy();
        });

        it("should return false for NaN and non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(Number.NaN)).toBeFalsy();
            expect(isNonNegativeNumber("5")).toBeFalsy();
            expect(isNonNegativeNumber(null)).toBeFalsy();
        });

        it("should handle infinity correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            // Infinity is a number in JavaScript, so these should return true
            expect(isNonNegativeNumber(Infinity)).toBeTruthy();
            expect(isNonNegativeNumber(-Infinity)).toBeFalsy(); // negative
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber("0")).toBeFalsy();
            expect(isNonNegativeNumber(null)).toBeFalsy();
            expect(isNonNegativeNumber(undefined)).toBeFalsy();
            expect(isNonNegativeNumber(true)).toBeFalsy();
            expect(isNonNegativeNumber({})).toBeFalsy();
            expect(isNonNegativeNumber([])).toBeFalsy();
        });
    });

    describe(isNonNullObject, () => {
        it("should return true for plain objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject({})).toBeTruthy();
            expect(isNonNullObject({ a: 1 })).toBeTruthy();
            expect(isNonNullObject(Object.create(null))).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject(null)).toBeFalsy();
        });

        it("should return false for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
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

        it("should return false for primitives", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject("string")).toBeFalsy();
            expect(isNonNullObject(42)).toBeFalsy();
            expect(isNonNullObject(true)).toBeFalsy();
            expect(isNonNullObject(undefined)).toBeFalsy();
        });

        it("should return true for object instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject(new Date())).toBeTruthy();
            expect(isNonNullObject(new Error("test error"))).toBeTruthy();
            expect(isNonNullObject(/regex/)).toBeTruthy();
        });

        it("should return false for functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject(() => {})).toBeFalsy();
            expect(isNonNullObject(function namedFunction() {})).toBeFalsy();
        });
    });

    describe(isNumber, () => {
        it("should return true for valid numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(0)).toBeTruthy();
            expect(isNumber(42)).toBeTruthy();
            expect(isNumber(-42)).toBeTruthy();
            expect(isNumber(3.14)).toBeTruthy();
            expect(isNumber(-3.14)).toBeTruthy();
            expect(isNumber(Infinity)).toBeTruthy();
            expect(isNumber(-Infinity)).toBeTruthy();
        });

        it("should return false for NaN", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(Number.NaN)).toBeFalsy();
            expect(isNumber(Number.NaN)).toBeFalsy();
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber("42")).toBeFalsy();
            expect(isNumber(null)).toBeFalsy();
            expect(isNumber(undefined)).toBeFalsy();
            expect(isNumber(true)).toBeFalsy();
            expect(isNumber({})).toBeFalsy();
            expect(isNumber([])).toBeFalsy();
        });

        it("should handle Number object instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test object wrapper instead of primitive number
            const numberObject = { valueOf: () => 42 };
            expect(isNumber(numberObject)).toBeFalsy(); // Objects, not primitives
        });

        it("should handle edge number values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(Number.MAX_VALUE)).toBeTruthy();
            expect(isNumber(Number.MIN_VALUE)).toBeTruthy();
            expect(isNumber(Number.MAX_SAFE_INTEGER)).toBeTruthy();
            expect(isNumber(Number.MIN_SAFE_INTEGER)).toBeTruthy();
        });
    });

    describe(isObject, () => {
        it("should return true for plain objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject({})).toBeTruthy();
            expect(isObject({ a: 1 })).toBeTruthy();
            expect(isObject(Object.create(null))).toBeTruthy();
        });

        it("should return true for object instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(new Date())).toBeTruthy();
            expect(isObject(new Error("test error"))).toBeTruthy();
            expect(isObject(/regex/)).toBeTruthy();
            expect(isObject(new Map())).toBeTruthy();
            expect(isObject(new Set())).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(null)).toBeFalsy();
        });

        it("should return false for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
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

        it("should return false for primitives", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject("string")).toBeFalsy();
            expect(isObject(42)).toBeFalsy();
            expect(isObject(true)).toBeFalsy();
            expect(isObject(undefined)).toBeFalsy();
        });

        it("should return false for functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(() => {})).toBeFalsy();
            expect(isObject(function namedTestFunction() {})).toBeFalsy();
        });
    });

    describe(isPositiveNumber, () => {
        it("should return true for positive numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(1)).toBeTruthy();
            expect(isPositiveNumber(42)).toBeTruthy();
            expect(isPositiveNumber(3.14)).toBeTruthy();
            expect(isPositiveNumber(0.1)).toBeTruthy();
            expect(isPositiveNumber(Number.MAX_VALUE)).toBeTruthy();
        });

        it("should return false for zero", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(0)).toBeFalsy();
            expect(isPositiveNumber(-0)).toBeFalsy();
        });

        it("should return false for negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(-1)).toBeFalsy();
            expect(isPositiveNumber(-42)).toBeFalsy();
            expect(isPositiveNumber(-3.14)).toBeFalsy();
            expect(isPositiveNumber(Number.MIN_SAFE_INTEGER)).toBeFalsy();
        });

        it("should return false for NaN, zero, and non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(Number.NaN)).toBeFalsy();
            expect(isPositiveNumber(0)).toBeFalsy();
            expect(isPositiveNumber("5")).toBeFalsy();
            expect(isPositiveNumber(null)).toBeFalsy();
        });

        it("should handle infinity correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            // Infinity is a number in JavaScript, so positive infinity should return true
            expect(isPositiveNumber(Infinity)).toBeTruthy();
            expect(isPositiveNumber(-Infinity)).toBeFalsy(); // negative
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber("1")).toBeFalsy();
            expect(isPositiveNumber(null)).toBeFalsy();
            expect(isPositiveNumber(undefined)).toBeFalsy();
            expect(isPositiveNumber(true)).toBeFalsy();
            expect(isPositiveNumber({})).toBeFalsy();
            expect(isPositiveNumber([])).toBeFalsy();
        });
    });

    describe(isString, () => {
        it("should return true for strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isString("")).toBeTruthy();
            expect(isString("hello")).toBeTruthy();
            expect(isString("123")).toBeTruthy();
            expect(isString("true")).toBeTruthy();
            expect(isString("null")).toBeTruthy();
        });

        it("should return false for non-strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isString(42)).toBeFalsy();
            expect(isString(true)).toBeFalsy();
            expect(isString(null)).toBeFalsy();
            expect(isString(undefined)).toBeFalsy();
            expect(isString({})).toBeFalsy();
            expect(isString([])).toBeFalsy();
        });

        it("should handle String object instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test string object instead of primitive string
            const stringObject = { valueOf: () => "hello" };
            expect(isString(stringObject)).toBeFalsy(); // Objects, not primitives
        });

        it("should handle template literals", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const name = "world";
            expect(isString(`Hello ${name}`)).toBeTruthy();
        });
    });

    describe(isValidPort, () => {
        it("should return true for valid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(1)).toBeTruthy();
            expect(isValidPort(80)).toBeTruthy();
            expect(isValidPort(443)).toBeTruthy();
            expect(isValidPort(3000)).toBeTruthy();
            expect(isValidPort(8080)).toBeTruthy();
            expect(isValidPort(65_535)).toBeTruthy(); // Maximum port
        });

        it("should return false for invalid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(0)).toBeFalsy(); // Too low
            expect(isValidPort(65_536)).toBeFalsy(); // Too high
            expect(isValidPort(-1)).toBeFalsy(); // Negative
            expect(isValidPort(3.14)).toBeFalsy(); // Not integer
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort("80")).toBeFalsy();
            expect(isValidPort(null)).toBeFalsy();
            expect(isValidPort(undefined)).toBeFalsy();
            expect(isValidPort(true)).toBeFalsy();
            expect(isValidPort({})).toBeFalsy();
            expect(isValidPort([])).toBeFalsy();
        });

        it("should return false for NaN and infinity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isValidPort(Number.NaN)).toBeFalsy();
            expect(isValidPort(Infinity)).toBeFalsy();
            expect(isValidPort(-Infinity)).toBeFalsy();
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(1)).toBeTruthy(); // Still integer
            expect(isValidPort(1.1)).toBeFalsy(); // Not integer
        });
    });

    describe(isValidTimestamp, () => {
        const dayInMs = 86_400_000;
        let currentTime = 0;

        beforeAll(() => {
            // Use actual current time for realistic testing
            currentTime = Date.now();
        });

        it("should return true for valid timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(1)).toBeTruthy(); // Very old but positive
            expect(isValidTimestamp(currentTime)).toBeTruthy(); // Current time
            expect(isValidTimestamp(currentTime - dayInMs)).toBeTruthy(); // Yesterday
            expect(isValidTimestamp(currentTime + dayInMs)).toBeTruthy(); // Tomorrow (within allowed future)
        });

        it("should return false for invalid timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(0)).toBeFalsy(); // Not positive
            expect(isValidTimestamp(-1)).toBeFalsy(); // Negative
            expect(isValidTimestamp(currentTime + dayInMs + 1000)).toBeFalsy(); // Too far in future
        });

        it("should return false for non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp("1672531200000")).toBeFalsy();
            expect(isValidTimestamp(null)).toBeFalsy();
            expect(isValidTimestamp(undefined)).toBeFalsy();
            expect(isValidTimestamp(true)).toBeFalsy();
            expect(isValidTimestamp({})).toBeFalsy();
            expect(isValidTimestamp([])).toBeFalsy();
        });

        it("should return false for NaN and infinity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isValidTimestamp(Number.NaN)).toBeFalsy();
            expect(isValidTimestamp(Infinity)).toBeFalsy();
            expect(isValidTimestamp(-Infinity)).toBeFalsy();
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(3.14)).toBeTruthy(); // Decimal numbers are still valid
            expect(isValidTimestamp(currentTime + dayInMs - 1000)).toBeTruthy(); // Well under limit
            expect(
                isValidTimestamp(currentTime + dayInMs + 10_000)
            ).toBeFalsy(); // Well over limit
        });
    });

    describe("Integration Tests", () => {
        it("should work together for complex type validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
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
                const typedData = data as {
                    id: unknown;
                    name: unknown;
                    port: unknown;
                    url: unknown;
                    active: unknown;
                    created: unknown;
                    tags: unknown;
                    config: unknown;
                };
                expect(isPositiveNumber(typedData.id)).toBeTruthy();
                expect(isString(typedData.name)).toBeTruthy();
                expect(isValidPort(typedData.port)).toBeTruthy();
                expect(isValidUrl(typedData.url)).toBeTruthy();
                expect(isBoolean(typedData.active)).toBeTruthy();
                expect(isDate(typedData.created)).toBeTruthy();
                expect(isArray(typedData.tags, isString)).toBeTruthy();
                expect(isObject(typedData.config)).toBeTruthy();
            }
        });

        it("should handle mixed type validation scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: guardFunctions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            // Test complex scenarios without using eval
            expect(
                isString("123") && !isNumber("123") && !isValidPort("123")
            ).toBeTruthy();
            expect(
                !isString(123) && isNumber(123) && isValidPort(123)
            ).toBeTruthy();
            expect(isArray([]) && !isObject([]) && !isString([])).toBeTruthy();
            expect(
                !isArray({}) && isObject({}) && !isFunction({})
            ).toBeTruthy();

            const testFn = () => {};
            expect(
                isFunction(testFn) && !isObject(testFn) && !isString(testFn)
            ).toBeTruthy();

            const testDate = new Date();
            expect(
                isDate(testDate) && isObject(testDate) && !isString(testDate)
            ).toBeTruthy();

            expect(
                !isObject(null) && !isString(null) && !isNumber(null)
            ).toBeTruthy();
        });
    });
});
