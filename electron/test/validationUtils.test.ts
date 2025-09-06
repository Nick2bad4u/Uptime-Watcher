/**
 * @file Tests for shared validation utilities
 */

import { describe, it, expect } from "vitest";
import {
    isNonEmptyString,
    isValidUrl,
    isValidFQDN,
    isValidIdentifier,
    isValidInteger,
    isValidNumeric,
    isValidIdentifierArray,
    safeInteger,
} from "../../shared/validation/validatorUtils.js";

describe("Shared Validation Utils", () => {
    describe(isNonEmptyString, () => {
        it("should return true for non-empty strings", async ({
            task,
            annotate,
        }) => {
            // Add test metadata
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isNonEmptyString("test")).toBeTruthy();
            expect(isNonEmptyString("valid string")).toBeTruthy();
            expect(isNonEmptyString(" padded ")).toBeTruthy();
        });
        it("should return false for empty/invalid values", async ({
            task,
            annotate,
        }) => {
            // Add test metadata
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

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
            // Add test metadata
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidUrl("https://example.com")).toBeTruthy();
            expect(isValidUrl("https://sub.domain.com/path")).toBeTruthy();
            expect(isValidUrl("https://api.example.com:8080/v1/test")).toBeTruthy(
                
            );
        });
        it("should reject invalid URL formats", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidUrl("not-a-url")).toBeFalsy();
            expect(isValidUrl("")).toBeFalsy();
            expect(isValidUrl("//example.com")).toBeFalsy();
            expect(isValidUrl(null)).toBeFalsy();
        });
        it("should respect validation options", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

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
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidFQDN("example.com")).toBeTruthy();
            expect(isValidFQDN("sub.example.com")).toBeTruthy();
            expect(isValidFQDN("test-site.example.org")).toBeTruthy();
        });
        it("should reject invalid FQDN formats", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

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
            await annotate("Component: Shared Validation Utils", "component");

            // By default, localhost might not be valid FQDN
            expect(isValidFQDN("localhost", { require_tld: false })).toBeTruthy();
        });
    });
    describe(isValidIdentifier, () => {
        it("should validate correct identifier formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

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
            await annotate("Component: Shared Validation Utils", "component");

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
            await annotate("Component: Shared Validation Utils", "component");

            expect(safeInteger("123", 0)).toBe(123);
            expect(safeInteger("0", 1)).toBe(0);
            expect(safeInteger(456, 0)).toBe(456);
        });
        it("should return default for invalid values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(safeInteger("not-number", 42)).toBe(42);
            expect(safeInteger("", 100)).toBe(100);
            expect(safeInteger(null, 200)).toBe(200);
            expect(safeInteger(undefined, 300)).toBe(300);
            expect(safeInteger("12.34", 50)).toBe(50); // No decimals allowed
        });
        it("should respect min/max bounds", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(safeInteger("50", 0, 100, 200)).toBe(100); // Below min
            expect(safeInteger("150", 0, 100, 200)).toBe(150); // Within range
            expect(safeInteger("250", 0, 100, 200)).toBe(200); // Above max
        });
        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

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
            await annotate("Component: Shared Validation Utils", "component");

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
            await annotate("Component: Shared Validation Utils", "component");

            // All these should be false/default values
            expect(isNonEmptyString("")).toBeFalsy();
            expect(isValidUrl("invalid")).toBeFalsy();
            expect(isValidFQDN("")).toBeFalsy();
            expect(isValidIdentifier("")).toBeFalsy();
            expect(safeInteger("invalid", 0)).toBe(0);
        });
    });
    describe(isValidInteger, () => {
        it("should validate integer strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidInteger("123")).toBeTruthy();
            expect(isValidInteger("0")).toBeTruthy();
            expect(isValidInteger("-456")).toBeTruthy();
        });
        it("should reject non-integer values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidInteger("123.45")).toBeFalsy();
            expect(isValidInteger("abc")).toBeFalsy();
            expect(isValidInteger("")).toBeFalsy();
            expect(isValidInteger(null)).toBeFalsy();
        });
        it("should respect bounds when provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidInteger("150", { min: 100, max: 200 })).toBeTruthy();
            expect(isValidInteger("50", { min: 100, max: 200 })).toBeFalsy();
            expect(isValidInteger("250", { min: 100, max: 200 })).toBeFalsy();
        });
    });
    describe(isValidNumeric, () => {
        it("should validate numeric strings including decimals", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidNumeric("123")).toBeTruthy();
            expect(isValidNumeric("123.45")).toBeTruthy();
            expect(isValidNumeric("0.5")).toBeTruthy();
            expect(isValidNumeric("-45.67")).toBeTruthy();
        });
        it("should reject non-numeric values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidNumeric("abc")).toBeFalsy();
            expect(isValidNumeric("")).toBeFalsy();
            expect(isValidNumeric(null)).toBeFalsy();
        });
    });
    describe(isValidIdentifierArray, () => {
        it("should validate arrays of valid identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(
                isValidIdentifierArray([
                    "test",
                    "valid",
                    "array",
                ])
            ).toBeTruthy();
            expect(isValidIdentifierArray(["test-123", "valid_name"])).toBeTruthy(
                
            );
            expect(isValidIdentifierArray([])).toBeTruthy();
        });
        it("should reject invalid arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(
                isValidIdentifierArray([
                    "test",
                    "",
                    "invalid",
                ])
            ).toBeFalsy();
            expect(isValidIdentifierArray(["test", null as any])).toBeFalsy();
            expect(isValidIdentifierArray([123 as any])).toBeFalsy();
            expect(isValidIdentifierArray("not-array" as any)).toBeFalsy();
            expect(isValidIdentifierArray(null)).toBeFalsy();
        });
    });
    describe("Comprehensive validation scenarios", () => {
        it("should handle complex validation workflows", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            // Validate monitor configuration
            const monitorConfig = {
                name: "test-monitor",
                url: "https://api.example.com",
                timeout: "5000",
                retries: "3",
                tags: ["production", "api-health"],
            };

            expect(isValidIdentifier(monitorConfig.name)).toBeTruthy();
            expect(isValidUrl(monitorConfig.url)).toBeTruthy();
            expect(isValidInteger(monitorConfig.timeout)).toBeTruthy();
            expect(isValidInteger(monitorConfig.retries)).toBeTruthy();
            expect(isValidIdentifierArray(monitorConfig.tags)).toBeTruthy();

            // Safe parsing
            const timeout = safeInteger(
                monitorConfig.timeout,
                1000,
                1000,
                30_000
            );
            const retries = safeInteger(monitorConfig.retries, 1, 1, 10);

            expect(timeout).toBe(5000);
            expect(retries).toBe(3);
        });
    });
});
