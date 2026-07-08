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

import { safeParseCloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import { ensureError } from "@shared/utils/errorHandling";
import {
    validateCloudBackupEntry,
    validateCloudBackupEntryArray,
    validateCloudBackupKey,
} from "@shared/validation/cloudBackupSchemas";
import {
    validateCloudStatusSummary,
    validateCloudSyncResetPreview,
    validateCloudSyncResetResult,
} from "@shared/validation/cloudSchemas";
import { validateSerializedDatabaseRestoreResult } from "@shared/validation/dataSchemas";
import { collectCloudEncryptionPassphraseIssues } from "@shared/validation/cloudEncryptionPassphrase";
import { arrayJoin } from "ts-extras";

import { logger } from "./logger";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";
import { validateServicePayload } from "./utils/validation";

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

type IpcServiceHelpers = ReturnType<typeof getIpcServiceHelpers>;

const { ensureInitialized, wrap } = ((): IpcServiceHelpers => {
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
    } catch (error) {
        throw ensureError(error);
    }
})();

const parseBackupEntries = (
    operation: string,
    value: unknown
): CloudBackupEntry[] =>
    validateServicePayload(validateCloudBackupEntryArray, value, {
        operation,
        serviceName: "CloudService",
    });

const parseBackupEntry = (
    operation: string,
    value: unknown
): CloudBackupEntry =>
    validateServicePayload(validateCloudBackupEntry, value, {
        operation,
        serviceName: "CloudService",
    });

const parseCloudStatus = (
    operation: string,
    value: unknown
): CloudStatusSummary =>
    validateServicePayload(validateCloudStatusSummary, value, {
        operation,
        serviceName: "CloudService",
    });

const parseCloudBackupKey = (operation: string, key: unknown): string => {
    const parsed = validateCloudBackupKey(key);

    if (parsed.success) {
        return parsed.data;
    }

    const issues = arrayJoin(
        parsed.error.issues.map(({ message }) => message),
        ", "
    );

    throw new TypeError(`Invalid cloud backup key for ${operation}: ${issues}`);
};

/**
 * Service for interacting with cloud providers through Electron IPC.
 *
 * @public
 */
export const CloudService: CloudServiceContract = {
    clearEncryptionKey: wrap("clearEncryptionKey", async (api) =>
        parseCloudStatus(
            "clearEncryptionKey",
            await api.cloud.clearEncryptionKey()
        )
    ),

    configureFilesystemProvider: wrap(
        "configureFilesystemProvider",
        async (api, config) =>
            parseCloudStatus(
                "configureFilesystemProvider",
                await api.cloud.configureFilesystemProvider(config)
            )
    ),

    connectDropbox: wrap("connectDropbox", async (api) =>
        parseCloudStatus("connectDropbox", await api.cloud.connectDropbox())
    ),

    connectGoogleDrive: wrap("connectGoogleDrive", async (api) =>
        parseCloudStatus(
            "connectGoogleDrive",
            await api.cloud.connectGoogleDrive()
        )
    ),

    deleteBackup: wrap("deleteBackup", async (api, key) => {
        const backupKey = parseCloudBackupKey("deleteBackup", key);
        return parseBackupEntries(
            "deleteBackup",
            await api.cloud.deleteBackup(backupKey)
        );
    }),

    disconnect: wrap("disconnect", async (api) =>
        parseCloudStatus("disconnect", await api.cloud.disconnect())
    ),

    enableSync: wrap("enableSync", async (api, config) =>
        parseCloudStatus("enableSync", await api.cloud.enableSync(config))
    ),

    getStatus: wrap("getStatus", async (api) =>
        parseCloudStatus("getStatus", await api.cloud.getStatus())
    ),

    initialize: ensureInitialized,

    listBackups: wrap("listBackups", async (api) =>
        parseBackupEntries("listBackups", await api.cloud.listBackups())
    ),

    migrateBackups: wrap("migrateBackups", async (api, config) =>
        validateServicePayload(
            safeParseCloudBackupMigrationResult,
            await api.cloud.migrateBackups(config),
            {
                operation: "migrateBackups",
                serviceName: "CloudService",
            }
        )
    ),

    previewResetRemoteSyncState: wrap(
        "previewResetRemoteSyncState",
        async (api) =>
            validateServicePayload(
                validateCloudSyncResetPreview,
                await api.cloud.previewResetRemoteSyncState(),
                {
                    operation: "previewResetRemoteSyncState",
                    serviceName: "CloudService",
                }
            )
    ),

    requestSyncNow: wrap("requestSyncNow", async (api) => {
        await api.cloud.requestSyncNow();
    }),

    resetRemoteSyncState: wrap("resetRemoteSyncState", async (api) =>
        validateServicePayload(
            validateCloudSyncResetResult,
            await api.cloud.resetRemoteSyncState(),
            {
                operation: "resetRemoteSyncState",
                serviceName: "CloudService",
            }
        )
    ),

    restoreBackup: wrap("restoreBackup", async (api, key) => {
        const backupKey = parseCloudBackupKey("restoreBackup", key);

        const result = validateServicePayload(
            validateSerializedDatabaseRestoreResult,
            await api.cloud.restoreBackup(backupKey),
            {
                operation: "restoreBackup",
                serviceName: "CloudService",
            }
        );
        logger.info("Cloud backup restore completed", {
            key: backupKey,
            restoredAt: result.restoredAt,
        });
        return result;
    }),

    setEncryptionPassphrase: wrap(
        "setEncryptionPassphrase",
        async (api, passphrase) => {
            if (typeof passphrase !== "string") {
                throw new TypeError("Passphrase must be a string");
            }

            const passphraseIssues =
                collectCloudEncryptionPassphraseIssues(passphrase);
            if (passphraseIssues.length > 0) {
                throw new TypeError(
                    `Invalid cloud encryption passphrase: ${arrayJoin(
                        passphraseIssues,
                        ", "
                    )}`
                );
            }

            // Never log the passphrase.
            const result = parseCloudStatus(
                "setEncryptionPassphrase",
                await api.cloud.setEncryptionPassphrase(passphrase)
            );
            logger.info("Cloud encryption passphrase updated", {
                encryptionLocked: result.encryptionLocked,
                encryptionMode: result.encryptionMode,
            });
            return result;
        }
    ),

    uploadLatestBackup: wrap("uploadLatestBackup", async (api) =>
        parseBackupEntry(
            "uploadLatestBackup",
            await api.cloud.uploadLatestBackup()
        )
    ),
};
