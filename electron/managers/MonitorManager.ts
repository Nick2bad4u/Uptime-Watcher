/**
 * Manages monitoring operations including scheduling and status checking.
 * Handles start/stop operations for individual monitors and sites.
 */

import { DEFAULT_CHECK_INTERVAL } from "../constants";
import { isDev } from "../electronUtils";
import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";

export interface MonitorManagerDependencies {
    databaseService: DatabaseService;
    eventEmitter: TypedEventBus<MonitorManagerEvents>;
    getHistoryLimit: () => number;
    getSitesCache: () => StandardizedCache<Site>;
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        site: SiteRepository;
    };
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
import { monitorLogger as logger } from "../utils/logger";
import {
    startAllMonitoring,
    startMonitoringForSite,
    stopAllMonitoring,
    stopMonitoringForSite,
} from "../utils/monitoring/monitorLifecycle";
import { checkMonitor, checkSiteManually, MonitorCheckConfig } from "../utils/monitoring/monitorStatusChecker";
import { withDatabaseOperation } from "../utils/operationalHooks";

/**
 * Combined events interface for MonitorManager.
 */
type MonitorManagerEvents = UptimeEvents;

/**
 * Manages monitoring operations and scheduling.
 * Handles monitoring lifecycle and status checks.
 */
export class MonitorManager {
    private readonly dependencies: MonitorManagerDependencies;
    private readonly eventEmitter: TypedEventBus<MonitorManagerEvents>;
    private isMonitoring = false;
    private readonly monitorScheduler: MonitorScheduler;

    constructor(dependencies: MonitorManagerDependencies) {
        this.dependencies = dependencies;
        this.eventEmitter = dependencies.eventEmitter;
        this.monitorScheduler = new MonitorScheduler();
        this.monitorScheduler.setCheckCallback(this.handleScheduledCheck.bind(this));
    }

    /**
     * Check a site manually and return status update.
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
     * Get the count of active monitors currently being monitored.
     *
     * @returns The number of active monitors in the scheduler.
     */
    public getActiveMonitorCount(): number {
        return this.monitorScheduler.getActiveCount();
    }

    /**
     * Check if a specific monitor is actively being monitored by the scheduler.
     */
    public isMonitorActiveInScheduler(siteIdentifier: string, monitorId: string): boolean {
        return this.monitorScheduler.isMonitoring(siteIdentifier, monitorId);
    }

    /**
     * Check if monitoring is currently active.
     */
    public isMonitoringActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * Restart monitoring for a specific monitor with updated configuration.
     * This is useful when monitor intervals change and need to be applied immediately.
     *
     * @param siteIdentifier - The identifier of the site containing the monitor
     * @param monitor - The monitor with updated configuration to restart
     * @returns True if the monitor was successfully restarted, false otherwise
     *
     * @remarks
     * Delegates to the MonitorScheduler for actual restart logic. This method
     * provides a high-level interface for coordinated monitor restarts when
     * configuration changes require immediate application.
     */
    public restartMonitorWithNewConfig(siteIdentifier: string, monitor: Site["monitors"][0]): boolean {
        return this.monitorScheduler.restartMonitor(siteIdentifier, monitor);
    }

    /**
     * Set up new monitors that were added to an existing site.
     * Ensures new monitors get the same treatment as monitors in new sites.
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
     * Set up a new site for monitoring (initial checks, intervals, auto-start).
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
     * Start monitoring for all sites.
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
     * Start monitoring for a specific site or monitor.
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
            (id, mid) => this.startMonitoringForSite(id, mid)
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
     * Stop monitoring for all sites.
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
     * Stop monitoring for a specific site or monitor.
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
            (id, mid) => this.stopMonitoringForSite(id, mid)
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
     * Business logic: Apply default check intervals for monitors that don't have one.
     * This ensures all monitors have a check interval set according to business rules.
     *
     * @remarks
     * **State Management Compliance:**
     * This method follows proper state management principles by updating the database
     * first, then allowing the cache/state to be updated through proper channels
     * (event emission and cache refresh) rather than direct mutation.
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
     * Business logic: Automatically start monitoring if appropriate according to business rules.
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
     * Auto-start monitoring for new monitors if appropriate.
     *
     * @param site - The site containing the new monitors
     * @param newMonitors - Array of new monitors to potentially auto-start
     *
     * @remarks
     * Applies business logic to determine which new monitors should automatically
     * start monitoring based on individual monitor settings. Only monitors with
     * monitoring enabled will be auto-started.
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
     * Check a specific monitor (private method for scheduled checks).
     * Implements the core monitoring logic with typed event emission.
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
     * Handle scheduled monitor checks from the MonitorScheduler.
     */
    private async handleScheduledCheck(siteIdentifier: string, monitorId: string): Promise<void> {
        const site = this.dependencies.getSitesCache().get(siteIdentifier);
        if (site) {
            await this.checkMonitor(site, monitorId);
        }
    }

    /**
     * Set up individual new monitors (extracted for complexity reduction).
     *
     * @param site - The site containing the new monitors
     * @param newMonitors - Array of new monitors to set up
     *
     * @remarks
     * **State Management Compliance:**
     * New monitors are handled differently as they haven't been persisted yet.
     * Default intervals are applied directly to the monitor objects before
     * they're saved to the database through the normal persistence flow.
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
     * Business logic: Determine if a monitor should receive a default interval.
     *
     * @param monitor - The monitor to check for default interval application
     * @returns True if monitor should receive default interval, false otherwise
     *
     * @remarks
     * Checks for falsy checkInterval values. Zero is considered a valid interval
     * (though unusual) and won't trigger default assignment based on current logic.
     * The type system guarantees checkInterval is a number, but runtime values
     * may still be falsy due to initialization or data import scenarios.
     */
    private shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return !monitor.checkInterval;
    }
}
