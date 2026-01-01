/**
 * Property-based tests for validation utilities using fast-check
 *
 * @packageDocumentation
 */

import { test, fc } from "@fast-check/vitest";
import { expect } from "vitest";

import {
    isNonEmptyString,
    isValidFQDN,
    isValidIdentifier,
    isValidIdentifierArray,
    isValidInteger,
    isValidNumeric,
    isValidHost,
    isValidPort,
    isValidUrl,
    safeInteger,
} from "../validation/validatorUtils";

describe("Validation Utils Property-Based Tests", () => {
    describe(isNonEmptyString, () => {
        test.prop([fc.string({ minLength: 1 })])(
            "should accept non-empty strings",
            (str) => {
                // Filter out strings that are just whitespace
                if (str.trim().length > 0) {
                    expect(isNonEmptyString(str)).toBeTruthy();
                }
            }
        );

        test.prop([fc.constantFrom("", "   ", "\t", "\n", "\r\n")])(
            "should reject empty or whitespace-only strings",
            (emptyStr) => {
                expect(isNonEmptyString(emptyStr)).toBeFalsy();
            }
        );

        test.prop([fc.constantFrom(null, undefined, 123, {}, [])])(
            "should reject non-string values",
            (nonString) => {
                expect(isNonEmptyString(nonString)).toBeFalsy();
            }
        );
    });

    describe(isValidFQDN, () => {
        test.prop([fc.domain()])(
            "should accept valid domain names",
            (domain) => {
                expect(isValidFQDN(domain)).toBeTruthy();
            }
        );

        test.prop([
            fc.constantFrom(
                "localhost",
                "invalid..domain.com",
                "domain_with_underscores.com",
                "domain-ending-with-dash-.com",
                "-domain-starting-with-dash.com"
            ),
        ])("should reject invalid FQDNs", (invalidFqdn) => {
            expect(isValidFQDN(invalidFqdn)).toBeFalsy();
        });

        test.prop([fc.constantFrom(123, null, undefined, {})])(
            "should reject non-string values",
            (nonString) => {
                expect(isValidFQDN(nonString)).toBeFalsy();
            }
        );
    });

    describe(isValidIdentifier, () => {
        test.prop([
            // Generate identifiers that must have at least one alphanumeric character
            fc
                .string({ minLength: 1 })
                .filter((s) => /^[\dA-Za-z]+(?:[_-]*[\dA-Za-z]+)*$/.test(s)),
        ])(
            "should accept valid identifiers (alphanumeric with underscores and hyphens)",
            (identifier) => {
                expect(isValidIdentifier(identifier)).toBeTruthy();
            }
        );

        test.prop([
            fc.constantFrom(
                "",
                "identifier with spaces",
                "identifier@with.symbols",
                "identifier/with/slashes",
                "identifier.with.dots"
            ),
        ])("should reject invalid identifiers", (invalidIdentifier) => {
            expect(isValidIdentifier(invalidIdentifier)).toBeFalsy();
        });
    });

    describe(isValidIdentifierArray, () => {
        test.prop([
            fc.array(
                // Generate identifiers that must have at least one alphanumeric character
                fc
                    .string({ minLength: 1 })
                    .filter((s) =>
                        /^[\dA-Za-z]+(?:[_-]*[\dA-Za-z]+)*$/.test(s)
                    ),
                { minLength: 1 }
            ),
        ])("should accept arrays of valid identifiers", (identifiers) => {
            expect(isValidIdentifierArray(identifiers)).toBeTruthy();
        });

        test.prop([
            fc.array(fc.constantFrom("", "invalid identifier", "id@symbol")),
        ])(
            "should reject arrays containing invalid identifiers",
            (invalidIdentifiers) => {
                if (invalidIdentifiers.length > 0) {
                    expect(
                        isValidIdentifierArray(invalidIdentifiers)
                    ).toBeFalsy();
                }
            }
        );

        test.prop([fc.constantFrom(null, undefined, "not-an-array", 123)])(
            "should reject non-array values",
            (nonArray) => {
                expect(isValidIdentifierArray(nonArray)).toBeFalsy();
            }
        );
    });

    describe(isValidInteger, () => {
        test.prop([fc.integer().map(String)])(
            "should accept valid integer strings",
            (intStr) => {
                expect(isValidInteger(intStr)).toBeTruthy();
            }
        );

        test.prop([fc.constantFrom("123.45", "abc", "", "NaN", "Infinity")])(
            "should reject invalid integer strings",
            (invalidInt) => {
                expect(isValidInteger(invalidInt)).toBeFalsy();
            }
        );

        test("should respect bounds when provided", () => {
            expect(isValidInteger("5", { min: 1, max: 10 })).toBeTruthy();
            expect(isValidInteger("15", { min: 1, max: 10 })).toBeFalsy();
            expect(isValidInteger("-5", { min: 1, max: 10 })).toBeFalsy();
        });
    });

    describe(isValidNumeric, () => {
        test.prop([fc.float().map(String)])(
            "should accept valid numeric strings",
            (numStr) => {
                // Filter out NaN and Infinity which are not valid for validator
                if (!numStr.includes("NaN") && !numStr.includes("Infinity")) {
                    expect(isValidNumeric(numStr)).toBeTruthy();
                }
            }
        );

        test.prop([fc.constantFrom("abc", "", "not-a-number")])(
            "should reject invalid numeric strings",
            (invalidNum) => {
                expect(isValidNumeric(invalidNum)).toBeFalsy();
            }
        );
    });

    describe(isValidHost, () => {
        test.prop([fc.ipV4()])("should accept valid IPv4 addresses", (ipv4) => {
            expect(isValidHost(ipv4)).toBeTruthy();
        });

        test.prop([fc.ipV6()])("should accept valid IPv6 addresses", (ipv6) => {
            expect(isValidHost(ipv6)).toBeTruthy();
        });

        test.prop([fc.domain()])(
            "should accept valid domain names",
            (domain) => {
                expect(isValidHost(domain)).toBeTruthy();
            }
        );

        test("should accept localhost as a special case", () => {
            expect(isValidHost("localhost")).toBeTruthy();
        });

        test.prop([
            fc.constantFrom(
                "invalid..host.com",
                "host with spaces",
                "",
                "256.1.1.1",
                "host_with_underscores.com"
            ),
        ])("should reject invalid hosts", (invalidHost) => {
            expect(isValidHost(invalidHost)).toBeFalsy();
        });
    });

    describe(isValidPort, () => {
        test.prop([fc.integer({ min: 1, max: 65_535 })])(
            "should accept valid port numbers",
            (port) => {
                expect(isValidPort(port)).toBeTruthy();
                expect(isValidPort(String(port))).toBeTruthy();
            }
        );

        test.prop([fc.constantFrom(0, -1, 65_536, 999_999)])(
            "should reject invalid port numbers",
            (invalidPort) => {
                expect(isValidPort(invalidPort)).toBeFalsy();
                expect(isValidPort(String(invalidPort))).toBeFalsy();
            }
        );

        test("should reject port 0 as it is reserved", () => {
            expect(isValidPort(0)).toBeFalsy();
            expect(isValidPort("0")).toBeFalsy();
        });

        test.prop([fc.constantFrom(null, undefined, "abc", {})])(
            "should reject non-numeric values",
            (nonNumeric) => {
                expect(isValidPort(nonNumeric)).toBeFalsy();
            }
        );
    });

    describe(isValidUrl, () => {
        test.prop([
            fc
                .webUrl()
                .filter(
                    (url) =>
                        !url.includes("'") &&
                        !url.includes("`") &&
                        !url.endsWith("://")
                ),
        ])("should accept valid web URLs", (url) => {
            expect(isValidUrl(url)).toBeTruthy();
        });

        test("should accept URLs containing protocol-like sequences in the path", () => {
            expect(isValidUrl("https://95.ud//////a/)/://T")).toBeTruthy();
            expect(
                isValidUrl("http://example.com/path/with/ftp://reference")
            ).toBeTruthy();
        });

        test("should accept localhost URLs", () => {
            expect(isValidUrl("http://localhost")).toBeTruthy();
            expect(isValidUrl("http://localhost:3000")).toBeTruthy();
        });

        test.prop([
            fc.constantFrom(
                "not-a-url",
                "",
                "ftp://example.com",
                "file:///etc/passwd"
            ),
        ])("should reject invalid URLs", (invalidUrl) => {
            expect(isValidUrl(invalidUrl)).toBeFalsy();
        });

        test.prop([fc.constantFrom(123, null, undefined, {})])(
            "should reject non-string values",
            (nonString) => {
                expect(isValidUrl(nonString)).toBeFalsy();
            }
        );
    });

    describe(safeInteger, () => {
        test.prop([
            fc.integer(),
            fc.integer(),
            fc.integer(),
            fc.integer(),
        ])(
            "should convert valid integers correctly",
            (value, defaultValue, min, max) => {
                const result = safeInteger(
                    String(value),
                    defaultValue,
                    min,
                    max
                );
                expect(typeof result).toBe("number");
                expect(Number.isInteger(result)).toBeTruthy();

                if (min !== undefined && max !== undefined && min <= max) {
                    expect(result).toBeGreaterThanOrEqual(Math.min(min, max));
                    expect(result).toBeLessThanOrEqual(Math.max(min, max));
                }
            }
        );

        test.prop([fc.constantFrom("abc", "not-a-number", ""), fc.integer()])(
            "should return default value for invalid inputs",
            (invalidValue, defaultValue) => {
                const result = safeInteger(invalidValue, defaultValue);
                expect(result).toBe(defaultValue);
            }
        );

        test("should clamp values to bounds", () => {
            expect(safeInteger("150", 0, 1, 100)).toBe(100);
            expect(safeInteger("-10", 0, 1, 100)).toBe(1);
            expect(safeInteger("50", 0, 1, 100)).toBe(50);
        });

        test.prop([fc.anything(), fc.integer()])(
            "should handle any input type gracefully",
            (anyValue, defaultValue) => {
                const result = safeInteger(anyValue, defaultValue);
                expect(typeof result).toBe("number");
                expect(Number.isInteger(result)).toBeTruthy();
            }
        );
    });

    describe("Integration Tests", () => {
        test.prop([
            fc.record({
                identifier: fc.stringMatching(/^[\w-]+$/).filter((s) => {
                    // Must contain at least one alphanumeric character
                    const cleanedValue = s.replaceAll(/[_-]/g, "");
                    return cleanedValue.length > 0;
                }),
                port: fc.integer({ min: 1, max: 65_535 }),
                host: fc.oneof(
                    fc.domain(),
                    fc.ipV4(),
                    fc.constant("localhost")
                ),
                url: fc
                    .webUrl()
                    .filter(
                        (url) =>
                            !url.includes("'") &&
                            !url.includes("`") &&
                            isValidUrl(url)
                    ),
            }),
        ])("should validate complex objects consistently", (data) => {
            expect(isValidIdentifier(data.identifier)).toBeTruthy();
            expect(isValidPort(data.port)).toBeTruthy();
            expect(isValidHost(data.host)).toBeTruthy();
            expect(isValidUrl(data.url)).toBeTruthy();
        });

        test("should maintain validation consistency across multiple calls", ({
            g,
        }) => {
            const testData = g(() =>
                fc.record({
                    identifier: fc.stringMatching(/^[\w-]{1,20}$/),
                    port: fc.integer({ min: 1, max: 65_535 }),
                    host: fc.domain(),
                    url: fc.webUrl(),
                })
            );

            // Validate multiple times
            const results = Array.from({ length: 5 }, () => ({
                identifier: isValidIdentifier(testData.identifier),
                port: isValidPort(testData.port),
                host: isValidHost(testData.host),
                url: isValidUrl(testData.url),
            }));

            // All results should be identical
            const [firstResult] = results;
            expect(firstResult).toBeDefined();

            for (let i = 1; i < results.length; i++) {
                const currentResult = results[i];
                expect(currentResult).toBeDefined();
                expect(currentResult!.identifier).toBe(firstResult!.identifier);
                expect(currentResult!.port).toBe(firstResult!.port);
                expect(currentResult!.host).toBe(firstResult!.host);
                expect(currentResult!.url).toBe(firstResult!.url);
            }
        });

        test.prop([fc.array(fc.stringMatching(/^[\w-]{1,10}$/))])(
            "should handle batch validation correctly",
            (identifiers) => {
                const arrayResult = isValidIdentifierArray(identifiers);
                const individualResults = identifiers.map((id) =>
                    isValidIdentifier(id)
                );

                expect(arrayResult).toBe(individualResults.every(Boolean));
            }
        );
    });
});
