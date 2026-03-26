/**
 * Property-based fuzzing tests for cache configuration constants.
 *
 * @file Comprehensive fast-check fuzzing tests to achieve 100% function and
 *   branch coverage for shared/constants/cacheConfig.ts. These tests use
 *   property-based testing to validate all cache naming functions and
 *   configuration integrity.
 */

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
    CACHE_CONFIG,
    CACHE_NAMES,
    type CacheConfig,
    type CacheConfigKey,
} from "../../../shared/constants/cacheConfig";

describe("cacheConfig - Property-Based Fuzzing Tests", () => {
    describe("CACHE_CONFIG validation", () => {
        it("should have valid TTL values for all cache configurations", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(
                        ...(Object.keys(CACHE_CONFIG) as CacheConfigKey[])
                    ),
                    (key) => {
                        const config = CACHE_CONFIG[key];

                        // TTL should be positive and reasonable (1 second to 1 day)
                        expect(config.ttl).toBeGreaterThan(0);
                        expect(config.ttl).toBeLessThanOrEqual(86_400_000); // 1 day in ms

                        // TTL should be a multiple of 1000 (full seconds)
                        expect(config.ttl % 1000).toBe(0);
                    }
                )
            );
        });

        it("should have valid maxSize values for all cache configurations", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(
                        ...(Object.keys(CACHE_CONFIG) as CacheConfigKey[])
                    ),
                    (key) => {
                        const config = CACHE_CONFIG[key];

                        // Max size should be positive and reasonable
                        expect(config.maxSize).toBeGreaterThan(0);
                        expect(config.maxSize).toBeLessThanOrEqual(10_000); // Reasonable upper limit

                        // Max size should be an integer
                        expect(Number.isInteger(config.maxSize)).toBeTruthy();
                    }
                )
            );
        });

        it("should have non-empty names for all cache configurations", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(
                        ...(Object.keys(CACHE_CONFIG) as CacheConfigKey[])
                    ),
                    (key) => {
                        const config = CACHE_CONFIG[key];

                        expect(config.name).toBeTruthy();
                        expect(typeof config.name).toBe("string");
                        expect(config.name.length).toBeGreaterThan(0);
                        expect(config.name.trim()).toBe(config.name); // No leading/trailing whitespace
                    }
                )
            );
        });

        it("should have boolean enableStats for all cache configurations", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(
                        ...(Object.keys(CACHE_CONFIG) as CacheConfigKey[])
                    ),
                    (key) => {
                        const config = CACHE_CONFIG[key];

                        expect(typeof config.enableStats).toBe("boolean");
                    }
                )
            );
        });

        it("should have consistent configuration structure", () => {
            const expectedKeys = [
                "enableStats",
                "maxSize",
                "name",
                "ttl",
            ];

            fc.assert(
                fc.property(
                    fc.constantFrom(
                        ...(Object.keys(CACHE_CONFIG) as CacheConfigKey[])
                    ),
                    (key) => {
                        const config = CACHE_CONFIG[key];
                        const configKeys = Object.keys(config).toSorted();

                        expect(configKeys).toEqual(expectedKeys);
                    }
                )
            );
        });
    });

    describe("CACHE_NAMES.monitors function", () => {
        it("should return 'monitors' when called without suffix", () => {
            const result = CACHE_NAMES.monitors();
            expect(result).toBe("monitors");
        });

        it("should handle various suffix inputs correctly", () => {
            fc.assert(
                fc.property(
                    fc.option(fc.string({ minLength: 1, maxLength: 20 }), {
                        nil: undefined,
                    }),
                    (suffix) => {
                        const result = CACHE_NAMES.monitors(suffix);

                        if (suffix) {
                            expect(result).toBe(`monitors-${suffix}`);
                            expect(result).toMatch(/^monitors-.+$/);
                        } else {
                            expect(result).toBe("monitors");
                        }

                        expect(typeof result).toBe("string");
                        expect(result.length).toBeGreaterThan(0);
                    }
                )
            );
        });

        it("should handle empty string suffix", () => {
            const result = CACHE_NAMES.monitors("");
            expect(result).toBe("monitors-");
        });

        it("should handle special characters in suffix", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 10 }),
                    (suffix) => {
                        const result = CACHE_NAMES.monitors(suffix);
                        expect(result).toBe(`monitors-${suffix}`);
                        expect(result.startsWith("monitors-")).toBeTruthy();
                    }
                )
            );
        });
    });

    describe("CACHE_NAMES.settings function", () => {
        it("should return 'settings' when called without suffix", () => {
            const result = CACHE_NAMES.settings();
            expect(result).toBe("settings");
        });

        it("should handle various suffix inputs correctly", () => {
            fc.assert(
                fc.property(
                    fc.option(fc.string({ minLength: 1, maxLength: 20 }), {
                        nil: undefined,
                    }),
                    (suffix) => {
                        const result = CACHE_NAMES.settings(suffix);

                        if (suffix) {
                            expect(result).toBe(`settings-${suffix}`);
                            expect(result).toMatch(/^settings-.+$/);
                        } else {
                            expect(result).toBe("settings");
                        }

                        expect(typeof result).toBe("string");
                        expect(result.length).toBeGreaterThan(0);
                    }
                )
            );
        });

        it("should handle null and undefined suffix consistently", () => {
            expect(CACHE_NAMES.settings(undefined)).toBe("settings");
            expect(CACHE_NAMES.settings()).toBe("settings");
        });

        it("should handle numeric strings as suffix", () => {
            fc.assert(
                fc.property(fc.integer({ min: 0, max: 9999 }), (num) => {
                    const suffix = num.toString();
                    const result = CACHE_NAMES.settings(suffix);
                    expect(result).toBe(`settings-${suffix}`);
                })
            );
        });
    });

    describe("CACHE_NAMES.sites function", () => {
        it("should return 'sites' when called without suffix", () => {
            const result = CACHE_NAMES.sites();
            expect(result).toBe("sites");
        });

        it("should handle various suffix inputs correctly", () => {
            fc.assert(
                fc.property(
                    fc.option(fc.string({ minLength: 1, maxLength: 20 }), {
                        nil: undefined,
                    }),
                    (suffix) => {
                        const result = CACHE_NAMES.sites(suffix);

                        if (suffix) {
                            expect(result).toBe(`sites-${suffix}`);
                            expect(result).toMatch(/^sites-.+$/);
                        } else {
                            expect(result).toBe("sites");
                        }

                        expect(typeof result).toBe("string");
                        expect(result.length).toBeGreaterThan(0);
                    }
                )
            );
        });

        it("should handle boundary conditions", () => {
            // Test empty string
            expect(CACHE_NAMES.sites("")).toBe("sites-");

            // Test very long suffix
            const longSuffix = "a".repeat(100);
            expect(CACHE_NAMES.sites(longSuffix)).toBe(`sites-${longSuffix}`);

            // Test whitespace
            expect(CACHE_NAMES.sites(" ")).toBe("sites- ");
            expect(CACHE_NAMES.sites("  ")).toBe("sites-  ");
        });

        it("should be consistent with the conditional logic", () => {
            fc.assert(
                fc.property(fc.option(fc.string()), (suffix) => {
                    const normalizedSuffix =
                        suffix === null ? undefined : suffix;
                    const result = CACHE_NAMES.sites(normalizedSuffix);

                    // This tests the ternary operator: suffix === undefined ? "sites" : `sites-${suffix}`
                    if (normalizedSuffix === undefined) {
                        expect(result).toBe("sites");
                    } else {
                        expect(result).toBe(`sites-${normalizedSuffix}`);
                    }
                })
            );
        });
    });

    describe("CACHE_NAMES.temporary function", () => {
        it("should always require an operation parameter", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (operation) => {
                        const result = CACHE_NAMES.temporary(operation);
                        expect(result).toBe(`temporary-${operation}`);
                        expect(result).toMatch(/^temporary-.+$/);
                        expect(typeof result).toBe("string");
                        expect(result.length).toBeGreaterThan(
                            "temporary-".length
                        );
                    }
                )
            );
        });

        it("should handle various operation names", () => {
            const commonOperations = [
                "import",
                "export",
                "sync",
                "backup",
                "restore",
                "migrate",
            ];

            fc.assert(
                fc.property(
                    fc.constantFrom(...commonOperations),
                    (operation) => {
                        const result = CACHE_NAMES.temporary(operation);
                        expect(result).toBe(`temporary-${operation}`);
                        expect(result.startsWith("temporary-")).toBeTruthy();
                        expect(result.endsWith(operation)).toBeTruthy();
                    }
                )
            );
        });

        it("should handle empty operation string", () => {
            const result = CACHE_NAMES.temporary("");
            expect(result).toBe("temporary-");
        });

        it("should handle special characters in operation names", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }).filter((s) => s.length > 0),
                    (operation) => {
                        const result = CACHE_NAMES.temporary(operation);
                        expect(result).toBe(`temporary-${operation}`);
                        expect(result).toContain("temporary-");
                    }
                )
            );
        });

        it("should maintain consistency with no conditional logic", () => {
            fc.assert(
                fc.property(fc.string(), (operation) => {
                    const result = CACHE_NAMES.temporary(operation);
                    // Unlike other functions, temporary always adds the operation
                    expect(result).toBe(`temporary-${operation}`);
                })
            );
        });
    });

    describe("Cross-function consistency", () => {
        it("should maintain unique naming patterns across all cache name functions", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 10 }),
                    (suffix) => {
                        const monitorsName = CACHE_NAMES.monitors(suffix);
                        const settingsName = CACHE_NAMES.settings(suffix);
                        const sitesName = CACHE_NAMES.sites(suffix);
                        const temporaryName = CACHE_NAMES.temporary(suffix);

                        // All should be different when suffix is provided
                        const names = [
                            monitorsName,
                            settingsName,
                            sitesName,
                            temporaryName,
                        ];
                        const uniqueNames = new Set(names);
                        expect(uniqueNames.size).toBe(names.length);

                        // Each should start with their respective prefix
                        expect(
                            monitorsName.startsWith("monitors")
                        ).toBeTruthy();
                        expect(
                            settingsName.startsWith("settings")
                        ).toBeTruthy();
                        expect(sitesName.startsWith("sites")).toBeTruthy();
                        expect(
                            temporaryName.startsWith("temporary")
                        ).toBeTruthy();
                    }
                )
            );
        });
    });

    describe("Type safety validation", () => {
        it("should maintain type consistency for cache configurations", () => {
            const configKeys = Object.keys(CACHE_CONFIG) as CacheConfigKey[];

            fc.assert(
                fc.property(fc.constantFrom(...configKeys), (key) => {
                    const config = CACHE_CONFIG[key];

                    // Validate TypeScript types at runtime
                    expect(typeof config.ttl).toBe("number");
                    expect(typeof config.enableStats).toBe("boolean");
                    expect(typeof config.maxSize).toBe("number");
                    expect(typeof config.name).toBe("string");
                })
            );
        });

        it("should maintain immutability of cache configurations", () => {
            const configKeys = Object.keys(CACHE_CONFIG) as CacheConfigKey[];

            fc.assert(
                fc.property(fc.constantFrom(...configKeys), (key) => {
                    const config = CACHE_CONFIG[key];

                    // Attempt to modify should fail (frozen objects)
                    expect(() => {
                        (config as any).ttl = 999;
                    }).toThrow();

                    expect(() => {
                        (config as any).name = "modified";
                    }).toThrow();
                })
            );
        });

        it("should validate CacheConfig type compatibility", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(
                        ...(Object.keys(CACHE_CONFIG) as CacheConfigKey[])
                    ),
                    (key) => {
                        const config: CacheConfig = CACHE_CONFIG[key];

                        // Should satisfy CacheConfig interface
                        expect(config).toHaveProperty("ttl");
                        expect(config).toHaveProperty("enableStats");
                        expect(config).toHaveProperty("maxSize");
                        expect(config).toHaveProperty("name");
                    }
                )
            );
        });
    });

    describe("Edge cases and boundary conditions", () => {
        it("should handle extreme suffix values for all naming functions", () => {
            const extremeValues = [
                "",
                " ",
                "\t",
                "\n",
                "a".repeat(1000),
                "123",
                "special-chars!@#$%^&*()",
            ];

            fc.assert(
                fc.property(
                    fc.constantFrom(...extremeValues),
                    (extremeValue) => {
                        // Test all optional suffix functions
                        expect(() =>
                            CACHE_NAMES.monitors(extremeValue)
                        ).not.toThrow();
                        expect(() =>
                            CACHE_NAMES.settings(extremeValue)
                        ).not.toThrow();
                        expect(() =>
                            CACHE_NAMES.sites(extremeValue)
                        ).not.toThrow();

                        // Test temporary function (required parameter)
                        expect(() =>
                            CACHE_NAMES.temporary(extremeValue)
                        ).not.toThrow();

                        // Verify results are strings
                        expect(typeof CACHE_NAMES.monitors(extremeValue)).toBe(
                            "string"
                        );
                        expect(typeof CACHE_NAMES.settings(extremeValue)).toBe(
                            "string"
                        );
                        expect(typeof CACHE_NAMES.sites(extremeValue)).toBe(
                            "string"
                        );
                        expect(typeof CACHE_NAMES.temporary(extremeValue)).toBe(
                            "string"
                        );
                    }
                )
            );
        });

        it("should validate configuration value ranges", () => {
            const configs = Object.values(CACHE_CONFIG);

            for (const config of configs) {
                // TTL should be reasonable (5 minutes to 30 minutes based on actual values)
                expect(config.ttl).toBeGreaterThanOrEqual(300_000); // 5 minutes
                expect(config.ttl).toBeLessThanOrEqual(1_800_000); // 30 minutes

                // MaxSize should be reasonable
                expect(config.maxSize).toBeGreaterThanOrEqual(100);
                expect(config.maxSize).toBeLessThanOrEqual(1000);

                // Name should not be empty and should be lowercase with possible hyphens
                expect(config.name).toMatch(/^[a-z][a-z-]*[a-z]$|^[a-z]$/);
            }
        });
    });
});
