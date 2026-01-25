import { ensureError } from "@shared/utils/errorHandling";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";

import { syncDirectorySafely, syncFileSafely } from "../../../utils/fsSafeOps";
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
}): Promise<string> {
    const { baseDirectory, contents, fileName } = args;

    const targetPath = resolvePathWithinDirectory(baseDirectory, fileName);
    const tmpPath = resolvePathWithinDirectory(
        baseDirectory,
        `${fileName}.tmp-${randomUUID()}`
    );
    const rollbackPath = resolvePathWithinDirectory(
        baseDirectory,
        `${fileName}.rollback-${randomUUID()}`
    );

    try {
        // Path is validated by resolvePathWithinDirectory to prevent traversal.
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- tmpPath is sanitized and confined to baseDirectory.
        await fs.writeFile(tmpPath, contents);
        await syncFileSafely(tmpPath);

        // Best-effort rollback.
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- targetPath/rollbackPath are sanitized and confined to baseDirectory.
        await fs.rename(targetPath, rollbackPath).catch(() => {});

        // Atomic swap.
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- tmpPath/targetPath are confined to baseDirectory.
        await fs.rename(tmpPath, targetPath);
        await syncDirectorySafely(baseDirectory);
    } catch (error) {
        // Best-effort cleanup.
        await fs.rm(tmpPath, { force: true }).catch(() => {});

        // Best-effort rollback (no-op if rollback doesn't exist).
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- rollbackPath/targetPath are sanitized and confined to baseDirectory.
        await fs.rename(rollbackPath, targetPath).catch(() => {});
        await syncDirectorySafely(baseDirectory);

        throw ensureError(error);
    } finally {
        // Best-effort cleanup (no-op if rollback doesn't exist).
        await fs.rm(rollbackPath, { force: true }).catch(() => {});
    }

    return targetPath;
}
