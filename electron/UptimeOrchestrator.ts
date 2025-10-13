/**
 * Core uptime monitoring orchestrator that coordinates specialized managers.
 *
 * @remarks
 * Serves as a lightweight coordinator that delegates operations to specialized
 * managers: SiteManager, MonitorManager, and DatabaseManager. Uses
 * TypedEventBus to provide real-time updates to the renderer process with type
 * safety.
 *
 * ## Architecture & Event-Driven Design
 *
 * The orchestrator uses an event-driven architecture for inter-manager
 * communication:
 *
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
 * - **Transactional Operations**: `addSite()`, `removeMonitor()`,
 *   `setHistoryLimit()` - **Error Propagation**: All public methods propagate
 *   errors to callers
 * - **Cleanup on Failure**: Failed operations attempt automatic rollback
 * - **Event Error Isolation**: Event handler errors don't affect other handlers -
 *   **Logging**: All errors are logged with context before propagation
 *
 * ## Atomicity Guarantees
 *
 * - `addSite()`: Atomic site creation with monitoring setup or full rollback
 * - `removeMonitor()`: Atomic monitor removal with proper cleanup
 * - `setHistoryLimit()`: Atomic limit update with history pruning in transaction
 *
 *   - `updateSite()`: Delegated to SiteManager with transaction support
 *
 * Events emitted:
 *
 * - Monitor:status-changed: When monitor status changes
 * - Monitor:down: When a monitor goes down
 * - Monitor:up: When a monitor comes back up
 * - System:error: When system operations fail
 * - Monitoring:started: When monitoring begins
 * - Monitoring:stopped: When monitoring stops
 *
 * @example
 *
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
 * @see {@link DatabaseManager} for database operations and repository pattern
 * @see {@link SiteManager} for site management and caching
 * @see {@link MonitorManager} for monitoring operations and scheduling
 * @see {@link TypedEventBus} for event system implementation
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";

import type { UptimeEvents } from "./events/eventTypes";
import type { DatabaseManager } from "./managers/DatabaseManager";
import type { MonitorManager } from "./managers/MonitorManager";
import type { SiteManager } from "./managers/SiteManager";

import {
    createErrorHandlingMiddleware,
    createLoggingMiddleware,
} from "./events/middleware";
import { TypedEventBus } from "./events/TypedEventBus";
import { logger } from "./utils/logger";

/**
 * Data structure for internal monitoring status check events.
 *
 * @remarks
 * Internal use only for coordinating between managers.
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
 * @remarks
 * Internal use only for coordinating between managers.
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
 * @remarks
 * Internal use only for coordinating between managers.
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
 * @remarks
 * Internal use only for coordinating between managers.
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
 * @remarks
 * Internal use only for coordinating between managers.
 */
interface UpdateSitesCacheRequestData {
    /** Updated sites array for cache synchronization */
    sites: Site[];
}

/**
 * Dependencies for UptimeOrchestrator.
 *
 * @remarks
 * Following the repository pattern and service layer architecture, these
 * managers encapsulate domain-specific operations and provide a clean
 * separation between data access and business logic.
 *
 * Each manager implements the service layer pattern with underlying repository
 * pattern for data persistence, ensuring consistent transaction handling and
 * domain boundaries.
 */
export interface UptimeOrchestratorDependencies {
    /** Database manager for data persistence operations */
    databaseManager: DatabaseManager;
    /** Monitor manager for monitoring lifecycle operations */
    monitorManager: MonitorManager;
    /** Site manager for site management operations */
    siteManager: SiteManager;
}

/**
 * Combined event interface for the orchestrator.
 *
 * @remarks
 * Supports both internal manager events and public frontend events, providing a
 * unified event system for the entire application.
 */
type OrchestratorEvents = UptimeEvents;

export class UptimeOrchestrator extends TypedEventBus<OrchestratorEvents> {
    /**
     * Database manager for all data persistence operations.
     *
     * @remarks
     * Handles database initialization, schema management, repository
     * coordination, and transaction management. All database operations are
     * routed through this manager following the repository pattern. Provides
     * atomic operations and proper error handling for data persistence across
     * the application.
     *
     * @internal
     */
    private readonly databaseManager: DatabaseManager;

