import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
    cleanupDatabaseLockArtifacts,
    generateLockArtifactCandidates,
    listExistingLockArtifacts,
} from "../../../../services/database/utils/databaseLockRecovery";
import { mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

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

    it("should generate a comprehensive list of lock artifact candidates", () => {
        const candidates = generateLockArtifactCandidates(dbPath);

        expect(candidates).toEqual(
            expect.arrayContaining([
                `${dbPath}-wal`,
                `${dbPath}-shm`,
                `${dbPath}-journal`,
                `${dbPath}.lock`,
            ])
        );
    });

    it("should list only existing lock artifacts", () => {
        const walPath = `${dbPath}-wal`;
        writeFileSync(walPath, "wal");

        const artifacts = listExistingLockArtifacts(dbPath);

        expect(artifacts).toContain(walPath);
        expect(artifacts).not.toContain(`${dbPath}-shm`);
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
            expect(
                relocatedPath.startsWith(
                    path.join(tempDir, "stale-lock-artifacts")
                )
            ).toBeTruthy();
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
});
