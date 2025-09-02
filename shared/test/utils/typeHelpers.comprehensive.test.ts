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
    describe("castIpcResponse", () => {
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
            const validator = (val: unknown): val is { data: string } => typeof val === "object" && val !== null && "data" in val;

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
            const validator = (val: unknown): val is { data: string } => typeof val === "object" && val !== null && "data" in val;

            expect(() => castIpcResponse(response, validator)).toThrow(
                "IPC response validation failed"
            );
        });
    });

    describe("isArray", () => {
        it("should return true for arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Array Type Guard", "operation");

            expect(isArray([])).toBe(true);
            expect(
                isArray([
                    1,
                    2,
                    3,
                ])
            ).toBe(true);
            expect(isArray(["a", "b"])).toBe(true);
        });

        it("should return false for non-arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Array Type Guard", "operation");

            expect(isArray({})).toBe(false);
            expect(isArray("string")).toBe(false);
            expect(isArray(123)).toBe(false);
            expect(isArray(null)).toBe(false);
            expect(isArray(undefined)).toBe(false);
        });
    });

    describe("isNumber", () => {
        it("should return true for valid numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Number Type Guard", "operation");

            expect(isNumber(123)).toBe(true);
            expect(isNumber(0)).toBe(true);
            expect(isNumber(-1)).toBe(true);
            expect(isNumber(3.14)).toBe(true);
        });

        it("should return false for invalid numbers and non-numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Number Type Guard", "operation");

            expect(isNumber(Number.NaN)).toBe(false);
            expect(isNumber("123")).toBe(false);
            expect(isNumber(null)).toBe(false);
            expect(isNumber(undefined)).toBe(false);
            expect(isNumber({})).toBe(false);
        });
    });

    describe("isRecord", () => {
        it("should return true for record objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Record Type Guard", "operation");

            expect(isRecord({})).toBe(true);
            expect(isRecord({ a: 1 })).toBe(true);
            expect(isRecord(new Date())).toBe(true);
        });

        it("should return false for non-record values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Record Type Guard", "operation");

            expect(isRecord(null)).toBe(false);
            expect(isRecord([])).toBe(false);
            expect(isRecord("string")).toBe(false);
            expect(isRecord(123)).toBe(false);
            expect(isRecord(undefined)).toBe(false);
        });
    });

    describe("isString", () => {
        it("should return true for strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: String Type Guard", "operation");

            expect(isString("test")).toBe(true);
            expect(isString("")).toBe(true);
            expect(isString(" ")).toBe(true);
        });

        it("should return false for non-strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: String Type Guard", "operation");

            expect(isString(123)).toBe(false);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
            expect(isString({})).toBe(false);
            expect(isString([])).toBe(false);
        });
    });

    describe("safePropertyAccess", () => {
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

    describe("validateAndConvert", () => {
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
            expect(() => validateAndConvert(123, isStringValidator)).toThrow(
                "Type validation failed"
            );
            expect(() => validateAndConvert(null, isStringValidator)).toThrow(
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
                validateAndConvert(123, isStringValidator, "Custom error")
            ).toThrow("Custom error");
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
            expect(isArray(complexObject.items)).toBe(true);

            // Test record type checking
            expect(isRecord(complexObject.user)).toBe(true);
            expect(isRecord(complexObject)).toBe(true);

            // Test number checking
            expect(isNumber(complexObject.count)).toBe(true);
        });

        it("should handle edge cases gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "integration");
            await annotate("Component: Type Helpers", "component");
            await annotate("Operation: Edge Case Handling", "operation");

            // Empty arrays and objects
            expect(isArray([])).toBe(true);
            expect(isRecord({})).toBe(true);

            // Special values
            expect(isArray([])).toBe(true);
            expect(isRecord(Object.create(null))).toBe(true);

            // Function types (should NOT be treated as records in this implementation)
            expect(isRecord(() => {})).toBe(false);

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
            expect(isRecord(user)).toBe(true);

            if (isRecord(user)) {
                const name = safePropertyAccess(user, "name");
                expect(isString(name)).toBe(true);

                const settings = safePropertyAccess(user, "settings");
                expect(isRecord(settings)).toBe(true);
            }
        });
    });
});
