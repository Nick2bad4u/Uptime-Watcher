import type { CloudBackupEntry, CloudStatusSummary } from "@shared/types/cloud";
import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { StoreApi, UseBoundStore } from "zustand";

import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import { arrayJoin } from "ts-extras";
import { create } from "zustand";

import { CloudService } from "../../services/CloudService";
import { logger } from "../../services/logger";
import { fireAndForget } from "../../utils/async/fireAndForget";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import {
    dismissToastSafely,
    dispatchSystemNotificationIfEnabled,
    enqueueCloudErrorToast,
    enqueueCloudOperationStartedToast,
    enqueueCloudToast,
    getCloudUserFacingErrorDetail,
} from "./utils/cloudStoreNotifications";

type CloudSystemNotificationRequest = Parameters<
    typeof dispatchSystemNotificationIfEnabled
>[0];

function dispatchCloudSystemNotification(
    request: CloudSystemNotificationRequest
): void {
    fireAndForget(
        async () => {
            await dispatchSystemNotificationIfEnabled(request);
        },
        {
            onError: (error) => {
                logger.debug(
                    "[CloudStore] Unexpected system notification dispatch failure",
                    ensureError(error)
                );
            },
        }
    );
}

/**
 * Cloud domain store for provider connection, sync, and remote backups.
 */
export interface CloudStoreState {
    backups: CloudBackupEntry[];
    clearEncryptionKey: () => Promise<void>;
    configureFilesystemProvider: (args: {
        baseDirectory: string;
    }) => Promise<void>;
    connectDropbox: () => Promise<void>;
    connectGoogleDrive: () => Promise<void>;
    deleteBackup: (key: string) => Promise<void>;
    deletingBackupKey: null | string;
    disconnect: () => Promise<void>;
    isClearingEncryptionKey: boolean;
    isConfiguringFilesystemProvider: boolean;
    isConnectingDropbox: boolean;
    isConnectingGoogleDrive: boolean;
    isDisconnecting: boolean;
    isListingBackups: boolean;
    isMigratingBackups: boolean;
    isRefreshingRemoteSyncResetPreview: boolean;
    isRefreshingStatus: boolean;
    isRequestingSyncNow: boolean;
    isResettingRemoteSyncState: boolean;
    isSettingEncryptionPassphrase: boolean;
    isSettingSyncEnabled: boolean;
    isUploadingBackup: boolean;
    lastBackupMigrationResult: CloudBackupMigrationResult | null;
    lastRemoteSyncResetResult: CloudSyncResetResult | null;
    listBackups: () => Promise<void>;
    migrateBackups: (args: {
        deleteSource: boolean;
        limit?: number | undefined;
        target: "encrypted" | "plaintext";
    }) => Promise<void>;
    refreshRemoteSyncResetPreview: () => Promise<CloudSyncResetPreview | null>;
    refreshStatus: () => Promise<void>;
    remoteSyncResetPreview: CloudSyncResetPreview | null;
    requestSyncNow: () => Promise<void>;
    resetRemoteSyncState: () => Promise<void>;
    restoreBackup: (key: string) => Promise<void>;
    restoringBackupKey: null | string;
    setEncryptionPassphrase: (passphrase: string) => Promise<void>;
    setSyncEnabled: (enabled: boolean) => Promise<void>;
    status: CloudStatusSummary | null;
    uploadLatestBackup: () => Promise<void>;
}

