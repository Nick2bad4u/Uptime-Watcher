import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseService } from "../../../../services/database/DatabaseService";

import { replaceDatabaseFile } from "../../../../services/database/dataBackupService/replaceDatabaseFile";

function createDatabaseService(): DatabaseService {
    return {
        close: vi.fn(),
        initialize: vi.fn(),
    } as DatabaseService;
}

describe(replaceDatabaseFile, () => {
    let tempDirectory = "";

    beforeEach(async () => {
        tempDirectory = await mkdtemp(
            path.join(tmpdir(), "uw-replace-database-file-")
        );
    });

    afterEach(async () => {
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

    it("restores the original database when reinitialization fails", async () => {
        const sourcePath = path.join(tempDirectory, "incoming.sqlite");
        const targetPath = path.join(tempDirectory, "uptime-watcher.sqlite");
        const initializeError = new Error("initialize failed");
        const databaseService = createDatabaseService();

        vi.mocked(databaseService.initialize)
            .mockImplementationOnce(() => {
                throw initializeError;
            })
            .mockImplementationOnce(() => {});

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
});
