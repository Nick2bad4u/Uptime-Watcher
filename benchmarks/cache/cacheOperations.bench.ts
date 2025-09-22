/**
 * Benchmark tests for cache operations
 *
 * @file Performance benchmarks for cache operations using real
 *   StandardizedCache implementation including cache lookups, insertions, LRU
 *   evictions, TTL cleanups, statistics tracking, and event emission.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @updated 2025-09-22 - Updated to use real StandardizedCache implementation
 *
 * @benchmark Cache
 *
 * @tags ["performance", "cache", "memory", "storage"]
 */

import { bench, describe, beforeAll } from "vitest";
import { StandardizedCache } from "../../electron/utils/cache/StandardizedCache";
import { TypedEventBus } from "../../electron/events/TypedEventBus";
import type { UptimeEvents } from "../../electron/events/eventTypes";

// Types for cache testing
interface TestCacheData {
    id: string;
    data: any;
    timestamp: number;
    size: number;
}

interface LargeCacheData {
    items: { id: number; value: string; metadata: Record<string, any> }[];
    summary: { count: number; totalSize: number };
}

// Data generators
function generateCacheKeys(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `key-${i}`);
}

function generateCacheValues(count: number): TestCacheData[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `id-${i}`,
        data: `value-${i}`,
        timestamp: Date.now(),
        size: Math.floor(Math.random() * 1000),
    }));
}

function generateLargeValues(count: number): LargeCacheData[] {
    return Array.from({ length: count }, (_, i) => ({
        items: Array.from({ length: 100 }, (_, j) => ({
            id: j,
            value: `item-${i}-${j}`,
            metadata: { type: "test", index: j },
        })),
        summary: { count: 100, totalSize: 100 * 50 },
    }));
}

