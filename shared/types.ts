/**
 * Shared type definitions used across frontend and backend.
 *
 * @remarks
 * All core domain types (Monitor, Site, StatusUpdate, etc.) live here. Both
 * frontend and backend must import from this file for consistency. Event types
 * are separate to avoid circular dependencies.
 *
 * @packageDocumentation
 */

/**
 * Canonical status kinds shared across monitors, sites, and history records.
 */
export const STATUS_KIND = {
    DEGRADED: "degraded",
    DOWN: "down",
    MIXED: "mixed",
    PAUSED: "paused",
    PENDING: "pending",
    UNKNOWN: "unknown",
    UP: "up",
} as const;

/**
 * Union of all recognized status kinds.
 */
export type StatusKind = (typeof STATUS_KIND)[keyof typeof STATUS_KIND];

type MonitorStatusTuple = readonly [
    typeof STATUS_KIND.DEGRADED,
    typeof STATUS_KIND.DOWN,
    typeof STATUS_KIND.PAUSED,
    typeof STATUS_KIND.PENDING,
    typeof STATUS_KIND.UP,
];

type SiteStatusTuple = readonly [
    typeof STATUS_KIND.DEGRADED,
    typeof STATUS_KIND.DOWN,
    typeof STATUS_KIND.MIXED,
    typeof STATUS_KIND.PAUSED,
    typeof STATUS_KIND.PENDING,
    typeof STATUS_KIND.UNKNOWN,
    typeof STATUS_KIND.UP,
];

type StatusHistoryTuple = readonly [
    typeof STATUS_KIND.UP,
    typeof STATUS_KIND.DOWN,
    typeof STATUS_KIND.DEGRADED,
];

/**
 * Ordered list of monitor-specific status values.
 */
export const MONITOR_STATUS_VALUES: MonitorStatusTuple = [
    STATUS_KIND.DEGRADED,
    STATUS_KIND.DOWN,
    STATUS_KIND.PAUSED,
    STATUS_KIND.PENDING,
    STATUS_KIND.UP,
];

/**
 * Ordered list of site status values (monitor statuses plus computed kinds).
 */
export const SITE_STATUS_VALUES: SiteStatusTuple = [
    STATUS_KIND.DEGRADED,
    STATUS_KIND.DOWN,
    STATUS_KIND.MIXED,
    STATUS_KIND.PAUSED,
    STATUS_KIND.PENDING,
    STATUS_KIND.UNKNOWN,
    STATUS_KIND.UP,
];

/**
 * Valid status values recorded in monitor history entries.
 */
export const STATUS_HISTORY_VALUES: StatusHistoryTuple = [
    STATUS_KIND.UP,
    STATUS_KIND.DOWN,
    STATUS_KIND.DEGRADED,
];

/**
 * Status values captured in historical monitor records.
 */
export type StatusHistoryStatus = StatusHistoryTuple[number];

/**
 * Status values for monitors.
 *
 * @remarks
 * Used throughout the system to represent the current state of a monitor.
 */
export type MonitorStatus = MonitorStatusTuple[number];

/**
 * HTTP method types supported by the application.
 *
 * @remarks
 * Used for HTTP monitor configurations and requests.
 *
 * @public
 */
export type HttpMethod = "DELETE" | "GET" | "HEAD" | "POST" | "PUT";

/**
 * Base monitor types - source of truth for type safety.
 *
 * @remarks
 * Used to enumerate all supported monitor types in the system.
 *
 * @public
 */
export const BASE_MONITOR_TYPES = [
    "http",
    "http-keyword",
    "http-status",
    "http-header",
    "http-json",
    "http-latency",
    "port",
    "ping",
    "dns",
    "ssl",
    "websocket-keepalive",
    "server-heartbeat",
    "replication",
    "cdn-edge-consistency",
] as const;

/**
 * Interface for monitor status constants.
 *
 * @public
 */
export interface MonitorStatusConstants {
    DEGRADED: typeof STATUS_KIND.DEGRADED;
    DOWN: typeof STATUS_KIND.DOWN;
    PAUSED: typeof STATUS_KIND.PAUSED;
    PENDING: typeof STATUS_KIND.PENDING;
    UP: typeof STATUS_KIND.UP;
}

