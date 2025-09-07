/**
 * Comprehensive test suite for cacheKeys utility functions
 *
 * Tests all cache key generation functions, validation utilities, and parsing
 * functions to ensure 100% function coverage and consistent cache key
 * patterns.
 */

import { describe, expect, it } from "vitest";
import {
    CacheKeys,
    isStandardizedCacheKey,
    parseCacheKey,
    StandardizedCacheKey,
} from "../../utils/cacheKeys.js";

// Import all exports for function coverage validation
import * as cacheKeysModule from "@shared/utils/cacheKeys";

describe("cacheKeys", () => {
    describe("Function Coverage Validation", () => {
        it("should call all exported functions to ensure 100% function coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            // Verify all functions are accessible through namespace import
            expect(typeof cacheKeysModule.isStandardizedCacheKey).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.parseCacheKey).toBe("function");
            expect(cacheKeysModule.CacheKeys).toBeDefined();

            // Test all CacheKeys nested functions for coverage
            expect(typeof cacheKeysModule.CacheKeys.config.byName).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.config.validation).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.monitor.byId).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.monitor.bySite).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.monitor.operation).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.site.byIdentifier).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.site.bulkOperation).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.site.loading).toBe(
                "function"
            );
            expect(typeof cacheKeysModule.CacheKeys.validation.byType).toBe(
                "function"
            );
            expect(
                typeof cacheKeysModule.CacheKeys.validation.monitorType
            ).toBe("function");

            // Call core functions to register coverage
            const testKey = "config:test-key" as StandardizedCacheKey;
            expect(
                cacheKeysModule.isStandardizedCacheKey(testKey)
            ).toBeTruthy();

            const parsed = cacheKeysModule.parseCacheKey(testKey);
            expect(parsed.prefix).toBe("config");
            expect(parsed.identifier).toBe("test-key");

            // Call all CacheKeys functions to register coverage
            expect(cacheKeysModule.CacheKeys.config.byName("test")).toBe(
                "config:test"
            );
            expect(cacheKeysModule.CacheKeys.config.validation("test")).toBe(
                "config:validation:test"
            );
            expect(cacheKeysModule.CacheKeys.monitor.byId("test")).toBe(
                "monitor:test"
            );
            expect(cacheKeysModule.CacheKeys.monitor.bySite("test")).toBe(
                "monitor:site:test"
            );
            expect(cacheKeysModule.CacheKeys.monitor.operation("test")).toBe(
                "monitor:operation:test"
            );
            expect(cacheKeysModule.CacheKeys.site.byIdentifier("test")).toBe(
                "site:test"
            );
            expect(cacheKeysModule.CacheKeys.site.bulkOperation()).toBe(
                "site:bulk"
            );
            expect(cacheKeysModule.CacheKeys.site.loading("test")).toBe(
                "site:loading:test"
            );
            expect(
                cacheKeysModule.CacheKeys.validation.byType("monitor", "test")
            ).toBe("validation:monitor:test");
            expect(
                cacheKeysModule.CacheKeys.validation.monitorType("http")
            ).toBe("validation:monitor-type:http");
        });
    });
    describe("CacheKeys.config", () => {
        describe("byName", () => {
            it("should generate cache key for configuration by name", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Caching", "type");

                expect(CacheKeys.config.byName("history-limit")).toBe(
                    "config:history-limit"
                );
                expect(CacheKeys.config.byName("theme-setting")).toBe(
                    "config:theme-setting"
                );
                expect(CacheKeys.config.byName("user-preferences")).toBe(
                    "config:user-preferences"
                );
            });

            it("should handle special characters in name", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.config.byName("config-with-dashes")).toBe(
                    "config:config-with-dashes"
                );
                expect(CacheKeys.config.byName("config_with_underscores")).toBe(
                    "config:config_with_underscores"
                );
                expect(CacheKeys.config.byName("config123")).toBe(
                    "config:config123"
                );
            });

            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.config.byName("")).toBe("config:");
            });
        });

        describe("validation", () => {
            it("should generate cache key for configuration validation", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                expect(CacheKeys.config.validation("monitor-config")).toBe(
                    "config:validation:monitor-config"
                );
                expect(CacheKeys.config.validation("site-config")).toBe(
                    "config:validation:site-config"
                );
                expect(CacheKeys.config.validation("theme-config")).toBe(
                    "config:validation:theme-config"
                );
            });

            it("should handle special characters in validation name", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                expect(CacheKeys.config.validation("config-123")).toBe(
                    "config:validation:config-123"
                );
                expect(CacheKeys.config.validation("config_test")).toBe(
                    "config:validation:config_test"
                );
            });

            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.config.validation("")).toBe(
                    "config:validation:"
                );
            });
        });
    });

    describe("CacheKeys.monitor", () => {
        describe("byId", () => {
            it("should generate cache key for monitor by ID", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                expect(CacheKeys.monitor.byId("monitor-123")).toBe(
                    "monitor:monitor-123"
                );
                expect(CacheKeys.monitor.byId("mon-456")).toBe(
                    "monitor:mon-456"
                );
                expect(CacheKeys.monitor.byId("test-monitor")).toBe(
                    "monitor:test-monitor"
                );
            });

            it("should handle different ID formats", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(
                    CacheKeys.monitor.byId(
                        "uuid-12345678-1234-1234-1234-123456789012"
                    )
                ).toBe("monitor:uuid-12345678-1234-1234-1234-123456789012");
                expect(CacheKeys.monitor.byId("123")).toBe("monitor:123");
                expect(CacheKeys.monitor.byId("monitor_with_underscores")).toBe(
                    "monitor:monitor_with_underscores"
                );
            });

            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.monitor.byId("")).toBe("monitor:");
            });
        });

        describe("bySite", () => {
            it("should generate cache key for monitors by site", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                expect(CacheKeys.monitor.bySite("site-123")).toBe(
                    "monitor:site:site-123"
                );
                expect(CacheKeys.monitor.bySite("website-456")).toBe(
                    "monitor:site:website-456"
                );
                expect(CacheKeys.monitor.bySite("test-site")).toBe(
                    "monitor:site:test-site"
                );
            });

            it("should handle different site identifier formats", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.monitor.bySite("site_with_underscores")).toBe(
                    "monitor:site:site_with_underscores"
                );
                expect(CacheKeys.monitor.bySite("site-with-dashes")).toBe(
                    "monitor:site:site-with-dashes"
                );
                expect(CacheKeys.monitor.bySite("123")).toBe(
                    "monitor:site:123"
                );
            });

            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.monitor.bySite("")).toBe("monitor:site:");
            });
        });

        describe("operation", () => {
            it("should generate cache key for monitor operation status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                expect(CacheKeys.monitor.operation("monitor-123")).toBe(
                    "monitor:operation:monitor-123"
                );
                expect(CacheKeys.monitor.operation("test-monitor")).toBe(
                    "monitor:operation:test-monitor"
                );
                expect(CacheKeys.monitor.operation("op-456")).toBe(
                    "monitor:operation:op-456"
                );
            });

            it("should handle different operation identifier formats", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.monitor.operation("monitor_123")).toBe(
                    "monitor:operation:monitor_123"
                );
                expect(CacheKeys.monitor.operation("operation-test")).toBe(
                    "monitor:operation:operation-test"
                );
            });

            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.monitor.operation("")).toBe(
                    "monitor:operation:"
                );
            });
        });
    });

    describe("CacheKeys.site", () => {
        describe("bulkOperation", () => {
            it("should generate cache key for bulk site operations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Caching", "type");

                expect(CacheKeys.site.bulkOperation()).toBe("site:bulk");
            });

            it("should always return the same key", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.site.bulkOperation()).toBe("site:bulk");
                expect(CacheKeys.site.bulkOperation()).toBe("site:bulk");
            });
        });

        describe("byIdentifier", () => {
            it("should generate cache key for site by identifier", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Caching", "type");

                expect(CacheKeys.site.byIdentifier("site-123")).toBe(
                    "site:site-123"
                );
                expect(CacheKeys.site.byIdentifier("website-456")).toBe(
                    "site:website-456"
                );
                expect(CacheKeys.site.byIdentifier("test-site")).toBe(
                    "site:test-site"
                );
            });

            it("should handle different identifier formats", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(
                    CacheKeys.site.byIdentifier("site_with_underscores")
                ).toBe("site:site_with_underscores");
                expect(CacheKeys.site.byIdentifier("site-with-dashes")).toBe(
                    "site:site-with-dashes"
                );
                expect(CacheKeys.site.byIdentifier("123")).toBe("site:123");
            });

            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.site.byIdentifier("")).toBe("site:");
            });
        });

        describe("loading", () => {
            it("should generate cache key for site loading operation", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Data Loading", "type");

                expect(CacheKeys.site.loading("site-123")).toBe(
                    "site:loading:site-123"
                );
                expect(CacheKeys.site.loading("website-456")).toBe(
                    "site:loading:website-456"
                );
                expect(CacheKeys.site.loading("test-site")).toBe(
                    "site:loading:test-site"
                );
            });

            it("should handle different identifier formats", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.site.loading("site_123")).toBe(
                    "site:loading:site_123"
                );
                expect(CacheKeys.site.loading("loading-test")).toBe(
                    "site:loading:loading-test"
                );
            });

            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.site.loading("")).toBe("site:loading:");
            });
        });
    });

    describe("CacheKeys.validation", () => {
        describe("byType", () => {
            it("should generate cache key for validation by type and identifier", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                expect(
                    CacheKeys.validation.byType("monitor", "config-123")
                ).toBe("validation:monitor:config-123");
                expect(CacheKeys.validation.byType("site", "site-456")).toBe(
                    "validation:site:site-456"
                );
                expect(CacheKeys.validation.byType("form", "form-data")).toBe(
                    "validation:form:form-data"
                );
            });

            it("should handle different type and identifier combinations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(
                    CacheKeys.validation.byType("http-monitor", "test-123")
                ).toBe("validation:http-monitor:test-123");
                expect(
                    CacheKeys.validation.byType("ping_monitor", "test_456")
                ).toBe("validation:ping_monitor:test_456");
                expect(
                    CacheKeys.validation.byType("port-monitor", "test-789")
                ).toBe("validation:port-monitor:test-789");
            });

            it("should handle empty strings", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.validation.byType("", "identifier")).toBe(
                    "validation:identifier"
                );
                expect(CacheKeys.validation.byType("type", "")).toBe(
                    "validation:type:"
                );
                expect(CacheKeys.validation.byType("", "")).toBe("validation:");
            });
        });

        describe("monitorType", () => {
            it("should generate cache key for monitor type validation", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                expect(CacheKeys.validation.monitorType("http")).toBe(
                    "validation:monitor-type:http"
                );
                expect(CacheKeys.validation.monitorType("ping")).toBe(
                    "validation:monitor-type:ping"
                );
                expect(CacheKeys.validation.monitorType("port")).toBe(
                    "validation:monitor-type:port"
                );
                expect(CacheKeys.validation.monitorType("dns")).toBe(
                    "validation:monitor-type:dns"
                );
            });

            it("should handle different monitor type formats", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                expect(CacheKeys.validation.monitorType("http-check")).toBe(
                    "validation:monitor-type:http-check"
                );
                expect(CacheKeys.validation.monitorType("ping_check")).toBe(
                    "validation:monitor-type:ping_check"
                );
                expect(CacheKeys.validation.monitorType("custom-monitor")).toBe(
                    "validation:monitor-type:custom-monitor"
                );
            });

            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: cacheKeys", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(CacheKeys.validation.monitorType("")).toBe(
                    "validation:monitor-type:"
                );
            });
        });
    });

    describe(isStandardizedCacheKey, () => {
        it("should return true for valid standardized cache keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            expect(isStandardizedCacheKey("config:history-limit")).toBeTruthy();
            expect(
                isStandardizedCacheKey("config:validation:monitor-config")
            ).toBeTruthy();
            expect(isStandardizedCacheKey("monitor:monitor-123")).toBeTruthy();
            expect(
                isStandardizedCacheKey("monitor:site:site-456")
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey("monitor:operation:monitor-789")
            ).toBeTruthy();
            expect(isStandardizedCacheKey("site:bulk")).toBeTruthy();
            expect(isStandardizedCacheKey("site:site-123")).toBeTruthy();
            expect(
                isStandardizedCacheKey("site:loading:site-456")
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey("validation:monitor:config-123")
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey("validation:monitor-type:http")
            ).toBeTruthy();
        });

        it("should return false for invalid prefixes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey("invalid:key")).toBeFalsy();
            expect(
                isStandardizedCacheKey("unknown:prefix:identifier")
            ).toBeFalsy();
            expect(isStandardizedCacheKey("random:key")).toBeFalsy();
            expect(isStandardizedCacheKey("test:operation:id")).toBeFalsy();
        });

        it("should return false for invalid key formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey("")).toBeFalsy();
            expect(isStandardizedCacheKey("single-part")).toBeFalsy();
            expect(isStandardizedCacheKey("too:many:parts:in:key")).toBeFalsy();
            expect(
                isStandardizedCacheKey("key:with:too:many:segments")
            ).toBeFalsy();
        });

        it("should return false for keys with empty parts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey(":empty-prefix")).toBeFalsy();
            expect(isStandardizedCacheKey("config:")).toBeTruthy(); // 2-part key with empty identifier is valid
            expect(isStandardizedCacheKey("::")).toBeFalsy();
            expect(
                isStandardizedCacheKey("config::empty-operation")
            ).toBeFalsy(); // empty operation is invalid
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isStandardizedCacheKey(":")).toBeFalsy();
            expect(isStandardizedCacheKey("::")).toBeFalsy();
            expect(isStandardizedCacheKey(":::")).toBeFalsy();
        });
    });

    describe(parseCacheKey, () => {
        it("should parse two-part cache keys correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            const result1 = parseCacheKey(
                "config:history-limit" as StandardizedCacheKey
            );
            expect(result1).toEqual({
                prefix: "config",
                identifier: "history-limit",
            });

            const result2 = parseCacheKey(
                "site:site-123" as StandardizedCacheKey
            );
            expect(result2).toEqual({
                prefix: "site",
                identifier: "site-123",
            });

            const result3 = parseCacheKey(
                "monitor:monitor-456" as StandardizedCacheKey
            );
            expect(result3).toEqual({
                prefix: "monitor",
                identifier: "monitor-456",
            });
        });

        it("should parse three-part cache keys correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            const result1 = parseCacheKey(
                "config:validation:monitor-config" as StandardizedCacheKey
            );
            expect(result1).toEqual({
                prefix: "config",
                operation: "validation",
                identifier: "monitor-config",
            });

            const result2 = parseCacheKey(
                "monitor:site:site-456" as StandardizedCacheKey
            );
            expect(result2).toEqual({
                prefix: "monitor",
                operation: "site",
                identifier: "site-456",
            });

            const result3 = parseCacheKey(
                "validation:monitor-type:http" as StandardizedCacheKey
            );
            expect(result3).toEqual({
                prefix: "validation",
                operation: "monitor-type",
                identifier: "http",
            });
        });

        it("should throw error for empty identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(() =>
                parseCacheKey("config:" as StandardizedCacheKey)
            ).toThrow("Invalid cache key format: config:");

            expect(() =>
                parseCacheKey("monitor:operation:" as StandardizedCacheKey)
            ).toThrow("Invalid cache key format: monitor:operation:");
        });

        it("should throw error for invalid two-part format", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(() =>
                parseCacheKey(":identifier" as StandardizedCacheKey)
            ).toThrow("Invalid cache key format: :identifier");
            // Note: 'prefix:' with empty identifier is now valid
        });

        it("should throw error for invalid three-part format", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(() =>
                parseCacheKey(":operation:identifier" as StandardizedCacheKey)
            ).toThrow("Invalid cache key format: :operation:identifier");
            expect(() =>
                parseCacheKey("prefix::identifier" as StandardizedCacheKey)
            ).toThrow("Invalid cache key format: prefix::identifier");
            expect(() =>
                parseCacheKey("prefix:operation:" as StandardizedCacheKey)
            ).toThrow("Invalid cache key format: prefix:operation:");
        });

        it("should handle complex identifiers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = parseCacheKey(
                "site:loading:complex-site-123_with_underscores-and-dashes" as StandardizedCacheKey
            );
            expect(result).toEqual({
                prefix: "site",
                operation: "loading",
                identifier: "complex-site-123_with_underscores-and-dashes",
            });
        });
    });

    describe("Edge cases and integration", () => {
        it("should generate keys that can be parsed correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test round-trip: generate -> parse
            const configKey = CacheKeys.config.byName("test-config");
            const parsedConfig = parseCacheKey(
                configKey as StandardizedCacheKey
            );
            expect(parsedConfig).toEqual({
                prefix: "config",
                identifier: "test-config",
            });

            const monitorKey = CacheKeys.monitor.bySite("test-site");
            const parsedMonitor = parseCacheKey(
                monitorKey as StandardizedCacheKey
            );
            expect(parsedMonitor).toEqual({
                prefix: "monitor",
                operation: "site",
                identifier: "test-site",
            });
        });

        it("should validate generated keys correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            // Test all generated keys are valid
            expect(
                isStandardizedCacheKey(CacheKeys.config.byName("test"))
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey(CacheKeys.config.validation("test"))
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey(CacheKeys.monitor.byId("test"))
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey(CacheKeys.monitor.bySite("test"))
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey(CacheKeys.monitor.operation("test"))
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey(CacheKeys.site.bulkOperation())
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey(CacheKeys.site.byIdentifier("test"))
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey(CacheKeys.site.loading("test"))
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey(
                    CacheKeys.validation.byType("type", "test")
                )
            ).toBeTruthy();
            expect(
                isStandardizedCacheKey(CacheKeys.validation.monitorType("http"))
            ).toBeTruthy();
        });

        it("should handle unicode and special characters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheKeys", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const unicodeKey = CacheKeys.config.byName("测试-config-🔧");
            expect(unicodeKey).toBe("config:测试-config-🔧");
            expect(isStandardizedCacheKey(unicodeKey)).toBeTruthy();

            const parsed = parseCacheKey(unicodeKey as StandardizedCacheKey);
            expect(parsed.identifier).toBe("测试-config-🔧");
        });
    });
});
