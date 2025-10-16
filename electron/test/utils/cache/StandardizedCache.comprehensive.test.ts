import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { StandardizedCache } from "../../../utils/cache/StandardizedCache";
import { TypedEventBus } from "../../../events/TypedEventBus";
import type { UptimeEvents } from "../../../events/eventTypes.js";

const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
};

/**
 * Comprehensive test suite for StandardizedCache
 *
 * This test suite aims for 98% branch coverage by testing:
 *
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
        it("should use default configuration values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache = new StandardizedCache({ name: "test-cache" });

            expect(cache.size).toBe(0);
            const stats = cache.getStats();
            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
            expect(stats.hitRatio).toBe(0);
            expect(stats.size).toBe(0);
        });

        it("should respect custom cache TTL", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache = new StandardizedCache({
                name: "test-cache",
                ttl: 1000,
            });

            cache.set("key1", "value1");

            // Should exist initially
            expect(cache.get("key1")).toBe("value1");

            // Should expire after TTL
            vi.advanceTimersByTime(1001);
            expect(cache.get("key1")).toBeUndefined();
        });

        it("should handle cache TTL of 0 (no expiration)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache = new StandardizedCache({
                name: "test-cache",
                ttl: 0,
            });

            cache.set("key1", "value1");

            // Should not expire even after long time
            vi.advanceTimersByTime(999_999);
            expect(cache.get("key1")).toBe("value1");
        });

        it("should handle negative cache TTL (no expiration)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache = new StandardizedCache({
                name: "test-cache",
                ttl: -1000,
            });

            cache.set("key1", "value1");

            // Should not expire even after long time
            vi.advanceTimersByTime(999_999);
            expect(cache.get("key1")).toBe("value1");
        });

        it("should respect custom maxSize", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
            expect(cache.has("key1")).toBeFalsy(); // Oldest should be evicted
            expect(cache.has("key2")).toBeTruthy();
            expect(cache.has("key3")).toBeTruthy();
        });

        it("should handle enableStats = false", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should work with event emitter", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-cached", eventSpy);

            cache = new StandardizedCache({
                name: "test-cache",
                eventEmitter: eventBus,
            });

            cache.set("key1", "value1");

            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    timestamp: expect.any(Number),
                    key: "key1",
                    ttl: 300_000, // Default TTL
                })
            );
        });

        it("should emit undefined TTL when cache TTL is disabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-cached", eventSpy);

            cache = new StandardizedCache({
                name: "test-cache",
                eventEmitter: eventBus,
                ttl: 0,
            });

            cache.set("key1", "value1");

            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    key: "key1",
                    timestamp: expect.any(Number),
                    ttl: undefined,
                })
            );
        });

        it("should work without event emitter", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

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
                ttl: 1000,
            });
        });

        it("should respect item-specific TTL overriding default", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1", 500); // Custom TTL
            cache.set("key2", "value2"); // Default TTL

            // After 600ms, key1 should be expired but key2 should still exist
            vi.advanceTimersByTime(600);
            expect(cache.get("key1")).toBeUndefined();
            expect(cache.get("key2")).toBe("value2");
        });

        it("should handle TTL of 0 on individual items (no expiration)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1", 0);

            vi.advanceTimersByTime(999_999);
            expect(cache.get("key1")).toBe("value1");
        });

        it("should handle negative TTL on individual items (no expiration)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1", -500);

            vi.advanceTimersByTime(999_999);
            expect(cache.get("key1")).toBe("value1");
        });

        it("should emit expiration event when item expires", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-expired", eventSpy);

            cache = new StandardizedCache({
                name: "test-cache",
                ttl: 1000,
                eventEmitter: eventBus,
            });

            cache.set("key1", "value1", 500);

            vi.advanceTimersByTime(600);
            cache.get("key1"); // Should trigger expiration check

            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    timestamp: expect.any(Number),
                    key: "key1",
                })
            );
        });

        it("should handle expired items in has() method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1", 500);

            expect(cache.has("key1")).toBeTruthy();

            vi.advanceTimersByTime(600);
            expect(cache.has("key1")).toBeFalsy();
        });

        it("should clean up expired items in entries() method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1500);

            vi.advanceTimersByTime(600);

            const entries = Array.from(cache.entries());
            expect(entries).toHaveLength(1);
            expect(entries[0]).toEqual(["key2", "value2"]);
        });

        it("should clean up expired items in getAll() method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Retrieval", "type");

            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1500);

            vi.advanceTimersByTime(600);

            const values = cache.getAll();
            expect(values).toHaveLength(1);
            expect(values[0]).toBe("value2");
        });

        it("should clean up expired items in keys() method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should evict least recently used item when at capacity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

            await flushMicrotasks();

            expect(cache.size).toBe(3);
            expect(cache.has("key1")).toBeFalsy(); // Should be evicted (oldest)
            expect(cache.has("key2")).toBeTruthy();
            expect(cache.has("key3")).toBeTruthy();
            expect(cache.has("key4")).toBeTruthy();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    timestamp: expect.any(Number),
                    key: "key1",
                    reason: "lru",
                })
            );
        });

        it("should not evict when updating existing key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Fill cache to capacity
            cache.set("key1", "value1");
            cache.set("key2", "value2");
            cache.set("key3", "value3");
            expect(cache.size).toBe(3);

            // Update existing key - should not trigger eviction
            cache.set("key1", "new_value1");

            expect(cache.size).toBe(3);
            expect(cache.get("key1")).toBe("new_value1");
            expect(cache.has("key2")).toBeTruthy();
            expect(cache.has("key3")).toBeTruthy();
        });

        it("should handle eviction when cache is empty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

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

        it("should track hit/miss statistics accurately", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle hit ratio calculation with no accesses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const stats = cache.getStats();
            expect(stats.hitRatio).toBe(0);
            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
        });

        it("should update lastAccess timestamp on hits", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            cache.set("key1", "value1");

            const initialStats = cache.getStats();
            expect(initialStats.lastAccess).toBeUndefined();

            vi.advanceTimersByTime(1000);
            cache.get("key1");

            const updatedStats = cache.getStats();
            expect(updatedStats.lastAccess).toBeDefined();
            expect(updatedStats.lastAccess).toBeGreaterThan(0);
        });

        it("should not update lastAccess on misses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            cache.get("nonexistent");

            const stats = cache.getStats();
            expect(stats.lastAccess).toBeUndefined();
            expect(stats.misses).toBe(1);
        });

        it("should track entry hit counts", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1");

            // Access multiple times
            cache.get("key1");
            cache.get("key1");
            cache.get("key1");

            // We can't directly access entry hit counts, but we can verify overall stats
            const stats = cache.getStats();
            expect(stats.hits).toBe(3);
        });

        it("should return snapshot of stats, not live reference", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should emit item-cached event on set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-cached", eventSpy);

            cache.set("key1", "value1", 2000);

            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    timestamp: expect.any(Number),
                    key: "key1",
                    ttl: 2000,
                })
            );
        });

        it("should emit item-deleted event on delete", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Deletion", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-deleted", eventSpy);

            cache.set("key1", "value1");
            cache.delete("key1");

            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    timestamp: expect.any(Number),
                    key: "key1",
                })
            );
        });

        it("should emit cleared event on clear", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:cleared", eventSpy);

            cache.set("key1", "value1");
            cache.set("key2", "value2");
            cache.clear();

            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    timestamp: expect.any(Number),
                    itemCount: 2,
                })
            );
        });

        it("should emit bulk-updated event on bulkUpdate", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:bulk-updated", eventSpy);

            cache.bulkUpdate([
                { key: "key1", data: "value1" },
                { key: "key2", data: "value2" },
                { key: "key3", data: "value3" },
            ]);

            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    timestamp: expect.any(Number),
                    itemCount: 3,
                })
            );
        });

        it("should emit item-invalidated event on invalidate", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-invalidated", eventSpy);

            cache.set("key1", "value1");
            cache.invalidate("key1");

            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    timestamp: expect.any(Number),
                    key: "key1",
                })
            );
        });

        it("should emit all-invalidated event on invalidateAll", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:all-invalidated", eventSpy);

            cache.set("key1", "value1");
            cache.set("key2", "value2");
            cache.invalidateAll();

            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    timestamp: expect.any(Number),
                    itemCount: 2,
                })
            );
        });

        it("should emit cleanup-completed event on cleanup", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:cleanup-completed", eventSpy);

            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1000);

            vi.advanceTimersByTime(750);
            const cleaned = cache.cleanup();

            expect(cleaned).toBe(1);

            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    cacheName: "test-cache",
                    timestamp: expect.any(Number),
                    itemCount: 1,
                })
            );
        });
    });

    describe("Invalidation Callbacks", () => {
        beforeEach(() => {
            cache = new StandardizedCache({
                name: "test-cache",
            });
        });

        it("should register and call invalidation callbacks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

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

        it("should call callbacks on delete", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Deletion", "type");

            const callback = vi.fn();
            cache.onInvalidation(callback);

            cache.set("key1", "value1");
            cache.delete("key1");

            expect(callback).toHaveBeenCalledWith("key1");
        });

        it("should call callbacks on clear with undefined key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const callback = vi.fn();
            cache.onInvalidation(callback);

            cache.set("key1", "value1");
            cache.set("key2", "value2");
            cache.clear();

            expect(callback).toHaveBeenCalledWith(undefined);
        });

        it("should call callbacks on invalidateAll with undefined key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const callback = vi.fn();
            cache.onInvalidation(callback);

            cache.set("key1", "value1");
            cache.invalidateAll();

            expect(callback).toHaveBeenCalledWith(undefined);
        });

        it("should call callbacks on expiration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const callback = vi.fn();
            cache.onInvalidation(callback);

            cache.set("key1", "value1", 500);

            vi.advanceTimersByTime(600);
            cache.get("key1"); // Trigger expiration check

            expect(callback).toHaveBeenCalledWith("key1");
        });

        it("should call callbacks on LRU eviction", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle callback errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should remove callbacks with cleanup function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Deletion", "type");

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

        it("should call callbacks on cleanup", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle bulk updates with mixed TTL values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

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

        it("should handle empty bulk update", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            expect(() => {
                cache.bulkUpdate([]);
            }).not.toThrow();
        });

        it("should update existing keys in bulk update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

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

        it("should clean up all expired items", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1000);
            cache.set("key3", "value3", 1500);
            cache.set("key4", "value4"); // Default TTL

            vi.advanceTimersByTime(1200);
            const cleaned = cache.cleanup();

            expect(cleaned).toBe(2); // Key1 and key2 should be cleaned
            expect(cache.has("key1")).toBeFalsy();
            expect(cache.has("key2")).toBeFalsy();
            expect(cache.has("key3")).toBeTruthy();
            expect(cache.has("key4")).toBeTruthy();
        });

        it("should return 0 when no items need cleanup", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1");
            cache.set("key2", "value2");

            const cleaned = cache.cleanup();
            expect(cleaned).toBe(0);
        });

        it("should handle cleanup with no items", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should return all valid entries", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1");
            cache.set("key2", "value2");
            cache.set("key3", "value3");

            const entries = Array.from(cache.entries());
            expect(entries).toHaveLength(3);
            expect(entries).toContainEqual(["key1", "value1"]);
            expect(entries).toContainEqual(["key2", "value2"]);
            expect(entries).toContainEqual(["key3", "value3"]);
        });

        it("should filter expired entries in iterator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1", 500);
            cache.set("key2", "value2", 1500);

            vi.advanceTimersByTime(1000);

            const entries = Array.from(cache.entries());
            expect(entries).toHaveLength(1);
            expect(entries[0]).toEqual(["key2", "value2"]);
        });

        it("should return all valid keys", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1");
            cache.set("key2", "value2");

            const keys = cache.keys();
            expect(keys).toContain("key1");
            expect(keys).toContain("key2");
            expect(keys).toHaveLength(2);
        });

        it("should return all valid values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1");
            cache.set("key2", "value2");

            const values = cache.getAll();
            expect(values).toContain("value1");
            expect(values).toContain("value2");
            expect(values).toHaveLength(2);
        });

        it("should handle empty cache in iterators", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            expect(Array.from(cache.entries())).toHaveLength(0);
            expect(cache.keys()).toHaveLength(0);
            expect(cache.getAll()).toHaveLength(0);
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle setting same key multiple times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache = new StandardizedCache({ name: "test-cache" });

            cache.set("key1", "value1");
            cache.set("key1", "value2");
            cache.set("key1", "value3");

            expect(cache.get("key1")).toBe("value3");
            expect(cache.size).toBe(1);
        });

        it("should handle deleting non-existent keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache = new StandardizedCache({ name: "test-cache" });

            expect(cache.delete("nonexistent")).toBeFalsy();
        });

        it("should handle invalidating non-existent keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache = new StandardizedCache({ name: "test-cache" });

            expect(() => {
                cache.invalidate("nonexistent");
            }).not.toThrow();
        });

        it("should handle complex data types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache = new StandardizedCache<{ nested: { data: string[] } }>({
                name: "test-cache",
            });

            const complexData = {
                nested: {
                    data: [
                        "item1",
                        "item2",
                        "item3",
                    ],
                },
            };

            cache.set("complex", complexData);
            expect(cache.get("complex")).toEqual(complexData);
        });

        it("should handle maxSize of 0", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(() => {
                cache = new StandardizedCache({
                    name: "test-cache",
                    maxSize: 0,
                });
                cache.set("key1", "value1");
            }).not.toThrow();
        });

        it("should handle maxSize of 1", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache = new StandardizedCache({
                name: "test-cache",
                maxSize: 1,
            });

            cache.set("key1", "value1");
            expect(cache.size).toBe(1);

            cache.set("key2", "value2");
            expect(cache.size).toBe(1);
            expect(cache.has("key1")).toBeFalsy();
            expect(cache.has("key2")).toBeTruthy();
        });

        it("should maintain size consistency after all operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
        it("should work correctly with multiple operations in sequence", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const eventSpy = vi.fn();
            eventBus.on("internal:cache:item-cached", eventSpy);
            eventBus.on("internal:cache:item-deleted", eventSpy);
            eventBus.on("internal:cache:item-expired", eventSpy);

            const invalidationSpy = vi.fn();

            cache = new StandardizedCache({
                name: "integration-test",
                maxSize: 3,
                ttl: 1000,
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

            const stats = cache.getStats();
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
            await flushMicrotasks();

            expect(eventSpy).toHaveBeenCalled();
            expect(invalidationSpy).toHaveBeenCalled();
        });

        it("should handle rapid operations without issues", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
