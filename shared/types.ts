/**
 * Shared type definitions used across frontend and backend.
 *
 * @remarks
 * All core domain types (Monitor, Site, StatusUpdate, etc.) live here. Both
 * frontend and backend must import from this file for consistency. Event types
 * are separate to avoid circular dependencies.
 *
 * @packageDocumentation
 */

/**
 * Status values for monitors.
 *
 * @remarks
 * Used throughout the system to represent the current state of a monitor.
 *
 * @public
 */
export type MonitorStatus = "down" | "paused" | "pending" | "up";

/**
 * Base monitor types - source of truth for type safety.
 *
 * @remarks
 * Used to enumerate all supported monitor types in the system.
 *
 * @public
 */
export const BASE_MONITOR_TYPES = ["http", "port", "ping", "dns"] as const;

/**
 * Interface for monitor status constants.
 *
 * @public
 */
export interface MonitorStatusConstants {
    DOWN: "down";
    PAUSED: "paused";
    PENDING: "pending";
    UP: "up";
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
export type SiteStatus = "mixed" | "unknown" | MonitorStatus;

/**
 * Monitor status constants to avoid hardcoded strings.
 *
 * @remarks
 * Provides named constants for all monitor status values.
 *
 * @public
 */
export const MONITOR_STATUS: MonitorStatusConstants = {
    DOWN: "down" as const,
    PAUSED: "paused" as const,
    PENDING: "pending" as const,
    UP: "up" as const,
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
export const DEFAULT_SITE_STATUS: SiteStatus = "unknown";

export interface Monitor {
    activeOperations?: string[];
    checkInterval: number;
    expectedValue?: string; // Added for DNS monitoring
    history: StatusHistory[];
    host?: string;
    id: string;
    lastChecked?: Date;
    monitoring: boolean;
    port?: number;
    recordType?: string; // Added for DNS monitoring
    responseTime: number;
    retryAttempts: number;
    status: MonitorStatus;
    timeout: number;
    type: MonitorType;
    url?: string;
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

export interface Site {
    identifier: string;
    monitoring: boolean;
    monitors: Monitor[];
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

/**
 * Helper to validate that all elements in activeOperations are valid
 * identifiers.
 *
 * @param activeOperations - Array to validate
 *
 * @returns True if all elements are valid identifiers
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

export function isComputedSiteStatus(
    status: string
): status is "mixed" | "unknown" {
    return ["mixed", "unknown"].includes(status);
}

export function isMonitorStatus(status: string): status is MonitorStatus {
    return ["down", "paused", "pending", "up"].includes(status);
}

export function isSiteStatus(status: string): status is SiteStatus {
    return [
        "down",
        "mixed",
        "paused",
        "pending",
        "unknown",
        "up",
    ].includes(status);
}

/**
 * Enhanced monitor validation using shared type guards. Provides consistent
 * validation across frontend and backend.
 */
export function validateMonitor(monitor: Partial<Monitor>): monitor is Monitor {
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
