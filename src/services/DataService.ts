/**
 * Service layer for handling all data-related operations.
 *
 * @remarks
 * This module exposes a renderer-facing abstraction over the typed `data`
 * preload domain. All methods delegate to IPC endpoints defined in
 * {@link SerializedDatabaseBackupResult | shared IPC contracts} and use
 * {@link validateServicePayload} plus Zod schemas to validate payloads before
 * they are returned to callers.
 *
 * Errors are normalized via {@link ensureError} and logged by
 * {@link getIpcServiceHelpers} so renderer services share a consistent
 * diagnostics pipeline.
 */

import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestorePayload,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

import { ensureError } from "@shared/utils/errorHandling";
import {
    validateSerializedDatabaseBackupResult,
    validateSerializedDatabaseBackupSaveResult,
    validateSerializedDatabaseRestoreResult,
} from "@shared/validation/dataSchemas";

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";
import { validateServicePayload } from "./utils/validation";

interface DataServiceContract {
    readonly downloadSqliteBackup: () => Promise<SerializedDatabaseBackupResult>;
    readonly exportData: () => Promise<string>;
    readonly importData: (data: string) => Promise<boolean>;
    readonly initialize: () => Promise<void>;
    readonly restoreSqliteBackup: (
        payload: SerializedDatabaseRestorePayload
    ) => Promise<SerializedDatabaseRestoreResult>;
    readonly saveSqliteBackup: () => Promise<SerializedDatabaseBackupSaveResult>;
}

// eslint-disable-next-line ex/no-unhandled -- Module-level initialization should fail fast when preload wiring is invalid.
const { ensureInitialized, wrap } = getIpcServiceHelpers("DataService", {
    bridgeContracts: [
        {
            domain: "data",
            methods: [
                "downloadSqliteBackup",
                "exportData",
                "importData",
                "saveSqliteBackup",
                "restoreSqliteBackup",
            ],
        },
    ],
});

/**
 * Facade for data export, import, and backup operations.
 *
 * @remarks
 * All methods in this service delegate to the typed `data` preload domain using
 * {@link getIpcServiceHelpers}, and validate responses with the shared Zod
 * schemas from `@shared/validation/dataSchemas`.
 *
 * Service-level error logging is handled consistently by
 * {@link getIpcServiceHelpers}.
 */
