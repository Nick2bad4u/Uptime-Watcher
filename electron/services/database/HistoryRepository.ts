import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../electronUtils";
import { StatusHistory } from "../../types";
import { logger } from "../../utils/logger";
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
    public async findByMonitorId(monitorId: string): Promise<StatusHistory[]> {
        const db = this.getDb();
        return findHistoryByMonitorId(db, monitorId);
    }

    /**
     * Add a new history entry for a monitor.
     */
    public async addEntry(monitorId: string, entry: StatusHistory, details?: string): Promise<void> {
        const db = this.getDb();
        return addHistoryEntry(db, monitorId, entry, details);
    }

    /**
     * Delete history entries for a specific monitor.
     */
    public async deleteByMonitorId(monitorId: string): Promise<void> {
        const db = this.getDb();
        return deleteHistoryByMonitorId(db, monitorId);
    }

    /**
     * Prune old history entries for a monitor, keeping only the most recent entries.
     */
    public async pruneHistory(monitorId: string, limit: number): Promise<void> {
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
            const db = this.getDb();

            // Get all monitor IDs
            const monitorRows = db.all("SELECT id FROM monitors") as { id: number }[];

            // Prune history for each monitor
            for (const row of monitorRows) {
                await this.pruneHistory(String(row.id), limit);
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
    public async getHistoryCount(monitorId: string): Promise<number> {
        const db = this.getDb();
        return getHistoryCount(db, monitorId);
    }

    /**
     * Clear all history from the database.
     */
    public async deleteAll(): Promise<void> {
        const db = this.getDb();
        return deleteAllHistory(db);
    }

    /**
     * Get the most recent history entry for a monitor.
     */
    public async getLatestEntry(monitorId: string): Promise<StatusHistory | undefined> {
        const db = this.getDb();
        return getLatestHistoryEntry(db, monitorId);
    }

    /**
     * Bulk insert history entries (for import functionality).
     */
    public async bulkInsert(
        monitorId: string,
        historyEntries: (StatusHistory & { details?: string })[]
    ): Promise<void> {
        const db = this.getDb();
        return bulkInsertHistory(db, monitorId, historyEntries);
    }
}
