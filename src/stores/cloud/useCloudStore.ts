import type { CloudBackupEntry, CloudStatusSummary } from "@shared/types/cloud";
import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { StoreApi, UseBoundStore } from "zustand";

import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { create } from "zustand";

import { AppNotificationService } from "../../services/AppNotificationService";
import { CloudService } from "../../services/CloudService";
import { logger } from "../../services/logger";
import { useAlertStore } from "../alerts/useAlertStore";
import { useSettingsStore } from "../settings/useSettingsStore";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";

const CLOUD_OPERATION_STARTED_TOAST_TTL_MS = 15_000;

const dismissToastSafely = (toastId: null | string): void => {
    if (!toastId) {
        return;
    }

    useAlertStore.getState().dismissToast(toastId);
};

const enqueueCloudToast = (args: {
    message?: string | undefined;
    title: string;
    ttlMs?: number | undefined;
    variant: "error" | "info" | "success";
}): string => {
    // Store actions are allowed to use Zustand stores directly.
    const toast = useAlertStore.getState().enqueueToast({
        ...(args.message === undefined ? {} : { message: args.message }),
        ...(args.ttlMs === undefined ? {} : { ttlMs: args.ttlMs }),
        title: args.title,
        variant: args.variant,
    });

    return toast.id;
};

const enqueueCloudOperationStartedToast = (args: {
    message?: string | undefined;
    title: string;
}): string =>
    enqueueCloudToast({
        message: args.message,
        title: args.title,
        ttlMs: CLOUD_OPERATION_STARTED_TOAST_TTL_MS,
        variant: "info",
    });

async function dispatchSystemNotificationIfEnabled(request: {
    body?: string | undefined;
    title: string;
}): Promise<void> {
    const { systemNotificationsEnabled } = useSettingsStore.getState().settings;
    if (!systemNotificationsEnabled) {
        return;
    }

    try {
        await AppNotificationService.notifyAppEvent({
            ...(request.body === undefined ? {} : { body: request.body }),
            title: request.title,
        });
    } catch (error: unknown) {
        logger.debug(
            "[CloudStore] Failed to dispatch system notification",
            ensureError(error)
        );
    }
}

