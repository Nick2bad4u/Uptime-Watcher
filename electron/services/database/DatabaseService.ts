/**
 * Core database service for SQLite operations and connection management.
 *
 * @remarks
 * Provides centralized database initialization, connection management, and
 * transaction utilities for the app. Uses node-sqlite3-wasm for database
 * operations.
 */

import { ensureError } from "@shared/utils/errorHandling";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { withRetry } from "@shared/utils/retry";
import { isSqliteLockedError } from "@shared/utils/sqliteErrors";
import { app } from "electron";
import { Database } from "node-sqlite3-wasm";
import { AsyncLocalStorage } from "node:async_hooks";
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

/** Maximum number of transaction attempts when SQLite reports BUSY/LOCKED. */
const TRANSACTION_MAX_ATTEMPTS = 3;

/** Base delay between transaction retry attempts (milliseconds). */
const TRANSACTION_RETRY_INITIAL_DELAY_MS = 50;

/** Maximum delay between transaction retries (milliseconds). */
const TRANSACTION_RETRY_MAX_DELAY_MS = 750;

type DatabaseTransactionOperation<T> = (db: Database) => Promise<T> | T;

interface DatabaseTransactionContext {
    active: boolean;
    db: Database;
}

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
 * - WebAssembly binary ensures consistent behavior across platforms
 *
 * **Thread Safety:**
 *
 * - Singleton pattern ensures single database connection
 * - Node-sqlite3-wasm operations are synchronous and thread-safe
 * - Multiple initialize() calls return same connection (idempotent)
 * - Independent top-level transactions are serialized on the shared connection
 *
 * @example
 *
 * ```typescript
 * const dbService = DatabaseService.getInstance();
 * dbService.initialize();
 * const db = dbService.getDatabase();
 * ```
 *
 * @public Core
 * database service for SQLite connection and schema management.
 */
export class DatabaseService {
    /** Singleton instance of the database service */
    private static readonly instance: DatabaseService = new DatabaseService();

    private static savepointCounter = 0;

    /** SQLite database connection instance */
    private db: Database | undefined;

    /** Identifies calls that are genuinely nested in the active transaction. */
    private readonly transactionContext =
        new AsyncLocalStorage<DatabaseTransactionContext>();

    /** Identifies database-file maintenance that already owns the queue. */
    private readonly exclusiveOperationContext =
        new AsyncLocalStorage<boolean>();

    /** Serializes top-level transactions and database-file maintenance. */
    private exclusiveOperationQueue: Promise<void> = Promise.resolve();

