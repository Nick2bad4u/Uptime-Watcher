import { describe, expect, it } from "vitest";
import { safeInteger } from "@shared/validation/validatorUtils";

describe("ValidatorUtils Basic Test", () => {
    it("should work with basic string conversion", () => {
        const result = safeInteger("invalid", 42);
        expect(result).toBe(42);
    });
});
