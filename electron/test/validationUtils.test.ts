/**
 * @fileoverview Tests for shared validation utilities
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
} from "../../shared/validation/validatorUtils";

describe("Shared Validation Utils", () => {
    describe("isNonEmptyString", () => {
        it("should return true for non-empty strings", async ({
            task,
            annotate,
        }) => {
            // Add test metadata
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isNonEmptyString("test")).toBe(true);
            expect(isNonEmptyString("valid string")).toBe(true);
            expect(isNonEmptyString(" padded ")).toBe(true);
        });
        it("should return false for empty/invalid values", async ({
            task,
            annotate,
        }) => {
            // Add test metadata
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isNonEmptyString("")).toBe(false);
            expect(isNonEmptyString("   ")).toBe(false); // Only whitespace
            expect(isNonEmptyString(null)).toBe(false);
            expect(isNonEmptyString(undefined)).toBe(false);
            expect(isNonEmptyString(123)).toBe(false);
        });
    });

    describe("isValidUrl", () => {
        it("should validate correct URL formats", async ({
            task,
            annotate,
        }) => {
            // Add test metadata
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidUrl("https://example.com")).toBe(true);
            expect(isValidUrl("https://sub.domain.com/path")).toBe(true);
            expect(isValidUrl("https://api.example.com:8080/v1/test")).toBe(
                true
            );
        });
        it("should reject invalid URL formats", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidUrl("not-a-url")).toBe(false);
            expect(isValidUrl("")).toBe(false);
            expect(isValidUrl("//example.com")).toBe(false);
            expect(isValidUrl(null)).toBe(false);
        });
        it("should respect validation options", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            // Test with protocol restriction
            expect(
                isValidUrl("https://example.com", { protocols: ["https"] })
            ).toBe(true);
            expect(
                isValidUrl("ftp://example.com", { protocols: ["https"] })
            ).toBe(false);
        });
    });
    describe("isValidFQDN", () => {
        it("should validate correct FQDN formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidFQDN("example.com")).toBe(true);
            expect(isValidFQDN("sub.example.com")).toBe(true);
            expect(isValidFQDN("test-site.example.org")).toBe(true);
        });
        it("should reject invalid FQDN formats", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidFQDN("")).toBe(false);
            expect(isValidFQDN(".com")).toBe(false);
            expect(isValidFQDN("example.")).toBe(false);
            expect(isValidFQDN("ex ample.com")).toBe(false);
            expect(isValidFQDN(null)).toBe(false);
        });
        it("should handle localhost based on options", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            // By default, localhost might not be valid FQDN
            expect(isValidFQDN("localhost", { require_tld: false })).toBe(true);
        });
    });
    describe("isValidIdentifier", () => {
        it("should validate correct identifier formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidIdentifier("test")).toBe(true);
            expect(isValidIdentifier("test123")).toBe(true);
            expect(isValidIdentifier("test-name")).toBe(true);
            expect(isValidIdentifier("test_name")).toBe(true);
            expect(isValidIdentifier("test-123_name")).toBe(true);
        });
        it("should reject invalid identifier formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidIdentifier("")).toBe(false);
            expect(isValidIdentifier("   ")).toBe(false);
            expect(isValidIdentifier("test@name")).toBe(false);
            expect(isValidIdentifier("test.name")).toBe(false);
            expect(isValidIdentifier("test name")).toBe(false);
            expect(isValidIdentifier(null)).toBe(false);
            expect(isValidIdentifier(123)).toBe(false);
        });
    });
    describe("safeInteger", () => {
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
            expect(isValidUrl(url)).toBe(true);

            // Test FQDN validation
            const domain = "example.com";
            expect(isValidFQDN(domain)).toBe(true);

            // Test identifier validation
            const identifier = "test-site-123";
            expect(isValidIdentifier(identifier)).toBe(true);

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
            expect(isNonEmptyString("")).toBe(false);
            expect(isValidUrl("invalid")).toBe(false);
            expect(isValidFQDN("")).toBe(false);
            expect(isValidIdentifier("")).toBe(false);
            expect(safeInteger("invalid", 0)).toBe(0);
        });
    });
    describe("isValidInteger", () => {
        it("should validate integer strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidInteger("123")).toBe(true);
            expect(isValidInteger("0")).toBe(true);
            expect(isValidInteger("-456")).toBe(true);
        });
        it("should reject non-integer values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidInteger("123.45")).toBe(false);
            expect(isValidInteger("abc")).toBe(false);
            expect(isValidInteger("")).toBe(false);
            expect(isValidInteger(null)).toBe(false);
        });
        it("should respect bounds when provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidInteger("150", { min: 100, max: 200 })).toBe(true);
            expect(isValidInteger("50", { min: 100, max: 200 })).toBe(false);
            expect(isValidInteger("250", { min: 100, max: 200 })).toBe(false);
        });
    });
    describe("isValidNumeric", () => {
        it("should validate numeric strings including decimals", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidNumeric("123")).toBe(true);
            expect(isValidNumeric("123.45")).toBe(true);
            expect(isValidNumeric("0.5")).toBe(true);
            expect(isValidNumeric("-45.67")).toBe(true);
        });
        it("should reject non-numeric values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidNumeric("abc")).toBe(false);
            expect(isValidNumeric("")).toBe(false);
            expect(isValidNumeric(null)).toBe(false);
        });
    });
    describe("isValidIdentifierArray", () => {
        it("should validate arrays of valid identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidIdentifierArray(["test", "valid", "array"])).toBe(
                true
            );
            expect(isValidIdentifierArray(["test-123", "valid_name"])).toBe(
                true
            );
            expect(isValidIdentifierArray([])).toBe(true);
        });
        it("should reject invalid arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Shared Validation Utils", "component");

            expect(isValidIdentifierArray(["test", "", "invalid"])).toBe(false);
            expect(isValidIdentifierArray(["test", null as any])).toBe(false);
            expect(isValidIdentifierArray([123 as any])).toBe(false);
            expect(isValidIdentifierArray("not-array" as any)).toBe(false);
            expect(isValidIdentifierArray(null)).toBe(false);
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

            expect(isValidIdentifier(monitorConfig.name)).toBe(true);
            expect(isValidUrl(monitorConfig.url)).toBe(true);
            expect(isValidInteger(monitorConfig.timeout)).toBe(true);
            expect(isValidInteger(monitorConfig.retries)).toBe(true);
            expect(isValidIdentifierArray(monitorConfig.tags)).toBe(true);

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
