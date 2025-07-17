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
 * - monitor:status-changed: When monitor status changes
 * - monitor:down: When a monitor goes down
 * - monitor:up: When a monitor comes back up
 * - system:error: When system operations fail
 * - monitoring:started: When monitoring begins
 * - monitoring:stopped: When monitoring stops
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
 * Interface defining the monitoring operations provided to the SiteManager.
 */
interface MonitoringOperations {
    /** Set the history retention limit for monitor data */
    setHistoryLimit: (limit: number) => Promise<void>;
    /** Start monitoring for a specific site and monitor */
    startMonitoringForSite: (identifier: string, monitorId: string) => Promise<boolean>;
    /** Stop monitoring for a specific site and monitor */
    stopMonitoringForSite: (identifier: string, monitorId: string) => Promise<boolean>;
    /** Set up monitoring for newly added monitors */
    setupNewMonitors: (site: Site, newMonitorIds: string[]) => Promise<void>;
}

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
    /** Specific monitor ID to start */
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
    /** Specific monitor ID to stop */
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
    /** Specific monitor ID to check */
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

export class UptimeOrchestrator extends TypedEventBus<OrchestratorEvents> {
    private _historyLimit: number = DEFAULT_HISTORY_LIMIT;

    // Manager instances
    private readonly siteManager: SiteManager;
    private readonly monitorManager: MonitorManager;
    private readonly databaseManager: DatabaseManager;

    /**
     * Constructs a new UptimeOrchestrator and initializes all managers and middleware.
     *
     * @remarks
     * Sets up event bus middleware, repositories, and manager dependencies.
     */
    constructor() {
        super("UptimeOrchestrator");

        this.setupMiddleware();

        // Initialize repositories and managers using helper methods
        const repositories = this.initRepositories();
        const managers = this.initManagers(repositories);

        this.monitorManager = managers.monitorManager;
        this.siteManager = managers.siteManager;
        this.databaseManager = managers.databaseManager;

        // Set up event-driven communication between managers
        this.setupEventHandlers();
    }

    /**
     * Initializes all repository instances.
     *
     * @returns Object containing all repository instances.
     */
    private initRepositories(): {
        databaseService: DatabaseService;
        siteRepository: SiteRepository;
        monitorRepository: MonitorRepository;
        historyRepository: HistoryRepository;
        settingsRepository: SettingsRepository;
    } {
        const databaseService = DatabaseService.getInstance();
        const siteRepository = new SiteRepository();
        const monitorRepository = new MonitorRepository();
        const historyRepository = new HistoryRepository();
        const settingsRepository = new SettingsRepository();

        return {
            databaseService,
            siteRepository,
            monitorRepository,
            historyRepository,
            settingsRepository,
        };
    }

    /**
     * Initializes all manager instances using the provided repositories.
     *
     * @param repositories - Object containing all repository instances.
     * @returns Object containing all manager instances.
     */
    private initManagers(repositories: ReturnType<UptimeOrchestrator["initRepositories"]>): {
        monitorManager: MonitorManager;
        siteManager: SiteManager;
        databaseManager: DatabaseManager;
    } {
        // Create site manager first so we can reference it in the monitor manager
        const siteManagerInstance = new SiteManager({
            databaseService: repositories.databaseService,
            eventEmitter: this,
            historyRepository: repositories.historyRepository,
            monitoringOperations: this.createMonitoringOperations(),
            monitorRepository: repositories.monitorRepository,
            siteRepository: repositories.siteRepository,
        });

        const monitorManager = new MonitorManager({
            databaseService: repositories.databaseService,
            eventEmitter: this,
            getHistoryLimit: () => this._historyLimit,
            getSitesCache: () => siteManagerInstance.getSitesCache(),
            repositories: {
                history: repositories.historyRepository,
                monitor: repositories.monitorRepository,
                site: repositories.siteRepository,
            },
        });

        // We've already constructed SiteManager before MonitorManager

        const databaseManager = new DatabaseManager({
            eventEmitter: this,
            repositories: {
                database: repositories.databaseService,
                history: repositories.historyRepository,
                monitor: repositories.monitorRepository,
                settings: repositories.settingsRepository,
                site: repositories.siteRepository,
            },
        });

        return {
            monitorManager,
            siteManager: siteManagerInstance,
            databaseManager,
        };
    }

