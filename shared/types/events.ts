/**
 * Defines event payload types for improved type safety in IPC event callbacks.
 *
 * @remarks
 * These interfaces replace generic `unknown` types, ensuring strict typing for
 * all event payloads exchanged between the Electron main process and renderer.
 */

import type { Monitor, Site } from "@shared/types";

/**
 * Base interface for all event data payloads.
 *
 * @remarks
 * Provides common timestamp field that all events must include. All event
 * interfaces should extend this base interface to ensure consistency.
 */
export interface BaseEventData {
    /**
     * The time (in ms since epoch) when the event occurred.
     */
    timestamp: number;
}

/**
 * Payload for cache invalidation events.
 *
 * @remarks
 * Used to notify listeners that a cache entry or the entire cache has been
 * invalidated for a specific reason. - `identifier`: The specific identifier
 * affected (optional for global invalidation). - `reason`: The reason for
 * invalidation.
 *
 * - `timestamp`: The time (in ms since epoch) when invalidation occurred.
 * - `type`: The type of cache invalidation.
 *
 * @example // Invalidate all site caches due to manual action
 *
 * ```typescript
 * const event: CacheInvalidatedEventData = {
 *     type: "all",
 *     reason: "manual",
 *     timestamp: Date.now(),
 * };
 * ```
 */
export interface CacheInvalidatedEventData extends BaseEventData {
    /**
     * The specific identifier affected (optional for global invalidation).
     *
     * @remarks
     * If omitted, the invalidation is considered global.
     */
    identifier?: string;
    /**
     * The reason for invalidation.
     *
     * @remarks
     * Can be 'delete', 'expiry', 'manual', or 'update'.
     */
    reason: "delete" | "expiry" | "manual" | "update";
    /**
     * The type of cache invalidation.
     *
     * @remarks
     * 'all' for global, 'monitor' for a specific monitor, 'site' for a specific
     * site.
     */
    type: "all" | "monitor" | "site";
}

/**
 * Payload for database connection events.
 *
 * @remarks
 * Used to track database connection state changes. Important for monitoring
 * database availability and connection health.
 *
 * @example
 *
 * ```typescript
 * const event: DatabaseConnectionEventData = {
 *     state: "connected",
 *     connectionId: "conn_123",
 * };
 * ```
 */
export interface DatabaseConnectionEventData extends BaseEventData {
    /** Unique identifier for the connection */
    connectionId?: string;
    /** Additional context about the connection state */
    details?: string;
    /** Current connection state */
    state: "connected" | "connecting" | "disconnected" | "error";
}

/**
 * Payload for database error events.
 *
 * @remarks
 * Used to communicate database operation errors with detailed context. Provides
 * structured error information for debugging and monitoring.
 *
 * @example
 *
 * ```typescript
 * const event: DatabaseErrorEventData = {
 *     error: new Error("Connection timeout"),
 *     operation: "query",
 *     table: "monitors",
 * };
 * ```
 */
export interface DatabaseErrorEventData extends BaseEventData {
    /** The actual error that occurred */
    error: Error;
    /** The database operation that failed */
    operation: DatabaseOperation;
    /** SQL parameters that were used (optional for debugging) */
    parameters?: unknown[];
    /** The database table involved (optional) */
    table?: string;
}

/**
 * Payload for database retry events.
 *
 * @remarks
 * Used to track retry attempts for failed database operations. Helps with
 * monitoring and debugging database reliability.
 *
 * @example
 *
 * ```typescript
 * const event: DatabaseRetryEventData = {
 *     attempt: 2,
 *     maxAttempts: 3,
 *     operation: "query",
 *     delay: 1000,
 * };
 * ```
 */
export interface DatabaseRetryEventData extends BaseEventData {
    /** Current attempt number (1-based) */
    attempt: number;
    /** Delay before this retry attempt in milliseconds */
    delay: number;
    /** Maximum number of attempts allowed */
    maxAttempts: number;
    /** The database operation being retried */
    operation: DatabaseOperation;
}

/**
 * Payload for database success events.
 *
 * @remarks
 * Used to track successful database operations for monitoring and performance
 * analysis. Provides metrics about operation performance and cache
 * utilization.
 *
 * @example
 *
 * ```typescript
 * const event: DatabaseSuccessEventData = {
 *     operation: "query",
 *     duration: 45,
 *     cacheHit: true,
 * };
 * ```
 */
export interface DatabaseSuccessEventData extends BaseEventData {
    /** Whether this operation was served from cache */
    cacheHit?: boolean;
    /** Duration of the operation in milliseconds */
    duration?: number;
    /** The database operation that succeeded */
    operation: DatabaseOperation;
    /** Number of rows affected/returned */
    rowCount?: number;
}

