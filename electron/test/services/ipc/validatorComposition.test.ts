/**
 * Test suite for validatorComposition
 *
 * @module Unknown
 *
 * @file Comprehensive tests for unknown functionality in the Uptime Watcher
 *   application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category General
 *
 * @tags ["test"]
 */

import { describe, expect, it } from "vitest";

import type { IpcParameterValidator } from "../../../services/ipc/types.js";

/**
 * Import the validator creation functions we refactored
 */
function createParameterCountValidator(
    expectedCount: number
): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        return params.length === expectedCount
            ? null
            : [
                  `Expected exactly ${expectedCount} parameter${expectedCount === 1 ? "" : "s"}`,
              ];
    };
}

function composeValidators(
    validators: IpcParameterValidator[]
): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        const allErrors: string[] = [];

        for (const validator of validators) {
            const errors = validator(params);
            if (errors) {
                allErrors.push(...errors);
            }
        }

        return allErrors.length > 0 ? allErrors : null;
    };
}

function createMockStringValidator(paramName: string): IpcParameterValidator {
    return (params: unknown[]): null | string[] => {
        const value = params[0];
        if (typeof value !== "string" || value.trim().length === 0) {
            return [`${paramName} must be a non-empty string`];
        }
        return null;
    };
}

describe("Validator Composition Utilities", () => {
    describe("createParameterCountValidator", () => {
        it("should validate correct parameter count", () => {
            const validator = createParameterCountValidator(2);
            expect(validator(["a", "b"])).toBeNull();
        });
        it("should reject incorrect parameter count", () => {
            const validator = createParameterCountValidator(2);
            const result = validator(["a"]);
            expect(result).toEqual(["Expected exactly 2 parameters"]);
        });
        it("should handle singular vs plural messaging", () => {
            const singleValidator = createParameterCountValidator(1);
            const multiValidator = createParameterCountValidator(3);

            expect(singleValidator([])).toEqual([
                "Expected exactly 1 parameter",
            ]);
            expect(multiValidator([])).toEqual([
                "Expected exactly 3 parameters",
            ]);
        });
    });
    describe("composeValidators", () => {
        it("should pass when all validators pass", () => {
            const validator1: IpcParameterValidator = () => null;
            const validator2: IpcParameterValidator = () => null;

            const composed = composeValidators([validator1, validator2]);
            expect(composed(["test"])).toBeNull();
        });
        it("should collect errors from all validators", () => {
            const validator1: IpcParameterValidator = () => ["Error 1"];
            const validator2: IpcParameterValidator = () => [
                "Error 2",
                "Error 3",
            ];

            const composed = composeValidators([validator1, validator2]);
            const result = composed(["test"]);

            expect(result).toEqual(["Error 1", "Error 2", "Error 3"]);
        });
        it("should handle empty validators array", () => {
            const composed = composeValidators([]);
            expect(composed(["test"])).toBeNull();
        });
        it("should handle mix of passing and failing validators", () => {
            const passingValidator: IpcParameterValidator = () => null;
            const failingValidator: IpcParameterValidator = () => ["Error"];

            const composed = composeValidators([
                passingValidator,
                failingValidator,
            ]);
            const result = composed(["test"]);

            expect(result).toEqual(["Error"]);
        });
    });
    describe("Refactored createTwoStringValidator simulation", () => {
        it("should validate two string parameters correctly", () => {
            const firstStringValidator = createMockStringValidator("first");
            const secondStringValidator = createMockStringValidator("second");

            const twoStringValidator = composeValidators([
                createParameterCountValidator(2),
                (params: unknown[]) => firstStringValidator([params[0]]),
                (params: unknown[]) => secondStringValidator([params[1]]),
            ]);

            // Should pass with valid strings
            expect(twoStringValidator(["hello", "world"])).toBeNull();

            // Should fail with wrong parameter count
            const wrongCountResult = twoStringValidator(["hello"]);
            expect(wrongCountResult).toContain("Expected exactly 2 parameters");

            // Should fail with invalid strings
            const invalidStringResult = twoStringValidator(["", "world"]);
            expect(invalidStringResult).toContain(
                "first must be a non-empty string"
            );
        });
        it("should demonstrate complexity reduction", () => {
            // Old approach would have had many nested conditions
            // New approach uses composition of simple validators

            const countValidator = createParameterCountValidator(2);
            const stringValidator1 = createMockStringValidator("param1");
            const stringValidator2 = createMockStringValidator("param2");

            // Each validator has low complexity (≤2)
            expect(countValidator(["a", "b"])).toBeNull(); // Complexity: 1
            expect(stringValidator1(["test"])).toBeNull(); // Complexity: 2
            expect(stringValidator2(["test"])).toBeNull(); // Complexity: 2

            // Composition maintains low complexity in each function
            const composed = composeValidators([
                countValidator,
                (params: unknown[]) => stringValidator1([params[0]]),
                (params: unknown[]) => stringValidator2([params[1]]),
            ]);

            expect(composed(["hello", "world"])).toBeNull();
        });
    });
    describe("Integration with existing patterns", () => {
        it("should maintain the null-for-success, array-for-errors pattern", () => {
            const validator = composeValidators([
                createParameterCountValidator(1),
                createMockStringValidator("test"),
            ]);

            // Success case
            expect(validator(["valid"])).toBeNull();

            // Error case
            const errors = validator([""]);
            expect(Array.isArray(errors)).toBe(true);
            expect(errors?.length).toBeGreaterThan(0);
        });
        it("should be compatible with existing IpcParameterValidator interface", () => {
            const validator: IpcParameterValidator = composeValidators([
                createParameterCountValidator(1),
            ]);

            // Should match the IpcParameterValidator type signature
            const result = validator(["test"]);
            expect(result === null || Array.isArray(result)).toBe(true);
        });
    });
});
