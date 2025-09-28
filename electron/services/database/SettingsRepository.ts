/**
 * Repository for application settings persistence and management using the
 * repository pattern.
 *
 * @remarks
 * Handles CRUD operations for application configuration settings with type-safe
 * value handling, validation, and atomic updates. Provides centralized settings
 * management with proper transaction support and error handling.
 *
 * Key features:
 *
 * - Type-safe settings CRUD operations with value conversion
 * - Atomic setting updates with transaction support
 * - Default value management and fallback handling
 * - Efficient key-value storage with proper indexing
 * - Comprehensive error handling with operational hooks
 * - Setting validation and type coercion
 * - Bulk operations for multiple settings updates
 *
 * @example Basic settings operations:
 *
 * ```typescript
 * const settingsRepo = new SettingsRepository({ databaseService });
 *
 * // Set a setting value
 * await settingsRepo.setSetting("historyLimit", 1000);
 *
 * // Get a setting with default fallback
 * const limit = await settingsRepo.getSetting("historyLimit", 500);
 *
 * // Get all settings
 * const allSettings = await settingsRepo.getAllSettings();
 * ```
 *
 * @example Bulk settings operations:
 *
 * ```typescript
 * // Update multiple settings atomically
 * await settingsRepo.setSettings({
 *     historyLimit: 1000,
 *     checkInterval: 60000,
 *     enableNotifications: true,
 * });
 * ```
 *
 * @packageDocumentation
 */
import type { SettingsRow as DatabaseSettingsRow } from "@shared/types/database";
import type { Database } from "node-sqlite3-wasm";

import type { DatabaseService } from "./DatabaseService";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import {
    rowsToSettings,
    rowToSettingValue,
    settingsToRecord,
} from "./utils/settingsMapper";

/**
 * Defines the dependencies required by the SettingsRepository for managing
 * application settings persistence.
 *
 * @remarks
 * Provides the required DatabaseService for all settings operations. This
 * interface is used for dependency injection to ensure proper service
 * coupling.
 *
 * @public
 */
export interface SettingsRepositoryDependencies {
    /**
     * The database service used for transactional operations.
     *
     * @remarks
     * Must be properly initialized before being passed to the repository.
     */
    databaseService: DatabaseService;
}

/**
 * Common SQL queries for settings persistence operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant
 * is internal to the repository and not exported.
 *
 * @internal
 */
const SETTINGS_QUERIES = {
    DELETE_ALL: "DELETE FROM settings",
    DELETE_BY_KEY: "DELETE FROM settings WHERE key = ?",
    INSERT_OR_REPLACE:
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    SELECT_ALL: "SELECT * FROM settings",
    SELECT_VALUE_BY_KEY: "SELECT value FROM settings WHERE key = ?",
} as const;

/**
 * Repository for managing application settings persistence.
 *
 * Handles all CRUD operations for settings in the database, following the
 * repository pattern.
 *
 * @remarks
 * All operations are wrapped in transactions and use the repository pattern for
 * consistency, error handling, and maintainability. This class should be used
 * as the sole interface for settings data access and mutation.
 *
 * @public
 */
export class SettingsRepository {
    /** @internal */
    private readonly databaseService: DatabaseService;

    /**
     * Bulk inserts settings (for import functionality).
     *
     * @remarks
     * Uses a prepared statement and transaction for better performance.
     *
     * @example
     *
     * ```typescript
     * await repo.bulkInsert({ theme: "dark", language: "en" });
     * ```
     *
     * @param settings - Key-value pairs to insert.
     *
     * @returns A promise that resolves when all settings are inserted.
     *
     * @throws Error if the database operation fails.
     */
    public async bulkInsert(settings: Record<string, string>): Promise<void> {
        const entries = Object.entries(settings);
        if (entries.length === 0) {
            return;
        }

        await withDatabaseOperation(
            async () =>
                this.databaseService.executeTransaction((db) => {
                    this.bulkInsertInternal(db, settings);
                    return Promise.resolve();
                }),
            "settings-bulk-insert",
            undefined,
            { count: entries.length }
        );
    }

    /**
     * Deletes a setting by key.
     *
     * @example
     *
     * ```typescript
     * await repo.delete("theme");
     * ```
     *
     * @param key - The setting key to delete.
     *
     * @returns A promise that resolves when the setting is deleted.
     *
     * @throws Error if the database operation fails.
     */
    public async delete(key: string): Promise<void> {
        return withDatabaseOperation(
            async () =>
                this.databaseService.executeTransaction((db) => {
                    this.deleteInternal(db, key);
                    return Promise.resolve();
                }),
            "settings-delete",
            undefined,
            { key }
        );
    }

