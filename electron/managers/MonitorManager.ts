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

import type { UptimeEvents } from "../events/eventTypes";
import type { TypedEventBus } from "../events/TypedEventBus";
import type { DatabaseService } from "../services/database/DatabaseService";
import type { HistoryRepository } from "../services/database/HistoryRepository";
import type { MonitorRepository } from "../services/database/MonitorRepository";
import type { SiteRepository } from "../services/database/SiteRepository";
import type { EnhancedMonitoringServices } from "../services/monitoring/EnhancedMonitoringServiceFactory";
import type { StandardizedCache } from "../utils/cache/StandardizedCache";

import { DEFAULT_CHECK_INTERVAL } from "../constants";
import { MonitorScheduler } from "../services/monitoring/MonitorScheduler";
import { logger } from "../utils/logger";
import { applyDefaultIntervalsOperation } from "./monitorManager/applyDefaultIntervalsOperation";
import { applyMonitorStateOperation } from "./monitorManager/applyMonitorStateOperation";
import {
    autoStartMonitoringIfAppropriateOperation,
    autoStartNewMonitorsOperation,
} from "./monitorManager/autoStartMonitoring";
import { checkSiteManuallyOperation } from "./monitorManager/checkSiteManuallyOperation";
import {
    createEnhancedLifecycleConfigOperation,
    createEnhancedLifecycleHostOperation,
} from "./monitorManager/createEnhancedLifecycle";
import { createMonitorActionDelegate } from "./monitorManager/createMonitorActionDelegate";
import { handleScheduledCheckOperation } from "./monitorManager/handleScheduledCheckOperation";
import { setupIndividualNewMonitorsOperation } from "./monitorManager/setupIndividualNewMonitorsOperation";
import { setupNewMonitorsOperation } from "./monitorManager/setupNewMonitorsOperation";
import { setupSiteForMonitoringOperation } from "./monitorManager/setupSiteForMonitoringOperation";
import {
    startMonitoringAllOperation,
    stopMonitoringAllOperation,
} from "./monitorManager/toggleMonitoringAllOperation";
import { toggleMonitoringForSiteOperation } from "./monitorManager/toggleMonitoringForSiteOperation";
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
        return checkSiteManuallyOperation({
            dependencies: {
                checkMonitor: (siteArg, monitorIdArg, isManual) =>
                    this.enhancedMonitoringServices.checker.checkMonitor(
                        siteArg,
                        monitorIdArg,
                        isManual
                    ),
                eventEmitter: this.eventEmitter,
                logger,
                sitesCache: this.dependencies.getSitesCache(),
            },
            identifier,
            monitorId,
        });
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
        await setupNewMonitorsOperation({
            newMonitorIds,
            setupIndividualNewMonitors: (siteArg, newMonitors) =>
                this.setupIndividualNewMonitors(siteArg, newMonitors),
            site,
        });
    }

    /**
     * Prepares a site for scheduling by applying default cadence and auto-start
     * rules.
     *
     * @param site - Site to prime before monitoring begins.
     */
    public async setupSiteForMonitoring(site: Site): Promise<void> {
        await setupSiteForMonitoringOperation({
            applyDefaultIntervals: (siteArg) => this.applyDefaultIntervals(siteArg),
            autoStartMonitoringIfAppropriate: (siteArg) =>
                this.autoStartMonitoringIfAppropriate(siteArg),
            eventEmitter: this.eventEmitter,
            site,
        });
    }

    /**
     * Starts monitoring across the full fleet and emits lifecycle events.
     *
     * @returns Summary describing attempted and successful starts.
     */
    public async startMonitoring(): Promise<MonitoringStartSummary> {
        const summary = await startMonitoringAllOperation({
            config: this.createEnhancedLifecycleConfig(),
            eventEmitter: this.eventEmitter,
            isMonitoring: this.isMonitoring,
            logger,
            startAllMonitoringEnhanced: (config, isMonitoring) =>
                this.startAllMonitoringEnhanced(config, isMonitoring),
        });

        this.isMonitoring = summary.isMonitoring;
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
        return toggleMonitoringForSiteOperation({
            eventEmitter: this.eventEmitter,
            identifier,
            monitorId,
            operation: "started",
            toggle: () =>
                this.startMonitoringForSiteEnhanced(
                    this.createEnhancedLifecycleConfig(),
                    identifier,
                    monitorId,
                    createMonitorActionDelegate({
                        action: (recursiveId, recursiveMonitorId) =>
                            this.startMonitoringForSite(
                                recursiveId,
                                recursiveMonitorId
                            ),
                        identifier,
                        logger,
                        monitorId,
                    })
                ),
        });
    }

    /**
     * Stops monitoring globally and reports the resulting summary.
     *
     * @returns Breakdown of attempted and successful stops.
     */
    public async stopMonitoring(): Promise<MonitoringStopSummary> {
        const summary = await stopMonitoringAllOperation({
            config: this.createEnhancedLifecycleConfig(),
            eventEmitter: this.eventEmitter,
            logger,
            stopAllMonitoringEnhanced: (config) =>
                this.stopAllMonitoringEnhanced(config),
        });

        this.isMonitoring = summary.isMonitoring;
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
        return toggleMonitoringForSiteOperation({
            eventEmitter: this.eventEmitter,
            identifier,
            monitorId,
            operation: "stopped",
            reason: "user",
            toggle: () =>
                this.stopMonitoringForSiteEnhanced(
                    this.createEnhancedLifecycleConfig(),
                    identifier,
                    monitorId,
                    createMonitorActionDelegate({
                        action: (recursiveId, recursiveMonitorId) =>
                            this.stopMonitoringForSite(
                                recursiveId,
                                recursiveMonitorId
                            ),
                        identifier,
                        logger,
                        monitorId,
                    })
                ),
        });
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
     * Ensures every monitor in the site respects the shared minimum interval.
     *
     * @param site - Site whose monitors need remediation.
     */
    private async applyDefaultIntervals(site: Site): Promise<void> {
        await applyDefaultIntervalsOperation({
            defaultCheckIntervalMs: DEFAULT_CHECK_INTERVAL,
            dependencies: {
                databaseService: this.dependencies.databaseService,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                sitesCache: this.dependencies.getSitesCache(),
            },
            shouldApplyDefaultInterval: (monitor) =>
                this.shouldApplyDefaultInterval(monitor),
            site,
        });
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
    private async startAllMonitoringEnhanced(
        config: EnhancedLifecycleConfig,
        isMonitoring: boolean
    ): Promise<MonitoringStartSummary> {
        return startAllMonitoringEnhancedFlow({
            config,
            host: this.createEnhancedLifecycleHost(),
            isMonitoring,
        });
    }

    /** Applies auto-start rules for a site that has newly loaded monitors. */
    private async autoStartMonitoringIfAppropriate(site: Site): Promise<void> {
        await autoStartMonitoringIfAppropriateOperation({
            logger,
            site,
            startMonitoringForSite: (siteIdentifier, monitorId) =>
                this.startMonitoringForSite(siteIdentifier, monitorId),
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
    private async stopAllMonitoringEnhanced(
        config: EnhancedLifecycleConfig
    ): Promise<MonitoringStopSummary> {
        return stopAllMonitoringEnhancedFlow({
            config,
            host: this.createEnhancedLifecycleHost(),
        });
    }

    /** Auto-starts eligible monitors that have just been added to a site. */
    private async autoStartNewMonitors(
        site: Site,
        newMonitors: Site["monitors"]
    ): Promise<void> {
        await autoStartNewMonitorsOperation({
            logger,
            newMonitors,
            siteIdentifier: site.identifier,
            startMonitoringForSite: (siteIdentifier, monitorId) =>
                this.startMonitoringForSite(siteIdentifier, monitorId),
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
    private async startMonitoringForSiteEnhanced(
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
        monitorId: string,
        signal: AbortSignal
    ): Promise<void> {
        await handleScheduledCheckOperation({
            checker: this.enhancedMonitoringServices.checker,
            logger,
            monitorId,
            signal,
            siteIdentifier,
            sitesCache: this.dependencies.getSitesCache(),
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
    private async stopMonitoringForSiteEnhanced(
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

    /** Applies default intervals and optional auto-start for new monitors. */
    private async setupIndividualNewMonitors(
        site: Site,
        newMonitors: Site["monitors"]
    ): Promise<void> {
        await setupIndividualNewMonitorsOperation({
            autoStartNewMonitors: (siteArg, newMonitorsArg) =>
                this.autoStartNewMonitors(siteArg, newMonitorsArg),
            defaultCheckIntervalMs: DEFAULT_CHECK_INTERVAL,
            newMonitors,
            shouldApplyDefaultInterval: (monitor) =>
                this.shouldApplyDefaultInterval(monitor),
            site,
        });
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
        await applyMonitorStateOperation({
            changes,
            dependencies: {
                databaseService: this.dependencies.databaseService,
                eventEmitter: this.eventEmitter,
                monitorRepository: this.dependencies.repositories.monitor,
                sitesCache: this.dependencies.getSitesCache(),
            },
            monitor,
            newStatus,
            site,
        });
    }

    /**
     * Builds the enhanced lifecycle configuration used by monitoring helpers.
     *
     * @returns Immutable configuration snapshot for lifecycle flows.
     */
    private createEnhancedLifecycleConfig(): EnhancedLifecycleConfig {
        return createEnhancedLifecycleConfigOperation({
            databaseService: this.dependencies.databaseService,
            eventEmitter: this.eventEmitter,
            logger,
            monitorRepository: this.dependencies.repositories.monitor,
            monitorScheduler: this.monitorScheduler,
            sites: this.dependencies.getSitesCache(),
        });
    }

    /**
     * Builds the lifecycle context consumed by enhanced monitoring helpers.
     *
     * @returns Bound callbacks and services required for helper execution.
     */
    private createEnhancedLifecycleHost(): EnhancedLifecycleHost {
        return createEnhancedLifecycleHostOperation({
            applyMonitorState: this.applyMonitorState.bind(this),
            runSequentially: this.runSequentially.bind(this),
            services: this.enhancedMonitoringServices,
        });
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
        this.monitorScheduler = new MonitorScheduler(logger, this.eventEmitter);
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
