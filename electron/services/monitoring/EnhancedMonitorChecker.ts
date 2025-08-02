/**
 * Enhanced monitor status checker with operation correlation support.
 *
 * @remarks
 * Provides monitor checking with operation correlation to prevent race conditions.
 * Integrates with the operation registry and timeout management system.
 *
 * @packageDocumentation
 */

import { Monitor, Site, StatusUpdate } from "../../../shared/types";
import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { HistoryRepository } from "../../services/database/HistoryRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
import { HttpMonitor } from "../../services/monitoring/HttpMonitor";
import { MonitorOperationRegistry } from "../../services/monitoring/MonitorOperationRegistry";
import {
    MonitorStatusUpdateService,
    type StatusUpdateMonitorCheckResult,
} from "../../services/monitoring/MonitorStatusUpdateService";
import { OperationTimeoutManager } from "../../services/monitoring/OperationTimeoutManager";
import { PingMonitor } from "../../services/monitoring/PingMonitor";
import { PortMonitor } from "../../services/monitoring/PortMonitor";
import { IMonitorService, type MonitorCheckResult as ServiceMonitorCheckResult } from "../../services/monitoring/types";
import { Site as SiteType } from "../../types";
import { StandardizedCache } from "../../utils/cache/StandardizedCache";
import { monitorLogger as logger } from "../../utils/logger";
import { DEFAULT_MONITOR_TIMEOUT_SECONDS, MONITOR_TIMEOUT_BUFFER_MS, SECONDS_TO_MS_MULTIPLIER } from "./constants";

/**
 * Configuration for enhanced monitor checking with operation correlation.
 *
 * @public
 */
export interface EnhancedMonitorCheckConfig {
    /** Event emitter for system-wide communication */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Function to get the maximum number of history entries to keep */
    getHistoryLimit: () => number;
    /** Repository for history operations */
    historyRepository: HistoryRepository;
    /** Repository for monitor operations */
    monitorRepository: MonitorRepository;
    /** Operation registry for correlation */
    operationRegistry: MonitorOperationRegistry;
    /** Repository for site operations */
    siteRepository: SiteRepository;
    /** Sites cache for quick access */
    sites: StandardizedCache<SiteType>;
    /** Status update service for safe updates */
    statusUpdateService: MonitorStatusUpdateService;
    /** Timeout manager for operation cleanup */
    timeoutManager: OperationTimeoutManager;
}

/**
 * Enhanced monitor checker with operation correlation.
 *
 * @remarks
 * Provides race condition-safe monitor checking by correlating operations
 * with their initiating state changes.
 *
 * @public
 */
export class EnhancedMonitorChecker {
    private readonly httpMonitor: HttpMonitor;
    private readonly pingMonitor: PingMonitor;
    private readonly portMonitor: PortMonitor;

    constructor(private readonly config: EnhancedMonitorCheckConfig) {
        // Initialize monitor services
        this.httpMonitor = new HttpMonitor({});
        this.pingMonitor = new PingMonitor({});
        this.portMonitor = new PortMonitor({});
    }

