/**
 * Comprehensive test suite for CloudService.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CloudStatusSummary } from "@shared/types/cloud";
import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";

import { CloudService } from "../../services/CloudService";

const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());
const MockElectronBridgeNotReadyError = vi.hoisted(
    () =>
        class extends Error {
            public readonly diagnostics: unknown;

            public constructor(diagnostics: unknown) {
                super("Electron bridge not ready");
                this.name = "ElectronBridgeNotReadyError";
                this.diagnostics = diagnostics;
            }
        }
);

const mockLogger = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));

const mockElectronAPI = vi.hoisted(() => ({
    cloud: {
        clearEncryptionKey: vi.fn(),
        configureFilesystemProvider: vi.fn(),
        connectDropbox: vi.fn(),
        deleteBackup: vi.fn(),
        disconnect: vi.fn(),
        enableSync: vi.fn(),
        getStatus: vi.fn(),
        listBackups: vi.fn(),
        migrateBackups: vi.fn(),
        previewResetRemoteSyncState: vi.fn(),
        requestSyncNow: vi.fn(),
        resetRemoteSyncState: vi.fn(),
        restoreBackup: vi.fn(),
        setEncryptionPassphrase: vi.fn(),
        uploadLatestBackup: vi.fn(),
    },
}));

vi.mock("../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
}));

vi.mock("../../services/logger", () => ({
    logger: mockLogger,
}));

describe("CloudService", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockWaitForElectronBridge.mockResolvedValue(undefined);

        const defaultStatus: CloudStatusSummary = {
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

        mockElectronAPI.cloud.getStatus.mockResolvedValue(defaultStatus);
        mockElectronAPI.cloud.disconnect.mockResolvedValue(defaultStatus);
        mockElectronAPI.cloud.connectDropbox.mockResolvedValue({
            ...defaultStatus,
            provider: "dropbox",
            connected: true,
        });
        mockElectronAPI.cloud.enableSync.mockResolvedValue({
            ...defaultStatus,
            syncEnabled: true,
        });
        mockElectronAPI.cloud.clearEncryptionKey.mockResolvedValue({
            ...defaultStatus,
            encryptionLocked: false,
            encryptionMode: "none",
        });
        mockElectronAPI.cloud.setEncryptionPassphrase.mockResolvedValue({
            ...defaultStatus,
            encryptionLocked: false,
            encryptionMode: "passphrase",
        });
        mockElectronAPI.cloud.configureFilesystemProvider.mockResolvedValue({
            provider: "filesystem",
            configured: true,
            connected: true,
            backupsEnabled: true,
            encryptionLocked: false,
            encryptionMode: "none",
            syncEnabled: false,
            lastBackupAt: null,
            lastSyncAt: null,
            providerDetails: {
                kind: "filesystem",
                baseDirectory: "C:/Backups",
            },
        });
        mockElectronAPI.cloud.listBackups.mockResolvedValue([]);
        mockElectronAPI.cloud.requestSyncNow.mockResolvedValue(undefined);
        const migrationResult: CloudBackupMigrationResult = {
            completedAt: 10,
            deleteSource: false,
            failures: [],
            migrated: 1,
            processed: 1,
            skipped: 0,
            startedAt: 1,
            target: "encrypted",
        };
        mockElectronAPI.cloud.migrateBackups.mockResolvedValue(migrationResult);

        const preview: CloudSyncResetPreview = {
            deviceIds: ["device-a"],
            fetchedAt: 1,
            latestSnapshotKey: "sync/snapshots/latest",
            operationDeviceIds: ["device-a"],
            operationObjectCount: 1,
            otherObjectCount: 0,
            perDevice: [
                {
                    deviceId: "device-a",
                    newestCreatedAtEpochMs: 10,
                    oldestCreatedAtEpochMs: 10,
                    operationObjectCount: 1,
                },
            ],
            resetAt: undefined,
            snapshotObjectCount: 1,
            syncObjectCount: 2,
        };
        mockElectronAPI.cloud.previewResetRemoteSyncState.mockResolvedValue(
            preview
        );

        const resetResult: CloudSyncResetResult = {
            completedAt: 10,
            deletedObjects: 2,
            failedDeletions: [],
            resetAt: 123,
            seededSnapshotKey: "sync/snapshots/new",
            startedAt: 1,
        };
        mockElectronAPI.cloud.resetRemoteSyncState.mockResolvedValue(
            resetResult
        );
        mockElectronAPI.cloud.uploadLatestBackup.mockResolvedValue({
            encrypted: false,
            fileName: "uptime-watcher-backup-1.sqlite",
            key: "backups/1.sqlite",
            metadata: {
                appVersion: "test",
                checksum: "abc",
                createdAt: 1,
                originalPath: "x",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 1,
            },
        });
        mockElectronAPI.cloud.restoreBackup.mockResolvedValue({
            restoredAt: 2,
            preRestoreFileName: "pre.sqlite",
            metadata: {
                appVersion: "test",
                checksum: "abc",
                createdAt: 1,
                originalPath: "x",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 1,
            },
        });

        (globalThis as any).window = {
            electronAPI: mockElectronAPI,
        };
    });

    afterEach(() => {
        vi.resetAllMocks();
        delete (globalThis as any).window;
    });

    it("initializes", async () => {
        await expect(CloudService.initialize()).resolves.toBeUndefined();
        expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
    });

    it("returns status", async () => {
        const status = await CloudService.getStatus();
        expect(status.provider).toBeNull();
        expect(mockElectronAPI.cloud.getStatus).toHaveBeenCalledTimes(1);
    });

    it("disconnects", async () => {
        const status = await CloudService.disconnect();
        expect(status.provider).toBeNull();
        expect(mockElectronAPI.cloud.disconnect).toHaveBeenCalledTimes(1);
    });

    it("enables sync", async () => {
        const status = await CloudService.enableSync({ enabled: true });
        expect(status.syncEnabled).toBeTruthy();
        expect(mockElectronAPI.cloud.enableSync).toHaveBeenCalledWith({
            enabled: true,
        });
    });

    it("configures filesystem provider", async () => {
        const status = await CloudService.configureFilesystemProvider({
            baseDirectory: "C:/Backups",
        });

        expect(status.provider).toBe("filesystem");
        expect(
            mockElectronAPI.cloud.configureFilesystemProvider
        ).toHaveBeenCalledWith({ baseDirectory: "C:/Backups" });
    });

    it("lists backups", async () => {
        await expect(CloudService.listBackups()).resolves.toEqual([]);
        expect(mockElectronAPI.cloud.listBackups).toHaveBeenCalledTimes(1);
    });

    it("uploads latest backup", async () => {
        const entry = await CloudService.uploadLatestBackup();
        expect(entry.key).toBe("backups/1.sqlite");
        expect(mockElectronAPI.cloud.uploadLatestBackup).toHaveBeenCalledTimes(
            1
        );
    });

    it("requests sync now", async () => {
        await expect(CloudService.requestSyncNow()).resolves.toBeUndefined();
        expect(mockElectronAPI.cloud.requestSyncNow).toHaveBeenCalledTimes(1);
    });

    it("restores backup", async () => {
        const result = await CloudService.restoreBackup("backups/1.sqlite");
        expect(result.preRestoreFileName).toBe("pre.sqlite");
        expect(mockElectronAPI.cloud.restoreBackup).toHaveBeenCalledWith(
            "backups/1.sqlite"
        );
        expect(mockLogger.info).toHaveBeenCalled();
    });

    it("rejects empty restore key", async () => {
        await expect(CloudService.restoreBackup("")).rejects.toThrowError(
            TypeError
        );
    });

    it("connects Dropbox", async () => {
        const status = await CloudService.connectDropbox();
        expect(status.provider).toBe("dropbox");
        expect(mockElectronAPI.cloud.connectDropbox).toHaveBeenCalledTimes(1);
    });

    it("clears encryption key", async () => {
        const status = await CloudService.clearEncryptionKey();
        expect(status.encryptionMode).toBe("none");
        expect(mockElectronAPI.cloud.clearEncryptionKey).toHaveBeenCalledTimes(
            1
        );
    });

    it("sets encryption passphrase", async () => {
        const status = await CloudService.setEncryptionPassphrase("pass");
        expect(status.encryptionMode).toBe("passphrase");
        expect(
            mockElectronAPI.cloud.setEncryptionPassphrase
        ).toHaveBeenCalledWith("pass");
        expect(mockLogger.info).toHaveBeenCalled();
    });

    it("rejects empty encryption passphrase", async () => {
        await expect(
            CloudService.setEncryptionPassphrase(" ")
        ).rejects.toThrowError(TypeError);
    });

    it("migrates backups", async () => {
        const result = await CloudService.migrateBackups({
            deleteSource: false,
            target: "encrypted",
        });

        expect(result.target).toBe("encrypted");
        expect(mockElectronAPI.cloud.migrateBackups).toHaveBeenCalledWith({
            deleteSource: false,
            target: "encrypted",
        });
    });

    it("previews remote sync reset", async () => {
        const preview = await CloudService.previewResetRemoteSyncState();
        expect(preview.syncObjectCount).toBeGreaterThanOrEqual(0);
        expect(
            mockElectronAPI.cloud.previewResetRemoteSyncState
        ).toHaveBeenCalledTimes(1);
    });

    it("resets remote sync state", async () => {
        const result = await CloudService.resetRemoteSyncState();
        expect(result.resetAt).toBe(123);
        expect(
            mockElectronAPI.cloud.resetRemoteSyncState
        ).toHaveBeenCalledTimes(1);
    });
});
