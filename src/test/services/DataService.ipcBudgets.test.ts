/**
 * Targeted tests for renderer-side IPC payload budget guards.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const mockWaitForElectronBridge = vi.hoisted(() =>
    vi.fn(async () => undefined)
);

vi.mock("../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: class ElectronBridgeNotReadyError extends Error {
        public readonly diagnostics: unknown;

        public constructor(diagnostics: unknown) {
            super("bridge not ready");
            this.diagnostics = diagnostics;
        }
    },
    waitForElectronBridge: mockWaitForElectronBridge,
}));

vi.mock("../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("electron-log/renderer", () => ({
    default: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

// Override budgets so we can test without allocating huge buffers/strings.
vi.mock("@shared/constants/backup", async () => {
    const actual = await vi.importActual<
        typeof import("@shared/constants/backup")
    >("@shared/constants/backup");

    return {
        ...actual,
        MAX_IPC_JSON_IMPORT_BYTES: 3,
        MAX_IPC_SQLITE_RESTORE_BYTES: 10,
    } satisfies typeof import("@shared/constants/backup");
});

import { DataService } from "../../services/DataService";

describe("DataService IPC payload budgets", () => {
    const restoreSqliteBackupMock = vi.fn();
    const importDataMock = vi.fn();

    beforeEach(() => {
        restoreSqliteBackupMock.mockReset();
        importDataMock.mockReset();

        // Minimal subset of the preload bridge used by the service.

        (window as unknown as { electronAPI: any }).electronAPI = {
            data: {
                downloadSqliteBackup: vi.fn(),
                exportData: vi.fn(),
                importData: importDataMock,
                restoreSqliteBackup: restoreSqliteBackupMock,
                saveSqliteBackup: vi.fn(),
            },
        };
    });

    it("rejects restore payloads larger than MAX_IPC_SQLITE_RESTORE_BYTES", async () => {
        await expect(
            DataService.restoreSqliteBackup({
                buffer: new ArrayBuffer(11),
                fileName: "restore.sqlite",
            })
        ).rejects.toThrowError(/too large/u);

        expect(restoreSqliteBackupMock).not.toHaveBeenCalled();
    });

    it("rejects restore payloads with non-ArrayBuffer buffer", async () => {
        await expect(
            DataService.restoreSqliteBackup({
                buffer: {} as unknown as ArrayBuffer,
                fileName: "restore.sqlite",
            })
        ).rejects.toThrowError(/ArrayBuffer/u);

        expect(restoreSqliteBackupMock).not.toHaveBeenCalled();
    });

    it("rejects JSON imports larger than MAX_IPC_JSON_IMPORT_BYTES", async () => {
        await expect(DataService.importData("abcd")).rejects.toThrowError(
            /too large/u
        );

        expect(importDataMock).not.toHaveBeenCalled();
    });
});
