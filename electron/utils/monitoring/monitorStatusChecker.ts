/**
 * Monitor status checking utilities for individual monitor health verification.
 *
 * @remarks
 * Provides comprehensive monitor checking capabilities with automatic status updates,
 * history tracking, and event emission. Extracted from UptimeMonitor for improved
 * modularity and maintainability with full transaction safety and error handling.
 *
 * Key features:
 * - **Individual Monitor Checks**: Perform health checks on specific monitors
 * - **Automatic Status Updates**: Update monitor status in database with transactions
 * - **History Tracking**: Maintain detailed history with configurable limits
 * - **Event Emission**: Emit typed events for status changes and notifications
 * - **Error Resilience**: Comprehensive error handling with proper logging
 * - **Cache Synchronization**: Keep in-memory cache synchronized with database
 *
 * @example
 * ```typescript
 * const config: MonitorCheckConfig = {
 *   repositories: { monitor, history, site },
 *   databaseService,
 *   sites: siteCache,
 *   eventEmitter,
 *   logger,
 *   historyLimit: 500
 * };
 *
 * const result = await checkMonitor(config, site, "monitor_123");
 * if (result) {
 *   console.log(`Monitor ${result.monitorId} is ${result.status}`);
 * }
 * ```
 *
 * @packageDocumentation
 */

import { UptimeEvents, TypedEventBus } from "../../events/index";
import {
    HistoryRepository,
    MonitorRepository,
    SiteRepository,
    DatabaseService,
    MonitorFactory,
} from "../../services/index";
import { Monitor, Site, StatusHistory, StatusUpdate } from "../../types";
import { ISiteCache } from "../database/interfaces";
import { withDatabaseOperation } from "../operationalHooks";

/**
 * Logger interface for monitor checking operations.
 *
 * @remarks
 * Standardized logging interface used throughout monitor checking utilities
 * to ensure consistent logging patterns and error reporting.
 */
interface Logger {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
}

/**
 * Configuration object for monitor checking functions.
 *
 * @remarks
 * Provides all necessary dependencies for monitor checking operations,
 * including repository access, database services, cache management,
 * and event emission capabilities. Designed for dependency injection
 * and comprehensive testing support.
 */
export interface MonitorCheckConfig {
    /** Repository services for database operations */
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        site: SiteRepository;
    };
    /** Database service for transaction management */
    databaseService: DatabaseService;
    /** In-memory site cache for performance optimization */
    sites: ISiteCache;
    /** Typed event bus for high-level event communication */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Logger instance for operation tracking */
    logger: Logger;
    /** Maximum number of history entries to retain per monitor */
    historyLimit: number;
}

/**
 * Check a specific monitor and update its status.
 *
 * @param config - Configuration object with required dependencies
 * @param site - Site containing the monitor to check
 * @param monitorId - ID of the monitor to check
 * @returns Promise resolving to status update result or undefined if error occurs
 *
 * @remarks
 * Performs a comprehensive health check on the specified monitor, including:
 * - Monitor validation and existence verification
 * - Health check execution using appropriate monitor service
 * - Status comparison and change detection
 * - Database updates with transaction safety
 * - History tracking with automatic pruning
 * - Event emission for status changes and notifications
 * - Cache synchronization for performance
 *
 * The function is designed to be resilient to errors and will return undefined
 * if critical failures occur, while logging appropriate error messages for debugging.
 *
 * @example
 * ```typescript
 * const result = await checkMonitor(config, site, "monitor_123");
 * if (result) {
 *   console.log(`Monitor status: ${result.status}`);
 *   console.log(`Response time: ${result.responseTime}ms`);
 * }
 * ```
 */
