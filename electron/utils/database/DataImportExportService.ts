/**
 * Service for data import/export operations.
 *
 * Provides a testable, dependency-injected service for application data
 * management. Handles importing and exporting sites, monitors, history, and
 * settings data.
 */

import type { Site, StatusHistory } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";
import type { Jsonifiable, JsonValue, UnknownRecord } from "type-fest";

import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
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
import type {
    MonitorRepository,
    MonitorRepositoryTransactionAdapter,
} from "../../services/database/MonitorRepository";
import type {
    SettingsRepository,
    SettingsRepositoryTransactionAdapter,
} from "../../services/database/SettingsRepository";
import type {
    SiteRepository,
    SiteRepositoryTransactionAdapter,
} from "../../services/database/SiteRepository";

import { createMonitorConfig } from "../../services/monitoring/createMonitorConfig";
import { toSerializedError } from "../errorSerialization";
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
    monitoring?: boolean;
    monitors?: Site["monitors"];
    name?: string;
}

interface ImportDataPayload {
    settings?: Record<string, string>;
    sites: ImportSite[];
}

type ImportDataJsonPayload = ImportDataPayload & JsonValue;

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
function isImportData(obj: unknown): obj is ImportDataPayload {
    return (
        typeof obj === "object" &&
        obj !== null &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: Type guard with runtime validation following
        Array.isArray((obj as UnknownRecord)["sites"])
    );
}

const isImportDataJsonPayload = (
    value: unknown
): value is ImportDataJsonPayload => isImportData(value);

