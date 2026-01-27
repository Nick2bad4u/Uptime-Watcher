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
 * ```typescript
 * const checker = new EnhancedMonitorChecker(config);
 * ```
 *
 * @public
 * @see {@link MonitorStatusUpdateService} for status update safety
 * @see {@link OperationTimeoutManager} for timeout management
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";

import { BASE_MONITOR_TYPES } from "@shared/types";

import type { MonitorCheckContext } from "./checkContext";
import type { MonitorOperationCoordinator } from "./coordinators/MonitorOperationCoordinator";
import type { HistoryPruneState } from "./enhancedMonitorChecker/historyPruningState";
import type { EnhancedMonitoringDependencies } from "./EnhancedMonitoringDependencies";
import type {
    MonitorStatusUpdateService,
    StatusUpdateMonitorCheckResult,
} from "./MonitorStatusUpdateService";
import type { OperationTimeoutManager } from "./OperationTimeoutManager";
import type { MonitorStrategyRegistry } from "./strategies/MonitorStrategyRegistry";
import type { IMonitorService, MonitorCheckResult } from "./types";

import { monitorLogger as logger } from "../../utils/logger";
import { MonitorOperationCoordinator as MonitorOperationCoordinatorImpl } from "./coordinators/MonitorOperationCoordinator";
import { createServicesByTypeAndStrategyRegistry } from "./enhancedMonitorChecker/createServicesByTypeAndStrategyRegistry";
import { emitStatusChangeEvents as emitStatusChangeEventsImpl } from "./enhancedMonitorChecker/emitStatusChangeEvents";
import { fetchFreshMonitorWithHistory as fetchFreshMonitorWithHistoryImpl } from "./enhancedMonitorChecker/fetchFreshMonitorWithHistory";
import { handleSuccessfulCheck as handleSuccessfulCheckImpl } from "./enhancedMonitorChecker/handleSuccessfulCheck";
import { performCorrelatedCheck as performCorrelatedCheckImpl } from "./enhancedMonitorChecker/performCorrelatedCheck";
import { performDirectCheck as performDirectCheckImpl } from "./enhancedMonitorChecker/performDirectCheck";
import { performManualCheckOperation } from "./enhancedMonitorChecker/performManualCheck";
import { performScheduledCheckOperation } from "./enhancedMonitorChecker/performScheduledCheck";
import { runServiceCheckOperation } from "./enhancedMonitorChecker/runServiceCheck";
import { saveMonitorHistoryEntry } from "./enhancedMonitorChecker/saveHistoryEntry";
import { startMonitoringOperation, stopMonitoringOperation } from "./enhancedMonitorChecker/toggleMonitoring";
import { validateMonitorForCheck as validateMonitorForCheckImpl } from "./enhancedMonitorChecker/validateMonitorForCheck";
import { getMonitor } from "./MonitorFactory";

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
     * Tests use this as an override surface for injecting fake monitor
     * services.
     */
    /**
     * Service instances keyed by monitor type.
     *
     * @remarks
     * This is intentionally public so tests (and internal tooling) can inject
     * fake monitor services without having to re-create the checker.
     *
     * @internal
     */
    public readonly servicesByType: Map<Monitor["type"], IMonitorService>;

    private readonly historyPruneState = new Map<
        string,
        HistoryPruneState
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
            return performManualCheckOperation({
                config: {
                    monitorRepository: this.config.monitorRepository,
                    operationRegistry: this.config.operationRegistry,
                },
                monitor,
                monitorId,
                performDirectCheck: (siteArg, monitorArg, manual, signalArg) =>
                    this.performDirectCheck(siteArg, monitorArg, manual, signalArg),
                signal,
                site,
            });
        }


        return performScheduledCheckOperation({
            logger,
            monitor,
            monitorId,
            performCorrelatedCheck: (siteArg, monitorArg, monitorIdArg, signalArg) =>
                this.performCorrelatedCheck(
                    siteArg,
                    monitorArg,
                    monitorIdArg,
                    signalArg
                ),
            signal,
            site,
        });
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
        return startMonitoringOperation({
            dependencies: {
                eventEmitter: this.config.eventEmitter,
                monitorRepository: this.config.monitorRepository,
                operationRegistry: this.config.operationRegistry,
            },
            monitorId,
            siteIdentifier,
        });
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
        return stopMonitoringOperation({
            dependencies: {
                eventEmitter: this.config.eventEmitter,
                monitorRepository: this.config.monitorRepository,
                operationRegistry: this.config.operationRegistry,
            },
            monitorId,
            siteIdentifier,
        });
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
        await emitStatusChangeEventsImpl({
            checkResult,
            eventEmitter: this.config.eventEmitter,
            freshMonitor,
            originalMonitor,
            site,
        });
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
        return fetchFreshMonitorWithHistoryImpl({
            historyRepository: this.config.historyRepository,
            logger,
            monitorId,
            monitorRepository: this.config.monitorRepository,
        });
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
        return handleSuccessfulCheckImpl({
            checkResult,
            eventEmitter: this.config.eventEmitter,
            fetchFreshMonitorWithHistory: (monitorId) =>
                this.fetchFreshMonitorWithHistory(monitorId),
            monitor,
            site,
        });
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
        return performCorrelatedCheckImpl({
            cleanupOperation:
                this.operationCoordinator.cleanupOperation.bind(
                    this.operationCoordinator
                ),
            executeMonitorCheck: (context) => this.executeMonitorCheck(context),
            ...(externalSignal ? { externalSignal } : {}),
            handleSuccessfulCheck: (siteArg, monitorArg, checkResult) =>
                this.handleSuccessfulCheck(siteArg, monitorArg, checkResult),
            logger,
            monitor,
            monitorId,
            saveHistoryEntry: (monitorArg, checkResult) =>
                this.saveHistoryEntry(monitorArg, checkResult),
            setupOperationCorrelation: (monitorArg, options) =>
                this.setupOperationCorrelation(monitorArg, options),
            site,
            updateMonitorStatus: (checkResult) =>
                this.config.statusUpdateService.updateMonitorStatus(checkResult),
        });
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
        return performDirectCheckImpl({
            emitStatusChangeEvents: (
                siteArg,
                originalMonitor,
                freshMonitorWithHistory,
                checkResult
            ) =>
                this.emitStatusChangeEvents(
                    siteArg,
                    originalMonitor,
                    freshMonitorWithHistory,
                    checkResult
                ),
            eventEmitter: this.config.eventEmitter,
            fetchFreshMonitorWithHistory: (monitorId) =>
                this.fetchFreshMonitorWithHistory(monitorId),
            isManualCheck,
            logger,
            monitor,
            monitorRepository: this.config.monitorRepository,
            runServiceCheck: (innerArgs) => this.runServiceCheck(innerArgs),
            saveHistoryEntry: (monitorArg, checkResult) =>
                this.saveHistoryEntry(monitorArg, checkResult),
            ...(signal ? { signal } : {}),
            site,
        });
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
        await saveMonitorHistoryEntry({
            checkResult,
            config: this.config,
            historyPruneState: this.historyPruneState,
            logger,
            monitor,
        });
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
        return runServiceCheckOperation({
            context: args.context,
            operationId: args.operationId,
            strategyRegistry: this.strategyRegistry,
        });
    }

    // NOTE: buildCheckResultFromServiceResult/resolveStatusUpdateDetails are
    // extracted to ./utils/monitorCheckResultNormalization.

    public constructor(config: EnhancedMonitorCheckConfig) {
        this.config = config;
        this.operationCoordinator = new MonitorOperationCoordinatorImpl({
            monitorRepository: config.monitorRepository,
            operationRegistry: config.operationRegistry,
            timeoutManager: config.timeoutManager,
        });

        const registeredTypes = BASE_MONITOR_TYPES;

        const { servicesByType, strategyRegistry } =
            createServicesByTypeAndStrategyRegistry({
                getServiceForType: (type) => getMonitor(type),
                registeredTypes,
            });

        this.servicesByType = servicesByType;
        this.strategyRegistry = strategyRegistry;
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
        return validateMonitorForCheckImpl(logger, monitor, site, monitorId);
    }
}
