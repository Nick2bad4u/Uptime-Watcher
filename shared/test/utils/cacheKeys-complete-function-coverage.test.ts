/**
 * @file Complete Function Coverage Tests for cacheKeys.ts
 *
 *   This test ensures 100% function coverage for the cacheKeys module using the
 *   proven Function Coverage Validation pattern with namespace imports and
 *   systematic function calls.
 */

import { describe, expect, it } from "vitest";
import * as cacheKeysModule from "../../utils/cacheKeys.js";

describe("CacheKeys - Complete Function Coverage", () => {
    describe("Function Coverage Validation", () => {
        it("should call every exported function for complete coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys-complete-function-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            // Verify the module exports we expect
            expect(typeof cacheKeysModule).toBe("object");
            expect(cacheKeysModule).toBeDefined();

            // Test CacheKeys.config namespace
            expect(typeof cacheKeysModule.CacheKeys.config.byName).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.config.validation).toBe(
                "function"
            );

            // Test config functions
            expect(cacheKeysModule.CacheKeys.config.byName("test-config")).toBe(
                "config:test-config"
            );
            expect(
                cacheKeysModule.CacheKeys.config.validation("test-validation")
            ).toBe("config:validation:test-validation");

            // Test CacheKeys.monitor namespace
            expect(typeof cacheKeysModule.CacheKeys.monitor.byId).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.monitor.bySite).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.monitor.operation).toBe(
                "function"
            );

            // Test monitor functions
            expect(cacheKeysModule.CacheKeys.monitor.byId("test-monitor")).toBe(
                "monitor:test-monitor"
            );
            expect(cacheKeysModule.CacheKeys.monitor.bySite("test-site")).toBe(
                "monitor:site:test-site"
            );
            expect(cacheKeysModule.CacheKeys.monitor.operation("test-op")).toBe(
                "monitor:operation:test-op"
            );

            // Test CacheKeys.site namespace
            expect(typeof cacheKeysModule.CacheKeys.site.bulkOperation).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.site.byIdentifier).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.site.loading).toBe(
                "function"
            );

            // Test site functions
            expect(cacheKeysModule.CacheKeys.site.bulkOperation()).toBe(
                "site:bulk"
            );
            expect(
                cacheKeysModule.CacheKeys.site.byIdentifier("test-site")
            ).toBe("site:test-site");
            expect(cacheKeysModule.CacheKeys.site.loading("test-site")).toBe(
                "site:loading:test-site"
            );

            // Test CacheKeys.validation namespace
            expect(typeof cacheKeysModule.CacheKeys.validation.byType).toBe(
                "function"
            );
            expect(
                typeof cacheKeysModule.CacheKeys.validation.monitorType
            ).toBe("function");

            // Test validation functions
            expect(
                cacheKeysModule.CacheKeys.validation.byType(
                    "test-type",
                    "test-id"
                )
            ).toBe("validation:test-type:test-id");
            expect(
                cacheKeysModule.CacheKeys.validation.monitorType("http")
            ).toBe("validation:monitor-type:http");

            // Test standalone utility functions
            expect(typeof cacheKeysModule.isStandardizedCacheKey).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.parseCacheKey).toBe("function");

            // Test isStandardizedCacheKey function
            expect(cacheKeysModule.isStandardizedCacheKey("config:test")).toBe(
                true
            );
            expect(
                cacheKeysModule.isStandardizedCacheKey("monitor:operation:test")
            ).toBe(true);
            expect(cacheKeysModule.isStandardizedCacheKey("invalid")).toBe(
                false
            );
            expect(
                cacheKeysModule.isStandardizedCacheKey("invalid:too:many:parts")
            ).toBe(false);

            // Test parseCacheKey function with valid keys
            const parsed2Part =
                cacheKeysModule.parseCacheKey("config:test-config");
            expect(parsed2Part).toEqual({
                prefix: "config",
                identifier: "test-config",
                operation: undefined,
            });

            const parsed3Part = cacheKeysModule.parseCacheKey(
                "monitor:operation:test-op"
            );
            expect(parsed3Part).toEqual({
                prefix: "monitor",
                operation: "operation",
                identifier: "test-op",
            });

            // Test parseCacheKey error cases
            expect(() =>
                cacheKeysModule.parseCacheKey("invalid-single-part")
            ).toThrow();
            expect(() => cacheKeysModule.parseCacheKey("")).toThrow();
            // Note: 'prefix:' is now valid with empty identifier
            expect(() =>
                cacheKeysModule.parseCacheKey(":identifier")
            ).toThrow();
            expect(() =>
                cacheKeysModule.parseCacheKey("prefix::identifier")
            ).toThrow();

            // Note: parseCacheKey doesn't throw for too many parts, it just uses the first 3
            const manyParts = cacheKeysModule.parseCacheKey(
                "prefix:operation:identifier:extra" as any
            );
            expect(manyParts.prefix).toBe("prefix");
            expect(manyParts.operation).toBe("operation");
            expect(manyParts.identifier).toBe("identifier");

            // Verify all major function paths are executed
            expect(cacheKeysModule.CacheKeys).toBeDefined();
            expect(Object.keys(cacheKeysModule.CacheKeys)).toEqual([
                "config",
                "monitor",
                "site",
                "validation",
            ]);
        });

        it("should handle edge cases and special characters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys-complete-function-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test with special characters that are allowed
            expect(
                cacheKeysModule.CacheKeys.config.byName("test-config_123")
            ).toBe("config:test-config_123");
            expect(
                cacheKeysModule.CacheKeys.monitor.byId("monitor-123_test")
            ).toBe("monitor:monitor-123_test");

            // Test parsing of complex identifiers
            const complexKey = cacheKeysModule.CacheKeys.validation.byType(
                "complex-type",
                "id_with-special_chars"
            );
            expect(complexKey).toBe(
                "validation:complex-type:id_with-special_chars"
            );

            const parsed = cacheKeysModule.parseCacheKey(complexKey);
            expect(parsed.prefix).toBe("validation");
            expect(parsed.operation).toBe("complex-type");
            expect(parsed.identifier).toBe("id_with-special_chars");
        });

        it("should validate all generated keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys-complete-function-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            // Generate keys using all functions and validate them
            const configKey = cacheKeysModule.CacheKeys.config.byName("test");
            const monitorKey = cacheKeysModule.CacheKeys.monitor.byId("test");
            const siteKey = cacheKeysModule.CacheKeys.site.byIdentifier("test");
            const validationKey =
                cacheKeysModule.CacheKeys.validation.monitorType("http");

            expect(cacheKeysModule.isStandardizedCacheKey(configKey)).toBe(
                true
            );
            expect(cacheKeysModule.isStandardizedCacheKey(monitorKey)).toBe(
                true
            );
            expect(cacheKeysModule.isStandardizedCacheKey(siteKey)).toBe(true);
            expect(cacheKeysModule.isStandardizedCacheKey(validationKey)).toBe(
                true
            );

            // Verify round-trip: generate -> parse -> validate
            const parsedConfig = cacheKeysModule.parseCacheKey(configKey);
            const parsedMonitor = cacheKeysModule.parseCacheKey(monitorKey);
            const parsedSite = cacheKeysModule.parseCacheKey(siteKey);
            const parsedValidation =
                cacheKeysModule.parseCacheKey(validationKey);

            expect(parsedConfig.prefix).toBe("config");
            expect(parsedMonitor.prefix).toBe("monitor");
            expect(parsedSite.prefix).toBe("site");
            expect(parsedValidation.prefix).toBe("validation");
        });
    });
});
