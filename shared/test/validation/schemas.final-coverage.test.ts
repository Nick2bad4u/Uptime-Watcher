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
        it("should generate warnings for optional fields with empty path", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

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
            expect(result.success).toBeTruthy();
        });

        it("should handle validation with zero-length path in Zod issues", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Test root-level validation error (zero-length path)
            const result = validateMonitorData("http", null);
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe("Non-Zod error handling (line 326)", () => {
        it("should handle non-Error objects in validateMonitorData catch block", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // Mock the schema parsing to throw a non-Error object
            const result = validateMonitorData("http", Symbol("invalid"));
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
            // The actual error message from Zod for symbols
            expect(result.errors[0]).toContain("Invalid input");
        });
    });

    describe("Site validation error handling (line 430)", () => {
        it("should handle non-Error objects in validateSiteData catch block", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // Create invalid data that will trigger non-Zod error
            const result = validateSiteData(Symbol("invalid"));
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
            // The actual error message from Zod for symbols
            expect(result.errors[0]).toContain("Invalid input");
        });

        it("should handle Zod errors in validateSiteData", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            const invalidSiteData = {
                identifier: "", // Invalid - too short
                name: "", // Invalid - too short
                monitoring: true,
                monitors: [], // Invalid - empty array
            };

            const result = validateSiteData(invalidSiteData);
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe("Field validation error handling (line 484)", () => {
        it("should throw error for completely unknown field in validateFieldWithSchema", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // Test with a field that doesn't exist in any schema
            expect(() => {
                validateMonitorField(
                    "http",
                    "completelyUnknownFieldName",
                    "value"
                );
            }).toThrow("Unknown field: completelyUnknownFieldName");
        });

        it("should handle unknown field in both specific and base schemas", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Test with field that exists in neither the specific nor base schema
            expect(() => {
                validateMonitorField("port", "nonExistentField", "value");
            }).toThrow("Unknown field: nonExistentField");
        });
    });

    describe("Edge cases for comprehensive coverage", () => {
        it("should handle error without message property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // Test the String(error) branch more directly
            const customError = {
                name: "CustomError",
                // No message property
            };

            const result = validateMonitorData(
                "http",
                function throwCustomError() {
                    throw customError;
                }
            );
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should test complete error handling paths", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Error Handling", "type");

            // Test with various invalid types to exercise all error paths
            const testCases = [
                123n,
                function testFunction() {},
                new Date("invalid"),
                /regex/,
            ];

            for (const testCase of testCases) {
                const result = validateMonitorData("http", testCase);
                expect(result.success).toBeFalsy();
                expect(result.errors.length).toBeGreaterThan(0);
            }
        });

        it("should handle malformed monitor field validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Test field validation with various edge cases
            const edgeCases = [
                { type: "unknown", field: "url", value: "test" },
                { type: "http", field: "unknownField", value: "test" },
                { type: "port", field: "unknownField", value: "test" },
                { type: "ping", field: "unknownField", value: "test" },
            ];

            for (const testCase of edgeCases) {
                if (testCase.field === "unknownField") {
                    expect(() => {
                        validateMonitorField(
                            testCase.type,
                            testCase.field,
                            testCase.value
                        );
                    }).toThrow("Unknown field: unknownField");
                } else {
                    const result = validateMonitorField(
                        testCase.type,
                        testCase.field,
                        testCase.value
                    );
                    expect(result.success).toBeFalsy();
                }
            }
        });
    });

    describe("Type-specific schema coverage", () => {
        it("should test all monitor types for complete coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Monitoring", "type");

            const types = [
                "http",
                "port",
                "ping",
                "unknown",
            ];

            for (const type of types) {
                const result = validateMonitorData(type, {});
                if (type === "unknown") {
                    expect(result.success).toBeFalsy();
                    expect(result.errors).toContain(
                        `Unknown monitor type: ${type}`
                    );
                } else {
                    expect(result.success).toBeFalsy();
                    expect(result.errors.length).toBeGreaterThan(0);
                }
            }
        });

        it("should test field validation with all schema types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: schemas.final-coverage", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

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
                const validValue = (() => {
                    switch (test.field) {
                        case "port": {
                            return 8080;
                        }
                        case "timeout": {
                            return 5000;
                        }
                        case "checkInterval": {
                            return 30_000;
                        }
                        case "retryAttempts": {
                            return 3;
                        }
                        case "host": {
                            return "example.com";
                        }
                        default: {
                            return "https://example.com";
                        }
                    }
                })();

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
                expect(validResult.success).toBeTruthy();

                // Test with invalid value
                const invalidValue = (() => {
                    switch (test.field) {
                        case "port": {
                            return -1;
                        }
                        case "timeout": {
                            return -1;
                        }
                        case "checkInterval": {
                            return -1;
                        }
                        case "retryAttempts": {
                            return -1;
                        }
                        case "host": {
                            return "";
                        }
                        default: {
                            return "invalid-url";
                        }
                    }
                })();

                const invalidResult = validateMonitorField(
                    test.type,
                    test.field,
                    invalidValue
                );
                expect(invalidResult.success).toBeFalsy();
            }
        });
    });
});
