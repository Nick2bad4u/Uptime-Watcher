/**
 * Auto-monitor management utilities.
 * Handles automatic monitoring startup for sites and monitors.
 */

import type { Site } from "../../types";
import type { Logger } from "../interfaces";

/**
 * Automatically starts monitoring for all monitors in a site.
 * This utility function starts monitoring for new monitors that have been added.
 *
 * @param site - Site object with monitors to start
 * @param startMonitoringCallback - Callback function to start monitoring
 * @param logger - Logger instance for debug/info messages
 * @param isDev - Function to check if in development mode
 */
export async function autoStartMonitoring(
    site: Site,
    startMonitoringCallback: (siteIdentifier: string, monitorId?: string) => Promise<unknown>,
    logger: Logger,
    isDev: () => boolean
): Promise<void> {
    logger.debug(`[autoStartMonitoring] Starting monitoring for site: ${site.identifier}`);

    for (const monitor of site.monitors) {
        if (monitor.id) {
            await startMonitoringCallback(site.identifier, String(monitor.id));

            if (isDev()) {
                logger.debug(
                    `[autoStartMonitoring] Auto-started monitoring for monitor ${monitor.id} with interval ${monitor.checkInterval}ms`
                );
            }
        }
    }

    logger.info(`[autoStartMonitoring] Completed starting monitoring for all monitors in site: ${site.identifier}`);
}
