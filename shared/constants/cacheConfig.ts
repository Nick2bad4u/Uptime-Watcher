/**
 * Immutable cache configuration entry used to build {@link CACHE_CONFIG}.
 *
 * @internal
 */
interface CacheConfigItem {
    /** Enables metrics collection for cache hit/miss tracking. */
    readonly enableStats: boolean;
    /** Upper bound on cached entries. */
    readonly maxSize: number;
    /** Human-readable cache identifier. */
    readonly name: string;
    /** Duration in milliseconds before entries expire. */
    readonly ttl: number;
}

/**
 * Internal structure describing the {@link CACHE_CONFIG} constant.
 *
 * @internal
 */
interface CacheConfigCollection {
    readonly MONITORS: CacheConfigItem;
    readonly SETTINGS: CacheConfigItem;
    readonly SITES: CacheConfigItem;
    readonly TEMPORARY: CacheConfigItem;
    readonly VALIDATION: CacheConfigItem;
}

/**
 * Centralized cache configuration used across shared managers and services.
 *
 * @remarks
 * The configurations are deeply frozen to guarantee immutability when shared
 * between Electron and renderer processes.
 *
 * @example
 *
 * ```typescript
 * import { CACHE_CONFIG } from "shared/constants/cacheConfig";
 *
 * const sitesCache = new StandardizedCache<Site>({
 *     ...CACHE_CONFIG.SITES,
 *     eventEmitter: this.eventEmitter,
 * });
 * ```
 *
 * @public
 */
export const CACHE_CONFIG: CacheConfigCollection = Object.freeze({
    /**
     * Configuration for monitor data caching.
     *
     * @remarks
     * Used by MonitorManager for caching monitor status and configuration with
     * shorter expiration for real-time monitoring needs.
     */
    MONITORS: Object.freeze({
        /** Enable statistics tracking */
        enableStats: true,
        /** Maximum entries: 1000 monitors */
        maxSize: 1000,
        /** Cache name identifier */
        name: "monitors",
        /** TTL: 5 minutes - shorter for real-time monitoring */
        ttl: 300_000,
    }),

    /**
     * Configuration for application settings caching.
     *
     * @remarks
     * Used by ConfigurationManager for caching configuration values with longer
     * expiration since settings change infrequently.
     */
    SETTINGS: Object.freeze({
        /** Enable statistics tracking */
        enableStats: true,
        /** Maximum entries: 100 settings */
        maxSize: 100,
        /** Cache name identifier */
        name: "settings",
        /** TTL: 30 minutes - longer for infrequently changing data */
        ttl: 1_800_000,
    }),

    /**
     * Configuration for site data caching.
     *
     * @remarks
     * Used by SiteManager for caching site information with moderate expiration
     * time suitable for site management operations.
     */
    SITES: Object.freeze({
        /** Enable statistics tracking */
        enableStats: true,
        /** Maximum entries: 500 sites */
        maxSize: 500,
        /** Cache name identifier */
        name: "sites",
        /** TTL: 10 minutes - balances freshness with performance */
        ttl: 600_000,
    }),

    /**
     * Configuration for temporary operations caching.
     *
     * @remarks
     * Used by service factories and temporary operations with short expiration
     * and disabled stats for performance.
     */
    TEMPORARY: Object.freeze({
        /** Disable statistics for performance */
        enableStats: false,
        /** Maximum entries: 1000 temporary items */
        maxSize: 1000,
        /** Cache name identifier prefix (append operation type) */
        name: "temporary",
        /** TTL: 5 minutes - short for temporary data */
        ttl: 300_000,
    }),

    /**
     * Configuration for validation results caching.
     *
     * @remarks
     * Used by ConfigurationManager for caching validation results with moderate
     * expiration to balance accuracy with performance.
     */
    VALIDATION: Object.freeze({
        /** Enable statistics tracking */
        enableStats: true,
        /** Maximum entries: 200 validation results */
        maxSize: 200,
        /** Cache name identifier */
        name: "validation-results",
        /** TTL: 5 minutes - moderate for validation accuracy */
        ttl: 300_000,
    }),
} as const);

/**
 * Internal structure describing cache naming helpers.
 *
 * @internal
 */
interface CacheNamesCollection {
    readonly monitors: (suffix?: string) => string;
    readonly settings: (suffix?: string) => string;
    readonly sites: (suffix?: string) => string;
    readonly temporary: (operation: string) => string;
}

/**
 * Cache naming helpers for consistent cache identifiers.
 *
 * @remarks
 * Standardizes naming conventions for caches, especially temporary caches that
 * append operational context to support debugging.
 *
 * @public
 */
export const CACHE_NAMES: CacheNamesCollection = Object.freeze({
    /**
     * Generate a monitors cache name with optional suffix.
     *
     * @param suffix - Optional suffix (e.g., "temp", "backup")
     *
     * @returns Standardized monitors cache name
     */
    monitors: (suffix?: string): string =>
        suffix === undefined ? "monitors" : `monitors-${suffix}`,

    /**
     * Generate a settings cache name with optional suffix.
     *
     * @param suffix - Optional suffix (e.g., "temp", "backup")
     *
     * @returns Standardized settings cache name
     */
    settings: (suffix?: string): string =>
        suffix === undefined ? "settings" : `settings-${suffix}`,

    /**
     * Generate a sites cache name with optional suffix.
     *
     * @example
     *
     * ```typescript
     * const cacheName = CACHE_NAMES.sites("temp"); // "sites-temp"
     * ```
     *
     * @param suffix - Optional suffix (e.g., "temp", "backup")
     *
     * @returns Standardized sites cache name
     */
    sites: (suffix?: string): string =>
        suffix === undefined ? "sites" : `sites-${suffix}`,

    /**
     * Generate a temporary cache name with operation suffix.
     *
     * @example
     *
     * ```typescript
     * const cacheName = CACHE_NAMES.temporary("import"); // "temporary-import"
     * ```
     *
     * @param operation - The operation type (e.g., "import", "export", "sync")
     *
     * @returns Standardized temporary cache name
     */
    temporary: (operation: string): string => `temporary-${operation}`,
} as const);

/**
 * Strongly typed view of the {@link CACHE_CONFIG} map.
 *
 * @public
 */
export type CacheConfigType = typeof CACHE_CONFIG;
/**
 * Union of cache configuration keys.
 *
 * @public
 */
export type CacheConfigKey = keyof CacheConfigType;
/**
 * Individual cache configuration entry type.
 *
 * @public
 */
export type CacheConfig = CacheConfigType[CacheConfigKey];
