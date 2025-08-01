import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { StandardizedCache } from "../../../utils/cache/StandardizedCache";
import { TypedEventBus } from "../../../events/TypedEventBus";
import { UptimeEvents } from "../../../events/eventTypes";

/**
 * Comprehensive test suite for StandardizedCache
 *
 * This test suite aims for 98% branch coverage by testing:
 * - All configuration options and their combinations
 * - TTL expiration scenarios including edge cases
 * - LRU eviction behavior
 * - Event emission for all cache operations
 * - Statistics tracking accuracy
 * - Invalidation callbacks and error handling
 * - Bulk operations
 * - Iterator methods (entries, keys, getAll)
 * - Cleanup functionality
 * - Error scenarios and edge cases
 */
describe("StandardizedCache - Comprehensive Tests", () => {
    let cache: StandardizedCache<any>;
    let eventBus: TypedEventBus<UptimeEvents>;
    let consoleSpy: any;

    beforeEach(() => {
        eventBus = new TypedEventBus<UptimeEvents>();
        // Mock console to avoid test output noise
        consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        consoleSpy.mockRestore();
    });

    describe("Configuration Options", () => {
        it("should use default configuration values", () => {
            cache = new StandardizedCache({ name: "test-cache" });

            expect(cache.size).toBe(0);
            const stats = cache.getStats();
            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
            expect(stats.hitRatio).toBe(0);
            expect(stats.size).toBe(0);
        });

        it("should respect custom defaultTTL", () => {
            cache = new StandardizedCache({
                name: "test-cache",
                defaultTTL: 1000,
            });

            cache.set("key1", "value1");

            // Should exist initially
            expect(cache.get("key1")).toBe("value1");

            // Should expire after TTL
            vi.advanceTimersByTime(1001);
            expect(cache.get("key1")).toBeUndefined();
        });

        it("should handle defaultTTL of 0 (no expiration)", () => {
            cache = new StandardizedCache({
                name: "test-cache",
                defaultTTL: 0,
            });

            cache.set("key1", "value1");

            // Should not expire even after long time
            vi.advanceTimersByTime(999_999);
            expect(cache.get("key1")).toBe("value1");
        });

        it("should handle negative defaultTTL (no expiration)", () => {
            cache = new StandardizedCache({
                name: "test-cache",
                defaultTTL: -1000,
            });

            cache.set("key1", "value1");

            // Should not expire even after long time
            vi.advanceTimersByTime(999_999);
            expect(cache.get("key1")).toBe("value1");
        });

        it("should respect custom maxSize", () => {
            cache = new StandardizedCache({
                name: "test-cache",
                maxSize: 2,
            });

            cache.set("key1", "value1");
            cache.set("key2", "value2");
            expect(cache.size).toBe(2);

            // Should trigger LRU eviction
            cache.set("key3", "value3");
            expect(cache.size).toBe(2);
            expect(cache.has("key1")).toBe(false); // Oldest should be evicted
            expect(cache.has("key2")).toBe(true);
            expect(cache.has("key3")).toBe(true);
        });

        it("should handle enableStats = false", () => {
            cache = new StandardizedCache({
                name: "test-cache",
                enableStats: false,
            });

            cache.set("key1", "value1");
            cache.get("key1"); // Hit
            cache.get("nonexistent"); // Miss

            const stats = cache.getStats();
            // Stats should not be updated when disabled
            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
            expect(stats.hitRatio).toBe(0);
        });

        it("should work with event emitter", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-cached", eventSpy);

            cache = new StandardizedCache({
                name: "test-cache",
                eventEmitter: eventBus,
            });

            cache.set("key1", "value1");

            expect(eventSpy).toHaveBeenCalledWith({
                cacheName: "test-cache",
                timestamp: expect.any(Number),
                key: "key1",
                ttl: 300_000, // Default TTL
            });
        });

        it("should work without event emitter", () => {
            cache = new StandardizedCache({
                name: "test-cache",
                // No eventEmitter provided
            });

            // Should not throw when trying to emit events
            expect(() => {
                cache.set("key1", "value1");
                cache.delete("key1");
                cache.clear();
            }).not.toThrow();
        });
    });

    describe("TTL and Expiration", () => {
        beforeEach(() => {
            cache = new StandardizedCache({
                name: "test-cache",
                defaultTTL: 1000,
            });
        });

        it("should respect item-specific TTL overriding default", () => {
            cache.set("key1", "value1", 500); // Custom TTL
            cache.set("key2", "value2"); // Default TTL

            // After 600ms, key1 should be expired but key2 should still exist
            vi.advanceTimersByTime(600);
            expect(cache.get("key1")).toBeUndefined();
            expect(cache.get("key2")).toBe("value2");
        });

        it("should handle TTL of 0 on individual items (no expiration)", () => {
            cache.set("key1", "value1", 0);

            vi.advanceTimersByTime(999_999);
            expect(cache.get("key1")).toBe("value1");
        });

        it("should handle negative TTL on individual items (no expiration)", () => {
            cache.set("key1", "value1", -500);

            vi.advanceTimersByTime(999_999);
            expect(cache.get("key1")).toBe("value1");
        });

        it("should emit expiration event when item expires", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-expired", eventSpy);

            cache = new StandardizedCache({
                name: "test-cache",
                defaultTTL: 1000,
                eventEmitter: eventBus,
            });

            cache.set("key1", "value1", 500);

            vi.advanceTimersByTime(600);
            cache.get("key1"); // Should trigger expiration check

            expect(eventSpy).toHaveBeenCalledWith({
                cacheName: "test-cache",
                timestamp: expect.any(Number),
                key: "key1",
            });
        });

        it("should handle expired items in has() method", () => {
            cache.set("key1", "value1", 500);

            expect(cache.has("key1")).toBe(true);

            vi.advanceTimersByTime(600);
            expect(cache.has("key1")).toBe(false);
        });

        it("should clean up expired items in entries() method", () => {
            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1500);

            vi.advanceTimersByTime(600);

            const entries = [...cache.entries()];
            expect(entries).toHaveLength(1);
            expect(entries[0]).toEqual(["key2", "value2"]);
        });

        it("should clean up expired items in getAll() method", () => {
            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1500);

            vi.advanceTimersByTime(600);

            const values = cache.getAll();
            expect(values).toHaveLength(1);
            expect(values[0]).toBe("value2");
        });

        it("should clean up expired items in keys() method", () => {
            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1500);

            vi.advanceTimersByTime(600);

            const keys = cache.keys();
            expect(keys).toHaveLength(1);
            expect(keys[0]).toBe("key2");
        });
    });

    describe("LRU Eviction", () => {
        beforeEach(() => {
            cache = new StandardizedCache({
                name: "test-cache",
                maxSize: 3,
                eventEmitter: eventBus,
            });
        });

        it("should evict least recently used item when at capacity", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-evicted", eventSpy);

            // Fill cache to capacity
            cache.set("key1", "value1");
            vi.advanceTimersByTime(1); // Ensure different timestamps
            cache.set("key2", "value2");
            vi.advanceTimersByTime(1);
            cache.set("key3", "value3");
            expect(cache.size).toBe(3);

            // Add new item - should evict key1 (oldest by insertion time)
            vi.advanceTimersByTime(1);
            cache.set("key4", "value4");

            expect(cache.size).toBe(3);
            expect(cache.has("key1")).toBe(false); // Should be evicted (oldest)
            expect(cache.has("key2")).toBe(true);
            expect(cache.has("key3")).toBe(true);
            expect(cache.has("key4")).toBe(true);

            expect(eventSpy).toHaveBeenCalledWith({
                cacheName: "test-cache",
                timestamp: expect.any(Number),
                key: "key1",
                reason: "lru",
            });
        });

        it("should not evict when updating existing key", () => {
            // Fill cache to capacity
            cache.set("key1", "value1");
            cache.set("key2", "value2");
            cache.set("key3", "value3");
            expect(cache.size).toBe(3);

            // Update existing key - should not trigger eviction
            cache.set("key1", "new_value1");

            expect(cache.size).toBe(3);
            expect(cache.get("key1")).toBe("new_value1");
            expect(cache.has("key2")).toBe(true);
            expect(cache.has("key3")).toBe(true);
        });

        it("should handle eviction when cache is empty", () => {
            // Create cache with max size 1
            const smallCache = new StandardizedCache({
                name: "small-cache",
                maxSize: 1,
            });

            // This should not throw even though there's nothing to evict
            expect(() => {
                smallCache.set("key1", "value1");
            }).not.toThrow();
        });
    });

    describe("Statistics Tracking", () => {
        beforeEach(() => {
            cache = new StandardizedCache({
                name: "test-cache",
                enableStats: true,
            });
        });

        it("should track hit/miss statistics accurately", () => {
            cache.set("key1", "value1");

            // Generate hits and misses
            cache.get("key1"); // Hit
            cache.get("key1"); // Hit
            cache.get("nonexistent1"); // Miss
            cache.get("nonexistent2"); // Miss
            cache.get("key1"); // Hit

            const stats = cache.getStats();
            expect(stats.hits).toBe(3);
            expect(stats.misses).toBe(2);
            expect(stats.hitRatio).toBe(0.6); // 3/5
            expect(stats.size).toBe(1);
            expect(stats.lastAccess).toBeDefined();
        });

        it("should handle hit ratio calculation with no accesses", () => {
            const stats = cache.getStats();
            expect(stats.hitRatio).toBe(0);
            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
        });

        it("should update lastAccess timestamp on hits", () => {
            cache.set("key1", "value1");

            const initialStats = cache.getStats();
            expect(initialStats.lastAccess).toBeUndefined();

            vi.advanceTimersByTime(1000);
            cache.get("key1");

            const updatedStats = cache.getStats();
            expect(updatedStats.lastAccess).toBeDefined();
            expect(updatedStats.lastAccess).toBeGreaterThan(0);
        });

        it("should not update lastAccess on misses", () => {
            cache.get("nonexistent");

            const stats = cache.getStats();
            expect(stats.lastAccess).toBeUndefined();
            expect(stats.misses).toBe(1);
        });

        it("should track entry hit counts", () => {
            cache.set("key1", "value1");

            // Access multiple times
            cache.get("key1");
            cache.get("key1");
            cache.get("key1");

            // We can't directly access entry hit counts, but we can verify overall stats
            const stats = cache.getStats();
            expect(stats.hits).toBe(3);
        });

        it("should return snapshot of stats, not live reference", () => {
            const stats1 = cache.getStats();
            const stats2 = cache.getStats();

            expect(stats1).not.toBe(stats2); // Different objects
            expect(stats1).toEqual(stats2); // Same values

            // Modifying returned stats should not affect cache
            stats1.hits = 999;
            expect(cache.getStats().hits).toBe(0);
        });
    });

    describe("Event Emission", () => {
        beforeEach(() => {
            cache = new StandardizedCache({
                name: "test-cache",
                eventEmitter: eventBus,
            });
        });

        it("should emit item-cached event on set", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-cached", eventSpy);

            cache.set("key1", "value1", 2000);

            expect(eventSpy).toHaveBeenCalledWith({
                cacheName: "test-cache",
                timestamp: expect.any(Number),
                key: "key1",
                ttl: 2000,
            });
        });

        it("should emit item-deleted event on delete", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-deleted", eventSpy);

            cache.set("key1", "value1");
            cache.delete("key1");

            expect(eventSpy).toHaveBeenCalledWith({
                cacheName: "test-cache",
                timestamp: expect.any(Number),
                key: "key1",
            });
        });

        it("should emit cleared event on clear", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:cleared", eventSpy);

            cache.set("key1", "value1");
            cache.set("key2", "value2");
            cache.clear();

            expect(eventSpy).toHaveBeenCalledWith({
                cacheName: "test-cache",
                timestamp: expect.any(Number),
                itemCount: 2,
            });
        });

        it("should emit bulk-updated event on bulkUpdate", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:bulk-updated", eventSpy);

            cache.bulkUpdate([
                { key: "key1", data: "value1" },
                { key: "key2", data: "value2" },
                { key: "key3", data: "value3" },
            ]);

            expect(eventSpy).toHaveBeenCalledWith({
                cacheName: "test-cache",
                timestamp: expect.any(Number),
                itemCount: 3,
            });
        });

        it("should emit item-invalidated event on invalidate", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-invalidated", eventSpy);

            cache.set("key1", "value1");
            cache.invalidate("key1");

            expect(eventSpy).toHaveBeenCalledWith({
                cacheName: "test-cache",
                timestamp: expect.any(Number),
                key: "key1",
            });
        });

        it("should emit all-invalidated event on invalidateAll", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:all-invalidated", eventSpy);

            cache.set("key1", "value1");
            cache.set("key2", "value2");
            cache.invalidateAll();

            expect(eventSpy).toHaveBeenCalledWith({
                cacheName: "test-cache",
                timestamp: expect.any(Number),
                itemCount: 2,
            });
        });

        it("should emit cleanup-completed event on cleanup", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:cleanup-completed", eventSpy);

            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1000);

            vi.advanceTimersByTime(750);
            const cleaned = cache.cleanup();

            expect(cleaned).toBe(1);
            expect(eventSpy).toHaveBeenCalledWith({
                cacheName: "test-cache",
                timestamp: expect.any(Number),
                itemCount: 1,
            });
        });
    });

    describe("Invalidation Callbacks", () => {
        beforeEach(() => {
            cache = new StandardizedCache({
                name: "test-cache",
            });
        });

        it("should register and call invalidation callbacks", () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            const cleanup1 = cache.onInvalidation(callback1);
            const cleanup2 = cache.onInvalidation(callback2);

            cache.set("key1", "value1");
            cache.invalidate("key1");

            expect(callback1).toHaveBeenCalledWith("key1");
            expect(callback2).toHaveBeenCalledWith("key1");

            // Cleanup functions should work
            cleanup1();
            cleanup2();
        });

        it("should call callbacks on delete", () => {
            const callback = vi.fn();
            cache.onInvalidation(callback);

            cache.set("key1", "value1");
            cache.delete("key1");

            expect(callback).toHaveBeenCalledWith("key1");
        });

        it("should call callbacks on clear with undefined key", () => {
            const callback = vi.fn();
            cache.onInvalidation(callback);

            cache.set("key1", "value1");
            cache.set("key2", "value2");
            cache.clear();

            expect(callback).toHaveBeenCalledWith(undefined);
        });

        it("should call callbacks on invalidateAll with undefined key", () => {
            const callback = vi.fn();
            cache.onInvalidation(callback);

            cache.set("key1", "value1");
            cache.invalidateAll();

            expect(callback).toHaveBeenCalledWith(undefined);
        });

        it("should call callbacks on expiration", () => {
            const callback = vi.fn();
            cache.onInvalidation(callback);

            cache.set("key1", "value1", 500);

            vi.advanceTimersByTime(600);
            cache.get("key1"); // Trigger expiration check

            expect(callback).toHaveBeenCalledWith("key1");
        });

        it("should call callbacks on LRU eviction", () => {
            const callback = vi.fn();
            const smallCache = new StandardizedCache({
                name: "small-cache",
                maxSize: 1,
            });
            smallCache.onInvalidation(callback);

            smallCache.set("key1", "value1");
            smallCache.set("key2", "value2"); // Should evict key1

            expect(callback).toHaveBeenCalledWith("key1");
        });

        it("should handle callback errors gracefully", () => {
            const errorCallback = vi.fn().mockImplementation(() => {
                throw new Error("Callback error");
            });
            const goodCallback = vi.fn();

            cache.onInvalidation(errorCallback);
            cache.onInvalidation(goodCallback);

            // Should not throw even if callback throws
            expect(() => {
                cache.set("key1", "value1");
                cache.delete("key1");
            }).not.toThrow();

            expect(errorCallback).toHaveBeenCalled();
            expect(goodCallback).toHaveBeenCalled();
        });

        it("should remove callbacks with cleanup function", () => {
            const callback = vi.fn();
            const cleanup = cache.onInvalidation(callback);

            cache.set("key1", "value1");
            cache.delete("key1");
            expect(callback).toHaveBeenCalledTimes(1);

            // Remove callback
            cleanup();
            callback.mockClear();

            cache.set("key2", "value2");
            cache.delete("key2");
            expect(callback).not.toHaveBeenCalled();
        });

        it("should call callbacks on cleanup", () => {
            const callback = vi.fn();
            cache.onInvalidation(callback);

            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1000);

            vi.advanceTimersByTime(750);
            cache.cleanup();

            expect(callback).toHaveBeenCalledWith("key1");
        });
    });

    describe("Bulk Operations", () => {
        beforeEach(() => {
            cache = new StandardizedCache({
                name: "test-cache",
            });
        });

        it("should handle bulk updates with mixed TTL values", () => {
            cache.bulkUpdate([
                { key: "key1", data: "value1" },
                { key: "key2", data: "value2", ttl: 1000 },
                { key: "key3", data: "value3", ttl: 0 },
            ]);

            expect(cache.size).toBe(3);
            expect(cache.get("key1")).toBe("value1");
            expect(cache.get("key2")).toBe("value2");
            expect(cache.get("key3")).toBe("value3");
        });

        it("should handle empty bulk update", () => {
            expect(() => {
                cache.bulkUpdate([]);
            }).not.toThrow();
        });

        it("should update existing keys in bulk update", () => {
            cache.set("key1", "original1");
            cache.set("key2", "original2");

            cache.bulkUpdate([
                { key: "key1", data: "updated1" },
                { key: "key3", data: "value3" },
            ]);

            expect(cache.get("key1")).toBe("updated1");
            expect(cache.get("key2")).toBe("original2");
            expect(cache.get("key3")).toBe("value3");
        });
    });

    describe("Cleanup Functionality", () => {
        beforeEach(() => {
            cache = new StandardizedCache({
                name: "test-cache",
            });
        });

        it("should clean up all expired items", () => {
            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1000);
            cache.set("key3", "value3", 1500);
            cache.set("key4", "value4"); // Default TTL

            vi.advanceTimersByTime(1200);
            const cleaned = cache.cleanup();

            expect(cleaned).toBe(2); // key1 and key2 should be cleaned
            expect(cache.has("key1")).toBe(false);
            expect(cache.has("key2")).toBe(false);
            expect(cache.has("key3")).toBe(true);
            expect(cache.has("key4")).toBe(true);
        });

        it("should return 0 when no items need cleanup", () => {
            cache.set("key1", "value1");
            cache.set("key2", "value2");

            const cleaned = cache.cleanup();
            expect(cleaned).toBe(0);
        });

        it("should handle cleanup with no items", () => {
            const cleaned = cache.cleanup();
            expect(cleaned).toBe(0);
        });
    });

    describe("Iterator Methods", () => {
        beforeEach(() => {
            cache = new StandardizedCache({
                name: "test-cache",
            });
        });

        it("should return all valid entries", () => {
            cache.set("key1", "value1");
            cache.set("key2", "value2");
            cache.set("key3", "value3");

            const entries = [...cache.entries()];
            expect(entries).toHaveLength(3);
            expect(entries).toContainEqual(["key1", "value1"]);
            expect(entries).toContainEqual(["key2", "value2"]);
            expect(entries).toContainEqual(["key3", "value3"]);
        });

        it("should filter expired entries in iterator", () => {
            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1500);

            vi.advanceTimersByTime(1000);

            const entries = [...cache.entries()];
            expect(entries).toHaveLength(1);
            expect(entries[0]).toEqual(["key2", "value2"]);
        });

        it("should return all valid keys", () => {
            cache.set("key1", "value1");
            cache.set("key2", "value2");

            const keys = cache.keys();
            expect(keys).toContain("key1");
            expect(keys).toContain("key2");
            expect(keys).toHaveLength(2);
        });

        it("should return all valid values", () => {
            cache.set("key1", "value1");
            cache.set("key2", "value2");

            const values = cache.getAll();
            expect(values).toContain("value1");
            expect(values).toContain("value2");
            expect(values).toHaveLength(2);
        });

        it("should handle empty cache in iterators", () => {
            expect([...cache.entries()]).toHaveLength(0);
            expect(cache.keys()).toHaveLength(0);
            expect(cache.getAll()).toHaveLength(0);
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle setting same key multiple times", () => {
            cache = new StandardizedCache({ name: "test-cache" });

            cache.set("key1", "value1");
            cache.set("key1", "value2");
            cache.set("key1", "value3");

            expect(cache.get("key1")).toBe("value3");
            expect(cache.size).toBe(1);
        });

        it("should handle deleting non-existent keys", () => {
            cache = new StandardizedCache({ name: "test-cache" });

            expect(cache.delete("nonexistent")).toBe(false);
        });

        it("should handle invalidating non-existent keys", () => {
            cache = new StandardizedCache({ name: "test-cache" });

            expect(() => {
                cache.invalidate("nonexistent");
            }).not.toThrow();
        });

        it("should handle complex data types", () => {
            cache = new StandardizedCache<{ nested: { data: string[] } }>({
                name: "test-cache",
            });

            const complexData = {
                nested: {
                    data: ["item1", "item2", "item3"],
                },
            };

            cache.set("complex", complexData);
            expect(cache.get("complex")).toEqual(complexData);
        });

        it("should handle maxSize of 0", () => {
            expect(() => {
                cache = new StandardizedCache({
                    name: "test-cache",
                    maxSize: 0,
                });
                cache.set("key1", "value1");
            }).not.toThrow();
        });

        it("should handle maxSize of 1", () => {
            cache = new StandardizedCache({
                name: "test-cache",
                maxSize: 1,
            });

            cache.set("key1", "value1");
            expect(cache.size).toBe(1);

            cache.set("key2", "value2");
            expect(cache.size).toBe(1);
            expect(cache.has("key1")).toBe(false);
            expect(cache.has("key2")).toBe(true);
        });

        it("should maintain size consistency after all operations", () => {
            cache = new StandardizedCache({
                name: "test-cache",
                maxSize: 5,
            });

            // Add items
            for (let i = 0; i < 10; i++) {
                cache.set(`key${i}`, `value${i}`);
            }
            expect(cache.size).toBe(5);

            // Delete some items
            cache.delete("key5");
            cache.delete("key6");
            expect(cache.size).toBe(3);

            // Clear all
            cache.clear();
            expect(cache.size).toBe(0);

            // Add again
            cache.set("newKey", "newValue");
            expect(cache.size).toBe(1);
        });
    });

    describe("Integration Tests", () => {
        it("should work correctly with multiple operations in sequence", () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-cached", eventSpy);
            eventBus.on("internal:cache:item-deleted", eventSpy);
            eventBus.on("internal:cache:item-expired", eventSpy);

            const invalidationSpy = vi.fn();

            cache = new StandardizedCache({
                name: "integration-test",
                maxSize: 3,
                defaultTTL: 1000,
                enableStats: true,
                eventEmitter: eventBus,
            });

            cache.onInvalidation(invalidationSpy);

            // Add items
            cache.set("key1", "value1", 500);
            cache.set("key2", "value2");
            cache.set("key3", "value3");

            // Test stats
            cache.get("key1");
            cache.get("key2");
            cache.get("nonexistent");

            let stats = cache.getStats();
            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(1);
            expect(stats.size).toBe(3);

            // Test eviction
            cache.set("key4", "value4"); // Should evict oldest
            expect(cache.size).toBe(3);

            // Test expiration
            vi.advanceTimersByTime(600);
            cache.get("key1"); // Should be expired

            // Test cleanup
            const cleaned = cache.cleanup();
            expect(cleaned).toBeGreaterThanOrEqual(0);

            // Test bulk operations
            cache.bulkUpdate([
                { key: "bulk1", data: "bulkValue1" },
                { key: "bulk2", data: "bulkValue2" },
            ]);

            // Test invalidation
            cache.invalidateAll();
            expect(cache.size).toBe(0);

            // Verify events were emitted
            expect(eventSpy).toHaveBeenCalled();
            expect(invalidationSpy).toHaveBeenCalled();
        });

        it("should handle rapid operations without issues", () => {
            cache = new StandardizedCache({
                name: "rapid-test",
                maxSize: 100,
            });

            // Perform many rapid operations
            for (let i = 0; i < 1000; i++) {
                cache.set(`key${i}`, `value${i}`);
                if (i % 3 === 0) {
                    cache.get(`key${i}`);
                }
                if (i % 5 === 0) {
                    cache.delete(`key${i - 10}`);
                }
                if (i % 10 === 0) {
                    cache.cleanup();
                }
            }

            expect(cache.size).toBeLessThanOrEqual(100);
        });
    });
});
