/**
 * Type definitions for Electron main process.
 *
 * @remarks
 * Core data structures for site monitoring functionality.
 *
 * @packageDocumentation
 */

import type { MonitorType as RegistryMonitorType } from "./services/monitoring/MonitorTypeRegistry";

// Re-export for use throughout the application
export type MonitorType = RegistryMonitorType;

/**
 * Allowed status values for a monitor's current operational state.
 * @public
 */
export type MonitorStatus = "up" | "down" | "pending" | "paused";

/**
 * Allowed status values for historical check results.
 *
 * @remarks
 * Similar to {@link MonitorStatus} but excludes `"pending"` since historical
 * records only capture actual check outcomes, not transitional states.
 *
 * @public
 */
export type StatusHistoryStatus = "up" | "down" | "paused";

/**
 * Monitor configuration and state interface.
 *
 * @remarks
 * Represents a single monitoring endpoint that can check either HTTP/HTTPS URLs
 * or TCP port connectivity. Each monitor maintains its current status, performance
 * metrics, and historical data.
 *
 * @example
 * ```typescript
 * // HTTP monitor example
 * const httpMonitor: Monitor = {
 *   id: "mon_123",
 *   type: "http",
 *   status: "up",
 *   responseTime: 250,
 *   monitoring: true,
 *   url: "https://example.com",
 *   history: []
 * };
 *
 * // Port monitor example
 * const portMonitor: Monitor = {
 *   id: "mon_456",
 *   type: "port",
 *   status: "down",
 *   responseTime: -1,
 *   monitoring: true,
 *   host: "example.com",
 *   port: 80,
 *   history: []
 * };
 * ```
 *
 * @public
 */
export interface Monitor {
    /**
     * Unique identifier for this monitor.
     *
     * @remarks
     * Usually a UUID or database-generated ID converted to string.
     * Used for referencing this monitor across the application.
     */
    id: string;

    /**
     * Type of monitoring performed by this monitor.
     *
     * @see {@link MonitorType}
     */
    type: MonitorType;

    /**
     * Current operational status of the monitor.
     *
     * @remarks
     * Includes `"pending"` state for monitors that haven't been checked yet.
     *
     * @see {@link MonitorStatus}
     */
    status: MonitorStatus;

    /**
     * Last recorded response time in milliseconds.
     *
     * @remarks
     * - For successful checks: actual response time
     * - For failed checks: may be timeout value or -1
     * - For unchecked monitors: typically -1 as sentinel value
     *
     * @defaultValue -1
     */
    responseTime: number;

    /**
     * Timestamp of the most recent check attempt.
     *
     * @remarks
     * `undefined` for monitors that have never been checked.
     * Uses JavaScript Date object for consistent time handling.
     */
    lastChecked?: Date;

    /**
     * Array of historical check results.
     *
     * @remarks
     * Ordered chronologically from oldest to newest. May be empty for
     * new monitors. Typically limited to a maximum number of entries
     * for performance and storage efficiency.
     *
     * @see {@link StatusHistory}
     */
    history: StatusHistory[];

    /**
     * Whether this monitor is actively being checked.
     *
     * @remarks
     * When `false`, the monitor exists but checks are not performed.
     * Useful for temporarily disabling monitors without deleting them.
     *
     * @defaultValue true
     */
    monitoring: boolean;

    /**
     * URL endpoint for HTTP monitors.
     *
     * @remarks
     * Required for `type: "http"` monitors. Must be `undefined` for other types.
     * Should include protocol (http:// or https://).
     *
     * @example "https://api.example.com/health"
     */
    url?: string;

    /**
     * Hostname or IP address for port monitors.
     *
     * @remarks
     * Required for `type: "port"` monitors. Must be `undefined` for other types.
     * Can be domain name, IPv4, or IPv6 address.
     *
     * @example "example.com" | "192.168.1.1" | "::1"
     */
    host?: string;

    /**
     * Port number for port monitors.
     *
     * @remarks
     * Required for `type: "port"` monitors. Must be `undefined` for other types.
     * Valid range: 1-65535.
     *
     * @example 80 | 443 | 3000
     */
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
