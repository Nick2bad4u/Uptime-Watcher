/**
 * Memory Usage and Cache Performance Benchmarks
 *
 * @file Performance benchmarks for memory-intensive operations in the Uptime
 *   Watcher application, focusing on cache management, memory allocation
 *   patterns, and garbage collection impact.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @benchmark Memory-Management
 *
 * @tags ["performance", "memory", "cache", "gc", "allocation"]
 */

import { bench, describe } from "vitest";

/**
 * Simplified LRU cache used to benchmark cache eviction and memory churn.
 *
 * @internal
 */
class MockLRUCache<K, V> {
    private capacity: number;
    private cache = new Map<K, V>();
    private accessOrder: K[] = [];

    /**
     * Creates an LRU cache instance with the provided capacity.
     *
     * @param capacity - Maximum number of entries retained before eviction.
     */
    constructor(capacity: number) {
        this.capacity = capacity;
    }

    /**
     * Returns the cached value for the provided key, updating recency order.
     *
     * @param key - Cache key to look up.
     *
     * @returns Cached value or `undefined` when missing.
     */
    get(key: K): V | undefined {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Move to end (most recently used)
            this.accessOrder = this.accessOrder.filter((k) => k !== key);
            this.accessOrder.push(key);
        }
        return value;
    }

    /**
     * Stores a value in the cache and evicts the least-recently-used entry when
     * capacity is exceeded.
     *
     * @param key - Cache key for the stored value.
     * @param value - Value to cache.
     */
    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            // Update existing
            this.cache.set(key, value);
            this.accessOrder = this.accessOrder.filter((k) => k !== key);
            this.accessOrder.push(key);
        } else {
            // Add new
            if (this.cache.size >= this.capacity) {
                // Remove least recently used
                const lru = this.accessOrder.shift();
                if (lru !== undefined) {
                    this.cache.delete(lru);
                }
            }
            this.cache.set(key, value);
            this.accessOrder.push(key);
        }
    }

    /**
     * Removes a cached value when present.
     *
     * @param key - Cache key to delete.
     *
     * @returns `true` when the key existed and was removed.
     */
    delete(key: K): boolean {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            this.accessOrder = this.accessOrder.filter((k) => k !== key);
            return true;
        }
        return false;
    }

    /**
     * Clears the entire cache and access order state.
     */
    clear(): void {
        this.cache.clear();
        this.accessOrder = [];
    }

    /**
     * Provides the number of cached entries.
     *
     * @returns Current cache size.
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Returns the cached keys in insertion order.
     *
     * @returns Snapshot of current cache keys.
     */
    keys(): K[] {
        return Array.from(this.cache.keys());
    }

    /**
     * Returns the cached values in insertion order.
     *
     * @returns Snapshot of current cache values.
     */
    values(): V[] {
        return Array.from(this.cache.values());
    }
}

/**
 * Utility that allocates and releases large objects to simulate memory
 * pressure.
 *
 * @internal
 */
class MemoryPressureSimulator {
    private allocatedObjects: any[] = [];

    /**
     * Allocates pseudo-random memory chunks and retains references for later
     * release.
     *
     * @param sizeInMB - Amount of memory to allocate in megabytes.
     */
    allocateMemory(sizeInMB: number): void {
        const bytesPerMB = 1024 * 1024;
        const arraySize = (sizeInMB * bytesPerMB) / 8; // 8 bytes per number
        const largeArray = Array.from({ length: arraySize }, () =>
            Math.random()
        );
        this.allocatedObjects.push(largeArray);
    }

    /**
     * Releases previously allocated objects, allowing garbage collection.
     */
    releaseMemory(): void {
        this.allocatedObjects = [];
    }

    /**
     * Estimates retained memory volume in megabytes.
     *
     * @returns Approximate memory consumption of retained objects.
     */
    getMemoryUsage(): number {
        return (
            this.allocatedObjects.reduce(
                (total, obj) => total + obj.length * 8,
                0
            ) /
            (1024 * 1024)
        );
    }
}

/**
 * Synthetic site data structure leveraged by memory benchmarks.
 *
 * @internal
 */
interface SiteData {
    identifier: string;
    name: string;
    monitors: MonitorData[];
    history: HistoryEntry[];
    metadata: Record<string, any>;
}

/**
 * Synthetic monitor data structure used by memory benchmarks.
 *
 * @internal
 */
