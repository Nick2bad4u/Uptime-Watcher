/**
 * Manages database operations including initialization, data management, and
 * backups across the Electron backend.
 *
 * @remarks
 * Handles database initialization, import/export, and backup operations. Uses
 * the new service-based architecture for all operations with comprehensive
 * transaction management, event emission, and error handling patterns.
 *
 * Key responsibilities:
 *
 * - Database initialization and schema management
 * - Data import/export operations with validation
 * - Backup creation and restoration workflows
 * - Transaction coordination across multiple repositories
 * - Event emission for database state changes
 * - Error handling and recovery for database operations
 * - Configuration management for database settings
 *
 * @example Basic database operations:
 *
 * ```typescript
 * const dbManager = new DatabaseManager(eventBus, configManager);
 * await dbManager.initializeDatabase();
 *
 * // Export data
 * const exportResult = await dbManager.exportData();
 *
 * // Create backup
 * const backupResult = await dbManager.createBackup();
 * ```
 *
 * @example Import data with validation:
 *
 * ```typescript
 * const importData = {
 *     sites: [{ url: "example.com", name: "Example" }],
 *     settings: { historyLimit: 1000 },
 * };
 *
 * const result = await dbManager.importData(importData, {
 *     validateData: true,
 *     mergeStrategy: "replace",
 * });
 * ```
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";

import { normalizeHistoryLimit } from "@shared/constants/history";
import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

import type { UptimeEvents } from "../events/eventTypes";
import type { TypedEventBus } from "../events/TypedEventBus";
import type {
    DatabaseBackupResult,
    DatabaseRestorePayload,
    DatabaseRestoreSummary,
} from "../services/database/utils/backup/databaseBackup";
import type { ConfigurationManager } from "./ConfigurationManager";
import type { DatabaseManagerRepositories } from "./databaseRepositorySets";

import { DEFAULT_HISTORY_LIMIT } from "../constants";
import {
    DatabaseCommandExecutor,
    DownloadBackupCommand,
    ExportDataCommand,
    ImportDataCommand,
    RestoreBackupCommand,
} from "../services/commands/DatabaseCommands";
import { setHistoryLimit as setHistoryLimitUtil } from "../services/database/historyLimitManager";
import { createSiteCache } from "../services/database/serviceFactory";
import { SiteLoadingOrchestrator } from "../services/database/SiteRepositoryService";
import { DatabaseServiceFactory } from "../services/factories/DatabaseServiceFactory";
import { StandardizedCache } from "../utils/cache/StandardizedCache";
import { monitorLogger } from "../utils/logger";

/**
 * Defines the dependencies required to construct a {@link DatabaseManager}
 * instance.
 *
 * @remarks
 * This interface is used for dependency injection, enabling testability and
 * modularity. All repositories and services required for database operations
 * must be provided.
 *
 * @see {@link DatabaseManager}
 */
export interface DatabaseManagerDependencies {
    /** The configuration manager for business rules and policies. */
    configurationManager: ConfigurationManager;
    /** The typed event emitter for system-wide coordination. */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** The set of repositories used for all database operations. */
    repositories: DatabaseManagerRepositories;
}

/**
 * Database operations manager for the Uptime Watcher application.
 *
 * @remarks
 * The DatabaseManager serves as the central coordination point for all
 * database-related operations including initialization, data import/export,
 * backup management, and site loading. It provides a unified interface for
 * database operations while maintaining consistency with the service-based
 * architecture.
 *
 * Key responsibilities:
 *
 * - **Database Initialization**: Setup and schema management
 * - **Data Import/Export**: JSON-based data persistence and restoration
 * - **Backup Management**: SQLite database backup creation and download
 * - **Site Loading**: Coordinated loading of sites from database into cache
 * - **History Management**: Configuration and limits for status history retention
 * - **Event Coordination**: Typed event emission for system-wide coordination
 *
 * The manager uses dependency injection for testability and follows the
 * repository pattern for data access. All operations are designed to be atomic
 * and maintain data consistency using the withErrorHandling utility for
 * standardized error management and logging.
 *
 * @example
 *
 * ```typescript
 * const databaseManager = new DatabaseManager({
 *     eventEmitter: typedEventBus,
 *     repositories: {
 *         database: databaseService,
 *         history: historyRepository,
 *         monitor: monitorRepository,
 *         settings: settingsRepository,
 *         site: siteRepository,
 *     },
 * });
 *
 * // Initialize the database and load sites
 * await databaseManager.initialize();
 *
 * // Export application data
 * const exportData = await databaseManager.exportData();
 * ```
 */
