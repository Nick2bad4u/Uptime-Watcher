import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import { DatabaseService } from "./DatabaseService";
import { rowsToSettings, rowToSettingValue, settingsToRecord } from "./utils/settingsMapper";

/**
 * Defines the dependencies required by the {@link SettingsRepository} for managing application settings persistence.
 *
 * @remarks
 * Provides the required {@link DatabaseService} for all settings operations. This interface is used for dependency injection.
 * @public
 */
export interface SettingsRepositoryDependencies {
    /**
     * The database service used for transactional operations.
     * @readonly
     */
    databaseService: DatabaseService;
}

/**
 * Repository for managing application settings persistence.
 *
 * Handles all CRUD operations for settings in the database, following the repository pattern.
 *
 * @remarks
 * All operations are wrapped in transactions and use the repository pattern for consistency, error handling, and maintainability. This class should be used as the sole interface for settings data access and mutation.
 * @public
 */
export class SettingsRepository {
    /**
     * The database service used for all transactional operations.
     * @readonly
     */
    private readonly databaseService: DatabaseService;

    /**
     * Constructs a new SettingsRepository instance.
     *
     * @param dependencies - The required dependencies for settings operations.
     * @example
     * ```typescript
     * const repo = new SettingsRepository({ databaseService });
     * ```
     */
    constructor(dependencies: SettingsRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }

    /**
     * Bulk inserts settings (for import functionality).
     *
     * @param settings - Key-value pairs to insert.
     * @returns A promise that resolves when all settings are inserted.
     * @throws Error if the database operation fails.
     * @remarks
     * Uses a prepared statement and transaction for better performance.
     * @example
     * ```typescript
     * await repo.bulkInsert({ theme: "dark", language: "en" });
     * ```
     */
    public async bulkInsert(settings: Record<string, string>): Promise<void> {
        const entries = Object.entries(settings);
        if (entries.length === 0) {
            return;
        }

        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    this.bulkInsertInternal(db, settings);
                    return Promise.resolve();
                });
            },
            "settings-bulk-insert",
            undefined,
            { count: entries.length }
        );
    }

    /**
     * Bulk inserts settings within an existing transaction context.
     *
     * @param db - The database connection (must be within an active transaction).
     * @param settings - Key-value pairs to insert.
     * @throws Error when database operations fail.
     * @remarks
     * **IMPORTANT**: This method must be called within an existing transaction context.
     *
     * **Error Handling**: Uses prepared statements which may throw on constraint violations or database errors. All exceptions are propagated to the calling transaction context for proper rollback handling.
     *
     * **Performance**: Uses prepared statements for optimal bulk insert performance.
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

    /**
     * Deletes a setting by key.
     *
     * @param key - The setting key to delete.
     * @returns A promise that resolves when the setting is deleted.
     * @throws Error if the database operation fails.
     * @example
     * ```typescript
     * await repo.delete("theme");
     * ```
     */
    public async delete(key: string): Promise<void> {
        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    this.deleteInternal(db, key);
                    return Promise.resolve();
                });
            },
            "settings-delete",
            undefined,
            { key }
        );
    }

    /**
     * Clears all settings from the database.
     *
     * @returns A promise that resolves when all settings are deleted.
     * @throws Error if the database operation fails.
     * @example
     * ```typescript
     * await repo.deleteAll();
     * ```
     */
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(async () => {
            return this.databaseService.executeTransaction((db) => {
                this.deleteAllInternal(db);
                return Promise.resolve();
            });
        }, "settings-delete-all");
    }

    /**
     * Clears all settings from the database within an existing transaction context.
     *
     * @param db - The database connection (must be within an active transaction).
     * @remarks
     * Use this method only when already within a transaction context.
     */
    public deleteAllInternal(db: Database): void {
        db.run("DELETE FROM settings");
        logger.info("[SettingsRepository] All settings deleted (internal)");
    }

    /**
     * Deletes a setting by key within an existing transaction context.
     *
     * @param db - The database connection (must be within an active transaction).
     * @param key - The setting key to delete.
     * @remarks
     * Use this method only when already within a transaction context.
     */
    public deleteInternal(db: Database, key: string): void {
        db.run("DELETE FROM settings WHERE key = ?", [key]);
        if (isDev()) {
            logger.debug(`[SettingsRepository] Deleted setting (internal): ${key}`);
        }
    }

    /**
     * Gets a setting by key.
     *
     * @param key - The setting key to retrieve.
     * @returns A promise resolving to the setting value or `undefined` if not found.
     * @throws Error if the database operation fails.
     * @example
     * ```typescript
     * const theme = await repo.get("theme");
     * ```
     */
    public async get(key: string): Promise<string | undefined> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const result = db.get("SELECT value FROM settings WHERE key = ?", [key]) as
                | Record<string, unknown>
                | undefined;
            return Promise.resolve(rowToSettingValue(result));
        }, `get-setting-${key}`);
    }

    /**
     * Gets all settings.
     *
     * @returns A promise resolving to all settings as key-value pairs.
     * @throws Error if the database operation fails.
     * @remarks
     * **Performance Note**: Settings tables are typically small (under 100 entries) by design. No pagination is needed as settings are configuration data, not user-generated content. If settings grow beyond expected size, consider splitting into separate configuration domains.
     * @example
     * ```typescript
     * const allSettings = await repo.getAll();
     * ```
     */
    public async getAll(): Promise<Record<string, string>> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const settings = db.all("SELECT * FROM settings") as Record<string, unknown>[];
            const settingRows = rowsToSettings(settings);
            return Promise.resolve(settingsToRecord(settingRows));
        }, "settings-get-all");
    }

    /**
     * Sets a setting value.
     *
     * @param key - The setting key to set.
     * @param value - The setting value to store.
     * @returns A promise that resolves when the setting is saved.
     * @throws Error if the database operation fails.
     * @example
     * ```typescript
     * await repo.set("theme", "dark");
     * ```
     */
    public async set(key: string, value: string): Promise<void> {
        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    this.setInternal(db, key, value);
                    return Promise.resolve();
                });
            },
            "settings-set",
            undefined,
            { key }
        );
    }

    /**
     * Sets a setting value within an existing transaction context.
     *
     * @param db - The database connection (must be within an active transaction).
     * @param key - The setting key to set.
     * @param value - The setting value to store.
     * @remarks
     * Use this method only when already within a transaction context.
     */
    public setInternal(db: Database, key: string, value: string): void {
        db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value]);
        if (isDev()) {
            logger.debug(`[SettingsRepository] Set setting (internal): ${key} = ${value}`);
        }
    }

    /**
     * Gets the database instance for internal repository operations.
     *
     * @returns The database connection from the {@link DatabaseService}.
     * @throws Error if the database is not initialized.
     * @remarks
     * **Usage Pattern**: Only used for read operations and internal methods. All mutations must use executeTransaction() for proper transaction management. Caller must ensure DatabaseService.initialize() was called first.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }
}
