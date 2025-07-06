/**
 * Type definitions for Electron main process.
 * Defines core data structures for site monitoring functionality.
 */

/** Supported monitor types */
export type MonitorType = "http" | "port";

/**
 * Monitor configuration and state.
 * Represents a single monitoring endpoint (HTTP URL or TCP port).
 */
export interface Monitor {
    /** Unique string identifier for this monitor (UUID or DB id as string) */
    id: string;
    /** Type of monitor (HTTP or port check) */
    type: MonitorType;
    /** Current status of the monitor */
    status: "up" | "down" | "pending" | "paused";
    /** Last recorded response time in milliseconds */
    responseTime?: number | undefined;
    /** Timestamp of last check */
    lastChecked?: Date | undefined;
    /** Historical check results */
    history: StatusHistory[];
    /** Whether this specific monitor is actively being monitored */
    monitoring?: boolean | undefined;
    /** URL to monitor (HTTP monitors only) */
    url?: string | undefined;
    /** Hostname or IP for port monitors */
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
    /** Whether monitoring is active for this site */
    monitoring?: boolean | undefined;
}

/**
 * Historical monitoring data point.
 * Records the result of a single monitor check.
 */
export interface StatusHistory {
    /** Timestamp when the check was performed */
    timestamp: number;
    /** Result status of the check */
    status: "up" | "down" | "paused";
    /** Response time in milliseconds */
    responseTime: number;
    /** Optional additional details about the check */
    details?: string | undefined;
}

export interface StatusUpdate {
    site: Site;
    previousStatus?: "up" | "down" | "pending" | "paused" | undefined;
}
