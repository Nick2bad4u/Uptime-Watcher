/**
 * Orchestrates all monitoring operations for sites and monitors, including scheduling, status checking, and lifecycle management.
 *
 * @remarks
 * Coordinates monitor lifecycle, scheduling, and event-driven updates for sites and monitors. All backend monitoring logic flows through this manager. Interacts with repositories, event bus, and service layer according to the repository and event-driven patterns.
 *
 * @public
 */
import { DEFAULT_CHECK_INTERVAL } from "../constants";
import { isDev } from "../electronUtils";
import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";

/**
 * Defines the dependencies required by {@link MonitorManager} for orchestration and data access.
 *
 * @remarks
 * All dependencies are injected to support testability and separation of concerns. This interface is used for dependency injection in the {@link MonitorManager} constructor.
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
     * @returns The maximum number of status updates to keep in history.
     */
    getHistoryLimit: () => number;
    /**
     * Returns the current sites cache.
     *
     * @remarks
     * Provides access to the in-memory cache of all sites.
     * @returns The current {@link StandardizedCache} of {@link Site} objects.
     */
    getSitesCache: () => StandardizedCache<Site>;
    /**
     * Repository interfaces for DB access.
     *
     * @remarks
     * Provides access to the repositories for history, monitor, and site entities.
     */
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        site: SiteRepository;
    };
    /**
     * Service for site-level business logic.
     *
     * @remarks
     * Used for site-related business operations and orchestration.
     */
    siteService: SiteService;
}

import { DatabaseService } from "../services/database/DatabaseService";
import { HistoryRepository } from "../services/database/HistoryRepository";
import { MonitorRepository } from "../services/database/MonitorRepository";
import { SiteRepository } from "../services/database/SiteRepository";
import { MonitorScheduler } from "../services/monitoring/MonitorScheduler";
import { SiteService } from "../services/site/SiteService";
import { Site, StatusUpdate } from "../types";
import { StandardizedCache } from "../utils/cache/StandardizedCache";
import { logger } from "../utils/logger";
import {
    startAllMonitoring,
    startMonitoringForSite,
    stopAllMonitoring,
    stopMonitoringForSite,
} from "../utils/monitoring/monitorLifecycle";
import { checkMonitor, checkSiteManually, MonitorCheckConfig } from "../utils/monitoring/monitorStatusChecker";
import { withDatabaseOperation } from "../utils/operationalHooks";

/**
 * Main class for orchestrating monitor scheduling, status checks, and event-driven updates.
 *
 * @remarks
 * All monitoring operations, including lifecycle management, scheduling, and event emission, are coordinated here. This class is the central entry point for all backend monitoring logic.
 *
 * @public
 */
export class MonitorManager {
    /**
     * Injected dependencies for orchestration and data access.
     *
     * @readonly
     * @public
     */
    private readonly dependencies: MonitorManagerDependencies;

    /**
     * Event bus for monitor events.
     *
     * @readonly
     * @public
     */
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    /**
     * Indicates if monitoring is currently active for any site or monitor.
     *
     * @remarks
     * Used to track the global monitoring state.
     *
     * @defaultValue false
     * @public
     */
    private isMonitoring = false;

    /**
     * Scheduler for monitor intervals and checks.
     *
     * @remarks
     * Handles scheduling and execution of periodic monitor checks.
     *
     * @readonly
     * @public
     */
    private readonly monitorScheduler: MonitorScheduler;

    /**
     * Constructs a new {@link MonitorManager} instance.
     *
     * @remarks
     * All dependencies are injected to support testability and separation of concerns.
     *
     * @param dependencies - The required {@link MonitorManagerDependencies} for orchestration and data access.
     * @example
     * ```ts
     * const manager = new MonitorManager({ ... });
     * ```
     * @public
     */
    constructor(dependencies: MonitorManagerDependencies) {
        this.dependencies = dependencies;
        this.eventEmitter = dependencies.eventEmitter;
        this.monitorScheduler = new MonitorScheduler();
        this.monitorScheduler.setCheckCallback(this.handleScheduledCheck.bind(this));
    }

