/**
 * @file Function coverage tests for shared/utils/cacheKeys.ts
 * 
 * Tests all exported functions to achieve 100% function coverage.
 * Currently shows 50% function coverage - targeting isStandardizedCacheKey and parseCacheKey functions.
 */

import { describe, expect, it } from "vitest";
import { isStandardizedCacheKey, parseCacheKey } from "../../utils/cacheKeys";

describe("Cache Keys Function Coverage", () => {
    describe("isStandardizedCacheKey", () => {
        it("should return true for valid 2-part cache keys", () => {
            expect(isStandardizedCacheKey("site:site-123")).toBe(true);
            expect(isStandardizedCacheKey("monitor:monitor-456")).toBe(true);
        });

        it("should return true for valid 3-part cache keys", () => {
            expect(isStandardizedCacheKey("site:loading:site-123")).toBe(true);
            expect(isStandardizedCacheKey("monitor:checking:monitor-456")).toBe(true);
        });

        it("should return false for keys with too few parts", () => {
            expect(isStandardizedCacheKey("site")).toBe(false);
        });

        it("should return false for keys with too many parts", () => {
            expect(isStandardizedCacheKey("site:loading:site-123:extra")).toBe(false);
        });

        it("should return false for keys with empty prefix", () => {
            expect(isStandardizedCacheKey(":site-123")).toBe(false);
        });

        it("should return false for 3-part keys with empty operation", () => {
            expect(isStandardizedCacheKey("site::site-123")).toBe(false);
        });

        it("should return false for invalid prefixes", () => {
            expect(isStandardizedCacheKey("invalid:site-123")).toBe(false);
        });
    });

    describe("parseCacheKey", () => {
        it("should parse valid 2-part cache keys", () => {
            const result = parseCacheKey("site:site-123" as any);
            expect(result).toEqual({
                prefix: "site",
                identifier: "site-123"
            });
        });

        it("should parse valid 3-part cache keys", () => {
            const result = parseCacheKey("site:loading:site-123" as any);
            expect(result).toEqual({
                prefix: "site",
                operation: "loading",
                identifier: "site-123"
            });
        });

        it("should handle empty identifier in 2-part keys", () => {
            const result = parseCacheKey("site:" as any);
            expect(result).toEqual({
                prefix: "site",
                identifier: ""
            });
        });

        it("should throw error for empty prefix in 2-part keys", () => {
            expect(() => parseCacheKey(":site-123" as any)).toThrow("Invalid cache key format:");
        });

        it("should throw error for missing parts in 3-part keys", () => {
            expect(() => parseCacheKey(":loading:site-123" as any)).toThrow("Invalid cache key format:");
            expect(() => parseCacheKey("site::site-123" as any)).toThrow("Invalid cache key format:");
            expect(() => parseCacheKey("site:loading:" as any)).toThrow("Invalid cache key format:");
        });
    });

    describe("Integration tests", () => {
        it("should validate and parse keys consistently", () => {
            const key = "site:loading:site-123";
            
            // Check validation first
            expect(isStandardizedCacheKey(key)).toBe(true);
            
            // Then parse successfully
            const parsed = parseCacheKey(key as any);
            expect(parsed.prefix).toBe("site");
            expect(parsed.operation).toBe("loading");
            expect(parsed.identifier).toBe("site-123");
        });
    });
});
