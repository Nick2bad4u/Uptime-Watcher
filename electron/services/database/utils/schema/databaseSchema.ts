import type { Database } from "node-sqlite3-wasm";

import { ensureError } from "@shared/utils/errorHandling";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";

import { logger } from "../../../../utils/logger";
import { getRegisteredMonitorTypes } from "../../../monitoring/MonitorTypeRegistry";
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

/**
 * Ensures the PRAGMA user_version reflects the currently deployed schema.
 */
export function synchronizeDatabaseSchemaVersion(database: Database): void {
    const pragmaResult: unknown = database.get("PRAGMA user_version");

    const userVersionValue = hasUserVersionProperty(pragmaResult)
        ? pragmaResult.user_version
        : undefined;

    const currentVersion =
        typeof userVersionValue === "number" ? userVersionValue : 0;

    // Development policy: we intentionally do NOT run migrations.
    // - Fresh databases may have user_version unset (0); initialize it.
    // - Any other mismatch requires recreating the database.
    if (currentVersion === 0) {
        logger.info(
            `[DatabaseSchema] Initializing schema user_version to ${DATABASE_SCHEMA_VERSION}`
        );
        database.run(`PRAGMA user_version = ${DATABASE_SCHEMA_VERSION}`);
        return;
    }

    if (currentVersion !== DATABASE_SCHEMA_VERSION) {
        throw new Error(
            `Database schema version ${currentVersion} is not supported in this development build (expected ${DATABASE_SCHEMA_VERSION}). ` +
                "Delete the database file and restart the app to recreate it."
        );
    }
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
        const normalizedError = ensureError(error);
        logger.error(
            LOG_TEMPLATES.errors.DATABASE_INDEXES_FAILED,
            normalizedError
        );
        throw normalizedError;
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
        const normalizedError = ensureError(error);
        logger.error(LOG_TEMPLATES.errors.DATABASE_TABLES_FAILED, normalizedError);
        throw normalizedError;
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
