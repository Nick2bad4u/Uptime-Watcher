import {
    mkdtemp,
    mkdir,
    readFile,
    rm,
    symlink,
    writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseService } from "../../../../services/database/DatabaseService";

import { replaceDatabaseFile } from "../../../../services/database/dataBackupService/replaceDatabaseFile";
import * as fsSafeOps from "../../../../utils/fsSafeOps";

type DatabaseConnection = ReturnType<DatabaseService["initialize"]>;

function createMockDatabaseConnection(): DatabaseConnection {
    return {} as DatabaseConnection;
}

function createDatabaseService(): DatabaseService {
    const databaseService: Pick<DatabaseService, "close" | "initialize"> = {
        close: vi.fn(),
        initialize: vi.fn<DatabaseService["initialize"]>(
            createMockDatabaseConnection
        ),
    };

    return databaseService as unknown as DatabaseService;
}

describe(replaceDatabaseFile, () => {
    let tempDirectory = "";

    beforeEach(async () => {
        tempDirectory = await mkdtemp(
            path.join(tmpdir(), "uw-replace-database-file-")
        );
    });

    afterEach(async () => {
        vi.restoreAllMocks();
        await rm(tempDirectory, { force: true, recursive: true });
    });

    it("replaces the target database and reinitializes the database service", async () => {
        const sourcePath = path.join(tempDirectory, "incoming.sqlite");
        const targetPath = path.join(tempDirectory, "uptime-watcher.sqlite");
        const databaseService = createDatabaseService();

        await writeFile(sourcePath, "new-db");
        await writeFile(targetPath, "old-db");

        await replaceDatabaseFile({
            databaseService,
            sourcePath,
            targetPath,
        });

        await expect(readFile(targetPath, "utf8")).resolves.toBe("new-db");
        expect(databaseService.close).toHaveBeenCalledTimes(1);
        expect(databaseService.initialize).toHaveBeenCalledTimes(1);
    });

    it("places the incoming database when no target database exists", async () => {
        const sourcePath = path.join(tempDirectory, "incoming.sqlite");
        const targetPath = path.join(tempDirectory, "uptime-watcher.sqlite");
        const databaseService = createDatabaseService();

        await writeFile(sourcePath, "new-db");

        await replaceDatabaseFile({
            databaseService,
            sourcePath,
            targetPath,
        });

        await expect(readFile(targetPath, "utf8")).resolves.toBe("new-db");
        expect(databaseService.close).toHaveBeenCalledTimes(1);
        expect(databaseService.initialize).toHaveBeenCalledTimes(1);
    });

    it("does not clobber stale timestamp-named staging files", async () => {
        const sourcePath = path.join(tempDirectory, "incoming.sqlite");
        const targetPath = path.join(tempDirectory, "uptime-watcher.sqlite");
        const staleIncomingPath = path.join(
            tempDirectory,
            "uptime-watcher.sqlite.incoming-123"
        );
        const databaseService = createDatabaseService();

        await writeFile(sourcePath, "new-db");
        await writeFile(targetPath, "old-db");
        await writeFile(staleIncomingPath, "stale-incoming");

        vi.spyOn(Date, "now").mockReturnValue(123);

        await replaceDatabaseFile({
            databaseService,
            sourcePath,
            targetPath,
        });

        await expect(readFile(targetPath, "utf8")).resolves.toBe("new-db");
        await expect(readFile(staleIncomingPath, "utf8")).resolves.toBe(
            "stale-incoming"
        );
    });

    it("does not copy staged database bytes through an incoming symlink", async () => {
        const operationId = "00000000-0000-4000-8000-000000000000";
        const sourcePath = path.join(tempDirectory, "incoming.sqlite");
        const targetPath = path.join(tempDirectory, "uptime-watcher.sqlite");
        const incomingPath = path.join(
            tempDirectory,
            `uptime-watcher.sqlite.incoming-${operationId}`
        );
        const outsidePath = path.join(tempDirectory, "outside.sqlite");
        const databaseService = createDatabaseService();

        await writeFile(sourcePath, "new-db");
        await writeFile(targetPath, "old-db");
        await writeFile(outsidePath, "outside-db");

        try {
            await symlink(outsidePath, incomingPath);
        } catch (error: unknown) {
            const errorCode = (error as NodeJS.ErrnoException).code;
            if (errorCode === "EPERM" || errorCode === "EACCES") {
                return;
            }

            throw error;
        }

        vi.resetModules();
        vi.doMock("node:crypto", async () => {
            const actual =
                await vi.importActual<typeof import("node:crypto")>(
                    "node:crypto"
                );
            return {
                ...actual,
                randomUUID: () => operationId,
            };
        });

        const { replaceDatabaseFile: replaceWithMockedUuid } =
            await import("../../../../services/database/dataBackupService/replaceDatabaseFile");

        try {
            await expect(
                replaceWithMockedUuid({
                    databaseService,
                    sourcePath,
                    targetPath,
                })
            ).rejects.toThrow();

            await expect(readFile(targetPath, "utf8")).resolves.toBe("old-db");
            await expect(readFile(outsidePath, "utf8")).resolves.toBe(
                "outside-db"
            );
            expect(databaseService.close).toHaveBeenCalledTimes(1);
            expect(databaseService.initialize).toHaveBeenCalledTimes(1);
        } finally {
            vi.doUnmock("node:crypto");
        }
    });

    it("restores the original database when reinitialization fails", async () => {
        const sourcePath = path.join(tempDirectory, "incoming.sqlite");
        const targetPath = path.join(tempDirectory, "uptime-watcher.sqlite");
        const initializeError = new Error("initialize failed");
        const databaseService = createDatabaseService();

        vi.mocked(databaseService.initialize)
            .mockImplementationOnce(() => {
                throw initializeError;
            })
            .mockImplementationOnce(createMockDatabaseConnection);

        await writeFile(sourcePath, "new-db");
        await writeFile(targetPath, "old-db");

        await expect(
            replaceDatabaseFile({
                databaseService,
                sourcePath,
                targetPath,
            })
        ).rejects.toThrow(initializeError);

        await expect(readFile(targetPath, "utf8")).resolves.toBe("old-db");
        expect(databaseService.close).toHaveBeenCalledTimes(1);
        expect(databaseService.initialize).toHaveBeenCalledTimes(2);
    });

    it("restores relocated sidecars when replacement fails before the main database moves", async () => {
        const sourcePath = path.join(tempDirectory, "incoming.sqlite");
        const targetPath = path.join(tempDirectory, "uptime-watcher.sqlite");
        const walPath = `${targetPath}-wal`;
        const shmPath = `${targetPath}-shm`;
        const databaseService = createDatabaseService();
        const originalRenameIfExists = fsSafeOps.renameIfExists;

        await writeFile(sourcePath, "new-db");
        await writeFile(targetPath, "old-db");
        await writeFile(walPath, "old-wal");
        await writeFile(shmPath, "old-shm");

        vi.spyOn(fsSafeOps, "renameIfExists").mockImplementation(
            async (from, to) => {
                if (from === shmPath) {
                    throw new Error("sidecar move failed");
                }

                return await originalRenameIfExists(from, to);
            }
        );

        await expect(
            replaceDatabaseFile({
                databaseService,
                sourcePath,
                targetPath,
            })
        ).rejects.toThrow("sidecar move failed");

        await expect(readFile(targetPath, "utf8")).resolves.toBe("old-db");
        await expect(readFile(walPath, "utf8")).resolves.toBe("old-wal");
        await expect(readFile(shmPath, "utf8")).resolves.toBe("old-shm");
    });

    it("refuses to replace an existing target directory", async () => {
        const sourcePath = path.join(tempDirectory, "incoming.sqlite");
        const targetPath = path.join(tempDirectory, "uptime-watcher.sqlite");
        const databaseService = createDatabaseService();

        await writeFile(sourcePath, "new-db");
        await mkdir(targetPath);
        await writeFile(path.join(targetPath, "kept.txt"), "old-db");

        await expect(
            replaceDatabaseFile({
                databaseService,
                sourcePath,
                targetPath,
            })
        ).rejects.toThrow("Refusing to replace database with non-file target");

        await expect(
            readFile(path.join(targetPath, "kept.txt"), "utf8")
        ).resolves.toBe("old-db");
        expect(databaseService.close).not.toHaveBeenCalled();
        expect(databaseService.initialize).not.toHaveBeenCalled();
    });

    it("refuses to replace an existing symlink target", async () => {
        const sourcePath = path.join(tempDirectory, "incoming.sqlite");
        const outsidePath = path.join(tempDirectory, "outside.sqlite");
        const targetPath = path.join(tempDirectory, "uptime-watcher.sqlite");
        const databaseService = createDatabaseService();

        await writeFile(sourcePath, "new-db");
        await writeFile(outsidePath, "outside-db");

        try {
            await symlink(outsidePath, targetPath);
        } catch (error: unknown) {
            const errorCode = (error as NodeJS.ErrnoException).code;
            if (errorCode === "EPERM" || errorCode === "EACCES") {
                return;
            }

            throw error;
        }

        await expect(
            replaceDatabaseFile({
                databaseService,
                sourcePath,
                targetPath,
            })
        ).rejects.toThrow("Refusing to replace database with non-file target");

        await expect(readFile(outsidePath, "utf8")).resolves.toBe("outside-db");
        expect(databaseService.close).not.toHaveBeenCalled();
        expect(databaseService.initialize).not.toHaveBeenCalled();
    });

    it("refuses to relocate non-file sidecars", async () => {
        const sourcePath = path.join(tempDirectory, "incoming.sqlite");
        const targetPath = path.join(tempDirectory, "uptime-watcher.sqlite");
        const walPath = `${targetPath}-wal`;
        const databaseService = createDatabaseService();

        await writeFile(sourcePath, "new-db");
        await writeFile(targetPath, "old-db");
        await mkdir(walPath);
        await writeFile(path.join(walPath, "kept.txt"), "wal-data");

        await expect(
            replaceDatabaseFile({
                databaseService,
                sourcePath,
                targetPath,
            })
        ).rejects.toThrow("Refusing to replace database with non-file WAL");

        await expect(readFile(targetPath, "utf8")).resolves.toBe("old-db");
        await expect(
            readFile(path.join(walPath, "kept.txt"), "utf8")
        ).resolves.toBe("wal-data");
        expect(databaseService.close).not.toHaveBeenCalled();
        expect(databaseService.initialize).not.toHaveBeenCalled();
    });
});
