/**
 * Backend constants for the Uptime Watcher application.
 *
 * @remarks
 * This module defines configuration values and operational defaults used throughout
 * the Electron main process and backend services.
 *
 * @packageDocumentation
 */

/**
 * Default timeout for HTTP requests in milliseconds.
 *
 * @remarks
 * Used by monitor checks and HTTP-based integrations to determine how long to wait
 * before aborting a request.
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
 * Sent as the `User-Agent` header in all outbound HTTP requests performed by the backend.
 *
 * @defaultValue "Uptime-Watcher/1.0"
 */
export const USER_AGENT = "Uptime-Watcher/1.0";

/**
 * Retry backoff configuration for failed operations.
 *
 * @remarks
 * Used for exponential backoff when retrying failed network or database operations,
 * to avoid overwhelming external services or the local system.
 *
 * @example
 * ```ts
 * let delay = RETRY_BACKOFF.INITIAL_DELAY;
 * while (shouldRetry) {
 *   await wait(delay);
 *   delay = Math.min(delay * 2, RETRY_BACKOFF.MAX_DELAY);
 * }
 * ```
 */
export const RETRY_BACKOFF = Object.freeze({
    /** Initial delay in milliseconds before first retry. */
    INITIAL_DELAY: 500,
    /** Maximum delay in milliseconds between retries. */
    MAX_DELAY: 5000,
});

/**
 * Default number of history records to retain per monitor.
 *
 * @remarks
 * Used to limit the number of status check records stored for each monitor in the database.
 *
 * @defaultValue 500
 */
export const DEFAULT_HISTORY_LIMIT = 500;

/**
 * Cache TTL values for standardized caching in milliseconds.
 *
 * @remarks
 * Used by ConfigurationManager and other backend services to provide consistent
 * cache expiration behavior.
 */
export const CACHE_TTL = Object.freeze({
    /** TTL for configuration values cache (30 minutes). */
    CONFIGURATION_VALUES: 1_800_000,
    /** TTL for validation results cache (5 minutes). */
    VALIDATION_RESULTS: 300_000,
});

/**
 * Cache size limits for standardized caching.
 *
 * @remarks
 * Used by ConfigurationManager and other backend services to provide consistent
 * cache size constraints.
 */
export const CACHE_SIZE_LIMITS = Object.freeze({
    /** Maximum entries for configuration values cache. */
    CONFIGURATION_VALUES: 50,
    /** Maximum entries for validation results cache. */
    VALIDATION_RESULTS: 100,
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
