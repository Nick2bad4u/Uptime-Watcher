import {
    mkdtemp,
    readFile,
    rm,
    symlink,
    mkdir,
    writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { writeFileWithinDirectory } from "../../../../services/database/dataBackupService/writeFileWithinDirectory";

describe(writeFileWithinDirectory, () => {
    let tempDirectory = "";

    beforeEach(async () => {
        tempDirectory = await mkdtemp(
            path.join(tmpdir(), "uw-write-file-within-directory-")
        );
    });

    afterEach(async () => {
        await rm(tempDirectory, { force: true, recursive: true });
    });

    it("writes a new file within the requested directory", async () => {
        const filePath = await writeFileWithinDirectory({
            baseDirectory: tempDirectory,
            contents: "backup",
            fileName: "backup.sqlite",
        });

        expect(filePath).toBe(path.join(tempDirectory, "backup.sqlite"));
        await expect(readFile(filePath, "utf8")).resolves.toBe("backup");
    });

    it("atomically replaces an existing regular file", async () => {
        const filePath = path.join(tempDirectory, "backup.sqlite");
        await writeFile(filePath, "old");

        await writeFileWithinDirectory({
            baseDirectory: tempDirectory,
            contents: "new",
            fileName: "backup.sqlite",
        });

        await expect(readFile(filePath, "utf8")).resolves.toBe("new");
    });

    it("refuses to replace an existing directory", async () => {
        const directoryPath = path.join(tempDirectory, "backup.sqlite");
        await mkdir(directoryPath);
        await writeFile(path.join(directoryPath, "kept.txt"), "kept");

        await expect(
            writeFileWithinDirectory({
                baseDirectory: tempDirectory,
                contents: "new",
                fileName: "backup.sqlite",
            })
        ).rejects.toThrow("Refusing to overwrite non-file backup target");

        await expect(
            readFile(path.join(directoryPath, "kept.txt"), "utf8")
        ).resolves.toBe("kept");
    });

    it("refuses to replace an existing symlink", async () => {
        const outsideFilePath = path.join(tempDirectory, "outside.sqlite");
        const symlinkPath = path.join(tempDirectory, "backup.sqlite");
        await writeFile(outsideFilePath, "outside");

        try {
            await symlink(outsideFilePath, symlinkPath);
        } catch (error) {
            const errorCode = (error as NodeJS.ErrnoException).code;
            if (errorCode === "EPERM" || errorCode === "EACCES") {
                return;
            }

            throw error;
        }

        await expect(
            writeFileWithinDirectory({
                baseDirectory: tempDirectory,
                contents: "new",
                fileName: "backup.sqlite",
            })
        ).rejects.toThrow("Refusing to overwrite non-file backup target");

        await expect(readFile(outsideFilePath, "utf8")).resolves.toBe(
            "outside"
        );
    });
});
