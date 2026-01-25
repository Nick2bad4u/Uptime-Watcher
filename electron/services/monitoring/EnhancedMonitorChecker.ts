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
import type {
    MonitorDownEventData,
    MonitorLifecycleEventData,
    MonitorUpEventData,
} from "@shared/types/events";

import { BASE_MONITOR_TYPES } from "@shared/types";
import { ensureError } from "@shared/utils/errorHandling";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { EnhancedMonitoringDependencies } from "./EnhancedMonitoringDependencies";
import type {
    MonitorStatusUpdateService,
    StatusUpdateMonitorCheckResult,
} from "./MonitorStatusUpdateService";
import type { OperationTimeoutManager } from "./OperationTimeoutManager";
import type { IMonitorService, MonitorCheckResult } from "./types";

import { monitorLogger as logger } from "../../utils/logger";
import {
    createMonitorCheckContext,
    type MonitorCheckContext,
} from "./checkContext";
import { MonitorOperationCoordinator } from "./coordinators/MonitorOperationCoordinator";
import { getMonitor } from "./MonitorFactory";
import { createTimeoutSignal } from "./shared/abortSignalUtils";
import { resolveMonitorBaseTimeoutMs } from "./shared/timeoutUtils";
import {
    createMonitorStrategyRegistry,
    type MonitorStrategyRegistry,
} from "./strategies/MonitorStrategyRegistry";
import {
    buildStatusUpdateMonitorCheckResult,
    isValidServiceResult,
    resolveStatusUpdateDetails,
    toFailure,
} from "./utils/monitorCheckResultNormalization";

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
export interface EnhancedMonitorCheckConfig extends EnhancedMonitoringDependencies {
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
 * import { monitorLogger } from "../../utils/logger";
 *
 * try {
 *     const result = await checker.checkMonitor(site, monitorId);
 *     if (result) {
 *         monitorLogger.info("Monitor check successful", result);
 *     }
 * } catch (error) {
 *     monitorLogger.error("Monitor check failed", error);
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

    private readonly operationCoordinator: MonitorOperationCoordinator;

    private readonly strategyRegistry: MonitorStrategyRegistry;

    /**
     * Service instances keyed by monitor type.
     *
     * @remarks
     * Seeded from {@link getMonitor} so we don't have multiple instantiation
     * code paths (MonitorTypeRegistry factories vs direct `new FooMonitor()` in
     * this class). The map also provides a single override surface for tests.
     */
    private readonly servicesByType: Map<Monitor["type"], IMonitorService>;

    private readonly historyPruneState = new Map<
        string,
        {
            hasPerformedCountCheck: boolean;
            lastHistoryLimit: number;
            pendingWritesSinceCountCheck: number;
        }
    >();

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
     * import { monitorLogger } from "../../utils/logger";
     *
     * const result = await checker.checkMonitor(
     *     site,
     *     "monitor-123",
     *     false
     * );
     * if (result) {
     *     monitorLogger.info("Monitor status", {
     *         monitorId: result.monitorId,
     *         status: result.status,
     *     });
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
     * @see {@link MonitorOperationRegistry.initiateCheck} for operation registration
     * @see {@link OperationTimeoutManager.scheduleTimeout} for timeout management
     * @see {@link MonitorStatusUpdateService.updateMonitorStatus} for status update
     *   safety
     */
    public async checkMonitor(
        site: Site,
        monitorId: string,
        isManualCheck = false,
        signal?: AbortSignal
    ): Promise<StatusUpdate | undefined> {
        const monitor = site.monitors.find((m) => m.id === monitorId);

        if (!this.validateMonitorForCheck(monitor, site, monitorId)) {
            return undefined;
        }

        // For manual checks, don't use operation correlation
        if (isManualCheck) {
            // Manual checks can race with scheduled correlated checks.
            // Cancel correlated operations to avoid overlapping writes.
            this.config.operationRegistry.cancelOperations(monitorId);

            // Ensure active operation IDs don't accumulate if a cancelled
            // operation never settles.
            await this.config.monitorRepository.clearActiveOperations(
                monitorId
            );

            const timeoutSignal = createTimeoutSignal(
                resolveMonitorBaseTimeoutMs(monitor.timeout),
                signal
            );

            return this.performDirectCheck(site, monitor, true, timeoutSignal);
        }

        // Only proceed if monitor is currently monitoring
        if (!monitor.monitoring) {
            logger.debug(`Monitor ${monitorId} not monitoring, skipping check`);
            return undefined;
        }

        return this.performCorrelatedCheck(site, monitor, monitorId, signal);
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
        const isoTimestamp = checkResult.timestamp.toISOString();
        const lifecycleBase: MonitorLifecycleEventData = {
            details: checkResult.details ?? "",
            monitor: freshMonitor,
            monitorId: freshMonitor.id,
            previousStatus: originalMonitor.status,
            responseTime: checkResult.responseTime,
            site,
            siteIdentifier: site.identifier,
            status: checkResult.status,
            timestamp: isoTimestamp,
        };

        if (checkResult.status === "up" && originalMonitor.status !== "up") {
            const payload: MonitorUpEventData = {
                ...lifecycleBase,
                status: "up",
            };
            await this.config.eventEmitter.emitTyped("monitor:up", payload);
        } else if (
            checkResult.status === "down" &&
            originalMonitor.status !== "down"
        ) {
            const payload: MonitorDownEventData = {
                ...lifecycleBase,
                status: "down",
            };
            await this.config.eventEmitter.emitTyped("monitor:down", payload);
        }
    }

    /**
     * Fetches the latest monitor state plus its persisted history.
     *
     * @remarks
     * This logic previously existed in multiple places (direct vs correlated
     * check flows). Centralizing it prevents drift and keeps emitted events
     * consistent.
     */
    private async fetchFreshMonitorWithHistory(
        monitorId: string
    ): Promise<Site["monitors"][0] | undefined> {
        const freshMonitor =
            await this.config.monitorRepository.findByIdentifier(monitorId);

        if (!freshMonitor) {
            logger.warn(`Fresh monitor data not found for ${monitorId}`);
            return undefined;
        }

        const freshHistory =
            await this.config.historyRepository.findByMonitorId(monitorId);

        return {
            ...freshMonitor,
            history: freshHistory,
        };
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
        context: MonitorCheckContext & { operationId: string }
    ): Promise<StatusUpdateMonitorCheckResult> {
        const { checkResult } = await this.runServiceCheck({
            context,
            operationId: context.operationId,
        });

        return checkResult;
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
        const freshMonitorWithHistory = await this.fetchFreshMonitorWithHistory(
            checkResult.monitorId
        );

        if (!freshMonitorWithHistory) {
            return undefined;
        }

        const details = resolveStatusUpdateDetails({
            status: checkResult.status,
        });

        const statusUpdate: StatusUpdate = {
            details,
            monitor: freshMonitorWithHistory,
            monitorId: checkResult.monitorId,
            previousStatus: monitor.status,
            responseTime: checkResult.responseTime,
            site,
            siteIdentifier: site.identifier,
            status: checkResult.status,
            timestamp: checkResult.timestamp.toISOString(),
        };

        const didStatusChange =
            statusUpdate.status !== statusUpdate.previousStatus;

        // Emit proper typed events like the traditional monitoring system
        if (didStatusChange) {
            await this.config.eventEmitter.emitTyped(
                "monitor:status-changed",
                statusUpdate
            );

            // Emit monitor up/down events for status changes
            await this.emitStatusChangeEvents(
                site,
                monitor,
                freshMonitorWithHistory,
                checkResult
            );
        }

        return statusUpdate;
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
        monitorId: string,
        externalSignal?: AbortSignal
    ): Promise<StatusUpdate | undefined> {
        const operationResult = await this.setupOperationCorrelation(monitor, {
            ...(externalSignal ? { additionalSignals: [externalSignal] } : {}),
        });
        if (!operationResult) {
            return undefined;
        }

        const { operationId, signal: operationSignal } = operationResult;

        const context: MonitorCheckContext & { operationId: string } = {
            ...createMonitorCheckContext({
                monitor,
                operationId,
                signal: operationSignal,
                site,
            }),
            operationId,
        };

        logger.info(
            interpolateLogTemplate(LOG_TEMPLATES.debug.MONITOR_CHECK_START, {
                monitorId: monitor.id,
                operationId,
                siteIdentifier: site.identifier,
            })
        );

        try {
            // Perform the actual check with abort signal
            const checkResult = await this.executeMonitorCheck(context);

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
            this.operationCoordinator.cleanupOperation(operationId);
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
        isManualCheck = false,
        signal?: AbortSignal
    ): Promise<StatusUpdate | undefined> {
        try {
            const context = createMonitorCheckContext({
                isManualCheck,
                monitor,
                operationId: "direct-check",
                ...(signal ? { signal } : {}),
                site,
            });

            const { checkResult, serviceResult } = await this.runServiceCheck({
                context,
                operationId: "direct-check",
            });

            // For manual checks on paused monitors, preserve the paused status
            const finalStatus =
                isManualCheck && monitor.status === "paused"
                    ? "paused"
                    : serviceResult.status;

            // Save history entry for direct checks too (always save actual
            // result)
            await this.saveHistoryEntry(monitor, checkResult);

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

            const fallbackMonitor: Monitor = {
                ...monitor,
                lastChecked: checkResult.timestamp,
                responseTime: serviceResult.responseTime,
                status: updateData.status ?? monitor.status,
            };

            const statusUpdateBase: StatusUpdate = {
                details: resolveStatusUpdateDetails(
                    finalStatus === "paused"
                        ? { status: finalStatus }
                        : {
                              status: finalStatus,
                              ...(typeof serviceResult.details === "string"
                                  ? { serviceDetails: serviceResult.details }
                                  : {}),
                          }
                ),
                monitor: fallbackMonitor,
                monitorId: monitor.id,
                previousStatus: monitor.status,
                responseTime: serviceResult.responseTime,
                site,
                siteIdentifier: site.identifier,
                status: finalStatus, // Use final status (might be "paused")
                timestamp: checkResult.timestamp.toISOString(),
            };

            await this.config.monitorRepository.update(monitor.id, updateData);

            const freshMonitorWithHistory =
                await this.fetchFreshMonitorWithHistory(monitor.id);

            if (!freshMonitorWithHistory) {
                return statusUpdateBase;
            }

            const statusUpdate: StatusUpdate = {
                ...statusUpdateBase,
                monitor: freshMonitorWithHistory,
            };

            const didStatusChange =
                statusUpdate.status !== statusUpdate.previousStatus;

            // Emit proper typed events like the traditional monitoring system
            if (didStatusChange) {
                await this.config.eventEmitter.emitTyped(
                    "monitor:status-changed",
                    statusUpdate
                );
            }

            // Emit monitor up/down events using the same canonical helper used
            // by correlated checks.
            //
            // Preserve existing behavior: manual checks on paused monitors do
            // not emit up/down events.
            if (
                didStatusChange &&
                (!isManualCheck || monitor.status !== "paused")
            ) {
                await this.emitStatusChangeEvents(
                    site,
                    monitor,
                    freshMonitorWithHistory,
                    checkResult
                );
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
            status: checkResult.status,
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
                // buffer.
                const bufferSize = Math.max(Math.floor(historyLimit * 0.2), 5);
                const pruneThreshold = historyLimit + bufferSize;

                const previousState = this.historyPruneState.get(monitor.id);
                const state = previousState ?? {
                    hasPerformedCountCheck: false,
                    lastHistoryLimit: historyLimit,
                    pendingWritesSinceCountCheck: 0,
                };

                // If the configured history limit changed, reset the pruning
                // state so the new configuration is applied quickly.
                if (state.lastHistoryLimit !== historyLimit) {
                    state.lastHistoryLimit = historyLimit;
                    state.pendingWritesSinceCountCheck = 0;
                    state.hasPerformedCountCheck = false;
                }

                state.pendingWritesSinceCountCheck += 1;

                const shouldCheckCount =
                    !state.hasPerformedCountCheck ||
                    state.pendingWritesSinceCountCheck >= bufferSize;

                if (shouldCheckCount) {
                    state.pendingWritesSinceCountCheck = 0;
                    state.hasPerformedCountCheck = true;
                    this.historyPruneState.set(monitor.id, state);

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
                } else {
                    this.historyPruneState.set(monitor.id, state);
                }
            } else {
                // Avoid unbounded memory usage if the history limit is disabled.
                this.historyPruneState.delete(monitor.id);
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
     *
     * @returns Operation result with ID and signal if successful, undefined if
     *   failed
     */
    private async setupOperationCorrelation(
        monitor: Monitor,
        options?: { readonly additionalSignals?: AbortSignal[] }
    ): Promise<undefined | { operationId: string; signal: AbortSignal }> {
        const handle = await this.operationCoordinator.initiateOperation(
            monitor,
            options
        );

        if (!handle) {
            return undefined;
        }

        return {
            operationId: handle.operationId,
            signal: handle.signal,
        };
    }

    /**
     * Executes the monitor check and returns both the raw service result and
     * the normalized {@link StatusUpdateMonitorCheckResult}.
     *
     * @remarks
     * This is the single canonical code path for executing monitor strategies.
     * Both correlated and direct/manual checks delegate here to avoid drift.
     *
     * Runtime safety: despite strong typings, tests (and potentially buggy
     * services) can return invalid values like `null`. This helper normalizes
     * invalid results into a stable `down` result.
     */
    private async runServiceCheck(args: {
        readonly context: MonitorCheckContext;
        readonly operationId: string;
    }): Promise<{
        readonly checkResult: StatusUpdateMonitorCheckResult;
        readonly serviceResult: MonitorCheckResult;
    }> {
        try {
            const raw: unknown = await this.strategyRegistry.execute(
                args.context.monitor,
                args.context
            );

            const serviceResult = isValidServiceResult(raw)
                ? raw
                : toFailure("Invalid monitor check result");

            return {
                checkResult: buildStatusUpdateMonitorCheckResult({
                    monitorId: args.context.monitor.id,
                    operationId: args.operationId,
                    serviceResult,
                }),
                serviceResult,
            };
        } catch (error) {
            const safeError = ensureError(error);
            logger.error(
                `Monitor check failed for ${args.context.monitor.id}`,
                safeError
            );

            const serviceResult = toFailure(safeError.message);

            return {
                checkResult: buildStatusUpdateMonitorCheckResult({
                    monitorId: args.context.monitor.id,
                    operationId: args.operationId,
                    serviceResult,
                }),
                serviceResult,
            };
        }
    }

    // NOTE: buildCheckResultFromServiceResult/resolveStatusUpdateDetails are
    // extracted to ./utils/monitorCheckResultNormalization.

    public constructor(config: EnhancedMonitorCheckConfig) {
        this.config = config;
        this.operationCoordinator = new MonitorOperationCoordinator({
            monitorRepository: config.monitorRepository,
            operationRegistry: config.operationRegistry,
            timeoutManager: config.timeoutManager,
        });

        // Build the monitor strategy registry from the canonical registry.
        //
        // This removes the duplicate monitor instantiation and monitor-type
        // list that previously lived in this class.
        const registeredTypes = BASE_MONITOR_TYPES;

        this.servicesByType = new Map(
            registeredTypes.map((type) => [type, getMonitor(type)])
        );

        this.strategyRegistry = createMonitorStrategyRegistry(
            registeredTypes.map((type) => ({
                getService: (): IMonitorService => this.getServiceOrThrow(type),
                type,
            }))
        );
    }

    private getServiceOrThrow(type: Monitor["type"]): IMonitorService {
        const service = this.servicesByType.get(type);
        if (!service) {
            throw new Error(`No monitor service registered for type: ${type}`);
        }

        return service;
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
