import type { Database } from "node-sqlite3-wasm";

import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { safeStringify } from "@shared/utils/stringConversion";
import { isRecord } from "@shared/utils/typeHelpers";

import { logger } from "../../../utils/logger";
import { getRegisteredMonitorTypes } from "../../monitoring/MonitorTypeRegistry";
import { generateMonitorTableSchema } from "./dynamicSchema";

/**
 * Utilities for managing the SQLite database schema, including table and index
 * creation and validation setup.
 *
 * @remarks
 * Provides functions for creating database tables, indexes, and setting up
 * validation frameworks. All table creation operations are idempotent using "IF
 * NOT EXISTS" clauses. Used during application startup and migrations.
 *
 * @public
 */

/**
 * Common SQL queries for database schema operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant
 * is internal to the utility module and not exported.
 *
 * @internal
 */
const SCHEMA_QUERIES = {
    BEGIN_TRANSACTION: "BEGIN TRANSACTION",
    COMMIT: "COMMIT",
    CREATE_INDEX_HISTORY_MONITOR_ID:
        "CREATE INDEX IF NOT EXISTS idx_history_monitor_id ON history(monitor_id)",
    CREATE_INDEX_HISTORY_TIMESTAMP:
        "CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp)",
    CREATE_INDEX_MONITORS_SITE_IDENTIFIER:
        "CREATE INDEX IF NOT EXISTS idx_monitors_site_identifier ON monitors(site_identifier)",
    CREATE_INDEX_MONITORS_TYPE:
        "CREATE INDEX IF NOT EXISTS idx_monitors_type ON monitors(type)",
    CREATE_TABLE_HISTORY: `
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                monitor_id TEXT NOT NULL,
                timestamp INTEGER,
                status TEXT,
                responseTime INTEGER,
                details TEXT,
                FOREIGN KEY(monitor_id) REFERENCES monitors(id)
            )`,
    CREATE_TABLE_LOGS: `
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                level TEXT,
                message TEXT,
                data TEXT
            )`,
    CREATE_TABLE_SETTINGS: `
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )`,
    CREATE_TABLE_SITES: `
            CREATE TABLE IF NOT EXISTS sites (
                identifier TEXT PRIMARY KEY,
                name TEXT,
                monitoring INTEGER DEFAULT 1
            )`,
    CREATE_TABLE_STATS: `
            CREATE TABLE IF NOT EXISTS stats (
                key TEXT PRIMARY KEY,
                value TEXT
            )`,
    ROLLBACK: "ROLLBACK",
} as const;

export const DATABASE_SCHEMA_VERSION = 3;

interface TableInfoRow {
    readonly name?: unknown;
    readonly type?: unknown;
}

function isTableInfoRow(value: unknown): value is TableInfoRow {
    return isRecord(value);
}

function listTableInfo(database: Database, tableName: string): TableInfoRow[] {
    try {
        // Table name is a hard-coded internal constant from this module.
        const rows = database.all(`PRAGMA table_info(${tableName})`) as unknown;

        if (!Array.isArray(rows)) {
            return [];
        }

        return rows.filter(isTableInfoRow);
    } catch {
        return [];
    }
}

function getColumnType(
    database: Database,
    tableName: string,
    columnName: string
): string | undefined {
    for (const row of listTableInfo(database, tableName)) {
        if (row.name === columnName && typeof row.type === "string") {
            return row.type;
        }
    }

    return undefined;
}

function hasColumn(
    database: Database,
    tableName: string,
    columnName: string
): boolean {
    return getColumnType(database, tableName, columnName) !== undefined;
}

/**
 * Ensures the SQLite user_version matches the application schema version.
 */
const hasUserVersionProperty = (
    value: unknown
): value is { user_version?: unknown } =>
    typeof value === "object" && value !== null && "user_version" in value;

/**
 * Validates a generated SQL schema string before execution.
 *
 * @remarks
 * Performs validation checks to ensure the schema is a non-empty string,
 * contains the required table definition, and does not include placeholder
 * values that indicate generation errors.
 *
 * @param schema - The generated SQL schema string to validate.
 *
 * @throws {@link Error} When schema validation fails.
 */
