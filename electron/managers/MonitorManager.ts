/**
 * Central coordinator for backend monitor lifecycle management.
 *
 * @remarks
 * Manages scheduling, state transitions, and event propagation for every
 * monitor by composing repository, cache, and enhanced monitoring services.
 *
 * @public
 */

import type {
    Monitor,
    MonitoringStartSummary,
    MonitoringStopSummary,
    MonitorStatus,
    Site,
    StatusUpdate,
} from "@shared/types";

import { shouldRemediateMonitorInterval } from "@shared/constants/monitoring";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { UptimeEvents } from "../events/eventTypes";
import type { TypedEventBus } from "../events/TypedEventBus";
import type { DatabaseService } from "../services/database/DatabaseService";
import type { HistoryRepository } from "../services/database/HistoryRepository";
import type { MonitorRepository } from "../services/database/MonitorRepository";
import type { SiteRepository } from "../services/database/SiteRepository";
import type { EnhancedMonitoringServices } from "../services/monitoring/EnhancedMonitoringServiceFactory";
import type { StandardizedCache } from "../utils/cache/StandardizedCache";

import { DEFAULT_CHECK_INTERVAL } from "../constants";
import { isDev } from "../electronUtils";
import { MonitorScheduler } from "../services/monitoring/MonitorScheduler";
import { logger } from "../utils/logger";
import { withDatabaseOperation } from "../utils/operationalHooks";
import {
    type EnhancedLifecycleConfig,
    type EnhancedLifecycleHost,
    type MonitorActionDelegate,
    startAllMonitoringEnhancedFlow,
    startMonitoringForSiteEnhancedFlow,
    stopAllMonitoringEnhancedFlow,
    stopMonitoringForSiteEnhancedFlow,
} from "./MonitorManagerEnhancedLifecycle";

/**
 * Dependency contract consumed by {@link MonitorManager}.
 *
 * @remarks
 * Supplies repositories, cache accessors, and services required for monitor
 * orchestration.
 *
 * @public
 */
export interface MonitorManagerDependencies {
    /**
     * Database service for transactional operations.
     *
     * @remarks
     * Used for all database access and transaction management.
     */
    databaseService: DatabaseService;
    /**
     * Event bus for emitting and listening to monitor events.
     *
     * @remarks
     * Used for all event-driven communication between backend and frontend.
     */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /**
     * Returns the history limit for status checks.
     *
     * @remarks
     * Used to determine how many status updates to retain in history.
     *
     * @returns The maximum number of status updates to keep in history.
     */
    getHistoryLimit: () => number;
    /**
     * Returns the current sites cache.
     *
     * @remarks
     * Provides access to the in-memory cache of all sites.
     *
     * @returns The current {@link StandardizedCache} of {@link Site} objects.
     */
    getSitesCache: () => StandardizedCache<Site>;
    /**
     * Repository interfaces for DB access.
     *
     * @remarks
     * Provides access to the repositories for history, monitor, and site
     * entities.
     */
    repositories: {
        /** Repository for managing status history records */
        history: HistoryRepository;
        /** Repository for managing monitor configuration and data */
        monitor: MonitorRepository;
        /** Repository for managing site configuration and data */
        site: SiteRepository;
    };
}

/**
 * Main class for orchestrating monitor scheduling, status checks, and
 * event-driven updates.
 *
 * @remarks
 * All monitoring operations, including lifecycle management, scheduling, and
 * event emission, are coordinated here. This class is the central entry point
 * for all backend monitoring logic.
 *
 * @public
 */
export class MonitorManager {
    /** Injected dependencies for orchestration and data access. */
    private readonly dependencies: MonitorManagerDependencies;

    /** Enhanced monitoring services that coordinate stateful operations. */
    private readonly enhancedMonitoringServices!: EnhancedMonitoringServices;

    /** Typed event bus used for monitor event emission. */
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    /** Tracks whether any monitors are currently active. */
    private isMonitoring = false;

    /** Schedules monitor checks and lifecycle callbacks. */
    private readonly monitorScheduler: MonitorScheduler;

