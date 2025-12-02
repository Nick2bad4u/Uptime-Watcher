/**
 * Canonical status kinds shared across monitors, sites, and history records.
 *
 * @public
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
 *
 * @public
 */
export type StatusKind = (typeof STATUS_KIND)[keyof typeof STATUS_KIND];

/**
 * Ordered list of monitor status literals used for comparisons and UI sort
 * order.
 *
 * @internal
 */
type MonitorStatusTuple = readonly [
    typeof STATUS_KIND.DEGRADED,
    typeof STATUS_KIND.DOWN,
    typeof STATUS_KIND.PAUSED,
    typeof STATUS_KIND.PENDING,
    typeof STATUS_KIND.UP,
];

/**
 * Ordered list of site status literals used for comparisons and UI sort order.
 *
 * @internal
 */
type SiteStatusTuple = readonly [
    typeof STATUS_KIND.DEGRADED,
    typeof STATUS_KIND.DOWN,
    typeof STATUS_KIND.MIXED,
    typeof STATUS_KIND.PAUSED,
    typeof STATUS_KIND.PENDING,
    typeof STATUS_KIND.UNKNOWN,
    typeof STATUS_KIND.UP,
];

/**
 * Ordered list of status literals persisted in monitor history records.
 *
 * @internal
 */
type StatusHistoryTuple = readonly [
    typeof STATUS_KIND.UP,
    typeof STATUS_KIND.DOWN,
    typeof STATUS_KIND.DEGRADED,
];

/**
 * Status values captured in historical monitor records.
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
 *
 * @remarks
 * Includes derived site-only states such as {@link STATUS_KIND.MIXED} and
 * {@link STATUS_KIND.UNKNOWN}.
 *
 * @public
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
 *
 * @public
 */
export const STATUS_HISTORY_VALUES: StatusHistoryTuple = [
    STATUS_KIND.UP,
    STATUS_KIND.DOWN,
    STATUS_KIND.DEGRADED,
];

/**
 * Status values captured in historical monitor records.
 *
 * @public
 */
export type StatusHistoryStatus = StatusHistoryTuple[number];

/**
 * Status values for monitors.
 *
 * @remarks
 * Used throughout the system to represent the current state of a monitor.
 *
 * @public
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
    activeOperations?: string[] | undefined;
    /** Baseline origin URL when comparing CDN edge consistency */
    baselineUrl?: string | undefined;
    /** Keyword that must be present in HTTP response bodies */
    bodyKeyword?: string | undefined;
    /** Certificate expiry warning threshold in days for SSL monitoring */
    certificateWarningDays?: number | undefined;
    /** Interval between checks in milliseconds */
    checkInterval: number;
    /** Optional list of encoded CDN edge endpoints (comma or newline separated) */
    edgeLocations?: string | undefined;
    /** Expected value for HTTP header verification */
    expectedHeaderValue?: string | undefined;
    /** Expected value within a JSON payload */
    expectedJsonValue?: string | undefined;
    /** Expected HTTP status code for status-based HTTP monitors */
    expectedStatusCode?: number | undefined;
    /** Expected value for DNS record verification */
    expectedValue?: string | undefined; // Added for DNS monitoring
    /** HTTP header name to inspect */
    headerName?: string | undefined;
    /** Expected status string returned by heartbeat endpoints */
    heartbeatExpectedStatus?: string | undefined;
    /** Maximum tolerated heartbeat staleness in seconds */
    heartbeatMaxDriftSeconds?: number | undefined;
    /** Field name (dot notation supported) that exposes heartbeat status */
    heartbeatStatusField?: string | undefined;
    /** Field name (dot notation supported) that exposes heartbeat timestamp */
    heartbeatTimestampField?: string | undefined;
    /** Historical status data for analytics and trends */
    history: StatusHistory[];
    /** Hostname or IP address to monitor */
    host?: string | undefined;
    /** Unique identifier for the monitor */
    id: string;
    /** JSON path expression used for HTTP JSON monitors */
    jsonPath?: string | undefined;
    /** Timestamp of the last check performed */
    lastChecked?: Date | undefined;
    /** Maximum acceptable delay before a WebSocket pong response (milliseconds) */
    maxPongDelayMs?: number | undefined;
    /** Maximum allowable replication lag in seconds */
    maxReplicationLagSeconds?: number | undefined;
    /** Maximum allowed response time for latency monitors */
    maxResponseTime?: number | undefined;
    /** Whether monitoring is currently active for this monitor */
    monitoring: boolean;
    /** Port number for port-based monitoring */
    port?: number | undefined;
    /** Primary node status endpoint used for replication comparisons */
    primaryStatusUrl?: string | undefined;
    /** DNS record type to query (A, AAAA, CNAME, etc.) */
    recordType?: string | undefined; // Added for DNS monitoring
    /** Replica node status endpoint used for replication comparisons */
    replicaStatusUrl?: string | undefined;
    /** JSON field (dot notation supported) containing replication timestamps */
    replicationTimestampField?: string | undefined;
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
    url?: string | undefined;
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

/**
 * Core site entity aggregating one or more monitors.
 *
 * @remarks
 * Represents a logical monitored property such as a website or service. Each
 * site owns a collection of monitors that produce its aggregate status.
 *
 * @public
 */
