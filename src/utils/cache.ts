/**
 * Unified caching utility for the application.
 * Provides type-safe caching with TTL support and proper cleanup.
 */

export interface CacheOptions {
    /** Maximum number of entries */
    maxSize?: number;
    /** Time to live in milliseconds */
    ttl?: number;
}

interface CacheEntry<T> {
    timestamp: number;
    ttl: number | undefined;
    value: T;
}

/**
 * Generic cache implementation with TTL support.
 */
export class TypedCache<K, V> {
    /**
     * Get cache size.
     */
    get size(): number {
        return this.cache.size;
    }
    private readonly cache = new Map<K, CacheEntry<V>>();
    private readonly defaultTtl: number | undefined;

    private readonly maxSize: number;

    constructor(options: CacheOptions = {}) {
        this.maxSize = options.maxSize ?? 100;
        this.defaultTtl = options.ttl;
    }

    /**
     * Clean up expired entries.
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
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Delete specific key.
     */
    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    /**
     * Get value from cache if not expired.
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

        return entry.value;
    }

    /**
     * Check if key exists and is not expired.
     */
    has(key: K): boolean {
        return this.get(key) !== undefined;
    }

    /**
     * Set value in cache with optional TTL.
     */
    set(key: K, value: V, ttl?: number): void {
        // Enforce max size by removing oldest entries
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }

        const finalTtl = ttl ?? this.defaultTtl;
        this.cache.set(key, {
            timestamp: Date.now(),
            ttl: finalTtl,
            value,
        });
    }
}

/**
 * Predefined caches for common use cases.
 */
export const AppCaches = {
    /** General purpose cache */
    general: new TypedCache<string, unknown>({ maxSize: 200, ttl: 2 * 60 * 1000 }), // 2 minutes

    /** Monitor type configurations */
    monitorTypes: new TypedCache<string, unknown>({ maxSize: 50, ttl: 5 * 60 * 1000 }), // 5 minutes

    /** UI helper data */
    uiHelpers: new TypedCache<string, unknown>({ maxSize: 100, ttl: 10 * 60 * 1000 }), // 10 minutes
} as const;

/**
 * Run cleanup on all caches to remove expired entries.
 */
export function cleanupAllCaches(): void {
    for (const cache of Object.values(AppCaches)) {
        cache.cleanup();
    }
}

/**
 * Clear all application caches.
 */
export function clearAllCaches(): void {
    for (const cache of Object.values(AppCaches)) {
        cache.clear();
    }
}

/**
 * Helper for async cache operations with fallback.
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
