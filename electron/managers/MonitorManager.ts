/**
 * Manages monitoring operations including scheduling and status checking.
 * Handles start/stop operations for individual monitors and sites.
 */

import { DEFAULT_CHECK_INTERVAL } from "../constants";
import { isDev } from "../electronUtils";
import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";

/**
 * Combined events interface for MonitorManager.
 */
type MonitorManagerEvents = UptimeEvents;

import { MonitorRepository, HistoryRepository, SiteRepository, DatabaseService } from "../services/database";
import { MonitorScheduler } from "../services/monitoring";
import { Site, StatusUpdate } from "../types";
import { monitorLogger as logger } from "../utils/logger";
import {
    performInitialMonitorChecks,
    startAllMonitoring,
    startMonitoringForSite,
    stopAllMonitoring,
    stopMonitoringForSite,
    checkSiteManually,
    checkMonitor,
    MonitorCheckConfig,
} from "../utils/monitoring";

export interface MonitorManagerDependencies {
    eventEmitter: TypedEventBus<MonitorManagerEvents>;
    repositories: {
        monitor: MonitorRepository;
        history: HistoryRepository;
        site: SiteRepository;
    };
    databaseService: DatabaseService;
    getHistoryLimit: () => number;
    getSitesCache: () => Map<string, Site>;
}

/**
 * Manages monitoring operations and scheduling.
 * Handles monitoring lifecycle and status checks.
 */
export class MonitorManager {
    private isMonitoring = false;
    private readonly monitorScheduler: MonitorScheduler;
    private readonly dependencies: MonitorManagerDependencies;
    private readonly eventEmitter: TypedEventBus<MonitorManagerEvents>;

    constructor(dependencies: MonitorManagerDependencies) {
        this.dependencies = dependencies;
        this.eventEmitter = dependencies.eventEmitter;
        this.monitorScheduler = new MonitorScheduler();
        this.monitorScheduler.setCheckCallback(this.handleScheduledCheck.bind(this));
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
        const sites = Array.from(sitesCache.values());
        await this.eventEmitter.emitTyped("monitoring:started", {
            monitorCount: sites.reduce((total, site) => total + site.monitors.length, 0),
            siteCount: sites.length,
            timestamp: Date.now(),
        });
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
     * Set up a new site for monitoring (initial checks, intervals, auto-start).
     */
    public async setupSiteForMonitoring(site: Site): Promise<void> {
        // Initial check for all monitors
        await performInitialMonitorChecks(site, this.checkMonitor.bind(this), logger);

        // Apply business rules for default intervals
        await this.applyDefaultIntervals(site);

        // Apply business rules for auto-starting monitoring
        await this.autoStartMonitoringIfAppropriate(site);

        // Emit site setup completed event
        await this.eventEmitter.emitTyped("internal:monitor:site-setup-completed", {
            identifier: site.identifier,
            operation: "site-setup-completed",
            timestamp: Date.now(),
        });
    }

    /**
     * Business logic: Apply default check intervals for monitors that don't have one.
     * This ensures all monitors have a check interval set according to business rules.
     */
    private async applyDefaultIntervals(site: Site): Promise<void> {
        logger.debug(`[MonitorManager] Applying default intervals for site: ${site.identifier}`);

        for (const monitor of site.monitors) {
            if (monitor.id && this.shouldApplyDefaultInterval(monitor)) {
                monitor.checkInterval = DEFAULT_CHECK_INTERVAL;

                // Use transaction for database update
                await this.dependencies.databaseService.executeTransaction(async () => {
                    if (monitor.id) {
                        await this.dependencies.repositories.monitor.update(monitor.id, {
                            checkInterval: monitor.checkInterval,
                        });
                    }
                });

                logger.debug(
                    `[MonitorManager] Applied default interval ${DEFAULT_CHECK_INTERVAL}ms for monitor: ${monitor.id}`
                );
            }
        }

        logger.info(`[MonitorManager] Completed applying default intervals for site: ${site.identifier}`);
    }

    /**
     * Business logic: Determine if a monitor should receive a default interval.
     */
    private shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return !monitor.checkInterval;
    }

    /**
     * Business logic: Automatically start monitoring if appropriate according to business rules.
     */
    private async autoStartMonitoringIfAppropriate(site: Site): Promise<void> {
        if (!this.shouldAutoStartMonitoring(site)) {
            logger.debug(`[MonitorManager] Skipping auto-start for site: ${site.identifier} (business rules)`);
            return;
        }

        logger.debug(`[MonitorManager] Auto-starting monitoring for site: ${site.identifier}`);

        for (const monitor of site.monitors) {
            if (monitor.id) {
                await this.startMonitoringForSite(site.identifier, monitor.id);

                if (isDev()) {
                    logger.debug(
                        `[MonitorManager] Auto-started monitoring for monitor ${monitor.id} with interval ${monitor.checkInterval}ms`
                    );
                }
            }
        }

        logger.info(`[MonitorManager] Completed auto-starting monitoring for site: ${site.identifier}`);
    }

    /**
     * Business logic: Determine if monitoring should be auto-started for a site.
     * Business rules: Auto-start monitoring unless in development mode or site is inactive.
     */
    private shouldAutoStartMonitoring(site: Site): boolean {
        // Business rule: Don't auto-start in development mode
        if (isDev()) {
            return false;
        }

        // Business rule: Only auto-start for sites that have monitors
        if (site.monitors.length === 0) {
            return false;
        }

        // Business rule: Site monitoring property takes precedence if explicitly set
        if (site.monitoring !== undefined) {
            return site.monitoring;
        }

        // Default business rule: Auto-start monitoring for all new sites
        return true;
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
        };

        return await checkMonitor(config, site, monitorId);
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
     * Check if monitoring is currently active.
     */
    public isMonitoringActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * Check if a specific monitor is actively being monitored by the scheduler.
     */
    public isMonitorActiveInScheduler(siteIdentifier: string, monitorId: string): boolean {
        return this.monitorScheduler.isMonitoring(siteIdentifier, monitorId);
    }

    /**
     * Restart monitoring for a specific monitor with updated configuration.
     * This is useful when monitor intervals change and need to be applied immediately.
     */
    public restartMonitorWithNewConfig(siteIdentifier: string, monitor: Site["monitors"][0]): boolean {
        return this.monitorScheduler.restartMonitor(siteIdentifier, monitor);
    }
}
