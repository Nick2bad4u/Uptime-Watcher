/**
 * Tests for standardized cache configuration constants.
 *
 * @remarks
 * Validates the structure, values, and consistency of cache configuration
 * constants used throughout the application for consistent caching behavior.
 */

import { describe, expect, it } from "vitest";

import {
    CACHE_CONFIG,
    CACHE_NAMES,
    type CacheConfig,
    type CacheConfigKey,
    type CacheConfigType,
} from "../../constants/cacheConfig";

describe("Cache Configuration Constants", () => {
    describe("CACHE_CONFIG Structure", () => {
        it("should be properly frozen and immutable", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(Object.isFrozen(CACHE_CONFIG)).toBe(true);
            expect(Object.isFrozen(CACHE_CONFIG.SITES)).toBe(true);
            expect(Object.isFrozen(CACHE_CONFIG.MONITORS)).toBe(true);
            expect(Object.isFrozen(CACHE_CONFIG.SETTINGS)).toBe(true);
            expect(Object.isFrozen(CACHE_CONFIG.VALIDATION)).toBe(true);
            expect(Object.isFrozen(CACHE_CONFIG.TEMPORARY)).toBe(true);
        });

        it("should have all required cache types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Caching", "type");

            expect(CACHE_CONFIG).toHaveProperty("SITES");
            expect(CACHE_CONFIG).toHaveProperty("MONITORS");
            expect(CACHE_CONFIG).toHaveProperty("SETTINGS");
            expect(CACHE_CONFIG).toHaveProperty("VALIDATION");
            expect(CACHE_CONFIG).toHaveProperty("TEMPORARY");
        });

        it("should have consistent structure for all cache types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Caching", "type");

            const cacheTypes = Object.keys(CACHE_CONFIG) as CacheConfigKey[];

            for (const cacheType of cacheTypes) {
                const config = CACHE_CONFIG[cacheType];
                expect(config).toHaveProperty("name");
                expect(config).toHaveProperty("defaultTTL");
                expect(config).toHaveProperty("maxSize");
                expect(config).toHaveProperty("enableStats");

                expect(typeof config.name).toBe("string");
                expect(typeof config.defaultTTL).toBe("number");
                expect(typeof config.maxSize).toBe("number");
                expect(typeof config.enableStats).toBe("boolean");
            }
        });
    });

    describe("SITES Configuration", () => {
        it("should have correct values for site data caching", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(CACHE_CONFIG.SITES.name).toBe("sites");
            expect(CACHE_CONFIG.SITES.defaultTTL).toBe(600_000); // 10 minutes
            expect(CACHE_CONFIG.SITES.maxSize).toBe(500);
            expect(CACHE_CONFIG.SITES.enableStats).toBe(true);
        });

        it("should have reasonable TTL for site management operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(CACHE_CONFIG.SITES.defaultTTL).toBeGreaterThan(0);
            expect(CACHE_CONFIG.SITES.defaultTTL).toBeLessThanOrEqual(
                30 * 60 * 1000
            ); // <= 30 minutes
        });
    });

    describe("MONITORS Configuration", () => {
        it("should have correct values for monitor data caching", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(CACHE_CONFIG.MONITORS.name).toBe("monitors");
            expect(CACHE_CONFIG.MONITORS.defaultTTL).toBe(300_000); // 5 minutes
            expect(CACHE_CONFIG.MONITORS.maxSize).toBe(1000);
            expect(CACHE_CONFIG.MONITORS.enableStats).toBe(true);
        });

        it("should have shorter TTL for real-time monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(CACHE_CONFIG.MONITORS.defaultTTL).toBeLessThan(
                CACHE_CONFIG.SITES.defaultTTL
            );
        });
    });

    describe("SETTINGS Configuration", () => {
        it("should have correct values for settings caching", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(CACHE_CONFIG.SETTINGS.name).toBe("settings");
            expect(CACHE_CONFIG.SETTINGS.defaultTTL).toBe(1_800_000); // 30 minutes
            expect(CACHE_CONFIG.SETTINGS.maxSize).toBe(100);
            expect(CACHE_CONFIG.SETTINGS.enableStats).toBe(true);
        });

        it("should have longest TTL for infrequently changing data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(CACHE_CONFIG.SETTINGS.defaultTTL).toBeGreaterThan(
                CACHE_CONFIG.SITES.defaultTTL
            );
            expect(CACHE_CONFIG.SETTINGS.defaultTTL).toBeGreaterThan(
                CACHE_CONFIG.MONITORS.defaultTTL
            );
        });
    });

    describe("VALIDATION Configuration", () => {
        it("should have correct values for validation result caching", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            expect(CACHE_CONFIG.VALIDATION.name).toBe("validation-results");
            expect(CACHE_CONFIG.VALIDATION.defaultTTL).toBe(300_000); // 5 minutes
            expect(CACHE_CONFIG.VALIDATION.maxSize).toBe(200);
            expect(CACHE_CONFIG.VALIDATION.enableStats).toBe(true);
        });

        it("should have moderate TTL for validation accuracy", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            expect(CACHE_CONFIG.VALIDATION.defaultTTL).toBe(
                CACHE_CONFIG.MONITORS.defaultTTL
            );
        });
    });

    describe("TEMPORARY Configuration", () => {
        it("should have correct values for temporary operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(CACHE_CONFIG.TEMPORARY.name).toBe("temporary");
            expect(CACHE_CONFIG.TEMPORARY.defaultTTL).toBe(300_000); // 5 minutes
            expect(CACHE_CONFIG.TEMPORARY.maxSize).toBe(1000);
            expect(CACHE_CONFIG.TEMPORARY.enableStats).toBe(false); // Disabled for performance
        });

        it("should have stats disabled for performance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(CACHE_CONFIG.TEMPORARY.enableStats).toBe(false);
        });
    });

    describe("TTL Value Relationships", () => {
        it("should have logical TTL ordering", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Settings should have longest TTL (infrequent changes)
            expect(CACHE_CONFIG.SETTINGS.defaultTTL).toBeGreaterThan(
                CACHE_CONFIG.SITES.defaultTTL
            );

            // Sites should have longer TTL than monitors (less real-time)
            expect(CACHE_CONFIG.SITES.defaultTTL).toBeGreaterThan(
                CACHE_CONFIG.MONITORS.defaultTTL
            );

            // Monitors and validation should have same TTL (both need accuracy)
            expect(CACHE_CONFIG.MONITORS.defaultTTL).toBe(
                CACHE_CONFIG.VALIDATION.defaultTTL
            );

            // Temporary should have short TTL
            expect(CACHE_CONFIG.TEMPORARY.defaultTTL).toBe(
                CACHE_CONFIG.MONITORS.defaultTTL
            );
        });

        it("should have all positive TTL values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const cacheTypes = Object.keys(CACHE_CONFIG) as CacheConfigKey[];

            for (const cacheType of cacheTypes) {
                expect(CACHE_CONFIG[cacheType].defaultTTL).toBeGreaterThan(0);
            }
        });
    });

    describe("Size Limit Relationships", () => {
        it("should have logical size ordering", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Monitors and temporary should have largest size (high volume)
            expect(CACHE_CONFIG.MONITORS.maxSize).toBe(1000);
            expect(CACHE_CONFIG.TEMPORARY.maxSize).toBe(1000);

            // Sites should have moderate size
            expect(CACHE_CONFIG.SITES.maxSize).toBe(500);

            // Validation should have moderate size
            expect(CACHE_CONFIG.VALIDATION.maxSize).toBe(200);

            // Settings should have smallest size (limited config values)
            expect(CACHE_CONFIG.SETTINGS.maxSize).toBe(100);
        });

        it("should have all positive size values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const cacheTypes = Object.keys(CACHE_CONFIG) as CacheConfigKey[];

            for (const cacheType of cacheTypes) {
                expect(CACHE_CONFIG[cacheType].maxSize).toBeGreaterThan(0);
            }
        });
    });
});

