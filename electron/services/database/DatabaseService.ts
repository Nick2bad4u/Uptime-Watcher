/**
 * Core database service for SQLite operations and connection management.
 *
 * @remarks
 * Provides centralized database initialization, connection management, and
 * transaction utilities for the application. Uses node-sqlite3-wasm for
 * database operations.
 */

import { ensureError } from "@shared/utils/errorHandling";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { app } from "electron";
import { Database } from "node-sqlite3-wasm";
// eslint-disable-next-line unicorn/import-style -- Need namespace import for both sync and async usage
import * as path from "node:path";

import { DB_FILE_NAME } from "../../constants";
import { logger } from "../../utils/logger";
import { cleanupDatabaseLockArtifacts } from "./utils/maintenance/databaseLockRecovery";
import {
    createDatabaseSchema,
    synchronizeDatabaseSchemaVersion,
} from "./utils/schema/databaseSchema";

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

/** Maximum number of initialization attempts when recovering from lock errors. */
const DATABASE_INITIALIZATION_MAX_ATTEMPTS = 3;

/** Busy timeout (in milliseconds) applied to the SQLite connection. */
const DATABASE_BUSY_TIMEOUT_MS = 5000;

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
    /** Singleton instance of the database service */
    private static readonly instance: DatabaseService = new DatabaseService();

    /** SQLite database connection instance */
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

        // Check if we're already in a transaction (nested transaction scenario)
        if (db.inTransaction) {
            logger.warn(
                "[DatabaseService] Nested transaction detected - executing operation within existing transaction. " +
                    "This may indicate a design issue where transaction boundaries are not properly managed."
            );
            // If we're already in a transaction, just execute the operation
            // without starting a new transaction (SQLite doesn't support nested transactions)
            return operation(db);
        }

        try {
            db.run(DATABASE_SERVICE_QUERIES.BEGIN_TRANSACTION);
            logger.debug("[DatabaseService] Started new transaction");

            // Execute operation, then commit and return in one expression
            // This ensures operation completes before commit, fixing the race condition
            return await operation(db).then((result) => {
                db.run(DATABASE_SERVICE_QUERIES.COMMIT);
                logger.debug(
                    "[DatabaseService] Successfully committed transaction"
                );
                return result;
            });
        } catch (error) {
            // Enhanced error logging to understand what's causing transaction failures
            logger.error(
                "[DatabaseService] Transaction operation failed",
                error
            );

            // Only attempt rollback if a transaction is actually active
            // This prevents "cannot rollback - no transaction is active" errors
            try {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- node-sqlite3-wasm.Database.inTransaction is a valid runtime property
                if (db.inTransaction) {
                    db.run(DATABASE_SERVICE_QUERIES.ROLLBACK);
                    logger.debug(
                        "[DatabaseService] Successfully rolled back transaction"
                    );
                } else {
                    logger.debug(
                        "[DatabaseService] No active transaction to rollback (transaction was already rolled back by SQLite)"
                    );
                }
            } catch (rollbackError) {
                logger.error(
                    "[DatabaseService] Failed to rollback active transaction",
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
            } catch (error: unknown) {
                logger.error(
                    LOG_TEMPLATES.errors.DATABASE_CLOSE_FAILED,
                    ensureError(error)
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

        const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);
        logger.info(`[DatabaseService] Initializing SQLite DB at: ${dbPath}`);

        for (
            let attempt = 1;
            attempt <= DATABASE_INITIALIZATION_MAX_ATTEMPTS;
            attempt++
        ) {
            try {
                this.db = new Database(dbPath);
                this.applyConnectionPragmas(this.db);

                createDatabaseSchema(this.db);
                synchronizeDatabaseSchemaVersion(this.db);

                logger.info(LOG_TEMPLATES.services.DATABASE_INITIALIZED);
                return this.db;
            } catch (error: unknown) {
                if (
                    this.isDatabaseLockedError(error) &&
                    attempt < DATABASE_INITIALIZATION_MAX_ATTEMPTS
                ) {
                    this.handleDatabaseLockedError(dbPath, attempt, error);
                } else {
                    this.closeDatabaseSilently();
                    logger.error(
                        LOG_TEMPLATES.errors.DATABASE_SCHEMA_FAILED,
                        ensureError(error)
                    );
                    throw error;
                }
            }
        }

        throw new Error(
            "Database initialization failed after lock recovery attempts."
        );
    }

    /**
     * Applies connection-level pragmas to improve SQLite resiliency.
     *
     * @param db - The active SQLite database connection.
     */
    private applyConnectionPragmas(db: Database): void {
        try {
            db.run(`PRAGMA busy_timeout = ${DATABASE_BUSY_TIMEOUT_MS}`);
        } catch (error) {
            logger.warn(
                LOG_TEMPLATES.warnings.DATABASE_BUSY_TIMEOUT_PRAGMA_FAILED,
                {
                    message: ensureError(error).message,
                }
            );
        }

        try {
            // WAL improves concurrent read/write behavior and generally
            // reduces "database is locked" frequency for desktop apps.
            db.get("PRAGMA journal_mode = WAL");
        } catch (error) {
            if (this.isDatabaseLockedError(error)) {
                // Escalate to the caller so initialization retries with the
                // lock recovery flow (busy_timeout + artifact relocation).
                throw error;
            }
            logger.warn(
                "[DatabaseService] Failed to apply PRAGMA journal_mode",
                {
                    message: ensureError(error).message,
                }
            );
        }

        try {
            // NORMAL is the typical performance/safety trade-off for WAL mode.
            db.get("PRAGMA synchronous = NORMAL");
        } catch (error) {
            if (this.isDatabaseLockedError(error)) {
                throw error;
            }
            logger.warn(
                "[DatabaseService] Failed to apply PRAGMA synchronous",
                {
                    message: ensureError(error).message,
                }
            );
        }

        try {
            db.get("PRAGMA temp_store = MEMORY");
        } catch (error) {
            logger.warn("[DatabaseService] Failed to apply PRAGMA temp_store", {
                message: ensureError(error).message,
            });
        }

        try {
            db.run("PRAGMA foreign_keys = ON");
        } catch (error) {
            logger.warn(
                LOG_TEMPLATES.warnings.DATABASE_FOREIGN_KEYS_PRAGMA_FAILED,
                {
                    message: ensureError(error).message,
                }
            );
        }
    }

    /**
     * Determines whether the provided error represents a locked database.
     *
     * @param error - Error thrown during SQLite operations.
     *
     * @returns `true` when the error indicates an outstanding lock.
     */
    private isDatabaseLockedError(error: unknown): boolean {
        const normalized = ensureError(error);
        const message = normalized.message.toLowerCase();

        return (
            message.includes("database is locked") ||
            message.includes("sqlite_busy") ||
            message.includes("sqlite_locked")
        );
    }

    /**
     * Handles lock-related initialization failures by relocating stale lock
     * artifacts and preparing for a retry.
     *
     * @param dbPath - Absolute path to the SQLite database file.
     * @param attempt - Current initialization attempt number.
     * @param error - The original lock error.
     */
    private handleDatabaseLockedError(
        dbPath: string,
        attempt: number,
        error: unknown
    ): void {
        const normalizedError = ensureError(error);
        logger.warn(LOG_TEMPLATES.warnings.DATABASE_LOCK_DETECTED, {
            attempt,
            message: normalizedError.message,
        });

        this.closeDatabaseSilently();

        const cleanupResult = cleanupDatabaseLockArtifacts(dbPath);

        if (cleanupResult.relocated.length > 0) {
            logger.info(
                LOG_TEMPLATES.services.DATABASE_LOCK_RECOVERY_RELOCATED,
                {
                    count: cleanupResult.relocated.length,
                    relocated: cleanupResult.relocated,
                }
            );
        } else {
            logger.info(
                LOG_TEMPLATES.services.DATABASE_LOCK_RECOVERY_NO_ARTIFACTS,
                {
                    attempt,
                }
            );
        }

        if (cleanupResult.missing.length > 0) {
            logger.debug(
                LOG_TEMPLATES.debug.DATABASE_LOCK_RECOVERY_MISSING_ARTIFACTS,
                {
                    missing: cleanupResult.missing,
                }
            );
        }

        if (cleanupResult.failed.length > 0) {
            logger.warn(LOG_TEMPLATES.warnings.DATABASE_LOCK_RECOVERY_FAILED, {
                failed: cleanupResult.failed,
            });
        }
    }

    /**
     * Closes the active database connection without propagating errors.
     */
    private closeDatabaseSilently(): void {
        if (!this.db) {
            return;
        }

        try {
            this.db.close();
        } catch (error) {
            logger.warn(
                LOG_TEMPLATES.warnings.DATABASE_CLOSE_DURING_FAILURE_FAILED,
                {
                    message: ensureError(error).message,
                }
            );
        } finally {
            this.db = undefined;
        }
    }
}
