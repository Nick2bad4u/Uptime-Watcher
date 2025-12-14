import type { CloudEnableSyncConfig } from "@shared/types/cloud";
import type { IpcInvokeChannel } from "@shared/types/ipc";

import { CLOUD_CHANNELS } from "@shared/types/preload";

import type { CloudService } from "../../cloud/CloudService";

import { registerStandardizedIpcHandler } from "../utils";
import { CloudHandlerValidators } from "../validators";
import { withIgnoredIpcEvent } from "./handlerShared";

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
        withIgnoredIpcEvent(() => cloudService.clearEncryptionKey()),
        CloudHandlerValidators.clearEncryptionKey,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.disconnect,
        withIgnoredIpcEvent(() => cloudService.disconnect()),
        CloudHandlerValidators.disconnect,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.enableSync,
        withIgnoredIpcEvent(
            // eslint-disable-next-line n/no-sync -- "Sync" is part of the feature name, not a Node.js sync API.
            (config: CloudEnableSyncConfig) => cloudService.enableSync(config)
        ),
        CloudHandlerValidators.enableSync,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.getStatus,
        withIgnoredIpcEvent(() => cloudService.getStatus()),
        CloudHandlerValidators.getStatus,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.configureFilesystemProvider,
        withIgnoredIpcEvent((config) =>
            cloudService.configureFilesystemProvider(config)),
        CloudHandlerValidators.configureFilesystemProvider,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.setEncryptionPassphrase,
        withIgnoredIpcEvent((passphrase) =>
            cloudService.setEncryptionPassphrase(passphrase)),
        CloudHandlerValidators.setEncryptionPassphrase,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.connectDropbox,
        withIgnoredIpcEvent(() => cloudService.connectDropbox()),
        CloudHandlerValidators.connectDropbox,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.listBackups,
        withIgnoredIpcEvent(() => cloudService.listBackups()),
        CloudHandlerValidators.listBackups,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.migrateBackups,
        withIgnoredIpcEvent((config) => cloudService.migrateBackups(config)),
        CloudHandlerValidators.migrateBackups,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.previewResetRemoteSyncState,
        withIgnoredIpcEvent(() => cloudService.previewResetRemoteSyncState()),
        CloudHandlerValidators.previewResetRemoteSyncState,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.resetRemoteSyncState,
        withIgnoredIpcEvent(() => cloudService.resetRemoteSyncState()),
        CloudHandlerValidators.resetRemoteSyncState,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.uploadLatestBackup,
        withIgnoredIpcEvent(() => cloudService.uploadLatestBackup()),
        CloudHandlerValidators.uploadLatestBackup,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.restoreBackup,
        withIgnoredIpcEvent((key) => cloudService.restoreBackup(key)),
        CloudHandlerValidators.restoreBackup,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        CLOUD_CHANNELS.requestSyncNow,
        withIgnoredIpcEvent(async (): Promise<undefined> => {
            await cloudService.requestSyncNow();
            return undefined;
        }),
        CloudHandlerValidators.requestSyncNow,
        registeredHandlers
    );
}