function enqueueCloudErrorToast(title: string, error: unknown): void {
    // Use shared user-facing error detail for notifications
    const userFacingMessage = getUserFacingErrorDetail(error);

    enqueueCloudToast({
        message: userFacingMessage,
        title,
        variant: "error",
    });
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
                set({ isClearingEncryptionKey: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const status =
                                await CloudService.clearEncryptionKey();
                            set({ status });
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
                set({ isConfiguringFilesystemProvider: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const status =
                                await CloudService.configureFilesystemProvider(
                                    args
                                );
                            set({ status });
                        },
                        createStoreErrorHandler(
                            "cloud",
                            "configureFilesystemProvider"
                        )
                    );
                } finally {
                    set({ isConfiguringFilesystemProvider: false });
                }
            },
            connectDropbox: async (): Promise<void> => {
                set({ isConnectingDropbox: true });
                const startedToastId = enqueueCloudOperationStartedToast({
                    message: "Waiting for authorization in your browser.",
                    title: "Connecting Dropbox",
                });

                try {
                    const nextStatus = await withErrorHandling(
                        async () => {
                            const status = await CloudService.connectDropbox();
                            set({ status });
                            return status;
                        },
                        createStoreErrorHandler("cloud", "connectDropbox")
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

                    void dispatchSystemNotificationIfEnabled({
                        body: accountLabel
                            ? `Connected as ${accountLabel}`
                            : undefined,
                        title: "Dropbox connected",
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Failed to connect Dropbox", error);

                    void dispatchSystemNotificationIfEnabled({
                        body: getUserFacingErrorDetail(error),
                        title: "Failed to connect Dropbox",
                    });
                    throw safeError;
                } finally {
                    dismissToastSafely(startedToastId);
                    set({ isConnectingDropbox: false });
                }
            },

            connectGoogleDrive: async (): Promise<void> => {
                set({ isConnectingGoogleDrive: true });
                const startedToastId = enqueueCloudOperationStartedToast({
                    message: "Waiting for authorization in your browser.",
                    title: "Connecting Google Drive",
                });

                try {
                    const nextStatus = await withErrorHandling(
                        async () => {
                            const status =
                                await CloudService.connectGoogleDrive();
                            set({ status });
                            return status;
                        },
                        createStoreErrorHandler("cloud", "connectGoogleDrive")
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

                    void dispatchSystemNotificationIfEnabled({
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

                    void dispatchSystemNotificationIfEnabled({
                        body: getUserFacingErrorDetail(error),
                        title: "Failed to connect Google Drive",
                    });
                    throw safeError;
                } finally {
                    dismissToastSafely(startedToastId);
                    set({ isConnectingGoogleDrive: false });
                }
            },

            deleteBackup: async (key: string): Promise<void> => {
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
            },

            deletingBackupKey: null,

            disconnect: async (): Promise<void> => {
                set({ isDisconnecting: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const status = await CloudService.disconnect();
                            set({ backups: [], status });
                        },
                        createStoreErrorHandler("cloud", "disconnect")
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
                set({ isListingBackups: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const backups = await CloudService.listBackups();
                            set({ backups });
                        },
                        createStoreErrorHandler("cloud", "listBackups")
                    );
                } finally {
                    set({ isListingBackups: false });
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
                                ? messageParts.join(" • ")
                                : undefined,
                        title,
                        variant: "success",
                    });

                    void dispatchSystemNotificationIfEnabled({
                        body:
                            messageParts.length > 0
                                ? messageParts.join(" • ")
                                : undefined,
                        title,
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Backup migration failed", error);

                    void dispatchSystemNotificationIfEnabled({
                        body: getUserFacingErrorDetail(error),
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
                set({ isRefreshingStatus: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const status = await CloudService.getStatus();
                            set({ status });
                        },
                        createStoreErrorHandler("cloud", "getStatus")
                    );
                } finally {
                    set({ isRefreshingStatus: false });
                }
            },

            remoteSyncResetPreview: null,

            requestSyncNow: async (): Promise<void> => {
                set({ isRequestingSyncNow: true });
                const startedToastId = enqueueCloudOperationStartedToast({
                    title: "Syncing now",
                });

                try {
                    await withErrorHandling(
                        async () => {
                            await CloudService.requestSyncNow();
                            const status = await CloudService.getStatus();
                            set({ status });
                        },
                        createStoreErrorHandler("cloud", "requestSyncNow")
                    );

                    enqueueCloudToast({
                        title: "Sync complete",
                        variant: "success",
                    });

                    void dispatchSystemNotificationIfEnabled({
                        title: "Sync complete",
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Sync failed", error);

                    void dispatchSystemNotificationIfEnabled({
                        body: getUserFacingErrorDetail(error),
                        title: "Sync failed",
                    });
                    throw safeError;
                } finally {
                    dismissToastSafely(startedToastId);
                    set({ isRequestingSyncNow: false });
                }
            },

            resetRemoteSyncState: async (): Promise<void> => {
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
                                status,
                            });

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
                                ? messageParts.join(" • ")
                                : undefined,
                        title: "Remote sync reset",
                        variant: "success",
                    });

                    void dispatchSystemNotificationIfEnabled({
                        body:
                            messageParts.length > 0
                                ? messageParts.join(" • ")
                                : undefined,
                        title: "Remote sync reset",
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Remote sync reset failed", error);

                    void dispatchSystemNotificationIfEnabled({
                        body: getUserFacingErrorDetail(error),
                        title: "Remote sync reset failed",
                    });
                    throw safeError;
                } finally {
                    dismissToastSafely(startedToastId);
                    set({ isResettingRemoteSyncState: false });
                }
            },

            restoreBackup: async (key: string): Promise<void> => {
                set({ restoringBackupKey: key });

                try {
                    const entryName =
                        get().backups.find((backup) => backup.key === key)?.fileName ?? key;

                    const startedToastId = enqueueCloudOperationStartedToast({
                        message: `Restoring ${entryName}`,
                        title: "Restoring backup",
                    });

                    try {
                        await withErrorHandling(
                            async () => {
                                await CloudService.restoreBackup(key);

                                const [status, backups] = await Promise.all([
                                    CloudService.getStatus(),
                                    listBackupsWithFallback(),
                                ]);
                                set({ backups, status });
                            },
                            createStoreErrorHandler("cloud", "restoreBackup")
                        );
                    } finally {
                        dismissToastSafely(startedToastId);
                    }

                    enqueueCloudToast({
                        message: `Restored ${entryName}`,
                        title: "Backup restored",
                        variant: "success",
                    });

                    void dispatchSystemNotificationIfEnabled({
                        body: `Restored ${entryName}`,
                        title: "Backup restored",
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Backup restore failed", error);

                    void dispatchSystemNotificationIfEnabled({
                        body: getUserFacingErrorDetail(error),
                        title: "Backup restore failed",
                    });
                    throw safeError;
                } finally {
                    set({ restoringBackupKey: null });
                }
            },

            restoringBackupKey: null,

            setEncryptionPassphrase: async (
                passphrase: string
            ): Promise<void> => {
                set({ isSettingEncryptionPassphrase: true });

                try {
                    await withErrorHandling(
                        async () => {
                            const status =
                                await CloudService.setEncryptionPassphrase(
                                    passphrase
                                );
                            set({ status });
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
                set({ isSettingSyncEnabled: true });

                try {
                    await withErrorHandling(
                        async () => {
                            // eslint-disable-next-line n/no-sync -- Domain-level "enable sync" call, not a Node.js sync filesystem API.
                            const status = await CloudService.enableSync({
                                enabled,
                            });
                            set({ status });
                        },
                        createStoreErrorHandler("cloud", "setSyncEnabled")
                    );
                } finally {
                    set({ isSettingSyncEnabled: false });
                }
            },
            status: null,

            uploadLatestBackup: async (): Promise<void> => {
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

                            set({ backups, status });
                        },
                        createStoreErrorHandler("cloud", "uploadLatestBackup")
                    );

                    enqueueCloudToast({
                        title: "Backup uploaded",
                        variant: "success",
                    });

                    void dispatchSystemNotificationIfEnabled({
                        title: "Backup uploaded",
                    });
                } catch (error) {
                    const safeError = ensureError(error);
                    enqueueCloudErrorToast("Backup upload failed", error);

                    void dispatchSystemNotificationIfEnabled({
                        body: getUserFacingErrorDetail(error),
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
