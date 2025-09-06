/**
 * Comprehensive tests for cache keys utility functions to achieve 95%+
 * coverage. Focuses on testing all functions and branches including error
 * paths.
 */

import { describe, expect, it } from "vitest";

import {
    CacheKeys,
    isStandardizedCacheKey,
    parseCacheKey,
    type StandardizedCacheKey,
} from "@shared/utils/cacheKeys";

describe("CacheKeys - Complete Function Coverage", () => {
    describe("Config cache keys", () => {
        it("should generate config by name key", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const key = CacheKeys.config.byName("test-setting");
            expect(key).toBe("config:test-setting");
        });

        it("should generate config validation key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const key = CacheKeys.config.validation("monitor-config");
            expect(key).toBe("config:validation:monitor-config");
        });

        it("should handle empty config name", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const key = CacheKeys.config.byName("");
            expect(key).toBe("config:");
        });

        it("should handle special characters in config name", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const key = CacheKeys.config.byName(
                "config-with-dashes_and_underscores"
            );
            expect(key).toBe("config:config-with-dashes_and_underscores");
        });

        it("should handle unicode characters in config name", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const key = CacheKeys.config.byName("配置名称");
            expect(key).toBe("config:配置名称");
        });
    });

    describe("Monitor cache keys", () => {
        it("should generate monitor by ID key", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const key = CacheKeys.monitor.byId("monitor-123");
            expect(key).toBe("monitor:monitor-123");
        });

        it("should generate monitor by site key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const key = CacheKeys.monitor.bySite("site-456");
            expect(key).toBe("monitor:site:site-456");
        });

        it("should generate monitor operation key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const key = CacheKeys.monitor.operation("monitor-789");
            expect(key).toBe("monitor:operation:monitor-789");
        });

        it("should handle empty monitor IDs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const key = CacheKeys.monitor.byId("");
            expect(key).toBe("monitor:");
        });

        it("should handle numeric-like monitor IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const key = CacheKeys.monitor.byId("12345");
            expect(key).toBe("monitor:12345");
        });

        it("should handle UUID-like monitor IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const key = CacheKeys.monitor.byId(
                "550e8400-e29b-41d4-a716-446655440000"
            );
            expect(key).toBe("monitor:550e8400-e29b-41d4-a716-446655440000");
        });
    });

    describe("Site cache keys", () => {
        it("should generate bulk operation key", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const key = CacheKeys.site.bulkOperation();
            expect(key).toBe("site:bulk");
        });

        it("should generate site by identifier key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const key = CacheKeys.site.byIdentifier("site-abc");
            expect(key).toBe("site:site-abc");
        });

        it("should generate site loading key", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Data Loading", "type");

            const key = CacheKeys.site.loading("site-def");
            expect(key).toBe("site:loading:site-def");
        });

        it("should handle empty site identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const key = CacheKeys.site.byIdentifier("");
            expect(key).toBe("site:");
        });

        it("should handle special characters in site identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const key = CacheKeys.site.byIdentifier("site-123_test.domain.com");
            expect(key).toBe("site:site-123_test.domain.com");
        });
    });

    describe("Validation cache keys", () => {
        it("should generate validation by type key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const key = CacheKeys.validation.byType("monitor", "config-123");
            expect(key).toBe("validation:monitor:config-123");
        });

        it("should generate monitor type validation key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const key = CacheKeys.validation.monitorType("http");
            expect(key).toBe("validation:monitor-type:http");
        });

        it("should handle empty validation types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const key = CacheKeys.validation.byType("", "identifier");
            expect(key).toBe("validation:identifier");
        });

        it("should handle empty identifiers in validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const key = CacheKeys.validation.byType("monitor", "");
            expect(key).toBe("validation:monitor:");
        });

        it("should handle all monitor types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const httpKey = CacheKeys.validation.monitorType("http");
            const pingKey = CacheKeys.validation.monitorType("ping");
            const portKey = CacheKeys.validation.monitorType("port");
            const dnsKey = CacheKeys.validation.monitorType("dns");

            expect(httpKey).toBe("validation:monitor-type:http");
            expect(pingKey).toBe("validation:monitor-type:ping");
            expect(portKey).toBe("validation:monitor-type:port");
            expect(dnsKey).toBe("validation:monitor-type:dns");
        });
    });

    describe("isStandardizedCacheKey function coverage", () => {
        it("should validate correct 2-part keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            expect(isStandardizedCacheKey("config:setting")).toBeTruthy();
            expect(isStandardizedCacheKey("monitor:id-123")).toBeTruthy();
            expect(isStandardizedCacheKey("site:site-456")).toBeTruthy();
            expect(isStandardizedCacheKey("validation:test-123")).toBeTruthy();
        });

        it("should validate correct 3-part keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            expect(isStandardizedCacheKey("config:validation:setting")).toBeTruthy(
                
            );
            expect(isStandardizedCacheKey("monitor:site:site-123")).toBeTruthy();
            expect(isStandardizedCacheKey("site:loading:site-456")).toBeTruthy();
            expect(
                isStandardizedCacheKey("validation:monitor:config-789")
            ).toBeTruthy();
        });

        it("should reject keys with invalid part counts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey("")).toBeFalsy();
            expect(isStandardizedCacheKey("single")).toBeFalsy();
            expect(isStandardizedCacheKey("one:two:three:four")).toBeFalsy();
            expect(isStandardizedCacheKey("too:many:parts:here:now")).toBeFalsy(
                
            );
        });

        it("should reject keys with empty prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey(":identifier")).toBeFalsy();
            expect(isStandardizedCacheKey(":operation:identifier")).toBeFalsy();
        });

        it("should reject keys with invalid prefixes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey("invalid:identifier")).toBeFalsy();
            expect(isStandardizedCacheKey("wrong:operation:identifier")).toBeFalsy(
                
            );
            expect(isStandardizedCacheKey("unknown:test")).toBeFalsy();
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey("config:")).toBeTruthy(); // valid prefix, empty identifier
            expect(isStandardizedCacheKey("monitor::")).toBeFalsy(); // empty operation in 3-part
            expect(isStandardizedCacheKey("site::identifier")).toBeFalsy(); // empty operation
        });
    });

    describe("parseCacheKey function coverage", () => {
        it("should parse 2-part keys correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const result = parseCacheKey(
                "config:setting-name" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "config",
                identifier: "setting-name",
            });
        });

        it("should parse 3-part keys correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const result = parseCacheKey(
                "monitor:operation:monitor-123" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "monitor",
                operation: "operation",
                identifier: "monitor-123",
            });
        });

        it("should throw error for invalid 2-part format with empty prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => {
                parseCacheKey(":identifier" as StandardizedCacheKey);
            }).toThrow("Invalid cache key format: :identifier");
        });

        it("should throw error for 2-part format with empty identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(() => parseCacheKey("config:" as StandardizedCacheKey)).toThrow("Invalid cache key format: config:");
        });

        it("should throw error for invalid 3-part format with empty prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => {
                parseCacheKey(":operation:identifier" as StandardizedCacheKey);
            }).toThrow("Invalid cache key format: :operation:identifier");
        });

        it("should throw error for invalid 3-part format with empty operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => {
                parseCacheKey("prefix::identifier" as StandardizedCacheKey);
            }).toThrow("Invalid cache key format: prefix::identifier");
        });

        it("should throw error for invalid 3-part format with empty identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => {
                parseCacheKey("prefix:operation:" as StandardizedCacheKey);
            }).toThrow("Invalid cache key format: prefix:operation:");
        });

        it("should handle complex identifiers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const result = parseCacheKey(
                "site:loading:site-123_test.domain.com" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "site",
                operation: "loading",
                identifier: "site-123_test.domain.com",
            });
        });

        it("should handle UUID identifiers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const uuid = "550e8400-e29b-41d4-a716-446655440000";
            const result = parseCacheKey(
                `monitor:${uuid}` as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "monitor",
                identifier: uuid,
            });
        });
    });

    describe("All cache key functions integration", () => {
        it("should generate and parse keys consistently", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Test all key generation and parsing combinations
            const keys = [
                CacheKeys.config.byName("test"),
                CacheKeys.config.validation("test"),
                CacheKeys.monitor.byId("123"),
                CacheKeys.monitor.bySite("site-123"),
                CacheKeys.monitor.operation("mon-123"),
                CacheKeys.site.bulkOperation(),
                CacheKeys.site.byIdentifier("site-456"),
                CacheKeys.site.loading("site-789"),
                CacheKeys.validation.byType("monitor", "test"),
                CacheKeys.validation.monitorType("http"),
            ];

            for (const key of keys) {
                expect(isStandardizedCacheKey(key)).toBeTruthy();
                const parsed = parseCacheKey(key);
                expect(parsed.prefix).toBeDefined();
                expect(parsed.identifier).toBeDefined();
            }
        });

        it("should handle stress test with many cache keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: cacheKeys-complete-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Caching", "type");

            const keys: string[] = [];

            // Generate many keys
            for (let i = 0; i < 100; i++) {
                keys.push(
                    CacheKeys.config.byName(`config-${i}`),
                    CacheKeys.monitor.byId(`monitor-${i}`),
                    CacheKeys.site.byIdentifier(`site-${i}`)
                );
            }

            // Validate all keys
            for (const key of keys) {
                expect(isStandardizedCacheKey(key)).toBeTruthy();
                const parsed = parseCacheKey(key as StandardizedCacheKey);
                expect(parsed).toBeDefined();
            }
        });
    });
});
