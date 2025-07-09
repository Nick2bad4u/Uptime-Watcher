import { app } from "electron";
import { Database } from "node-sqlite3-wasm";
import * as path from "node:path";

import { logger } from "../../utils/index";
import { createDatabaseBackup, createDatabaseTables } from "./utils/index";

/**
 * Service responsible for database initialization and schema management.
 * Handles database connection and table creation.
 */
export class DatabaseService {
    private static instance: DatabaseService;
    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    private _db: Database | undefined = undefined;

    private constructor() {
        // Private constructor for singleton pattern
    }

    /**
     * Initialize the database connection and create tables if they don't exist.
     */
    public initialize(): Database {
        if (this._db) {
            return this._db;
        }

        try {
            const dbPath = path.join(app.getPath("userData"), "uptime-watcher.sqlite");
            logger.info(`[DatabaseService] Initializing SQLite DB at: ${dbPath}`);

            this._db = new Database(dbPath);
            createDatabaseTables(this._db);

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
     * Download database backup as buffer.
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        const { app } = await import("electron");
        const path = await import("node:path");
        const dbPath = path.join(app.getPath("userData"), "uptime-watcher.sqlite");
        return createDatabaseBackup(dbPath);
    }

    /**
     * Execute a function within a database transaction.
     * If the function throws an error, the transaction will be rolled back.
     */
    public async executeTransaction<T>(operation: (db: Database) => Promise<T>): Promise<T> {
        const db = this.getDatabase();

        try {
            db.run("BEGIN TRANSACTION");
            const result = await operation(db);
            db.run("COMMIT");
            return result;
        } catch (error) {
            try {
                db.run("ROLLBACK");
            } catch (rollbackError) {
                logger.error("[DatabaseService] Failed to rollback transaction", rollbackError);
            }
            throw error;
        }
    }

    /**
     * Close the database connection.
     */
    public close(): void {
        if (this._db) {
            try {
                this._db.close();
                this._db = undefined;
                logger.info("[DatabaseService] Database connection closed");
            } catch (error) {
                logger.error("[DatabaseService] Failed to close database", error);
                throw error;
            }
        }
    }
}
