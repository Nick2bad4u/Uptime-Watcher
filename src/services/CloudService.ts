/**
 * Renderer service layer for cloud provider operations (remote backup + sync).
 *
 * @remarks
 * This service is the only renderer-facing module that should directly invoke
 * the preload bridge cloud domain. UI components must call this service (or
 * store operations built on top of it) rather than accessing the raw Electron
 * preload bridge directly.
 *
 * The initial implementation supports a filesystem-backed provider owned by
 * Electron main as well as first-class Dropbox and Google Drive providers.
 *
 * - **Dropbox** uses OAuth 2.0 Authorization Code + PKCE and runs entirely in
 *   Electron main (system browser + loopback redirect). No OAuth tokens are
 *   ever exposed to the renderer.
 * - **Filesystem** allows users to point Uptime Watcher at an existing synced
 *   folder (Dropbox/Google Drive/etc.) without embedding OAuth flows.
 *
 * @packageDocumentation
 */

import type {
    CloudBackupEntry,
    CloudEnableSyncConfig,
    CloudFilesystemProviderConfig,
    CloudStatusSummary,
} from "@shared/types/cloud";
import type {
    CloudBackupMigrationRequest,
    CloudBackupMigrationResult,
} from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { SerializedDatabaseRestoreResult } from "@shared/types/ipc";

import { ensureError } from "@shared/utils/errorHandling";

import { logger } from "./logger";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

/**
 * Contract describing the renderer-facing cloud service surface.
 */
interface CloudServiceContract {
    clearEncryptionKey: () => Promise<CloudStatusSummary>;
    configureFilesystemProvider: (
        config: CloudFilesystemProviderConfig
    ) => Promise<CloudStatusSummary>;
    connectDropbox: () => Promise<CloudStatusSummary>;
    connectGoogleDrive: () => Promise<CloudStatusSummary>;
    deleteBackup: (key: string) => Promise<CloudBackupEntry[]>;
    disconnect: () => Promise<CloudStatusSummary>;
    enableSync: (config: CloudEnableSyncConfig) => Promise<CloudStatusSummary>;
    getStatus: () => Promise<CloudStatusSummary>;
    initialize: () => Promise<void>;
    listBackups: () => Promise<CloudBackupEntry[]>;
    migrateBackups: (
        config: CloudBackupMigrationRequest
    ) => Promise<CloudBackupMigrationResult>;
    previewResetRemoteSyncState: () => Promise<CloudSyncResetPreview>;
    requestSyncNow: () => Promise<void>;
    resetRemoteSyncState: () => Promise<CloudSyncResetResult>;
    restoreBackup: (key: string) => Promise<SerializedDatabaseRestoreResult>;
    setEncryptionPassphrase: (
        passphrase: string
    ) => Promise<CloudStatusSummary>;
    uploadLatestBackup: () => Promise<CloudBackupEntry>;
}

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("CloudService", {
            bridgeContracts: [
                {
                    domain: "cloud",
                    methods: [
                        "clearEncryptionKey",
                        "connectDropbox",
                        "connectGoogleDrive",
                        "configureFilesystemProvider",
                        "deleteBackup",
                        "disconnect",
                        "enableSync",
                        "getStatus",
                        "listBackups",
                        "migrateBackups",
                        "previewResetRemoteSyncState",
                        "requestSyncNow",
                        "resetRemoteSyncState",
                        "restoreBackup",
                        "setEncryptionPassphrase",
                        "uploadLatestBackup",
                    ],
                },
            ],
        });
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

/**
 * Service for interacting with cloud providers through Electron IPC.
 *
 * @public
 */
export const CloudService: CloudServiceContract = {
    clearEncryptionKey: wrap("clearEncryptionKey", (api) =>
        api.cloud.clearEncryptionKey()
    ),

    configureFilesystemProvider: wrap(
        "configureFilesystemProvider",
        (api, config) => api.cloud.configureFilesystemProvider(config)
    ),

    connectDropbox: wrap("connectDropbox", (api) => api.cloud.connectDropbox()),

    connectGoogleDrive: wrap("connectGoogleDrive", (api) =>
        api.cloud.connectGoogleDrive()
    ),

    deleteBackup: wrap("deleteBackup", (api, key) =>
        api.cloud.deleteBackup(key)
    ),

    disconnect: wrap("disconnect", (api) => api.cloud.disconnect()),

    enableSync: wrap("enableSync", (api, config) =>
        // eslint-disable-next-line n/no-sync -- "Sync" is part of the feature name, not a Node.js sync API.
        api.cloud.enableSync(config)
    ),

    getStatus: wrap("getStatus", (api) => api.cloud.getStatus()),

    initialize: ensureInitialized,

    listBackups: wrap("listBackups", (api) => api.cloud.listBackups()),

    migrateBackups: wrap("migrateBackups", (api, config) =>
        api.cloud.migrateBackups(config)
    ),

    previewResetRemoteSyncState: wrap("previewResetRemoteSyncState", (api) =>
        api.cloud.previewResetRemoteSyncState()
    ),

    requestSyncNow: wrap("requestSyncNow", async (api) => {
        await api.cloud.requestSyncNow();
    }),

    resetRemoteSyncState: wrap("resetRemoteSyncState", (api) =>
        api.cloud.resetRemoteSyncState()
    ),

    restoreBackup: wrap("restoreBackup", async (api, key) => {
        if (typeof key !== "string" || key.length === 0) {
            throw new TypeError("Backup key must be a non-empty string");
        }

        const result = await api.cloud.restoreBackup(key);
        logger.info("Cloud backup restore completed", {
            key,
            restoredAt: result.restoredAt,
        });
        return result;
    }),

    setEncryptionPassphrase: wrap(
        "setEncryptionPassphrase",
        async (api, passphrase) => {
            if (
                typeof passphrase !== "string" ||
                passphrase.trim().length === 0
            ) {
                throw new TypeError("Passphrase must be a non-empty string");
            }

            // Never log the passphrase.
            const result = await api.cloud.setEncryptionPassphrase(passphrase);
            logger.info("Cloud encryption passphrase updated", {
                encryptionLocked: result.encryptionLocked,
                encryptionMode: result.encryptionMode,
            });
            return result;
        }
    ),

    uploadLatestBackup: wrap("uploadLatestBackup", (api) =>
        api.cloud.uploadLatestBackup()
    ),
};
