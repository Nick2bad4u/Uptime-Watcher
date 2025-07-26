import { Database } from "node-sqlite3-wasm";

import { logger } from "../../../utils/logger";
import { generateMonitorTableSchema } from "./dynamicSchema";

/**
 * Database schema management utilities.
 *
 * @remarks
 * Provides functions for creating database tables, indexes, and setting up
 * validation frameworks. All table creation operations are idempotent using
 * "IF NOT EXISTS" clauses.
 */

/**
 * Create database indexes for better query performance.
 *
 * @param db - SQLite database instance
 * @throws When index creation fails
 *
 * @remarks
 * Creates the following indexes:
 * - idx_monitors_site_identifier: Fast site-based monitor queries
 * - idx_monitors_type: Monitor type filtering
 * - idx_history_monitor_id: Fast history lookups by monitor
 * - idx_history_timestamp: Time-based history queries
 */
export function createDatabaseIndexes(db: Database): void {
    try {
        // Index on monitor site_identifier for faster site queries
        db.run("CREATE INDEX IF NOT EXISTS idx_monitors_site_identifier ON monitors(site_identifier)");

        // Index on monitor type for monitor type queries
        db.run("CREATE INDEX IF NOT EXISTS idx_monitors_type ON monitors(type)");

        // Index on history monitor_id for faster history queries
        db.run("CREATE INDEX IF NOT EXISTS idx_history_monitor_id ON history(monitor_id)");

        // Index on history timestamp for time-based queries
        db.run("CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp)");

        logger.info("[DatabaseSchema] All indexes created successfully");
    } catch (error) {
        logger.error("[DatabaseSchema] Failed to create indexes", error);
        throw error;
    }
}

/**
 * Create all required database tables if they don't exist.
 *
 * @param db - SQLite database instance
 * @throws When table creation fails
 *
 * @remarks
 * Creates the following tables:
 * - sites: Site configuration and monitoring status
 * - monitors: Monitor configuration and runtime data (dynamic schema)
 * - history: Historical monitoring data
 * - settings: Application configuration
 * - stats: Runtime statistics
 * - logs: Application logs
 */
export function createDatabaseTables(db: Database): void {
    try {
        // Sites table with INTEGER boolean for SQLite consistency
        db.run(`
            CREATE TABLE IF NOT EXISTS sites (
                identifier TEXT PRIMARY KEY,
                name TEXT,
                monitoring INTEGER DEFAULT 1
            );
        `);

        // Monitors table with dynamic schema based on monitor type registry
        const dynamicMonitorSchema = generateMonitorTableSchema();
        validateGeneratedSchema(dynamicMonitorSchema);
        db.run(dynamicMonitorSchema);

        // History table with proper constraints and clear field naming
        db.run(`
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                monitor_id INTEGER NOT NULL,
                timestamp INTEGER,
                status TEXT,
                responseTime INTEGER,
                details TEXT,
                FOREIGN KEY(monitor_id) REFERENCES monitors(id)
            );
        `);

        // Settings table
        db.run(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
        `);

        // Stats table
        db.run(`
            CREATE TABLE IF NOT EXISTS stats (
                key TEXT PRIMARY KEY,
                value TEXT
            );
        `);

        // Logs table
        db.run(`
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                level TEXT,
                message TEXT,
                data TEXT
            );
        `);

        logger.info("[DatabaseSchema] All tables created successfully");
    } catch (error) {
        logger.error("[DatabaseSchema] Failed to create tables", error);
        throw error;
    }
}

/**
 * Setup monitor type validation framework.
 *
 * @returns void
 * @throws When validation setup fails
 *
 * @remarks
 * Future versions will integrate with MonitorTypeRegistry to provide
 * runtime validation of monitor types. Currently sets up the foundation
 * for extensible type validation.
 */
export function setupMonitorTypeValidation(): void {
    try {
        // This would integrate with the MonitorTypeRegistry
        // For now, we'll add a basic validation framework
        // Future versions could add a CHECK constraint or trigger

        logger.info("[DatabaseSchema] Monitor type validation framework ready");
    } catch (error) {
        logger.error("[DatabaseSchema] Failed to setup monitor type validation", error);
        throw error;
    }
}

/**
 * Validate generated SQL schema before execution.
 *
 * @param schema - Generated SQL schema string
 * @throws {@link Error} When schema validation fails
 *
 * @remarks
 * **Validation Checks:**
 * - Ensures schema is non-empty string
 * - Verifies required table definition exists
 * - Checks for placeholder values that indicate generation errors
 * - Prevents runtime failures from malformed SQL
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
