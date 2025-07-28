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
import {
    DatabaseCommandExecutor,
    DownloadBackupCommand,
    ExportDataCommand,
    ImportDataCommand,
} from "../services/commands/DatabaseCommands";
import { DatabaseService } from "../services/database/DatabaseService";
import { HistoryRepository } from "../services/database/HistoryRepository";
import { MonitorRepository } from "../services/database/MonitorRepository";
import { SettingsRepository } from "../services/database/SettingsRepository";
import { SiteRepository } from "../services/database/SiteRepository";
import { DatabaseServiceFactory } from "../services/factories/DatabaseServiceFactory";
import { Site } from "../types";
import { StandardizedCache } from "../utils/cache/StandardizedCache";
import { setHistoryLimit as setHistoryLimitUtil } from "../utils/database/historyLimitManager";
import { createSiteCache } from "../utils/database/serviceFactory";
import { SiteLoadingOrchestrator } from "../utils/database/SiteRepositoryService";
import { monitorLogger } from "../utils/logger";
import { ConfigurationManager } from "./ConfigurationManager";

/**
 * Dependencies interface for DatabaseManager constructor.
 */
export interface DatabaseManagerDependencies {
    configurationManager: ConfigurationManager;
    eventEmitter: TypedEventBus<UptimeEvents>;
    repositories: {
        database: DatabaseService;
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };
}

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
     * Command executor for database operations.
     * @readonly
     */
    private readonly commandExecutor: DatabaseCommandExecutor;

    /**
     * Configuration manager for business rules and policies.
     * @readonly
     */
    private readonly configurationManager: ConfigurationManager;

    /**
     * Dependencies injected into the DatabaseManager.
     * @readonly
     */
    private readonly dependencies: DatabaseManagerDependencies;
    /**
     * Typed event emitter for database events.
     * @readonly
     */
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;
    /**
     * Current history limit for status history retention.
     * @defaultValue DEFAULT_HISTORY_LIMIT
     */
    private historyLimit: number = DEFAULT_HISTORY_LIMIT;
    /**
     * Service factory for creating database services.
     * @readonly
     */
    private readonly serviceFactory: DatabaseServiceFactory;
    /**
     * Site cache for loaded site data.
     * @readonly
     */
    private readonly siteCache: StandardizedCache<Site>;
    /**
     * Site loading orchestrator for data loading operations.
     * @readonly
     */
    private readonly siteLoadingOrchestrator: SiteLoadingOrchestrator;

    /**
     * Create a new DatabaseManager instance.
     *
     * @param dependencies - Dependencies required for database operations.
     * @remarks
     * Services are created with proper dependency injection patterns.
     */
    constructor(dependencies: DatabaseManagerDependencies) {
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
        const siteRepositoryService = this.serviceFactory.createSiteRepositoryService();
        this.siteLoadingOrchestrator = new SiteLoadingOrchestrator(siteRepositoryService);

        // Initialize command executor
        this.commandExecutor = new DatabaseCommandExecutor();
    }

    /**
     * Downloads a SQLite database backup.
     *
     * @returns Promise resolving to an object containing the backup buffer and file name.
     * @throws When backup creation fails or file system operations fail
     *
     * @example
     * ```typescript
     * const backup = await databaseManager.downloadBackup();
     * // Use backup.buffer and backup.fileName
     * ```
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        const command = new DownloadBackupCommand(this.serviceFactory, this.eventEmitter, this.siteCache);
        return this.commandExecutor.execute(command);
    }

    /**
     * Exports all application data to a JSON string.
     *
     * @returns Promise resolving to a JSON string containing all exported data.
     * @throws When database access fails or data serialization fails
     *
     * @example
     * ```typescript
     * const exportData = await databaseManager.exportData();
     * ```
     */
    public async exportData(): Promise<string> {
        const command = new ExportDataCommand(this.serviceFactory, this.eventEmitter, this.siteCache);
        return this.commandExecutor.execute(command);
    }

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
                const command = new ImportDataCommand(this.serviceFactory, this.eventEmitter, this.siteCache, data);
                await this.commandExecutor.execute(command);
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
     * Initializes the database and loads sites.
     *
     * @returns Promise resolving when initialization is complete.
     * @throws When database initialization fails
     * @throws When site loading fails during initialization
     * @throws When settings loading fails
     *
     * @example
     * ```typescript
     * await databaseManager.initialize();
     * ```
     */
    public async initialize(): Promise<void> {
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

                this.dependencies.repositories.database.initialize();
                await this.loadSites();

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
     * Refreshes sites from the database and updates the cache.
     *
     * @returns Promise resolving to an array of sites.
     * @throws When database access fails or cache update fails
     *
     * @example
     * ```typescript
     * const sites = await databaseManager.refreshSites();
     * ```
     */
    public async refreshSites(): Promise<Site[]> {
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
     * Reset all application settings to their default values.
     *
     * @returns Promise resolving when settings have been reset.
     *
     * @remarks
     * This method resets all application settings to their default values,
     * including:
     * - History limit reset to DEFAULT_HISTORY_LIMIT
     * - Any other persisted settings reset to defaults
     *
     * The operation is performed within a database transaction to ensure
     * consistency across all setting changes.
     *
     * @example
     * ```typescript
     * await databaseManager.resetSettings();
     * ```
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
     * @param limit - The new history limit value to set.
     * @returns Promise resolving when the history limit is updated.
     * @throws TypeError if limit is not a valid number or integer.
     * @throws RangeError if limit is negative, infinite, or too large.
     *
     * @example
     * ```typescript
     * await databaseManager.setHistoryLimit(100);
     * ```
     */
    public async setHistoryLimit(limit: number): Promise<void> {
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

        // Use ConfigurationManager to get proper business rules for history limits
        const historyRules = this.configurationManager.getHistoryRetentionRules();
        if (limit > historyRules.maxLimit) {
            throw new RangeError(
                `[DatabaseManager.setHistoryLimit] History limit too large (max: ${historyRules.maxLimit}), received: ${limit}`
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
     * Emits a history limit updated event.
     *
     * @param limit - The new history limit.
     * @remarks
     * Consolidates all history limit event emissions to avoid redundancy and ensure consistent event structure.
     */
    private async emitHistoryLimitUpdated(limit: number): Promise<void> {
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
     * Emits a sites cache update requested event.
     *
     * @remarks
     * Consolidates all sites cache update event emissions to avoid redundancy and ensure consistent event structure.
     */
    private async emitSitesCacheUpdateRequested(): Promise<void> {
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
     * Loads sites from the database and updates the cache using atomic replacement.
     *
     * @remarks
     * Loads all sites from the database into a temporary cache, then atomically replaces the existing cache to prevent race conditions. Sets up monitoring configuration for each loaded site.
     *
     * @internal
     */
    private async loadSites(): Promise<void> {
        const operationId = `loadSites-${Date.now()}`;
        monitorLogger.debug(`[DatabaseManager:${operationId}] Starting site loading operation`);

        // Create a temporary cache for atomic replacement (prevents race conditions)
        const tempCache = new StandardizedCache<Site>({ name: "tempSiteCache" });

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
        const result = await this.siteLoadingOrchestrator.loadSitesFromDatabase(tempCache, monitoringConfig);

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
