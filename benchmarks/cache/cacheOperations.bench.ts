/**
 * Benchmark tests for cache operations
 *
 * @file Performance benchmarks for cache operations including cache lookups,
 *   insertions, LRU evictions, and TTL cleanups.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @benchmark Cache
 *
 * @tags ["performance", "cache", "memory", "storage"]
 */

import { bench, describe, beforeAll } from "vitest";

// Mock cache implementation for benchmarking
interface CacheEntry<T> {
    lastAccessed: number;
    timestamp: number;
    ttl: number | undefined;
    value: T;
}

class BenchmarkCache<K, V> {
    private cache = new Map<K, CacheEntry<V>>();
    private maxSize: number;
    private defaultTtl: number;

    constructor(maxSize = 1000, defaultTtl = 300000) {
        this.maxSize = maxSize;
        this.defaultTtl = defaultTtl;
    }

    set(key: K, value: V, ttl?: number): void {
        const now = Date.now();
        const entry: CacheEntry<V> = {
            lastAccessed: now,
            timestamp: now,
            ttl: ttl ?? this.defaultTtl,
            value,
        };

        // LRU eviction if at max size
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLru();
        }

        this.cache.set(key, entry);
    }

    get(key: K): V | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        const now = Date.now();

        // Check TTL expiration
        if (entry.ttl && now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return undefined;
        }

        // Update access time for LRU
        entry.lastAccessed = now;
        return entry.value;
    }

    has(key: K): boolean {
        return this.get(key) !== undefined;
    }

    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }

    private evictLru(): void {
        let oldestKey: K | undefined;
        let oldestTime = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey !== undefined) {
            this.cache.delete(oldestKey);
        }
    }

    cleanup(): number {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.ttl && now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                removed++;
            }
        }

        return removed;
    }
}

// Data generators
function generateCacheKeys(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `key-${i}`);
}

function generateCacheValues(count: number): object[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        data: `value-${i}`,
        timestamp: Date.now(),
        metadata: {
            type: "benchmark",
            size: Math.floor(Math.random() * 1000),
        },
    }));
}

// Benchmark setup
describe("Cache Operations Performance Benchmarks", () => {
    let smallCache: BenchmarkCache<string, object>;
    let mediumCache: BenchmarkCache<string, object>;
    let largeCache: BenchmarkCache<string, object>;

    let smallKeys: string[];
    let mediumKeys: string[];
    let largeKeys: string[];

    let smallValues: object[];
    let mediumValues: object[];
    let largeValues: object[];

    beforeAll(() => {
        // Initialize caches with different sizes
        smallCache = new BenchmarkCache(100, 60000); // 100 entries, 1 min TTL
        mediumCache = new BenchmarkCache(1000, 300000); // 1K entries, 5 min TTL
        largeCache = new BenchmarkCache(10000, 600000); // 10K entries, 10 min TTL

        // Generate test data
        smallKeys = generateCacheKeys(100);
        mediumKeys = generateCacheKeys(1000);
        largeKeys = generateCacheKeys(10000);

        smallValues = generateCacheValues(100);
        mediumValues = generateCacheValues(1000);
        largeValues = generateCacheValues(10000);

        // Pre-populate caches for read tests
        smallKeys.forEach((key, i) => smallCache.set(key, smallValues[i]));
        mediumKeys.forEach((key, i) => mediumCache.set(key, mediumValues[i]));
        largeKeys.forEach((key, i) => largeCache.set(key, largeValues[i]));
    });

    // Cache Set Operations
    bench("Cache set - Small batch (100 entries)", () => {
        const cache = new BenchmarkCache<string, object>(200);
        smallKeys.forEach((key, i) => {
            cache.set(key, smallValues[i]);
        });
    });

    bench("Cache set - Medium batch (1K entries)", () => {
        const cache = new BenchmarkCache<string, object>(2000);
        mediumKeys.forEach((key, i) => {
            cache.set(key, mediumValues[i]);
        });
    });

    bench("Cache set - Large batch (10K entries)", () => {
        const cache = new BenchmarkCache<string, object>(20000);
        largeKeys.forEach((key, i) => {
            cache.set(key, largeValues[i]);
        });
    });

    // Cache Get Operations
    bench("Cache get - Small dataset (100 entries)", () => {
        smallKeys.forEach((key) => {
            smallCache.get(key);
        });
    });

    bench("Cache get - Medium dataset (1K entries)", () => {
        mediumKeys.forEach((key) => {
            mediumCache.get(key);
        });
    });

    bench("Cache get - Large dataset (10K entries)", () => {
        largeKeys.forEach((key) => {
            largeCache.get(key);
        });
    });

    // Cache Hit/Miss Operations
    bench("Cache mixed operations - 80% hits (Medium dataset)", () => {
        for (let i = 0; i < 1000; i++) {
            const key =
                Math.random() < 0.8
                    ? mediumKeys[Math.floor(Math.random() * mediumKeys.length)]
                    : `miss-key-${i}`;
            mediumCache.get(key);
        }
    });

    // LRU Eviction Stress Test
    bench("LRU eviction stress test - Small cache", () => {
        const cache = new BenchmarkCache<string, object>(50); // Small cache for forced evictions

        for (let i = 0; i < 200; i++) {
            cache.set(`stress-key-${i}`, { data: `stress-value-${i}` });
        }
    });

    // TTL Cleanup Operations
    bench("TTL cleanup - Medium dataset", () => {
        const cache = new BenchmarkCache<string, object>(2000, 1); // Very short TTL

        // Set entries with expired TTL
        mediumKeys.forEach((key, i) => {
            cache.set(key, mediumValues[i], 1);
        });

        // Wait for expiration (simulated)
        setTimeout(() => {
            cache.cleanup();
        }, 2);
    });

    // Bulk Operations
    bench("Bulk cache operations - Mixed workload", () => {
        const cache = new BenchmarkCache<string, object>(5000);

        // Mix of sets, gets, and deletes
        for (let i = 0; i < 1000; i++) {
            const operation = Math.random();
            const key = `bulk-key-${i % 100}`;

            if (operation < 0.6) {
                // 60% gets
                cache.get(key);
            } else if (operation < 0.9) {
                // 30% sets
                cache.set(key, { data: `bulk-value-${i}` });
            } else {
                // 10% deletes
                cache.delete(key);
            }
        }
    });

    // Memory-intensive operations
    bench("Large object caching - Complex data structures", () => {
        const cache = new BenchmarkCache<string, object>(100);

        for (let i = 0; i < 100; i++) {
            const largeObject = {
                id: i,
                data: Array.from({ length: 1000 }, (_, j) => ({
                    index: j,
                    value: `item-${i}-${j}`,
                    metadata: {
                        timestamp: Date.now(),
                        random: Math.random(),
                    },
                })),
                summary: {
                    count: 1000,
                    created: new Date(),
                    checksum: `checksum-${i}`,
                },
            };

            cache.set(`large-key-${i}`, largeObject);
        }
    });

    // Cache size and memory management
    bench("Cache size management - Dynamic sizing", () => {
        const cache = new BenchmarkCache<string, object>(1000);

        // Fill cache to capacity
        for (let i = 0; i < 1000; i++) {
            cache.set(`size-key-${i}`, { data: `value-${i}` });
        }

        // Check size and perform cleanup
        cache.size();
        cache.cleanup();

        // Add more entries to trigger eviction
        for (let i = 1000; i < 1200; i++) {
            cache.set(`size-key-${i}`, { data: `value-${i}` });
        }
    });
});
