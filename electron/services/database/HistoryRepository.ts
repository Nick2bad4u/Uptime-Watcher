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
 * Defines the dependencies required by the {@link HistoryRepository} for managing history data persistence.
 *
 * @remarks
 * Provides the required {@link DatabaseService} for all history operations. This interface is used for dependency injection.
 * @public
 */
export interface HistoryRepositoryDependencies {
    /**
     * The database service used for transactional operations.
     * @readonly
     */
    databaseService: DatabaseService;
}

/**
 * Common SQL queries for history persistence operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant is internal to the repository and not exported.
 * @internal
 */
const HISTORY_QUERIES = {
    DELETE_BY_IDS: "DELETE FROM history WHERE id IN",
    INSERT_ENTRY: "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
    SELECT_EXCESS_ENTRIES: "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
    SELECT_MONITOR_IDS: "SELECT id FROM monitors",
} as const;

/**
 * Repository for managing history data persistence.
 *
 * Handles all CRUD operations for monitor history in the database, following the repository pattern.
 *
 * @remarks
 * All operations are wrapped in transactions and use the repository pattern for consistency, error handling, and maintainability. This class should be used as the sole interface for history data access and mutation.
 * @public
 */
export class HistoryRepository {
    /**
     * The database service used for all transactional operations.
     * @readonly
     */
    private readonly databaseService: DatabaseService;

    /**
     * Constructs a new {@link HistoryRepository} instance.
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
     * @param monitorId - The unique identifier of the monitor to add history for.
     * @param entry - The status history entry to add.
     * @param details - Optional details string for the entry.
     * @returns A promise that resolves when the entry is added.
     * @throws Error if the database operation fails.
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
     * Adds a new history entry for a monitor within an existing transaction context.
     *
     * @param db - The database connection (must be within an active transaction).
     * @param monitorId - The unique identifier of the monitor to add history for.
     * @param entry - The status history entry to add.
     * @param details - Optional details string for the entry.
     * @remarks
     * Use this method only when already within a transaction context.
     */
    public addEntryInternal(db: Database, monitorId: string, entry: StatusHistory, details?: string): void {
        return addHistoryEntry(db, monitorId, entry, details);
    }

    /**
     * Bulk inserts history entries for a monitor (used for import functionality).
     *
     * @param monitorId - The unique identifier of the monitor to add history for.
     * @param historyEntries - Array of status history entries to insert. Each entry may include an optional `details` property.
     * @returns A promise that resolves when all entries are inserted.
     * @throws Error if the database operation fails.
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
                    const stmt = db.prepare(HISTORY_QUERIES.INSERT_ENTRY);

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
     * @throws Error if the database operation fails.
     * @remarks
     * **WARNING**: This operation is irreversible and will delete all history data. The operation is wrapped in a transaction for data safety and error handling.
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
     * Clears all history from the database within an existing transaction context.
     *
     * @param db - The database connection (must be within an active transaction).
     * @remarks
     * **IMPORTANT**: This method must be called within an existing transaction context. The operation is destructive and irreversible. Proper error handling is delegated to the calling transaction context.
     */
    public deleteAllInternal(db: Database): void {
        return deleteAllHistory(db);
    }

    /**
     * Deletes all history entries for a specific monitor.
     *
     * @param monitorId - The unique identifier of the monitor to delete history for.
     * @returns A promise that resolves when history is deleted.
     * @throws Error if the database operation fails.
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
     * Deletes all history entries for a specific monitor within an existing transaction context.
     *
     * @param db - The database connection (must be within an active transaction).
     * @param monitorId - The unique identifier of the monitor to delete history for.
     * @remarks
     * Use this method only when already within a transaction context.
     */
    public deleteByMonitorIdInternal(db: Database, monitorId: string): void {
        return deleteHistoryByMonitorId(db, monitorId);
    }

