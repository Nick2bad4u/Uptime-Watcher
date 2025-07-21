import { logger } from "../../../utils/logger";

/**
 * Database backup utilities.
 */

/**
 * Download database backup as buffer.
 */
export async function createDatabaseBackup(dbPath: string): Promise<{ buffer: Buffer; fileName: string }> {
    try {
        const fs = await import("node:fs/promises");
        const buffer = await fs.readFile(dbPath);

        logger.info("[DatabaseBackup] Database backup created successfully");
        return {
            buffer,
            fileName: "uptime-watcher-backup.sqlite",
        };
    } catch (error) {
        logger.error("[DatabaseBackup] Failed to create database backup", error);
        throw error;
    }
}
