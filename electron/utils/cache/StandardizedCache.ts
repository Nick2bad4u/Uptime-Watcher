/**
 * Standardized cache system for all managers.
 *
 * Provides consistent caching behavior, event emission, statistics, and
 * invalidation strategies across the entire application.
 */

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";

import { logger } from "../logger";

/**
 * Cache configuration.
 */
export interface CacheConfig {
    /**
     * Default TTL in milliseconds. Set to 0 or negative to disable expiration.
     */
    defaultTTL?: number;
    /** Enable statistics tracking */
    enableStats?: boolean;
    /** Event emitter for cache events */
    eventEmitter?: TypedEventBus<UptimeEvents>;
    /** Maximum cache size */
    maxSize?: number;
    /** Cache identifier for logging */
    name: string;
}

/**
 * Cache entry with metadata.
 */
export interface CacheEntry<T> {
    /** The cached data */
    data: T;
    /** Optional expiration time */
    expiresAt?: number;
    /** Hit count for this entry */
    hits: number;
    /** Timestamp when cached */
    timestamp: number;
}

/**
 * Cache statistics.
 */
export interface CacheStats {
    /**
     * Hit ratio (0-1).
     * Calculated as hits / (hits + misses).
     */
    hitRatio: number;
    /** Total cache hits */
    hits: number;
    /** Last access timestamp. Only updated on cache hits, not misses. */
    lastAccess?: number;
    /** Total cache misses */
    misses: number;
    /** Current cache size */
    size: number;
}

/**
 * Standardized cache implementation.
 *
 * Features:
 * - Consistent API across all managers
 * - Automatic TTL expiration
 * - LRU eviction when max size reached
 * - Event emission for cache operations
 * - Hit/miss statistics
 * - Bulk operations
 */
export class StandardizedCache<T> {
    private readonly cache = new Map<string, CacheEntry<T>>();

    private readonly config: {
        defaultTTL: number;
        enableStats: boolean;
        eventEmitter?: TypedEventBus<UptimeEvents>;
        maxSize: number;
        name: string;
    };

    private readonly invalidationCallbacks = new Set<(key?: string) => void>();

    private readonly stats: CacheStats = {
        hitRatio: 0,
        hits: 0,
        misses: 0,
        size: 0,
    };

    /**
     * Get current cache size.
     */
    public get size(): number {
        return this.cache.size;
    }

    public constructor(config: CacheConfig) {
        this.config = {
            defaultTTL: config.defaultTTL ?? 300_000, // 5 minutes
            enableStats: config.enableStats ?? true,
            maxSize: config.maxSize ?? 1000,
            name: config.name,
            ...(config.eventEmitter && { eventEmitter: config.eventEmitter }),
        };

        logger.debug(
            `[Cache:${this.config.name}] Initialized with maxSize=${this.config.maxSize}, defaultTTL=${this.config.defaultTTL}ms`
        );
    }

    /**
     * Bulk update cache with new data.
     *
     * Note: Emits only a single bulk-updated event for performance.
     * Individual item cache events are not emitted during bulk operations.
     */
    public bulkUpdate(
        items: Array<{ data: T; key: string; ttl?: number }>
    ): void {
        logger.debug(
            `[Cache:${this.config.name}] Bulk updating ${items.length} items`
        );

        for (const item of items) {
            this.set(item.key, item.data, item.ttl);
        }

        this.emitEvent("internal:cache:bulk-updated", {
            itemCount: items.length,
        });
    }

    /**
     * Clean up expired entries.
     */
    public cleanup(): number {
        const now = Date.now();
        let cleaned = 0;
        const cleanedKeys: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt && now > entry.expiresAt) {
                this.cache.delete(key);
                cleanedKeys.push(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            this.updateSize();
            logger.debug(
                `[Cache:${this.config.name}] Cleaned up ${cleaned} expired items`
            );
            this.emitEvent("internal:cache:cleanup-completed", {
                itemCount: cleaned,
            });

            // Notify callbacks for each cleaned item
            for (const key of cleanedKeys) {
                this.notifyInvalidation(key);
            }
        }

        return cleaned;
    }

