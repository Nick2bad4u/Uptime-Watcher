/**
 * Manages database operations including initialization, data management, and backups.
 * Handles database initialization, import/export, and backup operations.
 */

import { EventEmitter } from "events";

import { DEFAULT_HISTORY_LIMIT } from "../constants";
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

const CALLBACKS_NOT_SET_ERROR = "DatabaseManager callbacks not set. Call setCallbacks() first.";

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

export interface DatabaseManagerCallbacks {
    getSitesFromCache: () => Site[];
    updateSitesCache: (sites: Site[]) => void;
    startMonitoringForSite: (identifier: string, monitorId?: string) => Promise<boolean>;
    setHistoryLimit: (limit: number) => void;
}

/**
 * Manages database operations and data management.
 * Handles initialization, import/export, backup, and history management.
 */
export class DatabaseManager {
    private historyLimit: number = DEFAULT_HISTORY_LIMIT;
    private readonly dependencies: DatabaseManagerDependencies;
    private callbacks?: DatabaseManagerCallbacks;

    constructor(dependencies: DatabaseManagerDependencies) {
        this.dependencies = dependencies;
    }

    /**
     * Set callback functions for database operations.
     */
    public setCallbacks(callbacks: DatabaseManagerCallbacks): void {
        this.callbacks = callbacks;
    }

    /**
     * Initialize the database and load sites.
     */
    public async initialize(): Promise<void> {
        if (!this.callbacks) {
            throw new Error(CALLBACKS_NOT_SET_ERROR);
        }

        await initDatabase(
            this.dependencies.repositories.database,
            () => this.loadSites(),
            this.dependencies.eventEmitter
        );
    }

    /**
     * Load sites from database and update cache.
     */
    private async loadSites(): Promise<void> {
        if (!this.callbacks) {
            throw new Error(CALLBACKS_NOT_SET_ERROR);
        }

        const sitesMap = new Map<string, Site>();

        await loadSitesFromDatabase({
            eventEmitter: this.dependencies.eventEmitter,
            repositories: {
                history: this.dependencies.repositories.history,
                monitor: this.dependencies.repositories.monitor,
                settings: this.dependencies.repositories.settings,
                site: this.dependencies.repositories.site,
            },
            setHistoryLimit: (limit) => {
                this.historyLimit = limit;
                this.callbacks?.setHistoryLimit(limit);
            },
            sites: sitesMap,
            startMonitoring: async (identifier: string, monitorId: string) => {
                // First update the cache so startMonitoringForSite can find the sites
                this.callbacks?.updateSitesCache(Array.from(sitesMap.values()));
                // Then start monitoring
                return this.callbacks?.startMonitoringForSite(identifier, monitorId) || false;
            },
        });

        // Update the cache with loaded sites (final update to ensure consistency)
        this.callbacks.updateSitesCache(Array.from(sitesMap.values()));
    }

    /**
     * Export all application data to JSON string.
     */
    public async exportData(): Promise<string> {
        const dependencies: DataImportExportDependencies = {
            eventEmitter: this.dependencies.eventEmitter,
            repositories: {
                history: this.dependencies.repositories.history,
                monitor: this.dependencies.repositories.monitor,
                settings: this.dependencies.repositories.settings,
                site: this.dependencies.repositories.site,
            },
        };

        return exportData(dependencies);
    }

    /**
     * Import data from JSON string.
     */
    public async importData(data: string): Promise<boolean> {
        if (!this.callbacks) {
            throw new Error(CALLBACKS_NOT_SET_ERROR);
        }

        const dependencies: DataImportExportDependencies = {
            eventEmitter: this.dependencies.eventEmitter,
            repositories: {
                history: this.dependencies.repositories.history,
                monitor: this.dependencies.repositories.monitor,
                settings: this.dependencies.repositories.settings,
                site: this.dependencies.repositories.site,
            },
        };

        const callbacks: DataImportExportCallbacks = {
            getSitesFromCache: this.callbacks.getSitesFromCache,
            loadSites: () => this.loadSites(),
        };

        return importData(dependencies, callbacks, data);
    }

    /**
     * Download SQLite database backup.
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        const dependencies: DataBackupDependencies = {
            databaseService: this.dependencies.repositories.database,
            eventEmitter: this.dependencies.eventEmitter,
        };

        return downloadBackup(dependencies);
    }

    /**
     * Refresh sites from database and update cache.
     */
    public async refreshSites(): Promise<Site[]> {
        if (!this.callbacks) {
            throw new Error(CALLBACKS_NOT_SET_ERROR);
        }

        const callbacks: DataBackupCallbacks = {
            getSitesFromCache: this.callbacks.getSitesFromCache,
            loadSites: () => this.loadSites(),
        };

        return refreshSites(callbacks);
    }

    /**
     * Set history limit for monitor data retention.
     */
    public async setHistoryLimit(limit: number): Promise<void> {
        if (!this.callbacks) {
            throw new Error(CALLBACKS_NOT_SET_ERROR);
        }

        await setHistoryLimitUtil({
            limit,
            logger,
            repositories: {
                history: this.dependencies.repositories.history,
                settings: this.dependencies.repositories.settings,
            },
            setHistoryLimit: (newLimit) => {
                this.historyLimit = newLimit;
                this.callbacks?.setHistoryLimit(newLimit);
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