    /**
     * Triggers an immediate monitor check and emits completion events.
     *
     * @param identifier - Site identifier to inspect.
     * @param monitorId - Optional monitor identifier to target.
     *
     * @returns Latest {@link StatusUpdate} when available.
     */
    public async checkSiteManually(
        identifier: string,
        monitorId?: string
    ): Promise<StatusUpdate | undefined> {
        // Use enhanced monitoring for manual checks
        if (monitorId) {
            const site = this.dependencies.getSitesCache().get(identifier);
            if (site) {
                const result =
                    await this.enhancedMonitoringServices.checker.checkMonitor(
                        site,
                        monitorId,
                        true
                    );

                // Only emit event if result is available
                if (result) {
                    // Emit manual check completed event
                    await this.eventEmitter.emitTyped(
                        "internal:monitor:manual-check-completed",
                        {
                            identifier,
                            monitorId,
                            operation: "manual-check-completed",
                            result,
                            timestamp: Date.now(),
                        }
                    );
                }

                return result;
            }
        }

        // For site-wide checks without specific monitorId, check all monitors
        const site = this.dependencies.getSitesCache().get(identifier);
        if (!site?.monitors.length) {
            logger.warn(
                interpolateLogTemplate(
                    LOG_TEMPLATES.warnings.SITE_NOT_FOUND_MANUAL,
                    { identifier }
                )
            );
            return undefined;
        }

        // Check the first monitor (or could iterate through all)
        const [firstMonitor] = site.monitors;
        if (firstMonitor?.id) {
            return this.checkSiteManually(identifier, firstMonitor.id);
        }

        return undefined;
    }

