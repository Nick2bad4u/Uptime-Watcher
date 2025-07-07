/**
 * Tests for correlation utilities including correlation ID generation and ValidationError.
 */

import { describe, it, expect } from "vitest";

import { generateCorrelationId, ValidationError } from "../../hooks/correlationUtils";

describe("correlationUtils", () => {
    describe("generateCorrelationId", () => {
        it("should generate a unique correlation ID", () => {
            const id1 = generateCorrelationId();
            const id2 = generateCorrelationId();

            expect(id1).toBeDefined();
            expect(id2).toBeDefined();
            expect(id1).not.toBe(id2);
        });

        it("should generate a correlation ID with expected format", () => {
            const id = generateCorrelationId();

            // Should be a 16-character hex string (8 bytes * 2 hex chars per byte)
            expect(id).toMatch(/^[a-f0-9]{16}$/);
        });

        it("should generate different IDs on multiple calls", () => {
            const ids = new Set();
            for (let i = 0; i < 100; i++) {
                ids.add(generateCorrelationId());
            }

            // All 100 IDs should be unique
            expect(ids.size).toBe(100);
        });
    });

    describe("ValidationError", () => {
        it("should create a validation error with error messages", () => {
            const errors = ["Field is required", "Invalid format"];
            const error = new ValidationError(errors);

            expect(error).toBeInstanceOf(Error);
            expect(error.name).toBe("ValidationError");
            expect(error.errors).toEqual(errors);
            expect(error.message).toBe("Validation failed: Field is required, Invalid format");
        });

        it("should handle single error message", () => {
            const errors = ["Single error"];
            const error = new ValidationError(errors);

            expect(error.message).toBe("Validation failed: Single error");
            expect(error.errors).toEqual(errors);
        });

        it("should handle empty error array", () => {
            const errors: string[] = [];
            const error = new ValidationError(errors);

            expect(error.message).toBe("Validation failed: ");
            expect(error.errors).toEqual(errors);
        });
    });
});
