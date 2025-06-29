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
    status: "up" | "down" | "pending";
    /** Last recorded response time in milliseconds */
    responseTime?: number;
    /** Timestamp of last check */
    lastChecked?: Date;
    /** Historical check results */
    history: StatusHistory[];
    /** Whether this specific monitor is actively being monitored */
    monitoring?: boolean;
    /** URL to monitor (HTTP monitors only) */
    url?: string;
    /** Hostname or IP for port monitors */
    host?: string;
    /** Port number for port monitors */
    port?: number;
    /** Check interval in milliseconds (per-monitor override) */
    checkInterval?: number;
    /** Request timeout in milliseconds for this monitor */
    timeout?: number;
}

/**
 * Site configuration containing multiple monitors.
 * Represents a logical grouping of monitors for a single service/website.
 */
export interface Site {
    /** Unique identifier for the site (UUID, used as the key everywhere) */
    identifier: string;
    /** Display name for the site */
    name?: string;
    /** Array of monitors associated with this site */
    monitors: Monitor[];
    /** Whether monitoring is active for this site */
    monitoring?: boolean;
}

/**
 * Historical monitoring data point.
 * Records the result of a single monitor check.
 */
export interface StatusHistory {
    /** Timestamp when the check was performed */
    timestamp: number;
    /** Result status of the check */
    status: "up" | "down";
    /** Response time in milliseconds */
    responseTime: number;
    /** Optional additional details about the check */
    details?: string;
}

export interface StatusUpdate {
    site: Site;
    previousStatus?: "up" | "down" | "pending";
}
