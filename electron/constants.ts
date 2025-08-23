/**
 * Backend constants for the Uptime Watcher application.
 *
 * @remarks
 * This module defines configuration values and operational defaults used
 * throughout the Electron main process and backend services.
 *
 * @packageDocumentation
 */

import { CACHE_CONFIG } from "@shared/constants/cacheConfig";

/**
 * Interface for cache size limits configuration.
 */
interface CacheSizeLimitsConfig {
    readonly CONFIGURATION_VALUES: number;
    readonly MONITORS: number;
    readonly SITES: number;
    readonly TEMPORARY: number;
    readonly VALIDATION_RESULTS: number;
}

/**
 * Interface for cache TTL configuration.
 */
interface CacheTtlConfig {
    readonly CONFIGURATION_VALUES: number;
    readonly MONITORS: number;
    readonly SITES: number;
    readonly TEMPORARY: number;
    readonly VALIDATION_RESULTS: number;
}

/**
 * Interface for retry backoff configuration.
 */
interface RetryBackoffConfig {
    readonly INITIAL_DELAY: number;
    readonly MAX_DELAY: number;
}

/**
 * Default timeout for HTTP requests in milliseconds.
 *
 * @remarks
 * Used by monitor checks and HTTP-based integrations to determine how long to
 * wait before aborting a request.
 *
 * @defaultValue 10000
 */
export const DEFAULT_REQUEST_TIMEOUT = 10_000;

/**
 * Default check interval for new monitors in milliseconds.
 *
 * @remarks
 * Determines how frequently a monitor will check its target by default.
 *
 * @defaultValue 300000
 */
export const DEFAULT_CHECK_INTERVAL = 300_000;

/**
 * User agent string for HTTP requests.
 *
 * @remarks
 * Sent as the `User-Agent` header in all outbound HTTP requests performed by
 * the backend.
 *
 * @defaultValue "Uptime-Watcher/1.0"
 */
export const USER_AGENT = "Uptime-Watcher/1.0";

/**
 * Retry backoff configuration for failed operations.
 *
 * @remarks
 * Used for exponential backoff when retrying failed network or database
 * operations, to avoid overwhelming external services or the local system.
 *
 * @example
 *
 * ```ts
 * let delay = RETRY_BACKOFF.INITIAL_DELAY;
 * while (shouldRetry) {
 *     await wait(delay);
 *     delay = Math.min(delay * 2, RETRY_BACKOFF.MAX_DELAY);
 * }
 * ```
 */
export const RETRY_BACKOFF: RetryBackoffConfig = Object.freeze({
    /** Initial delay in milliseconds before first retry. */
    INITIAL_DELAY: 500,
    /** Maximum delay in milliseconds between retries. */
    MAX_DELAY: 5000,
});

/**
 * Default number of history records to retain per monitor.
 *
 * @remarks
 * Used to limit the number of status check records stored for each monitor in
 * the database.
 *
 * @defaultValue 500
 */
export const DEFAULT_HISTORY_LIMIT = 500;

/**
 * Cache TTL values for standardized caching in milliseconds.
 *
 * @remarks
 * Used by ConfigurationManager and other backend services to provide consistent
 * cache expiration behavior. References shared cache configuration.
 */
export const CACHE_TTL: CacheTtlConfig = Object.freeze({
    /** TTL for configuration values cache. */
    CONFIGURATION_VALUES: CACHE_CONFIG.SETTINGS.defaultTTL,
    /** TTL for monitor data cache. */
    MONITORS: CACHE_CONFIG.MONITORS.defaultTTL,
    /** TTL for site data cache. */
    SITES: CACHE_CONFIG.SITES.defaultTTL,
    /** TTL for temporary cache operations. */
    TEMPORARY: CACHE_CONFIG.TEMPORARY.defaultTTL,
    /** TTL for validation results cache. */
    VALIDATION_RESULTS: CACHE_CONFIG.VALIDATION.defaultTTL,
});

/**
 * Cache size limits for standardized caching.
 *
 * @remarks
 * Used by ConfigurationManager and other backend services to provide consistent
 * cache size constraints. References shared cache configuration.
 */
export const CACHE_SIZE_LIMITS: CacheSizeLimitsConfig = Object.freeze({
    /** Maximum entries for configuration values cache. */
    CONFIGURATION_VALUES: CACHE_CONFIG.SETTINGS.maxSize,
    /** Maximum entries for monitor data cache. */
    MONITORS: CACHE_CONFIG.MONITORS.maxSize,
    /** Maximum entries for site data cache. */
    SITES: CACHE_CONFIG.SITES.maxSize,
    /** Maximum entries for temporary cache operations. */
    TEMPORARY: CACHE_CONFIG.TEMPORARY.maxSize,
    /** Maximum entries for validation results cache. */
    VALIDATION_RESULTS: CACHE_CONFIG.VALIDATION.maxSize,
});

/**
 * Main database file name.
 *
 * @remarks
 * The default SQLite database file used for persistent storage.
 *
 * @defaultValue "uptime-watcher.sqlite"
 */
export const DB_FILE_NAME = "uptime-watcher.sqlite";

/**
 * Default site name when no name is provided.
 *
 * @remarks
 * Used as a fallback label for sites created without a user-specified name.
 *
 * @defaultValue "Unnamed Site"
 */
export const DEFAULT_SITE_NAME = "Unnamed Site";

/**
 * Backup database file name for data export/import operations.
 *
 * @remarks
 * Used when exporting or importing a backup of the main database.
 *
 * @defaultValue "uptime-watcher-backup.sqlite"
 */
export const BACKUP_DB_FILE_NAME = "uptime-watcher-backup.sqlite";
