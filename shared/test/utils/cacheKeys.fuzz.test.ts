/**
 * Comprehensive property-based tests for cacheKeys.ts using fast-check
 *
 * @file This file contains extensive fuzzing tests to achieve 100% test
 *   coverage of the cache key utilities. Uses fast-check to generate edge cases
 *   and validate all cache key generation, parsing, and validation functions.
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";

import {
    CacheKeys,
    isStandardizedCacheKey,
    parseCacheKey,
    type StandardizedCacheKey,
} from "../../utils/cacheKeys";

// Define valid cache prefixes for property testing
const VALID_CACHE_PREFIXES = [
    "config",
    "monitor",
    "site",
    "validation",
] as const;

// Create arbitraries for valid cache key parts (no colons, no empty/whitespace-only strings)
const validCacheKeyPart = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter(
        (s) =>
            s.length > 0 &&
            !s.includes(":") &&
            s.trim().length > 0 &&
            s.trim() === s
    );

const shortValidCacheKeyPart = fc
    .string({ minLength: 1, maxLength: 20 })
    .filter(
        (s) =>
            s.length > 0 &&
            !s.includes(":") &&
            s.trim().length > 0 &&
            s.trim() === s
    );

describe("Cache Keys - Property-Based Tests", () => {
    describe("CacheKeys.config functions", () => {
        it("should generate consistent config cache keys by name", () => {
            fc.assert(
                fc.property(validCacheKeyPart, (name) => {
                    const key = CacheKeys.config.byName(name);

                    expect(key).toBe(`config:${name}`);
                    expect(key.startsWith("config:")).toBeTruthy();
                    expect(key).toContain(name);
                    expect(isStandardizedCacheKey(key)).toBeTruthy();

                    return true;
                }),
                { numRuns: 100 }
            );
        });

        it("should generate consistent config validation cache keys", () => {
            fc.assert(
                fc.property(validCacheKeyPart, (name) => {
                    const key = CacheKeys.config.validation(name);

                    expect(key).toBe(`config:validation:${name}`);
                    expect(key.startsWith("config:validation:")).toBeTruthy();
                    expect(key).toContain(name);
                    expect(isStandardizedCacheKey(key)).toBeTruthy();

                    return true;
                }),
                { numRuns: 100 }
            );
        });

        it("should handle edge cases in config key names", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc
                            .string({ minLength: 1, maxLength: 1 })
                            .filter((s) => !s.includes(":")), // Single character
                        fc
                            .string()
                            .filter((s) => /\s/.test(s) && !s.includes(":")), // String with whitespace but no colons
                        fc
                            .string({ minLength: 1, maxLength: 100 })
                            .filter((s) => !s.includes(":")), // Long string
                        validCacheKeyPart // Valid cache key part
                    ),
                    (name) => {
                        if (name.length === 0 || name.trim().length === 0) {
                            // Skip empty or whitespace-only strings
                            return true;
                        }

                        const byNameKey = CacheKeys.config.byName(name);
                        const validationKey = CacheKeys.config.validation(name);

                        // Both should be valid standardized keys
                        expect(isStandardizedCacheKey(byNameKey)).toBeTruthy();
                        expect(
                            isStandardizedCacheKey(validationKey)
                        ).toBeTruthy();

                        // Both should contain the original name
                        expect(byNameKey).toContain(name);
                        expect(validationKey).toContain(name);

                        return true;
                    }
                )
            );
        });
    });

    describe("CacheKeys.monitor functions", () => {
        it("should generate consistent monitor cache keys by id", () => {
            fc.assert(
                fc.property(validCacheKeyPart, (id) => {
                    const key = CacheKeys.monitor.byId(id);

                    expect(key).toBe(`monitor:${id}`);
                    expect(key.startsWith("monitor:")).toBeTruthy();
                    expect(key).toContain(id);
                    expect(isStandardizedCacheKey(key)).toBeTruthy();

                    return true;
                }),
                { numRuns: 100 }
            );
        });

        it("should generate consistent monitor cache keys by site", () => {
            fc.assert(
                fc.property(validCacheKeyPart, (siteIdentifier) => {
                    const key = CacheKeys.monitor.bySite(siteIdentifier);

                    expect(key).toBe(`monitor:site:${siteIdentifier}`);
                    expect(key.startsWith("monitor:site:")).toBeTruthy();
                    expect(key).toContain(siteIdentifier);
                    expect(isStandardizedCacheKey(key)).toBeTruthy();

                    return true;
                }),
                { numRuns: 100 }
            );
        });

        it("should generate consistent monitor operation cache keys", () => {
            fc.assert(
                fc.property(validCacheKeyPart, (id) => {
                    const key = CacheKeys.monitor.operation(id);

                    expect(key).toBe(`monitor:operation:${id}`);
                    expect(key.startsWith("monitor:operation:")).toBeTruthy();
                    expect(key).toContain(id);
                    expect(isStandardizedCacheKey(key)).toBeTruthy();

                    return true;
                }),
                { numRuns: 100 }
            );
        });
    });

    describe("CacheKeys.site functions", () => {
        it("should generate consistent site cache keys by identifier", () => {
            fc.assert(
                fc.property(validCacheKeyPart, (identifier) => {
                    const key = CacheKeys.site.byIdentifier(identifier);

                    expect(key).toBe(`site:${identifier}`);
                    expect(key.startsWith("site:")).toBeTruthy();
                    expect(key).toContain(identifier);
                    expect(isStandardizedCacheKey(key)).toBeTruthy();

                    return true;
                }),
                { numRuns: 100 }
            );
        });

        it("should generate consistent site bulk operation cache keys", () => {
            fc.assert(
                fc.property(fc.constant(undefined), () => {
                    const key = CacheKeys.site.bulkOperation();

                    expect(key).toBe("site:bulk");
                    expect(key.startsWith("site:")).toBeTruthy();
                    expect(isStandardizedCacheKey(key)).toBeTruthy();

                    return true;
                })
            );
        });

        it("should generate consistent site loading cache keys", () => {
            fc.assert(
                fc.property(validCacheKeyPart, (identifier) => {
                    const key = CacheKeys.site.loading(identifier);

                    expect(key).toBe(`site:loading:${identifier}`);
                    expect(key.startsWith("site:loading:")).toBeTruthy();
                    expect(key).toContain(identifier);
                    expect(isStandardizedCacheKey(key)).toBeTruthy();

                    return true;
                }),
                { numRuns: 100 }
            );
        });
    });

    describe("CacheKeys.validation functions", () => {
        it("should generate consistent validation cache keys by type", () => {
            fc.assert(
                fc.property(
                    shortValidCacheKeyPart,
                    validCacheKeyPart,
                    (type, identifier) => {
                        const key = CacheKeys.validation.byType(
                            type,
                            identifier
                        );

                        expect(key).toBe(`validation:${type}:${identifier}`);
                        expect(key.startsWith("validation:")).toBeTruthy();
                        expect(key).toContain(type);
                        expect(key).toContain(identifier);
                        expect(isStandardizedCacheKey(key)).toBeTruthy();

                        return true;
                    }
                ),
                { numRuns: 100 }
            );
        });

        it("should generate consistent monitor type validation cache keys", () => {
            fc.assert(
                fc.property(shortValidCacheKeyPart, (monitorType) => {
                    const key = CacheKeys.validation.monitorType(monitorType);

                    expect(key).toBe(`validation:monitor-type:${monitorType}`);
                    expect(
                        key.startsWith("validation:monitor-type:")
                    ).toBeTruthy();
                    expect(key).toContain(monitorType);
                    expect(isStandardizedCacheKey(key)).toBeTruthy();

                    return true;
                }),
                { numRuns: 100 }
            );
        });
    });

    describe("isStandardizedCacheKey validation", () => {
        it("should validate properly formatted 2-part cache keys", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(...VALID_CACHE_PREFIXES),
                    validCacheKeyPart,
                    (prefix, identifier) => {
                        const key = `${prefix}:${identifier}`;
                        const result = isStandardizedCacheKey(key);

                        expect(result).toBeTruthy();
                        return true;
                    }
                ),
                { numRuns: 200 }
            );
        });

        it("should validate properly formatted 3-part cache keys", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(...VALID_CACHE_PREFIXES),
                    shortValidCacheKeyPart,
                    validCacheKeyPart,
                    (prefix, operation, identifier) => {
                        const key = `${prefix}:${operation}:${identifier}`;
                        const result = isStandardizedCacheKey(key);

                        expect(result).toBeTruthy();
                        return true;
                    }
                ),
                { numRuns: 200 }
            );
        });

        it("should reject invalid cache key formats", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.string().filter((s) => !s.includes(":")), // No separators
                        fc.string().filter((s) => s.split(":").length > 3), // Too many parts
                        fc.constant(""), // Empty string
                        fc.constant(":"), // Only separator
                        fc.constant("::"), // Double separator
                        fc.constant("prefix:"), // Missing identifier
                        fc.constant(":identifier"), // Missing prefix
                        fc.constant("invalid:operation:") // Missing final part
                    ),
                    (invalidKey) => {
                        const result = isStandardizedCacheKey(invalidKey);

                        expect(result).toBeFalsy();
                        return true;
                    }
                ),
                { numRuns: 100 }
            );
        });

        it("should reject keys with invalid prefixes", () => {
            fc.assert(
                fc.property(
                    fc
                        .string({ minLength: 1, maxLength: 20 })
                        .filter(
                            (s) => !VALID_CACHE_PREFIXES.includes(s as any)
                        ),
                    fc.string({ minLength: 1, maxLength: 50 }),
                    (invalidPrefix, identifier) => {
                        const key = `${invalidPrefix}:${identifier}`;
                        const result = isStandardizedCacheKey(key);

                        expect(result).toBeFalsy();
                        return true;
                    }
                ),
                { numRuns: 100 }
            );
        });

        it("should handle edge cases in key validation", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.string().filter((s) => s.includes(":")),
                        fc.string({ minLength: 100, maxLength: 200 }) // Very long strings
                    ),
                    (testString) => {
                        const result = isStandardizedCacheKey(testString);

                        // Result should always be a boolean
                        expect(typeof result).toBe("boolean");

                        return true;
                    }
                )
            );
        });
    });

    describe("parseCacheKey parsing", () => {
        it("should correctly parse 2-part cache keys", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(...VALID_CACHE_PREFIXES),
                    validCacheKeyPart,
                    (prefix, identifier) => {
                        const key =
                            `${prefix}:${identifier}` as StandardizedCacheKey;
                        const result = parseCacheKey(key);

                        expect(result.prefix).toBe(prefix);
                        expect(result.identifier).toBe(identifier);
                        expect(result.operation).toBeUndefined();

                        return true;
                    }
                ),
                { numRuns: 200 }
            );
        });

        it("should correctly parse 3-part cache keys", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(...VALID_CACHE_PREFIXES),
                    shortValidCacheKeyPart,
                    validCacheKeyPart,
                    (prefix, operation, identifier) => {
                        const key =
                            `${prefix}:${operation}:${identifier}` as StandardizedCacheKey;
                        const result = parseCacheKey(key);

                        expect(result.prefix).toBe(prefix);
                        expect(result.operation).toBe(operation);
                        expect(result.identifier).toBe(identifier);

                        return true;
                    }
                ),
                { numRuns: 200 }
            );
        });

        it("should handle edge cases in key parsing", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(...VALID_CACHE_PREFIXES),
                    fc.oneof(
                        fc.constant(""), // Empty identifier
                        fc
                            .string({ minLength: 200, maxLength: 300 })
                            .filter((s) => !s.includes(":")), // Very long identifier without colons
                        fc
                            .string({ minLength: 1, maxLength: 10 })
                            .map((s) => `  ${s}  `) // Identifier with leading/trailing spaces
                    ),
                    (prefix, identifier) => {
                        // For invalid identifiers, parseCacheKey should throw
                        const key = `${prefix}:${identifier}`;

                        if (
                            identifier === "" ||
                            identifier !== identifier.trim()
                        ) {
                            // These should throw errors (empty or has leading/trailing spaces)
                            expect(() =>
                                parseCacheKey(key as StandardizedCacheKey)
                            ).toThrowError();
                        } else {
                            // Valid long identifiers should parse correctly
                            const result = parseCacheKey(
                                key as StandardizedCacheKey
                            );
                            expect(result.prefix).toBe(prefix);
                            expect(result.identifier).toBe(identifier);
                            expect(result.operation).toBeUndefined();
                        }

                        return true;
                    }
                )
            );
        });

        it("should throw for malformed cache keys", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant("::invalid"), // Missing prefix
                        fc.constant("prefix::"), // Missing operation in 3-part key
                        fc.constant("prefix:operation:") // Missing identifier in 3-part key
                    ),
                    (invalidKey) => {
                        expect(() => {
                            parseCacheKey(invalidKey as StandardizedCacheKey);
                        }).toThrowError("Invalid cache key format:");

                        return true;
                    }
                )
            );
        });
    });

    describe("Integration tests between functions", () => {
        it("should create keys that can be validated and parsed", () => {
            fc.assert(
                fc.property(
                    validCacheKeyPart,
                    validCacheKeyPart,
                    validCacheKeyPart,
                    validCacheKeyPart,
                    (configName, monitorId, siteIdentifier, validationType) => {
                        // Test various generated keys
                        const keys = [
                            CacheKeys.config.byName(configName),
                            CacheKeys.monitor.byId(monitorId),
                            CacheKeys.site.byIdentifier(siteIdentifier),
                            CacheKeys.validation.byType(
                                validationType,
                                "test-id"
                            ),
                            CacheKeys.site.bulkOperation(),
                        ];

                        for (const key of keys) {
                            // Each key should be valid
                            expect(isStandardizedCacheKey(key)).toBeTruthy();

                            // Each key should be parseable
                            const parsed = parseCacheKey(
                                key as StandardizedCacheKey
                            );
                            expect(parsed.prefix).toBeTruthy();
                            expect(parsed.identifier).toBeDefined();

                            // Reconstruction should match original
                            const reconstructed = parsed.operation
                                ? `${parsed.prefix}:${parsed.operation}:${parsed.identifier}`
                                : `${parsed.prefix}:${parsed.identifier}`;
                            expect(reconstructed).toBe(key);
                        }

                        return true;
                    }
                ),
                { numRuns: 50 }
            );
        });

        it("should maintain consistency across all cache key generators", () => {
            fc.assert(
                fc.property(validCacheKeyPart, (identifier) => {
                    // Generate keys from different domains with same identifier
                    const configKey = CacheKeys.config.byName(identifier);
                    const monitorKey = CacheKeys.monitor.byId(identifier);
                    const siteKey = CacheKeys.site.byIdentifier(identifier);

                    // All should be valid
                    expect(isStandardizedCacheKey(configKey)).toBeTruthy();
                    expect(isStandardizedCacheKey(monitorKey)).toBeTruthy();
                    expect(isStandardizedCacheKey(siteKey)).toBeTruthy();

                    // All should contain the identifier
                    expect(configKey).toContain(identifier);
                    expect(monitorKey).toContain(identifier);
                    expect(siteKey).toContain(identifier);

                    // All should have different prefixes
                    expect(configKey.startsWith("config:")).toBeTruthy();
                    expect(monitorKey.startsWith("monitor:")).toBeTruthy();
                    expect(siteKey.startsWith("site:")).toBeTruthy();

                    // Parsed identifiers should match
                    const configParsed = parseCacheKey(
                        configKey as StandardizedCacheKey
                    );
                    const monitorParsed = parseCacheKey(
                        monitorKey as StandardizedCacheKey
                    );
                    const siteParsed = parseCacheKey(
                        siteKey as StandardizedCacheKey
                    );

                    expect(configParsed.identifier).toBe(identifier);
                    expect(monitorParsed.identifier).toBe(identifier);
                    expect(siteParsed.identifier).toBe(identifier);

                    return true;
                }),
                { numRuns: 100 }
            );
        });
    });
});
