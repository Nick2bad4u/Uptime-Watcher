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
 * Repository for managing history data persistence.
 * Handles CRUD operations for monitor history in the database.
 */
export class HistoryRepository {
    private readonly databaseService: DatabaseService;

    constructor() {
        this.databaseService = DatabaseService.getInstance();
    }

    /**
     * Add a new history entry for a monitor.
     */
    public async addEntry(monitorId: string, entry: StatusHistory, details?: string): Promise<void> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();
                addHistoryEntry(db, monitorId, entry, details);
                return Promise.resolve();
            },
            "history-add-entry",
            undefined,
            { monitorId }
        );
    }

    /**
     * Internal method to add a new history entry for a monitor within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public addEntryInternal(db: Database, monitorId: string, entry: StatusHistory, details?: string): void {
        return addHistoryEntry(db, monitorId, entry, details);
    }

    /**
     * Bulk insert history entries (for import functionality).
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
     * Clear all history from the database.
     */
    public deleteAll(): void {
        const db = this.getDb();
        return deleteAllHistory(db);
    }

    /**
     * Internal method to clear all history from the database within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public deleteAllInternal(db: Database): void {
        return deleteAllHistory(db);
    }

    /**
     * Delete history entries for a specific monitor.
     */
    public async deleteByMonitorId(monitorId: string): Promise<void> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();
                deleteHistoryByMonitorId(db, monitorId);
                return Promise.resolve();
            },
            "history-delete-by-monitor",
            undefined,
            { monitorId }
        );
    }

    /**
     * Internal method to delete history entries for a specific monitor within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public deleteByMonitorIdInternal(db: Database, monitorId: string): void {
        return deleteHistoryByMonitorId(db, monitorId);
    }

    /**
     * Find all history entries for a specific monitor.
     */
    public async findByMonitorId(monitorId: string): Promise<StatusHistory[]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            return Promise.resolve(findHistoryByMonitorId(db, monitorId));
        }, `find-history-by-monitor-${monitorId}`);
    }

    /**
     * Get the count of history entries for a monitor.
     */
    public getHistoryCount(monitorId: string): number {
        const db = this.getDb();
        return getHistoryCount(db, monitorId);
    }

    /**
     * Get the most recent history entry for a monitor.
     */
    public getLatestEntry(monitorId: string): StatusHistory | undefined {
        const db = this.getDb();
        return getLatestHistoryEntry(db, monitorId);
    }

    /**
     * Prune old history entries for all monitors.
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
                            const excessIds = excessEntries.map((e) => e.id);
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
     * Prune old history entries for a monitor, keeping only the most recent entries.
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
     * Get the database instance.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }
}
