/**
 * Service for data import/export operations.
 *
 * Provides a testable, dependency-injected service for application data management.
 * Handles importing and exporting sites, monitors, history, and settings data.
 */

import { Database } from "node-sqlite3-wasm";

import { safeJsonParse, safeJsonStringifyWithFallback } from "../../../shared/utils/jsonSafety";
import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { DatabaseService } from "../../services/database/DatabaseService";
import { HistoryRepository } from "../../services/database/HistoryRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SettingsRepository } from "../../services/database/SettingsRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
import { Site, StatusHistory } from "../../types";
import { withDatabaseOperation } from "../operationalHooks";
import { Logger, SiteLoadingError } from "./interfaces";

/**
 * Configuration for data import/export operations.
 */
export interface DataImportExportConfig {
    databaseService: DatabaseService;
    eventEmitter: TypedEventBus<UptimeEvents>;
    logger: Logger;
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };
}

/**
 * Type for imported site data structure.
 *
 * Represents the structure of site data during import operations.
 */
export interface ImportSite {
    identifier: string;
    monitors?: Site["monitors"];
    name?: string;
}

/**
 * Service for handling data import/export operations.
 *
 * Separates data operations from side effects for better testability.
 * Handles the complete lifecycle of data import/export including validation,
 * transformation, and persistence.
 */
export class DataImportExportService {
    private static readonly DATABASE_ERROR_EVENT = "database:error" as const;

    private readonly databaseService: DatabaseService;
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;
    private readonly logger: Logger;
    private readonly repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };

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

            return safeJsonStringifyWithFallback(exportData, "{}", 2);
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
    async importDataFromJson(jsonData: string): Promise<{ settings: Record<string, string>; sites: ImportSite[] }> {
        try {
            // Parse and validate the JSON data using safe parsing
            const parseResult = safeJsonParse(jsonData, isImportData);

            if (!parseResult.success || !parseResult.data) {
                throw new Error(`Invalid import data format: ${parseResult.error ?? "Unknown parsing error"}`);
            }

            const validatedData = parseResult.data;
            return {
                settings: validatedData.settings ?? {},
                sites: validatedData.sites,
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
            { settingsCount: Object.keys(settings).length, sitesCount: sites.length }
        );
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
}

/**
 * Type guard for expected import data structure.
 *
 * Validates that the provided object matches the expected structure
 * for import data containing sites and optional settings.
 *
 * @param obj - Object to validate
 * @returns True if the object matches the expected import data structure
 */
function isImportData(obj: unknown): obj is { settings?: Record<string, string>; sites: ImportSite[] } {
    return typeof obj === "object" && obj !== null && Array.isArray((obj as Record<string, unknown>)["sites"]);
}
