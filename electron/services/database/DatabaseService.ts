import { app } from "electron";
import { Database } from "node-sqlite3-wasm";
import * as fs from "node:fs";
// eslint-disable-next-line unicorn/import-style -- Need namespace import for both sync and async usage
import * as path from "node:path";

import { logger } from "../../utils/logger";
import { createDatabaseBackup } from "./utils/databaseBackup";
import { createDatabaseIndexes, createDatabaseTables, setupMonitorTypeValidation } from "./utils/databaseSchema";

/**
 * Core database service for SQLite connection and schema management.
 *
 * @remarks
 * Provides a singleton interface for low-level database operations:
 * - Connection management
 * - Schema creation and management
 * - Transaction support
 * - Basic backup functionality
 *
 * Business logic (site loading, import/export, etc.) is handled by DatabaseManager.
 *
 * @example
 * ```typescript
 * const dbService = DatabaseService.getInstance();
 * dbService.initialize();
 * const db = dbService.getDatabase();
 * ```
 */
export class DatabaseService {
    private static readonly instance: DatabaseService = new DatabaseService();

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

    /**
     * Create a basic backup of the database as a downloadable buffer.
     *
     * @returns Promise resolving to backup data and filename
     *
     * @throws {@link Error} When backup creation fails
     *
     * @remarks
     * Creates a compressed backup of the entire database suitable for download or storage.
     * For advanced backup features with event emission, use DatabaseManager.
     */
    public async createBackup(): Promise<{ buffer: Buffer; fileName: string }> {
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
     * Initialize the database connection and create schema if it doesn't exist.
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

            // Check if database file is locked by another process
            this.checkDatabaseAccess(dbPath);

            this._db = new Database(dbPath);

            // Note: Some PRAGMA statements may not be supported by SQLite WASM
            // Commenting out temporarily to fix database lock issue
            // this._db.run("PRAGMA journal_mode = WAL");
            // this._db.run("PRAGMA synchronous = NORMAL");
            // this._db.run("PRAGMA temp_store = MEMORY");
            // this._db.run("PRAGMA mmap_size = 268435456"); // 256MB

            createDatabaseTables(this._db);
            createDatabaseIndexes(this._db);
            setupMonitorTypeValidation();

            logger.info("[DatabaseService] Database initialized successfully");
            return this._db;
        } catch (error) {
            logger.error("[DatabaseService] Failed to initialize database", error);

            // Provide specific guidance for database lock errors
            if (error instanceof Error && error.message.includes("database is locked")) {
                logger.error("[DatabaseService] Database is locked. This usually means:");
                logger.error("  1. Another instance of Uptime Watcher is already running");
                logger.error("  2. The database file is being accessed by another process");
                logger.error("  3. Previous instance didn't close properly");
                logger.error("  Solution: Close all instances and restart the application");
            }

            throw error;
        }
    }

    /**
     * Check if database file can be accessed before attempting to open it.
     */
    private checkDatabaseAccess(dbPath: string): void {
        try {
            // Check if file exists and we can access it
            if (fs.existsSync(dbPath)) {
                // Try to open the file for writing to check if it's locked
                const fd = fs.openSync(dbPath, "r+");
                fs.closeSync(fd);
                logger.debug("[DatabaseService] Database file access check passed");
            } else {
                logger.debug("[DatabaseService] Database file doesn't exist yet, will be created");
            }
        } catch (error) {
            logger.warn("[DatabaseService] Database file access check failed:", error);
            // Don't throw here, let SQLite handle the actual error
        }
    }
}
