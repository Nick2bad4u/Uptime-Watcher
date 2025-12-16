/**
 * Comprehensive tests for the Cloud Zustand store.
 *
 * @remarks
 * This suite focuses on the Cloud Sync + Remote Backup feature wiring in the
 * renderer process. The store is expected to:
 *
 * - Expose stable busy flags for each operation
 * - Update `status`, `backups`, and maintenance-result fields on success
 * - Always reset busy flags (even on failure)
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { CloudBackupEntry, CloudStatusSummary } from "@shared/types/cloud";
import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";

import type { CloudStoreState } from "../../../stores/cloud/useCloudStore";

import { useAlertStore } from "../../../stores/alerts/useAlertStore";

const cloudServiceMock = vi.hoisted(() => ({
    CloudService: {
        clearEncryptionKey: vi.fn<() => Promise<CloudStatusSummary>>(),
        configureFilesystemProvider:
            vi.fn<
                (args: { baseDirectory: string }) => Promise<CloudStatusSummary>
            >(),
        connectDropbox: vi.fn<() => Promise<CloudStatusSummary>>(),
        connectGoogleDrive: vi.fn<() => Promise<CloudStatusSummary>>(),
        disconnect: vi.fn<() => Promise<CloudStatusSummary>>(),
        enableSync:
            vi.fn<
                (args: { enabled: boolean }) => Promise<CloudStatusSummary>
            >(),
        getStatus: vi.fn<() => Promise<CloudStatusSummary>>(),
        listBackups: vi.fn<() => Promise<CloudBackupEntry[]>>(),
        migrateBackups:
            vi.fn<
                (args: {
                    deleteSource: boolean;
                    limit?: number | undefined;
                    target: "encrypted" | "plaintext";
                }) => Promise<CloudBackupMigrationResult>
            >(),
        previewResetRemoteSyncState:
            vi.fn<() => Promise<CloudSyncResetPreview>>(),
        requestSyncNow: vi.fn<() => Promise<void>>(),
        resetRemoteSyncState: vi.fn<() => Promise<CloudSyncResetResult>>(),
        restoreBackup: vi.fn<(key: string) => Promise<void>>(),
        setEncryptionPassphrase:
            vi.fn<(passphrase: string) => Promise<CloudStatusSummary>>(),
        uploadLatestBackup: vi.fn<() => Promise<void>>(),
    },
}));

vi.mock("../../../services/CloudService", () => cloudServiceMock);

vi.mock("../../../stores/utils/storeErrorHandling", () => ({
    createStoreErrorHandler: () => ({
        clearError: () => {},
        setError: () => {},
        setLoading: () => {},
    }),
}));

import { useCloudStore } from "../../../stores/cloud/useCloudStore";

function createDeferred<T>(): {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
} {
    let resolve: (value: T) => void = () => {};
    let reject: (error: unknown) => void = () => {};

    const promise = new Promise<T>((innerResolve, innerReject) => {
        resolve = innerResolve;
        reject = innerReject;
    });

    return { promise, resolve, reject };
}

describe(useCloudStore, () => {
    let initialSnapshot: CloudStoreState;

    const baseStatus: CloudStatusSummary = {
        provider: null,
        configured: false,
        connected: false,
        backupsEnabled: false,
        encryptionLocked: false,
        encryptionMode: "none",
        syncEnabled: false,
        lastBackupAt: null,
        lastSyncAt: null,
    };

    beforeAll(() => {
        initialSnapshot = useCloudStore.getState();
    });

    beforeEach(() => {
        vi.clearAllMocks();

        useAlertStore.getState().clearToasts();

        // Reset store to a stable baseline.
        useCloudStore.setState(
            {
                ...initialSnapshot,
                backups: [],
                status: null,
                remoteSyncResetPreview: null,
                lastBackupMigrationResult: null,
                lastRemoteSyncResetResult: null,
                restoringBackupKey: null,
                isConfiguringFilesystemProvider: false,
                isClearingEncryptionKey: false,
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
            },
            true
        );

        cloudServiceMock.CloudService.getStatus.mockResolvedValue(baseStatus);
        cloudServiceMock.CloudService.listBackups.mockResolvedValue([]);
        cloudServiceMock.CloudService.disconnect.mockResolvedValue(baseStatus);
    });

    it("connectDropbox toggles busy flag and updates status", async () => {
        const deferred = createDeferred<CloudStatusSummary>();
        cloudServiceMock.CloudService.connectDropbox.mockReturnValue(
            deferred.promise
        );

        const promise = useCloudStore.getState().connectDropbox();
        expect(useCloudStore.getState().isConnectingDropbox).toBeTruthy();

        const [startedToast] = useAlertStore.getState().toasts;
        expect(startedToast?.variant).toBe("info");
        expect(startedToast?.title).toBe("Connecting Dropbox");

        deferred.resolve({
            ...baseStatus,
            provider: "dropbox",
            connected: true,
        });
        await promise;

        expect(useCloudStore.getState().isConnectingDropbox).toBeFalsy();
        expect(useCloudStore.getState().status?.provider).toBe("dropbox");

        const [toast] = useAlertStore.getState().toasts;
        expect(toast?.variant).toBe("success");
        expect(toast?.title).toBe("Dropbox connected");
    });

    it("connectGoogleDrive toggles busy flag and updates status", async () => {
        const deferred = createDeferred<CloudStatusSummary>();
        cloudServiceMock.CloudService.connectGoogleDrive.mockReturnValue(
            deferred.promise
        );

        const promise = useCloudStore.getState().connectGoogleDrive();
        expect(useCloudStore.getState().isConnectingGoogleDrive).toBeTruthy();

        const [startedToast] = useAlertStore.getState().toasts;
        expect(startedToast?.variant).toBe("info");
        expect(startedToast?.title).toBe("Connecting Google Drive");

        deferred.resolve({
            ...baseStatus,
            provider: "google-drive",
            connected: true,
            configured: true,
            backupsEnabled: true,
            providerDetails: {
                kind: "google-drive",
                accountLabel: "me@example.com",
            },
        });
        await promise;

        expect(useCloudStore.getState().isConnectingGoogleDrive).toBeFalsy();
        expect(useCloudStore.getState().status?.provider).toBe("google-drive");

        const [toast] = useAlertStore.getState().toasts;
        expect(toast?.variant).toBe("success");
        expect(toast?.title).toBe("Google Drive connected");
        expect(toast?.message).toContain("me@example.com");
    });

    it("connectDropbox enqueues an error toast on failure", async () => {
        cloudServiceMock.CloudService.connectDropbox.mockRejectedValue(
            new Error("boom")
        );

        await expect(
            useCloudStore.getState().connectDropbox()
        ).rejects.toThrowError("boom");

        const [toast] = useAlertStore.getState().toasts;
        expect(toast?.variant).toBe("error");
        expect(toast?.title).toBe("Failed to connect Dropbox");
        expect(toast?.message).toContain("boom");
    });

    it("connectGoogleDrive enqueues an error toast on failure", async () => {
        cloudServiceMock.CloudService.connectGoogleDrive.mockRejectedValue(
            new Error("boom")
        );

        await expect(
            useCloudStore.getState().connectGoogleDrive()
        ).rejects.toThrowError("boom");

        const [toast] = useAlertStore.getState().toasts;
        expect(toast?.variant).toBe("error");
        expect(toast?.title).toBe("Failed to connect Google Drive");
        expect(toast?.message).toContain("boom");
    });

    it("disconnect clears backups and updates status", async () => {
        useCloudStore.setState({
            backups: [
                {
                    encrypted: false,
                    fileName: "backup.sqlite",
                    key: "backups/1.sqlite",
                    metadata: {
                        appVersion: "test",
                        checksum: "x",
                        createdAt: 1,
                        originalPath: "x",
                        retentionHintDays: 30,
                        schemaVersion: 1,
                        sizeBytes: 1,
                    },
                },
            ],
        });

        cloudServiceMock.CloudService.disconnect.mockResolvedValue(baseStatus);

        await useCloudStore.getState().disconnect();

        expect(useCloudStore.getState().backups).toEqual([]);
        expect(useCloudStore.getState().status).toEqual(baseStatus);
    });

    it("configureFilesystemProvider updates status", async () => {
        cloudServiceMock.CloudService.configureFilesystemProvider.mockResolvedValue(
            {
                ...baseStatus,
                provider: "filesystem",
                connected: true,
                configured: true,
                backupsEnabled: true,
            }
        );

        await useCloudStore.getState().configureFilesystemProvider({
            baseDirectory: "C:/Backups",
        });

        expect(
            cloudServiceMock.CloudService.configureFilesystemProvider
        ).toHaveBeenCalledWith({ baseDirectory: "C:/Backups" });
        expect(useCloudStore.getState().status?.provider).toBe("filesystem");
    });

    it("clearEncryptionKey toggles busy flag and updates status", async () => {
        const deferred = createDeferred<CloudStatusSummary>();
        cloudServiceMock.CloudService.clearEncryptionKey.mockReturnValue(
            deferred.promise
        );

        const promise = useCloudStore.getState().clearEncryptionKey();
        expect(useCloudStore.getState().isClearingEncryptionKey).toBeTruthy();

        deferred.resolve({
            ...baseStatus,
            encryptionMode: "none",
            encryptionLocked: false,
        });
        await promise;

        expect(useCloudStore.getState().isClearingEncryptionKey).toBeFalsy();
        expect(useCloudStore.getState().status?.encryptionMode).toBe("none");
    });

    it("refreshStatus updates status and resets busy flag", async () => {
        cloudServiceMock.CloudService.getStatus.mockResolvedValue({
            ...baseStatus,
            provider: "filesystem",
            connected: true,
        });

        await useCloudStore.getState().refreshStatus();

        expect(useCloudStore.getState().isRefreshingStatus).toBeFalsy();
        expect(useCloudStore.getState().status?.provider).toBe("filesystem");
    });

    it("listBackups updates backups and resets busy flag", async () => {
        cloudServiceMock.CloudService.listBackups.mockResolvedValue([
            {
                encrypted: false,
                fileName: "backup.sqlite",
                key: "backups/1.sqlite",
                metadata: {
                    appVersion: "test",
                    checksum: "x",
                    createdAt: 1,
                    originalPath: "x",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 1,
                },
            },
        ]);

        await useCloudStore.getState().listBackups();

        expect(useCloudStore.getState().isListingBackups).toBeFalsy();
        expect(useCloudStore.getState().backups).toHaveLength(1);
    });

    it("requestSyncNow calls service and refreshes status", async () => {
        cloudServiceMock.CloudService.requestSyncNow.mockResolvedValue(
            undefined
        );
        cloudServiceMock.CloudService.getStatus.mockResolvedValue({
            ...baseStatus,
            connected: true,
            syncEnabled: true,
            lastSyncAt: 123,
        });

        await useCloudStore.getState().requestSyncNow();

        expect(
            cloudServiceMock.CloudService.requestSyncNow
        ).toHaveBeenCalledTimes(1);
        expect(cloudServiceMock.CloudService.getStatus).toHaveBeenCalledTimes(
            1
        );
        expect(useCloudStore.getState().status?.lastSyncAt).toBe(123);
        expect(useCloudStore.getState().isRequestingSyncNow).toBeFalsy();

        const [toast] = useAlertStore.getState().toasts;
        expect(toast?.variant).toBe("success");
        expect(toast?.title).toBe("Sync complete");
    });

    it("uploadLatestBackup refreshes status and backups, and tolerates listBackups failures", async () => {
        useCloudStore.setState({
            backups: [
                {
                    encrypted: false,
                    fileName: "existing.sqlite",
                    key: "backups/existing.sqlite",
                    metadata: {
                        appVersion: "test",
                        checksum: "x",
                        createdAt: 1,
                        originalPath: "x",
                        retentionHintDays: 30,
                        schemaVersion: 1,
                        sizeBytes: 1,
                    },
                },
            ],
        });

        cloudServiceMock.CloudService.uploadLatestBackup.mockResolvedValue(
            undefined
        );
        cloudServiceMock.CloudService.getStatus.mockResolvedValue({
            ...baseStatus,
            connected: true,
            backupsEnabled: true,
            lastBackupAt: 999,
        });
        cloudServiceMock.CloudService.listBackups.mockRejectedValue(
            new Error("list failed")
        );

        await useCloudStore.getState().uploadLatestBackup();

        expect(
            cloudServiceMock.CloudService.uploadLatestBackup
        ).toHaveBeenCalledTimes(1);
        expect(useCloudStore.getState().status?.lastBackupAt).toBe(999);
        // Fallback path: retain previous backups.
        expect(useCloudStore.getState().backups[0]?.fileName).toBe(
            "existing.sqlite"
        );
        expect(useCloudStore.getState().isUploadingBackup).toBeFalsy();

        const [toast] = useAlertStore.getState().toasts;
        expect(toast?.variant).toBe("success");
        expect(toast?.title).toBe("Backup uploaded");
    });

    it("restoreBackup tracks restoringBackupKey and refreshes state", async () => {
        const deferred = createDeferred<undefined>();
        cloudServiceMock.CloudService.restoreBackup.mockReturnValue(
            deferred.promise
        );

        cloudServiceMock.CloudService.getStatus.mockResolvedValue({
            ...baseStatus,
            connected: true,
            backupsEnabled: true,
        });
        cloudServiceMock.CloudService.listBackups.mockResolvedValue([]);

        const promise = useCloudStore
            .getState()
            .restoreBackup("backups/1.sqlite");
        expect(useCloudStore.getState().restoringBackupKey).toBe(
            "backups/1.sqlite"
        );

        deferred.resolve(undefined);
        await promise;

        expect(useCloudStore.getState().restoringBackupKey).toBeNull();
        expect(
            cloudServiceMock.CloudService.restoreBackup
        ).toHaveBeenCalledWith("backups/1.sqlite");
        expect(cloudServiceMock.CloudService.getStatus).toHaveBeenCalled();

        const [toast] = useAlertStore.getState().toasts;
        expect(toast?.variant).toBe("success");
        expect(toast?.title).toBe("Backup restored");
    });

    it("setEncryptionPassphrase toggles busy flag and updates status", async () => {
        cloudServiceMock.CloudService.setEncryptionPassphrase.mockResolvedValue(
            {
                ...baseStatus,
                encryptionMode: "passphrase",
                encryptionLocked: false,
            }
        );

        const promise = useCloudStore
            .getState()
            .setEncryptionPassphrase("pass");
        expect(
            useCloudStore.getState().isSettingEncryptionPassphrase
        ).toBeTruthy();

        await promise;

        expect(
            useCloudStore.getState().isSettingEncryptionPassphrase
        ).toBeFalsy();
        expect(
            cloudServiceMock.CloudService.setEncryptionPassphrase
        ).toHaveBeenCalledWith("pass");
        expect(useCloudStore.getState().status?.encryptionMode).toBe(
            "passphrase"
        );
    });

    it("setSyncEnabled delegates to CloudService.enableSync", async () => {
        cloudServiceMock.CloudService.enableSync.mockResolvedValue({
            ...baseStatus,
            connected: true,
            syncEnabled: true,
        });

        const promise = useCloudStore.getState().setSyncEnabled(true);
        expect(useCloudStore.getState().isSettingSyncEnabled).toBeTruthy();

        await promise;

        expect(cloudServiceMock.CloudService.enableSync).toHaveBeenCalledWith({
            enabled: true,
        });
        expect(useCloudStore.getState().status?.syncEnabled).toBeTruthy();
        expect(useCloudStore.getState().isSettingSyncEnabled).toBeFalsy();
    });

    it("migrateBackups stores last result and refreshes status/backups", async () => {
        const result: CloudBackupMigrationResult = {
            completedAt: 10,
            deleteSource: false,
            failures: [{ key: "a", message: "b" }],
            migrated: 2,
            processed: 3,
            skipped: 1,
            startedAt: 1,
            target: "encrypted",
        };

        const deferred = createDeferred<CloudBackupMigrationResult>();
        cloudServiceMock.CloudService.migrateBackups.mockReturnValue(
            deferred.promise
        );
        cloudServiceMock.CloudService.getStatus.mockResolvedValue({
            ...baseStatus,
            connected: true,
            encryptionMode: "passphrase",
        });
        cloudServiceMock.CloudService.listBackups.mockResolvedValue([]);

        const promise = useCloudStore.getState().migrateBackups({
            deleteSource: false,
            target: "encrypted",
        });

        const [startedToast] = useAlertStore.getState().toasts;
        expect(startedToast?.variant).toBe("info");
        expect(startedToast?.title).toBe("Migrating backups");

        deferred.resolve(result);
        await promise;

        expect(useCloudStore.getState().isMigratingBackups).toBeFalsy();
        expect(useCloudStore.getState().lastBackupMigrationResult).toEqual(
            result
        );
        expect(
            cloudServiceMock.CloudService.migrateBackups
        ).toHaveBeenCalledWith({
            deleteSource: false,
            target: "encrypted",
        });

        const [toast] = useAlertStore.getState().toasts;
        expect(toast?.variant).toBe("success");
        expect(toast?.title).toBe("Backups encrypted");
    });

    it("refreshRemoteSyncResetPreview stores preview and returns it", async () => {
        const preview: CloudSyncResetPreview = {
            deviceIds: ["a"],
            fetchedAt: 1,
            latestSnapshotKey: "sync/snapshots/latest",
            operationDeviceIds: ["a"],
            operationObjectCount: 2,
            otherObjectCount: 0,
            perDevice: [
                {
                    deviceId: "a",
                    newestCreatedAtEpochMs: 100,
                    oldestCreatedAtEpochMs: 1,
                    operationObjectCount: 2,
                },
            ],
            resetAt: undefined,
            snapshotObjectCount: 1,
            syncObjectCount: 3,
        };

        cloudServiceMock.CloudService.previewResetRemoteSyncState.mockResolvedValue(
            preview
        );

        const result = await useCloudStore
            .getState()
            .refreshRemoteSyncResetPreview();

        expect(result).toEqual(preview);
        expect(useCloudStore.getState().remoteSyncResetPreview).toEqual(
            preview
        );
        expect(
            useCloudStore.getState().isRefreshingRemoteSyncResetPreview
        ).toBeFalsy();
    });

    it("resetRemoteSyncState stores result, clears preview, and refreshes status/backups", async () => {
        const result: CloudSyncResetResult = {
            completedAt: 10,
            deletedObjects: 5,
            failedDeletions: [{ key: "x", message: "y" }],
            resetAt: 123,
            seededSnapshotKey: "sync/snapshots/new",
            startedAt: 1,
        };

        useCloudStore.setState({
            remoteSyncResetPreview: {
                deviceIds: [],
                fetchedAt: 1,
                operationDeviceIds: [],
                operationObjectCount: 0,
                otherObjectCount: 0,
                perDevice: [],
                snapshotObjectCount: 0,
                syncObjectCount: 0,
            },
        });

        const deferred = createDeferred<CloudSyncResetResult>();
        cloudServiceMock.CloudService.resetRemoteSyncState.mockReturnValue(
            deferred.promise
        );
        cloudServiceMock.CloudService.getStatus.mockResolvedValue({
            ...baseStatus,
            connected: true,
            syncEnabled: true,
        });
        cloudServiceMock.CloudService.listBackups.mockResolvedValue([]);

        const promise = useCloudStore.getState().resetRemoteSyncState();

        const [startedToast] = useAlertStore.getState().toasts;
        expect(startedToast?.variant).toBe("info");
        expect(startedToast?.title).toBe("Resetting remote sync");

        deferred.resolve(result);
        await promise;

        expect(useCloudStore.getState().remoteSyncResetPreview).toBeNull();
        expect(useCloudStore.getState().lastRemoteSyncResetResult).toEqual(
            result
        );
        expect(useCloudStore.getState().isResettingRemoteSyncState).toBeFalsy();

        const [toast] = useAlertStore.getState().toasts;
        expect(toast?.variant).toBe("success");
        expect(toast?.title).toBe("Remote sync reset");
    });
});
