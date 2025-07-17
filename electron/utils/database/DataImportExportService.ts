/**
 * Service for data import/export operations.
 * Provides a testable, dependency-injected service for application data management.
 */

import { Database } from "node-sqlite3-wasm";

import { UptimeEvents, TypedEventBus } from "../../events/index";
import {
    DatabaseService,
    HistoryRepository,
    MonitorRepository,
    SettingsRepository,
    SiteRepository,
} from "../../services/index";
import { Site, StatusHistory } from "../../types";
import { withDatabaseOperation } from "../operationalHooks";
import { Logger, SiteCacheInterface, SiteLoadingError } from "./interfaces";

/**
 * Type for imported site data structure.
 */
export interface ImportSite {
    identifier: string;
    name?: string;
    monitors?: Site["monitors"];
}

/**
 * Configuration for data import/export operations.
 */
export interface DataImportExportConfig {
    eventEmitter: TypedEventBus<UptimeEvents>;
    databaseService: DatabaseService;
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };
    logger: Logger;
}

/**
 * Type guard for expected import data structure.
 */
function isImportData(obj: unknown): obj is { sites: ImportSite[]; settings?: Record<string, string> } {
    if (typeof obj === "object" && obj !== null && Array.isArray((obj as Record<string, unknown>).sites)) {
        // Optionally check each site for required properties
        return true;
    }
    return false;
}

/**
 * Service for handling data import/export operations.
 * Separates data operations from side effects for better testability.
 */
export class DataImportExportService {
    private static readonly DATABASE_ERROR_EVENT = "database:error" as const;

