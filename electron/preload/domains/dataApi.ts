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

import type { DataDomainBridge } from "@shared/types/preload";

import { createTypedInvoker, createVoidInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the data domain API operations
 */
export interface DataApiInterface extends DataDomainBridge {
    /**
     * Downloads a SQLite database backup
     *
     * @returns Promise resolving to the serialized backup payload and metadata
     */
    downloadSqliteBackup: DataDomainBridge["downloadSqliteBackup"];

    /**
     * Exports all application data to a JSON string
     *
     * @returns Promise resolving to exported data as JSON string
     */
    exportData: DataDomainBridge["exportData"];

    /**
     * Imports application data from a JSON string
     *
     * @param jsonData - JSON string containing application data to import
     *
     * @returns Promise resolving to a boolean success flag
     */
    importData: DataDomainBridge["importData"];

    /**
     * Resets all application settings to defaults
     *
     * @returns Promise that resolves when settings are reset
     */
    resetSettings: DataDomainBridge["resetSettings"];
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
} as const;

export type DataApi = DataDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
