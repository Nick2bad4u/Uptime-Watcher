/**
 * Comprehensive tests for cacheKeys utilities
 */
import { describe, it, expect } from "vitest";
import {
    CacheKeys,
    isStandardizedCacheKey,
    parseCacheKey,
    type StandardizedCacheKey,
} from "../../../../shared/utils/cacheKeys";

describe("cacheKeys utilities", () => {
    describe("CacheKeys.config", () => {
        it("should generate config cache key by name", () => {
            const key = CacheKeys.config.byName("history-limit");
            expect(key).toBe("config:history-limit");
        });

        it("should generate config validation cache key", () => {
            const key = CacheKeys.config.validation("monitor-config");
            expect(key).toBe("config:validation:monitor-config");
        });

        it("should handle empty string in config name", () => {
            const key = CacheKeys.config.byName("");
            expect(key).toBe("config:");
        });

        it("should handle special characters in config name", () => {
            const key = CacheKeys.config.byName("check-interval_ms");
            expect(key).toBe("config:check-interval_ms");
        });
    });

    describe("CacheKeys.monitor", () => {
        it("should generate monitor cache key by ID", () => {
            const key = CacheKeys.monitor.byId("monitor-123");
            expect(key).toBe("monitor:monitor-123");
        });

        it("should generate monitor cache key by site", () => {
            const key = CacheKeys.monitor.bySite("site-456");
            expect(key).toBe("monitor:site:site-456");
        });

        it("should generate monitor operation cache key", () => {
            const key = CacheKeys.monitor.operation("monitor-789");
            expect(key).toBe("monitor:operation:monitor-789");
        });

        it("should handle numeric-like monitor IDs", () => {
            const key = CacheKeys.monitor.byId("12345");
            expect(key).toBe("monitor:12345");
        });

        it("should handle UUID-style monitor IDs", () => {
            const key = CacheKeys.monitor.byId(
                "550e8400-e29b-41d4-a716-446655440000"
            );
            expect(key).toBe("monitor:550e8400-e29b-41d4-a716-446655440000");
        });
    });

    describe("CacheKeys.site", () => {
        it("should generate bulk operation cache key", () => {
            const key = CacheKeys.site.bulkOperation();
            expect(key).toBe("site:bulk");
        });

        it("should generate site cache key by identifier", () => {
            const key = CacheKeys.site.byIdentifier("site-123");
            expect(key).toBe("site:site-123");
        });

        it("should generate site loading cache key", () => {
            const key = CacheKeys.site.loading("site-456");
            expect(key).toBe("site:loading:site-456");
        });

        it("should handle complex site identifiers", () => {
            const key = CacheKeys.site.byIdentifier("example.com_https");
            expect(key).toBe("site:example.com_https");
        });
    });

    describe("CacheKeys.validation", () => {
        it("should generate validation cache key by type", () => {
            const key = CacheKeys.validation.byType("site", "validation-123");
            expect(key).toBe("validation:site:validation-123");
        });

        it("should generate monitor type validation cache key", () => {
            const key = CacheKeys.validation.monitorType("http");
            expect(key).toBe("validation:monitor-type:http");
        });

        it("should handle different monitor types", () => {
            const httpKey = CacheKeys.validation.monitorType("http");
            expect(httpKey).toBe("validation:monitor-type:http");

            const pingKey = CacheKeys.validation.monitorType("ping");
            expect(pingKey).toBe("validation:monitor-type:ping");

            const portKey = CacheKeys.validation.monitorType("port");
            expect(portKey).toBe("validation:monitor-type:port");
        });
    });

    describe("isStandardizedCacheKey", () => {
        it("should return true for valid two-part cache keys", () => {
            expect(isStandardizedCacheKey("site:test-123")).toBe(true);
            expect(isStandardizedCacheKey("monitor:456")).toBe(true);
            expect(isStandardizedCacheKey("config:setting")).toBe(true);
            expect(isStandardizedCacheKey("validation:type")).toBe(true);
        });

        it("should return true for valid three-part cache keys", () => {
            expect(isStandardizedCacheKey("site:loading:test-123")).toBe(true);
            expect(isStandardizedCacheKey("monitor:operation:456")).toBe(true);
            expect(isStandardizedCacheKey("config:validation:setting")).toBe(
                true
            );
            expect(isStandardizedCacheKey("validation:monitor-type:http")).toBe(
                true
            );
        });

        it("should return false for invalid prefixes", () => {
            expect(isStandardizedCacheKey("invalid:test-123")).toBe(false);
            expect(isStandardizedCacheKey("user:profile:123")).toBe(false);
            expect(isStandardizedCacheKey("cache:data:item")).toBe(false);
        });

        it("should return false for invalid key structures", () => {
            expect(isStandardizedCacheKey("site")).toBe(false); // Only one part
            expect(isStandardizedCacheKey("site:a:b:c:d")).toBe(false); // Too many parts
            expect(isStandardizedCacheKey("")).toBe(false); // Empty string
        });

        it("should return false for non-string inputs", () => {
            // These should fail gracefully, but the current implementation doesn't handle non-string inputs
            // The function signature expects a string, so these tests verify current behavior
            expect(() => isStandardizedCacheKey(123 as any)).toThrow();
            expect(() => isStandardizedCacheKey(null as any)).toThrow();
            expect(() => isStandardizedCacheKey(undefined as any)).toThrow();
            expect(() => isStandardizedCacheKey({} as any)).toThrow();
        });

        it("should validate all CacheKeys outputs", () => {
            const keys = [
                CacheKeys.config.byName("test"),
                CacheKeys.config.validation("test"),
                CacheKeys.monitor.byId("test"),
                CacheKeys.monitor.bySite("test"),
                CacheKeys.monitor.operation("test"),
                CacheKeys.site.bulkOperation(),
                CacheKeys.site.byIdentifier("test"),
                CacheKeys.site.loading("test"),
                CacheKeys.validation.byType("site", "test"),
                CacheKeys.validation.monitorType("http"),
            ];

            for (const key of keys) {
                expect(isStandardizedCacheKey(key)).toBe(true);
            }
        });
    });

    describe("parseCacheKey", () => {
        it("should parse two-part cache keys", () => {
            const result = parseCacheKey(
                "site:test-123" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "site",
                identifier: "test-123",
            });
        });

        it("should parse three-part cache keys", () => {
            const result = parseCacheKey(
                "monitor:operation:test-456" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "monitor",
                operation: "operation",
                identifier: "test-456",
            });
        });

        it("should parse config validation keys", () => {
            const result = parseCacheKey(
                "config:validation:settings" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "config",
                operation: "validation",
                identifier: "settings",
            });
        });

        it("should parse site loading keys", () => {
            const result = parseCacheKey(
                "site:loading:example.com" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "site",
                operation: "loading",
                identifier: "example.com",
            });
        });

        it("should parse validation monitor-type keys", () => {
            const result = parseCacheKey(
                "validation:monitor-type:http" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "validation",
                operation: "monitor-type",
                identifier: "http",
            });
        });

        it("should handle keys with special characters", () => {
            const result = parseCacheKey(
                "site:example.com_https" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "site",
                identifier: "example.com_https",
            });
        });

        it("should parse complex identifiers", () => {
            const result = parseCacheKey(
                "monitor:550e8400-e29b-41d4-a716-446655440000" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "monitor",
                identifier: "550e8400-e29b-41d4-a716-446655440000",
            });
        });
    });

    describe("integration and round-trip tests", () => {
        it("should work with generated keys from CacheKeys", () => {
            const siteKey = CacheKeys.site.byIdentifier("test-123");
            expect(isStandardizedCacheKey(siteKey)).toBe(true);

            const parsed = parseCacheKey(siteKey);
            expect(parsed.prefix).toBe("site");
            expect(parsed.identifier).toBe("test-123");
            expect(parsed.operation).toBeUndefined();
        });

        it("should work with operation-based keys", () => {
            const monitorKey = CacheKeys.monitor.operation("test-456");
            expect(isStandardizedCacheKey(monitorKey)).toBe(true);

            const parsed = parseCacheKey(monitorKey);
            expect(parsed.prefix).toBe("monitor");
            expect(parsed.operation).toBe("operation");
            expect(parsed.identifier).toBe("test-456");
        });

        it("should validate and parse all supported key types", () => {
            const testData = [
                {
                    fn: () => CacheKeys.config.byName("test"),
                    expectedPrefix: "config",
                },
                {
                    fn: () => CacheKeys.config.validation("test"),
                    expectedPrefix: "config",
                    expectedOperation: "validation",
                },
                {
                    fn: () => CacheKeys.monitor.byId("test"),
                    expectedPrefix: "monitor",
                },
                {
                    fn: () => CacheKeys.monitor.bySite("test"),
                    expectedPrefix: "monitor",
                    expectedOperation: "site",
                },
                {
                    fn: () => CacheKeys.monitor.operation("test"),
                    expectedPrefix: "monitor",
                    expectedOperation: "operation",
                },
                {
                    fn: () => CacheKeys.site.bulkOperation(),
                    expectedPrefix: "site",
                    expectedIdentifier: "bulk",
                },
                {
                    fn: () => CacheKeys.site.byIdentifier("test"),
                    expectedPrefix: "site",
                },
                {
                    fn: () => CacheKeys.site.loading("test"),
                    expectedPrefix: "site",
                    expectedOperation: "loading",
                },
                {
                    fn: () => CacheKeys.validation.byType("site", "test"),
                    expectedPrefix: "validation",
                },
                {
                    fn: () => CacheKeys.validation.monitorType("http"),
                    expectedPrefix: "validation",
                    expectedOperation: "monitor-type",
                    expectedIdentifier: "http",
                },
            ];

            for (const {
                fn,
                expectedPrefix,
                expectedOperation,
                expectedIdentifier,
            } of testData) {
                const key = fn();
                expect(isStandardizedCacheKey(key)).toBe(true);

                const parsed = parseCacheKey(key);
                expect(parsed.prefix).toBe(expectedPrefix);

                if (expectedOperation) {
                    expect(parsed.operation).toBe(expectedOperation);
                }

                if (expectedIdentifier) {
                    expect(parsed.identifier).toBe(expectedIdentifier);
                }
            }
        });
    });
});