// eslint-disable-next-line sonarjs/function-return-type -- This helper intentionally returns the wide Jsonifiable union to normalize arbitrary inputs.
const toJsonifiable = (value: unknown): Jsonifiable => {
    if (value === null) {
        return null;
    }

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((entry) => toJsonifiable(entry));
    }

    if (typeof value === "object") {
        const result: Record<string, Jsonifiable> = {};
        for (const [key, nested] of Object.entries(value)) {
            if (nested !== undefined) {
                result[key] = toJsonifiable(nested);
            }
        }
        return result;
    }

    if (typeof value === "bigint" || typeof value === "symbol") {
        return value.toString();
    }

    if (typeof value === "function") {
        return value.name ? `[Function: ${value.name}]` : "[Function]";
    }

    if (value === undefined) {
        return "undefined";
    }

    return "[Unsupported value]";
};

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

            const exportPayload: unknown = {
                exportedAt: new Date().toISOString(),
                settings,
                sites,
                version: "1.0",
            };

            const exportData = toJsonifiable(exportPayload);

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
            const parseResult = safeJsonParse<ImportDataJsonPayload>(
                jsonData,
                isImportDataJsonPayload
            );

            if (!parseResult.success || parseResult.data === undefined) {
                throw new Error(
                    `${ERROR_CATALOG.database.IMPORT_DATA_INVALID}: ${parseResult.error ?? "Unknown parsing error"}`
                );
            }

            const dataCandidate = parseResult.data;

            if (!isImportData(dataCandidate)) {
                throw new Error(
                    `${ERROR_CATALOG.database.IMPORT_DATA_INVALID}: Invalid import schema`
                );
            }

            const validatedData: ImportDataPayload = dataCandidate;

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
        const normalizedSites = sites.map((site) =>
            this.normalizeImportSite(site)
        );
        return withDatabaseOperation(
            async () => {
                // Use executeTransaction for atomic multi-table operation
                await this.withImportTransactionAdapters(
                    ({ historyTx, monitorTx, settingsTx, siteTx }) => {
                        siteTx.deleteAll();
                        settingsTx.deleteAll();
                        monitorTx.deleteAll();
                        historyTx.deleteAll();

                        // Import sites using bulk insert
                        const siteRows = normalizedSites.map((site) => {
                            const monitoring = site.monitoring ?? true;

                            const row: {
                                identifier: string;
                                monitoring: boolean;
                                name?: string;
                            } = {
                                identifier: site.identifier,
                                monitoring,
                            };

                            if (site.name) {
                                row.name = site.name;
                            }

                            return row;
                        });
                        siteTx.bulkInsert(siteRows);

                        // Import monitors and history as part of the same
                        // transaction so monitor creation, history entries,
                        // and settings updates share a single atomic
                        // boundary.
                        this.importMonitorsWithHistory(
                            historyTx,
                            monitorTx,
                            normalizedSites
                        );

                        settingsTx.bulkInsert(safeSettings);
                    }
                );

                this.logger.info(
                    `Successfully imported ${normalizedSites.length} sites and ${Object.keys(safeSettings).length} settings`
                );
            },
            "data-import-persist",
            this.eventEmitter,
            {
                settingsCount: Object.keys(safeSettings).length,
                sitesCount: normalizedSites.length,
            }
        );
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
                error: toSerializedError(normalizedError),
                operation,
                timestamp: Date.now(),
            }
        );

        throw new SiteLoadingError(message, { cause: normalizedError });
    }

    /**
     * Executes a database transaction with import-specific repository adapters.
     *
     * @typeParam T - Result returned by the transactional operation.
     *
     * @param operation - Callback executed with adapters scoped to the active
     *   transaction.
     *
     * @returns Result produced by the provided operation.
     */
    private async withImportTransactionAdapters<T>(
        operation: (adapters: {
            historyTx: HistoryRepositoryTransactionAdapter;
            monitorTx: MonitorRepositoryTransactionAdapter;
            settingsTx: SettingsRepositoryTransactionAdapter;
            siteTx: SiteRepositoryTransactionAdapter;
        }) => Promise<T> | T
    ): Promise<T> {
        return this.databaseService.executeTransaction(async (db) => {
            const siteTx = this.repositories.site.createTransactionAdapter(db);
            const monitorTx =
                this.repositories.monitor.createTransactionAdapter(db);
            const historyTx =
                this.repositories.history.createTransactionAdapter(db);
            const settingsTx =
                this.repositories.settings.createTransactionAdapter(db);

            return operation({ historyTx, monitorTx, settingsTx, siteTx });
        });
    }

    /**
     * Import monitors with their history for all sites. Private helper method
     * for monitor data persistence.
     */
    private importMonitorsWithHistory(
        historyRepositoryTransaction: HistoryRepositoryTransactionAdapter,
        monitorRepositoryTransaction: MonitorRepositoryTransactionAdapter,
        sites: ImportSite[]
    ): void {
        let failures = 0;

        for (const site of sites) {
            const { identifier } = site;

            try {
                const monitors = Array.isArray(site.monitors)
                    ? site.monitors
                    : [];

                if (monitors.length === 0) {
                    // No monitors to import for this site; skip without
                    // treating as a failure to preserve the original import
                    // semantics.
                    continue; // eslint-disable-line no-continue -- Early exit keeps the main logic flatter and avoids deeply nested blocks.
                }

                const createdMonitors = monitors.map((monitor) => {
                    const newId = monitorRepositoryTransaction.create(
                        identifier,
                        monitor
                    );

                    return {
                        ...monitor,
                        id: newId,
                    } as Site["monitors"][0];
                });

                this.importHistoryForMonitors(
                    historyRepositoryTransaction,
                    createdMonitors,
                    monitors
                );

                this.logger.debug(
                    `[DataImportExportService] Imported ${createdMonitors.length} monitors for site: ${identifier}`
                );
            } catch (error) {
                failures += 1;
                this.logger.error(
                    `[DataImportExportService] Failed to import monitors for site ${identifier}:`,
                    error
                );
            }
        }

        if (failures > 0) {
            this.logger.warn(
                `[DataImportExportService] ${failures} out of ${sites.length} site monitor imports failed`
            );
        }
    }

    /**
     * Returns a normalized copy of the imported site ensuring required fields
     * adhere to runtime constraints.
     */
    private normalizeImportSite(site: ImportSite): ImportSite {
        const normalizedMonitoring =
            typeof site.monitoring === "boolean" ? site.monitoring : true;

        const normalizedSite: ImportSite = {
            ...site,
            monitoring: normalizedMonitoring,
        };

        if (Array.isArray(site.monitors) && site.monitors.length > 0) {
            normalizedSite.monitors = site.monitors.map((monitor) =>
                this.normalizeImportedMonitor(site.identifier, monitor)
            );
        }

        return normalizedSite;
    }

    /**
     * Normalizes imported monitor configuration to meet minimum cadence
     * requirements.
     */
    private normalizeImportedMonitor(
        siteIdentifier: string,
        monitor: Site["monitors"][0]
    ): Site["monitors"][0] {
        const normalizedConfig = createMonitorConfig(monitor, {
            checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
        });

        const normalizedMonitor: Site["monitors"][0] = {
            ...monitor,
            checkInterval: normalizedConfig.checkInterval,
        };

        const originalInterval = monitor.checkInterval;
        const hasValidInterval =
            typeof originalInterval === "number" &&
            Number.isFinite(originalInterval) &&
            originalInterval > 0;

        if (
            !hasValidInterval &&
            originalInterval !== normalizedMonitor.checkInterval
        ) {
            this.logger.warn(
                "[DataImportExportService] Imported monitor missing valid checkInterval; defaulting to minimum",
                {
                    monitorId: normalizedMonitor.id || "unknown-monitor",
                    siteIdentifier,
                }
            );
        } else if (
            typeof originalInterval === "number" &&
            Number.isFinite(originalInterval) &&
            originalInterval > 0 &&
            originalInterval < MIN_MONITOR_CHECK_INTERVAL_MS &&
            originalInterval !== normalizedMonitor.checkInterval
        ) {
            this.logger.warn(
                "[DataImportExportService] Imported monitor checkInterval below minimum; clamping to shared floor",
                {
                    minimum: MIN_MONITOR_CHECK_INTERVAL_MS,
                    monitorId: normalizedMonitor.id || "unknown-monitor",
                    originalInterval,
                    siteIdentifier,
                }
            );
        }

        return normalizedMonitor;
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
                if (typeof createdMonitor.id !== "string") {
                    throw new TypeError(
                        "Imported monitor history cannot be applied because the created monitor identifier is not a string"
                    );
                }

                this.importMonitorHistory(
                    historyRepositoryTransaction,
                    createdMonitor.id,
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
        monitorId: string,
        history: StatusHistory[]
    ): void {
        for (const entry of history) {
            historyRepositoryTransaction.addEntry(
                monitorId,
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
