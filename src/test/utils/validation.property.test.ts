/**
 * Comprehensive property-based tests for validation utilities using Fast-Check
 * v4.
 *
 * @remarks
                            "monitoring",
                            "responseTime",
                            "history",
                            "checkInterval",
                            "timeout",
                            "retryAttempts",
 * These tests use property-based testing to validate the behavior of validation
 * functions across a wide range of inputs, ensuring robust handling of edge
 * cases and consistent behavior.
 *
 * Each test focuses on mathematical properties, boundary conditions, and string
 * validation logic using Fast-Check arbitraries.
 *
 * @packageDocumentation
 */

import { describe, expect } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";
import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";

// Constants to avoid lint issues with numeric literals
const MIN_CHECK_INTERVAL = MIN_MONITOR_CHECK_INTERVAL_MS;
const MAX_CHECK_INTERVAL = 300_000;
const MIN_TIMEOUT = 1000;
const MAX_TIMEOUT = 30_000;
const MIN_PORT = 1;
const MAX_PORT = 65_535;
const MIN_RETRY_ATTEMPTS = 0;
const MAX_RETRY_ATTEMPTS = 10;

// Import functions from shared validation utilities
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
} from "@shared/validation/validatorUtils";

import {
    validateMonitorType,
} from "@shared/utils/validation";
import { getMonitorValidationErrors } from "@shared/validation/monitorSchemas";

import type { MonitorType } from "@shared/types";

