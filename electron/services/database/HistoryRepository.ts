import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../electronUtils";
import { StatusHistory } from "../../types";
import { logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import { DatabaseService } from "./DatabaseService";
import {
    addHistoryEntry,
    deleteAllHistory,
    deleteHistoryByMonitorId,
    pruneHistoryForMonitor,
} from "./utils/historyManipulation";
import { findHistoryByMonitorId, getHistoryCount, getLatestHistoryEntry } from "./utils/historyQuery";

/**
 * @public
 * Repository dependencies for managing history data persistence.
 *
 * @remarks
 * Provides the required database service for history operations.
 */
export interface HistoryRepositoryDependencies {
    /** Database service for transactional operations. */
    databaseService: DatabaseService;
}

/**
 * @public
 * Repository for managing history data persistence.
 * Handles CRUD operations for monitor history in the database.
 *
 * @remarks
 * All operations are wrapped in transactions and use the repository pattern for consistency and error handling.
 */
export class HistoryRepository {
    private readonly databaseService: DatabaseService;

    /**
     * Constructs a new HistoryRepository instance.
     *
     * @param dependencies - The required dependencies for history operations.
     * @example
     * ```typescript
     * const repo = new HistoryRepository({ databaseService });
     * ```
     */
    constructor(dependencies: HistoryRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }

    /**
     * Adds a new history entry for a monitor.
     *
     * @param monitorId - The monitor ID to add history for.
     * @param entry - The status history entry to add.
     * @param details - Optional details string for the entry.
     * @returns A promise that resolves when the entry is added.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.addEntry("monitor-123", entryObj, "details");
     * ```
     */
    public async addEntry(monitorId: string, entry: StatusHistory, details?: string): Promise<void> {
        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    this.addEntryInternal(db, monitorId, entry, details);
                    return Promise.resolve();
                });
            },
            "history-add-entry",
            undefined,
            { monitorId }
        );
    }

    /**
     * Internal method to add a new history entry for a monitor within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction).
     * @param monitorId - The monitor ID to add history for.
     * @param entry - The status history entry to add.
     * @param details - Optional details string for the entry.
     * @returns void
     * @remarks
     * Use this method when you're already within a transaction context.
     */
    public addEntryInternal(db: Database, monitorId: string, entry: StatusHistory, details?: string): void {
        return addHistoryEntry(db, monitorId, entry, details);
    }

    /**
     * Bulk inserts history entries for a monitor (for import functionality).
     *
     * @param monitorId - The monitor ID to add history for.
     * @param historyEntries - Array of status history entries to insert.
     * @returns A promise that resolves when all entries are inserted.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.bulkInsert("monitor-123", entriesArray);
     * ```
     */
    public async bulkInsert(
        monitorId: string,
        historyEntries: (StatusHistory & { details?: string })[]
    ): Promise<void> {
        if (historyEntries.length === 0) {
            return;
        }

        return withDatabaseOperation(
            async () => {
                // Use executeTransaction for atomic bulk insert operation
                await this.databaseService.executeTransaction((db) => {
                    // Prepare the statement once for better performance
                    const stmt = db.prepare(
                        "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)"
                    );

                    try {
                        for (const entry of historyEntries) {
                            stmt.run([
                                monitorId,
                                entry.timestamp,
                                entry.status, // StatusHistoryType is always "up" or "down"
                                entry.responseTime,
                                entry.details ?? null,
                            ]);
                        }

                        logger.info(
                            `[HistoryRepository] Bulk inserted ${historyEntries.length} history entries for monitor: ${monitorId}`
                        );
                    } finally {
                        stmt.finalize();
                    }
                    return Promise.resolve();
                });
            },
            "history-bulk-insert",
            undefined,
            { count: historyEntries.length, monitorId }
        );
    }

    /**
     * Clears all history from the database.
     *
     * @returns A promise that resolves when all history is deleted.
     * @throws If the database operation fails.
     * @remarks
     * **WARNING**: This operation is irreversible and will delete all history data.
     * Now properly wrapped in transaction for data safety and error handling.
     * @example
     * ```typescript
     * await repo.deleteAll();
     * ```
     */
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(async () => {
            return this.databaseService.executeTransaction((db) => {
                this.deleteAllInternal(db);
                return Promise.resolve();
            });
        }, "history-delete-all");
    }

    /**
     * Internal method to clear all history from the database within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction).
     * @returns void
     * @remarks
     * **IMPORTANT**: This method must be called within an existing transaction context.
     * The operation is destructive and irreversible. Proper error handling is
     * delegated to the calling transaction context.
     */
    public deleteAllInternal(db: Database): void {
        return deleteAllHistory(db);
    }

    /**
     * Deletes history entries for a specific monitor.
     *
     * @param monitorId - The monitor ID to delete history for.
     * @returns A promise that resolves when history is deleted.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.deleteByMonitorId("monitor-123");
     * ```
     */
    public async deleteByMonitorId(monitorId: string): Promise<void> {
        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    this.deleteByMonitorIdInternal(db, monitorId);
                    return Promise.resolve();
                });
            },
            "history-delete-by-monitor",
            undefined,
            { monitorId }
        );
    }

    /**
     * Internal method to delete history entries for a specific monitor within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction).
     * @param monitorId - The monitor ID to delete history for.
     * @returns void
     * @remarks
     * Use this method when you're already within a transaction context.
     */
    public deleteByMonitorIdInternal(db: Database, monitorId: string): void {
        return deleteHistoryByMonitorId(db, monitorId);
    }

    /**
     * Finds all history entries for a specific monitor.
     *
     * @param monitorId - The monitor ID to find history for.
     * @returns Promise resolving to array of status history entries.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const entries = await repo.findByMonitorId("monitor-123");
     * ```
     */
    public async findByMonitorId(monitorId: string): Promise<StatusHistory[]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            return Promise.resolve(findHistoryByMonitorId(db, monitorId));
        }, `find-history-by-monitor-${monitorId}`);
    }

    /**
     * Gets the count of history entries for a monitor.
     *
     * @param monitorId - Unique identifier for the monitor.
     * @returns Promise resolving to the number of history entries.
     * @throws If the database operation fails.
     * @remarks
     * Uses consistent async pattern with error handling for reliability.
     * Wrapped in withDatabaseOperation for proper error recovery.
     * @example
     * ```typescript
     * const count = await repo.getHistoryCount("monitor-123");
     * ```
     */
    public async getHistoryCount(monitorId: string): Promise<number> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();
                return Promise.resolve(getHistoryCount(db, monitorId));
            },
            "history-count",
            undefined,
            { monitorId }
        );
    }

    /**
     * Gets the count of history entries for a monitor (internal version for use within transactions).
     *
     * @param db - Database connection (must be within active transaction).
     * @param monitorId - Unique identifier for the monitor.
     * @returns The number of history entries.
     * @remarks
     * **IMPORTANT**: This method must be called within an existing transaction context.
     * Provides synchronous access for use in transaction-wrapped operations.
     */
    public getHistoryCountInternal(db: Database, monitorId: string): number {
        return getHistoryCount(db, monitorId);
    }

    /**
     * Gets the most recent history entry for a monitor.
     *
     * @param monitorId - Unique identifier for the monitor.
     * @returns Promise resolving to the latest history entry, or undefined if none exists.
     * @throws If the database operation fails.
     * @remarks
     * Uses consistent async pattern with error handling for reliability.
     * Wrapped in withDatabaseOperation for proper error recovery.
     * @example
     * ```typescript
     * const latest = await repo.getLatestEntry("monitor-123");
     * ```
     */
    public async getLatestEntry(monitorId: string): Promise<StatusHistory | undefined> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();
                return Promise.resolve(getLatestHistoryEntry(db, monitorId));
            },
            "history-latest-entry",
            undefined,
            { monitorId }
        );
    }

    /**
     * Prunes old history entries for all monitors, keeping only the most recent entries.
     *
     * @param limit - The maximum number of entries to keep per monitor.
     * @returns A promise that resolves when pruning is complete.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.pruneAllHistory(100);
     * ```
     */
    public async pruneAllHistory(limit: number): Promise<void> {
        if (limit <= 0) return;

        return withDatabaseOperation(
            async () => {
                // Use executeTransaction for atomic multi-monitor operation
                await this.databaseService.executeTransaction((db) => {
                    const monitors = db.all("SELECT id FROM monitors") as { id: number }[];
                    for (const monitor of monitors) {
                        const excessEntries = db.all(
                            "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
                            [String(monitor.id), limit]
                        ) as { id: number }[];
                        if (excessEntries.length > 0) {
                            // Convert numeric IDs to ensure type safety
                            const excessIds = excessEntries.map((e) => Number(e.id));
                            const placeholders = excessIds.map(() => "?").join(",");
                            db.run(`DELETE FROM history WHERE id IN (${placeholders})`, excessIds);
                        }
                    }
                    return Promise.resolve();
                });
            },
            "history-prune-all",
            undefined,
            { limit }
        );
    }

    /**
     * Internal method to prune old history entries for all monitors within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction).
     * @param limit - The maximum number of entries to keep per monitor.
     * @returns void
     * @remarks
     * Use this method when you're already within a transaction context.
     */
    public pruneAllHistoryInternal(db: Database, limit: number): void {
        if (limit <= 0) {
            return;
        }

        // Get all monitor IDs
        const monitorRows = db.all("SELECT id FROM monitors") as { id: number }[];

        // Prune history for each monitor
        for (const row of monitorRows) {
            pruneHistoryForMonitor(db, String(row.id), limit);
        }

        if (isDev()) {
            logger.debug(`[HistoryRepository] Pruned history for all monitors (limit: ${limit}) (internal)`);
        }
    }

    /**
     * Prunes old history entries for a monitor, keeping only the most recent entries.
     *
     * @param monitorId - The monitor ID to prune history for.
     * @param limit - The maximum number of entries to keep.
     * @returns A promise that resolves when pruning is complete.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.pruneHistory("monitor-123", 100);
     * ```
     */
    public async pruneHistory(monitorId: string, limit: number): Promise<void> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();
                pruneHistoryForMonitor(db, monitorId, limit);
                return Promise.resolve();
            },
            "history-prune",
            undefined,
            { limit, monitorId }
        );
    }

    /**
     * Internal method to prune old history entries for a specific monitor within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction).
     * @param monitorId - The monitor ID to prune history for.
     * @param limit - The maximum number of entries to keep.
     * @returns void
     * @remarks
     * Use this method when you're already within a transaction context.
     */
    public pruneHistoryInternal(db: Database, monitorId: string, limit: number): void {
        if (limit <= 0) {
            return;
        }

        pruneHistoryForMonitor(db, monitorId, limit);

        if (isDev()) {
            logger.debug(`[HistoryRepository] Pruned history for monitor ${monitorId} (limit: ${limit}) (internal)`);
        }
    }

    /**
     * Gets the database instance for internal repository operations.
     *
     * @returns Database connection from the DatabaseService.
     * @remarks
     * **Repository Pattern Justification:**
     * This method provides controlled access to the database connection for
     * internal repository operations. While it exposes the raw database instance,
     * it's designed for use within repository methods that already implement
     * proper transaction and error handling patterns.
     *
     * **Usage Guidelines:**
     * - Only used within repository methods
     * - Always wrapped in withDatabaseOperation or executeTransaction
     * - Provides centralized database access for consistency
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }
}