    /**
     * Monitor manager for site monitoring operations.
     *
     * @remarks
     * Coordinates monitoring lifecycle, status checking, and monitor scheduling
     * across all sites. Handles monitor registration, execution, and status
     * updates. Integrates with the event system to provide real-time status
     * notifications to the frontend.
     *
     * @internal
     */
    private readonly monitorManager: MonitorManager;

    // Manager instances
    private readonly siteManager: SiteManager;

    // Named event handlers for database events
    /** Event handler for sites cache update requests */
    private readonly handleUpdateSitesCacheRequestedEvent = (
        data: UpdateSitesCacheRequestData
    ): void => {
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
    };

    /**
     * Event handler for retrieving sites from cache.
     *
     * @remarks
     * Handles internal cache retrieval requests and manages error logging. This
     * is an arrow function property to maintain proper 'this' binding when used
     * as an event handler callback. Delegates the actual work to the
     * handleGetSitesFromCacheRequest method.
     *
     * @internal
     */
    private readonly handleGetSitesFromCacheRequestedEvent = (): void => {
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
    };

    /**
     * Event handler for database initialization completion.
     *
     * @remarks
     * Handles notification when database initialization is complete and manages
     * error logging. This is an arrow function property to maintain proper
     * 'this' binding when used as an event handler callback. Delegates the
     * actual work to the handleDatabaseInitialized method.
     *
     * @internal
     */
    private readonly handleDatabaseInitializedEvent = (): void => {
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
    };

    // Named event handlers for event forwarding
    /** Event handler for site addition events */
    private readonly handleSiteAddedEvent = (
        data: SiteEventData & { _meta?: unknown }
    ): void => {
        void (async (): Promise<void> => {
            // Extract original data without _meta to prevent conflicts
            await this.emitTyped("site:added", {
                site: data.site,
                source: "user" as const,
                timestamp: data.timestamp,
            });
        })();
    };

    /**
     * Event handler for site removal events.
     *
     * @remarks
     * Handles site removal events and forwards them to the frontend via the
     * public event system. This is an arrow function property to maintain
     * proper 'this' binding when used as an event handler callback.
     *
     * @param data - Site event data containing site information and metadata
     *
     * @internal
     */
    private readonly handleSiteRemovedEvent = (
        data: SiteEventData & { _meta?: unknown }
    ): void => {
        void (async (): Promise<void> => {
            // Extract original data without _meta to prevent conflicts
            await this.emitTyped("site:removed", {
                cascade: true,
                siteIdentifier: data.identifier ?? data.site.identifier,
                siteName: data.site.name,
                timestamp: data.timestamp,
            });
        })();
    };

    /**
     * Event handler for site update events.
     *
     * @remarks
     * Handles site update events and forwards them to the frontend via the
     * public event system. This is an arrow function property to maintain
     * proper 'this' binding when used as an event handler callback.
     *
     * @param data - Site event data containing site information, metadata, and
     *   previous state
     *
     * @internal
     */
    private readonly handleSiteUpdatedEvent = (
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
    };

    // Named event handlers for monitoring events
    /** Event handler for monitor start events */
    private readonly handleMonitorStartedEvent = (eventData: {
        identifier: string;
        monitorId?: string;
        operation: "started";
        timestamp: number;
    }): void => {
        void (async (): Promise<void> => {
            try {
                const sites = this.siteManager.getSitesFromCache();
                const totalMonitors = sites.reduce(
                    (total: number, site: Site) => total + site.monitors.length,
                    0
                );

                await this.emitTyped("monitoring:started", {
                    monitorCount: totalMonitors,
                    siteCount: sites.length,
                    timestamp: Date.now(),
                });

                // Emit cache invalidation to trigger frontend state refresh
                await this.emitTyped("cache:invalidated", {
                    identifier: eventData.identifier,
                    reason: "update",
                    timestamp: Date.now(),
                    type: "site",
                });
            } catch (error) {
                logger.error(
                    "[UptimeOrchestrator] Error handling internal:monitor:started:",
                    error
                );
            }
        })();
    };

