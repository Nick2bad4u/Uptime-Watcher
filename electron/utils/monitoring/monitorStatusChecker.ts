/**
 * Traditional monitor status checking utilities for individual monitor health verification.
 *
 * @remarks
 * @deprecated
 * **Legacy Fallback System**: This is the traditional monitoring implementation that serves
 * as a fallback when the enhanced monitoring system with operation correlation is unavailable.
 * The enhanced system (`EnhancedMonitorChecker`) is preferred for all new operations as it
 * provides race condition prevention and operation correlation.
 *
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
 * @see {@link EnhancedMonitorChecker} for the preferred enhanced implementation
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

import type { MonitorCheckResult } from "../../services/monitoring/types";
import type { Logger } from "../interfaces";

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { DatabaseService } from "../../services/database/DatabaseService";
import { HistoryRepository } from "../../services/database/HistoryRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
import { MonitorFactory } from "../../services/monitoring/MonitorFactory";
import { SiteService } from "../../services/site/SiteService";
import { Monitor, MonitorStatus, Site, StatusHistory, StatusUpdate } from "../../types";
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
    const checkResult = await executeMonitorCheck(monitor, config.logger);

    const previousStatus = monitor.status;
    const now = new Date();

    // For manual checks, preserve the paused state but still record history
    const newStatus = isManualCheck && monitor.status === "paused" ? "paused" : checkResult.status;

    // Prepare update data for database transaction (no direct mutations)
    const updateData: Partial<Monitor> = {
        lastChecked: now, // Keep as Date object for type compatibility
        responseTime: checkResult.responseTime,
        status: newStatus,
    };

    // Add to history (record the actual check result, not the preserved status)
    const historyEntry: StatusHistory = {
        responseTime: checkResult.responseTime,
        status: checkResult.status, // Always record the actual check result
        timestamp: now.getTime(),
    };

    try {
        await updateMonitorInDatabase(config, monitor, updateData, historyEntry, checkResult);

        const manualCheckInfo =
            isManualCheck && updateData.status === "paused" ? ` (manual check result: ${checkResult.status})` : "";
        config.logger.info(
            `[checkMonitor] Database operations completed: monitor_id=${monitor.id}, status=${updateData.status}${manualCheckInfo}, responseTime=${historyEntry.responseTime}, timestamp=${historyEntry.timestamp}, details=${checkResult.details ?? "undefined"}`
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
    const freshMonitor = freshSiteData.monitors.find((m) => m.id === monitor.id);
    if (!freshMonitor) {
        config.logger.error(`[checkMonitor] Fresh monitor data not found for ${monitor.id}`);
        return undefined;
    }

    await emitMonitorStateEvents(config, previousStatus, checkResult, freshMonitor, freshSiteData, site.identifier);

    return statusUpdate;
}

/**
 * Check a site's monitor manually.
 *
 * @param config - Configuration object with required dependencies
 * @param identifier - Site identifier
 * @param monitorId - Optional monitor ID, uses first monitor if not provided
 * @returns Promise resolving to StatusUpdate or undefined if error occurs
 *
 * @remarks
 * Performs a manual health check on the specified monitor or the first monitor
 * if no specific monitor ID is provided. Manual checks preserve the "paused" status
 * for monitors that are intentionally stopped, while still recording the actual
 * check result in history for diagnostic purposes.
 *
 * This function follows the same error handling pattern as checkMonitor,
 * returning undefined for errors rather than throwing, to provide consistent
 * error handling behavior across the module.
 *
 * @example
 * ```typescript
 * // Check specific monitor manually
 * const result = await checkSiteManually(config, "site-1", "monitor-123");
 * if (result) {
 *   console.log(`Manual check result: ${result.status}`);
 * }
 *
 * // Check first monitor if no ID specified
 * const result = await checkSiteManually(config, "site-1");
 * ```
 */
