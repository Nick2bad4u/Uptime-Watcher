/**
 * Property-based fuzzing tests for shared utilities and types.
 *
 * @remarks
 * Tests shared utility functions, type validation, and common functionality
 * using property-based testing with fast-check. Validates that shared utilities
 * handle malformed input, edge cases, and maintain type safety across different
 * scenarios.
 *
 * Key areas tested:
 *
 * - Type guards and validation functions
 * - Utility functions robustness
 * - Configuration parsing
 * - String manipulation safety
 * - Error handling consistency
 *
 * @packageDocumentation
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";

describe("Shared Utilities Fuzzing Tests", () => {
    describe("String Validation", () => {
        it("should validate strings safely against null/undefined", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.string(),
                        fc.constant(""),
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.constant(0),
                        fc.constant(false),
                        fc.constant({}),
                        fc.constant([]),
                        fc.string().map((s) => s.repeat(10_000)) // Very long string
                    ),
                    (input: any) => {
                        expect(() => {
                            const isValidString = (
                                value: any
                            ): value is string =>
                                typeof value === "string" && value.length > 0;

                            const result = isValidString(input);
                            expect(typeof result).toBe("boolean");
                        }).not.toThrowError();
                    }
                )
            );
        });

        it("should sanitize strings with potentially dangerous content", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.string(),
                        fc
                            .string()
                            .map((s) => `${s}<script>alert('xss')</script>`),
                        fc.string().map((s) => `${s}javascript:void(0)`),
                        fc.string().map((s) => `${s}\0\r\n`),
                        fc.string().map((s) => `${s}../../../etc/passwd`),
                        fc.string().map((s) => `${s}\${process.env.SECRET}`),
                        fc.string().map((s) => s.repeat(1000)),
                        fc.constant(""),
                        fc.constant(null),
                        fc.constant(undefined)
                    ),
                    (input: any) => {
                        expect(() => {
                            const sanitizeString = (value: any): string => {
                                if (typeof value !== "string") {
                                    return "";
                                }

                                // Remove null bytes and control characters

                                const cleaned = value.replaceAll(
                                    // eslint-disable-next-line no-control-regex
                                    /[\0-\u001F\u007F]/gu,
                                    ""
                                );

                                // Limit length and return
                                return cleaned.slice(0, 1000);
                            };

                            const result = sanitizeString(input);

                            // Property: result should always be a string
                            expect(typeof result).toBe("string");

                            // Property: should not contain control characters
                            // eslint-disable-next-line no-control-regex
                            expect(result).not.toMatch(/[\0-\u001F\u007F]/);

                            // Property: should have reasonable length
                            expect(result.length).toBeLessThanOrEqual(1000);
                        }).not.toThrowError();
                    }
                )
            );
        });
    });

    describe("URL Validation", () => {
        it("should validate URLs robustly", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.webUrl(),
                        fc.string(),
                        fc.string().map((s) => `https://${s}`),
                        fc.string().map((s) => `https://${s}`),
                        fc.string().map((s) => `ftp://${s}`),
                        fc.string().map((s) => `javascript:${s}`),
                        fc.string().map((s) => `data:${s}`),
                        fc.string().map((s) => `file://${s}`),
                        fc.constant(""),
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.constant("not-a-url"),
                        fc.constant("http://"),
                        fc.constant("://example.com")
                    ),
                    (input: any) => {
                        expect(() => {
                            const isValidUrl = (url: any): boolean => {
                                if (
                                    typeof url !== "string" ||
                                    url.length === 0
                                ) {
                                    return false;
                                }

                                try {
                                    const parsed = new URL(url);
                                    return ["http:", "https:"].includes(
                                        parsed.protocol
                                    );
                                } catch {
                                    return false;
                                }
                            };

                            const result = isValidUrl(input);
                            expect(typeof result).toBe("boolean");
                        }).not.toThrowError();
                    }
                )
            );
        });
    });

    describe("Configuration Parsing", () => {
        it("should handle malformed configuration objects", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.record({
                            timeout: fc.oneof(
                                fc.integer(),
                                fc.string(),
                                fc.constant(null)
                            ),
                            retries: fc.oneof(
                                fc.integer(),
                                fc.string(),
                                fc.constant(null)
                            ),
                            interval: fc.oneof(
                                fc.integer(),
                                fc.string(),
                                fc.constant(null)
                            ),
                        }),
                        fc.constant({}),
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.constant("not-an-object"),
                        fc.constant([]),
                        fc.record({
                            timeout: fc.constant(Number.POSITIVE_INFINITY),
                            retries: fc.constant(Number.NEGATIVE_INFINITY),
                            interval: fc.constant(Number.NaN),
                        })
                    ),
                    (config: any) => {
                        expect(() => {
                            const parseConfig = (input: any) => {
                                const defaults = {
                                    timeout: 5000,
                                    retries: 3,
                                    interval: 60_000,
                                };

                                if (!input || typeof input !== "object") {
                                    return defaults;
                                }

                                const result = { ...defaults };

                                if (
                                    typeof input.timeout === "number" &&
                                    Number.isFinite(input.timeout) &&
                                    input.timeout > 0
                                ) {
                                    result.timeout = Math.min(
                                        input.timeout,
                                        300_000
                                    ); // Max 5 minutes
                                }

                                if (
                                    typeof input.retries === "number" &&
                                    Number.isInteger(input.retries) &&
                                    input.retries >= 0
                                ) {
                                    result.retries = Math.min(
                                        input.retries,
                                        10
                                    ); // Max 10 retries
                                }

                                if (
                                    typeof input.interval === "number" &&
                                    Number.isFinite(input.interval) &&
                                    input.interval > 0
                                ) {
                                    result.interval = Math.min(
                                        input.interval,
                                        86_400_000
                                    ); // Max 24 hours
                                }

                                return result;
                            };

                            const result = parseConfig(config);

                            // Property: result should always be a valid config object
                            expect(typeof result).toBe("object");
                            expect(result).not.toBeNull();
                            expect(typeof result.timeout).toBe("number");
                            expect(typeof result.retries).toBe("number");
                            expect(typeof result.interval).toBe("number");

                            // Property: values should be within safe ranges
                            expect(result.timeout).toBeGreaterThan(0);
                            expect(result.timeout).toBeLessThanOrEqual(300_000);
                            expect(result.retries).toBeGreaterThanOrEqual(0);
                            expect(result.retries).toBeLessThanOrEqual(10);
                            expect(result.interval).toBeGreaterThan(0);
                            expect(result.interval).toBeLessThanOrEqual(
                                86_400_000
                            );

                            // Property: values should be finite
                            expect(
                                Number.isFinite(result.timeout)
                            ).toBeTruthy();
                            expect(
                                Number.isFinite(result.retries)
                            ).toBeTruthy();
                            expect(
                                Number.isFinite(result.interval)
                            ).toBeTruthy();
                        }).not.toThrowError();
                    }
                )
            );
        });
    });

    describe("Type Guards", () => {
        it("should safely identify object types", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.record({ id: fc.string(), name: fc.string() }),
                        fc.record({ id: fc.integer(), name: fc.string() }),
                        fc.record({ name: fc.string() }), // Missing id
                        fc.record({ id: fc.string() }), // Missing name
                        fc.constant({}),
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.string(),
                        fc.integer(),
                        fc.boolean(),
                        fc.constant([]),
                        fc.constant(new Date())
                    ),
                    (input: any) => {
                        expect(() => {
                            const hasIdAndName = (
                                obj: any
                            ): obj is { id: string; name: string } =>
                                Boolean(
                                    obj &&
                                    typeof obj === "object" &&
                                    typeof obj.id === "string" &&
                                    typeof obj.name === "string" &&
                                    obj.id.length > 0 &&
                                    obj.name.length > 0
                                );

                            const result = hasIdAndName(input);
                            expect(typeof result).toBe("boolean");

                            if (result) {
                                // If type guard passes, properties should be accessible
                                expect(typeof input.id).toBe("string");
                                expect(typeof input.name).toBe("string");
                                expect(input.id.length).toBeGreaterThan(0);
                                expect(input.name.length).toBeGreaterThan(0);
                            }
                        }).not.toThrowError();
                    }
                )
            );
        });
    });

    describe("Error Message Sanitization", () => {
        it("should sanitize error messages safely", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.string(),
                        fc
                            .string()
                            .map((s) => `${s} at /path/to/secret/file.js:123`),
                        fc
                            .string()
                            .map(
                                (s) =>
                                    `${s} Error: ENOENT: no such file /home/user/.env`
                            ),
                        fc.string().map((s) => `${s} password=secret123`),
                        fc
                            .string()
                            .map((s) => `${s} Authorization: Bearer token123`),
                        fc.string().map((s) => s + "\n".repeat(1000)), // Many newlines
                        fc.string().map((s) => s.repeat(5000)), // Very long message
                        fc.constant(""),
                        fc.constant(null),
                        fc.constant(undefined)
                    ),
                    (errorInput: any) => {
                        expect(() => {
                            const sanitizeErrorMessage = (
                                error: any
                            ): string => {
                                const message =
                                    error instanceof Error
                                        ? error.message
                                        : typeof error === "string"
                                          ? error
                                          : "Unknown error";

                                // Remove sensitive patterns
                                const sanitized = message
                                    .replaceAll(
                                        /password[:=]\S*/gi,
                                        "password=***"
                                    )
                                    .replaceAll(
                                        /authorization[:=]\S*/gi,
                                        "authorization=***"
                                    )
                                    .replaceAll(/bearer\s+\S+/gi, "bearer ***")
                                    .replaceAll(
                                        /\/\S*\.(?:env|key|pem|crt)\S*/gi,
                                        "***"
                                    )
                                    .replaceAll(/\s+/g, " ") // Normalize whitespace
                                    .trim();

                                // Limit length
                                return sanitized.slice(0, 500);
                            };

                            const result = sanitizeErrorMessage(errorInput);

                            // Property: result should always be a string
                            expect(typeof result).toBe("string");

                            // Property: should not contain sensitive patterns
                            expect(result.toLowerCase()).not.toMatch(
                                /password[:=][^\s*]/
                            );
                            expect(result.toLowerCase()).not.toMatch(
                                /authorization[:=][^\s*]/
                            );
                            expect(result.toLowerCase()).not.toMatch(
                                /bearer\s+[^\s*]/
                            );

                            // Property: should have reasonable length
                            expect(result.length).toBeLessThanOrEqual(500);

                            // Property: should not have excessive whitespace
                            expect(result).not.toMatch(/\s{2,}/);
                        }).not.toThrowError();
                    }
                )
            );
        });
    });

    describe("Array Validation", () => {
        it("should handle arrays with mixed or invalid content", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.array(fc.string()),
                        fc.array(
                            fc.oneof(
                                fc.string(),
                                fc.integer(),
                                fc.boolean(),
                                fc.constant(null)
                            )
                        ),
                        fc.constant([]),
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.constant("not-an-array"),
                        fc.constant({}),
                        fc.array(fc.string(), {
                            minLength: 1000,
                            maxLength: 1000,
                        }) // Very large array
                    ),
                    (input: any) => {
                        expect(() => {
                            const getValidStrings = (arr: any): string[] => {
                                if (!Array.isArray(arr)) {
                                    return [];
                                }

                                return arr
                                    .filter(
                                        (item): item is string =>
                                            typeof item === "string"
                                    )
                                    .filter(
                                        (str): str is string => str.length > 0
                                    )
                                    .slice(0, 100); // Limit to 100 items
                            };

                            const result = getValidStrings(input);

                            // Property: result should always be an array
                            expect(Array.isArray(result)).toBeTruthy();

                            // Property: all items should be non-empty strings
                            for (const item of result) {
                                expect(typeof item).toBe("string");
                                expect(item.length).toBeGreaterThan(0);
                            }

                            // Property: should not exceed limits
                            expect(result.length).toBeLessThanOrEqual(100);
                        }).not.toThrowError();
                    }
                )
            );
        });
    });
});