function validateGeneratedSchema(schema: string): void {
    if (!schema || typeof schema !== "string") {
        throw new Error("Generated schema is empty or invalid");
    }
    if (!schema.includes("CREATE TABLE IF NOT EXISTS monitors")) {
        throw new Error(
            "Generated schema missing required monitors table definition"
        );
    }
    if (schema.includes("undefined") || schema.includes("null")) {
        throw new Error("Generated schema contains undefined or null values");
    }
}

type SqliteBindValue = bigint | null | number | string | Uint8Array;

// eslint-disable-next-line sonarjs/function-return-type -- SQLite bind values legitimately vary by column type.
function toSqliteBindValue(value: unknown): SqliteBindValue {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === "string" || typeof value === "number") {
        return value;
    }

    if (typeof value === "bigint") {
        return value;
    }

    if (typeof value === "boolean") {
        return value ? 1 : 0;
    }

    if (value instanceof Uint8Array) {
        return value;
    }

    return safeStringify(value);
}

function createMigrationIndexes(database: Database): void {
    database.run(SCHEMA_QUERIES.CREATE_INDEX_MONITORS_SITE_IDENTIFIER);
    database.run(SCHEMA_QUERIES.CREATE_INDEX_MONITORS_TYPE);
    database.run(SCHEMA_QUERIES.CREATE_INDEX_HISTORY_MONITOR_ID);
    database.run(SCHEMA_QUERIES.CREATE_INDEX_HISTORY_TIMESTAMP);
}

function copyMonitorsFromVersion1(database: Database): void {
    const legacyMonitorRows = database.all(
        "SELECT * FROM monitors_v1"
    ) as Array<Record<string, unknown>>;

    if (legacyMonitorRows.length === 0) {
        return;
    }

    const columnRows = database.all(
        "PRAGMA table_info(monitors_v1)"
    ) as Array<{ name?: unknown }>;
    const legacyColumns = columnRows
        .map((row) => row.name)
        .filter((name): name is string => typeof name === "string");

    const copyColumns = legacyColumns.filter((col) => col !== "id");
    const insertColumns = ["id", ...copyColumns];
    const insertPlaceholders = insertColumns.map(() => "?").join(", ");

    // eslint-disable-next-line sql-template/no-unsafe-query -- Columns are derived from PRAGMA table_info(monitors_v1) and are not user-controlled.
    const insertSql = `INSERT INTO monitors (${insertColumns.join(", ")}) VALUES (${insertPlaceholders})`;
    const insertStatement = database.prepare(insertSql);

    const mapInsert = database.prepare(
        "INSERT INTO monitor_id_map (old_id, new_id) VALUES (?, ?)"
    );

    try {
        for (const row of legacyMonitorRows) {
            const oldId = row["id"];
            if (typeof oldId !== "number") {
                throw new TypeError(
                    "Unexpected monitor id type during migration"
                );
            }

            const newId = globalThis.crypto.randomUUID();

            const values: SqliteBindValue[] = [
                newId,
                ...copyColumns.map((column) =>
                    toSqliteBindValue(row[column])
                ),
            ];

            insertStatement.run(values);
            mapInsert.run([oldId, newId]);
        }
    } finally {
        insertStatement.finalize();
        mapInsert.finalize();
    }
}

function copyHistoryFromVersion1(database: Database): void {
    const legacyHistoryRows = database.all(
        "SELECT id, monitor_id, timestamp, status, responseTime, details FROM history_v1"
    ) as Array<Record<string, unknown>>;

    if (legacyHistoryRows.length === 0) {
        return;
    }

    const historyInsert = database.prepare(
        "INSERT INTO history (id, monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const mapper = database.prepare(
        "SELECT new_id as newId FROM monitor_id_map WHERE old_id = ?"
    );

    try {
        for (const row of legacyHistoryRows) {
            const oldMonitorId = row["monitor_id"];
            if (typeof oldMonitorId === "number") {
                const mappingCandidate: unknown = mapper.get([oldMonitorId]);
                const newIdCandidate: unknown =
                    typeof mappingCandidate === "object" &&
                    mappingCandidate !== null &&
                    "newId" in mappingCandidate
                        ? Reflect.get(mappingCandidate, "newId")
                        : undefined;

                if (typeof newIdCandidate === "string") {
                    historyInsert.run([
                        toSqliteBindValue(row["id"]),
                        newIdCandidate,
                        toSqliteBindValue(row["timestamp"]),
                        toSqliteBindValue(row["status"]),
                        toSqliteBindValue(row["responseTime"]),
                        toSqliteBindValue(row["details"]),
                    ]);
                }
            }
        }
    } finally {
        historyInsert.finalize();
        mapper.finalize();
    }
}