/**
 * Payload for events when a monitor goes down (unavailable).
 *
 * @remarks
 * Emitted when a monitored endpoint or service is detected as down.
 *
 * - `monitor`: The monitor that went down.
 * - `site`: The site containing the monitor.
 * - `siteId`: The unique identifier of the site.
 * - `timestamp`: The time (in ms since epoch) when the event occurred.
 *
 * @example // Example event payload for a monitor down event
 *
 * ```typescript
 * const event: MonitorDownEventData = {
 *     monitor,
 *     site,
 *     siteId: site.id,
 *     timestamp: Date.now(),
 * };
 * ```
 */
export interface MonitorDownEventData extends BaseEventData {
    /**
     * The monitor that went down.
     */
    monitor: Monitor;
    /**
     * The site containing the monitor.
     */
    site: Site;
    /**
     * The unique identifier of the site.
     */
    siteId: string;
}

/**
 * Payload for monitoring control events (global monitoring start/stop).
 *
 * @remarks
 * Used to signal global monitoring state changes, such as starting or stopping
 * all monitors. - `activeMonitors`: Number of active monitors (for stopped
 * events).
 *
 * - `monitorCount`: Number of monitors involved in the operation.
 * - `reason`: Reason for stopping (for stopped events).
 * - `siteCount`: Number of sites involved in the operation.
 * - `timestamp`: The time (in ms since epoch) when the event occurred.
 *
 * @example // Example: Monitoring stopped by user
 *
 * ```typescript
 * const event: MonitoringControlEventData = {
 *     reason: "user",
 *     activeMonitors: 0,
 *     siteCount: 3,
 *     timestamp: Date.now(),
 * };
 * ```
 */
export interface MonitoringControlEventData extends BaseEventData {
    /**
     * Number of active monitors (for stopped events).
     */
    activeMonitors?: number;
    /**
     * Number of monitors involved in the operation.
     */
    monitorCount?: number;
    /**
     * Reason for stopping (for stopped events).
     *
     * @remarks
     * Can be 'error', 'shutdown', or 'user'.
     */
    reason?: "error" | "shutdown" | "user";
    /**
     * Number of sites involved in the operation.
     */
    siteCount?: number;
}

/**
 * Payload for events when a monitor comes back up (becomes available).
 *
 * @remarks
 * Emitted when a previously down monitor is detected as up.
 *
 * - `monitor`: The monitor that came back up.
 * - `site`: The site containing the monitor.
 * - `siteId`: The unique identifier of the site.
 * - `timestamp`: The time (in ms since epoch) when the event occurred.
 *
 * @example // Example event payload for a monitor up event
 *
 * ```typescript
 * const event: MonitorUpEventData = {
 *     monitor,
 *     site,
 *     siteId: site.id,
 *     timestamp: Date.now(),
 * };
 * ```
 */
export interface MonitorUpEventData extends BaseEventData {
    /**
     * The monitor that came back up.
     */
    monitor: Monitor;
    /**
     * The site containing the monitor.
     */
    site: Site;
    /**
     * The unique identifier of the site.
     */
    siteId: string;
}

/**
 * Payload for update status change events.
 *
 * @remarks
 * Used to communicate the current status of application updates, including
 * errors. - `error`: Error message if status is 'error'.
 *
 * - `status`: The current update status.
 *
 * @example // Example: Update downloaded
 *
 * ```typescript
 * const event: UpdateStatusEventData = {
 *     status: "downloaded",
 * };
 * ```
 */
export interface UpdateStatusEventData {
    /**
     * Error message if status is 'error'.
     */
    error?: string;
    /**
     * The current update status.
     *
     * @remarks
     * Can be 'available', 'checking', 'downloaded', 'downloading', 'error', or
     * 'idle'.
     */
    status:
        | "available"
        | "checking"
        | "downloaded"
        | "downloading"
        | "error"
        | "idle";
}

/**
 * Database operation types used in event payloads.
 *
 * @public
 */
export type DatabaseOperation =
    | "connect"
    | "create"
    | "delete"
    | "insert"
    | "query"
    | "update";

/**
 * Payload for test events (used in development/testing).
 *
 * @remarks
 * Used for development or testing purposes to transmit arbitrary data.
 *
 * @example // Example: Sending a test event with custom data
 *
 * ```typescript
 * const event: TestEventData = {
 *     foo: "bar",
 *     count: 42,
 * };
 * ```
 */
export type TestEventData = Record<string, unknown>;
