import type {
    IpcInvokeChannel,
    SerializedDatabaseBackupResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

import { DATA_CHANNELS } from "@shared/types/preload";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { validateDatabaseBackupPayload } from "../../database/utils/databaseBackup";
import { registerStandardizedIpcHandler } from "../utils";
import { DataHandlerValidators } from "../validators";
import { withIgnoredIpcEvent } from "./handlerShared";

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
    registerStandardizedIpcHandler(
        DATA_CHANNELS.exportData,
        withIgnoredIpcEvent(() => uptimeOrchestrator.exportData()),
        DataHandlerValidators.exportData,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        DATA_CHANNELS.importData,
        withIgnoredIpcEvent((serializedBackup) =>
            uptimeOrchestrator.importData(serializedBackup)
        ),
        DataHandlerValidators.importData,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        DATA_CHANNELS.downloadSqliteBackup,
        withIgnoredIpcEvent(async () => {
            const result = await uptimeOrchestrator.downloadBackup();
            validateDatabaseBackupPayload(result);
            const bufferView = globalThis["Uint8Array"].from(result.buffer);
            const arrayBuffer = bufferView.buffer;

            return {
                buffer: arrayBuffer,
                fileName: result.fileName,
                metadata: result.metadata,
            } satisfies SerializedDatabaseBackupResult;
        }),
        DataHandlerValidators.downloadSqliteBackup,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        DATA_CHANNELS.restoreSqliteBackup,
        withIgnoredIpcEvent(async (payload) => {
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
        }),
        DataHandlerValidators.restoreSqliteBackup,
        registeredHandlers
    );
}
