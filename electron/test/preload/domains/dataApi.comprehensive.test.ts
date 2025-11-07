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
import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

const ipcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer,
}));

const createBackup = (
    overrides: Partial<SerializedDatabaseBackupResult> = {}
): SerializedDatabaseBackupResult => ({
    buffer: overrides.buffer ?? new ArrayBuffer(512),
    fileName: overrides.fileName ?? "uptime-watcher-backup.sqlite",
    metadata: {
        createdAt: overrides.metadata?.createdAt ?? Date.now(),
        originalPath:
            overrides.metadata?.originalPath ??
            "C:/backups/uptime-watcher/uptime-watcher.sqlite",
        sizeBytes:
            overrides.metadata?.sizeBytes ??
            overrides.buffer?.byteLength ??
            512,
    },
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
            ].toSorted()
        );
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
                DATA_CHANNELS.downloadSqliteBackup
            );
            expect(result).toStrictEqual(expected);
        });

        it("propagates IPC errors", async () => {
            const response: IpcResponse = {
                success: false,
                error: "unable to create backup",
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            await expect(dataApi.downloadSqliteBackup()).rejects.toThrow(
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
                DATA_CHANNELS.exportData
            );
            expect(result).toBe(exportBlob);
        });

        it("throws when the backend reports a failure", async () => {
            const response: IpcResponse<string> = {
                success: false,
                error: "export-failed",
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            await expect(dataApi.exportData()).rejects.toThrow("export-failed");
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
                payload
            );
            expect(result).toBeTruthy();
        });

        it("throws if the import fails", async () => {
            const response: IpcResponse<boolean> = {
                success: false,
                error: "invalid export signature",
            };
            ipcRenderer.invoke.mockResolvedValueOnce(response);

            await expect(dataApi.importData("{}")).rejects.toThrow(
                "invalid export signature"
            );
        });
    });
});
