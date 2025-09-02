/**
 * Site status calculation utilities.
 *
 * @remarks
 * Provides comprehensive logic for determining overall site status based on
 * monitor states. This is the single source of truth for status calculations,
 * used by both frontend and backend.
 *
 * @packageDocumentation
 */

import type { SiteForStatus, SiteStatus } from "@shared/types";

/**
 * Calculates the overall monitoring state for a site based on its monitors.
 *
 * @remarks
 * The monitoring state reflects whether all, some, or none of the site's
 * monitors are actively monitoring.
 *
 * - Returns `"running"` if all monitors are actively monitoring.
 * - Returns `"stopped"` if no monitors are actively monitoring or if there are no
 *   monitors.
 * - Returns `"partial"` if some monitors are monitoring and some are not.
 *
 * @example
 *
 * ```typescript
 * const status = calculateSiteMonitoringStatus(site);
 * // status: "running" | "stopped" | "partial"
 * ```
 *
 * @param site - The {@link SiteForStatus} object representing the site to
 *   evaluate.
 *
 * @returns The monitoring state: `"running"`, `"stopped"`, or `"partial"`.
 */
export function calculateSiteMonitoringStatus(
    site: SiteForStatus
): "partial" | "running" | "stopped" {
    const { monitors } = site;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!monitors || monitors.length === 0) {
        return "stopped";
    }

    const monitoringCount = monitors.filter((m) => m.monitoring).length;

    if (monitoringCount === 0) {
        return "stopped";
    }

    if (monitoringCount === monitors.length) {
        return "running";
    }

    return "partial";
}

/**
 * Calculates the overall operational status for a site based on the statuses of
 * its monitors.
 *
 * @remarks
 * The operational status reflects the aggregate health of all monitors:
 *
 * - Returns `"up"` if all monitors are up.
 * - Returns `"down"` if all monitors are down.
 * - Returns `"pending"` if all monitors are pending.
 * - Returns `"paused"` if all monitors are paused.
 * - Returns `"mixed"` if monitors have different statuses.
 * - Returns `"unknown"` if there are no monitors.
 *
 * @example
 *
 * ```typescript
 * const status = calculateSiteStatus(site);
 * // status: "up" | "down" | "pending" | "paused" | "mixed" | "unknown"
 * ```
 *
 * @param site - The {@link SiteForStatus} object representing the site to
 *   evaluate.
 *
 * @returns The operational status as a {@link SiteStatus} value.
 */
export function calculateSiteStatus(site: SiteForStatus): SiteStatus {
    const { monitors } = site;

    if (monitors.length === 0) {
        return "unknown";
    }

    // Get unique statuses
    const statuses = Array.from(new Set(monitors.map((m) => m.status)));

    // Single status - all monitors have the same status
    if (statuses.length === 1) {
        // Type assertion is safe as we know all monitors have the same status
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return statuses[0] as SiteStatus;
    }

    // Multiple statuses - mixed state
    return "mixed";
}

/**
 * Determines the display status for a site, considering both operational and
 * monitoring states.
 *
 * @remarks
 * This is the primary function for determining the status to display in the UI.
 *
 * @example
 *
 * ```typescript
 * const displayStatus = getSiteDisplayStatus(site);
 * // displayStatus: "up" | "down" | "pending" | "paused" | "mixed" | "unknown"
 * ```
 *
 * @param site - The {@link SiteForStatus} object representing the site to
 *   evaluate.
 *
 * @returns `"unknown"` if there are no monitors.
 * @returns `"paused"` if no monitors are actively monitoring.
 * @returns `"mixed"` if monitoring is partial (some monitors running, some
 *   not).
 *
 *   - Otherwise, returns the operational status as determined by
 *       {@link calculateSiteStatus}.
 * @returns The display status as a {@link SiteStatus} value.
 */
export function getSiteDisplayStatus(site: SiteForStatus): SiteStatus {
    const monitoringStatus = calculateSiteMonitoringStatus(site);
    const operationalStatus = calculateSiteStatus(site);

    // If no monitors exist, show as unknown
    if (site.monitors.length === 0) {
        return "unknown";
    }

    // If no monitoring is active, show as paused regardless of operational
    // status
    if (monitoringStatus === "stopped") {
        return "paused";
    }

    // If monitoring is partial, show as mixed
    if (monitoringStatus === "partial") {
        return "mixed";
    }

    // All monitors are running, return the operational status
    return operationalStatus;
}

/**
 * Generates a human-readable description of the site's current status.
 *
 * @remarks
 * The description summarizes the site's status and monitoring activity for
 * display in the UI.
 *
 * @example
 *
 * ```typescript
 * const desc = getSiteStatusDescription(site);
 * // desc: "All 3 monitors are up and running", "Mixed status (2/3 monitoring active)", etc.
 * ```
 *
 * @param site - The {@link SiteForStatus} object representing the site to
 *   describe.
 *
 * @returns A human-readable string describing the site's status.
 */
export function getSiteStatusDescription(site: SiteForStatus): string {
    const status = getSiteDisplayStatus(site);
    const monitorCount = site.monitors.length;
    const runningCount = site.monitors.filter((m) => m.monitoring).length;

    switch (status) {
        case "down": {
            return `All ${monitorCount} monitors are down`;
        }
        case "mixed": {
            return `Mixed status (${runningCount}/${monitorCount} monitoring active)`;
        }
        case "paused": {
            return `Monitoring is paused (${runningCount}/${monitorCount} active)`;
        }
        case "pending": {
            return `All ${monitorCount} monitors are pending`;
        }
        case "unknown": {
            return "No monitors configured";
        }
        case "up": {
            return `All ${monitorCount} monitors are up and running`;
        }
        default: {
            return "Unknown status";
        }
    }
}

/**
 * Maps a {@link SiteStatus} value to a UI color variant for status indicators.
 *
 * @remarks
 * The returned variant is intended for use in UI components (e.g., badges,
 * icons). - `"success"`: All monitors are healthy (`"up"`).
 *
 * - `"error"`: All monitors are down or status is unknown (`"down"` or
 *   `"unknown"`). - `"warning"`: Mixed or paused status (`"mixed"` or
 *   `"paused"`).
 * - `"info"`: Pending status (`"pending"`).
 *
 * @example
 *
 * ```typescript
 * const color = getSiteStatusVariant("up"); // "success"
 * ```
 *
 * @param status - The {@link SiteStatus} value to map.
 *
 * @returns The color variant: `"success"`, `"error"`, `"warning"`, or `"info"`.
 */
export function getSiteStatusVariant(
    status: SiteStatus
): "error" | "info" | "success" | "warning" {
    switch (status) {
        case "down": {
            return "error";
        }
        case "mixed": {
            return "warning";
        }
        case "paused": {
            return "warning";
        }
        case "pending": {
            return "info";
        }
        case "unknown": {
            return "error";
        }
        case "up": {
            return "success";
        }
        default: {
            // Align with unknown status handling - treat unexpected values as
            // errors
            return "error";
        }
    }
}
