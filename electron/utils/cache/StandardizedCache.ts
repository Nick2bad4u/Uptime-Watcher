/**
 * Standardized cache system for all managers and services.
 *
 * @remarks
 * Provides consistent caching behavior, event emission, statistics, and
 * invalidation strategies across the entire app. Features TTL expiration, LRU
 * eviction, bulk operations, and comprehensive metrics tracking for optimal
 * performance monitoring.
 *
 * @packageDocumentation
 */

import type { Except, Promisable } from "type-fest";

import { isDefined, isEmpty, objectHasIn } from "ts-extras";

import type { UptimeEvents } from "../../events/eventTypes";
import type { EventPayload, TypedEventBus } from "../../events/TypedEventBus";

import { fireAndForget, fireAndForgetLogged } from "../fireAndForget";
import { diagnosticsLogger, logger } from "../logger";

const hasThenProperty = (candidate: unknown): candidate is { then: unknown } =>
    typeof candidate === "object" &&
    candidate !== null &&
    objectHasIn(candidate, "then");

const isPromiseLike = (candidate: unknown): candidate is PromiseLike<unknown> =>
    hasThenProperty(candidate) && typeof candidate.then === "function";

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

type ReplaceCacheKey<Payload, TKey extends string> = Payload extends {
    key: string;
}
    ? Except<Payload, "key"> & { key: TKey }
    : Payload;

type CacheEventPayloadMap<TKey extends string> = {
    [Event in CacheEventName]: ReplaceCacheKey<
        Except<UptimeEvents[Event], "cacheName" | "timestamp">,
        TKey
    >;
};

type CacheEventPayload<
    TKey extends string,
    EventName extends CacheEventName,
> = CacheEventPayloadMap<TKey>[EventName];

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

const createKeyPayload = <TKey extends string>(
    context: CacheEventContext,
    data: { key: TKey }
): { cacheName: string; key: TKey; timestamp: number } => ({
    cacheName: context.cacheName,
    key: data.key,
    timestamp: context.timestamp,
});

const createKeyWithOptionalTtlPayload = <TKey extends string>(
    context: CacheEventContext,
    data: { key: TKey; ttl?: number }
): { cacheName: string; key: TKey; timestamp: number; ttl?: number } => ({
    cacheName: context.cacheName,
    key: data.key,
    timestamp: context.timestamp,
    ...(isDefined(data.ttl) && { ttl: data.ttl }),
});

const createKeyWithReasonPayload = <TKey extends string>(
    context: CacheEventContext,
    data: { key: TKey; reason: "lru" | "manual" }
): {
    cacheName: string;
    key: TKey;
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
        data: CacheEventPayload<string, Event>
    ) => EventPayload<UptimeEvents, Event>;
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

interface CacheItemInput<TValue, TKey extends string> {
    data: TValue;
    key: TKey;
    ttl?: number;
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
export class StandardizedCache<TValue = unknown, TKey extends string = string> {
    private readonly cache = new Map<TKey, CacheEntry<TValue>>();

    private readonly config: {
        enableStats: boolean;
        eventEmitter?: TypedEventBus<UptimeEvents>;
        maxSize: number;
        name: string;
        ttl: number;
    };

    private readonly invalidationCallbacks = new Set<
        (key?: TKey) => Promisable<void>
    >();

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

        logger.debug("Cache initialized", {
            cacheName: this.config.name,
            maxSize: this.config.maxSize,
            ttlMs: this.config.ttl,
        });
    }

    /**
     * Bulk update cache with new data.
     *
     * Note: Emits only a single bulk-updated event for performance. Individual
     * item cache events are not emitted during bulk operations.
     */
    public bulkUpdate(items: Iterable<CacheItemInput<TValue, TKey>>): void {
        const entries = [...items];

        if (isEmpty(entries)) {
            logger.debug("Cache bulk update skipped", {
                cacheName: this.config.name,
                itemCount: 0,
            });
            return;
        }

        logger.debug("Cache bulk update started", {
            cacheName: this.config.name,
            itemCount: entries.length,
        });

        for (const item of entries) {
            this.setEntry(item.key, item.data, item.ttl, {
                emitEvent: false,
                logAction: false,
            });
        }

        this.emitEvent("internal:cache:bulk-updated", {
            itemCount: entries.length,
        });
    }

