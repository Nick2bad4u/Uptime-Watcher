/**
 * Parameter validators for cloud IPC handlers.
 */

import type { CloudBackupEntry, CloudStatusSummary } from "@shared/types/cloud";
import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { SerializedDatabaseRestoreResult } from "@shared/types/ipc";

import { safeParseCloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import {
    validateCloudBackupEntry,
    validateCloudBackupEntryArray,
} from "@shared/validation/cloudBackupSchemas";
import {
    validateCloudStatusSummary,
    validateCloudSyncResetPreview,
    validateCloudSyncResetResult,
} from "@shared/validation/cloudSchemas";
import { validateSerializedDatabaseRestoreResult } from "@shared/validation/dataSchemas";

import type { IpcParameterValidator, IpcResultValidator } from "../types";

import {
    createBackupKeyValidator,
    validateCloudBackupMigrationRequest,
    validateCloudEnableSyncConfig,
    validateCloudFilesystemProviderConfig,
    validateEncryptionPassphrasePayload,
} from "./cloudValidation";
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

export const CloudHandlerResultValidators: Readonly<{
    backupEntry: IpcResultValidator<CloudBackupEntry>;
    backupEntryArray: IpcResultValidator<CloudBackupEntry[]>;
    backupMigrationResult: IpcResultValidator<CloudBackupMigrationResult>;
    restoreBackup: IpcResultValidator<SerializedDatabaseRestoreResult>;
    statusSummary: IpcResultValidator<CloudStatusSummary>;
    syncResetPreview: IpcResultValidator<CloudSyncResetPreview>;
    syncResetResult: IpcResultValidator<CloudSyncResetResult>;
}> = {
    backupEntry: (result) => {
        const validation = validateCloudBackupEntry(result);

        if (validation.success) {
            return null;
        }

        return formatZodIssues(validation.error.issues);
    },

    backupEntryArray: (result) => {
        const validation = validateCloudBackupEntryArray(result);

        if (validation.success) {
            return null;
        }

        return formatZodIssues(validation.error.issues);
    },

    backupMigrationResult: (result) => {
        const validation = safeParseCloudBackupMigrationResult(result);

        if (validation.success) {
            return null;
        }

        return formatZodIssues(validation.error.issues);
    },

    restoreBackup: (result) => {
        const validation = validateSerializedDatabaseRestoreResult(result);

        if (validation.success) {
            return null;
        }

        return formatZodIssues(validation.error.issues);
    },

    statusSummary: (result) => {
        const validation = validateCloudStatusSummary(result);

        if (validation.success) {
            return null;
        }

        return formatZodIssues(validation.error.issues);
    },

    syncResetPreview: (result) => {
        const validation = validateCloudSyncResetPreview(result);

        if (validation.success) {
            return null;
        }

        return formatZodIssues(validation.error.issues);
    },

    syncResetResult: (result) => {
        const validation = validateCloudSyncResetResult(result);

        if (validation.success) {
            return null;
        }

        return formatZodIssues(validation.error.issues);
    },
};
