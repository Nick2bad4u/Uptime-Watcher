/**
 * Specific event payload type definitions for improved type safety. Replaces
 * generic `unknown` types in IPC event callbacks.
 */

import type { Monitor, Site } from "@shared/types";
import type { UnknownRecord } from "type-fest";

/**
 * Event data for cache invalidation
 */
export interface CacheInvalidatedEventData {
    /** Specific identifier affected (optional for global invalidation) */
    readonly identifier?: string;
    /** Reason for invalidation */
    readonly reason: "delete" | "expiry" | "manual" | "update";
    /** Type of cache invalidation */
    readonly type: "all" | "monitor" | "site";
}

/**
 * Event data when a monitor goes down
 */
export interface MonitorDownEventData {
    /** Error message if available */
    readonly error?: string;
    /** Monitor that went down */
    readonly monitor: Monitor;
    /** Site containing the monitor */
    readonly site: Site;
    /** Site identifier */
    readonly siteId: string;
    /** Timestamp when the event occurred */
    readonly timestamp: number;
}

/**
 * Event data for monitoring control operations
 */
export interface MonitoringControlEventData {
    /** Monitor identifier */
    readonly monitorId: string;
    /** Site identifier */
    readonly siteId: string;
}

/**
 * Event data when a monitor comes back up
 */
export interface MonitorUpEventData {
    /** Monitor that came back up */
    readonly monitor: Monitor;
    /** Response time in milliseconds */
    readonly responseTime?: number;
    /** Site containing the monitor */
    readonly site: Site;
    /** Site identifier */
    readonly siteId: string;
    /** Timestamp when the event occurred */
    readonly timestamp: number;
}

/**
 * Event data for test events (used in development/testing)
 */
export interface TestEventData {
    /** Test data payload */
    readonly data: UnknownRecord;
    /** Test identifier */
    readonly testId: string;
    /** Timestamp */
    readonly timestamp: number;
}

/**
 * Update release information interface. Contains details about an available
 * update.
 */
export interface UpdateReleaseInfo {
    /** Release date timestamp or formatted string */
    readonly releaseDate: string;
    /** Human-readable release name */
    readonly releaseName: string;
    /** Detailed release notes in markdown format */
    readonly releaseNotes: string;
    /** Semantic version number */
    readonly version: string;
}

/**
 * Event data for update status changes
 */
export interface UpdateStatusEventData {
    /** Error message if status is error */
    readonly error?: string;
    /** Update information if available */
    readonly info?: UpdateReleaseInfo;
    /** Progress percentage (0-100) */
    readonly progress?: number;
    /** Current update status */
    readonly status:
        | "available"
        | "checking"
        | "downloaded"
        | "downloading"
        | "error"
        | "idle";
}
