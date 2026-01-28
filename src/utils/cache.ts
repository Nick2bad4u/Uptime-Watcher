/**
 * Unified, in-memory caching utilities with optional TTL (time-to-live)
 * semantics and a simple LRU (least-recently-used) eviction strategy.
 *
 * @remarks
 * This module provides a small, type-safe cache implementation backed by a
 * {@link Map} and metadata objects that track creation and last-access times. It
 * is intended for short-lived, in-memory caching of computed values and small
 * objects. The eviction strategy scans entries for the oldest `lastAccessed`
 * timestamp when `maxSize` is reached (O(n) selection).
 *
 * The module also exposes a set of preconfigured caches (`AppCaches`) and a
 * helper (`getCachedOrFetch`) to compute and cache values on cache misses.
 *
 * @example
 *
 * ```ts
 * import { AppCaches, getCachedOrFetch } from "./cache";
 *
 * // direct set/get
 * AppCaches.general.set("user-preference", { theme: "dark" });
 * const pref = AppCaches.general.get("user-preference");
 *
 * // compute-on-miss with TTL override
 * const value = await getCachedOrFetch(
 *     AppCaches.monitorTypes,
 *     "config",
 *     async () => fetchConfig(),
 *     30_000
 * );
 * ```
 *
 * @public
 */

import type { CacheValue } from "@shared/types/configTypes";

import { CACHE_CONFIG } from "@shared/constants/cacheConfig";
import { castUnchecked } from "@shared/utils/typeHelpers";

import { logger } from "../services/logger";

/**
 * In-flight fetch registry used by {@link getCachedOrFetch}.
 *
 * @remarks
 * Stored as a WeakMap keyed by cache instance to avoid memory leaks.
 */
const inFlightFetches = new WeakMap<object, Map<string, Promise<unknown>>>();

/**
 * Predefined application cache collection interface.
 *
 * @remarks
 * Internal helper used to describe the structure of {@link AppCaches}.
 *
 * @internal
 */
interface AppCachesInterface {
    /**
     * General-purpose cache used for miscellaneous computed values and small
     * application artifacts.
     */
    readonly general: TypedCache<string, CacheValue>;

    /**
     * Cache reserved for monitor type configurations and metadata.
     */
    readonly monitorTypes: TypedCache<string, CacheValue>;

    /**
     * Cache for UI helper values and component-level ephemeral data.
     */
    readonly uiHelpers: TypedCache<string, CacheValue>;
}

/**
 * Internal structure representing a cached entry and its metadata.
 *
 * @remarks
 * This type is internal to the module and captures timestamps required for TTL
 * checks and LRU eviction. It is intentionally not exported.
 *
 * @internal
 */
interface CacheEntry<T> {
    /** Last-accessed epoch in milliseconds used for LRU selection. */
    lastAccessed: number;

    /** Creation epoch in milliseconds used to evaluate TTL expiration. */
    timestamp: number;

    /** Optional per-entry TTL (milliseconds) that overrides the cache default. */
    ttl: number | undefined;

    /** Stored value for the cache entry. */
    value: T;
}

/**
 * Configuration options for creating a {@link TypedCache} instance.
 *
 * @remarks
 * Both properties are optional. When omitted, the cache uses a sensible default
 * for `maxSize` and no default TTL (entries will not expire unless a TTL is
 * provided at `set` time).
 *
 * @public
 */
export interface CacheOptions {
    /**
     * Maximum number of entries the cache will retain before evicting the
     * least-recently-used entries.
     *
     * @defaultValue 100
     */
    maxSize?: number;

    /**
     * Default time-to-live in milliseconds applied to entries when no per-entry
     * TTL is provided.
     */
    ttl?: number;
}

/**
 * Generic in-memory cache with optional TTL and LRU eviction.
 *
 * @remarks
 * The implementation uses a {@link Map} to store entries and maintains
 * `lastAccessed` timestamps for LRU eviction. When `maxSize` is reached a
 * single entry is evicted (the one with the oldest `lastAccessed`). This
 * selection is O(n) over the number of entries.
 *
 * @typeParam K - Type of cache keys.
 * @typeParam V - Type of cached values.
 *
 * @public
 */
export class TypedCache<K, V> {
    /**
     * Internal Map storing cache entries with metadata.
     *
     * @remarks
     * This map contains the actual cached data along with timing metadata used
     * for TTL expiration and LRU eviction calculations.
     *
     * @internal
     */
    private readonly cache = new Map<K, CacheEntry<V>>();

    /**
     * Cache generation counter.
     *
     * @remarks
     * Incremented whenever the cache is cleared. Used by higher-level helpers
     * (for example {@link getCachedOrFetch}) to avoid caching values fetched
     * before an invalidation/clear event.
     */
    private generation = 0;

