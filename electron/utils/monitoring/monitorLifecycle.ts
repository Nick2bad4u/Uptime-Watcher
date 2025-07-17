/**
 * Monitor lifecycle management utilities.
 * Consolidates monitor starting and stopping operations for better organization.
 */

import { UptimeEvents, TypedEventBus } from "../../events/index";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { DatabaseService } from "../../services/database/DatabaseService";
import { MonitorScheduler } from "../../services/monitoring/MonitorScheduler";
import { Site } from "../../types";
import { SiteCacheInterface } from "../database/interfaces";
import { withDatabaseOperation } from "../operationalHooks";

interface Logger {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
}

/**
 * Configuration object for monitoring lifecycle functions.
 */
export interface MonitoringLifecycleConfig {
    sites: SiteCacheInterface;
    monitorScheduler: MonitorScheduler;
    monitorRepository: MonitorRepository;
    databaseService: DatabaseService;
    eventEmitter: TypedEventBus<UptimeEvents>;
    logger: Logger;
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

    config.logger.info(`Starting monitoring with ${config.sites.size()} sites (per-site intervals)`);

    // Set all monitors to pending status and enable monitoring
    for (const site of config.sites.getAll()) {
        for (const monitor of site.monitors) {
            if (monitor.id) {
                try {
                    // Use operational hooks for database update
                    await withDatabaseOperation(
                        () => {
                            const db = config.databaseService.getDatabase();
                            if (monitor.id) {
                                config.monitorRepository.updateInternal(db, monitor.id, {
                                    monitoring: true,
                                    status: "pending",
                                });
                            }
                            return Promise.resolve();
                        },
                        "monitor-start-all-update",
                        config.eventEmitter,
                        { monitorId: monitor.id }
                    );
                } catch (error) {
                    config.logger.error(`Failed to update monitor ${monitor.id} to pending status`, error);
                }
            }
        }
        config.monitorScheduler.startSite(site);
    }

    config.logger.info("Started all monitoring operations and set monitors to pending");
    return true;
}

/**
 * Stop all monitoring and return updated monitoring state.
 *
 * @param config - Configuration object with required dependencies
 * @returns boolean - New monitoring state (always false)
 */
export async function stopAllMonitoring(config: MonitoringLifecycleConfig): Promise<boolean> {
    config.monitorScheduler.stopAll();

    // Set all monitors to paused status
    for (const site of config.sites.getAll()) {
        for (const monitor of site.monitors) {
            if (monitor.id && monitor.monitoring !== false) {
                try {
                    // Use operational hooks for database update
                    await withDatabaseOperation(
                        () => {
                            const db = config.databaseService.getDatabase();
                            if (monitor.id) {
                                config.monitorRepository.updateInternal(db, monitor.id, {
                                    monitoring: false,
                                    status: "paused",
                                });
                            }
                            return Promise.resolve();
                        },
                        "monitor-stop-all-update",
                        config.eventEmitter,
                        { monitorId: monitor.id }
                    );
                } catch (error) {
                    config.logger.error(`Failed to update monitor ${monitor.id} to paused status`, error);
                }
            }
        }
    }

    config.logger.info("Stopped all site monitoring intervals and set monitors to paused");
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

    return monitorId
        ? startSpecificMonitor(config, site, identifier, monitorId)
        : startAllSiteMonitors(config, site, identifier, callback);
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

    return monitorId
        ? stopSpecificMonitor(config, site, identifier, monitorId)
        : stopAllSiteMonitors(config, site, identifier, callback);
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
        // Use operational hooks for database update
        await withDatabaseOperation(
            () => {
                const db = config.databaseService.getDatabase();
                config.monitorRepository.updateInternal(db, monitorId, {
                    monitoring: true,
                    status: "pending",
                });
                return Promise.resolve();
            },
            "monitor-start-specific",
            config.eventEmitter,
            { identifier, monitorId }
        );
        const started = config.monitorScheduler.startMonitor(identifier, monitor);
        if (started) {
            config.logger.debug(`Started monitoring for ${identifier}:${monitorId} - status set to pending`);
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
        // Use operational hooks for database update
        await withDatabaseOperation(
            () => {
                const db = config.databaseService.getDatabase();
                config.monitorRepository.updateInternal(db, monitorId, {
                    monitoring: false,
                    status: "paused",
                });
                return Promise.resolve();
            },
            "monitor-stop-specific",
            config.eventEmitter,
            { identifier, monitorId }
        );
        const stopped = config.monitorScheduler.stopMonitor(identifier, monitorId);
        if (stopped) {
            config.logger.debug(`Stopped monitoring for ${identifier}:${monitorId} - status set to paused`);
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
    config: MonitoringLifecycleConfig,
    site: Site,
    identifier: string,
    callback?: MonitoringCallback,
    useOptimisticLogic = true
): Promise<boolean> {
    // If no callback is provided, we can't perform any operations
    if (!callback) {
        return false;
    }

    // Process monitors sequentially to avoid database transaction conflicts
    const results: boolean[] = [];
    const validMonitors = site.monitors.filter((monitor) => monitor.id);

    for (const monitor of validMonitors) {
        if (monitor.id) {
            try {
                const result = await callback(identifier, monitor.id);
                results.push(result);
            } catch (error) {
                // Log error but continue processing other monitors
                config.logger.error(`Failed to process monitor ${monitor.id}:`, error);
                results.push(false);
            }
        }
    }

    // For starting monitors, use optimistic logic (succeed if ANY monitor starts)
    // For stopping monitors, use pessimistic logic (fail if ANY monitor fails to stop)
    return useOptimisticLogic ? results.some(Boolean) : results.every(Boolean);
}

/**
 * Helper function to start monitoring for all monitors in a site.
 */
async function startAllSiteMonitors(
    config: MonitoringLifecycleConfig,
    site: Site,
    identifier: string,
    callback?: MonitoringCallback
): Promise<boolean> {
    return processAllSiteMonitors(config, site, identifier, callback, true); // Use optimistic logic for starting
}

/**
 * Helper function to stop monitoring for all monitors in a site.
 */
async function stopAllSiteMonitors(
    config: MonitoringLifecycleConfig,
    site: Site,
    identifier: string,
    callback?: MonitoringCallback
): Promise<boolean> {
    return processAllSiteMonitors(config, site, identifier, callback, false); // Use pessimistic logic for stopping
}
