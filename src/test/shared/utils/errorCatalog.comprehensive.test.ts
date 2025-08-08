/**
 * Comprehensive tests for errorCatalog utilities
 */
import { describe, it, expect } from "vitest";
import {
    formatErrorMessage,
    isKnownErrorMessage,
} from "../../../../shared/utils/errorCatalog";

describe("errorCatalog utilities", () => {
    describe("formatErrorMessage", () => {
        it("should format error message with basic interpolation", () => {
            const template = "Site {siteId} failed with error {error}";
            const variables = { siteId: "example.com", error: "404" };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("Site example.com failed with error 404");
        });

        it("should handle missing variables gracefully", () => {
            const template = "Monitor {monitorId} on site {siteId} failed";
            const variables = { monitorId: "mon-123" }; // missing siteId

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("Monitor mon-123 on site {siteId} failed");
        });

        it("should handle template without placeholders", () => {
            const template = "Generic error occurred";
            const variables = {};

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("Generic error occurred");
        });

        it("should handle empty template", () => {
            const template = "";
            const variables = { key: "value" };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("");
        });

        it("should handle empty variables object", () => {
            const template = "Error in {module}";
            const variables = {};

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("Error in {module}");
        });

        it("should handle simple error messages without placeholders", () => {
            const template = "Database error occurred";
            const variables = {};

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("Database error occurred");
        });

        it("should handle numeric values", () => {
            const template =
                "HTTP error {status} occurred after {attempts} attempts";
            const variables = { status: 500, attempts: 3 };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("HTTP error 500 occurred after 3 attempts");
        });

        it("should handle string values", () => {
            const template = "User {username} authentication failed: {reason}";
            const variables = {
                username: "alice",
                reason: "invalid_credentials",
            };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe(
                "User alice authentication failed: invalid_credentials"
            );
        });

        it("should handle mixed data types", () => {
            const template = "Monitor {id} for {url} failed {count} times";
            const variables = {
                id: 123,
                url: "https://example.com",
                count: "5",
            };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe(
                "Monitor 123 for https://example.com failed 5 times"
            );
        });

        it("should handle repeated placeholders", () => {
            const template = "Error {code}: {code} is not handled";
            const variables = { code: "E001" };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("Error E001: E001 is not handled");
        });

        it("should handle complex error scenarios", () => {
            const template =
                "Database operation failed: {operation} on table {table} with error {error} (attempt {attempt} of {maxAttempts})";
            const variables = {
                operation: "INSERT",
                table: "sites",
                error: "UNIQUE_CONSTRAINT_VIOLATION",
                attempt: 2,
                maxAttempts: 3,
            };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe(
                "Database operation failed: INSERT on table sites with error UNIQUE_CONSTRAINT_VIOLATION (attempt 2 of 3)"
            );
        });

        it("should handle special characters in values", () => {
            const template =
                "Failed to connect to {url} with message: {message}";
            const variables = {
                url: "https://api.example.com:8080/v1/health",
                message: "Connection refused - ERR_CONNECTION_REFUSED",
            };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe(
                "Failed to connect to https://api.example.com:8080/v1/health with message: Connection refused - ERR_CONNECTION_REFUSED"
            );
        });

        it("should handle placeholder-like text that is not a placeholder", () => {
            const template =
                "Error occurred with {actualPlaceholder} and some {not a placeholder} text";
            const variables = { actualPlaceholder: "value" };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe(
                "Error occurred with value and some {not a placeholder} text"
            );
        });

        it("should handle zero values", () => {
            const template =
                "Process completed with {errors} errors and {warnings} warnings";
            const variables = { errors: 0, warnings: 0 };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe(
                "Process completed with 0 errors and 0 warnings"
            );
        });

        it("should handle empty string values", () => {
            const template = 'Field {field} has value: "{value}"';
            const variables = { field: "description", value: "" };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe('Field description has value: ""');
        });
    });

    describe("isKnownErrorMessage", () => {
        it("should return true for known error messages from the catalog", () => {
            // Test with actual error messages from the catalog
            expect(isKnownErrorMessage("Site not found")).toBe(true);
            expect(isKnownErrorMessage("Monitor not found")).toBe(true);
            expect(isKnownErrorMessage("Database connection failed")).toBe(
                true
            );
            expect(isKnownErrorMessage("Network connection failed")).toBe(true);
            expect(isKnownErrorMessage("This field is required")).toBe(true);
            expect(isKnownErrorMessage("Access denied")).toBe(true);
            expect(isKnownErrorMessage("Operation failed")).toBe(true);
        });

        it("should return false for unknown error messages", () => {
            const unknownMessages = [
                "This is definitely not a known error message",
                "Random string that should not be in catalog",
                "Very specific unknown error 12345",
                "Custom error message not in catalog",
            ];

            unknownMessages.forEach((message) => {
                const result = isKnownErrorMessage(message);
                expect(result).toBe(false);
            });
        });

        it("should handle empty string", () => {
            const result = isKnownErrorMessage("");
            expect(result).toBe(false);
        });

        it("should handle case sensitivity", () => {
            // Test that the function is case sensitive
            expect(isKnownErrorMessage("Site not found")).toBe(true);
            expect(isKnownErrorMessage("SITE NOT FOUND")).toBe(false);
            expect(isKnownErrorMessage("site not found")).toBe(false);
        });

        it("should handle whitespace sensitivity", () => {
            expect(isKnownErrorMessage("Site not found")).toBe(true);
            expect(isKnownErrorMessage(" Site not found ")).toBe(false);
            expect(isKnownErrorMessage("Site  not  found")).toBe(false);
        });

        it("should handle partial matches", () => {
            expect(isKnownErrorMessage("Site not found")).toBe(true);
            expect(isKnownErrorMessage("Site not")).toBe(false);
            expect(isKnownErrorMessage("not found")).toBe(false);
        });

        it("should work with all error categories", () => {
            // Test messages from different categories
            expect(isKnownErrorMessage("Failed to add site")).toBe(true); // SITE_ERRORS
            expect(
                isKnownErrorMessage("Monitor configuration is invalid")
            ).toBe(true); // MONITOR_ERRORS
            expect(isKnownErrorMessage("Field format is invalid")).toBe(true); // VALIDATION_ERRORS
            expect(isKnownErrorMessage("Internal error")).toBe(false); // Should be "An internal error occurred"
            expect(isKnownErrorMessage("An internal error occurred")).toBe(
                true
            ); // SYSTEM_ERRORS
            expect(isKnownErrorMessage("Authentication failed")).toBe(true); // NETWORK_ERRORS
            expect(isKnownErrorMessage("Database query failed")).toBe(true); // DATABASE_ERRORS
            expect(isKnownErrorMessage("Operation failed")).toBe(true); // IPC_ERRORS
        });

        it("should handle special characters in error messages", () => {
            // Test messages that contain special characters
            expect(isKnownErrorMessage("SSL/TLS connection failed")).toBe(true);
            expect(
                isKnownErrorMessage("Port number must be between 1 and 65535")
            ).toBe(true);
        });

        it("should return false for non-string inputs by type safety", () => {
            // The function signature requires a string, so TypeScript would catch these
            // But for runtime safety, we test the behavior
            expect(isKnownErrorMessage(123 as any)).toBe(false);
            expect(isKnownErrorMessage(true as any)).toBe(false);
            expect(isKnownErrorMessage({} as any)).toBe(false);
            expect(isKnownErrorMessage([] as any)).toBe(false);
            expect(isKnownErrorMessage(null as any)).toBe(false);
            expect(isKnownErrorMessage(undefined as any)).toBe(false);
        });
    });

    describe("integration tests", () => {
        it("should work together for error handling scenarios", () => {
            // Test a realistic error handling workflow
            const errorTemplate =
                "Monitor {monitorId} failed: {errorType} - {details}";
            const errorData = {
                monitorId: "mon-123",
                errorType: "CONNECTION_TIMEOUT",
                details: "Request timed out after 30 seconds",
            };

            const formattedError = formatErrorMessage(errorTemplate, errorData);
            expect(formattedError).toBe(
                "Monitor mon-123 failed: CONNECTION_TIMEOUT - Request timed out after 30 seconds"
            );

            const isKnown = isKnownErrorMessage(formattedError);
            expect(typeof isKnown).toBe("boolean");
        });

        it("should handle error cataloging workflow", () => {
            // Test common error catalog patterns
            const commonErrors = [
                "Network request failed",
                "Database query timeout",
                "Authentication failed",
                "Resource not available",
                "Configuration error",
            ];

            commonErrors.forEach((error) => {
                const isKnown = isKnownErrorMessage(error);
                expect(typeof isKnown).toBe("boolean");

                // Test formatting with additional context
                const contextualError = formatErrorMessage(
                    "{originalError} - Context: {context}",
                    { originalError: error, context: "integration test" }
                );
                expect(contextualError).toContain(error);
                expect(contextualError).toContain("integration test");
            });
        });

        it("should handle complex error scenarios", () => {
            const complexTemplate =
                "Service {service} in environment {env} failed during {operation} with error {code}: {message}. Retry attempt {retry} of {maxRetries}";
            const complexData = {
                service: "uptime-monitor",
                env: "production",
                operation: "health-check",
                code: "HTTP_500",
                message: "Internal server error",
                retry: 2,
                maxRetries: 3,
            };

            const formattedError = formatErrorMessage(
                complexTemplate,
                complexData
            );
            expect(formattedError).toBe(
                "Service uptime-monitor in environment production failed during health-check with error HTTP_500: Internal server error. Retry attempt 2 of 3"
            );

            const isKnown = isKnownErrorMessage(formattedError);
            expect(typeof isKnown).toBe("boolean");
        });
    });
});
