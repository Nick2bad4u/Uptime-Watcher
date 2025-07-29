import { describe, it, expect } from "vitest";
import { generateCorrelationId, ValidationError } from "../../utils/correlation.js";

describe("Correlation Utility", () => {
    describe("generateCorrelationId", () => {
        it("should generate a correlation ID", () => {
            const id = generateCorrelationId();

            expect(id).toBeDefined();
            expect(typeof id).toBe("string");
        });

        it("should generate IDs with correct length", () => {
            const id = generateCorrelationId();

            // randomBytes(8) => 8 bytes => 16 hex characters
            expect(id).toHaveLength(16);
        });

        it("should generate unique IDs", () => {
            const id1 = generateCorrelationId();
            const id2 = generateCorrelationId();

            expect(id1).not.toBe(id2);
        });

        it("should generate hex string", () => {
            const id = generateCorrelationId();

            // Should only contain hex characters (0-9, a-f)
            expect(id).toMatch(/^[\da-f]+$/);
        });

        it("should generate multiple unique IDs", () => {
            const ids = new Set();
            const count = 100;

            for (let i = 0; i < count; i++) {
                ids.add(generateCorrelationId());
            }

            // All IDs should be unique
            expect(ids.size).toBe(count);
        });

        it("should always return lowercase hex", () => {
            for (let i = 0; i < 10; i++) {
                const id = generateCorrelationId();
                expect(id).toBe(id.toLowerCase());
            }
        });

        it("should be cryptographically random", () => {
            const ids = Array.from({length: 1000}).fill(0).map(() => generateCorrelationId());

            // Check that we don't have obvious patterns
            // Test that no character appears in the same position too often
            for (let pos = 0; pos < 16; pos++) {
                const chars = ids.map((id) => id[pos]);
                // eslint-disable-next-line unicorn/no-array-reduce
                const charCounts = chars.reduce(
                    (acc, char) => {
                        acc[char] = (acc[char] || 0) + 1;
                        return acc;
                    },
                    {} as Record<string, number>
                );

                // No single character should appear more than 80% of the time
                // in any position (very conservative check for randomness)
                for (const count of Object.values(charCounts)) {
                    expect(count / ids.length).toBeLessThan(0.8);
                }
            }
        });
    });

    describe("ValidationError", () => {
        it("should create ValidationError with single error", () => {
            const error = new ValidationError(["Invalid email"]);

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(ValidationError);
            expect(error.name).toBe("ValidationError");
            expect(error.message).toBe("Validation failed: Invalid email");
            expect(error.errors).toEqual(["Invalid email"]);
        });

        it("should create ValidationError with multiple errors", () => {
            const errors = ["Invalid email", "Password too short", "Name required"];
            const error = new ValidationError(errors);

            expect(error.message).toBe("Validation failed: Invalid email, Password too short, Name required");
            expect(error.errors).toEqual(errors);
        });

        it("should create ValidationError with empty errors array", () => {
            const error = new ValidationError([]);

            expect(error.message).toBe("Validation failed: ");
            expect(error.errors).toEqual([]);
        });

        it("should preserve errors array as provided", () => {
            const errors = ["Error 1", "Error 2"];
            const error = new ValidationError(errors);

            // Should be the same reference
            expect(error.errors).toBe(errors);
        });

        it("should handle special characters in error messages", () => {
            const errors = ['Error with "quotes"', "Error with 'apostrophes'", "Error with <tags>"];
            const error = new ValidationError(errors);

            expect(error.errors).toEqual(errors);
            expect(error.message).toContain('Error with "quotes"');
            expect(error.message).toContain("Error with 'apostrophes'");
            expect(error.message).toContain("Error with <tags>");
        });

        it("should handle unicode characters in error messages", () => {
            const errors = ["Error with emoji 🚨", "Error with unicode: café", "Error with symbols: ñ§∆"];
            const error = new ValidationError(errors);

            expect(error.errors).toEqual(errors);
            expect(error.message).toContain("🚨");
            expect(error.message).toContain("café");
            expect(error.message).toContain("ñ§∆");
        });

        it("should be catchable as Error", () => {
            try {
                throw new ValidationError(["Test error"]);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as ValidationError).errors).toEqual(["Test error"]);
            }
        });

        it("should be catchable as ValidationError", () => {
            try {
                throw new ValidationError(["Test error"]);
            } catch (error) {
                if (error instanceof ValidationError) {
                    expect(error.errors).toEqual(["Test error"]);
                } else {
                    fail("Should be instance of ValidationError");
                }
            }
        });

        it("should have stack trace", () => {
            const error = new ValidationError(["Test error"]);

            expect(error.stack).toBeDefined();
            expect(error.stack).toContain("ValidationError");
        });

        it("should handle very long error messages", () => {
            const longError = "A".repeat(1000);
            const error = new ValidationError([longError]);

            expect(error.errors[0]).toBe(longError);
            expect(error.message).toContain(longError);
        });

        it("should handle many errors", () => {
            const manyErrors = Array.from({ length: 100 }, (_, i) => `Error ${i + 1}`);
            const error = new ValidationError(manyErrors);

            expect(error.errors).toHaveLength(100);
            expect(error.message).toContain("Error 1");
            expect(error.message).toContain("Error 100");
        });
    });
});