export class DatabaseManager {
    /**
     * Executes database commands using the command pattern.
     *
     * @privateRemarks
     * Used internally to decouple command logic from the manager.
     *
     * @readonly
     */
    private readonly commandExecutor: DatabaseCommandExecutor;

    /**
     * Configuration manager for business rules and policies.
     *
     * @readonly
     */
    private readonly configurationManager: ConfigurationManager;

    /**
     * All dependencies injected into the DatabaseManager.
     *
     * @readonly
     */
    private readonly dependencies: DatabaseManagerDependencies;

    /**
     * Typed event emitter for database and system events.
     *
     * @readonly
     */
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    /**
     * Current history limit for status history retention.
     *
     * @defaultValue DEFAULT_HISTORY_LIMIT
     */
    private historyLimit: number = DEFAULT_HISTORY_LIMIT;

    /**
     * Service factory for creating database-related services.
     *
     * @readonly
     */
    private readonly serviceFactory: DatabaseServiceFactory;

    /**
     * Site cache for loaded site data.
     *
     * @readonly
     */
    private readonly siteCache: StandardizedCache<Site>;

    /**
     * Orchestrator for loading site data from the database.
     *
     * @readonly
     */
    private readonly siteLoadingOrchestrator: SiteLoadingOrchestrator;

    /**
     * Downloads a SQLite database backup file.
     *
     * @remarks
     * Uses the command pattern to execute a backup operation and returns the
     * backup buffer and file name.
     *
     * @example
     *
     * ```typescript
     * const backup = await databaseManager.downloadBackup();
     * // Use backup.buffer and backup.fileName
     * ```
     *
     * @returns A promise resolving to an object containing the backup buffer
     *   and file name.
     *
     * @throws Error if backup creation or file system operations fail.
     */
    public async downloadBackup(): Promise<DatabaseBackupResult> {
        const command = new DownloadBackupCommand({
            cache: this.siteCache,
            configurationManager: this.configurationManager,
            eventEmitter: this.eventEmitter,
            serviceFactory: this.serviceFactory,
        });
        return this.commandExecutor.execute(command);
    }

    /**
     * Restores the SQLite database from an uploaded backup payload.
     */
    public async restoreBackup(
        payload: DatabaseRestorePayload
    ): Promise<DatabaseRestoreSummary> {
        return withErrorHandling(
            async () => {
                const command = new RestoreBackupCommand({
                    cache: this.siteCache,
                    configurationManager: this.configurationManager,
                    eventEmitter: this.eventEmitter,
                    payload,
                    serviceFactory: this.serviceFactory,
                });
                try {
                    return await this.commandExecutor.execute(command);
                } finally {
                    try {
                        await this.emitSitesCacheUpdateRequested();
                    } catch (error) {
                        monitorLogger.error(
                            "[DatabaseManager] Failed to emit sites cache update after restore:",
                            error
                        );
                    }
                }
            },
            { logger: monitorLogger, operationName: "restore backup" }
        );
    }

