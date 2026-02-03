import type { CloudEnableSyncConfig } from "@shared/types/cloud";
import type { IpcInvokeChannel, IpcInvokeChannelParams } from "@shared/types/ipc";

import { CLOUD_CHANNELS } from "@shared/types/preload";
import { createSingleFlight } from "@shared/utils/singleFlight";

import type { CloudService } from "../../cloud/CloudService";

import { createStandardizedIpcRegistrar } from "../utils";
import { CloudHandlerValidators } from "../validators/cloud";

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

    const requestSyncNowSingleFlight = createSingleFlight(
        async (): Promise<undefined> => {
            await cloudService.requestSyncNow();
            return undefined;
        }
    );

    const uploadLatestBackupSingleFlight = createSingleFlight(() =>
        cloudService.uploadLatestBackup()
    );

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
        (
            config: IpcInvokeChannelParams<
                typeof CLOUD_CHANNELS.configureFilesystemProvider
            >[0]
        ) => cloudService.configureFilesystemProvider(config),
        CloudHandlerValidators.configureFilesystemProvider
    );

    register(
        CLOUD_CHANNELS.setEncryptionPassphrase,
        (
            passphrase: IpcInvokeChannelParams<
                typeof CLOUD_CHANNELS.setEncryptionPassphrase
            >[0]
        ) => cloudService.setEncryptionPassphrase(passphrase),
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
        (config: IpcInvokeChannelParams<typeof CLOUD_CHANNELS.migrateBackups>[0]) =>
            cloudService.migrateBackups(config),
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
        () => uploadLatestBackupSingleFlight(),
        CloudHandlerValidators.uploadLatestBackup
    );

    register(
        CLOUD_CHANNELS.restoreBackup,
        (key: IpcInvokeChannelParams<typeof CLOUD_CHANNELS.restoreBackup>[0]) =>
            cloudService.restoreBackup(key),
        CloudHandlerValidators.restoreBackup
    );

    register(
        CLOUD_CHANNELS.requestSyncNow,
        () => requestSyncNowSingleFlight(),
        CloudHandlerValidators.requestSyncNow
    );
}
