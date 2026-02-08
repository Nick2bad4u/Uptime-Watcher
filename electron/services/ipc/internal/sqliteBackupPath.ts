import * as path from "node:path";

const SQLITE_EXTENSION = ".sqlite" as const;
const PLAYWRIGHT_BACKUP_DIRECTORY = "playwright-backups" as const;

/**
 * Ensures a SQLite backup file path has a `.sqlite` extension.
 */
export function ensureSqliteFileExtension(rawPath: string): string {
    const ext = path.extname(rawPath);
    return ext.length > 0 ? rawPath : `${rawPath}${SQLITE_EXTENSION}`;
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

    return ensureSqliteFileExtension(path.join(automationDir, args.fileName));
}
