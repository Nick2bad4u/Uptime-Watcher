/**
 * Type definitions for Electron main process.
 * Defines core data structures for site monitoring functionality.
 */

/**
 * Supported monitor types.
 *
 * @remarks
 * Defines the types of monitoring supported by the application.
 * - "http": HTTP/HTTPS endpoint monitoring
 * - "port": TCP port monitoring
 */
export type MonitorType = "http" | "port";

/**
 * Allowed status values for a monitor's current state.
 *
 * @remarks
 * Includes "pending" for monitors that have not yet been checked.
 */
export type MonitorStatus = "up" | "down" | "pending" | "paused";

/**
 * Allowed status values for a historical check result.
 *
 * @remarks
 * Does not include "pending"; only actual check outcomes are recorded.
 */
export type StatusHistoryStatus = "up" | "down" | "paused";

/**
 * Monitor configuration and state.
 * Represents a single monitoring endpoint (HTTP URL or TCP port).
 *
 * @remarks
 * The `status` property includes `"pending"` to represent a monitor that has not yet been checked or is awaiting its first result.
 * This is distinct from `StatusHistory.status`, which only records actual check outcomes and does not include `"pending"`.
 */
export interface Monitor {
    /** Unique string identifier for this monitor (UUID or DB id as string) */
    id: string;
    /** Type of monitor (HTTP or port check) */
    type: MonitorType;
    /**
     * Current status of the monitor.
     *
     * @remarks
     * Includes `"pending"` to indicate the monitor has not yet been checked.
     */
    status: MonitorStatus;
    /**
     * Last recorded response time in milliseconds.
     *
     * @remarks
     * If the monitor has never been checked, this will be set to -1 as a sentinel value.
     * Otherwise, it will be the last measured response time in milliseconds.
     */
    responseTime: number;
    /**
     * Timestamp of last check (Unix timestamp in milliseconds).
     *
     * @remarks
     * Will be `undefined` if the monitor has never been checked (i.e., before the first check).
     * Uses the same format as the `timestamp` property in `StatusHistory` for consistency.
     */
    lastChecked?: Date;
    /**
     * Historical check results, ordered from oldest to newest.
     *
     * @remarks
     * The first element is the oldest check; the last element is the most recent.
     * This array may be empty if no checks have been performed yet.
     * For performance and storage reasons, implementers should typically enforce a maximum length (e.g., keep only the most recent N results).
     */
    history: StatusHistory[];
    /**
     * Whether this specific monitor is actively being monitored.
     *
     * @remarks
     * Defaults to true for new monitors.
     */
    monitoring: boolean;
    /**
     * URL to monitor.
     * Only set for HTTP monitors; will be undefined for other monitor types.
     *
     * @remarks
     * This property must never be set at the same time as `host`. Implementers must ensure that only one of `url` (for HTTP monitors)
     * or `host` (for port monitors) is set for a given monitor. If both are set, this indicates a configuration error.
     */
    url?: string;
    /**
     * Hostname or IP to monitor.
     * Only set for port monitors; will be undefined for other monitor types.
     *
     * @remarks
     * This property must never be set at the same time as `url`. Implementers must ensure that only one of `host` (for port monitors)
     * or `url` (for HTTP monitors) is set for a given monitor. If both are set, this indicates a configuration error.
     * This exclusivity is enforced to prevent ambiguous configuration and ensure type safety.
     */
    host?: string;
    /** Port number for port monitors */
    port?: number;
    /**
     * Check interval in milliseconds (per-monitor override).
     *
     * @remarks
     * Defaults to global check interval if not specified.
     */
    checkInterval: number;
    /**
     * Request timeout in milliseconds for this monitor.
     *
     * @remarks
     * Defaults to global timeout value if not specified.
     */
    timeout: number;
    /**
     * Number of retry attempts before marking as down for this monitor.
     *
     * @remarks
     * - If set to `0`, no retries will be performed (the monitor will be marked as down after the first failure).
     * - Defaults to global retry attempts if not specified.
     * - Any positive integer specifies the number of additional attempts after the initial failure.
     */
    retryAttempts: number;
}

/**
 * Site configuration containing multiple monitors.
 * Represents a logical grouping of monitors for a single service/website.
 */
export interface Site {
    /** Unique identifier for the site (UUID, used as the key everywhere) */
    identifier: string;
    /**
     * Display name for the site.
     *
     * @remarks
     * Defaults to "Unnamed Site" if not provided.
     */
    name: string;
    /**
     * Array of monitors associated with this site.
     *
     * @remarks
     * This array may be empty if the site has no monitors configured.
     */
    monitors: Monitor[];
    /**
     * Whether monitoring is active for this site.
     *
     * @remarks
     * Defaults to true for new sites.
     */
    monitoring: boolean;
}

/**
 * Historical monitoring data point.
 * Records the result of a single monitor check.
 *
 * @remarks
 * The `status` property does not include `"pending"` because only actual check results are recorded in history.
 * `"pending"` is used in `Monitor.status` to indicate a monitor has not yet been checked, but is never stored in history.
 */
export interface StatusHistory {
    /** Timestamp when the check was performed */
    timestamp: number;
    /**
     * Result status of the check.
     *
     * @remarks
     * Does not include `"pending"`; only actual check outcomes are recorded.
     */
    status: StatusHistoryStatus;
    /** Response time in milliseconds */
    responseTime: number;
    /** Optional additional details about the check */
    details?: string;
}

/**
 * Status update event payload.
 *
 * Represents a status update for a site, including the site data and the previous status.
 */
export interface StatusUpdate {
    site: Site;
    previousStatus?: MonitorStatus;
}
