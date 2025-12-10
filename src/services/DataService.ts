/**
 * Service layer for handling all data-related operations.
 *
 * @packageDocumentation
 */

import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseRestorePayload,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

import {
    ensureError,
    withUtilityErrorHandling,
} from "@shared/utils/errorHandling";
import {
    validateSerializedDatabaseBackupResult,
    validateSerializedDatabaseRestoreResult,
} from "@shared/validation/dataSchemas";

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";
import { validateServicePayload } from "./utils/validation";

const runDataOperation = async <T>(
    operation: string,
    handler: () => Promise<T>
): Promise<T> =>
    withUtilityErrorHandling(
        handler,
        `[DataService] ${operation}`,
        undefined,
        true
    );

interface DataServiceContract {
    readonly downloadSqliteBackup: () => Promise<SerializedDatabaseBackupResult>;
    readonly exportData: () => Promise<string>;
    readonly importData: (data: string) => Promise<boolean>;
    readonly initialize: () => Promise<void>;
    readonly restoreSqliteBackup: (
        payload: SerializedDatabaseRestorePayload
    ) => Promise<SerializedDatabaseRestoreResult>;
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
                        "restoreSqliteBackup",
                    ],
                },
            ],
        });
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

export const DataService: DataServiceContract = {
    downloadSqliteBackup: wrap("downloadSqliteBackup", async (api) =>
        runDataOperation("downloadSqliteBackup", async () => {
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
        })
    ),

    exportData: wrap("exportData", async (api) =>
        runDataOperation("exportData", async () => {
            const payload = await api.data.exportData();
            if (typeof payload !== "string") {
                throw new TypeError(
                    "Export data payload must be a string representing serialized backup JSON"
                );
            }

            return payload;
        })
    ),

    importData: wrap("importData", async (api, payload: string) =>
        runDataOperation("importData", async () => {
            const result = await api.data.importData(payload);
            if (typeof result !== "boolean") {
                throw new TypeError(
                    "Import data response must be a boolean indicating success"
                );
            }

            return result;
        })
    ),

    initialize: ensureInitialized,

    restoreSqliteBackup: wrap(
        "restoreSqliteBackup",
        async (
            api,
            payload: SerializedDatabaseRestorePayload
        ): Promise<SerializedDatabaseRestoreResult> =>
            runDataOperation("restoreSqliteBackup", async () => {
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
            })
    ),
};