export const useCloudStore: UseBoundStore<StoreApi<CloudStoreState>> =
    create<CloudStoreState>()((set, get) => {
        let backupListRequestGeneration = 0;
        let destructiveBackupOperationTail: null | Promise<void> = null;
        let providerOperationTail: null | Promise<void> = null;
        let statusRequestGeneration = 0;

        const getProviderIdentity = (
            status: CloudStatusSummary | null
        ): null | string => {
            if (status?.provider === null || status === null) {
                return null;
            }

            const { provider, providerDetails } = status;
            if (providerDetails?.kind === "filesystem") {
                return `${provider}:${providerDetails.baseDirectory}`;
            }

            return `${provider}:${providerDetails?.accountLabel ?? ""}`;
        };

        const invalidateBackupListRequests = (): void => {
            backupListRequestGeneration += 1;
            set({ isListingBackups: false });
        };

        const setProviderStatus = (
            status: CloudStatusSummary,
            requestGeneration: number
        ): void => {
            if (requestGeneration !== statusRequestGeneration) {
                return;
            }

            const providerChanged =
                getProviderIdentity(get().status) !==
                getProviderIdentity(status);

            if (providerChanged) {
                backupListRequestGeneration += 1;
                set({ backups: [], isListingBackups: false, status });
                return;
            }

            set({ status });
        };

        const runProviderOperation = async <T>(
            operation: () => Promise<T>
        ): Promise<T> => {
            const precedingOperation = providerOperationTail;
            let releaseOperation: () => void = () => {};
            const currentOperation = new Promise<void>((resolve) => {
                releaseOperation = resolve;
            });
            providerOperationTail = currentOperation;

            if (precedingOperation) {
                await precedingOperation;
            }

            try {
                return await operation();
            } finally {
                releaseOperation();
                if (providerOperationTail === currentOperation) {
                    providerOperationTail = null;
                }
            }
        };

        const runDestructiveBackupOperation = async (
            operation: () => Promise<void>
        ): Promise<void> => {
            const precedingOperation = destructiveBackupOperationTail;
            let releaseOperation: () => void = () => {};
            const currentOperation = new Promise<void>((resolve) => {
                releaseOperation = resolve;
            });
            destructiveBackupOperationTail = currentOperation;

            if (precedingOperation) {
                await precedingOperation;
            }

            try {
                await operation();
            } finally {
                releaseOperation();
                if (destructiveBackupOperationTail === currentOperation) {
                    destructiveBackupOperationTail = null;
                }
            }
        };

        const listBackupsWithFallback = async (): Promise<
            CloudBackupEntry[]
        > => {
            try {
                return await CloudService.listBackups();
            } catch (error: unknown) {
                logger.debug(
                    "[CloudStore] Failed to refresh backup list; using cached backups",
                    ensureError(error)
                );
                return get().backups;
            }
        };

        return {
            backups: [],
            clearEncryptionKey: async (): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                set({ isClearingEncryptionKey: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const status =
                                await CloudService.clearEncryptionKey();
                            setProviderStatus(status, requestGeneration);
                        },
                        createStoreErrorHandler("cloud", "clearEncryptionKey")
                    );
                } finally {
                    set({ isClearingEncryptionKey: false });
                }
            },

            configureFilesystemProvider: async (args: {
                baseDirectory: string;
            }): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                invalidateBackupListRequests();
                set({ isConfiguringFilesystemProvider: true });

                try {
                    await runProviderOperation(async () =>
                        withErrorHandling(
                            async () => {
                                const status =
                                    await CloudService.configureFilesystemProvider(
                                        args
                                    );
                                setProviderStatus(status, requestGeneration);
                            },
                            createStoreErrorHandler(
                                "cloud",
                                "configureFilesystemProvider"
                            )
                        )
                    );
                } finally {
                    set({ isConfiguringFilesystemProvider: false });
                }
            },
            connectDropbox: async (): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                invalidateBackupListRequests();
                set({ isConnectingDropbox: true });
                const startedToastId = enqueueCloudOperationStartedToast({
                    message: "Waiting for authorization in your browser.",
                    title: "Connecting Dropbox",
                });

                try {
                    const nextStatus = await runProviderOperation(async () =>
                        withErrorHandling(
                            async () => {
                                const status =
                                    await CloudService.connectDropbox();
                                setProviderStatus(status, requestGeneration);
                                return status;
                            },
                            createStoreErrorHandler("cloud", "connectDropbox")
                        )
                    );

                    const { providerDetails } = nextStatus;
                    const accountLabel =
                        providerDetails?.kind === "dropbox"
                            ? providerDetails.accountLabel
                            : undefined;

                    enqueueCloudToast({
                        message: accountLabel
                            ? `Connected as ${accountLabel}`
                            : undefined,
                        title: "Dropbox connected",
                        variant: "success",
                    });

                    dispatchCloudSystemNotification({
                        body: accountLabel
                            ? `Connected as ${accountLabel}`
                            : undefined,
                        title: "Dropbox connected",
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Failed to connect Dropbox", error);

                    dispatchCloudSystemNotification({
                        body: getCloudUserFacingErrorDetail(error),
                        title: "Failed to connect Dropbox",
                    });
                    throw safeError;
                } finally {
                    dismissToastSafely(startedToastId);
                    set({ isConnectingDropbox: false });
                }
            },

            connectGoogleDrive: async (): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                invalidateBackupListRequests();
                set({ isConnectingGoogleDrive: true });
                const startedToastId = enqueueCloudOperationStartedToast({
                    message: "Waiting for authorization in your browser.",
                    title: "Connecting Google Drive",
                });

                try {
                    const nextStatus = await runProviderOperation(async () =>
                        withErrorHandling(
                            async () => {
                                const status =
                                    await CloudService.connectGoogleDrive();
                                setProviderStatus(status, requestGeneration);
                                return status;
                            },
                            createStoreErrorHandler(
                                "cloud",
                                "connectGoogleDrive"
                            )
                        )
                    );

                    const { providerDetails } = nextStatus;
                    const accountLabel =
                        providerDetails?.kind === "google-drive"
                            ? providerDetails.accountLabel
                            : undefined;

                    enqueueCloudToast({
                        message: accountLabel
                            ? `Connected as ${accountLabel}`
                            : undefined,
                        title: "Google Drive connected",
                        variant: "success",
                    });

                    dispatchCloudSystemNotification({
                        body: accountLabel
                            ? `Connected as ${accountLabel}`
                            : undefined,
                        title: "Google Drive connected",
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast(
                        "Failed to connect Google Drive",
                        error
                    );

                    dispatchCloudSystemNotification({
                        body: getCloudUserFacingErrorDetail(error),
                        title: "Failed to connect Google Drive",
                    });
                    throw safeError;
                } finally {
                    dismissToastSafely(startedToastId);
                    set({ isConnectingGoogleDrive: false });
                }
            },

            deleteBackup: async (key: string): Promise<void> => {
                await runDestructiveBackupOperation(async () => {
                    set({ deletingBackupKey: key });
                    try {
                        await withErrorHandling(
                            async () => {
                                const backups =
                                    await CloudService.deleteBackup(key);
                                set({ backups });
                            },
                            createStoreErrorHandler("cloud", "deleteBackup")
                        );
                    } finally {
                        set({ deletingBackupKey: null });
                    }
                });
            },

            deletingBackupKey: null,

            disconnect: async (): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                invalidateBackupListRequests();
                set({ isDisconnecting: true });

                try {
                    await runProviderOperation(async () =>
                        withErrorHandling(
                            async () => {
                                const status = await CloudService.disconnect();
                                set({ backups: [] });
                                setProviderStatus(status, requestGeneration);
                            },
                            createStoreErrorHandler("cloud", "disconnect")
                        )
                    );
                } finally {
                    set({ isDisconnecting: false });
                }
            },

            isClearingEncryptionKey: false,

            isConfiguringFilesystemProvider: false,

            isConnectingDropbox: false,
            isConnectingGoogleDrive: false,

            isDisconnecting: false,

            isListingBackups: false,

            isMigratingBackups: false,
            isRefreshingRemoteSyncResetPreview: false,
            isRefreshingStatus: false,
            isRequestingSyncNow: false,
            isResettingRemoteSyncState: false,
            isSettingEncryptionPassphrase: false,
            isSettingSyncEnabled: false,
            isUploadingBackup: false,
            lastBackupMigrationResult: null,
            lastRemoteSyncResetResult: null,
            listBackups: async (): Promise<void> => {
                const requestGeneration = ++backupListRequestGeneration;
                const providerIdentity = getProviderIdentity(get().status);
                set({ isListingBackups: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const backups = await CloudService.listBackups();
                            if (
                                requestGeneration ===
                                    backupListRequestGeneration &&
                                providerIdentity ===
                                    getProviderIdentity(get().status)
                            ) {
                                set({ backups });
                            }
                        },
                        createStoreErrorHandler("cloud", "listBackups")
                    );
                } finally {
                    if (requestGeneration === backupListRequestGeneration) {
                        set({ isListingBackups: false });
                    }
                }
            },

            migrateBackups: async (args: {
                deleteSource: boolean;
                limit?: number | undefined;
                target: "encrypted" | "plaintext";
            }): Promise<void> => {
                set({ isMigratingBackups: true });
                const startedToastId = enqueueCloudOperationStartedToast({
                    message:
                        args.target === "encrypted"
                            ? "Rewriting backups to encrypted format."
                            : "Rewriting backups to plaintext format.",
                    title: "Migrating backups",
                });

                try {
                    const migrationResult = await withErrorHandling(
                        async () => {
                            const result =
                                await CloudService.migrateBackups(args);

                            const [status, backups] = await Promise.all([
                                CloudService.getStatus(),
                                listBackupsWithFallback(),
                            ]);

                            set({
                                backups,
                                lastBackupMigrationResult: result,
                                status,
                            });

                            return result;
                        },
                        createStoreErrorHandler("cloud", "migrateBackups")
                    );

                    const title =
                        args.target === "encrypted"
                            ? "Backups encrypted"
                            : "Backups decrypted";

                    const messageParts: string[] = [
                        `Migrated ${migrationResult.migrated}/${migrationResult.processed}`,
                    ];
                    if (migrationResult.failures.length > 0) {
                        messageParts.push(
                            `${migrationResult.failures.length} failed`
                        );
                    }

                    enqueueCloudToast({
                        message:
                            messageParts.length > 0
                                ? arrayJoin(messageParts, " • ")
                                : undefined,
                        title,
                        variant: "success",
                    });

                    dispatchCloudSystemNotification({
                        body:
                            messageParts.length > 0
                                ? arrayJoin(messageParts, " • ")
                                : undefined,
                        title,
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Backup migration failed", error);

                    dispatchCloudSystemNotification({
                        body: getCloudUserFacingErrorDetail(error),
                        title: "Backup migration failed",
                    });
                    throw safeError;
                } finally {
                    dismissToastSafely(startedToastId);
                    set({ isMigratingBackups: false });
                }
            },

            refreshRemoteSyncResetPreview:
                async (): Promise<CloudSyncResetPreview | null> => {
                    set({ isRefreshingRemoteSyncResetPreview: true });

                    try {
                        let nextPreview: CloudSyncResetPreview | null = null;
                        await withErrorHandling(
                            async () => {
                                const preview =
                                    await CloudService.previewResetRemoteSyncState();
                                nextPreview = preview;
                                set({ remoteSyncResetPreview: preview });
                            },
                            createStoreErrorHandler(
                                "cloud",
                                "previewResetRemoteSyncState"
                            )
                        );

                        return nextPreview;
                    } finally {
                        set({ isRefreshingRemoteSyncResetPreview: false });
                    }
                },

            refreshStatus: async (): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                set({ isRefreshingStatus: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const status = await CloudService.getStatus();
                            setProviderStatus(status, requestGeneration);
                        },
                        createStoreErrorHandler("cloud", "getStatus")
                    );
                } finally {
                    set({ isRefreshingStatus: false });
                }
            },

            remoteSyncResetPreview: null,

            requestSyncNow: async (): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                set({ isRequestingSyncNow: true });
                const startedToastId = enqueueCloudOperationStartedToast({
                    title: "Syncing now",
                });

                try {
                    await withErrorHandling(
                        async () => {
                            await CloudService.requestSyncNow();
                            const status = await CloudService.getStatus();
                            setProviderStatus(status, requestGeneration);
                        },
                        createStoreErrorHandler("cloud", "requestSyncNow")
                    );

                    enqueueCloudToast({
                        title: "Sync complete",
                        variant: "success",
                    });

                    dispatchCloudSystemNotification({
                        title: "Sync complete",
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Sync failed", error);

                    dispatchCloudSystemNotification({
                        body: getCloudUserFacingErrorDetail(error),
                        title: "Sync failed",
                    });
                    throw safeError;
                } finally {
                    dismissToastSafely(startedToastId);
                    set({ isRequestingSyncNow: false });
                }
            },

            resetRemoteSyncState: async (): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                set({ isResettingRemoteSyncState: true });
                const startedToastId = enqueueCloudOperationStartedToast({
                    message: "This may take a moment.",
                    title: "Resetting remote sync",
                });

                try {
                    const resetResult = await withErrorHandling(
                        async () => {
                            const result =
                                await CloudService.resetRemoteSyncState();

                            const [status, backups] = await Promise.all([
                                CloudService.getStatus(),
                                listBackupsWithFallback(),
                            ]);

                            set({
                                backups,
                                lastRemoteSyncResetResult: result,
                                remoteSyncResetPreview: null,
                            });
                            setProviderStatus(status, requestGeneration);

                            return result;
                        },
                        createStoreErrorHandler("cloud", "resetRemoteSyncState")
                    );

                    const failedDeletions = resetResult.failedDeletions.length;
                    const messageParts: string[] = [
                        `Deleted ${resetResult.deletedObjects}`,
                    ];
                    if (failedDeletions > 0) {
                        messageParts.push(`${failedDeletions} failed`);
                    }

                    enqueueCloudToast({
                        message:
                            messageParts.length > 0
                                ? arrayJoin(messageParts, " • ")
                                : undefined,
                        title: "Remote sync reset",
                        variant: "success",
                    });

                    dispatchCloudSystemNotification({
                        body:
                            messageParts.length > 0
                                ? arrayJoin(messageParts, " • ")
                                : undefined,
                        title: "Remote sync reset",
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Remote sync reset failed", error);

                    dispatchCloudSystemNotification({
                        body: getCloudUserFacingErrorDetail(error),
                        title: "Remote sync reset failed",
                    });
                    throw safeError;
                } finally {
                    dismissToastSafely(startedToastId);
                    set({ isResettingRemoteSyncState: false });
                }
            },

            restoreBackup: async (key: string): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                await runDestructiveBackupOperation(async () => {
                    set({ restoringBackupKey: key });
                    try {
                        const entryName =
                            get().backups.find((backup) => backup.key === key)
                                ?.fileName ?? key;

                        const startedToastId =
                            enqueueCloudOperationStartedToast({
                                message: `Restoring ${entryName}`,
                                title: "Restoring backup",
                            });

                        try {
                            await withErrorHandling(
                                async () => {
                                    await CloudService.restoreBackup(key);

                                    const [status, backups] = await Promise.all(
                                        [
                                            CloudService.getStatus(),
                                            listBackupsWithFallback(),
                                        ]
                                    );
                                    set({ backups });
                                    setProviderStatus(
                                        status,
                                        requestGeneration
                                    );
                                },
                                createStoreErrorHandler(
                                    "cloud",
                                    "restoreBackup"
                                )
                            );
                        } finally {
                            dismissToastSafely(startedToastId);
                        }

                        enqueueCloudToast({
                            message: `Restored ${entryName}`,
                            title: "Backup restored",
                            variant: "success",
                        });

                        dispatchCloudSystemNotification({
                            body: `Restored ${entryName}`,
                            title: "Backup restored",
                        });
                    } catch (error) {
                        const safeError = ensureError(error);
                        enqueueCloudErrorToast("Backup restore failed", error);

                        dispatchCloudSystemNotification({
                            body: getCloudUserFacingErrorDetail(error),
                            title: "Backup restore failed",
                        });
                        throw safeError;
                    } finally {
                        set({ restoringBackupKey: null });
                    }
                });
            },

            restoringBackupKey: null,

            setEncryptionPassphrase: async (
                passphrase: string
            ): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                set({ isSettingEncryptionPassphrase: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const status =
                                await CloudService.setEncryptionPassphrase(
                                    passphrase
                                );
                            setProviderStatus(status, requestGeneration);
                        },
                        createStoreErrorHandler(
                            "cloud",
                            "setEncryptionPassphrase"
                        )
                    );
                } finally {
                    set({ isSettingEncryptionPassphrase: false });
                }
            },

            setSyncEnabled: async (enabled: boolean): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                set({ isSettingSyncEnabled: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const status = await CloudService.enableSync({
                                enabled,
                            });
                            setProviderStatus(status, requestGeneration);
                        },
                        createStoreErrorHandler("cloud", "setSyncEnabled")
                    );
                } finally {
                    set({ isSettingSyncEnabled: false });
                }
            },
            status: null,

            uploadLatestBackup: async (): Promise<void> => {
                const requestGeneration = ++statusRequestGeneration;
                set({ isUploadingBackup: true });
                const startedToastId = enqueueCloudOperationStartedToast({
                    title: "Uploading backup",
                });

                try {
                    await withErrorHandling(
                        async () => {
                            await CloudService.uploadLatestBackup();

                            const [status, backups] = await Promise.all([
                                CloudService.getStatus(),
                                listBackupsWithFallback(),
                            ]);

                            set({ backups });
                            setProviderStatus(status, requestGeneration);
                        },
                        createStoreErrorHandler("cloud", "uploadLatestBackup")
                    );

                    enqueueCloudToast({
                        title: "Backup uploaded",
                        variant: "success",
                    });

                    dispatchCloudSystemNotification({
                        title: "Backup uploaded",
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Backup upload failed", error);

                    dispatchCloudSystemNotification({
                        body: getCloudUserFacingErrorDetail(error),
                        title: "Backup upload failed",
                    });
                    throw safeError;
                } finally {
                    dismissToastSafely(startedToastId);
                    set({ isUploadingBackup: false });
                }
            },
        };
    });
