/**
 * Service layer for handling all data-related operations. Provides a clean
 * abstraction over electron API calls for data management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. All
 * backend communication is performed via IPC and follows strict typing with
 * automatic error handling and logging.
 *
 * @packageDocumentation
 */

import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

import { ensureError } from "@shared/utils/errorHandling";

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

interface DataServiceContract {
    readonly downloadSqliteBackup: () => Promise<SerializedDatabaseBackupResult>;
    readonly exportData: () => Promise<string>;
    readonly importData: (data: string) => Promise<boolean>;
    readonly initialize: () => Promise<void>;
}

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("DataService", {
            bridgeContracts: [
                {
                    domain: "data",
                    methods: [
                        "downloadSqliteBackup",
                        "exportData",
                        "importData",
                    ],
                },
            ],
        });
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

/**
 * Service for managing data operations through Electron IPC.
 *
 * @remarks
 * Provides backup creation, JSON import/export, and initialization helpers with
 * consistent error handling. All methods wait for the preload bridge via
 * {@link getIpcServiceHelpers} before invoking the underlying
 * {@link window.electronAPI} contract.
 *
 * @public
 */
export const DataService: DataServiceContract = {
    /**
     * Downloads a complete SQLite database backup.
     *
     * @example
     *
     * ```typescript
     * const backup = await DataService.downloadSqliteBackup();
     * const blob = new Blob([backup.buffer], {
     *     type: "application/octet-stream",
     * });
     * // Save blob as file with backup.fileName
     * ```
     *
     * @returns {@link SerializedDatabaseBackupResult} Describing the backup
     *   bundle.
     *
     * @throws If the electron API is unavailable or the backup operation fails.
     */
    downloadSqliteBackup: wrap("downloadSqliteBackup", async (api) =>
        api.data.downloadSqliteBackup()
    ),

    /**
     * Exports all application data as a JSON string.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const jsonData = await DataService.exportData();
     * logger.info("Exported data", { bytes: jsonData.length });
     * ```
     *
     * @returns A JSON string containing all sites, monitors, and settings.
     *
     * @throws If the electron API is unavailable or the export operation fails.
     */
    exportData: wrap("exportData", async (api) => api.data.exportData()),

    /**
     * Imports application data from a JSON string.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const success = await DataService.importData(jsonString);
     * if (success) {
     *     logger.info("Data imported successfully");
     * } else {
     *     logger.error("Data import failed");
     * }
     * ```
     *
     * @param data - JSON string containing application data to import.
     *
     * @returns `true` if import was successful; otherwise, `false`.
     *
     * @throws If the electron API is unavailable or the import operation fails.
     */
    importData: wrap("importData", async (api, payload: string) =>
        api.data.importData(payload)
    ),

    /**
     * Ensures the electron API is available before making backend calls.
     *
     * @remarks
     * This method should be called before any backend operation.
     *
     * @returns A promise that resolves when the electron API is ready.
     *
     * @throws If the electron API is not available.
     */
    initialize: ensureInitialized,
};
