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
 * ## Architecture & Event-Driven Design
 *
 * The orchestrator uses an event-driven architecture for inter-manager communication:
 * - Internal events coordinate operations between managers
 * - Public events provide updates to the frontend renderer
 * - All events are strongly typed for compile-time safety
 * - Event handlers are organized by domain (site, database, monitoring)
 *
 * ## Initialization Sequence
 *
 * 1. **Middleware Setup**: Error handling and logging middleware
 * 2. **Repository Initialization**: Database service and all repositories
 * 3. **Manager Creation**: DatabaseManager → SiteManager → MonitorManager
 * 4. **Event Handler Setup**: Inter-manager communication setup
 * 5. **Database Initialization**: Schema creation, migrations, data loading
 * 6. **Site Manager Initialization**: Load sites and setup cache
 * 7. **Validation**: Ensure all managers are properly initialized
 *
 * ## Error Handling & Transaction Guarantees
 *
 * - **Transactional Operations**: `addSite()`, `removeMonitor()`, `setHistoryLimit()`
 * - **Error Propagation**: All public methods propagate errors to callers
 * - **Cleanup on Failure**: Failed operations attempt automatic rollback
 * - **Event Error Isolation**: Event handler errors don't affect other handlers
 * - **Logging**: All errors are logged with context before propagation
 *
 * ## Atomicity Guarantees
 *
 * - `addSite()`: Atomic site creation with monitoring setup or full rollback
 * - `removeMonitor()`: Atomic monitor removal with proper cleanup
 * - `setHistoryLimit()`: Atomic limit update with history pruning in transaction
 * - `updateSite()`: Delegated to SiteManager with transaction support
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

import { createErrorHandlingMiddleware, createLoggingMiddleware } from "./events/middleware";
import { TypedEventBus } from "./events/TypedEventBus";
import { DatabaseManager } from "./managers/DatabaseManager";
import { MonitorManager } from "./managers/MonitorManager";
import { SiteManager } from "./managers/SiteManager";
import { Monitor, Site, StatusUpdate } from "./types";
import { logger } from "./utils/logger";

/**
 * Dependencies for UptimeOrchestrator.
 */
export interface UptimeOrchestratorDependencies {
    databaseManager: DatabaseManager;
    monitorManager: MonitorManager;
    siteManager: SiteManager;
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
 * Combined event interface for the orchestrator.
 *
 * @remarks
 * Supports both internal manager events and public frontend events,
 * providing a unified event system for the entire application.
 */
type OrchestratorEvents = UptimeEvents;

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

interface SiteEventData {
    identifier?: string;
    site: Site;
    timestamp: number;
    updatedFields?: string[];
}

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
 * Data structure for internal sites cache update events.
 *
 * @remarks Internal use only for coordinating between managers.
 */
interface UpdateSitesCacheRequestData {
    /** Updated sites array for cache synchronization */
    sites: Site[];
}

export class UptimeOrchestrator extends TypedEventBus<OrchestratorEvents> {
    /**
     * Gets the current history retention limit.
     *
     * @returns The current history limit from DatabaseManager
     */
    public get historyLimit(): number {
        return this.databaseManager.getHistoryLimit();
    }

    private readonly databaseManager: DatabaseManager;
    private readonly monitorManager: MonitorManager;

    // Manager instances
    private readonly siteManager: SiteManager;

