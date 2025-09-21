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

import { createTypedInvoker, createVoidInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the data domain API operations
 */
export interface DataApiInterface {
    /**
     * Downloads a SQLite database backup
     *
     * @returns Promise resolving to backup buffer data
     */
    downloadSqliteBackup: (...args: unknown[]) => Promise<ArrayBuffer>;

    /**
     * Exports all application data to a JSON string
     *
     * @returns Promise resolving to exported data as JSON string
     */
    exportData: (...args: unknown[]) => Promise<string>;

    /**
     * Gets the current history retention limit
     *
     * @returns Promise resolving to the current history limit in days
     */
    getHistoryLimit: (...args: unknown[]) => Promise<number>;

    /**
     * Imports application data from a JSON string
     *
     * @param jsonData - JSON string containing application data to import
     *
     * @returns Promise resolving to import status message
     */
    importData: (...args: unknown[]) => Promise<string>;

    /**
     * Resets all application settings to defaults
     *
     * @returns Promise that resolves when settings are reset
     */
    resetSettings: (...args: unknown[]) => Promise<void>;

    /**
     * Updates the history retention limit
     *
     * @param limitDays - New history limit in days
     *
     * @returns Promise resolving to the updated limit value
     */
    updateHistoryLimit: (...args: unknown[]) => Promise<number>;
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
    downloadSqliteBackup: createTypedInvoker<ArrayBuffer>(
        "download-sqlite-backup"
    ) satisfies (...args: unknown[]) => Promise<ArrayBuffer>,

    /**
     * Exports all application data to a JSON string
     *
     * @returns Promise resolving to exported data as JSON string
     */
    exportData: createTypedInvoker<string>("export-data") satisfies (
        ...args: unknown[]
    ) => Promise<string>,

    /**
     * Gets the current history retention limit
     *
     * @returns Promise resolving to the current history limit in days
     */
    getHistoryLimit: createTypedInvoker<number>("get-history-limit") satisfies (
        ...args: unknown[]
    ) => Promise<number>,

    /**
     * Imports application data from a JSON string
     *
     * @param jsonData - JSON string containing application data to import
     *
     * @returns Promise resolving to import status message
     */
    importData: createTypedInvoker<string>("import-data") satisfies (
        ...args: unknown[]
    ) => Promise<string>,

    /**
     * Resets all application settings to defaults
     *
     * @returns Promise that resolves when settings are reset
     */
    resetSettings: createVoidInvoker("reset-settings") satisfies (
        ...args: unknown[]
    ) => Promise<void>,

    /**
     * Updates the history retention limit
     *
     * @param limitDays - New history limit in days
     *
     * @returns Promise that resolves to the updated limit value
     */
    updateHistoryLimit: createTypedInvoker<number>(
        "update-history-limit"
    ) satisfies (...args: unknown[]) => Promise<number>,
} as const;

export type DataApi = DataApiInterface;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
