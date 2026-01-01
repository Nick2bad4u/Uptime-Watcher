import type { CloudEnableSyncConfig } from "@shared/types/cloud";
import type { IpcInvokeChannel } from "@shared/types/ipc";

import { CLOUD_CHANNELS } from "@shared/types/preload";

import type { CloudService } from "../../cloud/CloudService";

import { createStandardizedIpcRegistrar } from "../utils";
import { CloudHandlerValidators } from "../validators";

/**
 * Dependencies required for registering cloud IPC handlers.
 */
export interface CloudHandlersDependencies {
    readonly cloudService: CloudService;
    readonly registeredHandlers: Set<IpcInvokeChannel>;
}

/**
 * Registers IPC handlers for cloud backup and sync configuration.
 */
export function registerCloudHandlers({
    cloudService,
    registeredHandlers,
}: CloudHandlersDependencies): void {
    const register = createStandardizedIpcRegistrar(registeredHandlers);

    register(
        CLOUD_CHANNELS.clearEncryptionKey,
        () => cloudService.clearEncryptionKey(),
        CloudHandlerValidators.clearEncryptionKey
    );

    register(
        CLOUD_CHANNELS.disconnect,
        () => cloudService.disconnect(),
        CloudHandlerValidators.disconnect
    );

    register(
        CLOUD_CHANNELS.enableSync,
        // eslint-disable-next-line n/no-sync -- "Sync" is part of the feature name, not a Node.js sync API.
        (config: CloudEnableSyncConfig) => cloudService.enableSync(config),
        CloudHandlerValidators.enableSync
    );

    register(
        CLOUD_CHANNELS.getStatus,
        () => cloudService.getStatus(),
        CloudHandlerValidators.getStatus
    );

    register(
        CLOUD_CHANNELS.configureFilesystemProvider,
        (config) => cloudService.configureFilesystemProvider(config),
        CloudHandlerValidators.configureFilesystemProvider
    );

    register(
        CLOUD_CHANNELS.setEncryptionPassphrase,
        (passphrase) => cloudService.setEncryptionPassphrase(passphrase),
        CloudHandlerValidators.setEncryptionPassphrase
    );

    register(
        CLOUD_CHANNELS.connectDropbox,
        () => cloudService.connectDropbox(),
        CloudHandlerValidators.connectDropbox
    );

    register(
        CLOUD_CHANNELS.connectGoogleDrive,
        () => cloudService.connectGoogleDrive(),
        CloudHandlerValidators.connectGoogleDrive
    );

    register(
        CLOUD_CHANNELS.listBackups,
        () => cloudService.listBackups(),
        CloudHandlerValidators.listBackups
    );

    register(
        CLOUD_CHANNELS.deleteBackup,
        (key: string) => cloudService.deleteBackup(key),
        CloudHandlerValidators.deleteBackup
    );

    register(
        CLOUD_CHANNELS.migrateBackups,
        (config) => cloudService.migrateBackups(config),
        CloudHandlerValidators.migrateBackups
    );

    register(
        CLOUD_CHANNELS.previewResetRemoteSyncState,
        () => cloudService.previewResetRemoteSyncState(),
        CloudHandlerValidators.previewResetRemoteSyncState
    );

    register(
        CLOUD_CHANNELS.resetRemoteSyncState,
        () => cloudService.resetRemoteSyncState(),
        CloudHandlerValidators.resetRemoteSyncState
    );

    register(
        CLOUD_CHANNELS.uploadLatestBackup,
        () => cloudService.uploadLatestBackup(),
        CloudHandlerValidators.uploadLatestBackup
    );

    register(
        CLOUD_CHANNELS.restoreBackup,
        (key) => cloudService.restoreBackup(key),
        CloudHandlerValidators.restoreBackup
    );

    register(
        CLOUD_CHANNELS.requestSyncNow,
        async (): Promise<undefined> => {
            await cloudService.requestSyncNow();
            return undefined;
        },
        CloudHandlerValidators.requestSyncNow
    );
}
