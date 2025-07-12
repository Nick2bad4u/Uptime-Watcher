import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../electronUtils";
import { logger, withDatabaseOperation } from "../../utils/index";
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
    public get(key: string): string | undefined {
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
        return withDatabaseOperation(
            async () => {
                const db = this.databaseService.getDatabase();
                this.setInternal(db, key, value);
            },
            "settings-set",
            undefined,
            { key }
        );
    }

    /**
     * Internal method to set a setting value within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public setInternal(db: Database, key: string, value: string): void {
        db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value]);
        if (isDev()) {
            logger.debug(`[SettingsRepository] Set setting (internal): ${key} = ${value}`);
        }
    }

    /**
     * Delete a setting by key.
     */
    public async delete(key: string): Promise<void> {
        return withDatabaseOperation(
            async () => {
                const db = this.databaseService.getDatabase();
                this.deleteInternal(db, key);
            },
            "settings-delete",
            undefined,
            { key }
        );
    }

    /**
     * Internal method to delete a setting by key within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public deleteInternal(db: Database, key: string): void {
        db.run("DELETE FROM settings WHERE key = ?", [key]);
        if (isDev()) {
            logger.debug(`[SettingsRepository] Deleted setting (internal): ${key}`);
        }
    }

    /**
     * Get all settings.
     */
    public getAll(): Record<string, string> {
        try {
            const db = this.getDb();
            const settings = db.all("SELECT * FROM settings") as { key: string; value: string }[];
            const result: Record<string, string> = {};
            for (const row of settings) {
                if (typeof row.key === "string") {
                    result[row.key] = String(row.value);
                }
            }
            return result;
        } catch (error) {
            logger.error("[SettingsRepository] Failed to get all settings", error);
            throw error;
        }
    }

    /**
     * Clear all settings from the database.
     */
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(async () => {
            const db = this.databaseService.getDatabase();
            this.deleteAllInternal(db);
        }, "settings-delete-all");
    }

    /**
     * Internal method to clear all settings from the database within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public deleteAllInternal(db: Database): void {
        db.run("DELETE FROM settings");
        logger.info("[SettingsRepository] All settings deleted (internal)");
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

        return withDatabaseOperation(
            async () => {
                const db = this.databaseService.getDatabase();
                this.bulkInsertInternal(db, settings);
            },
            "settings-bulk-insert",
            undefined,
            { count: entries.length }
        );
    }

    /**
     * Internal method to bulk insert settings within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public bulkInsertInternal(db: Database, settings: Record<string, string>): void {
        const entries = Object.entries(settings);
        if (entries.length === 0) {
            return;
        }

        // Prepare the statement once for better performance
        const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");

        try {
            for (const [key, value] of entries) {
                stmt.run([key, String(value)]);
            }

            logger.info(`[SettingsRepository] Bulk inserted ${entries.length} settings (internal)`);
        } finally {
            stmt.finalize();
        }
    }
}