/**
 * Migrates schema version 1 to version 2.
 *
 * @remarks
 * Version 2 makes monitor identifiers stable across devices by switching the
 * `monitors.id` primary key from INTEGER AUTOINCREMENT to TEXT (UUID).
 *
 * The `history.monitor_id` foreign key is migrated from INTEGER to TEXT and
 * remapped to the new UUID monitor ids.
 */
function migrateSchemaToVersion2(database: Database): void {
    logger.warn("[DatabaseSchema] Running schema migration to v2");

    if (typeof globalThis.crypto.randomUUID !== "function") {
        throw new TypeError(
            "crypto.randomUUID is unavailable; cannot migrate monitor ids"
        );
    }

    database.run("PRAGMA foreign_keys = OFF");
    database.run(SCHEMA_QUERIES.BEGIN_TRANSACTION);

    try {
        database.run("ALTER TABLE monitors RENAME TO monitors_v1");
        database.run("ALTER TABLE history RENAME TO history_v1");

        // Recreate monitors/history tables with the new schema.
        const dynamicMonitorSchema = generateMonitorTableSchema();
        validateGeneratedSchema(dynamicMonitorSchema);
        database.run(dynamicMonitorSchema);
        database.run(SCHEMA_QUERIES.CREATE_TABLE_HISTORY);

        // Create a temp mapping table for history remapping.
        database.run(
            "CREATE TEMP TABLE monitor_id_map (old_id INTEGER PRIMARY KEY, new_id TEXT NOT NULL)"
        );

        copyMonitorsFromVersion1(database);
        copyHistoryFromVersion1(database);

        database.run("DROP TABLE monitors_v1");
        database.run("DROP TABLE history_v1");

        // Recreate indexes for the new tables.
        createMigrationIndexes(database);

        database.run(SCHEMA_QUERIES.COMMIT);
        database.run("PRAGMA foreign_keys = ON");
        logger.info("[DatabaseSchema] Migration v1 -> v2 complete");
    } catch (error) {
        database.run(SCHEMA_QUERIES.ROLLBACK);
        database.run("PRAGMA foreign_keys = ON");
        logger.error("[DatabaseSchema] Migration v1 -> v2 failed", error);
        throw error;
    }
}

/**
 * Migrates schema version 2 to version 3.
 *
 * @remarks
 * Version 3 introduces the `monitors.follow_redirects` column so HTTP-based
 * monitors can persist redirect preferences.
 */
function migrateSchemaToVersion3(database: Database): void {
    logger.warn("[DatabaseSchema] Running schema migration to v3");

    if (hasColumn(database, "monitors", "follow_redirects")) {
        logger.info(
            "[DatabaseSchema] Migration v2 -> v3 skipped (follow_redirects already present)"
        );
        return;
    }

    database.run(SCHEMA_QUERIES.BEGIN_TRANSACTION);
    try {
        database.run(
            "ALTER TABLE monitors ADD COLUMN follow_redirects INTEGER NOT NULL DEFAULT 1"
        );
        database.run(SCHEMA_QUERIES.COMMIT);
        logger.info("[DatabaseSchema] Migration v2 -> v3 complete");
    } catch (error) {
        database.run(SCHEMA_QUERIES.ROLLBACK);
        logger.error("[DatabaseSchema] Migration v2 -> v3 failed", error);
        throw error;
    }
}

/**
 * Ensures the PRAGMA user_version reflects the currently deployed schema.
 */
