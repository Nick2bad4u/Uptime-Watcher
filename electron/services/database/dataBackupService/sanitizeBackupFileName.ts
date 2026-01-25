import * as path from "node:path";

const UNSAFE_FILENAME_PATTERN = /[^\p{L}\p{N}._-]/gu;

const WINDOWS_RESERVED_BASENAMES = new Set([
    "aux",
    "com1",
    "com2",
    "com3",
    "com4",
    "com5",
    "com6",
    "com7",
    "com8",
    "com9",
    "con",
    "lpt1",
    "lpt2",
    "lpt3",
    "lpt4",
    "lpt5",
    "lpt6",
    "lpt7",
    "lpt8",
    "lpt9",
    "nul",
    "prn",
]);

/**
 * Produces a filesystem-safe file name.
 *
 * @remarks
 * This is used for user-controlled file names that are persisted to disk.
 * The output is constrained to a conservative character set to avoid
 * path traversal and invalid/reserved filenames (especially on Windows).
 */
export function createSanitizedFileName(fileName: string): string {
    const MAX_FILE_NAME_LENGTH = 200;
    const fallback = "backup.sqlite";

    const rawBase = path.basename(fileName);
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
    const baseNameLower = baseName.toLowerCase();

    // Avoid Windows device names (even when running on non-Windows, a backup
    // can later be downloaded/restored on Windows).
    const safeBaseName = WINDOWS_RESERVED_BASENAMES.has(baseNameLower)
        ? `${baseName}_`
        : baseName;

    const candidate = `${safeBaseName}${ext}`;
    if (candidate.length <= MAX_FILE_NAME_LENGTH) {
        return candidate;
    }

    const shortenedBase = safeBaseName.slice(
        0,
        Math.max(1, MAX_FILE_NAME_LENGTH - ext.length)
    );

    return `${shortenedBase}${ext}`;
}
