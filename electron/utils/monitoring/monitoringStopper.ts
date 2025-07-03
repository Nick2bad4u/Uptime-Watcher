/**
 * Utility functions for stopping site and monitor monitoring.
 * This is extracted from UptimeMonitor to improve modularity and maintainability.
 */

import { EventEmitter } from "events";

import { MonitorRepository } from "../../services/database";
import { MonitorScheduler } from "../../services/monitoring";
import { Site } from "../../types";

type Logger = {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
};

/**
 * Configuration object for stopping monitoring functions.
 */
export interface StopMonitoringConfig {
    sites: Map<string, Site>;
    monitorScheduler: MonitorScheduler;
    monitorRepository: MonitorRepository;
    eventEmitter: EventEmitter;
    logger: Logger;
    statusUpdateEvent: string;
}

/**
 * Type for the stop monitoring callback function.
 */
export type StopMonitoringCallback = (identifier: string, monitorId?: string) => Promise<boolean>;

/**
 * Stop all monitoring and return updated monitoring state.
 *
 * @param config - Configuration object with required dependencies
 * @returns boolean - New monitoring state (always false)
 */
export function stopAllMonitoring(config: StopMonitoringConfig): boolean {
    config.monitorScheduler.stopAll();
    config.logger.info("Stopped all site monitoring intervals");
    return false;
}

/**
 * Stop monitoring for a specific site or monitor.
 *
 * @param config - Configuration object with required dependencies
 * @param identifier - Site identifier
 * @param monitorId - Optional monitor ID to stop specific monitor
 * @param stopCallback - Callback function for recursive calls (defaults to self)
 * @returns Promise<boolean> - Success status
 */
export async function stopMonitoringForSite(
    config: StopMonitoringConfig,
    identifier: string,
    monitorId?: string,
    stopCallback?: StopMonitoringCallback
): Promise<boolean> {
    const site = config.sites.get(identifier);
    if (!site) {
        return false;
    }

    if (monitorId) {
        // Stop monitoring for specific monitor using scheduler
        const stopped = config.monitorScheduler.stopMonitor(identifier, monitorId);
        if (stopped) {
            // Set monitoring=false for this monitor and persist
            const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));
            if (monitor) {
                monitor.monitoring = false;
                if (monitor.id) {
                    await config.monitorRepository.update(monitor.id, { monitoring: false });
                }
            }
            // Emit status-update for this monitorId
            const statusUpdate = {
                previousStatus: undefined,
                site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
            };
            config.eventEmitter.emit(config.statusUpdateEvent, statusUpdate);
        }
        return stopped;
    }

    // If no monitorId is provided, stop all monitors for this site
    const monitorsWithIds = site.monitors.filter((monitor) => monitor.id);
    const stopPromises = monitorsWithIds.map(async (monitor) => {
        try {
            // Use callback if provided, otherwise use self
            const stopFn = stopCallback || ((id, mid) => stopMonitoringForSite(config, id, mid, stopCallback));
            return await stopFn(identifier, monitor.id);
        } catch (error) {
            config.logger.error(`Failed to stop monitoring for monitor ${monitor.id ?? "unknown"}`, error);
            return false;
        }
    });

    const results = await Promise.all(stopPromises);
    return results.every((result) => result === true);
}
