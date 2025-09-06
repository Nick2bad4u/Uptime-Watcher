/**
 * @file Tests for shared/types/validation.ts functions
 */

import { describe, expect, it } from "vitest";

import {
    createFailureResult,
    createSuccessResult,
    isValidationResult,
    type ValidationResult,
    type BaseValidationResult,
} from "../../types/validation";

describe("shared/types/validation function coverage", () => {
    describe(createFailureResult, () => {
        it("should create a failure result with errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const errors = ["Field is required", "Invalid format"];
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
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const errors = ["Validation failed"];
            const metadata = { field: "email", validator: "email" };
            const result = createFailureResult(errors, metadata);

            expect(result).toEqual({
                errors,
                metadata,
                success: false,
                warnings: [],
            });
        });

        it("should handle empty errors array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            const result = createFailureResult([]);

            expect(result.success).toBeFalsy();
            expect(result.errors).toEqual([]);
            expect(result.warnings).toEqual([]);
            expect(result.metadata).toEqual({});
        });
    });

    describe(createSuccessResult, () => {
        it("should create a success result without data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
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
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const data = { id: 1, name: "test" };
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
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const warnings = ["Deprecated field used"];
            const result = createSuccessResult(undefined, warnings);

            expect(result).toEqual({
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings,
            });
        });

        it("should create a success result with data and warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const data = { value: 42 };
            const warnings = ["Value is near limit"];
            const result = createSuccessResult(data, warnings);

            expect(result).toEqual({
                data,
                errors: [],
                metadata: {},
                success: true,
                warnings,
            });
        });
    });

    describe(isValidationResult, () => {
        it("should return true for valid BaseValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult: BaseValidationResult = {
                errors: [],
                success: true,
            };

            expect(isValidationResult(validResult)).toBeTruthy();
        });

        it("should return true for ValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult: ValidationResult = {
                data: { test: true },
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            };

            expect(isValidationResult(validResult)).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult(null)).toBeFalsy();
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult(undefined)).toBeFalsy();
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult("string")).toBeFalsy();
            expect(isValidationResult(123)).toBeFalsy();
            expect(isValidationResult(true)).toBeFalsy();
        });

        it("should return false for object missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult({})).toBeFalsy();
            expect(isValidationResult({ errors: [] })).toBeFalsy();
            expect(isValidationResult({ success: true })).toBeFalsy();
        });

        it("should return false for object with invalid property types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                isValidationResult({
                    errors: "not an array",
                    success: true,
                })
            ).toBeFalsy();

            expect(
                isValidationResult({
                    errors: [],
                    success: "not a boolean",
                })
            ).toBeFalsy();
        });

        it("should handle object with non-array errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            const invalidResult = {
                errors: { invalid: "object" },
                success: true,
            };

            expect(isValidationResult(invalidResult)).toBeFalsy();
        });
    });

    describe("integration tests", () => {
        it("should work with createFailureResult output", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const result = createFailureResult(["error"]);
            expect(isValidationResult(result)).toBeTruthy();
        });

        it("should work with createSuccessResult output", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const result = createSuccessResult();
            expect(isValidationResult(result)).toBeTruthy();
        });
    });
});
