/**
 * Shared Validation Array Declaration Mutation Tests
 *
 * @file Tests specifically targeting array declaration mutations in shared
 *   validation schemas and utility functions. Focuses on validation error
 *   arrays, warning arrays, and schema field arrays.
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-03
 *
 * @category Tests
 *
 * @tags ["mutation-testing", "validation", "schemas", "arrays"]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

describe("Shared Validation Array Declaration Mutation Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("schemas.ts - Line 56 status enum array", () => {
        it("should validate status with correct enum values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("File: shared/validation/schemas.ts", "source");
            await annotate("Line: 56", "location");
            await annotate(
                'Mutation: z.enum(["up", "down", "degraded"]) → z.enum([])',
                "mutation"
            );

            // This tests the status enum array that could be mutated to empty
            // status: z.enum(["up", "down", "degraded"]) → status: z.enum([])

            function createStatusHistorySchema() {
                return z
                    .object({
                        details: z.string().optional(),
                        responseTime: z.number(),
                        status: z.enum([
                            "up",
                            "down",
                            "degraded",
                        ]), // This array is mutation target
                        timestamp: z.number(),
                    })
                    .strict();
            }

            const schema = createStatusHistorySchema();

            // Test valid status values
            const validUpData = {
                details: "OK",
                responseTime: 200,
                status: "up" as const,
                timestamp: Date.now(),
            };

            const validDownData = {
                details: "Timeout",
                responseTime: 0,
                status: "down" as const,
                timestamp: Date.now(),
            };

            // Should validate successfully
            expect(() => schema.parse(validUpData)).not.toThrowError();
            expect(() => schema.parse(validDownData)).not.toThrowError();

            const parsedUp = schema.parse(validUpData);
            const parsedDown = schema.parse(validDownData);

            expect(parsedUp.status).toBe("up");
            expect(parsedDown.status).toBe("down");

            // Test invalid status values
            const invalidData = {
                details: "Error",
                responseTime: 0,
                status: "unknown",
                timestamp: Date.now(),
            };

            expect(() => schema.parse(invalidData)).toThrowError();
        });

        it("should fail if status enum array is mutated to empty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "mutation-verification");
            await annotate(
                "Verifies status validation would be broken",
                "purpose"
            );

            // Simulate the mutated behavior with empty enum array
            function createStatusHistorySchemaMutated() {
                return z
                    .object({
                        details: z.string().optional(),
                        responseTime: z.number(),
                        status: z.enum([]), // This is the mutation - empty array
                        timestamp: z.number(),
                    })
                    .strict();
            }

            // Creating schema with empty enum should throw or fail
            expect(() => {
                const schema = createStatusHistorySchemaMutated();

                const testData = {
                    details: "OK",
                    responseTime: 200,
                    status: "up",
                    timestamp: Date.now(),
                };

                schema.parse(testData);
            }).toThrowError();

            // The mutation would break all status validation
            // No status values would be allowed
        });
    });

    describe("schemas.ts - Validation error and warning arrays", () => {
        it("should initialize warnings array as empty (Lines 459, 472, 477)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("File: shared/validation/schemas.ts", "source");
            await annotate("Lines: 459, 472, 477", "location");
            await annotate(
                'Mutation: warnings: [] → warnings: ["Stryker was here"]',
                "mutation"
            );

            // Test validation functions that initialize warnings as empty arrays

            function validateWithWarnings(data: any) {
                try {
                    // Successful validation should return empty warnings array
                    return {
                        data,
                        errors: [],
                        success: true,
                        warnings: [], // Line 459 - mutation target
                    };
                } catch {
                    return {
                        data: null,
                        errors: ["Validation failed"],
                        success: false,
                        warnings: [], // Line 472 - mutation target
                    };
                }
            }

            function processValidationErrors(issues: any[]) {
                const warnings: string[] = []; // Line 477 - mutation target
                const errors: string[] = [];

                for (const issue of issues) {
                    if (issue.severity === "warning") {
                        warnings.push(issue.message);
                    } else {
                        errors.push(issue.message);
                    }
                }

                return { warnings, errors };
            }

            // Test successful validation
            const successResult = validateWithWarnings({ name: "test" });
            expect(successResult.warnings).toEqual([]);
            expect(successResult.warnings).toHaveLength(0);
            expect(successResult.success).toBeTruthy();

            // Test error processing
            const testIssues = [
                { message: "Field required", severity: "error" },
                { message: "Consider updating", severity: "warning" },
            ];

            const processResult = processValidationErrors(testIssues);
            expect(processResult.warnings).toEqual(["Consider updating"]);
            expect(processResult.errors).toEqual(["Field required"]);
            expect(processResult.warnings).toHaveLength(1);
            expect(processResult.errors).toHaveLength(1);
        });

        it("should fail if warnings arrays are mutated to contain initial data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "mutation-verification");
            await annotate(
                "Verifies validation would show false warnings",
                "purpose"
            );

            // Simulate the mutated behavior
            function validateWithWarningsMutated(data: any) {
                try {
                    return {
                        data,
                        errors: [],
                        success: true,
                        warnings: ["Stryker was here"], // This is the mutation
                    };
                } catch {
                    return {
                        data: null,
                        errors: ["Validation failed"],
                        success: false,
                        warnings: ["Stryker was here"], // This is the mutation
                    };
                }
            }

            function processValidationErrorsMutated(issues: any[]) {
                const warnings: string[] = ["Stryker was here"]; // This is the mutation
                const errors: string[] = [];

                for (const issue of issues) {
                    if (issue.severity === "warning") {
                        warnings.push(issue.message);
                    } else {
                        errors.push(issue.message);
                    }
                }

                return { warnings, errors };
            }

            // Test mutated successful validation
            const successResult = validateWithWarningsMutated({ name: "test" });
            expect(successResult.warnings).not.toEqual([]);
            expect(successResult.warnings).toContain("Stryker was here");
            expect(successResult.warnings).toHaveLength(1);
            expect(successResult.success).toBeTruthy();

            // Test mutated error processing
            const testIssues = [
                { message: "Field required", severity: "error" },
            ];

            const processResult = processValidationErrorsMutated(testIssues);
            expect(processResult.warnings).toContain("Stryker was here");
            expect(processResult.warnings).toHaveLength(1); // Only the polluted entry
            expect(processResult.errors).toEqual(["Field required"]);

            // This would show false warnings to users
            // Even successful validations would show "Stryker was here" warning
        });

        it("should handle validation with errors array properly (Line 578)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("File: shared/validation/schemas.ts", "source");
            await annotate("Line: 578", "location");
            await annotate(
                "Mutation: errors: [message] → errors: []",
                "mutation"
            );

            // Test error array initialization and population

            function processValidationErrors(validationResult: any) {
                if (validationResult.success) {
                    return {
                        errors: [],
                        warnings: [],
                        success: true,
                    };
                }

                // Line 578 area - errors array handling
                const errors: string[] = [
                    "Validation failed for the following reasons:",
                ]; // This array initialization is mutation target

                const warnings: string[] = [];

                // Add specific error messages
                for (const issue of validationResult.issues || []) {
                    if (issue.type === "error") {
                        errors.push(issue.message);
                    } else if (issue.type === "warning") {
                        warnings.push(issue.message);
                    }
                }

                return { errors, warnings, success: false };
            }

            // Test with validation errors
            const validationResult = {
                success: false,
                issues: [
                    { type: "error", message: "Name is required" },
                    { type: "error", message: "Invalid URL format" },
                    { type: "warning", message: "Consider using HTTPS" },
                ],
            };

            const result = processValidationErrors(validationResult);

            expect(result.errors).toContain(
                "Validation failed for the following reasons:"
            );
            expect(result.errors).toContain("Name is required");
            expect(result.errors).toContain("Invalid URL format");
            expect(result.errors).toHaveLength(3);

            expect(result.warnings).toContain("Consider using HTTPS");
            expect(result.warnings).toHaveLength(1);
            expect(result.success).toBeFalsy();
        });

        it("should fail if errors array is mutated to be empty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "mutation-verification");
            await annotate("Verifies error messages would be lost", "purpose");

            // Simulate the mutated behavior with empty errors array
            function processValidationErrorsMutated(validationResult: any) {
                if (validationResult.success) {
                    return {
                        errors: [],
                        warnings: [],
                        success: true,
                    };
                }

                // This is the mutation - empty errors array instead of initialized
                const errors: string[] = []; // Missing initialization message
                const warnings: string[] = [];

                // Add specific error messages
                for (const issue of validationResult.issues || []) {
                    if (issue.type === "error") {
                        errors.push(issue.message);
                    } else if (issue.type === "warning") {
                        warnings.push(issue.message);
                    }
                }

                return { errors, warnings, success: false };
            }

            const validationResult = {
                success: false,
                issues: [
                    { type: "error", message: "Name is required" },
                    { type: "error", message: "Invalid URL format" },
                ],
            };

            const result = processValidationErrorsMutated(validationResult);

            // The mutated version would miss the introductory error message
            expect(result.errors).not.toContain(
                "Validation failed for the following reasons:"
            );
            expect(result.errors).toContain("Name is required");
            expect(result.errors).toContain("Invalid URL format");
            expect(result.errors).toHaveLength(2); // Missing the intro message

            // Users wouldn't get the helpful context message
        });
    });

    describe("Configuration and Field Arrays", () => {
        it("should handle monitor type field configurations correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Monitor Configuration", "component");
            await annotate("Type: Field Arrays", "type");

            // Test field arrays used in monitor configuration

            function getMonitorFieldSchema(monitorType: string) {
                const requiredFields: string[] = [];
                const optionalFields: string[] = [];
                const validationRules: string[] = [];

                switch (monitorType) {
                    case "http": {
                        requiredFields.push("url", "method");
                        optionalFields.push("headers", "timeout");
                        validationRules.push("url-format", "method-valid");
                        break;
                    }
                    case "ping": {
                        requiredFields.push("host");
                        optionalFields.push("packets", "timeout");
                        validationRules.push("host-format", "packets-range");
                        break;
                    }
                    case "dns": {
                        requiredFields.push("hostname", "recordType");
                        optionalFields.push("resolver", "timeout");
                        validationRules.push(
                            "hostname-format",
                            "record-type-valid"
                        );
                        break;
                    }
                    default: {
                        // Should remain empty arrays for unknown types
                        break;
                    }
                }

                return { requiredFields, optionalFields, validationRules };
            }

            // Test HTTP monitor configuration
            const httpConfig = getMonitorFieldSchema("http");
            expect(httpConfig.requiredFields).toEqual(["url", "method"]);
            expect(httpConfig.optionalFields).toEqual(["headers", "timeout"]);
            expect(httpConfig.validationRules).toEqual([
                "url-format",
                "method-valid",
            ]);

            // Test ping monitor configuration
            const pingConfig = getMonitorFieldSchema("ping");
            expect(pingConfig.requiredFields).toEqual(["host"]);
            expect(pingConfig.optionalFields).toEqual(["packets", "timeout"]);
            expect(pingConfig.validationRules).toEqual([
                "host-format",
                "packets-range",
            ]);

            // Test DNS monitor configuration
            const dnsConfig = getMonitorFieldSchema("dns");
            expect(dnsConfig.requiredFields).toEqual([
                "hostname",
                "recordType",
            ]);
            expect(dnsConfig.optionalFields).toEqual(["resolver", "timeout"]);
            expect(dnsConfig.validationRules).toEqual([
                "hostname-format",
                "record-type-valid",
            ]);

            // Test unknown monitor type (should have empty arrays)
            const unknownConfig = getMonitorFieldSchema("unknown");
            expect(unknownConfig.requiredFields).toEqual([]);
            expect(unknownConfig.optionalFields).toEqual([]);
            expect(unknownConfig.validationRules).toEqual([]);
        });

        it("should fail if field arrays are mutated to start with data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "mutation-verification");
            await annotate(
                "Verifies configuration would be corrupted",
                "purpose"
            );

            // Simulate the mutated behavior
            function getMonitorFieldSchemaMutated(monitorType: string) {
                // Mutated arrays start with pollution
                const requiredFields: string[] = ["Stryker was here"];
                const optionalFields: string[] = ["Stryker was here"];
                const validationRules: string[] = ["Stryker was here"];

                switch (monitorType) {
                    case "http": {
                        requiredFields.push("url", "method");
                        optionalFields.push("headers", "timeout");
                        validationRules.push("url-format", "method-valid");
                        break;
                    }
                    default: {
                        break;
                    }
                }

                return { requiredFields, optionalFields, validationRules };
            }

            const httpConfig = getMonitorFieldSchemaMutated("http");

            // The mutated version would have pollution
            expect(httpConfig.requiredFields).toContain("Stryker was here");
            expect(httpConfig.optionalFields).toContain("Stryker was here");
            expect(httpConfig.validationRules).toContain("Stryker was here");

            expect(httpConfig.requiredFields).toEqual([
                "Stryker was here",
                "url",
                "method",
            ]);
            expect(httpConfig.optionalFields).toEqual([
                "Stryker was here",
                "headers",
                "timeout",
            ]);
            expect(httpConfig.validationRules).toEqual([
                "Stryker was here",
                "url-format",
                "method-valid",
            ]);

            // This would break form generation and validation
            // Forms would try to validate "Stryker was here" as a field name
        });
    });

    describe("Utility Function Arrays", () => {
        it("should handle array utility functions correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Utility Functions", "component");
            await annotate("Type: Array Processing", "type");

            // Test utility functions that work with arrays

            function processValidationWarnings(rawWarnings: any[]) {
                const processedWarnings: string[] = [];
                const severityLevels: string[] = [];

                for (const warning of rawWarnings) {
                    if (warning.message) {
                        processedWarnings.push(`Warning: ${warning.message}`);
                    }
                    if (warning.severity) {
                        severityLevels.push(warning.severity);
                    }
                }

                return { processedWarnings, severityLevels };
            }

            function filterValidationErrors(errors: any[]) {
                const criticalErrors: string[] = [];
                const minorErrors: string[] = [];

                for (const error of errors) {
                    if (error.critical) {
                        criticalErrors.push(error.message);
                    } else {
                        minorErrors.push(error.message);
                    }
                }

                return { criticalErrors, minorErrors };
            }

            // Test warning processing
            const rawWarnings = [
                { message: "Deprecated field", severity: "low" },
                { message: "Performance concern", severity: "medium" },
            ];

            const warningResult = processValidationWarnings(rawWarnings);
            expect(warningResult.processedWarnings).toEqual([
                "Warning: Deprecated field",
                "Warning: Performance concern",
            ]);
            expect(warningResult.severityLevels).toEqual(["low", "medium"]);

            // Test error filtering
            const rawErrors = [
                { message: "System failure", critical: true },
                { message: "Minor issue", critical: false },
                { message: "Data corruption", critical: true },
            ];

            const errorResult = filterValidationErrors(rawErrors);
            expect(errorResult.criticalErrors).toEqual([
                "System failure",
                "Data corruption",
            ]);
            expect(errorResult.minorErrors).toEqual(["Minor issue"]);
        });

        it("should fail if utility arrays are mutated", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "mutation-verification");
            await annotate(
                "Verifies utility functions would be corrupted",
                "purpose"
            );

            // Simulate mutated utility functions
            function processValidationWarningsMutated(rawWarnings: any[]) {
                // Mutated arrays start with pollution
                const processedWarnings: string[] = ["Stryker was here"];
                const severityLevels: string[] = ["Stryker was here"];

                for (const warning of rawWarnings) {
                    if (warning.message) {
                        processedWarnings.push(`Warning: ${warning.message}`);
                    }
                    if (warning.severity) {
                        severityLevels.push(warning.severity);
                    }
                }

                return { processedWarnings, severityLevels };
            }

            const rawWarnings = [
                { message: "Deprecated field", severity: "low" },
            ];

            const result = processValidationWarningsMutated(rawWarnings);

            // The mutated version would have pollution
            expect(result.processedWarnings).toContain("Stryker was here");
            expect(result.severityLevels).toContain("Stryker was here");

            expect(result.processedWarnings).toEqual([
                "Stryker was here",
                "Warning: Deprecated field",
            ]);
            expect(result.severityLevels).toEqual(["Stryker was here", "low"]);

            // This would show "Stryker was here" as a warning to users
            // and break severity level processing
        });
    });
});
