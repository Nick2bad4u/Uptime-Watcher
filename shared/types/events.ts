/**
 * Specific event payload type definitions for improved type safety.
 * Replaces generic `unknown` types in IPC event callbacks.
 */

import type { Monitor, Site } from "../types";

/**
 * Event data when a monitor goes down
 */
export interface MonitorDownEventData {
    /** Monitor that went down */
    monitor: Monitor;
    /** Site containing the monitor */
    site: Site;
    /** Site identifier */
    siteId: string;
    /** Timestamp when the event occurred */
    timestamp: number;
}

/**
 * Event data when a monitor comes back up
 */
export interface MonitorUpEventData {
    /** Monitor that came back up */
    monitor: Monitor;
    /** Site containing the monitor */
    site: Site;
    /** Site identifier */
    siteId: string;
    /** Timestamp when the event occurred */
    timestamp: number;
}

/**
 * Event data for cache invalidation
 */
export interface CacheInvalidatedEventData {
    /** Specific identifier affected (optional for global invalidation) */
    identifier?: string;
    /** Reason for invalidation */
    reason: "delete" | "expiry" | "manual" | "update";
    /** Timestamp when invalidation occurred */
    timestamp: number;
    /** Type of cache invalidation */
    type: "all" | "monitor" | "site";
}

/**
 * Event data for monitoring control operations (global monitoring start/stop)
 */
export interface MonitoringControlEventData {
    /** Number of monitors involved */
    monitorCount?: number;
    /** Number of sites involved */
    siteCount?: number;
    /** Number of active monitors (for stopped events) */
    activeMonitors?: number;
    /** Reason for stopping (for stopped events) */
    reason?: "error" | "shutdown" | "user";
    /** Timestamp when the event occurred */
    timestamp: number;
}

/**
 * Event data for update status changes
 */
export interface UpdateStatusEventData {
    /** Current update status */
    status: "available" | "checking" | "downloaded" | "downloading" | "error" | "idle";
    /** Error message if status is error */
    error?: string;
}

/**
 * Event data for test events (used in development/testing)
 */
export interface TestEventData {
    /** Test data payload */
    [key: string]: unknown;
}