    /**
     * Event handler for monitor stop events.
     *
     * @remarks
     * Handles monitor stop events and manages monitoring state updates. Emits
     * monitoring:stopped events to notify the frontend of changes in monitoring
     * state. This is an arrow function property to maintain proper 'this'
     * binding when used as an event handler callback.
     *
     * @param eventData - Monitor stop event data with timing and reason
     *   information
     *
     * @internal
     */
    private readonly handleMonitorStoppedEvent = (eventData: {
        identifier: string;
        monitorId?: string;
        operation: "stopped";
        reason: string;
        timestamp: number;
    }): void => {
        void (async (): Promise<void> => {
            try {
                // Always get the actual active monitor count from scheduler
                // instead of relying on global monitoring state flag
                const activeMonitors =
                    this.monitorManager.getActiveMonitorCount();

                await this.emitTyped("monitoring:stopped", {
                    activeMonitors,
                    reason: "user" as const,
                    timestamp: Date.now(),
                });

                // Emit cache invalidation to trigger frontend state refresh
                await this.emitTyped("cache:invalidated", {
                    identifier: eventData.identifier,
                    reason: "update",
                    timestamp: Date.now(),
                    type: "site",
                });
            } catch (error) {
                logger.error(
                    "[UptimeOrchestrator] Error handling internal:monitor:stopped:",
                    error
                );
            }
        })();
    };

    // Named event handlers for site management events
    /** Event handler for monitoring start requests */
    private readonly handleStartMonitoringRequestedEvent = (
        data: StartMonitoringRequestData
    ): void => {
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
    };

