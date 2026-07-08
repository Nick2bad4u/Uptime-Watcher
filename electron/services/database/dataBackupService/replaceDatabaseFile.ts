import type { Logger } from "@shared/utils/logger/interfaces";

import { ensureError } from "@shared/utils/errorHandling";
import { randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import type { DatabaseService } from "../DatabaseService";

import {
    lstatIfExists,
    renameIfExists,
    removePathBestEffort,
    syncDirectorySafely,
    syncFileSafely,
} from "../../../utils/fsSafeOps";

async function assertReplaceableFilePath(args: {
    filePath: string;
    label: string;
    required?: boolean;
}): Promise<void> {
    const stat = await lstatIfExists(args.filePath);

    if (!stat) {
        if (args.required === true) {
            throw new Error(
                `[DataBackupService] Missing database replacement ${args.label}: ${args.filePath}`
            );
        }

        return;
    }

    if (stat.isSymbolicLink() || !stat.isFile()) {
        throw new Error(
            `[DataBackupService] Refusing to replace database with non-file ${args.label}: ${args.filePath}`
        );
    }
}

async function restoreRelocatedSidecars(args: {
    isJournalRollbackCreated: boolean;
    isShmRollbackCreated: boolean;
    isWalRollbackCreated: boolean;
    journalPath: string;
    rollbackJournalPath: string;
    rollbackShmPath: string;
    rollbackWalPath: string;
    shmPath: string;
    walPath: string;
}): Promise<void> {
    if (args.isWalRollbackCreated) {
        await renameIfExists(args.rollbackWalPath, args.walPath);
    }

    if (args.isShmRollbackCreated) {
        await renameIfExists(args.rollbackShmPath, args.shmPath);
    }

    if (args.isJournalRollbackCreated) {
        await renameIfExists(args.rollbackJournalPath, args.journalPath);
    }
}

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

    await assertReplaceableFilePath({
        filePath: sourcePath,
        label: "source file",
        required: true,
    });
    await assertReplaceableFilePath({
        filePath: targetPath,
        label: "target file",
    });
    await assertReplaceableFilePath({
        filePath: walPath,
        label: "WAL sidecar",
    });
    await assertReplaceableFilePath({
        filePath: shmPath,
        label: "SHM sidecar",
    });
    await assertReplaceableFilePath({
        filePath: journalPath,
        label: "journal sidecar",
    });

    databaseService.close();

    let isHadExistingTarget = false;
    let isJournalRollbackCreated = false;
    let isShmRollbackCreated = false;
    let isTargetReplaced = false;
    let isWalRollbackCreated = false;
    let copyError: Error | undefined;

    try {
        // Stage the incoming DB first to reduce the time window where
        // `targetPath` is missing. This also ensures we never move the live
        // DB aside unless we have a fully-written replacement ready.

        await fs.copyFile(sourcePath, incomingPath, fsConstants.COPYFILE_EXCL);
        await syncFileSafely(incomingPath);

        // Move the existing DB out of the way (so rename into place is safe).
        // WAL/SHM sidecars must not follow the restored DB into place.
        // We relocate them alongside the main DB so rollback restores
        // the *exact* prior state and we avoid corrupting the restored
        // DB with a mismatched WAL.
        isWalRollbackCreated = await renameIfExists(walPath, rollbackWalPath);
        isShmRollbackCreated = await renameIfExists(shmPath, rollbackShmPath);
        isJournalRollbackCreated = await renameIfExists(
            journalPath,
            rollbackJournalPath
        );

        isHadExistingTarget = await renameIfExists(targetPath, rollbackPath);
        if (isHadExistingTarget) {
            await syncDirectorySafely(targetDir);
        }

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- incomingPath/targetPath are within app-controlled userData directory.
        await fs.rename(incomingPath, targetPath);
        isTargetReplaced = true;
        await syncDirectorySafely(targetDir);
    } catch (error: unknown) {
        copyError = ensureError(error);
    }

    // If replacement failed after moving the original DB or any sidecars out
    // of the way, restore them before re-initializing.
    if (copyError) {
        try {
            if (isHadExistingTarget) {
                await fs.rm(targetPath, { force: true });
                // eslint-disable-next-line security/detect-non-literal-fs-filename -- rollbackPath/targetPath are within app-controlled userData directory.
                await fs.rename(rollbackPath, targetPath);
                isHadExistingTarget = false;
            }

            await restoreRelocatedSidecars({
                isJournalRollbackCreated,
                isShmRollbackCreated,
                isWalRollbackCreated,
                journalPath,
                rollbackJournalPath,
                rollbackShmPath,
                rollbackWalPath,
                shmPath,
                walPath,
            });
            isWalRollbackCreated = false;
            isShmRollbackCreated = false;
            isJournalRollbackCreated = false;
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
                isTargetReplaced = true;
                isHadExistingTarget = false;

                await restoreRelocatedSidecars({
                    isJournalRollbackCreated,
                    isShmRollbackCreated,
                    isWalRollbackCreated,
                    journalPath,
                    rollbackJournalPath,
                    rollbackShmPath,
                    rollbackWalPath,
                    shmPath,
                    walPath,
                });
                isWalRollbackCreated = false;
                isShmRollbackCreated = false;
                isJournalRollbackCreated = false;
                databaseService.initialize();
            } catch (rollbackError: unknown) {
                logger?.warn(
                    "[DataBackupService] Failed to rollback database replacement after reinitialize failure",
                    ensureError(rollbackError),
                    { targetPath }
                );
                // If rollback fails, we still surface the init error below.
            }
        } else if (isTargetReplaced) {
            try {
                await fs.rm(targetPath, { force: true });
                isTargetReplaced = false;

                await restoreRelocatedSidecars({
                    isJournalRollbackCreated,
                    isShmRollbackCreated,
                    isWalRollbackCreated,
                    journalPath,
                    rollbackJournalPath,
                    rollbackShmPath,
                    rollbackWalPath,
                    shmPath,
                    walPath,
                });
                isWalRollbackCreated = false;
                isShmRollbackCreated = false;
                isJournalRollbackCreated = false;
                databaseService.initialize();
            } catch (cleanupError: unknown) {
                logger?.warn(
                    "[DataBackupService] Failed to remove uninitialized database replacement",
                    ensureError(cleanupError),
                    { targetPath }
                );
                // If cleanup fails, we still surface the init error below.
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
        await removePathBestEffort(incomingPath);
        if (!copyError) {
            await removePathBestEffort(rollbackPath);
            await removePathBestEffort(rollbackWalPath);
            await removePathBestEffort(rollbackShmPath);
            await removePathBestEffort(rollbackJournalPath);
        }
    }

    if (copyError) {
        throw copyError;
    }
}
