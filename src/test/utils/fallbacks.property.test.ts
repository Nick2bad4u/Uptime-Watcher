/**
 * @remarks
 * These tests use property-based testing to verify fallback utility functions
 * with comprehensive edge case coverage and randomized inputs. Tests default
 * value management and display utilities.
 *
 * Comprehensive Coverage Areas:
 *
 * - Display utilities (getMonitorDisplayIdentifier, getMonitorTypeDisplayLabel)
 * - String processing utilities (truncateForLogging)
 * - Edge cases and robustness (null inputs, malformed objects)
 * - Performance and determinism testing
 *
 * @file Property-based tests for fallback utilities using Fast-Check
 *
 * @packageDocumentation
 */

import type { Monitor, MonitorStatus } from "@shared/types";

import { MONITOR_STATUS_VALUES } from "@shared/types";
import { getSafeUrlForDisplay } from "@shared/utils/urlSafety";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
    truncateForLogging,
    UiDefaults,
} from "../../utils/fallbacks";

describe("fallback Utils Property-Based Tests", () => {
    // =============================================================================
    // Arbitraries
    // =============================================================================

    /**
     * Generates various monitor objects for testing
     */
    const monitorArbitrary = fc.record(
        {
            checkInterval: fc.option(
                fc.integer({ min: 1000, max: 86_400_000 })
            ), // 1s to 24h
            host: fc.option(
                fc
                    .string({ minLength: 1, maxLength: 100 })
                    .filter((s) => s.trim().length > 0)
            ),
            id: fc.string({ minLength: 1, maxLength: 50 }),
            port: fc.option(fc.integer({ min: 1, max: 65_535 })),
            retryAttempts: fc.option(fc.integer({ min: 0, max: 10 })),
            status: fc.constantFrom<MonitorStatus>(...MONITOR_STATUS_VALUES),
            timeout: fc.option(fc.integer({ min: 1000, max: 30_000 })), // 1s to 30s
            type: fc.constantFrom("http", "ping", "port", "dns", "ssl", "api"),
            url: fc.option(fc.webUrl()),
        },
        {
            requiredKeys: [
                "id",
                "type",
                "status",
            ],
        }
    ) as fc.Arbitrary<Monitor>;

    /**
     * Generates various invalid monitor objects
     */
    const invalidMonitorArbitrary = fc.oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.constant({}),
        fc.record({
            type: fc.oneof(
                fc.constant(null),
                fc.constant(undefined),
                fc.constant(""),
                fc.integer(),
                fc.boolean()
            ),
        }),
        fc.record({
            id: fc.oneof(fc.constant(null), fc.constant(undefined)),
            status: fc.string(),
            type: fc.string(),
        })
    );

    describe("getMonitorDisplayIdentifier function", () => {
        it("should return URL for HTTP monitors when available", () => {
            fc.assert(
                fc.property(
                    fc.webUrl(),
                    fc.string({ minLength: 1 }),
                    (url, siteFallback) => {
                        const monitor = {
                            id: "1",
                            status: "up",
                            type: "http",
                            url,
                        } as Monitor;
                        const result = getMonitorDisplayIdentifier(
                            monitor,
                            siteFallback
                        );

                        expect(result).toBe(getSafeUrlForDisplay(url));
                    }
                )
            );
        });

        it("should return host for ping monitors when available", () => {
            fc.assert(
                fc.property(
                    fc
                        .string({ minLength: 1 })
                        .filter((s) => s.trim().length > 0),
                    fc.string({ minLength: 1 }),
                    (host, siteFallback) => {
                        const monitor = {
                            host,
                            id: "1",
                            status: "up",
                            type: "ping",
                        } as Monitor;
                        const result = getMonitorDisplayIdentifier(
                            monitor,
                            siteFallback
                        );

                        expect(result).toBe(host);
                    }
                )
            );
        });

        it("should return host:port for port monitors when both are available", () => {
            fc.assert(
                fc.property(
                    fc
                        .string({ minLength: 1 })
                        .filter((s) => s.trim().length > 0),
                    fc.integer({ max: 65_535, min: 1 }),
                    fc.string({ minLength: 1 }),
                    (host, port, siteFallback) => {
                        const monitor = {
                            host,
                            id: "1",
                            port,
                            status: "up",
                            type: "port",
                        } as Monitor;
                        const result = getMonitorDisplayIdentifier(
                            monitor,
                            siteFallback
                        );

                        expect(result).toBe(`${host}:${port}`);
                    }
                )
            );
        });

        it("should return site fallback for monitors without identifiable fields", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom("http", "ping", "port", "unknown"),
                    fc.string({ minLength: 1 }),
                    (type, siteFallback) => {
                        const monitor = {
                            id: "1",
                            status: "up",
                            type,
                        } as Monitor;
                        const result = getMonitorDisplayIdentifier(
                            monitor,
                            siteFallback
                        );

                        expect(result).toBe(siteFallback);
                    }
                )
            );
        });

        it("should handle malformed monitor objects gracefully", () => {
            fc.assert(
                fc.property(
                    invalidMonitorArbitrary,
                    fc.string({ minLength: 1 }),
                    (monitor, siteFallback) => {
                        const result = getMonitorDisplayIdentifier(
                            monitor as any,
                            siteFallback
                        );

                        expect(result).toBeTypeOf("string");
                        expect(result.length).toBeGreaterThan(0);
                        // Should return siteFallback for invalid monitors
                        expect(result).toBe(siteFallback);
                    }
                )
            );
        });

        it("should prioritize specific fields over generic fields", () => {
            fc.assert(
                fc.property(
                    fc.webUrl(),
                    fc
                        .string({ minLength: 1 })
                        .filter((s) => s.trim().length > 0),
                    fc.integer({ max: 65_535, min: 1 }),
                    fc.string({ minLength: 1 }),
                    (url, host, port, siteFallback) => {
                        // HTTP monitor with both URL and host - should prefer URL
                        const monitor = {
                            host,
                            id: "1",
                            port,
                            status: "up",
                            type: "http",
                            url,
                        } as Monitor;
                        const result = getMonitorDisplayIdentifier(
                            monitor,
                            siteFallback
                        );

                        expect(result).toBe(getSafeUrlForDisplay(url));
                    }
                )
            );
        });
    });

    // =============================================================================
    // getMonitorTypeDisplayLabel Function Tests
    // =============================================================================

    describe("getMonitorTypeDisplayLabel function", () => {
        it("should return predefined labels for known monitor types", () => {
            const knownTypes = new Map([
                ["http", "Website URL"],
                ["ping", "Ping Monitor"],
                ["port", "Host & Port"],
            ]);

            for (const [type, expectedLabel] of knownTypes) {
                const result = getMonitorTypeDisplayLabel(type);

                expect(result).toBe(expectedLabel);
            }
        });

        it("should generate reasonable labels for unknown monitor types", () => {
            fc.assert(
                fc.property(
                    fc.string({ maxLength: 20, minLength: 1 }).filter(
                        (s) =>
                            ![
                                "http",
                                "ping",
                                "port",
                            ].includes(s)
                    ),
                    (unknownType) => {
                        const result = getMonitorTypeDisplayLabel(unknownType);

                        expect(result).toBeTypeOf("string");
                        expect(result.length).toBeGreaterThan(0);
                        expect(result.endsWith("Monitor")).toBe(true);
                    }
                )
            );
        });

        it("should handle camelCase and snake_case type names", () => {
            const testCases = [
                ["httpApi", "HTTP API Monitor"],
                ["ssl_certificate", "Ssl Certificate Monitor"],
                ["databaseConnection", "Database Connection Monitor"],
                ["web_service", "Web Service Monitor"],
            ];

            for (const [input, _expectedPattern] of testCases) {
                const result = getMonitorTypeDisplayLabel(input!);

                expect(result).toContain("Monitor");
                expect(result.split(" ").length).toBeGreaterThan(1);
            }
        });

        it("should handle invalid input gracefully", () => {
            const invalidInputs = [
                "",
                null,
                undefined,
                123,
                true,
                {},
                [],
            ];

            for (const input of invalidInputs) {
                const result = getMonitorTypeDisplayLabel(input as any);

                expect(result).toBeTypeOf("string");
                expect(result.length).toBeGreaterThan(0);
            }
        });

        it("should be consistent for the same input", () => {
            fc.assert(
                fc.property(fc.string(), (monitorType) => {
                    const result1 = getMonitorTypeDisplayLabel(monitorType);
                    const result2 = getMonitorTypeDisplayLabel(monitorType);

                    expect(result1).toBe(result2);
                })
            );
        });
    });

    // =============================================================================
    // truncateForLogging Function Tests
    // =============================================================================

    describe("truncateForLogging function", () => {
        it("should return original string when shorter than or equal to maxLength", () => {
            fc.assert(
                fc.property(
                    fc.string({ maxLength: 50, minLength: 0 }),
                    fc.integer({ max: 100, min: 50 }),
                    (str, maxLength) => {
                        const result = truncateForLogging(str, maxLength);

                        expect(result).toBe(str);
                        expect(result.length).toBeLessThanOrEqual(maxLength);
                    }
                )
            );
        });

        it("should truncate strings longer than maxLength", () => {
            fc.assert(
                fc.property(
                    fc.string({ maxLength: 1000, minLength: 51 }),
                    fc.integer({ max: 50, min: 1 }),
                    (str, maxLength) => {
                        const result = truncateForLogging(str, maxLength);

                        expect(result).toHaveLength(maxLength);
                        expect(result).toBe(str.slice(0, maxLength));
                    }
                )
            );
        });

        it("should use default maxLength of 50 when not specified", () => {
            fc.assert(
                fc.property(
                    fc.string({ maxLength: 1000, minLength: 51 }),
                    (str) => {
                        const result = truncateForLogging(str);

                        expect(result).toHaveLength(50);
                        expect(result).toBe(str.slice(0, 50));
                    }
                )
            );
        });

        it("should handle empty strings and edge cases", () => {
            expect(truncateForLogging("")).toBe("");
            expect(truncateForLogging("", 0)).toBe("");
            expect(truncateForLogging("short", 100)).toBe("short");
        });

        it("should handle unicode strings correctly", () => {
            fc.assert(
                fc.property(
                    fc.string({ maxLength: 200, minLength: 1, unit: "binary" }),
                    fc.integer({ max: 50, min: 10 }),
                    (unicodeStr: string, maxLength) => {
                        const result = truncateForLogging(
                            unicodeStr,
                            maxLength
                        );

                        expect(result.length).toBeLessThanOrEqual(maxLength);

                        if (unicodeStr.length > maxLength) {
                            expect(result).toHaveLength(maxLength);
                        } else {
                            expect(result).toBe(unicodeStr);
                        }
                    }
                )
            );
        });

        it("should handle special characters and newlines", () => {
            const specialStrings = [
                "line1\nline2\nline3 with more text than fifty characters total",
                "tab\tseparated\tvalues\twith\tmore\tthan\tfifty\tcharacters",
                String.raw`special chars: !@#$%^&*()[]{}|:\";'<>?,./ and more text`,
                "mixed\n\t\rwhitespace\n\tand\rmore\ntext\tthan\rfifty\nchars",
            ];

            for (const str of specialStrings) {
                const result = truncateForLogging(str, 30);

                expect(result).toHaveLength(30);
                expect(result).toBe(str.slice(0, 30));
            }
        });
    });

    // =============================================================================
    // Default Values Constants Tests
    // =============================================================================

    describe("default values constants", () => {
        it("should have well-defined UiDefaults object with expected properties", () => {
            // Test that UiDefaults contains expected properties
            expect(UiDefaults).toHaveProperty("chartPeriod", "24h");
            expect(UiDefaults).toHaveProperty("chartPoints", 24);
            expect(UiDefaults).toHaveProperty("errorLabel", "Error");
            expect(UiDefaults).toHaveProperty("loadingDelay", 100);
            expect(UiDefaults).toHaveProperty("loadingLabel", "Loading...");
            expect(UiDefaults).toHaveProperty("notAvailableLabel", "N/A");
            expect(UiDefaults).toHaveProperty("pageSize", 10);
            expect(UiDefaults).toHaveProperty("unknownLabel", "Unknown");

            // Test that all values have correct types
            expect(UiDefaults.chartPeriod).toBeTypeOf("string");
            expect(UiDefaults.chartPoints).toBeTypeOf("number");
            expect(UiDefaults.errorLabel).toBeTypeOf("string");
            expect(UiDefaults.loadingDelay).toBeTypeOf("number");
            expect(UiDefaults.loadingLabel).toBeTypeOf("string");
            expect(UiDefaults.notAvailableLabel).toBeTypeOf("string");
            expect(UiDefaults.pageSize).toBeTypeOf("number");
            expect(UiDefaults.unknownLabel).toBeTypeOf("string");
        });
    });

    // =============================================================================
    // Edge Cases and Robustness
    // =============================================================================

    describe("edge cases and robustness", () => {
        it("should handle null and undefined inputs across display functions", () => {
            const nullInputs = [null, undefined];

            for (const input of nullInputs) {
                expect(() =>
                    getMonitorDisplayIdentifier(input as any, "fallback")
                ).not.toThrow();
                expect(() =>
                    getMonitorTypeDisplayLabel(input as any)
                ).not.toThrow();
                // TruncateForLogging returns the original value for falsy inputs (including null)
                expect(truncateForLogging(input as any)).toBe(input);
            }
        });

        it("should handle extreme string lengths gracefully", () => {
            // Very long string
            const longString = "a".repeat(100_000);

            expect(() => truncateForLogging(longString, 50)).not.toThrow();
            expect(truncateForLogging(longString, 50)).toBe("a".repeat(50));

            // Empty string
            expect(truncateForLogging("", 50)).toBe("");

            // Single character
            expect(truncateForLogging("x", 50)).toBe("x");
        });

        it("should maintain performance with large inputs", () => {
            const largeInputs = Array.from(
                { length: 1000 },
                (_, i) => `item-${i}`
            );

            const startTime = Date.now();

            for (const input of largeInputs) {
                getMonitorTypeDisplayLabel(input);
                truncateForLogging(input, 25);
            }

            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });

    // =============================================================================
    // Performance and Determinism
    // =============================================================================

    describe("performance and determinism", () => {
        it("should be deterministic for same inputs", () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    monitorArbitrary,
                    fc.integer({ max: 100, min: 10 }),
                    (str, monitor, maxLength) => {
                        // Multiple calls should return identical results
                        const type1 = getMonitorTypeDisplayLabel(str);
                        const type2 = getMonitorTypeDisplayLabel(str);

                        expect(type1).toBe(type2);

                        const id1 = getMonitorDisplayIdentifier(
                            monitor,
                            "fallback"
                        );
                        const id2 = getMonitorDisplayIdentifier(
                            monitor,
                            "fallback"
                        );

                        expect(id1).toBe(id2);

                        const trunc1 = truncateForLogging(str, maxLength);
                        const trunc2 = truncateForLogging(str, maxLength);

                        expect(trunc1).toBe(trunc2);
                    }
                )
            );
        });

        it("should handle batch processing efficiently", () => {
            fc.assert(
                fc.property(
                    fc.array(monitorArbitrary, {
                        maxLength: 100,
                        minLength: 10,
                    }),
                    fc.array(fc.string(), { maxLength: 100, minLength: 10 }),
                    (monitors, strings) => {
                        const startTime = Date.now();

                        // Process all monitors and strings
                        const results = {
                            identifiers: monitors.map((m) =>
                                getMonitorDisplayIdentifier(m, "fallback")
                            ),
                            truncated: strings.map((s) =>
                                truncateForLogging(s, 30)
                            ),
                            types: strings.map((s) =>
                                getMonitorTypeDisplayLabel(s)
                            ),
                        };

                        const endTime = Date.now();

                        // Should process efficiently
                        expect(endTime - startTime).toBeLessThan(1000);

                        // Results should have proper lengths
                        expect(results.identifiers).toHaveLength(
                            monitors.length
                        );
                        expect(results.types).toHaveLength(strings.length);
                        expect(results.truncated).toHaveLength(strings.length);
                        // All results should be strings
                        for (const result of results.identifiers) {
                            expect(result).toBeTypeOf("string");
                        }
                        for (const result of results.types) {
                            expect(result).toBeTypeOf("string");
                        }
                    }
                )
            );
        });
    });
});
