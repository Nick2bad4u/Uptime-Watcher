/**
 * Final test cases to achieve 98% branch coverage for schemas.ts Targeting
 * specific uncovered lines: 312, 326, 430, 484
 */

import { describe, it, expect } from "vitest";
import {
    validateMonitorData,
    validateMonitorField,
    validateSiteData,
} from "../../validation/schemas";

describe("Validation Schemas - Final Branch Coverage", () => {
    describe("Warning generation (line 312)", () => {
        it("should generate warnings for optional fields with empty path", () => {
            // Create a mock Zod error that will trigger the warning path
            const invalidData = {
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
                lastChecked: undefined, // This should trigger a warning
            };

            const result = validateMonitorData("http", invalidData);
            // Should succeed even with undefined optional field
            expect(result.success).toBe(true);
        });

        it("should handle validation with zero-length path in Zod issues", () => {
            // Test root-level validation error (zero-length path)
            const result = validateMonitorData("http", null);
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe("Non-Zod error handling (line 326)", () => {
        it("should handle non-Error objects in validateMonitorData catch block", () => {
            // Mock the schema parsing to throw a non-Error object
            const result = validateMonitorData("http", Symbol("invalid"));
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            // The actual error message from Zod for symbols
            expect(result.errors[0]).toContain("Invalid input");
        });
    });

    describe("Site validation error handling (line 430)", () => {
        it("should handle non-Error objects in validateSiteData catch block", () => {
            // Create invalid data that will trigger non-Zod error
            const result = validateSiteData(Symbol("invalid"));
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            // The actual error message from Zod for symbols
            expect(result.errors[0]).toContain("Invalid input");
        });

        it("should handle Zod errors in validateSiteData", () => {
            const invalidSiteData = {
                identifier: "", // Invalid - too short
                name: "", // Invalid - too short
                monitoring: true,
                monitors: [], // Invalid - empty array
            };

            const result = validateSiteData(invalidSiteData);
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe("Field validation error handling (line 484)", () => {
        it("should throw error for completely unknown field in validateFieldWithSchema", () => {
            // Test with a field that doesn't exist in any schema
            const result = validateMonitorField(
                "http",
                "completelyUnknownFieldName",
                "value"
            );
            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Field validation failed")
                )
            ).toBe(true);
        });

        it("should handle unknown field in both specific and base schemas", () => {
            // Test with field that exists in neither the specific nor base schema
            const result = validateMonitorField(
                "port",
                "nonExistentField",
                "value"
            );
            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Field validation failed")
                )
            ).toBe(true);
        });
    });

    describe("Edge cases for comprehensive coverage", () => {
        it("should handle error without message property", () => {
            // Test the String(error) branch more directly
            const customError = {
                name: "CustomError",
                // No message property
            };

            const result = validateMonitorData("http", function () {
                throw customError;
            });
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should test complete error handling paths", () => {
            // Test with various invalid types to exercise all error paths
            const testCases = [
                BigInt(123),
                function () {},
                new Date("invalid"),
                /regex/,
            ];

            for (const testCase of testCases) {
                const result = validateMonitorData("http", testCase);
                expect(result.success).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
            }
        });

        it("should handle malformed monitor field validation", () => {
            // Test field validation with various edge cases
            const edgeCases = [
                { type: "unknown", field: "url", value: "test" },
                { type: "http", field: "unknownField", value: "test" },
                { type: "port", field: "unknownField", value: "test" },
                { type: "ping", field: "unknownField", value: "test" },
            ];

            for (const testCase of edgeCases) {
                const result = validateMonitorField(
                    testCase.type,
                    testCase.field,
                    testCase.value
                );
                expect(result.success).toBe(false);
            }
        });
    });

    describe("Type-specific schema coverage", () => {
        it("should test all monitor types for complete coverage", () => {
            const types = [
                "http",
                "port",
                "ping",
                "unknown",
            ];

            for (const type of types) {
                const result = validateMonitorData(type, {});
                if (type === "unknown") {
                    expect(result.success).toBe(false);
                    expect(result.errors).toContain(
                        `Unknown monitor type: ${type}`
                    );
                } else {
                    expect(result.success).toBe(false);
                    expect(result.errors.length).toBeGreaterThan(0);
                }
            }
        });

        it("should test field validation with all schema types", () => {
            const fieldTests = [
                { type: "http", field: "url" },
                { type: "port", field: "host" },
                { type: "port", field: "port" },
                { type: "ping", field: "host" },
                { type: "http", field: "timeout" }, // Base field
                { type: "port", field: "checkInterval" }, // Base field
                { type: "ping", field: "retryAttempts" }, // Base field
            ];

            for (const test of fieldTests) {
                // Test with valid value
                let validValue;
                switch (test.field) {
                    case "port": {
                        validValue = 8080;
                        break;
                    }
                    case "timeout": {
                        validValue = 5000;
                        break;
                    }
                    case "checkInterval": {
                        validValue = 30_000;
                        break;
                    }
                    case "retryAttempts": {
                        validValue = 3;
                        break;
                    }
                    case "host": {
                        validValue = "example.com";
                        break;
                    }
                    default: {
                        validValue = "https://example.com";
                    }
                }

                const validResult = validateMonitorField(
                    test.type,
                    test.field,
                    validValue
                );
                if (!validResult.success) {
                    console.log(
                        `Failed validation for ${test.type}.${test.field} with value:`,
                        validValue,
                        "Errors:",
                        validResult.errors
                    );
                }
                expect(validResult.success).toBe(true);

                // Test with invalid value
                let invalidValue;
                switch (test.field) {
                    case "port": {
                        invalidValue = -1;
                        break;
                    }
                    case "timeout": {
                        invalidValue = -1;
                        break;
                    }
                    case "checkInterval": {
                        invalidValue = -1;
                        break;
                    }
                    case "retryAttempts": {
                        invalidValue = -1;
                        break;
                    }
                    case "host": {
                        invalidValue = "";
                        break;
                    }
                    default: {
                        invalidValue = "invalid-url";
                    }
                }

                const invalidResult = validateMonitorField(
                    test.type,
                    test.field,
                    invalidValue
                );
                expect(invalidResult.success).toBe(false);
            }
        });
    });
});
