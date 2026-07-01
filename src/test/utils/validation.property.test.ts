/**
 * Comprehensive property-based tests for validation utilities using Fast-Check
 * v4.
 *
 * @remarks
 * ```
 *
 *                         "monitoring",
 *                         "responseTime",
 *                         "history",
 *                         "checkInterval",
 *                         "timeout",
 *                         "retryAttempts",
 * ```
 *
 * These tests use property-based testing to validate the behavior of validation
 * functions across a wide range of inputs, ensuring robust handling of edge
 * cases and consistent behavior.
 *
 * Each test focuses on mathematical properties, boundary conditions, and string
 * validation logic using Fast-Check arbitraries.
 *
 * @packageDocumentation
 */

import { fc, test as fcTest } from "@fast-check/vitest";
import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import { secureRandomFloat } from "@shared/test/testHelpers";
import { validateMonitorType } from "@shared/utils/validation";
import { getMonitorValidationErrors } from "@shared/validation/monitorSchemas";
// Import functions from shared validation utilities
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
} from "@shared/validation/validatorUtils";
import { isInteger, objectKeys } from "ts-extras";
import { describe, expect } from "vitest";

// Constants to avoid lint issues with numeric literals
const MIN_CHECK_INTERVAL = MIN_MONITOR_CHECK_INTERVAL_MS;
const MAX_CHECK_INTERVAL = 300_000;
const MIN_TIMEOUT = 1000;
const MAX_TIMEOUT = 30_000;
const MIN_PORT = 1;
const MAX_PORT = 65_535;
const MIN_RETRY_ATTEMPTS = 0;
const MAX_RETRY_ATTEMPTS = 10;

