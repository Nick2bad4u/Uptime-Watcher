/**
 * Focused tests for the data preload domain.
 *
 * @remarks
 * These tests assert the behavior of the remaining data API surface after the
 * history limit operations moved to the dedicated settings domain. They ensure
 * each bridge method invokes the correct IPC channel and propagates success and
 * failure states.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IpcResponse } from "../../../preload/core/bridgeFactory";
import { dataApi } from "../../../preload/domains/dataApi";
import { DATA_CHANNELS } from "@shared/types/preload";
import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

const ipcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer,
}));

const ipcContext = expect.objectContaining({
    __uptimeWatcherIpcContext: true,
});

const createBackup = (
    overrides: Partial<SerializedDatabaseBackupResult> = {}
): SerializedDatabaseBackupResult => ({
    buffer: overrides.buffer ?? new ArrayBuffer(512),
    fileName: overrides.fileName ?? "uptime-watcher-backup.sqlite",
    metadata: {
        appVersion: overrides.metadata?.appVersion ?? "0.0.0-test",
        checksum: overrides.metadata?.checksum ?? "mock-checksum",
        createdAt: overrides.metadata?.createdAt ?? Date.now(),
        originalPath:
            overrides.metadata?.originalPath ??
            "C:/backups/uptime-watcher/uptime-watcher.sqlite",
        retentionHintDays: overrides.metadata?.retentionHintDays ?? 30,
        schemaVersion: overrides.metadata?.schemaVersion ?? 1,
        sizeBytes:
            overrides.metadata?.sizeBytes ??
            overrides.buffer?.byteLength ??
            512,
    },
});

const createRestoreSummary = (
    overrides: Partial<SerializedDatabaseRestoreResult> = {}
): SerializedDatabaseRestoreResult => ({
    metadata: {
        appVersion: overrides.metadata?.appVersion ?? "0.0.0-test",
        checksum: overrides.metadata?.checksum ?? "restore-checksum",
        createdAt: overrides.metadata?.createdAt ?? Date.now(),
        originalPath: overrides.metadata?.originalPath ?? "restore.sqlite",
        retentionHintDays: overrides.metadata?.retentionHintDays ?? 30,
        schemaVersion: overrides.metadata?.schemaVersion ?? 1,
        sizeBytes: overrides.metadata?.sizeBytes ?? 1024,
    },
    preRestoreFileName:
        overrides.preRestoreFileName ?? "uptime-watcher-pre-restore.sqlite",
    restoredAt: overrides.restoredAt ?? Date.now(),
});

describe("dataApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("exposes only the current data domain surface", () => {
        expect(Object.keys(dataApi).toSorted()).toEqual(
            [
                "downloadSqliteBackup",
                "exportData",
                "importData",
                "restoreSqliteBackup",
                "saveSqliteBackup",
            ].toSorted()
        );
    });

    describe("saveSqliteBackup", () => {
        it("returns the save result when IPC succeeds", async () => {
            const response: IpcResponse = {
                success: true,
                data: { canceled: true },
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            const result = await dataApi.saveSqliteBackup();

            expect(ipcRenderer.invoke).toHaveBeenCalledWith(
                DATA_CHANNELS.saveSqliteBackup,
                ipcContext
            );
            expect(result).toStrictEqual({ canceled: true });
        });

        it("throws when the backend reports a failure", async () => {
            const response: IpcResponse = {
                success: false,
                error: "save-failed",
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            await expect(dataApi.saveSqliteBackup()).rejects.toThrowError(
                "save-failed"
            );
        });
    });

    describe("downloadSqliteBackup", () => {
        it("returns the serialized backup payload when IPC succeeds", async () => {
            const expected = createBackup();
            const response: IpcResponse<SerializedDatabaseBackupResult> = {
                success: true,
                data: expected,
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            const result = await dataApi.downloadSqliteBackup();

            expect(ipcRenderer.invoke).toHaveBeenCalledWith(
                DATA_CHANNELS.downloadSqliteBackup,
                ipcContext
            );
            expect(result).toStrictEqual(expected);
        });

        it("propagates IPC errors", async () => {
            const response: IpcResponse = {
                success: false,
                error: "unable to create backup",
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            await expect(dataApi.downloadSqliteBackup()).rejects.toThrowError(
                "unable to create backup"
            );
        });
    });

    describe("exportData", () => {
        it("returns exported JSON data", async () => {
            const exportBlob = JSON.stringify({ sites: [], settings: {} });
            const response: IpcResponse<string> = {
                success: true,
                data: exportBlob,
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            const result = await dataApi.exportData();

            expect(ipcRenderer.invoke).toHaveBeenCalledWith(
                DATA_CHANNELS.exportData,
                ipcContext
            );
            expect(result).toBe(exportBlob);
        });

        it("throws when the backend reports a failure", async () => {
            const response: IpcResponse<string> = {
                success: false,
                error: "export-failed",
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            await expect(dataApi.exportData()).rejects.toThrowError(
                "export-failed"
            );
        });
    });

    describe("importData", () => {
        it("forwards the payload to the correct IPC channel", async () => {
            const payload = JSON.stringify({ version: 1 });
            const response: IpcResponse<boolean> = {
                success: true,
                data: true,
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            const result = await dataApi.importData(payload);

            expect(ipcRenderer.invoke).toHaveBeenCalledWith(
                DATA_CHANNELS.importData,
                payload,
                ipcContext
            );
            expect(result).toBeTruthy();
        });

        it("throws if the import fails", async () => {
            const response: IpcResponse<boolean> = {
                success: false,
                error: "invalid export signature",
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            await expect(dataApi.importData("{}")).rejects.toThrowError(
                "invalid export signature"
            );
        });
    });

    describe("restoreSqliteBackup", () => {
        it("sends the payload to the restore IPC channel", async () => {
            const summary = createRestoreSummary();
            const response: IpcResponse<SerializedDatabaseRestoreResult> = {
                success: true,
                data: summary,
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            const result = await dataApi.restoreSqliteBackup({
                buffer: new ArrayBuffer(64),
                fileName: "restore.sqlite",
            });

            expect(ipcRenderer.invoke).toHaveBeenCalledWith(
                DATA_CHANNELS.restoreSqliteBackup,
                {
                    buffer: expect.any(ArrayBuffer),
                    fileName: "restore.sqlite",
                },
                ipcContext
            );
            expect(result).toStrictEqual(summary);
        });

        it("throws if restore fails", async () => {
            const response: IpcResponse<SerializedDatabaseRestoreResult> = {
                success: false,
                error: "restore-failed",
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            await expect(
                dataApi.restoreSqliteBackup({
                    buffer: new ArrayBuffer(10),
                    fileName: "restore.db",
                })
            ).rejects.toThrowError("restore-failed");
        });
    });
});