/**
 * Type representing all supported monitor types.
 *
 * @remarks
 * Derived from {@link BASE_MONITOR_TYPES} for strict type safety.
 *
 * @public
 */
export type MonitorType = (typeof BASE_MONITOR_TYPES)[number];

/**
 * Status values for sites.
 *
 * @remarks
 * Can be a monitor status or special values "mixed" or "unknown".
 *
 * @public
 */
export type SiteStatus = SiteStatusTuple[number];

/**
 * Monitor status constants to avoid hardcoded strings.
 *
 * @remarks
 * Provides named constants for all monitor status values.
 *
 * @public
 */
export const MONITOR_STATUS: MonitorStatusConstants = {
    DEGRADED: STATUS_KIND.DEGRADED,
    DOWN: STATUS_KIND.DOWN,
    PAUSED: STATUS_KIND.PAUSED,
    PENDING: STATUS_KIND.PENDING,
    UP: STATUS_KIND.UP,
} satisfies Record<string, MonitorStatus>;

/**
 * Default monitor status value.
 *
 * @defaultValue MONITOR_STATUS.PENDING
 *
 * @public
 */
export const DEFAULT_MONITOR_STATUS: MonitorStatus = MONITOR_STATUS.PENDING;

/**
 * Default site status value.
 *
 * @defaultValue "unknown"
 *
 * @public
 */
export const DEFAULT_SITE_STATUS: SiteStatus = STATUS_KIND.UNKNOWN;

/**
 * Core monitor interface representing a single monitoring configuration.
 *
 * @remarks
 * Defines all properties required for monitoring a target resource. Contains
 * both configuration (what to monitor) and state (current status, history).
 *
 * @public
 */
export interface Monitor {
    /** Array of currently active operations for this monitor */
    activeOperations?: string[];
    /** Baseline origin URL when comparing CDN edge consistency */
    baselineUrl?: string;
    /** Keyword that must be present in HTTP response bodies */
    bodyKeyword?: string;
    /** Certificate expiry warning threshold in days for SSL monitoring */
    certificateWarningDays?: number;
    /** Interval between checks in milliseconds */
    checkInterval: number;
    /** Optional list of encoded CDN edge endpoints (comma or newline separated) */
    edgeLocations?: string;
    /** Expected value for HTTP header verification */
    expectedHeaderValue?: string;
    /** Expected value within a JSON payload */
    expectedJsonValue?: string;
    /** Expected HTTP status code for status-based HTTP monitors */
    expectedStatusCode?: number;
    /** Expected value for DNS record verification */
    expectedValue?: string; // Added for DNS monitoring
    /** HTTP header name to inspect */
    headerName?: string;
    /** Expected status string returned by heartbeat endpoints */
    heartbeatExpectedStatus?: string;
    /** Maximum tolerated heartbeat staleness in seconds */
    heartbeatMaxDriftSeconds?: number;
    /** Field name (dot notation supported) that exposes heartbeat status */
    heartbeatStatusField?: string;
    /** Field name (dot notation supported) that exposes heartbeat timestamp */
    heartbeatTimestampField?: string;
    /** Historical status data for analytics and trends */
    history: StatusHistory[];
    /** Hostname or IP address to monitor */
    host?: string;
    /** Unique identifier for the monitor */
    id: string;
    /** JSON path expression used for HTTP JSON monitors */
    jsonPath?: string;
    /** Timestamp of the last check performed */
    lastChecked?: Date;
    /** Maximum acceptable delay before a WebSocket pong response (milliseconds) */
    maxPongDelayMs?: number;
    /** Maximum allowable replication lag in seconds */
    maxReplicationLagSeconds?: number;
    /** Maximum allowed response time for latency monitors */
    maxResponseTime?: number;
    /** Whether monitoring is currently active for this monitor */
    monitoring: boolean;
    /** Port number for port-based monitoring */
    port?: number;
    /** Primary node status endpoint used for replication comparisons */
    primaryStatusUrl?: string;
    /** DNS record type to query (A, AAAA, CNAME, etc.) */
    recordType?: string; // Added for DNS monitoring
    /** Replica node status endpoint used for replication comparisons */
    replicaStatusUrl?: string;
    /** JSON field (dot notation supported) containing replication timestamps */
    replicationTimestampField?: string;
    /** Latest response time measurement in milliseconds */
    responseTime: number;
    /** Number of retry attempts when a check fails */
    retryAttempts: number;
    /** Current status of the monitor */
    status: MonitorStatus;
    /** Timeout for monitor checks in milliseconds */
    timeout: number;
    /**
     * Type of monitoring performed (see {@link BASE_MONITOR_TYPES}).
     */
    type: MonitorType;
    /** URL to monitor for HTTP-based checks */
    url?: string;
}

