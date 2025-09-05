/**
 * @fileoverview Simple Fast-Check fuzzing tests for validatorUtils targeting line 333
 */

import { describe, expect } from "vitest";
import { fc, test } from "@fast-check/vitest";
import { safeInteger, isValidInteger } from "@shared/validation/validatorUtils";

describe("ValidatorUtils Fuzzing - Line 333", () => {
    describe("safeInteger - Line 333 validation boundary conditions", () => {
        test.prop([
            fc.constantFrom("not a number", "12.34", "NaN", ""),
            fc.integer()
        ])("should handle invalid integer strings - line 333", (invalidString, defaultValue) => {
            const result = safeInteger(invalidString, defaultValue);
            expect(result).toBe(defaultValue);
        });

        test.prop([
            fc.constantFrom("", " ", "123.456", "NaN", "abc")
        ])("should correctly identify invalid integers", (invalidValue) => {
            const result = isValidInteger(invalidValue);
            expect(result).toBe(false);
        });
    });
});
