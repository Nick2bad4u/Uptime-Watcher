/**
 * Service for data import/export operations.
 *
 * Provides a testable, dependency-injected service for application data
 * management. Handles importing and exporting sites, monitors, history, and
 * settings data.
 */

import type { Site, StatusHistory } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";
import type { UnknownRecord } from "type-fest";

import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import {
    safeJsonParse,
    safeJsonStringifyWithFallback,
} from "@shared/utils/jsonSafety";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type {
    HistoryRepository,
    HistoryRepositoryTransactionAdapter,
} from "../../services/database/HistoryRepository";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { SettingsRepository } from "../../services/database/SettingsRepository";
import type { SiteRepository } from "../../services/database/SiteRepository";

import { withDatabaseOperation } from "../operationalHooks";
import { SiteLoadingError } from "./interfaces";

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
 * Type guard for expected import data structure.
 *
 * Validates that the provided object matches the expected structure for import
 * data containing sites and optional settings.
 *
 * @param obj - Object to validate
 *
 * @returns True if the object matches the expected import data structure
 */
function isImportData(
    obj: unknown
): obj is { settings?: Record<string, string>; sites: ImportSite[] } {
    return (
        typeof obj === "object" &&
        obj !== null &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: Type guard with runtime validation following
        Array.isArray((obj as UnknownRecord)["sites"])
    );
}

