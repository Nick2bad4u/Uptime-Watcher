/**
 * Manages database operations including initialization, data management, and backups.
 * Handles database initialization, import/export, and backup operations.
 */

import { DEFAULT_HISTORY_LIMIT } from "../constants";
import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";

/**
 * Combined events interface for DatabaseManager.
 */
type DatabaseManagerEvents = UptimeEvents;
import {
    DatabaseService,
    SiteRepository,
    MonitorRepository,
    HistoryRepository,
    SettingsRepository,
} from "../services/database";
import { Site } from "../types";
import {
    initDatabase,
    getHistoryLimit as getHistoryLimitUtil,
    setHistoryLimit as setHistoryLimitUtil,
    createSiteLoadingOrchestrator,
    createSiteCache,
    createDataImportExportOrchestrator,
    createDataBackupOrchestrator,
} from "../utils/database";
import { monitorLogger as logger } from "../utils/logger";

export interface DatabaseManagerDependencies {
    eventEmitter: TypedEventBus<DatabaseManagerEvents>;
    repositories: {
        database: DatabaseService;
        site: SiteRepository;
        monitor: MonitorRepository;
        history: HistoryRepository;
        settings: SettingsRepository;
    };
}

/**
 * Manages database operations and data management.
 * Handles initialization, import/export, backup, and history management.
 * Uses the new service-based architecture for all operations.
 */
export class DatabaseManager {
    private historyLimit: number = DEFAULT_HISTORY_LIMIT;
    private readonly dependencies: DatabaseManagerDependencies;
    private readonly eventEmitter: TypedEventBus<DatabaseManagerEvents>;

    constructor(dependencies: DatabaseManagerDependencies) {
        this.dependencies = dependencies;
        this.eventEmitter = dependencies.eventEmitter;
    }

    /**
     * Initialize the database and load sites.
     */
    public async initialize(): Promise<void> {
        await initDatabase(this.dependencies.repositories.database, () => this.loadSites(), this.eventEmitter);

        try {
            // Emit typed database initialized event
            await this.eventEmitter.emitTyped("database:transaction-completed", {
                duration: 0, // Database initialization duration not tracked yet
                operation: "database:initialize",
                recordsAffected: 0,
                success: true,
                timestamp: Date.now(),
            });
        } catch (error) {
            logger.error("[DatabaseManager] Error emitting database initialized event:", error);
            // Don't throw here as the database initialization itself succeeded
        }
    }

    /**
     * Load sites from database and update cache.
     */
    private async loadSites(): Promise<void> {
        // Create the site cache
        const siteCache = createSiteCache();

        // Create the site loading orchestrator
        const siteLoadingOrchestrator = createSiteLoadingOrchestrator(this.eventEmitter);

        // Create monitoring configuration
        const monitoringConfig = {
            setHistoryLimit: async (limit: number) => {
                this.historyLimit = limit;
                // Emit history limit updated event
                await this.eventEmitter.emitTyped("internal:database:history-limit-updated", {
                    limit,
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                });
            },
            startMonitoring: async (identifier: string, monitorId: string) => {
                // First update the cache so monitoring can find the sites
                await this.eventEmitter.emitTyped("internal:database:update-sites-cache-requested", {
                    operation: "update-sites-cache-requested",
                    sites: Array.from(siteCache.entries()).map(([, site]) => site),
                    timestamp: Date.now(),
                });

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

        // Load sites using the new service-based architecture
        const result = await siteLoadingOrchestrator.loadSitesFromDatabase(siteCache, monitoringConfig);

        if (!result.success) {
            throw new Error(result.message);
        }

        // Update the cache with loaded sites (final update to ensure consistency)
        await this.eventEmitter.emitTyped("internal:database:update-sites-cache-requested", {
            operation: "update-sites-cache-requested",
            sites: Array.from(siteCache.entries()).map(([, site]) => site),
            timestamp: Date.now(),
        });

        logger.info(`[DatabaseManager] Successfully loaded ${result.sitesLoaded} sites from database`);
    }

    /**
     * Export all application data to JSON string.
     */
    public async exportData(): Promise<string> {
        const dataImportExportOrchestrator = createDataImportExportOrchestrator(this.eventEmitter);
        const result = await dataImportExportOrchestrator.exportData();

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
     * Import data from JSON string.
     */
    public async importData(data: string): Promise<boolean> {
        const siteCache = createSiteCache();
        const dataImportExportOrchestrator = createDataImportExportOrchestrator(this.eventEmitter);

        const result = await dataImportExportOrchestrator.importData(data, siteCache, () => this.loadSites());

        // Emit typed data imported event
        await this.eventEmitter.emitTyped("internal:database:data-imported", {
            operation: "data-imported",
            success: result.success,
            timestamp: Date.now(),
        });

        return result.success;
    }

    /**
     * Download SQLite database backup.
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        const dataBackupOrchestrator = createDataBackupOrchestrator(this.eventEmitter);
        const result = await dataBackupOrchestrator.downloadBackup();

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
     * Refresh sites from database and update cache.
     */
    public async refreshSites(): Promise<Site[]> {
        const siteCache = createSiteCache();
        const dataBackupOrchestrator = createDataBackupOrchestrator(this.eventEmitter);

        // Load sites first
        await this.loadSites();

        // Then get them from cache
        const result = await dataBackupOrchestrator.refreshSitesFromCache(siteCache);

        // Emit typed sites refreshed event
        await this.eventEmitter.emitTyped("internal:database:sites-refreshed", {
            operation: "sites-refreshed",
            siteCount: result.length,
            timestamp: Date.now(),
        });

        // Convert to Site[] format expected by the interface
        return result.map((site) => ({
            identifier: site.identifier,
            monitors: [],
            ...(site.name && { name: site.name }),
        }));
    }

    /**
     * Set history limit for monitor data retention.
     */
    public async setHistoryLimit(limit: number): Promise<void> {
        await setHistoryLimitUtil({
            databaseService: this.dependencies.repositories.database,
            limit,
            logger,
            repositories: {
                history: this.dependencies.repositories.history,
                settings: this.dependencies.repositories.settings,
            },
            setHistoryLimit: async (newLimit) => {
                this.historyLimit = newLimit;
                // Emit typed history limit updated event
                await this.eventEmitter.emitTyped("internal:database:history-limit-updated", {
                    limit: newLimit,
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                });
            },
        });
    }

    /**
     * Get current history limit.
     */
    public getHistoryLimit(): number {
        return getHistoryLimitUtil(() => this.historyLimit);
    }
}
