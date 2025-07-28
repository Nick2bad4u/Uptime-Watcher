import { Database } from "node-sqlite3-wasm";

import { logger } from "../../../utils/logger";
import { getRegisteredMonitorTypes } from "../../monitoring/MonitorTypeRegistry";
import { generateMonitorTableSchema } from "./dynamicSchema";

/**
 * Utilities for managing the SQLite database schema, including table and index creation and validation setup.
 *
 * @remarks
 * Provides functions for creating database tables, indexes, and setting up validation frameworks. All table creation operations are idempotent using "IF NOT EXISTS" clauses. Used during application startup and migrations.
 *
 * @public
 */

/**
 * Common SQL queries for database schema operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant is internal to the utility module and not exported.
 * @internal
 */
const SCHEMA_QUERIES = {
    BEGIN_TRANSACTION: "BEGIN TRANSACTION",
    COMMIT: "COMMIT",
    CREATE_INDEX_HISTORY_MONITOR_ID: "CREATE INDEX IF NOT EXISTS idx_history_monitor_id ON history(monitor_id)",
    CREATE_INDEX_HISTORY_TIMESTAMP: "CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp)",
    CREATE_INDEX_MONITORS_SITE_IDENTIFIER:
        "CREATE INDEX IF NOT EXISTS idx_monitors_site_identifier ON monitors(site_identifier)",
    CREATE_INDEX_MONITORS_TYPE: "CREATE INDEX IF NOT EXISTS idx_monitors_type ON monitors(type)",
    CREATE_TABLE_HISTORY: `
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                monitor_id INTEGER NOT NULL,
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

/**
 * Creates database indexes for improved query performance.
 *
 * @remarks
 * Creates the following indexes:
 * - `idx_monitors_site_identifier`: Fast site-based monitor queries
 * - `idx_monitors_type`: Monitor type filtering
 * - `idx_history_monitor_id`: Fast history lookups by monitor
 * - `idx_history_timestamp`: Time-based history queries
 *
 * @param db - The {@link Database} instance to create indexes on.
 * @throws When index creation fails. Errors are logged and re-thrown for upstream handling.
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

        logger.debug("[DatabaseSchema] All indexes created successfully");
    } catch (error) {
        logger.error("[DatabaseSchema] Failed to create indexes", error);
        throw error;
    }
}

/**
 * Creates the full database schema (tables and indexes) within a transaction.
 *
 * @remarks
 * Creates all tables and indexes within coordinated operations to ensure consistent schema creation. Uses explicit transaction handling via BEGIN/COMMIT. Rolls back on error to maintain database integrity.
 *
 * @param db - The {@link Database} instance to create the schema on.
 * @throws When schema creation fails. Errors are logged and re-thrown for upstream handling.
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
            logger.info("[DatabaseSchema] Database schema created successfully");
        } catch (error) {
            db.run(SCHEMA_QUERIES.ROLLBACK);
            throw error;
        }
    } catch (error) {
        logger.error("[DatabaseSchema] Failed to create database schema", error);
        throw error;
    }
}

/**
 * Creates all required database tables if they do not exist.
 *
 * @remarks
 * Creates the following tables:
 * - `sites`: Site configuration and monitoring status
 * - `monitors`: Monitor configuration and runtime data (dynamic schema)
 * - `history`: Historical monitoring data
 * - `settings`: Application configuration
 * - `stats`: Runtime statistics
 * - `logs`: Application logs
 *
 * Uses dynamic schema generation for the monitors table. All table creation operations are idempotent.
 *
 * @param db - The {@link Database} instance to create tables on.
 * @throws When table creation fails. Errors are logged and re-thrown for upstream handling.
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

        logger.info("[DatabaseSchema] All tables created successfully");
    } catch (error) {
        logger.error("[DatabaseSchema] Failed to create tables", error);
        throw error;
    }
}

/**
 * Sets up the monitor type validation framework for the database.
 *
 * @remarks
 * Integrates with {@link getRegisteredMonitorTypes} to provide runtime validation of monitor types. Intended to set up database-level constraints and validation triggers to ensure data integrity for monitor type fields. Currently logs the available types and prepares for future enhancements.
 *
 * @returns void
 * @throws When validation setup fails. Errors are logged but not re-thrown, as this is a non-critical enhancement.
 * @public
 */
export function setupMonitorTypeValidation(): void {
    try {
        // Get all currently registered monitor types
        const validTypes = getRegisteredMonitorTypes();

        if (validTypes.length === 0) {
            logger.warn("[DatabaseSchema] No monitor types registered - validation will allow any type");
        } else {
            logger.info("[DatabaseSchema] Monitor type validation initialized", {
                count: validTypes.length,
                validTypes,
            });
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

        logger.info("[DatabaseSchema] Monitor type validation framework ready");
    } catch (error) {
        logger.error("[DatabaseSchema] Failed to setup monitor type validation", error);
        // Don't throw here - this is a non-critical enhancement
        // The application should still work without validation
        logger.warn("[DatabaseSchema] Continuing without monitor type validation");
    }
}

/**
 * Validates a generated SQL schema string before execution.
 *
 * @remarks
 * Performs validation checks to ensure the schema is a non-empty string, contains the required table definition, and does not include placeholder values that indicate generation errors. Prevents runtime failures from malformed SQL.
 *
 * @param schema - The generated SQL schema string to validate.
 * @throws {@link Error} When schema validation fails due to missing or invalid content.
 * @internal
 */
function validateGeneratedSchema(schema: string): void {
    if (!schema || typeof schema !== "string") {
        throw new Error("Generated schema is empty or invalid");
    }
    if (!schema.includes("CREATE TABLE IF NOT EXISTS monitors")) {
        throw new Error("Generated schema missing required monitors table definition");
    }
    if (schema.includes("undefined") || schema.includes("null")) {
        throw new Error("Generated schema contains undefined or null values");
    }
}
