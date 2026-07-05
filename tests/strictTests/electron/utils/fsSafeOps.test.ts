import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockFileHandle {
    readonly close: ReturnType<typeof vi.fn>;
    readonly sync: ReturnType<typeof vi.fn>;
}

const renameMock =
    vi.fn<(sourcePath: string, targetPath: string) => Promise<void>>();

const rmMock =
    vi.fn<(filePath: string, options: { force: true }) => Promise<void>>();

const lstatMock =
    vi.fn<(filePath: string) => Promise<{ isFile: () => boolean }>>();

const mkdirMock =
    vi.fn<
        (directoryPath: string, options: { recursive: true }) => Promise<void>
    >();

const openMock =
    vi.fn<(filePath: string, flags: string) => Promise<MockFileHandle>>();

const realpathMock = vi.fn<(directoryPath: string) => Promise<string>>();

const statMock =
    vi.fn<(directoryPath: string) => Promise<{ isDirectory: () => boolean }>>();

vi.mock("node:fs/promises", () => ({
    lstat: lstatMock,
    mkdir: mkdirMock,
    open: openMock,
    realpath: realpathMock,
    rename: renameMock,
    rm: rmMock,
    stat: statMock,
}));

describe("fsSafeOps (strict coverage)", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it("ensureDirectoryAndResolveRealPath creates the directory and returns its canonical path", async () => {
        const { ensureDirectoryAndResolveRealPath } =
            await import("../../../../electron/utils/fsSafeOps");

        mkdirMock.mockResolvedValueOnce(undefined);
        statMock.mockResolvedValueOnce({ isDirectory: () => true });
        realpathMock.mockResolvedValueOnce("/tmp/canonical");

        await expect(
            ensureDirectoryAndResolveRealPath({
                directoryPath: "/tmp/input",
                notDirectoryMessage: "not a directory",
            })
        ).resolves.toBe("/tmp/canonical");
        expect(mkdirMock).toHaveBeenCalledWith("/tmp/input", {
            recursive: true,
        });
        expect(statMock).toHaveBeenCalledWith("/tmp/input");
        expect(realpathMock).toHaveBeenCalledWith("/tmp/input");
    });

    it("ensureDirectoryAndResolveRealPath rejects non-directory paths", async () => {
        const { ensureDirectoryAndResolveRealPath } =
            await import("../../../../electron/utils/fsSafeOps");

        mkdirMock.mockResolvedValueOnce(undefined);
        statMock.mockResolvedValueOnce({ isDirectory: () => false });

        await expect(
            ensureDirectoryAndResolveRealPath({
                directoryPath: "/tmp/file",
                notDirectoryMessage: "not a directory",
            })
        ).rejects.toThrow("not a directory");
        expect(realpathMock).not.toHaveBeenCalled();
    });

    it("lstatIfExists returns entry metadata when the path exists", async () => {
        const { lstatIfExists } =
            await import("../../../../electron/utils/fsSafeOps");
        const stats = { isFile: () => true };

        lstatMock.mockResolvedValueOnce(stats);

        await expect(lstatIfExists("/tmp/file")).resolves.toBe(stats);
        expect(lstatMock).toHaveBeenCalledWith("/tmp/file");
    });

    it("lstatIfExists treats missing paths as null", async () => {
        const { lstatIfExists } =
            await import("../../../../electron/utils/fsSafeOps");

        lstatMock.mockRejectedValueOnce(
            Object.assign(new Error("missing"), { code: "ENOENT" })
        );

        await expect(lstatIfExists("/tmp/missing")).resolves.toBeNull();
    });

    it("lstatIfExists rethrows non-ENOENT errors", async () => {
        const { lstatIfExists } =
            await import("../../../../electron/utils/fsSafeOps");

        lstatMock.mockRejectedValueOnce(
            Object.assign(new Error("permission"), { code: "EACCES" })
        );

        await expect(lstatIfExists("/tmp/file")).rejects.toThrow("permission");
    });

    it("renameIfExists returns true after renaming an existing source", async () => {
        const { renameIfExists } =
            await import("../../../../electron/utils/fsSafeOps");

        renameMock.mockResolvedValueOnce();

        await expect(
            renameIfExists("/tmp/a", "/tmp/b")
        ).resolves.toBe(true);
        expect(renameMock).toHaveBeenCalledTimes(1);
        expect(renameMock).toHaveBeenCalledWith("/tmp/a", "/tmp/b");
    });

    it("renameIfExists returns false when the source is missing", async () => {
        const { renameIfExists } =
            await import("../../../../electron/utils/fsSafeOps");

        renameMock.mockRejectedValueOnce(
            Object.assign(new Error("missing"), { code: "ENOENT" })
        );

        await expect(
            renameIfExists("/tmp/a", "/tmp/b")
        ).resolves.toBe(false);
    });

    it("renameIfExists rethrows non-ENOENT errors", async () => {
        const { renameIfExists } =
            await import("../../../../electron/utils/fsSafeOps");

        renameMock.mockRejectedValueOnce(
            Object.assign(new Error("permission"), { code: "EACCES" })
        );

        await expect(renameIfExists("/tmp/a", "/tmp/b")).rejects.toBeInstanceOf(
            Error
        );
    });

    it("removePathBestEffort removes a path with force enabled", async () => {
        const { removePathBestEffort } =
            await import("../../../../electron/utils/fsSafeOps");

        rmMock.mockResolvedValueOnce(undefined);

        await expect(
            removePathBestEffort("/tmp/cleanup")
        ).resolves.toBeUndefined();
        expect(rmMock).toHaveBeenCalledWith("/tmp/cleanup", { force: true });
    });

    it("removePathBestEffort swallows removal failures", async () => {
        const { removePathBestEffort } =
            await import("../../../../electron/utils/fsSafeOps");

        rmMock.mockRejectedValueOnce(new Error("remove failed"));

        await expect(
            removePathBestEffort("/tmp/cleanup")
        ).resolves.toBeUndefined();
    });

    it("syncFileSafely syncs and closes on success", async () => {
        const { syncFileSafely } =
            await import("../../../../electron/utils/fsSafeOps");

        const handle: MockFileHandle = {
            close: vi.fn().mockResolvedValueOnce(undefined),
            sync: vi.fn().mockResolvedValueOnce(undefined),
        };

        openMock.mockResolvedValueOnce(handle);

        await expect(syncFileSafely("/tmp/file")).resolves.toBeUndefined();
        expect(openMock).toHaveBeenCalledWith("/tmp/file", "r");
        expect(handle.sync).toHaveBeenCalledTimes(1);
        expect(handle.close).toHaveBeenCalledTimes(1);
    });

    it("syncFileSafely closes even when sync fails (best-effort)", async () => {
        const { syncFileSafely } =
            await import("../../../../electron/utils/fsSafeOps");

        const handle: MockFileHandle = {
            close: vi.fn().mockResolvedValueOnce(undefined),
            sync: vi.fn().mockRejectedValueOnce(new Error("sync failed")),
        };

        openMock.mockResolvedValueOnce(handle);

        await expect(syncFileSafely("/tmp/file")).resolves.toBeUndefined();
        expect(handle.close).toHaveBeenCalledTimes(1);
    });

    it("syncFileSafely swallows open errors (best-effort)", async () => {
        const { syncFileSafely } =
            await import("../../../../electron/utils/fsSafeOps");

        openMock.mockRejectedValueOnce(new Error("open failed"));

        await expect(syncFileSafely("/tmp/file")).resolves.toBeUndefined();
    });

    it("syncDirectorySafely syncs and closes on success", async () => {
        const { syncDirectorySafely } =
            await import("../../../../electron/utils/fsSafeOps");

        const handle: MockFileHandle = {
            close: vi.fn().mockResolvedValueOnce(undefined),
            sync: vi.fn().mockResolvedValueOnce(undefined),
        };

        openMock.mockResolvedValueOnce(handle);

        await expect(syncDirectorySafely("/tmp/dir")).resolves.toBeUndefined();
        expect(openMock).toHaveBeenCalledWith("/tmp/dir", "r");
        expect(handle.sync).toHaveBeenCalledTimes(1);
        expect(handle.close).toHaveBeenCalledTimes(1);
    });

    it("syncDirectorySafely swallows failures (best-effort)", async () => {
        const { syncDirectorySafely } =
            await import("../../../../electron/utils/fsSafeOps");

        openMock.mockRejectedValueOnce(new Error("open failed"));

        await expect(syncDirectorySafely("/tmp/dir")).resolves.toBeUndefined();
    });
});