    /**
     * Exports all application data to a JSON string.
     *
     * @remarks
     * Uses the command pattern to serialize all application data for backup or
     * migration.
     *
     * @example
     *
     * ```typescript
     * const exportData = await databaseManager.exportData();
     * ```
     *
     * @returns A promise resolving to a JSON string containing all exported
     *   data.
     *
     * @throws Error if database access or data serialization fails.
     */
    public async exportData(): Promise<string> {
        const command = new ExportDataCommand({
            cache: this.siteCache,
            configurationManager: this.configurationManager,
            eventEmitter: this.eventEmitter,
            serviceFactory: this.serviceFactory,
        });
        return this.commandExecutor.execute(command);
    }

    /**
     * Imports data from a JSON string with comprehensive error handling.
     *
     * @remarks
     * Uses the standard error handling pattern: {@link withErrorHandling} for
     * logging and debugging, and `.catch()` for method-specific recovery and
     * event emission.
     *
     * Event semantics:
     *
     * - On success, {@link ImportDataCommand} emits
     *   `internal:database:data-imported` with `success: true` after cache and
     *   persistence have been updated.
     * - On failure (including command-level or validation errors), this method
     *   emits `internal:database:data-imported` with `success: false` before
     *   returning `false`. This keeps success/failure reporting centralized
     *   while still allowing the command to own the happy-path emission.
     *
     * @param data - The JSON string containing import data.
     *
     * @returns A promise resolving to a boolean indicating success.
     */
    public async importData(data: string): Promise<boolean> {
        try {
            await withErrorHandling(
                async () => {
                    const command = new ImportDataCommand({
                        cache: this.siteCache,
                        configurationManager: this.configurationManager,
                        data,
                        eventEmitter: this.eventEmitter,
                        serviceFactory: this.serviceFactory,
                        updateHistoryLimit: (limit: number): Promise<void> =>
                            this.setHistoryLimit(limit),
                    });
                    await this.commandExecutor.execute(command);
                    await this.emitSitesCacheUpdateRequested();
                },
                { logger: monitorLogger, operationName: "import data" }
            );
            return true;
        } catch {
            // Emit typed data imported event with failure
            try {
                await this.eventEmitter.emitTyped(
                    "internal:database:data-imported",
                    {
                        operation: "data-imported",
                        success: false,
                        timestamp: Date.now(),
                    }
                );
            } catch (emitError) {
                monitorLogger.error(
                    "[DatabaseManager] Failed to emit data imported failure event:",
                    emitError
                );
            }

            // WithErrorHandling already logged the error, so we just return
            // false
            return false;
        }
    }

    /**
     * Initializes the database and loads all sites.
     *
     * @remarks
     * Loads the current history limit from settings, initializes the database,
     * loads all sites, and emits a transaction-completed event. Errors during
     * event emission are logged but do not interrupt initialization.
     *
     * @returns A promise that resolves when initialization is complete.
     *
     * @throws Error if database initialization, site loading, or settings
     *   loading fails.
     */
    public async initialize(): Promise<void> {
        return withErrorHandling(
            async () => {
                // First, load current settings from database including history
                // limit
                const historyRules =
                    this.configurationManager.getHistoryRetentionRules();
                this.historyLimit = historyRules.defaultLimit;

                try {
                    const rawHistoryLimit =
                        await this.dependencies.repositories.settings.get(
                            "historyLimit"
                        );

                    if (rawHistoryLimit === undefined) {
                        monitorLogger.info(
                            `[DatabaseManager] No history limit in database, using default: ${this.historyLimit}`
                        );
                    } else {
                        const parsedHistoryLimit = Number(rawHistoryLimit);

                        try {
                            const normalizedHistoryLimit =
                                normalizeHistoryLimit(
                                    parsedHistoryLimit,
                                    historyRules
                                );

                            this.historyLimit = normalizedHistoryLimit;
                            monitorLogger.info(
                                `[DatabaseManager] Loaded history limit from database: ${this.historyLimit}`
                            );
                        } catch (validationError) {
                            const normalizedError =
                                ensureError(validationError);
                            monitorLogger.warn(
                                "[DatabaseManager] Invalid history limit detected in database; reverting to default",
                                {
                                    defaultApplied: historyRules.defaultLimit,
                                    error: normalizedError.message,
                                    receivedValue: rawHistoryLimit,
                                }
                            );
                        }
                    }
                } catch (error) {
                    const normalizedError = ensureError(error);
                    monitorLogger.error(
                        "[DatabaseManager] Failed to load history limit from database, using default:",
                        normalizedError
                    );
                }

                this.dependencies.repositories.database.initialize();
                await this.loadSites();

                // Emit typed database initialized event (with error handling
                // for event emission)
                try {
                    await this.eventEmitter.emitTyped(
                        "database:transaction-completed",
                        {
                            duration: 0, // Database initialization duration not tracked yet
                            operation: "database:initialize",
                            recordsAffected: 0,
                            success: true,
                            timestamp: Date.now(),
                        }
                    );
                } catch (error) {
                    monitorLogger.error(
                        "[DatabaseManager] Error emitting database initialized event:",
                        error
                    );
                    // Don't throw here as the database initialization itself
                    // succeeded
                }
            },
            { logger: monitorLogger, operationName: "initialize database" }
        );
    }

