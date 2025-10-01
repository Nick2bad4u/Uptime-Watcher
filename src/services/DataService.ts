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

import { waitForElectronAPI } from "../stores/utils";
import { logger } from "./logger";

interface DataServiceContract {
    downloadSqliteBackup: () => Promise<SerializedDatabaseBackupResult>;
    exportData: () => Promise<string>;
    importData: (data: string) => Promise<boolean>;
    initialize: () => Promise<void>;
}

/**
 * Service for managing data operations through Electron IPC.
 *
 * @remarks
 * Provides a comprehensive interface for data management operations including
 * backup creation, data export/import, and persistence with automatic service
 * initialization and type-safe IPC communication.
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
     * @returns An object containing the backup buffer and suggested filename.
     *
     * @throws If the electron API is unavailable or the backup operation fails.
     */
    async downloadSqliteBackup(): Promise<SerializedDatabaseBackupResult> {
        await this.initialize();
        return window.electronAPI.data.downloadSqliteBackup();
    },

    /**
     * Exports all application data as a JSON string.
     *
     * @example
     *
     * ```typescript
     * const jsonData = await DataService.exportData();
     * console.log("Exported data size:", jsonData.length);
     * ```
     *
     * @returns A JSON string containing all sites, monitors, and settings.
     *
     * @throws If the electron API is unavailable or the export operation fails.
     */
    async exportData(): Promise<string> {
        await this.initialize();
        return window.electronAPI.data.exportData();
    },

    /**
     * Imports application data from a JSON string.
     *
     * @example
     *
     * ```typescript
     * const success = await DataService.importData(jsonString);
     * if (success) {
     *     console.log("Data imported successfully");
     * } else {
     *     console.error("Import failed");
     * }
     * ```
     *
     * @param data - JSON string containing application data to import.
     *
     * @returns True if import was successful, false otherwise.
     *
     * @throws If the electron API is unavailable or the import operation fails.
     */
    async importData(data: string): Promise<boolean> {
        await this.initialize();
        return window.electronAPI.data.importData(data);
    },

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
    async initialize(): Promise<void> {
        try {
            await waitForElectronAPI();
        } catch (error) {
            logger.error(
                "Failed to initialize DataService:",
                ensureError(error)
            );
            throw error;
        }
    },
};
