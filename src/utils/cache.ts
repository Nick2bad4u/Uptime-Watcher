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
 * The module exposes a set of preconfigured caches (`AppCaches`) for shared
 * renderer utility state.
 *
 * @example
 *
 * ```ts
 * import { AppCaches } from "./cache";
 *
 * // direct set/get
 * AppCaches.general.set("user-preference", { theme: "dark" });
 * const pref = AppCaches.general.get("user-preference");
 *
 * AppCaches.monitorTypes.set("config", { enabled: true }, 30_000);
 * ```
 *
 * @public
 */

import type { CacheValue } from "@shared/types/configTypes";

import { CACHE_CONFIG } from "@shared/constants/cacheConfig";
import { isDefined } from "ts-extras";

import { logger } from "../services/logger";

const DEFAULT_MAX_SIZE = 100;

function normalizeMaxSize(maxSize: number | undefined): number {
    if (!isDefined(maxSize) || !Number.isFinite(maxSize)) {
        return DEFAULT_MAX_SIZE;
    }

    return Math.max(1, Math.trunc(maxSize));
}

function normalizeTtl(ttl: number | undefined): number | undefined {
    return isDefined(ttl) && Number.isFinite(ttl) && ttl > 0 ? ttl : undefined;
}

/**
 * Configuration options for creating a {@link TypedCache} instance.
 *
 * @remarks
 * Both properties are optional. When omitted, the cache uses a sensible default
 * for `maxSize` and no default TTL (entries will not expire unless a TTL is
 * provided at `set` time).
 *
 * @internal
 */
interface CacheOptions {
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
 * Predefined app cache collection interface.
 *
 * @remarks
 * Internal helper used to describe the structure of {@link AppCaches}.
 *
 * @internal
 */
interface AppCachesInterface {
    /**
     * General-purpose cache used for miscellaneous computed values and small
     * app artifacts.
     */
    readonly general: AppCache<string, CacheValue>;

    /**
     * Cache reserved for monitor type configurations and metadata.
     */
    readonly monitorTypes: AppCache<string, CacheValue>;

    /**
     * Cache for UI helper values and component-level ephemeral data.
     */
    readonly uiHelpers: AppCache<string, CacheValue>;
}

/**
 * Public cache operations exposed by the shared app cache instances.
 *
 * @typeParam K - Type of cache keys.
 * @typeParam V - Type of cached values.
 *
 * @internal
 */
interface AppCache<K, V> {
    /**
     * Current number of entries in the cache.
     */
    readonly size: number;

    /**
     * Remove expired entries from the cache.
     */
    readonly cleanup: () => void;

    /**
     * Remove all entries from the cache.
     */
    readonly clear: () => void;

    /**
     * Delete a specific key from the cache.
     *
     * @param key - The cache key to remove.
     *
     * @returns True if the key existed and was removed; false otherwise.
     */
    readonly delete: (key: K) => boolean;

    /**
     * Retrieve a value if present and not expired.
     *
     * @param key - The cache key to look up.
     *
     * @returns The cached value, or `undefined` when the key does not exist or
     *   the entry has expired.
     */
    readonly get: (key: K) => undefined | V;

    /**
     * Check whether a non-expired entry exists for the given key.
     *
     * @param key - The cache key to test.
     *
     * @returns True when a valid value exists; false otherwise.
     */
    readonly has: (key: K) => boolean;

    /**
     * Insert or update an entry in the cache and optionally specify a per-entry
     * TTL that overrides the cache default.
     *
     * @param key - The cache key to set.
     * @param value - The value to store under the provided key.
     * @param ttl - Optional per-entry TTL in milliseconds.
     */
    readonly set: (key: K, value: V, ttl?: number) => void;
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
 * @internal
 */
class TypedCache<K, V> implements AppCache<K, V> {
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
        this.maxSize = normalizeMaxSize(options.maxSize);

        const configuredTtl = options.ttl;
        if (isDefined(configuredTtl) && !normalizeTtl(configuredTtl)) {
            logger.warn("[Cache] Invalid TTL configuration", {
                configuredTtl,
                context: "cache:TypedCache",
            });
        }

        this.defaultTtl = normalizeTtl(configuredTtl);
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
        for (const [key, entry] of this.cache) {
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
        this.cache.clear();
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
        return isDefined(this.get(key));
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
        if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
            let lruKey: K | undefined;
            let oldestAccessTime = Number.POSITIVE_INFINITY;

            // Find the least recently used entry (O(n) operation)
            for (const [entryKey, entry] of this.cache) {
                if (entry.lastAccessed >= oldestAccessTime) {
                    continue;
                }

                oldestAccessTime = entry.lastAccessed;
                lruKey = entryKey;
            }

            if (isDefined(lruKey)) {
                this.cache.delete(lruKey);
            }
        }

        const now = Date.now();
        const finalTtl = normalizeTtl(ttl) ?? this.defaultTtl;
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
 * its domain.
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
