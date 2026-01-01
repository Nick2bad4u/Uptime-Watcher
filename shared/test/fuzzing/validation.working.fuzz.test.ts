/* eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- Disable specific rule */
/* eslint-disable no-script-url -- Fuzzing tests */

/**
 * Working Fast-Check Fuzzing Tests for Validation Utils
 *
 * @remarks
 * This test suite provides comprehensive property-based test coverage for
 * validation utilities that actually exist in the codebase.
 *
 * @file Provides working fuzzing coverage for validation functions
 *
 * @packageDocumentation
 */

import { describe, expect } from "vitest";
import fc from "fast-check";
import { test as fcTest } from "@fast-check/vitest";
import { validateMonitorType } from "../../utils/validation";
import {
    validateMonitorData,
    validateMonitorField,
} from "../../validation/monitorSchemas";
import { validateSiteData } from "../../validation/siteSchemas";

// =============================================================================
// Custom Fast-Check Arbitraries for Validation Testing
// =============================================================================

/**
 * Arbitrary for generating malformed site objects
 */
const malformedSiteArbitrary = fc.oneof(
    fc.constant(null),
    fc.constant(undefined),
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.array(fc.anything()),
    fc.record({
        identifier: fc.oneof(fc.string(), fc.integer(), fc.constant(null)),
        name: fc.oneof(fc.string(), fc.integer(), fc.constant(null)),
        monitoring: fc.oneof(fc.boolean(), fc.string(), fc.integer()),
        monitors: fc.oneof(fc.array(fc.anything()), fc.string(), fc.integer()),
    }),
    fc.record({}) // Empty object
);

/**
 * Arbitrary for generating malformed monitor objects
 */
const malformedMonitorArbitrary = fc.oneof(
    fc.constant(null),
    fc.constant(undefined),
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.array(fc.anything()),
    fc.record({
        id: fc.oneof(fc.string(), fc.integer(), fc.constant(null)),
        type: fc.oneof(fc.string(), fc.integer(), fc.constant(null)),
        status: fc.oneof(fc.string(), fc.integer(), fc.constant(null)),
        monitoring: fc.oneof(fc.boolean(), fc.string(), fc.integer()),
    }),
    fc.record({}) // Empty object
);

// =============================================================================
// Test Suite
// =============================================================================

