/**
 * Cloud Domain API - preload bridge for cloud backup + sync operations.
 *
 * @remarks
 * This module is intentionally a thin wrapper around typed IPC invocations. It
 * does not catch errors; renderer service layers handle presentation.
 *
 * @packageDocumentation
 */

/* eslint-disable ex/no-unhandled -- Domain APIs are thin wrappers that don't handle exceptions */

import { CLOUD_CHANNELS, type CloudDomainBridge } from "@shared/types/preload";

import { createTypedInvoker, createVoidInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the cloud domain API operations.
 *
 * @public
 */
export interface CloudApiInterface extends CloudDomainBridge {
    clearEncryptionKey: CloudDomainBridge["clearEncryptionKey"];
    configureFilesystemProvider: CloudDomainBridge["configureFilesystemProvider"];
    connectDropbox: CloudDomainBridge["connectDropbox"];
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
    clearEncryptionKey: createTypedInvoker(CLOUD_CHANNELS.clearEncryptionKey),
    configureFilesystemProvider: createTypedInvoker(
        CLOUD_CHANNELS.configureFilesystemProvider
    ),
    connectDropbox: createTypedInvoker(CLOUD_CHANNELS.connectDropbox),
    disconnect: createTypedInvoker(CLOUD_CHANNELS.disconnect),
    enableSync: createTypedInvoker(CLOUD_CHANNELS.enableSync),
    getStatus: createTypedInvoker(CLOUD_CHANNELS.getStatus),
    listBackups: createTypedInvoker(CLOUD_CHANNELS.listBackups),
    migrateBackups: createTypedInvoker(CLOUD_CHANNELS.migrateBackups),
    previewResetRemoteSyncState: createTypedInvoker(
        CLOUD_CHANNELS.previewResetRemoteSyncState
    ),
    requestSyncNow: createVoidInvoker(CLOUD_CHANNELS.requestSyncNow),
    resetRemoteSyncState: createTypedInvoker(
        CLOUD_CHANNELS.resetRemoteSyncState
    ),
    restoreBackup: createTypedInvoker(CLOUD_CHANNELS.restoreBackup),
    setEncryptionPassphrase: createTypedInvoker(
        CLOUD_CHANNELS.setEncryptionPassphrase
    ),
    uploadLatestBackup: createTypedInvoker(CLOUD_CHANNELS.uploadLatestBackup),
} as const;

/**
 * Type alias for the cloud domain preload bridge.
 *
 * @public
 */
export type CloudApi = CloudDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