// Benchmark setup
describe("Cache Operations Performance Benchmarks", () => {
    let eventBus: TypedEventBus<UptimeEvents>;
    let smallCache: StandardizedCache<TestCacheData>;
    let mediumCache: StandardizedCache<TestCacheData>;
    let largeCache: StandardizedCache<TestCacheData>;

    let smallKeys: string[];
    let mediumKeys: string[];
    let largeKeys: string[];

    let smallValues: TestCacheData[];
    let mediumValues: TestCacheData[];
    let largeValues: TestCacheData[];

    beforeAll(() => {
        // Initialize event bus
        eventBus = new TypedEventBus<UptimeEvents>("cache-benchmark");

        // Initialize caches with different sizes and real configurations
        smallCache = new StandardizedCache<TestCacheData>({
            name: "small-benchmark-cache",
            maxSize: 100,
            defaultTTL: 60_000, // 1 minute
            enableStats: true,
            eventEmitter: eventBus,
        });

        mediumCache = new StandardizedCache<TestCacheData>({
            name: "medium-benchmark-cache",
            maxSize: 1000,
            defaultTTL: 300_000, // 5 minutes
            enableStats: true,
            eventEmitter: eventBus,
        });

        largeCache = new StandardizedCache<TestCacheData>({
            name: "large-benchmark-cache",
            maxSize: 10_000,
            defaultTTL: 600_000, // 10 minutes
            enableStats: true,
            eventEmitter: eventBus,
        });

        // Generate test data
        smallKeys = generateCacheKeys(100);
        mediumKeys = generateCacheKeys(1000);
        largeKeys = generateCacheKeys(10_000);

        smallValues = generateCacheValues(100);
        mediumValues = generateCacheValues(1000);
        largeValues = generateCacheValues(10_000);

        // Pre-populate caches for read tests
        smallKeys.forEach((key, i) => smallCache.set(key, smallValues[i]));
        mediumKeys.forEach((key, i) => mediumCache.set(key, mediumValues[i]));
        largeKeys.forEach((key, i) => largeCache.set(key, largeValues[i]));
    });

    // Cache Set Operations
    bench(
        "Cache set - Small batch (100 entries)",
        () => {
            const cache = new StandardizedCache<TestCacheData>({
                name: "set-small-cache",
                maxSize: 200,
                defaultTTL: 60_000,
            });
            smallKeys.forEach((key, i) => {
                cache.set(key, smallValues[i]);
            });
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "Cache set - Medium batch (1K entries)",
        () => {
            const cache = new StandardizedCache<TestCacheData>({
                name: "set-medium-cache",
                maxSize: 2000,
                defaultTTL: 300_000,
            });
            mediumKeys.forEach((key, i) => {
                cache.set(key, mediumValues[i]);
            });
        },
        { warmupIterations: 3, iterations: 50 }
    );

    bench(
        "Cache set - Large batch (10K entries)",
        () => {
            const cache = new StandardizedCache<TestCacheData>({
                name: "set-large-cache",
                maxSize: 20_000,
                defaultTTL: 600_000,
            });
            largeKeys.forEach((key, i) => {
                cache.set(key, largeValues[i]);
            });
        },
        { warmupIterations: 2, iterations: 10 }
    );

    // Cache Get Operations
    bench(
        "Cache get - Small dataset (100 entries)",
        () => {
            smallKeys.forEach((key) => {
                smallCache.get(key);
            });
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "Cache get - Medium dataset (1K entries)",
        () => {
            mediumKeys.forEach((key) => {
                mediumCache.get(key);
            });
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "Cache get - Large dataset (10K entries)",
        () => {
            largeKeys.forEach((key) => {
                largeCache.get(key);
            });
        },
        { warmupIterations: 3, iterations: 10 }
    );

    // Cache Hit/Miss Operations
    bench(
        "Cache mixed operations - 80% hits (Medium dataset)",
        () => {
            for (let i = 0; i < 1000; i++) {
                const key =
                    Math.random() < 0.8
                        ? mediumKeys[
                              Math.floor(Math.random() * mediumKeys.length)
                          ]
                        : `miss-key-${i}`;
                mediumCache.get(key);
            }
        },
        { warmupIterations: 5, iterations: 100 }
    );

    // LRU Eviction Stress Test
    bench(
        "LRU eviction stress test - Small cache",
        () => {
            const cache = new StandardizedCache<TestCacheData>({
                name: "eviction-cache",
                maxSize: 50, // Small cache for forced evictions
                defaultTTL: 300_000,
            });

            for (let i = 0; i < 200; i++) {
                cache.set(`stress-key-${i}`, {
                    id: `stress-${i}`,
                    data: `stress-value-${i}`,
                    timestamp: Date.now(),
                    size: 100,
                });
            }
        },
        { warmupIterations: 5, iterations: 50 }
    );

    // TTL Operations
    bench(
        "TTL operations - Set with custom TTL",
        () => {
            const cache = new StandardizedCache<TestCacheData>({
                name: "ttl-cache",
                maxSize: 2000,
                defaultTTL: 300_000,
            });

            mediumKeys.forEach((key, i) => {
                cache.set(key, mediumValues[i], 10_000); // 10 second TTL
            });
        },
        { warmupIterations: 5, iterations: 100 }
    );

    // Bulk Operations
    bench(
        "Bulk cache operations - Mixed workload",
        () => {
            const cache = new StandardizedCache<TestCacheData>({
                name: "bulk-cache",
                maxSize: 5000,
                enableStats: true,
            });

            // Mix of sets, gets, and deletes
            for (let i = 0; i < 1000; i++) {
                const operation = Math.random();
                const key = `bulk-key-${i % 100}`;

                if (operation < 0.6) {
                    // 60% gets
                    cache.get(key);
                } else if (operation < 0.9) {
                    // 30% sets
                    cache.set(key, {
                        id: `bulk-${i}`,
                        data: `bulk-value-${i}`,
                        timestamp: Date.now(),
                        size: 50,
                    });
                } else {
                    // 10% deletes
                    cache.delete(key);
                }
            }
        },
        { warmupIterations: 3, iterations: 50 }
    );

    // Memory-intensive operations
    bench(
        "Large object caching - Complex data structures",
        () => {
            const cache = new StandardizedCache<LargeCacheData>({
                name: "large-object-cache",
                maxSize: 100,
                enableStats: true,
            });

            const largeValues = generateLargeValues(100);
            for (let i = 0; i < 100; i++) {
                cache.set(`large-key-${i}`, largeValues[i]);
            }
        },
        { warmupIterations: 3, iterations: 20 }
    );

    // Statistics and diagnostics
    bench(
        "Cache statistics access",
        () => {
            const stats = mediumCache.getStats();
            // Access all stat properties to ensure they're computed
            const { hits, misses, hitRatio, size } = stats;
        },
        { warmupIterations: 10, iterations: 10_000 }
    );

    // Cache invalidation patterns
    bench(
        "Cache invalidation callbacks",
        () => {
            const cache = new StandardizedCache<TestCacheData>({
                name: "invalidation-cache",
                maxSize: 1000,
            });

            // Register invalidation callback
            const cleanup = cache.onInvalidation(() => {
                // Simulated cleanup work
            });

            // Perform operations that trigger invalidation
            for (let i = 0; i < 100; i++) {
                cache.set(`inv-key-${i}`, smallValues[i % smallValues.length]);
                if (i % 10 === 0) {
                    cache.invalidate(`inv-key-${i - 5}`);
                }
            }

            cleanup(); // Remove callback
        },
        { warmupIterations: 5, iterations: 100 }
    );

    // Event emission performance
    bench(
        "Cache with event emission",
        () => {
            const cache = new StandardizedCache<TestCacheData>({
                name: "event-cache",
                maxSize: 1000,
                enableStats: true,
                eventEmitter: eventBus,
            });

            // Perform operations that emit events
            for (let i = 0; i < 100; i++) {
                cache.set(
                    `event-key-${i}`,
                    smallValues[i % smallValues.length]
                );
                cache.get(`event-key-${i}`);
                if (i % 20 === 0) {
                    cache.delete(`event-key-${i - 10}`);
                }
            }
        },
        { warmupIterations: 5, iterations: 100 }
    );
});
