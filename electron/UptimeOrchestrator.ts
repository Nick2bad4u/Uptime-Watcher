/**
 * Core uptime monitoring orchestrator and application coordinator.
 *
 * @remarks
 * The UptimeOrchestrator serves as the central coordination point for all monitoring
 * operations in the application. It uses a service-based architecture to coordinate
 * between specialized managers (DatabaseManager, MonitorManager, SiteManager) and
 * provides a unified API for uptime monitoring functionality.
 *
 * Key responsibilities:
 * - Coordinate operations between specialized managers
 * - Provide unified API for frontend interactions
 * - Handle internal event communication between components
 * - Manage application lifecycle and initialization
 * - Ensure proper error handling and logging across all operations
 *
 * The orchestrator extends TypedEventBus to provide type-safe event communication
 * between the frontend and backend, as well as internal component coordination.
 *
 * @example
 * ```typescript
 * const orchestrator = new UptimeOrchestrator();
 * await orchestrator.initialize();
 *
 * // Add a new site
 * const site = await orchestrator.addSite({
 *   identifier: "site_123",
 *   name: "My Website",
 *   monitors: [...],
 *   monitoring: true
 * });
 *
 * // Start monitoring
 * await orchestrator.startMonitoring();
 * ```
 *
 * @packageDocumentation
 */

import type { UptimeEvents } from "./events/eventTypes";

import { DEFAULT_HISTORY_LIMIT } from "./constants";
import { TypedEventBus, createLoggingMiddleware, createErrorHandlingMiddleware } from "./events";
import { DatabaseManager, MonitorManager, SiteManager } from "./managers";
import { DatabaseService, SiteRepository, MonitorRepository, HistoryRepository, SettingsRepository } from "./services";
import { Site, StatusUpdate, Monitor } from "./types";
import { logger } from "./utils";

/**
 * Combined event interface for the orchestrator.
 *
 * @remarks
 * Supports both internal manager events and public frontend events,
 * providing a unified event system for the entire application.
 */
type OrchestratorEvents = UptimeEvents;

/**
 * Data structure for internal start monitoring request events.
 *
 * @remarks Internal use only for coordinating between managers.
 */
interface StartMonitoringRequestData {
    /** Site identifier for the monitoring request */
    identifier: string;
    /** Specific monitor ID to start (optional) */
    monitorId: string;
}

/**
 * Data structure for internal stop monitoring request events.
 *
 * @remarks Internal use only for coordinating between managers.
 */
interface StopMonitoringRequestData {
    /** Site identifier for the monitoring request */
    identifier: string;
    /** Specific monitor ID to stop (optional) */
    monitorId: string;
}

/**
 * Data structure for internal monitoring status check events.
 *
 * @remarks Internal use only for coordinating between managers.
 */
interface IsMonitoringActiveRequestData {
    /** Site identifier for the status check */
    identifier: string;
    /** Specific monitor ID to check (optional) */
    monitorId: string;
}

/**
 * Data structure for internal monitor restart events.
 *
 * @remarks Internal use only for coordinating between managers.
 */
interface RestartMonitoringRequestData {
    /** Site identifier for the restart request */
    identifier: string;
    /** Monitor configuration for restart */
    monitor: Monitor;
}

/**
 * Data structure for internal sites cache update events.
 *
 * @remarks Internal use only for coordinating between managers.
 */
interface UpdateSitesCacheRequestData {
    /** Updated sites array for cache synchronization */
    sites: Site[];
}

/**
 * Data structure for history limit update events.
 *
 * @remarks Internal use only for coordinating between managers.
 */
interface HistoryLimitUpdatedData {
    /** New history retention limit */
    limit: number;
}

interface SiteEventData {
    site: Site;
    timestamp: number;
    identifier?: string;
    updatedFields?: string[];
}

interface MonitorStatusChangedData {
    siteId: string;
    monitor: Monitor;
    site: Site;
    newStatus: string;
    previousStatus: string;
    timestamp: number;
}

