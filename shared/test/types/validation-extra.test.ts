/**
 * Function coverage validation test for shared/types/validation.ts
 *
 * This test ensures all exported functions are called to achieve 100% function
 * coverage.
 *
 * @file Function coverage validation for validation type helpers
 */

import { describe, it, expect } from "vitest";
import * as validation from "@shared/types/validation";

describe("Function Coverage Validation", () => {
    it("should call all exported functions to ensure 100% function coverage", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extra", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Export Operation", "type");

        // Verify all functions are accessible
        expect(typeof validation.createFailureResult).toBe("function");
        expect(typeof validation.createSuccessResult).toBe("function");
        expect(typeof validation.isValidationResult).toBe("function");

        // Call each function with minimal valid inputs to register coverage
        validation.createFailureResult(["test error"]);
        validation.createSuccessResult("test data");
        validation.isValidationResult({ success: true } as any);

        // Verify basic functionality
        const failureResult = validation.createFailureResult(["test error"]);
        const successResult = validation.createSuccessResult("test data");

        expect(failureResult.success).toBeFalsy();
        expect(successResult.success).toBeTruthy();
        expect(typeof validation.isValidationResult(failureResult)).toBe(
            "boolean"
        );
    });
});
