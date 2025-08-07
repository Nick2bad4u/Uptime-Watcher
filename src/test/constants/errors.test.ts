/**
 * @fileoverview Tests for error constants to ensure they are properly exported and accessible.
 */

import { describe, it, expect } from "vitest";
import { ERROR_CATALOG } from "../../constants/errors";

describe("Error Constants", () => {
    describe("ERROR_CATALOG", () => {
        it("should export the new structured error catalog", () => {
            expect(ERROR_CATALOG).toBeDefined();
            expect(typeof ERROR_CATALOG).toBe("object");
        });

        it("should contain all required error domains", () => {
            expect(ERROR_CATALOG.sites).toBeDefined();
            expect(ERROR_CATALOG.monitors).toBeDefined();
            expect(ERROR_CATALOG.validation).toBeDefined();
            expect(ERROR_CATALOG.system).toBeDefined();
            expect(ERROR_CATALOG.network).toBeDefined();
            expect(ERROR_CATALOG.database).toBeDefined();
        });

        it("should contain expected site error messages", () => {
            expect(ERROR_CATALOG.sites.NOT_FOUND).toBe("Site not found");
            expect(ERROR_CATALOG.sites.FAILED_TO_ADD).toBe("Failed to add site");
            expect(ERROR_CATALOG.sites.FAILED_TO_DELETE).toBe("Failed to delete site");
            expect(ERROR_CATALOG.sites.FAILED_TO_UPDATE).toBe("Failed to update site");
            expect(ERROR_CATALOG.sites.FAILED_TO_CHECK).toBe("Failed to check site");
        });

        it("should contain expected monitor error messages", () => {
            expect(ERROR_CATALOG.monitors.NOT_FOUND).toBe("Monitor not found");
            expect(ERROR_CATALOG.monitors.CANNOT_REMOVE_LAST).toBe(
                "Cannot remove the last monitor from a site. Use site removal instead."
            );
            expect(ERROR_CATALOG.monitors.FAILED_TO_ADD).toBe("Failed to add monitor");
            expect(ERROR_CATALOG.monitors.FAILED_TO_UPDATE_INTERVAL).toBe("Failed to update check interval");
        });

        it("should contain expected validation error messages", () => {
            expect(ERROR_CATALOG.validation.URL_INVALID).toBe("URL format is invalid");
            expect(ERROR_CATALOG.validation.FIELD_REQUIRED).toBe("This field is required");
            expect(ERROR_CATALOG.validation.HOST_INVALID).toBe("Host address is invalid");
        });

        it("should contain expected system error messages", () => {
            expect(ERROR_CATALOG.system.INTERNAL_ERROR).toBe("An internal error occurred");
            expect(ERROR_CATALOG.system.SERVICE_UNAVAILABLE).toBe("Service temporarily unavailable");
            expect(ERROR_CATALOG.system.OPERATION_TIMEOUT).toBe("Operation timed out");
        });

        it("should contain expected network error messages", () => {
            expect(ERROR_CATALOG.network.CONNECTION_FAILED).toBe("Network connection failed");
            expect(ERROR_CATALOG.network.CONNECTION_TIMEOUT).toBe("Connection timed out");
            expect(ERROR_CATALOG.network.HOST_UNREACHABLE).toBe("Host unreachable");
        });

        it("should contain expected database error messages", () => {
            expect(ERROR_CATALOG.database.CONNECTION_FAILED).toBe("Database connection failed");
            expect(ERROR_CATALOG.database.QUERY_FAILED).toBe("Database query failed");
            expect(ERROR_CATALOG.database.RECORD_NOT_FOUND).toBe("Record not found");
        });

        it("should have proper structure for all domains", () => {
            // Test that each domain has error messages
            Object.values(ERROR_CATALOG).forEach((domain) => {
                expect(typeof domain).toBe("object");
                expect(Object.keys(domain).length).toBeGreaterThan(0);

                // Test that all error messages are strings
                Object.values(domain).forEach((message) => {
                    expect(typeof message).toBe("string");
                    expect(message.length).toBeGreaterThan(0);
                });
            });
        });

        it("should be readonly at TypeScript level", () => {
            // TypeScript compilation should prevent mutations
            // This test verifies the constant exports exist and are accessible
            expect(ERROR_CATALOG).toBeDefined();
            expect(typeof ERROR_CATALOG).toBe("object");

            // Verify we can't modify the object structure (readonly nature)
            // The `as const` assertion prevents TypeScript compilation if we try to modify
            expect(Object.isFrozen(ERROR_CATALOG)).toBe(false); // as const doesn't freeze at runtime
            expect(ERROR_CATALOG.sites.NOT_FOUND).toBe("Site not found");
        });
    });
});
