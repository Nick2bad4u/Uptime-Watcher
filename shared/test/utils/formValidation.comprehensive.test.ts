/**
 * Comprehensive test suite for form validation utilities. Provides 100%
 * coverage for shared form validation functions.
 */

import { describe, expect, it } from "vitest";
import {
    isEmptyString,
    validateFormFields,
    validatePattern,
    validatePort,
    validateRequired,
    validateRequiredString,
    validateTimeout,
    validateUrl,
} from "../../utils/formValidation";

describe("Form Validation Utilities - Comprehensive Coverage", () => {
    describe(validateRequiredString, () => {
        it("should return valid for non-empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateRequiredString("test value");

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return invalid for null value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateRequiredString(null);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Field is required");
        });

        it("should return invalid for undefined value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateRequiredString(undefined);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Field is required");
        });

        it("should return invalid for empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateRequiredString("");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Field is required");
        });

        it("should return invalid for whitespace-only string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateRequiredString("   ");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Field is required");
        });

        it("should use custom field name in error message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateRequiredString("", "Site Name");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Site Name is required");
        });

        it("should return valid for string with only meaningful content", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateRequiredString("  valid content  ");

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });
    });

    describe(validateRequired, () => {
        it("should return valid for any non-null, non-undefined value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            expect(validateRequired("test").isValid).toBeTruthy();
            expect(validateRequired(0).isValid).toBeTruthy();
            expect(validateRequired(false).isValid).toBeTruthy();
            expect(validateRequired("").isValid).toBeTruthy();
            expect(validateRequired([]).isValid).toBeTruthy();
            expect(validateRequired({}).isValid).toBeTruthy();
        });

        it("should return invalid for null value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateRequired(null);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Field is required");
        });

        it("should return invalid for undefined value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateRequired(undefined);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Field is required");
        });

        it("should use custom field name in error message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateRequired(null, "Monitor Type");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Monitor Type is required");
        });
    });

    describe(validateUrl, () => {
        it("should return valid for proper HTTP URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateUrl("http://example.com");

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return valid for proper HTTPS URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateUrl("https://example.com/path");

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return invalid for empty URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateUrl("");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("URL is required");
        });

        it("should return invalid for whitespace-only URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateUrl("   ");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("URL is required");
        });

        it("should return invalid for malformed URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateUrl("not-a-url");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("URL must be a valid URL");
        });

        it("should use custom field name in error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateUrl("", "Endpoint URL");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Endpoint URL is required");
        });

        it("should use custom field name for invalid URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateUrl("invalid", "API Endpoint");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("API Endpoint must be a valid URL");
        });
    });

    describe(validatePort, () => {
        it("should return valid for valid port number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validatePort(80);

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return valid for valid port string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validatePort("443");

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return valid for maximum port number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            // eslint-disable-next-line unicorn/numeric-separators-style
            const result = validatePort(65535);

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return valid for minimum port number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validatePort(1);

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return invalid for empty port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validatePort("");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Port is required");
        });

        it("should return invalid for whitespace-only port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validatePort("   ");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Port is required");
        });

        it("should return invalid for non-numeric port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validatePort("abc");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Port must be a number");
        });

        it("should return invalid for port number too low", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validatePort(0);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Port must be between 1 and 65535");
        });

        it("should return invalid for port number too high", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            // eslint-disable-next-line unicorn/numeric-separators-style
            const result = validatePort(65536);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Port must be between 1 and 65535");
        });

        it("should use custom field name in error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validatePort("", "Server Port");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Server Port is required");
        });
    });

    describe(validateTimeout, () => {
        it("should return valid for valid timeout number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout(30);

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return valid for valid timeout string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout("15.5");

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return valid for minimum timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout(1);

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return valid for maximum timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout(300);

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return invalid for non-numeric timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout("abc");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Timeout must be a valid number");
        });

        it("should return invalid for timeout below minimum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout(0);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Timeout must be at least 1 second");
        });

        it("should return invalid for timeout above maximum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout(301);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe(
                "Timeout must be no more than 300 seconds"
            );
        });

        it("should handle custom min/max ranges", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout(10, "Custom Timeout", 5, 60);

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return error for custom min violation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout(2, "Custom Timeout", 5, 60);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe(
                "Custom Timeout must be at least 5 seconds"
            );
        });

        it("should return error for custom max violation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout(70, "Custom Timeout", 5, 60);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe(
                "Custom Timeout must be no more than 60 seconds"
            );
        });

        it("should handle singular second text for minimum 1", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout(0, "Test Timeout", 1, 60);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Test Timeout must be at least 1 second");
        });

        it("should handle plural second text for minimum > 1", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout(0, "Test Timeout", 2, 60);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe(
                "Test Timeout must be at least 2 seconds"
            );
        });

        it("should use custom field name in error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result = validateTimeout("invalid", "Connection Timeout");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe(
                "Connection Timeout must be a valid number"
            );
        });
    });

    describe(validateFormFields, () => {
        it("should return empty array when all validations pass", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const validations = [
                () => validateRequiredString("test"),
                () => validatePort(80),
                () => validateTimeout(30),
            ];

            const errors = validateFormFields(validations);

            expect(errors).toEqual([]);
        });

        it("should return all validation errors when validations fail", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const validations = [
                () => validateRequiredString(""),
                () => validatePort(-1),
                () => validateTimeout("invalid"),
            ];

            const errors = validateFormFields(validations);

            expect(errors).toHaveLength(3);
            expect(errors).toContain("Field is required");
            expect(errors).toContain("Port must be between 1 and 65535");
            expect(errors).toContain("Timeout must be a valid number");
        });

        it("should handle mixed success and failure validations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const validations = [
                () => validateRequiredString("valid"),
                () => validatePort(-1),
                () => validateTimeout(30),
            ];

            const errors = validateFormFields(validations);

            expect(errors).toHaveLength(1);
            expect(errors).toContain("Port must be between 1 and 65535");
        });

        it("should handle empty validations array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const errors = validateFormFields([]);

            expect(errors).toEqual([]);
        });
    });

    describe(isEmptyString, () => {
        it("should return true for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            expect(isEmptyString(null)).toBeTruthy();
        });

        it("should return true for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            expect(isEmptyString(undefined)).toBeTruthy();
        });

        it("should return true for empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            expect(isEmptyString("")).toBeTruthy();
        });

        it("should return true for whitespace-only string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            expect(isEmptyString("   ")).toBeTruthy();
        });

        it("should return false for non-empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            expect(isEmptyString("test")).toBeFalsy();
        });

        it("should return false for string with content surrounded by whitespace", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            expect(isEmptyString("  test  ")).toBeFalsy();
        });
    });

    describe(validatePattern, () => {
        it("should return valid for string matching pattern", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const result = validatePattern("test@example.com", emailPattern);

            expect(result.isValid).toBeTruthy();
            expect(result.error).toBeUndefined();
        });

        it("should return invalid for string not matching pattern", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const result = validatePattern("invalid-email", emailPattern);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Field must match the required format");
        });

        it("should return invalid for empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const pattern = /\d+/;
            const result = validatePattern("", pattern);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Field is required");
        });

        it("should return invalid for whitespace-only string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const pattern = /\d+/;
            const result = validatePattern("   ", pattern);

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Field is required");
        });

        it("should use custom field name in error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const pattern = /\d+/;
            const result = validatePattern("", pattern, "Phone Number");

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe("Phone Number is required");
        });

        it("should use custom pattern description in error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const pattern = /\d+/;
            const result = validatePattern(
                "abc",
                pattern,
                "Phone Number",
                "a valid phone number format"
            );

            expect(result.isValid).toBeFalsy();
            expect(result.error).toBe(
                "Phone Number must match a valid phone number format"
            );
        });

        it("should handle complex regex patterns", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const ipPattern =
                /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;

            expect(
                validatePattern("192.168.1.1", ipPattern).isValid
            ).toBeTruthy();
            expect(validatePattern("256.1.1.1", ipPattern).isValid).toBeFalsy();
        });
    });
});
