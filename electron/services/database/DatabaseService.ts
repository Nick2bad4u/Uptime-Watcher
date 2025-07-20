import { app } from "electron";
import { Database } from "node-sqlite3-wasm";
// eslint-disable-next-line unicorn/import-style -- Need namespace import for both sync and async usage
import * as path from "node:path";

import { DEFAULT_HISTORY_LIMIT } from "../../constants";
import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { Site } from "../../types";
import { initDatabase } from "../../utils/database/databaseInitializer";
import {
    getHistoryLimit as getHistoryLimitUtil,
    setHistoryLimit as setHistoryLimitUtil,
} from "../../utils/database/historyLimitManager";
import {
    createDataBackupService,
    createDataImportExportService,
    createSiteCache,
    createSiteLoadingOrchestrator,
} from "../../utils/database/serviceFactory";
import { logger } from "../../utils/logger";
import { createDatabaseBackup } from "./utils/databaseBackup";
import { createDatabaseIndexes, createDatabaseTables, setupMonitorTypeValidation } from "./utils/databaseSchema";

/**
 * Database service for SQLite connection and transaction management.
 *
 * @remarks
 * Provides a singleton interface for database operations with automatic
 * connection management, schema initialization, and transaction support.
 * All database operations should go through this service for consistency.
 *
 * @example
 * ```typescript
 * const dbService = DatabaseService.getInstance();
 * await dbService.initialize();
 * const db = dbService.getDatabase();
 * ```
 */
export class DatabaseService {
    private static readonly instance: DatabaseService = new DatabaseService();

    private _db: Database | undefined = undefined;
    private historyLimit = DEFAULT_HISTORY_LIMIT;

    /**
     * Private constructor for singleton pattern.
     *
     * @remarks
     * Use {@link DatabaseService.getInstance} to get the service instance.
     */
    private constructor() {
        // Private constructor for singleton pattern
    }

    /**
     * Get the singleton database service instance.
     *
     * @returns The shared DatabaseService instance
     *
     * @remarks
     * Uses singleton pattern to ensure only one database connection
     * exists throughout the application lifecycle.
     */
    public static getInstance(): DatabaseService {
        return DatabaseService.instance;
    }

    /**
     * Close the database connection.
     *
     * @throws {@link Error} When connection close fails
     *
     * @remarks
     * Safely closes the database connection and cleans up resources.
     * Should be called during application shutdown to ensure proper cleanup.
     */
    public close(): void {
        if (this._db) {
            try {
                this._db.close();
                this._db = undefined;
                logger.info("[DatabaseService] Database connection closed");
            } catch (error) {
                logger.error("[DatabaseService] Failed to close database", error);
                throw error;
            }
        }
    }

    /**
     * Create a backup of the database as a downloadable buffer.
     *
     * @returns Promise resolving to backup data and filename
     *
     * @throws {@link Error} When backup creation fails
     *
     * @remarks
     * Creates a compressed backup of the entire database suitable for download or storage.
     * The backup includes all tables, data, and schema information.
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        const { app } = await import("electron");
        const dbPath = path.join(app.getPath("userData"), "uptime-watcher.sqlite");
        return createDatabaseBackup(dbPath);
    }

    /**
     * Create a backup of the database as a downloadable buffer.
     * Enhanced version with event emission support.
     *
     * @param eventEmitter - Optional event emitter for notifications
     * @returns Promise resolving to backup data and filename
     *
     * @throws {@link Error} When backup creation fails
     *
     * @remarks
     * Creates a compressed backup of the entire database suitable for download or storage.
     * The backup includes all tables, data, and schema information. If an event emitter
     * is provided, backup events will be emitted.
     */
    public async downloadBackupWithEvents(
        eventEmitter?: TypedEventBus<UptimeEvents>
    ): Promise<{ buffer: Buffer; fileName: string }> {
        if (eventEmitter) {
            const dataBackupService = createDataBackupService(eventEmitter);
            const result = await dataBackupService.downloadDatabaseBackup();

            // Emit typed backup downloaded event
            await eventEmitter.emitTyped("internal:database:backup-downloaded", {
                fileName: result.fileName,
                operation: "backup-downloaded",
                success: true,
                timestamp: Date.now(),
            });

            return result;
        } else {
            // Fall back to basic downloadBackup for compatibility
            return this.downloadBackup();
        }
    }

