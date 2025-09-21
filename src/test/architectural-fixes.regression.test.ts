/**
 * Regression tests for critical architectural fixes.
 *
 * @remarks
 * These tests verify that the fixes for cache TTL configuration and DNS monitor
 * field inclusion work correctly and prevent future regressions.
 */

import { describe, expect, it } from "vitest";

import type { Monitor } from "@shared/types";

import { CACHE_CONFIG } from "@shared/constants/cacheConfig";
import { TypedCache } from "../utils/cache";

describe("Architectural Fixes Regression Tests", () => {
    describe("DNS Monitor Field Inclusion", () => {
        it("should verify DNS monitor type includes recordType and expectedValue fields", () => {
            // Create a DNS monitor with all required fields
            const dnsMonitor: Monitor = {
                id: "test-dns-monitor",
                type: "dns",
                checkInterval: 60_000,
                monitoring: true,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                responseTime: 0,
                history: [],
                host: "example.com",
                recordType: "A",
                expectedValue: "192.168.1.1",
            };

            // Verify the DNS-specific fields are properly typed and accessible
            expect(dnsMonitor.recordType).toBe("A");
            expect(dnsMonitor.expectedValue).toBe("192.168.1.1");
            expect(dnsMonitor.host).toBe("example.com");
            expect(dnsMonitor.type).toBe("dns");
        });

        it("should handle optional DNS fields correctly", () => {
            // Create monitor without DNS fields
            const httpMonitor: Monitor = {
                id: "test-http-monitor",
                type: "http",
                checkInterval: 60_000,
                monitoring: true,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                responseTime: 0,
                history: [],
                url: "https://example.com",
            };

            // Verify DNS fields are optional and can be undefined
            expect(httpMonitor.recordType).toBeUndefined();
            expect(httpMonitor.expectedValue).toBeUndefined();
            expect(httpMonitor.url).toBe("https://example.com");
            expect(httpMonitor.type).toBe("http");
        });
    });

    describe("Cache TTL Configuration Mapping", () => {
        it("should correctly map CACHE_CONFIG.defaultTTL to TypedCache ttl parameter", () => {
            // Test the adapter pattern by checking configuration structure
            const monitorConfig = CACHE_CONFIG.MONITORS;

            // Verify the config has the expected structure
            expect(monitorConfig.defaultTTL).toBeDefined();
            expect(monitorConfig.maxSize).toBeDefined();
            expect(typeof monitorConfig.defaultTTL).toBe("number");
            expect(typeof monitorConfig.maxSize).toBe("number");
            expect(monitorConfig.defaultTTL).toBeGreaterThan(0);
            expect(monitorConfig.maxSize).toBeGreaterThan(0);

            // Create adapted config as done in the fix
            const adaptedConfig = {
                maxSize: monitorConfig.maxSize,
                ttl: monitorConfig.defaultTTL,
            };

            // Verify the adapter works by creating a cache
            const cache = new TypedCache<string, string>(adaptedConfig);

            // Test basic cache functionality
            cache.set("test-key", "test-value");
            expect(cache.get("test-key")).toBe("test-value");
            expect(cache.size).toBe(1);
        });

        it("should handle all cache configurations correctly", () => {
            // Test all cache configurations have proper structure
            const configs = [
                { name: "MONITORS", config: CACHE_CONFIG.MONITORS },
                { name: "SITES", config: CACHE_CONFIG.SITES },
                { name: "SETTINGS", config: CACHE_CONFIG.SETTINGS },
                { name: "TEMPORARY", config: CACHE_CONFIG.TEMPORARY },
            ];

            for (const { name, config } of configs) {
                expect(
                    config.defaultTTL,
                    `${name} should have defaultTTL`
                ).toBeGreaterThan(0);
                expect(
                    config.maxSize,
                    `${name} should have maxSize`
                ).toBeGreaterThan(0);

                // Verify adapter pattern works for each config
                const adaptedConfig = {
                    maxSize: config.maxSize,
                    ttl: config.defaultTTL,
                };

                expect(() => {
                    const cache = new TypedCache<string, number>(adaptedConfig);
                    cache.set("test", 1);
                    return cache.get("test");
                }).not.toThrow();
            }
        });

        it("should verify TTL values are reasonable", () => {
            // Verify TTL values make sense for their use cases
            expect(CACHE_CONFIG.MONITORS.defaultTTL).toBe(300_000); // 5 minutes
            expect(CACHE_CONFIG.SITES.defaultTTL).toBe(600_000); // 10 minutes
            expect(CACHE_CONFIG.SETTINGS.defaultTTL).toBe(1_800_000); // 30 minutes
            expect(CACHE_CONFIG.TEMPORARY.defaultTTL).toBe(300_000); // 5 minutes
        });
    });

    describe("Monitoring Lifecycle Integration", () => {
        it("should verify monitoring lifecycle module imports without errors", () => {
            // This ensures the fixes to monitoring lifecycle compile correctly
            expect(() => {
                // The module should import without throwing due to compilation errors

                require("../../electron/utils/monitoring/monitorLifecycle");
            }).not.toThrow();
        });
    });
});
