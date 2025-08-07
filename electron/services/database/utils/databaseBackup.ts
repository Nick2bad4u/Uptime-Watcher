import { LOG_TEMPLATES } from "../../../../shared/utils/logTemplates";
import { BACKUP_DB_FILE_NAME } from "../../../constants";
import { logger } from "../../../utils/logger";

/**
 * Utilities for creating SQLite database backups.
 *
 * @remarks
 * Provides functionality to create backup copies of the SQLite database for export, download, or archival purposes. Uses Node.js file system APIs with lazy importing to minimize startup overhead and improve performance.
 *
 * @public
 */

/**
 * Result interface for database backup operations.
 *
 * @remarks
 * Provides a structured return type for backup operations with comprehensive metadata for tracking and validation. Used as the return value for {@link createDatabaseBackup}.
 *
 * @public
 */
export interface DatabaseBackupResult {
    /**
     * Binary buffer containing the complete SQLite database.
     *
     * @remarks
     * The raw contents of the SQLite database file as a Node.js Buffer.
     */
    buffer: Buffer;
    /**
     * Standardized filename for the backup file.
     *
     * @remarks
     * The filename used for the backup file, typically "uptime-watcher-backup.sqlite".
     */
    fileName: string;
    /**
     * Metadata about the backup operation.
     *
     * @remarks
     * Contains details about the backup creation, including timestamp, original path, and file size.
     */
    metadata: {
        /**
         * Backup creation timestamp.
         *
         * @remarks
         * The Unix timestamp (in milliseconds) when the backup was created.
         */
        createdAt: number;
        /**
         * Original database file path.
         *
         * @remarks
         * The absolute path to the original SQLite database file that was backed up.
         */
        originalPath: string;
        /**
         * Database file size in bytes.
         *
         * @remarks
         * The size of the database file in bytes at the time of backup.
         */
        sizeBytes: number;
    };
}

/**
 * Creates a backup of the SQLite database by reading the file into a buffer.
 *
 * @remarks
 * Reads the entire SQLite database file into memory as a Buffer and returns a structured result with buffer data, filename, and comprehensive metadata. Uses dynamic import of `fs/promises` to minimize startup overhead. Enhanced error handling for import failures and file operations. Loads the entire database into memory (suitable for typical database sizes). For very large databases, consider streaming approaches.
 *
 * @param dbPath - Absolute path to the SQLite database file to backup.
 * @param fileName - Optional custom filename for the backup (defaults to "uptime-watcher-backup.sqlite").
 * @returns Promise resolving to a {@link DatabaseBackupResult} containing the backup buffer, filename, and metadata.
 * @throws Re-throws file system errors after logging for upstream handling, including dynamic import failures and file read errors.
 * @example
 * ```typescript
 * const backup = await createDatabaseBackup("/path/to/database.sqlite");
 * // backup.buffer contains the database data
 * // backup.fileName contains "uptime-watcher-backup.sqlite"
 * // backup.metadata contains operation details
 * ```
 * @public
 */
export async function createDatabaseBackup(
    dbPath: string,
    fileName: string = BACKUP_DB_FILE_NAME
): Promise<DatabaseBackupResult> {
    try {
        // Enhanced dynamic import error handling
        let fs: typeof import("node:fs/promises");
        try {
            fs = await import(/* webpackChunkName: "node-fs-promises" */ "node:fs/promises");
        } catch (importError) {
            const errorMessage = importError instanceof Error ? importError.message : "Unknown import error";
            throw new Error(`Failed to import fs/promises: ${errorMessage}`);
        }

        const buffer = await fs.readFile(dbPath);
        const createdAt = Date.now();

        logger.info(LOG_TEMPLATES.services.DATABASE_BACKUP_CREATED, {
            createdAt,
            dbPath,
            fileName,
            sizeBytes: buffer.length,
        });

        return {
            buffer,
            fileName,
            metadata: {
                createdAt,
                originalPath: dbPath,
                sizeBytes: buffer.length,
            },
        };
    } catch (error) {
        logger.error(LOG_TEMPLATES.errors.DATABASE_BACKUP_FAILED, {
            dbPath,
            error: error instanceof Error ? error.message : String(error),
            fileName,
            stack: error instanceof Error ? error.stack : undefined,
        });
        // Re-throw errors after logging (project standard)
        throw error;
    }
}
