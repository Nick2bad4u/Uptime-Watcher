/**
 * Shared type definitions used across frontend and backend.
 */
/**
 * Shared type definitions for Uptime Watcher (frontend & backend).
 *
 * @remarks
 * All core domain types (Monitor, Site, StatusUpdate, etc.) live here.
 * Both frontend and backend must import from this file for consistency.
 * Event types are separate to avoid circular dependencies.
 *
 * @packageDocumentation
 */

export type MonitorStatus = "down" | "paused" | "pending" | "up";

// Base monitor types - source of truth for type safety
export const BASE_MONITOR_TYPES = ["http", "port"] as const;
export type MonitorType = (typeof BASE_MONITOR_TYPES)[number];

export type SiteStatus = "mixed" | "unknown" | MonitorStatus;

// Monitor status constants to avoid hardcoded strings
export const MONITOR_STATUS = {
    DOWN: "down" as const,
    PAUSED: "paused" as const,
    PENDING: "pending" as const,
    UP: "up" as const,
} satisfies Record<string, MonitorStatus>;

// Default status constants
export const DEFAULT_MONITOR_STATUS: MonitorStatus = MONITOR_STATUS.PENDING;
export const DEFAULT_SITE_STATUS: SiteStatus = "unknown";

export interface Monitor {
    checkInterval: number;
    history: StatusHistory[];
    host?: string;
    id: string;
    lastChecked?: Date;
    monitoring: boolean;
    port?: number;
    responseTime: number;
    retryAttempts: number;
    status: MonitorStatus;
    timeout: number;
    type: MonitorType;
    url?: string;
}
export interface Site {
    identifier: string;
    monitoring: boolean;
    monitors: Monitor[];
    name: string;
}
export interface StatusHistory {
    details?: string;
    responseTime: number;
    status: "down" | "up";
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

export function isComputedSiteStatus(status: string): status is "mixed" | "unknown" {
    return ["mixed", "unknown"].includes(status);
}

export function isMonitorStatus(status: string): status is MonitorStatus {
    return ["down", "paused", "pending", "up"].includes(status);
}

export function isSiteStatus(status: string): status is SiteStatus {
    return ["down", "mixed", "paused", "pending", "unknown", "up"].includes(status);
}

/**
 * Enhanced monitor validation using shared type guards.
 * Provides consistent validation across frontend and backend.
 */
export function validateMonitor(monitor: Partial<Monitor>): monitor is Monitor {
    return (
        typeof monitor.id === "string" &&
        typeof monitor.type === "string" &&
        typeof monitor.status === "string" &&
        isMonitorStatus(monitor.status) &&
        typeof monitor.monitoring === "boolean" &&
        typeof monitor.responseTime === "number" &&
        typeof monitor.checkInterval === "number" &&
        typeof monitor.timeout === "number" &&
        typeof monitor.retryAttempts === "number" &&
        Array.isArray(monitor.history)
    );
}

export const ERROR_MESSAGES = {
    FAILED_TO_ADD_MONITOR: "Failed to add monitor",
    FAILED_TO_ADD_SITE: "Failed to add site",
    FAILED_TO_CHECK_SITE: "Failed to check site",
    FAILED_TO_DELETE_SITE: "Failed to delete site",
    FAILED_TO_UPDATE_INTERVAL: "Failed to update check interval",
    FAILED_TO_UPDATE_SITE: "Failed to update site",
    SITE_NOT_FOUND: "Site not found",
} as const;

/**
 * Field definition for dynamic form generation.
 * Used for monitor type configuration in both frontend and backend.
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
    /** Placeholder text */
    placeholder?: string;
    /** Whether field is required */
    required: boolean;
    /** Input type for form rendering */
    type: "number" | "text" | "url";
}

/**
 * Minimal Site interface for status calculations.
 * This allows the utilities to work with both frontend and backend Site types.
 */
export interface SiteForStatus {
    monitors: Array<{
        monitoring: boolean;
        status: MonitorStatus;
    }>;
}
