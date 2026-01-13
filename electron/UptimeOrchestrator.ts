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
 *   `setHistoryLimit()`
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
 *
 * - monitor:status-changed: When monitor status changes
 * - monitor:down: When a monitor goes down
 * - monitor:up: When a monitor comes back up
 * - system:error: When system operations fail
 * - monitoring:started: When monitoring begins
 * - monitoring:stopped: When monitoring stops
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

// eslint-disable-next-line comment-length/limit-multi-line-comments -- custom rule for eslint
/* eslint max-lines: ["error", { "max": 2100, "skipBlankLines": true, "skipComments": true }] -- Main orchestrator module */

import type {
    MonitoringStartSummary,
    MonitoringStopSummary,
    Site,
    StatusUpdate,
} from "@shared/types";

import {
    STATE_SYNC_ACTION,
    STATE_SYNC_SOURCE,
    type StateSyncAction,
    type StateSyncSource,
} from "@shared/types/stateSync";
import {
    ApplicationError,
    type ApplicationErrorOptions,
} from "@shared/utils/errorHandling";

import type { UptimeEvents } from "./events/eventTypes";
import type { DatabaseManager } from "./managers/DatabaseManager";
import type { MonitorManager } from "./managers/MonitorManager";
import type { SiteManager } from "./managers/SiteManager";
import type {
    DatabaseBackupMetadata,
    DatabaseBackupResult,
    DatabaseRestorePayload,
    DatabaseRestoreSummary,
} from "./services/database/utils/backup/databaseBackup";
import type {
    IsMonitoringActiveRequestData,
    OrchestratorEvents,
    RestartMonitoringRequestData,
    StartMonitoringRequestData,
    StopMonitoringRequestData,
    UpdateSitesCacheRequestData,
    UptimeOrchestratorDependencies,
} from "./UptimeOrchestrator.types";

import { HistoryLimitCoordinator } from "./coordinators/HistoryLimitCoordinator";
import { MonitoringLifecycleCoordinator } from "./coordinators/MonitoringLifecycleCoordinator";
import { OrchestratorEventForwardingCoordinator } from "./coordinators/OrchestratorEventForwardingCoordinator";
import { SiteLifecycleCoordinator } from "./coordinators/SiteLifecycleCoordinator";
import { SnapshotSyncCoordinator } from "./coordinators/SnapshotSyncCoordinator";
import {
    createErrorHandlingMiddleware,
    createLoggingMiddleware,
} from "./events/middleware";
import { TypedEventBus } from "./events/TypedEventBus";
import { diagnosticsLogger, logger } from "./utils/logger";

/** Logical event bus identifier applied to forwarded renderer events. */
const ORCHESTRATOR_BUS_ID = "UptimeOrchestrator" as const;

