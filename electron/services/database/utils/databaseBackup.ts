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
 * Create a database backup by reading the SQLite file into a buffer.
 *
 * @param dbPath - Absolute path to the SQLite database file to backup
 * @param fileName - Optional custom filename for the backup (defaults to "uptime-watcher-backup.sqlite")
 * @returns Promise resolving to backup data with buffer and filename
 *
 * @throws Re-throws file system errors after logging for upstream handling
 *
 * @remarks
 * **Backup Process:**
 * - Reads the entire SQLite database file into memory as a Buffer
 * - Returns both the buffer data and a standardized filename
 * - Uses dynamic import of fs/promises to minimize startup overhead
 *
 * **Performance Considerations:**
 * - Loads entire database into memory (suitable for typical database sizes)
 * - For very large databases, consider streaming approaches
 *
 * **Usage:**
 * ```typescript
 * const backup = await createDatabaseBackup("/path/to/database.sqlite");
 * // backup.buffer contains the database data
 * // backup.fileName contains "uptime-watcher-backup.sqlite"
 * ```
 */
export async function createDatabaseBackup(
    dbPath: string,
    fileName: string = DATABASE_FILE_NAME
): Promise<{ buffer: Buffer; fileName: string }> {
    try {
        // Dynamic import to minimize startup overhead unless backup is actually needed
        const fs = await import("node:fs/promises");
        const buffer = await fs.readFile(dbPath);

        logger.info("[DatabaseBackup] Database backup created successfully", {
            dbPath,
            fileName,
            sizeBytes: buffer.length,
        });

        return {
            buffer,
            fileName,
        };
    } catch (error) {
        logger.error("[DatabaseBackup] Failed to create database backup", error, {
            dbPath,
            fileName,
        });
        // Re-throw errors after logging (project standard)
        throw error;
    }
}
