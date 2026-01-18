/**
 * Monitor operations utility for handling monitor-related operations.
 *
 * @remarks
 * Provides utilities for working with monitor data and configurations,
 * including creation, validation, and manipulation of monitor objects.
 *
 * @packageDocumentation
 */

import { isMonitorStatus, type Monitor, type Site } from "@shared/types";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { ensureError } from "@shared/utils/errorHandling";

import { logger } from "../../../services/logger";
import { normalizeMonitorInternal } from "./monitorOperations.normalize";

/**
 * Adds a monitor to a site.
 *
 * @public
 */
export function addMonitorToSite(site: Site, monitor: Monitor): Site {
    const updatedMonitors = [...site.monitors, monitor];
    return { ...site, monitors: updatedMonitors };
}

/**
 * Finds a monitor in a site by ID.
 *
 * @public
 */
export function findMonitorInSite(
    site: Site,
    monitorId: string
): Monitor | undefined {
    return site.monitors.find((monitor) => monitor.id === monitorId);
}

/**
 * Normalizes a partial monitor object into a complete Monitor instance.
 *
 * @remarks
 * This function takes a partial monitor configuration and ensures it has all
 * required fields with appropriate defaults, validates the data types, and
 * filters fields based on monitor type.
 *
 * @param monitor - Partial monitor data to normalize.
 *
 * @returns Complete Monitor object with validated and normalized data.
 *
 * @throws TypeError if monitor data is invalid or malformed.
 *
 * @public
 */
export function normalizeMonitor(monitor: Partial<Monitor>): Monitor {
    return normalizeMonitorInternal(monitor);
}

/**
 * Creates a default monitor for a site.
 *
 * @example
 *
 * ```typescript
 * const monitor = createDefaultMonitor({ url: "https://example.com" });
 * ```
 *
 * @param overrides - Partial monitor object to override defaults.
 *
 * @returns Complete monitor object with defaults applied.
 *
 * @public
 */
export function createDefaultMonitor(
    overrides: Partial<Monitor> = {}
): Monitor {
    // Delegate to normalizeMonitor to avoid divergence in default/validation logic.
    return normalizeMonitor(overrides);
}

/**
 * Removes a monitor from a site.
 *
 * @example
 *
 * ```typescript
 * const updatedSite = removeMonitorFromSite(site, "monitor-123");
 * ```
 *
 * @param site - The site to remove the monitor from.
 * @param monitorId - The ID of the monitor to remove.
 *
 * @returns Updated site without the specified monitor.
 *
 * @public
 */
export function removeMonitorFromSite(site: Site, monitorId: string): Site {
    const updatedMonitors = site.monitors.filter(
        (monitor) => monitor.id !== monitorId
    );
    return { ...site, monitors: updatedMonitors };
}

/**
 * Updates a monitor in a site.
 *
 * @example
 *
 * ```typescript
 * const updatedSite = updateMonitorInSite(site, "monitor-123", {
 *     timeout: 10000,
 * });
 * ```
 *
 * @param site - The site containing the monitor.
 * @param monitorId - The ID of the monitor to update.
 * @param updates - Partial monitor updates to apply.
 *
 * @returns Updated site with modified monitor.
 *
 * @throws Error if monitor is not found.
 *
 * @public
 */
export function updateMonitorInSite(
    site: Site,
    monitorId: string,
    updates: Partial<Monitor>
): Site {
    // Updates may be contaminated; rely on normalizeMonitor for sanitation.
    let monitorFound = false;
    const updatedMonitors: Monitor[] = [];

    for (const monitor of site.monitors) {
        if (monitor.id === monitorId) {
            monitorFound = true;

            // Preserve the original monitor ID throughout the update process.
            const originalId = monitor.id;
            // Always work with a normalized baseline to avoid undefined fields lingering.
            const baseline = normalizeMonitor(monitor);

            try {
                // Ignore any id field in updates to preserve original monitor identity.
                const restUpdates = { ...updates };
                delete (restUpdates as { id?: unknown }).id;

                const merged: Partial<Monitor> = {
                    ...baseline,
                    ...restUpdates,
                    id: originalId,
                };

                const normalized = normalizeMonitor(merged);
                // Ensure the ID is definitely preserved after normalization.
                normalized.id = originalId;
                updatedMonitors.push(normalized);
            } catch (error) {
                // If updates are invalid, keep the baseline (already normalized)
                // but preserve original ID.
                logger.error(
                    `Failed to update monitor ${monitorId}:`,
                    ensureError(error)
                );
                baseline.id = originalId;
                updatedMonitors.push(baseline);
            }
        } else {
            updatedMonitors.push(monitor);
        }
    }

    if (!monitorFound) {
        throw new Error(ERROR_CATALOG.monitors.NOT_FOUND);
    }

    return { ...site, monitors: updatedMonitors };
}

/**
 * Validates that a monitor exists in a site.
 *
 * @example
 *
 * ```typescript
 * validateMonitorExists(site, "monitor-123");
 * ```
 *
 * @param site - The site to check for the monitor.
 * @param monitorId - The ID of the monitor to validate.
 *
 * @throws Error if site is not found or monitor does not exist.
 *
 * @public
 */
export function validateMonitorExists(
    site: Site | undefined,
    monitorId: string
): void {
    if (!site) {
        throw new Error(ERROR_CATALOG.sites.NOT_FOUND);
    }

    const monitor = findMonitorInSite(site, monitorId);
    if (!monitor) {
        throw new Error(ERROR_CATALOG.monitors.NOT_FOUND);
    }
}

/**
 * Creates monitor update operations.
 */
export const monitorOperations = {
    /** Toggle monitor monitoring state. */
    toggleMonitoring: (monitor: Monitor): Monitor => ({
        ...monitor,
        monitoring: !monitor.monitoring,
    }),

    /** Update monitor check interval. */
    updateCheckInterval: (monitor: Monitor, interval: number): Monitor => ({
        ...monitor,
        checkInterval: interval,
    }),

    /** Update monitor retry attempts. */
    updateRetryAttempts: (
        monitor: Monitor,
        retryAttempts: number
    ): Monitor => ({
        ...monitor,
        retryAttempts,
    }),

    /**
     * Update monitor status.
     *
     * @param monitor - The monitor to update.
     * @param status - The new status to set.
     *
     * @returns Updated monitor with validated status.
     *
     * @throws Error if status is not valid.
     */
    updateStatus: (monitor: Monitor, status: Monitor["status"]): Monitor => {
        if (!isMonitorStatus(status)) {
            throw new Error("Invalid monitor status");
        }

        return {
            ...monitor,
            status,
        };
    },

    /** Update monitor timeout. */
    updateTimeout: (monitor: Monitor, timeout: number): Monitor => ({
        ...monitor,
        timeout,
    }),
};