    /**
     * Clears all settings from the database.
     *
     * @example
     *
     * ```typescript
     * await repo.deleteAll();
     * ```
     *
     * @returns A promise that resolves when all settings are deleted.
     *
     * @throws Error if the database operation fails.
     */
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(
            async () =>
                this.databaseService.executeTransaction((db) => {
                    this.deleteAllInternal(db);
                    return Promise.resolve();
                }),
            "settings-delete-all"
        );
    }

    /**
     * Gets a setting by key.
     *
     * @example
     *
     * ```typescript
     * const theme = await repo.get("theme");
     * ```
     *
     * @param key - The setting key to retrieve.
     *
     * @returns A promise resolving to the setting value or `undefined` if not
     *   found.
     *
     * @throws Error if the database operation fails.
     */
    public async get(key: string): Promise<string | undefined> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Database query returns known structure from controlled SQL
            const result = db.get(SETTINGS_QUERIES.SELECT_VALUE_BY_KEY, [
                key,
            ]) as DatabaseSettingsRow | undefined;
            return Promise.resolve(rowToSettingValue(result));
        }, `get-setting-${key}`);
    }

    /**
     * Gets all settings.
     *
     * @remarks
     * **Performance Note**: Settings tables are typically small (under 100
     * entries) by design. No pagination is needed as settings are configuration
     * data, not user-generated content. If settings grow beyond expected size,
     * consider splitting into separate configuration domains.
     *
     * @example
     *
     * ```typescript
     * const allSettings = await repo.getAll();
     * ```
     *
     * @returns A promise resolving to all settings as key-value pairs.
     *
     * @throws Error if the database operation fails.
     */
    public async getAll(): Promise<Record<string, string>> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const settings = db.all(
                SETTINGS_QUERIES.SELECT_ALL
            ) as DatabaseSettingsRow[];
            const settingRows = rowsToSettings(settings);
            return Promise.resolve(settingsToRecord(settingRows));
        }, "settings-get-all");
    }

    /**
     * Sets a setting value.
     *
     * @example
     *
     * ```typescript
     * await repo.set("theme", "dark");
     * ```
     *
     * @param key - The setting key to set.
     * @param value - The setting value to store.
     *
     * @returns A promise that resolves when the setting is saved.
     *
     * @throws Error if the database operation fails.
     */
    public async set(key: string, value: string): Promise<void> {
        return withDatabaseOperation(
            async () =>
                this.databaseService.executeTransaction((db) => {
                    this.setInternal(db, key, value);
                    return Promise.resolve();
                }),
            "settings-set",
            undefined,
            { key }
        );
    }

    /**
     * Constructs a new SettingsRepository instance.
     *
     * @example
     *
     * ```typescript
     * const repo = new SettingsRepository({ databaseService });
     * ```
     *
     * @param dependencies - The required dependencies for settings operations.
     */
    public constructor(dependencies: SettingsRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }

    /**
     * Bulk inserts settings within an existing transaction context.
     *
     * @remarks
     * **IMPORTANT**: This method must be called within an existing transaction
     * context.
     *
     * **Error Handling**: Uses prepared statements which may throw on
     * constraint violations or database errors. All exceptions are propagated
     * to the calling transaction context for proper rollback handling.
     *
     * **Performance**: Uses prepared statements for optimal bulk insert
     * performance.
     *
     * @param db - The database connection (must be within an active
     *   transaction).
     * @param settings - Key-value pairs to insert.
     *
     * @throws Error when database operations fail.
     */
    public bulkInsertInternal(
        db: Database,
        settings: Record<string, string>
    ): void {
        const entries = Object.entries(settings);
        if (entries.length === 0) {
            return;
        }

        // Prepare the statement once for better performance
        const stmt = db.prepare(SETTINGS_QUERIES.INSERT_OR_REPLACE);

        try {
            for (const [key, value] of entries) {
                stmt.run([key, value]);
            }

            logger.info(
                `[SettingsRepository] Bulk inserted ${entries.length} settings (internal)`
            );
        } finally {
            stmt.finalize();
        }
    }

    /**
     * Clears all settings from the database within an existing transaction
     * context.
     *
     * @remarks
     * Use this method only when already within a transaction context.
     *
     * @param db - The database connection (must be within an active
     *   transaction).
     */
    public deleteAllInternal(db: Database): void {
        db.run(SETTINGS_QUERIES.DELETE_ALL);
        logger.info("[SettingsRepository] All settings deleted (internal)");
    }

    /**
     * Deletes a setting by key within an existing transaction context.
     *
     * @remarks
     * Use this method only when already within a transaction context.
     *
     * @param db - The database connection (must be within an active
     *   transaction).
     * @param key - The setting key to delete.
     */
    public deleteInternal(db: Database, key: string): void {
        db.run(SETTINGS_QUERIES.DELETE_BY_KEY, [key]);
        if (isDev()) {
            logger.debug(
                `[SettingsRepository] Deleted setting (internal): ${key}`
            );
        }
    }

    /**
     * Sets a setting value within an existing transaction context.
     *
     * @remarks
     * Use this method only when already within a transaction context.
     *
     * @param db - The database connection (must be within an active
     *   transaction).
     * @param key - The setting key to set.
     * @param value - The setting value to store.
     */
    public setInternal(db: Database, key: string, value: string): void {
        db.run(SETTINGS_QUERIES.INSERT_OR_REPLACE, [key, value]);
        if (isDev()) {
            logger.debug(
                `[SettingsRepository] Set setting (internal): ${key} = ${value}`
            );
        }
    }

    /**
     * Gets the database instance for internal repository operations.
     *
     * @remarks
     * **Usage Pattern**: Only used for read operations and internal methods.
     * All mutations must use executeTransaction() for proper transaction
     * management. Caller must ensure DatabaseService.initialize() was called
     * first.
     *
     * @returns The database connection from the {@link DatabaseService}.
     *
     * @throws Error if the database is not initialized.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }
}
