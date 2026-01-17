/**
 * Cloud Domain API - preload bridge for cloud backup + sync operations.
 *
 * @remarks
 * This module is intentionally a thin wrapper around typed IPC invocations. It
 * does not catch errors; renderer service layers handle presentation.
 *
 * @packageDocumentation
 */



import { safeParseCloudBackupMigrationResult as safeParseCloudBackupMigrationResultImpl } from "@shared/types/cloudBackupMigration";
import { CLOUD_CHANNELS, type CloudDomainBridge } from "@shared/types/preload";
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

import {
    createSafeParseAdapter,
    createValidatedInvoker,
    createVoidInvoker,
} from "../core/bridgeFactory";

const safeParseCloudStatusSummary = createSafeParseAdapter(validateCloudStatusSummary);
const safeParseCloudBackupEntry = createSafeParseAdapter(validateCloudBackupEntry);
const safeParseCloudBackupEntryArray = createSafeParseAdapter(
    validateCloudBackupEntryArray
);
const safeParseCloudSyncResetPreview = createSafeParseAdapter(
    validateCloudSyncResetPreview
);
const safeParseCloudSyncResetResult = createSafeParseAdapter(
    validateCloudSyncResetResult
);
const safeParseCloudBackupMigrationResult = createSafeParseAdapter(
    safeParseCloudBackupMigrationResultImpl
);
const safeParseSerializedDatabaseRestoreResult = createSafeParseAdapter(
    validateSerializedDatabaseRestoreResult
);

/**
 * Interface defining the cloud domain API operations.
 *
 * @public
 */
export interface CloudApiInterface extends CloudDomainBridge {
    clearEncryptionKey: CloudDomainBridge["clearEncryptionKey"];
    configureFilesystemProvider: CloudDomainBridge["configureFilesystemProvider"];
    connectDropbox: CloudDomainBridge["connectDropbox"];
    connectGoogleDrive: CloudDomainBridge["connectGoogleDrive"];
    deleteBackup: CloudDomainBridge["deleteBackup"];
    disconnect: CloudDomainBridge["disconnect"];
    enableSync: CloudDomainBridge["enableSync"];
    getStatus: CloudDomainBridge["getStatus"];
    listBackups: CloudDomainBridge["listBackups"];
    migrateBackups: CloudDomainBridge["migrateBackups"];
    previewResetRemoteSyncState: CloudDomainBridge["previewResetRemoteSyncState"];
    requestSyncNow: CloudDomainBridge["requestSyncNow"];
    resetRemoteSyncState: CloudDomainBridge["resetRemoteSyncState"];
    restoreBackup: CloudDomainBridge["restoreBackup"];
    setEncryptionPassphrase: CloudDomainBridge["setEncryptionPassphrase"];
    uploadLatestBackup: CloudDomainBridge["uploadLatestBackup"];
}

/**
 * Cloud domain API providing cloud backup + sync operations.
 *
 * @public
 */
export const cloudApi: CloudApiInterface = {
    clearEncryptionKey: createValidatedInvoker(
        CLOUD_CHANNELS.clearEncryptionKey,
        safeParseCloudStatusSummary,
        {
            domain: "cloudApi",
            guardName: "validateCloudStatusSummary",
        }
    ),
    configureFilesystemProvider: createValidatedInvoker(
        CLOUD_CHANNELS.configureFilesystemProvider,
        safeParseCloudStatusSummary,
        {
            domain: "cloudApi",
            guardName: "validateCloudStatusSummary",
        }
    ),
    connectDropbox: createValidatedInvoker(
        CLOUD_CHANNELS.connectDropbox,
        safeParseCloudStatusSummary,
        {
            domain: "cloudApi",
            guardName: "validateCloudStatusSummary",
        }
    ),
    connectGoogleDrive: createValidatedInvoker(
        CLOUD_CHANNELS.connectGoogleDrive,
        safeParseCloudStatusSummary,
        {
            domain: "cloudApi",
            guardName: "validateCloudStatusSummary",
        }
    ),
    deleteBackup: createValidatedInvoker(
        CLOUD_CHANNELS.deleteBackup,
        safeParseCloudBackupEntryArray,
        {
            domain: "cloudApi",
            guardName: "validateCloudBackupEntryArray",
        }
    ),
    disconnect: createValidatedInvoker(
        CLOUD_CHANNELS.disconnect,
        safeParseCloudStatusSummary,
        {
            domain: "cloudApi",
            guardName: "validateCloudStatusSummary",
        }
    ),
    enableSync: createValidatedInvoker(
        CLOUD_CHANNELS.enableSync,
        safeParseCloudStatusSummary,
        {
            domain: "cloudApi",
            guardName: "validateCloudStatusSummary",
        }
    ),
    getStatus: createValidatedInvoker(
        CLOUD_CHANNELS.getStatus,
        safeParseCloudStatusSummary,
        {
            domain: "cloudApi",
            guardName: "validateCloudStatusSummary",
        }
    ),
    listBackups: createValidatedInvoker(
        CLOUD_CHANNELS.listBackups,
        safeParseCloudBackupEntryArray,
        {
            domain: "cloudApi",
            guardName: "validateCloudBackupEntryArray",
        }
    ),
    migrateBackups: createValidatedInvoker(
        CLOUD_CHANNELS.migrateBackups,
        safeParseCloudBackupMigrationResult,
        {
            domain: "cloudApi",
            guardName: "safeParseCloudBackupMigrationResult",
        }
    ),
    previewResetRemoteSyncState: createValidatedInvoker(
        CLOUD_CHANNELS.previewResetRemoteSyncState,
        safeParseCloudSyncResetPreview,
        {
            domain: "cloudApi",
            guardName: "validateCloudSyncResetPreview",
        }
    ),
    requestSyncNow: createVoidInvoker(CLOUD_CHANNELS.requestSyncNow),
    resetRemoteSyncState: createValidatedInvoker(
        CLOUD_CHANNELS.resetRemoteSyncState,
        safeParseCloudSyncResetResult,
        {
            domain: "cloudApi",
            guardName: "validateCloudSyncResetResult",
        }
    ),
    restoreBackup: createValidatedInvoker(
        CLOUD_CHANNELS.restoreBackup,
        safeParseSerializedDatabaseRestoreResult,
        {
            domain: "cloudApi",
            guardName: "validateSerializedDatabaseRestoreResult",
        }
    ),
    setEncryptionPassphrase: createValidatedInvoker(
        CLOUD_CHANNELS.setEncryptionPassphrase,
        safeParseCloudStatusSummary,
        {
            domain: "cloudApi",
            guardName: "validateCloudStatusSummary",
        }
    ),
    uploadLatestBackup: createValidatedInvoker(
        CLOUD_CHANNELS.uploadLatestBackup,
        safeParseCloudBackupEntry,
        {
            domain: "cloudApi",
            guardName: "validateCloudBackupEntry",
        }
    ),
} as const;

/**
 * Type alias for the cloud domain preload bridge.
 *
 * @public
 */
export type CloudApi = CloudDomainBridge;
