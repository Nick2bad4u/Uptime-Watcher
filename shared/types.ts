/**
 * Shared type definitions used across frontend and backend.
 */

/**
 * Core monitor status values returned by monitoring checks.
 * These are the only statuses that can be directly assigned to individual monitors.
 */
export type MonitorStatus = "up" | "down" | "pending" | "paused";

/**
 * Site status values including computed aggregate states.
 * Extends MonitorStatus with UI-specific computed values.
 */
export type SiteStatus = MonitorStatus | "mixed" | "unknown";

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
 * Type guard to check if a status is a computed site status.
 * @param status - Status to check
 * @returns True if status is a computed site status
 */
export function isComputedSiteStatus(status: string): status is "mixed" | "unknown" {
    return ["mixed", "unknown"].includes(status);
}

/**
 * Type guard to check if a status is a valid monitor status.
 * @param status - Status to check
 * @returns True if status is a valid monitor status
 */
export function isMonitorStatus(status: string): status is MonitorStatus {
    return ["up", "down", "pending", "paused"].includes(status);
}

/**
 * Type guard to check if a status is a valid site status.
 * @param status - Status to check
 * @returns True if status is a valid site status
 */
export function isSiteStatus(status: string): status is SiteStatus {
    return isMonitorStatus(status) || isComputedSiteStatus(status);
}
