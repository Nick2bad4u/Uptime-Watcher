/**
 * Additional test cases for schemas.ts to reach 98% branch coverage This file
 * targets the remaining uncovered branches and edge cases
 */

import { describe, it, expect } from "vitest";
import {
    validateMonitorData,
    validateMonitorField,
    validateSiteData,
} from "../../validation/schemas";

describe("Validation Schemas - Branch Coverage Completion", () => {
    describe("Error handling edge cases", () => {
        it("should handle Zod errors with structured issue codes for warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // Create data that will generate specific Zod error types to test warning detection
            const dataWithUndefinedField = {
                id: "test",
                type: "http",
                url: "https://example.com",
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                responseTime: -1,
                history: [],
                lastChecked: undefined, // This should trigger warning logic
            };

            const result = validateMonitorData("http", dataWithUndefinedField);
            // Should succeed but exercise the warning detection branch
            expect(result.success).toBeTruthy();
        });

        it("should handle validation with empty path in Zod issues", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Test with root-level validation errors (empty path)
            const invalidData = null; // This will cause a root-level validation error

            const result = validateMonitorData("http", invalidData);
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should handle non-Error objects in catch blocks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // This tests the String(error) branch in the catch block
            const result = validateSiteData(Symbol("invalid")); // Symbol will cause a different type of error
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe("Field validation edge cases", () => {
        it("should test validateFieldWithSchema with specific schema shape checks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Test field that exists in specific monitor schema
            const result = validateMonitorField(
                "http",
                "url",
                "https://example.com"
            );
            expect(result.success).toBeTruthy();
        });

        it("should test validateFieldWithSchema with base schema fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Test field that exists in base schema but not specific schema
            const result = validateMonitorField(
                "http",
                "checkInterval",
                30_000
            );
            expect(result.success).toBeTruthy();
        });

        it("should test validateFieldWithSchema with unknown field error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // Test completely unknown field to trigger the error case
            expect(() => {
                validateMonitorField("http", "completelyUnknownField", "value");
            }).toThrow("Unknown field: completelyUnknownField");
        });

        it("should test field validation with invalid values to trigger Zod errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // Test invalid timeout to trigger field-specific Zod error
            const result = validateMonitorField("http", "timeout", 100); // Too low
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe("getMonitorSchema function coverage", () => {
        it("should test all monitor types to cover getMonitorSchema branches", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Data Retrieval", "type");

            // Test HTTP monitor
            const httpData = {
                id: "test",
                type: "http",
                url: "https://example.com",
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                responseTime: -1,
                history: [],
            };
            const httpResult = validateMonitorData("http", httpData);
            expect(httpResult.success).toBeTruthy();

            // Test port monitor
            const portData = {
                id: "test",
                type: "port",
                host: "example.com",
                port: 8080,
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                responseTime: -1,
                history: [],
            };
            const portResult = validateMonitorData("port", portData);
            expect(portResult.success).toBeTruthy();

            // Test ping monitor
            const pingData = {
                id: "test",
                type: "ping",
                host: "example.com",
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                responseTime: -1,
                history: [],
            };
            const pingResult = validateMonitorData("ping", pingData);
            expect(pingResult.success).toBeTruthy();

            // Test unknown monitor type
            const unknownResult = validateMonitorData("unknown", {});
            expect(unknownResult.success).toBeFalsy();
            expect(unknownResult.errors).toContain(
                "Unknown monitor type: unknown"
            );
        });
    });

    describe("Comprehensive validation result metadata", () => {
        it("should include comprehensive metadata in validation results", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const validData = {
                id: "test",
                type: "http",
                url: "https://example.com",
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                responseTime: -1,
                history: [],
            };

            const result = validateMonitorData("http", validData);
            expect(result.success).toBeTruthy();
            expect(result.metadata).toHaveProperty("monitorType", "http");
            expect(result.metadata).toHaveProperty("validatedDataSize");
            expect(typeof result.metadata!["validatedDataSize"]).toBe("number");
        });

        it("should include metadata for site validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const siteData = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "test-monitor",
                        type: "http",
                        url: "https://example.com",
                        checkInterval: 30_000,
                        timeout: 5000,
                        retryAttempts: 3,
                        monitoring: true,
                        status: "pending",
                        responseTime: -1,
                        history: [],
                    },
                ],
            };

            const result = validateSiteData(siteData);
            expect(result.success).toBeTruthy();
            expect(result.metadata).toHaveProperty("monitorCount", 1);
            expect(result.metadata).toHaveProperty(
                "siteIdentifier",
                "test-site"
            );
        });
    });

    describe("Complex Zod error scenarios", () => {
        it("should handle multiple validation issues with proper categorization", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const complexInvalidData = {
                id: "", // Invalid
                type: "http",
                url: "not-a-url", // Invalid
                checkInterval: 1000, // Too low - invalid
                timeout: 5000,
                retryAttempts: -1, // Invalid
                monitoring: true,
                status: "unknown-status", // Invalid
                responseTime: -2, // Invalid
                lastChecked: undefined, // Should be treated as warning if optional
            };

            const result = validateMonitorData("http", complexInvalidData);
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);

            // Just verify we have errors, not specific path format since Zod might format differently
            expect(result.errors.length).toBeGreaterThan(3);
        });

        it("should handle edge case of empty error path", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // Test validation that could generate empty path
            const result = validateMonitorData("http", "not-an-object");
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe("String conversion branches", () => {
        it("should handle error instanceof Error check in catch blocks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // Test both branches of the error instanceof Error check
            const result1 = validateSiteData(null);
            expect(result1.success).toBeFalsy();

            const result2 = validateMonitorField("unknown", "field", "value");
            expect(result2.success).toBeFalsy();
        });
    });

    describe("Validation result structure completeness", () => {
        it("should always return complete ValidationResult structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.branch-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const validResult = validateMonitorData("http", {
                id: "test",
                type: "http",
                url: "https://example.com",
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                responseTime: -1,
            });

            // Check all required properties exist
            expect(validResult).toHaveProperty("success");
            expect(validResult).toHaveProperty("errors");
            expect(validResult).toHaveProperty("warnings");
            expect(validResult).toHaveProperty("metadata");
            expect(Array.isArray(validResult.errors)).toBeTruthy();
            expect(Array.isArray(validResult.warnings)).toBeTruthy();
            expect(typeof validResult.metadata).toBe("object");

            const invalidResult = validateMonitorData("unknown", {});
            expect(invalidResult).toHaveProperty("success");
            expect(invalidResult).toHaveProperty("errors");
            expect(invalidResult).toHaveProperty("warnings");
            expect(invalidResult).toHaveProperty("metadata");
        });
    });
});
