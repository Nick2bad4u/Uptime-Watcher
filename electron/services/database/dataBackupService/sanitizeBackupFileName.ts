import { isWindowsReservedFileBasename } from "@shared/utils/fileNameSafety";
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import * as path from "node:path";

const UNSAFE_FILENAME_PATTERN = /[^\p{L}\p{N}\-._]/gu;

/**
 * Produces a filesystem-safe file name.
 *
 * @remarks
 * This is used for user-controlled file names that are persisted to disk. The
 * output is constrained to a conservative character set to avoid path traversal
 * and invalid/reserved filenames (especially on Windows).
 */
export function createSanitizedFileName(fileName: string): string {
    const MAX_FILE_NAME_LENGTH = 200;
    const fallback = "backup.sqlite";

    const rawBase = path.posix.basename(
        normalizePathSeparatorsToPosix(fileName)
    );
    const normalizedBase = rawBase.replaceAll(UNSAFE_FILENAME_PATTERN, "_");
    let withoutTrailingDotsOrSpaces = normalizedBase;
    while (
        withoutTrailingDotsOrSpaces.endsWith(".") ||
        withoutTrailingDotsOrSpaces.endsWith(" ")
    ) {
        withoutTrailingDotsOrSpaces = withoutTrailingDotsOrSpaces.slice(0, -1);
    }

    const trimmed = withoutTrailingDotsOrSpaces.trim();

    if (trimmed.length === 0 || trimmed === "." || trimmed === "..") {
        return fallback;
    }

    const ext = path.extname(trimmed);
    const baseName = path.basename(trimmed, ext);

    // Avoid Windows device names (even when running on non-Windows, a backup
    // can later be downloaded/restored on Windows).
    const safeBaseName = isWindowsReservedFileBasename(baseName)
        ? `${baseName}_`
        : baseName;

    const candidate = `${safeBaseName}${ext}`;
    if (candidate.length <= MAX_FILE_NAME_LENGTH) {
        return candidate;
    }

    if (ext.length >= MAX_FILE_NAME_LENGTH) {
        return candidate.slice(0, MAX_FILE_NAME_LENGTH);
    }

    const shortenedBase = safeBaseName.slice(
        0,
        MAX_FILE_NAME_LENGTH - ext.length
    );

    return `${shortenedBase}${ext}`;
}
