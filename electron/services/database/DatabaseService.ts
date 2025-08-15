import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { app } from "electron";
import { Database } from "node-sqlite3-wasm";
// eslint-disable-next-line unicorn/import-style -- Need namespace import for both sync and async usage
import * as path from "node:path";

import { DB_FILE_NAME } from "../../constants";
import { logger } from "../../utils/logger";
import { createDatabaseSchema } from "./utils/databaseSchema";

/**
 * Common SQL queries for database service operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant
 * is internal to the service and not exported.
 *
 * @internal
 */
const DATABASE_SERVICE_QUERIES = {
    BEGIN_TRANSACTION: "BEGIN TRANSACTION",
    COMMIT: "COMMIT",
    ROLLBACK: "ROLLBACK",
} as const;

/**
 * @remarks
 * Provides a singleton interface for low-level database operations:
 *
 * - Connection management
 * - Schema creation and management
 * - Transaction support
 * - Basic backup functionality
 *
 * Business logic (site loading, import/export, etc.) is handled by
 * DatabaseManager.
 *
 * **Platform Compatibility:**
 *
 * - Built for Electron main process environment
 * - Uses node-sqlite3-wasm (compiled for Node.js compatibility)
 * - No platform-specific caveats for Windows/macOS/Linux
 * - WASM binary ensures consistent behavior across platforms
 *
 * **Thread Safety:**
 *
 * - Singleton pattern ensures single database connection
 * - Node-sqlite3-wasm operations are synchronous and thread-safe
 * - Multiple initialize() calls return same connection (idempotent)
 * - Concurrent access handled at application service layer
 *
 * @example
 *
 * ```typescript
 * const dbService = DatabaseService.getInstance();
 * dbService.initialize();
 * const db = dbService.getDatabase();
 * ```
 *
 * @public
 * Core database service for SQLite connection and schema management.
 */
export class DatabaseService {
    private static readonly instance: DatabaseService = new DatabaseService();

    private db: Database | undefined;

    /**
     * Gets the singleton database service instance.
     *
     * @remarks
     * Uses singleton pattern to ensure only one database connection exists
     * throughout the application lifecycle.
     *
     * @example
     *
     * ```typescript
     * const dbService = DatabaseService.getInstance();
     * ```
     *
     * @returns The shared DatabaseService instance.
     */
    public static getInstance(): DatabaseService {
        return DatabaseService.instance;
    }

    /**
     * Executes a function within a database transaction.
     *
     * @remarks
     * **Transaction Behavior in node-sqlite3-wasm:**
     *
     * - All operations (BEGIN, COMMIT, ROLLBACK) are synchronous
     * - No race conditions possible due to synchronous execution
     * - Automatic rollback on operation failure ensures consistency
     * - Nested transactions not supported (will throw error)
     *
     * Automatically handles transaction lifecycle:
     *
     * - Begins transaction before operation
     * - Commits transaction on successful completion
     * - Rolls back transaction if operation throws Ensures data consistency for
     *   complex operations involving multiple queries.
     *
     * @example
     *
     * ```typescript
     * await dbService.executeTransaction(async (db) => {
     *     // ...your db logic...
     * });
     * ```
     *
     * @typeParam T - The return type of the operation.
     *
     * @param operation - Function to execute within the transaction.
     *
     * @returns Promise resolving to the operation result.
     *
     * @throws {@link Error} When transaction fails or operation throws.
     */
    public async executeTransaction<T>(
        operation: (db: Database) => Promise<T>
    ): Promise<T> {
        const db = this.getDatabase();

        try {
            db.run(DATABASE_SERVICE_QUERIES.BEGIN_TRANSACTION);
            // Execute operation and commit on success
            return await operation(db).then((result) => {
                db.run(DATABASE_SERVICE_QUERIES.COMMIT);
                return result;
            });
        } catch (error) {
            try {
                db.run(DATABASE_SERVICE_QUERIES.ROLLBACK);
            } catch (rollbackError) {
                logger.error(
                    "[DatabaseService] Failed to rollback transaction",
                    rollbackError
                );
            }
            throw error;
        }
    }

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
     * Closes the database connection safely.
     *
     * @remarks
     * **Safety Considerations:**
     *
     * - Safe to call multiple times (idempotent operation)
     * - In node-sqlite3-wasm, pending operations complete before close
     * - All transactions are completed synchronously before closure
     * - Should be called during application shutdown for proper cleanup
     *
     * **Platform Compatibility:**
     *
     * - Optimized for Electron main process environment
     * - Uses node-sqlite3-wasm which is compiled for Node.js compatibility
     * - No platform-specific caveats for Windows/macOS/Linux
     *
     * @example
     *
     * ```typescript
     * dbService.close();
     * ```
     *
     * @returns Void
     *
     * @throws {@link Error} When connection close fails.
     */
    public close(): void {
        if (this.db) {
            try {
                // node-sqlite3-wasm completes all pending operations before
                // closing
                this.db.close();
                this.db = undefined;
                logger.info(LOG_TEMPLATES.services.DATABASE_CONNECTION_CLOSED);
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors.DATABASE_SCHEMA_FAILED,
                    error
                );
                throw error;
            }
        }
        // Safe to call when already closed - no-op behavior
    }

    /**
     * Gets the database instance.
     *
     * @remarks
     * Call {@link DatabaseService.initialize} first to set up the database
     * connection.
     *
     * @example
     *
     * ```typescript
     * const db = dbService.getDatabase();
     * ```
     *
     * @returns The active database connection.
     *
     * @throws {@link Error} When database is not initialized.
     */
    public getDatabase(): Database {
        if (!this.db) {
            throw new Error(
                "Database not initialized. Call initialize() first."
            );
        }
        return this.db;
    }

    /**
     * Initializes the database connection and creates schema if it doesn't
     * exist.
     *
     * @remarks
     * **Initialization Behavior:**
     *
     * - Creates the database file in the user data directory if it doesn't exist
     *
     *   - Sets up the complete schema including all required tables and indexes
     *   - Safe to call multiple times - returns existing connection if already
     *       initialized - Uses singleton pattern to prevent multiple
     *       connections
     *
     * **Thread Safety:**
     *
     * - Multiple concurrent calls are safe (idempotent operation)
     * - Returns same Database instance for all callers
     * - No locking required due to synchronous initialization
     *
     * **Schema Setup:**
     *
     * - SetupMonitorTypeValidation() intentionally receives no database parameter
     * - Future validation logic may require database access for consistency
     *
     * @example
     *
     * ```typescript
     * dbService.initialize();
     * ```
     *
     * @returns The initialized database instance.
     *
     * @throws {@link Error} When database initialization fails.
     */
    public initialize(): Database {
        if (this.db) {
            return this.db;
        }

        try {
            const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);
            logger.info(
                `[DatabaseService] Initializing SQLite DB at: ${dbPath}`
            );

            this.db = new Database(dbPath);

            createDatabaseSchema(this.db);

            logger.info(LOG_TEMPLATES.services.DATABASE_INITIALIZED);
            return this.db;
        } catch (error) {
            logger.error(LOG_TEMPLATES.errors.DATABASE_SCHEMA_FAILED, error);
            throw error;
        }
    }
}
