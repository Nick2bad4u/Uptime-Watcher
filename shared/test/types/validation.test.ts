/**
 * Tests for shared validation types and functions Achieves 100% coverage for
 * shared/types/validation.ts
 */

import { describe, it, expect } from "vitest";

import {
    type BaseValidationResult,
    type FormValidationResult,
    type MonitorConfigValidationResult,
    type ThemeValidationResult,
    type ValidationMetadata,
    type ValidationResult,
    createFailureResult,
    createSuccessResult,
    isValidationResult,
} from "../../types/validation";

describe("Validation Types and Functions", () => {
    describe("createFailureResult", () => {
        it("should create a failure result with errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const errors = ["Error 1", "Error 2"];
            const result = createFailureResult(errors);

            expect(result).toEqual({
                errors,
                metadata: {},
                success: false,
                warnings: [],
            });
        });

        it("should create a failure result with errors and metadata", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const errors = ["Validation failed"];
            const metadata: ValidationMetadata = {
                fieldName: "email",
                validatedDataSize: 100,
                customField: "custom value",
            };

            const result = createFailureResult(errors, metadata);

            expect(result).toEqual({
                errors,
                metadata,
                success: false,
                warnings: [],
            });
        });

        it("should handle empty errors array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            const result = createFailureResult([]);

            expect(result).toEqual({
                errors: [],
                metadata: {},
                success: false,
                warnings: [],
            });
        });
    });

    describe("createSuccessResult", () => {
        it("should create a success result without data or warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const result = createSuccessResult();

            expect(result).toEqual({
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
            });
        });

        it("should create a success result with data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const data = { id: 1, name: "Test" };
            const result = createSuccessResult(data);

            expect(result).toEqual({
                data,
                errors: [],
                metadata: {},
                success: true,
            });
        });

        it("should create a success result with warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const warnings = ["Warning 1", "Warning 2"];
            const result = createSuccessResult(undefined, warnings);

            expect(result).toEqual({
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings,
            });
        });

        it("should create a success result with data and warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const data = { processed: true };
            const warnings = ["Deprecated field used"];
            const result = createSuccessResult(data, warnings);

            expect(result).toEqual({
                data,
                errors: [],
                metadata: {},
                success: true,
                warnings,
            });
        });

        it("should handle various data types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Test with string
            const stringResult = createSuccessResult("test string");
            expect(stringResult.data).toBe("test string");

            // Test with number
            const numberResult = createSuccessResult(42);
            expect(numberResult.data).toBe(42);

            // Test with array
            const arrayResult = createSuccessResult([
                1,
                2,
                3,
            ]);
            expect(arrayResult.data).toEqual([
                1,
                2,
                3,
            ]);

            // Test with boolean
            const booleanResult = createSuccessResult(true);
            expect(booleanResult.data).toBe(true);

            // Test with null
            const nullResult = createSuccessResult(null);
            expect(nullResult.data).toBeNull();
        });
    });

    describe("isValidationResult", () => {
        it("should return true for valid BaseValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult: BaseValidationResult = {
                errors: [],
                success: true,
            };

            expect(isValidationResult(validResult)).toBe(true);
        });

        it("should return true for BaseValidationResult with warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult: BaseValidationResult = {
                errors: ["Some error"],
                success: false,
                warnings: ["Some warning"],
            };

            expect(isValidationResult(validResult)).toBe(true);
        });

        it("should return true for FormValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult: FormValidationResult = {
                errors: [],
                success: true,
                fieldErrors: {
                    email: ["Invalid email format"],
                    password: ["Password too short"],
                },
            };

            expect(isValidationResult(validResult)).toBe(true);
        });

        it("should return true for MonitorConfigValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult: MonitorConfigValidationResult = {
                errors: [],
                success: true,
                configErrors: ["Config invalid"],
                monitorTypeErrors: {
                    http: ["Invalid URL"],
                },
            };

            expect(isValidationResult(validResult)).toBe(true);
        });

        it("should return true for ThemeValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult: ThemeValidationResult = {
                errors: [],
                success: true,
                missingProperties: ["primaryColor"],
                themeErrors: ["Invalid color format"],
            };

            expect(isValidationResult(validResult)).toBe(true);
        });

        it("should return true for ValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult: ValidationResult = {
                errors: [],
                success: true,
                data: { test: "data" },
                metadata: {
                    fieldName: "testField",
                    monitorCount: 5,
                },
            };

            expect(isValidationResult(validResult)).toBe(true);
        });

        it("should return false for null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult(null)).toBe(false);
        });

        it("should return false for undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult(undefined)).toBe(false);
        });

        it("should return false for non-object types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult("string")).toBe(false);
            expect(isValidationResult(123)).toBe(false);
            expect(isValidationResult(true)).toBe(false);
            expect(isValidationResult([])).toBe(false);
        });

        it("should return false for object missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidationResult({})).toBe(false);
            expect(isValidationResult({ errors: [] })).toBe(false);
            expect(isValidationResult({ success: true })).toBe(false);
        });

        it("should return false for object with invalid property types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                isValidationResult({
                    errors: "not an array",
                    success: true,
                })
            ).toBe(false);

            expect(
                isValidationResult({
                    errors: [],
                    success: "not a boolean",
                })
            ).toBe(false);

            expect(
                isValidationResult({
                    errors: null,
                    success: true,
                })
            ).toBe(false);
        });

        it("should return true for object with extra properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const objectWithExtra = {
                errors: [],
                success: true,
                extraProperty: "extra value",
                anotherExtra: 42,
            };

            expect(isValidationResult(objectWithExtra)).toBe(true);
        });
    });

    describe("Type Interface Completeness", () => {
        it("should allow creation of BaseValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const baseResult: BaseValidationResult = {
                errors: ["Error message"],
                success: false,
                warnings: ["Warning message"],
            };

            expect(baseResult.errors).toEqual(["Error message"]);
            expect(baseResult.success).toBe(false);
            expect(baseResult.warnings).toEqual(["Warning message"]);
        });

        it("should allow creation of FormValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const formResult: FormValidationResult = {
                errors: [],
                success: true,
                fieldErrors: {
                    username: ["Username required"],
                    email: ["Invalid email", "Email already exists"],
                },
            };

            expect(formResult.fieldErrors?.["username"]).toEqual([
                "Username required",
            ]);
            expect(formResult.fieldErrors?.["email"]).toEqual([
                "Invalid email",
                "Email already exists",
            ]);
        });

        it("should allow creation of MonitorConfigValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const monitorResult: MonitorConfigValidationResult = {
                errors: ["Config error"],
                success: false,
                configErrors: ["Invalid timeout"],
                monitorTypeErrors: {
                    ping: ["Invalid host"],
                    http: ["Invalid URL", "Invalid method"],
                },
            };

            expect(monitorResult.configErrors).toEqual(["Invalid timeout"]);
            expect(monitorResult.monitorTypeErrors?.["ping"]).toEqual([
                "Invalid host",
            ]);
            expect(monitorResult.monitorTypeErrors?.["http"]).toEqual([
                "Invalid URL",
                "Invalid method",
            ]);
        });

        it("should allow creation of ThemeValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const themeResult: ThemeValidationResult = {
                errors: [],
                success: true,
                missingProperties: ["backgroundColor", "textColor"],
                themeErrors: ["Invalid hex color"],
            };

            expect(themeResult.missingProperties).toEqual([
                "backgroundColor",
                "textColor",
            ]);
            expect(themeResult.themeErrors).toEqual(["Invalid hex color"]);
        });

        it("should allow creation of ValidationMetadata", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const metadata: ValidationMetadata = {
                fieldName: "siteUrl",
                monitorCount: 3,
                monitorType: "http",
                siteIdentifier: "site-123",
                validatedDataSize: 256,
                customProperty: "custom value",
                nestedObject: {
                    key: "value",
                },
            };

            expect(metadata.fieldName).toBe("siteUrl");
            expect(metadata.monitorCount).toBe(3);
            expect(metadata.monitorType).toBe("http");
            expect(metadata.siteIdentifier).toBe("site-123");
            expect(metadata.validatedDataSize).toBe(256);
            expect(metadata["customProperty"]).toBe("custom value");
            expect(metadata["nestedObject"]).toEqual({ key: "value" });
        });

        it("should allow creation of ValidationResult", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validationResult: ValidationResult = {
                errors: [],
                success: true,
                data: {
                    processedSites: 5,
                    validatedMonitors: ["http", "ping"],
                },
                metadata: {
                    fieldName: "sites",
                    monitorCount: 2,
                    processingTime: 150,
                },
            };

            expect(validationResult.data).toEqual({
                processedSites: 5,
                validatedMonitors: ["http", "ping"],
            });
            expect(validationResult.metadata?.fieldName).toBe("sites");
            expect(validationResult.metadata?.monitorCount).toBe(2);
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty arrays and undefined optional properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const result = createSuccessResult();
            expect(result.warnings).toBeUndefined();

            const failureResult = createFailureResult([]);
            expect(failureResult.warnings).toEqual([]);
        });

        it("should handle complex nested data in success result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const complexData = {
                sites: [
                    { id: 1, name: "Site 1", monitors: [{ type: "http" }] },
                    { id: 2, name: "Site 2", monitors: [{ type: "ping" }] },
                ],
                settings: {
                    theme: "dark",
                    notifications: true,
                },
            };

            const result = createSuccessResult(complexData);
            expect(result.data).toEqual(complexData);
            expect(result.success).toBe(true);
        });

        it("should validate results created by helper functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const successResult = createSuccessResult({ test: true });
            expect(isValidationResult(successResult)).toBe(true);

            const failureResult = createFailureResult(["Error"]);
            expect(isValidationResult(failureResult)).toBe(true);
        });
    });
});
