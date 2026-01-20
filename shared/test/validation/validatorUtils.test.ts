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
import { test } from "@fast-check/vitest";
import fc from "fast-check";
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

const alphanumericChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const separatorChars = "-_";
const alphanumericCharArb = fc.constantFrom(...alphanumericChars.split(""));
const identifierCharArb = fc.constantFrom(
    ...(alphanumericChars + separatorChars).split("")
);
const validIdentifierArb = fc
    .tuple(alphanumericCharArb, fc.array(identifierCharArb, { maxLength: 47 }))
    .map(([firstChar, rest]) => `${firstChar}${rest.join("")}`);
const invalidIdentifierArb = fc
    .tuple(
        fc.array(identifierCharArb, { maxLength: 10 }),
        fc.constantFrom("@", " ", ".", "#", "%", "+"),
        fc.array(identifierCharArb, { maxLength: 10 })
    )
    .map(
        ([
            prefix,
            invalidChar,
            suffix,
        ]) => `${prefix.join("")}${invalidChar}${suffix.join("")}`
    );

describe("validatorUtils", () => {
    describe(isNonEmptyString, () => {
        it("should return true for non-empty strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonEmptyString("hello")).toBeTruthy();
            expect(isNonEmptyString("world")).toBeTruthy();
            expect(isNonEmptyString("123")).toBeTruthy();
            expect(isNonEmptyString("test string")).toBeTruthy();
            expect(isNonEmptyString("a")).toBeTruthy();
        });

        it("should return false for empty strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonEmptyString("")).toBeFalsy();
            expect(isNonEmptyString("   ")).toBeFalsy();
            expect(isNonEmptyString("\t")).toBeFalsy();
            expect(isNonEmptyString("\n")).toBeFalsy();
            expect(isNonEmptyString("\r\n")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonEmptyString(null)).toBeFalsy();
            expect(isNonEmptyString(undefined)).toBeFalsy();
            expect(isNonEmptyString(123)).toBeFalsy();
            expect(isNonEmptyString(true)).toBeFalsy();
            expect(isNonEmptyString([])).toBeFalsy();
            expect(isNonEmptyString({})).toBeFalsy();
        });

        it("should trim whitespace correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isNonEmptyString("  hello  ")).toBeTruthy();
            expect(isNonEmptyString("\thello\t")).toBeTruthy();
            expect(isNonEmptyString("\nhello\n")).toBeTruthy();
        });

        test.prop([fc.string()], { numRuns: 100 })(
            "is equivalent to checking trimmed length greater than zero",
            (candidate) => {
                expect(isNonEmptyString(candidate)).toBe(
                    candidate.trim().length > 0
                );
            }
        );
    });

    describe(isValidFQDN, () => {
        it("should return true for valid FQDNs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidFQDN("example.com")).toBeTruthy();
            expect(isValidFQDN("subdomain.example.com")).toBeTruthy();
            expect(isValidFQDN("test.org")).toBeTruthy();
            expect(isValidFQDN("my-site.net")).toBeTruthy();
            expect(isValidFQDN("deep.sub.domain.example.com")).toBeTruthy();
        });

        it("should return false for invalid FQDNs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidFQDN("localhost")).toBeFalsy(); // No TLD by default
            expect(isValidFQDN("invalid..domain")).toBeFalsy();
            expect(isValidFQDN("")).toBeFalsy();
            expect(isValidFQDN(".com")).toBeFalsy();
            expect(isValidFQDN("example.")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidFQDN(null)).toBeFalsy();
            expect(isValidFQDN(undefined)).toBeFalsy();
            expect(isValidFQDN(123)).toBeFalsy();
            expect(isValidFQDN(true)).toBeFalsy();
            expect(isValidFQDN([])).toBeFalsy();
            expect(isValidFQDN({})).toBeFalsy();
        });

        it("should respect options parameter", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Allow localhost with require_tld: false
            expect(
                isValidFQDN("localhost", { "require_tld": false })
            ).toBeTruthy();
            expect(
                isValidFQDN("local-server", { "require_tld": false })
            ).toBeTruthy();
        });
    });

    describe(isValidIdentifier, () => {
        it("should return true for valid identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier("abc123")).toBeTruthy();
            expect(isValidIdentifier("abc-123")).toBeTruthy();
            expect(isValidIdentifier("abc_123")).toBeTruthy();
            expect(isValidIdentifier("abc-123_def")).toBeTruthy();
            expect(isValidIdentifier("test_id")).toBeTruthy();
            expect(isValidIdentifier("my-component")).toBeTruthy();
            expect(isValidIdentifier("123")).toBeTruthy();
            expect(isValidIdentifier("a")).toBeTruthy();
        });

        it("should return false for invalid identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier("abc@123")).toBeFalsy();
            expect(isValidIdentifier("abc.123")).toBeFalsy();
            expect(isValidIdentifier("abc 123")).toBeFalsy();
            expect(isValidIdentifier("abc#123")).toBeFalsy();
            expect(isValidIdentifier("abc%123")).toBeFalsy();
            expect(isValidIdentifier("abc+123")).toBeFalsy();
        });

        it("should return false for empty or whitespace strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier("")).toBeFalsy();
            expect(isValidIdentifier("   ")).toBeFalsy();
            expect(isValidIdentifier("\t")).toBeFalsy();
            expect(isValidIdentifier("\n")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier(null)).toBeFalsy();
            expect(isValidIdentifier(undefined)).toBeFalsy();
            expect(isValidIdentifier(123)).toBeFalsy();
            expect(isValidIdentifier(true)).toBeFalsy();
            expect(isValidIdentifier([])).toBeFalsy();
            expect(isValidIdentifier({})).toBeFalsy();
        });

        it("should handle mixed alphanumeric with hyphens and underscores", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifier("test-123_abc")).toBeTruthy();
            expect(isValidIdentifier("_underscore")).toBeTruthy();
            expect(isValidIdentifier("-hyphen")).toBeTruthy();
            expect(isValidIdentifier("test_-_test")).toBeTruthy();
        });

        test.prop([validIdentifierArb], { numRuns: 80 })(
            "accepts identifiers composed of the allowed alphabet",
            (identifier) => {
                expect(isValidIdentifier(identifier)).toBeTruthy();
            }
        );

        test.prop([invalidIdentifierArb], { numRuns: 80 })(
            "rejects identifiers that include invalid characters",
            (identifier) => {
                expect(isValidIdentifier(identifier)).toBeFalsy();
            }
        );
    });

    describe(isValidIdentifierArray, () => {
        it("should return true for arrays of valid identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifierArray(["abc", "def-123"])).toBeTruthy();
            expect(isValidIdentifierArray(["test_1", "test_2"])).toBeTruthy();
            expect(isValidIdentifierArray(["single"])).toBeTruthy();
            expect(isValidIdentifierArray([])).toBeTruthy(); // Empty array is valid
            expect(
                isValidIdentifierArray([
                    "a",
                    "b",
                    "c",
                ])
            ).toBeTruthy();
        });

        it("should return false for arrays containing invalid identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifierArray(["abc", 123])).toBeFalsy();
            expect(isValidIdentifierArray(["abc", ""])).toBeFalsy();
            expect(isValidIdentifierArray(["valid", "in@valid"])).toBeFalsy();
            expect(isValidIdentifierArray(["valid", null])).toBeFalsy();
            expect(isValidIdentifierArray(["valid", undefined])).toBeFalsy();
        });

        test.prop([fc.array(validIdentifierArb, { maxLength: 6 })], {
            numRuns: 60,
        })("is true for arrays containing only valid identifiers", (ids) => {
            expect(isValidIdentifierArray(ids)).toBeTruthy();
        });

        test.prop([fc.array(validIdentifierArb, { maxLength: 6 })], {
            numRuns: 60,
        })("is false when any entry contains an invalid character", (ids) => {
            const invalidItem = `${ids.join("-")}@`;
            expect(isValidIdentifierArray([...ids, invalidItem])).toBeFalsy();
        });

        it("should return false for non-array values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidIdentifierArray(null)).toBeFalsy();
            expect(isValidIdentifierArray(undefined)).toBeFalsy();
            expect(isValidIdentifierArray("string")).toBeFalsy();
            expect(isValidIdentifierArray(123)).toBeFalsy();
            expect(isValidIdentifierArray(true)).toBeFalsy();
            expect(isValidIdentifierArray({})).toBeFalsy();
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
            ).toBeTruthy();
        });
    });

    describe(isValidInteger, () => {
        it("should return true for valid integer strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidInteger("123")).toBeTruthy();
            expect(isValidInteger("0")).toBeTruthy();
            expect(isValidInteger("-123")).toBeTruthy();
            expect(isValidInteger("999999")).toBeTruthy();
        });

        it("should return false for non-integer strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidInteger("123.45")).toBeFalsy();
            expect(isValidInteger("abc")).toBeFalsy();
            expect(isValidInteger("12.0")).toBeFalsy();
            expect(isValidInteger("1e10")).toBeFalsy();
            expect(isValidInteger("")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidInteger(123)).toBeFalsy();
            expect(isValidInteger(null)).toBeFalsy();
            expect(isValidInteger(undefined)).toBeFalsy();
            expect(isValidInteger(true)).toBeFalsy();
            expect(isValidInteger([])).toBeFalsy();
            expect(isValidInteger({})).toBeFalsy();
        });

        it("should respect options parameter", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Test with min/max bounds
            expect(isValidInteger("50", { min: 0, max: 100 })).toBeTruthy();
            expect(isValidInteger("-5", { min: 0, max: 100 })).toBeFalsy();
            expect(isValidInteger("150", { min: 0, max: 100 })).toBeFalsy();
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidInteger("+123")).toBeTruthy();
            expect(isValidInteger("  123  ")).toBeFalsy(); // Whitespace not allowed
        });
    });

    describe(isValidNumeric, () => {
        it("should return true for valid numeric strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidNumeric("123")).toBeTruthy();
            expect(isValidNumeric("123.45")).toBeTruthy();
            expect(isValidNumeric("-123.45")).toBeTruthy();
            expect(isValidNumeric("0")).toBeTruthy();
            expect(isValidNumeric("0.5")).toBeTruthy();
            expect(isValidNumeric(".5")).toBeTruthy();
        });

        it("should return false for non-numeric strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidNumeric("abc")).toBeFalsy();
            expect(isValidNumeric("")).toBeFalsy();
            expect(isValidNumeric("12abc")).toBeFalsy();
            expect(isValidNumeric("1.2.3")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidNumeric(123)).toBeFalsy();
            expect(isValidNumeric(null)).toBeFalsy();
            expect(isValidNumeric(undefined)).toBeFalsy();
            expect(isValidNumeric(true)).toBeFalsy();
            expect(isValidNumeric([])).toBeFalsy();
            expect(isValidNumeric({})).toBeFalsy();
        });

        it("should respect options parameter", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Test with min/max bounds
            expect(isValidNumeric("50.5", { min: 0, max: 100 })).toBeTruthy();
            expect(isValidNumeric("-5.5", { min: 0, max: 100 })).toBeFalsy();
            expect(isValidNumeric("150.5", { min: 0, max: 100 })).toBeFalsy();
        });

        it("should handle scientific notation", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidNumeric("1e10")).toBeTruthy();
            expect(isValidNumeric("1E10")).toBeTruthy();
            expect(isValidNumeric("1.5e-10")).toBeTruthy();
        });
    });

    describe(isValidHost, () => {
        it("should return true for valid IP addresses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost("192.168.1.1")).toBeTruthy();
            expect(isValidHost("127.0.0.1")).toBeTruthy();
            expect(isValidHost("10.0.0.1")).toBeTruthy();
            expect(isValidHost("255.255.255.255")).toBeTruthy();
            expect(isValidHost("2001:db8::1")).toBeTruthy(); // IPv6
        });

        it("should return true for valid FQDNs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost("example.com")).toBeTruthy();
            expect(isValidHost("subdomain.example.com")).toBeTruthy();
            expect(isValidHost("test.org")).toBeTruthy();
            expect(isValidHost("my-site.net")).toBeTruthy();
        });

        it("should return true for localhost", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost("localhost")).toBeTruthy();
        });

        it("should return false for invalid hosts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost("invalid..domain")).toBeFalsy();
            expect(isValidHost("")).toBeFalsy();
            expect(isValidHost(".com")).toBeFalsy();
            expect(isValidHost("256.256.256.256")).toBeFalsy(); // Invalid IP
            expect(isValidHost("local")).toBeFalsy(); // No TLD and not localhost
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost(null)).toBeFalsy();
            expect(isValidHost(undefined)).toBeFalsy();
            expect(isValidHost(123)).toBeFalsy();
            expect(isValidHost(true)).toBeFalsy();
            expect(isValidHost([])).toBeFalsy();
            expect(isValidHost({})).toBeFalsy();
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidHost("test_underscore.com")).toBeFalsy(); // Underscores not allowed in FQDN
            expect(isValidHost("*.example.com")).toBeFalsy(); // Wildcards not allowed
        });
    });

    describe(isValidPort, () => {
        it("should return true for valid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(80)).toBeTruthy();
            expect(isValidPort(443)).toBeTruthy();
            expect(isValidPort(1)).toBeTruthy();
            expect(isValidPort(65_535)).toBeTruthy();
            expect(isValidPort(8080)).toBeTruthy();
        });

        it("should return true for valid port strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort("80")).toBeTruthy();
            expect(isValidPort("443")).toBeTruthy();
            expect(isValidPort("1")).toBeTruthy();
            expect(isValidPort("65535")).toBeTruthy();
            expect(isValidPort("8080")).toBeTruthy();
        });

        it("should return false for port 0", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(0)).toBeFalsy();
            expect(isValidPort("0")).toBeFalsy();
        });

        it("should return false for invalid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(-1)).toBeFalsy();
            expect(isValidPort(65_536)).toBeFalsy();
            expect(isValidPort(70_000)).toBeFalsy();
        });

        it("should return false for invalid port strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort("-1")).toBeFalsy();
            expect(isValidPort("65536")).toBeFalsy();
            expect(isValidPort("abc")).toBeFalsy();
            expect(isValidPort("")).toBeFalsy();
            expect(isValidPort("80.5")).toBeFalsy();
        });

        it("should return false for non-number and non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(null)).toBeFalsy();
            expect(isValidPort(undefined)).toBeFalsy();
            expect(isValidPort(true)).toBeFalsy();
            expect(isValidPort([])).toBeFalsy();
            expect(isValidPort({})).toBeFalsy();
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidPort(1.5)).toBeFalsy(); // Non-integer number
            expect(isValidPort("  80  ")).toBeFalsy(); // Whitespace not allowed
        });
    });

    describe(isValidUrl, () => {
        it("should return true for valid URLs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("https://example.com")).toBeTruthy();
            expect(isValidUrl("https://subdomain.example.com")).toBeTruthy();
            expect(isValidUrl("https://example.com/path")).toBeTruthy();
            expect(isValidUrl("https://example.com:8080")).toBeTruthy();
        });

        it("should return true for localhost URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("http://localhost")).toBeTruthy();
            expect(isValidUrl("https://localhost:3000")).toBeTruthy();
            expect(isValidUrl("http://localhost:8080/path")).toBeTruthy();
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

            expect(isValidUrl("http://example.com")).toBeTruthy();
        });

        it("should return false for invalid URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("not-a-url")).toBeFalsy();
            expect(isValidUrl("http://")).toBeFalsy();
            expect(isValidUrl("")).toBeFalsy();
            expect(isValidUrl("//example.com")).toBeFalsy(); // Protocol relative not allowed by default
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl(null)).toBeFalsy();
            expect(isValidUrl(undefined)).toBeFalsy();
            expect(isValidUrl(123)).toBeFalsy();
            expect(isValidUrl(true)).toBeFalsy();
            expect(isValidUrl([])).toBeFalsy();
            expect(isValidUrl({})).toBeFalsy();
        });

        it("should respect options parameter", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Allow protocol relative URLs
            expect(
                isValidUrl("//example.com", {
                    "allow_protocol_relative_urls": true,
                })
            ).toBeFalsy(); // Still false due to require_protocol: true

            // Require TLD
            expect(
                isValidUrl("http://localhost", { "require_tld": true })
            ).toBeFalsy();

            // Custom protocols - FTP is invalid in our validation (HTTP/HTTPS only)
            expect(isValidUrl("ftp://example.com")).toBeFalsy();
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
            ).toBeTruthy();
            expect(isValidUrl("https://192.168.1.1:8080")).toBeTruthy();
        });
    });

    describe(safeInteger, () => {
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