    /**
     * Constructs a new UptimeOrchestrator with injected dependencies.
     *
     * @param dependencies - The manager dependencies
     *
     * @remarks
     * Sets up event bus middleware and initializes with provided managers.
     */
    constructor(dependencies?: UptimeOrchestratorDependencies) {
        super("UptimeOrchestrator");

        this.setupMiddleware();

        // Dependencies must be injected - no fallback to ServiceContainer
        if (!dependencies) {
            throw new Error(
                "UptimeOrchestrator requires dependencies to be injected. Use ServiceContainer to create instances."
            );
        }

        this.databaseManager = dependencies.databaseManager;
        this.monitorManager = dependencies.monitorManager;
        this.siteManager = dependencies.siteManager;

        // Set up event-driven communication between managers
        this.setupEventHandlers();
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
     * Manually triggers a check for a site or monitor.
     *
     * @param identifier - The site identifier.
     * @param monitorId - Optional monitor identifier.
     * @returns Promise resolving to a StatusUpdate or null.
     */
    public async checkSiteManually(identifier: string, monitorId?: string): Promise<null | StatusUpdate> {
        const result = await this.monitorManager.checkSiteManually(identifier, monitorId);
        return result ?? null;
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
     * Exports all application data as a JSON string.
     *
     * @returns Promise resolving to the exported data string.
     */
    public async exportData(): Promise<string> {
        return this.databaseManager.exportData();
    }

    /**
     * Gets the current history retention limit (method version for IPC compatibility).
     *
     * @returns The current history limit.
     */
    public getHistoryLimit(): number {
        return this.databaseManager.getHistoryLimit();
    }

    /**
     * Retrieves all sites from the site manager.
     *
     * @returns Promise resolving to an array of Site objects.
     */
    public async getSites(): Promise<Site[]> {
        return this.siteManager.getSites();
    }

    // Site Management Operations

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
     * Initializes the orchestrator and all its managers.
     * Ensures proper initialization order and error handling.
     *
     * @returns Promise that resolves when initialization is complete.
     */
    public async initialize(): Promise<void> {
        try {
            logger.info("[UptimeOrchestrator] Starting initialization...");

            // Step 1: Initialize database first (required by other managers)
            await this.databaseManager.initialize();
            logger.info("[UptimeOrchestrator] Database manager initialized");

            // Step 2: Initialize site manager (loads sites from database)
            await this.siteManager.initialize();
            logger.info("[UptimeOrchestrator] Site manager initialized");

            // Step 3: Validate that managers are properly initialized
            this.validateInitialization();

            logger.info("[UptimeOrchestrator] Initialization completed successfully");
        } catch (error) {
            logger.error("[UptimeOrchestrator] Initialization failed:", error);
            throw error;
        }
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

    // Monitoring Operations

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
     * Starts monitoring for all sites.
     *
     * @returns Promise that resolves when monitoring has started.
     */
    public async startMonitoring(): Promise<void> {
        await this.monitorManager.startMonitoring();
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
     * Stops monitoring for all sites.
     *
     * @returns Promise that resolves when monitoring has stopped.
     */
    public async stopMonitoring(): Promise<void> {
        await this.monitorManager.stopMonitoring();
    }

    // Database Operations

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
     * Updates a site with the given changes.
     *
     * @param identifier - The site identifier.
     * @param updates - Partial site data to update.
     * @returns Promise resolving to the updated Site object.
     */
    public async updateSite(identifier: string, updates: Partial<Site>): Promise<Site> {
        return this.siteManager.updateSite(identifier, updates);
    }

    /**
     * Set up database manager event handlers.
     */
    private setupDatabaseEventHandlers(): void {
        this.on("internal:database:update-sites-cache-requested", (data: UpdateSitesCacheRequestData) => {
            void (async () => {
                await this.siteManager.updateSitesCache(data.sites);

                // CRITICAL: Set up monitoring for each loaded site
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
                            return { error, site: site.identifier, success: false };
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
                const sites = this.siteManager.getSitesFromCache();
                await this.emitTyped("internal:database:get-sites-from-cache-response", {
                    operation: "get-sites-from-cache-response",
                    sites,
                    timestamp: Date.now(),
                });
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
     * Set up event forwarding from internal events to public frontend events.
     */
    private setupEventForwarding(): void {
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
                    previousSite: data.previousSite ?? data.site,
                    site: data.site,
                    timestamp: data.timestamp,
                    updatedFields: data.updatedFields ?? [],
                });
            })();
        });
    }

    /**
     * Set up event handlers for inter-manager communication.
     */
    private setupEventHandlers(): void {
        this.setupDatabaseEventHandlers();
        this.setupEventForwarding();
        this.setupMonitoringEventHandlers();
        this.setupSiteEventHandlers();
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
     * Set up monitoring event handlers.
     */
    private setupMonitoringEventHandlers(): void {
        this.on("internal:monitor:started", () => {
            void (async () => {
                try {
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
    }

    /**
     * Set up site manager event handlers.
     */
    private setupSiteEventHandlers(): void {
        this.on("internal:site:start-monitoring-requested", (data: StartMonitoringRequestData) => {
            void (async () => {
                try {
                    const success = await this.monitorManager.startMonitoringForSite(data.identifier, data.monitorId);
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
                const isActive = this.monitorManager.isMonitorActiveInScheduler(data.identifier, data.monitorId);
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
                const success = this.monitorManager.restartMonitorWithNewConfig(data.identifier, data.monitor);
                await this.emitTyped("internal:site:restart-monitoring-response", {
                    identifier: data.identifier,
                    monitorId: data.monitor.id,
                    operation: "restart-monitoring-response",
                    success,
                    timestamp: Date.now(),
                });
            })();
        });
    }

    // Status Information

    /**
     * Validates that all managers are properly initialized.
     *
     * @throws Error if validation fails, with specific context about which manager failed
     */
    private validateInitialization(): void {
        // Basic validation that we can access manager methods
        if (typeof this.databaseManager.initialize !== "function") {
            throw new TypeError("DatabaseManager not properly initialized - missing initialize method");
        }
        if (typeof this.siteManager.initialize !== "function") {
            throw new TypeError("SiteManager not properly initialized - missing initialize method");
        }
        if (typeof this.monitorManager.startMonitoring !== "function") {
            throw new TypeError("MonitorManager not properly initialized - missing startMonitoring method");
        }
    }
}
