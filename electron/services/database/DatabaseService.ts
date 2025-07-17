import { app } from "electron";
import { Database } from "node-sqlite3-wasm";
// eslint-disable-next-line unicorn/import-style -- Need namespace import for both sync and async usage
import * as path from "node:path";

import { logger } from "../../utils/logger";
import {
    createDatabaseBackup,
    createDatabaseTables,
    createDatabaseIndexes,
    setupMonitorTypeValidation,
} from "./utils/index";

/**
 * Database service for SQLite connection and transaction management.
 *
 * @remarks
 * Provides a singleton interface for database operations with automatic
 * connection management, schema initialization, and transaction support.
 * All database operations should go through this service for consistency.
 *
 * @example
 * ```typescript
 * const dbService = DatabaseService.getInstance();
 * await dbService.initialize();
 * const db = dbService.getDatabase();
 * ```
 */
export class DatabaseService {
    private static readonly instance: DatabaseService = new DatabaseService();

    /**
     * Get the singleton database service instance.
     *
     * @returns The shared DatabaseService instance
     *
     * @remarks
     * Uses singleton pattern to ensure only one database connection
     * exists throughout the application lifecycle.
     */
    public static getInstance(): DatabaseService {
        return DatabaseService.instance;
    }

    private _db: Database | undefined = undefined;

    /**
     * Private constructor for singleton pattern.
     *
     * @remarks
     * Use {@link DatabaseService.getInstance} to get the service instance.
     */
    private constructor() {
        // Private constructor for singleton pattern
    }

    /**
     * Initialize the database connection and create tables if they don't exist.
     *
     * @returns The initialized database instance
     *
     * @throws {@link Error} When database initialization fails
     *
     * @remarks
     * Creates the database file in the user data directory if it doesn't exist.
     * Sets up the complete schema including all required tables and indexes.
     * Safe to call multiple times - returns existing connection if already initialized.
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
            createDatabaseIndexes(this._db);
            setupMonitorTypeValidation();

            logger.info("[DatabaseService] Database initialized successfully");
            return this._db;
        } catch (error) {
            logger.error("[DatabaseService] Failed to initialize database", error);
            throw error;
        }
    }

    /**
     * Get the database instance.
     *
     * @returns The active database connection
     *
     * @throws {@link Error} When database is not initialized
     *
     * @remarks
     * Call {@link DatabaseService.initialize} first to set up the database connection.
     */
    public getDatabase(): Database {
        if (!this._db) {
            throw new Error("Database not initialized. Call initialize() first.");
        }
        return this._db;
    }

    /**
     * Create a backup of the database as a downloadable buffer.
     *
     * @returns Promise resolving to backup data and filename
     *
     * @throws {@link Error} When backup creation fails
     *
     * @remarks
     * Creates a compressed backup of the entire database suitable for download or storage.
     * The backup includes all tables, data, and schema information.
     */
    public async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        const { app } = await import("electron");
        const dbPath = path.join(app.getPath("userData"), "uptime-watcher.sqlite");
        return createDatabaseBackup(dbPath);
    }

    /**
     * Execute a function within a database transaction.
     *
     * @param operation - Function to execute within the transaction
     * @returns Promise resolving to the operation result
     *
     * @throws {@link Error} When transaction fails or operation throws
     *
     * @remarks
     * Automatically handles transaction lifecycle:
     * - Begins transaction before operation
     * - Commits transaction on successful completion
     * - Rolls back transaction if operation throws
     * Ensures data consistency for complex operations involving multiple queries.
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
     *
     * @throws {@link Error} When connection close fails
     *
     * @remarks
     * Safely closes the database connection and cleans up resources.
     * Should be called during application shutdown to ensure proper cleanup.
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