export async function checkMonitor(
    config: MonitorCheckConfig,
    site: Site,
    monitorId: string
): Promise<StatusUpdate | undefined> {
    const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));
    if (!monitor) {
        config.logger.error(`[checkMonitor] Monitor not found for id: ${monitorId} on site: ${site.identifier}`);
        return undefined;
    }
    // Ensure monitor.id is present and valid before proceeding
    if (!monitor.id) {
        config.logger.error(`[checkMonitor] Monitor missing id for ${site.identifier}, skipping history insert.`);
        return undefined;
    }
    config.logger.info(`[checkMonitor] Checking monitor: site=${site.identifier}, id=${monitor.id}`);

    // Use the monitoring service to perform the check
    const getCheckResult = async () => {
        try {
            const monitorService = MonitorFactory.getMonitor(monitor.type, {
                timeout: monitor.timeout,
            });
            return await monitorService.check(monitor);
        } catch (error) {
            config.logger.error(`[checkMonitor] Error using monitor service for type ${monitor.type}`, error);
            return {
                details: "0",
                error: "Monitor service error",
                responseTime: 0,
                status: "down" as const,
            };
        }
    };

    const checkResult = await getCheckResult();

    const previousStatus = monitor.status;
    const now = new Date();

    // Update monitor with results
    monitor.status = checkResult.status;
    monitor.responseTime = checkResult.responseTime;
    monitor.lastChecked = now;
    // Add to history
    const historyEntry: StatusHistory = {
        responseTime: checkResult.responseTime,
        status: checkResult.status,
        timestamp: now.getTime(),
    };

    try {
        // Use operational hooks for database operations
        await withDatabaseOperation(
            () => {
                const db = config.databaseService.getDatabase();
                // Add history entry using internal method to avoid nested transactions
                config.repositories.history.addEntryInternal(db, monitor.id, historyEntry, checkResult.details);

                // Smart history pruning: Only prune when necessary to avoid performance overhead
                if (config.historyLimit > 0) {
                    // Use a buffer strategy: only prune when we exceed limit + buffer
                    // This reduces frequency of pruning operations while maintaining reasonable limits
                    const bufferSize = Math.max(Math.floor(config.historyLimit * 0.2), 5); // 20% buffer, min 5 entries
                    const pruneThreshold = config.historyLimit + bufferSize;

                    // Get current count for this monitor (lightweight operation)
                    const currentCount = config.repositories.history.getHistoryCount(monitor.id);

                    if (currentCount > pruneThreshold) {
                        config.repositories.history.pruneHistoryInternal(db, monitor.id, config.historyLimit);
                        config.logger.debug(
                            `[MonitorStatusChecker] Pruned history for monitor ${monitor.id}: ${currentCount} -> ${config.historyLimit} entries`
                        );
                    }
                }

                // Update monitor with new status using internal method (we're already in a transaction)
                const updateData: Partial<Monitor> = {
                    responseTime: monitor.responseTime,
                    status: monitor.status,
                };
                // We just set lastChecked to 'now', so it's definitely defined
                if (monitor.lastChecked !== undefined) {
                    updateData.lastChecked = monitor.lastChecked;
                }
                config.repositories.monitor.updateInternal(db, monitor.id, updateData);
                return Promise.resolve();
            },
            "monitor-status-update",
            config.eventEmitter,
            { monitorId: monitor.id, status: historyEntry.status }
        );

        config.logger.info(
            `[checkMonitor] Database operations completed: monitor_id=${monitor.id}, status=${historyEntry.status}, responseTime=${historyEntry.responseTime}, timestamp=${historyEntry.timestamp}, details=${checkResult.details ?? "undefined"}`
        );
    } catch (error) {
        config.logger.error(`[checkMonitor] Failed to complete database operations: monitor_id=${monitor.id}`, error);
        return undefined; // Return early if database operations fail
    }

    // Fetch fresh site data from database to ensure we have the latest history and monitor state
    const freshSiteData = await config.repositories.site.getByIdentifier(site.identifier);
    if (!freshSiteData) {
        config.logger.error(`[checkMonitor] Failed to fetch updated site data for ${site.identifier}`);
        return undefined;
    }

    // Update the in-memory cache with fresh data
    config.sites.set(site.identifier, freshSiteData);

    // Emit StatusUpdate as a typed event instead of old emit pattern
    const statusUpdate: StatusUpdate = {
        previousStatus,
        site: freshSiteData,
    };

    // Emit typed monitor status changed event
    await config.eventEmitter.emitTyped("monitor:status-changed", {
        monitor: freshSiteData.monitors.find((m) => m.id === monitor.id) ?? monitor,
        newStatus: checkResult.status,
        previousStatus,
        responseTime: checkResult.responseTime,
        site: freshSiteData,
        siteId: site.identifier,
        timestamp: Date.now(),
    });

    // Emit monitor state change events with proper typing
    if (previousStatus === "up" && checkResult.status === "down") {
        await config.eventEmitter.emitTyped("monitor:down", {
            monitor: { ...monitor },
            site: freshSiteData,
            siteId: site.identifier,
            timestamp: Date.now(),
        });
    } else if (previousStatus === "down" && checkResult.status === "up") {
        await config.eventEmitter.emitTyped("monitor:up", {
            monitor: { ...monitor },
            site: freshSiteData,
            siteId: site.identifier,
            timestamp: Date.now(),
        });
    }

    return statusUpdate;
}

/**
 * Check a site's monitor manually.
 *
 * @param config - Configuration object with required dependencies
 * @param identifier - Site identifier
 * @param monitorId - Optional monitor ID, uses first monitor if not provided
 * @returns Promise\<StatusUpdate | undefined\> - Status update result or undefined if error
 */
export async function checkSiteManually(
    config: MonitorCheckConfig,
    identifier: string,
    monitorId?: string
): Promise<StatusUpdate | undefined> {
    const site = config.sites.get(identifier);
    if (!site) {
        throw new Error(`Site not found: ${identifier}`);
    }

    // If no monitorId provided, use the first monitor's ID
    const targetMonitorId =
        monitorId ??
        (() => {
            const firstMonitor = site.monitors[0];
            if (!firstMonitor?.id) {
                throw new Error(`No monitors found for site ${identifier}`);
            }
            return String(firstMonitor.id);
        })();

    // Validate the monitor exists
    const monitor = site.monitors.find((m) => String(m.id) === String(targetMonitorId));
    if (!monitor) {
        throw new Error(`Monitor with ID ${targetMonitorId} not found for site ${identifier}`);
    }

    const result = await checkMonitor(config, site, targetMonitorId);
    return result ?? undefined;
}
