import type { Logger } from "@shared/utils/logger/interfaces";

import { ensureError } from "@shared/utils/errorHandling";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";

import {
    lstatIfExists,
    removePathBestEffort,
    syncDirectorySafely,
    syncFileSafely,
} from "../../../utils/fsSafeOps";
import { resolvePathWithinDirectory } from "./pathWithinDirectory";

/**
 * Writes a file within a directory, using an atomic rename.
 *
 * @remarks
 * This is used to persist backup artifacts (including temporary restore
 * snapshots). The returned path is always confined to `baseDirectory`.
 */
export async function writeFileWithinDirectory(args: {
    readonly baseDirectory: string;
    readonly contents: Parameters<typeof fs.writeFile>[1];
    readonly fileName: string;
    readonly logger?: Logger;
}): Promise<string> {
    const { baseDirectory, contents, fileName, logger } = args;

    const targetPath = resolvePathWithinDirectory(baseDirectory, fileName);
    const tmpPath = resolvePathWithinDirectory(
        baseDirectory,
        `${fileName}.tmp-${randomUUID()}`
    );
    const rollbackPath = resolvePathWithinDirectory(
        baseDirectory,
        `${fileName}.rollback-${randomUUID()}`
    );
    let isRollbackCreated = false;
    let shouldDeleteRollback = false;

    try {
        const existingTarget = await lstatIfExists(targetPath);

        if (
            existingTarget &&
            (existingTarget.isSymbolicLink() || !existingTarget.isFile())
        ) {
            throw new Error(
                `[DataBackupService] Refusing to overwrite non-file backup target: ${targetPath}`
            );
        }

        // Path is validated by resolvePathWithinDirectory to prevent traversal.
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- tmpPath is sanitized and confined to baseDirectory.
        await fs.writeFile(tmpPath, contents);
        await syncFileSafely(tmpPath);

        if (existingTarget) {
            // eslint-disable-next-line security/detect-non-literal-fs-filename -- targetPath/rollbackPath are sanitized and confined to baseDirectory.
            await fs.rename(targetPath, rollbackPath);
            isRollbackCreated = true;
        }

        // Atomic swap.
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- tmpPath/targetPath are confined to baseDirectory.
        await fs.rename(tmpPath, targetPath);
        shouldDeleteRollback = isRollbackCreated;
        await syncDirectorySafely(baseDirectory);
    } catch (error) {
        // Best-effort cleanup.
        await removePathBestEffort(tmpPath);

        // Best-effort rollback (no-op if rollback doesn't exist).
        if (isRollbackCreated) {
            try {
                // eslint-disable-next-line security/detect-non-literal-fs-filename -- rollbackPath/targetPath are sanitized and confined to baseDirectory.
                await fs.rename(rollbackPath, targetPath);
                isRollbackCreated = false;
            } catch (rollbackError: unknown) {
                logger?.warn(
                    "[DataBackupService] Failed to rollback backup artifact write",
                    ensureError(rollbackError),
                    { fileName, targetPath }
                );
            }
        }
        await syncDirectorySafely(baseDirectory);

        throw ensureError(error);
    } finally {
        // Best-effort cleanup after a successful replacement only. If rollback
        // restoration failed, keep the rollback file as the last known copy of
        // the original target.
        if (shouldDeleteRollback && isRollbackCreated) {
            await removePathBestEffort(rollbackPath);
        }
    }

    return targetPath;
}