export function synchronizeDatabaseSchemaVersion(database: Database): void {
    const pragmaResult: unknown = database.get("PRAGMA user_version");

    const userVersionValue = hasUserVersionProperty(pragmaResult)
        ? pragmaResult.user_version
        : undefined;

    let currentVersion =
        typeof userVersionValue === "number" ? userVersionValue : 0;

    // Older builds may not have set PRAGMA user_version. Detect the legacy
    // v1 schema shape (INTEGER primary key) and upgrade through the normal
    // migration path.
    if (currentVersion === 0) {
        const idType = getColumnType(database, "monitors", "id");
        if (typeof idType === "string" && idType.toUpperCase() === "INTEGER") {
            currentVersion = 1;
        }
    }
    if (currentVersion === DATABASE_SCHEMA_VERSION) {
        return;
    }

    if (currentVersion > DATABASE_SCHEMA_VERSION) {
        logger.warn(
            `[DatabaseSchema] Database schema version ${currentVersion} is newer than app schema ${DATABASE_SCHEMA_VERSION}. Continuing without migration.`
        );
        return;
    }

    let workingVersion = currentVersion;

    if (workingVersion === 1) {
        migrateSchemaToVersion2(database);
        workingVersion = 2;
    }

    if (workingVersion === 2) {
        migrateSchemaToVersion3(database);
    }

    if (currentVersion === 0) {
        logger.info(
            `[DatabaseSchema] Initializing schema user_version to ${DATABASE_SCHEMA_VERSION}`
        );
    } else {
        logger.warn(
            `[DatabaseSchema] Updating schema user_version from ${currentVersion} to ${DATABASE_SCHEMA_VERSION}`
        );
    }

    database.run(`PRAGMA user_version = ${DATABASE_SCHEMA_VERSION}`);
}

/**
 * Creates database indexes for improved query performance.
 *
 * @remarks
 * Creates the following indexes:
 *
 * - `idx_monitors_site_identifier`: Fast site-based monitor queries
 * - `idx_monitors_type`: Monitor type filtering
 * - `idx_history_monitor_id`: Fast history lookups by monitor
 * - `idx_history_timestamp`: Time-based history queries
 *
 * @param db - The {@link Database} instance to create indexes on.
 *
 * @throws When index creation fails. Errors are logged and re-thrown for
 *   upstream handling.
 *
 * @public
 */
export function createDatabaseIndexes(db: Database): void {
    try {
        // Index on monitor site_identifier for faster site queries
        db.run(SCHEMA_QUERIES.CREATE_INDEX_MONITORS_SITE_IDENTIFIER);

        // Index on monitor type for monitor type queries
        db.run(SCHEMA_QUERIES.CREATE_INDEX_MONITORS_TYPE);

        // Index on history monitor_id for faster history queries
        db.run(SCHEMA_QUERIES.CREATE_INDEX_HISTORY_MONITOR_ID);

        // Index on history timestamp for time-based queries
        db.run(SCHEMA_QUERIES.CREATE_INDEX_HISTORY_TIMESTAMP);

        logger.debug(LOG_TEMPLATES.services.DATABASE_INDEXES_CREATED);
    } catch (error) {
        logger.error(LOG_TEMPLATES.errors.DATABASE_INDEXES_FAILED, error);
        throw error;
    }
}

/**
 * Creates all required database tables if they do not exist.
 *
 * @remarks
 * Creates the following tables:
 *
 * - `sites`: Site configuration and monitoring status
 * - `monitors`: Monitor configuration and runtime data (dynamic schema)
 * - `history`: Historical monitoring data
 * - `settings`: Application configuration
 * - `stats`: Runtime statistics
 * - `logs`: Application logs
 *
 * Uses dynamic schema generation for the monitors table. All table creation
 * operations are idempotent.
 *
 * @param db - The {@link Database} instance to create tables on.
 *
 * @throws When table creation fails. Errors are logged and re-thrown for
 *   upstream handling.
 *
 * @public
 */
