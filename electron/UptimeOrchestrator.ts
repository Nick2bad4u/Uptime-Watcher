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
 * @see {@link DatabaseManager} for database operations and repository pattern
 * @see {@link SiteManager} for site management and caching
 * @see {@link MonitorManager} for monitoring operations and scheduling
 * @see {@link TypedEventBus} for event system implementation
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
 */

import type { UptimeEvents } from "./events/eventTypes";
import type { DatabaseManager } from "./managers/DatabaseManager";
import type { MonitorManager } from "./managers/MonitorManager";
import type { SiteManager } from "./managers/SiteManager";
import type { Monitor, Site, StatusUpdate } from "./types";

import {
    createErrorHandlingMiddleware,
    createLoggingMiddleware,
} from "./events/middleware";
import { TypedEventBus } from "./events/TypedEventBus";
import { logger } from "./utils/logger";

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
    /** Specific monitor ID to start (optional for starting all monitors) */
    monitorId?: string;
}

/**
 * Data structure for internal stop monitoring request events.
 *
 * @remarks Internal use only for coordinating between managers.
 */
interface StopMonitoringRequestData {
    /** Site identifier for the monitoring request */
    identifier: string;
    /** Specific monitor ID to stop (optional for stopping all monitors) */
    monitorId?: string;
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
 * Dependencies for UptimeOrchestrator.
 *
 * @remarks
 * Following the repository pattern and service layer architecture,
 * these managers encapsulate domain-specific operations and provide
 * a clean separation between data access and business logic.
 *
 * Each manager implements the service layer pattern with underlying
 * repository pattern for data persistence, ensuring consistent
 * transaction handling and domain boundaries.
 */
export interface UptimeOrchestratorDependencies {
    databaseManager: DatabaseManager;
    monitorManager: MonitorManager;
    siteManager: SiteManager;
}

/**
 * Combined event interface for the orchestrator.
 *
 * @remarks
 * Supports both internal manager events and public frontend events,
 * providing a unified event system for the entire application.
 */
type OrchestratorEvents = UptimeEvents;

export class UptimeOrchestrator extends TypedEventBus<OrchestratorEvents> {
    private readonly databaseManager: DatabaseManager;

    private readonly monitorManager: MonitorManager;

    // Manager instances
    private readonly siteManager: SiteManager;

    /**
     * Gets the current history retention limit.
     *
     * @returns The current history limit from DatabaseManager
     *
     * @remarks
     * This getter provides convenient property-style access for internal use.
     * The corresponding getHistoryLimit() method exists for IPC compatibility
     * since Electron IPC can only serialize method calls, not property access.
     */
    public get historyLimit(): number {
        return this.databaseManager.getHistoryLimit();
    }

    /**
     * Adds a new site and sets up monitoring for it.
     * Uses transaction-like behavior to ensure consistency.
     *
     * @param siteData - The site data to add.
     * @returns Promise resolving to the added Site object.
     * @throws When site creation fails due to validation errors
     * @throws When monitoring setup fails critically
     * @throws When site cleanup fails after monitoring setup failure
     */
    public async addSite(siteData: Site): Promise<Site> {
        let site: Site | undefined = undefined;

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
                    logger.info(
                        `[UptimeOrchestrator] Cleaned up site ${site.identifier} after monitoring setup failure`
                    );
                } catch (cleanupError) {
                    logger.error(
                        `[UptimeOrchestrator] Failed to cleanup site ${site.identifier} after monitoring setup failure:`,
                        cleanupError
                    );
                }
            }

