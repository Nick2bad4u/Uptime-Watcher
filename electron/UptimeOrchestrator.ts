/**
 * Core uptime monitoring orchestrator.
 * Coordinates between specialized managers to provide a unified API for uptime monitoring.
 * Manager instances
    private readonly siteManager: SiteManager;
    private readonly monitorManager: MonitorManager;
    // TODO: DatabaseManager still has specialized import/export/backup functions that should
    // eventually be converted to the new service-based architecture for consistency
    private readonly databaseManager: DatabaseManager;
 */

/* eslint-disable unicorn/no-null -- null literal needed for backend */

import type { UptimeEvents } from "./events/eventTypes";

import { DEFAULT_HISTORY_LIMIT } from "./constants";
import { TypedEventBus, createLoggingMiddleware, createErrorHandlingMiddleware } from "./events/index";
import { DatabaseManager } from "./managers/DatabaseManager";
import { MonitorManager } from "./managers/MonitorManager";
import { SiteManager } from "./managers/SiteManager";
import {
    DatabaseService,
    SiteRepository,
    MonitorRepository,
    HistoryRepository,
    SettingsRepository,
} from "./services/database";
import { Site, StatusUpdate } from "./types";
import { logger } from "./utils/logger";

/**
 * Combined event interface for the orchestrator.
 * Supports both internal manager events and public frontend events.
 */
type OrchestratorEvents = UptimeEvents;

/**
 * Core uptime monitoring orchestrator that coordinates specialized managers.
 *
 * This class serves as a lightweight coordinator that delegates operations to:
 * - SiteManager: Site CRUD operations and cache management
 * - MonitorManager: Monitoring operations and scheduling
 * - DatabaseManager: Database operations and data management
 *
 * Uses TypedEventBus to provide real-time updates to the renderer process with type safety.
 *
 * Events emitted:
 * - status-update: When monitor status changes
 * - site-monitor-down: When a monitor goes down
 * - site-monitor-up: When a monitor comes back up
 * - db-error: When database operations fail
 *
 * @example
 * ```typescript
 * const orchestrator = new UptimeOrchestrator();
 * orchestrator.on('status-update', (data) => console.log(data));
 * await orchestrator.addSite({ identifier: 'example', monitors: [...] });
 * orchestrator.startMonitoring();
 * ```
 */
export class UptimeOrchestrator extends TypedEventBus<OrchestratorEvents> {
    private historyLimit: number = DEFAULT_HISTORY_LIMIT;

    // Manager instances
    private readonly siteManager: SiteManager;
    private readonly monitorManager: MonitorManager;
    // TODO: DatabaseManager still has specialized import/export/backup functions that should
    // TODO: eventually be converted to the new service-based architecture for consistency
    private readonly databaseManager: DatabaseManager;

    constructor() {
        super("UptimeOrchestrator");

        // Set up middleware for the event bus
        this.use(createErrorHandlingMiddleware({ continueOnError: true }));
        this.use(createLoggingMiddleware({ includeData: false, level: "info" }));

        // Initialize repositories
        const databaseService = DatabaseService.getInstance();
        const siteRepository = new SiteRepository();
        const monitorRepository = new MonitorRepository();
        const historyRepository = new HistoryRepository();
        const settingsRepository = new SettingsRepository();

        // Initialize managers with event-driven dependencies
        this.siteManager = new SiteManager({
            databaseService,
            eventEmitter: this,
            historyRepository,
            monitorRepository,
            siteRepository,
        });

        this.monitorManager = new MonitorManager({
            databaseService,
            eventEmitter: this,
            getHistoryLimit: () => this.historyLimit,
            getSitesCache: () => this.siteManager.getSitesCache(),
            repositories: {
                history: historyRepository,
                monitor: monitorRepository,
                site: siteRepository,
            },
        });

        // Now update SiteManager with MonitorManager integration
        this.siteManager = new SiteManager({
            databaseService,
            eventEmitter: this,
            historyRepository,
            monitoringOperations: {
                setHistoryLimit: async (limit: number) => {
                    await this.setHistoryLimit(limit);
                },
                startMonitoringForSite: async (identifier: string, monitorId: string) => {
                    return await this.monitorManager.startMonitoringForSite(identifier, monitorId);
                },
                stopMonitoringForSite: async (identifier: string, monitorId: string) => {
                    return await this.monitorManager.stopMonitoringForSite(identifier, monitorId);
                },
            },
            monitorRepository,
            siteRepository,
        });

        this.databaseManager = new DatabaseManager({
            eventEmitter: this,
            repositories: {
                database: databaseService,
                history: historyRepository,
                monitor: monitorRepository,
                settings: settingsRepository,
                site: siteRepository,
            },
        });

        // Set up event-driven communication between managers
        this.setupEventHandlers();
    }

