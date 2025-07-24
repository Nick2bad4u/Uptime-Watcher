/**
 * Monitor lifecycle management utilities.
 * Consolidates monitor starting and stopping operations for better organization.
 */

import type { Logger } from "../interfaces";

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { DatabaseService } from "../../services/database/DatabaseService";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { MonitorScheduler } from "../../services/monitoring/MonitorScheduler";
import { Site } from "../../types";
import { StandardizedCache } from "../cache/StandardizedCache";
import { withDatabaseOperation } from "../operationalHooks";

/**
 * Type for the monitoring lifecycle callback functions.
 *
 * @param identifier - Site identifier for the monitoring operation
 * @param monitorId - Optional specific monitor ID, if not provided operates on all site monitors
 * @returns Promise resolving to true if operation succeeded, false otherwise
 *
 * @remarks
 * Used for recursive calls in monitoring operations. The callback should handle
 * both individual monitor operations (when monitorId is provided) and bulk
 * operations (when monitorId is undefined). Error handling should be managed
 * within the callback implementation.
 */
export type MonitoringCallback = (identifier: string, monitorId?: string) => Promise<boolean>;

/**
 * Configuration object for monitoring lifecycle functions.
 */
export interface MonitoringLifecycleConfig {
    /** Database service for executing transactions and maintaining data consistency */
    databaseService: DatabaseService;
    /** Event emitter for communicating monitoring state changes to other components */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Logger instance for debugging and operational information */
    logger: Logger;
    /** Repository for monitor data access and manipulation */
    monitorRepository: MonitorRepository;
    /** Scheduler service for managing monitor execution intervals and timing */
    monitorScheduler: MonitorScheduler;
    /** Cache containing site data with associated monitors */
    sites: StandardizedCache<Site>;
}

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

    // Set all monitors to pending status and enable monitoring
    // Note: Intentionally sets all monitors to "pending" regardless of previous state
    // to indicate they are being initialized for monitoring startup
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
 * Stop all monitoring and return updated monitoring state.
 *
 * @param config - Configuration object with required dependencies
 * @returns boolean - New monitoring state (always false)
 */
export async function stopAllMonitoring(config: MonitoringLifecycleConfig): Promise<boolean> {
    config.monitorScheduler.stopAll();

    // Set all monitors to paused status
    // Note: Intentionally sets all monitors to "paused" regardless of previous state
    // to indicate monitoring has been stopped system-wide
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
 * Helper function to find a monitor by ID within a site.
 *
 * @param site - Site to search within
 * @param monitorId - Monitor ID to find
 * @param identifier - Site identifier for logging
 * @param config - Configuration object for logging
 * @returns Monitor object if found, null otherwise
 */
function findMonitorById(
    site: Site,
    monitorId: string,
    identifier: string,
    config: MonitoringLifecycleConfig
): null | Site["monitors"][0] {
    const monitor = site.monitors.find((m) => m.id === monitorId);
    if (!monitor) {
        config.logger.warn(`Monitor not found: ${identifier}:${monitorId}`);
        return null;
    }
    return monitor;
}

/**
 * Helper function to start or stop monitoring for all monitors in a site.
 *
 * @param config - Configuration object with required dependencies
 * @param site - Site containing monitors to process
 * @param identifier - Site identifier for logging
 * @param callback - Callback function to execute for each monitor
 * @param useOptimisticLogic - Result aggregation strategy:
 *   - true (optimistic): Success if ANY monitor operation succeeds (used for starting)
 *   - false (pessimistic): Success only if ALL monitor operations succeed (used for stopping)
 * @returns Promise resolving to aggregated success state based on logic type
 *
 * @remarks
 * The different aggregation strategies reflect the operational semantics:
 * - Starting: If any monitor starts successfully, the site is considered "partially active"
 * - Stopping: All monitors must stop successfully for the site to be "fully stopped"
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
                // eslint-disable-next-line n/callback-return -- This is a processing callback, not an async Node.js callback
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
 * Helper function to start monitoring for a specific monitor.
 */
async function startSpecificMonitor(
    config: MonitoringLifecycleConfig,
    site: Site,
    identifier: string,
    monitorId: string
): Promise<boolean> {
    const monitor = findMonitorById(site, monitorId, identifier, config);
    if (!monitor) {
        return false;
    }

    if (!validateCheckInterval(monitor, identifier, config)) {
        return false;
    }

    try {
        // Note: Database update is performed before starting the monitor scheduler
        // This design choice ensures status consistency even if scheduler fails
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

/**
 * Helper function to stop monitoring for a specific monitor.
 */
async function stopSpecificMonitor(
    config: MonitoringLifecycleConfig,
    site: Site,
    identifier: string,
    monitorId: string
): Promise<boolean> {
    const monitor = findMonitorById(site, monitorId, identifier, config);
    if (!monitor) {
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
 * Validate monitor check interval.
 *
 * @param monitor - Monitor to validate
 * @param identifier - Site identifier for logging
 * @param config - Configuration object for logging
 * @returns True if interval is valid, false otherwise
 */
function validateCheckInterval(
    monitor: Site["monitors"][0],
    identifier: string,
    config: MonitoringLifecycleConfig
): boolean {
    // Check for falsy values that indicate no interval set
    // This includes undefined, null, 0, and empty string
    if (!monitor.checkInterval) {
        config.logger.warn(`Monitor ${identifier}:${monitor.id} has no check interval set`);
        return false;
    }
    return true;
}
