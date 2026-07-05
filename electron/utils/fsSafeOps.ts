import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";
import * as fs from "node:fs/promises";

type FileSystemEntryStats = Awaited<ReturnType<typeof fs.lstat>>;

/**
 * Ensures a validated directory exists and returns its canonical real path.
 */
export async function ensureDirectoryAndResolveRealPath(args: {
    directoryPath: string;
    notDirectoryMessage: string;
}): Promise<string> {
    const { directoryPath, notDirectoryMessage } = args;

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- caller validates directoryPath before invoking this audited filesystem helper.
    await fs.mkdir(directoryPath, { recursive: true });
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- caller validates directoryPath before invoking this audited filesystem helper.
    const stat = await fs.stat(directoryPath);
    if (!stat.isDirectory()) {
        throw new Error(notDirectoryMessage);
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- caller validates directoryPath before invoking this audited filesystem helper.
    return fs.realpath(directoryPath);
}

/**
 * Reads filesystem entry metadata, treating a missing path as `null`.
 */
export async function lstatIfExists(
    filePath: string
): Promise<FileSystemEntryStats | null> {
    try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- caller validates filePath before invoking this audited filesystem helper.
        return await fs.lstat(filePath);
    } catch (error: unknown) {
        if (tryGetErrorCode(error) === "ENOENT") {
            return null;
        }

        throw ensureError(error);
    }
}

/**
 * Best-effort file rename that treats a missing source as a no-op.
 *
 * @returns `true` when the source was renamed, otherwise `false` when the
 * source path did not exist.
 */
export async function renameIfExists(
    sourcePath: string,
    targetPath: string
): Promise<boolean> {
    try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- caller ensures paths are app-controlled.
        await fs.rename(sourcePath, targetPath);
        return true;
    } catch (error: unknown) {
        if (tryGetErrorCode(error) === "ENOENT") {
            return false;
        }

        throw ensureError(error);
    }
}

/**
 * Best-effort path removal for cleanup code.
 */
export async function removePathBestEffort(filePath: string): Promise<void> {
    try {
        await fs.rm(filePath, { force: true });
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