    /**
     * Execute a function within a database transaction.
     *
     * @param operation - Function to execute within the transaction
     * @returns Promise resolving to the operation result
     *
     * @throws {@link Error} When transaction fails or operation throws
     *
     * @remarks
     * Automatically handles transaction lifecycle:
     * - Begins transaction before operation
     * - Commits transaction on successful completion
     * - Rolls back transaction if operation throws
     * Ensures data consistency for complex operations involving multiple queries.
     */
    public async executeTransaction<T>(operation: (db: Database) => Promise<T>): Promise<T> {
        const db = this.getDatabase();

        try {
            db.run("BEGIN TRANSACTION");
            const result = await operation(db);
            db.run("COMMIT");
            return result;
        } catch (error) {
            try {
                db.run("ROLLBACK");
            } catch (rollbackError) {
                logger.error("[DatabaseService] Failed to rollback transaction", rollbackError);
            }
            throw error;
        }
    }

    /**
     * Export all application data to JSON string.
     * Consolidated from DatabaseManager for simplified architecture.
     */
    public async exportData(eventEmitter?: TypedEventBus<UptimeEvents>): Promise<string> {
        // If no event emitter provided, create a minimal one for service requirements
        eventEmitter ??= new TypedEventBus<UptimeEvents>();

        const dataImportExportService = createDataImportExportService(eventEmitter);
        const result = await dataImportExportService.exportAllData();

        // Emit typed data exported event if event emitter is available
        await eventEmitter.emitTyped("internal:database:data-exported", {
            fileName: `export-${Date.now()}.json`,
            operation: "data-exported",
            success: true,
            timestamp: Date.now(),
        });

        return result;
    }

    /**
     * Get the database instance.
     *
     * @returns The active database connection
     *
     * @throws {@link Error} When database is not initialized
     *
     * @remarks
     * Call {@link DatabaseService.initialize} first to set up the database connection.
     */
    public getDatabase(): Database {
        if (!this._db) {
            throw new Error("Database not initialized. Call initialize() first.");
        }
        return this._db;
    }

    /**
     * Get current history limit.
     * Consolidated from DatabaseManager for simplified architecture.
     */
    public getHistoryLimit(): number {
        return getHistoryLimitUtil(() => this.historyLimit);
    }

    /**
     * Import data from JSON string.
     * Consolidated from DatabaseManager for simplified architecture.
     */
    public async importData(data: string, eventEmitter?: TypedEventBus<UptimeEvents>): Promise<boolean> {
        // If no event emitter provided, create a minimal one for service requirements
        eventEmitter ??= new TypedEventBus<UptimeEvents>();

        const siteCache = createSiteCache();
        const dataImportExportService = createDataImportExportService(eventEmitter);

        try {
            // Parse the import data
            const { settings, sites } = await dataImportExportService.importDataFromJson(data);

            // Persist to database
            await dataImportExportService.persistImportedData(sites, settings);

            // Clear cache and reload sites
            siteCache.clear();
            await this.initializeWithData(eventEmitter);

            // Emit typed data imported event
            await eventEmitter.emitTyped("internal:database:data-imported", {
                operation: "data-imported",
                success: true,
                timestamp: Date.now(),
            });

            return true;
        } catch (error) {
            // Emit typed data imported event with failure
            await eventEmitter.emitTyped("internal:database:data-imported", {
                operation: "data-imported",
                success: false,
                timestamp: Date.now(),
            });

            logger.error("[DatabaseService] Failed to import data:", error);
            return false;
        }
    }

    /**
     * Initialize the database connection and create tables if they don't exist.
     *
     * @returns The initialized database instance
     *
     * @throws {@link Error} When database initialization fails
     *
     * @remarks
     * Creates the database file in the user data directory if it doesn't exist.
     * Sets up the complete schema including all required tables and indexes.
     * Safe to call multiple times - returns existing connection if already initialized.
     */
    public initialize(): Database {
        if (this._db) {
            return this._db;
        }

        try {
            const dbPath = path.join(app.getPath("userData"), "uptime-watcher.sqlite");
            logger.info(`[DatabaseService] Initializing SQLite DB at: ${dbPath}`);

            this._db = new Database(dbPath);
            createDatabaseTables(this._db);
            createDatabaseIndexes(this._db);
            setupMonitorTypeValidation();

            logger.info("[DatabaseService] Database initialized successfully");
            return this._db;
        } catch (error) {
            logger.error("[DatabaseService] Failed to initialize database", error);
            throw error;
        }
    }