/**
 * Service for handling data import/export operations.
 *
 * Separates data operations from side effects for better testability. Handles
 * the complete lifecycle of data import/export including validation,
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

    /**
     * Export all application data as JSON string. Pure data operation without
     * side effects.
     */
    public async exportAllData(): Promise<string> {
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
            return this.handleDataOperationFailure(
                "export-data",
                error,
                "Failed to export data"
            );
        }
    }

    /**
     * Import data from JSON string. Pure data operation that returns the
     * imported data.
     */
    public async importDataFromJson(
        jsonData: string
    ): Promise<{ settings: Record<string, string>; sites: ImportSite[] }> {
        try {
            // Parse and validate the JSON data using safe parsing
            const parseResult = safeJsonParse(jsonData, isImportData);

            if (!parseResult.success || !parseResult.data) {
                throw new SiteLoadingError(
                    `${ERROR_CATALOG.database.IMPORT_DATA_INVALID}: ${parseResult.error ?? "Unknown parsing error"}`
                );
            }

            const validatedData = parseResult.data;
            return {
                settings: validatedData.settings ?? {},
                sites: validatedData.sites,
            };
        } catch (error) {
            return this.handleDataOperationFailure(
                "import-data-parse",
                error,
                "Failed to parse import data"
            );
        }
    }

    /**
     * Import sites and settings into database. Database operation that persists
     * the imported data.
     */
    public async persistImportedData(
        sites: ImportSite[],
        settings: null | Record<string, string> | undefined
    ): Promise<void> {
        const safeSettings = settings ?? {};
        return withDatabaseOperation(
            async () => {
                // Use executeTransaction for atomic multi-table operation
                await this.databaseService.executeTransaction(async (db) => {
                    const siteTransactionAdapter =
                        this.repositories.site.createTransactionAdapter(db);
                    const monitorTransactionAdapter =
                        this.repositories.monitor.createTransactionAdapter(db);
                    const historyTransactionAdapter =
                        this.repositories.history.createTransactionAdapter(db);
                    const settingsTransactionAdapter =
                        this.repositories.settings.createTransactionAdapter(db);

                    siteTransactionAdapter.deleteAll();
                    settingsTransactionAdapter.deleteAll();
                    monitorTransactionAdapter.deleteAll();
                    historyTransactionAdapter.deleteAll();

                    // Import sites using bulk insert
                    const siteRows = sites.map((site) => ({
                        identifier: site.identifier,
                        ...(site.name && { name: site.name }),
                        monitoring: true, // Default monitoring to true for imported sites
                    }));
                    siteTransactionAdapter.bulkInsert(siteRows);

                    // Import monitors and history
                    await this.importMonitorsWithHistory(
                        historyTransactionAdapter,
                        sites
                    );

                    settingsTransactionAdapter.bulkInsert(safeSettings);
                });

                this.logger.info(
                    `Successfully imported ${sites.length} sites and ${Object.keys(safeSettings).length} settings`
                );
            },
            "data-import-persist",
            this.eventEmitter,
            {
                settingsCount: Object.keys(safeSettings).length,
                sitesCount: sites.length,
            }
        );
    }

    /**
     * Import monitors with their history for all sites. Private helper method
     * for monitor data persistence.
     */
    private async importMonitorsWithHistory(
        historyRepositoryTransaction: HistoryRepositoryTransactionAdapter,
        sites: ImportSite[]
    ): Promise<void> {
        // Process sites in parallel since each site's monitor import
        // is independent
        const importPromises = sites
            .filter(
                (site) =>
                    Array.isArray(site.monitors) && site.monitors.length > 0
            )
            .map(async (site) => {
                const { identifier } = site;
                try {
                    // We know monitors exists and has content from the filter
                    if (!site.monitors) {
                        throw new Error(
                            "Site monitors is unexpectedly undefined"
                        );
                    }
                    const { monitors } = site;

                    // Create monitors using the async bulkCreate method
                    const createdMonitors =
                        await this.repositories.monitor.bulkCreate(
                            identifier,
                            monitors
                        );

                    // Import history for the created monitors
                    this.importHistoryForMonitors(
                        historyRepositoryTransaction,
                        createdMonitors,
                        monitors
                    );

                    this.logger.debug(
                        `[DataImportExportService] Imported ${createdMonitors.length} monitors for site: ${identifier}`
                    );
                } catch (error) {
                    this.logger.error(
                        `[DataImportExportService] Failed to import monitors for site ${identifier}:`,
                        error
                    );
                    // Continue with other sites even if one fails
                    throw error; // Re-throw to be caught by Promise.allSettled
                }
            });

        // Wait for all sites to complete, but continue even if some fail
        const results = await Promise.allSettled(importPromises);

        // Log any failures
        const failures = results.filter(
            (result) => result.status === "rejected"
        ).length;
        if (failures > 0) {
            this.logger.warn(
                `[DataImportExportService] ${failures} out of ${importPromises.length} site monitor imports failed`
            );
        }
    }

    private async handleDataOperationFailure(
        operation: string,
        error: unknown,
        context: string
    ): Promise<never> {
        const normalizedError =
            error instanceof Error ? error : new Error(String(error));
        const message = `${context}: ${normalizedError.message}`;

        this.logger.error(message, error);

        await this.eventEmitter.emitTyped(
            DataImportExportService.DATABASE_ERROR_EVENT,
            {
                details: message,
                error: normalizedError,
                operation,
                timestamp: Date.now(),
            }
        );

        throw new SiteLoadingError(message, normalizedError);
    }

    public constructor(config: DataImportExportConfig) {
        this.repositories = config.repositories;
        this.databaseService = config.databaseService;
        this.logger = config.logger;
        this.eventEmitter = config.eventEmitter;
    }

    /**
     * Import history for created monitors by matching with original monitors.
     * Private helper method for history data persistence.
     */
    private importHistoryForMonitors(
        historyRepositoryTransaction: HistoryRepositoryTransactionAdapter,
        createdMonitors: Site["monitors"],
        originalMonitors: Site["monitors"]
    ): void {
        for (const createdMonitor of createdMonitors) {
            // Find the original monitor with matching properties to get its
            // history
            const originalMonitor = originalMonitors.find(
                (orig) =>
                    orig.type === createdMonitor.type &&
                    orig.url === createdMonitor.url &&
                    orig.port === createdMonitor.port
            );

            if (
                originalMonitor?.history &&
                originalMonitor.history.length > 0 &&
                createdMonitor.id
            ) {
                this.importMonitorHistory(
                    historyRepositoryTransaction,
                    Number(createdMonitor.id),
                    originalMonitor.history
                );
            }
        }
    }

    /**
     * Import history for a specific monitor. Private helper method for history
     * data persistence.
     */
    private importMonitorHistory(
        historyRepositoryTransaction: HistoryRepositoryTransactionAdapter,
        monitorId: number,
        history: StatusHistory[]
    ): void {
        for (const entry of history) {
            historyRepositoryTransaction.addEntry(
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
