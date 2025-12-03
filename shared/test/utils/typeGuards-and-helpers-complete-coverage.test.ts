/**
 * Complete function coverage tests for shared/utils/typeGuards.ts and
 * typeHelpers.ts
 *
 * Tests all exported functions to achieve 100% function coverage
 */

import { describe, it, expect } from "vitest";

// TypeGuards imports
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

// TypeHelpers imports
import {
    castIpcResponse,
    isArray as isArrayHelper,
    isRecord,
    safePropertyAccess,
    validateAndConvert,
} from "../../utils/typeHelpers";

describe("shared/utils/typeGuards.ts - Complete Function Coverage", () => {
    describe(isObject, () => {
        it("should return true for plain objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject({})).toBeTruthy();
            expect(isObject({ key: "value" })).toBeTruthy();
            expect(isObject(Object.create(null))).toBeTruthy();
        });

        it("should return false for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isObject(null)).toBeFalsy();
            expect(isObject(undefined)).toBeFalsy();
            expect(isObject("string")).toBeFalsy();
            expect(isObject(123)).toBeFalsy();
            expect(isObject([])).toBeFalsy();
            expect(isObject(() => {})).toBeFalsy();
        });
    });

    describe(isNumber, () => {
        it("should return true for valid numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(42)).toBeTruthy();
            expect(isNumber(0)).toBeTruthy();
            expect(isNumber(-123)).toBeTruthy();
            expect(isNumber(3.14)).toBeTruthy();
        });

        it("should return false for NaN and non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNumber(Number.NaN)).toBeFalsy();
            expect(isNumber("123")).toBeFalsy();
            expect(isNumber(null)).toBeFalsy();
            expect(isNumber(undefined)).toBeFalsy();
            expect(isNumber({})).toBeFalsy();
        });
    });

    describe(hasProperties, () => {
        it("should return true when object has all specified properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2, c: 3 };
            expect(hasProperties(obj, ["a", "b"])).toBeTruthy();
            expect(hasProperties(obj, ["a"])).toBeTruthy();
            expect(hasProperties(obj, [])).toBeTruthy();
        });

        it("should return false when object is missing properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2 };
            expect(hasProperties(obj, ["a", "c"])).toBeFalsy();
            expect(hasProperties(obj, ["d"])).toBeFalsy();
        });

        it("should return false for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperties(null, ["a"])).toBeFalsy();
            expect(hasProperties("string", ["length"])).toBeFalsy();
            expect(hasProperties(123, ["toString"])).toBeFalsy();
        });
    });

    describe(hasProperty, () => {
        it("should return true when object has specified property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: undefined };
            expect(hasProperty(obj, "a")).toBeTruthy();
            expect(hasProperty(obj, "b")).toBeTruthy(); // Undefined values still count as having the property
        });

        it("should return false when object doesn't have property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1 };
            expect(hasProperty(obj, "b")).toBeFalsy();
        });

        it("should return false for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(hasProperty(null, "a")).toBeFalsy();
            expect(hasProperty(undefined, "a")).toBeFalsy();
            expect(hasProperty("string", "length")).toBeFalsy();
        });
    });

    describe(isArray, () => {
        it("should return true for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
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
            expect(isArray(Array.from({ length: 5 }))).toBeTruthy();
        });

        it("should return false for non-arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArray({})).toBeFalsy();
            expect(isArray("string")).toBeFalsy();
            expect(isArray(null)).toBeFalsy();
            expect(isArray(undefined)).toBeFalsy();
        });

        it("should validate array item types when itemValidator provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

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
            expect(
                isArray(
                    [
                        "a",
                        1,
                        "c",
                    ],
                    isString
                )
            ).toBeFalsy();
            expect(isArray([], isString)).toBeTruthy(); // Empty array is valid
        });
    });

    describe(isBoolean, () => {
        it("should return true for booleans", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
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
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isBoolean("true")).toBeFalsy();
            expect(isBoolean(1)).toBeFalsy();
            expect(isBoolean(0)).toBeFalsy();
            expect(isBoolean(null)).toBeFalsy();
            expect(isBoolean(undefined)).toBeFalsy();
        });
    });

    describe(isDate, () => {
        it("should return true for valid dates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date())).toBeTruthy();
            expect(isDate(new Date("2023-01-01"))).toBeTruthy();
        });

        it("should return false for invalid dates and non-dates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isDate(new Date("invalid"))).toBeFalsy();
            expect(isDate("2023-01-01")).toBeFalsy();
            expect(isDate(null)).toBeFalsy();
            expect(isDate({})).toBeFalsy();
        });
    });

    describe(isError, () => {
        it("should return true for Error instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError(new Error("test"))).toBeTruthy();
            expect(isError(new TypeError("test"))).toBeTruthy();
            expect(isError(new RangeError("test"))).toBeTruthy();
        });

        it("should return false for non-errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(isError("error")).toBeFalsy();
            expect(isError({ message: "error" })).toBeFalsy();
            expect(isError(null)).toBeFalsy();
        });
    });

    describe(isFiniteNumber, () => {
        it("should return true for finite numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(42)).toBeTruthy();
            expect(isFiniteNumber(0)).toBeTruthy();
            expect(isFiniteNumber(-123)).toBeTruthy();
            expect(isFiniteNumber(3.14)).toBeTruthy();
        });

        it("should return false for infinite numbers and non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(isFiniteNumber(Infinity)).toBeFalsy();
            expect(isFiniteNumber(-Infinity)).toBeFalsy();
            expect(isFiniteNumber(Number.NaN)).toBeFalsy();
            expect(isFiniteNumber("123")).toBeFalsy();
            expect(isFiniteNumber(null)).toBeFalsy();
        });
    });

    describe(isFunction, () => {
        it("should return true for functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction(() => {})).toBeTruthy();
            expect(isFunction(function testFunction() {})).toBeTruthy();
            expect(isFunction(Date)).toBeTruthy();
            expect(isFunction(console.log)).toBeTruthy();
        });

        it("should return false for non-functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isFunction({})).toBeFalsy();
            expect(isFunction("function")).toBeFalsy();
            expect(isFunction(null)).toBeFalsy();
            expect(isFunction(123)).toBeFalsy();
        });
    });

    describe(isNonNegativeNumber, () => {
        it("should return true for non-negative numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(0)).toBeTruthy();
            expect(isNonNegativeNumber(42)).toBeTruthy();
            expect(isNonNegativeNumber(3.14)).toBeTruthy();
        });

        it("should return false for negative numbers and non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNegativeNumber(-1)).toBeFalsy();
            expect(isNonNegativeNumber(-123)).toBeFalsy();
            expect(isNonNegativeNumber("42")).toBeFalsy();
            expect(isNonNegativeNumber(Number.NaN)).toBeFalsy();
        });
    });

    describe(isNonNullObject, () => {
        it("should return true for non-null objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject({})).toBeTruthy();
            expect(isNonNullObject({ key: "value" })).toBeTruthy();
            expect(isNonNullObject(new Date())).toBeTruthy(); // Date objects are non-null objects
        });

        it("should return false for null and non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonNullObject(null)).toBeFalsy();
            expect(isNonNullObject(undefined)).toBeFalsy();
            expect(isNonNullObject("string")).toBeFalsy();
            expect(isNonNullObject(123)).toBeFalsy();
            expect(isNonNullObject([])).toBeFalsy(); // Arrays are excluded by isObject
        });
    });

    describe(isPositiveNumber, () => {
        it("should return true for positive numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(1)).toBeTruthy();
            expect(isPositiveNumber(42)).toBeTruthy();
            expect(isPositiveNumber(3.14)).toBeTruthy();
        });

        it("should return false for zero, negative numbers, and non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPositiveNumber(0)).toBeFalsy();
            expect(isPositiveNumber(-1)).toBeFalsy();
            expect(isPositiveNumber("42")).toBeFalsy();
            expect(isPositiveNumber(Number.NaN)).toBeFalsy();
        });
    });

    describe(isString, () => {
        it("should return true for strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isString("hello")).toBeTruthy();
            expect(isString("")).toBeTruthy();
            expect(isString(" ")).toBeTruthy();
        });

        it("should return false for non-strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isString(123)).toBeFalsy();
            expect(isString(null)).toBeFalsy();
            expect(isString(undefined)).toBeFalsy();
            expect(isString({})).toBeFalsy();
        });
    });

    describe(isValidPort, () => {
        it("should return true for valid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(80)).toBeTruthy();
            expect(isValidPort(443)).toBeTruthy();
            expect(isValidPort(8080)).toBeTruthy();
            expect(isValidPort(65_535)).toBeTruthy();
        });

        it("should return false for invalid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(0)).toBeFalsy();
            expect(isValidPort(-1)).toBeFalsy();
            expect(isValidPort(65_536)).toBeFalsy();
            expect(isValidPort(3.14)).toBeFalsy();
            expect(isValidPort("80")).toBeFalsy();
            expect(isValidPort(Number.NaN)).toBeFalsy();
        });
    });

    describe(isValidTimestamp, () => {
        it("should return true for valid timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(Date.now())).toBeTruthy();
            expect(isValidTimestamp(1_640_995_200_000)).toBeTruthy(); // 2022-01-01
            expect(isValidTimestamp(1)).toBeTruthy(); // Minimum valid timestamp
        });

        it("should return false for invalid timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimestamp(0)).toBeFalsy(); // Must be > 0
            expect(isValidTimestamp(-1)).toBeFalsy();
            expect(isValidTimestamp(Number.NaN)).toBeFalsy();
            expect(isValidTimestamp(Infinity)).toBeFalsy();
            expect(isValidTimestamp("1640995200000")).toBeFalsy();
            expect(isValidTimestamp(null)).toBeFalsy();
            expect(isValidTimestamp(Date.now() + 90_000_000)).toBeFalsy(); // Too far in future
        });
    });
});