    /**
     * Refreshes sites from the database and updates the cache.
     *
     * @remarks
     * Loads all sites from the database, updates the cache, emits a
     * sites-refreshed event, and returns the loaded sites. If an error occurs,
     * emits a sites-refreshed event with zero count and returns an empty
     * array.
     *
     * @returns A promise resolving to an array of loaded {@link Site} objects.
     *
     * @throws Error if database access or cache update fails.
     */
    public async refreshSites(): Promise<Site[]> {
        // Load sites first
        await this.loadSites();

        // Then get them from cache - return actual site data from cache
        try {
            const sites = Array.from(
                this.siteCache.entries(),
                ([, site]) => site
            );

            // Emit typed sites refreshed event
            await this.eventEmitter.emitTyped(
                "internal:database:sites-refreshed",
                {
                    operation: "sites-refreshed",
                    siteCount: sites.length,
                    timestamp: Date.now(),
                }
            );

            // Return actual site data instead of hardcoded values
            return sites;
        } catch (error) {
            // Handle error case - log and re-emit event with zero count
            monitorLogger.error(
                "[DatabaseManager] Failed to refresh sites from cache:",
                error
            );
            await this.eventEmitter.emitTyped(
                "internal:database:sites-refreshed",
                {
                    operation: "sites-refreshed",
                    siteCount: 0,
                    timestamp: Date.now(),
                }
            );

            // Return empty array as fallback, but the error is logged for
            // debugging This allows the UI to continue functioning even if
            // cache refresh fails
            return [];
        }
    }

    /**
     * Resets all application settings to their default values.
     *
     * @remarks
     * Resets the history limit and (in the future) other persisted settings to
     * their defaults. The operation is performed within a database transaction
     * for consistency.
     *
     * @returns A promise that resolves when settings have been reset.
     */
    public async resetSettings(): Promise<void> {
        // Reset history limit to default using the existing validated method
        await this.setHistoryLimit(DEFAULT_HISTORY_LIMIT);

        // Future enhancement: Add reset for other settings here
        // Example:
        // await this.dependencies.repositories.settings.resetAllSettings();

        monitorLogger.info("[DatabaseManager] All settings reset to defaults", {
            historyLimit: DEFAULT_HISTORY_LIMIT,
        });
    }

