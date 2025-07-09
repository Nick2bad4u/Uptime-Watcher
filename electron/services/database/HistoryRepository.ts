import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../electronUtils";
import { StatusHistory } from "../../types";
import { logger } from "../../utils/index";
import { DatabaseService } from "./DatabaseService";
import {
    addHistoryEntry,
    bulkInsertHistory,
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
    public pruneAllHistory(limit: number): void {
        if (limit <= 0) {
            return;
        }

        try {
            const db = this.getDb();

            // Get all monitor IDs
            const monitorRows = db.all("SELECT id FROM monitors") as { id: number }[];

            // Prune history for each monitor
            for (const row of monitorRows) {
                this.pruneHistory(String(row.id), limit);
            }

            if (isDev()) {
                logger.debug(`[HistoryRepository] Pruned history for all monitors (limit: ${limit})`);
            }
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
     * Get the most recent history entry for a monitor.
     */
    public getLatestEntry(monitorId: string): StatusHistory | undefined {
        const db = this.getDb();
        return getLatestHistoryEntry(db, monitorId);
    }

    /**
     * Bulk insert history entries (for import functionality).
     */
    public bulkInsert(
        monitorId: string,
        historyEntries: (StatusHistory & { details?: string })[]
    ): void {
        const db = this.getDb();
        return bulkInsertHistory(db, monitorId, historyEntries);
    }
}
