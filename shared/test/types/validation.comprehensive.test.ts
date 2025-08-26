import { describe, expect, it } from "vitest";

import {
    createFailureResult,
    createSuccessResult,
    isValidationResult,
    type BaseValidationResult,
    type ValidationMetadata,
    type ValidationResult,
} from "../../types/validation";

describe("Validation Types and Utilities", () => {
    describe("createFailureResult", () => {
        it("should create a failure result with basic errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const errors = ["Required field missing", "Invalid format"];
            const result = createFailureResult(errors);

            expect(result).toEqual({
                errors,
                metadata: {},
                success: false,
                warnings: [],
            });
        });

        it("should create a failure result with metadata", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const errors = ["Validation failed"];
            const metadata: ValidationMetadata = {
                field: "email",
                rule: "format",
                timestamp: Date.now(),
            };
            const result = createFailureResult(errors, metadata);

            expect(result).toEqual({
                errors,
                metadata,
                success: false,
                warnings: [],
            });
        });

        it("should handle empty errors array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            const result = createFailureResult([]);

            expect(result).toEqual({
                errors: [],
                metadata: {},
                success: false,
                warnings: [],
            });
        });

        it("should handle complex metadata objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const errors = ["Multiple validation errors"];
            const metadata: ValidationMetadata = {
                context: "user-registration",
                details: {
                    attemptedValue: "invalid@",
                    expectedFormat: "email",
                },
                field: "emailAddress",
                rule: "email-validation",
                severity: "high",
                timestamp: 1_234_567_890,
            };
            const result = createFailureResult(errors, metadata);

            expect(result.success).toBe(false);
            expect(result.errors).toEqual(errors);
            expect(result.metadata).toEqual(metadata);
            expect(result.warnings).toEqual([]);
        });

        it("should handle special characters in error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            const errors = ["Error with special chars: @#$%^&*()"];
            const result = createFailureResult(errors);

            expect(result.errors).toEqual(errors);
            expect(result.success).toBe(false);
        });
    });

    describe("createSuccessResult", () => {
        it("should create a basic success result without data or warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const result = createSuccessResult();

            expect(result).toEqual({
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
            });
        });

        it("should create a success result with data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const data = { id: 1, name: "Test User" };
            const result = createSuccessResult(data);

            expect(result).toEqual({
                data,
                errors: [],
                metadata: {},
                success: true,
            });
        });

        it("should create a success result with warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const warnings = [
                "Minor formatting issue",
                "Deprecated field used",
            ];
            const result = createSuccessResult(undefined, warnings);

            expect(result).toEqual({
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings,
            });
        });

        it("should create a success result with both data and warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const data = { processed: true };
            const warnings = ["Performance warning"];
            const result = createSuccessResult(data, warnings);

            expect(result).toEqual({
                data,
                errors: [],
                metadata: {},
                success: true,
                warnings,
            });
        });

        it("should handle null data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const result = createSuccessResult(null);

            expect(result.data).toBe(null);
            expect(result.success).toBe(true);
        });

        it("should handle complex data objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                array: [
                    1,
                    2,
                    3,
                ],
                nested: {
                    deep: {
                        value: "test",
                    },
                },
                string: "test",
            };
            const result = createSuccessResult(data);

            expect(result.data).toEqual(data);
            expect(result.success).toBe(true);
        });

        it("should handle empty warnings array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const result = createSuccessResult("data", []);

            expect(result.warnings).toEqual([]);
        });
    });

    describe("isValidationResult", () => {
        it("should return true for valid BaseValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult: BaseValidationResult = {
                errors: [],
                success: true,
            };

            expect(isValidationResult(validResult)).toBe(true);
        });

        it("should return true for ValidationResult with additional properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult: ValidationResult = {
                data: { test: true },
                errors: ["Some error"],
                metadata: { field: "test" },
                success: false,
                warnings: ["Warning"],
            };

            expect(isValidationResult(validResult)).toBe(true);
        });

        it("should return false for null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult(null)).toBe(false);
        });

        it("should return false for undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult(undefined)).toBe(false);
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult("string")).toBe(false);
            expect(isValidationResult(123)).toBe(false);
            expect(isValidationResult(true)).toBe(false);
        });

        it("should return false for objects missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult({})).toBe(false);
            expect(isValidationResult({ errors: [] })).toBe(false);
            expect(isValidationResult({ success: true })).toBe(false);
        });

        it("should return false when errors is not an array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            expect(
                isValidationResult({
                    errors: "not an array",
                    success: true,
                })
            ).toBe(false);
        });

        it("should return false when success is not a boolean", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                isValidationResult({
                    errors: [],
                    success: "true",
                })
            ).toBe(false);
        });

        it("should return true for objects with extra properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const resultWithExtras = {
                errors: [],
                extraProperty: "should not affect validation",
                success: true,
            };

            expect(isValidationResult(resultWithExtras)).toBe(true);
        });

        it("should handle arrays", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult([])).toBe(false);
            expect(isValidationResult([{ errors: [], success: true }])).toBe(
                false
            );
        });

        it("should handle nested objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const nestedObject = {
                errors: [],
                nested: {
                    deep: {
                        value: true,
                    },
                },
                success: true,
            };

            expect(isValidationResult(nestedObject)).toBe(true);
        });
    });

    describe("Type Interfaces", () => {
        it("should work with BaseValidationResult interface", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const baseResult: BaseValidationResult = {
                errors: ["Error message"],
                success: false,
            };

            expect(baseResult.errors).toEqual(["Error message"]);
            expect(baseResult.success).toBe(false);
        });

        it("should work with ValidationResult interface", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const fullResult: ValidationResult = {
                data: { validated: true },
                errors: [],
                metadata: { validatedAt: Date.now() },
                success: true,
                warnings: ["Minor issue"],
            };

            expect(fullResult.data).toEqual({ validated: true });
            expect(fullResult.errors).toEqual([]);
            expect(fullResult.metadata?.["validatedAt"]).toBeDefined();
            expect(fullResult.success).toBe(true);
            expect(fullResult.warnings).toEqual(["Minor issue"]);
        });

        it("should work with ValidationMetadata interface", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const metadata: ValidationMetadata = {
                context: "form-validation",
                field: "username",
                rule: "required",
                timestamp: Date.now(),
            };

            expect(metadata["context"]).toBe("form-validation");
            expect(metadata["field"]).toBe("username");
            expect(metadata["rule"]).toBe("required");
            expect(typeof metadata["timestamp"]).toBe("number");
        });
    });

    describe("Edge Cases and Error Conditions", () => {
        it("should handle createFailureResult with very long error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const longError = "A".repeat(10_000);
            const result = createFailureResult([longError]);

            expect(result.errors[0]).toBe(longError);
            expect(result.success).toBe(false);
        });

        it("should handle createSuccessResult with circular references in data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const circularData: any = { name: "test" };
            circularData.self = circularData;

            // This should not throw an error during creation
            const result = createSuccessResult(circularData);
            expect(result.success).toBe(true);
            expect(result.data).toBe(circularData);
        });

        it("should handle isValidationResult with circular references", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const circularResult: any = {
                errors: [],
                success: true,
            };
            circularResult.self = circularResult;

            expect(isValidationResult(circularResult)).toBe(true);
        });

        it("should handle metadata with various data types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const metadata: ValidationMetadata = {
                array: [
                    1,
                    2,
                    3,
                ],
                boolean: true,
                null: null,
                number: 42,
                object: { nested: true },
                string: "test",
                undefined: undefined,
            };

            const result = createFailureResult(["Test error"], metadata);
            expect(result.metadata).toEqual(metadata);
        });
    });
});