interface MonitorData {
    id: string;
    type: string;
    url?: string;
    config: Record<string, any>;
    status: string;
    responseTime: number;
    history: HistoryEntry[];
}

/**
 * Synthetic history entry describing monitoring results.
 *
 * @internal
 */
interface HistoryEntry {
    timestamp: number;
    status: string;
    responseTime: number;
    metadata?: Record<string, any>;
}

/**
 * Generates a pseudo-random history entry for benchmarking datasets.
 *
 * @returns Synthetic {@link HistoryEntry} populated with random metadata.
 */
function generateHistoryEntry(): HistoryEntry {
    return {
        timestamp: Date.now() - Math.random() * 86_400_000,
        status: Math.random() > 0.05 ? "up" : "down",
        responseTime: Math.floor(Math.random() * 1000) + 10,
        metadata:
            Math.random() > 0.7
                ? {
                      error: `Error ${Math.floor(Math.random() * 100)}`,
                      details: `Details ${Math.floor(Math.random() * 1000)}`,
                      retryCount: Math.floor(Math.random() * 5),
                  }
                : undefined,
    };
}

/**
 * Generates synthetic monitor data with randomized configuration and history.
 *
 * @param siteIdentifier - Identifier of the site the monitor belongs to.
 * @param monitorIndex - Index used to diversify generated values.
 * @param historySize - Number of history entries to produce for the monitor.
 *
 * @returns Synthetic {@link MonitorData} instance.
 */
function generateMonitorData(
    siteIdentifier: string,
    monitorIndex: number,
    historySize: number
): MonitorData {
    const history: HistoryEntry[] = [];
    for (let i = 0; i < historySize; i++) {
        history.push(generateHistoryEntry());
    }

    return {
        id: `${siteIdentifier}-monitor-${monitorIndex}`,
        type: [
            "http",
            "ping",
            "port",
        ][monitorIndex % 3],
        url:
            monitorIndex % 3 === 0
                ? `https://example${monitorIndex}.com`
                : undefined,
        config: {
            timeout: Math.floor(Math.random() * 30_000) + 5000,
            interval: Math.floor(Math.random() * 600_000) + 60_000,
            retryAttempts: Math.floor(Math.random() * 5) + 1,
            headers:
                monitorIndex % 3 === 0
                    ? {
                          "User-Agent": "UptimeWatcher/1.0",
                          Accept: "application/json",
                      }
                    : undefined,
        },
        status: Math.random() > 0.05 ? "up" : "down",
        responseTime: Math.floor(Math.random() * 1000) + 10,
        history,
    };
}

/**
 * Generates synthetic site data with monitors and historical metadata.
 *
 * @param siteIndex - Index used to derive the site identifier and metadata.
 * @param monitorCount - Number of monitors to synthesize for the site.
 * @param historySize - History size applied to site and monitor datasets.
 *
 * @returns Synthetic {@link SiteData} instance used in benchmarks.
 */
function generateSiteData(
    siteIndex: number,
    monitorCount: number,
    historySize: number
): SiteData {
    const siteIdentifier = `site-${siteIndex}`;
    const monitors: MonitorData[] = [];
    const history: HistoryEntry[] = [];

    for (let i = 0; i < monitorCount; i++) {
        monitors.push(generateMonitorData(siteIdentifier, i, historySize));
    }

    for (let i = 0; i < historySize * 2; i++) {
        history.push(generateHistoryEntry());
    }

    return {
        identifier: siteIdentifier,
        name: `Site ${siteIndex}`,
        monitors,
        history,
        metadata: {
            createdAt: Date.now() - Math.random() * 86_400_000 * 30,
            lastUpdated: Date.now() - Math.random() * 3_600_000,
            tags: [
                `tag-${Math.floor(Math.random() * 10)}`,
                `category-${Math.floor(Math.random() * 5)}`,
            ],
            description: `Description for site ${siteIndex}`.repeat(
                Math.floor(Math.random() * 10) + 1
            ),
            configuration: {
                alertThreshold: Math.floor(Math.random() * 60) + 30,
                checkInterval: Math.floor(Math.random() * 600) + 60,
                notificationSettings: {
                    email: Math.random() > 0.5,
                    sms: Math.random() > 0.7,
                    webhook: Math.random() > 0.8,
                },
            },
        },
    };
}

