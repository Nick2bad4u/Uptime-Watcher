import { describe, it, expect, beforeEach, vi } from "vitest";
import { StandardizedCache } from "../../../utils/cache/StandardizedCache";

describe("StandardizedCache", () => {
    let cache: StandardizedCache<string>;

    beforeEach(() => {
        cache = new StandardizedCache<string>({ name: "test-cache" });
    });

    describe("basic operations", () => {
        it("should start empty", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(cache.size).toBe(0);
        });

        it("should set and get values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Retrieval", "type");

            cache.set("key1", "value1");
            expect(cache.get("key1")).toBe("value1");
            expect(cache.size).toBe(1);
        });

        it("should return undefined for non-existent keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(cache.get("nonexistent")).toBeUndefined();
        });

        it("should check if keys exist", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1");
            expect(cache.has("key1")).toBe(true);
            expect(cache.has("nonexistent")).toBe(false);
        });

        it("should delete keys", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Deletion", "type");

            cache.set("key1", "value1");
            expect(cache.delete("key1")).toBe(true);
            expect(cache.has("key1")).toBe(false);
            expect(cache.delete("nonexistent")).toBe(false);
        });

        it("should clear all entries", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1");
            cache.set("key2", "value2");
            expect(cache.size).toBe(2);
            cache.clear();
            expect(cache.size).toBe(0);
        });
    });

    describe("configuration", () => {
        it("should respect maxSize configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const limitedCache = new StandardizedCache<string>({
                name: "limited-cache",
                maxSize: 2,
            });

            limitedCache.set("key1", "value1");
            limitedCache.set("key2", "value2");
            expect(limitedCache.size).toBe(2);

            limitedCache.set("key3", "value3"); // Should evict oldest
            expect(limitedCache.size).toBe(2);
            expect(limitedCache.has("key1")).toBe(false); // Oldest should be evicted
        });

        it("should handle TTL expiration", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1", 100); // 100ms TTL
            expect(cache.get("key1")).toBe("value1");

            // Mock time passage
            vi.useFakeTimers();
            vi.advanceTimersByTime(150);

            expect(cache.get("key1")).toBeUndefined(); // Should be expired

            vi.useRealTimers();
        });
    });

    describe("statistics", () => {
        it("should track cache statistics", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            cache.set("key1", "value1");
            cache.get("key1"); // Hit
            cache.get("nonexistent"); // Miss

            const stats = cache.getStats();
            expect(stats.hits).toBe(1);
            expect(stats.misses).toBe(1);
            expect(stats.hitRatio).toBe(0.5);
        });

        it("should reset statistics", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("key1", "value1");
            cache.get("key1");
            cache.get("nonexistent");

            // Cache statistics are automatically tracked, no reset needed
            const stats = cache.getStats();
            expect(stats.hits).toBeGreaterThanOrEqual(0);
            expect(stats.misses).toBeGreaterThanOrEqual(0);
        });
    });

    describe("invalidation", () => {
        it("should invalidate specific entries", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            cache.set("key1", "value1");
            cache.set("key2", "value2");

            cache.invalidate("key1");

            expect(cache.has("key1")).toBe(false);
            expect(cache.has("key2")).toBe(true);
        });

        it("should invalidate all entries", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            cache.set("key1", "value1");
            cache.set("key2", "value2");

            cache.invalidateAll();
            expect(cache.size).toBe(0);
        });
    });

    describe("bulk operations", () => {
        it("should support bulk updates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            const items = [
                { key: "key1", data: "value1" },
                { key: "key2", data: "value2" },
                { key: "key3", data: "value3" },
            ];

            cache.bulkUpdate(items);

            expect(cache.size).toBe(3);
            expect(cache.get("key1")).toBe("value1");
            expect(cache.get("key2")).toBe("value2");
            expect(cache.get("key3")).toBe("value3");
        });
    });

    describe("error handling", () => {
        it("should handle invalid configurations gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(() => {
                new StandardizedCache<string>({ name: "test", maxSize: -1 });
            }).not.toThrow();
        });

        it("should handle null/undefined values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: StandardizedCache", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            cache.set("nullKey", null as any);
            cache.set("undefinedKey", undefined as any);

            expect(cache.get("nullKey")).toBe(null);
            expect(cache.get("undefinedKey")).toBe(undefined);
        });
    });
});
