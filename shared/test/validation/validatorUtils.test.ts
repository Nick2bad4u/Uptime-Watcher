/**
 * Comprehensive test suite for shared/validation/validatorUtils.ts
 *
 * @remarks
 * This file provides 100% test coverage for all validation utility functions
 * using the validator.js package. Tests include edge cases, boundary
 * conditions, type guards, and options handling.
 *
 * @author AI Assistant
 *
 * @since 2024-01-XX
 */

import { describe, expect, it } from "vitest";
import {
    isNonEmptyString,
    isValidFQDN,
    isValidHost,
    isValidIdentifier,
    isValidIdentifierArray,
    isValidInteger,
    isValidNumeric,
    isValidPort,
    isValidUrl,
    safeInteger,
} from "../../validation/validatorUtils";

describe("validatorUtils", () => {
    describe("isNonEmptyString", () => {
        it("should return true for non-empty strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonEmptyString("hello")).toBe(true);
            expect(isNonEmptyString("world")).toBe(true);
            expect(isNonEmptyString("123")).toBe(true);
            expect(isNonEmptyString("test string")).toBe(true);
            expect(isNonEmptyString("a")).toBe(true);
        });

        it("should return false for empty strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonEmptyString("")).toBe(false);
            expect(isNonEmptyString("   ")).toBe(false);
            expect(isNonEmptyString("\t")).toBe(false);
            expect(isNonEmptyString("\n")).toBe(false);
            expect(isNonEmptyString("\r\n")).toBe(false);
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonEmptyString(null)).toBe(false);
            expect(isNonEmptyString(undefined)).toBe(false);
            expect(isNonEmptyString(123)).toBe(false);
            expect(isNonEmptyString(true)).toBe(false);
            expect(isNonEmptyString([])).toBe(false);
            expect(isNonEmptyString({})).toBe(false);
        });

        it("should trim whitespace correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonEmptyString("  hello  ")).toBe(true);
            expect(isNonEmptyString("\thello\t")).toBe(true);
            expect(isNonEmptyString("\nhello\n")).toBe(true);
        });
    });

    describe("isValidFQDN", () => {
        it("should return true for valid FQDNs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidFQDN("example.com")).toBe(true);
            expect(isValidFQDN("subdomain.example.com")).toBe(true);
            expect(isValidFQDN("test.org")).toBe(true);
            expect(isValidFQDN("my-site.net")).toBe(true);
            expect(isValidFQDN("deep.sub.domain.example.com")).toBe(true);
        });

        it("should return false for invalid FQDNs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidFQDN("localhost")).toBe(false); // No TLD by default
            expect(isValidFQDN("invalid..domain")).toBe(false);
            expect(isValidFQDN("")).toBe(false);
            expect(isValidFQDN(".com")).toBe(false);
            expect(isValidFQDN("example.")).toBe(false);
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidFQDN(null)).toBe(false);
            expect(isValidFQDN(undefined)).toBe(false);
            expect(isValidFQDN(123)).toBe(false);
            expect(isValidFQDN(true)).toBe(false);
            expect(isValidFQDN([])).toBe(false);
            expect(isValidFQDN({})).toBe(false);
        });

        it("should respect options parameter", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Allow localhost with require_tld: false
            expect(isValidFQDN("localhost", { require_tld: false })).toBe(true);
            expect(isValidFQDN("local-server", { require_tld: false })).toBe(
                true
            );
        });
    });

    describe("isValidIdentifier", () => {
        it("should return true for valid identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier("abc123")).toBe(true);
            expect(isValidIdentifier("abc-123")).toBe(true);
            expect(isValidIdentifier("abc_123")).toBe(true);
            expect(isValidIdentifier("abc-123_def")).toBe(true);
            expect(isValidIdentifier("test_id")).toBe(true);
            expect(isValidIdentifier("my-component")).toBe(true);
            expect(isValidIdentifier("123")).toBe(true);
            expect(isValidIdentifier("a")).toBe(true);
        });

        it("should return false for invalid identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier("abc@123")).toBe(false);
            expect(isValidIdentifier("abc.123")).toBe(false);
            expect(isValidIdentifier("abc 123")).toBe(false);
            expect(isValidIdentifier("abc#123")).toBe(false);
            expect(isValidIdentifier("abc%123")).toBe(false);
            expect(isValidIdentifier("abc+123")).toBe(false);
        });

        it("should return false for empty or whitespace strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier("")).toBe(false);
            expect(isValidIdentifier("   ")).toBe(false);
            expect(isValidIdentifier("\t")).toBe(false);
            expect(isValidIdentifier("\n")).toBe(false);
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier(null)).toBe(false);
            expect(isValidIdentifier(undefined)).toBe(false);
            expect(isValidIdentifier(123)).toBe(false);
            expect(isValidIdentifier(true)).toBe(false);
            expect(isValidIdentifier([])).toBe(false);
            expect(isValidIdentifier({})).toBe(false);
        });

        it("should handle mixed alphanumeric with hyphens and underscores", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier("test-123_abc")).toBe(true);
            expect(isValidIdentifier("_underscore")).toBe(true);
            expect(isValidIdentifier("-hyphen")).toBe(true);
            expect(isValidIdentifier("test_-_test")).toBe(true);
        });
    });

    describe("isValidIdentifierArray", () => {
        it("should return true for arrays of valid identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifierArray(["abc", "def-123"])).toBe(true);
            expect(isValidIdentifierArray(["test_1", "test_2"])).toBe(true);
            expect(isValidIdentifierArray(["single"])).toBe(true);
            expect(isValidIdentifierArray([])).toBe(true); // Empty array is valid
            expect(
                isValidIdentifierArray([
                    "a",
                    "b",
                    "c",
                ])
            ).toBe(true);
        });

        it("should return false for arrays containing invalid identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifierArray(["abc", 123])).toBe(false);
            expect(isValidIdentifierArray(["abc", ""])).toBe(false);
            expect(isValidIdentifierArray(["valid", "in@valid"])).toBe(false);
            expect(isValidIdentifierArray(["valid", null])).toBe(false);
            expect(isValidIdentifierArray(["valid", undefined])).toBe(false);
        });

        it("should return false for non-array values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifierArray(null)).toBe(false);
            expect(isValidIdentifierArray(undefined)).toBe(false);
            expect(isValidIdentifierArray("string")).toBe(false);
            expect(isValidIdentifierArray(123)).toBe(false);
            expect(isValidIdentifierArray(true)).toBe(false);
            expect(isValidIdentifierArray({})).toBe(false);
        });

        it("should handle mixed valid identifier formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                isValidIdentifierArray([
                    "test",
                    "test-123",
                    "test_456",
                    "789",
                ])
            ).toBe(true);
        });
    });

    describe("isValidInteger", () => {
        it("should return true for valid integer strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidInteger("123")).toBe(true);
            expect(isValidInteger("0")).toBe(true);
            expect(isValidInteger("-123")).toBe(true);
            expect(isValidInteger("999999")).toBe(true);
        });

        it("should return false for non-integer strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidInteger("123.45")).toBe(false);
            expect(isValidInteger("abc")).toBe(false);
            expect(isValidInteger("12.0")).toBe(false);
            expect(isValidInteger("1e10")).toBe(false);
            expect(isValidInteger("")).toBe(false);
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidInteger(123)).toBe(false);
            expect(isValidInteger(null)).toBe(false);
            expect(isValidInteger(undefined)).toBe(false);
            expect(isValidInteger(true)).toBe(false);
            expect(isValidInteger([])).toBe(false);
            expect(isValidInteger({})).toBe(false);
        });

        it("should respect options parameter", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Test with min/max bounds
            expect(isValidInteger("50", { min: 0, max: 100 })).toBe(true);
            expect(isValidInteger("-5", { min: 0, max: 100 })).toBe(false);
            expect(isValidInteger("150", { min: 0, max: 100 })).toBe(false);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidInteger("+123")).toBe(true);
            expect(isValidInteger("  123  ")).toBe(false); // Whitespace not allowed
        });
    });

    describe("isValidNumeric", () => {
        it("should return true for valid numeric strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidNumeric("123")).toBe(true);
            expect(isValidNumeric("123.45")).toBe(true);
            expect(isValidNumeric("-123.45")).toBe(true);
            expect(isValidNumeric("0")).toBe(true);
            expect(isValidNumeric("0.5")).toBe(true);
            expect(isValidNumeric(".5")).toBe(true);
        });

        it("should return false for non-numeric strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidNumeric("abc")).toBe(false);
            expect(isValidNumeric("")).toBe(false);
            expect(isValidNumeric("12abc")).toBe(false);
            expect(isValidNumeric("1.2.3")).toBe(false);
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidNumeric(123)).toBe(false);
            expect(isValidNumeric(null)).toBe(false);
            expect(isValidNumeric(undefined)).toBe(false);
            expect(isValidNumeric(true)).toBe(false);
            expect(isValidNumeric([])).toBe(false);
            expect(isValidNumeric({})).toBe(false);
        });

        it("should respect options parameter", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Test with min/max bounds
            expect(isValidNumeric("50.5", { min: 0, max: 100 })).toBe(true);
            expect(isValidNumeric("-5.5", { min: 0, max: 100 })).toBe(false);
            expect(isValidNumeric("150.5", { min: 0, max: 100 })).toBe(false);
        });

        it("should handle scientific notation", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidNumeric("1e10")).toBe(true);
            expect(isValidNumeric("1E10")).toBe(true);
            expect(isValidNumeric("1.5e-10")).toBe(true);
        });
    });

    describe("isValidHost", () => {
        it("should return true for valid IP addresses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost("192.168.1.1")).toBe(true);
            expect(isValidHost("127.0.0.1")).toBe(true);
            expect(isValidHost("10.0.0.1")).toBe(true);
            expect(isValidHost("255.255.255.255")).toBe(true);
            expect(isValidHost("2001:db8::1")).toBe(true); // IPv6
        });

        it("should return true for valid FQDNs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost("example.com")).toBe(true);
            expect(isValidHost("subdomain.example.com")).toBe(true);
            expect(isValidHost("test.org")).toBe(true);
            expect(isValidHost("my-site.net")).toBe(true);
        });

        it("should return true for localhost", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost("localhost")).toBe(true);
        });

        it("should return false for invalid hosts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost("invalid..domain")).toBe(false);
            expect(isValidHost("")).toBe(false);
            expect(isValidHost(".com")).toBe(false);
            expect(isValidHost("256.256.256.256")).toBe(false); // Invalid IP
            expect(isValidHost("local")).toBe(false); // No TLD and not localhost
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost(null)).toBe(false);
            expect(isValidHost(undefined)).toBe(false);
            expect(isValidHost(123)).toBe(false);
            expect(isValidHost(true)).toBe(false);
            expect(isValidHost([])).toBe(false);
            expect(isValidHost({})).toBe(false);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost("test_underscore.com")).toBe(false); // Underscores not allowed in FQDN
            expect(isValidHost("*.example.com")).toBe(false); // Wildcards not allowed
        });
    });

    describe("isValidPort", () => {
        it("should return true for valid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(80)).toBe(true);
            expect(isValidPort(443)).toBe(true);
            expect(isValidPort(1)).toBe(true);
            expect(isValidPort(65_535)).toBe(true);
            expect(isValidPort(8080)).toBe(true);
        });

        it("should return true for valid port strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort("80")).toBe(true);
            expect(isValidPort("443")).toBe(true);
            expect(isValidPort("1")).toBe(true);
            expect(isValidPort("65535")).toBe(true);
            expect(isValidPort("8080")).toBe(true);
        });

        it("should return false for port 0", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(0)).toBe(false);
            expect(isValidPort("0")).toBe(false);
        });

        it("should return false for invalid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(-1)).toBe(false);
            expect(isValidPort(65_536)).toBe(false);
            expect(isValidPort(70_000)).toBe(false);
        });

        it("should return false for invalid port strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort("-1")).toBe(false);
            expect(isValidPort("65536")).toBe(false);
            expect(isValidPort("abc")).toBe(false);
            expect(isValidPort("")).toBe(false);
            expect(isValidPort("80.5")).toBe(false);
        });

        it("should return false for non-number and non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(null)).toBe(false);
            expect(isValidPort(undefined)).toBe(false);
            expect(isValidPort(true)).toBe(false);
            expect(isValidPort([])).toBe(false);
            expect(isValidPort({})).toBe(false);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(1.5)).toBe(false); // Non-integer number
            expect(isValidPort("  80  ")).toBe(false); // Whitespace not allowed
        });
    });

    describe("isValidUrl", () => {
        it("should return true for valid URLs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("https://example.com")).toBe(true);
            expect(isValidUrl("https://subdomain.example.com")).toBe(true);
            expect(isValidUrl("https://example.com/path")).toBe(true);
            expect(isValidUrl("https://example.com:8080")).toBe(true);
        });

        it("should return true for localhost URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("http://localhost")).toBe(true);
            expect(isValidUrl("https://localhost:3000")).toBe(true);
            expect(isValidUrl("http://localhost:8080/path")).toBe(true);
        });

        it("should return true for valid HTTP URLs in test contexts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Testing HTTP URLs for validation completeness

            expect(isValidUrl("http://example.com")).toBe(true);
        });

        it("should return false for invalid URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("not-a-url")).toBe(false);
            expect(isValidUrl("http://")).toBe(false);
            expect(isValidUrl("")).toBe(false);
            expect(isValidUrl("//example.com")).toBe(false); // Protocol relative not allowed by default
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl(null)).toBe(false);
            expect(isValidUrl(undefined)).toBe(false);
            expect(isValidUrl(123)).toBe(false);
            expect(isValidUrl(true)).toBe(false);
            expect(isValidUrl([])).toBe(false);
            expect(isValidUrl({})).toBe(false);
        });

        it("should respect options parameter", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Allow protocol relative URLs
            expect(
                isValidUrl("//example.com", {
                    allow_protocol_relative_urls: true,
                })
            ).toBe(false); // Still false due to require_protocol: true

            // Require TLD
            expect(isValidUrl("http://localhost", { require_tld: true })).toBe(
                false
            );

            // Custom protocols - FTP is invalid in our validation (HTTP/HTTPS only)
            expect(isValidUrl("ftp://example.com")).toBe(false);
        });

        it("should handle complex URLs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                isValidUrl(
                    "https://user:pass@example.com:443/path?query=value#hash"
                )
            ).toBe(true);
            expect(isValidUrl("https://192.168.1.1:8080")).toBe(true);
        });
    });

    describe("safeInteger", () => {
        it("should return converted integer for valid integer strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger("123", 0)).toBe(123);
            expect(safeInteger("456", 0)).toBe(456);
            expect(safeInteger("-123", 0)).toBe(-123);
            expect(safeInteger("0", 10)).toBe(0);
        });

        it("should return default value for invalid inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger("abc", 10)).toBe(10);
            expect(safeInteger("123.45", 20)).toBe(20);
            expect(safeInteger("", 30)).toBe(30);
            expect(safeInteger(null, 40)).toBe(40);
            expect(safeInteger(undefined, 50)).toBe(50);
            expect(safeInteger({}, 60)).toBe(60);
        });

        it("should clamp to minimum value", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger("5", 0, 10)).toBe(10); // Below min
            expect(safeInteger("10", 0, 10)).toBe(10); // At min
            expect(safeInteger("15", 0, 10)).toBe(15); // Above min
        });

        it("should clamp to maximum value", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger("15", 0, undefined, 10)).toBe(10); // Above max
            expect(safeInteger("10", 0, undefined, 10)).toBe(10); // At max
            expect(safeInteger("5", 0, undefined, 10)).toBe(5); // Below max
        });

        it("should clamp to both min and max bounds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger("50", 0, 10, 100)).toBe(50); // Within bounds
            expect(safeInteger("5", 0, 10, 100)).toBe(10); // Below min
            expect(safeInteger("150", 0, 10, 100)).toBe(100); // Above max
            expect(safeInteger("10", 0, 10, 100)).toBe(10); // At min
            expect(safeInteger("100", 0, 10, 100)).toBe(100); // At max
        });

        it("should handle string conversion of various types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger(123, 0)).toBe(123); // Numbers become strings that are valid integers
            expect(safeInteger(true, 0)).toBe(0); // Boolean "true" is not a valid integer
            expect(safeInteger([], 0)).toBe(0); // Array "" is not a valid integer
            expect(safeInteger({}, 0)).toBe(0); // Object "[object Object]" is not a valid integer
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger("+123", 0)).toBe(123); // Positive sign
            expect(safeInteger("  123  ", 0)).toBe(0); // Whitespace makes it invalid
            expect(safeInteger("0x10", 0)).toBe(0); // Hex format invalid
        });

        it("should work without bounds", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeInteger("123", 0)).toBe(123);
            expect(safeInteger("-456", 0)).toBe(-456);
            expect(safeInteger("999999", 0)).toBe(999_999);
        });
    });
});
