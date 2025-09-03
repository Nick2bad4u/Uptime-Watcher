/**
 * Property-based fuzzing tests for form validation functions.
 *
 * @remarks
 * Tests the monitor validation functions and form data processing using
 * property-based testing with fast-check. Focuses on validating that form
 * validation handles malformed, unexpected, and edge-case input gracefully.
 *
 * Key areas tested:
 *
 * - Monitor object creation robustness
 * - Form data type safety
 * - Input sanitization
 * - Error handling paths
 * - Edge case handling
 *
 * @packageDocumentation
 */

import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { normalizeMonitor } from "../../stores/sites/utils/monitorOperations";

// Define simple test types to avoid complex type issues
type SimpleMonitorType = "http" | "ping" | "port" | "dns";

// Helper function to safely create monitor objects for fuzzing tests
function createMonitorObjectForFuzzing(type: SimpleMonitorType, formData: unknown) {
    return normalizeMonitor({
        type,
        ...(typeof formData === 'object' && formData !== null ? formData : {})
    });
}

describe("Form Validation Fuzzing Tests", () => {
    describe("Monitor Object Creation Fuzzing", () => {
        it("should handle any monitor type and form data without throwing", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("http" as SimpleMonitorType),
                        fc.constant("ping" as SimpleMonitorType),
                        fc.constant("port" as SimpleMonitorType),
                        fc.constant("dns" as SimpleMonitorType),
                        fc.string({
                            maxLength: 20,
                        }) as fc.Arbitrary<SimpleMonitorType>
                    ),
                    fc.record({
                        url: fc.oneof(
                            fc.webUrl(),
                            fc.string(),
                            fc.constant(undefined)
                        ),
                        host: fc.oneof(
                            fc.domain(),
                            fc.ipV4(),
                            fc.string(),
                            fc.constant(undefined)
                        ),
                        port: fc.oneof(
                            fc.integer({ min: 1, max: 65_535 }),
                            fc.string(),
                            fc.constant(undefined)
                        ),
                        interval: fc.oneof(
                            fc.integer({ min: 1, max: 3_600_000 }),
                            fc.string(),
                            fc.constant(undefined)
                        ),
                        timeout: fc.oneof(
                            fc.integer({ min: 1000, max: 60_000 }),
                            fc.string(),
                            fc.constant(undefined)
                        ),
                        retryAttempts: fc.oneof(
                            fc.integer({ min: 0, max: 10 }),
                            fc.string(),
                            fc.constant(undefined)
                        ),
                    }),
                    (type: SimpleMonitorType, formData: unknown) => {
                        // Property: normalizeMonitor should never throw

                        expect(() =>
                            normalizeMonitor({
                                type,
                                ...(typeof formData === 'object' && formData !== null ? formData : {})
                            })
                        ).not.toThrow();

                        const result = normalizeMonitor({
                            type,
                            ...(typeof formData === 'object' && formData !== null ? formData : {})
                        });

                        // Property: result should always have required fields
                        expect(result).toHaveProperty("type");
                        expect(result).toHaveProperty("monitoring");
                        expect(result).toHaveProperty("status");
                        expect(result).toHaveProperty("history");
                        expect(result).toHaveProperty("responseTime");
                        expect(result).toHaveProperty("retryAttempts");
                        expect(result).toHaveProperty("timeout");

                        // Property: type should match input if valid, otherwise should be normalized
                        if (["http", "ping", "port", "dns"].includes(type)) {
                            expect(result.type).toBe(type);
                        } else {
                            // Invalid types should be normalized to a valid default
                            expect(["http", "ping", "port", "dns"]).toContain(result.type);
                        }

                        // Property: required fields should have correct default types
                        expect(typeof result.monitoring).toBe("boolean");
                        expect(typeof result.responseTime).toBe("number");
                        expect(Array.isArray(result.history)).toBe(true);
                        expect(typeof result.retryAttempts).toBe("number");
                        expect(typeof result.timeout).toBe("number");
                    }
                )
            );
        });

        it("should preserve valid numeric form data fields", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("http" as SimpleMonitorType),
                        fc.constant("ping" as SimpleMonitorType),
                        fc.constant("port" as SimpleMonitorType),
                        fc.constant("dns" as SimpleMonitorType)
                    ),
                    fc.record({
                        timeout: fc.integer({ min: 5000, max: 30_000 }),
                        retryAttempts: fc.integer({ min: 1, max: 5 }),
                    }),
                    (
                        type: SimpleMonitorType,
                        formData: { timeout: number; retryAttempts: number }
                    ) => {
                        const result = createMonitorObjectForFuzzing(type, formData);

                        // Property: valid numeric data should be preserved
                        expect(result.timeout).toBe(formData.timeout);
                        expect(result.retryAttempts).toBe(
                            formData.retryAttempts
                        );
                    }
                )
            );
        });

        it("should handle malformed and invalid field types gracefully", () => {
            fc.assert(
                fc.property(
                    fc.constant("http" as SimpleMonitorType),
                    fc.record({
                        url: fc.oneof(
                            fc.anything(),
                            fc.constant(null),
                            fc.constant(undefined),
                            fc.object()
                        ),
                        host: fc.oneof(
                            fc.anything(),
                            fc.constant(null),
                            fc.constant(undefined),
                            fc.array(fc.string())
                        ),
                        port: fc.oneof(
                            fc.anything(),
                            fc.constant("not-a-number"),
                            fc.constant(-1),
                            fc.constant(70_000),
                            fc.float()
                        ),
                        timeout: fc.oneof(
                            fc.anything(),
                            fc.constant("timeout"),
                            fc.array(fc.integer())
                        ),
                        retryAttempts: fc.oneof(
                            fc.anything(),
                            fc.string(),
                            fc.constant(-5),
                            fc.constant(100)
                        ),
                    }),
                    (type: SimpleMonitorType, formData: unknown) => {
                        // Property: should handle invalid data gracefully

                        expect(() =>
                            createMonitorObjectForFuzzing(type, formData)
                        ).not.toThrow();

                        const result = createMonitorObjectForFuzzing(type, formData);

                        // Property: should maintain required fields even with invalid input
                        expect(result.type).toBe(type);
                        expect(typeof result.monitoring).toBe("boolean");
                        expect(typeof result.responseTime).toBe("number");
                        expect(Array.isArray(result.history)).toBe(true);
                    }
                )
            );
        });

        it("should handle deeply nested and complex form data", () => {
            fc.assert(
                fc.property(
                    fc.constant("http" as SimpleMonitorType),
                    fc.object({ maxDepth: 5 }),
                    (type: SimpleMonitorType, complexData: object) => {
                        // Property: should handle complex nested data without crashing

                        expect(() =>
                            createMonitorObjectForFuzzing(type, complexData)
                        ).not.toThrow();

                        const result = createMonitorObjectForFuzzing(type, complexData);

                        // Property: core fields should still be valid
                        expect(result.type).toBe(type);
                        expect(typeof result.monitoring).toBe("boolean");
                    }
                )
            );
        });

        it("should handle extreme numeric values", () => {
            fc.assert(
                fc.property(
                    fc.constant("port" as SimpleMonitorType),
                    fc.record({
                        port: fc.oneof(
                            fc.constant(Number.MAX_SAFE_INTEGER),
                            fc.constant(Number.MIN_SAFE_INTEGER),
                            fc.constant(Number.POSITIVE_INFINITY),
                            fc.constant(Number.NEGATIVE_INFINITY),
                            fc.constant(Number.NaN),
                            fc.constant(0),
                            fc.float({ min: -1e10, max: 1e10 })
                        ),
                        timeout: fc.oneof(
                            fc.constant(Number.MAX_SAFE_INTEGER),
                            fc.constant(0),
                            fc.constant(-1000),
                            fc.float({ min: -1e6, max: 1e6 })
                        ),
                        retryAttempts: fc.oneof(
                            fc.constant(Number.MAX_SAFE_INTEGER),
                            fc.constant(-100),
                            fc.float()
                        ),
                    }),
                    (type: SimpleMonitorType, extremeData: unknown) => {
                        expect(() =>
                            createMonitorObjectForFuzzing(type, extremeData)
                        ).not.toThrow();

                        const result = createMonitorObjectForFuzzing(type, extremeData);

                        // Property: should handle extreme values gracefully
                        expect(result.type).toBe(type);
                        expect(typeof result.monitoring).toBe("boolean");
                    }
                )
            );
        });

        it("should handle Unicode and special characters in string fields", () => {
            fc.assert(
                fc.property(
                    fc.constant("http" as SimpleMonitorType),
                    fc.record({
                        url: fc.oneof(
                            fc.string({ maxLength: 200 }),
                            fc.constant(
                                "https://üñíçødé.example.com/påth?ñámé=vålúé"
                            ),
                            fc.constant("https://🌟.example.com/🚀"),
                            fc.constant("https://例え.テスト"),
                            fc.constant("")
                        ),
                        host: fc.oneof(
                            fc.string({ maxLength: 100 }),
                            fc.constant("üñíçødé.example.com"),
                            fc.constant("localhost"),
                            fc.constant("")
                        ),
                    }),
                    (
                        type: SimpleMonitorType,
                        unicodeData: { url: string; host: string }
                    ) => {
                        expect(() =>
                            createMonitorObjectForFuzzing(type, unicodeData)
                        ).not.toThrow();

                        const result = createMonitorObjectForFuzzing(type, unicodeData);

                        // Property: Function should handle Unicode gracefully
                        // Valid URLs may be preserved, invalid ones get defaults
                        expect(typeof result.url).toBe("string");
                        if (result.url) {
                            expect(result.url.length).toBeGreaterThan(0);
                        }

                        // Host field handling depends on monitor type and validity
                        if (result.host !== undefined) {
                            expect(typeof result.host).toBe("string");
                        }
                    }
                )
            );
        });

        it("should handle prototype pollution attempts", () => {
            fc.assert(
                fc.property(
                    fc.constant("http" as SimpleMonitorType),
                    (type: SimpleMonitorType) => {
                        const maliciousData = {
                            __proto__: { malicious: true },
                            constructor: { prototype: { hacked: true } },
                            toString: () => "malicious",
                            valueOf: () => ({ evil: true }),
                            url: "https://example.com",
                            host: "example.com",
                        };

                        expect(() =>
                            createMonitorObjectForFuzzing(type, maliciousData)
                        ).not.toThrow();

                        const result = createMonitorObjectForFuzzing(type, maliciousData);

                        // Property: should preserve legitimate fields for the monitor type
                        expect(result.url).toBe("https://example.com");
                        expect(result.type).toBe(type);

                        // HTTP monitors don't have a host field - that's for ping/port/dns monitors
                        // So we shouldn't expect host to be present in an HTTP monitor
                        expect(result.host).toBeUndefined();

                        // Property: malicious prototype properties should not affect core functionality
                        expect(typeof result.monitoring).toBe("boolean");
                        expect(Array.isArray(result.history)).toBe(true);
                    }
                )
            );
        });
    });

    describe("Form Field Validation Edge Cases", () => {
        it("should handle empty and whitespace-only inputs", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant(""),
                        fc.constant("   "),
                        fc.constant(String.raw`\t\n\r`),
                        fc
                            .string({ maxLength: 50 })
                            .filter((s) => s.trim() === "")
                    ),
                    (emptyInput: string) => {
                        const formData = {
                            url: emptyInput,
                            host: emptyInput,
                        };

                        expect(() =>
                            createMonitorObjectForFuzzing("http", formData)
                        ).not.toThrow();

                        const result = createMonitorObjectForFuzzing("http", formData);

                        // Property: Empty/whitespace inputs should be normalized
                        // Invalid URLs should get default, HTTP monitors don't have host field
                        expect(result.url).toBe("https://example.com");
                        expect(result.host).toBeUndefined();
                    }
                )
            );
        });

        it("should handle very long input strings", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1000, maxLength: 10_000 }),
                    fc.string({ minLength: 500, maxLength: 5000 }),
                    (longUrl: string, longHost: string) => {
                        const formData = {
                            url: `https://${longUrl}.com`,
                            host: longHost,
                        };

                        expect(() =>
                            createMonitorObjectForFuzzing("http", formData)
                        ).not.toThrow();

                        const result = createMonitorObjectForFuzzing("http", formData);

                        // Property: Very long strings are likely invalid URLs and should be normalized
                        // URL validation will reject extremely long URLs and apply defaults
                        expect(typeof result.url).toBe("string");
                        if (result.url) {
                            expect(result.url.length).toBeGreaterThan(0);
                        }
                        // HTTP monitors don't have host field
                        expect(result.host).toBeUndefined();
                    }
                )
            );
        });

        it("should handle boundary values for numeric fields", () => {
            fc.assert(
                fc.property(
                    fc.record({
                        port: fc.oneof(
                            fc.constant(1),
                            fc.constant(65_535),
                            fc.constant(0),
                            fc.constant(65_536),
                            fc.constant(-1)
                        ),
                        timeout: fc.oneof(
                            fc.constant(1),
                            fc.constant(1000),
                            fc.constant(60_000),
                            fc.constant(0),
                            fc.constant(-1)
                        ),
                        retryAttempts: fc.oneof(
                            fc.constant(0),
                            fc.constant(1),
                            fc.constant(10),
                            fc.constant(-1),
                            fc.constant(100)
                        ),
                    }),
                    (boundaryData: {
                        port: number;
                        timeout: number;
                        retryAttempts: number;
                    }) => {
                        expect(() =>
                            createMonitorObjectForFuzzing("port", boundaryData)
                        ).not.toThrow();

                        const result = createMonitorObjectForFuzzing(
                            "port",
                            boundaryData
                        );

                        // Property: valid boundary values preserved, invalid ones get defaults
                        // Check that the fields are the correct type and within valid ranges
                        expect(typeof result.timeout).toBe("number");
                        expect(result.timeout).toBeGreaterThan(0);

                        expect(typeof result.retryAttempts).toBe("number");
                        expect(result.retryAttempts).toBeGreaterThanOrEqual(0);

                        expect(typeof result.port).toBe("number");
                        expect(result.port).toBeGreaterThan(0);
                        expect(result.port).toBeLessThanOrEqual(65_535);

                        // Verify the structure is correct
                        expect(result.type).toBe("port");
                        expect(typeof result.host).toBe("string");
                    }
                )
            );
        });

        it("should handle mixed type inputs for numeric fields", () => {
            fc.assert(
                fc.property(
                    fc.record({
                        port: fc.oneof(
                            fc.integer({ min: 1, max: 65_535 }),
                            fc.integer({ min: 1, max: 65_535 }).map(String),
                            fc.constant("invalid"),
                            fc.constant(null),
                            fc.constant(undefined),
                            fc.boolean(),
                            fc.array(fc.integer())
                        ),
                        timeout: fc.oneof(
                            fc.integer({ min: 1000, max: 60_000 }),
                            fc.integer({ min: 1000, max: 60_000 }).map(String),
                            fc.constant("timeout-value"),
                            fc.object()
                        ),
                        retryAttempts: fc.oneof(
                            fc.integer({ min: 0, max: 10 }),
                            fc.integer({ min: 0, max: 10 }).map(String),
                            fc.constant("retry"),
                            fc.float()
                        ),
                    }),
                    (mixedData: unknown) => {
                        expect(() =>
                            createMonitorObjectForFuzzing("port", mixedData)
                        ).not.toThrow();

                        const result = createMonitorObjectForFuzzing("port", mixedData);

                        // Property: should handle mixed types gracefully without throwing
                        expect(result.type).toBe("port");
                        expect(typeof result.monitoring).toBe("boolean");

                        // Property: numeric fields should always be valid numbers after normalization
                        expect(typeof result.timeout).toBe("number");
                        expect(result.timeout).toBeGreaterThan(0);

                        expect(typeof result.retryAttempts).toBe("number");
                        expect(result.retryAttempts).toBeGreaterThanOrEqual(0);

                        expect(typeof result.port).toBe("number");
                        expect(result.port).toBeGreaterThan(0);
                        expect(result.port).toBeLessThanOrEqual(65_535);

                        // Property: required port monitor fields should be present
                        expect(typeof result.host).toBe("string");
                        if (result.host) {
                            expect(result.host.length).toBeGreaterThan(0);
                        }
                    }
                )
            );
        });
    });
});
