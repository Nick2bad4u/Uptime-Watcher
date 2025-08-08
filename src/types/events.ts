/**
 * Specific event payload type definitions for improved type safety.
 * Replaces generic `unknown` types in IPC event callbacks.
 */

import { type Monitor, type Site } from "@shared/types";

/**
 * Event data for cache invalidation
 */
export interface CacheInvalidatedEventData {
    /** Specific identifier affected (optional for global invalidation) */
    identifier?: string;
    /** Reason for invalidation */
    reason: string;
    /** Type of cache invalidation */
    type: "all" | "monitor" | "site";
}

/**
 * Event data when a monitor goes down
 */
export interface MonitorDownEventData {
    /** Error message if available */
    error?: string;
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
 * Event data for monitoring control operations
 */
export interface MonitoringControlEventData {
    /** Monitor identifier */
    monitorId: string;
    /** Site identifier */
    siteId: string;
}

/**
 * Event data when a monitor comes back up
 */
export interface MonitorUpEventData {
    /** Monitor that came back up */
    monitor: Monitor;
    /** Response time in milliseconds */
    responseTime?: number;
    /** Site containing the monitor */
    site: Site;
    /** Site identifier */
    siteId: string;
    /** Timestamp when the event occurred */
    timestamp: number;
}

/**
 * Event data for test events (used in development/testing)
 */
export interface TestEventData {
    /** Test data payload */
    data: Record<string, unknown>;
    /** Test identifier */
    testId: string;
    /** Timestamp */
    timestamp: number;
}

/**
 * Update release information interface.
 * Contains details about an available update.
 */
export interface UpdateReleaseInfo {
    /** Release date timestamp or formatted string */
    releaseDate: string;
    /** Human-readable release name */
    releaseName: string;
    /** Detailed release notes in markdown format */
    releaseNotes: string;
    /** Semantic version number */
    version: string;
}

/**
 * Event data for update status changes
 */
export interface UpdateStatusEventData {
    /** Error message if status is error */
    error?: string;
    /** Update information if available */
    info?: UpdateReleaseInfo;
    /** Progress percentage (0-100) */
    progress?: number;
    /** Current update status */
    status:
        | "available"
        | "checking"
        | "downloaded"
        | "downloading"
        | "error"
        | "idle";
}