    /**
     * Check a monitor with operation correlation support.
     *
     * @param site - Site containing the monitor
     * @param monitorId - ID of monitor to check
     * @param isManualCheck - Whether this is a manual check (optional)
     * @returns Status update if successful, undefined if failed or cancelled
     */
    async checkMonitor(site: Site, monitorId: string, isManualCheck = false): Promise<StatusUpdate | undefined> {
        const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));

        if (!this.validateMonitorForCheck(monitor, site, monitorId)) {
            return undefined;
        }

        // For manual checks, don't use operation correlation
        if (isManualCheck) {
            return this.performDirectCheck(site, monitor, true);
        }

        // Only proceed if monitor is currently monitoring
        if (!monitor.monitoring) {
            logger.debug(`Monitor ${monitorId} not monitoring, skipping check`);
            return undefined;
        }

        return this.performCorrelatedCheck(site, monitor, monitorId);
    }

    /**
     * Start monitoring for a specific monitor.
     *
     * @param siteIdentifier - Site identifier
     * @param monitorId - Monitor ID
     * @returns Promise resolving to true if started successfully
     */
    async startMonitoring(siteIdentifier: string, monitorId: string): Promise<boolean> {
        try {
            // Cancel any existing operations for this monitor
            this.config.operationRegistry.cancelOperations(monitorId);

            // Update monitor state to monitoring
            await this.config.monitorRepository.update(monitorId, {
                activeOperations: [],
                monitoring: true,
            });

            logger.info(`Started monitoring for monitor ${monitorId} on site ${siteIdentifier}`);

            // Emit event
            await this.config.eventEmitter.emitTyped("internal:monitor:started", {
                identifier: siteIdentifier,
                monitorId,
                operation: "started",
                timestamp: Date.now(),
            });

            return true;
        } catch (error) {
            logger.error(`Failed to start monitoring for monitor ${monitorId}`, error);
            return false;
        }
    }

    /**
     * Stop monitoring for a specific monitor.
     *
     * @param siteIdentifier - Site identifier
     * @param monitorId - Monitor ID
     * @returns Promise resolving to true if stopped successfully
     */
    async stopMonitoring(siteIdentifier: string, monitorId: string): Promise<boolean> {
        try {
            // Cancel all active operations for this monitor
            this.config.operationRegistry.cancelOperations(monitorId);

            // Update monitor state to not monitoring
            await this.config.monitorRepository.update(monitorId, {
                activeOperations: [],
                monitoring: false,
            });

            logger.info(`Stopped monitoring for monitor ${monitorId} on site ${siteIdentifier}`);

            // Emit event
            await this.config.eventEmitter.emitTyped("internal:monitor:stopped", {
                identifier: siteIdentifier,
                monitorId,
                operation: "stopped",
                reason: "user",
                timestamp: Date.now(),
            });

            return true;
        } catch (error) {
            logger.error(`Failed to stop monitoring for monitor ${monitorId}`, error);
            return false;
        }
    }

    /**
     * Emit appropriate status change events based on monitor state transition.
     *
     * @param site - Site containing the monitor
     * @param originalMonitor - Original monitor state
     * @param freshMonitor - Fresh monitor data
     * @param checkResult - Check result
     * @internal
     */
    private async emitStatusChangeEvents(
        site: Site,
        originalMonitor: Site["monitors"][0],
        freshMonitor: Site["monitors"][0],
        checkResult: StatusUpdateMonitorCheckResult
    ): Promise<void> {
        const timestamp = checkResult.timestamp.getTime();

        if (checkResult.status === "up" && originalMonitor.status !== "up") {
            await this.config.eventEmitter.emitTyped("monitor:up", {
                monitor: freshMonitor,
                site: site,
                siteId: site.identifier,
                timestamp,
            });
        } else if (checkResult.status === "down" && originalMonitor.status !== "down") {
            await this.config.eventEmitter.emitTyped("monitor:down", {
                monitor: freshMonitor,
                site: site,
                siteId: site.identifier,
                timestamp,
            });
        }
    }

    /**
     * Execute the actual monitor check operation.
     *
     * @param monitor - Monitor to check
     * @param operationId - Operation correlation ID
     * @returns Monitor check result with correlation
     */
    private async executeMonitorCheck(monitor: Monitor, operationId: string): Promise<StatusUpdateMonitorCheckResult> {
        try {
            // Perform the check based on monitor type - now returns full result
            const serviceResult = await this.performTypeSpecificCheck(monitor);

            return {
                details: serviceResult.details ?? (serviceResult.status === "up" ? "Check successful" : "Check failed"),
                monitorId: monitor.id,
                operationId,
                responseTime: serviceResult.responseTime,
                status: serviceResult.status,
                timestamp: new Date(),
            };
        } catch (error) {
            logger.error(`Monitor check failed for ${monitor.id}`, error);

            return {
                details: error instanceof Error ? error.message : "Monitor check failed",
                monitorId: monitor.id,
                operationId,
                responseTime: 0,
                status: "down",
                timestamp: new Date(),
            };
        }
    }

    /**
     * Handle a successful monitor check and emit events.
     *
     * @param site - Site containing the monitor
     * @param monitor - Original monitor state
     * @param checkResult - Check result
     * @returns Status update for event emission
     * @internal
     */
    private async handleSuccessfulCheck(
        site: Site,
        monitor: Site["monitors"][0],
        checkResult: StatusUpdateMonitorCheckResult
    ): Promise<StatusUpdate | undefined> {
        // Get fresh monitor and site data for event emission
        const freshMonitor = await this.config.monitorRepository.findByIdentifier(checkResult.monitorId);
        if (!freshMonitor) {
            logger.warn(`Fresh monitor data not found for ${checkResult.monitorId}`);
            return undefined;
        }

        // Create status update for event emission
        const statusUpdate: StatusUpdate = {
            details: checkResult.status === "up" ? "Monitor is responding" : "Monitor is not responding",
            monitorId: checkResult.monitorId,
            previousStatus: monitor.status,
            siteIdentifier: site.identifier,
            status: checkResult.status === "up" ? "up" : "down",
            timestamp: checkResult.timestamp.toISOString(),
        };

        // Emit proper typed events like the traditional monitoring system
        await this.config.eventEmitter.emitTyped("monitor:status-changed", {
            monitor: freshMonitor,
            newStatus: checkResult.status,
            previousStatus: monitor.status,
            responseTime: checkResult.responseTime,
            site: site,
            siteId: site.identifier,
            timestamp: checkResult.timestamp.getTime(),
        });

        // Emit monitor up/down events for status changes
        await this.emitStatusChangeEvents(site, monitor, freshMonitor, checkResult);

        return statusUpdate;
    }

    /**
     * Perform a correlated check with operation tracking.
     *
     * @param site - Site containing the monitor
     * @param monitor - Monitor to check
     * @param monitorId - Monitor ID
     * @returns Status update if successful, undefined if failed
     * @internal
     */
    private async performCorrelatedCheck(
        site: Site,
        monitor: Site["monitors"][0],
        monitorId: string
    ): Promise<StatusUpdate | undefined> {
        const operationId = await this.setupOperationCorrelation(monitor, monitorId);
        if (!operationId) {
            return undefined;
        }

        logger.info(`Checking monitor: site=${site.identifier}, id=${monitor.id}, operation=${operationId}`);

        try {
            // Perform the actual check
            const checkResult = await this.executeMonitorCheck(monitor, operationId);

            // Save history entry before updating status
            await this.saveHistoryEntry(monitor, checkResult);

            // Update status through the correlation service
            const updated = await this.config.statusUpdateService.updateMonitorStatus(checkResult);

            if (updated) {
                return await this.handleSuccessfulCheck(site, monitor, checkResult);
            }
        } catch (error) {
            logger.error(`Monitor check failed for ${monitorId}`, error);
            this.config.operationRegistry.completeOperation(operationId);
            this.config.timeoutManager.clearTimeout(operationId);
        }

        return undefined;
    }

    /**
     * Perform direct check without operation correlation (for manual checks).
     *
     * @param site - Site containing the monitor
     * @param monitor - Monitor to check
     * @returns Status update if successful
     */
    private async performDirectCheck(
        site: Site,
        monitor: Monitor,
        isManualCheck = false
    ): Promise<StatusUpdate | undefined> {
        try {
            const serviceResult = await this.performTypeSpecificCheck(monitor);

            // For manual checks on paused monitors, preserve the paused status
            const finalStatus = isManualCheck && monitor.status === "paused" ? "paused" : serviceResult.status;

            // Create an enhanced check result for history saving
            const checkResult: StatusUpdateMonitorCheckResult = {
                details: serviceResult.details ?? (serviceResult.status === "up" ? "Check successful" : "Check failed"),
                monitorId: monitor.id,
                operationId: "direct-check",
                responseTime: serviceResult.responseTime,
                status: serviceResult.status, // Use actual result for history
                timestamp: new Date(),
            };

            // Save history entry for direct checks too (always save actual result)
            await this.saveHistoryEntry(monitor, checkResult);

            const statusUpdate: StatusUpdate = {
                details:
                    serviceResult.details ??
                    (serviceResult.status === "up" ? "Monitor is responding" : "Monitor is not responding"),
                monitorId: monitor.id,
                previousStatus: monitor.status,
                siteIdentifier: site.identifier,
                status: finalStatus, // Use final status (might be "paused")
                timestamp: checkResult.timestamp.toISOString(),
            };

            // Update monitor directly (bypass operation correlation for manual checks)
            // For manual checks on paused monitors, don't update the status
            const updateData: Partial<Monitor> = {
                lastChecked: checkResult.timestamp,
                responseTime: serviceResult.responseTime,
            };

            // Only update status if not a manual check on a paused monitor
            if (!(isManualCheck && monitor.status === "paused")) {
                updateData.status = serviceResult.status;
            }

            await this.config.monitorRepository.update(monitor.id, updateData);

            // Get fresh monitor and site data for event emission
            const freshMonitor = await this.config.monitorRepository.findByIdentifier(monitor.id);
            if (!freshMonitor) {
                logger.warn(`Fresh monitor data not found for ${monitor.id}`);
                return statusUpdate;
            }

            // Emit proper typed events like the traditional monitoring system
            await this.config.eventEmitter.emitTyped("monitor:status-changed", {
                monitor: freshMonitor,
                newStatus: finalStatus, // Use final status
                previousStatus: monitor.status,
                responseTime: serviceResult.responseTime,
                site: site,
                siteId: site.identifier,
                timestamp: checkResult.timestamp.getTime(),
            });

            // Emit monitor up/down events for status changes
            // Don't emit up/down events for manual checks on paused monitors
            if (!isManualCheck || monitor.status !== "paused") {
                if (serviceResult.status === "up" && monitor.status !== "up") {
                    await this.config.eventEmitter.emitTyped("monitor:up", {
                        monitor: freshMonitor,
                        site: site,
                        siteId: site.identifier,
                        timestamp: checkResult.timestamp.getTime(),
                    });
                } else if (serviceResult.status === "down" && monitor.status !== "down") {
                    await this.config.eventEmitter.emitTyped("monitor:down", {
                        monitor: freshMonitor,
                        site: site,
                        siteId: site.identifier,
                        timestamp: checkResult.timestamp.getTime(),
                    });
                }
            }

            return statusUpdate;
        } catch (error) {
            logger.error(`Direct monitor check failed for ${monitor.id}`, error);
            return undefined;
        }
    }

    /**
     * Perform type-specific check based on monitor configuration.
     *
     * @param monitor - Monitor to check
     * @returns Promise resolving to monitor check result with details
     */
    private async performTypeSpecificCheck(monitor: Monitor): Promise<ServiceMonitorCheckResult> {
        let monitorService: IMonitorService;

        switch (monitor.type) {
            case "http": {
                monitorService = this.httpMonitor;
                break;
            }
            case "ping": {
                monitorService = this.pingMonitor;
                break;
            }
            case "port": {
                monitorService = this.portMonitor;
                break;
            }
            default: {
                logger.warn(`Unknown monitor type: ${monitor.type}`);
                return {
                    details: `Unknown monitor type: ${monitor.type}`,
                    responseTime: 0,
                    status: "down",
                };
            }
        }

        try {
            const result = await monitorService.check(monitor);
            return result;
        } catch (error) {
            logger.error(`Monitor check failed for ${monitor.id}`, error);
            return {
                details: error instanceof Error ? error.message : "Monitor check failed",
                responseTime: 0,
                status: "down",
            };
        }
    }

    /**
     * Saves a history entry for a monitor check result.
     *
     * @param monitor - Monitor that was checked
     * @param checkResult - Result of the monitor check
     */
    private async saveHistoryEntry(monitor: Monitor, checkResult: StatusUpdateMonitorCheckResult): Promise<void> {
        if (!monitor.id) {
            logger.warn("Cannot save history entry: monitor missing ID");
            return;
        }

        const historyEntry = {
            responseTime: checkResult.responseTime,
            status: checkResult.status === "up" ? ("up" as const) : ("down" as const),
            timestamp: checkResult.timestamp.getTime(),
        };

        try {
            // Pass the details field from the check result to the history repository
            await this.config.historyRepository.addEntry(monitor.id, historyEntry, checkResult.details);

            // Smart history pruning: Only prune when necessary to avoid performance overhead
            const historyLimit = this.config.getHistoryLimit();
            if (historyLimit > 0) {
                // Use a buffer strategy: only prune when we exceed limit + buffer
                const bufferSize = Math.max(Math.floor(historyLimit * 0.2), 5);
                const pruneThreshold = historyLimit + bufferSize;
                const currentCount = await this.config.historyRepository.getHistoryCount(monitor.id);

                if (currentCount > pruneThreshold) {
                    await this.config.historyRepository.pruneHistory(monitor.id, historyLimit);
                    logger.debug(
                        `[EnhancedMonitorChecker] Pruned history for monitor ${monitor.id}: ${currentCount} -> ${historyLimit} entries`
                    );
                }
            }

            logger.debug(`Saved history entry for monitor ${monitor.id}: ${checkResult.status}`);
        } catch (error) {
            logger.error(`Failed to save history entry for monitor ${monitor.id}`, error);
            // Don't throw error - history saving failure shouldn't stop monitoring
        }
    }

    /**
     * Sets up operation correlation for a monitor check.
     *
     * @param monitor - Monitor being checked
     * @param monitorId - Monitor ID
     * @returns Operation ID if successful, undefined if failed
     */
    private async setupOperationCorrelation(monitor: Monitor, monitorId: string): Promise<string | undefined> {
        // Create operation correlation
        const operationId = this.config.operationRegistry.initiateCheck(monitorId);

        // Calculate operation timeout with buffer for cleanup
        const monitorTimeoutSeconds = monitor.timeout || DEFAULT_MONITOR_TIMEOUT_SECONDS;
        const timeoutMs = monitorTimeoutSeconds * SECONDS_TO_MS_MULTIPLIER + MONITOR_TIMEOUT_BUFFER_MS;
        this.config.timeoutManager.scheduleTimeout(operationId, timeoutMs);

        // Add operation to monitor's active operations
        try {
            const updatedActiveOperations = [...monitor.activeOperations, operationId];
            await this.config.monitorRepository.update(monitorId, {
                activeOperations: updatedActiveOperations,
            });
            return operationId;
        } catch (error) {
            logger.error(`Failed to add operation ${operationId} to monitor ${monitorId}`, error);
            this.config.operationRegistry.completeOperation(operationId);
            this.config.timeoutManager.clearTimeout(operationId);
            return undefined;
        }
    }

    /**
     * Validates monitor before check.
     *
     * @param monitor - Monitor to validate
     * @param site - Site containing monitor
     * @param monitorId - Monitor ID
     * @returns True if valid, false otherwise
     */
    private validateMonitorForCheck(monitor: Monitor | undefined, site: Site, monitorId: string): monitor is Monitor {
        if (!monitor) {
            logger.error(`Monitor not found for id: ${monitorId} on site: ${site.identifier}`);
            return false;
        }

        if (!monitor.id) {
            logger.error(`Monitor missing id for ${site.identifier}, skipping check.`);
            return false;
        }

        return true;
    }
}
