/**
 * Defines event payload types for improved type safety in IPC event callbacks.
 *
 * @remarks
 * These interfaces replace generic `unknown` types, ensuring strict typing for all event payloads exchanged between the Electron main process and renderer.
 */

import type { Monitor, Site } from "../types";

/**
 * Payload for cache invalidation events.
 *
 * @remarks
 * Used to notify listeners that a cache entry or the entire cache has been invalidated for a specific reason.
 * - `identifier`: The specific identifier affected (optional for global invalidation).
 * - `reason`: The reason for invalidation.
 * - `timestamp`: The time (in ms since epoch) when invalidation occurred.
 * - `type`: The type of cache invalidation.
 *
 * @example
 * // Invalidate all site caches due to manual action
 * ```typescript
 * const event: CacheInvalidatedEventData = {
 *   type: 'all',
 *   reason: 'manual',
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface CacheInvalidatedEventData {
    /**
     * The specific identifier affected (optional for global invalidation).
     * @remarks If omitted, the invalidation is considered global.
     */
    identifier?: string;
    /**
     * The reason for invalidation.
     * @remarks Can be 'delete', 'expiry', 'manual', or 'update'.
     */
    reason: "delete" | "expiry" | "manual" | "update";
    /**
     * The time (in ms since epoch) when invalidation occurred.
     */
    timestamp: number;
    /**
     * The type of cache invalidation.
     * @remarks 'all' for global, 'monitor' for a specific monitor, 'site' for a specific site.
     */
    type: "all" | "monitor" | "site";
}

/**
 * Payload for events when a monitor goes down (unavailable).
 *
 * @remarks
 * Emitted when a monitored endpoint or service is detected as down.
 * - `monitor`: The monitor that went down.
 * - `site`: The site containing the monitor.
 * - `siteId`: The unique identifier of the site.
 * - `timestamp`: The time (in ms since epoch) when the event occurred.
 *
 * @example
 * // Example event payload for a monitor down event
 * ```typescript
 * const event: MonitorDownEventData = {
 *   monitor,
 *   site,
 *   siteId: site.id,
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface MonitorDownEventData {
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
    /**
     * The time (in ms since epoch) when the event occurred.
     */
    timestamp: number;
}

/**
 * Payload for monitoring control events (global monitoring start/stop).
 *
 * @remarks
 * Used to signal global monitoring state changes, such as starting or stopping all monitors.
 * - `activeMonitors`: Number of active monitors (for stopped events).
 * - `monitorCount`: Number of monitors involved in the operation.
 * - `reason`: Reason for stopping (for stopped events).
 * - `siteCount`: Number of sites involved in the operation.
 * - `timestamp`: The time (in ms since epoch) when the event occurred.
 *
 * @example
 * // Example: Monitoring stopped by user
 * ```typescript
 * const event: MonitoringControlEventData = {
 *   reason: 'user',
 *   activeMonitors: 0,
 *   siteCount: 3,
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface MonitoringControlEventData {
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
     * @remarks Can be 'error', 'shutdown', or 'user'.
     */
    reason?: "error" | "shutdown" | "user";
    /**
     * Number of sites involved in the operation.
     */
    siteCount?: number;
    /**
     * The time (in ms since epoch) when the event occurred.
     */
    timestamp: number;
}

/**
 * Payload for events when a monitor comes back up (becomes available).
 *
 * @remarks
 * Emitted when a previously down monitor is detected as up.
 * - `monitor`: The monitor that came back up.
 * - `site`: The site containing the monitor.
 * - `siteId`: The unique identifier of the site.
 * - `timestamp`: The time (in ms since epoch) when the event occurred.
 *
 * @example
 * // Example event payload for a monitor up event
 * ```typescript
 * const event: MonitorUpEventData = {
 *   monitor,
 *   site,
 *   siteId: site.id,
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface MonitorUpEventData {
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
    /**
     * The time (in ms since epoch) when the event occurred.
     */
    timestamp: number;
}

/**
 * Payload for test events (used in development/testing).
 *
 * @remarks
 * Used for development or testing purposes to transmit arbitrary data.
 *
 * @example
 * // Example: Sending a test event with custom data
 * ```typescript
 * const event: TestEventData = {
 *   foo: 'bar',
 *   count: 42
 * };
 * ```
 */
export interface TestEventData {
    /**
     * Arbitrary test data payload.
     * @remarks Keys and value types are not restricted.
     */
    [key: string]: unknown;
}

/**
 * Payload for update status change events.
 *
 * @remarks
 * Used to communicate the current status of application updates, including errors.
 * - `error`: Error message if status is 'error'.
 * - `status`: The current update status.
 *
 * @example
 * // Example: Update downloaded
 * ```typescript
 * const event: UpdateStatusEventData = {
 *   status: 'downloaded'
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
     * @remarks Can be 'available', 'checking', 'downloaded', 'downloading', 'error', or 'idle'.
     */
    status: "available" | "checking" | "downloaded" | "downloading" | "error" | "idle";
}
