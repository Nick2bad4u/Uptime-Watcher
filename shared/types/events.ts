/**
 * Defines event payload types for improved type safety in IPC event callbacks.
 *
 * @remarks
 * These interfaces replace generic `unknown` types, ensuring strict typing for
 * all event payloads exchanged between the Electron main process and renderer.
 *
 * @packageDocumentation
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type { UnknownRecord } from "type-fest";

import type { StateSyncAction, StateSyncSource } from "./stateSync";

/**
 * Base interface for all event data payloads.
 *
 * @remarks
 * Provides common timestamp field that all events must include. All event
 * interfaces should extend this base interface to ensure consistency.
 *
 * @public
 */
export interface BaseEventData {
    /**
     * The time (in ms since epoch) when the event occurred.
     */
    timestamp: number;
}

/**
 * Payload for state synchronization events.
 *
 * @remarks
 * Used to notify frontend about state changes that occurred in the backend.
 * Supports various sync actions including bulk updates, deletions, and
 * individual updates.
 *
 * @example Bulk sync event
 *
 * ```typescript
 * const event: StateSyncEventData = {
 *     action: "bulk-sync",
 *     sites: updatedSites,
 *     source: "backend",
 *     timestamp: Date.now(),
 * };
 * ```
 *
 * @example Individual delete event
 *
 * ```typescript
 * const event: StateSyncEventData = {
 *     action: "delete",
 *     siteIdentifier: "site_123",
 *     source: "backend",
 *     timestamp: Date.now(),
 * };
 * ```
 *
 * @public
 */
export interface StateSyncEventData extends BaseEventData {
    /** The synchronization action being performed */
    readonly action: StateSyncAction;
    /** Site identifier for targeted operations (delete, update) */
    readonly siteIdentifier?: string;
    /** Site data for bulk sync operations */
    readonly sites?: Site[];
    /** Source system that triggered the sync */
    readonly source: StateSyncSource;
}

/**
 * Payload for cache invalidation events.
 *
 * @remarks
 * Used to notify listeners that a cache entry or the entire cache has been
 * invalidated for a specific reason.
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
 *
 * @public
 */
export interface CacheInvalidatedEventData extends BaseEventData {
    /**
     * The specific identifier affected (optional for global invalidation).
     *
     * @remarks
     * If omitted, the invalidation is considered global.
     */
    readonly identifier?: string;
    /**
     * The reason for invalidation.
     *
     * @remarks
     * Can be 'delete', 'expiry', 'manual', or 'update'.
     */
    readonly reason: "delete" | "expiry" | "manual" | "update";
    /**
     * The type of cache invalidation.
     *
     * @remarks
     * 'all' for global, 'monitor' for a specific monitor, 'site' for a specific
     * site.
     */
    readonly type: "all" | "monitor" | "site";
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
 *
 * @public
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
 *
 * @public
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
 *
 * @public
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
 *
 * @public
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
 * Payload for monitor status change events.
 *
 * @remarks
 * Aliases {@link StatusUpdate} to emphasize that monitor status events use the
 * shared real-time status contract while optionally including rich monitor and
 * site context.
 *
 * @public
 */
export type MonitorStatusChangedEventData = StatusUpdate;

/**
 * Canonical payload shared by monitor lifecycle events.
 *
 * @remarks
 * Builds on {@link StatusUpdate} by guaranteeing the presence of fully hydrated
 * `monitor` and `site` entities. The timestamp field mirrors the real-time
 * status contract, using an ISO-8601 string for consistency across renderer,
 * preload, and backend consumers.
 *
 * @public
 */
export type MonitorLifecycleEventData = StatusUpdate & {
    /** Monitor entity associated with the lifecycle transition. */
    monitor: Monitor;
    /** Site entity associated with the lifecycle transition. */
    site: Site;
};

/**
 * Payload for events when a monitor goes down (unavailable).
 *
 * @remarks
 * Emitted when a monitored endpoint or service is detected as down. Uses the
 * canonical {@link StatusUpdate} schema with `status` constrained to `"down"`,
 * `siteIdentifier` replacing legacy `siteId`, and ISO-8601 timestamps.
 *
 * @example // Example event payload for a monitor down event
 *
 * ```typescript
 * const event: MonitorDownEventData = {
 *     details: "Service returned 500",
 *     monitor,
 *     monitorId: monitor.id,
 *     previousStatus: "up",
 *     site,
 *     siteIdentifier: site.identifier,
 *     status: "down",
 *     timestamp: new Date().toISOString(),
 * };
 * ```
 *
 * @public
 */
export type MonitorDownEventData = MonitorLifecycleEventData & {
    /** New status value (always "down" for this event). */
    status: "down";
};

/**
 * Payload for monitoring control events (global monitoring start/stop).
 *
 * @remarks
 * Used to signal global monitoring state changes, such as starting or stopping
 * all monitors.
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
 *
 * @public
 */
export interface MonitoringControlEventData extends BaseEventData {
    /**
     * Number of active monitors (for stopped events).
     */
    readonly activeMonitors?: number;
    /**
     * Number of monitors involved in the operation.
     */
    readonly monitorCount?: number;
    /**
     * Reason for stopping (for stopped events).
     *
     * @remarks
     * Can be 'error', 'shutdown', or 'user'.
     */
    readonly reason?: "error" | "shutdown" | "user";
    /**
     * Number of sites involved in the operation.
     */
    readonly siteCount?: number;
}

/**
 * Payload for events when a monitor comes back up (becomes available).
 *
 * @remarks
 * Emitted when a previously down monitor is detected as up. Aligns with the
 * canonical {@link StatusUpdate} payload while constraining the resulting status
 * to `"up"`.
 *
 * @example // Example event payload for a monitor up event
 *
 * ```typescript
 * const event: MonitorUpEventData = {
 *     details: "Endpoint recovered",
 *     monitor,
 *     monitorId: monitor.id,
 *     previousStatus: "down",
 *     site,
 *     siteIdentifier: site.identifier,
 *     status: "up",
 *     timestamp: new Date().toISOString(),
 * };
 * ```
 *
 * @public
 */
export type MonitorUpEventData = MonitorLifecycleEventData & {
    /** New status value (always "up" for this event). */
    status: "up";
};

/**
 * Payload for update status change events.
 *
 * @remarks
 * Used to communicate the current status of application updates, including
 * errors.
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
 *
 * @public
 */
export interface UpdateStatusEventData {
    /**
     * Error message if status is 'error'.
     */
    readonly error?: string;
    /**
     * The current update status.
     *
     * @remarks
     * Can be 'available', 'checking', 'downloaded', 'downloading', 'error', or
     * 'idle'.
     */
    readonly status:
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
 *
 * @public
 */
export type TestEventData = UnknownRecord;
