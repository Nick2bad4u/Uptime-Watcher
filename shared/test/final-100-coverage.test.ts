import { describe, it, expect } from "vitest";
import { safeStringify } from "../utils/stringConversion";
import { validateMonitorField } from "@shared/validation/monitorSchemas";

describe("Final 100% Coverage Tests", () => {
    describe("stringConversion - Lines 86-89", () => {
        it("should handle undefined case (line 86-87)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: final-100-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const result = safeStringify(undefined);
            expect(result).toBe(""); // SafeStringify returns empty string for undefined
        });

        it("should handle default case for unknown types (line 89)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: final-100-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

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
        it("should handle field validation error at line 399", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: final-100-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle validation error categorization at line 482", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: final-100-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            // Test with field that doesn't exist to trigger different error path
            expect(() => {
                validateMonitorField(
                    "http",
                    "nonExistentField" as any,
                    "someValue"
                );
            }).toThrowError("Unknown field: nonExistentField");
        });
    });
});
