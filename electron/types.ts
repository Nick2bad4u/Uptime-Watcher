/**
 * Type definitions for Electron main process.
 *
 * @remarks
 * Core data structures for site monitoring functionality.
 *
 * @packageDocumentation
 */

/**
 * Monitor configuration and state interface.
 *
 * @remarks
 * Represents a single monitoring endpoint that can check either HTTP/HTTPS URLs
 * or TCP port connectivity. Each monitor maintains its current status, performance
 * metrics, and historical data.
 *
 * **Field requirements by monitor type:**
 * - For monitors with `type: "http"`: `url` is required; `host` and `port` must be `undefined`.
 * - For monitors with `type: "port"`: `host` and `port` are required; `url` must be `undefined`.
 * - For other monitor types, refer to their specific documentation.
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
     * Check interval in milliseconds (per-monitor override).
     *
     * @remarks
     * Defaults to global check interval if not specified.
     */
    checkInterval: number;

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
     * Unique identifier for this monitor.
     *
     * @remarks
     * Usually a UUID or database-generated ID converted to string.
     * Used for referencing this monitor across the application.
     */
    id: string;

    /**
     * Timestamp of the most recent check attempt.
     *
     * @remarks
     * `undefined` for monitors that have never been checked.
     * Uses JavaScript Date object for consistent time handling.
     */
    lastChecked?: Date;

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
     * Number of retry attempts before marking as down for this monitor.
     *
     * @remarks
     * - If set to `0`, no retries will be performed (the monitor will be marked as down after the first failure).
     * - Defaults to global retry attempts if not specified.
     * - Any positive integer specifies the number of additional attempts after the initial failure.
     */
    retryAttempts: number;

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
     * Request timeout in milliseconds for this monitor.
     *
     * @remarks
     * Defaults to global timeout value if not specified.
     */
    timeout: number;
    /**
     * Type of monitoring performed by this monitor.
     *
     * @see {@link MonitorType}
     */
    type: MonitorType;
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
}

/**
 * Allowed status values for a monitor's current operational state.
 * @public
 */
export type MonitorStatus = "down" | "paused" | "pending" | "up";

/**
 * Core monitor types supported by the system.
 *
 * @remarks
 * This union type represents the monitor types that the system supports.
 * Additional types can be registered at runtime through the MonitorTypeRegistry,
 * but they must extend this base set for TypeScript compatibility.
 */
export type MonitorType = "http" | "port";

/**
 * Site configuration containing multiple monitors.
 * Represents a logical grouping of monitors for a single service/website.
 *
 * @remarks
 * The `identifier` field must be globally unique across all workspaces and sites.
 * Typically, this is a UUID and is used as the primary key throughout the application.
 */
export interface Site {
    /**
     * Globally unique identifier for the site (UUID, used as the key everywhere).
     *
     * @remarks
     * This identifier must be unique across all workspaces and sites.
     */
    identifier: string;
    /**
     * Whether monitoring is active for this site.
     *
     * @remarks
     * Defaults to true for new sites.
     */
    monitoring: boolean;
    /**
     * Array of monitors associated with this site.
     *
     * @remarks
     * This array may be empty if the site has no monitors configured.
     */
    monitors: Monitor[];
    /**
     * Display name for the site.
     *
     * @remarks
     * Defaults to "Unnamed Site" if not provided.
     */
    name: string;
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
    /** Optional additional details about the check */
    details?: string;
    /** Response time in milliseconds */
    responseTime: number;
    /**
     * Result status of the check.
     *
     * @remarks
     * Does not include `"pending"`; only actual check outcomes are recorded.
     */
    status: StatusHistoryType;
    /** Timestamp when the check was performed */
    timestamp: number;
}

/**
 * Allowed status values for historical check results.
 * @public
 */
export type StatusHistoryType = "down" | "up";

/**
 * Status update event payload.
 *
 * Represents a status update for a site, including the site data and the previous status.
 *
 * @remarks
 * The `previousStatus` property is present only for status change events (e.g., when a monitor's status transitions from one state to another).
 * For other event types (such as initial load or manual refresh), `previousStatus` may be `undefined`.
 */
export interface StatusUpdate {
    /**
     * The previous status of the monitor before this update.
     * Present only for status change events; otherwise, may be `undefined`.
     */
    previousStatus?: MonitorStatus;
    site: Site;
}
