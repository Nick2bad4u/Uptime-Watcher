/**
 * Standardized cache system for all managers and services.
 *
 * @remarks
 * Provides consistent caching behavior, event emission, statistics, and
 * invalidation strategies across the entire application. Features TTL
 * expiration, LRU eviction, bulk operations, and comprehensive metrics tracking
 * for optimal performance monitoring.
 *
 * @packageDocumentation
 */

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";

import { logger } from "../logger";

type CacheEventName =
    | "internal:cache:all-invalidated"
    | "internal:cache:bulk-updated"
    | "internal:cache:cleanup-completed"
    | "internal:cache:cleared"
    | "internal:cache:item-cached"
    | "internal:cache:item-deleted"
    | "internal:cache:item-evicted"
    | "internal:cache:item-expired"
    | "internal:cache:item-invalidated";

type CacheEventPayloadMap = {
    [Event in CacheEventName]: Omit<
        UptimeEvents[Event],
        "cacheName" | "timestamp"
    >;
};

type CacheEventPayload<EventName extends CacheEventName> =
    CacheEventPayloadMap[EventName];

interface CacheEventContext {
    cacheName: string;
    timestamp: number;
}

const createItemCountPayload = (
    context: CacheEventContext,
    data: { itemCount: number }
): { cacheName: string; itemCount: number; timestamp: number } => ({
    cacheName: context.cacheName,
    itemCount: data.itemCount,
    timestamp: context.timestamp,
});

const createKeyPayload = (
    context: CacheEventContext,
    data: { key: string }
): { cacheName: string; key: string; timestamp: number } => ({
    cacheName: context.cacheName,
    key: data.key,
    timestamp: context.timestamp,
});

const createKeyWithOptionalTtlPayload = (
    context: CacheEventContext,
    data: { key: string; ttl?: number }
): { cacheName: string; key: string; timestamp: number; ttl?: number } => {
    return {
        cacheName: context.cacheName,
        key: data.key,
        timestamp: context.timestamp,
        ttl: data.ttl ?? undefined,
    };
};

const createKeyWithReasonPayload = (
    context: CacheEventContext,
    data: { key: string; reason: "lru" | "manual" }
): {
    cacheName: string;
    key: string;
    reason: "lru" | "manual";
    timestamp: number;
} => ({
    cacheName: context.cacheName,
    key: data.key,
    reason: data.reason,
    timestamp: context.timestamp,
});

const CACHE_EVENT_PAYLOAD_BUILDERS: {
    [Event in CacheEventName]: (
        context: CacheEventContext,
        data: CacheEventPayload<Event>
    ) => UptimeEvents[Event];
} = {
    "internal:cache:all-invalidated": createItemCountPayload,
    "internal:cache:bulk-updated": createItemCountPayload,
    "internal:cache:cleanup-completed": createItemCountPayload,
    "internal:cache:cleared": createItemCountPayload,
    "internal:cache:item-cached": createKeyWithOptionalTtlPayload,
    "internal:cache:item-deleted": createKeyPayload,
    "internal:cache:item-evicted": createKeyWithReasonPayload,
    "internal:cache:item-expired": createKeyPayload,
    "internal:cache:item-invalidated": createKeyPayload,
};

/**
 * Cache configuration.
 */
