import { DATABASE_FILE_NAME } from "../../../constants";
import { logger } from "../../../utils/logger";

/**
 * Database backup utilities for creating SQLite database backups.
 *
 * @remarks
 * Provides functionality to create backup copies of the SQLite database
 * for export, download, or archival purposes. Uses Node.js file system
 * APIs with lazy importing to minimize startup overhead.
 */

/**
 * Result interface for database backup operations.
 *
 * @remarks
 * Provides structured return type for backup operations with comprehensive
 * metadata for tracking and validation.
 */
export interface DatabaseBackupResult {
    /** Binary buffer containing the complete SQLite database */
    buffer: Buffer;
    /** Standardized filename for the backup file */
    fileName: string;
    /** Metadata about the backup operation */
    metadata: {
        /** Backup creation timestamp */
        createdAt: number;
        /** Original database file path */
        originalPath: string;
        /** Database file size in bytes */
        sizeBytes: number;
    };
}

/**
 * Create a database backup by reading the SQLite file into a buffer.
 *
 * @param dbPath - Absolute path to the SQLite database file to backup
 * @param fileName - Optional custom filename for the backup (defaults to "uptime-watcher-backup.sqlite")
 * @returns Promise resolving to backup data with buffer, filename, and metadata
 *
 * @throws Re-throws file system errors after logging for upstream handling
 *
 * @remarks
 * **Backup Process:**
 * - Reads the entire SQLite database file into memory as a Buffer
 * - Returns structured result with buffer data and comprehensive metadata
 * - Uses dynamic import of fs/promises to minimize startup overhead
 * - Enhanced error handling for import failures and file operations
 *
 * **Performance Considerations:**
 * - Loads entire database into memory (suitable for typical database sizes)
 * - For very large databases, consider streaming approaches
 *
 * **Error Handling:**
 * - Handles dynamic import failures gracefully
 * - Logs stack traces for enhanced debugging
 * - Provides detailed error context for troubleshooting
 *
 * **Usage:**
 * ```typescript
 * const backup = await createDatabaseBackup("/path/to/database.sqlite");
 * // backup.buffer contains the database data
 * // backup.fileName contains "uptime-watcher-backup.sqlite"
 * // backup.metadata contains operation details
 * ```
 */
export async function createDatabaseBackup(
    dbPath: string,
    fileName: string = DATABASE_FILE_NAME
): Promise<DatabaseBackupResult> {
    try {
        // Enhanced dynamic import error handling
        let fs: typeof import("node:fs/promises");
        try {
            fs = await import("node:fs/promises");
        } catch (importError) {
            const errorMessage = importError instanceof Error ? importError.message : "Unknown import error";
            throw new Error(`Failed to import fs/promises: ${errorMessage}`);
        }

        const buffer = await fs.readFile(dbPath);
        const createdAt = Date.now();

        logger.info("[DatabaseBackup] Database backup created successfully", {
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
        logger.error("[DatabaseBackup] Failed to create database backup", {
            dbPath,
            error: error instanceof Error ? error.message : String(error),
            fileName,
            stack: error instanceof Error ? error.stack : undefined,
        });
        // Re-throw errors after logging (project standard)
        throw error;
    }
}
