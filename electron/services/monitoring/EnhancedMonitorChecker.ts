/**
 * Enhanced monitor status checker with advanced operation correlation and race
 * condition prevention.
 *
 * @remarks
 * This class provides robust monitor checking capabilities with operation
 * correlation to prevent race conditions in concurrent monitoring scenarios. It
 * integrates with the operation registry and timeout management system to
 * ensure safe, coordinated monitor operations across the application.
 *
 * Key features:
 *
 * - Operation correlation to prevent duplicate or conflicting checks
 * - Race condition prevention through operation state tracking
 * - Advanced timeout management with cleanup capabilities
 * - Support for both manual and scheduled monitoring operations
 * - Integration with status update service for safe concurrent updates
 * - Comprehensive error handling and logging
 *
 * @example
 *
 * ```typescript
 * const checker = new EnhancedMonitorChecker(config);
 * const result = await checker.checkMonitor(site, monitorId, false);
 * ```
 *
 * @public
 *
 * @see {@link MonitorOperationRegistry} for operation correlation details
 * @see {@link MonitorStatusUpdateService} for status update safety
 * @see {@link OperationTimeoutManager} for timeout management
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type { HistoryRepository } from "../database/HistoryRepository";
import type { MonitorRepository } from "../database/MonitorRepository";
import type { SiteRepository } from "../database/SiteRepository";
import type { MonitorOperationRegistry } from "./MonitorOperationRegistry";
import type {
    MonitorStatusUpdateService,
    StatusUpdateMonitorCheckResult,
} from "./MonitorStatusUpdateService";
import type { OperationTimeoutManager } from "./OperationTimeoutManager";
import type {
    IMonitorService,
    MonitorCheckResult as ServiceMonitorCheckResult,
} from "./types";

import { monitorLogger as logger } from "../../utils/logger";
import {
    DEFAULT_MONITOR_TIMEOUT_SECONDS,
    MONITOR_TIMEOUT_BUFFER_MS,
    SECONDS_TO_MS_MULTIPLIER,
} from "./constants";
import { DnsMonitor } from "./DnsMonitor";
import { HttpMonitor } from "./HttpMonitor";
import { PingMonitor } from "./PingMonitor";
import { PortMonitor } from "./PortMonitor";

/**
 * Configuration interface for enhanced monitor checking with comprehensive
 * service dependencies.
 *
 * @remarks
 * This configuration object provides all necessary dependencies for the
 * enhanced monitor checker to operate safely with operation correlation and
 * race condition prevention. Each dependency serves a specific purpose in the
 * monitoring operation lifecycle.
 *
 * @example
 *
 * ```typescript
 * const config: EnhancedMonitorCheckConfig = {
 *     eventEmitter: typedEventBus,
 *     getHistoryLimit: () => 100,
 *     historyRepository: historyRepo,
 *     monitorRepository: monitorRepo,
 *     operationRegistry: registry,
 *     siteRepository: siteRepo,
 *     sites: sitesCache,
 *     statusUpdateService: updateService,
 *     timeoutManager: timeoutMgr,
 * };
 * ```
 *
 * @public
 */
export interface EnhancedMonitorCheckConfig {
    /**
     * Event emitter for system-wide communication and monitor event
     * propagation.
     *
     * @remarks
     * Used to emit monitor status changes, operation events, and other
     * monitoring-related notifications throughout the application.
     */
    eventEmitter: TypedEventBus<UptimeEvents>;

    /**
     * Function to get the maximum number of history entries to keep for each
     * monitor.
     *
     * @remarks
     * This function provides the current history limit setting, which may
     * change during runtime based on user configuration or system constraints.
     *
     * @returns The maximum number of status history entries to retain
     */
    getHistoryLimit: () => number;

    /**
     * Repository for history operations and status history management.
     *
     * @remarks
     * Handles persistence and retrieval of monitor status history entries,
     * including automatic pruning based on the configured history limit.
     */
    historyRepository: HistoryRepository;

    /**
     * Repository for monitor entity operations and status updates.
     *
     * @remarks
     * Manages monitor entity persistence, updates monitor status and
     * configuration, and handles monitor-related database operations.
     */
    monitorRepository: MonitorRepository;

