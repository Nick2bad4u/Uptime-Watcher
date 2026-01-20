/**
 * @file Tests for shared validation utilities
 */

import { describe, it, expect } from "vitest";
import {
    isNonEmptyString,
    isValidUrl,
    isValidFQDN,
    isValidIdentifier,
    safeInteger,
} from "../../validation/validatorUtils";

describe("Shared Validation Utils", () => {
    describe(isNonEmptyString, () => {
        it("should return true for non-empty strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonEmptyString("test")).toBeTruthy();
            expect(isNonEmptyString("valid string")).toBeTruthy();
            expect(isNonEmptyString(" padded ")).toBeTruthy();
        });

        it("should return false for empty/invalid values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonEmptyString("")).toBeFalsy();
            expect(isNonEmptyString("   ")).toBeFalsy(); // Only whitespace
            expect(isNonEmptyString(null)).toBeFalsy();
            expect(isNonEmptyString(undefined)).toBeFalsy();
            expect(isNonEmptyString(123)).toBeFalsy();
        });
    });

    describe(isValidUrl, () => {
        it("should validate correct URL formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            expect(isValidUrl("https://example.com")).toBeTruthy();
            expect(isValidUrl("http://localhost:3000")).toBeTruthy();
            expect(isValidUrl("https://sub.domain.com/path")).toBeTruthy();
        });

        it("should reject invalid URL formats", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("not-a-url")).toBeFalsy();
            expect(isValidUrl("")).toBeFalsy();
            expect(isValidUrl("//example.com")).toBeFalsy();
            expect(isValidUrl(null)).toBeFalsy();
        });

        it("should respect validation options", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Test with protocol restriction
            expect(
                isValidUrl("https://example.com", { protocols: ["https"] })
            ).toBeTruthy();
            expect(
                isValidUrl("ftp://example.com", { protocols: ["https"] })
            ).toBeFalsy();
        });
    });

    describe(isValidFQDN, () => {
        it("should validate correct FQDN formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            expect(isValidFQDN("example.com")).toBeTruthy();
            expect(isValidFQDN("sub.example.com")).toBeTruthy();
            expect(isValidFQDN("test-site.example.org")).toBeTruthy();
        });

        it("should reject invalid FQDN formats", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidFQDN("")).toBeFalsy();
            expect(isValidFQDN(".com")).toBeFalsy();
            expect(isValidFQDN("example.")).toBeFalsy();
            expect(isValidFQDN("ex ample.com")).toBeFalsy();
            expect(isValidFQDN(null)).toBeFalsy();
        });

        it("should handle localhost based on options", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // By default, localhost might not be valid FQDN
            expect(
                isValidFQDN("localhost", { "require_tld": false })
            ).toBeTruthy();
        });
    });

    describe(isValidIdentifier, () => {
        it("should validate correct identifier formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            expect(isValidIdentifier("test")).toBeTruthy();
            expect(isValidIdentifier("test123")).toBeTruthy();
            expect(isValidIdentifier("test-name")).toBeTruthy();
            expect(isValidIdentifier("test_name")).toBeTruthy();
            expect(isValidIdentifier("test-123_name")).toBeTruthy();
        });

        it("should reject invalid identifier formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier("")).toBeFalsy();
            expect(isValidIdentifier("   ")).toBeFalsy();
            expect(isValidIdentifier("test@name")).toBeFalsy();
            expect(isValidIdentifier("test.name")).toBeFalsy();
            expect(isValidIdentifier("test name")).toBeFalsy();
            expect(isValidIdentifier(null)).toBeFalsy();
            expect(isValidIdentifier(123)).toBeFalsy();
        });
    });

    describe(safeInteger, () => {
        it("should parse valid integers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger("123", 0)).toBe(123);
            expect(safeInteger("0", 1)).toBe(0);
            expect(safeInteger(456, 0)).toBe(456);
        });

        it("should return default for invalid values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger("not-number", 42)).toBe(42);
            expect(safeInteger("", 100)).toBe(100);
            expect(safeInteger(null, 200)).toBe(200);
            expect(safeInteger(undefined, 300)).toBe(300);
            expect(safeInteger("12.34", 50)).toBe(50); // No decimals allowed
        });

        it("should respect min/max bounds", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger("50", 0, 100, 200)).toBe(100); // Below min
            expect(safeInteger("150", 0, 100, 200)).toBe(150); // Within range
            expect(safeInteger("250", 0, 100, 200)).toBe(200); // Above max
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger(Number.NaN, 1)).toBe(1);
            expect(safeInteger(Infinity, 2)).toBe(2);
            expect(safeInteger(-Infinity, 3)).toBe(3);
        });
    });

    describe("Integration tests", () => {
        it("should work together for complex validation scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Test URL validation
            const url = "https://example.com";
            expect(isValidUrl(url)).toBeTruthy();

            // Test FQDN validation
            const domain = "example.com";
            expect(isValidFQDN(domain)).toBeTruthy();

            // Test identifier validation
            const identifier = "test-site-123";
            expect(isValidIdentifier(identifier)).toBeTruthy();

            // Test safe integer parsing
            const timeout = safeInteger("5000", 1000, 1000, 30_000);
            expect(timeout).toBe(5000);
        });

        it("should provide consistent validation behavior", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validationUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // All these should be false/default values
            expect(isNonEmptyString("")).toBeFalsy();
            expect(isValidUrl("invalid")).toBeFalsy();
            expect(isValidFQDN("")).toBeFalsy();
            expect(isValidIdentifier("")).toBeFalsy();
            expect(safeInteger("invalid", 0)).toBe(0);
        });
    });
});