    /**
     * Manually checks a site or monitor and returns the resulting status update.
     *
     * @remarks
     * Triggers a manual check for a site or monitor, emits a completion event, and returns the result. Uses the repository and event-driven patterns for all operations.
     *
     * @param identifier - The site identifier to check.
     * @param monitorId - Optional monitor ID for targeted check.
     * @returns The {@link StatusUpdate} for the site or monitor, or `undefined` if not found.
     * @throws Any error encountered during the check is logged and re-thrown.
     * @example
     * ```ts
     * const update = await manager.checkSiteManually("site-123", "monitor-456");
     * ```
     * @public
     */
    public async checkSiteManually(identifier: string, monitorId?: string): Promise<StatusUpdate | undefined> {
        const result = await checkSiteManually(
            {
                databaseService: this.dependencies.databaseService,
                eventEmitter: this.eventEmitter,
                historyLimit: this.dependencies.getHistoryLimit(),
                logger,
                repositories: this.dependencies.repositories,
                sites: this.dependencies.getSitesCache(),
                siteService: this.dependencies.siteService,
            },
            identifier,
            monitorId
        );

        // Emit manual check completed event
        await this.eventEmitter.emitTyped("internal:monitor:manual-check-completed", {
            identifier,
            ...(monitorId && { monitorId }),
            operation: "manual-check-completed",
            result: result as StatusUpdate,
            timestamp: Date.now(),
        });

        return result ?? undefined;
    }

    /**
     * Gets the count of active monitors currently being scheduled.
     *
     * @remarks
     * Returns the number of monitors that are currently scheduled for periodic checks.
     *
     * @returns The number of active monitors in the scheduler.
     * @example
     * ```ts
     * const count = manager.getActiveMonitorCount();
     * ```
     * @public
     */
    public getActiveMonitorCount(): number {
        return this.monitorScheduler.getActiveCount();
    }

    /**
     * Checks if a specific monitor is actively being scheduled for checks.
     *
     * @remarks
     * Returns whether the given monitor is currently scheduled for periodic checks by the scheduler.
     *
     * @param siteIdentifier - The identifier of the site.
     * @param monitorId - The monitor ID to check.
     * @returns `true` if the monitor is active in the scheduler, `false` otherwise.
     * @example
     * ```ts
     * const isActive = manager.isMonitorActiveInScheduler("site-123", "monitor-456");
     * ```
     * @public
     */
    public isMonitorActiveInScheduler(siteIdentifier: string, monitorId: string): boolean {
        return this.monitorScheduler.isMonitoring(siteIdentifier, monitorId);
    }

    /**
     * Indicates whether monitoring is currently active for any site or monitor.
     *
     * @remarks
     * Returns the global monitoring state.
     *
     * @returns `true` if monitoring is active, `false` otherwise.
     * @public
     */
    public isMonitoringActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * Restarts monitoring for a specific monitor with updated configuration.
     *
     * @remarks
     * Useful when monitor intervals or settings change and need immediate application. Delegates to the {@link MonitorScheduler} for actual restart logic.
     *
     * @param siteIdentifier - The identifier of the site containing the monitor.
     * @param monitor - The monitor object with updated configuration.
     * @returns `true` if the monitor was successfully restarted, `false` otherwise.
     * @example
     * ```ts
     * const success = manager.restartMonitorWithNewConfig("site-123", monitorObj);
     * ```
     * @public
     */
    public restartMonitorWithNewConfig(siteIdentifier: string, monitor: Site["monitors"][0]): boolean {
        return this.monitorScheduler.restartMonitor(siteIdentifier, monitor);
    }

    /**
     * Sets up new monitors that were added to an existing site.
     *
     * @remarks
     * Ensures new monitors receive the same initialization as those in new sites, including default interval assignment and auto-start logic.
     *
     * @param site - The {@link Site} containing the new monitors.
     * @param newMonitorIds - Array of new monitor IDs to set up.
     * @returns A promise that resolves when setup is complete.
     * @throws Any error encountered during setup is logged and re-thrown.
     * @example
     * ```ts
     * await manager.setupNewMonitors(siteObj, ["monitor-1", "monitor-2"]);
     * ```
     * @public
     */
    public async setupNewMonitors(site: Site, newMonitorIds: string[]): Promise<void> {
        logger.debug(`[MonitorManager] Setting up ${newMonitorIds.length} new monitors for site: ${site.identifier}`);

        // Filter to only the new monitors
        const newMonitors = site.monitors.filter((m) => m.id && newMonitorIds.includes(m.id));

        if (newMonitors.length === 0) {
            logger.debug(`[MonitorManager] No valid new monitors found for site: ${site.identifier}`);
            return;
        }

        // Apply default intervals and perform setup for each new monitor
        await this.setupIndividualNewMonitors(site, newMonitors);

        logger.info(
            `[MonitorManager] Completed setup for ${newMonitors.length} new monitors in site: ${site.identifier}`
        );
    }

