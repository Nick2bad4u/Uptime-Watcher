import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../electronUtils";
import { StatusHistory } from "../../types";
import { logger } from "../../utils/index";
import { DatabaseService } from "./DatabaseService";
import {
    addHistoryEntry,
    deleteAllHistory,
    deleteHistoryByMonitorId,
    findHistoryByMonitorId,
    getHistoryCount,
    getLatestHistoryEntry,
    pruneHistoryForMonitor,
} from "./utils";

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
     * Get the database instance.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }

    /**
     * Find all history entries for a specific monitor.
     */
    public findByMonitorId(monitorId: string): StatusHistory[] {
        const db = this.getDb();
        return findHistoryByMonitorId(db, monitorId);
    }

    /**
     * Add a new history entry for a monitor.
     */
    public addEntry(monitorId: string, entry: StatusHistory, details?: string): void {
        const db = this.getDb();
        return addHistoryEntry(db, monitorId, entry, details);
    }

    /**
     * Delete history entries for a specific monitor.
     */
    public deleteByMonitorId(monitorId: string): void {
        const db = this.getDb();
        return deleteHistoryByMonitorId(db, monitorId);
    }

    /**
     * Prune old history entries for a monitor, keeping only the most recent entries.
     */
    public pruneHistory(monitorId: string, limit: number): void {
        const db = this.getDb();
        return pruneHistoryForMonitor(db, monitorId, limit);
    }

    /**
     * Prune old history entries for all monitors.
     */
    public async pruneAllHistory(limit: number): Promise<void> {
        if (limit <= 0) {
            return;
        }

        try {
            await this.databaseService.executeTransaction((db) => {
                this.pruneAllHistoryInternal(db, limit);
                return Promise.resolve();
            });
        } catch (error) {
            logger.error("[HistoryRepository] Failed to prune history for all monitors", error);
            throw error;
        }
    }

    /**
     * Get the count of history entries for a monitor.
     */
    public getHistoryCount(monitorId: string): number {
        const db = this.getDb();
        return getHistoryCount(db, monitorId);
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
     * Internal method to delete history entries for a specific monitor within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public deleteByMonitorIdInternal(db: Database, monitorId: string): void {
        return deleteHistoryByMonitorId(db, monitorId);
    }

    /**
     * Internal method to add a new history entry for a monitor within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public addEntryInternal(db: Database, monitorId: string, entry: StatusHistory, details?: string): void {
        return addHistoryEntry(db, monitorId, entry, details);
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
     * Get the most recent history entry for a monitor.
     */
    public getLatestEntry(monitorId: string): StatusHistory | undefined {
        const db = this.getDb();
        return getLatestHistoryEntry(db, monitorId);
    }

    /**
     * Bulk insert history entries (for import functionality).
     */
    public async bulkInsert(monitorId: string, historyEntries: (StatusHistory & { details?: string })[]): Promise<void> {
        if (historyEntries.length === 0) {
            return;
        }

        try {
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
                            entry.status === "up" || entry.status === "down" ? entry.status : "down",
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
        } catch (error) {
            logger.error(`[HistoryRepository] Failed to bulk insert history for monitor: ${monitorId}`, error);
            throw error;
        }
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
}