export interface Site {
    /** Unique identifier persisted across renderer and backend. */
    identifier: string;
    /** Indicates whether monitoring is currently active for the site. */
    monitoring: boolean;
    /** Collection of monitors assigned to the site. */
    monitors: Monitor[];
    /** Human-readable site name rendered throughout the UI. */
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

/**
 * Snapshot of a monitor's status at a specific point in time.
 *
 * @remarks
 * Persisted within history timelines and analytics datasets.
 *
 * @public
 */
export interface StatusHistory {
    /** Optional diagnostic message captured during the check. */
    details?: string | undefined;
    /** Response time measurement in milliseconds. */
    responseTime: number;
    /** Resulting monitor status. */
    status: StatusHistoryStatus;
    /** Unix timestamp (milliseconds) for when the check completed. */
    timestamp: number;
}

/**
 * Real-time status update emitted when a monitor changes state.
 *
 * @remarks
 * Sent across IPC boundaries to synchronize renderer views and orchestrator
 * caches.
 *
 * @public
 */
export interface StatusUpdate extends Readonly<Record<PropertyKey, unknown>> {
    /** Optional diagnostic message describing the change. */
    details?: string;
    readonly length?: never;
    /** Rich monitor context describing the updated entity. */
    monitor: Monitor;
    /** Identifier of the monitor generating the update. */
    monitorId: string;
    /** Previous status before the update, if known. */
    previousStatus?: MonitorStatus;
    readonly [key: number]: unknown;
    readonly [key: string]: unknown;
    readonly [key: symbol]: unknown;
    /** Latest response time measurement, when recorded. */
    responseTime?: number;
    /** Full site entity associated with the monitor. */
    site: Site;
    /** Identifier of the site associated with the monitor. */
    siteIdentifier: string;
    /** New monitor status after processing the check result. */
    status: MonitorStatus;
    /** ISO-8601 timestamp representing when the update was produced. */
    timestamp: string;
}

/**
 * Summary metrics describing the outcome of a monitoring lifecycle operation.
 *
 * @remarks
 * Produced by Electron monitoring managers after attempting to start or stop
 * monitoring across multiple sites. Provides aggregate counts that renderer
 * components and diagnostics tooling can use to surface user feedback and
 * telemetry without inspecting internal logs.
 *
 * @public
 */
export interface MonitoringOperationSummary {
    /**
     * Number of monitors that were eligible and attempted during the operation.
     */
    readonly attempted: number;
    /**
     * Number of monitors that failed to change state because the backend
     * returned an error or `false`.
     */
    readonly failed: number;
    /**
     * Reflects the resulting global monitoring state after the operation has
     * completed.
     */
    readonly isMonitoring: boolean;
    /**
     * Indicates whether any failures were recorded while still having at least
     * one monitor succeed.
     */
    readonly partialFailures: boolean;
    /** Number of site configurations evaluated during the operation. */
    readonly siteCount: number;
    /**
     * Number of monitors skipped automatically (missing identifiers or already
     * satisfied state).
     */
    readonly skipped: number;
    /** Number of monitors that completed the requested operation successfully. */
    readonly succeeded: number;
}

/**
 * Summary returned after attempting to start global monitoring.
 *
 * @public
 */
export interface MonitoringStartSummary extends MonitoringOperationSummary {
    /** `true` when monitoring was already active before the start request. */
    readonly alreadyActive: boolean;
}

/**
 * Summary returned after attempting to stop global monitoring.
 *
 * @public
 */
export interface MonitoringStopSummary extends MonitoringOperationSummary {
    /** `true` when monitoring was already inactive at the time of the request. */
    readonly alreadyInactive: boolean;
}

/**
 * Validates that active operation identifiers are well-formed strings.
 *
 * @param activeOperations - Value supplied for the `activeOperations` field.
 *
 * @returns `true` when every entry is a non-empty string.
 *
 * @internal
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

/**
 * Determines whether a string represents a computed site-only status value.
 *
 * @param status - Status string to evaluate.
 *
 * @returns `true` when the value is either `mixed` or `unknown`.
 *
 * @public
 */
export function isComputedSiteStatus(
    status: string
): status is typeof STATUS_KIND.MIXED | typeof STATUS_KIND.UNKNOWN {
    return status === STATUS_KIND.MIXED || status === STATUS_KIND.UNKNOWN;
}

/**
 * Determines whether a string matches a monitor status literal.
 *
 * @param status - Status string to evaluate.
 *
 * @returns `true` when the value is part of {@link MONITOR_STATUS_VALUES}.
 *
 * @public
 */
export function isMonitorStatus(status: string): status is MonitorStatus {
    return (MONITOR_STATUS_VALUES as readonly string[]).includes(status);
}

/**
 * Determines whether a string matches a site status literal.
 *
 * @param status - Status string to evaluate.
 *
 * @returns `true` when the value is part of {@link SITE_STATUS_VALUES}.
 *
 * @public
 */
export function isSiteStatus(status: string): status is SiteStatus {
    return (SITE_STATUS_VALUES as readonly string[]).includes(status);
}

/**
 * Validates monitor payloads using shared runtime guards.
 *
 * @remarks
 * Used by both renderer and Electron processes to ensure monitor data meets the
 * shared {@link Monitor} contract before persisting or rendering.
 *
 * @param monitor - Partial monitor payload to validate.
 *
 * @returns `true` when the payload satisfies the {@link Monitor} interface.
 *
 * @public
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
