import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../../electronUtils";
import { StatusHistory } from "../../../types";
import { logger } from "../../../utils/index";

/**
 * Utility functions for manipulating history data in the database.
 */

/**
 * Add a new history entry for a monitor.
 */
export function addHistoryEntry(db: Database, monitorId: string, entry: StatusHistory, details?: string): void {
    try {
        db.run("INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)", [
            monitorId,
            entry.timestamp,
            entry.status,
            entry.responseTime,

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
export function deleteHistoryByMonitorId(db: Database, monitorId: string): void {
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
export function deleteAllHistory(db: Database): void {
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
export function pruneHistoryForMonitor(db: Database, monitorId: string, limit: number): void {
    if (limit <= 0) {
        return;
    }

    try {
        // Get entries to delete (keep only the most recent 'limit' entries)
        const excess = db.all("SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?", [
            monitorId,
            limit,
        ]) as { id: number }[];

        if (excess.length > 0) {
            const excessIds = excess.map((row) => row.id);
            // Use parameterized query to avoid SQL injection
            const placeholders = excessIds.map(() => "?").join(",");
            db.run(`DELETE FROM history WHERE id IN (${placeholders})`, excessIds);
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
 * Assumes it's called within an existing transaction context.
 * Uses a prepared statement for better performance.
 */
export function bulkInsertHistory(
    db: Database,
    monitorId: string,
    historyEntries: (StatusHistory & { details?: string })[]
): void {
    if (historyEntries.length === 0) {
        return;
    }

    try {
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
                `[HistoryManipulation] Bulk inserted ${historyEntries.length} history entries for monitor: ${monitorId}`
            );
        } finally {
            stmt.finalize();
        }
    } catch (error) {
        logger.error(`[HistoryManipulation] Failed to bulk insert history for monitor: ${monitorId}`, error);
        throw error;
    }
}
