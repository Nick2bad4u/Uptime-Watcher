/**
 * Shared type definitions used across frontend and backend.
 */
/**
 * Shared type definitions for Uptime Watcher (frontend & backend).
 *
 * @remarks
 * All core domain types (Monitor, Site, StatusUpdate, etc.) live here.
 * Both frontend and backend must import from this file for consistency.
 *
 * @packageDocumentation
 */

// Re-export event types
export * from "./types/events";

export type MonitorType = "http" | "port";

export type MonitorStatus = "up" | "down" | "pending" | "paused";
export type SiteStatus = MonitorStatus | "mixed" | "unknown";

// Default status constants
export const DEFAULT_MONITOR_STATUS: MonitorStatus = "pending";
export const DEFAULT_SITE_STATUS: SiteStatus = "unknown";

export function isMonitorStatus(status: string): status is MonitorStatus {
    return ["up", "down", "pending", "paused"].includes(status);
}
export function isSiteStatus(status: string): status is SiteStatus {
    return ["up", "down", "pending", "paused", "mixed", "unknown"].includes(status);
}
export function isComputedSiteStatus(status: string): status is "mixed" | "unknown" {
    return ["mixed", "unknown"].includes(status);
}

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

export interface StatusHistory {
    details?: string;
    responseTime: number;
    status: "down" | "up";
    timestamp: number;
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

export interface Site {
    identifier: string;
    monitoring: boolean;
    monitors: Monitor[];
    name: string;
}

export interface StatusUpdate {
    details?: string;
    monitorId: string;
    status: MonitorStatus;
    siteIdentifier: string;
    timestamp: string;
    site?: Site;
    previousStatus?: MonitorStatus;
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
    /** Field name (matches monitor property) */
    name: string;
    /** Display label for the field */
    label: string;
    /** Input type for form rendering */
    type: "text" | "number" | "url";
    /** Whether field is required */
    required: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Help text for the field */
    helpText?: string;
    /** Min value for number fields */
    min?: number;
    /** Max value for number fields */
    max?: number;
}

/**
 * Minimal Site interface for status calculations.
 * This allows the utilities to work with both frontend and backend Site types.
 */
export interface SiteForStatus {
    monitors: Array<{
        status: MonitorStatus;
        monitoring: boolean;
    }>;
}
