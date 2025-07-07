/**
 * Monitor validation utilities.
 * Handles initial monitor checks and validation operations.
 */

import type { Site } from "../../types";

interface Logger {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
}

/**
 * Performs initial monitor checks for all monitors in a site.
 * This utility function runs an initial check on all monitors when a site is added.
 *
 * @param site - Site object with monitors to check
 * @param checkMonitorCallback - Callback function to perform monitor checks
 * @param logger - Logger instance for debug/info messages
 */
export async function performInitialMonitorChecks(
    site: Site,
    checkMonitorCallback: (site: Site, monitorId: string) => Promise<unknown>,
    logger: Logger
): Promise<void> {
    logger.debug(`[performInitialMonitorChecks] Starting initial checks for site: ${site.identifier}`);

    for (const monitor of site.monitors) {
        if (monitor.id) {
            await checkMonitorCallback(site, String(monitor.id));
            logger.debug(`[performInitialMonitorChecks] Completed initial check for monitor: ${monitor.id}`);
        }
    }

    logger.info(`[performInitialMonitorChecks] Completed initial checks for all monitors in site: ${site.identifier}`);
}