    /**
     * Operation registry for correlation and race condition prevention.
     *
     * @remarks
     * Tracks active monitor operations to prevent concurrent checks on the same
     * monitor and provides operation correlation for debugging and state
     * management.
     */
    operationRegistry: MonitorOperationRegistry;

    /**
     * Repository for site entity operations and site-monitor relationships.
     *
     * @remarks
     * Handles site entity persistence and manages the relationship between
     * sites and their associated monitors.
     */
    siteRepository: SiteRepository;

    /**
     * Sites cache for quick access to site and monitor data without database
     * queries.
     *
     * @remarks
     * Provides fast, in-memory access to site configurations and monitor
     * definitions, reducing database load during frequent monitoring
     * operations.
     */
    sites: StandardizedCache<Site>;

    /**
     * Status update service for safe concurrent status updates.
     *
     * @remarks
     * Provides operation-aware status updates that prevent race conditions when
     * multiple monitor checks might attempt to update the same monitor's status
     * simultaneously.
     */
    statusUpdateService: MonitorStatusUpdateService;

    /**
     * Timeout manager for operation cleanup and resource management.
     *
     * @remarks
     * Manages operation timeouts, cleanup procedures, and ensures resources are
     * properly released when monitor operations complete or are cancelled.
     */
    timeoutManager: OperationTimeoutManager;
}

/**
 * Enhanced monitor checker with advanced operation correlation and race
 * condition prevention.
 *
 * @remarks
 * This class is the core monitoring engine that provides robust, race
 * condition-safe monitor checking capabilities. It coordinates with multiple
 * service layers to ensure safe concurrent operations and maintains operation
 * state throughout the monitoring lifecycle.
 *
 * **Key Features:**
 *
 * - **Operation Correlation**: Prevents duplicate operations on the same monitor
 * - **Race Condition Prevention**: Ensures safe concurrent monitoring operations
 * - **Advanced Timeout Management**: Handles operation timeouts with proper
 *   cleanup
 * - **Status Update Safety**: Prevents conflicting status updates from concurrent
 *   checks
 * - **Comprehensive Logging**: Detailed operation tracking for debugging and
 *   monitoring
 *
 * **Operation Lifecycle:**
 *
 * 1. Validate monitor and operation prerequisites
 * 2. Register operation in correlation registry
 * 3. Configure timeout management and cleanup
 * 4. Execute monitor-specific checking logic
 * 5. Process results and update status safely
 * 6. Clean up resources and unregister operation
 *
 * **Supported Monitor Types:**
 *
 * - HTTP/HTTPS monitors with full request/response validation
 * - Ping monitors with network connectivity testing
 * - Port monitors with TCP/UDP connection testing
 *
 * @example Basic Usage
 *
 * ```typescript
 * const checker = new EnhancedMonitorChecker(config);
 *
 * // Scheduled check with operation correlation
 * const result = await checker.checkMonitor(site, monitorId, false);
 *
 * // Manual check (bypasses operation correlation)
 * const manualResult = await checker.checkMonitor(site, monitorId, true);
 * ```
 *
 * @example Error Handling
 *
 * ```typescript
 * try {
 *     const result = await checker.checkMonitor(site, monitorId);
 *     if (result) {
 *         console.log("Monitor check successful:", result.status);
 *     }
 * } catch (error) {
 *     console.error("Monitor check failed:", error);
 * }
 * ```
 *
 * @public
 *
 * @see {@link MonitorOperationRegistry} for operation correlation details
 * @see {@link MonitorStatusUpdateService} for status update safety mechanisms
 * @see {@link OperationTimeoutManager} for timeout and cleanup management
 * @see {@link EnhancedMonitorCheckConfig} for configuration requirements
 */
export class EnhancedMonitorChecker {
    private readonly config: EnhancedMonitorCheckConfig;

    private readonly dnsMonitor: DnsMonitor;

    private readonly httpMonitor: HttpMonitor;

    private readonly pingMonitor: PingMonitor;

    private readonly portMonitor: PortMonitor;