    /**
     * Sets the history limit for status history retention.
     *
     * @remarks
     * Validates the input and updates the history limit in the database and in
     * memory. Emits a history-limit-updated event on success.
     *
     * @param limit - The new history limit value to set.
     *
     * @returns A promise that resolves when the history limit is updated.
     *
     * @throws TypeError if limit is not a valid number or integer.
     * @throws RangeError if limit is infinite or exceeds the configured
     *   maximum.
     */
    public async setHistoryLimit(limit: number): Promise<void> {
        // Comprehensive input validation
        if (typeof limit !== "number" || Number.isNaN(limit)) {
            throw new TypeError(
                `[DatabaseManager.setHistoryLimit] History limit must be a valid number, received: ${limit} (${typeof limit})`
            );
        }

        const historyRules =
            this.configurationManager.getHistoryRetentionRules();

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Configuration manager may temporarily return undefined during development-time schema transitions; surface an explicit error for diagnostics.
        if (!historyRules) {
            throw new TypeError(
                "[DatabaseManager.setHistoryLimit] History retention rules are not configured"
            );
        }

        await setHistoryLimitUtil({
            databaseService: this.dependencies.repositories.database,
            limit,
            logger: monitorLogger,
            repositories: {
                history: this.dependencies.repositories.history,
                settings: this.dependencies.repositories.settings,
            },
            rules: historyRules,
            setHistoryLimit: (newLimit) => {
                this.historyLimit = newLimit;
                // Use centralized event emission (fire and forget)
                this.emitHistoryLimitUpdated(newLimit).catch(
                    (error: unknown) => {
                        monitorLogger.error(
                            "[DatabaseManager] Failed to emit history limit updated event:",
                            error
                        );
                    }
                );
            },
        });
    }

    /**
     * Emits a history limit updated event.
     *
     * @remarks
     * Consolidates all history limit event emissions to avoid redundancy and
     * ensure consistent event structure.
     *
     * @param limit - The new history limit.
     */
    private async emitHistoryLimitUpdated(limit: number): Promise<void> {
        try {
            await this.eventEmitter.emitTyped(
                "internal:database:history-limit-updated",
                {
                    limit,
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                }
            );
        } catch (error) {
            monitorLogger.error(
                "[DatabaseManager] Failed to emit history limit updated event:",
                error
            );
        }
    }

    /**
     * Emits a sites cache update requested event.
     *
     * @remarks
     * Consolidates all sites cache update event emissions to avoid redundancy
     * and ensure consistent event structure.
     */
    private async emitSitesCacheUpdateRequested(): Promise<void> {
        try {
            await this.eventEmitter.emitTyped(
                "internal:database:update-sites-cache-requested",
                {
                    operation: "update-sites-cache-requested",
                    sites: Array.from(
                        this.siteCache.entries(),
                        ([, site]) => site
                    ),
                    timestamp: Date.now(),
                }
            );
        } catch (error) {
            monitorLogger.error(
                "[DatabaseManager] Failed to emit sites cache update requested event:",
                error
            );
        }
    }

    /**
     * Emits a monitoring lifecycle request event for a site/monitor.
     *
     * @remarks
     * Centralizes the request emission and error normalization so start/stop
     * paths do not drift.
     */
    private async emitSiteMonitoringRequested(args: {
        identifier: string;
        kind: "start" | "stop";
        monitorId: string;
    }): Promise<void> {
        try {
            if (args.kind === "start") {
                await this.eventEmitter.emitTyped(
                    "internal:site:start-monitoring-requested",
                    {
                        identifier: args.identifier,
                        monitorId: args.monitorId,
                        operation: "start-monitoring-requested",
                        timestamp: Date.now(),
                    }
                );
                return;
            }

            await this.eventEmitter.emitTyped(
                "internal:site:stop-monitoring-requested",
                {
                    identifier: args.identifier,
                    monitorId: args.monitorId,
                    operation: "stop-monitoring-requested",
                    timestamp: Date.now(),
                }
            );
        } catch (error) {
            monitorLogger.error(
                `[DatabaseManager] Failed to emit ${args.kind} monitoring requested event:`,
                error
            );
            throw error instanceof Error
                ? error
                : new Error(getUserFacingErrorDetail(error));
        }
    }

