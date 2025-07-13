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
 * Event name for status updates.
 * @defaultValue "status-update"
 */
export const STATUS_UPDATE_EVENT = "status-update";

/**
 * Supported monitor types in the application.
 * @deprecated Use MonitorTypeRegistry.getRegisteredMonitorTypes() instead
 * @readonly
 */
export const MONITOR_TYPES = ["http", "port"] as const;