    /**
     * Replace all cache entries atomically.
     *
     * @remarks
     * Clears existing entries before applying the supplied items via
     * {@link bulkUpdate}. When the incoming items array is empty the cache emits
     * both the standard `internal:cache:cleared` event and an
     * `internal:cache:bulk-updated` event (with `itemCount: 0`) to keep
     * downstream telemetry consistent with the refresh contract.
     */
    public replaceAll(items: Iterable<CacheItemInput<TValue, TKey>>): void {
        this.clear();

        const entries = [...items];

        if (isEmpty(entries)) {
            this.emitEvent("internal:cache:bulk-updated", { itemCount: 0 });
            return;
        }

        this.bulkUpdate(entries);
    }

    /**
     * Clean up expired entries.
     */
    public cleanup(): number {
        const now = Date.now();
        let cleaned = 0;
        const cleanedKeys: TKey[] = [];

        for (const [key, entry] of this.cache) {
            if (!entry.expiresAt || entry.expiresAt >= now) {
                continue;
            }

            this.cache.delete(key);
            cleanedKeys.push(key);
            cleaned++;
        }

        if (cleaned > 0) {
            this.updateSize();
            logger.debug("Cache expired items cleaned up", {
                cacheName: this.config.name,
                itemCount: cleaned,
            });
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

        logger.debug("Cache cleared", {
            cacheName: this.config.name,
            itemCount: size,
        });
        this.emitEvent("internal:cache:cleared", { itemCount: size });

        // Notify callbacks that all items were invalidated
        if (size > 0) {
            this.notifyInvalidation(); // No key = all invalidated
        }
    }

    /**
     * Delete item from cache.
     */
    public delete(key: TKey): boolean {
        const isDeleted = this.cache.delete(key);

        if (isDeleted) {
            this.updateSize();
            logger.debug("Cache item deleted", {
                cacheName: this.config.name,
                key,
            });
            this.emitEvent("internal:cache:item-deleted", { key });
            this.notifyInvalidation(key);
        }

        return isDeleted;
    }

    /**
     * Get cache entries iterator.
     */
    public entries(): IterableIterator<[TKey, TValue]> {
        const entries = this.cleanupAndExtract((key, entry): [TKey, TValue] => [
            key,
            entry.data,
        ]);

        return (function* entriesIterator(): IterableIterator<[TKey, TValue]> {
            for (const entry of entries) {
                yield entry;
            }
        })();
    }

    /**
     * Get item from cache.
     */
    public get(key: TKey): TValue | undefined {
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

        logger.debug("Cache hit", {
            cacheName: this.config.name,
            key,
        });
        return entry.data;
    }

    /**
     * Get all cached values.
     */
    public getAll(): TValue[] {
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
    public has(key: TKey): boolean {
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
    public invalidate(key: TKey): void {
        const isDeleted = this.delete(key);

        if (isDeleted) {
            logger.debug("Cache key invalidated", {
                cacheName: this.config.name,
                key,
            });
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

        logger.debug("Cache invalidated all items", {
            cacheName: this.config.name,
            itemCount: size,
        });
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
    public onInvalidation(
        callback: (key?: TKey) => Promisable<void>
    ): () => void {
        this.invalidationCallbacks.add(callback);
        logger.debug("Cache invalidation callback registered", {
            cacheName: this.config.name,
        });

        // Return cleanup function
        return (): void => {
            this.invalidationCallbacks.delete(callback);
            logger.debug("Cache invalidation callback removed", {
                cacheName: this.config.name,
            });
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
    public set(key: TKey, data: TValue, ttl?: number): void {
        this.setEntry(key, data, ttl, { emitEvent: true, logAction: true });
    }

    /**
     * Emit cache event if event emitter is configured.
     */
    private emitEvent<EventName extends CacheEventName>(
        eventType: EventName,
        data: CacheEventPayload<TKey, EventName>
    ): void {
        const { eventEmitter, name } = this.config;

        if (!eventEmitter) {
            return;
        }

        const payload = this.buildCacheEventPayload(eventType, data);
        fireAndForget(
            async () => {
                await eventEmitter.emitTyped(eventType, payload);
            },
            {
                onError: (error) => {
                    const metadata = { cacheName: name, eventType };
                    logger.error(
                        "Cache event emission failed",
                        error,
                        metadata
                    );
                    diagnosticsLogger.error(
                        "Cache event emission failure",
                        error,
                        {
                            ...metadata,
                            payload,
                        }
                    );
                },
            }
        );
    }

    /**
     * Construct a cache event payload with metadata for a specific event.
     */
    private buildCacheEventPayload<EventName extends CacheEventName>(
        eventType: EventName,
        data: CacheEventPayload<TKey, EventName>
    ): EventPayload<UptimeEvents, EventName> {
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
        extractFn: (key: TKey, entry: CacheEntry<TValue>) => R
    ): R[] {
        const results: R[] = [];
        const expiredKeys: TKey[] = [];
        const now = Date.now();

        for (const [key, entry] of this.cache) {
            if (entry.expiresAt && entry.expiresAt < now) {
                this.cache.delete(key);
                expiredKeys.push(key);
            } else {
                results.push(extractFn(key, entry));
            }
        }

        if (expiredKeys.length > 0) {
            this.updateSize();
            for (const key of expiredKeys) {
                this.emitEvent("internal:cache:item-expired", { key });
                this.notifyInvalidation(key);
            }
        } else {
            this.updateSize();
        }
        return results;
    }

    /**
     * Evict least recently used item.
     */
    private evictLRU(): void {
        let oldestKey: TKey | undefined;
        let oldestTime = Infinity;

        for (const [key, entry] of this.cache) {
            if (entry.timestamp >= oldestTime) {
                continue;
            }

            oldestTime = entry.timestamp;
            oldestKey = key;
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.updateSize();
            logger.debug("Cache LRU item evicted", {
                cacheName: this.config.name,
                key: oldestKey,
            });
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
    private notifyInvalidation(key?: TKey): void {
        for (const handler of this.invalidationCallbacks) {
            try {
                const result = handler(key);
                if (isPromiseLike(result)) {
                    fireAndForgetLogged({
                        logger,
                        loggerArgs: [{ cacheName: this.config.name }],
                        message: "Cache async invalidation callback failed",
                        task: async () => {
                            await result;
                        },
                    });
                }
            } catch (error) {
                logger.error("Cache invalidation callback failed", error, {
                    cacheName: this.config.name,
                });
            }
        }
    }

    /**
     * Record cache hit and update statistics.
     */
    private recordHit(): void {
        if (!this.config.enableStats) {
            return;
        }

        this.stats.hits++;
        this.stats.lastAccess = Date.now();
        this.updateHitRatio();
    }

    /**
     * Record cache miss and update statistics.
     */
    private recordMiss(): void {
        if (!this.config.enableStats) {
            return;
        }

        this.stats.misses++;
        this.updateHitRatio();
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

    private setEntry(
        key: TKey,
        data: TValue,
        ttl: number | undefined,
        options?: { emitEvent?: boolean; logAction?: boolean }
    ): void {
        // Evict if at capacity and this is a new key
        if (this.config.maxSize <= this.cache.size && !this.cache.has(key)) {
            this.evictLRU();
        }

        const now = Date.now();
        const requestedTTL = ttl ?? this.config.ttl;

        const entry: CacheEntry<TValue> = {
            data,
            hits: 0,
            timestamp: now,
            ...(requestedTTL > 0 && { expiresAt: now + requestedTTL }),
        };

        this.cache.set(key, entry);
        this.updateSize();

        if (options?.logAction ?? true) {
            logger.debug("Cache item stored", {
                cacheName: this.config.name,
                isTtlEnabled: requestedTTL > 0,
                key,
                ttlMs: requestedTTL,
            });
        }

        if (options?.emitEvent ?? true) {
            this.emitEvent("internal:cache:item-cached", {
                key,
                ...(requestedTTL > 0 && { ttl: requestedTTL }),
            });
        }
    }
}