describe("Cache Naming Functions", () => {
    describe("CACHE_NAMES Structure", () => {
        it("should be properly frozen", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(Object.isFrozen(CACHE_NAMES)).toBe(true);
        });

        it("should have all required naming functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(CACHE_NAMES).toHaveProperty("temporary");
            expect(CACHE_NAMES).toHaveProperty("sites");
            expect(CACHE_NAMES).toHaveProperty("monitors");
            expect(CACHE_NAMES).toHaveProperty("settings");

            expect(typeof CACHE_NAMES.temporary).toBe("function");
            expect(typeof CACHE_NAMES.sites).toBe("function");
            expect(typeof CACHE_NAMES.monitors).toBe("function");
            expect(typeof CACHE_NAMES.settings).toBe("function");
        });
    });

    describe("temporary() naming function", () => {
        it("should generate correct temporary cache names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Caching", "type");

            expect(CACHE_NAMES.temporary("import")).toBe("temporary-import");
            expect(CACHE_NAMES.temporary("export")).toBe("temporary-export");
            expect(CACHE_NAMES.temporary("sync")).toBe("temporary-sync");
        });

        it("should handle various operation types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(CACHE_NAMES.temporary("test")).toBe("temporary-test");
            expect(CACHE_NAMES.temporary("backup")).toBe("temporary-backup");
            expect(CACHE_NAMES.temporary("migration")).toBe(
                "temporary-migration"
            );
        });
    });

    describe("sites() naming function", () => {
        it("should generate base cache name without suffix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Caching", "type");

            expect(CACHE_NAMES.sites()).toBe("sites");
            expect(CACHE_NAMES.sites(undefined)).toBe("sites");
        });

        it("should generate suffixed cache names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Caching", "type");

            expect(CACHE_NAMES.sites("temp")).toBe("sites-temp");
            expect(CACHE_NAMES.sites("backup")).toBe("sites-backup");
            expect(CACHE_NAMES.sites("test")).toBe("sites-test");
        });
    });

    describe("monitors() naming function", () => {
        it("should generate base cache name without suffix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Caching", "type");

            expect(CACHE_NAMES.monitors()).toBe("monitors");
            expect(CACHE_NAMES.monitors(undefined)).toBe("monitors");
        });

        it("should generate suffixed cache names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Caching", "type");

            expect(CACHE_NAMES.monitors("temp")).toBe("monitors-temp");
            expect(CACHE_NAMES.monitors("backup")).toBe("monitors-backup");
            expect(CACHE_NAMES.monitors("test")).toBe("monitors-test");
        });
    });

    describe("settings() naming function", () => {
        it("should generate base cache name without suffix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Caching", "type");

            expect(CACHE_NAMES.settings()).toBe("settings");
            expect(CACHE_NAMES.settings(undefined)).toBe("settings");
        });

        it("should generate suffixed cache names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: cacheConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Caching", "type");

            expect(CACHE_NAMES.settings("temp")).toBe("settings-temp");
            expect(CACHE_NAMES.settings("backup")).toBe("settings-backup");
            expect(CACHE_NAMES.settings("test")).toBe("settings-test");
        });
    });
});

describe("Type Definitions", () => {
    it("should export correct types", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: cacheConfig", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Export Operation", "type");

        // Test that types can be used (compilation test)
        const configType: CacheConfigType = CACHE_CONFIG;
        const configKey: CacheConfigKey = "SITES";
        const config: CacheConfig = CACHE_CONFIG.SITES;

        expect(configType).toBeDefined();
        expect(configKey).toBeDefined();
        expect(config).toBeDefined();
    });

    it("should have correct type structure", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: cacheConfig", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        const config: CacheConfig = CACHE_CONFIG.SITES;

        expect(typeof config.name).toBe("string");
        expect(typeof config.defaultTTL).toBe("number");
        expect(typeof config.maxSize).toBe("number");
        expect(typeof config.enableStats).toBe("boolean");
    });
});
