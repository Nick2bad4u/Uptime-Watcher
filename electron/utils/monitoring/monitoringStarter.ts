/**
 * Utility functions for starting site and monitor monitoring.
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
 * Configuration object for starting monitoring functions.
 */
export interface StartMonitoringConfig {
    sites: Map<string, Site>;
    monitorScheduler: MonitorScheduler;
    monitorRepository: MonitorRepository;
    eventEmitter: EventEmitter;
    logger: Logger;
    statusUpdateEvent: string;
}

/**
 * Type for the start monitoring callback function.
 */
export type StartMonitoringCallback = (identifier: string, monitorId?: string) => Promise<boolean>;

/**
 * Start monitoring for all sites.
 *
 * @param config - Configuration object with required dependencies
 * @param isMonitoring - Current monitoring state
 * @returns Promise<boolean> - New monitoring state
 */
export async function startAllMonitoring(config: StartMonitoringConfig, isMonitoring: boolean): Promise<boolean> {
    if (isMonitoring) {
        config.logger.debug("Monitoring already running");
        return isMonitoring;
    }

    config.logger.info(`Starting monitoring with ${config.sites.size} sites (per-site intervals)`);

    // Start monitoring for each site using scheduler
    for (const site of config.sites.values()) {
        await startMonitoringForSite(config, site.identifier);
    }

    return true;
}

/**
 * Start monitoring for a specific site or monitor.
 *
 * @param config - Configuration object with required dependencies
 * @param identifier - Site identifier
 * @param monitorId - Optional monitor ID to start specific monitor
 * @param startCallback - Callback function for recursive calls (defaults to self)
 * @returns Promise<boolean> - Success status
 */
export async function startMonitoringForSite(
    config: StartMonitoringConfig,
    identifier: string,
    monitorId?: string,
    startCallback?: StartMonitoringCallback
): Promise<boolean> {
    const site = config.sites.get(identifier);
    if (!site) {
        return false;
    }

    if (monitorId) {
        // Start monitoring for specific monitor
        const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));
        if (!monitor) return false;

        // Start using scheduler
        const started = config.monitorScheduler.startMonitor(identifier, monitor);
        if (started) {
            // Set monitoring=true for this monitor and persist
            monitor.monitoring = true;
            if (monitor.id) {
                await config.monitorRepository.update(monitor.id, { monitoring: true });
            }
            // Emit status-update for this monitorId
            const statusUpdate = {
                previousStatus: undefined,
                site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
            };
            config.eventEmitter.emit(config.statusUpdateEvent, statusUpdate);
        }
        return started;
    }

    // If no monitorId is provided, start all monitors for this site
    const monitors = site.monitors.filter((monitor) => monitor.id);
    const results = await Promise.allSettled(
        monitors.map(async (monitor) => {
            try {
                // Use callback if provided, otherwise use self
                const startFn = startCallback || ((id, mid) => startMonitoringForSite(config, id, mid, startCallback));
                return await startFn(identifier, String(monitor.id));
            } catch (error) {
                config.logger.error(`Failed to start monitoring for monitor ${monitor.id}`, error);
                return false;
            }
        })
    );

    // Return true if at least one monitor started successfully
    return results.some((result) => result.status === "fulfilled" && result.value === true);
}
