/**
 * Backend constants for the Uptime Watcher application.
 * Contains monitoring defaults, timeouts, and configuration values.
 */

/** Default timeout for HTTP requests (10 seconds) */
export const DEFAULT_REQUEST_TIMEOUT = 10000;

/** Default check interval for new monitors (5 minutes) */
export const DEFAULT_CHECK_INTERVAL = 300000;

/** User agent string for HTTP requests */
export const USER_AGENT = "Uptime-Watcher/1.0";

/** Retry backoff configuration */
export const RETRY_BACKOFF = Object.freeze({
    INITIAL_DELAY: 500, // Initial delay in milliseconds
    MAX_DELAY: 5000, // Maximum delay in milliseconds
});

/** Default history limit (500 records) */
export const DEFAULT_HISTORY_LIMIT = 500;

/** Event name for status updates (kept for backwards compatibility) */
export const STATUS_UPDATE_EVENT = "status-update";

/** Allowed monitor types */
export const MONITOR_TYPES = ["http", "port"] as const;