export function createDatabaseTables(db: Database): void {
    try {
        // Sites table with INTEGER boolean for SQLite consistency
        db.run(SCHEMA_QUERIES.CREATE_TABLE_SITES);

        // Monitors table with dynamic schema based on monitor type registry
        const dynamicMonitorSchema = generateMonitorTableSchema();
        validateGeneratedSchema(dynamicMonitorSchema);
        db.run(dynamicMonitorSchema);

        // History table with proper constraints and clear field naming
        db.run(SCHEMA_QUERIES.CREATE_TABLE_HISTORY);

        // Settings table
        db.run(SCHEMA_QUERIES.CREATE_TABLE_SETTINGS);

        // Stats table
        db.run(SCHEMA_QUERIES.CREATE_TABLE_STATS);

        // Logs table
        db.run(SCHEMA_QUERIES.CREATE_TABLE_LOGS);

        logger.info(LOG_TEMPLATES.services.DATABASE_TABLES_CREATED);
    } catch (error) {
        logger.error(LOG_TEMPLATES.errors.DATABASE_TABLES_FAILED, error);
        throw error;
    }
}

/**
 * Sets up the monitor type validation framework for the database.
 *
 * @remarks
 * Integrates with {@link getRegisteredMonitorTypes} to provide runtime
 * validation of monitor types. Intended to set up database-level constraints
 * and validation triggers to ensure data integrity for monitor type fields.
 * Currently logs the available types and prepares for future enhancements.
 *
 * @returns Void
 *
 * @throws When validation setup fails. Errors are logged but not re-thrown, as
 *   this is a non-critical enhancement.
 *
 * @public
 */
export function setupMonitorTypeValidation(): void {
    try {
        // Get all currently registered monitor types
        const validTypes = getRegisteredMonitorTypes();

        if (validTypes.length === 0) {
            logger.warn(
                LOG_TEMPLATES.warnings.DATABASE_MONITOR_VALIDATION_MISSING
            );
        } else {
            logger.info(
                LOG_TEMPLATES.services.DATABASE_MONITOR_VALIDATION_INITIALIZED,
                {
                    count: validTypes.length,
                    validTypes,
                }
            );
        }

        // Future enhancement: Create database CHECK constraint or trigger
        // Example SQL for future implementation:
        // CREATE TRIGGER validate_monitor_type
        // BEFORE INSERT ON monitors
        // FOR EACH ROW
        // WHEN NEW.type NOT IN ('http', 'port', ...)
        // BEGIN
        //   SELECT RAISE(ABORT, 'Invalid monitor type');
        // END;

        logger.info(LOG_TEMPLATES.services.DATABASE_MONITOR_VALIDATION_READY);
    } catch (error) {
        logger.error(
            LOG_TEMPLATES.errors.DATABASE_VALIDATION_SETUP_FAILED,
            error
        );
        // Don't throw here - this is a non-critical enhancement
        // The application should still work without validation
        logger.warn(
            LOG_TEMPLATES.warnings.DATABASE_MONITOR_VALIDATION_CONTINUE
        );
    }
}

/**
 * Creates the full database schema (tables and indexes) within a transaction.
 *
 * @remarks
 * Creates all tables and indexes within coordinated operations to ensure
 * consistent schema creation. Uses explicit transaction handling via
 * BEGIN/COMMIT. Rolls back on error to maintain database integrity.
 *
 * @param db - The {@link Database} instance to create the schema on.
 *
 * @throws When schema creation fails. Errors are logged and re-thrown for
 *   upstream handling.
 *
 * @public
 */
export function createDatabaseSchema(db: Database): void {
    try {
        db.run(SCHEMA_QUERIES.BEGIN_TRANSACTION);

        try {
            createDatabaseTables(db);
            createDatabaseIndexes(db);
            setupMonitorTypeValidation();

            db.run(SCHEMA_QUERIES.COMMIT);
            logger.info(LOG_TEMPLATES.services.DATABASE_SCHEMA_CREATED);
        } catch (error) {
            db.run(SCHEMA_QUERIES.ROLLBACK);
            throw error;
        }
    } catch (error) {
        logger.error(LOG_TEMPLATES.errors.DATABASE_SCHEMA_FAILED, error);
        throw error;
    }
}
