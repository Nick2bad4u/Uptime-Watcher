/**
 * Comprehensive Fast-Check Property-Based Tests for Shared Validation Module
 *
 * @version 1.0.0
 *
 * @file Extensive property-based testing using fast-check to achieve 100%
 *   function coverage for all validation utilities in shared/validation/*.
 *   Tests edge cases, boundary conditions, and ensures robust validation
 *   behavior.
 *
 * @author Fast-Check Enhancement Suite
 */

import { fc, it } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import validator from "validator";

// Import all validation functions to test
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

import {
    validateMonitorData,
    validateMonitorField,
} from "../validation/monitorSchemas";
import { validateSiteData } from "../validation/siteSchemas";

describe("Comprehensive Validation Module Fast-Check Tests", () => {
    describe("validatorUtils.ts Functions", () => {
        describe(isNonEmptyString, () => {
            it.prop([fc.string().filter((s) => s.trim().length > 0)])(
                "should return true for non-empty strings",
                (validString) => {
                    expect(isNonEmptyString(validString)).toBeTruthy();
                }
            );

            it.prop([
                fc.oneof(
                    fc.constant(""),
                    fc.constant("   "),
                    fc.constant("\t\n\r"),
                    fc.integer(),
                    fc.boolean(),
                    fc.constantFrom(null, undefined),
                    fc.array(fc.anything()),
                    fc.object()
                ),
            ])("should return false for non-string or empty values", (
                invalidValue
            ) => {
                expect(isNonEmptyString(invalidValue)).toBeFalsy();
            });

            it.prop([fc.string()])("should handle all strings consistently", (
                str
            ) => {
                const result = isNonEmptyString(str);
                const expected =
                    typeof str === "string" && str.trim().length > 0;
                expect(result).toBe(expected);
            });
        });

        describe(isValidFQDN, () => {
            it.prop([
                fc.oneof(
                    fc.constant("example.com"),
                    fc.constant("sub.example.com"),
                    fc.constant("very.long.subdomain.example.com"),
                    fc.constant("test-site.example.org"),
                    fc.constant("site123.example.net")
                ),
            ])("should return true for valid FQDNs", (validFQDN) => {
                expect(isValidFQDN(validFQDN)).toBeTruthy();
            });

            it.prop([
                fc.oneof(
                    fc.constant(""),
                    fc.constant("invalid"),
                    fc.constant("..com"),
                    fc.constant(".example.com"),
                    fc.constant("example..com"),
                    fc.constant("exam ple.com"),
                    fc.integer(),
                    fc.constantFrom(null, undefined)
                ),
            ])("should return false for invalid FQDNs", (invalidFQDN) => {
                expect(isValidFQDN(invalidFQDN)).toBeFalsy();
            });

            it.prop([fc.string()])(
                "should validate all string inputs consistently",
                (str) => {
                    // Should not throw and return boolean
                    const result = isValidFQDN(str);
                    expect(typeof result).toBe("boolean");
                }
            );
        });

        describe(isValidIdentifier, () => {
            it.prop([
                fc.string({ minLength: 1, maxLength: 50 }).filter((s) => {
                    // Must contain at least one alphanumeric character when hyphens/underscores are removed
                    const cleanedValue = s.replaceAll(/[_-]/gu, "");
                    return (
                        cleanedValue.length > 0 &&
                        /^[\dA-Za-z]+$/.test(cleanedValue) &&
                        /^[\w-]+$/.test(s)
                    );
                }),
            ])("should return true for valid identifiers", (validId) => {
                expect(isValidIdentifier(validId)).toBeTruthy();
            });

            it.prop([
                fc.oneof(
                    fc.constant(""),
                    fc.constant("   "),
                    fc.string().filter((s) => s.includes(" ")),
                    fc.string().filter((s) => s.includes("@")),
                    fc.integer(),
                    fc.constantFrom(null, undefined)
                ),
            ])("should return false for invalid identifiers", (invalidId) => {
                expect(isValidIdentifier(invalidId)).toBeFalsy();
            });

            it.prop([fc.anything()])("should handle any input type", (
                value
            ) => {
                const result = isValidIdentifier(value);
                expect(typeof result).toBe("boolean");
            });
        });

        describe(isValidIdentifierArray, () => {
            it.prop([
                fc.array(
                    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => {
                        const cleanedValue = s.replaceAll(/[_-]/gu, "");
                        return (
                            cleanedValue.length > 0 &&
                            /^[\dA-Za-z]+$/.test(cleanedValue) &&
                            /^[\w-]+$/.test(s)
                        );
                    }),
                    { minLength: 0, maxLength: 10 }
                ),
            ])("should return true for arrays of valid identifiers", (
                validIds
            ) => {
                expect(isValidIdentifierArray(validIds)).toBeTruthy();
            });

            it.prop([
                fc.oneof(
                    fc.array(
                        fc.oneof(
                            fc.constant(""),
                            fc.constant("__"),
                            fc.constant("--"),
                            fc.string().filter((s) => s.includes(" ")),
                            fc.string().filter((s) => s.includes("@"))
                        ),
                        { minLength: 1 }
                    ),
                    fc.integer(),
                    fc.string(),
                    fc.constantFrom(null, undefined)
                ),
            ])("should return false for invalid identifier arrays", (
                invalidArray
            ) => {
                expect(isValidIdentifierArray(invalidArray)).toBeFalsy();
            });

            it.prop([fc.anything()])("should handle any input type", (
                value
            ) => {
                const result = isValidIdentifierArray(value);
                expect(typeof result).toBe("boolean");
            });
        });

        describe(isValidInteger, () => {
            it.prop([fc.integer().map((n) => n.toString())])(
                "should return true for integer strings without bounds",
                (validIntStr) => {
                    expect(isValidInteger(validIntStr)).toBeTruthy();
                }
            );

            it.prop([
                fc.integer({ min: 10, max: 100 }).map((n) => n.toString()),
            ])("should respect min/max bounds when provided", (valueStr) => {
                const value = Number.parseInt(valueStr, 10);
                expect(
                    isValidInteger(valueStr, { min: 10, max: 100 })
                ).toBeTruthy();
                expect(
                    isValidInteger((value + 101).toString(), {
                        min: 10,
                        max: 100,
                    })
                ).toBeFalsy();
                expect(
                    isValidInteger((value - value + 5).toString(), {
                        min: 10,
                        max: 100,
                    })
                ).toBeFalsy(); // Always results in 5, which is below min 10
            });

            it.prop([
                fc.oneof(
                    fc
                        .float({ min: Math.fround(0.1), max: Math.fround(100) })
                        .filter((n) => !Number.isInteger(n))
                        .map((n) => n.toString()), // Only non-integer floats
                    fc
                        .string()
                        .filter((s) => !validator.isInt(s) && s.length > 0), // Non-integer strings
                    fc.boolean(),
                    fc.constantFrom(
                        "3.14",
                        "hello",
                        "not-a-number",
                        "12.34",
                        "0.5",
                        "NaN",
                        "Infinity"
                    ),
                    fc.constantFrom(
                        null,
                        undefined,
                        Number.NaN,
                        Number.POSITIVE_INFINITY,
                        Number.NEGATIVE_INFINITY
                    )
                ),
            ])("should return false for non-integers", (nonInteger) => {
                expect(isValidInteger(nonInteger)).toBeFalsy();
            });
        });

        describe(isValidNumeric, () => {
            it.prop([
                fc.oneof(
                    fc.integer().map((n) => n.toString()),
                    fc.float().map((n) => n.toString())
                ),
            ])("should return true for numeric strings without bounds", (
                validNumStr
            ) => {
                if (Number.isFinite(Number.parseFloat(validNumStr))) {
                    expect(isValidNumeric(validNumStr)).toBeTruthy();
                }
            });

            it.prop([
                fc
                    .float({ min: 1.5, max: 10.5 })
                    .filter((n) => Number.isFinite(n) && !Number.isNaN(n))
                    .map((n) => n.toString()),
            ])("should respect min/max bounds for floats", (valueStr) => {
                expect(
                    isValidNumeric(valueStr, { min: 1.5, max: 10.5 })
                ).toBeTruthy();
                expect(
                    isValidNumeric(
                        (Number.parseFloat(valueStr) + 20).toString(),
                        { min: 1.5, max: 10.5 }
                    )
                ).toBeFalsy();
                expect(
                    isValidNumeric(
                        (Number.parseFloat(valueStr) - 20).toString(),
                        { min: 1.5, max: 10.5 }
                    )
                ).toBeFalsy();
            });

            it.prop([
                fc.oneof(
                    fc.string().filter((s) => !validator.isFloat(s)),
                    fc.boolean(),
                    fc.constantFrom(
                        null,
                        undefined,
                        Number.NaN,
                        Number.POSITIVE_INFINITY,
                        Number.NEGATIVE_INFINITY
                    )
                ),
            ])("should return false for non-numeric values", (nonNumeric) => {
                expect(isValidNumeric(nonNumeric)).toBeFalsy();
            });
        });

        describe(isValidHost, () => {
            it.prop([
                fc.oneof(
                    fc.constant("192.168.1.1"),
                    fc.constant("127.0.0.1"),
                    fc.constant("example.com"),
                    fc.constant("sub.example.com"),
                    fc.constant("2001:db8::1"),
                    fc.constant("::1")
                ),
            ])("should return true for valid hosts", (validHost) => {
                expect(isValidHost(validHost)).toBeTruthy();
            });

            it.prop([
                fc.oneof(
                    fc.constant(""),
                    fc.constant("invalid..host"),
                    fc.constant("192.168.1.999"),
                    fc.constant("not a host"),
                    fc.integer(),
                    fc.constantFrom(null, undefined)
                ),
            ])("should return false for invalid hosts", (invalidHost) => {
                expect(isValidHost(invalidHost)).toBeFalsy();
            });

            it.prop([fc.anything()])("should handle any input type", (
                value
            ) => {
                const result = isValidHost(value);
                expect(typeof result).toBe("boolean");
            });
        });

        describe(isValidPort, () => {
            it.prop([fc.integer({ min: 1, max: 65_535 })])(
                "should return true for valid port numbers",
                (validPort) => {
                    expect(isValidPort(validPort)).toBeTruthy();
                }
            );

            it.prop([
                fc.oneof(
                    fc.integer({ min: -1000, max: 0 }),
                    fc.integer({ min: 65_536, max: 100_000 }),
                    fc.float(),
                    fc.string().filter((s) => {
                        // Only use strings that are NOT valid port numbers
                        const num = Number.parseInt(s, 10);
                        return (
                            Number.isNaN(num) ||
                            num < 1 ||
                            num > 65_535 ||
                            s === "0" ||
                            s.trim() !== s ||
                            s.includes(".")
                        );
                    }),
                    fc.constantFrom(null, undefined, Number.NaN)
                ),
            ])("should return false for invalid ports", (invalidPort) => {
                expect(isValidPort(invalidPort)).toBeFalsy();
            });

            it.prop([fc.anything()])("should handle any input type", (
                value
            ) => {
                const result = isValidPort(value);
                expect(typeof result).toBe("boolean");
            });
        });

        describe(isValidUrl, () => {
            it.prop([
                fc.oneof(
                    fc.constant("http://example.com"),
                    fc.constant("https://example.com"),
                    fc.constant("https://sub.example.com:8080/path"),
                    fc.constant("http://192.168.1.1:3000"),
                    fc.constant("https://example.com/path?query=value#fragment")
                ),
            ])("should return true for valid URLs", (validUrl) => {
                expect(isValidUrl(validUrl)).toBeTruthy();
            });

            it.prop([
                fc.oneof(
                    fc.constant(""),
                    fc.constant("not-a-url"),
                    fc.constant("ftp://example.com"),
                    fc.constant("http://"),
                    fc.constant("//example.com"),
                    fc.integer(),
                    fc.constantFrom(null, undefined)
                ),
            ])("should return false for invalid URLs", (invalidUrl) => {
                expect(isValidUrl(invalidUrl)).toBeFalsy();
            });

            it.prop([fc.anything()])("should handle any input type", (
                value
            ) => {
                const result = isValidUrl(value);
                expect(typeof result).toBe("boolean");
            });
        });

        describe(safeInteger, () => {
            it.prop([fc.integer({ min: 10, max: 100 })])(
                "should return the integer when valid and within bounds",
                (validInt) => {
                    expect(safeInteger(validInt, 0, 5, 200)).toBe(validInt);
                }
            );

            it.prop([
                fc.oneof(
                    fc
                        .float()
                        .filter((n) => !Number.isInteger(n))
                        .map((n) => n.toString()), // Only non-integer floats
                    fc
                        .string()
                        .filter((s) => !validator.isInt(s) && s.length > 0), // Non-integer strings
                    fc.boolean(),
                    fc.constantFrom(
                        "3.14",
                        "hello",
                        "not-a-number",
                        "12.34",
                        "0.5",
                        "NaN",
                        "Infinity",
                        ""
                    ),
                    fc.constantFrom(null, undefined, Number.NaN)
                ),
            ])("should return default when input is invalid", (
                invalidInput
            ) => {
                const defaultValue = 42;
                expect(safeInteger(invalidInput, defaultValue)).toBe(
                    defaultValue
                );
            });

            it.prop([fc.integer({ min: 200, max: 300 })])(
                "should clamp to max when above bounds",
                (value) => {
                    const max = 100;
                    expect(safeInteger(value, 50, 10, max)).toBe(max);
                }
            );

            it.prop([fc.integer({ min: -300, max: -200 })])(
                "should clamp to min when below bounds",
                (value) => {
                    const min = 10;
                    expect(safeInteger(value, 50, min, 100)).toBe(min);
                }
            );

            it.prop([fc.integer({ min: 10, max: 100 })])(
                "should return value when within bounds",
                (value) => {
                    expect(safeInteger(value, 0, 10, 100)).toBe(value);
                }
            );
        });
    });

    describe("schemas.ts Functions", () => {
        describe(validateMonitorData, () => {
            it.prop([fc.constantFrom("http", "port", "ping", "dns")])(
                "should accept valid monitor types",
                (validType) => {
                    const validMonitorData = {
                        id: "test-monitor",
                        type: validType,
                        status: "pending",
                        monitoring: false,
                        responseTime: -1,
                        checkInterval: 30_000,
                        timeout: 10_000,
                        retryAttempts: 3,
                        history: [],
                        ...(validType === "http" && {
                            url: "https://example.com",
                        }),
                        ...(validType === "port" && {
                            host: "example.com",
                            port: 80,
                        }),
                        ...(validType === "ping" && { host: "example.com" }),
                        ...(validType === "dns" && {
                            host: "example.com",
                            recordType: "A",
                        }),
                    };

                    const result = validateMonitorData(
                        validType,
                        validMonitorData
                    );
                    expect(result.success).toBeTruthy();
                    expect(result.errors).toHaveLength(0);
                }
            );

            it.prop([
                fc.string().filter(
                    (s) =>
                        ![
                            "http",
                            "port",
                            "ping",
                            "dns",
                            "valueOf",
                            "__proto__",
                            "constructor",
                            "toString",
                            "toLocaleString",
                            "hasOwnProperty",
                            "isPrototypeOf",
                            "propertyIsEnumerable",
                        ].includes(s)
                ),
            ])("should reject invalid monitor types", (invalidType) => {
                const result = validateMonitorData(invalidType, {});
                expect(result.success).toBeFalsy();
                expect(result.errors).toContain(
                    `Unknown monitor type: ${invalidType}`
                );
            });

            it.prop([
                fc.oneof(
                    fc.constantFrom(null, undefined),
                    fc.string(),
                    fc.integer(),
                    fc.boolean()
                ),
            ])("should handle invalid data gracefully", (invalidData) => {
                const result = validateMonitorData("http", invalidData);
                expect(result.success).toBeFalsy();
                expect(result.errors.length).toBeGreaterThan(0);
            });

            it.prop([
                fc.record({
                    id: fc.string(),
                    type: fc.constantFrom("http", "port", "ping", "dns"),
                    status: fc.constantFrom("up", "down", "pending", "paused"),
                    monitoring: fc.boolean(),
                    responseTime: fc.integer({ min: -1, max: 10_000 }),
                    checkInterval: fc.integer({ min: 1000, max: 300_000 }),
                    timeout: fc.integer({ min: 1000, max: 300_000 }),
                    retryAttempts: fc.integer({ min: 0, max: 10 }),
                    history: fc.array(
                        fc.record({
                            status: fc.constantFrom("up", "down"),
                            timestamp: fc.integer({ min: 0 }),
                            responseTime: fc.integer({ min: 0 }),
                            details: fc.oneof(
                                fc.string(),
                                fc.constant(undefined)
                            ),
                        })
                    ),
                }),
            ])("should validate comprehensive monitor data structures", (
                monitorData
            ) => {
                const result = validateMonitorData(
                    monitorData.type,
                    monitorData
                );
                // Result should have consistent structure
                expect(typeof result.success).toBe("boolean");
                expect(Array.isArray(result.errors)).toBeTruthy();
                expect(Array.isArray(result.warnings)).toBeTruthy();
            });
        });

        describe(validateMonitorField, () => {
            it.prop([
                fc.tuple(
                    fc.constantFrom("http", "port", "ping", "dns"),
                    fc.constantFrom(
                        "id",
                        "type",
                        "monitoring",
                        "checkInterval",
                        "timeout",
                        "retryAttempts",
                        "status",
                        "responseTime",
                        "lastChecked",
                        "history",
                        "activeOperations"
                    )
                ),
            ])("should validate individual fields", ([type, fieldName]) => {
                // Generate appropriate values for each field based on field name
                /* eslint-disable-next-line no-useless-assignment */
                let value: unknown = null; // Initialize to avoid ESLint rule conflicts

                switch (fieldName) {
                    case "id": {
                        value = "test-id";
                        break;
                    }
                    case "type": {
                        value = type;
                        break;
                    }
                    case "monitoring": {
                        value = true;
                        break;
                    }
                    case "checkInterval": {
                        value = 10_000;
                        break;
                    }
                    case "timeout": {
                        value = 5000;
                        break;
                    }
                    case "retryAttempts": {
                        value = 3;
                        break;
                    }
                    case "status": {
                        value = "up";
                        break;
                    }
                    case "responseTime": {
                        value = 100;
                        break;
                    }
                    case "lastChecked": {
                        value = new Date();
                        break;
                    }
                    case "history": {
                        value = [];
                        break;
                    }
                    case "activeOperations": {
                        value = [];
                        break;
                    }
                    default: {
                        value = "test-value";
                        break;
                    }
                }

                const result = validateMonitorField(type, fieldName, value);
                expect(typeof result.success).toBe("boolean");
                expect(Array.isArray(result.errors)).toBeTruthy();
            });

            it.prop([
                fc.string().filter(
                    (s) =>
                        ![
                            "http",
                            "port",
                            "ping",
                            "dns",
                            "valueOf",
                            "__proto__",
                            "constructor",
                            "toString",
                            "toLocaleString",
                            "hasOwnProperty",
                            "isPrototypeOf",
                            "propertyIsEnumerable",
                        ].includes(s)
                ),
            ])("should reject invalid monitor types", (invalidType) => {
                const result = validateMonitorField(invalidType, "id", "test");
                expect(result.success).toBeFalsy();
                expect(result.errors).toContain(
                    `Unknown monitor type: ${invalidType}`
                );
            });

            it.prop([fc.anything()])("should handle any field value", (
                value
            ) => {
                const result = validateMonitorField("http", "id", value);
                expect(typeof result.success).toBe("boolean");
            });
        });

        describe(validateSiteData, () => {
            it.prop([
                fc.record({
                    identifier: fc.string({ minLength: 1, maxLength: 100 }),
                    name: fc.string({ minLength: 1, maxLength: 200 }),
                    monitoring: fc.boolean(),
                    monitors: fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1 }),
                            type: fc.constantFrom(
                                "http",
                                "port",
                                "ping",
                                "dns"
                            ),
                            status: fc.constantFrom(
                                "up",
                                "down",
                                "pending",
                                "paused"
                            ),
                            monitoring: fc.boolean(),
                            responseTime: fc.integer({ min: -1 }),
                            checkInterval: fc.integer({
                                min: 1000,
                                max: 300_000,
                            }),
                            timeout: fc.integer({ min: 1000, max: 300_000 }),
                            retryAttempts: fc.integer({ min: 0, max: 10 }),
                            history: fc.array(
                                fc.record({
                                    status: fc.constantFrom("up", "down"),
                                    timestamp: fc.integer({ min: 0 }),
                                    responseTime: fc.integer({ min: 0 }),
                                })
                            ),
                            url: fc.oneof(fc.webUrl(), fc.constant(undefined)),
                            host: fc.oneof(fc.domain(), fc.constant(undefined)),
                            port: fc.oneof(
                                fc.integer({ min: 1, max: 65_535 }),
                                fc.constant(undefined)
                            ),
                        }),
                        { minLength: 1 }
                    ),
                }),
            ])("should validate complete site data", (siteData) => {
                const result = validateSiteData(siteData);
                expect(typeof result.success).toBe("boolean");
                expect(Array.isArray(result.errors)).toBeTruthy();
            });

            it.prop([
                fc.oneof(
                    fc.constantFrom(null, undefined),
                    fc.string(),
                    fc.integer(),
                    fc.record({
                        identifier: fc.constant(""),
                        name: fc.constant(""),
                        monitoring: fc.boolean(),
                        monitors: fc.constant([]),
                    })
                ),
            ])("should reject invalid site data", (invalidSiteData) => {
                const result = validateSiteData(invalidSiteData);
                expect(result.success).toBeFalsy();
                expect(result.errors.length).toBeGreaterThan(0);
            });

            it.prop([fc.anything()])("should handle any input type", (
                value
            ) => {
                const result = validateSiteData(value);
                expect(typeof result.success).toBe("boolean");
            });
        });

        describe("Edge Cases and Integration Tests", () => {
            it.prop([
                fc.record({
                    type: fc.constantFrom("http", "port", "ping", "dns"),
                    field: fc.constantFrom(
                        "id",
                        "type",
                        "monitoring",
                        "checkInterval",
                        "timeout",
                        "retryAttempts",
                        "status",
                        "responseTime"
                    ),
                    value: fc.anything(),
                }),
            ])("should handle validation consistency across functions", (
                testCase
            ) => {
                try {
                    const monitorResult = validateMonitorField(
                        testCase.type,
                        testCase.field,
                        testCase.value
                    );
                    const directResult = validateMonitorData(testCase.type, {
                        [testCase.field]: testCase.value,
                    });

                    // Both should return consistent structure
                    expect(typeof monitorResult.success).toBe("boolean");
                    expect(typeof directResult.success).toBe("boolean");
                } catch (error) {
                    // If validateMonitorField throws for unknown field, that's expected
                    if (
                        error instanceof Error &&
                        error.message.includes("Unknown field")
                    ) {
                        // This is expected behavior for unknown fields
                        expect(error.message).toContain("Unknown field");
                    } else {
                        throw error;
                    }
                }
            });

            it.prop([
                fc.oneof(
                    fc.constantFrom("", "  ", "\t\n"),
                    fc.constantFrom(null, undefined),
                    fc.array(fc.anything()),
                    fc.record({})
                ),
            ])("should handle boundary inputs consistently", (
                boundaryInput
            ) => {
                // All validation functions should handle boundary cases gracefully
                expect(() =>
                    isNonEmptyString(boundaryInput)).not.toThrowError();
                expect(() => isValidHost(boundaryInput)).not.toThrowError();
                expect(() => isValidPort(boundaryInput)).not.toThrowError();
                expect(() =>
                    validateSiteData(boundaryInput)).not.toThrowError();
            });

            it.prop([
                fc.string(),
                fc.integer(),
                fc.float(),
            ])("should validate complex type guard combinations", (
                str,
                int,
                float
            ) => {
                // Test combinations of type guards
                const results = [
                    isNonEmptyString(str),
                    isValidInteger(int),
                    isValidNumeric(float),
                    isValidIdentifier(str),
                ];

                // All results should be booleans
                for (const result of results) {
                    expect(typeof result).toBe("boolean");
                }
            });
        });
    });
});
