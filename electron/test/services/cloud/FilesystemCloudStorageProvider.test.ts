import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("FilesystemCloudStorageProvider", () => {
    let baseDirectory: string;
    let fs: (typeof import("node:fs"))["promises"];
    let os: typeof import("node:os");
    let path: typeof import("node:path");
    let FilesystemCloudStorageProvider: (typeof import("../../../services/cloud/providers/FilesystemCloudStorageProvider"))["FilesystemCloudStorageProvider"];

    beforeEach(async () => {
        // Electron tests globally mock fs/path. This suite needs real IO.
        vi.resetModules();
        vi.doMock("fs", async () => vi.importActual("fs"));
        vi.doMock("node:fs", async () => vi.importActual("node:fs"));
        vi.doMock("path", async () => vi.importActual("path"));
        vi.doMock("node:path", async () => vi.importActual("node:path"));

        const nodeFs = await import("node:fs");
        const nodeOs = await import("node:os");
        const nodePath =
            await vi.importActual<typeof import("node:path")>("node:path");
        const providerModule =
            await import("../../../services/cloud/providers/FilesystemCloudStorageProvider");

        fs = nodeFs.promises;
        os = nodeOs;
        path = nodePath;
        FilesystemCloudStorageProvider =
            providerModule.FilesystemCloudStorageProvider;

        baseDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "uw-cloud-"));
    });

    afterEach(async () => {
        await fs.rm(baseDirectory, { force: true, recursive: true });
    });

    it("uploads, lists, and downloads backups", async () => {
        const provider = new FilesystemCloudStorageProvider({ baseDirectory });
        await expect(provider.isConnected()).resolves.toBeTruthy();

        const buffer = Buffer.from("hello");
        const metadata = {
            appVersion: "1.0.0",
            checksum: "abc",
            createdAt: 1_700_000_000_000,
            originalPath: "C:/db.sqlite",
            retentionHintDays: 30,
            schemaVersion: 1,
            sizeBytes: buffer.byteLength,
        };

        const entry = await provider.uploadBackup({
            buffer,
            encrypted: false,
            fileName: "uptime-watcher-backup-1700000000000.sqlite",
            metadata,
        });

        const listed = await provider.listBackups();
        expect(listed).toHaveLength(1);
        expect(listed[0]?.key).toBe(entry.key);
        expect(listed[0]?.metadata.checksum).toBe("abc");

        const downloaded = await provider.downloadBackup(entry.key);
        expect(downloaded.entry.key).toBe(entry.key);
        expect(downloaded.buffer.toString("utf8")).toBe("hello");
    });

    it("allows keys with segments that start with '..' but are not traversal", async () => {
        const provider = new FilesystemCloudStorageProvider({ baseDirectory });

        await provider.uploadObject({
            buffer: Buffer.from("payload"),
            key: "sync/..foo/payload.txt",
            overwrite: true,
        });

        await expect(provider.downloadObject("sync/..foo/payload.txt")).resolves.toEqual(
            Buffer.from("payload")
        );
    });
});
