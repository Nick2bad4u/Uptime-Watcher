/**
 * Type definitions for status values across the application.
 * Provides clear separation between monitor status and computed site status.
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
 * Type guard to check if a status is a valid monitor status.
 * @param status - Status to check
 * @returns True if status is a valid monitor status
 */
export function isMonitorStatus(status: string): status is MonitorStatus {
    return ["up", "down", "pending", "paused"].includes(status);
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
 * Type guard to check if a status is a valid site status.
 * @param status - Status to check
 * @returns True if status is a valid site status
 */
export function isSiteStatus(status: string): status is SiteStatus {
    return isMonitorStatus(status) || isComputedSiteStatus(status);
}
