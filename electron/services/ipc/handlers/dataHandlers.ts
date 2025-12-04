import type {
    IpcInvokeChannel,
    SerializedDatabaseBackupResult,
} from "@shared/types/ipc";

import { DATA_CHANNELS } from "@shared/types/preload";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

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

            const arrayBuffer = new ArrayBuffer(result.buffer.byteLength);
            new Uint8Array(arrayBuffer).set(result.buffer);

            return {
                buffer: arrayBuffer,
                fileName: result.fileName,
                metadata: result.metadata,
            } satisfies SerializedDatabaseBackupResult;
        }),
        DataHandlerValidators.downloadSqliteBackup,
        registeredHandlers
    );
}
