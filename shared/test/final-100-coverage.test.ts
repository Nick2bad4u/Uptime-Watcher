import { describe, it, expect } from "vitest";
import { safeStringify } from "../utils/stringConversion";
import { validateMonitorField } from "../validation/schemas";

describe("Final 100% Coverage Tests", () => {
    describe("stringConversion - Lines 86-89", () => {
        it("should handle undefined case (line 86-87)", () => {
            const result = safeStringify(undefined);
            expect(result).toBe(""); // safeStringify returns empty string for undefined
        });

        it("should handle default case for unknown types (line 89)", () => {
            // Create an object with unusual typeof behavior to try to hit the default case
            const weirdObject = Object.create(null);
            Object.defineProperty(weirdObject, Symbol.toStringTag, {
                value: "WeirdType",
                configurable: true,
            });

            const result = safeStringify(weirdObject);
            expect(typeof result).toBe("string");
        });
    });

    describe("schemas - Lines 399,482", () => {
        it("should handle field validation error at line 399", () => {
            // Test validateMonitorField with invalid monitor type to trigger error path
            const result = validateMonitorField(
                "invalidType" as any,
                "someField",
                "someValue"
            );
            expect(result).toEqual({
                errors: ["Unknown monitor type: invalidType"],
                metadata: {
                    fieldName: "someField",
                    monitorType: "invalidType",
                },
                success: false,
                warnings: [],
            });
        });

        it("should handle validation error categorization at line 482", () => {
            // Test with field that doesn't exist to trigger different error path
            const result = validateMonitorField(
                "http",
                "nonExistentField" as any,
                "someValue"
            );
            expect(result).toEqual({
                errors: [
                    "Field validation failed: Unknown field: nonExistentField",
                ],
                metadata: {
                    fieldName: "nonExistentField",
                    monitorType: "http",
                },
                success: false,
                warnings: [],
            });
        });
    });
});
