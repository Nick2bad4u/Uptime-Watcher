import type {
    IpcInvokeChannel,
    IpcInvokeChannelParams,
    SerializedDatabaseBackupResult,
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

import { MAX_IPC_SQLITE_BACKUP_TRANSFER_BYTES } from "@shared/constants/backup";
import { DATA_CHANNELS } from "@shared/types/preload";
import { readProcessEnv } from "@shared/utils/environment";
import { createSingleFlight } from "@shared/utils/singleFlight";
import { app, dialog } from "electron";
import * as path from "node:path";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { validateDatabaseBackupPayload } from "../../database/utils/backup/databaseBackup";
import {
    buildPlaywrightBackupPath,
    ensureSqliteFileExtension,
} from "../internal/sqliteBackupPath";
import { createStandardizedIpcRegistrar, toClonedArrayBuffer } from "../utils";
import {
    DataHandlerResultValidators,
    DataHandlerValidators,
} from "../validators/data";

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

    const exportDataSingleFlight = createSingleFlight(async () =>
        uptimeOrchestrator.exportData()
    );

    const downloadSqliteBackupSingleFlight = createSingleFlight(async () => {
        const result = await uptimeOrchestrator.downloadBackup();
        validateDatabaseBackupPayload(result);
        const { buffer, fileName, metadata } = result;

        if (buffer.byteLength > MAX_IPC_SQLITE_BACKUP_TRANSFER_BYTES) {
            throw new Error(
                `SQLite backup is too large to transfer over IPC (${buffer.byteLength} > ${MAX_IPC_SQLITE_BACKUP_TRANSFER_BYTES} bytes). Use the save-sqlite-backup flow instead.`
            );
        }
        const arrayBuffer = toClonedArrayBuffer(buffer);

        return {
            buffer: arrayBuffer,
            fileName,
            metadata,
        } satisfies SerializedDatabaseBackupResult;
    });

    const saveSqliteBackupSingleFlight = createSingleFlight(
        async (): Promise<SerializedDatabaseBackupSaveResult> => {
            const downloadsDir = app.getPath("downloads");
            const suggestedFileName = `uptime-watcher-backup-${Date.now()}.sqlite`;
            const defaultPath = path.join(downloadsDir, suggestedFileName);

            const isPlaywrightAutomation =
                readProcessEnv("PLAYWRIGHT_TEST")?.toLowerCase() === "true" ||
                readProcessEnv("HEADLESS")?.toLowerCase() === "true";

            if (isPlaywrightAutomation) {
                const automationPath = buildPlaywrightBackupPath({
                    baseDirectory: app.getPath("userData"),
                    fileName: suggestedFileName,
                });

                const metadata =
                    await uptimeOrchestrator.saveBackupToPath(automationPath);

                return {
                    canceled: false,
                    fileName: path.basename(automationPath),
                    filePath: automationPath,
                    metadata,
                } satisfies SerializedDatabaseBackupSaveResult;
            }

            const dialogResult = await dialog.showSaveDialog({
                defaultPath,
                filters: [
                    {
                        extensions: ["sqlite", "db"],
                        name: "SQLite Backup",
                    },
                    {
                        extensions: ["*"],
                        name: "All Files",
                    },
                ],
                title: "Save SQLite Backup",
            });

            if (dialogResult.canceled || !dialogResult.filePath) {
                return { canceled: true };
            }

            const targetPath = ensureSqliteFileExtension(dialogResult.filePath);

            const metadata =
                await uptimeOrchestrator.saveBackupToPath(targetPath);

            return {
                canceled: false,
                fileName: path.basename(targetPath),
                filePath: targetPath,
                metadata,
            } satisfies SerializedDatabaseBackupSaveResult;
        }
    );

    register(
        DATA_CHANNELS.exportData,
        () => exportDataSingleFlight(),
        DataHandlerValidators.exportData
    );

    register(
        DATA_CHANNELS.importData,
        (
            serializedBackup: IpcInvokeChannelParams<
                typeof DATA_CHANNELS.importData
            >[0]
        ) => uptimeOrchestrator.importData(serializedBackup),
        DataHandlerValidators.importData
    );

    register(
        DATA_CHANNELS.downloadSqliteBackup,
        () => downloadSqliteBackupSingleFlight(),
        DataHandlerValidators.downloadSqliteBackup,
        DataHandlerResultValidators.downloadSqliteBackup
    );

    register(
        DATA_CHANNELS.saveSqliteBackup,
        () => saveSqliteBackupSingleFlight(),
        DataHandlerValidators.saveSqliteBackup,
        DataHandlerResultValidators.saveSqliteBackup
    );

    register(
        DATA_CHANNELS.restoreSqliteBackup,
        async (
            payload: IpcInvokeChannelParams<
                typeof DATA_CHANNELS.restoreSqliteBackup
            >[0]
        ) => {
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
        DataHandlerValidators.restoreSqliteBackup,
        DataHandlerResultValidators.restoreSqliteBackup
    );
}
