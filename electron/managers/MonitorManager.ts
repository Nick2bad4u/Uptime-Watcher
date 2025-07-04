/**
 * Manages monitoring operations including scheduling and status checking.
 * Handles start/stop operations for individual monitors and sites.
 */

import { EventEmitter } from "events";

import { STATUS_UPDATE_EVENT, DEFAULT_CHECK_INTERVAL } from "../constants";
import { isDev } from "../electronUtils";
import { MONITOR_EVENTS, MonitorEventData } from "../events";
import { MonitorRepository, HistoryRepository, SiteRepository } from "../services/database";
import { MonitorScheduler } from "../services/monitoring";
import { Site, StatusUpdate } from "../types";
import { monitorLogger as logger } from "../utils/logger";
import {
    performInitialMonitorChecks,
    startAllMonitoring,
    startMonitoringForSite,
    stopAllMonitoring,
    stopMonitoringForSite,
    checkMonitor,
    checkSiteManually,
} from "../utils/monitoring";

export interface MonitorManagerDependencies {
    eventEmitter: EventEmitter;
    repositories: {
        monitor: MonitorRepository;
        history: HistoryRepository;
        site: SiteRepository;
    };
    getHistoryLimit: () => number;
    getSitesCache: () => Map<string, Site>;
}

/**
 * Manages monitoring operations and scheduling.
 * Handles monitoring lifecycle and status checks.
 */
export class MonitorManager extends EventEmitter {
    private isMonitoring: boolean = false;
    private readonly monitorScheduler: MonitorScheduler;
    private readonly dependencies: MonitorManagerDependencies;
    private readonly eventEmitter: EventEmitter;

    constructor(dependencies: MonitorManagerDependencies) {
        super();
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
                eventEmitter: this.dependencies.eventEmitter,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                monitorScheduler: this.monitorScheduler,
                sites: this.dependencies.getSitesCache(),
                statusUpdateEvent: STATUS_UPDATE_EVENT,
            },
            this.isMonitoring
        );

        // Emit all monitoring started event
        const eventData: MonitorEventData = {
            identifier: "all",
        };
        this.eventEmitter.emit(MONITOR_EVENTS.ALL_MONITORING_STARTED, eventData);
    }

    /**
     * Stop monitoring for all sites.
     */
    public stopMonitoring(): void {
        this.isMonitoring = stopAllMonitoring({
            eventEmitter: this.dependencies.eventEmitter,
            logger,
            monitorRepository: this.dependencies.repositories.monitor,
            monitorScheduler: this.monitorScheduler,
            sites: this.dependencies.getSitesCache(),
            statusUpdateEvent: STATUS_UPDATE_EVENT,
        });

        // Emit all monitoring stopped event
        const eventData: MonitorEventData = {
            identifier: "all",
        };
        this.eventEmitter.emit(MONITOR_EVENTS.ALL_MONITORING_STOPPED, eventData);
    }

    /**
     * Start monitoring for a specific site or monitor.
     */
    public async startMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        const result = await startMonitoringForSite(
            {
                eventEmitter: this.dependencies.eventEmitter,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                monitorScheduler: this.monitorScheduler,
                sites: this.dependencies.getSitesCache(),
                statusUpdateEvent: STATUS_UPDATE_EVENT,
            },
            identifier,
            monitorId,
            (id, mid) => this.startMonitoringForSite(id, mid)
        );

        if (result) {
            // Emit monitoring started event
            const eventData: MonitorEventData = {
                identifier,
                ...(monitorId !== undefined && { monitorId }),
            };
            this.eventEmitter.emit(MONITOR_EVENTS.MONITORING_STARTED, eventData);
        }

        return result;
    }

    /**
     * Stop monitoring for a specific site or monitor.
     */
    public async stopMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        const result = await stopMonitoringForSite(
            {
                eventEmitter: this.dependencies.eventEmitter,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                monitorScheduler: this.monitorScheduler,
                sites: this.dependencies.getSitesCache(),
                statusUpdateEvent: STATUS_UPDATE_EVENT,
            },
            identifier,
            monitorId,
            (id, mid) => this.stopMonitoringForSite(id, mid)
        );

        if (result) {
            // Emit monitoring stopped event
            const eventData: MonitorEventData = {
                identifier,
                ...(monitorId !== undefined && { monitorId }),
            };
            this.eventEmitter.emit(MONITOR_EVENTS.MONITORING_STOPPED, eventData);
        }

        return result;
    }

    /**
     * Check a site manually and return status update.
     */
    public async checkSiteManually(identifier: string, monitorId?: string): Promise<StatusUpdate | undefined> {
        const result = await checkSiteManually(
            {
                eventEmitter: this.dependencies.eventEmitter,
                historyLimit: this.dependencies.getHistoryLimit(),
                logger,
                repositories: this.dependencies.repositories,
                sites: this.dependencies.getSitesCache(),
                statusUpdateEvent: STATUS_UPDATE_EVENT,
            },
            identifier,
            monitorId
        );

        // Emit manual check completed event
        const eventData: MonitorEventData = {
            identifier,
            ...(monitorId !== undefined && { monitorId }),
            ...(result !== undefined && { result }),
        };
        this.eventEmitter.emit(MONITOR_EVENTS.MANUAL_CHECK_COMPLETED, eventData);

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
        const eventData: MonitorEventData = {
            identifier: site.identifier,
        };
        this.eventEmitter.emit(MONITOR_EVENTS.SITE_SETUP_COMPLETED, eventData);
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
                await this.dependencies.repositories.monitor.update(monitor.id, {
                    checkInterval: monitor.checkInterval,
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
     */
    private async checkMonitor(site: Site, monitorId: string): Promise<StatusUpdate | undefined> {
        return checkMonitor(
            {
                eventEmitter: this.dependencies.eventEmitter,
                historyLimit: this.dependencies.getHistoryLimit(),
                logger,
                repositories: this.dependencies.repositories,
                sites: this.dependencies.getSitesCache(),
                statusUpdateEvent: STATUS_UPDATE_EVENT,
            },
            site,
            monitorId
        );
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
}
