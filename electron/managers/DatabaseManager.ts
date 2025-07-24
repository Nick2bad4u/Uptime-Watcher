/**
 * Manages database operations including initialization, data management, and backups.
 *
 * @remarks
 * Handles database initialization, import/export, and backup operations.
 * Uses the new service-based architecture for all operations.
 */

import { withErrorHandling } from "../../shared/utils/errorHandling";
import { DEFAULT_HISTORY_LIMIT } from "../constants";
import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";
import { DatabaseService } from "../services/database/DatabaseService";
import { HistoryRepository } from "../services/database/HistoryRepository";
import { MonitorRepository } from "../services/database/MonitorRepository";
import { SettingsRepository } from "../services/database/SettingsRepository";
import { SiteRepository } from "../services/database/SiteRepository";
import { Site } from "../types";
import { StandardizedCache } from "../utils/cache/StandardizedCache";
import { DataBackupService } from "../utils/database/DataBackupService";
import { initDatabase } from "../utils/database/databaseInitializer";
import { DataImportExportService } from "../utils/database/DataImportExportService";
import { setHistoryLimit as setHistoryLimitUtil } from "../utils/database/historyLimitManager";
import { createSiteCache, LoggerAdapter } from "../utils/database/serviceFactory";
import { SiteLoadingOrchestrator, SiteRepositoryService } from "../utils/database/SiteRepositoryService";
import { monitorLogger } from "../utils/logger";

/**
 * Dependencies interface for DatabaseManager constructor.
 */
export interface DatabaseManagerDependencies {
    eventEmitter: TypedEventBus<DatabaseManagerEvents>;
    repositories: {
        database: DatabaseService;
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };
}

/**
 * Combined events interface for DatabaseManager.
 */
type DatabaseManagerEvents = UptimeEvents;

