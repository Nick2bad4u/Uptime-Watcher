/**
 * Orchestrates all monitoring operations for sites and monitors, including
 * scheduling, status checking, and lifecycle management across the Electron
 * backend.
 *
 * @remarks
 * Coordinates monitor lifecycle, scheduling, and event-driven updates for sites
 * and monitors. All backend monitoring logic flows through this manager.
 * Interacts with repositories, event bus, and service layer according to the
 * repository and event-driven patterns.
 *
 * Key responsibilities:
 *
 * - Monitor lifecycle management (create, start, stop, delete)
 * - Scheduled monitoring with configurable intervals
 * - Status checking and health monitoring for sites
 * - Event emission for monitor state changes and status updates
 * - Cache coordination for real-time monitor data access
 * - Integration with enhanced monitoring services
 * - Error handling and recovery for failed monitoring operations
 * - Transaction management for monitor database operations
 *
 * @example Basic monitor operations:
 *
 * ```typescript
 * const monitorManager = new MonitorManager({
 *     eventBus,
 *     siteRepository,
 *     monitorRepository,
 *     historyRepository,
 *     databaseService,
 *     cache,
 * });
 *
 * // Start monitoring for a site
 * const monitor = await monitorManager.startMonitoring(siteId);
 *
 * // Check status manually
 * const status = await monitorManager.checkSiteStatus(siteId);
 * ```
 *
 * @example Event-driven monitoring:
 *
 * ```typescript
 * // Listen for status updates
 * eventBus.onTyped("monitor:statusUpdated", (data) => {
 *     console.log(`Site ${data.siteId} status: ${data.status}`);
 * });
 *
 * // Monitor will emit events automatically
 * await monitorManager.startMonitoring(siteId);
 * ```
 *
 * @packageDocumentation
 *
 * @public
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { shouldRemediateMonitorInterval } from "@shared/constants/monitoring";
import { MONITOR_STATUS } from "@shared/types";
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
import type { SiteService } from "../services/site/SiteService";
import type { StandardizedCache } from "../utils/cache/StandardizedCache";

import { DEFAULT_CHECK_INTERVAL } from "../constants";
import { isDev } from "../electronUtils";
import { MonitorScheduler } from "../services/monitoring/MonitorScheduler";
import { logger } from "../utils/logger";
import { withDatabaseOperation } from "../utils/operationalHooks";

/**
 * Defines the dependencies required by {@link MonitorManager} for orchestration
 * and data access.
 *
 * @remarks
 * All dependencies are injected to support testability and separation of
 * concerns. This interface is used for dependency injection in the
 * {@link MonitorManager} constructor.
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
    /**
     * Service for site-level business logic.
     *
     * @remarks
     * Used for site-related business operations and orchestration.
     */
    siteService: SiteService;
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
    /**
     * Injected dependencies for orchestration and data access.
     *
     * @readonly
     *
     * @public
     */
    private readonly dependencies: MonitorManagerDependencies;

    /**
     * Enhanced monitoring services for race condition prevention.
     *
     * @remarks
     * Provides operation correlation and state-aware monitoring operations.
     *
     * @readonly
     */
    private readonly enhancedMonitoringServices!: EnhancedMonitoringServices;

    /**
     * Event bus for monitor events.
     *
     * @readonly
     *
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
     *
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
     *
     * @public
     */
    private readonly monitorScheduler: MonitorScheduler;

    /**
     * Manually checks a site or monitor and returns the resulting status
     * update.
     *
     * @remarks
     * Triggers a manual check for a site or monitor, emits a completion event,
     * and returns the result. Uses the repository and event-driven patterns for
     * all operations.
     *
     * @example
     *
     * ```ts
     * const update = await manager.checkSiteManually(
     *     "site-123",
     *     "monitor-456"
     * );
     * ```
     *
     * @param identifier - The site identifier to check.
     * @param monitorId - Optional monitor ID for targeted check.
     *
     * @returns The {@link StatusUpdate} for the site or monitor, or `undefined`
     *   if not found.
     *
     * @throws Any error encountered during the check is logged and re-thrown.
     *
     * @public
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
     * Sets up new monitors that were added to an existing site.
     *
     * @remarks
     * Ensures new monitors receive the same initialization as those in new
     * sites, including default interval assignment and auto-start logic.
     *
     * @example
     *
     * ```ts
     * await manager.setupNewMonitors(siteObj, ["monitor-1", "monitor-2"]);
     * ```
     *
     * @param site - The {@link Site} containing the new monitors.
     * @param newMonitorIds - Array of new monitor IDs to set up.
     *
     * @returns A promise that resolves when setup is complete.
     *
     * @throws Any error encountered during setup is logged and re-thrown.
     *
     * @public
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
     * Sets up a new site for monitoring, including initial checks, interval
     * assignment, and auto-start logic.
     *
     * @remarks
     * Applies business rules for default intervals and auto-starting
     * monitoring. Initial checks are handled by {@link MonitorScheduler} when
     * monitoring starts.
     *
     * @example
     *
     * ```ts
     * await manager.setupSiteForMonitoring(siteObj);
     * ```
     *
     * @param site - The {@link Site} to set up for monitoring.
     *
     * @returns A promise that resolves when setup is complete.
     *
     * @throws Any error encountered during setup is logged and re-thrown.
     *
     * @public
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
     * Starts monitoring for all sites.
     *
     * @remarks
     * Initiates monitoring for all sites and emits a monitoring started event.
     * Uses the repository and event-driven patterns for all operations.
     *
     * @example
     *
     * ```ts
     * await manager.startMonitoring();
     * ```
     *
     * @returns A promise that resolves when monitoring has started.
     *
     * @throws Any error encountered during start is logged and re-thrown.
     *
     * @public
     */
    public async startMonitoring(): Promise<void> {
        this.isMonitoring = await this.startAllMonitoringEnhanced(
            {
                databaseService: this.dependencies.databaseService,
                eventEmitter: this.eventEmitter,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                monitorScheduler: this.monitorScheduler,
                sites: this.dependencies.getSitesCache(),
                siteService: this.dependencies.siteService,
            },
            this.isMonitoring
        );

        // Emit typed monitoring started event
        const sitesCache = this.dependencies.getSitesCache();
        const sites = sitesCache.getAll();
        await this.eventEmitter.emitTyped("monitoring:started", {
            monitorCount: sites.reduce(
                (total, site) => total + site.monitors.length,
                0
            ),
            siteCount: sites.length,
            timestamp: Date.now(),
        });
    }

    /**
     * Starts monitoring for a specific site or monitor.
     *
     * @remarks
     * Initiates monitoring for a site or monitor and emits a started event.
     * Handles recursive calls to avoid infinite loops.
     *
     * @example
     *
     * ```ts
     * const started = await manager.startMonitoringForSite(
     *     "site-123",
     *     "monitor-456"
     * );
     * ```
     *
     * @param identifier - The site identifier to start monitoring for.
     * @param monitorId - Optional monitor ID for targeted monitoring.
     *
     * @returns `true` if monitoring started successfully, `false` otherwise.
     *
     * @throws Any error encountered during start is logged and re-thrown.
     *
     * @public
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
                siteService: this.dependencies.siteService,
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
     * Stops monitoring for all sites.
     *
     * @remarks
     * Stops all monitoring and emits a monitoring stopped event. Uses the
     * repository and event-driven patterns for all operations.
     *
     * @example
     *
     * ```ts
     * await manager.stopMonitoring();
     * ```
     *
     * @returns A promise that resolves when monitoring has stopped.
     *
     * @throws Any error encountered during stop is logged and re-thrown.
     *
     * @public
     */
    public async stopMonitoring(): Promise<void> {
        // Use enhanced monitoring lifecycle which handles operation cleanup
        this.isMonitoring = await this.stopAllMonitoringEnhanced({
            databaseService: this.dependencies.databaseService,
            eventEmitter: this.eventEmitter,
            logger,
            monitorRepository: this.dependencies.repositories.monitor,
            monitorScheduler: this.monitorScheduler,
            sites: this.dependencies.getSitesCache(),
            siteService: this.dependencies.siteService,
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
     * Stops monitoring for a site or monitor and emits a stopped event. Handles
     * recursive calls to avoid infinite loops.
     *
     * @example
     *
     * ```ts
     * const stopped = await manager.stopMonitoringForSite(
     *     "site-123",
     *     "monitor-456"
     * );
     * ```
     *
     * @param identifier - The site identifier to stop monitoring for.
     * @param monitorId - Optional monitor ID for targeted stop.
     *
     * @returns `true` if monitoring stopped successfully, `false` otherwise.
     *
     * @throws Any error encountered during stop is logged and re-thrown.
     *
     * @public
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
                siteService: this.dependencies.siteService,
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
     * Enhanced start all monitoring - replaces legacy startAllMonitoring
     * function.
     *
     * @param config - Configuration object with required dependencies
     * @param isMonitoring - Current monitoring state
     *
     * @returns Promise<boolean> - New monitoring state
     *
     * @internal
     */
    private async startAllMonitoringEnhanced(
        config: {
            databaseService: DatabaseService;
            eventEmitter: TypedEventBus<UptimeEvents>;
            logger: Logger;
            monitorRepository: MonitorRepository;
            monitorScheduler: MonitorScheduler;
            sites: StandardizedCache<Site>;
            siteService?: {
                findByIdentifierWithDetails: (
                    identifier: string
                ) => Promise<Site | undefined>;
            };
        },
        isMonitoring: boolean
    ): Promise<boolean> {
        if (isMonitoring) {
            config.logger.debug("Monitoring already running");
            return isMonitoring;
        }

        config.logger.info(
            `Starting monitoring with ${config.sites.size} sites (enhanced system)`
        );

        const sites = config.sites.getAll();

        for (const site of sites) {
            try {
                const monitorsToStart = site.monitors.filter(
                    (monitor): monitor is Monitor & { id: string } =>
                        Boolean(monitor.id && monitor.checkInterval)
                );

                /* eslint-disable no-await-in-loop -- Sequential processing prevents overlapping SQLite transactions */
                for (const monitor of monitorsToStart) {
                    const started =
                        await this.enhancedMonitoringServices.checker.startMonitoring(
                            site.identifier,
                            monitor.id
                        );

                    if (started) {
                        await this.applyMonitorState(
                            site,
                            monitor,
                            {
                                activeOperations: [],
                                monitoring: true,
                                status: MONITOR_STATUS.PENDING,
                            },
                            MONITOR_STATUS.PENDING
                        );
                    }
                }
                /* eslint-enable no-await-in-loop -- Restore default await-in-loop enforcement */

                config.monitorScheduler.startSite(site);
            } catch (error) {
                config.logger.error(
                    `Failed to start monitoring for site ${site.identifier}`,
                    error
                );
            }
        }

        config.logger.info("Started all monitoring operations (enhanced)");
        return true;
    }

    /**
     * Enhanced stop all monitoring - replaces legacy stopAllMonitoring
     * function.
     *
     * @param config - Configuration object with required dependencies
     *
     * @returns Promise<boolean> - Always false (monitoring stopped)
     *
     * @internal
     */
    private async stopAllMonitoringEnhanced(config: {
        databaseService: DatabaseService;
        eventEmitter: TypedEventBus<UptimeEvents>;
        logger: Logger;
        monitorRepository: MonitorRepository;
        monitorScheduler: MonitorScheduler;
        sites: StandardizedCache<Site>;
        siteService?: {
            findByIdentifierWithDetails: (
                identifier: string
            ) => Promise<Site | undefined>;
        };
    }): Promise<boolean> {
        config.logger.info(
            "Stopping all monitoring operations (enhanced system)"
        );

        const sites = config.sites.getAll();

        for (const site of sites) {
            try {
                const monitorsToStop = site.monitors.filter(
                    (monitor): monitor is Monitor & { id: string } =>
                        Boolean(monitor.id && monitor.monitoring)
                );

                // Process sequentially to avoid overlapping SQLite transactions
                /* eslint-disable no-await-in-loop -- Sequential processing prevents overlapping SQLite transactions */
                for (const monitor of monitorsToStop) {
                    const stopped =
                        await this.enhancedMonitoringServices.checker.stopMonitoring(
                            site.identifier,
                            monitor.id
                        );

                    if (stopped) {
                        await this.applyMonitorState(
                            site,
                            monitor,
                            {
                                activeOperations: [],
                                monitoring: false,
                                status: MONITOR_STATUS.PAUSED,
                            },
                            MONITOR_STATUS.PAUSED
                        );
                    }
                }
                /* eslint-enable no-await-in-loop -- Restore default await-in-loop enforcement */
            } catch (error) {
                config.logger.error(
                    `Failed to stop monitoring for site ${site.identifier}`,
                    error
                );
            }
        }

        // Stop all scheduled operations after state updates are complete
        config.monitorScheduler.stopAll();

        config.logger.info("Stopped all monitoring operations (enhanced)");
        return false;
    }

    /**
     * Enhanced start monitoring for site - replaces legacy
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
        config: {
            databaseService: DatabaseService;
            eventEmitter: TypedEventBus<UptimeEvents>;
            logger: Logger;
            monitorRepository: MonitorRepository;
            monitorScheduler: MonitorScheduler;
            sites: StandardizedCache<Site>;
            siteService?: {
                findByIdentifierWithDetails: (
                    identifier: string
                ) => Promise<Site | undefined>;
            };
        },
        identifier: string,
        monitorId?: string,
        monitorAction?: (
            identifier: string,
            monitorId?: string
        ) => Promise<boolean>
    ): Promise<boolean> {
        const site = config.sites.get(identifier);
        if (!site) {
            config.logger.warn(`Site not found: ${identifier}`);
            return false;
        }

        if (monitorId) {
            // Start specific monitor
            const monitor = site.monitors.find((m) => m.id === monitorId);
            if (!monitor?.id) {
                config.logger.warn(
                    `Monitor ${monitorId} not found in site ${identifier}`
                );
                return false;
            }

            if (!monitor.checkInterval) {
                config.logger.warn(
                    `Monitor ${identifier}:${monitorId} has no valid check interval set`
                );
                return false;
            }

            try {
                const result =
                    await this.enhancedMonitoringServices.checker.startMonitoring(
                        identifier,
                        monitorId
                    );

                if (result) {
                    await this.applyMonitorState(
                        site,
                        monitor,
                        {
                            activeOperations: [],
                            monitoring: true,
                            status: MONITOR_STATUS.PENDING,
                        },
                        MONITOR_STATUS.PENDING
                    );

                    config.logger.debug(
                        `Started monitoring for ${identifier}:${monitorId} (enhanced)`
                    );
                    return config.monitorScheduler.startMonitor(
                        identifier,
                        monitor
                    );
                }
                return false;
            } catch (error) {
                config.logger.error(
                    `Enhanced start failed for ${identifier}:${monitorId}`,
                    error
                );
                return false;
            }
        }

        // Start all monitors in site sequentially - succeed if any monitor starts
        const validMonitors = site.monitors.filter(
            (monitor): monitor is Monitor & { id: string } =>
                Boolean(monitor.id)
        );

        let hasSuccessfulStart = false;

        /* eslint-disable no-await-in-loop -- Sequential recursion maintains deterministic monitor start ordering */
        for (const monitor of validMonitors) {
            try {
                const result = monitorAction
                    ? await monitorAction(identifier, monitor.id)
                    : await this.startMonitoringForSiteEnhanced(
                          config,
                          identifier,
                          monitor.id
                      );

                if (result) {
                    hasSuccessfulStart = true;
                }
            } catch (error) {
                config.logger.error(
                    `Enhanced start failed for ${identifier}:${monitor.id}`,
                    error
                );
            }
        }

        /* eslint-enable no-await-in-loop -- Restore default await-in-loop enforcement */

        return hasSuccessfulStart;
    }

    /**
     * Enhanced stop monitoring for site - replaces legacy stopMonitoringForSite
     * function.
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
        config: {
            databaseService: DatabaseService;
            eventEmitter: TypedEventBus<UptimeEvents>;
            logger: Logger;
            monitorRepository: MonitorRepository;
            monitorScheduler: MonitorScheduler;
            sites: StandardizedCache<Site>;
            siteService?: {
                findByIdentifierWithDetails: (
                    identifier: string
                ) => Promise<Site | undefined>;
            };
        },
        identifier: string,
        monitorId?: string,
        monitorAction?: (
            identifier: string,
            monitorId?: string
        ) => Promise<boolean>
    ): Promise<boolean> {
        const site = config.sites.get(identifier);
        if (!site) {
            config.logger.warn(`Site not found: ${identifier}`);
            return false;
        }

        if (monitorId) {
            // Stop specific monitor
            const monitor = site.monitors.find((m) => m.id === monitorId);
            if (!monitor?.id) {
                config.logger.warn(
                    `Monitor ${monitorId} not found in site ${identifier}`
                );
                return false;
            }

            try {
                const result =
                    await this.enhancedMonitoringServices.checker.stopMonitoring(
                        identifier,
                        monitorId
                    );

                if (result) {
                    await this.applyMonitorState(
                        site,
                        monitor,
                        {
                            activeOperations: [],
                            monitoring: false,
                            status: MONITOR_STATUS.PAUSED,
                        },
                        MONITOR_STATUS.PAUSED
                    );

                    config.logger.debug(
                        `Stopped monitoring for ${identifier}:${monitorId} (enhanced)`
                    );
                    return config.monitorScheduler.stopMonitor(
                        identifier,
                        monitorId
                    );
                }
                return false;
            } catch (error) {
                config.logger.error(
                    `Enhanced stop failed for ${identifier}:${monitorId}`,
                    error
                );
                return false;
            }
        }

        // Stop all monitors in site sequentially - fail if any monitor fails to stop
        const validMonitors = site.monitors.filter(
            (monitor): monitor is Monitor & { id: string } =>
                Boolean(monitor.id && monitor.monitoring)
        );

        let allStoppedSuccessfully = true;

        /* eslint-disable no-await-in-loop -- Sequential recursion ensures monitors stop in a deterministic order */
        for (const monitor of validMonitors) {
            try {
                const result = monitorAction
                    ? await monitorAction(identifier, monitor.id)
                    : await this.stopMonitoringForSiteEnhanced(
                          config,
                          identifier,
                          monitor.id
                      );

                if (!result) {
                    allStoppedSuccessfully = false;
                }
            } catch (error) {
                config.logger.error(
                    `Enhanced stop failed for ${identifier}:${monitor.id}`,
                    error
                );
                allStoppedSuccessfully = false;
            }
        }
        /* eslint-enable no-await-in-loop -- Restore default await-in-loop enforcement */

        return allStoppedSuccessfully;
    }

    /**
     * Applies default check intervals for monitors that do not have one set.
     *
     * @remarks
     * Ensures all monitors have a check interval set according to business
     * rules. Updates the database first, then allows the cache/state to be
     * updated through proper channels.
     *
     * @param site - The {@link Site} whose monitors should be checked for
     *   default interval assignment.
     *
     * @returns A promise that resolves when all applicable monitors have been
     *   updated.
     *
     * @throws Any error encountered during database update is logged and
     *   re-thrown.
     *
     * @internal
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
            async () =>
                this.dependencies.databaseService.executeTransaction((db) => {
                    for (const monitor of monitorsNeedingRemediation) {
                        this.dependencies.repositories.monitor.updateInternal(
                            db,
                            monitor.id,
                            { checkInterval: DEFAULT_CHECK_INTERVAL }
                        );

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

    /**
     * Automatically starts monitoring if appropriate according to business
     * rules.
     *
     * @remarks
     * Site-level monitoring acts as a master switch. Only monitors with
     * monitoring enabled are started.
     *
     * @param site - The {@link Site} to evaluate for auto-start.
     *
     * @returns A promise that resolves when auto-start logic is complete.
     *
     * @internal
     */
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

    /**
     * Auto-starts monitoring for new monitors if appropriate.
     *
     * @remarks
     * Only monitors with monitoring enabled will be auto-started.
     *
     * @param site - The {@link Site} containing the new monitors.
     * @param newMonitors - Array of new monitors to potentially auto-start.
     *
     * @returns A promise that resolves when auto-start logic is complete.
     *
     * @internal
     */
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

    /**
     * Sets up individual new monitors.
     *
     * @remarks
     * New monitors are handled differently as they have not been persisted yet.
     * Default intervals are applied directly to the monitor objects before they
     * are saved to the database. Auto-start logic is also applied if
     * appropriate.
     *
     * @param site - The {@link Site} containing the new monitors.
     * @param newMonitors - Array of new monitors to set up.
     *
     * @returns A promise that resolves when setup is complete.
     *
     * @internal
     */
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
     * Applies monitor state changes to cache, database, and emits
     * status-changed events.
     *
     * @remarks
     * This helper ensures consistency between cache updates, database
     * persistence, and event emission for monitor status changes. Used by
     * enhanced lifecycle methods to maintain parity with legacy monitoring
     * behavior.
     *
     * @param site - Site containing the monitor
     * @param monitor - Monitor to update
     * @param changes - Partial monitor changes to apply
     * @param newStatus - New monitor status for event emission
     *
     * @internal
     */
    private async applyMonitorState(
        site: Site,
        monitor: Monitor,
        changes: Partial<Monitor>,
        newStatus: string
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
                    this.dependencies.repositories.monitor.updateInternal(
                        db,
                        monitor.id,
                        changes
                    );
                    return Promise.resolve();
                }),
            "monitor-manager-apply-state-change",
            this.eventEmitter,
            { changes, monitorId: monitor.id }
        );

        // Emit status-changed event with full payload
        await this.eventEmitter.emitTyped("monitor:status-changed", {
            monitor: monitor,
            monitorId: monitor.id,
            newStatus: newStatus,
            previousStatus: previousStatus,
            responseTime: monitor.responseTime,
            site: site,
            siteId: site.identifier,
            timestamp: Date.now(),
        });
    }

    /**
     * Constructs a new {@link MonitorManager} instance with enhanced monitoring
     * capabilities.
     *
     * @remarks
     * All dependencies are injected to support testability and separation of
     * concerns. The enhanced monitoring services are required and provide race
     * condition prevention, operation correlation, and advanced timeout
     * management for all monitoring operations.
     *
     * **Architecture Integration:**
     *
     * - Enhanced services are always provided by the ServiceContainer
     * - No fallback to legacy monitoring systems
     * - All monitoring operations use the unified enhanced system
     * - Operation correlation prevents race conditions across concurrent
     *   operations
     *
     * @example Basic Construction
     *
     * ```typescript
     * const manager = new MonitorManager(dependencies, enhancedServices);
     * ```
     *
     * @example Via ServiceContainer (Recommended)
     *
     * ```typescript
     * const container = ServiceContainer.getInstance();
     * const manager = container.getMonitorManager();
     * // Enhanced services are automatically provided
     * ```
     *
     * @param dependencies - The required {@link MonitorManagerDependencies} for
     *   orchestration and data access
     * @param enhancedServices - The required {@link EnhancedMonitoringServices}
     *   for advanced monitoring capabilities
     *
     * @public
     *
     * @see {@link EnhancedMonitoringServices} for enhanced monitoring capabilities
     * @see {@link ServiceContainer} for dependency injection and service creation
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

    /**
     * Gets the count of active monitors currently being scheduled.
     *
     * @remarks
     * Returns the number of monitors that are currently scheduled for periodic
     * checks.
     *
     * @example
     *
     * ```ts
     * const count = manager.getActiveMonitorCount();
     * ```
     *
     * @returns The number of active monitors in the scheduler.
     *
     * @public
     */
    public getActiveMonitorCount(): number {
        return this.monitorScheduler.getActiveCount();
    }

    /**
     * Checks if a specific monitor is actively being scheduled for checks.
     *
     * @remarks
     * Returns whether the given monitor is currently scheduled for periodic
     * checks by the scheduler.
     *
     * @example
     *
     * ```ts
     * const isActive = manager.isMonitorActiveInScheduler(
     *     "site-123",
     *     "monitor-456"
     * );
     * ```
     *
     * @param siteIdentifier - The identifier of the site.
     * @param monitorId - The monitor ID to check.
     *
     * @returns `true` if the monitor is active in the scheduler, `false`
     *   otherwise.
     *
     * @public
     */
    public isMonitorActiveInScheduler(
        siteIdentifier: string,
        monitorId: string
    ): boolean {
        return this.monitorScheduler.isMonitoring(siteIdentifier, monitorId);
    }

    /**
     * Indicates whether monitoring is currently active for any site or monitor.
     *
     * @remarks
     * Returns the global monitoring state.
     *
     * @returns `true` if monitoring is active, `false` otherwise.
     *
     * @public
     */
    public isMonitoringActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * Restarts monitoring for a specific monitor with updated configuration.
     *
     * @remarks
     * Useful when monitor intervals or settings change and need immediate
     * application. Delegates to the {@link MonitorScheduler} for actual restart
     * logic.
     *
     * @example
     *
     * ```ts
     * const success = manager.restartMonitorWithNewConfig(
     *     "site-123",
     *     monitorObj
     * );
     * ```
     *
     * @param siteIdentifier - The identifier of the site containing the
     *   monitor.
     * @param monitor - The monitor object with updated configuration.
     *
     * @returns `true` if the monitor was successfully restarted, `false`
     *   otherwise.
     *
     * @public
     */
    public restartMonitorWithNewConfig(
        siteIdentifier: string,
        monitor: Site["monitors"][0]
    ): boolean {
        return this.monitorScheduler.restartMonitor(siteIdentifier, monitor);
    }

    /**
     * Determines if a monitor should receive a default interval.
     *
     * @remarks
     * Checks for falsy `checkInterval` values. Zero is considered a valid
     * interval and will not trigger default assignment. The type system
     * guarantees `checkInterval` is a number, but runtime values may still be
     * falsy due to initialization or data import scenarios.
     *
     * @param monitor - The monitor to check for default interval application.
     *
     * @returns `true` if the monitor should receive the default interval,
     *   `false` otherwise.
     *
     * @internal
     */
    private shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return shouldRemediateMonitorInterval(monitor.checkInterval);
    }
}
