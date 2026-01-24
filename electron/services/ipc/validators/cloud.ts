/**
 * Parameter validators for cloud IPC handlers.
 */

import type { IpcParameterValidator } from "../types";

import {
    createBackupKeyValidator,
    validateCloudBackupMigrationRequest,
    validateCloudEnableSyncConfig,
    validateCloudFilesystemProviderConfig,
    validateEncryptionPassphrasePayload,
} from "./shared";
import { createNoParamsValidator } from "./utils/commonValidators";

/**
 * Interface for cloud handler validators.
 */
interface CloudHandlerValidatorsInterface {
    clearEncryptionKey: IpcParameterValidator;
    configureFilesystemProvider: IpcParameterValidator;
    connectDropbox: IpcParameterValidator;
    connectGoogleDrive: IpcParameterValidator;
    deleteBackup: IpcParameterValidator;
    disconnect: IpcParameterValidator;
    enableSync: IpcParameterValidator;
    getStatus: IpcParameterValidator;
    listBackups: IpcParameterValidator;
    migrateBackups: IpcParameterValidator;
    previewResetRemoteSyncState: IpcParameterValidator;
    requestSyncNow: IpcParameterValidator;
    resetRemoteSyncState: IpcParameterValidator;
    restoreBackup: IpcParameterValidator;
    setEncryptionPassphrase: IpcParameterValidator;
    uploadLatestBackup: IpcParameterValidator;
}

export const CloudHandlerValidators: CloudHandlerValidatorsInterface = {
    clearEncryptionKey: createNoParamsValidator(),
    configureFilesystemProvider: validateCloudFilesystemProviderConfig,
    connectDropbox: createNoParamsValidator(),
    connectGoogleDrive: createNoParamsValidator(),
    deleteBackup: createBackupKeyValidator("key"),
    disconnect: createNoParamsValidator(),
    enableSync: validateCloudEnableSyncConfig,
    getStatus: createNoParamsValidator(),
    listBackups: createNoParamsValidator(),
    migrateBackups: validateCloudBackupMigrationRequest,
    previewResetRemoteSyncState: createNoParamsValidator(),
    requestSyncNow: createNoParamsValidator(),
    resetRemoteSyncState: createNoParamsValidator(),
    restoreBackup: createBackupKeyValidator("key"),
    setEncryptionPassphrase: validateEncryptionPassphrasePayload,
    uploadLatestBackup: createNoParamsValidator(),
} as const;
