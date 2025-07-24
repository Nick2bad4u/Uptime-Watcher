/**
 * Site status calculation utilities.
 * Provides comprehensive logic for determining overall site status based on monitor states.
 *
 * This is the single source of truth for status calculations, used by both frontend and backend.
 */

import type { SiteForStatus, SiteStatus } from "../types";

/**
 * Calculate the overall site monitoring status.
 *
 * Logic:
 * - "running": All monitors are actively monitoring
 * - "stopped": No monitors are actively monitoring
 * - "partial": Some monitors are monitoring, some are not
 *
 * @param site - The site to calculate monitoring status for
 * @returns Overall monitoring status
 */
export function calculateSiteMonitoringStatus(site: SiteForStatus): "partial" | "running" | "stopped" {
    const monitors = site.monitors;

    if (monitors.length === 0) {
        return "stopped";
    }

    const monitoringCount = monitors.filter((m) => m.monitoring === true).length;

    if (monitoringCount === 0) {
        return "stopped";
    }

    if (monitoringCount === monitors.length) {
        return "running";
    }

    return "partial";
}

/**
 * Calculate the overall site status based on monitor states.
 *
 * Logic:
 * - "up": All monitors are up and running
 * - "down": All monitors are down
 * - "pending": All monitors are pending
 * - "paused": All monitors are paused (not monitoring)
 * - "mixed": Monitors have different statuses (some up, some down, some paused, etc.)
 * - "unknown": No monitors exist
 *
 * @param site - The site to calculate status for
 * @returns Overall site status
 */
export function calculateSiteStatus(site: SiteForStatus): SiteStatus {
    const monitors = site.monitors;

    if (monitors.length === 0) {
        return "unknown";
    }

    // Get unique statuses
    const statuses = [...new Set(monitors.map((m) => m.status))];

    // Single status - all monitors have the same status
    if (statuses.length === 1) {
        return statuses[0] as SiteStatus;
    }

    // Multiple statuses - mixed state
    return "mixed";
}

/**
 * Get a display-friendly site status that considers both operational status and monitoring state.
 * This is the primary function to use for displaying site status in the UI.
 *
 * @param site - The site to get display status for
 * @returns Display status for the site
 */
export function getSiteDisplayStatus(site: SiteForStatus): SiteStatus {
    const monitoringStatus = calculateSiteMonitoringStatus(site);
    const operationalStatus = calculateSiteStatus(site);

    // If no monitors exist, show as unknown
    if (site.monitors.length === 0) {
        return "unknown";
    }

    // If no monitoring is active, show as paused regardless of operational status
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
 * Get a human-readable description of the site status.
 *
 * @param site - The site to get description for
 * @returns Human-readable status description
 */
export function getSiteStatusDescription(site: SiteForStatus): string {
    const status = getSiteDisplayStatus(site);
    const monitorCount = site.monitors.length;
    const runningCount = site.monitors.filter((m) => m.monitoring === true).length;

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
 * Get the appropriate status indicator color for a site status.
 *
 * @param status - The site status
 * @returns Color variant for status indicators: "success" (up), "error" (down/unknown),
 *          "warning" (mixed/paused), or "info" (pending)
 *
 * @remarks
 * Maps site status values to UI color variants:
 * - "success": up status (all monitors healthy)
 * - "error": down or unknown status (problems detected)
 * - "warning": mixed or paused status (partial issues)
 * - "info": pending status (waiting for results)
 */
export function getSiteStatusVariant(status: SiteStatus): "error" | "info" | "success" | "warning" {
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
            // Align with unknown status handling - treat unexpected values as errors
            return "error";
        }
    }
}
