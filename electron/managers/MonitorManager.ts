/**
 * Manages monitoring operations including scheduling and status checking.
 * Handles start/stop operations for individual monitors and sites.
 */

import { EventEmitter } from "events";

import { DEFAULT_CHECK_INTERVAL } from "../constants";
import { isDev } from "../electronUtils";
import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";

/**
 * Combined events interface for MonitorManager.
 */
type MonitorManagerEvents = UptimeEvents;

/**
 * Constants for utility event names.
 */
const UTILITY_EVENTS = {
    SITE_MONITOR_DOWN: "site-monitor-down",
    SITE_MONITOR_UP: "site-monitor-up",
    STATUS_UPDATE: "status-update",
} as const;

/**
 * Constants for typed event names.
 */
const TYPED_EVENTS = {
    MONITOR_STATUS_CHANGED: "monitor:status-changed",
} as const;
import { MonitorRepository, HistoryRepository, SiteRepository, DatabaseService } from "../services/database";
import { MonitorScheduler } from "../services/monitoring";
import { Site, Monitor, StatusUpdate } from "../types";
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
    private readonly utilityEventEmitter: EventEmitter; // For low-level utility events

    constructor(dependencies: MonitorManagerDependencies) {
        this.dependencies = dependencies;
        this.eventEmitter = dependencies.eventEmitter;
        this.utilityEventEmitter = new EventEmitter(); // Create wrapper for utility events
        this.monitorScheduler = new MonitorScheduler();
        this.monitorScheduler.setCheckCallback(this.handleScheduledCheck.bind(this));

        // Set up event transformation from utility events to typed events
        this.setupEventTransformation();
    }

    /**
     * Set up event transformation from utility events to typed events.
     */
    private setupEventTransformation(): void {
        // Transform status-update events to typed events
        this.utilityEventEmitter.on(UTILITY_EVENTS.STATUS_UPDATE, (statusUpdate: StatusUpdate) => {
            try {
                // Validate the status update data
                if (!statusUpdate || !statusUpdate.site || !statusUpdate.site.identifier) {
                    logger.error("[MonitorManager] Invalid status update received - missing required fields");
                    return;
                }

                logger.debug(
                    `[MonitorManager] Processing status-update event for site: ${statusUpdate.site.identifier}`
                );

                // Find the monitor that was checked
                const updatedMonitor = statusUpdate.site.monitors.find((m) => m.lastChecked);
                if (updatedMonitor) {
                    logger.debug(
                        `[MonitorManager] Emitting monitor:status-changed event for monitor: ${updatedMonitor.id}`
                    );

                    // Emit status-changed event for the monitor
                    const eventData: {
                        monitor: Monitor;
                        newStatus: string;
                        previousStatus: string;
                        responseTime?: number;
                        site: Site; // Add complete site data
                        siteId: string;
                        timestamp: number;
                    } = {
                        monitor: updatedMonitor,
                        newStatus: updatedMonitor.status,
                        previousStatus: statusUpdate.previousStatus || "unknown",
                        site: statusUpdate.site, // Include complete site data
                        siteId: statusUpdate.site.identifier,
                        timestamp: Date.now(),
                    };
                    if (updatedMonitor.responseTime !== undefined) {
                        eventData.responseTime = updatedMonitor.responseTime;
                    }
                    this.eventEmitter.emitTyped(TYPED_EVENTS.MONITOR_STATUS_CHANGED, eventData);

                    // Also emit check-completed event for completeness
                    this.eventEmitter.emitTyped("monitor:check-completed", {
                        checkType: "scheduled" as const,
                        monitorId: updatedMonitor.id?.toString() || "",
                        result: statusUpdate,
                        siteId: statusUpdate.site.identifier,
                        timestamp: Date.now(),
                    });
                } else {
                    logger.warn(`[MonitorManager] No updated monitor found for site: ${statusUpdate.site.identifier}`);
                }
            } catch (error) {
                logger.error("[MonitorManager] Error processing status update event:", error);
            }
        });

        // Transform site-monitor-down events to typed events
        this.utilityEventEmitter.on(
            UTILITY_EVENTS.SITE_MONITOR_DOWN,
            (data: { monitor: Site["monitors"][0]; monitorId: string; site: Site }) => {
                const eventData: {
                    monitor: Monitor;
                    newStatus: string;
                    previousStatus: string;
                    responseTime?: number;
                    site: Site;
                    siteId: string;
                    timestamp: number;
                } = {
                    monitor: data.monitor,
                    newStatus: "down",
                    previousStatus: "up",
                    site: data.site,
                    siteId: data.site.identifier,
                    timestamp: Date.now(),
                };
                if (data.monitor.responseTime !== undefined) {
                    eventData.responseTime = data.monitor.responseTime;
                }
                this.eventEmitter.emitTyped(TYPED_EVENTS.MONITOR_STATUS_CHANGED, eventData);
            }
        );

        // Transform site-monitor-up events to typed events
        this.utilityEventEmitter.on(
            UTILITY_EVENTS.SITE_MONITOR_UP,
            (data: { monitor: Site["monitors"][0]; monitorId: string; site: Site }) => {
                const eventData: {
                    monitor: Monitor;
                    newStatus: string;
                    previousStatus: string;
                    responseTime?: number;
                    site: Site;
                    siteId: string;
                    timestamp: number;
                } = {
                    monitor: data.monitor,
                    newStatus: "up",
                    previousStatus: "down",
                    site: data.site,
                    siteId: data.site.identifier,
                    timestamp: Date.now(),
                };
                if (data.monitor.responseTime !== undefined) {
                    eventData.responseTime = data.monitor.responseTime;
                }
                this.eventEmitter.emitTyped(TYPED_EVENTS.MONITOR_STATUS_CHANGED, eventData);
            }
        );
    }

    /**
     * Start monitoring for all sites.
     */
    public async startMonitoring(): Promise<void> {
        this.isMonitoring = await startAllMonitoring(
            {
                databaseService: this.dependencies.databaseService,
                eventEmitter: this.utilityEventEmitter,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                monitorScheduler: this.monitorScheduler,
                sites: this.dependencies.getSitesCache(),
                statusUpdateEvent: UTILITY_EVENTS.STATUS_UPDATE,
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
            eventEmitter: this.utilityEventEmitter,
            logger,
            monitorRepository: this.dependencies.repositories.monitor,
            monitorScheduler: this.monitorScheduler,
            sites: this.dependencies.getSitesCache(),
            statusUpdateEvent: UTILITY_EVENTS.STATUS_UPDATE,
        });

        // Emit typed monitoring stopped event
        await this.eventEmitter.emitTyped("monitoring:stopped", {
            activeMonitors: 0, // All monitoring stopped
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
                eventEmitter: this.utilityEventEmitter,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                monitorScheduler: this.monitorScheduler,
                sites: this.dependencies.getSitesCache(),
                statusUpdateEvent: UTILITY_EVENTS.STATUS_UPDATE,
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
                eventEmitter: this.utilityEventEmitter,
                logger,
                monitorRepository: this.dependencies.repositories.monitor,
                monitorScheduler: this.monitorScheduler,
                sites: this.dependencies.getSitesCache(),
                statusUpdateEvent: UTILITY_EVENTS.STATUS_UPDATE,
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
                eventEmitter: this.utilityEventEmitter,
                historyLimit: this.dependencies.getHistoryLimit(),
                logger,
                repositories: this.dependencies.repositories,
                sites: this.dependencies.getSitesCache(),
                statusUpdateEvent: UTILITY_EVENTS.STATUS_UPDATE,
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
     */
    private async checkMonitor(site: Site, monitorId: string): Promise<StatusUpdate | undefined> {
        return checkMonitor(
            {
                databaseService: this.dependencies.databaseService,
                eventEmitter: this.utilityEventEmitter,
                historyLimit: this.dependencies.getHistoryLimit(),
                logger,
                repositories: this.dependencies.repositories,
                sites: this.dependencies.getSitesCache(),
                statusUpdateEvent: UTILITY_EVENTS.STATUS_UPDATE,
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