    /**
     * Set up event handlers for inter-manager communication.
     */
    private setupEventHandlers(): void {
        // Handle site manager internal events
        this.on("internal:site:start-monitoring-requested", (data) => {
            try {
                const success = this.monitorManager.startMonitoringForSite(data.identifier, data.monitorId);
                // Emit response event with the result
                this.emitTyped("internal:site:start-monitoring-response", {
                    identifier: data.identifier,
                    monitorId: data.monitorId,
                    operation: "start-monitoring-response",
                    success,
                    timestamp: Date.now(),
                });
            } catch (error) {
                logger.error(`[UptimeOrchestrator] Error starting monitoring for site ${data.identifier}:`, error);
                this.emitTyped("internal:site:start-monitoring-response", {
                    identifier: data.identifier,
                    monitorId: data.monitorId,
                    operation: "start-monitoring-response",
                    success: false,
                    timestamp: Date.now(),
                });
            }
        });

        this.on("internal:site:stop-monitoring-requested", (data) => {
            try {
                const success = this.monitorManager.stopMonitoringForSite(data.identifier, data.monitorId);
                // Emit response event with the result
                this.emitTyped("internal:site:stop-monitoring-response", {
                    identifier: data.identifier,
                    monitorId: data.monitorId,
                    operation: "stop-monitoring-response",
                    success,
                    timestamp: Date.now(),
                });
            } catch (error) {
                logger.error(`[UptimeOrchestrator] Error stopping monitoring for site ${data.identifier}:`, error);
                this.emitTyped("internal:site:stop-monitoring-response", {
                    identifier: data.identifier,
                    monitorId: data.monitorId,
                    operation: "stop-monitoring-response",
                    success: false,
                    timestamp: Date.now(),
                });
            }
        });

        this.on("internal:site:is-monitoring-active-requested", (data) => {
            // Check if the monitor is actively running in the scheduler
            const isActive = this.monitorManager.isMonitorActiveInScheduler(data.identifier, data.monitorId);
            // For this implementation, we'll emit the response event with the result
            this.emitTyped("internal:site:is-monitoring-active-response", {
                identifier: data.identifier,
                isActive,
                monitorId: data.monitorId,
                operation: "is-monitoring-active-response",
                timestamp: Date.now(),
            });
        });

        this.on("internal:site:restart-monitoring-requested", (data) => {
            // Use the MonitorScheduler's restartMonitor method which is designed for this exact use case
            const success = this.monitorManager.restartMonitorWithNewConfig(data.identifier, data.monitor);
            // Emit response event with the result
            this.emitTyped("internal:site:restart-monitoring-response", {
                identifier: data.identifier,
                monitorId: data.monitor.id || "",
                operation: "restart-monitoring-response",
                success,
                timestamp: Date.now(),
            });
        });

        // Handle database manager internal events
        this.on("internal:database:update-sites-cache-requested", async (data) => {
            if (data.sites) {
                await this.siteManager.updateSitesCache(data.sites);
            }
        });

        this.on("internal:database:get-sites-from-cache-requested", () => {
            // Respond with sites from cache
            const sites = this.siteManager.getSitesFromCache();
            this.emitTyped("internal:database:get-sites-from-cache-requested", {
                operation: "get-sites-from-cache-requested",
                sites,
                timestamp: Date.now(),
            });
        });

        this.on("internal:database:history-limit-updated", (data) => {
            if (data.limit !== undefined) {
                this.historyLimit = data.limit;
            }
        });

        // Forward internal manager events to public typed events for renderer process
        this.on("internal:site:added", (data) => {
            this.emitTyped("site:added", {
                site: data.site,
                source: "user" as const,
                timestamp: data.timestamp,
            });
        });

        this.on("internal:site:removed", (data) => {
            this.emitTyped("site:removed", {
                cascade: true,
                siteId: data.identifier,
                siteName: data.identifier,
                timestamp: data.timestamp,
            });
        });

        this.on("internal:site:updated", (data) => {
            this.emitTyped("site:updated", {
                previousSite: data.site,
                site: data.site,
                timestamp: data.timestamp,
                updatedFields: data.updatedFields || [],
            });
        });

        // Transform typed events to simple events for ApplicationService
        this.on("monitor:status-changed", (data) => {
            logger.debug(`[UptimeOrchestrator] Received monitor:status-changed event for site: ${data.siteId}`);

            // Emit the simple status-update event that ApplicationService expects
            this.emit("status-update", {
                monitor: data.monitor,
                newStatus: data.newStatus,
                previousStatus: data.previousStatus,
                site: data.site, // Use complete site data from the event
                timestamp: data.timestamp,
            });

            // Also emit monitor up/down events
            if (data.previousStatus !== "down" && data.newStatus === "down") {
                this.emit("site-monitor-down", {
                    monitorId: data.monitor.id?.toString() || "",
                    site: data.site, // Use complete site data from the event
                });
            } else if (data.previousStatus === "down" && data.newStatus === "up") {
                this.emit("site-monitor-up", {
                    monitorId: data.monitor.id?.toString() || "",
                    site: data.site, // Use complete site data from the event
                });
            }
        });

        // Transform system error events
        this.on("system:error", (data) => {
            this.emit("db-error", {
                error: data.error,
                operation: data.context,
            });
        });

        this.on("internal:monitor:started", () => {
            this.emitTyped("monitoring:started", {
                monitorCount: 0,
                siteCount: 0,
                timestamp: Date.now(),
            });
        });

        this.on("internal:monitor:stopped", () => {
            this.emitTyped("monitoring:stopped", {
                activeMonitors: 0,
                reason: "user" as const,
                timestamp: Date.now(),
            });
        });

        this.on("internal:database:initialized", () => {
            this.emitTyped("database:transaction-completed", {
                duration: 0,
                operation: "initialize",
                success: true,
                timestamp: Date.now(),
            });
        });
    }

