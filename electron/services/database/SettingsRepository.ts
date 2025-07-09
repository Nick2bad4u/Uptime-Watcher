import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/index";
import { DatabaseService } from "./DatabaseService";

/**
 * Repository for managing application settings persistence.
 * Handles CRUD operations for settings in the database.
 */
export class SettingsRepository {
    private readonly databaseService: DatabaseService;

    constructor() {
        this.databaseService = DatabaseService.getInstance();
    }

    /**
     * Get the database instance.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }

    /**
     * Get a setting by key.
     */
    public async get(key: string): Promise<string | undefined> {
        try {
            const db = this.getDb();
            const result = db.get("SELECT value FROM settings WHERE key = ?", [key]);
            return result?.value ? String(result.value) : undefined;
        } catch (error) {
            logger.error(`[SettingsRepository] Failed to get setting: ${key}`, error);
            throw error;
        }
    }

    /**
     * Set a setting value.
     */
    public async set(key: string, value: string): Promise<void> {
        try {
            const db = this.getDb();
            db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value]);
            if (isDev()) {
                logger.debug(`[SettingsRepository] Set setting: ${key} = ${value}`);
            }
        } catch (error) {
            logger.error(`[SettingsRepository] Failed to set setting: ${key}`, error);
            throw error;
        }
    }

    /**
     * Delete a setting by key.
     */
    public async delete(key: string): Promise<void> {
        try {
            const db = this.getDb();
            db.run("DELETE FROM settings WHERE key = ?", [key]);
            if (isDev()) {
                logger.debug(`[SettingsRepository] Deleted setting: ${key}`);
            }
        } catch (error) {
            logger.error(`[SettingsRepository] Failed to delete setting: ${key}`, error);
            throw error;
        }
    }

    /**
     * Get all settings.
     */
    public async getAll(): Promise<Record<string, string>> {
        try {
            const db = this.getDb();
            const settings = db.all("SELECT * FROM settings") as { key: string; value: string }[];
            return settings.reduce(
                (acc, row) => {
                    if (typeof row.key === "string") {
                        acc[row.key] = String(row.value);
                    }
                    return acc;
                },
                {} as Record<string, string>
            );
        } catch (error) {
            logger.error("[SettingsRepository] Failed to get all settings", error);
            throw error;
        }
    }

    /**
     * Clear all settings from the database.
     */
    public async deleteAll(): Promise<void> {
        try {
            const db = this.getDb();
            db.run("DELETE FROM settings");
            logger.info("[SettingsRepository] All settings deleted");
        } catch (error) {
            logger.error("[SettingsRepository] Failed to delete all settings", error);
            throw error;
        }
    }

    /**
     * Bulk insert settings (for import functionality).
     * Uses a prepared statement and transaction for better performance.
     */
    public async bulkInsert(settings: Record<string, string>): Promise<void> {
        const entries = Object.entries(settings);
        if (entries.length === 0) {
            return;
        }

        try {
            const db = this.getDb();

            // Use a transaction for bulk operations
            db.run("BEGIN TRANSACTION");

            // Prepare the statement once for better performance
            const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");

            try {
                for (const [key, value] of entries) {
                    stmt.run([key, String(value)]);
                }

                db.run("COMMIT");
                logger.info(`[SettingsRepository] Bulk inserted ${entries.length} settings`);
            } catch (error) {
                db.run("ROLLBACK");
                throw error;
            } finally {
                stmt.finalize();
            }
        } catch (error) {
            logger.error("[SettingsRepository] Failed to bulk insert settings", error);
            throw error;
        }
    }
}