    /**
     * Clear all items from cache.
     */
    public clear(): void {
        const { size } = this.cache;
        this.cache.clear();
        this.updateSize();

        logger.debug(
            `[Cache:${this.config.name}] Cleared cache (${size} items)`
        );
        this.emitEvent("internal:cache:cleared", { itemCount: size });

        // Notify callbacks that all items were invalidated
        if (size > 0) {
            this.notifyInvalidation(); // No key = all invalidated
        }
    }

    /**
     * Delete item from cache.
     */
    public delete(key: string): boolean {
        const deleted = this.cache.delete(key);

        if (deleted) {
            this.updateSize();
            logger.debug(`[Cache:${this.config.name}] Deleted item: ${key}`);
            this.emitEvent("internal:cache:item-deleted", { key });
            this.notifyInvalidation(key);
        }

        return deleted;
    }

    /**
     * Get cache entries iterator.
     */
    public entries(): IterableIterator<[string, T]> {
        const entries: Array<[string, T]> = [];
        const expiredKeys: string[] = [];
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            // Skip expired entries
            if (entry.expiresAt && now > entry.expiresAt) {
                this.cache.delete(key);
                expiredKeys.push(key);
            } else {
                entries.push([key, entry.data]);
            }
        }

        // Notify callbacks for expired items
        for (const key of expiredKeys) {
            this.notifyInvalidation(key);
        }

