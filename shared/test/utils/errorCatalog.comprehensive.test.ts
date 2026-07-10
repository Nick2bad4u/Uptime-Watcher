/**
 * Comprehensive tests for errorCatalog utilities
 */
import { beforeEach, describe, expect, it } from "vitest";

import {
    formatErrorMessage,
    isKnownErrorMessage,
} from "../../utils/errorCatalog";

describe("errorCatalog utilities", () => {
    describe(formatErrorMessage, () => {
        it("should format error message with basic interpolation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const template = "Site {siteIdentifier} failed with error {error}";
            const variables = { siteIdentifier: "example.com", error: "404" };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("Site example.com failed with error 404");
        });

        it("should handle missing variables gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template =
                "Monitor {monitorId} on site {siteIdentifier} failed";
            const variables = { monitorId: "mon-123" }; // Missing siteIdentifier

            const result = formatErrorMessage(template, variables);

            expect(result).toBe(
                "Monitor mon-123 on site {siteIdentifier} failed"
            );
        });

        describe("empty and placeholder-free inputs", () => {
            beforeEach(async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorCatalog", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");
            });

            it.each([
                {
                    description: "template without placeholders",
                    template: "Generic error occurred",
                    variables: {},
                    expected: "Generic error occurred",
                },
                {
                    description: "empty template",
                    template: "",
                    variables: { key: "value" },
                    expected: "",
                },
                {
                    description: "empty variables object",
                    template: "Error in {module}",
                    variables: {},
                    expected: "Error in {module}",
                },
            ])(
                "should handle $description",
                ({ template, variables, expected }) => {
                    const result = formatErrorMessage(template, variables);

                    expect(result).toBe(expected);
                }
            );
        });

        it("should handle simple error messages without placeholders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const template = "Database error occurred";
            const variables = {};

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("Database error occurred");
        });

        it("should handle numeric values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template =
                "HTTP error {status} occurred after {attempts} attempts";
            const variables = { status: 500, attempts: 3 };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("HTTP error 500 occurred after 3 attempts");
        });

        it("should handle string values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle mixed data types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle repeated placeholders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "Error {code}: {code} is not handled";
            const variables = { code: "E001" };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe("Error E001: E001 is not handled");
        });

        it("should not replace dangerous prototype placeholder keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Security", "type");

            const template =
                "Value: {__proto__} and {constructor} and {prototype}";
            const variables = {
                __proto__: "dangerous",
                constructor: "risky",
                prototype: "unsafe",
                safe: "ok",
            };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe(
                "Value: {__proto__} and {constructor} and {prototype}"
            );
        });

        it("should treat replacement strings literally", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Security", "type");

            const result = formatErrorMessage("Pattern: {pattern}", {
                pattern: "$1 and $& and $$",
            });

            expect(result).toBe("Pattern: $1 and $& and $$");
        });

        it("should handle complex error scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle special characters in values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle placeholder-like text that is not a placeholder", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template =
                "Error occurred with {actualPlaceholder} and some {not a placeholder} text";
            const variables = { actualPlaceholder: "value" };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe(
                "Error occurred with value and some {not a placeholder} text"
            );
        });

        it("should handle zero values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template =
                "Process completed with {errors} errors and {warnings} warnings";
            const variables = { errors: 0, warnings: 0 };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe(
                "Process completed with 0 errors and 0 warnings"
            );
        });

        it("should handle empty string values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = 'Field {field} has value: "{value}"';
            const variables = { field: "description", value: "" };

            const result = formatErrorMessage(template, variables);

            expect(result).toBe('Field description has value: ""');
        });
    });

    describe(isKnownErrorMessage, () => {
        it("should return true for known error messages from the catalog", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Test with actual error messages from the catalog
            expect(isKnownErrorMessage("Site not found")).toBeTruthy();
            expect(isKnownErrorMessage("Monitor not found")).toBeTruthy();
            expect(
                isKnownErrorMessage("Database connection failed")
            ).toBeTruthy();
            expect(
                isKnownErrorMessage("Network connection failed")
            ).toBeTruthy();
            expect(isKnownErrorMessage("This field is required")).toBeTruthy();
            expect(isKnownErrorMessage("Access denied")).toBeTruthy();
            expect(isKnownErrorMessage("Operation failed")).toBeTruthy();
        });

        it("should return false for unknown error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const unknownMessages = [
                "This is definitely not a known error message",
                "Random string that should not be in catalog",
                "Very specific unknown error 12345",
                "Custom error message not in catalog",
            ];

            for (const message of unknownMessages) {
                const isResult = isKnownErrorMessage(message);
                expect(isResult).toBeFalsy();
            }
        });

        it("should handle empty string", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const isResult = isKnownErrorMessage("");
            expect(isResult).toBeFalsy();
        });

        describe("known message matching boundaries", () => {
            beforeEach(async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: errorCatalog", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");
            });

            it.each([
                {
                    description: "case sensitivity",
                    invalidMessages: ["SITE NOT FOUND", "site not found"],
                },
                {
                    description: "whitespace sensitivity",
                    invalidMessages: [" Site not found ", "Site  not  found"],
                },
                {
                    description: "partial matches",
                    invalidMessages: ["Site not", "not found"],
                },
            ])("should handle $description", ({ invalidMessages }) => {
                expect(isKnownErrorMessage("Site not found")).toBeTruthy();
                for (const message of invalidMessages) {
                    expect(isKnownErrorMessage(message)).toBeFalsy();
                }
            });
        });

        it("should work with all error categories", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Test messages from different categories
            expect(isKnownErrorMessage("Failed to add site")).toBeTruthy(); // SITE_ERRORS
            expect(
                isKnownErrorMessage("Monitor configuration is invalid")
            ).toBeTruthy(); // MONITOR_ERRORS
            expect(isKnownErrorMessage("Field format is invalid")).toBeTruthy(); // VALIDATION_ERRORS
            expect(isKnownErrorMessage("Internal error")).toBeFalsy(); // Should be "An internal error occurred"
            expect(
                isKnownErrorMessage("An internal error occurred")
            ).toBeTruthy(); // SYSTEM_ERRORS
            expect(isKnownErrorMessage("Authentication failed")).toBeTruthy(); // NETWORK_ERRORS
            expect(isKnownErrorMessage("Database query failed")).toBeTruthy(); // DATABASE_ERRORS
            expect(isKnownErrorMessage("Operation failed")).toBeTruthy(); // IPC_ERRORS
        });

        it("should handle special characters in error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Test messages that contain special characters
            expect(
                isKnownErrorMessage("SSL/TLS connection failed")
            ).toBeTruthy();
            expect(
                isKnownErrorMessage("Port number must be between 1 and 65535")
            ).toBeTruthy();
        });

        it("should return false for non-string inputs by type safety", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isKnownErrorMessage(123)).toBeFalsy();
            expect(isKnownErrorMessage(true)).toBeFalsy();
            expect(isKnownErrorMessage({})).toBeFalsy();
            expect(isKnownErrorMessage([])).toBeFalsy();
            expect(isKnownErrorMessage(null)).toBeFalsy();
            expect(isKnownErrorMessage(undefined)).toBeFalsy();
        });
    });

    describe("integration tests", () => {
        it("should work together for error handling scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle error cataloging workflow", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Test common error catalog patterns
            const commonErrors = [
                "Network request failed",
                "Database query timeout",
                "Authentication failed",
                "Resource not available",
                "Configuration error",
            ];

            for (const error of commonErrors) {
                const isKnown = isKnownErrorMessage(error);
                expect(typeof isKnown).toBe("boolean");

                // Test formatting with additional context
                const contextualError = formatErrorMessage(
                    "{originalError} - Context: {context}",
                    { originalError: error, context: "integration test" }
                );
                expect(contextualError).toContain(error);
                expect(contextualError).toContain("integration test");
            }
        });

        it("should handle complex error scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: errorCatalog", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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