    /**
     * Gets the singleton database service instance.
     *
     * @remarks
     * Uses singleton pattern to ensure only one database connection exists
     * throughout the app lifecycle.
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
     * - Independent async transactions are queued to prevent interleaving
     * - Automatic rollback on operation failure ensures consistency
     * - Re-entrant transactions use SQLite savepoints
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
     * @throws `Error` when transaction fails or operation throws.
     */
    public async executeTransaction<T>(
        operation: DatabaseTransactionOperation<T>
    ): Promise<T> {
        if (this.exclusiveOperationContext.getStore()) {
            throw new Error(
                "Cannot start a database transaction during an exclusive database-file operation"
            );
        }

        const activeContext = this.transactionContext.getStore();
        if (activeContext?.active) {
            return this.executeNestedTransaction(activeContext.db, operation);
        }

        return this.enqueueExclusiveOperation(async () => {
            const db = this.getDatabase();
            const executeSingleAttempt = async (): Promise<T> => {
                try {
                    db.run(DATABASE_SERVICE_QUERIES.BEGIN_TRANSACTION);
                    logger.debug("[DatabaseService] Started new transaction");

                    const context: DatabaseTransactionContext = {
                        active: true,
                        db,
                    };
                    let result: T;
                    try {
                        result = await this.transactionContext.run(
                            context,
                            () => Promise.resolve(operation(db))
                        );
                    } finally {
                        context.active = false;
                    }

                    db.run(DATABASE_SERVICE_QUERIES.COMMIT);
                    logger.debug(
                        "[DatabaseService] Successfully committed transaction"
                    );
                    return result;
                } catch (error) {
                    const normalizedError = ensureError(error);
                    const rollbackErrors: Error[] = [];

                    // Only attempt rollback if a transaction is actually active.
                    // This prevents "cannot rollback - no transaction is active" errors.
                    try {
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
                        const normalizedRollbackError =
                            ensureError(rollbackError);
                        rollbackErrors.push(normalizedRollbackError);
                        logger.error(
                            "[DatabaseService] Failed to rollback active transaction",
                            normalizedRollbackError
                        );
                    }

                    if (rollbackErrors.length > 0) {
                        throw new AggregateError(
                            [normalizedError, ...rollbackErrors],
                            "[DatabaseService] Transaction failed and rollback failed",
                            { cause: error }
                        );
                    }

                    throw normalizedError;
                }
            };

            return withRetry(executeSingleAttempt, {
                delayMs: ({ attempt }) =>
                    Math.min(
                        TRANSACTION_RETRY_INITIAL_DELAY_MS * 2 ** (attempt - 1),
                        TRANSACTION_RETRY_MAX_DELAY_MS
                    ),
                maxRetries: TRANSACTION_MAX_ATTEMPTS,
                operationName: "database transaction",
                onError: (error, attempt) => {
                    const normalizedError = ensureError(error);
                    const canRetry =
                        attempt < TRANSACTION_MAX_ATTEMPTS &&
                        isSqliteLockedError(normalizedError);

                    if (canRetry) {
                        logger.warn(
                            `[DatabaseService] Transaction encountered SQLITE_BUSY/SQLITE_LOCKED; rolling back and retrying (attempt ${attempt}/${TRANSACTION_MAX_ATTEMPTS})`,
                            normalizedError
                        );
                    } else {
                        // Enhanced error logging to understand what's causing transaction failures
                        logger.error(
                            "[DatabaseService] Transaction operation failed",
                            normalizedError
                        );
                    }
                },
                shouldRetry: (error, attempt) =>
                    attempt < TRANSACTION_MAX_ATTEMPTS &&
                    isSqliteLockedError(ensureError(error)),
            });
        });
    }

    /**
     * Runs database-file maintenance without overlapping transactions or other
     * maintenance callers.
     *
     * @param operationName - Stable diagnostic name for the maintenance work.
     * @param operation - Work that may close, reinitialize, or replace the
     *   database connection or file.
     */
    public async executeExclusiveOperation<T>(
        operationName: string,
        operation: () => Promise<T> | T
    ): Promise<T> {
        if (this.transactionContext.getStore()?.active) {
            throw new Error(
                `Cannot start exclusive database operation ${operationName} during an active transaction`
            );
        }

        if (this.exclusiveOperationContext.getStore()) {
            return operation();
        }

        return this.enqueueExclusiveOperation(() =>
            this.exclusiveOperationContext.run(true, () =>
                Promise.resolve(operation())
            )
        );
    }

    private async enqueueExclusiveOperation<T>(
        operation: () => Promise<T>
    ): Promise<T> {
        const precedingOperation = this.exclusiveOperationQueue;
        let releaseQueue: () => void = () => {};
        this.exclusiveOperationQueue = new Promise<void>((resolve) => {
            releaseQueue = resolve;
        });

        await precedingOperation;
        try {
            return await operation();
        } finally {
            releaseQueue();
        }
    }