/**
 * Core application orchestrator responsible for wiring together the monitoring,
 * database, and event-bus subsystems in the Electron main process.
 *
 * @public
 */
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

    /** Coordinator for history-limit event forwarding. */
    private readonly historyLimitCoordinator: HistoryLimitCoordinator;

    /** Coordinator for site lifecycle operations (add/remove site and monitor). */
    private readonly siteLifecycleCoordinator: SiteLifecycleCoordinator;

    /** Coordinator for monitoring lifecycle operations. */
    private readonly monitoringLifecycleCoordinator: MonitoringLifecycleCoordinator;

    /** Coordinator for snapshot/state synchronization and cache-related flows. */
    private readonly snapshotSyncCoordinator: SnapshotSyncCoordinator;

    /** Coordinator for forwarding internal manager events to renderer consumers. */
    private readonly eventForwardingCoordinator: OrchestratorEventForwardingCoordinator;

    /**
     * Cached initialization promise for idempotent startup.
     *
     * @remarks
     * `initialize()` can be invoked multiple times (tests, re-entrant startup).
     * We treat initialization as idempotent by reusing the first in-flight
     * promise. If initialization fails, the promise is cleared so callers may
     * retry.
     */
    private initializationPromise: Promise<void> | undefined;

    /** Event handler for sites cache update requests */
    private readonly handleUpdateSitesCacheRequestedEvent = (
        data: UpdateSitesCacheRequestData
    ): void => {
        this.snapshotSyncCoordinator.handleUpdateSitesCacheRequestedEvent(data);
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
        this.snapshotSyncCoordinator.handleGetSitesFromCacheRequestedEvent();
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

    /** Event handler for manual monitor check completion events */
    private readonly handleManualCheckCompletedEvent = (
        eventData: UptimeEvents["internal:monitor:manual-check-completed"] & {
            _meta?: unknown;
        }
    ): void => {
        this.snapshotSyncCoordinator.handleManualCheckCompletedEvent(eventData);
    };

    /** Event handler for monitoring start requests */
    private readonly handleStartMonitoringRequestedEvent = (
        data: StartMonitoringRequestData
    ): void => {
        this.monitoringLifecycleCoordinator.handleStartMonitoringRequestedEvent(
            data
        );
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
        this.monitoringLifecycleCoordinator.handleStopMonitoringRequestedEvent(
            data
        );
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
        this.monitoringLifecycleCoordinator.handleIsMonitoringActiveRequestedEvent(
            data
        );
    };

    /** Event handler for monitoring restart requests */
    private readonly handleRestartMonitoringRequestedEvent = (
        data: RestartMonitoringRequestData
    ): void => {
        this.monitoringLifecycleCoordinator.handleRestartMonitoringRequestedEvent(
            data
        );
    };

    /**
     * Executes an operation and normalizes thrown errors via
     * {@link ApplicationError} with contextual metadata.
     */
    private async runWithContext<T>(
        operation: () => Promise<T>,
        options: {
            code: string;
            details?: Record<string, unknown>;
            message: string;
            operation: string;
        }
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            throw this.createContextualError({
                ...options,
                cause: error,
            });
        }
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
        return this.siteLifecycleCoordinator.addSite(siteData);
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
        return this.runWithContext(
            () =>
                this.monitoringLifecycleCoordinator.checkSiteManually(
                    identifier,
                    monitorId
                ),
            {
                code: "ORCHESTRATOR_MANUAL_CHECK_FAILED",
                details: {
                    monitorId,
                    siteIdentifier: identifier,
                },
                message: `Failed to run manual check for site ${identifier}`,
                operation: "orchestrator.checkSiteManually",
            }
        );
    }

    /**
     * Downloads a backup of the SQLite database.
     *
     * @returns Promise resolving to an object with:
     *
     *   - Buffer: Buffer containing the database backup
     *   - FileName: String with the generated backup filename
     */
    public async downloadBackup(): Promise<DatabaseBackupResult> {
        return this.runWithContext(
            () => this.databaseManager.downloadBackup(),
            {
                code: "ORCHESTRATOR_DOWNLOAD_BACKUP_FAILED",
                message: "Failed to download SQLite backup",
                operation: "orchestrator.downloadBackup",
            }
        );
    }

    /**
     * Saves a backup of the SQLite database directly to disk.
     *
     * @remarks
     * Prefer this over {@link downloadBackup} for large databases because it
     * avoids materializing the backup as a large in-memory buffer.
     */
    public async saveBackupToPath(
        targetPath: string
    ): Promise<DatabaseBackupMetadata> {
        return this.runWithContext(
            () => this.databaseManager.saveBackupToPath(targetPath),
            {
                code: "ORCHESTRATOR_SAVE_BACKUP_FAILED",
                message: "Failed to save SQLite backup",
                operation: "orchestrator.saveBackupToPath",
            }
        );
    }

    /**
     * Restores the database from a provided backup payload.
     */
    public async restoreBackup(
        payload: DatabaseRestorePayload
    ): Promise<DatabaseRestoreSummary> {
        return this.runWithContext(
            () => this.databaseManager.restoreBackup(payload),
            {
                code: "ORCHESTRATOR_RESTORE_BACKUP_FAILED",
                message: "Failed to restore SQLite backup",
                operation: "orchestrator.restoreBackup",
            }
        );
    }

    /**
     * Exports all application data as a JSON string.
     *
     * @returns Promise resolving to the exported data string.
     */
    public async exportData(): Promise<string> {
        return this.runWithContext(() => this.databaseManager.exportData(), {
            code: "ORCHESTRATOR_EXPORT_DATA_FAILED",
            message: "Failed to export application data",
            operation: "orchestrator.exportData",
        });
    }

    /**
     * Imports application data from a JSON string.
     *
     * @param data - The JSON data string to import.
     *
     * @returns Promise resolving to true if import succeeded, false otherwise.
     */
    public async importData(data: string): Promise<boolean> {
        return this.runWithContext(
            async () => {
                const importSucceeded =
                    await this.databaseManager.importData(data);

                if (!importSucceeded) {
                    return false;
                }

                const refreshedSites = await this.siteManager.getSites();

                await this.emitSitesStateSynchronized({
                    action: STATE_SYNC_ACTION.BULK_SYNC,
                    siteIdentifier: "all",
                    sites: refreshedSites,
                    source: STATE_SYNC_SOURCE.DATABASE,
                });

                return true;
            },
            {
                code: "ORCHESTRATOR_IMPORT_DATA_FAILED",
                details: { payloadSize: data.length },
                message: "Failed to import application data",
                operation: "orchestrator.importData",
            }
        );
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
        if (this.initializationPromise) {
            await this.initializationPromise;
            return;
        }

        const promise = (async (): Promise<void> => {
            try {
                logger.info("[UptimeOrchestrator] Starting initialization...");

                // Step 1: Initialize database first (required by other managers)
                await this.databaseManager.initialize();
                logger.info(
                    "[UptimeOrchestrator] Database manager initialized"
                );

                // Step 2: Initialize site manager (loads sites from database)
                await this.siteManager.initialize();
                logger.info("[UptimeOrchestrator] Site manager initialized");

                // Step 3: Resume monitoring for sites that were monitoring before app restart
                await this.monitoringLifecycleCoordinator.resumePersistentMonitoring();
                logger.info(
                    "[UptimeOrchestrator] Persistent monitoring resumed"
                );

                // Step 4: Validate that managers are properly initialized
                this.validateInitialization();

                logger.info(
                    "[UptimeOrchestrator] Initialization completed successfully"
                );
            } catch (error) {
                throw this.createContextualError({
                    cause: error,
                    code: "ORCHESTRATOR_INITIALIZE_FAILED",
                    message: "Failed to initialize orchestrator",
                    operation: "orchestrator.initialize",
                });
            }
        })();

        this.initializationPromise = promise;

        try {
            await promise;
        } catch (error) {
            this.initializationPromise = undefined;
            throw error;
        }
    }

    /**
     * Retrieves all sites from the site manager.
     *
     * @returns Promise resolving to an array of Site objects.
     */
    public async getSites(): Promise<Site[]> {
        return this.runWithContext(() => this.siteManager.getSites(), {
            code: "ORCHESTRATOR_GET_SITES_FAILED",
            message: "Failed to retrieve sites",
            operation: "orchestrator.getSites",
        });
    }

    /**
     * Emits a sanitized site state synchronization event.
     *
     * @remarks
     * Delegates to {@link SiteManager.emitSitesStateSynchronized} while
     * preserving orchestrator-level error context. Returns the cloned site
     * snapshot that was dispatched with the event for downstream consumers
     * (e.g., IPC handlers).
     *
     * @param payload - Synchronization parameters controlling the emitted
     *   event.
     *
     * @returns Cloned site snapshots included in the emitted event.
     */
    public async emitSitesStateSynchronized(payload: {
        action: StateSyncAction;
        siteIdentifier: string;
        sites?: Site[];
        source: StateSyncSource;
        timestamp?: number;
    }): Promise<{ revision: number; sites: Site[] }> {
        return this.runWithContext(
            () =>
                this.snapshotSyncCoordinator.emitSitesStateSynchronized(
                    payload
                ),
            {
                code: "ORCHESTRATOR_EMIT_SITES_STATE_SYNC_FAILED",
                message: "Failed to emit site synchronization event",
                operation: "orchestrator.emitSitesStateSynchronized",
            }
        );
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
        await this.runWithContext(() => this.databaseManager.resetSettings(), {
            code: "ORCHESTRATOR_RESET_SETTINGS_FAILED",
            message: "Failed to reset application settings",
            operation: "orchestrator.resetSettings",
        });
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
        await this.runWithContext(
            () => this.databaseManager.setHistoryLimit(limit),
            {
                code: "ORCHESTRATOR_SET_HISTORY_LIMIT_FAILED",
                details: { limit },
                message: "Failed to set history limit",
                operation: "orchestrator.setHistoryLimit",
            }
        );
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
            throw this.createContextualError({
                cause: error,
                code: "ORCHESTRATOR_SHUTDOWN_FAILED",
                message: "Failed to shut down orchestrator",
                operation: "orchestrator.shutdown",
            });
        }
    }

    /**
     * Removes a monitor from a site and stops its monitoring. Uses a two-phase
     * commit pattern to ensure atomicity.
     *
     * @param siteIdentifier - The site identifier.
     * @param monitorId - The monitor identifier.
     *
     * @returns Promise resolving to the updated {@link Site} snapshot after the
     *   monitor has been removed.
     *
     * @throws When the removal operation fails critically
     * @throws When database inconsistency occurs and cannot be resolved
     */
    public async removeMonitor(
        siteIdentifier: string,
        monitorId: string
    ): Promise<Site> {
        return this.siteLifecycleCoordinator.removeMonitor(
            siteIdentifier,
            monitorId
        );
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
        return this.siteLifecycleCoordinator.removeSite(identifier);
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
        return this.siteLifecycleCoordinator.deleteAllSites();
    }

    /**
     * Starts monitoring for all sites.
     *
     * @returns Promise that resolves when monitoring has started.
     */
    public async startMonitoring(): Promise<MonitoringStartSummary> {
        return this.runWithContext(
            () => this.monitoringLifecycleCoordinator.startMonitoring(),
            {
                code: "ORCHESTRATOR_START_MONITORING_FAILED",
                message: "Failed to start monitoring",
                operation: "orchestrator.startMonitoring",
            }
        );
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
        const isMonitorScoped =
            typeof monitorId === "string" && monitorId.length > 0;
        const operation = isMonitorScoped
            ? "orchestrator.startMonitoringForMonitor"
            : "orchestrator.startMonitoringForSite";
        const code = isMonitorScoped
            ? "ORCHESTRATOR_START_MONITORING_FOR_MONITOR_FAILED"
            : "ORCHESTRATOR_START_MONITORING_FOR_SITE_FAILED";

        const message = isMonitorScoped
            ? `Failed to start monitoring for monitor ${monitorId} on site ${identifier}`
            : `Failed to start monitoring for site ${identifier}`;

        return this.runWithContext(
            () =>
                this.monitoringLifecycleCoordinator.startMonitoringForSite(
                    identifier,
                    monitorId
                ),
            {
                code,
                details: { identifier, monitorId },
                message,
                operation,
            }
        );
    }

    /**
     * Starts monitoring for a specific monitor on a site.
     *
     * @remarks
     * This method exists primarily for naming clarity at call sites (e.g. IPC
     * handlers) so that monitor-scoped operations do not route through a
     * `*ForSite` method with an optional monitor identifier.
     */
    public async startMonitoringForMonitor(
        identifier: string,
        monitorId: string
    ): Promise<boolean> {
        return this.startMonitoringForSite(identifier, monitorId);
    }

    /**
     * Stops monitoring for all sites.
     *
     * @returns Promise that resolves when monitoring has stopped.
     */
    public async stopMonitoring(): Promise<MonitoringStopSummary> {
        return this.runWithContext(
            () => this.monitoringLifecycleCoordinator.stopMonitoring(),
            {
                code: "ORCHESTRATOR_STOP_MONITORING_FAILED",
                message: "Failed to stop monitoring",
                operation: "orchestrator.stopMonitoring",
            }
        );
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
        const isMonitorScoped =
            typeof monitorId === "string" && monitorId.length > 0;
        const operation = isMonitorScoped
            ? "orchestrator.stopMonitoringForMonitor"
            : "orchestrator.stopMonitoringForSite";
        const code = isMonitorScoped
            ? "ORCHESTRATOR_STOP_MONITORING_FOR_MONITOR_FAILED"
            : "ORCHESTRATOR_STOP_MONITORING_FOR_SITE_FAILED";
        const message = isMonitorScoped
            ? `Failed to stop monitoring for monitor ${monitorId} on site ${identifier}`
            : `Failed to stop monitoring for site ${identifier}`;

        return this.runWithContext(
            () =>
                this.monitoringLifecycleCoordinator.stopMonitoringForSite(
                    identifier,
                    monitorId
                ),
            {
                code,
                details: { identifier, monitorId },
                message,
                operation,
            }
        );
    }

    /**
     * Stops monitoring for a specific monitor on a site.
     *
     * @remarks
     * Naming clarity wrapper around {@link stopMonitoringForSite}.
     */
    public async stopMonitoringForMonitor(
        identifier: string,
        monitorId: string
    ): Promise<boolean> {
        return this.stopMonitoringForSite(identifier, monitorId);
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
        return this.runWithContext(
            () => this.siteManager.updateSite(identifier, updates),
            {
                code: "ORCHESTRATOR_UPDATE_SITE_FAILED",
                details: { identifier, updatedFields: Object.keys(updates) },
                message: `Failed to update site ${identifier}`,
                operation: "orchestrator.updateSite",
            }
        );
    }

    /**
     * Handles the database initialized event asynchronously.
     *
     * @returns Promise that resolves when the event handling is complete
     */
    private async handleDatabaseInitialized(): Promise<void> {
        // NOTE: DatabaseManager.initialize() already emits a
        // "database:transaction-completed" event with operation
        // "database:initialize" for the low-level schema/setup work. This
        // orchestrator-level event intentionally uses the shorter
        // "initialize" operation label to represent the higher-level
        // Orchestrator bootstrap phase (database + site manager + monitoring
        // wiring). Consumers that care about a specific phase should filter
        // on the `operation` field rather than assuming a single
        // initialization emission.
        await this.emitTyped("database:transaction-completed", {
            duration: 0,
            operation: "initialize",
            success: true,
            timestamp: Date.now(),
        });
    }

    /**
     * Retrieves the current number of cached sites without touching the
     * database.
     *
     * @remarks
     * Leverages the {@link SiteManager} in-memory cache to avoid redundant
     * round-trips through the repository layer when only aggregate metadata is
     * required (for example, sync status calls).
     *
     * @returns The number of sites currently tracked in the cache.
     */
    public getCachedSiteCount(): number {
        return this.siteManager.getSitesFromCache().length;
    }

    /**
     * Build an {@link ApplicationError} with standardized logging context.
     */
    private createContextualError(options: {
        cause: unknown;
        code: string;
        details?: Record<string, unknown>;
        message: string;
        operation: string;
    }): ApplicationError {
        const { cause, code, details, message, operation } = options;

        const errorOptions: ApplicationErrorOptions = {
            cause,
            code,
            message,
            operation,
            ...(details ? { details } : {}),
        };

        const appError = new ApplicationError(errorOptions);

        logger.error(appError.message, {
            code,
            details,
            error: cause,
            operation,
        });

        diagnosticsLogger.error(`[UptimeOrchestrator] ${operation} failed`, {
            code,
            details,
            error: appError,
        });

        return appError;
    }

    // Named event handlers for database events

    // Named event handlers for event forwarding

    // Named event handlers for monitoring events

    // Named event handlers for site management events

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
     * Removes all event handlers to prevent memory leaks during shutdown.
     *
     * @remarks
     * Systematically removes all event listeners that were registered during
     * initialization to ensure proper cleanup and prevent memory leaks.
     *
     * @private
     */
    private removeEventHandlers(): void {
        this.historyLimitCoordinator.unregister();
        this.eventForwardingCoordinator.unregister();

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

        // Remove monitoring event handlers
        this.off(
            "internal:monitor:manual-check-completed",
            this.handleManualCheckCompletedEvent
        );

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
        this.historyLimitCoordinator = new HistoryLimitCoordinator({
            databaseManager: this.databaseManager,
            eventBus: this,
        });

        this.siteLifecycleCoordinator = new SiteLifecycleCoordinator({
            createContextualError: (input): ApplicationError =>
                this.createContextualError(input),
            emitSystemError: async (payload): Promise<void> => {
                await this.emitTyped("system:error", payload);
            },
            monitorManager: this.monitorManager,
            siteManager: this.siteManager,
        });

        this.monitoringLifecycleCoordinator =
            new MonitoringLifecycleCoordinator({
                emitTyped: (eventName, payload): Promise<void> =>
                    this.emitTyped(eventName as string, payload),
                monitorManager: this.monitorManager,
                siteManager: this.siteManager,
            });

        this.snapshotSyncCoordinator = new SnapshotSyncCoordinator({
            busId: ORCHESTRATOR_BUS_ID,
            emitTyped: (eventName, payload): Promise<void> =>
                this.emitTyped(eventName as string, payload),
            monitorManager: this.monitorManager,
            siteManager: this.siteManager,
        });

        this.eventForwardingCoordinator = new OrchestratorEventForwardingCoordinator(
            {
                busId: ORCHESTRATOR_BUS_ID,
                eventBus: this,
                monitorManager: this.monitorManager,
                siteManager: this.siteManager,
            }
        );

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
     * Set up event handlers for inter-manager communication.
     */
    private setupEventHandlers(): void {
        this.setupDatabaseEventHandlers();
        this.historyLimitCoordinator.register();
        this.eventForwardingCoordinator.register();
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
        this.on(
            "internal:monitor:manual-check-completed",
            this.handleManualCheckCompletedEvent
        );
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
