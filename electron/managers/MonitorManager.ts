/**
 * Manages monitoring operations including scheduling and status checking.
 * Handles start/stop operations for individual monitors and sites.
 */

import { EventEmitter } from "events";

import { STATUS_UPDATE_EVENT, DEFAULT_CHECK_INTERVAL } from "../constants";
import { MonitorRepository, HistoryRepository, SiteRepository } from "../services/database";
import { MonitorScheduler } from "../services/monitoring";
import { Site, StatusUpdate } from "../types";
import { isDev } from "../utils";
import { monitorLogger as logger } from "../utils/logger";
import {
    autoStartMonitoring,
    setDefaultMonitorIntervals,
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
export class MonitorManager {
    private isMonitoring: boolean = false;
    private readonly monitorScheduler: MonitorScheduler;
    private readonly dependencies: MonitorManagerDependencies;

    constructor(dependencies: MonitorManagerDependencies) {
        this.dependencies = dependencies;
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
    }

    /**
     * Start monitoring for a specific site or monitor.
     */
    public async startMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        return startMonitoringForSite(
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
    }

    /**
     * Stop monitoring for a specific site or monitor.
     */
    public async stopMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        return stopMonitoringForSite(
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
        return result ?? undefined;
    }

    /**
     * Set up a new site for monitoring (initial checks, intervals, auto-start).
     */
    public async setupSiteForMonitoring(site: Site): Promise<void> {
        // Initial check for all monitors
        await performInitialMonitorChecks(site, this.checkMonitor.bind(this), logger);

        // Set default checkInterval for monitors that don't have one
        await setDefaultMonitorIntervals(
            site,
            DEFAULT_CHECK_INTERVAL,
            this.dependencies.repositories.monitor.update.bind(this.dependencies.repositories.monitor),
            logger
        );

        // Auto-start monitoring for all new monitors
        await autoStartMonitoring(site, this.startMonitoringForSite.bind(this), logger, isDev);
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