    /**
     * Loads sites from the database and updates the cache using atomic
     * replacement.
     *
     * @remarks
     * Loads all sites from the database into a temporary cache, then atomically
     * replaces the existing cache to prevent race conditions. Sets up
     * monitoring configuration for each loaded site. Intended for internal use
     * only.
     *
     * @internal
     */
    private async loadSites(): Promise<void> {
        const operationId = `loadSites-${Date.now()}`;
        monitorLogger.debug(
            `[DatabaseManager:${operationId}] Starting site loading operation`
        );

        // Create a temporary cache for atomic replacement (prevents race
        // conditions)
        const tempCache = new StandardizedCache<Site>({
            name: "tempSiteCache",
        });

        // Create monitoring configuration
        const monitoringConfig = {
            setHistoryLimit: async (limit: number): Promise<void> => {
                this.historyLimit = limit;
                // Centralized history limit event emission
                await this.emitHistoryLimitUpdated(limit);
            },
            setupNewMonitors: (
                site: Site,
                newMonitorIds: string[]
            ): Promise<void> => {
                // For database loading, we don't need to setup new monitors
                // This is only used during site updates
                monitorLogger.debug(
                    `[DatabaseManager:${operationId}] setupNewMonitors called for site ${site.identifier} with ${newMonitorIds.length} monitors - no action needed during loading`
                );
                return Promise.resolve();
            },
            startMonitoring: async (
                identifier: string,
                monitorId: string
            ): Promise<boolean> => {
                // First update the cache so monitoring can find the sites
                await this.emitSitesCacheUpdateRequested();

                await this.emitSiteMonitoringRequested({
                    identifier,
                    kind: "start",
                    monitorId,
                });

                return true;
            },
            stopMonitoring: async (
                identifier: string,
                monitorId: string
            ): Promise<boolean> => {
                await this.emitSiteMonitoringRequested({
                    identifier,
                    kind: "stop",
                    monitorId,
                });

                return true;
            },
        };

        // Load sites using the new service-based architecture into temporary
        // cache
        const result = await this.siteLoadingOrchestrator.loadSitesFromDatabase(
            tempCache,
            monitoringConfig
        );

        if (!result.success) {
            throw new Error(result.message);
        }

        // Atomically replace the main cache (prevents race conditions)
        const serializedEntries = Array.from(
            tempCache.entries(),
            ([key, site]) => ({ data: site, key })
        );
        this.siteCache.replaceAll(serializedEntries);

        // Update the cache with loaded sites (final update to ensure
        // consistency)
        await this.emitSitesCacheUpdateRequested();

        monitorLogger.info(
            `[DatabaseManager:${operationId}] Successfully loaded ${result.sitesLoaded} sites from database`
        );
    }

    /**
     * Constructs a new {@link DatabaseManager} instance.
     *
     * @remarks
     * All dependencies are injected for testability and modularity. Services
     * and orchestrators are created using the provided repositories and event
     * emitter.
     *
     * @param dependencies - The set of dependencies required for all database
     *   operations.
     */
    public constructor(dependencies: DatabaseManagerDependencies) {
        this.dependencies = dependencies;
        this.configurationManager = dependencies.configurationManager;
        this.eventEmitter = dependencies.eventEmitter;

        // Create services with injected dependencies (still SOLID compliant)
        this.siteCache = createSiteCache();
        this.serviceFactory = new DatabaseServiceFactory({
            databaseService: dependencies.repositories.database,
            eventEmitter: dependencies.eventEmitter,
            repositories: {
                history: dependencies.repositories.history,
                monitor: dependencies.repositories.monitor,
                settings: dependencies.repositories.settings,
                site: dependencies.repositories.site,
            },
        });

        // Create site loading orchestrator
        const siteRepositoryService =
            this.serviceFactory.createSiteRepositoryService();
        this.siteLoadingOrchestrator = new SiteLoadingOrchestrator(
            siteRepositoryService
        );

        // Initialize command executor
        this.commandExecutor = new DatabaseCommandExecutor();
    }

    /**
     * Gets the current history limit for status history retention.
     *
     * @returns The current history limit value.
     */
    public getHistoryLimit(): number {
        return this.historyLimit;
    }
}
