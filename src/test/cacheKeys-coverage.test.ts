/**
 * @module shared/utils/cacheKeys.test
 *
 * @file Direct function call tests for cacheKeys to ensure coverage
 */

import { describe, expect, it } from "vitest";
import {
    CacheKeys,
    isStandardizedCacheKey,
    parseCacheKey,
    type StandardizedCacheKey,
} from "@shared/utils/cacheKeys";

describe("cacheKeys Direct Function Coverage", () => {
    it("should call all config functions", () => {
        // Call all config functions
        expect(CacheKeys.config.byName("test-config")).toBe(
            "config:test-config"
        );
        expect(CacheKeys.config.validation("test-validation")).toBe(
            "config:validation:test-validation"
        );
    });

    it("should call all monitor functions", () => {
        // Call all monitor functions
        expect(CacheKeys.monitor.byId("monitor-123")).toBe(
            "monitor:monitor-123"
        );
        expect(CacheKeys.monitor.bySite("site-456")).toBe(
            "monitor:site:site-456"
        );
        expect(CacheKeys.monitor.operation("monitor-789")).toBe(
            "monitor:operation:monitor-789"
        );
    });

    it("should call all site functions", () => {
        // Call all site functions
        expect(CacheKeys.site.bulkOperation()).toBe("site:bulk");
        expect(CacheKeys.site.byIdentifier("site-123")).toBe("site:site-123");
        expect(CacheKeys.site.loading("site-456")).toBe(
            "site:loading:site-456"
        );
    });

    it("should call all validation functions", () => {
        // Call all validation functions
        expect(CacheKeys.validation.byType("monitor", "config-123")).toBe(
            "validation:monitor:config-123"
        );
        expect(CacheKeys.validation.monitorType("http")).toBe(
            "validation:monitor-type:http"
        );
    });

    it("should test isStandardizedCacheKey function", () => {
        // Test valid keys
        expect(isStandardizedCacheKey("config:test")).toBeTruthy();
        expect(isStandardizedCacheKey("monitor:site:test")).toBeTruthy();
        expect(isStandardizedCacheKey("site:bulk")).toBeTruthy();
        expect(isStandardizedCacheKey("validation:monitor:test")).toBeTruthy();

        // Test invalid keys
        expect(isStandardizedCacheKey("")).toBeFalsy();
        expect(isStandardizedCacheKey("invalid")).toBeFalsy();
        expect(isStandardizedCacheKey("too:many:parts:here")).toBeFalsy();
        expect(isStandardizedCacheKey("invalid:")).toBeFalsy();
        expect(isStandardizedCacheKey(":invalid")).toBeFalsy();
        expect(isStandardizedCacheKey("invalid::double")).toBeFalsy();
    });

    it("should test parseCacheKey function", () => {
        // Test 2-part keys
        expect(parseCacheKey("config:test" as StandardizedCacheKey)).toEqual({
            prefix: "config",
            identifier: "test",
        });

        // Test 3-part keys
        expect(
            parseCacheKey("monitor:operation:test" as StandardizedCacheKey)
        ).toEqual({
            prefix: "monitor",
            operation: "operation",
            identifier: "test",
        });

        // Test error cases
        expect(() =>
            parseCacheKey("invalid" as StandardizedCacheKey)).toThrowError(
            "Invalid cache key format"
        );
        expect(() =>
            parseCacheKey(":missing" as StandardizedCacheKey)).toThrowError(
            "Invalid cache key format"
        );
        expect(() =>
            parseCacheKey("missing::" as StandardizedCacheKey)).toThrowError(
            "Invalid cache key format"
        );
    });
});
