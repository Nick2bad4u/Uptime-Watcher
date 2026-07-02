import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import * as path from "node:path";

const SQLITE_EXTENSION = ".sqlite" as const;
const PLAYWRIGHT_BACKUP_DIRECTORY = "playwright-backups" as const;

function normalizeBackupFileName(fileName: string): string {
    const normalizedFileName = fileName.trim();

    if (
        normalizedFileName.length === 0 ||
        normalizedFileName === "." ||
        normalizedFileName === ".." ||
        hasAsciiControlCharacters(normalizedFileName) ||
        normalizedFileName.includes("/") ||
        normalizedFileName.includes("\\") ||
        /^[A-Za-z]:/u.test(normalizedFileName) ||
        path.isAbsolute(normalizedFileName) ||
        path.win32.isAbsolute(normalizedFileName) ||
        path.posix.isAbsolute(normalizedFileName) ||
        path.basename(normalizedFileName) !== normalizedFileName ||
        path.win32.basename(normalizedFileName) !== normalizedFileName ||
        path.posix.basename(normalizedFileName) !== normalizedFileName
    ) {
        throw new TypeError("SQLite backup fileName must be a plain file name");
    }

    return normalizedFileName;
}

/**
 * Builds a deterministic Playwright automation backup path.
 */
export function buildPlaywrightBackupPath(args: {
    baseDirectory: string;
    fileName: string;
}): string {
    const automationDir = path.join(
        args.baseDirectory,
        PLAYWRIGHT_BACKUP_DIRECTORY
    );

    return ensureSqliteFileExtension(
        path.join(automationDir, normalizeBackupFileName(args.fileName))
    );
}

/**
 * Ensures a SQLite backup file path has a `.sqlite` extension.
 */
export function ensureSqliteFileExtension(rawPath: string): string {
    const ext = path.extname(rawPath);
    return ext.length > 0 ? rawPath : `${rawPath}${SQLITE_EXTENSION}`;
}
