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
    describe("isNonEmptyString", () => {
        it("should return true for non-empty strings", () => {
            expect(isNonEmptyString("test")).toBe(true);
            expect(isNonEmptyString("valid string")).toBe(true);
            expect(isNonEmptyString(" padded ")).toBe(true);
        });

        it("should return false for empty/invalid values", () => {
            expect(isNonEmptyString("")).toBe(false);
            expect(isNonEmptyString("   ")).toBe(false); // Only whitespace
            expect(isNonEmptyString(null)).toBe(false);
            expect(isNonEmptyString(undefined)).toBe(false);
            expect(isNonEmptyString(123)).toBe(false);
        });
    });

    describe("isValidUrl", () => {
        it("should validate correct URL formats", () => {
            expect(isValidUrl("https://example.com")).toBe(true);
            expect(isValidUrl("http://localhost:3000")).toBe(true);
            expect(isValidUrl("https://sub.domain.com/path")).toBe(true);
        });

        it("should reject invalid URL formats", () => {
            expect(isValidUrl("not-a-url")).toBe(false);
            expect(isValidUrl("")).toBe(false);
            expect(isValidUrl("//example.com")).toBe(false);
            expect(isValidUrl(null)).toBe(false);
        });

        it("should respect validation options", () => {
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
        it("should validate correct FQDN formats", () => {
            expect(isValidFQDN("example.com")).toBe(true);
            expect(isValidFQDN("sub.example.com")).toBe(true);
            expect(isValidFQDN("test-site.example.org")).toBe(true);
        });

        it("should reject invalid FQDN formats", () => {
            expect(isValidFQDN("")).toBe(false);
            expect(isValidFQDN(".com")).toBe(false);
            expect(isValidFQDN("example.")).toBe(false);
            expect(isValidFQDN("ex ample.com")).toBe(false);
            expect(isValidFQDN(null)).toBe(false);
        });

        it("should handle localhost based on options", () => {
            // By default, localhost might not be valid FQDN
            expect(isValidFQDN("localhost", { require_tld: false })).toBe(true);
        });
    });

    describe("isValidIdentifier", () => {
        it("should validate correct identifier formats", () => {
            expect(isValidIdentifier("test")).toBe(true);
            expect(isValidIdentifier("test123")).toBe(true);
            expect(isValidIdentifier("test-name")).toBe(true);
            expect(isValidIdentifier("test_name")).toBe(true);
            expect(isValidIdentifier("test-123_name")).toBe(true);
        });

        it("should reject invalid identifier formats", () => {
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
        it("should parse valid integers", () => {
            expect(safeInteger("123", 0)).toBe(123);
            expect(safeInteger("0", 1)).toBe(0);
            expect(safeInteger(456, 0)).toBe(456);
        });

        it("should return default for invalid values", () => {
            expect(safeInteger("not-number", 42)).toBe(42);
            expect(safeInteger("", 100)).toBe(100);
            expect(safeInteger(null, 200)).toBe(200);
            expect(safeInteger(undefined, 300)).toBe(300);
            expect(safeInteger("12.34", 50)).toBe(50); // No decimals allowed
        });

        it("should respect min/max bounds", () => {
            expect(safeInteger("50", 0, 100, 200)).toBe(100); // Below min
            expect(safeInteger("150", 0, 100, 200)).toBe(150); // Within range
            expect(safeInteger("250", 0, 100, 200)).toBe(200); // Above max
        });

        it("should handle edge cases", () => {
            expect(safeInteger(Number.NaN, 1)).toBe(1);
            expect(safeInteger(Infinity, 2)).toBe(2);
            expect(safeInteger(-Infinity, 3)).toBe(3);
        });
    });

    describe("Integration tests", () => {
        it("should work together for complex validation scenarios", () => {
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

        it("should provide consistent validation behavior", () => {
            // All these should be false/default values
            expect(isNonEmptyString("")).toBe(false);
            expect(isValidUrl("invalid")).toBe(false);
            expect(isValidFQDN("")).toBe(false);
            expect(isValidIdentifier("")).toBe(false);
            expect(safeInteger("invalid", 0)).toBe(0);
        });
    });
});