    /**
     * Set up middleware for the event bus.
     *
     * @remarks
     * Extracted from constructor for clarity and maintainability.
     */
    private setupMiddleware(): void {
        this.use(createErrorHandlingMiddleware({ continueOnError: true }));
        this.use(createLoggingMiddleware({ includeData: false, level: "info" }));
    }

    /**
     * Creates the monitoringOperations object for SiteManager.
     *
     * @returns The monitoringOperations object implementing the MonitoringOperations interface.
     */
    private createMonitoringOperations(): MonitoringOperations {
        return {
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
        };
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
                    /* v8 ignore next 2 */ logger.error(
                        `[UptimeOrchestrator] Error starting monitoring for site ${data.identifier}:`,
                        error
                    );
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
                    /* v8 ignore next 2 */ logger.error(
                        `[UptimeOrchestrator] Error stopping monitoring for site ${data.identifier}:`,
                        error
                    );
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
                // Process sites concurrently with proper error handling
                const setupResults = await Promise.allSettled(
                    data.sites.map(async (site) => {
                        try {
                            await this.monitorManager.setupSiteForMonitoring(site);
                            return { site: site.identifier, success: true };
                        } catch (error) {
                            /* v8 ignore next 2 */ logger.error(
                                `[UptimeOrchestrator] Failed to setup monitoring for site ${site.identifier}:`,
                                error
                            );
                            return { site: site.identifier, success: false, error };
                        }
                    })
                );

                // Log summary of setup results
                const successful = setupResults.filter(
                    (result) => result.status === "fulfilled" && result.value.success
                ).length;
                const failed = setupResults.length - successful;

                if (failed > 0) {
                    /* v8 ignore next 2 */ logger.warn(
                        `[UptimeOrchestrator] Site monitoring setup completed: ${successful} successful, ${failed} failed`
                    );
                } else {
                    /* v8 ignore next 2 */ logger.info(
                        `[UptimeOrchestrator] Successfully set up monitoring for all ${successful} loaded sites`
                    );
                }
            })();
        });

        this.on("internal:database:get-sites-from-cache-requested", () => {
            void (async () => {
                // Respond with sites from cache
                const sites = this.siteManager.getSitesFromCache();
                await this.emitTyped("internal:database:get-sites-from-cache-response", {
                    operation: "get-sites-from-cache-response",
                    sites,
                    timestamp: Date.now(),
                });
            })();
        });

        this.on("internal:database:history-limit-updated", (data: HistoryLimitUpdatedData) => {
            this._historyLimit = data.limit;
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

        // Handle internal monitoring events and emit typed events
        this.on("internal:monitor:started", () => {
            void (async () => {
                try {
                    // Get actual counts from the system
                    const sites = this.siteManager.getSitesFromCache();
                    const totalMonitors = sites.reduce((total: number, site: Site) => total + site.monitors.length, 0);

                    await this.emitTyped("monitoring:started", {
                        monitorCount: totalMonitors,
                        siteCount: sites.length,
                        timestamp: Date.now(),
                    });
                } catch (error) {
                    /* v8 ignore next 2 */ logger.error(
                        "[UptimeOrchestrator] Error handling internal:monitor:started:",
                        error
                    );
                }
            })();
        });

        this.on("internal:monitor:stopped", () => {
            void (async () => {
                try {
                    // Get actual active monitor count from scheduler
                    const activeMonitors = this.monitorManager.isMonitoringActive()
                        ? this.monitorManager.getActiveMonitorCount()
                        : 0;

                    await this.emitTyped("monitoring:stopped", {
                        activeMonitors,
                        reason: "user" as const,
                        timestamp: Date.now(),
                    });
                } catch (error) {
                    /* v8 ignore next 2 */ logger.error(
                        "[UptimeOrchestrator] Error handling internal:monitor:stopped:",
                        error
                    );
                }
            })();
        });

        this.on("internal:database:initialized", () => {
            void (async () => {
                try {
                    await this.emitTyped("database:transaction-completed", {
                        duration: 0,
                        operation: "initialize",
                        success: true,
                        timestamp: Date.now(),
                    });
                } catch (error) {
                    /* v8 ignore next 2 */ logger.error(
                        "[UptimeOrchestrator] Error handling internal:database:initialized:",
                        error
                    );
                }
            })();
        });
    }

    /**
     * Initializes the orchestrator and all its managers.
     * Ensures proper initialization order and error handling.
     *
     * @returns Promise that resolves when initialization is complete.
     */
    public async initialize(): Promise<void> {
        try {
            /* v8 ignore next 2 */ logger.info("[UptimeOrchestrator] Starting initialization...");

            // Step 1: Initialize database first (required by other managers)
            await this.databaseManager.initialize();
            /* v8 ignore next 2 */ logger.info("[UptimeOrchestrator] Database manager initialized");

            // Step 2: Initialize site manager (loads sites from database)
            await this.siteManager.initialize();
            /* v8 ignore next 2 */ logger.info("[UptimeOrchestrator] Site manager initialized");

            // Step 3: Validate that managers are properly initialized
            this.validateInitialization();

            /* v8 ignore next 2 */ logger.info("[UptimeOrchestrator] Initialization completed successfully");
        } catch (error) {
            /* v8 ignore next 2 */ logger.error("[UptimeOrchestrator] Initialization failed:", error);
            throw error;
        }
    }

    /**
     * Validates that all managers are properly initialized.
     *
     * @throws Error if validation fails
     */
    private validateInitialization(): void {
        // Basic validation that we can access manager methods
        if (typeof this.databaseManager.initialize !== "function") {
            throw new TypeError("DatabaseManager not properly initialized");
        }
        if (typeof this.siteManager.initialize !== "function") {
            throw new TypeError("SiteManager not properly initialized");
        }
        if (typeof this.monitorManager.startMonitoring !== "function") {
            throw new TypeError("MonitorManager not properly initialized");
        }
    }

    // Site Management Operations

    /**
     * Retrieves all sites from the site manager.
     *
     * @returns Promise resolving to an array of Site objects.
     */
    public async getSites(): Promise<Site[]> {
        return this.siteManager.getSites();
    }

    /**
     * Gets the current sites from the in-memory cache.
     *
     * @returns Array of Site objects from cache.
     */
    public getSitesFromCache(): Site[] {
        return this.siteManager.getSitesFromCache();
    }

    /**
     * Adds a new site and sets up monitoring for it.
     * Uses transaction-like behavior to ensure consistency.
     *
     * @param siteData - The site data to add.
     * @returns Promise resolving to the added Site object.
     */
    public async addSite(siteData: Site): Promise<Site> {
        let site: Site | undefined;

        try {
            // Step 1: Add the site
            site = await this.siteManager.addSite(siteData);

            // Step 2: Set up monitoring for the new site
            await this.monitorManager.setupSiteForMonitoring(site);

            return site;
        } catch (error) {
            // If monitoring setup fails, attempt to clean up the site
            if (site) {
                try {
                    await this.siteManager.removeSite(site.identifier);
                    /* v8 ignore next 2 */ logger.info(
                        `[UptimeOrchestrator] Cleaned up site ${site.identifier} after monitoring setup failure`
                    );
                } catch (cleanupError) {
                    /* v8 ignore next 2 */ logger.error(
                        `[UptimeOrchestrator] Failed to cleanup site ${site.identifier} after monitoring setup failure:`,
                        cleanupError
                    );
                }
            }

            /* v8 ignore next 2 */ logger.error(
                `[UptimeOrchestrator] Failed to add site ${siteData.identifier}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Removes a site by its identifier.
     *
     * @param identifier - The site identifier.
     * @returns Promise resolving to true if removed, false otherwise.
     */
    public async removeSite(identifier: string): Promise<boolean> {
        return this.siteManager.removeSite(identifier);
    }

    /**
     * Removes a monitor from a site and stops its monitoring.
     * Uses a single database transaction to ensure atomicity.
     *
     * @param siteIdentifier - The site identifier.
     * @param monitorId - The monitor identifier.
     * @returns Promise resolving to true if removed, false otherwise.
     */
    public async removeMonitor(siteIdentifier: string, monitorId: string): Promise<boolean> {
        try {
            // Step 1: Stop monitoring immediately (before transaction)
            const monitoringStopped = await this.monitorManager.stopMonitoringForSite(siteIdentifier, monitorId);

            // Step 2: Remove monitor from database using transaction
            const removed = await this.siteManager.removeMonitor(siteIdentifier, monitorId);

            // If database removal succeeded, we're done
            if (removed) {
                return true;
            }

            // If database removal failed but monitoring was stopped, restart monitoring
            if (monitoringStopped) {
                try {
                    await this.monitorManager.startMonitoringForSite(siteIdentifier, monitorId);
                    /* v8 ignore next 2 */ logger.info(
                        `[UptimeOrchestrator] Restarted monitoring for ${siteIdentifier}/${monitorId} after failed removal`
                    );
                } catch (restartError) {
                    /* v8 ignore next 2 */ logger.error(
                        `[UptimeOrchestrator] Failed to restart monitoring for ${siteIdentifier}/${monitorId} after failed removal:`,
                        restartError
                    );
                }
            }

            return false;
        } catch (error) {
            /* v8 ignore next 2 */ logger.error(
                `[UptimeOrchestrator] Failed to remove monitor ${siteIdentifier}/${monitorId}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Updates a site with the given changes.
     *
     * @param identifier - The site identifier.
     * @param updates - Partial site data to update.
     * @returns Promise resolving to the updated Site object.
     */
    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        return this.siteManager.updateSite(identifier, updates);
    }

    // Monitoring Operations

    /**
     * Starts monitoring for all sites.
     *
     * @returns Promise that resolves when monitoring has started.
     */
    public async startMonitoring(): Promise<void> {
        await this.monitorManager.startMonitoring();
    }

    /**
     * Stops monitoring for all sites.
     *
     * @returns Promise that resolves when monitoring has stopped.
     */
    public async stopMonitoring(): Promise<void> {
        await this.monitorManager.stopMonitoring();
    }

    /**
     * Starts monitoring for a specific site and monitor.
     *
     * @param identifier - The site identifier.
     * @param monitorId - Optional monitor identifier.
     * @returns Promise resolving to true if started, false otherwise.
     */
    public async startMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        return this.monitorManager.startMonitoringForSite(identifier, monitorId);
    }

    /**
     * Stops monitoring for a specific site and monitor.
     *
     * @param identifier - The site identifier.
     * @param monitorId - Optional monitor identifier.
     * @returns Promise resolving to true if stopped, false otherwise.
     */
    public async stopMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
        return this.monitorManager.stopMonitoringForSite(identifier, monitorId);
    }

    /**
     * Manually triggers a check for a site or monitor.
     *
     * @param identifier - The site identifier.
     * @param monitorId - Optional monitor identifier.
     * @returns Promise resolving to a StatusUpdate or null.
     */
    public async checkSiteManually(identifier: string, monitorId?: string): Promise<StatusUpdate | null> {
        const result = await this.monitorManager.checkSiteManually(identifier, monitorId);
        return result ?? null;
    }

    // Database Operations

    /**
     * Exports all application data as a JSON string.
     *
     * @returns Promise resolving to the exported data string.
     */
    public async exportData(): Promise<string> {
        return this.databaseManager.exportData();
    }

    /**
     * Imports application data from a JSON string.
     *
     * @param data - The JSON data string to import.
     * @returns Promise resolving to true if import succeeded, false otherwise.
     */
    public async importData(data: string): Promise<boolean> {
        return this.databaseManager.importData(data);
    }

    /**
     * Downloads a backup of the SQLite database.
     *
     * @returns Promise resolving to an object containing the backup buffer and file name.
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        return this.databaseManager.downloadBackup();
    }

    /**
     * Refreshes sites from the database and updates the cache.
     *
     * @returns Promise resolving to an array of refreshed Site objects.
     */
    public async refreshSites(): Promise<Site[]> {
        return this.databaseManager.refreshSites();
    }

    // History Management

    /**
     * Sets the history retention limit for monitor data.
     *
     * @remarks
     * This method delegates to the DatabaseManager to update the history limit
     * in the database and prune existing history entries if necessary.
     *
     * The operation is performed within a database transaction to ensure
     * consistency between the setting update and history pruning.
     *
     * @param limit - The new history limit (number of entries to retain per monitor).
     *                Values less than or equal to 0 will disable history pruning.
     * @returns Promise that resolves when the limit is set.
     */
    public async setHistoryLimit(limit: number): Promise<void> {
        await this.databaseManager.setHistoryLimit(limit);
    }

    /**
     * Gets the current history retention limit.
     *
     * @returns The current history limit.
     */
    public get historyLimit(): number {
        return this.databaseManager.getHistoryLimit();
    }

    /**
     * Gets the current history retention limit (method version for IPC compatibility).
     *
     * @returns The current history limit.
     */
    public getHistoryLimit(): number {
        return this.databaseManager.getHistoryLimit();
    }

    // Status Information

    /**
     * Checks if monitoring is currently active.
     *
     * @returns True if monitoring is active, false otherwise.
     */
    public isMonitoringActive(): boolean {
        return this.monitorManager.isMonitoringActive();
    }
}
