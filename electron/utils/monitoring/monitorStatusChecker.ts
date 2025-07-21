/**
 * Monitor status checking utilities for individual monitor health verification.
 *
 * @remarks
 * Provides comprehensive monitor checking capabilities with automatic status updates,
 * history tracking, and event emission. Extracted from UptimeMonitor for improved
 * modularity and maintainability with full transaction safety and error handling.
 *
 * @public
 *
 * @alpha
 * This API is in active development and may change frequently.
 *
 * @see {@link MonitorCheckConfig} for configuration options
 * @see {@link StatusUpdate} for result types
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
 *   logger.info(`Monitor ${result.monitorId} is ${result.status}`);
 * }
 * ```
 *
 * @packageDocumentation
 */

import type { Logger } from "../interfaces";

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { DatabaseService } from "../../services/database/DatabaseService";
import { HistoryRepository } from "../../services/database/HistoryRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
import { MonitorFactory } from "../../services/monitoring/MonitorFactory";
import { SiteService } from "../../services/site/SiteService";
import { Site, StatusHistory, StatusUpdate } from "../../types";
import { StandardizedCache } from "../cache/StandardizedCache";
import { withDatabaseOperation } from "../operationalHooks";

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
    /** Database service for transaction management */
    databaseService: DatabaseService;
    /** Typed event bus for high-level event communication */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Maximum number of history entries to retain per monitor */
    historyLimit: number;
    /** Logger instance for operation tracking */
    logger: Logger;
    /** Repository services for database operations */
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        site: SiteRepository;
    };
    /** In-memory site cache for performance optimization */
    sites: StandardizedCache<Site>;
    /** Service for coordinated site operations */
    siteService: SiteService;
}

/**
 * Check a specific monitor and update its status.
 *
 * @param config - Configuration object with required dependencies
 * @param site - Site containing the monitor to check
 * @param monitorId - ID of the monitor to check
 * @param isManualCheck - Whether this is a manual check (preserves paused state)
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
 * For manual checks on paused monitors, the monitor status remains "paused"
 * but the actual check result is recorded in history for diagnostic purposes.
 *
 * The function is designed to be resilient to errors and will return undefined
 * if critical failures occur, while logging appropriate error messages for debugging.
 *
 * @example
 * ```typescript
 * const result = await checkMonitor(config, site, "monitor_123");
 * if (result) {
 *   logger.info(`Monitor status: ${result.status}`);
 *   logger.info(`Response time: ${result.responseTime}ms`);
 * }
 * ```
 */
export async function checkMonitor(
    config: MonitorCheckConfig,
    site: Site,
    monitorId: string,
    isManualCheck = false
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

    // For manual checks, preserve the paused state but still record history
    const newStatus = isManualCheck && monitor.status === "paused" ? "paused" : checkResult.status;

    // Update monitor with results (preserve paused status for manual checks)
    monitor.status = newStatus;
    monitor.responseTime = checkResult.responseTime;
    monitor.lastChecked = now;
    // Add to history (record the actual check result, not the preserved status)
    const historyEntry: StatusHistory = {
        responseTime: checkResult.responseTime,
        status: checkResult.status, // Always record the actual check result
        timestamp: now.getTime(),
    };

    try {
        // Use operational hooks for database operations
        await withDatabaseOperation(
            async () => {
                return config.databaseService.executeTransaction((db) => {
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
                    const updateData: Record<string, unknown> = {
                        responseTime: monitor.responseTime,
                        status: monitor.status, // This preserves paused status for manual checks
                    };
                    // We just set lastChecked to 'now', so it's definitely defined
                    if (monitor.lastChecked !== undefined) {
                        // Convert Date object to timestamp for database storage
                        updateData.lastChecked =
                            monitor.lastChecked instanceof Date ? monitor.lastChecked.getTime() : monitor.lastChecked;
                    }
                    config.repositories.monitor.updateInternal(db, monitor.id, updateData);
                    return Promise.resolve();
                });
            },
            "monitor-status-update",
            config.eventEmitter,
            { monitorId: monitor.id, status: historyEntry.status }
        );

        const manualCheckInfo =
            isManualCheck && monitor.status === "paused" ? ` (manual check result: ${checkResult.status})` : "";
        config.logger.info(
            `[checkMonitor] Database operations completed: monitor_id=${monitor.id}, status=${monitor.status}${manualCheckInfo}, responseTime=${historyEntry.responseTime}, timestamp=${historyEntry.timestamp}, details=${checkResult.details ?? "undefined"}`
        );
    } catch (error) {
        config.logger.error(`[checkMonitor] Failed to complete database operations: monitor_id=${monitor.id}`, error);
        return undefined; // Return early if database operations fail
    }

    // Fetch fresh site data from database to ensure we have the latest history and monitor state
    const freshSiteData = await config.siteService.findByIdentifierWithDetails(site.identifier);
    if (!freshSiteData) {
        config.logger.error(`[checkMonitor] Failed to fetch updated site data for ${site.identifier}`);
        return undefined;
    }

    // Update the in-memory cache with fresh data
    config.sites.set(site.identifier, freshSiteData);

    // Emit StatusUpdate as a typed event instead of old emit pattern
    const statusUpdate: StatusUpdate = {
        ...(checkResult.details !== undefined && { details: checkResult.details }),
        monitorId: monitor.id,
        previousStatus,
        site: freshSiteData,
        siteIdentifier: site.identifier,
        status: checkResult.status,
        timestamp: new Date().toISOString(),
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
    const shouldEmitDownEvent =
        (previousStatus === "up" && checkResult.status === "down") ||
        (previousStatus === "pending" && checkResult.status === "down");

    const shouldEmitUpEvent =
        (previousStatus === "down" && checkResult.status === "up") ||
        (previousStatus === "pending" && checkResult.status === "up");

    if (shouldEmitDownEvent) {
        await config.eventEmitter.emitTyped("monitor:down", {
            monitor: { ...monitor },
            site: freshSiteData,
            siteId: site.identifier,
            timestamp: Date.now(),
        });
    } else if (shouldEmitUpEvent) {
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

    const result = await checkMonitor(config, site, targetMonitorId, true); // Mark as manual check
    return result ?? undefined;
}