export async function checkSiteManually(
    config: MonitorCheckConfig,
    identifier: string,
    monitorId?: string
): Promise<StatusUpdate | undefined> {
    const site = config.sites.get(identifier);
    if (!site) {
        config.logger.error(`[checkSiteManually] Site not found: ${identifier}`);
        return undefined;
    }

    // If no monitorId provided, use the first monitor's ID
    const targetMonitorId =
        monitorId ??
        (() => {
            const firstMonitor = site.monitors[0];
            if (!firstMonitor?.id) {
                config.logger.error(`[checkSiteManually] No monitors found for site ${identifier}`);
                return;
            }
            return String(firstMonitor.id);
        })();

    // Early return if no valid monitor ID found
    if (!targetMonitorId) {
        return undefined;
    }

    // Validate the monitor exists
    const monitor = site.monitors.find((m) => String(m.id) === String(targetMonitorId));
    if (!monitor) {
        config.logger.error(`[checkSiteManually] Monitor with ID ${targetMonitorId} not found for site ${identifier}`);
        return undefined;
    }

    const result = await checkMonitor(config, site, targetMonitorId, true); // Mark as manual check
    return result ?? undefined;
}

/**
 * Emits the appropriate monitor state change events
 */
async function emitMonitorStateEvents(
    config: MonitorCheckConfig,
    previousStatus: MonitorStatus,
    checkResult: MonitorCheckResult,
    freshMonitor: Monitor,
    freshSiteData: Site,
    siteIdentifier: string
): Promise<void> {
    await config.eventEmitter.emitTyped("monitor:status-changed", {
        monitor: freshMonitor,
        newStatus: checkResult.status,
        previousStatus,
        responseTime: checkResult.responseTime,
        site: freshSiteData,
        siteId: siteIdentifier,
        timestamp: Date.now(),
    });

    const shouldEmitDownEvent =
        (previousStatus === "up" && checkResult.status === "down") ||
        (previousStatus === "pending" && checkResult.status === "down");

    const shouldEmitUpEvent =
        (previousStatus === "down" && checkResult.status === "up") ||
        (previousStatus === "pending" && checkResult.status === "up");

    if (shouldEmitDownEvent) {
        await config.eventEmitter.emitTyped("monitor:down", {
            monitor: freshMonitor,
            site: freshSiteData,
            siteId: siteIdentifier,
            timestamp: Date.now(),
        });
    } else if (shouldEmitUpEvent) {
        await config.eventEmitter.emitTyped("monitor:up", {
            monitor: freshMonitor,
            site: freshSiteData,
            siteId: siteIdentifier,
            timestamp: Date.now(),
        });
    }
}

/**
 * Executes the monitor check using the appropriate monitoring service
 */
async function executeMonitorCheck(
    monitor: Monitor,
    logger: { error: (message: string, error?: unknown) => void }
): Promise<MonitorCheckResult> {
    try {
        const monitorService = MonitorFactory.getMonitor(monitor.type, {
            timeout: monitor.timeout,
        });
        return await monitorService.check(monitor);
    } catch (error) {
        logger.error(`[checkMonitor] Error using monitor service for type ${monitor.type}`, error);
        return {
            details: "0",
            error: "Monitor service error",
            responseTime: 0,
            status: "down" as const,
        };
    }
}

/**
 * Handles the database operations for monitor status update
 */
async function updateMonitorInDatabase(
    config: MonitorCheckConfig,
    monitor: Monitor,
    updateData: Partial<Monitor>,
    historyEntry: StatusHistory,
    checkResult: MonitorCheckResult
): Promise<void> {
    await withDatabaseOperation(
        async () => {
            return config.databaseService.executeTransaction((db) => {
                // Add history entry using internal method to avoid nested transactions
                config.repositories.history.addEntryInternal(db, monitor.id, historyEntry, checkResult.details);

                // Smart history pruning: Only prune when necessary to avoid performance overhead
                if (config.historyLimit > 0) {
                    // Use a buffer strategy: only prune when we exceed limit + buffer
                    const bufferSize = Math.max(Math.floor(config.historyLimit * 0.2), 5);
                    const pruneThreshold = config.historyLimit + bufferSize;
                    const currentCount = config.repositories.history.getHistoryCountInternal(db, monitor.id);

                    if (currentCount > pruneThreshold) {
                        config.repositories.history.pruneHistoryInternal(db, monitor.id, config.historyLimit);
                        config.logger.debug(
                            `[MonitorStatusChecker] Pruned history for monitor ${monitor.id}: ${currentCount} -> ${config.historyLimit} entries`
                        );
                    }
                }

                // Update monitor with new status using internal method
                config.repositories.monitor.updateInternal(db, monitor.id, updateData);
                return Promise.resolve();
            });
        },
        "monitor-status-update",
        config.eventEmitter,
        { monitorId: monitor.id, status: historyEntry.status }
    );
}