describe("validation Utils Property-Based Tests", () => {
    describe("isNonEmptyString function", () => {
        fcTest.prop([
            fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        ])("should accept non-empty strings", (str) => {
            expect(isNonEmptyString(str)).toBe(true);
        });

        fcTest.prop([fc.constantFrom("", " ".repeat(3), "\t", "\n", "  \n  ")])(
            "should reject empty or whitespace-only strings",
            (str) => {
                expect(isNonEmptyString(str)).toBe(false);
            }
        );

        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.double(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined),
                fc.array(fc.string()),
                fc.record({})
            ),
        ])("should reject non-string values", (value) => {
            expect(isNonEmptyString(value)).toBe(false);
        });

        fcTest.prop([fc.string().filter((s) => s.trim().length > 0)])(
            "should accept strings with non-whitespace content",
            (str) => {
                expect(isNonEmptyString(str)).toBe(true);
            }
        );
    });

    describe("isValidFQDN function", () => {
        fcTest.prop([
            fc.oneof(
                fc.constantFrom(
                    "example.com",
                    "test.org",
                    "subdomain.example.com",
                    "www.google.com"
                ),
                // Generate valid FQDN patterns
                fc
                    .tuple(
                        fc
                            .string({ maxLength: 10, minLength: 1 })
                            .filter((s) => /^[A-Za-z][\dA-Za-z]*$/v.test(s)),
                        fc.constantFrom("com", "org", "net", "edu")
                    )
                    .map(([subdomain, tld]) => `${subdomain}.${tld}`)
            ),
        ])("should accept valid FQDNs", (fqdn) => {
            expect(isValidFQDN(fqdn)).toBe(true);
        });

        fcTest.prop([
            fc.oneof(
                fc.constantFrom(
                    "localhost",
                    "invalid..domain",
                    ".example.com",
                    "example."
                ),
                fc
                    .string()
                    .filter(
                        (s) =>
                            s.includes("..") ||
                            s.startsWith(".") ||
                            s.endsWith(".")
                    )
            ),
        ])("should reject invalid domain formats", (invalidDomain) => {
            expect(isValidFQDN(invalidDomain)).toBe(false);
        });

        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined),
                fc.array(fc.string())
            ),
        ])("should reject non-string values", (value) => {
            expect(isValidFQDN(value)).toBe(false);
        });
    });

    describe("isValidIdentifier function", () => {
        fcTest.prop([
            fc.oneof(
                fc
                    .string({ minLength: 1 })
                    .filter(
                        (s) =>
                            /^[\w-]+$/u.test(s) &&
                            s.replaceAll(/[-_]/gu, "").length > 0
                    ),
                fc.constantFrom(
                    "abc",
                    "test123",
                    "valid-identifier",
                    "under_score",
                    "mixed-123_valid"
                )
            ),
        ])("should accept valid identifiers", (identifier) => {
            expect(isValidIdentifier(identifier)).toBe(true);
        });

        fcTest.prop([
            fc.oneof(
                fc.constantFrom(
                    "",
                    " ".repeat(3),
                    "___",
                    "---",
                    "@invalid",
                    "invalid@",
                    "spa ce"
                ),
                fc
                    .string()
                    .filter(
                        (s) =>
                            s.includes(" ") ||
                            s.includes("@") ||
                            s.includes("!") ||
                            s.replaceAll(/[-_]/gu, "").length === 0
                    )
            ),
        ])("should reject invalid identifiers", (invalid) => {
            expect(isValidIdentifier(invalid)).toBe(false);
        });

        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-string values", (value) => {
            expect(isValidIdentifier(value)).toBe(false);
        });
    });

    describe("isValidIdentifierArray function", () => {
        fcTest.prop([
            fc.array(
                fc
                    .string({ minLength: 1 })
                    .filter(
                        (s) =>
                            /^[\w-]+$/u.test(s) &&
                            s.replaceAll(/[-_]/gu, "").length > 0
                    ),
                { maxLength: 10, minLength: 0 }
            ),
        ])("should accept arrays of valid identifiers", (identifiers) => {
            expect(isValidIdentifierArray(identifiers)).toBe(true);
        });

        fcTest.prop([
            fc
                .oneof(
                    fc.array(
                        fc
                            .string()
                            .filter((s) => s.includes("@") || s.includes(" "))
                    ),
                    fc.array(fc.oneof(fc.integer(), fc.boolean())),
                    fc.array(fc.constantFrom("", " ".repeat(3), "___"))
                )
                .filter((arr) => arr.length > 0),
        ])("should reject arrays with invalid identifiers", (invalidArray) => {
            expect(isValidIdentifierArray(invalidArray)).toBe(false);
        });

        fcTest.prop([
            fc.oneof(
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-array values", (value) => {
            expect(isValidIdentifierArray(value)).toBe(false);
        });
    });

    describe("isValidInteger function", () => {
        fcTest.prop([fc.integer()])(
            "should accept valid integer strings",
            (num) => {
                expect(isValidInteger(num.toString())).toBe(true);
            }
        );

        fcTest.prop([
            fc.oneof(
                fc.constantFrom("123.45", "abc", "", "  ", "12.0", "1e5"),
                fc
                    .double()
                    .filter((value) => !isInteger(value))
                    .map((d) => d.toString())
            ),
        ])("should reject non-integer strings", (invalid) => {
            expect(isValidInteger(invalid)).toBe(false);
        });

        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.double(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-string values", (value) => {
            expect(isValidInteger(value)).toBe(false);
        });

        fcTest.prop([fc.integer({ max: 100, min: 10 })])(
            "should respect bounds when provided",
            (num) => {
                expect(
                    isValidInteger(num.toString(), { max: 100, min: 10 })
                ).toBe(true);
                expect(
                    isValidInteger((num - 20).toString(), { max: 100, min: 10 })
                ).toBe(num >= 30);
                expect(
                    isValidInteger((num + 20).toString(), { max: 100, min: 10 })
                ).toBe(num <= 80);
            }
        );
    });

    describe("isValidNumeric function", () => {
        fcTest.prop([
            fc.oneof(
                fc.integer().map((i) => i.toString()),
                fc
                    .double({ noDefaultInfinity: true, noNaN: true })
                    .map((d) => d.toString())
            ),
        ])("should accept valid numeric strings", (numStr) => {
            expect(isValidNumeric(numStr)).toBe(true);
        });

        fcTest.prop([
            fc.constantFrom("abc", "", "  ", "123abc", "12.34.56", "infinity"),
        ])("should reject non-numeric strings", (invalid) => {
            expect(isValidNumeric(invalid)).toBe(false);
        });

        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.double(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-string values", (value) => {
            expect(isValidNumeric(value)).toBe(false);
        });
    });

    describe("isValidHost function", () => {
        fcTest.prop([
            fc.oneof(
                // Valid IP addresses
                fc.constantFrom(
                    "127.0.0.1",
                    "192.168.1.1",
                    "8.8.8.8",
                    "::1",
                    "2001:db8::1"
                ),
                // Valid FQDNs
                fc.constantFrom(
                    "example.com",
                    "test.org",
                    "subdomain.example.com"
                ),
                // Special case
                fc.constant("localhost")
            ),
        ])("should accept valid hosts", (host) => {
            expect(isValidHost(host)).toBe(true);
        });

        fcTest.prop([
            fc.oneof(
                fc.constantFrom(
                    "invalid..host",
                    ".example.com",
                    "256.256.256.256",
                    ""
                ),
                fc.string().filter((s) => s.includes("..") || s.includes(" "))
            ),
        ])("should reject invalid hosts", (invalidHost) => {
            expect(isValidHost(invalidHost)).toBe(false);
        });

        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-string values", (value) => {
            expect(isValidHost(value)).toBe(false);
        });
    });

    describe("isValidPort function", () => {
        fcTest.prop([fc.integer({ max: 65_535, min: 1 })])(
            "should accept valid port numbers",
            (port) => {
                expect(isValidPort(port)).toBe(true);
                expect(isValidPort(port.toString())).toBe(true);
            }
        );

        fcTest.prop([
            fc.oneof(
                fc.constant(0),
                fc.constant("0"),
                fc.integer({ max: 100_000, min: 65_536 }),
                fc.integer({ max: -1, min: -100 })
            ),
        ])("should reject invalid port numbers", (invalidPort) => {
            expect(isValidPort(invalidPort)).toBe(false);
        });

        fcTest.prop([
            fc.oneof(
                fc.constantFrom("abc", "", "  ", "80.5", "port"),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-numeric values", (value) => {
            expect(isValidPort(value)).toBe(false);
        });
    });

    describe("isValidUrl function", () => {
        fcTest.prop([
            fc.oneof(
                fc.constantFrom(
                    "https://example.com",
                    "https://test.org",
                    "https://subdomain.example.com/path",
                    "http://localhost:8080",
                    "https://127.0.0.1:443"
                )
            ),
        ])("should accept valid URLs", (url) => {
            expect(isValidUrl(url)).toBe(true);
        });

        fcTest.prop([
            fc.oneof(
                fc.constantFrom(
                    "ftp://example.com",
                    "not-a-url",
                    "",
                    "//example.com",
                    "file:///etc/passwd"
                ),
                fc.string().filter((s) => !s.startsWith("http"))
            ),
        ])("should reject invalid URLs", (invalidUrl) => {
            expect(isValidUrl(invalidUrl)).toBe(false);
        });

        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-string values", (value) => {
            expect(isValidUrl(value)).toBe(false);
        });
    });

    describe("safeInteger function", () => {
        fcTest.prop([
            fc.integer({ max: 1000, min: 1 }),
            fc.integer({ max: 100, min: 0 }),
            fc.integer({ max: 500, min: 1 }),
            fc.integer({ max: 1000, min: 501 }),
        ])(
            "should convert valid integers within bounds",
            (value, defaultVal, minVal, maxVal) => {
                const result = safeInteger(
                    value.toString(),
                    defaultVal,
                    minVal,
                    maxVal
                );

                expect(result).toBeGreaterThanOrEqual(minVal);
                expect(result).toBeLessThanOrEqual(maxVal);

                if (value >= minVal && value <= maxVal) {
                    expect(result).toBe(value);
                }
            }
        );

        fcTest.prop([
            fc.oneof(
                fc.constantFrom("abc", "", "  ", "123.45", "infinity"),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
            fc.integer({ max: 100, min: 0 }),
        ])(
            "should return default value for invalid inputs",
            (invalidValue, defaultVal) => {
                expect(safeInteger(invalidValue, defaultVal)).toBe(defaultVal);
            }
        );

        fcTest.prop([
            fc.integer({ max: 1000, min: -1000 }),
            fc.integer({ max: 100, min: 0 }),
            fc.integer({ max: 50, min: 1 }),
            fc.integer({ max: 100, min: 51 }),
        ])(
            "should clamp values to bounds",
            (value, defaultVal, minVal, maxVal) => {
                const result = safeInteger(value, defaultVal, minVal, maxVal);

                if (value < minVal) {
                    expect(result).toBe(minVal);
                } else if (value > maxVal) {
                    expect(result).toBe(maxVal);
                } else {
                    expect(result).toBe(value);
                }
            }
        );
    });

    describe("validateMonitorType function", () => {
        fcTest.prop([fc.constantFrom("http", "port", "ping", "dns")])(
            "should accept valid monitor types",
            (type) => {
                expect(validateMonitorType(type)).toBe(true);
            }
        );

        fcTest.prop([
            fc.oneof(
                fc.string().filter(
                    (s) =>
                        ![
                            "dns",
                            "http",
                            "ping",
                            "port",
                        ].includes(s)
                ),
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject invalid monitor types", (invalidType) => {
            expect(validateMonitorType(invalidType)).toBe(false);
        });
    });

    describe("getMonitorValidationErrors function", () => {
        fcTest.prop([
            fc.oneof(
                // HTTP Monitor
                fc.record(
                    {
                        checkInterval: fc.integer({
                            max: MAX_CHECK_INTERVAL,
                            min: MIN_CHECK_INTERVAL,
                        }),
                        history: fc.constant([]),
                        id: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        monitoring: fc.boolean(),
                        responseTime: fc.integer({ max: 30_000, min: -1 }),
                        retryAttempts: fc.integer({
                            max: MAX_RETRY_ATTEMPTS,
                            min: MIN_RETRY_ATTEMPTS,
                        }),
                        status: fc.constantFrom(
                            "up",
                            "down",
                            "paused",
                            "pending"
                        ),
                        timeout: fc.integer({
                            max: MAX_TIMEOUT,
                            min: MIN_TIMEOUT,
                        }),
                        type: fc.constant("http"),
                        url: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                    },
                    {
                        requiredKeys: [
                            "id",
                            "type",
                            "status",
                            "monitoring",
                            "responseTime",
                            "history",
                            "checkInterval",
                            "timeout",
                            "retryAttempts",
                            "url",
                        ],
                    }
                ),
                // Port Monitor
                fc.record(
                    {
                        checkInterval: fc.integer({
                            max: MAX_CHECK_INTERVAL,
                            min: MIN_CHECK_INTERVAL,
                        }),
                        history: fc.constant([]),
                        host: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        id: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        monitoring: fc.boolean(),
                        port: fc.integer({ max: MAX_PORT, min: MIN_PORT }),
                        responseTime: fc.integer({ max: 30_000, min: -1 }),
                        retryAttempts: fc.integer({
                            max: MAX_RETRY_ATTEMPTS,
                            min: MIN_RETRY_ATTEMPTS,
                        }),
                        status: fc.constantFrom(
                            "up",
                            "down",
                            "paused",
                            "pending"
                        ),
                        timeout: fc.integer({
                            max: MAX_TIMEOUT,
                            min: MIN_TIMEOUT,
                        }),
                        type: fc.constant("port"),
                    },
                    {
                        requiredKeys: [
                            "id",
                            "type",
                            "status",
                            "monitoring",
                            "responseTime",
                            "history",
                            "checkInterval",
                            "timeout",
                            "retryAttempts",
                            "host",
                            "port",
                        ],
                    }
                ),
                // Ping Monitor
                fc.record(
                    {
                        checkInterval: fc.integer({
                            max: MAX_CHECK_INTERVAL,
                            min: MIN_CHECK_INTERVAL,
                        }),
                        history: fc.constant([]),
                        host: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        id: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        monitoring: fc.boolean(),
                        responseTime: fc.integer({ max: 30_000, min: -1 }),
                        retryAttempts: fc.integer({
                            max: MAX_RETRY_ATTEMPTS,
                            min: MIN_RETRY_ATTEMPTS,
                        }),
                        status: fc.constantFrom(
                            "up",
                            "down",
                            "paused",
                            "pending"
                        ),
                        timeout: fc.integer({
                            max: MAX_TIMEOUT,
                            min: MIN_TIMEOUT,
                        }),
                        type: fc.constant("ping"),
                    },
                    {
                        requiredKeys: [
                            "id",
                            "type",
                            "status",
                            "monitoring",
                            "responseTime",
                            "history",
                            "checkInterval",
                            "timeout",
                            "retryAttempts",
                            "host",
                        ],
                    }
                ),
                // DNS Monitor
                fc.record(
                    {
                        checkInterval: fc.integer({
                            max: MAX_CHECK_INTERVAL,
                            min: MIN_CHECK_INTERVAL,
                        }),
                        history: fc.constant([]),
                        host: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        id: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        monitoring: fc.boolean(),
                        recordType: fc.constantFrom(
                            "A",
                            "AAAA",
                            "CNAME",
                            "MX",
                            "TXT"
                        ),
                        responseTime: fc.integer({ max: 30_000, min: -1 }),
                        retryAttempts: fc.integer({
                            max: MAX_RETRY_ATTEMPTS,
                            min: MIN_RETRY_ATTEMPTS,
                        }),
                        status: fc.constantFrom(
                            "up",
                            "down",
                            "paused",
                            "pending"
                        ),
                        timeout: fc.integer({
                            max: MAX_TIMEOUT,
                            min: MIN_TIMEOUT,
                        }),
                        type: fc.constant("dns"),
                    },
                    {
                        requiredKeys: [
                            "id",
                            "type",
                            "status",
                            "monitoring",
                            "responseTime",
                            "history",
                            "checkInterval",
                            "timeout",
                            "retryAttempts",
                            "host",
                            "recordType",
                        ],
                    }
                )
            ),
        ])(
            "should return no errors for valid basic monitor data",
            (monitor) => {
                const errors = getMonitorValidationErrors(monitor);

                expect(Array.isArray(errors)).toBe(true);

                // Should not have base-field errors when base fields are present.
                expect(
                    errors.some((e) => e.includes("Monitor ID is required"))
                ).toBe(false);
                expect(
                    errors.some((e) =>
                        e.toLowerCase().startsWith("checkinterval:")
                    )
                ).toBe(false);
                expect(
                    errors.some((e) => e.toLowerCase().startsWith("timeout:"))
                ).toBe(false);
                expect(
                    errors.some((e) =>
                        e.toLowerCase().startsWith("retryattempts:")
                    )
                ).toBe(false);
                expect(
                    errors.some((e) => e.toLowerCase().startsWith("history:"))
                ).toBe(false);
                expect(
                    errors.some((e) =>
                        e.toLowerCase().startsWith("monitoring:")
                    )
                ).toBe(false);
                expect(
                    errors.some((e) =>
                        e.toLowerCase().startsWith("responsetime:")
                    )
                ).toBe(false);
            }
        );

        fcTest.prop([
            fc
                .record({
                    checkInterval: fc.integer({ max: 999, min: -100 }),
                    // Intentionally omit required fields or provide invalid values
                    id: fc.string(),
                    retryAttempts: fc.integer({ max: 15, min: -1 }),
                    status: fc.constantFrom("up", "down", "invalid"),
                    timeout: fc.integer({ max: 0, min: -10 }),
                    type: fc.constantFrom(
                        "http",
                        "port",
                        "ping",
                        "dns",
                        "invalid"
                    ),
                })
                .map((fullMonitor) => {
                    // Create partial monitor with undefined values to satisfy exactOptionalPropertyTypes
                    const partial: any = {};
                    const keys = objectKeys(fullMonitor);

                    for (const key of keys) {
                        if (secureRandomFloat() > 0.3) {
                            partial[key] = fullMonitor[key];
                        }
                        // Otherwise leave undefined (not null)
                    }

                    return partial;
                }),
        ])("should return errors for invalid monitor data", (monitor) => {
            const errors = getMonitorValidationErrors(monitor);

            expect(Array.isArray(errors)).toBe(true);

            // Invalid data should surface at least one error.
            expect(errors.length).toBeGreaterThan(0);
        });

        fcTest.prop([
            fc.record({
                checkInterval: fc.integer({
                    max: MAX_CHECK_INTERVAL,
                    min: MIN_CHECK_INTERVAL,
                }),
                history: fc.constant([]),
                id: fc.string({ minLength: 1 }),
                monitoring: fc.boolean(),
                responseTime: fc.integer({ max: 30_000, min: -1 }),
                retryAttempts: fc.integer({
                    max: MAX_RETRY_ATTEMPTS,
                    min: MIN_RETRY_ATTEMPTS,
                }),
                status: fc.constantFrom("up", "down"),
                timeout: fc.integer({ max: MAX_TIMEOUT, min: MIN_TIMEOUT }),
                type: fc.constant("http"),
                url: fc.constant("https://example.com"),
            }),
        ])("should validate HTTP monitor specific fields", (httpMonitor) => {
            const errors = getMonitorValidationErrors(httpMonitor);

            // Should not have URL-related errors for valid HTTP monitors
            expect(errors.some((e) => e.toLowerCase().startsWith("url:"))).toBe(
                false
            );
        });

        fcTest.prop([
            fc.record({
                checkInterval: fc.integer({
                    max: MAX_CHECK_INTERVAL,
                    min: MIN_CHECK_INTERVAL,
                }),
                history: fc.constant([]),
                host: fc.constant("example.com"),
                id: fc.string({ minLength: 1 }),
                monitoring: fc.boolean(),
                port: fc.integer({ max: MAX_PORT, min: 1 }),
                responseTime: fc.integer({ max: 30_000, min: -1 }),
                retryAttempts: fc.integer({
                    max: MAX_RETRY_ATTEMPTS,
                    min: MIN_RETRY_ATTEMPTS,
                }),
                status: fc.constantFrom("up", "down"),
                timeout: fc.integer({ max: MAX_TIMEOUT, min: MIN_TIMEOUT }),
                type: fc.constant("port"),
            }),
        ])("should validate port monitor specific fields", (portMonitor) => {
            const errors = getMonitorValidationErrors(portMonitor);

            // Should not have host/port-related errors for valid port monitors
            expect(
                errors.some((e) => e.toLowerCase().startsWith("host:"))
            ).toBe(false);
            expect(errors.some((e) => e.includes("port number"))).toBe(false);
        });
    });

    describe("edge cases and robustness", () => {
        fcTest.prop([
            fc.oneof(
                fc.constant(""),
                fc.constant(null),
                fc.constant(undefined),
                fc.string({ maxLength: 0 }),
                fc.constantFrom(" ".repeat(3), "\t\t", "\n\n")
            ),
        ])(
            "should handle empty/null/whitespace inputs consistently",
            (emptyInput) => {
                // All validation functions should handle empty inputs gracefully
                expect(isNonEmptyString(emptyInput)).toBe(false);
                expect(isValidFQDN(emptyInput)).toBe(false);
                expect(isValidIdentifier(emptyInput)).toBe(false);
                expect(isValidUrl(emptyInput)).toBe(false);
            }
        );

        fcTest.prop([fc.string({ maxLength: 2000, minLength: 1000 })])(
            "should handle very long strings",
            (longString) => {
                // Functions should not crash on very long inputs
                expect(() => isNonEmptyString(longString)).not.toThrow();
                expect(() => isValidFQDN(longString)).not.toThrow();
                expect(() => isValidIdentifier(longString)).not.toThrow();
                expect(() => isValidUrl(longString)).not.toThrow();
            }
        );

        fcTest.prop([
            fc.oneof(
                fc.constant(Number.MAX_SAFE_INTEGER),
                fc.constant(Number.MIN_SAFE_INTEGER),
                fc.constant(Infinity),
                fc.constant(Number.NEGATIVE_INFINITY),
                fc.constant(NaN)
            ),
        ])("should handle extreme numeric values", (extremeValue) => {
            // Numeric validation functions should handle extreme values
            expect(() => isValidPort(extremeValue)).not.toThrow();
            expect(() => safeInteger(extremeValue, 0)).not.toThrow();
        });
    });

    describe("performance and determinism", () => {
        fcTest.prop([
            fc.array(fc.string({ maxLength: 20, minLength: 1 }), {
                maxLength: 100,
                minLength: 1,
            }),
        ])("should be deterministic for same inputs", (strings) => {
            for (const str of strings) {
                const isResult1 = isNonEmptyString(str);
                const isResult2 = isNonEmptyString(str);
                const isResult3 = isValidIdentifier(str);
                const isResult4 = isValidIdentifier(str);

                expect(isResult1).toBe(isResult2);
                expect(isResult3).toBe(isResult4);
            }
        });

        fcTest.prop([
            fc.array(fc.string({ maxLength: 50, minLength: 1 }), {
                maxLength: 50,
                minLength: 1,
            }),
        ])("should handle batch processing efficiently", (strings) => {
            // Should be able to process many values without issues
            const results = strings.map((str) => ({
                fqdn: isValidFQDN(str),
                identifier: isValidIdentifier(str),
                nonEmpty: isNonEmptyString(str),
            }));

            expect(results).toHaveLength(strings.length);

            for (const result of results) {
                expect(result.nonEmpty).toBeTypeOf("boolean");
                expect(result.identifier).toBeTypeOf("boolean");
                expect(result.fqdn).toBeTypeOf("boolean");
            }
        });
    });
});
