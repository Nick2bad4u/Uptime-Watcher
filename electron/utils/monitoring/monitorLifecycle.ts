/**
 * Monitor lifecycle management utilities.
 * Consolidates monitor starting and stopping operations for better organization.
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
 * Configuration object for monitoring lifecycle functions.
 */
export interface MonitoringLifecycleConfig {
    sites: Map<string, Site>;
    monitorScheduler: MonitorScheduler;
    monitorRepository: MonitorRepository;
    eventEmitter: EventEmitter;
    logger: Logger;
    statusUpdateEvent: string;
}

/**
 * Type for the monitoring lifecycle callback functions.
 */
export type MonitoringCallback = (identifier: string, monitorId?: string) => Promise<boolean>;

/**
 * Start monitoring for all sites.
 *
 * @param config - Configuration object with required dependencies
 * @param isMonitoring - Current monitoring state
 * @returns Promise<boolean> - New monitoring state
 */
export async function startAllMonitoring(config: MonitoringLifecycleConfig, isMonitoring: boolean): Promise<boolean> {
    if (isMonitoring) {
        config.logger.debug("Monitoring already running");
        return isMonitoring;
    }

    config.logger.info(`Starting monitoring with ${config.sites.size} sites (per-site intervals)`);

    for (const [, site] of Array.from(config.sites)) {
        config.monitorScheduler.startSite(site);
    }

    config.logger.info("Started all monitoring operations");
    return true;
}

/**
 * Stop all monitoring and return updated monitoring state.
 *
 * @param config - Configuration object with required dependencies
 * @returns boolean - New monitoring state (always false)
 */
export function stopAllMonitoring(config: MonitoringLifecycleConfig): boolean {
    config.monitorScheduler.stopAll();
    config.logger.info("Stopped all site monitoring intervals");
    return false;
}

/**
 * Start monitoring for a specific site or monitor.
 *
 * @param config - Configuration object with required dependencies
 * @param identifier - Site identifier
 * @param monitorId - Optional monitor ID (if not provided, starts all monitors for the site)
 * @param callback - Callback function for recursive calls
 * @returns Promise<boolean> - True if monitoring was started successfully
 */
export async function startMonitoringForSite(
    config: MonitoringLifecycleConfig,
    identifier: string,
    monitorId?: string,
    callback?: MonitoringCallback
): Promise<boolean> {
    const site = config.sites.get(identifier);
    if (!site) {
        config.logger.warn(`Site not found for monitoring: ${identifier}`);
        return false;
    }

    if (monitorId) {
        return await startSpecificMonitor(config, site, identifier, monitorId);
    } else {
        return await startAllSiteMonitors(config, site, identifier, callback);
    }
}

/**
 * Stop monitoring for a specific site or monitor.
 *
 * @param config - Configuration object with required dependencies
 * @param identifier - Site identifier
 * @param monitorId - Optional monitor ID (if not provided, stops all monitors for the site)
 * @param callback - Callback function for recursive calls
 * @returns Promise<boolean> - True if monitoring was stopped successfully
 */
export async function stopMonitoringForSite(
    config: MonitoringLifecycleConfig,
    identifier: string,
    monitorId?: string,
    callback?: MonitoringCallback
): Promise<boolean> {
    const site = config.sites.get(identifier);
    if (!site) {
        config.logger.warn(`Site not found for stopping monitoring: ${identifier}`);
        return false;
    }

    if (monitorId) {
        return await stopSpecificMonitor(config, site, identifier, monitorId);
    } else {
        return await stopAllSiteMonitors(config, site, identifier, callback);
    }
}

/**
 * Helper function to start monitoring for a specific monitor.
 */
async function startSpecificMonitor(
    config: MonitoringLifecycleConfig,
    site: Site,
    identifier: string,
    monitorId: string
): Promise<boolean> {
    const monitor = site.monitors.find((m) => m.id === monitorId);
    if (!monitor) {
        config.logger.warn(`Monitor not found: ${identifier}:${monitorId}`);
        return false;
    }

    if (!monitor.checkInterval) {
        config.logger.warn(`Monitor ${identifier}:${monitorId} has no check interval set`);
        return false;
    }

    try {
        await config.monitorRepository.update(monitorId, { monitoring: true });
        const started = config.monitorScheduler.startMonitor(identifier, monitor);
        if (started) {
            config.logger.debug(`Started monitoring for ${identifier}:${monitorId}`);
        }
        return started;
    } catch (error) {
        config.logger.error(`Failed to start monitoring for ${identifier}:${monitorId}`, error);
        return false;
    }
}

/**
 * Helper function to stop monitoring for a specific monitor.
 */
async function stopSpecificMonitor(
    config: MonitoringLifecycleConfig,
    site: Site,
    identifier: string,
    monitorId: string
): Promise<boolean> {
    const monitor = site.monitors.find((m) => m.id === monitorId);
    if (!monitor) {
        config.logger.warn(`Monitor not found: ${identifier}:${monitorId}`);
        return false;
    }

    try {
        await config.monitorRepository.update(monitorId, { monitoring: false });
        const stopped = config.monitorScheduler.stopMonitor(identifier, monitorId);
        if (stopped) {
            config.logger.debug(`Stopped monitoring for ${identifier}:${monitorId}`);
        }
        return stopped;
    } catch (error) {
        config.logger.error(`Failed to stop monitoring for ${identifier}:${monitorId}`, error);
        return false;
    }
}

/**
 * Helper function to start or stop monitoring for all monitors in a site.
 */
async function processAllSiteMonitors(
    site: Site,
    identifier: string,
    callback?: MonitoringCallback,
    useOptimisticLogic: boolean = true
): Promise<boolean> {
    // If no callback is provided, we can't perform any operations
    if (!callback) {
        return false;
    }

    const results = await Promise.all(
        site.monitors
            .filter((monitor) => monitor.id) // Only include monitors with valid IDs
            .map(async (monitor) => {
                if (monitor.id) {
                    return await callback(identifier, monitor.id);
                }
                return false;
            })
    );

    // For starting monitors, use optimistic logic (succeed if ANY monitor starts)
    // For stopping monitors, use pessimistic logic (fail if ANY monitor fails to stop)
    return useOptimisticLogic ? results.some((result) => result) : results.every((result) => result);
}

/**
 * Helper function to start monitoring for all monitors in a site.
 */
async function startAllSiteMonitors(
    _config: MonitoringLifecycleConfig,
    site: Site,
    identifier: string,
    callback?: MonitoringCallback
): Promise<boolean> {
    return await processAllSiteMonitors(site, identifier, callback, true); // Use optimistic logic for starting
}

/**
 * Helper function to stop monitoring for all monitors in a site.
 */
async function stopAllSiteMonitors(
    _config: MonitoringLifecycleConfig,
    site: Site,
    identifier: string,
    callback?: MonitoringCallback
): Promise<boolean> {
    return await processAllSiteMonitors(site, identifier, callback, false); // Use pessimistic logic for stopping
}