export const DataService: DataServiceContract = {
    /**
     * Downloads a validated SQLite backup from the backend.
     *
     * @remarks
     * The backup payload is validated with
     * {@link validateSerializedDatabaseBackupResult}. On success the validated
     * {@link SerializedDatabaseBackupResult} is returned to the caller; on
     * failure an error is logged and rethrown.
     *
     * @returns A promise that resolves with the serialized backup metadata and
     *   `ArrayBuffer` content for the SQLite database file.
     *
     * @throws {@link Error} When the IPC bridge is unavailable, the backend
     *   rejects the backup request, or the returned payload fails schema
     *   validation.
     */
    downloadSqliteBackup: wrap("downloadSqliteBackup", async (api) => {
        try {
            return validateServicePayload(
                validateSerializedDatabaseBackupResult,
                await api.data.downloadSqliteBackup(),
                {
                    operation: "downloadSqliteBackup",
                    serviceName: "DataService",
                }
            );
        } catch (error: unknown) {
            throw ensureError(error);
        }
    }),

    /**
     * Exports all application data as a serialized JSON string.
     *
     * @remarks
     * The returned string is intended to be stored or transported as a logical
     * backup that can later be passed to {@link DataService.importData} for
     * restoration. The payload type is verified to be a string before it is
     * returned.
     *
     * @returns A promise that resolves with a JSON string representing the
     *   exported data set.
     *
     * @throws {@link TypeError} When the backend returns a non-string payload
     *   for the export operation.
     * @throws {@link Error} For transport failures or unexpected backend
     *   errors.
     */
    exportData: wrap("exportData", async (api) => {
        const payload = await api.data.exportData();
        if (typeof payload !== "string") {
            throw new TypeError(
                "Export data payload must be a string representing serialized backup JSON"
            );
        }

        return payload;
    }),

    /**
     * Imports a JSON data snapshot previously produced by
     * {@link DataService.exportData}.
     *
     * @param data - JSON string containing the exported data to import.
     *
     * @returns A promise that resolves with `true` when the backend reports a
     *   successful import, or `false` when the import completes but is
     *   explicitly rejected by the backend.
     *
     * @throws {@link TypeError} When the backend returns a non-boolean result
     *   for the import operation.
     * @throws {@link Error} When the IPC bridge fails, the payload cannot be
     *   processed, or an unexpected backend error occurs.
     */
    importData: wrap("importData", async (api, payload: string) => {
        const result = await api.data.importData(payload);
        if (typeof result !== "boolean") {
            throw new TypeError(
                "Import data response must be a boolean indicating success"
            );
        }

        return result;
    }),

    /**
     * Ensures that the preload bridge for the `data` domain is initialized
     * before any IPC operations are performed.
     *
     * @remarks
     * Callers should invoke this method during application startup to avoid
     * paying the initialization cost on the first data operation.
     *
     * @returns A promise that resolves when the underlying bridge is ready for
     *   use.
     *
     * @throws {@link Error} When the Electron environment is unavailable or the
     *   preload bridge cannot be initialized.
     */
    initialize: ensureInitialized,

    /**
     * Restores the on-disk SQLite database from a previously downloaded backup
     * file.
     *
     * @remarks
     * The supplied {@link SerializedDatabaseRestorePayload} is forwarded to the
     * backend, which performs integrity and version checks before applying the
     * restore. The response is validated using
     * {@link validateSerializedDatabaseRestoreResult} and returned to the caller
     * for display in restore summaries.
     *
     * @param payload - Serialized metadata and buffer representing the backup
     *   file to restore.
     *
     * @returns A promise that resolves with a
     *   {@link SerializedDatabaseRestoreResult} describing the outcome of the
     *   restore, including schema/version information and pre-restore snapshot
     *   metadata when available.
     *
     * @throws {@link Error} When the backend rejects the restore request,
     *   schema or checksum validation fails, or the IPC bridge encounters an
     *   unexpected error.
     */
    restoreSqliteBackup: wrap(
        "restoreSqliteBackup",
        async (
            api,
            payload: SerializedDatabaseRestorePayload
        ): Promise<SerializedDatabaseRestoreResult> => {
            try {
                // The Zod schema already models `preRestoreFileName` as
                // optional, so we can return the parsed result directly
                // without reshaping. Callers can treat the absence of the
                // property and an explicit `undefined` value equivalently
                // when displaying restore summaries.
                return validateServicePayload<SerializedDatabaseRestoreResult>(
                    validateSerializedDatabaseRestoreResult,
                    await api.data.restoreSqliteBackup(payload),
                    {
                        diagnostics: {
                            payloadFileName: payload.fileName,
                        },
                        operation: "restoreSqliteBackup",
                        serviceName: "DataService",
                    }
                );
            } catch (error: unknown) {
                throw ensureError(error);
            }
        }
    ),

    /**
     * Saves a SQLite backup to disk via a native save dialog.
     *
     * @remarks
     * This method exists to avoid transferring large backup buffers over IPC.
     * The main process creates the backup, shows a save dialog, and writes the
     * file on behalf of the renderer.
     */
    saveSqliteBackup: wrap("saveSqliteBackup", async (api) => {
        try {
            return validateServicePayload(
                validateSerializedDatabaseBackupSaveResult,
                await api.data.saveSqliteBackup(),
                {
                    operation: "saveSqliteBackup",
                    serviceName: "DataService",
                }
            );
        } catch (error: unknown) {
            throw ensureError(error);
        }
    }),
};