describe("Memory Usage and Cache Performance Benchmarks", () => {
    describe("Small-Scale Cache Operations", () => {
        bench(
            "LRU Cache - Basic operations (100 items)",
            () => {
                const cache = new MockLRUCache<string, SiteData>(50);

                // Fill cache
                for (let i = 0; i < 100; i++) {
                    const siteData = generateSiteData(i, 5, 100);
                    cache.set(`site-${i}`, siteData);
                }

                // Access patterns
                for (let i = 0; i < 200; i++) {
                    const key = `site-${Math.floor(Math.random() * 100)}`;
                    cache.get(key);

                    if (i % 10 === 0) {
                        const newSite = generateSiteData(i + 1000, 3, 50);
                        cache.set(`site-${i + 1000}`, newSite);
                    }
                }
            },
            { iterations: 100 }
        );

        bench(
            "Memory allocation patterns - Small objects",
            () => {
                const objects: any[] = [];

                // Allocate many small objects
                for (let i = 0; i < 1000; i++) {
                    objects.push({
                        id: `obj-${i}`,
                        timestamp: Date.now(),
                        data: Array.from({ length: 100 }).fill(Math.random()),
                        metadata: {
                            created: Date.now(),
                            type: "small-object",
                            index: i,
                        },
                    });
                }

                // Access and modify objects
                for (let i = 0; i < 500; i++) {
                    const obj =
                        objects[Math.floor(Math.random() * objects.length)];
                    obj.data[Math.floor(Math.random() * obj.data.length)] =
                        Math.random();
                    obj.metadata.lastAccessed = Date.now();
                }
            },
            { iterations: 200 }
        );

        bench(
            "Cache miss handling and reconstruction",
            () => {
                const cache = new MockLRUCache<string, SiteData>(20);

                for (let i = 0; i < 100; i++) {
                    const key = `site-${i}`;
                    let data = cache.get(key);

                    if (!data) {
                        // Cache miss - generate new data
                        data = generateSiteData(i, 3, 50);
                        cache.set(key, data);
                    }

                    // Simulate data usage
                    data.metadata.lastAccessed = Date.now();
                }
            },
            { iterations: 150 }
        );
    });

    describe("Medium-Scale Cache Operations", () => {
        bench(
            "LRU Cache - Medium load (1000 items)",
            () => {
                const cache = new MockLRUCache<string, SiteData>(200);

                // Fill cache with medium-sized objects
                for (let i = 0; i < 1000; i++) {
                    const siteData = generateSiteData(i, 10, 500);
                    cache.set(`site-${i}`, siteData);
                }

                // Simulate realistic access patterns
                for (let i = 0; i < 2000; i++) {
                    // 80% access existing items
                    if (Math.random() < 0.8) {
                        const key = `site-${Math.floor(Math.random() * 1000)}`;
                        const data = cache.get(key);
                        if (data) {
                            // Simulate data modification
                            data.metadata.lastUpdated = Date.now();
                        }
                    } else {
                        // 20% add new items
                        const newSite = generateSiteData(i + 2000, 8, 300);
                        cache.set(`site-${i + 2000}`, newSite);
                    }
                }
            },
            { iterations: 50 }
        );

        bench(
            "Memory-intensive data processing",
            () => {
                const sites: SiteData[] = [];

                // Generate large dataset
                for (let i = 0; i < 100; i++) {
                    sites.push(generateSiteData(i, 15, 1000));
                }

                // Process data (memory intensive operations)
                const processedData = sites.map((site) => {
                    const aggregatedHistory = site.monitors.reduce(
                        (acc, monitor) => acc.concat(monitor.history),
                        [] as HistoryEntry[]
                    );

                    const uptimeStats = aggregatedHistory.reduce(
                        (stats, entry) => {
                            if (entry.status === "up") {
                                stats.uptime++;
                            } else {
                                stats.downtime++;
                            }
                            stats.totalResponseTime += entry.responseTime;
                            return stats;
                        },
                        { uptime: 0, downtime: 0, totalResponseTime: 0 }
                    );

                    return {
                        siteIdentifier: site.identifier,
                        stats: uptimeStats,
                        processedAt: Date.now(),
                    };
                });

                // Additional processing that creates more objects
                const summary = processedData.reduce(
                    (acc, data) => {
                        acc.totalSites++;
                        acc.totalUptime += data.stats.uptime;
                        acc.totalDowntime += data.stats.downtime;
                        acc.averageResponseTime += data.stats.totalResponseTime;
                        return acc;
                    },
                    {
                        totalSites: 0,
                        totalUptime: 0,
                        totalDowntime: 0,
                        averageResponseTime: 0,
                    }
                );
            },
            { iterations: 20 }
        );

        bench(
            "Cache eviction and memory pressure",
            () => {
                const cache = new MockLRUCache<string, SiteData>(50);
                const memorySimulator = new MemoryPressureSimulator();

                // Create memory pressure
                memorySimulator.allocateMemory(50); // 50MB

                // Fill cache under memory pressure
                for (let i = 0; i < 200; i++) {
                    const siteData = generateSiteData(i, 12, 800);
                    cache.set(`site-${i}`, siteData);

                    // Occasionally check cache size and clear if needed
                    if (i % 25 === 0 && cache.size() > 40) {
                        // Simulate manual cache cleanup under pressure
                        const keys = cache.keys();
                        for (let j = 0; j < 10 && keys.length > 0; j++) {
                            cache.delete(keys[j]);
                        }
                    }
                }

                // Release memory pressure
                memorySimulator.releaseMemory();
            },
            { iterations: 10 }
        );
    });

    describe("Large-Scale Cache Operations", () => {
        bench(
            "LRU Cache - Large dataset (5000 items)",
            () => {
                const cache = new MockLRUCache<string, SiteData>(1000);

                // Fill cache with large objects
                for (let i = 0; i < 5000; i++) {
                    const siteData = generateSiteData(i, 20, 2000);
                    cache.set(`site-${i}`, siteData);
                }

                // Heavy access patterns
                for (let i = 0; i < 10_000; i++) {
                    const key = `site-${Math.floor(Math.random() * 5000)}`;
                    cache.get(key);
                }
            },
            { iterations: 5 }
        );

        bench(
            "Memory allocation stress test",
            () => {
                const largeObjects: any[] = [];

                // Allocate large objects
                for (let i = 0; i < 100; i++) {
                    const largeObject = {
                        id: `large-${i}`,
                        data: Array.from({ length: 10_000 })
                            .fill(null)
                            .map(() => ({
                                timestamp: Date.now(),
                                value: Math.random(),
                                metadata: {
                                    index: Math.floor(Math.random() * 1000),
                                    category: `category-${Math.floor(Math.random() * 10)}`,
                                    tags: Array.from({ length: 5 })
                                        .fill(null)
                                        .map(
                                            () =>
                                                `tag-${Math.floor(Math.random() * 100)}`
                                        ),
                                },
                            })),
                        created: Date.now(),
                    };
                    largeObjects.push(largeObject);
                }

                // Process large objects
                for (const obj of largeObjects) {
                    obj.processed = obj.data.map((item) => ({
                        ...item,
                        processed: true,
                        processedAt: Date.now(),
                    }));
                }
            },
            { iterations: 3 }
        );

        bench(
            "Cache coherency with concurrent operations",
            () => {
                const primaryCache = new MockLRUCache<string, SiteData>(500);
                const secondaryCache = new MockLRUCache<string, any>(300);

                // Simulate concurrent cache operations
                for (let i = 0; i < 1000; i++) {
                    const siteData = generateSiteData(i, 15, 1000);
                    primaryCache.set(`site-${i}`, siteData);

                    // Derived data in secondary cache
                    const derivedData = {
                        siteIdentifier: siteData.identifier,
                        summary: {
                            monitorCount: siteData.monitors.length,
                            historyCount: siteData.history.length,
                            lastUpdate: siteData.metadata.lastUpdated,
                        },
                        computedAt: Date.now(),
                    };
                    secondaryCache.set(`summary-${i}`, derivedData);

                    // Simulate cache invalidation
                    if (i % 50 === 0) {
                        // Invalidate related entries
                        for (let j = Math.max(0, i - 25); j < i; j++) {
                            secondaryCache.delete(`summary-${j}`);
                        }
                    }
                }
            },
            { iterations: 10 }
        );
    });

    describe("Memory Leak Detection and Prevention", () => {
        bench(
            "Circular reference handling",
            () => {
                const objects: any[] = [];

                // Create objects with potential circular references
                for (let i = 0; i < 1000; i++) {
                    const obj = {
                        id: i,
                        data: Array.from({ length: 100 }).fill(Math.random()),
                        parent: null as any,
                        children: [] as any[],
                    };

                    if (i > 0) {
                        const parent =
                            objects[Math.floor(Math.random() * objects.length)];
                        obj.parent = parent;
                        parent.children.push(obj);
                    }

                    objects.push(obj);
                }

                // Break circular references for cleanup
                for (const obj of objects) {
                    obj.parent = null;
                    obj.children = [];
                }
            },
            { iterations: 50 }
        );

        bench(
            "WeakMap vs Map for object references",
            () => {
                const regularMap = new Map<any, any>();
                const weakMap = new WeakMap<any, any>();
                const objects: any[] = [];

                // Create objects
                for (let i = 0; i < 1000; i++) {
                    const obj = { id: i, data: Math.random() };
                    objects.push(obj);

                    // Store in both maps
                    regularMap.set(obj, {
                        metadata: `meta-${i}`,
                        timestamp: Date.now(),
                    });
                    weakMap.set(obj, {
                        metadata: `meta-${i}`,
                        timestamp: Date.now(),
                    });
                }

                // Access patterns
                for (let i = 0; i < 2000; i++) {
                    const obj =
                        objects[Math.floor(Math.random() * objects.length)];
                    regularMap.get(obj);
                    weakMap.get(obj);
                }

                // Cleanup regular map
                regularMap.clear();
            },
            { iterations: 50 }
        );

        bench(
            "Event listener cleanup simulation",
            () => {
                const eventTargets: any[] = [];
                const listeners: Function[] = [];

                // Simulate event listener creation
                for (let i = 0; i < 500; i++) {
                    const target = {
                        id: i,
                        listeners: new Set<Function>(),
                        addEventListener: function (listener: Function) {
                            this.listeners.add(listener);
                        },
                        removeEventListener: function (listener: Function) {
                            this.listeners.delete(listener);
                        },
                    };

                    const listener = () => {
                        // Simulate event handling
                        Math.random();
                    };

                    target.addEventListener(listener);
                    eventTargets.push(target);
                    listeners.push(listener);
                }

                // Cleanup listeners
                for (const [i, eventTarget] of eventTargets.entries()) {
                    eventTarget.removeEventListener(listeners[i]);
                }
            },
            { iterations: 100 }
        );
    });

    describe("Garbage Collection Impact", () => {
        bench(
            "Frequent allocation and deallocation",
            () => {
                for (let i = 0; i < 1000; i++) {
                    // Allocate temporary objects
                    const temp = {
                        data: Array.from({ length: 1000 }).fill(Math.random()),
                        created: Date.now(),
                        id: i,
                    };

                    // Use the object briefly
                    temp.data.sort();
                    temp.data.reverse();

                    // Let it go out of scope for GC
                }
            },
            { iterations: 100 }
        );

        bench(
            "Object pooling vs new allocation",
            () => {
                // Object pool simulation
                const pool: any[] = [];

                function getFromPool() {
                    if (pool.length > 0) {
                        const obj = pool.pop();
                        // Reset object
                        obj.data = Array.from({ length: 100 }).fill(
                            Math.random()
                        );
                        obj.used = true;
                        return obj;
                    }
                    return {
                        data: Array.from({ length: 100 }).fill(Math.random()),
                        used: true,
                        pooled: true,
                    };
                }

                function returnToPool(obj: any) {
                    obj.used = false;
                    if (pool.length < 50) {
                        pool.push(obj);
                    }
                }

                // Use object pool
                for (let i = 0; i < 1000; i++) {
                    const obj = getFromPool();

                    // Simulate usage
                    obj.data.sort();

                    if (Math.random() > 0.3) {
                        returnToPool(obj);
                    }
                }
            },
            { iterations: 50 }
        );

        bench(
            "Large object vs many small objects",
            () => {
                // Test 1: Many small objects
                const smallObjects: any[] = [];
                for (let i = 0; i < 10_000; i++) {
                    smallObjects.push({
                        id: i,
                        value: Math.random(),
                        timestamp: Date.now(),
                    });
                }

                // Test 2: Few large objects
                const largeObjects: any[] = [];
                for (let i = 0; i < 10; i++) {
                    largeObjects.push({
                        id: i,
                        data: Array.from({ length: 1000 })
                            .fill(null)
                            .map((_, j) => ({
                                index: j,
                                value: Math.random(),
                                timestamp: Date.now(),
                            })),
                    });
                }

                // Process both types
                smallObjects.forEach((obj) => (obj.processed = true));
                largeObjects.forEach((obj) =>
                    obj.data.forEach((item) => (item.processed = true))
                );
            },
            { iterations: 20 }
        );
    });
});
