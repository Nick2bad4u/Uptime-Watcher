/**
 * @fileoverview Comprehensive property-based tests for validator utilities
 *
 * @description
 * This test suite provides extensive property-based testing for all validation
 * utility functions using fast-check and @fast-check/vitest. It covers edge cases,
 * boundary conditions, and invariant properties that should hold for all inputs.
 *
 * @features
 * - Property-based testing for string validation functions
 * - URL and domain validation with comprehensive edge cases
 * - Host and port validation with boundary testing
 * - Integer and numeric validation with format testing
 * - Array validation functions with type safety
 * - Performance testing with large inputs
 *
 * @author GitHub Copilot
 * @since 2025-09-05
 */

import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";

// Import all validator utility functions
import {
    isNonEmptyString,
    isValidFQDN,
    isValidIdentifier,
    isValidUrl,
    isValidHost,
    isValidPort,
    isValidIdentifierArray,
    isValidInteger,
    isValidNumeric,
    safeInteger,
} from "@shared/validation/validatorUtils";

describe("Validator Utils Property-Based Tests", () => {

    describe("isNonEmptyString", () => {
        test.prop([fc.string({ minLength: 1 })])(
            "should return true for all non-empty strings",
            (nonEmptyString) => {
                const result = isNonEmptyString(nonEmptyString);
                expect(result).toBe(true);
            }
        );

        test.prop([fc.oneof(fc.constant(""), fc.string().filter(s => s.trim() === ""))])(
            "should return false for empty or whitespace-only strings",
            (emptyString) => {
                const result = isNonEmptyString(emptyString);
                expect(result).toBe(false);
            }
        );

        test.prop([fc.anything().filter(x => typeof x !== "string")])(
            "should return false for non-string values",
            (nonString) => {
                const result = isNonEmptyString(nonString);
                expect(result).toBe(false);
            }
        );

        test.prop([fc.string()])(
            "should have consistent behavior with string trimming",
            (str) => {
                const result = isNonEmptyString(str);
                const trimmedEmpty = str.trim().length === 0;

                if (trimmedEmpty) {
                    expect(result).toBe(false);
                } else {
                    expect(result).toBe(true);
                }
            }
        );

        it("should handle special characters and unicode", () => {
            const specialStrings = [
                "hello\nworld",
                "test\ttab",
                "emoji 🚀 test",
                "unicode ñáéíóú",
                "mixed αβγ symbols",
                "zero\u0000width",
                "\u200B\u200C\u200D", // Zero-width characters
            ];

            for (const str of specialStrings) {
                const result = isNonEmptyString(str);
                expect(result).toBe(str.trim().length > 0);
            }
        });
    });

    describe("isValidFQDN", () => {
        test.prop([fc.domain()])(
            "should return true for fast-check generated domains",
            (domain) => {
                const result = isValidFQDN(domain);
                expect(result).toBe(true);
            }
        );

        test.prop([
            fc.oneof(
                fc.constant("localhost"), // No TLD
                fc.constant("invalid..domain"),
                fc.constant(".invalid-start"),
                fc.constant("invalid-end."),
                fc.constant("too-many...dots"),
                fc.string({ minLength: 1, maxLength: 5 }).filter(s => !s.includes("."))
            )
        ])(
            "should return false for invalid domain formats",
            (invalidDomain) => {
                const result = isValidFQDN(invalidDomain);
                expect(result).toBe(false);
            }
        );

        test.prop([fc.anything().filter(x => typeof x !== "string")])(
            "should return false for non-string inputs",
            (nonString) => {
                const result = isValidFQDN(nonString);
                expect(result).toBe(false);
            }
        );

        it("should handle various domain formats correctly", () => {
            const validDomains = [
                "example.com",
                "sub.example.com",
                "deep.sub.example.com",
                "test-domain.org",
                "123.456.789.com", // Numeric subdomains are valid
                "a.b.c.d.e.f.com", // Deep nesting
            ];

            const invalidDomains = [
                "localhost", // No TLD by default
                "example", // No TLD
                "", // Empty
                ".", // Just dot
                ".com", // Starting with dot
                "example.", // Ending with dot
                "ex ample.com", // Space in domain
            ];

            for (const domain of validDomains) {
                expect(isValidFQDN(domain)).toBe(true);
            }

            for (const domain of invalidDomains) {
                expect(isValidFQDN(domain)).toBe(false);
            }
        });

        it("should respect FQDN options when provided", () => {
            // Test with require_tld: false to allow localhost
            expect(isValidFQDN("localhost", { require_tld: false })).toBe(true);
            expect(isValidFQDN("localhost", { require_tld: true })).toBe(false);
        });
    });

    describe("isValidIdentifier", () => {
        test.prop([
            // Generate identifiers that must have at least one alphanumeric character
            fc.string({ minLength: 1 })
                .filter(s => /^[\dA-Za-z]+(?:[_-]*[\dA-Za-z]+)*$/.test(s))
        ])(
            "should return true for valid identifier patterns",
            (identifier) => {
                const result = isValidIdentifier(identifier);
                expect(result).toBe(true);
            }
        );

        test.prop([
            fc.oneof(
                fc.string().filter(s => /[^\w-]/.test(s) && s.trim().length > 0),
                fc.constant(""),
                fc.string().filter(s => s.trim().length === 0)
            )
        ])(
            "should return false for invalid identifier patterns",
            (invalidIdentifier) => {
                const result = isValidIdentifier(invalidIdentifier);
                expect(result).toBe(false);
            }
        );

        test.prop([fc.anything().filter(x => typeof x !== "string")])(
            "should return false for non-string inputs",
            (nonString) => {
                const result = isValidIdentifier(nonString);
                expect(result).toBe(false);
            }
        );

        it("should handle specific identifier cases", () => {
            const validIdentifiers = [
                "test",
                "test123",
                "test_name",
                "test-name",
                "TEST_CASE",
                "mixed_123-test",
                "123", // Numbers only
                "_underscore",
                "-hyphen",
            ];

            const invalidIdentifiers = [
                "", // Empty
                "   ", // Whitespace only
                "test@email", // Special characters
                "test.name", // Dots not allowed
                "test name", // Spaces not allowed
                "test/path", // Slashes not allowed
                "test$var", // Dollar signs not allowed
            ];

            for (const id of validIdentifiers) {
                expect(isValidIdentifier(id)).toBe(true);
            }

            for (const id of invalidIdentifiers) {
                expect(isValidIdentifier(id)).toBe(false);
            }
        });
    });

    describe("isValidUrl", () => {
        test.prop([fc.webUrl()])(
            "should return true for fast-check generated URLs",
            (url) => {
                const result = isValidUrl(url);
                expect(result).toBe(true);
            }
        );

        test.prop([
            fc.oneof(
                fc.constant("not-a-url"),
                fc.constant("ftp://example.com"), // Wrong protocol
                fc.constant("http://"), // No domain
                fc.constant("//example.com"), // No protocol
                fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes("://"))
            )
        ])(
            "should return false for invalid URL formats",
            (invalidUrl) => {
                const result = isValidUrl(invalidUrl);
                expect(result).toBe(false);
            }
        );

        test.prop([fc.anything().filter(x => typeof x !== "string")])(
            "should return false for non-string inputs",
            (nonString) => {
                const result = isValidUrl(nonString);
                expect(result).toBe(false);
            }
        );

        it("should validate specific URL cases", () => {
            const validUrls = [
                "http://example.com",
                "https://example.com",
                "https://sub.example.com",
                "http://example.com:8080",
                "https://example.com/path",
                "https://example.com/path?query=1",
                "https://user:pass@example.com",
                "http://192.168.1.1",
                "https://localhost:3000", // Should be valid
            ];

            const invalidUrls = [
                "", // Empty
                "example.com", // No protocol
                "ftp://example.com", // Wrong protocol
                "http://", // No domain
                "https://", // No domain
                "not-a-url",
                "http:example.com", // Wrong format
            ];

            for (const url of validUrls) {
                expect(isValidUrl(url)).toBe(true);
            }

            for (const url of invalidUrls) {
                expect(isValidUrl(url)).toBe(false);
            }
        });
    });

    describe("isValidHost", () => {
        test.prop([
            fc.oneof(
                fc.domain(),
                fc.ipV4(),
                fc.constant("localhost")
            )
        ])(
            "should return true for valid host formats",
            (host) => {
                const result = isValidHost(host);
                expect(result).toBe(true);
            }
        );

        test.prop([
            fc.oneof(
                fc.constant(""),
                fc.constant("invalid..host"),
                fc.constant(".invalid"),
                fc.constant("invalid."),
                fc.string({ minLength: 1, maxLength: 5 }).filter(s =>
                    /[^\d.A-Za-z-]/.test(s) && !/^(?:\d+\.){3}\d+$/.test(s)
                )
            )
        ])(
            "should return false for invalid host formats",
            (invalidHost) => {
                const result = isValidHost(invalidHost);
                expect(result).toBe(false);
            }
        );

        it("should validate specific host cases", () => {
            const validHosts = [
                "localhost",
                "example.com",
                "sub.example.com",
                "127.0.0.1",
                "192.168.1.1",
                "10.0.0.1",
                "255.255.255.255",
                "0.0.0.0",
            ];

            const invalidHosts = [
                "", // Empty
                "256.256.256.256", // Invalid IP
                "-invalid.com", // Starting with hyphen
                "invalid-.com", // Ending with hyphen
                "invalid..com", // Double dots
                ".invalid.com", // Starting with dot
                "invalid.com.", // Ending with dot (might be valid in some contexts)
            ];

            for (const host of validHosts) {
                expect(isValidHost(host)).toBe(true);
            }

            for (const host of invalidHosts) {
                expect(isValidHost(host)).toBe(false);
            }
        });
    });

    describe("isValidPort", () => {
        test.prop([fc.integer({ min: 1, max: 65_535 })])(
            "should return true for valid port numbers",
            (port) => {
                const result = isValidPort(port);
                expect(result).toBe(true);
            }
        );

        test.prop([
            fc.oneof(
                fc.integer({ min: -1000, max: 0 }),
                fc.integer({ min: 65_536, max: 100_000 })
            )
        ])(
            "should return false for invalid port numbers",
            (invalidPort) => {
                const result = isValidPort(invalidPort);
                expect(result).toBe(false);
            }
        );

        test.prop([fc.anything().filter(x => typeof x !== "number" && typeof x !== "string")])(
            "should return false for non-number/non-string inputs",
            (nonNumber) => {
                const result = isValidPort(nonNumber);
                expect(result).toBe(false);
            }
        );

        it("should validate port boundary conditions", () => {
            const validPorts = [1, 80, 443, 3000, 8080, 65_535];
            const invalidPorts = [0, -1, 65_536, 70_000, Number.NaN, Infinity, -Infinity];

            for (const port of validPorts) {
                expect(isValidPort(port)).toBe(true);
            }

            for (const port of invalidPorts) {
                expect(isValidPort(port)).toBe(false);
            }
        });

        test.prop([fc.float()])(
            "should return false for floating point numbers",
            (floatPort) => {
                // Only integers should be valid ports
                if (Number.isInteger(floatPort) && floatPort >= 1 && floatPort <= 65_535) {
                    expect(isValidPort(floatPort)).toBe(true);
                } else {
                    expect(isValidPort(floatPort)).toBe(false);
                }
            }
        );

        it("should handle string port numbers", () => {
            const validStringPorts = ["1", "80", "443", "3000", "65535"];
            const invalidStringPorts = ["0", "-1", "65536", "abc", "123.45", ""];

            for (const port of validStringPorts) {
                expect(isValidPort(port)).toBe(true);
            }

            for (const port of invalidStringPorts) {
                expect(isValidPort(port)).toBe(false);
            }
        });
    });

    describe("isValidIdentifierArray", () => {
        test.prop([
            fc.array(
                // Generate identifiers that must have at least one alphanumeric character
                fc.string({ minLength: 1 })
                    .filter(s => /^[\dA-Za-z]+(?:[_-]*[\dA-Za-z]+)*$/.test(s))
            )
        ])(
            "should return true for arrays of valid identifiers",
            (identifierArray) => {
                const result = isValidIdentifierArray(identifierArray);
                expect(result).toBe(true);
            }
        );

        test.prop([
            fc.oneof(
                fc.array(fc.oneof(
                    fc.string().filter(s => /[^\w-]/.test(s)),
                    fc.constant(""),
                    fc.anything().filter(x => typeof x !== "string")
                ), { minLength: 1 }), // Ensure non-empty array for invalid case
                fc.anything().filter(x => !Array.isArray(x))
            )
        ])(
            "should return false for invalid identifier arrays",
            (invalidArray) => {
                const result = isValidIdentifierArray(invalidArray);
                expect(result).toBe(false);
            }
        );

        it("should validate specific array cases", () => {
            const validArrays = [
                [],
                ["test"],
                ["test1", "test2", "test3"],
                ["valid_identifier", "another-identifier", "123"],
            ];

            const invalidArrays = [
                null,
                undefined,
                "not-an-array",
                ["valid", "invalid.identifier"],
                ["valid", ""],
                ["valid", null],
                [1, 2, 3], // Numbers instead of strings
            ];

            for (const arr of validArrays) {
                expect(isValidIdentifierArray(arr)).toBe(true);
            }

            for (const arr of invalidArrays) {
                expect(isValidIdentifierArray(arr)).toBe(false);
            }
        });
    });

    describe("isValidInteger", () => {
        test.prop([fc.integer().map(n => n.toString())])(
            "should return true for string representations of integers",
            (intString) => {
                const result = isValidInteger(intString);
                expect(result).toBe(true);
            }
        );

        test.prop([
            fc.oneof(
                fc.float().filter(n => !Number.isInteger(n)).map(n => n.toString()),
                fc.string().filter(s => Number.isNaN(Number(s))),
                fc.anything().filter(x => typeof x !== "string")
            )
        ])(
            "should return false for non-integer strings",
            (nonIntString) => {
                const result = isValidInteger(nonIntString);
                expect(result).toBe(false);
            }
        );

        it("should validate integer strings with bounds", () => {
            expect(isValidInteger("50", { min: 0, max: 100 })).toBe(true);
            expect(isValidInteger("150", { min: 0, max: 100 })).toBe(false);
            expect(isValidInteger("-10", { min: 0, max: 100 })).toBe(false);
        });
    });

    describe("isValidNumeric", () => {
        test.prop([fc.float({ noNaN: true, noDefaultInfinity: true }).map(n => n.toString())])(
            "should return true for string representations of numbers",
            (numString) => {
                const result = isValidNumeric(numString);
                expect(result).toBe(true);
            }
        );

        test.prop([
            fc.oneof(
                fc.string().filter(s => Number.isNaN(Number(s)) && s !== ""),
                fc.anything().filter(x => typeof x !== "string")
            )
        ])(
            "should return false for non-numeric strings",
            (nonNumString) => {
                const result = isValidNumeric(nonNumString);
                expect(result).toBe(false);
            }
        );

        it("should validate numeric strings with bounds", () => {
            expect(isValidNumeric("50.5", { min: 0, max: 100 })).toBe(true);
            expect(isValidNumeric("150.5", { min: 0, max: 100 })).toBe(false);
            expect(isValidNumeric("-10.5", { min: 0, max: 100 })).toBe(false);
        });
    });

    describe("safeInteger", () => {
        test.prop([
            fc.integer(),
            fc.integer(),
            fc.integer().filter(x => x >= 0),
            fc.integer().filter(x => x >= 0)
        ])(
            "should convert valid integers within bounds",
            (value, defaultValue, min, max) => {
                const actualMax = Math.max(min, max);
                const actualMin = Math.min(min, max);

                const result = safeInteger(value.toString(), defaultValue, actualMin, actualMax);

                expect(typeof result).toBe("number");
                expect(Number.isInteger(result)).toBe(true);

                if (value >= actualMin && value <= actualMax) {
                    expect(result).toBe(value);
                } else if (value < actualMin) {
                    expect(result).toBe(actualMin);
                } else if (value > actualMax) {
                    expect(result).toBe(actualMax);
                }
            }
        );

        test.prop([
            fc.oneof(fc.float().filter(n => !Number.isInteger(n)), fc.string().filter(s => Number.isNaN(Number(s)))),
            fc.integer()
        ])(
            "should return default value for invalid inputs",
            (invalidValue, defaultValue) => {
                const result = safeInteger(invalidValue, defaultValue);
                expect(result).toBe(defaultValue);
            }
        );

        it("should handle boundary cases", () => {
            expect(safeInteger("50", 0, 0, 100)).toBe(50);
            expect(safeInteger("-10", 0, 0, 100)).toBe(0); // Clamped to min
            expect(safeInteger("150", 0, 0, 100)).toBe(100); // Clamped to max
            expect(safeInteger("abc", 42, 0, 100)).toBe(42); // Default value
        });
    });

    describe("Performance and Edge Cases", () => {
        test.prop([fc.string({ minLength: 1000, maxLength: 10_000 })])(
            "should handle very long strings efficiently",
            (longString) => {
                const start = performance.now();

                // Test all string validators with long input
                isNonEmptyString(longString);
                isValidFQDN(longString);
                isValidIdentifier(longString);
                isValidUrl(longString);
                isValidHost(longString);

                const end = performance.now();

                // Should complete within reasonable time (1 second)
                expect(end - start).toBeLessThan(1000);
            }
        );

        test.prop([fc.array(fc.string(), { maxLength: 10_000 })])(
            "should handle very large arrays efficiently",
            (largeArray) => {
                const start = performance.now();

                isValidIdentifierArray(largeArray);

                const end = performance.now();

                // Should complete within reasonable time
                expect(end - start).toBeLessThan(1000);
            }
        );

        it("should handle unicode and special characters", () => {
            const unicodeStrings = [
                "test🚀emoji",
                "ñáéíóú",
                "αβγδε",
                "测试",
                "тест",
                "🌟⭐️✨",
            ];

            for (const str of unicodeStrings) {
                // Should not crash on unicode input
                expect(() => {
                    isNonEmptyString(str);
                    isValidIdentifier(str);
                    isValidFQDN(str);
                    isValidUrl(str);
                }).not.toThrow();
            }
        });

        it("should be consistent with repeated calls", () => {
            const testInputs = [
                "https://example.com",
                "example.com",
                "localhost",
                "test-identifier",
                ["test", "array"],
            ];

            for (const input of testInputs) {
                // Call each relevant validator multiple times
                const results1 = [
                    isNonEmptyString(input),
                    isValidUrl(input),
                    isValidFQDN(input),
                    isValidHost(input),
                    isValidIdentifier(input),
                ];

                const results2 = [
                    isNonEmptyString(input),
                    isValidUrl(input),
                    isValidFQDN(input),
                    isValidHost(input),
                    isValidIdentifier(input),
                ];

                // Results should be identical
                expect(results1).toEqual(results2);
            }
        });
    });

    describe("Type Guard Behavior", () => {
        it("should properly narrow types when used as type guards", () => {
            const mixedArray: unknown[] = [
                "valid string",
                null,
                undefined,
                123,
                true,
                {},
                [],
                "another string",
            ];

            const strings = mixedArray.filter((item): item is string => isNonEmptyString(item));

            // All filtered items should be strings
            for (const item of strings) {
                expect(typeof item).toBe("string");
                expect(item.length).toBeGreaterThan(0);
            }
        });

        test.prop([fc.array(fc.anything())])(
            "type guards should maintain type safety",
            (mixedArray) => {
                // Filter with type guards
                const strings = mixedArray.filter((item): item is string => isNonEmptyString(item));
                const identifierArrays = mixedArray.filter((item): item is readonly string[] => isValidIdentifierArray(item));

                // All results should satisfy the type predicate
                for (const str of strings) {
                    expect(typeof str).toBe("string");
                    expect(str.trim().length).toBeGreaterThan(0);
                }

                for (const arr of identifierArrays) {
                    expect(Array.isArray(arr)).toBe(true);
                    if (Array.isArray(arr)) {
                        for (const item of arr) {
                            expect(typeof item).toBe("string");
                        }
                    }
                }
            }
        );
    });
});
