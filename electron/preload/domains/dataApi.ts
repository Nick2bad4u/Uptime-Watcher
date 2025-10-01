/**
 * Data Domain API - Auto-generated preload bridge for data operations
 *
 * @remarks
 * This module provides type-safe IPC communication for all data-related
 * operations including import/export, settings, and backup functionality.
 *
 * Exception handling: This domain API intentionally does not handle exceptions.
 * Errors are propagated to the frontend where they can be handled appropriately
 * by UI components, error boundaries, or service layers.
 *
 * @packageDocumentation
 */

/* eslint-disable ex/no-unhandled -- Domain APIs are thin wrappers that don't handle exceptions */

import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

import { createTypedInvoker, createVoidInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the data domain API operations
 */
export interface DataApiInterface {
    /**
     * Downloads a SQLite database backup
     *
     * @returns Promise resolving to the serialized backup payload and metadata
     */
    downloadSqliteBackup: () => Promise<SerializedDatabaseBackupResult>;

    /**
     * Exports all application data to a JSON string
     *
     * @returns Promise resolving to exported data as JSON string
     */
    exportData: () => Promise<string>;

    /**
     * Gets the current history retention limit
     *
     * @returns Promise resolving to the current history limit in days
     */
    getHistoryLimit: () => Promise<number>;

    /**
     * Imports application data from a JSON string
     *
     * @param jsonData - JSON string containing application data to import
     *
     * @returns Promise resolving to a boolean success flag
     */
    importData: (serializedData: string) => Promise<boolean>;

    /**
     * Resets all application settings to defaults
     *
     * @returns Promise that resolves when settings are reset
     */
    resetSettings: () => Promise<void>;

    /**
     * Updates the history retention limit
     *
     * @param limitDays - New history limit in days
     *
     * @returns Promise resolving to the updated limit value
     */
    updateHistoryLimit: (limitDays: number) => Promise<number>;
}

/**
 * Data domain API providing all data management operations
 */
export const dataApi: DataApiInterface = {
    /**
     * Downloads a SQLite database backup
     *
     * @returns Promise resolving to backup buffer data
     */
    downloadSqliteBackup: createTypedInvoker("download-sqlite-backup"),

    /**
     * Exports all application data to a JSON string
     *
     * @returns Promise resolving to exported data as JSON string
     */
    exportData: createTypedInvoker("export-data"),

    /**
     * Gets the current history retention limit
     *
     * @returns Promise resolving to the current history limit in days
     */
    getHistoryLimit: createTypedInvoker("get-history-limit"),

    /**
     * Imports application data from a JSON string
     *
     * @param jsonData - JSON string containing application data to import
     *
     * @returns Promise resolving to a boolean success flag
     */
    importData: createTypedInvoker("import-data"),

    /**
     * Resets all application settings to defaults
     *
     * @returns Promise that resolves when settings are reset
     */
    resetSettings: createVoidInvoker("reset-settings"),

    /**
     * Updates the history retention limit
     *
     * @param limitDays - New history limit in days
     *
     * @returns Promise that resolves to the updated limit value
     */
    updateHistoryLimit: createTypedInvoker("update-history-limit"),
} as const;

export type DataApi = DataApiInterface;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