    /**
     * Initialize the database with full setup including data loading.
     * Consolidated from DatabaseManager for simplified architecture.
     */
    public async initializeWithData(eventEmitter?: TypedEventBus<UptimeEvents>): Promise<void> {
        // Initialize the connection first
        this.initialize();

        // If no event emitter provided, create a minimal one for service requirements
        eventEmitter ??= new TypedEventBus<UptimeEvents>();

        await initDatabase(this, () => this.loadSites(eventEmitter), eventEmitter);

        try {
            // Emit typed database initialized event
            await eventEmitter.emitTyped("database:transaction-completed", {
                duration: 0, // Database initialization duration not tracked yet
                operation: "database:initialize",
                recordsAffected: 0,
                success: true,
                timestamp: Date.now(),
            });
        } catch (error) {
            logger.error("[DatabaseService] Error emitting database initialized event:", error);
            // Don't throw here as the database initialization itself succeeded
        }
    }

    /**
     * Set history limit for monitor data retention.
     * Consolidated from DatabaseManager for simplified architecture.
     */
    public async setHistoryLimit(limit: number, eventEmitter?: TypedEventBus<UptimeEvents>): Promise<void> {
        // Import ServiceContainer to get repositories
        const { ServiceContainer } = await import("../ServiceContainer");
        const serviceContainer = ServiceContainer.getInstance();

        await setHistoryLimitUtil({
            databaseService: this,
            limit,
            logger,
            repositories: {
                history: serviceContainer.getHistoryRepository(),
                settings: serviceContainer.getSettingsRepository(),
            },
            setHistoryLimit: (newLimit) => {
                this.historyLimit = newLimit;
                // Emit typed history limit updated event - fire and forget
                if (eventEmitter) {
                    eventEmitter
                        .emitTyped("internal:database:history-limit-updated", {
                            limit: newLimit,
                            operation: "history-limit-updated",
                            timestamp: Date.now(),
                        })
                        .catch((error) => {
                            logger.error("[DatabaseService] Failed to emit history limit updated event", error);
                        });
                }
            },
        });
    }

    /**
     * Load sites from database.
     * Consolidated from DatabaseManager for simplified architecture.
     */
    private async loadSites(eventEmitter: TypedEventBus<UptimeEvents>): Promise<void> {
        // Create the site cache
        const siteCache = createSiteCache();

        // Create the site loading orchestrator
        const siteLoadingOrchestrator = createSiteLoadingOrchestrator(eventEmitter);

        // Create monitoring configuration (minimal implementation for database service)
        const monitoringConfig = {
            setHistoryLimit: async (limit: number) => {
                this.historyLimit = limit;
                // Emit history limit updated event
                await eventEmitter.emitTyped("internal:database:history-limit-updated", {
                    limit,
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                });
            },
            setupNewMonitors: (_site: Site, newMonitorIds: string[]) => {
                // For database loading, we don't need to setup new monitors
                // This is only used during site updates
                logger.debug(
                    `[DatabaseService] setupNewMonitors called for site ${_site.identifier} with ${newMonitorIds.length} monitors - no action needed during loading`
                );
                return Promise.resolve();
            },
            startMonitoring: async (identifier: string, monitorId: string) => {
                // First update the cache so monitoring can find the sites
                await eventEmitter.emitTyped("internal:database:update-sites-cache-requested", {
                    operation: "update-sites-cache-requested",
                    sites: [...siteCache.entries()].map(([, site]) => site),
                    timestamp: Date.now(),
                });

                // Then request monitoring start via events
                await eventEmitter.emitTyped("internal:site:start-monitoring-requested", {
                    identifier,
                    monitorId,
                    operation: "start-monitoring-requested",
                    timestamp: Date.now(),
                });

                return true; // Always return true for the interface
            },
            stopMonitoring: async (identifier: string, monitorId: string) => {
                // Request monitoring stop via events
                await eventEmitter.emitTyped("internal:site:stop-monitoring-requested", {
                    identifier,
                    monitorId,
                    operation: "stop-monitoring-requested",
                    timestamp: Date.now(),
                });

                return true; // Always return true for the interface
            },
        };

        // Load sites using the new service-based architecture
        const result = await siteLoadingOrchestrator.loadSitesFromDatabase(siteCache, monitoringConfig);

        if (!result.success) {
            throw new Error(result.message);
        }

        // Update the cache with loaded sites (final update to ensure consistency)
        await eventEmitter.emitTyped("internal:database:update-sites-cache-requested", {
            operation: "update-sites-cache-requested",
            sites: [...siteCache.entries()].map(([, site]) => site),
            timestamp: Date.now(),
        });

        logger.info(`[DatabaseService] Successfully loaded ${result.sitesLoaded} sites from database`);
    }
}
