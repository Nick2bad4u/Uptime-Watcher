import type { CloudBackupEntry, CloudStatusSummary } from "@shared/types/cloud";
import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { StoreApi, UseBoundStore } from "zustand";

import { withErrorHandling } from "@shared/utils/errorHandling";
import { create } from "zustand";

import { CloudService } from "../../services/CloudService";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";

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
    disconnect: () => Promise<void>;
    isClearingEncryptionKey: boolean;
    isConnectingDropbox: boolean;
    isDisconnecting: boolean;
    isListingBackups: boolean;
    isMigratingBackups: boolean;
    isRefreshingRemoteSyncResetPreview: boolean;
    isRefreshingStatus: boolean;
    isRequestingSyncNow: boolean;
    isResettingRemoteSyncState: boolean;
    isSettingEncryptionPassphrase: boolean;
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
    create<CloudStoreState>()((set, get) => ({
        backups: [],

        clearEncryptionKey: async (): Promise<void> => {
            set({ isClearingEncryptionKey: true });

            try {
                await withErrorHandling(
                    async () => {
                        const status = await CloudService.clearEncryptionKey();
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
        }): Promise<void> =>
            withErrorHandling(
                async () => {
                    const status =
                        await CloudService.configureFilesystemProvider(args);
                    set({ status });
                },
                createStoreErrorHandler("cloud", "configureFilesystemProvider")
            ),

        connectDropbox: async (): Promise<void> => {
            set({ isConnectingDropbox: true });

            try {
                await withErrorHandling(
                    async () => {
                        const status = await CloudService.connectDropbox();
                        set({ status });
                    },
                    createStoreErrorHandler("cloud", "connectDropbox")
                );
            } finally {
                set({ isConnectingDropbox: false });
            }
        },

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

        isConnectingDropbox: false,

        isDisconnecting: false,

        isListingBackups: false,

        isMigratingBackups: false,
        isRefreshingRemoteSyncResetPreview: false,
        isRefreshingStatus: false,
        isRequestingSyncNow: false,
        isResettingRemoteSyncState: false,
        isSettingEncryptionPassphrase: false,
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

            try {
                await withErrorHandling(
                    async () => {
                        const result = await CloudService.migrateBackups(args);

                        const [status, backups] = await Promise.all([
                            CloudService.getStatus(),
                            CloudService.listBackups().catch(
                                () => get().backups
                            ),
                        ]);

                        set({
                            backups,
                            lastBackupMigrationResult: result,
                            status,
                        });
                    },
                    createStoreErrorHandler("cloud", "migrateBackups")
                );
            } finally {
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

            try {
                await withErrorHandling(
                    async () => {
                        await CloudService.requestSyncNow();
                        const status = await CloudService.getStatus();
                        set({ status });
                    },
                    createStoreErrorHandler("cloud", "requestSyncNow")
                );
            } finally {
                set({ isRequestingSyncNow: false });
            }
        },

        resetRemoteSyncState: async (): Promise<void> => {
            set({ isResettingRemoteSyncState: true });

            try {
                await withErrorHandling(
                    async () => {
                        const result =
                            await CloudService.resetRemoteSyncState();

                        const [status, backups] = await Promise.all([
                            CloudService.getStatus(),
                            CloudService.listBackups().catch(
                                () => get().backups
                            ),
                        ]);

                        set({
                            backups,
                            lastRemoteSyncResetResult: result,
                            remoteSyncResetPreview: null,
                            status,
                        });
                    },
                    createStoreErrorHandler("cloud", "resetRemoteSyncState")
                );
            } finally {
                set({ isResettingRemoteSyncState: false });
            }
        },

        restoreBackup: async (key: string): Promise<void> => {
            set({ restoringBackupKey: key });

            try {
                await withErrorHandling(
                    async () => {
                        await CloudService.restoreBackup(key);

                        const [status, backups] = await Promise.all([
                            CloudService.getStatus(),
                            CloudService.listBackups().catch(
                                () => get().backups
                            ),
                        ]);
                        set({ backups, status });
                    },
                    createStoreErrorHandler("cloud", "restoreBackup")
                );
            } finally {
                set({ restoringBackupKey: null });
            }
        },

        restoringBackupKey: null,

        setEncryptionPassphrase: async (passphrase: string): Promise<void> => {
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
                    createStoreErrorHandler("cloud", "setEncryptionPassphrase")
                );
            } finally {
                set({ isSettingEncryptionPassphrase: false });
            }
        },

        setSyncEnabled: async (enabled: boolean): Promise<void> => {
            await withErrorHandling(
                async () => {
                    // eslint-disable-next-line n/no-sync -- Domain-level "enable sync" call, not a Node.js sync filesystem API.
                    const status = await CloudService.enableSync({ enabled });
                    set({ status });
                },
                createStoreErrorHandler("cloud", "setSyncEnabled")
            );
        },
        status: null,

        uploadLatestBackup: async (): Promise<void> => {
            set({ isUploadingBackup: true });

            try {
                await withErrorHandling(
                    async () => {
                        await CloudService.uploadLatestBackup();

                        const [status, backups] = await Promise.all([
                            CloudService.getStatus(),
                            CloudService.listBackups().catch(
                                () => get().backups
                            ),
                        ]);

                        set({ backups, status });
                    },
                    createStoreErrorHandler("cloud", "uploadLatestBackup")
                );
            } finally {
                set({ isUploadingBackup: false });
            }
        },
    }));