describe("Validation Utils Property-Based Tests", () => {
    describe("isNonEmptyString function", () => {
        fcTest.prop([
            fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        ])("should accept non-empty strings", (str) => {
            expect(isNonEmptyString(str)).toBeTruthy();
        });

        fcTest.prop([fc.constantFrom("", "   ", "\t", "\n", "  \n  ")])(
            "should reject empty or whitespace-only strings",
            (str) => {
                expect(isNonEmptyString(str)).toBeFalsy();
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
            expect(isNonEmptyString(value)).toBeFalsy();
        });

        fcTest.prop([fc.string().filter((s) => s.trim().length > 0)])(
            "should accept strings with non-whitespace content",
            (str) => {
                expect(isNonEmptyString(str)).toBeTruthy();
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
                            .string({ minLength: 1, maxLength: 10 })
                            .filter((s) => /^[A-Za-z][\dA-Za-z]*$/.test(s)),
                        fc.constantFrom("com", "org", "net", "edu")
                    )
                    .map(([subdomain, tld]) => `${subdomain}.${tld}`)
            ),
        ])("should accept valid FQDNs", (fqdn) => {
            expect(isValidFQDN(fqdn)).toBeTruthy();
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
            expect(isValidFQDN(invalidDomain)).toBeFalsy();
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
            expect(isValidFQDN(value)).toBeFalsy();
        });
    });

    describe("isValidIdentifier function", () => {
        fcTest.prop([
            fc.oneof(
                fc
                    .string({ minLength: 1 })
                    .filter(
                        (s) =>
                            /^[\w-]+$/.test(s) &&
                            s.replaceAll(/[_-]/g, "").length > 0
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
            expect(isValidIdentifier(identifier)).toBeTruthy();
        });

        fcTest.prop([
            fc.oneof(
                fc.constantFrom(
                    "",
                    "   ",
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
                            s.replaceAll(/[_-]/g, "").length === 0
                    )
            ),
        ])("should reject invalid identifiers", (invalid) => {
            expect(isValidIdentifier(invalid)).toBeFalsy();
        });

        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-string values", (value) => {
            expect(isValidIdentifier(value)).toBeFalsy();
        });
    });

    describe("isValidIdentifierArray function", () => {
        fcTest.prop([
            fc.array(
                fc
                    .string({ minLength: 1 })
                    .filter(
                        (s) =>
                            /^[\w-]+$/.test(s) &&
                            s.replaceAll(/[_-]/g, "").length > 0
                    ),
                { minLength: 0, maxLength: 10 }
            ),
        ])("should accept arrays of valid identifiers", (identifiers) => {
            expect(isValidIdentifierArray(identifiers)).toBeTruthy();
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
                    fc.array(fc.constantFrom("", "   ", "___"))
                )
                .filter((arr) => arr.length > 0),
        ])("should reject arrays with invalid identifiers", (invalidArray) => {
            expect(isValidIdentifierArray(invalidArray)).toBeFalsy();
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
            expect(isValidIdentifierArray(value)).toBeFalsy();
        });
    });

    describe("isValidInteger function", () => {
        fcTest.prop([fc.integer()])("should accept valid integer strings", (
            num
        ) => {
            expect(isValidInteger(num.toString())).toBeTruthy();
        });

        fcTest.prop([
            fc.oneof(
                fc.constantFrom("123.45", "abc", "", "  ", "12.0", "1e5"),
                fc
                    .double()
                    .filter((d) => d !== Math.floor(d))
                    .map((d) => d.toString())
            ),
        ])("should reject non-integer strings", (invalid) => {
            expect(isValidInteger(invalid)).toBeFalsy();
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
            expect(isValidInteger(value)).toBeFalsy();
        });

        fcTest.prop([fc.integer({ min: 10, max: 100 })])(
            "should respect bounds when provided",
            (num) => {
                expect(
                    isValidInteger(num.toString(), { min: 10, max: 100 })
                ).toBeTruthy();
                expect(
                    isValidInteger((num - 20).toString(), { min: 10, max: 100 })
                ).toBe(num >= 30);
                expect(
                    isValidInteger((num + 20).toString(), { min: 10, max: 100 })
                ).toBe(num <= 80);
            }
        );
    });

    describe("isValidNumeric function", () => {
        fcTest.prop([
            fc.oneof(
                fc.integer().map((i) => i.toString()),
                fc
                    .double({ noNaN: true, noDefaultInfinity: true })
                    .map((d) => d.toString())
            ),
        ])("should accept valid numeric strings", (numStr) => {
            expect(isValidNumeric(numStr)).toBeTruthy();
        });

        fcTest.prop([
            fc.constantFrom("abc", "", "  ", "123abc", "12.34.56", "infinity"),
        ])("should reject non-numeric strings", (invalid) => {
            expect(isValidNumeric(invalid)).toBeFalsy();
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
            expect(isValidNumeric(value)).toBeFalsy();
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
            expect(isValidHost(host)).toBeTruthy();
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
            expect(isValidHost(invalidHost)).toBeFalsy();
        });

        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-string values", (value) => {
            expect(isValidHost(value)).toBeFalsy();
        });
    });

    describe("isValidPort function", () => {
        fcTest.prop([fc.integer({ min: 1, max: 65_535 })])(
            "should accept valid port numbers",
            (port) => {
                expect(isValidPort(port)).toBeTruthy();
                expect(isValidPort(port.toString())).toBeTruthy();
            }
        );

        fcTest.prop([
            fc.oneof(
                fc.constant(0),
                fc.constant("0"),
                fc.integer({ min: 65_536, max: 100_000 }),
                fc.integer({ min: -100, max: -1 })
            ),
        ])("should reject invalid port numbers", (invalidPort) => {
            expect(isValidPort(invalidPort)).toBeFalsy();
        });

        fcTest.prop([
            fc.oneof(
                fc.constantFrom("abc", "", "  ", "80.5", "port"),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-numeric values", (value) => {
            expect(isValidPort(value)).toBeFalsy();
        });
    });

    describe("isValidUrl function", () => {
        fcTest.prop([
            fc.oneof(
                fc.constantFrom(
                    "https://example.com",
                    "http://test.org",
                    "https://subdomain.example.com/path",
                    "http://localhost:8080",
                    "https://127.0.0.1:443"
                )
            ),
        ])("should accept valid URLs", (url) => {
            expect(isValidUrl(url)).toBeTruthy();
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
            expect(isValidUrl(invalidUrl)).toBeFalsy();
        });

        fcTest.prop([
            fc.oneof(
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject non-string values", (value) => {
            expect(isValidUrl(value)).toBeFalsy();
        });
    });

    describe("safeInteger function", () => {
        fcTest.prop([
            fc.integer({ min: 1, max: 1000 }),
            fc.integer({ min: 0, max: 100 }),
            fc.integer({ min: 1, max: 500 }),
            fc.integer({ min: 501, max: 1000 }),
        ])("should convert valid integers within bounds", (
            value,
            defaultVal,
            minVal,
            maxVal
        ) => {
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
        });

        fcTest.prop([
            fc.oneof(
                fc.constantFrom("abc", "", "  ", "123.45", "infinity"),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
            fc.integer({ min: 0, max: 100 }),
        ])("should return default value for invalid inputs", (
            invalidValue,
            defaultVal
        ) => {
            expect(safeInteger(invalidValue, defaultVal)).toBe(defaultVal);
        });

        fcTest.prop([
            fc.integer({ min: -1000, max: 1000 }),
            fc.integer({ min: 0, max: 100 }),
            fc.integer({ min: 1, max: 50 }),
            fc.integer({ min: 51, max: 100 }),
        ])("should clamp values to bounds", (
            value,
            defaultVal,
            minVal,
            maxVal
        ) => {
            const result = safeInteger(value, defaultVal, minVal, maxVal);

            if (value < minVal) {
                expect(result).toBe(minVal);
            } else if (value > maxVal) {
                expect(result).toBe(maxVal);
            } else {
                expect(result).toBe(value);
            }
        });
    });

    describe("validateMonitorType function", () => {
        fcTest.prop([fc.constantFrom("http", "port", "ping", "dns")])(
            "should accept valid monitor types",
            (type) => {
                expect(validateMonitorType(type)).toBeTruthy();
            }
        );

        fcTest.prop([
            fc.oneof(
                fc.string().filter(
                    (s) =>
                        ![
                            "http",
                            "port",
                            "ping",
                            "dns",
                        ].includes(s)
                ),
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined)
            ),
        ])("should reject invalid monitor types", (invalidType) => {
            expect(validateMonitorType(invalidType)).toBeFalsy();
        });
    });

    describe("getMonitorValidationErrors function", () => {
        fcTest.prop([
            fc.oneof(
                // HTTP Monitor
                fc.record(
                    {
                        id: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        type: fc.constant("http") as fc.Arbitrary<MonitorType>,
                        status: fc.constantFrom(
                            "up",
                            "down",
                            "paused",
                            "pending"
                        ),
                        monitoring: fc.boolean(),
                        responseTime: fc.integer({ min: -1, max: 30_000 }),
                        history: fc.constant([]),
                        url: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        checkInterval: fc.integer({
                            min: MIN_CHECK_INTERVAL,
                            max: MAX_CHECK_INTERVAL,
                        }),
                        timeout: fc.integer({
                            min: MIN_TIMEOUT,
                            max: MAX_TIMEOUT,
                        }),
                        retryAttempts: fc.integer({
                            min: MIN_RETRY_ATTEMPTS,
                            max: MAX_RETRY_ATTEMPTS,
                        }),
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
                        id: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        type: fc.constant("port") as fc.Arbitrary<MonitorType>,
                        status: fc.constantFrom(
                            "up",
                            "down",
                            "paused",
                            "pending"
                        ),
                        monitoring: fc.boolean(),
                        responseTime: fc.integer({ min: -1, max: 30_000 }),
                        history: fc.constant([]),
                        host: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        port: fc.integer({ min: MIN_PORT, max: MAX_PORT }),
                        checkInterval: fc.integer({
                            min: MIN_CHECK_INTERVAL,
                            max: MAX_CHECK_INTERVAL,
                        }),
                        timeout: fc.integer({
                            min: MIN_TIMEOUT,
                            max: MAX_TIMEOUT,
                        }),
                        retryAttempts: fc.integer({
                            min: MIN_RETRY_ATTEMPTS,
                            max: MAX_RETRY_ATTEMPTS,
                        }),
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
                        id: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        type: fc.constant("ping") as fc.Arbitrary<MonitorType>,
                        status: fc.constantFrom(
                            "up",
                            "down",
                            "paused",
                            "pending"
                        ),
                        monitoring: fc.boolean(),
                        responseTime: fc.integer({ min: -1, max: 30_000 }),
                        history: fc.constant([]),
                        host: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        checkInterval: fc.integer({
                            min: MIN_CHECK_INTERVAL,
                            max: MAX_CHECK_INTERVAL,
                        }),
                        timeout: fc.integer({
                            min: MIN_TIMEOUT,
                            max: MAX_TIMEOUT,
                        }),
                        retryAttempts: fc.integer({
                            min: MIN_RETRY_ATTEMPTS,
                            max: MAX_RETRY_ATTEMPTS,
                        }),
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
                        id: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        type: fc.constant("dns") as fc.Arbitrary<MonitorType>,
                        status: fc.constantFrom(
                            "up",
                            "down",
                            "paused",
                            "pending"
                        ),
                        monitoring: fc.boolean(),
                        responseTime: fc.integer({ min: -1, max: 30_000 }),
                        history: fc.constant([]),
                        host: fc
                            .string({ minLength: 1 })
                            .filter((s) => s.trim().length > 0),
                        recordType: fc.constantFrom(
                            "A",
                            "AAAA",
                            "CNAME",
                            "MX",
                            "TXT"
                        ),
                        checkInterval: fc.integer({
                            min: MIN_CHECK_INTERVAL,
                            max: MAX_CHECK_INTERVAL,
                        }),
                        timeout: fc.integer({
                            min: MIN_TIMEOUT,
                            max: MAX_TIMEOUT,
                        }),
                        retryAttempts: fc.integer({
                            min: MIN_RETRY_ATTEMPTS,
                            max: MAX_RETRY_ATTEMPTS,
                        }),
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
        ])("should return no errors for valid basic monitor data", (
            monitor
        ) => {
            const errors = getMonitorValidationErrors(monitor);
            expect(Array.isArray(errors)).toBeTruthy();

            // Should not have base-field errors when base fields are present.
            expect(
                errors.some((e) => e.includes("Monitor ID is required"))
            ).toBeFalsy();
            expect(
                errors.some((e) => e.toLowerCase().startsWith("checkinterval:"))
            ).toBeFalsy();
            expect(
                errors.some((e) => e.toLowerCase().startsWith("timeout:"))
            ).toBeFalsy();
            expect(
                errors.some((e) => e.toLowerCase().startsWith("retryattempts:"))
            ).toBeFalsy();
            expect(
                errors.some((e) => e.toLowerCase().startsWith("history:"))
            ).toBeFalsy();
            expect(
                errors.some((e) => e.toLowerCase().startsWith("monitoring:"))
            ).toBeFalsy();
            expect(
                errors.some((e) => e.toLowerCase().startsWith("responsetime:"))
            ).toBeFalsy();
        });

        fcTest.prop([
            fc
                .record({
                    // Intentionally omit required fields or provide invalid values
                    id: fc.string(),
                    type: fc.constantFrom(
                        "http",
                        "port",
                        "ping",
                        "dns",
                        "invalid"
                    ),
                    status: fc.constantFrom("up", "down", "invalid"),
                    checkInterval: fc.integer({ min: -100, max: 999 }),
                    timeout: fc.integer({ min: -10, max: 0 }),
                    retryAttempts: fc.integer({ min: -1, max: 15 }),
                })
                .map((fullMonitor) => {
                    // Create partial monitor with undefined values to satisfy exactOptionalPropertyTypes
                    const partial: any = {};
                    const keys = Object.keys(
                        fullMonitor
                    ) as (keyof typeof fullMonitor)[];

                    for (const key of keys) {
                        if (Math.random() > 0.3) {
                            partial[key] = fullMonitor[key];
                        }
                        // Otherwise leave undefined (not null)
                    }

                    return partial;
                }),
        ])("should return errors for invalid monitor data", (monitor) => {
            const errors = getMonitorValidationErrors(monitor);
            expect(Array.isArray(errors)).toBeTruthy();

            // Invalid data should surface at least one error.
            expect(errors.length).toBeGreaterThan(0);
        });

        fcTest.prop([
            fc.record({
                id: fc.string({ minLength: 1 }),
                type: fc.constant("http"),
                status: fc.constantFrom("up", "down"),
                monitoring: fc.boolean(),
                responseTime: fc.integer({ min: -1, max: 30_000 }),
                history: fc.constant([]),
                url: fc.constant("https://example.com"),
                checkInterval: fc.integer({
                    min: MIN_CHECK_INTERVAL,
                    max: MAX_CHECK_INTERVAL,
                }),
                timeout: fc.integer({ min: MIN_TIMEOUT, max: MAX_TIMEOUT }),
                retryAttempts: fc.integer({
                    min: MIN_RETRY_ATTEMPTS,
                    max: MAX_RETRY_ATTEMPTS,
                }),
            }),
        ])("should validate HTTP monitor specific fields", (httpMonitor) => {
            const errors = getMonitorValidationErrors(httpMonitor);

            // Should not have URL-related errors for valid HTTP monitors
            expect(
                errors.some((e) => e.toLowerCase().startsWith("url:"))
            ).toBeFalsy();
        });

        fcTest.prop([
            fc.record({
                id: fc.string({ minLength: 1 }),
                type: fc.constant("port"),
                status: fc.constantFrom("up", "down"),
                monitoring: fc.boolean(),
                responseTime: fc.integer({ min: -1, max: 30_000 }),
                history: fc.constant([]),
                host: fc.constant("example.com"),
                port: fc.integer({ min: 1, max: MAX_PORT }),
                checkInterval: fc.integer({
                    min: MIN_CHECK_INTERVAL,
                    max: MAX_CHECK_INTERVAL,
                }),
                timeout: fc.integer({ min: MIN_TIMEOUT, max: MAX_TIMEOUT }),
                retryAttempts: fc.integer({
                    min: MIN_RETRY_ATTEMPTS,
                    max: MAX_RETRY_ATTEMPTS,
                }),
            }),
        ])("should validate port monitor specific fields", (portMonitor) => {
            const errors = getMonitorValidationErrors(portMonitor);

            // Should not have host/port-related errors for valid port monitors
            expect(
                errors.some((e) => e.toLowerCase().startsWith("host:"))
            ).toBeFalsy();
            expect(errors.some((e) => e.includes("port number"))).toBeFalsy();
        });
    });

    describe("Edge cases and robustness", () => {
        fcTest.prop([
            fc.oneof(
                fc.constant(""),
                fc.constant(null),
                fc.constant(undefined),
                fc.string({ maxLength: 0 }),
                fc.constantFrom("   ", "\t\t", "\n\n")
            ),
        ])("should handle empty/null/whitespace inputs consistently", (
            emptyInput
        ) => {
            // All validation functions should handle empty inputs gracefully
            expect(isNonEmptyString(emptyInput)).toBeFalsy();
            expect(isValidFQDN(emptyInput)).toBeFalsy();
            expect(isValidIdentifier(emptyInput)).toBeFalsy();
            expect(isValidUrl(emptyInput)).toBeFalsy();
        });

        fcTest.prop([fc.string({ minLength: 1000, maxLength: 2000 })])(
            "should handle very long strings",
            (longString) => {
                // Functions should not crash on very long inputs
                expect(() => isNonEmptyString(longString)).not.toThrowError();
                expect(() => isValidFQDN(longString)).not.toThrowError();
                expect(() => isValidIdentifier(longString)).not.toThrowError();
                expect(() => isValidUrl(longString)).not.toThrowError();
            }
        );

        fcTest.prop([
            fc.oneof(
                fc.constant(Number.MAX_SAFE_INTEGER),
                fc.constant(Number.MIN_SAFE_INTEGER),
                fc.constant(Number.POSITIVE_INFINITY),
                fc.constant(Number.NEGATIVE_INFINITY),
                fc.constant(Number.NaN)
            ),
        ])("should handle extreme numeric values", (extremeValue) => {
            // Numeric validation functions should handle extreme values
            expect(() => isValidPort(extremeValue)).not.toThrowError();
            expect(() => safeInteger(extremeValue, 0)).not.toThrowError();
        });
    });

    describe("Performance and determinism", () => {
        fcTest.prop([
            fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
                minLength: 1,
                maxLength: 100,
            }),
        ])("should be deterministic for same inputs", (strings) => {
            for (const str of strings) {
                const result1 = isNonEmptyString(str);
                const result2 = isNonEmptyString(str);
                const result3 = isValidIdentifier(str);
                const result4 = isValidIdentifier(str);

                expect(result1).toBe(result2);
                expect(result3).toBe(result4);
            }
        });

        fcTest.prop([
            fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
                minLength: 1,
                maxLength: 50,
            }),
        ])("should handle batch processing efficiently", (strings) => {
            // Should be able to process many values without issues
            const results = strings.map((str) => ({
                nonEmpty: isNonEmptyString(str),
                identifier: isValidIdentifier(str),
                fqdn: isValidFQDN(str),
            }));

            expect(results).toHaveLength(strings.length);
            for (const result of results) {
                expect(typeof result.nonEmpty).toBe("boolean");
                expect(typeof result.identifier).toBe("boolean");
                expect(typeof result.fqdn).toBe("boolean");
            }
        });
    });
});
