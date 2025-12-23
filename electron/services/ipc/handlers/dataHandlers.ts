import type {
    IpcInvokeChannel,
    SerializedDatabaseBackupResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

import { DATA_CHANNELS } from "@shared/types/preload";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { validateDatabaseBackupPayload } from "../../database/utils/databaseBackup";
import { createStandardizedIpcRegistrar, toClonedArrayBuffer } from "../utils";
import { DataHandlerValidators } from "../validators";

/**
 * Dependencies required for registering data IPC handlers.
 */
export interface DataHandlersDependencies {
    readonly registeredHandlers: Set<IpcInvokeChannel>;
    readonly uptimeOrchestrator: UptimeOrchestrator;
}

/**
 * Registers IPC handlers for data import/export flows.
 */
export function registerDataHandlers({
    registeredHandlers,
    uptimeOrchestrator,
}: DataHandlersDependencies): void {
    const register = createStandardizedIpcRegistrar(registeredHandlers);

    register(
        DATA_CHANNELS.exportData,
        () => uptimeOrchestrator.exportData(),
        DataHandlerValidators.exportData
    );

    register(
        DATA_CHANNELS.importData,
        (serializedBackup) => uptimeOrchestrator.importData(serializedBackup),
        DataHandlerValidators.importData
    );

    register(
        DATA_CHANNELS.downloadSqliteBackup,
        async () => {
            const result = await uptimeOrchestrator.downloadBackup();
            validateDatabaseBackupPayload(result);
            const { buffer, fileName, metadata } = result;
            const arrayBuffer = toClonedArrayBuffer(buffer);

            return {
                buffer: arrayBuffer,
                fileName,
                metadata,
            } satisfies SerializedDatabaseBackupResult;
        },
        DataHandlerValidators.downloadSqliteBackup
    );

    register(
        DATA_CHANNELS.restoreSqliteBackup,
        async (payload) => {
            const buffer = Buffer.from(payload.buffer);
            const restorePayload = payload.fileName
                ? { buffer, fileName: payload.fileName }
                : { buffer };
            const summary =
                await uptimeOrchestrator.restoreBackup(restorePayload);

            return {
                metadata: summary.metadata,
                preRestoreFileName: summary.preRestoreFileName,
                restoredAt: summary.restoredAt,
            } satisfies SerializedDatabaseRestoreResult;
        },
        DataHandlerValidators.restoreSqliteBackup
    );
}
