/**
 * Data Domain API - Auto-generated preload bridge for data operations
 *
 * @remarks
 * This module provides type-safe IPC communication for data lifecycle
 * operations including import/export and database backup functionality.
 *
 * Exception handling: This domain API intentionally does not handle exceptions.
 * Errors are propagated to the frontend where they can be handled appropriately
 * by UI components, error boundaries, or service layers.
 *
 * @packageDocumentation
 */

/* eslint-disable ex/no-unhandled -- Domain APIs are thin wrappers that don't handle exceptions */

import { DATA_CHANNELS, type DataDomainBridge } from "@shared/types/preload";
import {
    validateSerializedDatabaseBackupResult,
    validateSerializedDatabaseBackupSaveResult,
    validateSerializedDatabaseRestoreResult,
} from "@shared/validation/dataSchemas";

import {
    createValidatedInvoker,
    safeParseBooleanResult,
    safeParseStringResult,
} from "../core/bridgeFactory";

/**
 * Interface defining the data domain API operations.
 *
 * @public
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
     * @returns Promise resolving to a boolean success flag
     */
    importData: DataDomainBridge["importData"];

    /**
     * Restores a SQLite database backup from the renderer
     */
    restoreSqliteBackup: DataDomainBridge["restoreSqliteBackup"];

    /**
     * Saves a SQLite database backup using an Electron save dialog.
     *
     * @remarks
     * This method exists to avoid transferring large backup buffers across IPC.
     * The backup is created and written on the main process.
     */
    saveSqliteBackup: DataDomainBridge["saveSqliteBackup"];
}

/**
 * Data domain API providing all data management operations.
 *
 * @public
 */
export const dataApi: DataApiInterface = {
    /**
     * Downloads a SQLite database backup
     *
     * @returns Promise resolving to backup buffer data
     */
    downloadSqliteBackup: createValidatedInvoker(
        DATA_CHANNELS.downloadSqliteBackup,
        validateSerializedDatabaseBackupResult,
        {
            domain: "dataApi",
            guardName: "validateSerializedDatabaseBackupResult",
        }
    ),

    /**
     * Exports all application data to a JSON string
     *
     * @returns Promise resolving to exported data as JSON string
     */
    exportData: createValidatedInvoker(
        DATA_CHANNELS.exportData,
        safeParseStringResult,
        {
            domain: "dataApi",
            guardName: "safeParseStringResult",
        }
    ),

    /**
     * Imports application data from a JSON string
     *
     * @param jsonData - JSON string containing application data to import
     *
     * @returns Promise resolving to a boolean success flag
     */
    importData: createValidatedInvoker(
        DATA_CHANNELS.importData,
        safeParseBooleanResult,
        {
            domain: "dataApi",
            guardName: "safeParseBooleanResult",
        }
    ),

    /** Restores a SQLite backup from an uploaded file */
    restoreSqliteBackup: createValidatedInvoker(
        DATA_CHANNELS.restoreSqliteBackup,
        validateSerializedDatabaseRestoreResult,
        {
            domain: "dataApi",
            guardName: "validateSerializedDatabaseRestoreResult",
        }
    ),

    /** Saves a SQLite backup to disk via the main process. */
    saveSqliteBackup: createValidatedInvoker(
        DATA_CHANNELS.saveSqliteBackup,
        validateSerializedDatabaseBackupSaveResult,
        {
            domain: "dataApi",
            guardName: "validateSerializedDatabaseBackupSaveResult",
        }
    ),
} as const;

/**
 * Type alias for the data domain preload bridge.
 *
 * @public
 */
export type DataApi = DataDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
