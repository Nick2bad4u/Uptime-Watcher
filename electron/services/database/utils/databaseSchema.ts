import { Database } from "node-sqlite3-wasm";

import { logger } from "../../../utils/index";

/**
 * Database schema management utilities.
 */

/**
 * Create all required database tables if they don't exist.
 */
export async function createDatabaseTables(db: Database): Promise<void> {
    try {
        // Sites table
        db.run(`
            CREATE TABLE IF NOT EXISTS sites (
                identifier TEXT PRIMARY KEY,
                name TEXT
            );
        `);

        // Monitors table
        db.run(`
            CREATE TABLE IF NOT EXISTS monitors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                site_identifier TEXT,
                type TEXT,
                url TEXT,
                host TEXT,
                port INTEGER,
                checkInterval INTEGER,
                timeout INTEGER,
                retryAttempts INTEGER DEFAULT 0,
                monitoring BOOLEAN,
                status TEXT,
                responseTime INTEGER,
                lastChecked DATETIME,
                FOREIGN KEY(site_identifier) REFERENCES sites(identifier)
            );
        `);

        // History table
        db.run(`
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                monitor_id INTEGER,
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
