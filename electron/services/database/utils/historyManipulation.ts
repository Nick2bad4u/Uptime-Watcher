import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../../electronUtils";
import { StatusHistory } from "../../../types";
import { logger } from "../../../utils/logger";

/**
 * Utility functions for manipulating history data in the database.
 */

/**
 * Add a new history entry for a monitor.
 */
export async function addHistoryEntry(
    db: Database,
    monitorId: string,
    entry: StatusHistory,
    details?: string
): Promise<void> {
    try {
        db.run("INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)", [
            monitorId,
            entry.timestamp,
            entry.status,
            entry.responseTime,
            // eslint-disable-next-line unicorn/no-null
            details ?? null,
        ]);

        if (isDev()) {
            logger.debug(
                `[HistoryManipulation] Added history entry: monitor_id=${monitorId}, status=${entry.status}, responseTime=${entry.responseTime}, timestamp=${entry.timestamp}`
            );
        }
    } catch (error) {
        logger.error(`[HistoryManipulation] Failed to add history entry for monitor: ${monitorId}`, error);
        throw error;
    }
}

/**
 * Delete history entries for a specific monitor.
 */
export async function deleteHistoryByMonitorId(db: Database, monitorId: string): Promise<void> {
    try {
        db.run("DELETE FROM history WHERE monitor_id = ?", [monitorId]);
        if (isDev()) {
            logger.debug(`[HistoryManipulation] Deleted history for monitor: ${monitorId}`);
        }
    } catch (error) {
        logger.error(`[HistoryManipulation] Failed to delete history for monitor: ${monitorId}`, error);
        throw error;
    }
}

/**
 * Clear all history from the database.
 */
export async function deleteAllHistory(db: Database): Promise<void> {
    try {
        db.run("DELETE FROM history");
        if (isDev()) {
            logger.debug("[HistoryManipulation] Cleared all history");
        }
    } catch (error) {
        logger.error("[HistoryManipulation] Failed to clear all history", error);
        throw error;
    }
}

/**
 * Prune old history entries for a monitor, keeping only the most recent entries.
 */
export async function pruneHistoryForMonitor(db: Database, monitorId: string, limit: number): Promise<void> {
    if (limit <= 0) {
        return;
    }

    try {
        // Get entries to delete (keep only the most recent 'limit' entries)
        const excess = db.all("SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?", [
            monitorId,
            limit,
        ]) as Array<{ id: number }>;

        if (excess.length > 0) {
            const excessIds = excess.map((row) => row.id);
            db.run(`DELETE FROM history WHERE id IN (${excessIds.join(",")})`);
            if (isDev()) {
                logger.debug(
                    `[HistoryManipulation] Pruned ${excess.length} old history entries for monitor: ${monitorId}`
                );
            }
        }
    } catch (error) {
        logger.error(`[HistoryManipulation] Failed to prune history for monitor: ${monitorId}`, error);
        throw error;
    }
}

/**
 * Bulk insert history entries (for import functionality).
 */
export async function bulkInsertHistory(
    db: Database,
    monitorId: string,
    historyEntries: Array<StatusHistory & { details?: string }>
): Promise<void> {
    try {
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
            `[HistoryManipulation] Bulk inserted ${historyEntries.length} history entries for monitor: ${monitorId}`
        );
    } catch (error) {
        logger.error(`[HistoryManipulation] Failed to bulk insert history for monitor: ${monitorId}`, error);
        throw error;
    }
}
