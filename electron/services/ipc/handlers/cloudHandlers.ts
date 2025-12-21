import type { CloudEnableSyncConfig } from "@shared/types/cloud";
import type { IpcInvokeChannel } from "@shared/types/ipc";

import { CLOUD_CHANNELS } from "@shared/types/preload";

import type { CloudService } from "../../cloud/CloudService";

import { registerStandardizedIpcHandler } from "../utils";
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
    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.clearEncryptionKey,
        () => cloudService.clearEncryptionKey(),
        CloudHandlerValidators.clearEncryptionKey,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.disconnect,
        () => cloudService.disconnect(),
        CloudHandlerValidators.disconnect,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.enableSync,
        // eslint-disable-next-line n/no-sync -- "Sync" is part of the feature name, not a Node.js sync API.
        (config: CloudEnableSyncConfig) => cloudService.enableSync(config),
        CloudHandlerValidators.enableSync,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.getStatus,
        () => cloudService.getStatus(),
        CloudHandlerValidators.getStatus,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.configureFilesystemProvider,
        (config) => cloudService.configureFilesystemProvider(config),
        CloudHandlerValidators.configureFilesystemProvider,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.setEncryptionPassphrase,
        (passphrase) => cloudService.setEncryptionPassphrase(passphrase),
        CloudHandlerValidators.setEncryptionPassphrase,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.connectDropbox,
        () => cloudService.connectDropbox(),
        CloudHandlerValidators.connectDropbox,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.connectGoogleDrive,
        () => cloudService.connectGoogleDrive(),
        CloudHandlerValidators.connectGoogleDrive,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.listBackups,
        () => cloudService.listBackups(),
        CloudHandlerValidators.listBackups,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.deleteBackup,
        (key: string) => cloudService.deleteBackup(key),
        CloudHandlerValidators.deleteBackup,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.migrateBackups,
        (config) => cloudService.migrateBackups(config),
        CloudHandlerValidators.migrateBackups,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.previewResetRemoteSyncState,
        () => cloudService.previewResetRemoteSyncState(),
        CloudHandlerValidators.previewResetRemoteSyncState,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.resetRemoteSyncState,
        () => cloudService.resetRemoteSyncState(),
        CloudHandlerValidators.resetRemoteSyncState,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.uploadLatestBackup,
        () => cloudService.uploadLatestBackup(),
        CloudHandlerValidators.uploadLatestBackup,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.restoreBackup,
        (key) => cloudService.restoreBackup(key),
        CloudHandlerValidators.restoreBackup,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.requestSyncNow,
        async (): Promise<undefined> => {
            await cloudService.requestSyncNow();
            return undefined;
        },
        CloudHandlerValidators.requestSyncNow,
        registeredHandlers
    );
}
