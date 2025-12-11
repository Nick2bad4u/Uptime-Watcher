/**
 * Tests for shared type helpers utility Comprehensive coverage of type utility
 * functions
 */

import { describe, it, expect, expectTypeOf } from "vitest";
import {
    castIpcResponse,
    isArray,
    isRecord,
    safePropertyAccess,
    validateAndConvert,
} from "../../utils/typeHelpers";
import { isNumber, isString } from "../../utils/typeGuards";

describe("Shared Type Helpers", () => {
    describe(castIpcResponse, () => {
        it("should cast response without validator", async ({
            task,
            annotate,
        }) => {
            // Add test metadata
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Type Casting", "operation");

            const response = { data: "test" };
            const result = castIpcResponse<{ data: string }>(response);
            expect(result).toEqual({ data: "test" });
            expectTypeOf(result).toEqualTypeOf<{ data: string }>();
        });

        it("should cast response with successful validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Validated Casting", "operation");

            const response = { data: "test" };
            const validator = (val: unknown): val is { data: string } =>
                typeof val === "object" && val !== null && "data" in val;

            const result = castIpcResponse(response, validator);
            expect(result).toEqual({ data: "test" });
        });

        it("should throw error with failing validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Validation Failure", "operation");

            const response = "invalid";
            const validator = (val: unknown): val is { data: string } =>
                typeof val === "object" && val !== null && "data" in val;

            expect(() => castIpcResponse(response, validator)).toThrowError(
                "IPC response validation failed"
            );
        });
    });

    describe(isArray, () => {
        it("should return true for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Array Type Guard", "operation");

            expect(isArray([])).toBeTruthy();
            expect(
                isArray([
                    1,
                    2,
                    3,
                ])
            ).toBeTruthy();
            expect(isArray(["a", "b"])).toBeTruthy();
        });

        it("should return false for non-arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Array Type Guard", "operation");

            expect(isArray({})).toBeFalsy();
            expect(isArray("string")).toBeFalsy();
            expect(isArray(123)).toBeFalsy();
            expect(isArray(null)).toBeFalsy();
            expect(isArray(undefined)).toBeFalsy();
        });
    });

    describe(isNumber, () => {
        it("should return true for valid numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Number Type Guard", "operation");

            expect(isNumber(123)).toBeTruthy();
            expect(isNumber(0)).toBeTruthy();
            expect(isNumber(-1)).toBeTruthy();
            expect(isNumber(3.14)).toBeTruthy();
        });

        it("should return false for invalid numbers and non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Number Type Guard", "operation");

            expect(isNumber(Number.NaN)).toBeFalsy();
            expect(isNumber("123")).toBeFalsy();
            expect(isNumber(null)).toBeFalsy();
            expect(isNumber(undefined)).toBeFalsy();
            expect(isNumber({})).toBeFalsy();
        });
    });

    describe(isRecord, () => {
        it("should return true for record objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Record Type Guard", "operation");

            expect(isRecord({})).toBeTruthy();
            expect(isRecord({ a: 1 })).toBeTruthy();
            expect(isRecord(new Date())).toBeTruthy();
        });

        it("should return false for non-record values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Record Type Guard", "operation");

            expect(isRecord(null)).toBeFalsy();
            expect(isRecord([])).toBeFalsy();
            expect(isRecord("string")).toBeFalsy();
            expect(isRecord(123)).toBeFalsy();
            expect(isRecord(undefined)).toBeFalsy();
        });
    });

    describe(isString, () => {
        it("should return true for strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: String Type Guard", "operation");

            expect(isString("test")).toBeTruthy();
            expect(isString("")).toBeTruthy();
            expect(isString(" ")).toBeTruthy();
        });

        it("should return false for non-strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: String Type Guard", "operation");

            expect(isString(123)).toBeFalsy();
            expect(isString(null)).toBeFalsy();
            expect(isString(undefined)).toBeFalsy();
            expect(isString({})).toBeFalsy();
            expect(isString([])).toBeFalsy();
        });
    });

    describe(safePropertyAccess, () => {
        it("should return property value for existing properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Safe Property Access", "operation");

            const obj = { name: "test", value: 123 };
            expect(safePropertyAccess(obj, "name")).toBe("test");
            expect(safePropertyAccess(obj, "value")).toBe(123);
        });

        it("should return undefined for non-existing properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Safe Property Access", "operation");

            const obj = { name: "test" };
            expect(safePropertyAccess(obj, "missing")).toBeUndefined();
            expect(safePropertyAccess(null, "any")).toBeUndefined();
            expect(safePropertyAccess(undefined, "any")).toBeUndefined();
            expect(safePropertyAccess("string", "any")).toBeUndefined();
        });
    });

    describe(validateAndConvert, () => {
        it("should return validated value for valid types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Validate and Convert", "operation");

            const isStringValidator = (val: unknown): val is string =>
                typeof val === "string";
            expect(validateAndConvert("test", isStringValidator)).toBe("test");
            expect(validateAndConvert("", isStringValidator)).toBe("");
        });

        it("should throw for invalid types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Validate and Convert", "operation");

            const isStringValidator = (val: unknown): val is string =>
                typeof val === "string";
            expect(() =>
                validateAndConvert(123, isStringValidator)).toThrowError(
                "Type validation failed"
            );
            expect(() =>
                validateAndConvert(null, isStringValidator)).toThrowError(
                "Type validation failed"
            );
        });

        it("should throw with custom error message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Validate and Convert", "operation");

            const isStringValidator = (val: unknown): val is string =>
                typeof val === "string";
            expect(() =>
                validateAndConvert(
                    123,
                    isStringValidator,
                    "Custom error"
                )).toThrowError("Custom error");
        });
    });

    describe("Complex Type Scenarios", () => {
        it("should handle nested object validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "integration");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Complex Validation", "operation");

            const complexObject = {
                user: { name: "test", age: 25 },
                items: [
                    "a",
                    "b",
                    "c",
                ],
                count: 123,
            };

            // Test nested property checking
            expect(safePropertyAccess(complexObject, "user")).toEqual({
                name: "test",
                age: 25,
            });
            expect(safePropertyAccess(complexObject.user, "name")).toBe("test");

            // Test array type checking
            expect(isArray(complexObject.items)).toBeTruthy();

            // Test record type checking
            expect(isRecord(complexObject.user)).toBeTruthy();
            expect(isRecord(complexObject)).toBeTruthy();

            // Test number checking
            expect(isNumber(complexObject.count)).toBeTruthy();
        });

        it("should handle edge cases gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "integration");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Edge Case Handling", "operation");

            // Empty arrays and objects
            expect(isArray([])).toBeTruthy();
            expect(isRecord({})).toBeTruthy();

            // Special values
            expect(isArray([])).toBeTruthy();
            expect(isRecord(Object.create(null))).toBeTruthy();

            // Function types (should NOT be treated as records in this implementation)
            expect(isRecord(() => {})).toBeFalsy();

            // Safe property access edge cases
            expect(safePropertyAccess({}, "missing")).toBeUndefined();
            expect(
                safePropertyAccess({ hasOwnProperty: "test" }, "hasOwnProperty")
            ).toBe("test");
        });

        it("should work with type validation chains", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "integration");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Type Validation Chains", "operation");

            const data = {
                user: { name: "test", settings: { theme: "dark" } },
            };

            // Chain safe property access
            const user = safePropertyAccess(data, "user");
            expect(isRecord(user)).toBeTruthy();

            if (isRecord(user)) {
                const name = safePropertyAccess(user, "name");
                expect(isString(name)).toBeTruthy();

                const settings = safePropertyAccess(user, "settings");
                expect(isRecord(settings)).toBeTruthy();
            }
        });
    });
});
