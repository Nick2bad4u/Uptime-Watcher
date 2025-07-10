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
    status: "up" | "down" | "pending" | "paused";
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
     * Use the same format as StatusHistory.timestamp for consistency.
     */
    lastChecked?: number | undefined;
    /** Historical check results */
    history: StatusHistory[];
    /**
     * Whether this specific monitor is actively being monitored.
     *
     * @remarks
     * This field is optional and may be `undefined`. Consuming code must handle the `undefined` case appropriately.
     */
    monitoring?: boolean | undefined;
    /**
     * URL to monitor.
     * Only set for HTTP monitors; will be undefined for other monitor types.
     */
    url?: string | undefined;
    /**
     * Hostname or IP to monitor.
     * Only set for port monitors; will be undefined for other monitor types.
     */
    host?: string | undefined;
    /** Port number for port monitors */
    port?: number | undefined;
    /** Check interval in milliseconds (per-monitor override) */
    checkInterval?: number | undefined;
    /** Request timeout in milliseconds for this monitor */
    timeout?: number | undefined;
    /** Number of retry attempts before marking as down for this monitor */
    retryAttempts?: number | undefined;
}

/**
 * Site configuration containing multiple monitors.
 * Represents a logical grouping of monitors for a single service/website.
 */
export interface Site {
    /** Unique identifier for the site (UUID, used as the key everywhere) */
    identifier: string;
    /** Display name for the site */
    name?: string | undefined;
    /** Array of monitors associated with this site */
    monitors: Monitor[];
    /**
     * Whether monitoring is active for this site.
     *
     * @remarks
     * This field is optional and may be `undefined`. Consuming code must handle the `undefined` case appropriately.
     */
    monitoring?: boolean | undefined;
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
    status: "up" | "down" | "paused";
    /** Response time in milliseconds */
    responseTime: number;
    /** Optional additional details about the check */
    details?: string | undefined;
}

/**
 * Status update event payload.
 *
 * Represents a status update for a site, including the site data and the previous status.
 */
export interface StatusUpdate {
    site: Site;
    previousStatus?: "up" | "down" | "pending" | "paused" | undefined;
}
