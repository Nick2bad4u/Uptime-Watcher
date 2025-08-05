/**
 * Unified caching utility for the application.
 * Provides type-safe caching with TTL support and proper cleanup.
 */

import type { CacheValue } from "../../shared/types/configTypes";

/**
 * Configuration options for cache instances.
 *
 * @public
 */
export interface CacheOptions {
    /** Maximum number of entries */
    maxSize?: number;
    /** Time to live in milliseconds */
    ttl?: number;
}

/**
 * Internal cache entry structure with metadata.
 *
 * @internal
 */
interface CacheEntry<T> {
    /** Last accessed timestamp for LRU tracking */
    lastAccessed: number;
    /** Creation timestamp for TTL calculation */
    timestamp: number;
    /** Time to live in milliseconds (overrides default) */
    ttl: number | undefined;
    /** Cached value */
    value: T;
}

/**
 * Generic cache implementation with TTL support and LRU eviction.
 *
 * @remarks
 * This cache implementation provides:
 * - TTL (Time To Live) support for automatic expiration
 * - LRU (Least Recently Used) eviction when max size is reached
 * - Type-safe operations with generic key-value types
 * - Automatic cleanup of expired entries
 *
 * Generic types:
 * - K: Type of cache keys
 * - V: Type of cached values
 */
export class TypedCache<K, V> {
    /**
     * Get cache size.
     *
     * @returns Number of entries currently in the cache
     */
    get size(): number {
        return this.cache.size;
    }
    private readonly cache = new Map<K, CacheEntry<V>>();
    private readonly defaultTtl: number | undefined;

    private readonly maxSize: number;

    /**
     * Create a new TypedCache instance.
     *
     * @param options - Cache configuration options including maxSize and ttl
     */
    constructor(options: CacheOptions = {}) {
        this.maxSize = options.maxSize ?? 100;
        this.defaultTtl = options.ttl;
    }

    /**
     * Clean up expired entries.
     * Removes all entries that have exceeded their TTL.
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            const ttl = entry.ttl ?? this.defaultTtl;
            if (ttl && now - entry.timestamp > ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cached entries.
     * Removes all entries from the cache.
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Delete specific key.
     *
     * @param key - The key to delete from the cache
     * @returns True if the key existed and was deleted, false otherwise
     */
    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    /**
     * Get value from cache if not expired.
     * Updates last accessed time for LRU tracking.
     *
     * @param key - The key to retrieve from the cache
     * @returns The cached value if found and not expired, undefined otherwise
     */
    get(key: K): undefined | V {
        const entry = this.cache.get(key);
        if (!entry) {
            return undefined;
        }

        // Check if expired
        const ttl = entry.ttl ?? this.defaultTtl;
        if (ttl && Date.now() - entry.timestamp > ttl) {
            this.cache.delete(key);
            return undefined;
        }

        // Update last accessed time for LRU tracking
        entry.lastAccessed = Date.now();

        return entry.value;
    }

    /**
     * Check if key exists and is not expired.
     *
     * @param key - The key to check for existence
     * @returns True if the key exists and has not expired, false otherwise
     */
    has(key: K): boolean {
        return this.get(key) !== undefined;
    }

    /**
     * Set value in cache with optional TTL.
     * Uses LRU eviction when max size is reached.
     *
     * @remarks
     * Current implementation uses O(n) iteration to find LRU entry.
     * For large caches (\>1000 entries), consider using a more efficient
     * LRU implementation with doubly-linked list for O(1) eviction.
     */
    set(key: K, value: V, ttl?: number): void {
        // Enforce max size by removing least recently used entries
        if (this.cache.size >= this.maxSize) {
            let lruKey: K | undefined;
            let oldestAccessTime = Number.POSITIVE_INFINITY;

            // Find the least recently used entry (O(n) operation)
            // NOTE: For better performance with large caches, consider implementing
            // doubly-linked list for O(1) LRU operations
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
 * Predefined caches for common use cases.
 * Provides pre-configured cache instances for different application domains.
 */
export const AppCaches = {
    /** General purpose cache for common values */
    general: new TypedCache<string, CacheValue>({ maxSize: 200, ttl: 2 * 60 * 1000 }), // 2 minutes

    /** Monitor type configurations and related data */
    monitorTypes: new TypedCache<string, CacheValue>({ maxSize: 50, ttl: 5 * 60 * 1000 }), // 5 minutes

    /** UI helper data and component state */
    uiHelpers: new TypedCache<string, CacheValue>({ maxSize: 100, ttl: 10 * 60 * 1000 }), // 10 minutes
} as const;

/**
 * Run cleanup on all caches to remove expired entries.
 * Iterates through all predefined caches and removes expired items.
 */
export function cleanupAllCaches(): void {
    for (const cache of Object.values(AppCaches)) {
        cache.cleanup();
    }
}

/**
 * Clear all application caches.
 * Removes all entries from all predefined cache instances.
 */
export function clearAllCaches(): void {
    for (const cache of Object.values(AppCaches)) {
        cache.clear();
    }
}

/**
 * Helper for async cache operations with fallback.
 * Attempts to retrieve value from cache first, falling back to fetcher function if not found.
 *
 * @param cache - The cache instance to use
 * @param key - The cache key to lookup
 * @param fetcher - Function to call if cache miss occurs
 * @param ttl - Optional TTL override for this operation
 * @returns Promise resolving to cached or fetched value
 */
export async function getCachedOrFetch<T>(
    cache: TypedCache<string, T>,
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
): Promise<T> {
    // Try to get from cache first
    const cached = cache.get(key);
    if (cached !== undefined) {
        return cached;
    }

    // Fetch and cache
    const value = await fetcher();
    cache.set(key, value, ttl);
    return value;
}