            logger.error(
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
     * @returns Promise resolving to a StatusUpdate or undefined if no update available.
     */
    public async checkSiteManually(
        identifier: string,
        monitorId?: string
    ): Promise<StatusUpdate | undefined> {
        return this.monitorManager.checkSiteManually(identifier, monitorId);
    }

    /**
     * Downloads a backup of the SQLite database.
     *
     * @returns Promise resolving to an object with:
     *   - buffer: Buffer containing the database backup
     *   - fileName: String with the generated backup filename
     */
    public async downloadBackup(): Promise<{
        buffer: Buffer;
        fileName: string;
    }> {
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
     * Retrieves all sites from the site manager.
     *
     * @returns Promise resolving to an array of Site objects.
     */
    public async getSites(): Promise<Site[]> {
        return this.siteManager.getSites();
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
     * Initializes the orchestrator and all its managers.
     * Ensures proper initialization order and error handling.
     *
     * @returns Promise that resolves when initialization is complete.
     * @throws When any manager initialization fails
     * @throws When validation of initialized managers fails
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

            logger.info(
                "[UptimeOrchestrator] Initialization completed successfully"
            );
        } catch (error) {
            logger.error("[UptimeOrchestrator] Initialization failed:", error);
            throw error;
        }
    }

    /**
     * Removes a monitor from a site and stops its monitoring.
     * Uses a two-phase commit pattern to ensure atomicity.
     *
     * @param siteIdentifier - The site identifier.
     * @param monitorId - The monitor identifier.
     * @returns Promise resolving to true if removed, false otherwise.
     * @throws When the removal operation fails critically
     * @throws When database inconsistency occurs and cannot be resolved
     */
    public async removeMonitor(
        siteIdentifier: string,
        monitorId: string
    ): Promise<boolean> {
        let monitoringStopped = false;
        let databaseRemoved = false;

        try {
            // Phase 1: Stop monitoring immediately (reversible)
            monitoringStopped = await this.monitorManager.stopMonitoringForSite(
                siteIdentifier,
                monitorId
            );

            // If stopping monitoring failed, log warning but continue with database removal
            // The monitor may not be running, but database record should still be removed
            if (!monitoringStopped) {
                logger.warn(
                    `[UptimeOrchestrator] Failed to stop monitoring for ${siteIdentifier}/${monitorId}, but continuing with database removal`
                );
            }

            // Phase 2: Remove monitor from database using transaction (irreversible)
            databaseRemoved = await this.siteManager.removeMonitor(
                siteIdentifier,
                monitorId
            );

            // If both phases succeeded, we're done
            if (databaseRemoved) {
                return true;
            }

            // If database removal failed, attempt compensation
            if (monitoringStopped) {
                logger.warn(
                    `[UptimeOrchestrator] Database removal failed for ${siteIdentifier}/${monitorId}, attempting to restart monitoring`
                );
                try {
                    await this.monitorManager.startMonitoringForSite(
                        siteIdentifier,
                        monitorId
                    );
                    logger.info(
                        `[UptimeOrchestrator] Successfully restarted monitoring for ${siteIdentifier}/${monitorId} after failed removal`
                    );
                } catch (restartError) {
                    // This is a critical inconsistency - monitor stopped but database record exists
                    const criticalError = new Error(
                        `Critical state inconsistency: Monitor ${siteIdentifier}/${monitorId} stopped but database removal failed and restart failed`
                    );
                    logger.error(
                        `[UptimeOrchestrator] ${criticalError.message}:`,
                        restartError
                    );
                    // Emit system error for this critical inconsistency
                    await this.emitTyped("system:error", {
                        context: "monitor-removal-compensation",
                        error: criticalError,
                        recovery:
                            "Manual intervention required - check monitor state and database consistency",
                        severity: "critical",
                        timestamp: Date.now(),
                    });
                    throw criticalError;
                }
            }

            return false;
        } catch (error) {
            logger.error(
                `[UptimeOrchestrator] Failed to remove monitor ${siteIdentifier}/${monitorId}:`,
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
     *
     * @remarks
     * This method delegates to SiteManager for the actual removal operation.
     * Site removal events (site:removed) are emitted by the SiteManager through
     * the event forwarding system, not directly by this orchestrator method.
     */
    public async removeSite(identifier: string): Promise<boolean> {
        return this.siteManager.removeSite(identifier);
    }

    /**
     * Resets all application settings to their default values.
     *
     * @returns Promise that resolves when settings have been reset.
     *
     * @remarks
     * This method delegates to the DatabaseManager to reset all settings
     * to their default values in the database. The operation is performed
     * within a database transaction to ensure consistency.
     *
     * This includes:
     * - History limit reset to default value
     * - Any other persisted settings reset to defaults
     * - Backend cache invalidation
     */
    public async resetSettings(): Promise<void> {
        await this.databaseManager.resetSettings();
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
    public async startMonitoringForSite(
        identifier: string,
        monitorId?: string
    ): Promise<boolean> {
        return this.monitorManager.startMonitoringForSite(
            identifier,
            monitorId
        );
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
     * Stops monitoring for a specific site and monitor.
     *
     * @param identifier - The site identifier.
     * @param monitorId - Optional monitor identifier.
     * @returns Promise resolving to true if stopped, false otherwise.
     */
    public async stopMonitoringForSite(
        identifier: string,
        monitorId?: string
    ): Promise<boolean> {
        return this.monitorManager.stopMonitoringForSite(identifier, monitorId);
    }

    /**
     * Updates a site with the given changes.
     *
     * @param identifier - The site identifier.
     * @param updates - Partial site data to update.
     * @returns Promise resolving to the updated Site object.
     */
    public async updateSite(
        identifier: string,
        updates: Partial<Site>
    ): Promise<Site> {
        return this.siteManager.updateSite(identifier, updates);
    }

    /**
     * Handles the database initialized event asynchronously.
     *
     * @returns Promise that resolves when the event handling is complete
     */
    private async handleDatabaseInitialized(): Promise<void> {
        await this.emitTyped("database:transaction-completed", {
            duration: 0,
            operation: "initialize",
            success: true,
            timestamp: Date.now(),
        });
    }

    /**
     * Handles the get sites from cache request asynchronously.
     *
     * @returns Promise that resolves when the response is sent
     */
    private async handleGetSitesFromCacheRequest(): Promise<void> {
        const sites = this.siteManager.getSitesFromCache();
        await this.emitTyped(
            "internal:database:get-sites-from-cache-response",
            {
                operation: "get-sites-from-cache-response",
                sites,
                timestamp: Date.now(),
            }
        );
    }

    /**
     * Handles the update sites cache request asynchronously.
     *
     * @param data - The sites cache update request data
     * @returns Promise that resolves when the cache update is complete
     *
     * @remarks
     * Extracted from event handler to enable proper async handling and testing.
     * Updates the site cache and sets up monitoring for all loaded sites.
     *
     * Uses Promise.allSettled to handle monitoring setup failures gracefully.
     * Critical failures include both rejected promises and fulfilled promises
     * where the operation reported failure. The logic correctly identifies failures
     * by checking either rejected status or successful completion with failure result.
     */
    private async handleUpdateSitesCacheRequest(
        data: UpdateSitesCacheRequestData
    ): Promise<void> {
        await this.siteManager.updateSitesCache(data.sites);

        // CRITICAL: Set up monitoring for each loaded site
        const setupResults = await Promise.allSettled(
            data.sites.map(async (site) => {
                try {
                    await this.monitorManager.setupSiteForMonitoring(site);
                    return { site: site.identifier, success: true };
                } catch (error) {
                    logger.error(
                        `[UptimeOrchestrator] Failed to setup monitoring for site ${site.identifier}:`,
                        error
                    );
                    return { error, site: site.identifier, success: false };
                }
            })
        );

        // Validate that critical sites were set up successfully
        const successful = setupResults.filter(
            (result) => result.status === "fulfilled" && result.value.success
        ).length;
        const failed = setupResults.length - successful;

        if (failed > 0) {
            const criticalFailures = setupResults.filter((result) => {
                return result.status === "rejected" || !result.value.success;
            }).length;

            if (criticalFailures > 0) {
                const errorMessage = `Critical monitoring setup failures: ${criticalFailures} of ${data.sites.length} sites failed`;
                logger.error(`[UptimeOrchestrator] ${errorMessage}`);
                // For critical operations, we might want to emit an error event
                await this.emitTyped("system:error", {
                    context: "site-monitoring-setup",
                    error: new Error(errorMessage),
                    recovery:
                        "Check site configurations and restart monitoring",
                    severity: "high",
                    timestamp: Date.now(),
                });
            } else {
                logger.warn(
                    `[UptimeOrchestrator] Site monitoring setup completed: ${successful} successful, ${failed} failed`
                );
            }
        } else {
            logger.info(
                `[UptimeOrchestrator] Successfully set up monitoring for all ${successful} loaded sites`
            );
        }
    }

    /**
     * Constructs a new UptimeOrchestrator with injected dependencies.
     *
     * @param dependencies - The manager dependencies required for orchestration
     * @throws When dependencies are not provided or invalid
     *
     * @remarks
     * Sets up event bus middleware and assigns provided managers.
     * Initialization is performed separately via the initialize() method.
     *
     * Dependencies must be injected through the ServiceContainer pattern
     * rather than creating managers directly. This ensures proper
     * initialization order and dependency management.
     *
     * @example
     * ```typescript
     * const orchestrator = new UptimeOrchestrator({
     *   databaseManager,
     *   monitorManager,
     *   siteManager
     * });
     * await orchestrator.initialize();
     * ```
     */
    public constructor(dependencies?: UptimeOrchestratorDependencies) {
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
     * Gets the current history retention limit (method version for IPC compatibility).
     *
     * @returns The current history limit.
     *
     * @remarks
     * This method provides the same value as the historyLimit getter but
     * as a callable method. This is required for Electron IPC compatibility
     * since IPC can serialize method calls but not property access.
     */
    public getHistoryLimit(): number {
        return this.databaseManager.getHistoryLimit();
    }

    // Site Management Operations

    // Monitoring Operations

    // Database Operations

    /**
     * Set up database manager event handlers.
     */
    private setupDatabaseEventHandlers(): void {
        this.on(
            "internal:database:update-sites-cache-requested",
            (data: UpdateSitesCacheRequestData): void => {
                void (async (): Promise<void> => {
                    try {
                        await this.handleUpdateSitesCacheRequest(data);
                    } catch (error) {
                        logger.error(
                            "[UptimeOrchestrator] Error handling update-sites-cache-requested:",
                            error
                        );
                    }
                })();
            }
        );

        this.on(
            "internal:database:get-sites-from-cache-requested",
            (): void => {
                void (async (): Promise<void> => {
                    try {
                        await this.handleGetSitesFromCacheRequest();
                    } catch (error) {
                        logger.error(
                            "[UptimeOrchestrator] Error handling get-sites-from-cache-requested:",
                            error
                        );
                    }
                })();
            }
        );

        this.on("internal:database:initialized", (): void => {
            void (async (): Promise<void> => {
                try {
                    await this.handleDatabaseInitialized();
                } catch (error) {
                    logger.error(
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
        this.on(
            "internal:site:added",
            (data: SiteEventData & { _meta?: unknown }): void => {
                void (async (): Promise<void> => {
                    // Extract original data without _meta to prevent conflicts
                    await this.emitTyped("site:added", {
                        site: data.site,
                        source: "user" as const,
                        timestamp: data.timestamp,
                    });
                })();
            }
        );

        this.on(
            "internal:site:removed",
            (data: SiteEventData & { _meta?: unknown }): void => {
                void (async (): Promise<void> => {
                    // Extract original data without _meta to prevent conflicts
                    await this.emitTyped("site:removed", {
                        cascade: true,
                        siteId: data.identifier ?? data.site.identifier,
                        siteName: data.site.name,
                        timestamp: data.timestamp,
                    });
                })();
            }
        );

        this.on(
            "internal:site:updated",
            (
                data: SiteEventData & { _meta?: unknown; previousSite?: Site }
            ): void => {
                void (async (): Promise<void> => {
                    // Extract original data without _meta to prevent conflicts
                    await this.emitTyped("site:updated", {
                        previousSite: data.previousSite ?? data.site,
                        site: data.site,
                        timestamp: data.timestamp,
                        updatedFields: data.updatedFields ?? [],
                    });
                })();
            }
        );
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
        this.use(
            createLoggingMiddleware({ includeData: false, level: "info" })
        );
    }

    /**
     * Set up monitoring event handlers.
     */
    private setupMonitoringEventHandlers(): void {
        this.on("internal:monitor:started", (): void => {
            void (async (): Promise<void> => {
                try {
                    const sites = this.siteManager.getSitesFromCache();
                    const totalMonitors = sites.reduce(
                        (total: number, site: Site) =>
                            total + site.monitors.length,
                        0
                    );

                    await this.emitTyped("monitoring:started", {
                        monitorCount: totalMonitors,
                        siteCount: sites.length,
                        timestamp: Date.now(),
                    });
                } catch (error) {
                    logger.error(
                        "[UptimeOrchestrator] Error handling internal:monitor:started:",
                        error
                    );
                }
            })();
        });

        this.on("internal:monitor:stopped", (): void => {
            void (async (): Promise<void> => {
                try {
                    const activeMonitors =
                        this.monitorManager.isMonitoringActive()
                            ? this.monitorManager.getActiveMonitorCount()
                            : 0;

                    await this.emitTyped("monitoring:stopped", {
                        activeMonitors,
                        reason: "user" as const,
                        timestamp: Date.now(),
                    });
                } catch (error) {
                    logger.error(
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
        this.on(
            "internal:site:start-monitoring-requested",
            (data: StartMonitoringRequestData): void => {
                void (async (): Promise<void> => {
                    try {
                        const success =
                            await this.monitorManager.startMonitoringForSite(
                                data.identifier,
                                data.monitorId
                            );
                        await this.emitTyped(
                            "internal:site:start-monitoring-response",
                            {
                                identifier: data.identifier,
                                monitorId: data.monitorId,
                                operation: "start-monitoring-response",
                                success,
                                timestamp: Date.now(),
                            }
                        );
                    } catch (error) {
                        logger.error(
                            `[UptimeOrchestrator] Error starting monitoring for site ${data.identifier}:`,
                            error
                        );
                        await this.emitTyped(
                            "internal:site:start-monitoring-response",
                            {
                                identifier: data.identifier,
                                monitorId: data.monitorId,
                                operation: "start-monitoring-response",
                                success: false,
                                timestamp: Date.now(),
                            }
                        );
                    }
                })();
            }
        );

        this.on(
            "internal:site:stop-monitoring-requested",
            (data: StopMonitoringRequestData): void => {
                void (async (): Promise<void> => {
                    try {
                        const success =
                            await this.monitorManager.stopMonitoringForSite(
                                data.identifier,
                                data.monitorId
                            );
                        await this.emitTyped(
                            "internal:site:stop-monitoring-response",
                            {
                                identifier: data.identifier,
                                monitorId: data.monitorId,
                                operation: "stop-monitoring-response",
                                success,
                                timestamp: Date.now(),
                            }
                        );
                    } catch (error) {
                        logger.error(
                            `[UptimeOrchestrator] Error stopping monitoring for site ${data.identifier}:`,
                            error
                        );
                        await this.emitTyped(
                            "internal:site:stop-monitoring-response",
                            {
                                identifier: data.identifier,
                                monitorId: data.monitorId,
                                operation: "stop-monitoring-response",
                                success: false,
                                timestamp: Date.now(),
                            }
                        );
                    }
                })();
            }
        );

        this.on(
            "internal:site:is-monitoring-active-requested",
            (data: IsMonitoringActiveRequestData): void => {
                void (async (): Promise<void> => {
                    const isActive =
                        this.monitorManager.isMonitorActiveInScheduler(
                            data.identifier,
                            data.monitorId
                        );
                    await this.emitTyped(
                        "internal:site:is-monitoring-active-response",
                        {
                            identifier: data.identifier,
                            isActive,
                            monitorId: data.monitorId,
                            operation: "is-monitoring-active-response",
                            timestamp: Date.now(),
                        }
                    );
                })();
            }
        );

        this.on(
            "internal:site:restart-monitoring-requested",
            (data: RestartMonitoringRequestData): void => {
                void (async (): Promise<void> => {
                    try {
                        // Note: restartMonitorWithNewConfig is intentionally synchronous
                        // as it only updates scheduler configuration without async I/O
                        const success =
                            this.monitorManager.restartMonitorWithNewConfig(
                                data.identifier,
                                data.monitor
                            );
                        await this.emitTyped(
                            "internal:site:restart-monitoring-response",
                            {
                                identifier: data.identifier,
                                monitorId: data.monitor.id,
                                operation: "restart-monitoring-response",
                                success,
                                timestamp: Date.now(),
                            }
                        );
                    } catch (error) {
                        logger.error(
                            `[UptimeOrchestrator] Error restarting monitoring for site ${data.identifier}:`,
                            error
                        );
                        await this.emitTyped(
                            "internal:site:restart-monitoring-response",
                            {
                                identifier: data.identifier,
                                monitorId: data.monitor.id,
                                operation: "restart-monitoring-response",
                                success: false,
                                timestamp: Date.now(),
                            }
                        );
                    }
                })();
            }
        );
    }

    // Status Information

    /**
     * Validates that all managers are properly initialized.
     *
     * @throws Error if validation fails, with specific context about which manager failed
     *
     * @remarks
     * Performs basic validation that each manager has the expected interface methods.
     * This ensures managers were properly constructed and their critical methods
     * are accessible before the orchestrator begins coordinating operations.
     *
     * A "properly initialized" manager must have its core interface methods
     * available as functions, indicating successful construction and readiness
     * for orchestrated operations.
     */
    private validateInitialization(): void {
        // Basic validation that we can access manager methods
        if (typeof this.databaseManager.initialize !== "function") {
            throw new TypeError(
                "DatabaseManager not properly initialized - missing initialize method"
            );
        }
        if (typeof this.siteManager.initialize !== "function") {
            throw new TypeError(
                "SiteManager not properly initialized - missing initialize method"
            );
        }
        if (typeof this.monitorManager.startMonitoring !== "function") {
            throw new TypeError(
                "MonitorManager not properly initialized - missing startMonitoring method"
            );
        }
    }
}
