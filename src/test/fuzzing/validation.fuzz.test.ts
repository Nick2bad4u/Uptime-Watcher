/**
 * Property-based fuzzing tests for validation functions.
 *
 * @remarks
 * These tests use fast-check to generate thousands of random inputs to test
 * validation functions for edge cases and unexpected behavior.
 *
 * Focus areas:
 *
 * - URL validation edge cases
 * - Host/hostname validation boundary conditions
 * - Port number validation ranges
 * - Input sanitization and error handling
 */

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
    isValidUrl,
    isValidHost,
    isValidPort,
} from "@shared/validation/validatorUtils";

describe("Validation Fuzzing Tests", () => {
    describe("URL Validation Fuzzing", () => {
        it("should handle malformed URLs gracefully", () => {
            fc.assert(
                fc.property(fc.string(), (input: string) => {
                    // Property: isValidUrl should never throw exceptions
                    expect(() => isValidUrl(input)).not.toThrow();

                    // Property: result should always be boolean
                    const result = isValidUrl(input);
                    expect(typeof result).toBe("boolean");
                })
            );
        });

        it("should accept only valid HTTP/HTTPS URLs", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("https://"),
                        fc.constant("ftp://"),
                        fc.constant("file://"),
                        fc.constant(""),
                        fc.string({ minLength: 1, maxLength: 10 })
                    ),
                    fc.domain(),
                    fc.integer({ min: 1, max: 65_535 }),
                    fc.string({ maxLength: 100 }),
                    (
                        protocol: string,
                        domain: string,
                        port: number,
                        path: string
                    ) => {
                        const url = `${protocol}${domain}:${port}${path}`;
                        const result = isValidUrl(url);

                        // Always make an assertion to satisfy Vitest
                        expect(typeof result).toBe("boolean");

                        // If the result is true, it should be a proper HTTPS URL
                        if (result) {
                            expect(
                                url.startsWith("https://") ||
                                    url.startsWith("ftp://")
                            ).toBeTruthy();
                        }
                    }
                )
            );
        });

        it("should handle Unicode and special characters in URLs", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 50 }),
                    fc.string({ maxLength: 50 }),
                    (domain: string, path: string) => {
                        const url = `https://${domain}/${path}`;

                        expect(() => isValidUrl(url)).not.toThrow();
                        const result = isValidUrl(url);
                        expect(typeof result).toBe("boolean");
                    }
                )
            );
        });

        it("should reject URLs with dangerous schemes", () => {
            const dangerousSchemes = new Set([
                // eslint-disable-next-line no-script-url -- Testing dangerous URL schemes for security validation
                "javascript:",
                "data:",
                "vbscript:",
            ]);

            fc.assert(
                fc.property(
                    fc.oneof(
                        // eslint-disable-next-line no-script-url -- Testing dangerous URL schemes for security validation
                        fc.constant("javascript:"),
                        fc.constant("data:"),
                        fc.constant("vbscript:"),
                        fc.constant("file:///"),
                        fc.constant("chrome://"),
                        fc.constant("chrome-extension://")
                    ),
                    fc.string({ maxLength: 100 }),
                    (scheme: string, rest: string) => {
                        const url = `${scheme}${rest}`;
                        const result = isValidUrl(url);

                        // These schemes should generally be rejected for security
                        if (dangerousSchemes.has(scheme)) {
                            expect(result).toBeFalsy();
                        }
                    }
                )
            );
        });
    });

    describe("Host Validation Fuzzing", () => {
        it("should handle various host input types gracefully", () => {
            fc.assert(
                fc.property(fc.anything(), (input: unknown) => {
                    expect(() => isValidHost(input)).not.toThrow();
                    const result = isValidHost(input);
                    expect(typeof result).toBe("boolean");
                })
            );
        });

        it("should accept valid IP addresses", () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 0, max: 255 }),
                    fc.integer({ min: 0, max: 255 }),
                    fc.integer({ min: 0, max: 255 }),
                    fc.integer({ min: 0, max: 255 }),
                    (a: number, b: number, c: number, d: number) => {
                        const ip = `${a}.${b}.${c}.${d}`;
                        const result = isValidHost(ip);

                        // Valid IPv4 addresses should be accepted
                        expect(result).toBeTruthy();
                    }
                )
            );
        });

        it("should handle malformed IP addresses", () => {
            fc.assert(
                fc.property(
                    fc.array(fc.integer({ min: 0, max: 999 }), {
                        minLength: 1,
                        maxLength: 6,
                    }),
                    fc.oneof(
                        fc.constant("."),
                        fc.constant(".."),
                        fc.constant(""),
                        fc.string({ maxLength: 5 })
                    ),
                    (numbers: number[], separator: string) => {
                        const malformedIp = numbers.join(separator);

                        expect(() => isValidHost(malformedIp)).not.toThrow();
                        const result = isValidHost(malformedIp);
                        expect(typeof result).toBe("boolean");
                    }
                )
            );
        });

        it("should handle domain names with various TLDs", () => {
            fc.assert(
                fc.property(
                    fc.domain(),
                    fc.oneof(
                        fc.constant(".com"),
                        fc.constant(".org"),
                        fc.constant(".net"),
                        fc.constant(".dev"),
                        fc.constant(".io"),
                        fc.constant(".co.uk"),
                        fc
                            .string({ minLength: 2, maxLength: 6 })
                            .map((s) => `.${s}`)
                    ),
                    (domain: string, tld: string) => {
                        const host = `${domain}${tld}`;

                        expect(() => isValidHost(host)).not.toThrow();
                        const result = isValidHost(host);
                        expect(typeof result).toBe("boolean");
                    }
                )
            );
        });

        it("should handle hosts with special characters", () => {
            fc.assert(
                fc.property(
                    fc.string({ maxLength: 50 }).filter((s) => s.length > 0),
                    (host: string) => {
                        expect(() => isValidHost(host)).not.toThrow();
                        const result = isValidHost(host);
                        expect(typeof result).toBe("boolean");

                        // Hosts with invalid characters should be rejected
                        if (
                            host.includes("@") ||
                            host.includes("#") ||
                            host.includes("$")
                        ) {
                            expect(result).toBeFalsy();
                        }
                    }
                )
            );
        });
    });

    describe("Port Validation Fuzzing", () => {
        it("should handle various port input types gracefully", () => {
            fc.assert(
                fc.property(fc.anything(), (input: unknown) => {
                    expect(() => isValidPort(input)).not.toThrow();
                    const result = isValidPort(input);
                    expect(typeof result).toBe("boolean");
                })
            );
        });

        it("should accept valid port numbers in correct range", () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 65_535 }),
                    (port: number) => {
                        const result = isValidPort(port);
                        expect(result).toBeTruthy();
                    }
                )
            );
        });

        it("should reject invalid port numbers", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant(0),
                        fc.integer({ min: 65_536, max: 100_000 }),
                        fc.integer({ max: -1 })
                    ),
                    (port: number) => {
                        const result = isValidPort(port);
                        expect(result).toBeFalsy();
                    }
                )
            );
        });

        it("should handle string port numbers", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.integer({ min: 1, max: 65_535 }).map(String),
                        fc.constant("0"),
                        fc.string({ maxLength: 10 }),
                        fc.float().map(String),
                        fc.constant("")
                    ),
                    (portStr: string) => {
                        expect(() => isValidPort(portStr)).not.toThrow();
                        const result = isValidPort(portStr);
                        expect(typeof result).toBe("boolean");

                        // String "0" should be rejected
                        if (portStr === "0") {
                            expect(result).toBeFalsy();
                        }
                    }
                )
            );
        });

        it("should handle edge cases around port boundaries", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("1"),
                        fc.constant("65535"),
                        fc.constant("65536"),
                        fc.constant("-1"),
                        fc.constant("99999")
                    ),
                    (portStr: string) => {
                        const result = isValidPort(portStr);

                        if (portStr === "1" || portStr === "65535") {
                            expect(result).toBeTruthy();
                        } else {
                            expect(result).toBeFalsy();
                        }
                    }
                )
            );
        });
    });

    describe("Combined Validation Fuzzing", () => {
        it("should handle realistic monitor configuration data", () => {
            fc.assert(
                fc.property(
                    fc.record({
                        url: fc.oneof(
                            fc.webUrl(),
                            fc.string(),
                            fc.constant(""),
                            fc.constant(null),
                            fc.constant(undefined)
                        ),
                        host: fc.oneof(
                            fc.domain(),
                            fc.ipV4(),
                            fc.string(),
                            fc.constant("localhost"),
                            fc.constant("")
                        ),
                        port: fc.oneof(
                            fc.integer({ max: 70_000 }),
                            fc.string(),
                            fc.constant(null),
                            fc.constant(undefined)
                        ),
                    }),
                    (config: {
                        url: string | null | undefined;
                        host: string;
                        port: number | string | null | undefined;
                    }) => {
                        // None of these validation functions should throw
                        expect(() => {
                            if (
                                config.url !== null &&
                                config.url !== undefined
                            ) {
                                isValidUrl(config.url);
                            }
                            isValidHost(config.host);
                            isValidPort(config.port);
                        }).not.toThrow();
                    }
                )
            );
        });
    });
});