        this.updateSize();
        // Workaround for ESLint plugin bug: avoid direct [Symbol.iterator]()
        // call
        const iteratorFn = entries[Symbol.iterator];
        return iteratorFn.call(entries);
    }

    /**
     * Get item from cache.
     */
    public get(key: string): T | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            this.recordMiss();
            return undefined;
        }

        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.updateSize();
            this.recordMiss();
            this.emitEvent("internal:cache:item-expired", { key });
            this.notifyInvalidation(key);
            return undefined;
        }

        // Record hit and update access info
        entry.hits++;
        this.recordHit();

        logger.debug(`[Cache:${this.config.name}] Cache hit for key: ${key}`);
        return entry.data;
    }

    /**
     * Get all cached values.
     */
    public getAll(): T[] {
        const values: T[] = [];
        const expiredKeys: string[] = [];
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            // Skip expired entries
            if (entry.expiresAt && now > entry.expiresAt) {
                this.cache.delete(key);
                expiredKeys.push(key);
            } else {
                values.push(entry.data);
            }
        }

        // Notify callbacks for expired items
        for (const key of expiredKeys) {
            this.notifyInvalidation(key);
        }

        this.updateSize();
        return values;
    }

    /**
     * Get cache statistics.
     * Returns a snapshot of the current statistics, not a live reference.
     */
    public getStats(): CacheStats {
        return { ...this.stats };
    }

    /**
     * Check if key exists in cache.
     */
    public has(key: string): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.updateSize();
            this.notifyInvalidation(key);
            return false;
        }

        return true;
    }

    /**
     * Invalidate specific key.
     */
    public invalidate(key: string): void {
        const deleted = this.delete(key);

        if (deleted) {
            logger.debug(`[Cache:${this.config.name}] Invalidated key: ${key}`);
            this.emitEvent("internal:cache:item-invalidated", { key });
            // Note: notifyInvalidation already called by delete() method
        }
    }

    /**
     * Invalidate all keys.
     */
    public invalidateAll(): void {
        const { size } = this.cache;
        this.clear();

        logger.debug(
            `[Cache:${this.config.name}] Invalidated all ${size} items`
        );
        this.emitEvent("internal:cache:all-invalidated", { itemCount: size });
        this.notifyInvalidation(); // No key = all invalidated
    }

    /**
     * Get all cache keys.
     * Filters out expired keys automatically.
     */
    public keys(): string[] {
        const validKeys: string[] = [];
        const expiredKeys: string[] = [];
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            // Skip expired entries
            if (entry.expiresAt && now > entry.expiresAt) {
                this.cache.delete(key);
                expiredKeys.push(key);
            } else {
                validKeys.push(key);
            }
        }

        // Notify callbacks for expired items
        for (const key of expiredKeys) {
            this.notifyInvalidation(key);
        }

        this.updateSize();
        return validKeys;
    }

    /**
     * Register invalidation callback for cache events.
     *
     * @param callback - Function to call when cache items are invalidated.
     *                   Called with a specific key when a single item is
     *                   invalidated, or with undefined when all items are
     *                   invalidated.
     * @returns Cleanup function to remove the callback
     */
    public onInvalidation(callback: (key?: string) => void): () => void {
        this.invalidationCallbacks.add(callback);
        logger.debug(
            `[Cache:${this.config.name}] Invalidation callback registered`
        );

        // Return cleanup function
        return () => {
            this.invalidationCallbacks.delete(callback);
            logger.debug(
                `[Cache:${this.config.name}] Invalidation callback removed`
            );
        };
    }

    /**
     * Set item in cache.
     *
     * @param key - The cache key
     * @param data - The data to cache
     * @param ttl - Time to live in milliseconds. If 0 or negative, the item will not expire.
     */
    public set(key: string, data: T, ttl?: number): void {
        // Evict if at capacity and this is a new key
        if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }

        const now = Date.now();
        const effectiveTTL = ttl ?? this.config.defaultTTL;

        const entry: CacheEntry<T> = {
            data,
            hits: 0,
            timestamp: now,
            ...(effectiveTTL > 0 && { expiresAt: now + effectiveTTL }),
        };

        this.cache.set(key, entry);
        this.updateSize();

        logger.debug(
            `[Cache:${this.config.name}] Cached item: ${key} (TTL: ${effectiveTTL}ms)`
        );
        this.emitEvent("internal:cache:item-cached", {
            key,
            ttl: effectiveTTL,
        });
    }

    /**
     * Emit cache event if event emitter is configured.
     */
    private emitEvent(eventType: string, data: Record<string, unknown>): void {
        if (this.config.eventEmitter) {
            this.config.eventEmitter.emit(eventType, {
                cacheName: this.config.name,
                timestamp: Date.now(),
                ...data,
            });
        }
    }

    /**
     * Evict least recently used item.
     */
    private evictLRU(): void {
        let oldestKey: string | undefined = undefined;
        let oldestTime = Number.POSITIVE_INFINITY;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.updateSize();
            logger.debug(
                `[Cache:${this.config.name}] Evicted LRU item: ${oldestKey}`
            );
            this.emitEvent("internal:cache:item-evicted", {
                key: oldestKey,
                reason: "lru",
            });
            this.notifyInvalidation(oldestKey);
        }
    }

    /**
     * Notify invalidation callbacks.
     *
     * Calls all registered invalidation callbacks, handling any errors
     * gracefully.
     *
     * @param key - The invalidated cache key, or undefined if all keys were invalidated
     */
    private notifyInvalidation(key?: string): void {
        for (const callback of this.invalidationCallbacks) {
            try {
                // eslint-disable-next-line n/callback-return -- Synchronous callback for immediate invalidation notification
                callback(key);
            } catch (error) {
                logger.error(
                    `[Cache:${this.config.name}] Error in invalidation callback:`,
                    error
                );
            }
        }
    }

    /**
     * Record cache hit and update statistics.
     */
    private recordHit(): void {
        if (this.config.enableStats) {
            this.stats.hits++;
            this.stats.lastAccess = Date.now();
            this.updateHitRatio();
        }
    }

    /**
     * Record cache miss and update statistics.
     */
    private recordMiss(): void {
        if (this.config.enableStats) {
            this.stats.misses++;
            this.updateHitRatio();
        }
    }

    /**
     * Update hit ratio calculation.
     */
    private updateHitRatio(): void {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRatio = total > 0 ? this.stats.hits / total : 0;
    }

    /**
     * Update size statistic.
     */
    private updateSize(): void {
        this.stats.size = this.cache.size;
    }
}