describe("shared/utils/typeHelpers.ts - Complete Function Coverage", () => {
    describe(castIpcResponse, () => {
        it("should cast response when validation passes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const response = { success: true, data: "test" };
            const validator = (
                value: unknown
            ): value is { success: boolean; data: string } =>
                typeof value === "object" &&
                value !== null &&
                "success" in value &&
                "data" in value;

            const result = castIpcResponse(response, validator);
            expect(result).toEqual(response);
        });

        it("should throw error when validation fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const response = { invalid: true };
            const validator = (value: unknown): value is { success: boolean } =>
                typeof value === "object" &&
                value !== null &&
                "success" in value;

            expect(() => castIpcResponse(response, validator)).toThrowError();
        });

        it("should throw error for null response", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const validator = (value: unknown): value is string =>
                typeof value === "string";
            expect(() => castIpcResponse(null, validator)).toThrowError();
        });
    });

    describe(isArrayHelper, () => {
        it("should return true for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArrayHelper([])).toBeTruthy();
            expect(
                isArrayHelper([
                    1,
                    2,
                    3,
                ])
            ).toBeTruthy();
            expect(isArrayHelper(Array.from({ length: 5 }))).toBeTruthy();
        });

        it("should return false for non-arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isArrayHelper({})).toBeFalsy();
            expect(isArrayHelper("string")).toBeFalsy();
            expect(isArrayHelper(null)).toBeFalsy();
            expect(isArrayHelper(undefined)).toBeFalsy();
        });
    });

    describe(isRecord, () => {
        it("should return true for plain objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isRecord({})).toBeTruthy();
            expect(isRecord({ key: "value" })).toBeTruthy();
            expect(isRecord(Object.create(null))).toBeTruthy();
            expect(isRecord(new Date())).toBeTruthy(); // Date objects are records per isRecord logic
        });

        it("should return false for non-objects and arrays", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isRecord(null)).toBeFalsy();
            expect(isRecord(undefined)).toBeFalsy();
            expect(isRecord("string")).toBeFalsy();
            expect(isRecord(123)).toBeFalsy();
            expect(isRecord([])).toBeFalsy(); // Arrays are excluded
        });
    });

    describe(safePropertyAccess, () => {
        it("should return property value when object has the property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { name: "test", value: 42 };
            expect(safePropertyAccess(obj, "name")).toBe("test");
            expect(safePropertyAccess(obj, "value")).toBe(42);
        });

        it("should return undefined when property doesn't exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { name: "test" };
            expect(safePropertyAccess(obj, "missing")).toBeUndefined();
        });

        it("should return undefined for non-objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safePropertyAccess(null, "property")).toBeUndefined();
            expect(safePropertyAccess(undefined, "property")).toBeUndefined();
            expect(safePropertyAccess("string", "length")).toBeUndefined();
            expect(safePropertyAccess(123, "toString")).toBeUndefined();
        });

        it("should handle nested property access", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { nested: { value: "deep" } };
            expect(safePropertyAccess(obj, "nested")).toEqual({
                value: "deep",
            });
        });
    });

    describe(validateAndConvert, () => {
        it("should return validated value when validation passes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const validator = (value: unknown): value is string =>
                typeof value === "string";

            expect(validateAndConvert("test", validator)).toBe("test");
        });

        it("should throw error when validation fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const validator = (value: unknown): value is string =>
                typeof value === "string";

            expect(() => validateAndConvert(123, validator)).toThrowError(
                "Type validation failed"
            );
        });

        it("should throw error with custom message when validation fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const validator = (value: unknown): value is string =>
                typeof value === "string";
            const customMessage = "Expected string but got number";

            expect(() =>
                validateAndConvert(123, validator, customMessage)
            ).toThrowError(customMessage);
        });

        it("should handle complex type validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const validator = (
                value: unknown
            ): value is { name: string; age: number } =>
                typeof value === "object" &&
                value !== null &&
                "name" in value &&
                "age" in value &&
                typeof (value as any).name === "string" &&
                typeof (value as any).age === "number";

            const validObject = { name: "Alice", age: 30 };
            expect(validateAndConvert(validObject, validator)).toEqual(
                validObject
            );

            const invalidObject = { name: "Bob" }; // Missing age
            expect(() =>
                validateAndConvert(invalidObject, validator)
            ).toThrowError();
        });

        it("should work with primitive type validators", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const numberValidator = (value: unknown): value is number =>
                typeof value === "number" && !Number.isNaN(value);

            expect(validateAndConvert(42, numberValidator)).toBe(42);
            expect(() =>
                validateAndConvert("42", numberValidator)
            ).toThrowError();
        });
    });

    describe("Integration tests", () => {
        it("should work together for complex validation scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typeGuards-and-helpers-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const data = {
                users: [
                    { name: "Alice", age: 30 },
                    { name: "Bob", age: 25 },
                ],
            };

            // Use multiple type guards together
            expect(isRecord(data)).toBeTruthy();
            expect(hasProperty(data, "users")).toBeTruthy();

            const users = safePropertyAccess(data, "users");
            expect(isArrayHelper(users)).toBeTruthy();

            if (isArrayHelper(users)) {
                expect(users).toHaveLength(2);
                expect(isRecord(users[0])).toBeTruthy();
            }
        });
    });
});