    /**
     * Event handler for monitoring stop requests.
     *
     * @remarks
     * Handles requests to stop monitoring for specific sites or monitors.
     * Delegates to the monitor manager and provides response events with
     * success status. This is an arrow function property to maintain proper
     * 'this' binding when used as an event handler callback.
     *
     * @param data - Stop monitoring request data with site and monitor
     *   identifiers
     *
     * @internal
     */
    private readonly handleStopMonitoringRequestedEvent = (
        data: StopMonitoringRequestData
    ): void => {
        void (async (): Promise<void> => {
            try {
                const success = await this.monitorManager.stopMonitoringForSite(
                    data.identifier,
                    data.monitorId
                );
                await this.emitTyped("internal:site:stop-monitoring-response", {
                    identifier: data.identifier,
                    monitorId: data.monitorId,
                    operation: "stop-monitoring-response",
                    success,
                    timestamp: Date.now(),
                });
            } catch (error) {
                logger.error(
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
    };

    /**
     * Event handler for monitoring status check requests.
     *
     * @remarks
     * Handles requests to check if monitoring is active for specific sites or
     * monitors. Queries the monitor manager and provides response events with
     * current status. This is an arrow function property to maintain proper
     * 'this' binding when used as an event handler callback.
     *
     * @param data - Monitoring status check request data with site and monitor
     *   identifiers
     *
     * @internal
     */
    private readonly handleIsMonitoringActiveRequestedEvent = (
        data: IsMonitoringActiveRequestData
    ): void => {
        void (async (): Promise<void> => {
            const isActive = this.monitorManager.isMonitorActiveInScheduler(
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
    };

    /** Event handler for monitoring restart requests */
    private readonly handleRestartMonitoringRequestedEvent = (
        data: RestartMonitoringRequestData
    ): void => {
        void (async (): Promise<void> => {
            try {
                // Note: restartMonitorWithNewConfig is intentionally
                // synchronous as it only updates scheduler configuration
                // without async I/O
                const success = this.monitorManager.restartMonitorWithNewConfig(
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
    };

    /**
     * Gets the current history retention limit.
     *
     * @remarks
     * This getter provides convenient property-style access for internal use.
     * The corresponding getHistoryLimit() method exists for IPC compatibility
     * since Electron IPC can only serialize method calls, not property access.
     *
     * @returns The current history limit from DatabaseManager
     */
    public get historyLimit(): number {
        return this.databaseManager.getHistoryLimit();
    }

    /**
     * Adds a new site and sets up monitoring for it. Uses transaction-like
     * behavior to ensure consistency.
     *
     * @param siteData - The site data to add.
     *
     * @returns Promise resolving to the added Site object.
     *
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
     *
     * @returns Promise resolving to a StatusUpdate or undefined if no update
     *   available.
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
     *
     *   - Buffer: Buffer containing the database backup
     *   - FileName: String with the generated backup filename
     */
    public async downloadBackup(): Promise<{
        /** Buffer containing the SQLite database backup data */
        buffer: Buffer;
        /** Generated filename for the backup file */
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
     *
     * @returns Promise resolving to true if import succeeded, false otherwise.
     */
    public async importData(data: string): Promise<boolean> {
        return this.databaseManager.importData(data);
    }

    /**
     * Initializes the orchestrator and all its managers. Ensures proper
     * initialization order and error handling.
     *
     * @returns Promise that resolves when initialization is complete.
     *
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

            // Step 3: Resume monitoring for sites that were monitoring before app restart
            await this.resumePersistentMonitoring();
            logger.info("[UptimeOrchestrator] Persistent monitoring resumed");

            // Step 4: Validate that managers are properly initialized
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
     * Shuts down the orchestrator and removes all event listeners. Ensures
     * proper cleanup to prevent memory leaks.
     *
     * @returns Promise that resolves when shutdown is complete.
     */
    public async shutdown(): Promise<void> {
        try {
            logger.info("[UptimeOrchestrator] Starting shutdown...");

            // Remove specific event listeners using the named handler references
            this.removeEventHandlers();

            // Clear all middleware
            this.clearMiddleware();

            // Add an await for async compliance
            await Promise.resolve();

            logger.info("[UptimeOrchestrator] Shutdown completed successfully");
        } catch (error) {
            logger.error("[UptimeOrchestrator] Shutdown failed:", error);
            throw error;
        }
    }

    /**
     * Removes a monitor from a site and stops its monitoring. Uses a two-phase
     * commit pattern to ensure atomicity.
     *
     * @param siteIdentifier - The site identifier.
     * @param monitorId - The monitor identifier.
     *
     * @returns Promise resolving to true if removed, false otherwise.
     *
     * @throws When the removal operation fails critically
     * @throws When database inconsistency occurs and cannot be resolved
     */
    public async removeMonitor(
        siteIdentifier: string,
        monitorId: string
    ): Promise<boolean> {
        try {
            // Phase 1: Stop monitoring immediately (reversible)
            const monitoringStopped =
                await this.monitorManager.stopMonitoringForSite(
                    siteIdentifier,
                    monitorId
                );

            // If stopping monitoring failed, log warning but continue with
            // database removal The monitor may not be running, but database
            // record should still be removed
            if (!monitoringStopped) {
                logger.warn(
                    `[UptimeOrchestrator] Failed to stop monitoring for ${siteIdentifier}/${monitorId}, but continuing with database removal`
                );
            }

            // Phase 2: Remove monitor from database using transaction
            // (irreversible)
            const databaseRemoved = await this.siteManager.removeMonitor(
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
                    // This is a critical inconsistency - monitor stopped but
                    // database record exists
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
     * @remarks
     * This method delegates to SiteManager for the actual removal operation.
     * Site removal events (site:removed) are emitted by the SiteManager through
     * the event forwarding system, not directly by this orchestrator method.
     *
     * @param identifier - The site identifier.
     *
     * @returns Promise resolving to true if removed, false otherwise.
     */
    public async removeSite(identifier: string): Promise<boolean> {
        const siteSnapshot = this.siteManager.getSiteFromCache(identifier);
        const activeMonitorIds = siteSnapshot
            ? siteSnapshot.monitors
                  .filter((monitor): monitor is Monitor & { id: string } =>
                      Boolean(monitor.id && monitor.monitoring)
                  )
                  .map((monitor) => monitor.id)
            : [];

        if (!siteSnapshot) {
            logger.debug(
                `[UptimeOrchestrator] removeSite(${identifier}) invoked for site missing from cache`
            );
        }

        try {
            const monitoringStopped =
                await this.monitorManager.stopMonitoringForSite(identifier);

            if (!monitoringStopped) {
                logger.warn(
                    `[UptimeOrchestrator] Aborting removal of ${identifier} because monitoring could not be stopped`
                );
                return false;
            }

            const siteRemoved = await this.siteManager.removeSite(identifier);

            if (siteRemoved) {
                return true;
            }

            logger.warn(
                `[UptimeOrchestrator] Site ${identifier} deletion failed after monitoring shutdown; attempting compensation`
            );

            if (activeMonitorIds.length === 0) {
                logger.info(
                    `[UptimeOrchestrator] No active monitors recorded for ${identifier}; skipping restart after failed removal`
                );
                return false;
            }

            /* eslint-disable no-await-in-loop -- Compensation sequence must restart monitors sequentially */
            for (const monitorId of activeMonitorIds) {
                const restartSucceeded =
                    await this.monitorManager.startMonitoringForSite(
                        identifier,
                        monitorId
                    );

                if (!restartSucceeded) {
                    const criticalError = new Error(
                        `Critical state inconsistency: Monitoring stopped for ${identifier} (monitor ${monitorId}) but restart failed after deletion failure`
                    );
                    logger.error(
                        `[UptimeOrchestrator] ${criticalError.message}`
                    );
                    await this.emitTyped("system:error", {
                        context: "site-removal-compensation",
                        error: criticalError,
                        recovery:
                            "Inspect monitor scheduler state and database entries for the affected site",
                        severity: "critical",
                        timestamp: Date.now(),
                    });
                    throw criticalError;
                }
            }
            /* eslint-enable no-await-in-loop -- Re-enable after sequential compensation */

            return false;
        } catch (error) {
            logger.error(
                `[UptimeOrchestrator] Failed to remove site ${identifier}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Removes all sites from the database.
     *
     * @remarks
     * This method is primarily intended for testing purposes to ensure clean
     * test state. It delegates to SiteManager for the actual deletion operation
     * which performs atomic deletion of all sites and their associated monitors
     * using a database transaction. The operation clears both the database and
     * the in-memory cache.
     *
     * All monitoring for all sites will be stopped before deletion occurs.
     * Event notifications are emitted for each site removal to maintain
     * consistency with the event system.
     *
     * @returns Promise resolving to the number of sites deleted.
     *
     * @throws If database operation fails.
     */
    public async deleteAllSites(): Promise<number> {
        try {
            await this.monitorManager.stopMonitoring();
        } catch (error) {
            logger.error(
                "[UptimeOrchestrator] Failed to stop monitoring prior to bulk site deletion:",
                error
            );
            throw error;
        }

        return this.siteManager.deleteAllSites();
    }

    /**
     * Resets all application settings to their default values.
     *
     * @remarks
     * This method delegates to the DatabaseManager to reset all settings to
     * their default values in the database. The operation is performed within a
     * database transaction to ensure consistency.
     *
     * This includes:
     *
     * - History limit reset to default value
     * - Any other persisted settings reset to defaults
     * - Backend cache invalidation
     *
     * @returns Promise that resolves when settings have been reset.
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
     * @param limit - The new history limit (number of entries to retain per
     *   monitor). Values less than or equal to 0 will disable history pruning.
     *
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
     *
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
     *
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
     *
     * @returns Promise resolving to the updated Site object.
     */
    public async updateSite(
        identifier: string,
        updates: Partial<Site>
    ): Promise<Site> {
        return this.siteManager.updateSite(identifier, updates);
    }

    /**
     * Resumes monitoring for sites that were actively monitoring before app
     * restart.
     *
     * @remarks
     * During app startup, sites marked as `monitoring: true` in the database
     * need to be registered with the MonitorScheduler. Without this, the
     * scheduler has no knowledge of pre-existing running monitors, causing stop
     * operations to fail silently.
     *
     * This method only resumes monitoring for individual monitors that were
     * actively monitoring before the restart (monitor.monitoring === true), not
     * for paused monitors.
     *
     * @returns Promise that resolves when all persistent monitoring is resumed
     */
    private async resumePersistentMonitoring(): Promise<void> {
        try {
            // Get all sites from cache (loaded during site manager initialization)
            const sites = this.siteManager.getSitesFromCache();

            // Find all monitors that were actively monitoring before restart
            const monitorsToResume: Array<{ monitor: Monitor; site: Site }> =
                [];

            for (const site of sites) {
                // Only consider sites where monitoring is enabled
                if (site.monitoring) {
                    // Find monitors within this site that were actively monitoring
                    const activeMonitors = site.monitors.filter(
                        (monitor) => monitor.monitoring
                    );
                    for (const monitor of activeMonitors) {
                        monitorsToResume.push({ monitor, site });
                    }
                }
            }

            if (monitorsToResume.length === 0) {
                logger.info(
                    "[UptimeOrchestrator] No monitors require monitoring resumption"
                );
                return;
            }

            logger.info(
                `[UptimeOrchestrator] Resuming monitoring for ${monitorsToResume.length} monitors across ${sites.filter((s) => s.monitoring).length} sites`
            );

            // Resume monitoring for each monitor individually
            const resumePromises = monitorsToResume.map(
                async ({ monitor, site }) => {
                    try {
                        const success =
                            await this.monitorManager.startMonitoringForSite(
                                site.identifier,
                                monitor.id
                            );

                        if (success) {
                            logger.debug(
                                `[UptimeOrchestrator] Successfully resumed monitoring for monitor: ${site.identifier}/${monitor.id}`
                            );
                        } else {
                            logger.warn(
                                `[UptimeOrchestrator] Failed to resume monitoring for monitor: ${site.identifier}/${monitor.id}`
                            );
                        }

                        return success;
                    } catch (error) {
                        logger.error(
                            `[UptimeOrchestrator] Error resuming monitoring for monitor ${site.identifier}/${monitor.id}:`,
                            error
                        );
                        return false;
                    }
                }
            );

            // Wait for all to complete (use allSettled to handle failures gracefully)
            const results = await Promise.allSettled(resumePromises);
            const successCount = results.filter(
                (result) => result.status === "fulfilled" && result.value
            ).length;

            logger.info(
                `[UptimeOrchestrator] Monitoring resumption completed: ${successCount}/${monitorsToResume.length} monitors`
            );
        } catch (error) {
            logger.error(
                "[UptimeOrchestrator] Critical error during monitoring resumption:",
                error
            );
            // Don't throw - allow app initialization to continue
        }
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
     * Handles the update sites cache request asynchronously.
     *
     * @remarks
     * Extracted from event handler to enable proper async handling and testing.
     * Updates the site cache and sets up monitoring for all loaded sites.
     *
     * Uses Promise.allSettled to handle monitoring setup failures gracefully.
     * Critical failures include both rejected promises and fulfilled promises
     * where the operation reported failure. The logic correctly identifies
     * failures by checking either rejected status or successful completion with
     * failure result.
     *
     * @param data - The sites cache update request data
     *
     * @returns Promise that resolves when the cache update is complete
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
            const criticalFailures = setupResults.filter(
                (result) =>
                    result.status === "rejected" || !result.value.success
            ).length;

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
     * Removes all event handlers to prevent memory leaks during shutdown.
     *
     * @remarks
     * Systematically removes all event listeners that were registered during
     * initialization to ensure proper cleanup and prevent memory leaks.
     *
     * @private
     */
    private removeEventHandlers(): void {
        // Remove database event handlers
        this.off(
            "internal:database:update-sites-cache-requested",
            this.handleUpdateSitesCacheRequestedEvent
        );
        this.off(
            "internal:database:get-sites-from-cache-requested",
            this.handleGetSitesFromCacheRequestedEvent
        );
        this.off(
            "internal:database:initialized",
            this.handleDatabaseInitializedEvent
        );

        // Remove site event handlers
        this.off("internal:site:added", this.handleSiteAddedEvent);
        this.off("internal:site:removed", this.handleSiteRemovedEvent);
        this.off("internal:site:updated", this.handleSiteUpdatedEvent);

        // Remove monitoring event handlers
        this.off("internal:monitor:started", this.handleMonitorStartedEvent);
        this.off("internal:monitor:stopped", this.handleMonitorStoppedEvent);

        // Remove site management event handlers
        this.off(
            "internal:site:start-monitoring-requested",
            this.handleStartMonitoringRequestedEvent
        );
        this.off(
            "internal:site:stop-monitoring-requested",
            this.handleStopMonitoringRequestedEvent
        );
        this.off(
            "internal:site:is-monitoring-active-requested",
            this.handleIsMonitoringActiveRequestedEvent
        );
        this.off(
            "internal:site:restart-monitoring-requested",
            this.handleRestartMonitoringRequestedEvent
        );
    }

    /**
     * Constructs a new UptimeOrchestrator with injected dependencies.
     *
     * @remarks
     * Sets up event bus middleware and assigns provided managers.
     * Initialization is performed separately via the initialize() method.
     *
     * Dependencies must be injected through the ServiceContainer pattern rather
     * than creating managers directly. This ensures proper initialization order
     * and dependency management.
     *
     * @example
     *
     * ```typescript
     * const orchestrator = new UptimeOrchestrator({
     *     databaseManager,
     *     monitorManager,
     *     siteManager,
     * });
     * await orchestrator.initialize();
     * ```
     *
     * @param dependencies - The manager dependencies required for orchestration
     *
     * @throws When dependencies are not provided or invalid
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
     * Gets the current history retention limit (method version for IPC
     * compatibility).
     *
     * @remarks
     * This method provides the same value as the historyLimit getter but as a
     * callable method. This is required for Electron IPC compatibility since
     * IPC can serialize method calls but not property access.
     *
     * @returns The current history limit.
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
        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Database event listeners are intentionally persistent for the lifetime of the orchestrator
        this.on(
            "internal:database:update-sites-cache-requested",
            this.handleUpdateSitesCacheRequestedEvent
        );

        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Database event listeners are intentionally persistent for the lifetime of the orchestrator
        this.on(
            "internal:database:get-sites-from-cache-requested",
            this.handleGetSitesFromCacheRequestedEvent
        );

        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Database event listeners are intentionally persistent for the lifetime of the orchestrator
        this.on(
            "internal:database:initialized",
            this.handleDatabaseInitializedEvent
        );
    }

    /**
     * Set up event forwarding from internal events to public frontend events.
     */
    private setupEventForwarding(): void {
        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Event forwarding listeners are intentionally persistent for the lifetime of the orchestrator
        this.on("internal:site:added", this.handleSiteAddedEvent);

        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Event forwarding listeners are intentionally persistent for the lifetime of the orchestrator
        this.on("internal:site:removed", this.handleSiteRemovedEvent);

        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Event forwarding listeners are intentionally persistent for the lifetime of the orchestrator
        this.on("internal:site:updated", this.handleSiteUpdatedEvent);
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
        this.registerMiddleware(
            createErrorHandlingMiddleware({ continueOnError: true })
        );
        this.registerMiddleware(
            createLoggingMiddleware({ includeData: false, level: "info" })
        );
    }

    /**
     * Set up monitoring event handlers.
     */
    private setupMonitoringEventHandlers(): void {
        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Monitoring event listeners are intentionally persistent for the lifetime of the orchestrator
        this.on("internal:monitor:started", this.handleMonitorStartedEvent);

        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Monitoring event listeners are intentionally persistent for the lifetime of the orchestrator
        this.on("internal:monitor:stopped", this.handleMonitorStoppedEvent);
    }

    /**
     * Set up site manager event handlers.
     */
    private setupSiteEventHandlers(): void {
        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Site management event listeners are intentionally persistent for the lifetime of the orchestrator
        this.on(
            "internal:site:start-monitoring-requested",
            this.handleStartMonitoringRequestedEvent
        );

        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Site management event listeners are intentionally persistent for the lifetime of the orchestrator
        this.on(
            "internal:site:stop-monitoring-requested",
            this.handleStopMonitoringRequestedEvent
        );

        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Site management event listeners are intentionally persistent for the lifetime of the orchestrator
        this.on(
            "internal:site:is-monitoring-active-requested",
            this.handleIsMonitoringActiveRequestedEvent
        );

        // eslint-disable-next-line listeners/no-missing-remove-event-listener -- Site management event listeners are intentionally persistent for the lifetime of the orchestrator
        this.on(
            "internal:site:restart-monitoring-requested",
            this.handleRestartMonitoringRequestedEvent
        );
    }

    // Status Information

    /**
     * Validates that all managers are properly initialized.
     *
     * @remarks
     * Performs basic validation that each manager has the expected interface
     * methods. This ensures managers were properly constructed and their
     * critical methods are accessible before the orchestrator begins
     * coordinating operations.
     *
     * A "properly initialized" manager must have its core interface methods
     * available as functions, indicating successful construction and readiness
     * for orchestrated operations.
     *
     * @throws Error if validation fails, with specific context about which
     *   manager failed
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