    /**
     * Default time-to-live for cache entries in milliseconds.
     *
     * @remarks
     * When set, all entries without an explicit TTL will expire after this
     * duration. If undefined, entries persist until manually evicted or removed
     * by LRU eviction.
     *
     * @internal
     */
    private readonly defaultTtl: number | undefined;

    /**
     * Maximum number of entries allowed in the cache.
     *
     * @remarks
     * When this limit is reached, the least recently used entry is evicted to
     * make room for new entries. Defaults to 100 if not specified in
     * constructor options.
     *
     * @internal
     */
    private readonly maxSize: number;

    /**
     * Create a new cache instance.
     *
     * @defaultValue An instance will use `maxSize` 100 and no default TTL when omitted.
     *
     * @param options - Cache configuration. Accepts either CacheOptions or
     *   CACHE_CONFIG format.
     */
    public constructor(options: CacheOptions = {}) {
        this.maxSize = options.maxSize ?? 100;

        const configuredTtl = options.ttl;
        if (configuredTtl !== undefined && configuredTtl <= 0) {
            logger.warn("[Cache] Invalid TTL configuration", {
                configuredTtl,
                context: "cache:TypedCache",
            });
        }

        this.defaultTtl =
            configuredTtl !== undefined && configuredTtl > 0
                ? configuredTtl
                : undefined;
    }

    /**
     * Current number of entries in the cache.
     *
     * @returns Number of stored entries.
     *
     * @public
     */
    public get size(): number {
        return this.cache.size;
    }

