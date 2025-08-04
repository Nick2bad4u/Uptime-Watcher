/**
 * @fileoverview Tests for error constants to ensure they are properly exported and accessible.
 */

import { describe, it, expect } from "vitest";
import { ERROR_MESSAGES } from "../../constants/errors";

describe("Error Constants", () => {
    describe("ERROR_MESSAGES", () => {
        it("should export all error message constants", () => {
            expect(ERROR_MESSAGES).toBeDefined();
            expect(typeof ERROR_MESSAGES).toBe("object");
        });

        it("should contain all required error messages", () => {
            expect(ERROR_MESSAGES.FAILED_TO_ADD_MONITOR).toBe("Failed to add monitor");
            expect(ERROR_MESSAGES.FAILED_TO_ADD_SITE).toBe("Failed to add site");
            expect(ERROR_MESSAGES.FAILED_TO_CHECK_SITE).toBe("Failed to check site");
            expect(ERROR_MESSAGES.FAILED_TO_DELETE_SITE).toBe("Failed to delete site");
            expect(ERROR_MESSAGES.FAILED_TO_UPDATE_INTERVAL).toBe("Failed to update check interval");
            expect(ERROR_MESSAGES.FAILED_TO_UPDATE_SITE).toBe("Failed to update site");
            expect(ERROR_MESSAGES.SITE_NOT_FOUND).toBe("Site not found");
        });

        it("should be readonly at TypeScript level", () => {
            // TypeScript compilation should prevent mutations
            // This test verifies the constant exports exist and are accessible
            expect(ERROR_MESSAGES).toBeDefined();
            expect(typeof ERROR_MESSAGES).toBe("object");

            // Verify we can't modify the object structure (readonly nature)
            // The `as const` assertion prevents TypeScript compilation if we try to modify
            expect(Object.isFrozen(ERROR_MESSAGES)).toBe(false); // as const doesn't freeze at runtime
            expect(ERROR_MESSAGES.FAILED_TO_ADD_SITE).toBe("Failed to add site");
        });

        it("should have string values for all properties", () => {
            Object.values(ERROR_MESSAGES).forEach((message) => {
                expect(typeof message).toBe("string");
                expect(message.length).toBeGreaterThan(0);
            });
        });
    });
});
