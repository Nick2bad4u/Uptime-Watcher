import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("FilesystemCloudStorageProvider", () => {
    let baseDirectory: string;
    let fs: (typeof import("node:fs"))["promises"];
    let os: typeof import("node:os");
    let path: typeof import("node:path");
    let FilesystemCloudStorageProvider: (typeof import("../../../services/cloud/providers/FilesystemCloudStorageProvider"))["FilesystemCloudStorageProvider"];
    let CloudProviderOperationError: (typeof import("../../../services/cloud/providers/cloudProviderErrors"))["CloudProviderOperationError"];

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
        const errorModule =
            await import("../../../services/cloud/providers/cloudProviderErrors");

        fs = nodeFs.promises;
        os = nodeOs;
        path = nodePath;
        FilesystemCloudStorageProvider =
            providerModule.FilesystemCloudStorageProvider;
        CloudProviderOperationError = errorModule.CloudProviderOperationError;

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

        await expect(
            provider.downloadObject("sync/..foo/payload.txt")
        ).resolves.toEqual(Buffer.from("payload"));
    });

    it("normalizes object keys by trimming and stripping leading slashes", async () => {
        const provider = new FilesystemCloudStorageProvider({ baseDirectory });

        await provider.uploadObject({
            buffer: Buffer.from("payload"),
            key: "   /sync/trimmed/payload.txt   ",
            overwrite: true,
        });

        await expect(
            provider.downloadObject("sync/trimmed/payload.txt")
        ).resolves.toEqual(Buffer.from("payload"));

        // Normalization also applies on reads.
        await expect(
            provider.downloadObject("  /sync/trimmed/payload.txt ")
        ).resolves.toEqual(Buffer.from("payload"));
    });

    it("treats non-empty prefixes as directory prefixes", async () => {
        const provider = new FilesystemCloudStorageProvider({ baseDirectory });

        await provider.uploadObject({
            buffer: Buffer.from("a"),
            key: "sync/file.txt",
            overwrite: true,
        });

        await provider.uploadObject({
            buffer: Buffer.from("b"),
            key: "syncX/file.txt",
            overwrite: true,
        });

        const entries = await provider.listObjects("sync");
        expect(entries.map((entry) => entry.key)).toEqual(["sync/file.txt"]);
    });

    it("ignores filesystem entries that are not canonical cloud keys", async () => {
        const provider = new FilesystemCloudStorageProvider({ baseDirectory });

        // Create a file whose name would be changed by normalization.
        // On most filesystems this is valid, but it should not be treated as a
        // different canonical key.
        await provider.uploadObject({
            buffer: Buffer.from("a"),
            key: "sync/canonical.txt",
            overwrite: true,
        });

        const nodeFs = await import("node:fs");
        const nodePath = await import("node:path");
        const appRoot = nodePath.resolve(baseDirectory, "uptime-watcher");
        await nodeFs.promises.mkdir(nodePath.join(appRoot, "sync"), {
            recursive: true,
        });
        await nodeFs.promises.writeFile(
            nodePath.join(appRoot, "sync", "noncanonical.txt "),
            Buffer.from("b")
        );

        const entries = await provider.listObjects("sync");
        expect(entries.map((entry) => entry.key)).toEqual([
            "sync/canonical.txt",
        ]);
    });

    it("throws a typed ENOENT error when downloading a missing object", async () => {
        const provider = new FilesystemCloudStorageProvider({ baseDirectory });

        try {
            await provider.downloadObject("sync/missing.txt");
            throw new Error("Expected downloadObject to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(CloudProviderOperationError);

            const typed = error as InstanceType<
                typeof CloudProviderOperationError
            >;
            expect(typed.code).toBe("ENOENT");
            expect(typed.operation).toBe("downloadObject");
            expect(typed.providerKind).toBe("filesystem");
            expect(typed.target).toBe("sync/missing.txt");
        }
    });

    it("throws a typed EEXIST error when overwrite is false and object exists", async () => {
        const provider = new FilesystemCloudStorageProvider({ baseDirectory });

        await provider.uploadObject({
            buffer: Buffer.from("payload"),
            key: "sync/existing.txt",
            overwrite: true,
        });

        try {
            await provider.uploadObject({
                buffer: Buffer.from("next"),
                key: "sync/existing.txt",
                overwrite: false,
            });
            throw new Error("Expected uploadObject to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(CloudProviderOperationError);

            const typed = error as InstanceType<
                typeof CloudProviderOperationError
            >;
            expect(typed.code).toBe("EEXIST");
            expect(typed.operation).toBe("uploadObject");
            expect(typed.providerKind).toBe("filesystem");
            expect(typed.target).toBe("sync/existing.txt");
        }
    });

    it("rejects non-file upload targets without leaving temp files", async () => {
        const provider = new FilesystemCloudStorageProvider({ baseDirectory });
        const appRoot = path.resolve(baseDirectory, "uptime-watcher");
        const syncDirectory = path.join(appRoot, "sync");
        const collidingDirectory = path.join(syncDirectory, "directory.txt");

        await fs.mkdir(collidingDirectory, { recursive: true });
        await fs.writeFile(path.join(collidingDirectory, "kept.txt"), "kept");

        await expect(
            provider.uploadObject({
                buffer: Buffer.from("payload"),
                key: "sync/directory.txt",
                overwrite: true,
            })
        ).rejects.toThrow(CloudProviderOperationError);

        await expect(
            fs.readFile(path.join(collidingDirectory, "kept.txt"), "utf8")
        ).resolves.toBe("kept");

        const syncEntries = await fs.readdir(syncDirectory);
        expect(syncEntries.filter((entry) => entry.includes(".tmp-"))).toEqual(
            []
        );
    });

    it("refuses to use the app root after it is replaced with a symlink", async () => {
        const provider = new FilesystemCloudStorageProvider({ baseDirectory });
        await provider.uploadObject({
            buffer: Buffer.from("initial"),
            key: "sync/initial.txt",
            overwrite: true,
        });

        const appRoot = path.resolve(baseDirectory, "uptime-watcher");
        const outsideDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uw-cloud-outside-")
        );

        await fs.rm(appRoot, { force: true, recursive: true });

        const symlinkType = process.platform === "win32" ? "junction" : "dir";
        try {
            await fs.symlink(outsideDirectory, appRoot, symlinkType);
        } catch (error: unknown) {
            const code =
                typeof error === "object" && error !== null && "code" in error
                    ? String(error.code)
                    : "";

            await fs.rm(outsideDirectory, { force: true, recursive: true });

            if (code === "EPERM" || code === "EACCES") {
                return;
            }

            throw error;
        }

        try {
            await expect(
                provider.uploadObject({
                    buffer: Buffer.from("escape"),
                    key: "sync/escape.txt",
                    overwrite: true,
                })
            ).rejects.toThrow(CloudProviderOperationError);

            await expect(
                fs.access(path.join(outsideDirectory, "sync", "escape.txt"))
            ).rejects.toThrow();
        } finally {
            await fs.rm(appRoot, { force: true, recursive: true });
            await fs.rm(outsideDirectory, { force: true, recursive: true });
        }
    });

    it("rechecks directories created by a concurrent EEXIST race", async () => {
        const appRoot = path.resolve(baseDirectory, "uptime-watcher");
        const outsideDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uw-cloud-race-outside-")
        );
        const racedDirectory = path.join(appRoot, "race");
        const probeLink = path.join(appRoot, "probe-link");
        const symlinkType = process.platform === "win32" ? "junction" : "dir";

        await fs.mkdir(appRoot, { recursive: true });
        try {
            await fs.symlink(outsideDirectory, probeLink, symlinkType);
            await fs.rm(probeLink, { force: true, recursive: true });
        } catch (error: unknown) {
            const code =
                typeof error === "object" && error !== null && "code" in error
                    ? String(error.code)
                    : "";

            await fs.rm(outsideDirectory, { force: true, recursive: true });

            if (code === "EPERM" || code === "EACCES") {
                return;
            }

            throw error;
        }

        const actualFsPromises =
            await vi.importActual<typeof import("node:fs/promises")>(
                "node:fs/promises"
            );

        vi.resetModules();
        vi.doMock("fs", async () => vi.importActual("fs"));
        vi.doMock("node:fs", async () => vi.importActual("node:fs"));
        vi.doMock("path", async () => vi.importActual("path"));
        vi.doMock("node:path", async () => vi.importActual("node:path"));
        vi.doMock("node:fs/promises", () => ({
            ...actualFsPromises,
            mkdir: vi.fn(
                async (...args: Parameters<typeof actualFsPromises.mkdir>) => {
                    const [target] = args;
                    if (path.resolve(String(target)) === racedDirectory) {
                        await fs.symlink(
                            outsideDirectory,
                            racedDirectory,
                            symlinkType
                        );
                        const error = new Error("Directory already exists");
                        Object.defineProperty(error, "code", {
                            configurable: true,
                            value: "EEXIST",
                        });
                        throw error;
                    }

                    return actualFsPromises.mkdir(...args);
                }
            ),
        }));

        const providerModule =
            await import("../../../services/cloud/providers/FilesystemCloudStorageProvider");
        const errorModule =
            await import("../../../services/cloud/providers/cloudProviderErrors");
        const provider = new providerModule.FilesystemCloudStorageProvider({
            baseDirectory,
        });

        try {
            await expect(
                provider.uploadObject({
                    buffer: Buffer.from("escape"),
                    key: "race/escape.txt",
                    overwrite: true,
                })
            ).rejects.toThrow(errorModule.CloudProviderOperationError);

            await expect(
                fs.access(path.join(outsideDirectory, "escape.txt"))
            ).rejects.toThrow();
        } finally {
            vi.doUnmock("node:fs/promises");
            await fs.rm(racedDirectory, { force: true, recursive: true });
            await fs.rm(outsideDirectory, { force: true, recursive: true });
        }
    });
});
