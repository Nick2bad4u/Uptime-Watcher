import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";
import * as fs from "node:fs/promises";

/**
 * Best-effort file rename that treats a missing source as a no-op.
 */
export async function renameIfExists(
    sourcePath: string,
    targetPath: string
): Promise<void> {
    try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- caller ensures paths are app-controlled.
        await fs.rename(sourcePath, targetPath);
    } catch (error: unknown) {
        if (tryGetErrorCode(error) === "ENOENT") {
            return;
        }

        throw ensureError(error);
    }
}

/**
 * Best-effort `fsync()` for a file path.
 *
 * @remarks
 * This reduces the chance of ending up with a zero-length/partially-written
 * replacement file if the machine crashes or loses power around a rename.
 */
export async function syncFileSafely(filePath: string): Promise<void> {
    try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- caller ensures filePath is derived from app-controlled paths.
        const handle = await fs.open(filePath, "r");
        try {
            await handle.sync();
        } finally {
            await handle.close();
        }
    } catch {
        // Best-effort only.
    }
}

/**
 * Best-effort `fsync()` for a directory path.
 *
 * @remarks
 * Helps persist rename operations on POSIX filesystems. On Windows, directory
 * handles may not be syncable; we treat failures as non-fatal.
 */
export async function syncDirectorySafely(
    directoryPath: string
): Promise<void> {
    try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- caller ensures directoryPath is derived from app-controlled paths.
        const handle = await fs.open(directoryPath, "r");
        try {
            await handle.sync();
        } finally {
            await handle.close();
        }
    } catch {
        // Best-effort only.
    }
}
