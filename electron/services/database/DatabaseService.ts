import { app } from "electron";
import { Database } from "node-sqlite3-wasm";
import * as path from "path";

import { logger } from "../../utils/logger";

/**
 * Service responsible for database initialization and schema management.
 * Handles database connection and table creation.
 */
export class DatabaseService {
    private static instance: DatabaseService;
    private _db: Database | undefined = undefined;

    private constructor() {}

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    /**
     * Initialize the database connection and create tables if they don't exist.
     */
    public async initialize(): Promise<Database> {
        if (this._db) {
            return this._db;
        }

        try {
            const dbPath = path.join(app.getPath("userData"), "uptime-watcher.sqlite");
            logger.info(`[DatabaseService] Initializing SQLite DB at: ${dbPath}`);

            this._db = new Database(dbPath);
            await this.createTables();

            logger.info("[DatabaseService] Database initialized successfully");
            return this._db;
        } catch (error) {
            logger.error("[DatabaseService] Failed to initialize database", error);
            throw error;
        }
    }

    /**
     * Get the database instance. Throws if not initialized.
     */
    public getDatabase(): Database {
        if (!this._db) {
            throw new Error("Database not initialized. Call initialize() first.");
        }
        return this._db;
    }

    /**
     * Create all required database tables if they don't exist.
     */
    private async createTables(): Promise<void> {
        if (!this._db) {
            throw new Error("Database not initialized");
        }

        try {
            // Sites table
            await this._db.run(`
                CREATE TABLE IF NOT EXISTS sites (
                    identifier TEXT PRIMARY KEY,
                    name TEXT
                );
            `);

            // Monitors table
            await this._db.run(`
                CREATE TABLE IF NOT EXISTS monitors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    site_identifier TEXT,
                    type TEXT,
                    url TEXT,
                    host TEXT,
                    port INTEGER,
                    checkInterval INTEGER,
                    timeout INTEGER,
                    monitoring BOOLEAN,
                    status TEXT,
                    responseTime INTEGER,
                    lastChecked DATETIME,
                    FOREIGN KEY(site_identifier) REFERENCES sites(identifier)
                );
            `);

            // History table
            await this._db.run(`
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
            await this._db.run(`
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
            `);

            // Stats table
            await this._db.run(`
                CREATE TABLE IF NOT EXISTS stats (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
            `);

            // Logs table
            await this._db.run(`
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    level TEXT,
                    message TEXT,
                    data TEXT
                );
            `);

            logger.info("[DatabaseService] All tables created successfully");
        } catch (error) {
            logger.error("[DatabaseService] Failed to create tables", error);
            throw error;
        }
    }

    /**
     * Close the database connection.
     */
    public async close(): Promise<void> {
        if (this._db) {
            try {
                await this._db.close();
                this._db = undefined;
                logger.info("[DatabaseService] Database connection closed");
            } catch (error) {
                logger.error("[DatabaseService] Failed to close database", error);
                throw error;
            }
        }
    }

    /**
     * Download database backup as buffer.
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        try {
            const { app } = await import("electron");
            const fs = await import("fs");
            const path = await import("path");

            const dbPath = path.join(app.getPath("userData"), "uptime-watcher.sqlite");
            const buffer = fs.readFileSync(dbPath);

            logger.info("[DatabaseService] Database backup created successfully");
            return {
                buffer,
                fileName: "uptime-watcher-backup.sqlite",
            };
        } catch (error) {
            logger.error("[DatabaseService] Failed to create database backup", error);
            throw error;
        }
    }
}