/**
 * Database operations manager for the Uptime Watcher application.
 *
 * @remarks
 * The DatabaseManager serves as the central coordination point for all database-related
 * operations including initialization, data import/export, backup management, and site
 * loading. It provides a unified interface for database operations while maintaining
 * consistency with the service-based architecture.
 *
 * Key responsibilities:
 * - **Database Initialization**: Setup and schema management
 * - **Data Import/Export**: JSON-based data persistence and restoration
 * - **Backup Management**: SQLite database backup creation and download
 * - **Site Loading**: Coordinated loading of sites from database into cache
 * - **History Management**: Configuration and limits for status history retention
 * - **Event Coordination**: Typed event emission for system-wide coordination
 *
 * The manager uses dependency injection for testability and follows the repository
 * pattern for data access. All operations are designed to be atomic and maintain
 * data consistency using the withErrorHandling utility for standardized error
 * management and logging.
 *
 * @example
 * ```typescript
 * const databaseManager = new DatabaseManager({
 *   eventEmitter: typedEventBus,
 *   repositories: {
 *     database: databaseService,
 *     history: historyRepository,
 *     monitor: monitorRepository,
 *     settings: settingsRepository,
 *     site: siteRepository
 *   }
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
     * Dependencies injected into the DatabaseManager.
     * @readonly
     */
    private readonly dependencies: DatabaseManagerDependencies;
    /**
     * Typed event emitter for database events.
     * @readonly
     */
    private readonly eventEmitter: TypedEventBus<DatabaseManagerEvents>;
    /**
     * Current history limit for status history retention.
     * @defaultValue DEFAULT_HISTORY_LIMIT
     */
    private historyLimit: number = DEFAULT_HISTORY_LIMIT;
    /**
     * Site cache for loaded site data.
     * @readonly
     */
    private readonly siteCache: StandardizedCache<Site>;

    /**
     * Create a new DatabaseManager instance.
     *
     * @param dependencies - Dependencies required for database operations.
     * @remarks
     * Instantiates the site cache and sets up event emitter and repositories.
     */
    constructor(dependencies: DatabaseManagerDependencies) {
        this.dependencies = dependencies;
        this.eventEmitter = dependencies.eventEmitter;
        this.siteCache = createSiteCache();
    }

    /**
     * Download SQLite database backup.
     */
    /**
     * Downloads a SQLite database backup.
     *
     * @returns Promise resolving to an object containing the backup buffer and file name.
     *
     * @example
     * ```typescript
     * const backup = await databaseManager.downloadBackup();
     * // Use backup.buffer and backup.fileName
     * ```
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        const loggerAdapter = new LoggerAdapter(monitorLogger);
        const dataBackupService = new DataBackupService({
            eventEmitter: this.eventEmitter,
            logger: loggerAdapter,
        });
        const result = await dataBackupService.downloadDatabaseBackup();

        // Emit typed backup downloaded event
        await this.eventEmitter.emitTyped("internal:database:backup-downloaded", {
            fileName: result.fileName,
            operation: "backup-downloaded",
            success: true,
            timestamp: Date.now(),
        });

        return result;
    }

    /**
     * Export all application data to JSON string.
     */
    /**
     * Exports all application data to a JSON string.
     *
     * @returns Promise resolving to a JSON string containing all exported data.
     *
     * @example
     * ```typescript
     * const exportData = await databaseManager.exportData();
     * ```
     */
    public async exportData(): Promise<string> {
        const loggerAdapter = new LoggerAdapter(monitorLogger);
        const dataImportExportService = new DataImportExportService({
            databaseService: this.dependencies.repositories.database,
            eventEmitter: this.eventEmitter,
            logger: loggerAdapter,
            repositories: {
                history: this.dependencies.repositories.history,
                monitor: this.dependencies.repositories.monitor,
                settings: this.dependencies.repositories.settings,
                site: this.dependencies.repositories.site,
            },
        });
        const result = await dataImportExportService.exportAllData();

        // Emit typed data exported event
        await this.eventEmitter.emitTyped("internal:database:data-exported", {
            fileName: `export-${Date.now()}.json`,
            operation: "data-exported",
            success: true,
            timestamp: Date.now(),
        });

        return result;
    }

    /**
     * Get current history limit.
     *
     * @returns Current history limit value
     */
    /**
     * Gets the current history limit for status history retention.
     *
     * @returns Current history limit value.
     *
     * @example
     * ```typescript
     * const limit = databaseManager.getHistoryLimit();
     * ```
     */
    public getHistoryLimit(): number {
        return this.historyLimit;
    }

    /**
     * Import data from JSON string with comprehensive error handling.
     *
     * @param data - JSON string containing import data
     * @returns Promise resolving to success status
     *
     * @remarks
     * **Error Handling Pattern:**
     * This method demonstrates the standard error handling pattern used throughout
     * the application: `withErrorHandling()` + `.catch()` chaining.
     *
     * - **withErrorHandling()**: Provides standardized error logging and debugging
     * - **.catch()**: Provides method-specific recovery behavior (events, fallbacks)
     *
     * **Why This Pattern:**
     * 1. **Separation of Concerns**: withErrorHandling handles logging/debugging
     * 2. **Custom Recovery**: .catch() handles method-specific failure behavior
     * 3. **Event Consistency**: Ensures failure events are always emitted
     * 4. **Type Safety**: Maintains return type contracts (boolean/specific types)
     *
     * **Usage Guidelines:**
     * - Use withErrorHandling for all async operations that need error logging
     * - Chain .catch() when you need custom recovery behavior
     * - Always emit failure events in .catch() for observability
     * - Return appropriate fallback values (false, empty arrays, etc.)
     *
     * @example
     * ```typescript
     * // Standard pattern used throughout the application
     * return withErrorHandling(
     *   async () => {
     *     // Main operation logic
     *     return successResult;
     *   },
     *   { logger, operationName: "operation description" }
     * ).catch(async (error) => {
     *   // Method-specific recovery logic
     *   await this.emitFailureEvent();
     *   return fallbackValue;
     * });
     * ```
     */
    public async importData(data: string): Promise<boolean> {
        return withErrorHandling(
            async () => {
                const loggerAdapter = new LoggerAdapter(monitorLogger);
                const dataImportExportService = new DataImportExportService({
                    databaseService: this.dependencies.repositories.database,
                    eventEmitter: this.eventEmitter,
                    logger: loggerAdapter,
                    repositories: {
                        history: this.dependencies.repositories.history,
                        monitor: this.dependencies.repositories.monitor,
                        settings: this.dependencies.repositories.settings,
                        site: this.dependencies.repositories.site,
                    },
                });

                // Parse the import data
                const { settings, sites } = await dataImportExportService.importDataFromJson(data);

                // Persist to database
                await dataImportExportService.persistImportedData(sites, settings);

                // Reload sites from database
                await this.loadSites();

                // Emit typed data imported event
                await this.eventEmitter.emitTyped("internal:database:data-imported", {
                    operation: "data-imported",
                    success: true,
                    timestamp: Date.now(),
                });

                return true;
            },
            { logger: monitorLogger, operationName: "import data" }
        ).catch(async (_error) => {
            // Emit typed data imported event with failure
            try {
                await this.eventEmitter.emitTyped("internal:database:data-imported", {
                    operation: "data-imported",
                    success: false,
                    timestamp: Date.now(),
                });
            } catch (emitError) {
                monitorLogger.error("[DatabaseManager] Failed to emit data imported failure event:", emitError);
            }

            // withErrorHandling already logged the error, so we just return false
            return false;
        });
    }

    /**
     * Initialize the database and load sites.
     */
    /**
     * Initializes the database and loads sites.
     *
     * @returns Promise resolving when initialization is complete.
     *
     * @example
     * ```typescript
     * await databaseManager.initialize();
     * ```
     */
    public async initialize(): Promise<void> {
        /**
         * Initializes the database and loads sites.
         *
         * @returns Promise resolving when initialization is complete.
         *
         * @example
         * ```typescript
         * await databaseManager.initialize();
         * ```
         */
        return withErrorHandling(
            async () => {
                // First, load current settings from database including history limit
                try {
                    const currentLimit = await this.dependencies.repositories.settings.get("historyLimit");
                    if (currentLimit) {
                        this.historyLimit = Number(currentLimit);
                        monitorLogger.info(
                            `[DatabaseManager] Loaded history limit from database: ${this.historyLimit}`
                        );
                    } else {
                        monitorLogger.info(
                            `[DatabaseManager] No history limit in database, using default: ${this.historyLimit}`
                        );
                    }
                } catch (error) {
                    monitorLogger.error(
                        "[DatabaseManager] Failed to load history limit from database, using default:",
                        error
                    );
                }

                await initDatabase(
                    this.dependencies.repositories.database,
                    this.loadSites.bind(this),
                    this.eventEmitter
                );

                // Emit typed database initialized event (with error handling for event emission)
                try {
                    await this.eventEmitter.emitTyped("database:transaction-completed", {
                        duration: 0, // Database initialization duration not tracked yet
                        operation: "database:initialize",
                        recordsAffected: 0,
                        success: true,
                        timestamp: Date.now(),
                    });
                } catch (error) {
                    monitorLogger.error("[DatabaseManager] Error emitting database initialized event:", error);
                    // Don't throw here as the database initialization itself succeeded
                }
            },
            { logger: monitorLogger, operationName: "initialize database" }
        );
    }

    /**
     * Refresh sites from database and update cache.
     *
     * @returns Promise resolving to array of sites
     */
    /**
     * Refreshes sites from the database and updates the cache.
     *
     * @returns Promise resolving to an array of sites.
     *
     * @example
     * ```typescript
     * const sites = await databaseManager.refreshSites();
     * ```
     */
    public async refreshSites(): Promise<Site[]> {
        /**
         * Refreshes sites from the database and updates the cache.
         *
         * @returns Promise resolving to an array of sites.
         *
         * @example
         * ```typescript
         * const sites = await databaseManager.refreshSites();
         * ```
         */
        // Load sites first
        await this.loadSites();

        // Then get them from cache - return actual site data from cache
        try {
            const sites = [...this.siteCache.entries()].map(([, site]) => site);

            // Emit typed sites refreshed event
            await this.eventEmitter.emitTyped("internal:database:sites-refreshed", {
                operation: "sites-refreshed",
                siteCount: sites.length,
                timestamp: Date.now(),
            });

            // Return actual site data instead of hardcoded values
            return sites;
        } catch (error) {
            // Handle error case - log and re-emit event with zero count
            monitorLogger.error("[DatabaseManager] Failed to refresh sites from cache:", error);
            await this.eventEmitter.emitTyped("internal:database:sites-refreshed", {
                operation: "sites-refreshed",
                siteCount: 0,
                timestamp: Date.now(),
            });

            // Return empty array as fallback, but the error is logged for debugging
            // This allows the UI to continue functioning even if cache refresh fails
            return [];
        }
    }

    /**
     * Set history limit for monitor data retention.
     *
     * @param limit - Number of history records to retain (must be non-negative integer, 0 disables history tracking)
     * @throws Error if limit is not a valid non-negative integer
     */
    /**
     * Sets the history limit for status history retention.
     *
     * @param limit - The new history limit value to set.
     * @returns Promise resolving when the history limit is updated.
     *
     * @throws TypeError if limit is not a valid number or integer.
     * @throws RangeError if limit is negative, infinite, or too large.
     *
     * @example
     * ```typescript
     * await databaseManager.setHistoryLimit(100);
     * ```
     */
    public async setHistoryLimit(limit: number): Promise<void> {
        /**
         * Sets the history limit for status history retention.
         *
         * @param limit - The new history limit value to set.
         * @returns Promise resolving when the history limit is updated.
         *
         * @throws TypeError if limit is not a valid number or integer.
         * @throws RangeError if limit is negative, infinite, or too large.
         *
         * @example
         * ```typescript
         * await databaseManager.setHistoryLimit(100);
         * ```
         */
        // Comprehensive input validation
        if (typeof limit !== "number" || Number.isNaN(limit)) {
            throw new TypeError(
                `[DatabaseManager.setHistoryLimit] History limit must be a valid number, received: ${limit} (${typeof limit})`
            );
        }

        if (!Number.isInteger(limit)) {
            throw new TypeError(
                `[DatabaseManager.setHistoryLimit] History limit must be an integer, received: ${limit}`
            );
        }

        if (limit < 0) {
            throw new RangeError(
                `[DatabaseManager.setHistoryLimit] History limit must be non-negative, received: ${limit}`
            );
        }

        if (!Number.isFinite(limit)) {
            throw new RangeError(`[DatabaseManager.setHistoryLimit] History limit must be finite, received: ${limit}`);
        }

        // Reasonable upper bound to prevent performance issues
        const MAX_HISTORY_LIMIT = 1_000_000; // 1 million records
        if (limit > MAX_HISTORY_LIMIT) {
            throw new RangeError(
                `[DatabaseManager.setHistoryLimit] History limit too large (max: ${MAX_HISTORY_LIMIT}), received: ${limit}`
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
            setHistoryLimit: (newLimit) => {
                this.historyLimit = newLimit;
                // Use centralized event emission (fire and forget)
                this.emitHistoryLimitUpdated(newLimit).catch((error) => {
                    monitorLogger.error("[DatabaseManager] Failed to emit history limit updated event:", error);
                });
            },
        });
    }

    /**
     * Centralized method to emit history limit updated event.
     *
     * @param limit - The new history limit
     * @remarks
     * This method consolidates all history limit event emissions to avoid redundancy
     * and ensure consistent event structure across the application.
     */
    /**
     * Emits a history limit updated event.
     *
     * @param limit - The new history limit.
     * @remarks
     * Consolidates all history limit event emissions to avoid redundancy and ensure consistent event structure.
     */
    private async emitHistoryLimitUpdated(limit: number): Promise<void> {
        /**
         * Emits a history limit updated event.
         *
         * @param limit - The new history limit.
         * @remarks
         * Consolidates all history limit event emissions to avoid redundancy and ensure consistent event structure.
         */
        try {
            await this.eventEmitter.emitTyped("internal:database:history-limit-updated", {
                limit,
                operation: "history-limit-updated",
                timestamp: Date.now(),
            });
        } catch (error) {
            monitorLogger.error("[DatabaseManager] Failed to emit history limit updated event:", error);
        }
    }

    /**
     * Centralized method to emit sites cache update requested event.
     *
     * @remarks
     * This method consolidates all sites cache update event emissions to avoid redundancy
     * and ensure consistent event structure across the application.
     */
    /**
     * Emits a sites cache update requested event.
     *
     * @remarks
     * Consolidates all sites cache update event emissions to avoid redundancy and ensure consistent event structure.
     */
    private async emitSitesCacheUpdateRequested(): Promise<void> {
        /**
         * Emits a sites cache update requested event.
         *
         * @remarks
         * Consolidates all sites cache update event emissions to avoid redundancy and ensure consistent event structure.
         */
        try {
            await this.eventEmitter.emitTyped("internal:database:update-sites-cache-requested", {
                operation: "update-sites-cache-requested",
                sites: [...this.siteCache.entries()].map(([, site]) => site),
                timestamp: Date.now(),
            });
        } catch (error) {
            monitorLogger.error("[DatabaseManager] Failed to emit sites cache update requested event:", error);
        }
    }

    /**
     * Load sites from database and update cache using atomic replacement.
     *
     * @remarks
     * This method loads all sites from the database into a temporary cache,
     * then atomically replaces the existing cache to prevent race conditions.
     * It also sets up monitoring configuration for each loaded site.
     * **Race Condition Prevention:**
     * Uses atomic cache replacement instead of clear-then-populate to ensure
     * other operations reading from cache never see empty/inconsistent data.
     * The old cache remains accessible until the new one is fully loaded.
     *
     * @internal
     * This method is private and intended for internal database operations only.
     * External consumers should use public methods like initialize() or refreshSites().
     */
    /**
     * Loads sites from the database and updates the cache using atomic replacement.
     *
     * @remarks
     * Loads all sites from the database into a temporary cache, then atomically replaces the existing cache to prevent race conditions. Sets up monitoring configuration for each loaded site.
     *
     * @internal
     */
    private async loadSites(): Promise<void> {
        /**
         * Loads sites from the database and updates the cache using atomic replacement.
         *
         * @remarks
         * Loads all sites from the database into a temporary cache, then atomically replaces the existing cache to prevent race conditions. Sets up monitoring configuration for each loaded site.
         *
         * @internal
         */
        const operationId = `loadSites-${Date.now()}`;
        monitorLogger.debug(`[DatabaseManager:${operationId}] Starting site loading operation`);

        // Create a temporary cache for atomic replacement (prevents race conditions)
        const tempCache = createSiteCache();

        // Create the site loading orchestrator with injected dependencies
        const loggerAdapter = new LoggerAdapter(monitorLogger);
        const siteRepositoryService = new SiteRepositoryService({
            eventEmitter: this.eventEmitter,
            logger: loggerAdapter,
            repositories: {
                history: this.dependencies.repositories.history,
                monitor: this.dependencies.repositories.monitor,
                settings: this.dependencies.repositories.settings,
                site: this.dependencies.repositories.site,
            },
        });
        const siteLoadingOrchestrator = new SiteLoadingOrchestrator(siteRepositoryService);

        // Create monitoring configuration
        const monitoringConfig = {
            setHistoryLimit: async (limit: number) => {
                this.historyLimit = limit;
                // Centralized history limit event emission
                await this.emitHistoryLimitUpdated(limit);
            },
            setupNewMonitors: (site: Site, newMonitorIds: string[]) => {
                // For database loading, we don't need to setup new monitors
                // This is only used during site updates
                monitorLogger.debug(
                    `[DatabaseManager:${operationId}] setupNewMonitors called for site ${site.identifier} with ${newMonitorIds.length} monitors - no action needed during loading`
                );
                return Promise.resolve();
            },
            startMonitoring: async (identifier: string, monitorId: string) => {
                // First update the cache so monitoring can find the sites
                await this.emitSitesCacheUpdateRequested();

                // Then request monitoring start via events
                await this.eventEmitter.emitTyped("internal:site:start-monitoring-requested", {
                    identifier,
                    monitorId,
                    operation: "start-monitoring-requested",
                    timestamp: Date.now(),
                });

                return true; // Always return true for the interface
            },
            stopMonitoring: async (identifier: string, monitorId: string) => {
                // Request monitoring stop via events
                await this.eventEmitter.emitTyped("internal:site:stop-monitoring-requested", {
                    identifier,
                    monitorId,
                    operation: "stop-monitoring-requested",
                    timestamp: Date.now(),
                });

                return true; // Always return true for the interface
            },
        };

        // Load sites using the new service-based architecture into temporary cache
        const result = await siteLoadingOrchestrator.loadSitesFromDatabase(tempCache, monitoringConfig);

        if (!result.success) {
            throw new Error(result.message);
        }

        // Atomically replace the main cache (prevents race conditions)
        this.siteCache.clear();
        for (const [key, site] of tempCache.entries()) {
            this.siteCache.set(key, site);
        }

        // Update the cache with loaded sites (final update to ensure consistency)
        await this.emitSitesCacheUpdateRequested();

        monitorLogger.info(
            `[DatabaseManager:${operationId}] Successfully loaded ${result.sitesLoaded} sites from database`
        );
    }
}
