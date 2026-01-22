/**
 * Complete Function Coverage Tests for validatorUtils.ts This test file ensures
 * 100% function coverage using the Function Coverage Validation pattern. It
 * systematically calls every exported function to guarantee coverage. Generated
 * for 100% test coverage initiative.
 */

import { describe, expect, it } from "vitest";
import * as validatorUtilsModule from "../../validation/validatorUtils";

describe("ValidatorUtils - Complete Function Coverage", () => {
    describe("Function Coverage Validation", () => {
        it("should call every exported function for complete coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validatorUtils-complete-function-coverage",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Export Operation", "type");

            // Test isNonEmptyString function coverage
            expect(typeof validatorUtilsModule.isNonEmptyString).toBe(
                "function"
            );
            expect(validatorUtilsModule.isNonEmptyString("hello")).toBeTruthy();
            expect(validatorUtilsModule.isNonEmptyString("")).toBeFalsy();
            expect(validatorUtilsModule.isNonEmptyString("   ")).toBeFalsy(); // Whitespace only
            expect(validatorUtilsModule.isNonEmptyString(null)).toBeFalsy();
            expect(
                validatorUtilsModule.isNonEmptyString(undefined)
            ).toBeFalsy();
            expect(validatorUtilsModule.isNonEmptyString(123)).toBeFalsy();

            // Test isValidFQDN function coverage
            expect(typeof validatorUtilsModule.isValidFQDN).toBe("function");
            expect(
                validatorUtilsModule.isValidFQDN("example.com")
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidFQDN("sub.example.com")
            ).toBeTruthy();
            expect(validatorUtilsModule.isValidFQDN("localhost")).toBeFalsy(); // No TLD by default
            expect(
                validatorUtilsModule.isValidFQDN("invalid..domain")
            ).toBeFalsy();
            expect(validatorUtilsModule.isValidFQDN(123)).toBeFalsy();
            expect(validatorUtilsModule.isValidFQDN(null)).toBeFalsy();
            // Test with options
            expect(
                validatorUtilsModule.isValidFQDN("localhost", {
                    require_tld: false,
                })
            ).toBeTruthy();

            // Test isValidIdentifier function coverage
            expect(typeof validatorUtilsModule.isValidIdentifier).toBe(
                "function"
            );
            expect(
                validatorUtilsModule.isValidIdentifier("abc123")
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidIdentifier("abc-123_def")
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidIdentifier("valid_identifier")
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidIdentifier("abc@123")
            ).toBeFalsy();
            expect(validatorUtilsModule.isValidIdentifier("")).toBeFalsy();
            expect(validatorUtilsModule.isValidIdentifier("   ")).toBeFalsy(); // Whitespace only
            expect(validatorUtilsModule.isValidIdentifier(null)).toBeFalsy();
            expect(validatorUtilsModule.isValidIdentifier(123)).toBeFalsy();

            // Test isValidIdentifierArray function coverage
            expect(typeof validatorUtilsModule.isValidIdentifierArray).toBe(
                "function"
            );
            expect(
                validatorUtilsModule.isValidIdentifierArray(["abc", "def-123"])
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidIdentifierArray(["valid_id"])
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidIdentifierArray([])
            ).toBeTruthy(); // Empty array is valid
            expect(
                validatorUtilsModule.isValidIdentifierArray(["abc", 123])
            ).toBeFalsy();
            expect(
                validatorUtilsModule.isValidIdentifierArray(["abc", ""])
            ).toBeFalsy();
            expect(
                validatorUtilsModule.isValidIdentifierArray([
                    "abc",
                    "invalid@id",
                ])
            ).toBeFalsy();
            expect(
                validatorUtilsModule.isValidIdentifierArray("not-array")
            ).toBeFalsy();
            expect(
                validatorUtilsModule.isValidIdentifierArray(null)
            ).toBeFalsy();

            // Test isValidInteger function coverage
            expect(typeof validatorUtilsModule.isValidInteger).toBe("function");
            expect(validatorUtilsModule.isValidInteger("123")).toBeTruthy();
            expect(validatorUtilsModule.isValidInteger("-456")).toBeTruthy();
            expect(validatorUtilsModule.isValidInteger("0")).toBeTruthy();
            expect(validatorUtilsModule.isValidInteger("123.45")).toBeFalsy();
            expect(validatorUtilsModule.isValidInteger("abc")).toBeFalsy();
            expect(validatorUtilsModule.isValidInteger("")).toBeFalsy();
            expect(validatorUtilsModule.isValidInteger(123)).toBeFalsy(); // Number not string
            expect(validatorUtilsModule.isValidInteger(null)).toBeFalsy();
            // Test with options
            expect(
                validatorUtilsModule.isValidInteger("123", {
                    min: 100,
                    max: 200,
                })
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidInteger("50", {
                    min: 100,
                    max: 200,
                })
            ).toBeFalsy();

            // Test isValidNumeric function coverage
            expect(typeof validatorUtilsModule.isValidNumeric).toBe("function");
            expect(validatorUtilsModule.isValidNumeric("123.45")).toBeTruthy();
            expect(validatorUtilsModule.isValidNumeric("123")).toBeTruthy();
            expect(validatorUtilsModule.isValidNumeric("-456.78")).toBeTruthy();
            expect(validatorUtilsModule.isValidNumeric("0")).toBeTruthy();
            expect(validatorUtilsModule.isValidNumeric("abc")).toBeFalsy();
            expect(validatorUtilsModule.isValidNumeric("")).toBeFalsy();
            expect(validatorUtilsModule.isValidNumeric(123.45)).toBeFalsy(); // Number not string
            expect(validatorUtilsModule.isValidNumeric(null)).toBeFalsy();
            // Test with options
            expect(
                validatorUtilsModule.isValidNumeric("50.5", {
                    min: 10,
                    max: 100,
                })
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidNumeric("5.5", {
                    min: 10,
                    max: 100,
                })
            ).toBeFalsy();

            // Test isValidHost function coverage
            expect(typeof validatorUtilsModule.isValidHost).toBe("function");
            expect(
                validatorUtilsModule.isValidHost("192.168.1.1")
            ).toBeTruthy(); // IP address
            expect(
                validatorUtilsModule.isValidHost("example.com")
            ).toBeTruthy(); // FQDN
            expect(validatorUtilsModule.isValidHost("localhost")).toBeTruthy(); // Special case
            expect(
                validatorUtilsModule.isValidHost("sub.example.com")
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidHost("invalid..host")
            ).toBeFalsy();
            expect(validatorUtilsModule.isValidHost("no-tld")).toBeFalsy();
            expect(validatorUtilsModule.isValidHost("")).toBeFalsy();
            expect(validatorUtilsModule.isValidHost(123)).toBeFalsy();
            expect(validatorUtilsModule.isValidHost(null)).toBeFalsy();

            // Test isValidPort function coverage
            expect(typeof validatorUtilsModule.isValidPort).toBe("function");
            expect(validatorUtilsModule.isValidPort(80)).toBeTruthy(); // Number
            expect(validatorUtilsModule.isValidPort("443")).toBeTruthy(); // String
            expect(validatorUtilsModule.isValidPort("8080")).toBeTruthy();
            expect(validatorUtilsModule.isValidPort(65_535)).toBeTruthy(); // Max valid port
            expect(validatorUtilsModule.isValidPort(1)).toBeTruthy(); // Min valid port
            expect(validatorUtilsModule.isValidPort(0)).toBeFalsy(); // Reserved port
            expect(validatorUtilsModule.isValidPort("0")).toBeFalsy(); // Reserved port string
            expect(validatorUtilsModule.isValidPort(70_000)).toBeFalsy(); // Too high
            expect(validatorUtilsModule.isValidPort("abc")).toBeFalsy();
            expect(validatorUtilsModule.isValidPort(null)).toBeFalsy();
            expect(validatorUtilsModule.isValidPort(undefined)).toBeFalsy();

            // Test isValidUrl function coverage
            expect(typeof validatorUtilsModule.isValidUrl).toBe("function");
            expect(
                validatorUtilsModule.isValidUrl("https://example.com")
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidUrl("http://localhost:3000")
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidUrl("https://sub.example.com/path")
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidUrl("ftp://example.com")
            ).toBeFalsy();
            expect(validatorUtilsModule.isValidUrl("not-a-url")).toBeFalsy();
            expect(validatorUtilsModule.isValidUrl("https://")).toBeFalsy();
            expect(validatorUtilsModule.isValidUrl("")).toBeFalsy();
            expect(validatorUtilsModule.isValidUrl(123)).toBeFalsy();
            expect(validatorUtilsModule.isValidUrl(null)).toBeFalsy();
            // Test with options
            expect(
                validatorUtilsModule.isValidUrl("https://example.com", {
                    require_tld: true,
                })
            ).toBeTruthy();

            // Test safeInteger function coverage
            expect(typeof validatorUtilsModule.safeInteger).toBe("function");
            expect(validatorUtilsModule.safeInteger("123", 0)).toBe(123);
            expect(validatorUtilsModule.safeInteger("abc", 0)).toBe(0); // Invalid returns default
            expect(validatorUtilsModule.safeInteger("", 5)).toBe(5); // Empty string returns default
            expect(validatorUtilsModule.safeInteger(null, 10)).toBe(10);
            expect(validatorUtilsModule.safeInteger(undefined, 15)).toBe(15);
            // Test with bounds
            expect(validatorUtilsModule.safeInteger("50", 0, 10, 100)).toBe(50);
            expect(validatorUtilsModule.safeInteger("5", 0, 10, 100)).toBe(10); // Below min, clamped
            expect(validatorUtilsModule.safeInteger("150", 0, 10, 100)).toBe(
                100
            ); // Above max, clamped
            expect(
                validatorUtilsModule.safeInteger("123", 0, undefined, 100)
            ).toBe(100); // No min, above max
            expect(
                validatorUtilsModule.safeInteger("5", 0, 10, undefined)
            ).toBe(10); // No max, below min
        });

        it("should handle edge cases and complex validations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validatorUtils-complete-function-coverage",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Test isNonEmptyString with various whitespace
            expect(validatorUtilsModule.isNonEmptyString("\t\n")).toBeFalsy();
            expect(
                validatorUtilsModule.isNonEmptyString("  hello  ")
            ).toBeTruthy(); // Non-empty after trim

            // Test isValidFQDN with various options
            expect(
                validatorUtilsModule.isValidFQDN("example.com.", {
                    allow_trailing_dot: true,
                })
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidFQDN("example.com.", {
                    allow_trailing_dot: false,
                })
            ).toBeFalsy();

            // Test isValidIdentifier edge cases
            expect(validatorUtilsModule.isValidIdentifier("_")).toBeFalsy(); // Single underscore becomes empty after replacement
            expect(validatorUtilsModule.isValidIdentifier("-")).toBeFalsy(); // Single hyphen becomes empty after replacement
            expect(validatorUtilsModule.isValidIdentifier("123")).toBeTruthy(); // Numbers only

            // Test isValidHost with IPv6
            expect(validatorUtilsModule.isValidHost("::1")).toBeTruthy(); // IPv6 localhost
            expect(
                validatorUtilsModule.isValidHost("2001:db8::1")
            ).toBeTruthy(); // IPv6 address

            // Test isValidPort boundary conditions
            expect(validatorUtilsModule.isValidPort("65535")).toBeTruthy(); // Max port
            expect(validatorUtilsModule.isValidPort("65536")).toBeFalsy(); // Above max
            expect(validatorUtilsModule.isValidPort("-1")).toBeFalsy(); // Negative

            // Test safeInteger with decimal strings
            expect(validatorUtilsModule.safeInteger("123.45", 0)).toBe(0); // Decimals are invalid integers
            expect(validatorUtilsModule.safeInteger("0", 5, 1, 10)).toBe(1); // Zero below min
        });

        it("should validate numeric ranges and bounds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validatorUtils-complete-function-coverage",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Test isValidInteger with comprehensive range options
            expect(
                validatorUtilsModule.isValidInteger("0", { min: 0 })
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidInteger("-1", { min: 0 })
            ).toBeFalsy();
            expect(
                validatorUtilsModule.isValidInteger("100", { max: 100 })
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidInteger("101", { max: 100 })
            ).toBeFalsy();

            // Test isValidNumeric with range options
            expect(
                validatorUtilsModule.isValidNumeric("50.5", { min: 50 })
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidNumeric("49.9", { min: 50 })
            ).toBeFalsy();
            expect(
                validatorUtilsModule.isValidNumeric("100.0", { max: 100 })
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidNumeric("100.1", { max: 100 })
            ).toBeFalsy();

            // Test safeInteger comprehensive bounds handling
            const result1 = validatorUtilsModule.safeInteger("50", 0, 10, 100);
            expect(result1).toBe(50);

            const result2 = validatorUtilsModule.safeInteger("200", 0, 10, 100);
            expect(result2).toBe(100); // Clamped to max

            const result3 = validatorUtilsModule.safeInteger("5", 0, 10, 100);
            expect(result3).toBe(10); // Clamped to min
        });

        it("should handle type validation consistency", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validatorUtils-complete-function-coverage",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Verify that type guards work consistently
            const testValue = "test123";

            expect(
                validatorUtilsModule.isNonEmptyString(testValue)
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidIdentifier(testValue)
            ).toBeTruthy();

            // Test array consistency
            const validIds = [
                "id1",
                "id2-test",
                "id_3",
            ];
            expect(
                validatorUtilsModule.isValidIdentifierArray(validIds)
            ).toBeTruthy();
            expect(
                validIds.every((id) =>
                    validatorUtilsModule.isValidIdentifier(id)
                )
            ).toBeTruthy();

            // Test URL and host validation
            const validHost = "example.com";
            expect(validatorUtilsModule.isValidHost(validHost)).toBeTruthy();
            expect(
                validatorUtilsModule.isValidUrl(`https://${validHost}`)
            ).toBeTruthy();

            // Test numeric validation consistency
            const numericString = "123";
            expect(
                validatorUtilsModule.isValidInteger(numericString)
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidNumeric(numericString)
            ).toBeTruthy();
            expect(validatorUtilsModule.safeInteger(numericString, 0)).toBe(
                123
            );
        });
    });
});
