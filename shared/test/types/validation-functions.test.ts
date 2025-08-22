/**
 * @fileoverview Tests for shared/types/validation.ts functions
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
    describe("createFailureResult", () => {
        it("should create a failure result with errors", () => {
            const errors = ["Field is required", "Invalid format"];
            const result = createFailureResult(errors);

            expect(result).toEqual({
                errors,
                metadata: {},
                success: false,
                warnings: [],
            });
        });

        it("should create a failure result with metadata", () => {
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

        it("should handle empty errors array", () => {
            const result = createFailureResult([]);

            expect(result.success).toBe(false);
            expect(result.errors).toEqual([]);
            expect(result.warnings).toEqual([]);
            expect(result.metadata).toEqual({});
        });
    });

    describe("createSuccessResult", () => {
        it("should create a success result without data", () => {
            const result = createSuccessResult();

            expect(result).toEqual({
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
            });
        });

        it("should create a success result with data", () => {
            const data = { id: 1, name: "test" };
            const result = createSuccessResult(data);

            expect(result).toEqual({
                data,
                errors: [],
                metadata: {},
                success: true,
            });
        });

        it("should create a success result with warnings", () => {
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

        it("should create a success result with data and warnings", () => {
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

    describe("isValidationResult", () => {
        it("should return true for valid BaseValidationResult", () => {
            const validResult: BaseValidationResult = {
                errors: [],
                success: true,
            };

            expect(isValidationResult(validResult)).toBe(true);
        });

        it("should return true for ValidationResult", () => {
            const validResult: ValidationResult = {
                data: { test: true },
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            };

            expect(isValidationResult(validResult)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isValidationResult(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isValidationResult(undefined)).toBe(false);
        });

        it("should return false for primitive types", () => {
            expect(isValidationResult("string")).toBe(false);
            expect(isValidationResult(123)).toBe(false);
            expect(isValidationResult(true)).toBe(false);
        });

        it("should return false for object missing required properties", () => {
            expect(isValidationResult({})).toBe(false);
            expect(isValidationResult({ errors: [] })).toBe(false);
            expect(isValidationResult({ success: true })).toBe(false);
        });

        it("should return false for object with invalid property types", () => {
            expect(
                isValidationResult({
                    errors: "not an array",
                    success: true,
                })
            ).toBe(false);

            expect(
                isValidationResult({
                    errors: [],
                    success: "not a boolean",
                })
            ).toBe(false);
        });

        it("should handle object with non-array errors", () => {
            const invalidResult = {
                errors: { invalid: "object" },
                success: true,
            };

            expect(isValidationResult(invalidResult)).toBe(false);
        });
    });

    describe("integration tests", () => {
        it("should work with createFailureResult output", () => {
            const result = createFailureResult(["error"]);
            expect(isValidationResult(result)).toBe(true);
        });

        it("should work with createSuccessResult output", () => {
            const result = createSuccessResult();
            expect(isValidationResult(result)).toBe(true);
        });
    });
});