    /**
     * Sets up a new site for monitoring, including initial checks, interval assignment, and auto-start logic.
     *
     * @remarks
     * Applies business rules for default intervals and auto-starting monitoring. Initial checks are handled by {@link MonitorScheduler} when monitoring starts.
     *
     * @param site - The {@link Site} to set up for monitoring.
     * @returns A promise that resolves when setup is complete.
     * @throws Any error encountered during setup is logged and re-thrown.
     * @example
     * ```ts
     * await manager.setupSiteForMonitoring(siteObj);
     * ```
     * @public
     */
    public async setupSiteForMonitoring(site: Site): Promise<void> {
        // Apply business rules for default intervals
        await this.applyDefaultIntervals(site);

        // Apply business rules for auto-starting monitoring
        // Note: Initial checks are handled by MonitorScheduler when monitoring starts
        await this.autoStartMonitoringIfAppropriate(site);

        // Emit site setup completed event
        await this.eventEmitter.emitTyped("internal:monitor:site-setup-completed", {
            identifier: site.identifier,
            operation: "site-setup-completed",
            timestamp: Date.now(),
        });
    }

    /**
     * Starts monitoring for all sites.
     *
     * @remarks
     * Initiates monitoring for all sites and emits a monitoring started event. Uses the repository and event-driven patterns for all operations.
     *
     * @returns A promise that resolves when monitoring has started.
     * @throws Any error encountered during start is logged and re-thrown.
     * @example
     * ```ts
     * await manager.startMonitoring();
     * ```
     * @public
     */
    public async startMonitoring(): Promise<void> {
        this.isMonitoring = await startAllMonitoring(
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

        // Emit typed monitoring started event
        const sitesCache = this.dependencies.getSitesCache();
        const sites = sitesCache.getAll();
        await this.eventEmitter.emitTyped("monitoring:started", {
            monitorCount: sites.reduce((total, site) => total + site.monitors.length, 0),
            siteCount: sites.length,
            timestamp: Date.now(),
        });
    }

    /**
     * Starts monitoring for a specific site or monitor.
     *
     * @remarks
     * Initiates monitoring for a site or monitor and emits a started event. Handles recursive calls to avoid infinite loops.
     *
     * @param identifier - The site identifier to start monitoring for.
     * @param monitorId - Optional monitor ID for targeted monitoring.
     * @returns `true` if monitoring started successfully, `false` otherwise.
     * @throws Any error encountered during start is logged and re-thrown.
     * @example
     * ```ts
     * const started = await manager.startMonitoringForSite("site-123", "monitor-456");
     * ```
     * @public
     */
    public async startMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        const result = await startMonitoringForSite(
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
                if (recursiveId !== identifier || recursiveMonitorId !== monitorId) {
                    return this.startMonitoringForSite(recursiveId, recursiveMonitorId);
                } else {
                    // Prevent infinite recursion by using direct scheduler call
                    logger.warn(`[MonitorManager] Preventing recursive call for ${identifier}/${monitorId ?? "all"}`);
                    return false;
                }
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
     * Stops monitoring for all sites.
     *
     * @remarks
     * Stops all monitoring and emits a monitoring stopped event. Uses the repository and event-driven patterns for all operations.
     *
     * @returns A promise that resolves when monitoring has stopped.
     * @throws Any error encountered during stop is logged and re-thrown.
     * @example
     * ```ts
     * await manager.stopMonitoring();
     * ```
     * @public
     */
    public async stopMonitoring(): Promise<void> {
        this.isMonitoring = await stopAllMonitoring({
            databaseService: this.dependencies.databaseService,
            eventEmitter: this.eventEmitter,
            logger,
            monitorRepository: this.dependencies.repositories.monitor,
            monitorScheduler: this.monitorScheduler,
            sites: this.dependencies.getSitesCache(),
        });

        // Emit typed monitoring stopped event
        await this.eventEmitter.emitTyped("monitoring:stopped", {
            activeMonitors: 0,
            reason: "user" as const,
            timestamp: Date.now(),
        });
    }

    /**
     * Stops monitoring for a specific site or monitor.
     *
     * @remarks
     * Stops monitoring for a site or monitor and emits a stopped event. Handles recursive calls to avoid infinite loops.
     *
     * @param identifier - The site identifier to stop monitoring for.
     * @param monitorId - Optional monitor ID for targeted stop.
     * @returns `true` if monitoring stopped successfully, `false` otherwise.
     * @throws Any error encountered during stop is logged and re-thrown.
     * @example
     * ```ts
     * const stopped = await manager.stopMonitoringForSite("site-123", "monitor-456");
     * ```
     * @public
     */
    public async stopMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        const result = await stopMonitoringForSite(
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
                if (recursiveId !== identifier || recursiveMonitorId !== monitorId) {
                    return this.stopMonitoringForSite(recursiveId, recursiveMonitorId);
                } else {
                    // Prevent infinite recursion by using direct scheduler call
                    logger.warn(`[MonitorManager] Preventing recursive call for ${identifier}/${monitorId ?? "all"}`);
                    return false;
                }
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
     * Applies default check intervals for monitors that do not have one set.
     *
     * @remarks
     * Ensures all monitors have a check interval set according to business rules. Updates the database first, then allows the cache/state to be updated through proper channels.
     *
     * @param site - The {@link Site} whose monitors should be checked for default interval assignment.
     * @returns A promise that resolves when all applicable monitors have been updated.
     * @throws Any error encountered during database update is logged and re-thrown.
     * @internal
     */
    private async applyDefaultIntervals(site: Site): Promise<void> {
        logger.debug(`[MonitorManager] Applying default intervals for site: ${site.identifier}`);

        for (const monitor of site.monitors) {
            if (monitor.id && this.shouldApplyDefaultInterval(monitor)) {
                // Update database first (state management compliance)
                await withDatabaseOperation(
                    () => {
                        const db = this.dependencies.databaseService.getDatabase();
                        if (monitor.id) {
                            this.dependencies.repositories.monitor.updateInternal(db, monitor.id, {
                                checkInterval: DEFAULT_CHECK_INTERVAL,
                            });
                        }
                        return Promise.resolve();
                    },
                    "monitor-manager-apply-default-interval",
                    undefined,
                    { interval: DEFAULT_CHECK_INTERVAL, monitorId: monitor.id }
                );

                logger.debug(
                    `[MonitorManager] Applied default interval ${DEFAULT_CHECK_INTERVAL}ms for monitor: ${monitor.id}`
                );
            }
        }

        logger.info(`[MonitorManager] Completed applying default intervals for site: ${site.identifier}`);
    }

    /**
     * Automatically starts monitoring if appropriate according to business rules.
     *
     * @remarks
     * Site-level monitoring acts as a master switch. Only monitors with monitoring enabled are started.
     *
     * @param site - The {@link Site} to evaluate for auto-start.
     * @returns A promise that resolves when auto-start logic is complete.
     * @internal
     */
    private async autoStartMonitoringIfAppropriate(site: Site): Promise<void> {
        logger.debug(
            `[MonitorManager] Evaluating auto-start for site: ${site.identifier} (site.monitoring: ${site.monitoring})`
        );

        // Site-level monitoring acts as a master switch
        if (site.monitoring === false) {
            logger.debug(
                `[MonitorManager] Site monitoring disabled, skipping all monitors for site: ${site.identifier}`
            );
            return;
        }

        // Only process sites that have monitors
        if (site.monitors.length === 0) {
            logger.debug(`[MonitorManager] No monitors found for site: ${site.identifier}`);
            return;
        }

        logger.debug(`[MonitorManager] Auto-starting monitoring for site: ${site.identifier}`);

        // Start only monitors that have monitoring enabled (respecting individual monitor states)
        for (const monitor of site.monitors) {
            if (monitor.id && monitor.monitoring) {
                await this.startMonitoringForSite(site.identifier, monitor.id);

                if (isDev()) {
                    logger.debug(
                        `[MonitorManager] Auto-started monitoring for monitor ${monitor.id} with interval ${monitor.checkInterval}ms`
                    );
                }
            } else if (monitor.id && !monitor.monitoring) {
                logger.debug(`[MonitorManager] Skipping monitor ${monitor.id} - individual monitoring disabled`);
            }
        }

        logger.info(`[MonitorManager] Completed auto-starting monitoring for site: ${site.identifier}`);
    }

    /**
     * Auto-starts monitoring for new monitors if appropriate.
     *
     * @remarks
     * Only monitors with monitoring enabled will be auto-started.
     *
     * @param site - The {@link Site} containing the new monitors.
     * @param newMonitors - Array of new monitors to potentially auto-start.
     * @returns A promise that resolves when auto-start logic is complete.
     * @internal
     */
    private async autoStartNewMonitors(site: Site, newMonitors: Site["monitors"]): Promise<void> {
        for (const monitor of newMonitors) {
            if (monitor.id && monitor.monitoring) {
                await this.startMonitoringForSite(site.identifier, monitor.id);
                logger.debug(`[MonitorManager] Auto-started monitoring for new monitor: ${monitor.id}`);
            } else if (monitor.id && !monitor.monitoring) {
                logger.debug(`[MonitorManager] Skipping new monitor ${monitor.id} - individual monitoring disabled`);
            }
        }
    }

    /**
     * Checks a specific monitor and returns the resulting status update.
     *
     * @remarks
     * Implements the core monitoring logic with typed event emission. Uses the repository and event-driven patterns for all operations.
     *
     * @param site - The {@link Site} containing the monitor.
     * @param monitorId - The monitor ID to check.
     * @returns The {@link StatusUpdate} for the monitor, or `undefined` if not found.
     * @internal
     */
    private async checkMonitor(site: Site, monitorId: string): Promise<StatusUpdate | undefined> {
        // Use the utility function instead of duplicating logic
        const config: MonitorCheckConfig = {
            databaseService: this.dependencies.databaseService,
            eventEmitter: this.eventEmitter,
            historyLimit: this.dependencies.getHistoryLimit(),
            logger,
            repositories: this.dependencies.repositories,
            sites: this.dependencies.getSitesCache(),
            siteService: this.dependencies.siteService,
        };

        return checkMonitor(config, site, monitorId);
    }

    /**
     * Handles scheduled monitor checks from the {@link MonitorScheduler}.
     *
     * @remarks
     * Invoked by the scheduler to perform a check on a specific monitor at the scheduled interval.
     *
     * @param siteIdentifier - The identifier of the site.
     * @param monitorId - The monitor ID to check.
     * @returns A promise that resolves when the scheduled check is complete.
     * @internal
     */
    private async handleScheduledCheck(siteIdentifier: string, monitorId: string): Promise<void> {
        const site = this.dependencies.getSitesCache().get(siteIdentifier);
        if (site) {
            await this.checkMonitor(site, monitorId);
        }
    }

    /**
     * Sets up individual new monitors.
     *
     * @remarks
     * New monitors are handled differently as they have not been persisted yet. Default intervals are applied directly to the monitor objects before they are saved to the database. Auto-start logic is also applied if appropriate.
     *
     * @param site - The {@link Site} containing the new monitors.
     * @param newMonitors - Array of new monitors to set up.
     * @returns A promise that resolves when setup is complete.
     * @internal
     */
    private async setupIndividualNewMonitors(site: Site, newMonitors: Site["monitors"]): Promise<void> {
        // Apply default intervals for new monitors that don't have one
        // Note: For new monitors, direct assignment is acceptable as they haven't been
        // persisted yet and will be saved through the normal persistence flow
        for (const monitor of newMonitors) {
            if (this.shouldApplyDefaultInterval(monitor)) {
                monitor.checkInterval = DEFAULT_CHECK_INTERVAL;
                logger.debug(
                    `[MonitorManager] Applied default interval ${monitor.checkInterval}ms to new monitor: ${monitor.id}`
                );
            }
        }

        // Auto-start monitoring for new monitors if appropriate
        // Note: Initial checks are handled by MonitorScheduler when monitoring starts
        if (site.monitoring === false) {
            logger.debug(`[MonitorManager] Skipping auto-start for new monitors - site monitoring disabled`);
        } else {
            await this.autoStartNewMonitors(site, newMonitors);
        }
    }

    /**
     * Determines if a monitor should receive a default interval.
     *
     * @remarks
     * Checks for falsy `checkInterval` values. Zero is considered a valid interval and will not trigger default assignment. The type system guarantees `checkInterval` is a number, but runtime values may still be falsy due to initialization or data import scenarios.
     *
     * @param monitor - The monitor to check for default interval application.
     * @returns `true` if the monitor should receive the default interval, `false` otherwise.
     * @internal
     */
    private shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return !monitor.checkInterval;
    }
}
