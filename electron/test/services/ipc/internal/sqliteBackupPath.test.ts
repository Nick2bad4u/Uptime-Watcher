import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
    buildPlaywrightBackupPath,
    ensureSqliteFileExtension,
} from "../../../../services/ipc/internal/sqliteBackupPath";

describe("sqliteBackupPath", () => {
    describe(buildPlaywrightBackupPath, () => {
        it("builds automation backup paths under the playwright backup directory", () => {
            expect(
                buildPlaywrightBackupPath({
                    baseDirectory: path.join("tmp", "uptime-watcher"),
                    fileName: "backup",
                })
            ).toBe(
                path.join(
                    "tmp",
                    "uptime-watcher",
                    "playwright-backups",
                    "backup.sqlite"
                )
            );
        });

        it("preserves explicit SQLite-compatible filename extensions", () => {
            expect(
                buildPlaywrightBackupPath({
                    baseDirectory: path.join("tmp", "uptime-watcher"),
                    fileName: "backup.db",
                })
            ).toBe(
                path.join(
                    "tmp",
                    "uptime-watcher",
                    "playwright-backups",
                    "backup.db"
                )
            );
        });

        it("trims incidental filename whitespace before building the path", () => {
            expect(
                buildPlaywrightBackupPath({
                    baseDirectory: path.join("tmp", "uptime-watcher"),
                    fileName: " backup ",
                })
            ).toBe(
                path.join(
                    "tmp",
                    "uptime-watcher",
                    "playwright-backups",
                    "backup.sqlite"
                )
            );
        });

        it.each([
            "",
            ".",
            "..",
            "../backup",
            String.raw`..\backup`,
            "/tmp/backup",
            String.raw`C:\tmp\backup`,
            "C:backup",
            "backup\0sqlite",
        ])("rejects path-like backup file names: %s", (fileName) => {
            expect(() =>
                buildPlaywrightBackupPath({
                    baseDirectory: path.join("tmp", "uptime-watcher"),
                    fileName,
                })
            ).toThrow("SQLite backup fileName must be a plain file name");
        });
    });

    describe(ensureSqliteFileExtension, () => {
        it("adds .sqlite when a path does not already have an extension", () => {
            expect(ensureSqliteFileExtension("backup")).toBe("backup.sqlite");
        });

        it("keeps existing extensions unchanged", () => {
            expect(ensureSqliteFileExtension("backup.db")).toBe("backup.db");
            expect(ensureSqliteFileExtension("backup.SQLITE")).toBe(
                "backup.SQLITE"
            );
        });

        it("appends .sqlite when a path has a non-SQLite extension", () => {
            expect(ensureSqliteFileExtension("backup.txt")).toBe(
                "backup.txt.sqlite"
            );
        });
    });
});