    /**
     * Finds all history entries for a specific monitor.
     *
     * @param monitorId - The unique identifier of the monitor to find history for.
     * @returns A promise resolving to an array of status history entries.
     * @throws Error if the database operation fails.
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
     * @param monitorId - The unique identifier of the monitor.
     * @returns A promise resolving to the number of history entries.
     * @throws Error if the database operation fails.
     * @remarks
     * Uses consistent async pattern with error handling for reliability. Wrapped in withDatabaseOperation for proper error recovery.
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
     * Gets the count of history entries for a monitor within an existing transaction context.
     *
     * @param db - The database connection (must be within an active transaction).
     * @param monitorId - The unique identifier of the monitor.
     * @returns The number of history entries for the monitor.
     * @remarks
     * **IMPORTANT**: This method must be called within an existing transaction context. Provides synchronous access for use in transaction-wrapped operations.
     */
    public getHistoryCountInternal(db: Database, monitorId: string): number {
        return getHistoryCount(db, monitorId);
    }

    /**
     * Gets the most recent history entry for a monitor.
     *
     * @param monitorId - The unique identifier of the monitor.
     * @returns A promise resolving to the latest history entry, or `undefined` if none exists.
     * @throws Error if the database operation fails.
     * @remarks
     * Uses consistent async pattern with error handling for reliability. Wrapped in withDatabaseOperation for proper error recovery.
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
     * Prunes old history entries for all monitors, keeping only the most recent entries per monitor.
     *
     * @param limit - The maximum number of entries to keep per monitor. Must be greater than 0.
     * @returns A promise that resolves when pruning is complete.
     * @throws Error if the database operation fails.
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
                    const monitors = db.all(HISTORY_QUERIES.SELECT_MONITOR_IDS) as { id: number }[];
                    for (const monitor of monitors) {
                        const excessEntries = db.all(HISTORY_QUERIES.SELECT_EXCESS_ENTRIES, [
                            String(monitor.id),
                            limit,
                        ]) as { id: number }[];
                        if (excessEntries.length > 0) {
                            // Convert numeric IDs to ensure type safety and validate they are numbers
                            const excessIds = excessEntries
                                .map((e) => Number(e.id))
                                .filter((id) => Number.isFinite(id) && id > 0);

                            if (excessIds.length > 0) {
                                const placeholders = excessIds.map(() => "?").join(",");
                                db.run(`${HISTORY_QUERIES.DELETE_BY_IDS} (${placeholders})`, excessIds);
                            }
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
     * Prunes old history entries for all monitors within an existing transaction context, keeping only the most recent entries per monitor.
     *
     * @param db - The database connection (must be within an active transaction).
     * @param limit - The maximum number of entries to keep per monitor. Must be greater than 0.
     * @remarks
     * Use this method only when already within a transaction context.
     */
    public pruneAllHistoryInternal(db: Database, limit: number): void {
        if (limit <= 0) {
            return;
        }

        // Get all monitor IDs
        const monitorRows = db.all(HISTORY_QUERIES.SELECT_MONITOR_IDS) as { id: number }[];

        // Prune history for each monitor
        for (const row of monitorRows) {
            // Validate monitor ID is a positive number before using it
            const monitorId = Number(row.id);
            if (Number.isFinite(monitorId) && monitorId > 0) {
                pruneHistoryForMonitor(db, String(monitorId), limit);
            }
        }

        if (isDev()) {
            logger.debug(`[HistoryRepository] Pruned history for all monitors (limit: ${limit}) (internal)`);
        }
    }

    /**
     * Prunes old history entries for a specific monitor, keeping only the most recent entries.
     *
     * @param monitorId - The unique identifier of the monitor to prune history for.
     * @param limit - The maximum number of entries to keep. Must be greater than 0.
     * @returns A promise that resolves when pruning is complete.
     * @throws Error if the database operation fails.
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
     * Prunes old history entries for a specific monitor within an existing transaction context, keeping only the most recent entries.
     *
     * @param db - The database connection (must be within an active transaction).
     * @param monitorId - The unique identifier of the monitor to prune history for.
     * @param limit - The maximum number of entries to keep. Must be greater than 0.
     * @remarks
     * Use this method only when already within a transaction context.
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
     * @returns The database connection from the {@link DatabaseService}.
     * @remarks
     * **Repository Pattern Justification:**
     * This method provides controlled access to the database connection for internal repository operations. While it exposes the raw database instance, it's designed for use within repository methods that already implement proper transaction and error handling patterns.
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
