import type { Logger } from "@shared/utils/logger/interfaces";

import { ensureError } from "@shared/utils/errorHandling";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import type { DatabaseService } from "../DatabaseService";

import {
    renameIfExists,
    syncDirectorySafely,
    syncFileSafely,
} from "../../../utils/fsSafeOps";

/**
 * Replaces the primary database file with another file on disk.
 *
 * @remarks
 * This safely closes the database before swapping files, handles
 * WAL/SHM/journal sidecar relocation, and attempts rollback on failure.
 */
export async function replaceDatabaseFile(args: {
    readonly databaseService: DatabaseService;
    readonly logger?: Logger;
    readonly sourcePath: string;
    readonly targetPath: string;
}): Promise<void> {
    const { databaseService, logger, sourcePath, targetPath } = args;

    databaseService.close();

    const targetDir = path.dirname(targetPath);
    const baseName = path.basename(targetPath);
    const operationId = randomUUID();
    const rollbackPath = path.join(
        targetDir,
        `${baseName}.rollback-${operationId}`
    );
    const rollbackWalPath = `${rollbackPath}-wal`;
    const rollbackShmPath = `${rollbackPath}-shm`;
    const rollbackJournalPath = `${rollbackPath}-journal`;
    const incomingPath = path.join(
        targetDir,
        `${baseName}.incoming-${operationId}`
    );

    const walPath = `${targetPath}-wal`;
    const shmPath = `${targetPath}-shm`;
    const journalPath = `${targetPath}-journal`;

    let isHadExistingTarget = false;
    let copyError: Error | undefined;

    try {
        // Stage the incoming DB first to reduce the time window where
        // `targetPath` is missing. This also ensures we never move the live
        // DB aside unless we have a fully-written replacement ready.

        await fs.copyFile(sourcePath, incomingPath);
        await syncFileSafely(incomingPath);

        // Move the existing DB out of the way (so rename into place is safe).
        // WAL/SHM sidecars must not follow the restored DB into place.
        // We relocate them alongside the main DB so rollback restores
        // the *exact* prior state and we avoid corrupting the restored
        // DB with a mismatched WAL.
        await renameIfExists(walPath, rollbackWalPath);
        await renameIfExists(shmPath, rollbackShmPath);
        await renameIfExists(journalPath, rollbackJournalPath);

        isHadExistingTarget = await renameIfExists(targetPath, rollbackPath);
        if (isHadExistingTarget) {
            await syncDirectorySafely(targetDir);
        }

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- incomingPath/targetPath are within app-controlled userData directory.
        await fs.rename(incomingPath, targetPath);
        await syncDirectorySafely(targetDir);
    } catch (error: unknown) {
        copyError = ensureError(error);
    }

    // If we failed to copy the restored DB into place but we moved the
    // original DB out of the way, restore the original before we
    // re-initialize.
    if (copyError && isHadExistingTarget) {
        try {
            await fs.rm(targetPath, { force: true });
            // eslint-disable-next-line security/detect-non-literal-fs-filename -- rollbackPath/targetPath are within app-controlled userData directory.
            await fs.rename(rollbackPath, targetPath);

            // Restore sidecars if we relocated them.
            await renameIfExists(rollbackWalPath, walPath);
            await renameIfExists(rollbackShmPath, shmPath);
            await renameIfExists(rollbackJournalPath, journalPath);
            isHadExistingTarget = false;
        } catch (rollbackError: unknown) {
            logger?.warn(
                "[DataBackupService] Failed to rollback database replacement after copy failure",
                ensureError(rollbackError),
                { targetPath }
            );
            // Best effort. We still surface the original copy error below.
        }
    }

    try {
        databaseService.initialize();
    } catch (error: unknown) {
        const initError = ensureError(error);

        // Attempt rollback if we replaced the file.
        if (isHadExistingTarget) {
            try {
                await fs.rm(targetPath, { force: true });
                // eslint-disable-next-line security/detect-non-literal-fs-filename -- rollbackPath/targetPath are within app-controlled userData directory.
                await fs.rename(rollbackPath, targetPath);

                await renameIfExists(rollbackWalPath, walPath);
                await renameIfExists(rollbackShmPath, shmPath);
                await renameIfExists(rollbackJournalPath, journalPath);
                databaseService.initialize();
            } catch (rollbackError: unknown) {
                logger?.warn(
                    "[DataBackupService] Failed to rollback database replacement after reinitialize failure",
                    ensureError(rollbackError),
                    { targetPath }
                );
                // If rollback fails, we still surface the init error below.
            }
        }

        if (copyError) {
            throw new Error(
                `Failed to restore database file (copy failed: ${copyError.message}; reinitialize failed: ${initError.message})`,
                { cause: error }
            );
        }

        throw initError;
    } finally {
        await fs.rm(incomingPath, { force: true }).catch(() => {});
        if (!copyError) {
            await fs.rm(rollbackPath, { force: true }).catch(() => {});
            await fs.rm(rollbackWalPath, { force: true }).catch(() => {});
            await fs.rm(rollbackShmPath, { force: true }).catch(() => {});
            await fs.rm(rollbackJournalPath, { force: true }).catch(() => {});
        }
    }

    if (copyError) {
        throw copyError;
    }
}