export interface CacheConfig {
    /** Enable statistics tracking */
    enableStats?: boolean;
    /** Event emitter for cache events */
    eventEmitter?: TypedEventBus<UptimeEvents>;
    /** Maximum cache size */
    maxSize?: number;
    /** Cache identifier for logging */
    name: string;
    /**
     * Cache-level TTL applied when no per-entry TTL is supplied.
     *
     * @remarks
     * Provide `0` or a negative value to disable automatic expiration.
     *
     * @defaultValue 300_000 (5 minutes)
     */
    ttl?: number;
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
     * Hit ratio (0-1). Calculated as hits / (hits + misses).
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
 *
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
        enableStats: boolean;
        eventEmitter?: TypedEventBus<UptimeEvents>;
        maxSize: number;
        name: string;
        ttl: number;
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
            enableStats: config.enableStats ?? true,
            maxSize: config.maxSize ?? 1000,
            name: config.name,
            ttl: config.ttl ?? 300_000, // 5 minutes
            ...(config.eventEmitter && { eventEmitter: config.eventEmitter }),
        };

        logger.debug(
            `[Cache:${this.config.name}] Initialized with maxSize=${this.config.maxSize}, ttl=${this.config.ttl}ms`
        );
    }

    /**
     * Bulk update cache with new data.
     *
     * Note: Emits only a single bulk-updated event for performance. Individual
     * item cache events are not emitted during bulk operations.
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
            if (entry.expiresAt && entry.expiresAt < now) {
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
        const entries = this.cleanupAndExtract(
            (key, entry) => [key, entry.data] as [string, T]
        );

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
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
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
        return this.cleanupAndExtract((_key, entry) => entry.data);
    }

    /**
     * Get cache statistics. Returns a snapshot of the current statistics, not a
     * live reference.
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
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
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
     * Get all cache keys. Filters out expired keys automatically.
     */
    public keys(): string[] {
        return this.cleanupAndExtract((key) => key);
    }

    /**
     * Register invalidation callback for cache events.
     *
     * @param callback - Function to call when cache items are invalidated.
     *   Called with a specific key when a single item is invalidated, or with
     *   undefined when all items are invalidated.
     *
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
     * @param ttl - Time to live in milliseconds. If 0 or negative, the item
     *   will not expire.
     */
    public set(key: string, data: T, ttl?: number): void {
        // Evict if at capacity and this is a new key
        if (this.config.maxSize <= this.cache.size && !this.cache.has(key)) {
            this.evictLRU();
        }

        const now = Date.now();
        const requestedTTL = ttl ?? this.config.ttl;

        const entry: CacheEntry<T> = {
            data,
            hits: 0,
            timestamp: now,
            ...(requestedTTL > 0 && { expiresAt: now + requestedTTL }),
        };

        this.cache.set(key, entry);
        this.updateSize();

        logger.debug(
            `[Cache:${this.config.name}] Cached item: ${key} (TTL: ${
                requestedTTL > 0 ? `${requestedTTL}ms` : "disabled"
            })`
        );
        this.emitEvent("internal:cache:item-cached", {
            key,
            ...(requestedTTL > 0 ? { ttl: requestedTTL } : {}),
        });
    }

    /**
     * Emit cache event if event emitter is configured.
     */
    private emitEvent<EventName extends CacheEventName>(
        eventType: EventName,
        data: CacheEventPayload<EventName>
    ): void {
        if (!this.config.eventEmitter) {
            return;
        }

        const payload = this.buildCacheEventPayload(eventType, data);
        void this.config.eventEmitter.emitTyped(eventType, payload);
    }

    /**
     * Construct a cache event payload with metadata for a specific event.
     */
    private buildCacheEventPayload<EventName extends CacheEventName>(
        eventType: EventName,
        data: CacheEventPayload<EventName>
    ): UptimeEvents[EventName] {
        const context: CacheEventContext = {
            cacheName: this.config.name,
            timestamp: Date.now(),
        };

        return CACHE_EVENT_PAYLOAD_BUILDERS[eventType](context, data);
    }

    /**
     * Clean up expired entries and return valid entries.
     *
     * @param extractFn - Function to extract the desired value from valid
     *   entries
     *
     * @returns Array of extracted values from valid entries
     */
    private cleanupAndExtract<R>(
        extractFn: (key: string, entry: CacheEntry<T>) => R
    ): R[] {
        const results: R[] = [];
        const expiredKeys: string[] = [];
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt && entry.expiresAt < now) {
                this.cache.delete(key);
                expiredKeys.push(key);
            } else {
                results.push(extractFn(key, entry));
            }
        }

        // Notify callbacks for expired items
        for (const key of expiredKeys) {
            this.notifyInvalidation(key);
        }

        this.updateSize();
        return results;
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
     * @param key - The invalidated cache key, or undefined if all keys were
     *   invalidated
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
    } /**
     * Update size statistic.
     */

    private updateSize(): void {
        this.stats.size = this.cache.size;
    }
}
