import { Database } from "node-sqlite3-wasm";

import { StatusHistory } from "../../types";
import { isDev } from "../../utils";
import { logger } from "../../utils/logger";
import { DatabaseService } from "./DatabaseService";

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
     * Convert database row to history entry.
     */
    private rowToHistoryEntry(row: Record<string, unknown>): StatusHistory {
        return {
            details: row.details !== undefined ? String(row.details) : undefined,
            responseTime: typeof row.responseTime === "number" ? row.responseTime : Number(row.responseTime),
            status: row.status === "up" || row.status === "down" ? row.status : "down",
            timestamp: typeof row.timestamp === "number" ? row.timestamp : Number(row.timestamp),
        };
    }

    /**
     * Find all history entries for a specific monitor.
     */
    public async findByMonitorId(monitorId: string): Promise<StatusHistory[]> {
        try {
            const db = this.getDb();
            const historyRows = db.all(
                "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
                [monitorId]
            ) as Record<string, unknown>[];

            const result = historyRows.map((row) => this.rowToHistoryEntry(row));

            return result;
        } catch (error) {
            logger.error(`[HistoryRepository] Failed to fetch history for monitor: ${monitorId}`, error);
            throw error;
        }
    }

    /**
     * Add a new history entry for a monitor.
     */
    public async addEntry(monitorId: string, entry: StatusHistory, details?: string): Promise<void> {
        try {
            const db = this.getDb();
            db.run(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                [
                    monitorId,
                    entry.timestamp,
                    entry.status,
                    entry.responseTime,
                    // eslint-disable-next-line unicorn/no-null
                    details ?? null,
                ]
            );

            if (isDev()) {
                logger.debug(
                    `[HistoryRepository] Added history entry: monitor_id=${monitorId}, status=${entry.status}, responseTime=${entry.responseTime}, timestamp=${entry.timestamp}`
                );
            }
        } catch (error) {
            logger.error(`[HistoryRepository] Failed to add history entry for monitor: ${monitorId}`, error);
            throw error;
        }
    }

    /**
     * Delete history entries for a specific monitor.
     */
    public async deleteByMonitorId(monitorId: string): Promise<void> {
        try {
            const db = this.getDb();
            db.run("DELETE FROM history WHERE monitor_id = ?", [monitorId]);
            if (isDev()) {
                logger.debug(`[HistoryRepository] Deleted history for monitor: ${monitorId}`);
            }
        } catch (error) {
            logger.error(`[HistoryRepository] Failed to delete history for monitor: ${monitorId}`, error);
            throw error;
        }
    }

    /**
     * Prune old history entries for a monitor, keeping only the most recent entries.
     */
    public async pruneHistory(monitorId: string, limit: number): Promise<void> {
        if (limit <= 0) {
            return;
        }

        try {
            const db = this.getDb();

            // Get entries to delete (keep only the most recent 'limit' entries)
            const excess = db.all(
                "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
                [monitorId, limit]
            ) as Array<{ id: number }>;

            if (excess.length > 0) {
                const excessIds = excess.map((row) => row.id);
                db.run(`DELETE FROM history WHERE id IN (${excessIds.join(",")})`);
                if (isDev()) {
                    logger.debug(
                        `[HistoryRepository] Pruned ${excess.length} old history entries for monitor: ${monitorId}`
                    );
                }
            }
        } catch (error) {
            logger.error(`[HistoryRepository] Failed to prune history for monitor: ${monitorId}`, error);
            throw error;
        }
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
            const monitorRows = db.all("SELECT id FROM monitors") as Array<{ id: number }>;

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
        try {
            const db = this.getDb();
            const result = db.get("SELECT COUNT(*) as count FROM history WHERE monitor_id = ?", [monitorId]) as
                | { count: number }
                | undefined;

            return result?.count ?? 0;
        } catch (error) {
            logger.error(`[HistoryRepository] Failed to get history count for monitor: ${monitorId}`, error);
            throw error;
        }
    }

    /**
     * Clear all history from the database.
     */
    public async deleteAll(): Promise<void> {
        try {
            const db = this.getDb();
            db.run("DELETE FROM history");
            if (isDev()) {
                logger.debug("[HistoryRepository] Cleared all history");
            }
        } catch (error) {
            logger.error("[HistoryRepository] Failed to clear all history", error);
            throw error;
        }
    }

    /**
     * Get the most recent history entry for a monitor.
     */
    public async getLatestEntry(monitorId: string): Promise<StatusHistory | undefined> {
        try {
            const db = this.getDb();
            const row = db.get(
                "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1",
                [monitorId]
            ) as Record<string, unknown> | undefined;

            if (!row) {
                return undefined;
            }

            return this.rowToHistoryEntry(row);
        } catch (error) {
            logger.error(`[HistoryRepository] Failed to get latest history entry for monitor: ${monitorId}`, error);
            throw error;
        }
    }

    /**
     * Bulk insert history entries (for import functionality).
     */
    public async bulkInsert(
        monitorId: string,
        historyEntries: Array<StatusHistory & { details?: string }>
    ): Promise<void> {
        try {
            const db = this.getDb();

            for (const entry of historyEntries) {
                db.run(
                    "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                    [
                        monitorId,
                        entry.timestamp,
                        entry.status === "up" || entry.status === "down" ? entry.status : "down",
                        entry.responseTime,
                        // eslint-disable-next-line unicorn/no-null
                        entry.details ?? null,
                    ]
                );
            }

            logger.info(
                `[HistoryRepository] Bulk inserted ${historyEntries.length} history entries for monitor: ${monitorId}`
            );
        } catch (error) {
            logger.error(`[HistoryRepository] Failed to bulk insert history for monitor: ${monitorId}`, error);
            throw error;
        }
    }
}
