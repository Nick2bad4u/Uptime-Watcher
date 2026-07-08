import { isWindowsReservedFileBasename } from "@shared/utils/fileNameSafety";
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
import * as path from "node:path";

const UNSAFE_FILENAME_PATTERN = /[^\p{L}\p{N}\-._]/gu;
const MAX_FILE_NAME_BYTES = 200;

function truncateToUtf8ByteLength(value: string, maxBytes: number): string {
    let result = "";
    let byteLength = 0;

    for (const character of value) {
        const characterByteLength = getUtfByteLength(character);
        if (byteLength + characterByteLength > maxBytes) {
            break;
        }

        result += character;
        byteLength += characterByteLength;
    }

    return result;
}

/**
 * Produces a filesystem-safe file name.
 *
 * @remarks
 * This is used for user-controlled file names that are persisted to disk. The
 * output is constrained to a conservative character set to avoid path traversal
 * and invalid/reserved filenames (especially on Windows).
 */
export function createSanitizedFileName(fileName: string): string {
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
    if (getUtfByteLength(candidate) <= MAX_FILE_NAME_BYTES) {
        return candidate;
    }

    if (getUtfByteLength(ext) >= MAX_FILE_NAME_BYTES) {
        return truncateToUtf8ByteLength(candidate, MAX_FILE_NAME_BYTES);
    }

    const shortenedBase = truncateToUtf8ByteLength(
        safeBaseName,
        MAX_FILE_NAME_BYTES - getUtfByteLength(ext)
    );

    return `${shortenedBase}${ext}`;
}
