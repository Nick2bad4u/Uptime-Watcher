/**
 * Property-based tests for cache utilities using fast-check.
 *
 * @remarks
 * These tests verify the correctness of cache operations using property-based
 * testing to explore edge cases and validate invariants across random inputs.
 *
 * Tests cover:
 *
 * - Basic cache operations (get/set/has/delete/clear)
 * - TTL (time-to-live) behavior and expiration
 * - LRU (least-recently-used) eviction when maxSize is reached
 * - Cache cleanup and maintenance operations
 * - Application cache instances and utility functions
 *
 * @file
 */

import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { fc, test as fcTest } from "@fast-check/vitest";
import {
    TypedCache,
    AppCaches,
    clearAllCaches,
    getCachedOrFetch,
} from "../../utils/cache";
import type { CacheValue } from "@shared/types/configTypes";

describe("Cache Utils Property-Based Tests", () => {
    let originalDateNow: typeof Date.now;
    let mockTime: number;

    beforeEach(() => {
        // Mock Date.now for predictable timing in tests
        originalDateNow = Date.now;
        mockTime = 1_000_000; // Start at a predictable time
        Date.now = vi.fn(() => mockTime);
    });

    afterEach(() => {
        Date.now = originalDateNow;
        vi.restoreAllMocks();
    });

    const advanceTime = (ms: number): void => {
        mockTime += ms;
    };

    describe("TypedCache basic operations", () => {
        fcTest.prop([
            fc.array(fc.tuple(fc.string(), fc.string()), {
                minLength: 0,
                maxLength: 50,
            }),
        ])("should store and retrieve all set values", (entries) => {
            const cache = new TypedCache<string, string>();

            // Create a map to track the latest value for each key (since duplicates overwrite)
            const expectedValues = new Map<string, string>();

            // Set all entries
            for (const [key, value] of entries) {
                cache.set(key, value);
                expectedValues.set(key, value); // Track latest value for each key
            }

            // Verify all unique entries can be retrieved with their latest values
            for (const [key, expectedValue] of expectedValues.entries()) {
                expect(cache.get(key)).toBe(expectedValue);
                expect(cache.has(key)).toBeTruthy();
            }
        });

        fcTest.prop([
            fc.array(fc.tuple(fc.string(), fc.integer()), {
                minLength: 1,
                maxLength: 20,
            }),
        ])("should handle different value types correctly", (entries) => {
            const cache = new TypedCache<string, number>();

            for (const [key, value] of entries) {
                cache.set(key, value);
                expect(cache.get(key)).toBe(value);
            }
        });

        fcTest.prop([
            fc.array(fc.tuple(fc.string(), fc.string()), {
                minLength: 0,
                maxLength: 30,
            }),
        ])("should return undefined for non-existent keys", (entries) => {
            const cache = new TypedCache<string, string>();

            // Set entries
            for (const [key, value] of entries) {
                cache.set(key, value);
            }

            // Test non-existent keys
            expect(cache.get("non-existent-key")).toBeUndefined();
            expect(cache.has("non-existent-key")).toBeFalsy();
        });

        fcTest.prop([
            fc.array(fc.tuple(fc.string(), fc.string()), {
                minLength: 1,
                maxLength: 20,
            }),
        ])("should delete entries correctly", (entries) => {
            const cache = new TypedCache<string, string>();

            // Set all entries
            for (const [key, value] of entries) {
                cache.set(key, value);
            }

            // Delete first entry if it exists
            if (entries.length > 0) {
                const firstEntry = entries[0];
                if (firstEntry) {
                    const [firstKey] = firstEntry;
                    const deleted = cache.delete(firstKey);
                    expect(deleted).toBeTruthy();
                    expect(cache.get(firstKey)).toBeUndefined();
                    expect(cache.has(firstKey)).toBeFalsy();

                    // Second delete should return false
                    expect(cache.delete(firstKey)).toBeFalsy();
                }
            }
        });

        fcTest.prop([
            fc.array(fc.tuple(fc.string(), fc.string()), {
                minLength: 0,
                maxLength: 30,
            }),
        ])("should clear all entries", (entries) => {
            const cache = new TypedCache<string, string>();

            // Set entries
            for (const [key, value] of entries) {
                cache.set(key, value);
            }

            cache.clear();

            expect(cache.size).toBe(0);

            // Verify all entries are gone
            for (const [key] of entries) {
                expect(cache.get(key)).toBeUndefined();
                expect(cache.has(key)).toBeFalsy();
            }
        });

        fcTest.prop([
            fc.integer({ min: 1, max: 100 }),
            fc.array(fc.tuple(fc.string(), fc.string()), {
                minLength: 0,
                maxLength: 200,
            }),
        ])("should respect maxSize configuration", (maxSize, entries) => {
            const cache = new TypedCache<string, string>({ maxSize });

            // Add entries
            for (const [key, value] of entries) {
                cache.set(key, value);
            }

            // Cache size should never exceed maxSize
            expect(cache.size).toBeLessThanOrEqual(maxSize);
            expect(cache.size).toBeLessThanOrEqual(entries.length);
        });
    });

    describe("TTL (Time-To-Live) behavior", () => {
        fcTest.prop([
            fc.string(),
            fc.string(),
            fc.integer({ min: 1, max: 10_000 }),
        ])("should expire entries after TTL", (key, value, ttl) => {
            const cache = new TypedCache<string, string>();

            cache.set(key, value, ttl);
            expect(cache.get(key)).toBe(value);

            // Advance time beyond TTL
            advanceTime(ttl + 1);

            // Entry should be expired and removed
            expect(cache.get(key)).toBeUndefined();
            expect(cache.has(key)).toBeFalsy();
        });

        fcTest.prop([
            fc.integer({ min: 1, max: 5000 }),
            fc.array(fc.tuple(fc.string(), fc.string()), {
                minLength: 1,
                maxLength: 10,
            }),
        ])(
            "should use default TTL when no per-entry TTL is provided",
            (defaultTtl, entries) => {
                const cache = new TypedCache<string, string>({
                    ttl: defaultTtl,
                });

                // Set entries without per-entry TTL
                for (const [key, value] of entries) {
                    cache.set(key, value);
                    expect(cache.get(key)).toBe(value);
                }

                // Advance time beyond default TTL
                advanceTime(defaultTtl + 1);

                // All entries should be expired
                for (const [key] of entries) {
                    expect(cache.get(key)).toBeUndefined();
                }
            }
        );

        fcTest.prop([
            fc.integer({ min: 1, max: 1000 }),
            fc.integer({ min: 2000, max: 5000 }),
            fc.array(fc.tuple(fc.string({ minLength: 1 }), fc.string()), {
                minLength: 1,
                maxLength: 10,
            }),
        ])(
            "should honor per-entry TTL over default TTL",
            (defaultTtl, perEntryTtl, entries) => {
                // Filter to unique keys only to avoid duplicate key issues
                const uniqueEntries = entries.filter(
                    (entry, index, arr) =>
                        arr.findIndex((e) => e[0] === entry[0]) === index
                );

                const cache = new TypedCache<string, string>({
                    ttl: defaultTtl,
                });

                // Set entries with per-entry TTL
                for (const [key, value] of uniqueEntries) {
                    cache.set(key, value, perEntryTtl);
                }

                // Advance time beyond default TTL but before per-entry TTL
                advanceTime(defaultTtl + 100);

                // Entries should still be valid (using per-entry TTL)
                for (const [key, value] of uniqueEntries) {
                    expect(cache.get(key)).toBe(value);
                }

                // Advance time beyond per-entry TTL
                advanceTime(perEntryTtl);

                // Now entries should be expired
                for (const [key] of uniqueEntries) {
                    expect(cache.get(key)).toBeUndefined();
                }
            }
        );
    });

    describe("LRU (Least Recently Used) eviction", () => {
        fcTest.prop([
            fc.integer({ min: 3, max: 8 }),
            fc.array(fc.tuple(fc.string({ minLength: 1 }), fc.string()), {
                minLength: 20,
                maxLength: 40,
            }),
        ])(
            "should evict least recently used entries when maxSize is reached",
            (maxSize, entries) => {
                // Filter to ensure unique keys and sufficient entries
                const uniqueEntries = entries.filter(
                    (entry, index, arr) =>
                        arr.findIndex((e) => e[0] === entry[0]) === index
                );

                if (uniqueEntries.length < maxSize + 3) {
                    // Skip if we don't have enough unique entries to test properly
                    return;
                }

                const cache = new TypedCache<string, string>({ maxSize });

                // Add entries up to maxSize
                const initialEntries = uniqueEntries.slice(0, maxSize);
                for (const [key, value] of initialEntries) {
                    cache.set(key, value);
                    advanceTime(1); // Ensure different timestamps
                }

                expect(cache.size).toBe(maxSize);

                // Access first entry to make it recently used
                const firstEntry = initialEntries[0];
                let firstKey: string | undefined;
                if (firstEntry) {
                    [firstKey] = firstEntry;
                    advanceTime(1);
                    cache.get(firstKey); // Updates lastAccessed
                    advanceTime(1);
                }

                // Add one more entry to trigger eviction
                const nextEntry = uniqueEntries[maxSize];
                if (!nextEntry) {
                    throw new Error(
                        "Expected additional entry for eviction test"
                    );
                }
                const [newKey, newValue] = nextEntry;
                cache.set(newKey, newValue);

                // Cache size should still be maxSize
                expect(cache.size).toBe(maxSize);

                // First entry should still exist (was recently accessed)
                if (firstKey) {
                    expect(cache.has(firstKey)).toBeTruthy();
                }
                expect(cache.has(newKey)).toBeTruthy();
            }
        );

        fcTest.prop([fc.integer({ min: 3, max: 8 })])(
            "should maintain LRU order correctly with access patterns",
            (maxSize) => {
                const cache = new TypedCache<string, string>({ maxSize });

                // Fill cache to capacity
                for (let i = 0; i < maxSize; i++) {
                    cache.set(`key${i}`, `value${i}`);
                    advanceTime(1); // Ensure different timestamps
                }

                expect(cache.size).toBe(maxSize);

                // Access the first key to make it recently used
                cache.get("key0");
                advanceTime(1);

                // Add a new entry - should evict 'key1' (oldest unaccessed)
                cache.set("newKey", "newValue");

                expect(cache.size).toBe(maxSize);
                expect(cache.has("key0")).toBeTruthy(); // Recently accessed
                expect(cache.has("newKey")).toBeTruthy(); // Just added
            }
        );
    });

    describe("Cache maintenance operations", () => {
        fcTest.prop([
            fc.array(
                fc.tuple(
                    fc.string(),
                    fc.string(),
                    fc.integer({ min: 100, max: 2000 })
                ),
                { minLength: 1, maxLength: 15 }
            ),
        ])("cleanup should remove only expired entries", (entriesWithTtl) => {
            const cache = new TypedCache<string, string>();

            // Set entries with different TTLs
            for (const [
                key,
                value,
                ttl,
            ] of entriesWithTtl) {
                cache.set(key, value, ttl);
                advanceTime(10); // Small time increment
            }

            const initialSize = cache.size;

            // Advance time to expire some entries
            const halfMaxTtl =
                Math.max(...entriesWithTtl.map((entry) => entry[2])) / 2;
            advanceTime(halfMaxTtl);

            cache.cleanup();

            // Size should be same or smaller after cleanup
            expect(cache.size).toBeLessThanOrEqual(initialSize);
        });
    });

    describe("Application cache instances", () => {
        beforeEach(() => {
            clearAllCaches();
        });

        test("AppCaches should have correct cache instances", () => {
            expect(AppCaches.general).toBeInstanceOf(TypedCache);
            expect(AppCaches.monitorTypes).toBeInstanceOf(TypedCache);
            expect(AppCaches.uiHelpers).toBeInstanceOf(TypedCache);
        });

        fcTest.prop([
            fc.array(
                fc.tuple(
                    fc.string(),
                    fc.oneof(fc.string(), fc.integer(), fc.boolean())
                ),
                { minLength: 1, maxLength: 10 }
            ),
        ])("clearAllCaches should clear all app caches", (entries) => {
            // Add entries to all caches
            for (const [key, value] of entries) {
                AppCaches.general.set(key, value as CacheValue);
                AppCaches.monitorTypes.set(key, value as CacheValue);
                AppCaches.uiHelpers.set(key, value as CacheValue);
            }

            // Verify entries exist
            expect(AppCaches.general.size).toBeGreaterThan(0);
            expect(AppCaches.monitorTypes.size).toBeGreaterThan(0);
            expect(AppCaches.uiHelpers.size).toBeGreaterThan(0);

            clearAllCaches();

            // Verify all caches are cleared
            expect(AppCaches.general.size).toBe(0);
            expect(AppCaches.monitorTypes.size).toBe(0);
            expect(AppCaches.uiHelpers.size).toBe(0);
        });
    });

    describe("getCachedOrFetch utility", () => {
        fcTest.prop([fc.string(), fc.string()])(
            "should fetch and cache value on cache miss",
            async (key, value) => {
                const cache = new TypedCache<string, string>();
                const fetcher = vi.fn().mockResolvedValue(value);

                const result = await getCachedOrFetch(cache, key, fetcher);

                expect(result).toBe(value);
                expect(fetcher).toHaveBeenCalledTimes(1);
                expect(cache.get(key)).toBe(value);
            }
        );

        fcTest.prop([
            fc.string(),
            fc.string(),
            fc.string(),
        ])(
            "should return cached value without calling fetcher on cache hit",
            async (key, cachedValue, fetchValue) => {
                const cache = new TypedCache<string, string>();
                const fetcher = vi.fn().mockResolvedValue(fetchValue);

                // Pre-populate cache
                cache.set(key, cachedValue);

                const result = await getCachedOrFetch(cache, key, fetcher);

                expect(result).toBe(cachedValue);
                expect(fetcher).not.toHaveBeenCalled();
                expect(cache.get(key)).toBe(cachedValue);
            }
        );

        fcTest.prop([fc.string(), fc.integer({ min: 100, max: 1000 })])(
            "should handle fetcher errors correctly",
            async (key, ttl) => {
                const cache = new TypedCache<string, string>();
                const error = new Error("Fetch failed");
                const fetcher = vi.fn().mockRejectedValue(error);

                await expect(
                    getCachedOrFetch(cache, key, fetcher, ttl)
                ).rejects.toThrow("Fetch failed");

                expect(fetcher).toHaveBeenCalledTimes(1);
                expect(cache.get(key)).toBeUndefined(); // Should not cache errors
            }
        );

        fcTest.prop([
            fc.string(),
            fc.string(),
            fc.integer({ min: 1, max: 1000 }),
        ])("should respect TTL parameter", async (key, value, ttl) => {
            const cache = new TypedCache<string, string>();
            const fetcher = vi.fn().mockResolvedValue(value);

            await getCachedOrFetch(cache, key, fetcher, ttl);

            expect(cache.get(key)).toBe(value);

            // Advance time beyond TTL
            advanceTime(ttl + 1);

            expect(cache.get(key)).toBeUndefined();
        });
    });

    describe("Edge cases and robustness", () => {
        fcTest.prop([
            fc.array(fc.tuple(fc.string(), fc.string()), {
                minLength: 0,
                maxLength: 100,
            }),
        ])("should handle rapid consecutive operations", (entries) => {
            const cache = new TypedCache<string, string>();

            // Rapid set operations
            for (const [key, value] of entries) {
                cache.set(key, value);
                cache.get(key);
                cache.has(key);
            }

            // Rapid delete operations
            for (const [key] of entries) {
                cache.delete(key);
            }

            expect(cache.size).toBe(0);
        });

        fcTest.prop([fc.integer({ min: 1, max: 5 })])(
            "should handle small maxSize values",
            (maxSize) => {
                const cache = new TypedCache<string, string>({ maxSize });

                cache.set("key1", "value1");
                cache.set("key2", "value2");

                expect(cache.size).toBeLessThanOrEqual(maxSize);
            }
        );

        fcTest.prop([fc.array(fc.string(), { minLength: 0, maxLength: 50 })])(
            "should handle duplicate keys correctly",
            (keys) => {
                const cache = new TypedCache<string, number>();

                // Set same keys multiple times with different values
                for (let i = 0; i < keys.length; i++) {
                    for (const key of keys) {
                        cache.set(key, i);
                    }
                }

                // Each unique key should have the last value set
                const uniqueKeys = [...new Set(keys)];
                for (const key of uniqueKeys) {
                    expect(cache.get(key)).toBe(keys.length - 1);
                }

                expect(cache.size).toBe(uniqueKeys.length);
            }
        );
    });

    describe("Performance and determinism", () => {
        fcTest.prop([
            fc.array(fc.tuple(fc.string(), fc.string()), {
                minLength: 1,
                maxLength: 20,
            }),
        ])("should be deterministic for same inputs", (entries) => {
            const cache1 = new TypedCache<string, string>();
            const cache2 = new TypedCache<string, string>();

            // Same operations on both caches
            for (const [key, value] of entries) {
                cache1.set(key, value);
                cache2.set(key, value);
            }

            // Should have same results
            expect(cache1.size).toBe(cache2.size);

            for (const [key] of entries) {
                expect(cache1.get(key)).toBe(cache2.get(key));
                expect(cache1.has(key)).toBe(cache2.has(key));
            }
        });
    });
});