    private readonly repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };
    private readonly databaseService: DatabaseService;
    private readonly logger: Logger;
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    constructor(config: DataImportExportConfig) {
        this.repositories = config.repositories;
        this.databaseService = config.databaseService;
        this.logger = config.logger;
        this.eventEmitter = config.eventEmitter;
    }

    /**
     * Export all application data as JSON string.
     * Pure data operation without side effects.
     */
    async exportAllData(): Promise<string> {
        try {
            // Export all sites and settings using repositories
            const sites = await this.repositories.site.exportAll();
            const settings = await this.repositories.settings.getAll();

            const exportData = {
                exportedAt: new Date().toISOString(),
                settings,
                sites,
                version: "1.0",
            };

            return JSON.stringify(exportData, undefined, 2);
        } catch (error) {
            const message = `Failed to export data: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, error);

            await this.eventEmitter.emitTyped(DataImportExportService.DATABASE_ERROR_EVENT, {
                details: message,
                error: error instanceof Error ? error : new Error(String(error)),
                operation: "export-data",
                timestamp: Date.now(),
            });

            throw new SiteLoadingError(message, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Import data from JSON string.
     * Pure data operation that returns the imported data.
     */
    async importDataFromJson(jsonData: string): Promise<{ sites: ImportSite[]; settings: Record<string, string> }> {
        try {
            // Parse and validate the JSON data
            const data: unknown = JSON.parse(jsonData);

            // Use the top-level isImportData function
            if (!isImportData(data)) {
                throw new Error("Invalid import data format: missing or invalid sites array");
            }

            return {
                settings: (data as { settings?: Record<string, string> }).settings ?? {},
                sites: (data as { sites: ImportSite[] }).sites,
            };
        } catch (error) {
            const message = `Failed to parse import data: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, error);

            await this.eventEmitter.emitTyped(DataImportExportService.DATABASE_ERROR_EVENT, {
                details: message,
                error: error instanceof Error ? error : new Error(String(error)),
                operation: "import-data-parse",
                timestamp: Date.now(),
            });

            throw new SiteLoadingError(message, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Import sites and settings into database.
     * Database operation that persists the imported data.
     */
    async persistImportedData(sites: ImportSite[], settings: Record<string, string>): Promise<void> {
        return withDatabaseOperation(
            async () => {
                // Use executeTransaction for atomic multi-table operation
                await this.databaseService.executeTransaction(async (db) => {
                    // Clear existing data using internal methods
                    this.repositories.site.deleteAllInternal(db);
                    this.repositories.settings.deleteAllInternal(db);
                    this.repositories.monitor.deleteAllInternal(db);
                    this.repositories.history.deleteAllInternal(db);

                    // Import sites using bulk insert
                    const siteRows = sites.map((site) => ({
                        identifier: site.identifier,
                        ...(site.name && { name: site.name }),
                        monitoring: true, // Default monitoring to true for imported sites
                    }));
                    this.repositories.site.bulkInsertInternal(db, siteRows);

                    // Import monitors and history
                    await this.importMonitorsWithHistory(db, sites);

                    // Import settings using internal method
                    this.repositories.settings.bulkInsertInternal(db, settings);
                });

                this.logger.info(
                    `Successfully imported ${sites.length} sites and ${Object.keys(settings).length} settings`
                );
            },
            "data-import-persist",
            this.eventEmitter,
            { sitesCount: sites.length, settingsCount: Object.keys(settings).length }
        );
    }

    /**
     * Import monitors with their history for all sites.
     * Private helper method for monitor data persistence.
     */
    private async importMonitorsWithHistory(db: Database, sites: ImportSite[]): Promise<void> {
        for (const site of sites) {
            if (Array.isArray(site.monitors) && site.monitors.length > 0) {
                try {
                    // Create monitors using the async bulkCreate method
                    const createdMonitors = await this.repositories.monitor.bulkCreate(site.identifier, site.monitors);

                    // Import history for the created monitors
                    this.importHistoryForMonitors(db, createdMonitors, site.monitors);

                    this.logger.debug(
                        `[DataImportExportService] Imported ${createdMonitors.length} monitors for site: ${site.identifier}`
                    );
                } catch (error) {
                    this.logger.error(
                        `[DataImportExportService] Failed to import monitors for site ${site.identifier}:`,
                        error
                    );
                    // Continue with other sites even if one fails
                }
            }
        }
    }

    /**
     * Import history for created monitors by matching with original monitors.
     * Private helper method for history data persistence.
     */
    private importHistoryForMonitors(
        db: Database,
        createdMonitors: Site["monitors"],
        originalMonitors: Site["monitors"]
    ): void {
        for (const createdMonitor of createdMonitors) {
            // Find the original monitor with matching properties to get its history
            const originalMonitor = originalMonitors.find(
                (orig) =>
                    orig.type === createdMonitor.type &&
                    orig.url === createdMonitor.url &&
                    orig.port === createdMonitor.port
            );

            if (originalMonitor?.history && originalMonitor.history.length > 0 && createdMonitor.id) {
                this.importMonitorHistory(db, Number(createdMonitor.id), originalMonitor.history);
            }
        }
    }

    /**
     * Import history for a specific monitor.
     * Private helper method for history data persistence.
     */
    private importMonitorHistory(db: Database, monitorId: number, history: StatusHistory[]): void {
        for (const entry of history) {
            this.repositories.history.addEntryInternal(
                db,
                String(monitorId),
                {
                    responseTime: entry.responseTime,
                    status: entry.status,
                    timestamp: entry.timestamp,
                },
                "" // No details available in import data
            );
        }
    }
}

/**
 * Orchestrates the complete data import/export process.
 * Coordinates data operations with side effects.
 */
export class DataImportExportOrchestrator {
    private readonly dataImportExportService: DataImportExportService;

    constructor(dataImportExportService: DataImportExportService) {
        this.dataImportExportService = dataImportExportService;
    }

    /**
     * Export all application data.
     * Coordinates the complete export process.
     */
    async exportData(): Promise<string> {
        return this.dataImportExportService.exportAllData();
    }

    /**
     * Import data and reload application state.
     * Coordinates the complete import process including cache refresh.
     */
    async importData(
        jsonData: string,
        siteCache: SiteCacheInterface,
        onSitesReloaded: () => Promise<void>
    ): Promise<{ success: boolean; message: string }> {
        try {
            // Parse the import data
            const { settings, sites } = await this.dataImportExportService.importDataFromJson(jsonData);

            // Persist to database
            await this.dataImportExportService.persistImportedData(sites, settings);

            // Clear cache and reload sites
            siteCache.clear();
            await onSitesReloaded();

            return {
                message: `Successfully imported ${sites.length} sites and ${Object.keys(settings).length} settings`,
                success: true,
            };
        } catch (error) {
            return {
                message: `Failed to import data: ${error instanceof Error ? error.message : "Unknown error"}`,
                success: false,
            };
        }
    }
}