    private async executeNestedTransaction<T>(
        db: Database,
        operation: DatabaseTransactionOperation<T>
    ): Promise<T> {
        DatabaseService.savepointCounter += 1;
        const savepointName = `uptime_watcher_sp_${DatabaseService.savepointCounter}`;

        logger.warn(
            "[DatabaseService] Nested transaction detected - using SAVEPOINT for isolation",
            { savepointName }
        );

        db.run(`SAVEPOINT ${savepointName}`);

        try {
            return await Promise.resolve(operation(db)).then((result) => {
                db.run(`RELEASE ${savepointName}`);
                return result;
            });
        } catch (error) {
            const normalizedError = ensureError(error);
            const rollbackErrors: Error[] = [];
            try {
                db.run(`ROLLBACK TO ${savepointName}`);
                db.run(`RELEASE ${savepointName}`);
            } catch (rollbackError) {
                const normalizedRollbackError = ensureError(rollbackError);
                rollbackErrors.push(normalizedRollbackError);
                logger.error(
                    "[DatabaseService] Failed to rollback savepoint",
                    normalizedRollbackError
                );
            }

            if (rollbackErrors.length > 0) {
                throw new AggregateError(
                    [normalizedError, ...rollbackErrors],
                    "[DatabaseService] Nested transaction failed and savepoint rollback failed",
                    { cause: error }
                );
            }

            throw normalizedError;
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
     * - Should be called during app shutdown for proper cleanup
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
     * @throws `Error` when connection close fails.
     */
    public close(): void {
        if (this.db) {
            try {
                this.applyShutdownPragmas(this.db);
                // node-sqlite3-wasm completes all pending operations before
                // closing
                this.db.close();
                this.db = undefined;
                logger.info(LOG_TEMPLATES.services.DATABASE_CONNECTION_CLOSED);
            } catch (error: unknown) {
                const normalizedError = ensureError(error);
                logger.error(
                    LOG_TEMPLATES.errors.DATABASE_CLOSE_FAILED,
                    normalizedError
                );
                throw normalizedError;
            }
        }
        // Safe to call when already closed - no-op behavior
    }

    private applyShutdownPragmas(db: Database): void {
        // These pragmas are best-effort cleanup actions.
        // They should never prevent the app from shutting down.
        try {
            db.get("PRAGMA wal_checkpoint(TRUNCATE)");
        } catch (error: unknown) {
            logger.debug(
                "[DatabaseService] WAL checkpoint(TRUNCATE) not available",
                ensureError(error)
            );
        }

        try {
            db.get("PRAGMA optimize");
        } catch (error: unknown) {
            logger.debug(
                "[DatabaseService] PRAGMA optimize not available",
                ensureError(error)
            );
        }
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
     * @throws `Error` when database is not initialized.
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
     * @throws `Error` when database initialization fails.
     */
    public initialize(): Database {
        if (this.db) {
            return this.db;
        }

        const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);
        logger.info("[DatabaseService] Initializing SQLite DB", { dbPath });

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
                const normalizedError = ensureError(error);
                if (
                    isSqliteLockedError(error) &&
                    attempt < DATABASE_INITIALIZATION_MAX_ATTEMPTS
                ) {
                    this.handleDatabaseLockedError(dbPath, attempt, error);
                } else {
                    this.closeDatabaseSilently();
                    logger.error(
                        LOG_TEMPLATES.errors.DATABASE_SCHEMA_FAILED,
                        normalizedError
                    );
                    throw normalizedError;
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
        } catch (error: unknown) {
            const normalizedError = ensureError(error);
            logger.warn(
                LOG_TEMPLATES.warnings.DATABASE_BUSY_TIMEOUT_PRAGMA_FAILED,
                {
                    message: normalizedError.message,
                }
            );
        }

        try {
            // WAL improves concurrent read/write behavior and generally
            // reduces "database is locked" frequency for desktop apps.
            db.get("PRAGMA journal_mode = WAL");
        } catch (error: unknown) {
            const normalizedError = ensureError(error);
            if (isSqliteLockedError(error)) {
                // Escalate to the caller so initialization retries with the
                // lock recovery flow (busy_timeout + artifact relocation).
                throw normalizedError;
            }
            logger.warn(
                "[DatabaseService] Failed to apply PRAGMA journal_mode",
                {
                    message: normalizedError.message,
                }
            );
        }

        try {
            // NORMAL is the typical performance/safety trade-off for WAL mode.
            db.get("PRAGMA synchronous = NORMAL");
        } catch (error: unknown) {
            const normalizedError = ensureError(error);
            if (isSqliteLockedError(error)) {
                throw normalizedError;
            }
            logger.warn(
                "[DatabaseService] Failed to apply PRAGMA synchronous",
                {
                    message: normalizedError.message,
                }
            );
        }

        try {
            db.get("PRAGMA temp_store = MEMORY");
        } catch (error: unknown) {
            const normalizedError = ensureError(error);
            logger.warn("[DatabaseService] Failed to apply PRAGMA temp_store", {
                message: normalizedError.message,
            });
        }

        try {
            db.run("PRAGMA foreign_keys = ON");
        } catch (error: unknown) {
            const normalizedError = ensureError(error);
            logger.warn(
                LOG_TEMPLATES.warnings.DATABASE_FOREIGN_KEYS_PRAGMA_FAILED,
                {
                    message: normalizedError.message,
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
