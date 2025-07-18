/**
 * Manages database operations including initialization, data management, and backups.
 * Handles database initialization, import/export, and backup operations.
 */

import { DEFAULT_HISTORY_LIMIT } from "../constants";
import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";

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
import { DatabaseService } from "../services/database/DatabaseService";
import { HistoryRepository } from "../services/database/HistoryRepository";
import { MonitorRepository } from "../services/database/MonitorRepository";
import { SettingsRepository } from "../services/database/SettingsRepository";
import { SiteRepository } from "../services/database/SiteRepository";
import { Site } from "../types";
import { initDatabase } from "../utils/database/databaseInitializer";
import {
    getHistoryLimit as getHistoryLimitUtil,
    setHistoryLimit as setHistoryLimitUtil,
} from "../utils/database/historyLimitManager";
import {
    createDataBackupOrchestrator,
    createDataImportExportOrchestrator,
    createSiteCache,
    createSiteLoadingOrchestrator,
} from "../utils/database/serviceFactory";
import { monitorLogger as logger } from "../utils/logger";

/**
 * Combined events interface for DatabaseManager.
 */
type DatabaseManagerEvents = UptimeEvents;

/**
 * Manages database operations and data management.
 * Handles initialization, import/export, backup, and history management.
 * Uses the new service-based architecture for all operations.
 */
export class DatabaseManager {
    private readonly dependencies: DatabaseManagerDependencies;
    private readonly eventEmitter: TypedEventBus<DatabaseManagerEvents>;
    private historyLimit: number = DEFAULT_HISTORY_LIMIT;

    constructor(dependencies: DatabaseManagerDependencies) {
        this.dependencies = dependencies;
        this.eventEmitter = dependencies.eventEmitter;
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
     * Get current history limit.
     */
    public getHistoryLimit(): number {
        return getHistoryLimitUtil(() => this.historyLimit);
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
        return result.map((site: { identifier: string; name?: string }) => ({
            identifier: site.identifier,
            monitoring: true,
            monitors: [],
            name: site.name ?? "Unnamed Site",
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
            setHistoryLimit: (newLimit) => {
                this.historyLimit = newLimit;
                // Emit typed history limit updated event - fire and forget
                this.eventEmitter
                    .emitTyped("internal:database:history-limit-updated", {
                        limit: newLimit,
                        operation: "history-limit-updated",
                        timestamp: Date.now(),
                    })
                    .catch((error) => {
                        logger.error("[DatabaseManager] Failed to emit history limit updated event", error);
                    });
            },
        });
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
            setupNewMonitors: (site: Site, newMonitorIds: string[]) => {
                // For database loading, we don't need to setup new monitors
                // This is only used during site updates
                logger.debug(
                    `[DatabaseManager] setupNewMonitors called for site ${site.identifier} with ${newMonitorIds.length} monitors - no action needed during loading`
                );
                return Promise.resolve();
            },
            startMonitoring: async (identifier: string, monitorId: string) => {
                // First update the cache so monitoring can find the sites
                await this.eventEmitter.emitTyped("internal:database:update-sites-cache-requested", {
                    operation: "update-sites-cache-requested",
                    sites: [...siteCache.entries()].map(([, site]) => site),
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
            sites: [...siteCache.entries()].map(([, site]) => site),
            timestamp: Date.now(),
        });

        logger.info(`[DatabaseManager] Successfully loaded ${result.sitesLoaded} sites from database`);
    }
}