/**
 * Field definition for dynamic form generation.
 *
 * @remarks
 * Used for monitor type configuration in both frontend and backend. Defines the
 * structure of fields for dynamic forms and monitor configuration.
 *
 * @public
 */
export interface MonitorFieldDefinition {
    /** Help text for the field */
    helpText?: string;
    /** Display label for the field */
    label: string;
    /** Max value for number fields */
    max?: number;
    /** Min value for number fields */
    min?: number;
    /** Field name (matches monitor property) */
    name: string;
    /** Options for select fields */
    options?: Array<{ label: string; value: string }>;
    /** Placeholder text */
    placeholder?: string;
    /** Whether field is required */
    required: boolean;
    /** Input type for form rendering */
    type: "number" | "select" | "text" | "url";
}

export interface Site {
    identifier: string;
    monitoring: boolean;
    monitors: Monitor[];
    name: string;
}

/**
 * Minimal Site interface for status calculations.
 *
 * @remarks
 * Allows utilities to work with both frontend and backend Site types. Used for
 * status calculations and summary operations.
 *
 * @public
 */
export interface SiteForStatus {
    monitors: Array<{
        monitoring: boolean;
        status: MonitorStatus;
    }>;
}

export interface StatusHistory {
    details?: string;
    responseTime: number;
    status: StatusHistoryStatus;
    timestamp: number;
}

export interface StatusUpdate {
    details?: string;
    monitorId: string;
    previousStatus?: MonitorStatus;
    site?: Site;
    siteIdentifier: string;
    status: MonitorStatus;
    timestamp: string;
}

/**
 * Helper to validate that all elements in activeOperations are valid
 * identifiers.
 *
 * @param activeOperations - Array to validate
 *
 * @returns True if all elements are valid identifiers
 */
function isValidActiveOperations(
    activeOperations: unknown
): activeOperations is string[] {
    if (!Array.isArray(activeOperations)) {
        return false;
    }

    // Use more permissive validation since we import validator in the backend
    // For shared types, we'll keep the simple validation
    for (const op of activeOperations) {
        if (typeof op !== "string" || op.trim().length === 0) {
            return false;
        }
    }
    return true;
}

export function isComputedSiteStatus(
    status: string
): status is typeof STATUS_KIND.MIXED | typeof STATUS_KIND.UNKNOWN {
    return status === STATUS_KIND.MIXED || status === STATUS_KIND.UNKNOWN;
}

export function isMonitorStatus(status: string): status is MonitorStatus {
    return (MONITOR_STATUS_VALUES as readonly string[]).includes(status);
}

export function isSiteStatus(status: string): status is SiteStatus {
    return (SITE_STATUS_VALUES as readonly string[]).includes(status);
}

/**
 * Enhanced monitor validation using shared type guards. Provides consistent
 * validation across frontend and backend.
 */
export function validateMonitor(monitor: Partial<Monitor>): monitor is Monitor {
    // Runtime validation requires null/undefined checks despite type signature
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Runtime validation must check for null/undefined despite TypeScript types
    if (!monitor || typeof monitor !== "object") {
        return false;
    }

    return (
        typeof monitor.id === "string" &&
        typeof monitor.type === "string" &&
        (BASE_MONITOR_TYPES as readonly string[]).includes(monitor.type) &&
        typeof monitor.status === "string" &&
        isMonitorStatus(monitor.status) &&
        typeof monitor.monitoring === "boolean" &&
        typeof monitor.responseTime === "number" &&
        typeof monitor.checkInterval === "number" &&
        typeof monitor.timeout === "number" &&
        typeof monitor.retryAttempts === "number" &&
        Array.isArray(monitor.history) &&
        (monitor.activeOperations === undefined ||
            isValidActiveOperations(monitor.activeOperations))
    );
}
