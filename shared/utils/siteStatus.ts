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

import { isMonitorStatus, STATUS_KIND } from "@shared/types";
import { isPresent } from "ts-extras";

/**
 * Normalizes a site monitors collection by removing nullish entries and
 * ensuring an array is always returned.
 *
 * @param monitors - Raw monitors payload from a {@link SiteForStatus} entity.
 *
 * @returns A sanitized monitors array safe for downstream calculations.
 */
const normalizeMonitors = (
    monitors: null | SiteForStatus["monitors"] | undefined
): SiteForStatus["monitors"] => {
    if (!Array.isArray(monitors)) {
        return [];
    }

    const nullableMonitors = monitors as Array<
        null | SiteForStatus["monitors"][number] | undefined
    >;

    return nullableMonitors.filter(isPresent);
};

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
    const monitors = normalizeMonitors(site.monitors);

    if (monitors.length === 0) {
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
 * - Returns `"degraded"` if all monitors are degraded.
 * - Returns `"pending"` if all monitors are pending.
 * - Returns `"paused"` if all monitors are paused.
 * - Returns `"mixed"` if monitors have different statuses.
 * - Returns `"unknown"` if there are no monitors.
 *
 * @example
 *
 * ```typescript
 * const status = calculateSiteStatus(site);
 * // status: "up" | "down" | "degraded" | "pending" | "paused" | "mixed" | "unknown"
 * ```
 *
 * @param site - The {@link SiteForStatus} object representing the site to
 *   evaluate.
 *
 * @returns The operational status as a {@link SiteStatus} value.
 */
export function calculateSiteStatus(site: SiteForStatus): SiteStatus {
    const monitors = normalizeMonitors(site.monitors);

    if (monitors.length === 0) {
        return STATUS_KIND.UNKNOWN;
    }

    // Get unique statuses and validate they exist
    const statuses = Array.from(new Set(monitors.map((m) => m.status)));

    // Handle case where no valid statuses found
    if (statuses.length === 0) {
        return STATUS_KIND.UNKNOWN;
    }

    // Single status - all monitors have the same status
    if (statuses.length === 1) {
        const [singleStatus] = statuses;
        if (!singleStatus) {
            return STATUS_KIND.UNKNOWN;
        }
        // Validate the status is a valid SiteStatus before returning
        if (isMonitorStatus(singleStatus)) {
            return singleStatus;
        }
        // Fallback for invalid status values
        return STATUS_KIND.UNKNOWN;
    }

    // Multiple statuses - mixed state
    return STATUS_KIND.MIXED;
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
    const monitors = normalizeMonitors(site.monitors);
    const normalizedSite: SiteForStatus = {
        ...site,
        monitors,
    };

    const monitoringStatus = calculateSiteMonitoringStatus(normalizedSite);
    const operationalStatus = calculateSiteStatus(normalizedSite);

    // If no monitors exist, show as unknown
    if (monitors.length === 0) {
        return STATUS_KIND.UNKNOWN;
    }

    // If no monitoring is active, show as paused regardless of operational
    // status
    if (monitoringStatus === "stopped") {
        return STATUS_KIND.PAUSED;
    }

    // If monitoring is partial, show as mixed
    if (monitoringStatus === "partial") {
        return STATUS_KIND.MIXED;
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
    const monitors = normalizeMonitors(site.monitors);
    const normalizedSite: SiteForStatus = {
        ...site,
        monitors,
    };

    const status = getSiteDisplayStatus(normalizedSite);
    const monitorCount = monitors.length;
    const runningCount = monitors.filter((m) => m.monitoring).length;

    switch (status) {
        case STATUS_KIND.DEGRADED: {
            return `All ${monitorCount} monitors are degraded`;
        }
        case STATUS_KIND.DOWN: {
            return `All ${monitorCount} monitors are down`;
        }
        case STATUS_KIND.MIXED: {
            return `Mixed status (${runningCount}/${monitorCount} monitoring active)`;
        }
        case STATUS_KIND.PAUSED: {
            return `Monitoring is paused (${runningCount}/${monitorCount} active)`;
        }
        case STATUS_KIND.PENDING: {
            return `All ${monitorCount} monitors are pending`;
        }
        case STATUS_KIND.UNKNOWN: {
            if (monitorCount === 0) {
                return "No monitors configured";
            }
            return "Unknown status";
        }
        case STATUS_KIND.UP: {
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
        case STATUS_KIND.DEGRADED: {
            return "warning";
        }
        case STATUS_KIND.DOWN: {
            return "error";
        }
        case STATUS_KIND.MIXED: {
            return "warning";
        }
        case STATUS_KIND.PAUSED: {
            return "warning";
        }
        case STATUS_KIND.PENDING: {
            return "info";
        }
        case STATUS_KIND.UNKNOWN: {
            return "error";
        }
        case STATUS_KIND.UP: {
            return "success";
        }
        default: {
            // Align with unknown status handling - treat unexpected values as
            // errors
            return "error";
        }
    }
}
