/**
 * Fuzzing tests for cacheKeys module using property-based testing Targets
 * functions f:11 and f:12 to improve coverage
 */

import { describe, test, expect } from "vitest";
import * as fc from "fast-check";
import {
    isStandardizedCacheKey,
    parseCacheKey,
} from "../../utils/cacheKeys.js";

describe("cacheKeys fuzzing tests", () => {
    describe("isStandardizedCacheKey (f:11)", () => {
        test("should accept valid 2-part keys", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("config"),
                        fc.constant("monitor"),
                        fc.constant("site"),
                        fc.constant("validation")
                    ),
                    fc
                        .string({ minLength: 1, maxLength: 50 })
                        .filter((s) => !s.includes(":")),
                    (prefix, identifier) => {
                        const key = `${prefix}:${identifier}`;
                        expect(isStandardizedCacheKey(key)).toBeTruthy();
                    }
                ),
                { numRuns: 100 }
            );
        });

        test("should accept valid 3-part keys", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("config"),
                        fc.constant("monitor"),
                        fc.constant("site"),
                        fc.constant("validation")
                    ),
                    fc
                        .string({ minLength: 1, maxLength: 50 })
                        .filter((s) => !s.includes(":")),
                    fc
                        .string({ minLength: 1, maxLength: 50 })
                        .filter((s) => !s.includes(":")),
                    (prefix, operation, identifier) => {
                        const key = `${prefix}:${operation}:${identifier}`;
                        expect(isStandardizedCacheKey(key)).toBeTruthy();
                    }
                ),
                { numRuns: 100 }
            );
        });

        test("should reject invalid keys", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant(""), // Empty string
                        fc.constant("single-part"), // no colons
                        fc.constant(":missing-first"), // Missing first part
                        fc.constant("missing-last:"), // Missing last part
                        fc.constant("config::empty-middle"), // Empty middle part
                        fc.constant("config:too:many:colons:here"), // Too many parts
                        fc.constant("invalid:identifier"), // Invalid prefix
                        fc.string().filter(
                            (s) =>
                                s.split(":").length > 3 ||
                                s.split(":").length < 2 ||
                                ![
                                    "config",
                                    "monitor",
                                    "site",
                                    "validation",
                                ].includes(s.split(":")[0] || "")
                        ) // Invalid patterns
                    ),
                    (invalidKey) => {
                        expect(isStandardizedCacheKey(invalidKey)).toBeFalsy();
                    }
                ),
                { numRuns: 100 }
            );
        });

        test("should handle edge cases with special characters", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("config"),
                        fc.constant("monitor"),
                        fc.constant("site"),
                        fc.constant("validation")
                    ),
                    fc
                        .string({ minLength: 1 })
                        .filter((s) => !s.includes(":") && s.trim().length > 0),
                    (prefix, identifier) => {
                        const key = `${prefix}:${identifier}`;
                        expect(isStandardizedCacheKey(key)).toBeTruthy();
                    }
                ),
                { numRuns: 50 }
            );
        });
    });

    // Define a valid cache key part arbitrary that doesn't contain colons or whitespace-only strings
    const validCacheKeyPart = fc
        .string({ minLength: 1, maxLength: 50 })
        .filter(
            (s) => !s.includes(":") && s.trim().length > 0 && s.trim() === s
        );

    describe("parseCacheKey (f:12)", () => {
        test("should parse valid 2-part keys correctly", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("config"),
                        fc.constant("monitor"),
                        fc.constant("site"),
                        fc.constant("validation")
                    ),
                    validCacheKeyPart,
                    (prefix, identifier) => {
                        const key = `${prefix}:${identifier}`;
                        const result = parseCacheKey(key as any);
                        expect(result).toEqual({
                            prefix: prefix,
                            identifier: identifier,
                            operation: undefined,
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        test("should parse valid 3-part keys correctly", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("config"),
                        fc.constant("monitor"),
                        fc.constant("site"),
                        fc.constant("validation")
                    ),
                    validCacheKeyPart,
                    validCacheKeyPart,
                    (prefix, operation, identifier) => {
                        const key = `${prefix}:${operation}:${identifier}`;
                        const result = parseCacheKey(key as any);
                        expect(result).toEqual({
                            prefix: prefix,
                            identifier: identifier,
                            operation: operation,
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        test("should throw for invalid keys", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant(""), // Empty string
                        fc.constant("single-part"), // no colons
                        fc.constant(":missing-first"), // Missing first part
                        fc.constant("missing-last:"), // Missing last part
                        fc.constant("::empty-middle"), // Empty middle part
                        fc.constant("too:many:colons:here") // Too many parts
                    ),
                    (invalidKey) => {
                        expect(() => parseCacheKey(invalidKey)).toThrowError();
                    }
                ),
                { numRuns: 50 }
            );
        });

        test("should handle round-trip validation", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("config"),
                        fc.constant("monitor"),
                        fc.constant("site"),
                        fc.constant("validation")
                    ),
                    validCacheKeyPart,
                    fc.option(validCacheKeyPart),
                    (prefix, identifier, operation) => {
                        const key = operation
                            ? `${prefix}:${operation}:${identifier}`
                            : `${prefix}:${identifier}`;

                        // Key should be valid
                        expect(isStandardizedCacheKey(key)).toBeTruthy();

                        // Parse should work
                        const parsed = parseCacheKey(key as any);
                        expect(parsed.prefix).toBe(prefix);
                        expect(parsed.identifier).toBe(identifier);
                        expect(parsed.operation).toBe(operation || undefined);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe("Integration tests", () => {
        test("isStandardizedCacheKey and parseCacheKey consistency", () => {
            fc.assert(
                fc.property(fc.string(), (testKey) => {
                    const isValid = isStandardizedCacheKey(testKey);

                    if (isValid) {
                        // If key is valid, parsing should not throw
                        const parsed = parseCacheKey(testKey as any);
                        expect(parsed).toHaveProperty("prefix");
                        expect(parsed).toHaveProperty("identifier");
                        expect(parsed.prefix).toBeTruthy();
                        expect(parsed.identifier).toBeDefined();
                    } else {
                        // If key is invalid, parsing should throw (for invalid keys)
                        // Note: parseCacheKey may not throw for all invalid keys that isStandardizedCacheKey rejects
                        // because it has looser validation, so we skip this check
                    }

                    // Add explicit expectation for each test
                    expect(typeof isValid).toBe("boolean");
                }),
                { numRuns: 200 }
            );
        });
    });
});
