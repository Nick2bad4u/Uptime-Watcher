/**
 * @fileoverview Direct function call tests for cacheKeys to ensure coverage
 * @module shared/utils/cacheKeys.test
 */

import { describe, expect, it } from "vitest";
import {
    CacheKeys,
    isStandardizedCacheKey,
    parseCacheKey,
    type StandardizedCacheKey
} from "@shared/utils/cacheKeys";

describe("cacheKeys Direct Function Coverage", () => {
    it("should call all config functions", () => {
        // Call all config functions
        expect(CacheKeys.config.byName("test-config")).toBe("config:test-config");
        expect(CacheKeys.config.validation("test-validation")).toBe("config:validation:test-validation");
    });

    it("should call all monitor functions", () => {
        // Call all monitor functions
        expect(CacheKeys.monitor.byId("monitor-123")).toBe("monitor:monitor-123");
        expect(CacheKeys.monitor.bySite("site-456")).toBe("monitor:site:site-456");
        expect(CacheKeys.monitor.operation("monitor-789")).toBe("monitor:operation:monitor-789");
    });

    it("should call all site functions", () => {
        // Call all site functions
        expect(CacheKeys.site.bulkOperation()).toBe("site:bulk");
        expect(CacheKeys.site.byIdentifier("site-123")).toBe("site:site-123");
        expect(CacheKeys.site.loading("site-456")).toBe("site:loading:site-456");
    });

    it("should call all validation functions", () => {
        // Call all validation functions
        expect(CacheKeys.validation.byType("monitor", "config-123")).toBe("validation:monitor:config-123");
        expect(CacheKeys.validation.monitorType("http")).toBe("validation:monitor-type:http");
    });

    it("should test isStandardizedCacheKey function", () => {
        // Test valid keys
        expect(isStandardizedCacheKey("config:test")).toBe(true);
        expect(isStandardizedCacheKey("monitor:site:test")).toBe(true);
        expect(isStandardizedCacheKey("site:bulk")).toBe(true);
        expect(isStandardizedCacheKey("validation:monitor:test")).toBe(true);

        // Test invalid keys
        expect(isStandardizedCacheKey("")).toBe(false);
        expect(isStandardizedCacheKey("invalid")).toBe(false);
        expect(isStandardizedCacheKey("too:many:parts:here")).toBe(false);
        expect(isStandardizedCacheKey("invalid:")).toBe(false);
        expect(isStandardizedCacheKey(":invalid")).toBe(false);
        expect(isStandardizedCacheKey("invalid::double")).toBe(false);
    });

    it("should test parseCacheKey function", () => {
        // Test 2-part keys
        expect(parseCacheKey("config:test" as StandardizedCacheKey)).toEqual({
            prefix: "config",
            identifier: "test"
        });

        // Test 3-part keys
        expect(parseCacheKey("monitor:operation:test" as StandardizedCacheKey)).toEqual({
            prefix: "monitor",
            operation: "operation",
            identifier: "test"
        });

        // Test error cases
        expect(() => parseCacheKey("invalid" as StandardizedCacheKey)).toThrow("Invalid cache key format");
        expect(() => parseCacheKey(":missing" as StandardizedCacheKey)).toThrow("Invalid cache key format");
        expect(() => parseCacheKey("missing::" as StandardizedCacheKey)).toThrow("Invalid cache key format");
    });
});
