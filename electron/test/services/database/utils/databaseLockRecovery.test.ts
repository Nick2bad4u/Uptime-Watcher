import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readdirSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from "node:fs";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    cleanupDatabaseLockArtifacts,
} from "../../../../services/database/utils/maintenance/databaseLockRecovery";

/**
 * Generates a unique temporary directory for each test.
 */
const createTempDirectory = (): string =>
    mkdtempSync(path.join(tmpdir(), "uw-lock-recovery-"));

describe("databaseLockRecovery utilities", () => {
    let tempDir: string;
    let dbPath: string;

    beforeEach(() => {
        tempDir = createTempDirectory();
        dbPath = path.join(tempDir, "uptime-watcher.sqlite");
        writeFileSync(dbPath, "");
    });

    afterEach(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });

    it("should report a comprehensive list of missing lock artifact candidates", () => {
        const result = cleanupDatabaseLockArtifacts(dbPath);

        expect(result.missing).toEqual(
            expect.arrayContaining([
                `${dbPath}-wal`,
                `${dbPath}-shm`,
                `${dbPath}-journal`,
                `${dbPath}.lock`,
            ])
        );
    });

    it("should relocate only existing lock artifacts", () => {
        const walPath = `${dbPath}-wal`;
        const shmPath = `${dbPath}-shm`;
        writeFileSync(walPath, "wal");

        const result = cleanupDatabaseLockArtifacts(dbPath);

        expect(result.failed).toHaveLength(0);
        expect(result.relocated).toEqual([
            expect.objectContaining({ originalPath: walPath }),
        ]);
        expect(result.missing).toContain(shmPath);
    });

    it("should relocate stale artifacts into the recovery directory", () => {
        const walPath = `${dbPath}-wal`;
        const shmPath = `${dbPath}-shm`;
        writeFileSync(walPath, "wal");
        writeFileSync(shmPath, "shm");

        const result = cleanupDatabaseLockArtifacts(dbPath);

        expect(result.failed).toHaveLength(0);
        expect(result.relocated).toHaveLength(2);
        expect(result.missing).toEqual(
            expect.not.arrayContaining([walPath, shmPath])
        );

        for (const { relocatedPath } of result.relocated) {
            const relativeRelocatedPath = path.relative(
                path.join(tempDir, "stale-lock-artifacts"),
                relocatedPath
            );
            expect(relativeRelocatedPath).not.toBe("..");
            expect(
                relativeRelocatedPath.startsWith(`..${path.sep}`)
            ).toBeFalsy();
            expect(path.isAbsolute(relativeRelocatedPath)).toBeFalsy();
            expect(existsSync(relocatedPath)).toBeTruthy();
        }

        expect(existsSync(walPath)).toBeFalsy();
        expect(existsSync(shmPath)).toBeFalsy();
    });

    it("should report missing artifacts when none exist", () => {
        const result = cleanupDatabaseLockArtifacts(dbPath);

        expect(result.relocated).toHaveLength(0);
        expect(result.failed).toHaveLength(0);
        expect(
            result.missing.some((candidate) => candidate.endsWith("-wal"))
        ).toBeTruthy();
    });

    it("should surface failures encountered during relocation", () => {
        const walPath = `${dbPath}-wal`;
        writeFileSync(walPath, "wal");

        const renameSpy = vi.spyOn(fs, "renameSync").mockImplementation(() => {
            throw new Error("permission denied");
        });

        const result = cleanupDatabaseLockArtifacts(dbPath);

        expect(result.failed).toHaveLength(1);
        expect(result.failed[0]?.path).toBe(walPath);
        expect(result.relocated).toHaveLength(0);
        expect(existsSync(walPath)).toBeTruthy();

        renameSpy.mockRestore();
    });

    it("should refuse to relocate artifacts through a symlinked recovery directory", () => {
        const walPath = `${dbPath}-wal`;
        writeFileSync(walPath, "wal");

        const outsideDirectory = path.join(tempDir, "outside");
        mkdirSync(outsideDirectory);

        const recoveryDirectory = path.join(tempDir, "stale-lock-artifacts");
        const symlinkType = process.platform === "win32" ? "junction" : "dir";
        symlinkSync(outsideDirectory, recoveryDirectory, symlinkType);

        const result = cleanupDatabaseLockArtifacts(dbPath);

        expect(result.relocated).toHaveLength(0);
        expect(result.failed).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: walPath,
                    reason: expect.stringMatching(/symlink/iv),
                }),
            ])
        );
        expect(existsSync(walPath)).toBeTruthy();
        expect(readdirSync(outsideDirectory)).toEqual([]);
    });
});
