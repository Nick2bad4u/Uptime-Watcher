/**
 * Interval management utilities for monitors.
 * Handles setting and managing monitor check intervals.
 */

import type { Site } from "../../types";

interface Logger {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
}

/**
 * Sets default check intervals for monitors that don't have one specified.
 * This utility function ensures all monitors have a check interval set.
 *
 * @param site - Site object with monitors to process
 * @param defaultInterval - Default interval to apply in milliseconds
 * @param updateMonitorCallback - Callback to update monitor in database
 * @param logger - Logger instance for debug/info messages
 */
export async function setDefaultMonitorIntervals(
    site: Site,
    defaultInterval: number,
    updateMonitorCallback: (monitorId: string, updates: { checkInterval: number }) => Promise<void>,
    logger: Logger
): Promise<void> {
    logger.debug(`[setDefaultMonitorIntervals] Setting default intervals for site: ${site.identifier}`);

    for (const monitor of site.monitors) {
        if (monitor.id && !monitor.checkInterval) {
            monitor.checkInterval = defaultInterval;
            await updateMonitorCallback(monitor.id, { checkInterval: monitor.checkInterval });

            logger.debug(
                `[setDefaultMonitorIntervals] Set default interval ${defaultInterval}ms for monitor: ${monitor.id}`
            );
        }
    }

    logger.info(`[setDefaultMonitorIntervals] Completed setting default intervals for site: ${site.identifier}`);
}
