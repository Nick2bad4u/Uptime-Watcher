import { describe, it, expect, beforeEach, vi } from "vitest";
import { ipcRenderer } from "electron";

import { cloudApi } from "../../../preload/domains/cloudApi";
import { CLOUD_CHANNELS } from "@shared/types/preload";

const ipcRendererMock = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: ipcRendererMock,
}));

const ipcContext = expect.objectContaining({
    __uptimeWatcherIpcContext: true,
});

describe("cloudApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("disconnects cloud provider", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: {
                provider: null,
                configured: false,
                connected: false,
                backupsEnabled: false,
                syncEnabled: false,
                lastBackupAt: null,
            },
        });

        const result = await cloudApi.disconnect();
        expect(result.provider).toBeNull();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            CLOUD_CHANNELS.disconnect,
            ipcContext
        );
    });

    it("enables sync", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: {
                provider: null,
                configured: false,
                connected: false,
                backupsEnabled: false,
                syncEnabled: true,
                lastBackupAt: null,
            },
        });

        const result = await cloudApi.enableSync({ enabled: true });
        expect(result.syncEnabled).toBeTruthy();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            CLOUD_CHANNELS.enableSync,
            { enabled: true },
            ipcContext
        );
    });

    it("gets cloud status", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: {
                provider: null,
                configured: false,
                connected: false,
                backupsEnabled: false,
                syncEnabled: false,
                lastBackupAt: null,
            },
        });

        const result = await cloudApi.getStatus();
        expect(result.provider).toBeNull();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            CLOUD_CHANNELS.getStatus,
            ipcContext
        );
    });

    it("configures filesystem provider", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: {
                provider: "filesystem",
                configured: true,
                connected: true,
                backupsEnabled: true,
                syncEnabled: false,
                lastBackupAt: null,
                providerDetails: {
                    kind: "filesystem",
                    baseDirectory: "C:/Backups",
                },
            },
        });

        const config = { baseDirectory: "C:/Backups" };
        const result = await cloudApi.configureFilesystemProvider(config);
        expect(result.provider).toBe("filesystem");

        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            CLOUD_CHANNELS.configureFilesystemProvider,
            config,
            ipcContext
        );
    });

    it("lists backups", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: [],
        });

        const result = await cloudApi.listBackups();
        expect(result).toEqual([]);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            CLOUD_CHANNELS.listBackups,
            ipcContext
        );
    });

    it("requests sync now", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: null,
        });

        await expect(cloudApi.requestSyncNow()).resolves.toBeUndefined();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            CLOUD_CHANNELS.requestSyncNow,
            ipcContext
        );
    });

    it("deletes a backup", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: [],
        });

        await expect(cloudApi.deleteBackup("backups/a")).resolves.toEqual([]);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            CLOUD_CHANNELS.deleteBackup,
            "backups/a",
            ipcContext
        );
    });

    it("uploads latest backup", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: {
                key: "backups/2025/12/uptime-watcher-backup-1.sqlite",
                fileName: "uptime-watcher-backup-1.sqlite",
                encrypted: false,
                metadata: {
                    appVersion: "1.0.0",
                    checksum: "abc",
                    createdAt: 1,
                    originalPath: "x",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 5,
                },
            },
        });

        const result = await cloudApi.uploadLatestBackup();
        expect(result.encrypted).toBeFalsy();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            CLOUD_CHANNELS.uploadLatestBackup,
            ipcContext
        );
    });

    it("restores backup", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: {
                restoredAt: 2,
                preRestoreFileName: "pre.sqlite",
                metadata: {
                    appVersion: "1.0.0",
                    checksum: "abc",
                    createdAt: 1,
                    originalPath: "x",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 5,
                },
            },
        });

        const result = await cloudApi.restoreBackup("backups/1.sqlite");
        expect(result.restoredAt).toBe(2);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            CLOUD_CHANNELS.restoreBackup,
            "backups/1.sqlite",
            ipcContext
        );
    });
});
