/**
 * Standardized cache configuration constants for consistent caching behavior
 * across all managers and services.
 *
 * @remarks
 * Provides centralized cache configuration to ensure consistent TTL values,
 * size limits, and naming conventions throughout the application. These
 * constants are used by StandardizedCache instances in managers and services.
 *
 * @packageDocumentation
 */

/**
 * Cache configuration interface for type safety.
 */
interface CacheConfigItem {
    readonly name: string;
    readonly defaultTTL: number;
    readonly maxSize: number;
    readonly enableStats: boolean;
}

/**
 * Cache configuration collection type.
 */
interface CacheConfigCollection {
    readonly SITES: CacheConfigItem;
    readonly MONITORS: CacheConfigItem;
    readonly SETTINGS: CacheConfigItem;
    readonly VALIDATION: CacheConfigItem;
    readonly TEMPORARY: CacheConfigItem;
}

/**
 * Cache configuration for different data types.
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
 */
export const CACHE_CONFIG: CacheConfigCollection = Object.freeze({
    /**
     * Configuration for site data caching.
     *
     * @remarks
     * Used by SiteManager for caching site information with moderate expiration
     * time suitable for site management operations.
     */
    SITES: Object.freeze({
        /** Cache name identifier */
        name: "sites",
        /** TTL: 10 minutes - balances freshness with performance */
        defaultTTL: 600_000,
        /** Maximum entries: 500 sites */
        maxSize: 500,
        /** Enable statistics tracking */
        enableStats: true,
    }),

    /**
     * Configuration for monitor data caching.
     *
     * @remarks
     * Used by MonitorManager for caching monitor status and configuration with
     * shorter expiration for real-time monitoring needs.
     */
    MONITORS: Object.freeze({
        /** Cache name identifier */
        name: "monitors",
        /** TTL: 5 minutes - shorter for real-time monitoring */
        defaultTTL: 300_000,
        /** Maximum entries: 1000 monitors */
        maxSize: 1000,
        /** Enable statistics tracking */
        enableStats: true,
    }),

    /**
     * Configuration for application settings caching.
     *
     * @remarks
     * Used by ConfigurationManager for caching configuration values with longer
     * expiration since settings change infrequently.
     */
    SETTINGS: Object.freeze({
        /** Cache name identifier */
        name: "settings",
        /** TTL: 30 minutes - longer for infrequently changing data */
        defaultTTL: 1_800_000,
        /** Maximum entries: 100 settings */
        maxSize: 100,
        /** Enable statistics tracking */
        enableStats: true,
    }),

    /**
     * Configuration for validation results caching.
     *
     * @remarks
     * Used by ConfigurationManager for caching validation results with moderate
     * expiration to balance accuracy with performance.
     */
    VALIDATION: Object.freeze({
        /** Cache name identifier */
        name: "validation-results",
        /** TTL: 5 minutes - moderate for validation accuracy */
        defaultTTL: 300_000,
        /** Maximum entries: 200 validation results */
        maxSize: 200,
        /** Enable statistics tracking */
        enableStats: true,
    }),

    /**
     * Configuration for temporary operations caching.
     *
     * @remarks
     * Used by service factories and temporary operations with short expiration
     * and disabled stats for performance.
     */
    TEMPORARY: Object.freeze({
        /** Cache name identifier prefix (append operation type) */
        name: "temporary",
        /** TTL: 5 minutes - short for temporary data */
        defaultTTL: 300_000,
        /** Maximum entries: 1000 temporary items */
        maxSize: 1000,
        /** Disable statistics for performance */
        enableStats: false,
    }),
} as const);

/**
 * Cache naming interface for type safety.
 */
interface CacheNamesCollection {
    readonly temporary: (operation: string) => string;
    readonly sites: (suffix?: string) => string;
    readonly monitors: (suffix?: string) => string;
    readonly settings: (suffix?: string) => string;
}

/**
 * Cache naming patterns for consistent naming across the application.
 *
 * @remarks
 * Provides standardized naming functions to ensure consistent cache naming
 * conventions, especially for temporary and dynamic caches.
 */
export const CACHE_NAMES: CacheNamesCollection = Object.freeze({
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
    sites: (suffix?: string): string => (suffix ? `sites-${suffix}` : "sites"),

    /**
     * Generate a monitors cache name with optional suffix.
     *
     * @param suffix - Optional suffix (e.g., "temp", "backup")
     *
     * @returns Standardized monitors cache name
     */
    monitors: (suffix?: string): string =>
        suffix ? `monitors-${suffix}` : "monitors",

    /**
     * Generate a settings cache name with optional suffix.
     *
     * @param suffix - Optional suffix (e.g., "temp", "backup")
     *
     * @returns Standardized settings cache name
     */
    settings: (suffix?: string): string =>
        suffix ? `settings-${suffix}` : "settings",
} as const);

/**
 * Type definitions for cache configuration.
 */
export type CacheConfigType = typeof CACHE_CONFIG;
export type CacheConfigKey = keyof CacheConfigType;
export type CacheConfig = CacheConfigType[CacheConfigKey];