    /**
     * Performs a comprehensive monitor status check with advanced operation
     * correlation.
     *
     * @remarks
     * This is the primary entry point for all monitor checking operations. The
     * method provides two distinct operation modes: correlated checks for
     * scheduled operations that prevent race conditions, and direct checks for
     * manual operations that bypass correlation.
     *
     * **Operation Modes:**
     *
     * **Scheduled Checks (isManualCheck = false):**
     *
     * - Uses operation correlation to prevent duplicate checks
     * - Validates monitor is actively monitoring before proceeding
     * - Registers operation in correlation registry
     * - Provides timeout management and automatic cleanup
     * - Handles concurrent operation conflicts gracefully
     *
     * **Manual Checks (isManualCheck = true):**
     *
     * - Bypasses operation correlation for immediate execution
     * - Ignores monitor monitoring state
     * - Provides immediate feedback for user-initiated actions
     * - Still benefits from enhanced error handling and logging
     *
     * **Error Handling:**
     *
     * - Validates monitor configuration before execution
     * - Handles operation conflicts and duplicate registrations
     * - Provides comprehensive error logging with operation context
     * - Ensures proper resource cleanup on failures
     *
     * **Timeout Management:**
     *
     * - Applies monitor-specific or default timeout values
     * - Includes buffer time for cleanup operations
     * - Automatically cancels operations that exceed timeout
     * - Releases resources and updates operation status
     *
     * @example Scheduled Monitor Check
     *
     * ```typescript
     * const result = await checker.checkMonitor(
     *     site,
     *     "monitor-123",
     *     false
     * );
     * if (result) {
     *     console.log(
     *         `Monitor ${result.monitorId} status: ${result.status}`
     *     );
     * }
     * ```
     *
     * @example Manual Monitor Check
     *
     * ```typescript
     * const result = await checker.checkMonitor(site, "monitor-123", true);
     * // Manual checks bypass operation correlation for immediate execution
     * ```
     *
     * @param site - The site object containing the monitor configuration
     * @param monitorId - Unique identifier of the monitor to check
     * @param isManualCheck - Whether this is a user-initiated manual check
     *   (default: false)
     *
     * @returns A promise that resolves to a StatusUpdate object if the check
     *   succeeds, or undefined if the check fails, is cancelled, or encounters
     *   conflicts
     *
     * @throws Throws detailed errors for configuration issues, operation
     *   failures, or system-level problems that prevent check execution
     *
     * @public
     *
     * @see {@link MonitorOperationRegistry.registerOperation} for operation registration
     * @see {@link OperationTimeoutManager.createTimeout} for timeout management
     * @see {@link MonitorStatusUpdateService.updateStatus} for status update safety
     */
    public async checkMonitor(
        site: Site,
        monitorId: string,
        isManualCheck = false
    ): Promise<StatusUpdate | undefined> {
        const monitor = site.monitors.find((m) => m.id === monitorId);

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
     *
     * @returns Promise resolving to true if started successfully
     */
    public async startMonitoring(
        siteIdentifier: string,
        monitorId: string
    ): Promise<boolean> {
        try {
            // Cancel any existing operations for this monitor
            this.config.operationRegistry.cancelOperations(monitorId);

            // Update monitor state to monitoring
            await this.config.monitorRepository.update(monitorId, {
                activeOperations: [],
                monitoring: true,
            });

            logger.info(
                interpolateLogTemplate(LOG_TEMPLATES.services.MONITOR_STARTED, {
                    monitorId,
                    siteIdentifier,
                })
            );

            // Emit event
            await this.config.eventEmitter.emitTyped(
                "internal:monitor:started",
                {
                    identifier: siteIdentifier,
                    monitorId,
                    operation: "started",
                    timestamp: Date.now(),
                }
            );

            return true;
        } catch (error) {
            logger.error(
                `Failed to start monitoring for monitor ${monitorId}`,
                error
            );
            return false;
        }
    }

    /**
     * Stop monitoring for a specific monitor.
     *
     * @param siteIdentifier - Site identifier
     * @param monitorId - Monitor ID
     *
     * @returns Promise resolving to true if stopped successfully
     */
    public async stopMonitoring(
        siteIdentifier: string,
        monitorId: string
    ): Promise<boolean> {
        try {
            // Cancel all active operations for this monitor
            this.config.operationRegistry.cancelOperations(monitorId);

            // Update monitor state to not monitoring
            await this.config.monitorRepository.update(monitorId, {
                activeOperations: [],
                monitoring: false,
            });

            logger.info(
                interpolateLogTemplate(LOG_TEMPLATES.services.MONITOR_STOPPED, {
                    monitorId,
                    siteIdentifier,
                })
            );

            // Emit event
            await this.config.eventEmitter.emitTyped(
                "internal:monitor:stopped",
                {
                    identifier: siteIdentifier,
                    monitorId,
                    operation: "stopped",
                    reason: "user",
                    timestamp: Date.now(),
                }
            );

            return true;
        } catch (error) {
            logger.error(
                `Failed to stop monitoring for monitor ${monitorId}`,
                error
            );
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
     *
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
        } else if (
            checkResult.status === "down" &&
            originalMonitor.status !== "down"
        ) {
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
     *
     * @returns Monitor check result with correlation
     */
    private async executeMonitorCheck(
        monitor: Monitor,
        operationId: string,
        signal?: AbortSignal
    ): Promise<StatusUpdateMonitorCheckResult> {
        try {
            // Perform the check based on monitor type with abort signal - now returns full result
            const serviceResult = await this.performTypeSpecificCheck(
                monitor,
                signal
            );

            return {
                details:
                    serviceResult.details ??
                    (serviceResult.status === "up"
                        ? "Check successful"
                        : "Check failed"),
                monitorId: monitor.id,
                operationId,
                responseTime: serviceResult.responseTime,
                status: serviceResult.status,
                timestamp: new Date(),
            };
        } catch (error) {
            logger.error(`Monitor check failed for ${monitor.id}`, error);

            return {
                details:
                    error instanceof Error
                        ? error.message
                        : "Monitor check failed",
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
     *
     * @returns Status update for event emission
     *
     * @internal
     */
    private async handleSuccessfulCheck(
        site: Site,
        monitor: Site["monitors"][0],
        checkResult: StatusUpdateMonitorCheckResult
    ): Promise<StatusUpdate | undefined> {
        // Get fresh monitor and site data for event emission
        const freshMonitor =
            await this.config.monitorRepository.findByIdentifier(
                checkResult.monitorId
            );
        if (!freshMonitor) {
            logger.warn(
                `Fresh monitor data not found for ${checkResult.monitorId}`
            );
            return undefined;
        }

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
        await this.emitStatusChangeEvents(
            site,
            monitor,
            freshMonitor,
            checkResult
        );

        // Return status update for event emission
        return {
            details:
                checkResult.status === "up"
                    ? "Monitor is responding"
                    : "Monitor is not responding",
            monitorId: checkResult.monitorId,
            previousStatus: monitor.status,
            siteIdentifier: site.identifier,
            status: checkResult.status === "up" ? "up" : "down",
            timestamp: checkResult.timestamp.toISOString(),
        };
    }

    /**
     * Perform a correlated check with operation tracking.
     *
     * @param site - Site containing the monitor
     * @param monitor - Monitor to check
     * @param monitorId - Monitor ID
     *
     * @returns Status update if successful, undefined if failed
     *
     * @internal
     */
    private async performCorrelatedCheck(
        site: Site,
        monitor: Site["monitors"][0],
        monitorId: string
    ): Promise<StatusUpdate | undefined> {
        const operationResult = await this.setupOperationCorrelation(
            monitor,
            monitorId
        );
        if (!operationResult) {
            return undefined;
        }

        const { operationId, signal } = operationResult;

        logger.info(
            interpolateLogTemplate(LOG_TEMPLATES.debug.MONITOR_CHECK_START, {
                monitorId: monitor.id,
                operationId,
                siteIdentifier: site.identifier,
            })
        );

        try {
            // Perform the actual check with abort signal
            const checkResult = await this.executeMonitorCheck(
                monitor,
                operationId,
                signal
            );

            // Save history entry before updating status
            await this.saveHistoryEntry(monitor, checkResult);

            // Update status through the correlation service
            const updated =
                await this.config.statusUpdateService.updateMonitorStatus(
                    checkResult
                );

            if (updated) {
                return await this.handleSuccessfulCheck(
                    site,
                    monitor,
                    checkResult
                );
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
     *
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
            const finalStatus =
                isManualCheck && monitor.status === "paused"
                    ? "paused"
                    : serviceResult.status;

            // Create an enhanced check result for history saving
            const checkResult: StatusUpdateMonitorCheckResult = {
                details:
                    serviceResult.details ??
                    (serviceResult.status === "up"
                        ? "Check successful"
                        : "Check failed"),
                monitorId: monitor.id,
                operationId: "direct-check",
                responseTime: serviceResult.responseTime,
                status: serviceResult.status, // Use actual result for history
                timestamp: new Date(),
            };

            // Save history entry for direct checks too (always save actual
            // result)
            await this.saveHistoryEntry(monitor, checkResult);

            const statusUpdate: StatusUpdate = {
                details:
                    serviceResult.details ??
                    (serviceResult.status === "up"
                        ? "Monitor is responding"
                        : "Monitor is not responding"),
                monitorId: monitor.id,
                previousStatus: monitor.status,
                siteIdentifier: site.identifier,
                status: finalStatus, // Use final status (might be "paused")
                timestamp: checkResult.timestamp.toISOString(),
            };

            // Update monitor directly (bypass operation correlation for manual
            // checks) For manual checks on paused monitors, don't update the
            // status
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
            const freshMonitor =
                await this.config.monitorRepository.findByIdentifier(
                    monitor.id
                );
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
                } else if (
                    serviceResult.status === "down" &&
                    monitor.status !== "down"
                ) {
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
            logger.error(
                `Direct monitor check failed for ${monitor.id}`,
                error
            );
            return undefined;
        }
    }

    /**
     * Performs monitor checks with proper error handling.
     */
    private async performMonitorCheck(
        monitorService: IMonitorService,
        monitor: Monitor,
        signal?: AbortSignal
    ): Promise<ServiceMonitorCheckResult> {
        try {
            return await monitorService.check(monitor, signal);
        } catch (error) {
            logger.error(`Monitor check failed for ${monitor.id}`, error);
            return {
                details:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
                responseTime: 0,
                status: "down",
            };
        }
    }

    /**
     * Perform type-specific check based on monitor configuration.
     *
     * @param monitor - Monitor to check
     *
     * @returns Promise resolving to monitor check result with details
     */
    private async performTypeSpecificCheck(
        monitor: Monitor,
        signal?: AbortSignal
    ): Promise<ServiceMonitorCheckResult> {
        switch (monitor.type) {
            case "dns": {
                return this.performMonitorCheck(
                    this.dnsMonitor,
                    monitor,
                    signal
                );
            }
            case "http": {
                return this.performMonitorCheck(
                    this.httpMonitor,
                    monitor,
                    signal
                );
            }
            case "ping": {
                return this.performMonitorCheck(
                    this.pingMonitor,
                    monitor,
                    signal
                );
            }
            case "port": {
                return this.performMonitorCheck(
                    this.portMonitor,
                    monitor,
                    signal
                );
            }
            default: {
                logger.warn(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.warnings.MONITOR_TYPE_UNKNOWN_CHECK,
                        {
                            monitorType: monitor.type,
                        }
                    )
                );
                return {
                    details: `Unknown monitor type: ${monitor.type as string}`,
                    responseTime: 0,
                    status: "down",
                };
            }
        }
    }

    /**
     * Saves a history entry for a monitor check result.
     *
     * @param monitor - Monitor that was checked
     * @param checkResult - Result of the monitor check
     */
    private async saveHistoryEntry(
        monitor: Monitor,
        checkResult: StatusUpdateMonitorCheckResult
    ): Promise<void> {
        if (!monitor.id) {
            logger.warn("Cannot save history entry: monitor missing ID");
            return;
        }

        const historyEntry = {
            responseTime: checkResult.responseTime,
            status:
                checkResult.status === "up"
                    ? ("up" as const)
                    : ("down" as const),
            timestamp: checkResult.timestamp.getTime(),
        };

        try {
            // Pass the details field from the check result to the history
            // repository
            await this.config.historyRepository.addEntry(
                monitor.id,
                historyEntry,
                checkResult.details
            );

            // Smart history pruning: Only prune when necessary to avoid
            // performance overhead
            const historyLimit = this.config.getHistoryLimit();
            if (historyLimit > 0) {
                // Use a buffer strategy: only prune when we exceed limit +
                // buffer
                const bufferSize = Math.max(Math.floor(historyLimit * 0.2), 5);
                const pruneThreshold = historyLimit + bufferSize;
                const currentCount =
                    await this.config.historyRepository.getHistoryCount(
                        monitor.id
                    );

                if (currentCount > pruneThreshold) {
                    await this.config.historyRepository.pruneHistory(
                        monitor.id,
                        historyLimit
                    );
                    logger.debug(
                        `[EnhancedMonitorChecker] Pruned history for monitor ${monitor.id}: ${currentCount} -> ${historyLimit} entries`
                    );
                }
            }

            logger.debug(
                `Saved history entry for monitor ${monitor.id}: ${checkResult.status}`
            );
        } catch (error) {
            logger.error(
                `Failed to save history entry for monitor ${monitor.id}`,
                error
            );
            // Don't throw error - history saving failure shouldn't stop
            // monitoring
        }
    }

    /**
     * Sets up operation correlation for a monitor check.
     *
     * @param monitor - Monitor being checked
     * @param monitorId - Monitor ID
     *
     * @returns Operation result with ID and signal if successful, undefined if
     *   failed
     */
    private async setupOperationCorrelation(
        monitor: Monitor,
        monitorId: string
    ): Promise<undefined | { operationId: string; signal: AbortSignal }> {
        // Calculate operation timeout
        const monitorTimeoutMs =
            monitor.timeout ||
            DEFAULT_MONITOR_TIMEOUT_SECONDS * SECONDS_TO_MS_MULTIPLIER;
        const timeoutMs = monitorTimeoutMs + MONITOR_TIMEOUT_BUFFER_MS;

        // Create operation correlation with timeout
        const operationResult = this.config.operationRegistry.initiateCheck(
            monitorId,
            {
                timeoutMs,
            }
        );

        // Schedule additional timeout for cleanup (the AbortSignal.timeout handles the primary timeout)
        this.config.timeoutManager.scheduleTimeout(
            operationResult.operationId,
            timeoutMs
        );

        // Add operation to monitor's active operations
        try {
            const updatedActiveOperations = [
                ...(monitor.activeOperations ?? []),
                operationResult.operationId,
            ];
            await this.config.monitorRepository.update(monitorId, {
                activeOperations: updatedActiveOperations,
            });
            return {
                operationId: operationResult.operationId,
                signal: operationResult.signal,
            };
        } catch (error) {
            logger.error(
                `Failed to add operation ${operationResult.operationId} to monitor ${monitorId}`,
                error
            );
            this.config.operationRegistry.completeOperation(
                operationResult.operationId
            );
            this.config.timeoutManager.clearTimeout(
                operationResult.operationId
            );
            return undefined;
        }
    }

    public constructor(config: EnhancedMonitorCheckConfig) {
        this.config = config;
        // Initialize monitor services
        this.dnsMonitor = new DnsMonitor({});
        this.httpMonitor = new HttpMonitor({});
        this.pingMonitor = new PingMonitor({});
        this.portMonitor = new PortMonitor({});
    }

    /**
     * Validates monitor before check.
     *
     * @param monitor - Monitor to validate
     * @param site - Site containing monitor
     * @param monitorId - Monitor ID
     *
     * @returns True if valid, false otherwise
     */
    private validateMonitorForCheck(
        monitor: Monitor | undefined,
        site: Site,
        monitorId: string
    ): monitor is Monitor {
        if (!monitor) {
            logger.error(
                `Monitor not found for id: ${monitorId} on site: ${site.identifier}`
            );
            return false;
        }

        if (!monitor.id) {
            logger.error(
                `Monitor missing id for ${site.identifier}, skipping check.`
            );
            return false;
        }

        return true;
    }
}