    /**
     * Remove entries that have exceeded their TTL from this cache instance.
     *
     * @remarks
     * Iterates the underlying {@link Map} and deletes expired items. This is a
     * best-effort maintenance operation and safe to call periodically (for
     * example from a scheduled timer). It does not return which keys were
     * removed.
     *
     * @public
     */
    public cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            const ttl = entry.ttl ?? this.defaultTtl;
            if (ttl && now - entry.timestamp > ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Remove all entries from the cache.
     *
     * @remarks
     * Clears the internal {@link Map} and resets the cache to empty.
     *
     * @public
     */
    public clear(): void {
        this.generation += 1;
        this.cache.clear();
    }

    /**
     * Returns the current cache generation.
     *
     * @remarks
     * Consumers can capture this value before starting a long-running fetch and
     * ensure the cache has not been invalidated before storing results.
     */
    public getGeneration(): number {
        return this.generation;
    }

    /**
     * Delete a specific key from the cache.
     *
     * @param key - The cache key to remove.
     *
     * @returns True if the key existed and was removed; false otherwise.
     *
     * @public
     */
    public delete(key: K): boolean {
        return this.cache.delete(key);
    }

    /**
     * Retrieve a value if present and not expired.
     *
     * @param key - The cache key to look up.
     *
     * @returns The cached value, or `undefined` when the key does not exist or
     *   the entry has expired.
     *
     * @public
     */
    public get(key: K): undefined | V {
        const entry = this.cache.get(key);
        if (!entry) {
            return undefined;
        }

        // Evaluate expiration using either per-entry TTL or default
        const ttl = entry.ttl ?? this.defaultTtl;
        if (ttl && Date.now() - entry.timestamp > ttl) {
            // expired: remove and return undefined
            this.cache.delete(key);
            return undefined;
        }

        // Update last accessed time for LRU bookkeeping
        entry.lastAccessed = Date.now();

        return entry.value;
    }

    /**
     * Check whether a non-expired entry exists for the given key.
     *
     * @param key - The cache key to test.
     *
     * @returns `true` when a valid (non-expired) value exists; `false`
     *   otherwise.
     *
     * @public
     */
    public has(key: K): boolean {
        return this.get(key) !== undefined;
    }

    /**
     * Insert or update an entry in the cache and optionally specify a per-entry
     * TTL that overrides the cache's default TTL.
     *
     * @remarks
     * If the cache size would exceed {@link CacheOptions.maxSize} a single
     * least-recently-used entry is evicted. LRU selection scans all entries and
     * has O(n) cost.
     *
     * @param key - The cache key to set.
     * @param value - The value to store under the provided key.
     * @param ttl - Optional per-entry TTL in milliseconds; when omitted the
     *   cache's `defaultTtl` (if any) will apply.
     *
     * @public
     */
    public set(key: K, value: V, ttl?: number): void {
        // Enforce max size by removing least recently used entries
        if (this.cache.size >= this.maxSize) {
            let lruKey: K | undefined = undefined;
            let oldestAccessTime = Number.POSITIVE_INFINITY;

            // Find the least recently used entry (O(n) operation)
            for (const [entryKey, entry] of this.cache.entries()) {
                if (entry.lastAccessed < oldestAccessTime) {
                    oldestAccessTime = entry.lastAccessed;
                    lruKey = entryKey;
                }
            }

            if (lruKey !== undefined) {
                this.cache.delete(lruKey);
            }
        }

        const now = Date.now();
        const finalTtl = ttl ?? this.defaultTtl;
        this.cache.set(key, {
            lastAccessed: now,
            timestamp: now,
            ttl: finalTtl,
            value,
        });
    }
}

/**
 * Application-wide predefined cache instances used throughout the app.
 *
 * @remarks
 * Each cache is tuned with conservative `maxSize` and `ttl` values suitable for
 * its domain. Consumers can use these shared caches or create their own
 * {@link TypedCache} instances when different characteristics are needed.
 *
 * @public
 */
export const AppCaches: AppCachesInterface = {
    /** General purpose cache for common values */
    general: new TypedCache<string, CacheValue>(CACHE_CONFIG.TEMPORARY),

    /** Monitor type configurations and related data */
    monitorTypes: new TypedCache<string, CacheValue>(CACHE_CONFIG.MONITORS),

    /** UI helper data and component state */
    uiHelpers: new TypedCache<string, CacheValue>(CACHE_CONFIG.VALIDATION),
} as const;

/**
 * Remove expired entries from all predefined application caches.
 *
 * @remarks
 * Iterates the caches in {@link AppCaches} and calls {@link TypedCache.cleanup}
 * on each. This is a convenience for scheduled maintenance tasks.
 *
 * @public
 */
export function cleanupAllCaches(): void {
    const caches: Array<TypedCache<string, CacheValue>> = [
        AppCaches.general,
        AppCaches.monitorTypes,
        AppCaches.uiHelpers,
    ];

    for (const cache of caches) {
        cache.cleanup();
    }
}

/**
 * Clear all entries from the predefined application caches.
 *
 * @remarks
 * This removes all data from the {@link AppCaches} instances. Use sparingly as
 * it may cause increased computation or I/O until caches refill.
 *
 * @public
 */
export function clearAllCaches(): void {
    const caches: Array<TypedCache<string, CacheValue>> = [
        AppCaches.general,
        AppCaches.monitorTypes,
        AppCaches.uiHelpers,
    ];

    for (const cache of caches) {
        cache.clear();
    }
}

/**
 * Retrieve a value from a cache or compute and store it on a cache miss.
 *
 * @remarks
 * The function first attempts to read from the supplied {@link TypedCache}. If
 * the key is absent or expired it invokes `fetcher` to obtain the value, stores
 * the result in the cache (honoring an optional `ttl`), and returns the value.
 * Any exception thrown by `fetcher` is propagated to the caller and no value is
 * cached in that case.
 *
 * @example
 *
 * ```ts
 * const value = await getCachedOrFetch(
 *     AppCaches.general,
 *     "user:123",
 *     async () => {
 *         const resp = await apiClient.get("/user/123");
 *         return resp.data;
 *     },
 *     60_000
 * );
 * ```
 *
 * @typeParam T - Type of the cached value.
 *
 * @param cache - Cache instance to use for lookup and storage.
 * @param key - Cache key to look up.
 * @param fetcher - Async function that computes or fetches the value on a cache
 *   miss.
 * @param ttl - Optional per-entry TTL in milliseconds to apply when storing the
 *   fetched value; when omitted the cache's default TTL (if any) applies.
 *
 * @returns A promise that resolves to the cached or freshly fetched value.
 *
 * @throws Any error thrown by `fetcher` is propagated to the caller.
 *
 * @public
 */
export async function getCachedOrFetch<T extends Exclude<unknown, undefined>>(
    cache: TypedCache<string, T>,
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
): Promise<T> {
    // Track in-flight fetches per cache instance to avoid duplicate work.
    // WeakMap ensures entries are GC'd once caches are no longer referenced.
    const ensureInFlightRegistry = (): Map<string, Promise<unknown>> => {
        const existing = inFlightFetches.get(cache);
        if (existing) {
            return existing;
        }

        const created = new Map<string, Promise<unknown>>();
        inFlightFetches.set(cache, created);
        return created;
    };

    // Try to get from cache first
    const cached = cache.get(key);
    if (cached !== undefined) {
        return cached;
    }

    const inFlight = ensureInFlightRegistry();
    const existingPromise = inFlight.get(key);
    if (existingPromise) {
        return castUnchecked<Promise<T>>(existingPromise);
    }

    const generationAtStart = cache.getGeneration();

    const fetchPromise: Promise<T> = (async (): Promise<T> => {
        const value = await fetcher();

        // Avoid caching stale results when the cache was cleared/invalidate
        // while the fetch was in progress.
        if (cache.getGeneration() !== generationAtStart) {
            return value;
        }

        // Avoid overwriting newer values set while the fetch was in flight.
        if (cache.get(key) === undefined) {
            cache.set(key, value, ttl);
        }

        return value;
    })();

    inFlight.set(key, fetchPromise);

    try {
        return await fetchPromise;
    } finally {
        inFlight.delete(key);
        if (inFlight.size === 0) {
            inFlightFetches.delete(cache);
        }
    }
}
