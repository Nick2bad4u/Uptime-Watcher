/**
 * Manages database operations including initialization, data management, and backups.
 * Handles database initialization, import/export, and backup operations.
 */

import { EventEmitter } from "events";

import { DEFAULT_HISTORY_LIMIT } from "../constants";
import { DATABASE_EVENTS, SITE_EVENTS, DatabaseEventData, SiteEventData } from "../events";
import {
    DatabaseService,
    SiteRepository,
    MonitorRepository,
    HistoryRepository,
    SettingsRepository,
} from "../services/database";
import { Site } from "../types";
import {
    downloadBackup,
    refreshSites,
    DataBackupDependencies,
    DataBackupCallbacks,
    initDatabase,
    exportData,
    importData,
    DataImportExportDependencies,
    DataImportExportCallbacks,
    getHistoryLimit as getHistoryLimitUtil,
    setHistoryLimit as setHistoryLimitUtil,
    loadSitesFromDatabase,
} from "../utils/database";
import { monitorLogger as logger } from "../utils/logger";

export interface DatabaseManagerDependencies {
    eventEmitter: EventEmitter;
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
 */
export class DatabaseManager extends EventEmitter {
    private historyLimit: number = DEFAULT_HISTORY_LIMIT;
    private readonly dependencies: DatabaseManagerDependencies;
    private readonly eventEmitter: EventEmitter;

    constructor(dependencies: DatabaseManagerDependencies) {
        super();
        this.dependencies = dependencies;
        this.eventEmitter = dependencies.eventEmitter;
    }

    /**
     * Initialize the database and load sites.
     */
    public async initialize(): Promise<void> {
        await initDatabase(this.dependencies.repositories.database, () => this.loadSites(), this.eventEmitter);

        // Emit database initialized event
        const initEventData: DatabaseEventData = {
            operation: "initialized",
        };
        this.eventEmitter.emit(DATABASE_EVENTS.INITIALIZED, initEventData);
    }

    /**
     * Load sites from database and update cache.
     */
    private async loadSites(): Promise<void> {
        const sitesMap = new Map<string, Site>();

        await loadSitesFromDatabase({
            eventEmitter: this.eventEmitter,
            repositories: {
                history: this.dependencies.repositories.history,
                monitor: this.dependencies.repositories.monitor,
                settings: this.dependencies.repositories.settings,
                site: this.dependencies.repositories.site,
            },
            setHistoryLimit: (limit) => {
                this.historyLimit = limit;
                // Emit history limit updated event
                const eventData: DatabaseEventData = {
                    limit,
                    operation: "history-limit-updated",
                };
                this.eventEmitter.emit(DATABASE_EVENTS.HISTORY_LIMIT_UPDATED, eventData);
            },
            sites: sitesMap,
            startMonitoring: async (identifier: string, monitorId: string) => {
                // First update the cache so monitoring can find the sites
                this.eventEmitter.emit(DATABASE_EVENTS.UPDATE_SITES_CACHE_REQUESTED, {
                    sites: Array.from(sitesMap.values()),
                });

                // Then request monitoring start via events
                const eventData: SiteEventData = {
                    identifier,
                    monitorId,
                    operation: "start-monitoring",
                };
                this.eventEmitter.emit(SITE_EVENTS.START_MONITORING_REQUESTED, eventData);
                return true;
            },
        });

        // Update the cache with loaded sites (final update to ensure consistency)
        this.eventEmitter.emit(DATABASE_EVENTS.UPDATE_SITES_CACHE_REQUESTED, {
            sites: Array.from(sitesMap.values()),
        });
    }

    /**
     * Export all application data to JSON string.
     */
    public async exportData(): Promise<string> {
        const dependencies: DataImportExportDependencies = {
            databaseService: this.dependencies.repositories.database,
            eventEmitter: this.eventEmitter,
            repositories: {
                history: this.dependencies.repositories.history,
                monitor: this.dependencies.repositories.monitor,
                settings: this.dependencies.repositories.settings,
                site: this.dependencies.repositories.site,
            },
        };

        const result = await exportData(dependencies);

        // Emit data exported event
        const eventData: DatabaseEventData = {
            operation: "exported",
            result,
        };
        this.eventEmitter.emit(DATABASE_EVENTS.DATA_EXPORTED, eventData);

        return result;
    }

    /**
     * Import data from JSON string.
     */
    public async importData(data: string): Promise<boolean> {
        const dependencies: DataImportExportDependencies = {
            databaseService: this.dependencies.repositories.database,
            eventEmitter: this.eventEmitter,
            repositories: {
                history: this.dependencies.repositories.history,
                monitor: this.dependencies.repositories.monitor,
                settings: this.dependencies.repositories.settings,
                site: this.dependencies.repositories.site,
            },
        };

        const callbacks: DataImportExportCallbacks = {
            getSitesFromCache: () => {
                // This will be handled by the orchestrator via events
                return [];
            },
            loadSites: () => this.loadSites(),
        };

        const result = await importData(dependencies, callbacks, data);

        // Emit data imported event
        const eventData: DatabaseEventData = {
            operation: "imported",
            result,
        };
        this.eventEmitter.emit(DATABASE_EVENTS.DATA_IMPORTED, eventData);

        return result;
    }

    /**
     * Download SQLite database backup.
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        const dependencies: DataBackupDependencies = {
            databaseService: this.dependencies.repositories.database,
            eventEmitter: this.eventEmitter,
        };

        const result = await downloadBackup(dependencies);

        // Emit backup downloaded event
        const eventData: DatabaseEventData = {
            operation: "backup-downloaded",
            result,
        };
        this.eventEmitter.emit(DATABASE_EVENTS.BACKUP_DOWNLOADED, eventData);

        return result;
    }

    /**
     * Refresh sites from database and update cache.
     */
    public async refreshSites(): Promise<Site[]> {
        const callbacks: DataBackupCallbacks = {
            getSitesFromCache: () => {
                // This will be handled by the orchestrator via events
                return [];
            },
            loadSites: () => this.loadSites(),
        };

        const result = await refreshSites(callbacks);

        // Emit sites refreshed event
        const eventData: DatabaseEventData = {
            operation: "sites-refreshed",
            result,
            sites: result,
        };
        this.eventEmitter.emit(DATABASE_EVENTS.SITES_REFRESHED, eventData);

        return result;
    }

    /**
     * Set history limit for monitor data retention.
     */
    public async setHistoryLimit(limit: number): Promise<void> {
        await setHistoryLimitUtil({
            limit,
            logger,
            repositories: {
                history: this.dependencies.repositories.history,
                settings: this.dependencies.repositories.settings,
            },
            setHistoryLimit: (newLimit) => {
                this.historyLimit = newLimit;
                // Emit history limit updated event
                const eventData: DatabaseEventData = {
                    limit: newLimit,
                    operation: "history-limit-updated",
                };
                this.eventEmitter.emit(DATABASE_EVENTS.HISTORY_LIMIT_UPDATED, eventData);
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