describe("Validation Utils Comprehensive Fuzzing Tests", () => {
    describe(validateMonitorType, () => {
        fcTest.prop([fc.string()])(
            "fuzzing should correctly validate monitor types",
            (type) => {
                const result = validateMonitorType(type);

                expect(typeof result).toBe("boolean");

                // Should return true only for valid monitor types
                const validTypes = [
                    "http",
                    "port",
                    "ping",
                    "dns",
                ];
                if (validTypes.includes(type)) {
                    expect(result).toBeTruthy();
                } else {
                    expect(result).toBeFalsy();
                }
            }
        );

        fcTest.prop([fc.anything()])(
            "fuzzing should never throw an error for any input",
            (input) => {
                expect(() => {
                    validateMonitorType(input);
                }).not.toThrowError();
            }
        );
    });

    describe(validateSiteData, () => {
        fcTest.prop([malformedSiteArbitrary])(
            "should handle malformed site objects gracefully",
            (site) => {
                const result = validateSiteData(site as any).success;

                expect(typeof result).toBe("boolean");

                // For malformed inputs, should generally be invalid (false)
                if (
                    site === null ||
                    site === undefined ||
                    typeof site !== "object"
                ) {
                    expect(result).toBeFalsy();
                }
            }
        );

        fcTest.prop([fc.anything()])(
            "should never throw an error for any input",
            (input) => {
                expect(() => {
                    validateSiteData(input as any);
                }).not.toThrowError();
            }
        );
    });

    describe(validateSiteData, () => {
        fcTest.prop([malformedSiteArbitrary])(
            "should handle malformed site objects gracefully",
            (site) => {
                const result = validateSiteData(site as any);

                expect(typeof result).toBe("object");
                expect(result).toHaveProperty("success");
                expect(result).toHaveProperty("errors");
                expect(typeof result.success).toBe("boolean");
                expect(Array.isArray(result.errors)).toBeTruthy();

                // For malformed inputs, should generally be invalid
                if (
                    site === null ||
                    site === undefined ||
                    typeof site !== "object"
                ) {
                    expect(result.success).toBeFalsy();
                    expect(result.errors.length).toBeGreaterThan(0);
                }
            }
        );

        fcTest.prop([fc.anything()])(
            "should never throw an error for any input",
            (input) => {
                expect(() => {
                    validateSiteData(input as any);
                }).not.toThrowError();
            }
        );
    });

    describe(validateMonitorData, () => {
        fcTest.prop([fc.string(), malformedMonitorArbitrary])(
            "should handle malformed monitor objects gracefully",
            (monitorType, monitor) => {
                const result = validateMonitorData(monitorType, monitor as any);

                expect(typeof result).toBe("object");
                expect(result).toHaveProperty("success");
                expect(result).toHaveProperty("errors");
                expect(typeof result.success).toBe("boolean");
                expect(Array.isArray(result.errors)).toBeTruthy();

                // For malformed inputs, should generally be invalid
                if (
                    monitor === null ||
                    monitor === undefined ||
                    typeof monitor !== "object"
                ) {
                    expect(result.success).toBeFalsy();
                    expect(result.errors.length).toBeGreaterThan(0);
                }
            }
        );

        fcTest.prop([fc.string(), fc.anything()])(
            "should never throw an error for any input",
            (monitorType, input) => {
                expect(() => {
                    validateMonitorData(monitorType, input as any);
                }).not.toThrowError();
            }
        );
    });

    describe(validateMonitorField, () => {
        fcTest.prop([
            fc.string(),
            fc.string(),
            fc.anything(),
        ])(
            "should handle various field inputs",
            (monitorType, fieldName, input) => {
                const result = validateMonitorField(
                    monitorType,
                    fieldName,
                    input as any
                );

                expect(typeof result).toBe("object");
                expect(result).toHaveProperty("success");
                expect(result).toHaveProperty("errors");
                expect(typeof result.success).toBe("boolean");
                expect(Array.isArray(result.errors)).toBeTruthy();
            }
        );

        fcTest.prop([
            fc.string(),
            fc.string(),
            fc.anything(),
        ])(
            "should never throw an error for any input",
            (monitorType, fieldName, input) => {
                expect(() => {
                    validateMonitorField(monitorType, fieldName, input as any);
                }).not.toThrowError();
            }
        );
    });

    describe("Edge Case Testing", () => {
        fcTest.prop([
            fc.oneof(
                fc.constant({}),
                fc.constant([]),
                fc.constant(new Date()),
                fc.constant(new Error("test")),
                fc.constant(/test/),
                fc.constant(Symbol("test"))
            ),
        ])("should handle special object types", (specialObject) => {
            expect(() => {
                validateSiteData(specialObject as any);
                validateMonitorData("http", specialObject as any);
            }).not.toThrowError();
        });

        fcTest.prop([
            fc.oneof(
                fc.constant(Number.MAX_VALUE),
                fc.constant(Number.MIN_VALUE),
                fc.constant(Number.POSITIVE_INFINITY),
                fc.constant(Number.NEGATIVE_INFINITY),
                fc.constant(Number.NaN)
            ),
        ])("should handle extreme numeric values", (numericValue) => {
            const testObject = {
                numericField: numericValue,
                stringField: String(numericValue),
            };

            expect(() => {
                validateSiteData(testObject as any);
            }).not.toThrowError();
        });

        fcTest.prop([
            fc.oneof(
                fc.string({ minLength: 0, maxLength: 0 }), // Empty string
                fc.constant("   "), // Whitespace
                fc.constant("\n\t\r"), // Newlines and tabs
                fc.string({ minLength: 1000, maxLength: 2000 }), // Very long string
                fc.string()
            ),
        ])("should handle various string edge cases", (stringValue) => {
            const testObject = {
                identifier: stringValue,
                name: stringValue,
                stringField: stringValue,
            };

            expect(() => {
                validateSiteData(testObject as any);
            }).not.toThrowError();
        });
    });

    describe("Security Testing", () => {
        fcTest.prop([
            fc.oneof(
                fc.constant("javascript:alert('xss')"),
                fc.constant("<script>alert('xss')</script>"),
                fc.constant("data:text/html,<script>alert('xss')</script>"),
                fc.constant("vbscript:msgbox('xss')"),
                fc.constant("ldap://example.com"),
                fc.constant("file:///etc/passwd"),
                fc.constant("ftp://malicious.com")
            ),
        ])(
            "should handle potential malicious payloads safely",
            (maliciousString) => {
                const maliciousObject = {
                    identifier: maliciousString,
                    name: maliciousString,
                    url: maliciousString,
                };

                expect(() => {
                    const result = validateSiteData(maliciousObject as any);
                    expect(result).toHaveProperty("success");
                    expect(result).toHaveProperty("errors");
                }).not.toThrowError();
            }
        );

        fcTest.prop([
            fc.oneof(
                fc.constant("../../../etc/passwd"),
                fc.constant(String.raw`..\..\..\windows\system32\config\sam`),
                fc.constant("/dev/null"),
                fc.constant("/dev/random"),
                fc.constant(String.raw`C:\Windows\System32\drivers\etc\hosts`),
                fc.constant(String.raw`\\server\share\file.txt`)
            ),
        ])("should handle path traversal attempts safely", (pathString) => {
            const testObject = {
                path: pathString,
                filename: pathString,
            };

            expect(() => {
                const result = validateSiteData(testObject as any);
                expect(typeof result).toBe("object");
            }).not.toThrowError();
        });
    });
});