interface SystemErrorData {
    error: Error;
    context: string;
}

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

        // Create monitorManager first, but pass a placeholder for getSitesCache (will be set after siteManager is constructed)
        let siteManagerInstance: SiteManager;

        this.monitorManager = new MonitorManager({
            databaseService,
            eventEmitter: this,
            getHistoryLimit: () => this.historyLimit,
            getSitesCache: () => siteManagerInstance.getSitesCache(),
            repositories: {
                history: historyRepository,
                monitor: monitorRepository,
                site: siteRepository,
            },
        });

        // Now construct SiteManager with monitoringOperations using monitorManager
        this.siteManager = siteManagerInstance = new SiteManager({
            databaseService,
            eventEmitter: this,
            historyRepository,
            monitoringOperations: {
                setHistoryLimit: async (limit: number) => {
                    await this.setHistoryLimit(limit);
                },
                startMonitoringForSite: async (identifier: string, monitorId: string) => {
                    return this.monitorManager.startMonitoringForSite(identifier, monitorId);
                },
                stopMonitoringForSite: async (identifier: string, monitorId: string) => {
                    return this.monitorManager.stopMonitoringForSite(identifier, monitorId);
                },
                setupNewMonitors: async (site: Site, newMonitorIds: string[]) => {
                    return this.monitorManager.setupNewMonitors(site, newMonitorIds);
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
        this.on("internal:site:start-monitoring-requested", (data: StartMonitoringRequestData) => {
            void (async () => {
                try {
                    const success = await this.monitorManager.startMonitoringForSite(data.identifier, data.monitorId);
                    // Emit response event with the result
                    await this.emitTyped("internal:site:start-monitoring-response", {
                        identifier: data.identifier,
                        monitorId: data.monitorId,
                        operation: "start-monitoring-response",
                        success,
                        timestamp: Date.now(),
                    });
                } catch (error) {
                    logger.error(`[UptimeOrchestrator] Error starting monitoring for site ${data.identifier}:`, error);
                    await this.emitTyped("internal:site:start-monitoring-response", {
                        identifier: data.identifier,
                        monitorId: data.monitorId,
                        operation: "start-monitoring-response",
                        success: false,
                        timestamp: Date.now(),
                    });
                }
            })();
        });

        this.on("internal:site:stop-monitoring-requested", (data: StopMonitoringRequestData) => {
            void (async () => {
                try {
                    const success = await this.monitorManager.stopMonitoringForSite(data.identifier, data.monitorId);
                    // Emit response event with the result
                    await this.emitTyped("internal:site:stop-monitoring-response", {
                        identifier: data.identifier,
                        monitorId: data.monitorId,
                        operation: "stop-monitoring-response",
                        success,
                        timestamp: Date.now(),
                    });
                } catch (error) {
                    logger.error(`[UptimeOrchestrator] Error stopping monitoring for site ${data.identifier}:`, error);
                    await this.emitTyped("internal:site:stop-monitoring-response", {
                        identifier: data.identifier,
                        monitorId: data.monitorId,
                        operation: "stop-monitoring-response",
                        success: false,
                        timestamp: Date.now(),
                    });
                }
            })();
        });

        this.on("internal:site:is-monitoring-active-requested", (data: IsMonitoringActiveRequestData) => {
            void (async () => {
                // Check if the monitor is actively running in the scheduler
                const isActive = this.monitorManager.isMonitorActiveInScheduler(data.identifier, data.monitorId);
                // For this implementation, we'll emit the response event with the result
                await this.emitTyped("internal:site:is-monitoring-active-response", {
                    identifier: data.identifier,
                    isActive,
                    monitorId: data.monitorId,
                    operation: "is-monitoring-active-response",
                    timestamp: Date.now(),
                });
            })();
        });

        this.on("internal:site:restart-monitoring-requested", (data: RestartMonitoringRequestData) => {
            void (async () => {
                // Use the MonitorScheduler's restartMonitor method which is designed for this exact use case
                const success = this.monitorManager.restartMonitorWithNewConfig(data.identifier, data.monitor);
                // Emit response event with the result
                await this.emitTyped("internal:site:restart-monitoring-response", {
                    identifier: data.identifier,
                    monitorId: data.monitor.id,
                    operation: "restart-monitoring-response",
                    success,
                    timestamp: Date.now(),
                });
            })();
        });

        // Handle database manager internal events
        this.on("internal:database:update-sites-cache-requested", (data: UpdateSitesCacheRequestData) => {
            void (async () => {
                await this.siteManager.updateSitesCache(data.sites);

                // CRITICAL: Set up monitoring for each loaded site
                // This ensures sites loaded from database get proper monitoring setup
                for (const site of data.sites) {
                    try {
                        await this.monitorManager.setupSiteForMonitoring(site);
                        logger.info(`[UptimeOrchestrator] Set up monitoring for loaded site: ${site.identifier}`);
                    } catch (error) {
                        logger.error(
                            `[UptimeOrchestrator] Failed to setup monitoring for site ${site.identifier}:`,
                            error
                        );
                    }
                }
            })();
        });

        this.on("internal:database:get-sites-from-cache-requested", () => {
            void (async () => {
                // Respond with sites from cache
                const sites = this.siteManager.getSitesFromCache();
                await this.emitTyped("internal:database:get-sites-from-cache-requested", {
                    operation: "get-sites-from-cache-requested",
                    sites,
                    timestamp: Date.now(),
                });
            })();
        });

        this.on("internal:database:history-limit-updated", (data: HistoryLimitUpdatedData) => {
            this.historyLimit = data.limit;
        });

        // Forward internal manager events to public typed events for renderer process
        this.on("internal:site:added", (data: SiteEventData) => {
            void (async () => {
                await this.emitTyped("site:added", {
                    site: data.site,
                    source: "user" as const,
                    timestamp: data.timestamp,
                });
            })();
        });

        this.on("internal:site:removed", (data: SiteEventData) => {
            void (async () => {
                await this.emitTyped("site:removed", {
                    cascade: true,
                    siteId: data.identifier ?? data.site.identifier,
                    siteName: data.site.name,
                    timestamp: data.timestamp,
                });
            })();
        });

        this.on("internal:site:updated", (data: SiteEventData & { previousSite?: Site }) => {
            void (async () => {
                await this.emitTyped("site:updated", {
                    previousSite: data.previousSite ?? data.site, // Use previousSite if provided, fallback to current site
                    site: data.site,
                    timestamp: data.timestamp,
                    updatedFields: data.updatedFields ?? [],
                });
            })();
        });

        // Transform typed events to simple events for ApplicationService
        this.on("monitor:status-changed", (data: MonitorStatusChangedData) => {
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
                    monitorId: data.monitor.id,
                    site: data.site, // Use complete site data from the event
                });
            } else if (data.previousStatus === "down" && data.newStatus === "up") {
                this.emit("site-monitor-up", {
                    monitorId: data.monitor.id,
                    site: data.site, // Use complete site data from the event
                });
            }
        });

        // Transform system error events
        this.on("system:error", (data: SystemErrorData) => {
            this.emit("db-error", {
                error: data.error,
                operation: data.context,
            });
        });

        this.on("internal:monitor:started", () => {
            void (async () => {
                await this.emitTyped("monitoring:started", {
                    monitorCount: 0,
                    siteCount: 0,
                    timestamp: Date.now(),
                });
            })();
        });

        this.on("internal:monitor:stopped", () => {
            void (async () => {
                await this.emitTyped("monitoring:stopped", {
                    activeMonitors: 0,
                    reason: "user" as const,
                    timestamp: Date.now(),
                });
            })();
        });

        this.on("internal:database:initialized", () => {
            void (async () => {
                await this.emitTyped("database:transaction-completed", {
                    duration: 0,
                    operation: "initialize",
                    success: true,
                    timestamp: Date.now(),
                });
            })();
        });
    }

    /**
     * Initialize the orchestrator and all its managers.
     */
    public async initialize(): Promise<void> {
        await this.databaseManager.initialize();
        await this.siteManager.initialize();
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
