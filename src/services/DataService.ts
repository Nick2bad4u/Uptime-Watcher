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

const hasIssueArray = (
    value: unknown
): value is { issues: Array<{ message: string }> } =>
    typeof value === "object" &&
    value !== null &&
    "issues" in value &&
    Array.isArray((value as { issues?: unknown }).issues);

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

function validateAndUnwrap<T>(
    operation: string,
    validate: (
        value: unknown
    ) => { data: T; success: true } | { error: unknown; success: false },
    value: unknown,
    diagnostics?: Record<string, unknown>
): T {
    const parsed: ReturnType<typeof validate> = ((): ReturnType<
        typeof validate
    > => {
        try {
            return validate(value);
        } catch (error: unknown) {
            const diagnosticSuffix = diagnostics
                ? ` | diagnostics=${JSON.stringify(diagnostics)}`
                : "";
            throw new Error(
                `[DataService] ${operation} threw during validation${diagnosticSuffix}`,
                { cause: error }
            );
        }
    })();

    if (!parsed.success) {
        const parseError = parsed.error;
        const issues = hasIssueArray(parseError) ? parseError.issues : [];
        const messages = issues.map((issue) => issue.message).join(", ");
        const diagnosticSuffix = diagnostics
            ? ` | diagnostics=${JSON.stringify(diagnostics)}`
            : "";
        throw new Error(
            `[DataService] ${operation} returned invalid payload: ${messages}${diagnosticSuffix}`,
            { cause: parseError }
        );
    }

    return parsed.data;
}

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
                return validateAndUnwrap(
                    "downloadSqliteBackup",
                    validateSerializedDatabaseBackupResult,
                    await api.data.downloadSqliteBackup()
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
                    const parsed = validateAndUnwrap(
                        "restoreSqliteBackup",
                        validateSerializedDatabaseRestoreResult,
                        await api.data.restoreSqliteBackup(payload),
                        {
                            payloadFileName: payload.fileName,
                        }
                    );

                    return parsed.preRestoreFileName === undefined
                        ? {
                              metadata: parsed.metadata,
                              restoredAt: parsed.restoredAt,
                          }
                        : parsed;
                } catch (error: unknown) {
                    throw ensureError(error);
                }
            })
    ),
};