    /**
     * Initialize the orchestrator and all its managers.
     */
    public async initialize(): Promise<void> {
        await this.databaseManager.initialize();
    }

    // Site Management Operations
    public async getSites(): Promise<Site[]> {
        return this.siteManager.getSites();
    }

    public getSitesFromCache(): Site[] {
        return this.siteManager.getSitesFromCache();
    }

    public async addSite(siteData: Site): Promise<Site> {
        const site = await this.siteManager.addSite(siteData);

        // Set up monitoring for the new site
        await this.monitorManager.setupSiteForMonitoring(site);

        return site;
    }

    public async removeSite(identifier: string): Promise<boolean> {
        return this.siteManager.removeSite(identifier);
    }

    public async removeMonitor(siteIdentifier: string, monitorId: string): Promise<boolean> {
        // Stop monitoring for this specific monitor first
        await this.monitorManager.stopMonitoringForSite(siteIdentifier, monitorId);

        // Remove the monitor through the site manager
        return this.siteManager.removeMonitor(siteIdentifier, monitorId);
    }

    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        return this.siteManager.updateSite(identifier, updates);
    }

    // Monitoring Operations
    public async startMonitoring(): Promise<void> {
        await this.monitorManager.startMonitoring();
    }

    public async stopMonitoring(): Promise<void> {
        await this.monitorManager.stopMonitoring();
    }

    public async startMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        return this.monitorManager.startMonitoringForSite(identifier, monitorId);
    }

    public async stopMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        return this.monitorManager.stopMonitoringForSite(identifier, monitorId);
    }

    public async checkSiteManually(identifier: string, monitorId?: string): Promise<StatusUpdate | null> {
        const result = await this.monitorManager.checkSiteManually(identifier, monitorId);
        return result ?? null;
    }

    // Database Operations
    public async exportData(): Promise<string> {
        return this.databaseManager.exportData();
    }

    public async importData(data: string): Promise<boolean> {
        return this.databaseManager.importData(data);
    }

    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        return this.databaseManager.downloadBackup();
    }

    public async refreshSites(): Promise<Site[]> {
        return this.databaseManager.refreshSites();
    }

    // History Management
    public async setHistoryLimit(limit: number): Promise<void> {
        await this.databaseManager.setHistoryLimit(limit);
    }

    public getHistoryLimit(): number {
        return this.historyLimit;
    }

    // Status Information
    public isMonitoringActive(): boolean {
        return this.monitorManager.isMonitoringActive();
    }
}