    /**
     * Applies default configuration for monitors newly attached to a site.
     *
     * @param site - Site containing the monitors.
     * @param newMonitorIds - Monitor identifiers to initialize.
     */
    public async setupNewMonitors(
        site: Site,
        newMonitorIds: string[]
    ): Promise<void> {
        logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.debug.MONITOR_MANAGER_SETUP_MONITORS,
                {
                    count: newMonitorIds.length,
                    identifier: site.identifier,
                }
            )
        );

        // Filter to only the new monitors
        const newMonitors = site.monitors.filter(
            (m) => m.id && newMonitorIds.includes(m.id)
        );

        if (newMonitors.length === 0) {
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.MONITOR_MANAGER_VALID_MONITORS,
                    {
                        identifier: site.identifier,
                    }
                )
            );
            return;
        }

        // Apply default intervals and perform setup for each new monitor
        await this.setupIndividualNewMonitors(site, newMonitors);

        logger.info(
            `[MonitorManager] Completed setup for ${newMonitors.length} new monitors in site: ${site.identifier}`
        );
    }

    /**
     * Prepares a site for scheduling by applying default cadence and auto-start
     * rules.
     *
     * @param site - Site to prime before monitoring begins.
     */
    public async setupSiteForMonitoring(site: Site): Promise<void> {
        // Apply business rules for default intervals
        await this.applyDefaultIntervals(site);

        // Apply business rules for auto-starting monitoring
        // Note: Initial checks are handled by MonitorScheduler when monitoring
        // starts
        await this.autoStartMonitoringIfAppropriate(site);

        // Emit site setup completed event
        await this.eventEmitter.emitTyped(
            "internal:monitor:site-setup-completed",
            {
                identifier: site.identifier,
                operation: "site-setup-completed",
                timestamp: Date.now(),
            }
        );
    }

    /**
     * Starts monitoring across the full fleet and emits lifecycle events.
     *
     * @returns Summary describing attempted and successful starts.
     */
    public async startMonitoring(): Promise<MonitoringStartSummary> {
        const summary = await this.startAllMonitoringEnhanced(
            {
                databaseService: this.dependencies.databaseService,
                eventEmitter: this.eventEmitter,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                monitorScheduler: this.monitorScheduler,
                sites: this.dependencies.getSitesCache(),
            },
            this.isMonitoring
        );

        this.isMonitoring = summary.isMonitoring;

        if (summary.partialFailures) {
            logger.warn(
                "[MonitorManager] startMonitoring completed with partial failures",
                summary
            );
        }

        if (
            !summary.isMonitoring &&
            summary.attempted > 0 &&
            !summary.alreadyActive
        ) {
            logger.error(
                "[MonitorManager] No monitors transitioned to an active state during startMonitoring",
                summary
            );
            const error = new Error(
                "Failed to start monitoring: no monitors reported as active"
            );
            // Attach summary for upstream error handling and diagnostics.
            (error as Error & { summary?: MonitoringStartSummary }).summary =
                summary;
            throw error;
        }

        // Emit internal monitoring started event for orchestrator forwarding
        if (summary.isMonitoring || summary.alreadyActive) {
            await this.eventEmitter.emitTyped("internal:monitor:started", {
                identifier: "all",
                operation: "started",
                summary,
                timestamp: Date.now(),
            });
        }

        return summary;
    }

    /**
     * Starts monitoring for a site or a single monitor and emits lifecycle
     * events.
     *
     * @param identifier - Site identifier being toggled.
     * @param monitorId - Optional monitor identifier to scope the request.
     */
    public async startMonitoringForSite(
        identifier: string,
        monitorId?: string
    ): Promise<boolean> {
        // Proceed with enhanced monitoring lifecycle which handles
        // operation cleanup
        const result = await this.startMonitoringForSiteEnhanced(
            {
                databaseService: this.dependencies.databaseService,
                eventEmitter: this.eventEmitter,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                monitorScheduler: this.monitorScheduler,
                sites: this.dependencies.getSitesCache(),
            },
            identifier,
            monitorId,
            // Create a proper recursive handler that avoids infinite loops
            async (recursiveId: string, recursiveMonitorId?: string) => {
                // Only recurse if it's a different site/monitor combination
                if (
                    recursiveId !== identifier ||
                    recursiveMonitorId !== monitorId
                ) {
                    return this.startMonitoringForSite(
                        recursiveId,
                        recursiveMonitorId
                    );
                }
                // Prevent infinite recursion by using direct scheduler call
                logger.warn(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.warnings.RECURSIVE_CALL_PREVENTED,
                        {
                            identifier,
                            monitorId: monitorId ?? "all",
                        }
                    )
                );
                return false;
            }
        );

        if (result) {
            // Emit monitoring started event
            await this.eventEmitter.emitTyped("internal:monitor:started", {
                identifier,
                ...(monitorId && { monitorId }),
                operation: "started",
                timestamp: Date.now(),
            });
        }

        return result;
    }

    /**
     * Stops monitoring globally and reports the resulting summary.
     *
     * @returns Breakdown of attempted and successful stops.
     */
    public async stopMonitoring(): Promise<MonitoringStopSummary> {
        const summary = await this.stopAllMonitoringEnhanced({
            databaseService: this.dependencies.databaseService,
            eventEmitter: this.eventEmitter,
            logger,
            monitorRepository: this.dependencies.repositories.monitor,
            monitorScheduler: this.monitorScheduler,
            sites: this.dependencies.getSitesCache(),
        });

        this.isMonitoring = summary.isMonitoring;

        if (summary.partialFailures) {
            logger.warn(
                "[MonitorManager] stopMonitoring completed with partial failures",
                summary
            );
        }

        if (
            summary.isMonitoring &&
            summary.attempted > 0 &&
            !summary.alreadyInactive
        ) {
            logger.error(
                "[MonitorManager] Some monitors failed to stop during stopMonitoring",
                summary
            );
            const error = new Error(
                "Failed to stop monitoring: one or more monitors remain active"
            );
            (error as Error & { summary?: MonitoringStopSummary }).summary =
                summary;
            throw error;
        }

        await this.eventEmitter.emitTyped("internal:monitor:stopped", {
            identifier: "all",
            operation: "stopped",
            reason: "user",
            summary,
            timestamp: Date.now(),
        });

        return summary;
    }

    /**
     * Stops monitoring for a site or individual monitor and emits lifecycle
     * events.
     *
     * @param identifier - Site identifier being toggled.
     * @param monitorId - Optional monitor identifier to scope the request.
     */
    public async stopMonitoringForSite(
        identifier: string,
        monitorId?: string
    ): Promise<boolean> {
        // Proceed with enhanced monitoring lifecycle which handles
        // operation cleanup
        const result = await this.stopMonitoringForSiteEnhanced(
            {
                databaseService: this.dependencies.databaseService,
                eventEmitter: this.eventEmitter,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                monitorScheduler: this.monitorScheduler,
                sites: this.dependencies.getSitesCache(),
            },
            identifier,
            monitorId,
            // Create a proper recursive handler that avoids infinite loops
            async (recursiveId: string, recursiveMonitorId?: string) => {
                // Only recurse if it's a different site/monitor combination
                if (
                    recursiveId !== identifier ||
                    recursiveMonitorId !== monitorId
                ) {
                    return this.stopMonitoringForSite(
                        recursiveId,
                        recursiveMonitorId
                    );
                }
                // Prevent infinite recursion by using direct scheduler call
                logger.warn(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.warnings.RECURSIVE_CALL_PREVENTED,
                        {
                            identifier,
                            monitorId: monitorId ?? "all",
                        }
                    )
                );
                return false;
            }
        );

        if (result) {
            // Emit monitoring stopped event
            await this.eventEmitter.emitTyped("internal:monitor:stopped", {
                identifier,
                ...(monitorId && { monitorId }),
                operation: "stopped",
                reason: "user",
                timestamp: Date.now(),
            });
        }

        return result;
    }

    /**
     * Execute asynchronous tasks sequentially while preserving order.
     */
    private async runSequentially<TItem>(
        items: readonly TItem[],
        task: (item: TItem) => Promise<void>
    ): Promise<void> {
        for (const item of items) {
            // eslint-disable-next-line no-await-in-loop -- Sequential execution prevents overlapping datastore operations
            await task(item);
        }
    }

    /**
     * Enhanced start all monitoring - replaces the previous startAllMonitoring
     * implementation function.
     *
     * @param config - Configuration object with required dependencies
     * @param isMonitoring - Current monitoring state
     *
     * @returns Promise<boolean> - New monitoring state
     *
     * @internal
     */
    private startAllMonitoringEnhanced(
        config: EnhancedLifecycleConfig,
        isMonitoring: boolean
    ): Promise<MonitoringStartSummary> {
        return startAllMonitoringEnhancedFlow({
            config,
            host: this.createEnhancedLifecycleHost(),
            isMonitoring,
        });
    }

    /**
     * Enhanced stop all monitoring - replaces the previous stopAllMonitoring
     * implementation function.
     *
     * @param config - Configuration object with required dependencies
     *
     * @returns Promise<boolean> - Always false (monitoring stopped)
     *
     * @internal
     */
    private stopAllMonitoringEnhanced(
        config: EnhancedLifecycleConfig
    ): Promise<MonitoringStopSummary> {
        return stopAllMonitoringEnhancedFlow({
            config,
            host: this.createEnhancedLifecycleHost(),
        });
    }

    /**
     * Enhanced start monitoring for site - replaces the earlier implementation
     * startMonitoringForSite function.
     *
     * @param config - Configuration object with required dependencies
     * @param identifier - Site identifier
     * @param monitorId - Optional monitor ID
     * @param monitorAction - Optional recursive handler for nested starts
     *
     * @returns Promise<boolean> - True if operation succeeded
     *
     * @internal
     */
    private startMonitoringForSiteEnhanced(
        config: EnhancedLifecycleConfig,
        identifier: string,
        monitorId?: string,
        monitorAction?: MonitorActionDelegate
    ): Promise<boolean> {
        return startMonitoringForSiteEnhancedFlow({
            config,
            host: this.createEnhancedLifecycleHost(),
            identifier,
            ...(monitorId === undefined ? {} : { monitorId }),
            ...(monitorAction === undefined ? {} : { monitorAction }),
        });
    }

    /**
     * Enhanced stop monitoring for site - replaces the previous
     * stopMonitoringForSite implementation function.
     *
     * @param config - Configuration object with required dependencies
     * @param identifier - Site identifier
     * @param monitorId - Optional monitor ID
     * @param monitorAction - Optional recursive handler for nested stops
     *
     * @returns Promise<boolean> - True if operation succeeded
     *
     * @internal
     */
    private stopMonitoringForSiteEnhanced(
        config: EnhancedLifecycleConfig,
        identifier: string,
        monitorId?: string,
        monitorAction?: MonitorActionDelegate
    ): Promise<boolean> {
        return stopMonitoringForSiteEnhancedFlow({
            config,
            host: this.createEnhancedLifecycleHost(),
            identifier,
            ...(monitorId === undefined ? {} : { monitorId }),
            ...(monitorAction === undefined ? {} : { monitorAction }),
        });
    }

    /**
     * Ensures every monitor in the site respects the shared minimum interval.
     *
     * @param site - Site whose monitors need remediation.
     */
    private async applyDefaultIntervals(site: Site): Promise<void> {
        logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.debug.MONITOR_MANAGER_INTERVALS_SETTING,
                {
                    identifier: site.identifier,
                }
            )
        );

        const monitorsNeedingRemediation = site.monitors.filter(
            (monitor): monitor is Site["monitors"][0] & { id: string } =>
                Boolean(monitor.id) && this.shouldApplyDefaultInterval(monitor)
        );

        if (monitorsNeedingRemediation.length === 0) {
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.MONITOR_MANAGER_VALID_MONITORS,
                    {
                        identifier: site.identifier,
                    }
                )
            );
            return;
        }

        await withDatabaseOperation(
            () =>
                this.dependencies.databaseService.executeTransaction((db) => {
                    const monitorTx =
                        this.dependencies.repositories.monitor.createTransactionAdapter(
                            db
                        );

                    for (const monitor of monitorsNeedingRemediation) {
                        monitorTx.update(monitor.id, {
                            checkInterval: DEFAULT_CHECK_INTERVAL,
                        });

                        logger.debug(
                            interpolateLogTemplate(
                                LOG_TEMPLATES.debug.MONITOR_INTERVALS_APPLIED,
                                {
                                    interval: DEFAULT_CHECK_INTERVAL / 1000,
                                    monitorId: monitor.id,
                                }
                            )
                        );
                    }

                    return Promise.resolve();
                }),
            "monitor-manager-apply-default-interval",
            undefined,
            {
                identifier: site.identifier,
                interval: DEFAULT_CHECK_INTERVAL,
                monitorCount: monitorsNeedingRemediation.length,
            }
        );

        for (const monitor of monitorsNeedingRemediation) {
            monitor.checkInterval = DEFAULT_CHECK_INTERVAL;
        }

        const updatedSite: Site = {
            ...site,
            monitors: Array.from(site.monitors),
        };

        site.monitors = updatedSite.monitors;

        this.dependencies.getSitesCache().set(site.identifier, updatedSite);

        logger.info(
            interpolateLogTemplate(
                LOG_TEMPLATES.services.MONITOR_MANAGER_APPLYING_INTERVALS,
                {
                    identifier: site.identifier,
                }
            )
        );
    }

    /** Applies auto-start rules for a site that has newly loaded monitors. */
    private async autoStartMonitoringIfAppropriate(site: Site): Promise<void> {
        logger.debug(
            `[MonitorManager] Evaluating auto-start for site: ${site.identifier} (site.monitoring: ${site.monitoring})`
        );

        // Site-level monitoring acts as a master switch
        if (!site.monitoring) {
            logger.debug(
                `[MonitorManager] Site monitoring disabled, skipping all monitors for site: ${site.identifier}`
            );
            return;
        }

        // Only process sites that have monitors
        if (site.monitors.length === 0) {
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.MONITOR_MANAGER_NO_MONITORS_FOUND,
                    {
                        identifier: site.identifier,
                    }
                )
            );
            return;
        }

        logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.debug.MONITOR_MANAGER_AUTO_STARTING_SITE,
                {
                    identifier: site.identifier,
                }
            )
        );

        // Start only monitors that have monitoring enabled (respecting
        // individual monitor states) - run in parallel for better performance
        const startPromises = site.monitors.map(async (monitor) => {
            if (monitor.id && monitor.monitoring) {
                await this.startMonitoringForSite(site.identifier, monitor.id);

                if (isDev()) {
                    logger.debug(
                        `[MonitorManager] Auto-started monitoring for monitor ${monitor.id} with interval ${monitor.checkInterval}ms`
                    );
                }
            } else if (monitor.id && !monitor.monitoring) {
                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.debug.MONITOR_MANAGER_SKIP_INDIVIDUAL,
                        {
                            monitorId: monitor.id,
                        }
                    )
                );
            } else {
                // Monitor has no valid ID or is in an unknown state
                logger.warn(
                    `[MonitorManager] Skipping monitor without valid ID or in unknown state`
                );
            }
        });

        await Promise.all(startPromises);

        logger.info(
            interpolateLogTemplate(
                LOG_TEMPLATES.services.MONITOR_MANAGER_AUTO_STARTING,
                {
                    identifier: site.identifier,
                }
            )
        );
    }

    /** Auto-starts eligible monitors that have just been added to a site. */
    private async autoStartNewMonitors(
        site: Site,
        newMonitors: Site["monitors"]
    ): Promise<void> {
        // Start new monitors in parallel for better performance
        const startPromises = newMonitors.map(async (monitor) => {
            if (monitor.id && monitor.monitoring) {
                await this.startMonitoringForSite(site.identifier, monitor.id);
                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.debug.MONITOR_AUTO_STARTED,
                        { monitorId: monitor.id }
                    )
                );
            } else if (monitor.id && !monitor.monitoring) {
                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.debug.MONITOR_MANAGER_SKIP_NEW_INDIVIDUAL,
                        {
                            monitorId: monitor.id,
                        }
                    )
                );
            }
        });

        await Promise.all(startPromises);
    }

    /**
     * Handles scheduled monitor checks from the {@link MonitorScheduler}.
     *
     * @remarks
     * Invoked by the scheduler to perform a check on a specific monitor at the
     * scheduled interval.
     *
     * @param siteIdentifier - The identifier of the site.
     * @param monitorId - The monitor ID to check.
     *
     * @returns A promise that resolves when the scheduled check is complete.
     *
     * @internal
     */
    private async handleScheduledCheck(
        siteIdentifier: string,
        monitorId: string
    ): Promise<void> {
        const site = this.dependencies.getSitesCache().get(siteIdentifier);
        if (!site) {
            logger.warn(
                interpolateLogTemplate(
                    LOG_TEMPLATES.warnings.SITE_NOT_FOUND_SCHEDULED,
                    { siteIdentifier }
                )
            );
            return;
        }

        // Use enhanced monitoring for scheduled checks
        try {
            await this.enhancedMonitoringServices.checker.checkMonitor(
                site,
                monitorId,
                false
            );
        } catch (error) {
            logger.error(
                interpolateLogTemplate(
                    LOG_TEMPLATES.errors.MONITOR_CHECK_ENHANCED_FAILED,
                    { monitorId }
                ),
                error
            );
        }
    }

    /** Applies default intervals and optional auto-start for new monitors. */
    private async setupIndividualNewMonitors(
        site: Site,
        newMonitors: Site["monitors"]
    ): Promise<void> {
        // Apply default intervals for new monitors that don't have one
        // Note: For new monitors, direct assignment is acceptable as they
        // haven't been persisted yet and will be saved through the normal
        // persistence flow
        for (const monitor of newMonitors) {
            if (this.shouldApplyDefaultInterval(monitor)) {
                monitor.checkInterval = DEFAULT_CHECK_INTERVAL;
                logger.debug(
                    `[MonitorManager] Applied default interval ${monitor.checkInterval}ms to new monitor: ${monitor.id}`
                );
            }
        }

        // Auto-start monitoring for new monitors if appropriate
        // Note: Initial checks are handled by MonitorScheduler when monitoring
        // starts
        if (site.monitoring) {
            await this.autoStartNewMonitors(site, newMonitors);
        } else {
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.MONITOR_MANAGER_SKIP_AUTO_START,
                    {
                        identifier: site.identifier,
                    }
                )
            );
        }
    }

    /**
     * Applies state changes, writes them to the database, and emits events.
     *
     * @param site - Site containing the monitor.
     * @param monitor - Monitor to update.
     * @param changes - Partial mutations to persist.
     * @param newStatus - Status used for downstream notifications.
     */
    private async applyMonitorState(
        site: Site,
        monitor: Monitor,
        changes: Partial<Monitor>,
        newStatus: MonitorStatus
    ): Promise<void> {
        const previousStatus = monitor.status;

        // Update cached monitor object
        Object.assign(monitor, changes);

        // Update monitor in cached site
        const monitorIndex = site.monitors.findIndex(
            (m) => m.id === monitor.id
        );
        if (monitorIndex !== -1) {
            site.monitors[monitorIndex] = monitor;
        }

        // Update cached site
        this.dependencies.getSitesCache().set(site.identifier, site);

        // Persist to database within transaction
        await withDatabaseOperation(
            async () =>
                this.dependencies.databaseService.executeTransaction((db) => {
                    const monitorTx =
                        this.dependencies.repositories.monitor.createTransactionAdapter(
                            db
                        );

                    monitorTx.update(monitor.id, changes);
                    return Promise.resolve();
                }),
            "monitor-manager-apply-state-change",
            this.eventEmitter,
            { changes, monitorId: monitor.id }
        );

        // Emit status-changed event with full payload
        const statusUpdate: StatusUpdate = {
            monitor,
            monitorId: monitor.id,
            previousStatus,
            responseTime: monitor.responseTime,
            site,
            siteIdentifier: site.identifier,
            status: newStatus,
            timestamp: new Date().toISOString(),
        };

        await this.eventEmitter.emitTyped(
            "monitor:status-changed",
            statusUpdate
        );
    }

    /**
     * Builds the lifecycle context consumed by enhanced monitoring helpers.
     *
     * @returns Bound callbacks and services required for helper execution.
     */
    private createEnhancedLifecycleHost(): EnhancedLifecycleHost {
        return {
            applyMonitorState: this.applyMonitorState.bind(this),
            runSequentially: this.runSequentially.bind(this),
            services: this.enhancedMonitoringServices,
        };
    }

    /**
     * Creates a new manager using the supplied dependencies and enhanced
     * services.
     *
     * @param dependencies - Data, cache, and event collaborators.
     * @param enhancedServices - Enhanced monitoring orchestrator bundle.
     */
    public constructor(
        dependencies: MonitorManagerDependencies,
        enhancedServices: EnhancedMonitoringServices
    ) {
        this.dependencies = dependencies;
        this.eventEmitter = dependencies.eventEmitter;
        this.enhancedMonitoringServices = enhancedServices;
        this.monitorScheduler = new MonitorScheduler();
        this.monitorScheduler.setCheckCallback(
            this.handleScheduledCheck.bind(this)
        );
    }

    /** Returns the number of monitors currently scheduled for checks. */
    public getActiveMonitorCount(): number {
        return this.monitorScheduler.getActiveCount();
    }

    /**
     * Checks whether a specific monitor currently has a scheduled job.
     *
     * @param siteIdentifier - Site containing the monitor.
     * @param monitorId - Monitor identifier under inspection.
     */
    public isMonitorActiveInScheduler(
        siteIdentifier: string,
        monitorId: string
    ): boolean {
        return this.monitorScheduler.isMonitoring(siteIdentifier, monitorId);
    }

    /** Reports whether any monitors are currently active. */
    public isMonitoringActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * Restarts a monitor after its configuration changes.
     *
     * @param siteIdentifier - Site containing the monitor.
     * @param monitor - Updated monitor definition.
     */
    public restartMonitorWithNewConfig(
        siteIdentifier: string,
        monitor: Site["monitors"][0]
    ): boolean {
        return this.monitorScheduler.restartMonitor(siteIdentifier, monitor);
    }

    /**
     * Determines whether the default interval should be applied to a monitor.
     *
     * @param monitor - Monitor candidate for remediation.
     */
    private shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return shouldRemediateMonitorInterval(monitor.checkInterval);
    }
}
