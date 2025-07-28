import { app } from "electron";
import { Database } from "node-sqlite3-wasm";
// eslint-disable-next-line unicorn/import-style -- Need namespace import for both sync and async usage
import * as path from "node:path";

import { DB_FILE_NAME } from "../../constants";
import { logger } from "../../utils/logger";
import { createDatabaseSchema } from "./utils/databaseSchema";

/**
 * @public
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
 * **Platform Compatibility:**
 * - Built for Electron main process environment
 * - Uses node-sqlite3-wasm (compiled for Node.js compatibility)
 * - No platform-specific caveats for Windows/macOS/Linux
 * - WASM binary ensures consistent behavior across platforms
 *
 * **Thread Safety:**
 * - Singleton pattern ensures single database connection
 * - node-sqlite3-wasm operations are synchronous and thread-safe
 * - Multiple initialize() calls return same connection (idempotent)
 * - Concurrent access handled at application service layer
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
     * Gets the singleton database service instance.
     *
     * @returns The shared DatabaseService instance.
     * @remarks
     * Uses singleton pattern to ensure only one database connection
     * exists throughout the application lifecycle.
     * @example
     * ```typescript
     * const dbService = DatabaseService.getInstance();
     * ```
     */
    public static getInstance(): DatabaseService {
        return DatabaseService.instance;
    }

    /**
     * Closes the database connection safely.
     *
     * @returns void
     * @throws {@link Error} When connection close fails.
     * @remarks
     * **Safety Considerations:**
     * - Safe to call multiple times (idempotent operation)
     * - In node-sqlite3-wasm, pending operations complete before close
     * - All transactions are completed synchronously before closure
     * - Should be called during application shutdown for proper cleanup
     *
     * **Platform Compatibility:**
     * - Optimized for Electron main process environment
     * - Uses node-sqlite3-wasm which is compiled for Node.js compatibility
     * - No platform-specific caveats for Windows/macOS/Linux
     * @example
     * ```typescript
     * dbService.close();
     * ```
     */
    public close(): void {
        if (this._db) {
            try {
                // node-sqlite3-wasm completes all pending operations before closing
                this._db.close();
                this._db = undefined;
                logger.info("[DatabaseService] Database connection closed safely");
            } catch (error) {
                logger.error("[DatabaseService] Failed to close database", error);
                throw error;
            }
        }
        // Safe to call when already closed - no-op behavior
    }

    /**
     * Executes a function within a database transaction.
     *
     * @typeParam T - The return type of the operation.
     * @param operation - Function to execute within the transaction.
     * @returns Promise resolving to the operation result.
     * @throws {@link Error} When transaction fails or operation throws.
     * @remarks
     * **Transaction Behavior in node-sqlite3-wasm:**
     * - All operations (BEGIN, COMMIT, ROLLBACK) are synchronous
     * - No race conditions possible due to synchronous execution
     * - Automatic rollback on operation failure ensures consistency
     * - Nested transactions not supported (will throw error)
     *
     * Automatically handles transaction lifecycle:
     * - Begins transaction before operation
     * - Commits transaction on successful completion
     * - Rolls back transaction if operation throws
     * Ensures data consistency for complex operations involving multiple queries.
     * @example
     * ```typescript
     * await dbService.executeTransaction(async (db) => {
     *   // ...your db logic...
     * });
     * ```
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
     * Gets the database instance.
     *
     * @returns The active database connection.
     * @throws {@link Error} When database is not initialized.
     * @remarks
     * Call {@link DatabaseService.initialize} first to set up the database connection.
     * @example
     * ```typescript
     * const db = dbService.getDatabase();
     * ```
     */
    public getDatabase(): Database {
        if (!this._db) {
            throw new Error("Database not initialized. Call initialize() first.");
        }
        return this._db;
    }

    /**
     * Initializes the database connection and creates schema if it doesn't exist.
     *
     * @returns The initialized database instance.
     * @throws {@link Error} When database initialization fails.
     * @remarks
     * **Initialization Behavior:**
     * - Creates the database file in the user data directory if it doesn't exist
     * - Sets up the complete schema including all required tables and indexes
     * - Safe to call multiple times - returns existing connection if already initialized
     * - Uses singleton pattern to prevent multiple connections
     *
     * **Thread Safety:**
     * - Multiple concurrent calls are safe (idempotent operation)
     * - Returns same Database instance for all callers
     * - No locking required due to synchronous initialization
     *
     * **Schema Setup:**
     * - setupMonitorTypeValidation() intentionally receives no database parameter
     * - Future validation logic may require database access for consistency
     * @example
     * ```typescript
     * dbService.initialize();
     * ```
     */
    public initialize(): Database {
        if (this._db) {
            return this._db;
        }

        try {
            const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);
            logger.info(`[DatabaseService] Initializing SQLite DB at: ${dbPath}`);

            this._db = new Database(dbPath);

            createDatabaseSchema(this._db);

            logger.info("[DatabaseService] Database initialized successfully");
            return this._db;
        } catch (error) {
            logger.error("[DatabaseService] Failed to initialize database", error);
            throw error;
        }
    }
}
