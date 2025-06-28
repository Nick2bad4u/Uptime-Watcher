import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../utils";
import { logger } from "../../utils/logger";
import { DatabaseService } from "./DatabaseService";

/**
 * Repository for managing application settings persistence.
 * Handles CRUD operations for settings in the database.
 */
export class SettingsRepository {
    private databaseService: DatabaseService;

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
            const result = await db.get("SELECT value FROM settings WHERE key = ?", [key]);
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
            await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value]);
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
            await db.run("DELETE FROM settings WHERE key = ?", [key]);
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
            const settings = (await db.all("SELECT * FROM settings")) as Array<{ key: string; value: string }>;
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
            await db.run("DELETE FROM settings");
            logger.info("[SettingsRepository] All settings deleted");
        } catch (error) {
            logger.error("[SettingsRepository] Failed to delete all settings", error);
            throw error;
        }
    }

    /**
     * Bulk insert settings (for import functionality).
     */
    public async bulkInsert(settings: Record<string, string>): Promise<void> {
        try {
            const db = this.getDb();
            for (const [key, value] of Object.entries(settings)) {
                await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, String(value)]);
            }
            logger.info(`[SettingsRepository] Bulk inserted ${Object.keys(settings).length} settings`);
        } catch (error) {
            logger.error("[SettingsRepository] Failed to bulk insert settings", error);
            throw error;
        }
    }
}
