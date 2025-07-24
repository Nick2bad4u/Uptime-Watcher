/**
 * Backend constants for the Uptime Watcher application.
 *
 * @remarks
 * Contains monitoring defaults, timeouts, and configuration values used throughout
 * the backend process.
 *
 * @packageDocumentation
 */

/**
 * Default timeout for HTTP requests in milliseconds.
 * @defaultValue 10000
 */
export const DEFAULT_REQUEST_TIMEOUT = 10_000;

/**
 * Default check interval for new monitors in milliseconds.
 * @defaultValue 300000
 */
export const DEFAULT_CHECK_INTERVAL = 300_000;

/**
 * User agent string for HTTP requests.
 * @defaultValue "Uptime-Watcher/1.0"
 */
export const USER_AGENT = "Uptime-Watcher/1.0";

/**
 * Retry backoff configuration for failed operations.
 * @remarks Uses exponential backoff to avoid overwhelming failing services.
 */
export const RETRY_BACKOFF = Object.freeze({
    /** Initial delay in milliseconds before first retry */
    INITIAL_DELAY: 500,
    /** Maximum delay in milliseconds between retries */
    MAX_DELAY: 5000,
});

/**
 * Default number of history records to retain per monitor.
 * @defaultValue 500
 */
export const DEFAULT_HISTORY_LIMIT = 500;

/**
 * Cache TTL values for standardized caching in milliseconds.
 * @remarks Used by ConfigurationManager and other services for consistent cache behavior.
 */
export const CACHE_TTL = Object.freeze({
    /** TTL for configuration values cache (30 minutes) */
    CONFIGURATION_VALUES: 1_800_000,
    /** TTL for validation results cache (5 minutes) */
    VALIDATION_RESULTS: 300_000,
});

/**
 * Cache size limits for standardized caching.
 * @remarks Used by ConfigurationManager and other services for consistent cache behavior.
 */
export const CACHE_SIZE_LIMITS = Object.freeze({
    /** Maximum entries for configuration values cache */
    CONFIGURATION_VALUES: 50,
    /** Maximum entries for validation results cache */
    VALIDATION_RESULTS: 100,
});

/**
 * Main database file name.
 * @defaultValue "uptime-watcher.sqlite"
 */
export const DB_FILE_NAME = "uptime-watcher.sqlite";

/**
 * Default site name when no name is provided.
 * @defaultValue "Unnamed Site"
 */
export const DEFAULT_SITE_NAME = "Unnamed Site";

/**
 * Default database file name for backups.
 * @defaultValue "uptime-watcher-backup.sqlite"
 */
export const DATABASE_FILE_NAME = "uptime-watcher-backup.sqlite";
