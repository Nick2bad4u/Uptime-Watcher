/**
 * Event constants for inter-manager communication.
 * Defines all events used for event-driven communication between managers.
 */

import { Site, StatusUpdate } from "./types";

/**
 * Events emitted by SiteManager
 */
export const SITE_EVENTS = Object.freeze({
    /** Site cache updated */
    CACHE_UPDATED: "site:cache-updated",
    /** Site added to database and cache */
    SITE_ADDED: "site:added",
    /** Site removed from database and cache */
    SITE_REMOVED: "site:removed",
    /** Site updated in database and cache */
    SITE_UPDATED: "site:updated",
    /** Request to start monitoring for a site */
    START_MONITORING_REQUESTED: "site:start-monitoring-requested",
    /** Request to stop monitoring for a site */
    STOP_MONITORING_REQUESTED: "site:stop-monitoring-requested",
} as const);

/**
 * Events emitted by MonitorManager
 */
export const MONITOR_EVENTS = Object.freeze({
    /** All monitoring started */
    ALL_MONITORING_STARTED: "monitor:all-started",
    /** All monitoring stopped */
    ALL_MONITORING_STOPPED: "monitor:all-stopped",
    /** Manual check completed */
    MANUAL_CHECK_COMPLETED: "monitor:manual-check-completed",
    /** Monitoring started for a site */
    MONITORING_STARTED: "monitor:started",
    /** Monitoring stopped for a site */
    MONITORING_STOPPED: "monitor:stopped",
    /** Monitor setup completed for a site */
    SITE_SETUP_COMPLETED: "monitor:site-setup-completed",
} as const);

/**
 * Events emitted by DatabaseManager
 */
export const DATABASE_EVENTS = Object.freeze({
    /** Backup downloaded */
    BACKUP_DOWNLOADED: "database:backup-downloaded",
    /** Data exported */
    DATA_EXPORTED: "database:data-exported",
    /** Data imported */
    DATA_IMPORTED: "database:data-imported",
    /** Request to get sites from cache */
    GET_SITES_FROM_CACHE_REQUESTED: "database:get-sites-from-cache-requested",
    /** History limit updated */
    HISTORY_LIMIT_UPDATED: "database:history-limit-updated",
    /** Database initialized */
    INITIALIZED: "database:initialized",
    /** Sites refreshed from database */
    SITES_REFRESHED: "database:sites-refreshed",
    /** Request to update sites cache */
    UPDATE_SITES_CACHE_REQUESTED: "database:update-sites-cache-requested",
} as const);

/**
 * Events emitted by ConfigurationManager
 */
export const CONFIGURATION_EVENTS = Object.freeze({
    /** Default values applied */
    DEFAULTS_APPLIED: "config:defaults-applied",
    /** Configuration validated */
    VALIDATED: "config:validated",
    /** Configuration validation failed */
    VALIDATION_FAILED: "config:validation-failed",
} as const);

/**
 * Status and system events (existing)
 */
export const STATUS_EVENTS = Object.freeze({
    /** Database error occurred */
    DB_ERROR: "db-error",
    /** Monitor went down */
    MONITOR_DOWN: "site-monitor-down",
    /** Monitor came back up */
    MONITOR_UP: "site-monitor-up",
    /** Monitor status update */
    STATUS_UPDATE: "status-update",
} as const);

/**
 * Event data interfaces for type safety
 */
export interface SiteEventData {
    identifier: string;
    site?: Site;
    monitorId?: string;
    operation?: string;
    error?: string;
}

export interface MonitorEventData {
    identifier: string;
    monitorId?: string;
    result?: StatusUpdate;
    error?: string;
}

export interface DatabaseEventData {
    operation: string;
    result?: unknown;
    error?: string;
    sites?: Site[];
    limit?: number;
}

export interface ConfigurationEventData {
    type: string;
    data?: unknown;
    errors?: string[];
    isValid?: boolean;
}

/**
 * All event constants combined for easy access
 */
export const ALL_EVENTS = Object.freeze({
    ...SITE_EVENTS,
    ...MONITOR_EVENTS,
    ...DATABASE_EVENTS,
    ...CONFIGURATION_EVENTS,
    ...STATUS_EVENTS,
} as const);

/**
 * Type for all event names
 */
export type EventName = (typeof ALL_EVENTS)[keyof typeof ALL_EVENTS];

/**
 * Event data type union
 */
export type EventData = SiteEventData | MonitorEventData | DatabaseEventData | ConfigurationEventData;
