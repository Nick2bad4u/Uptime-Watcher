import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../../electronUtils";
import { StatusHistory } from "../../../types";
import { logger } from "../../../utils/logger";

/**
 * Utility functions for manipulating monitor history data in the database.
 *
 * @remarks
 * Provides low-level helpers for adding, bulk inserting, deleting, and pruning monitor history entries. All functions are intended for internal use by repository classes and assume transaction context is managed by the caller.
 *
 * @internal
 */

/**
 * Add a new history entry for a monitor.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 * @param entry - StatusHistory object containing check results
 * @param details - Optional additional details about the check
 *
 * @throws {@link Error} When database insertion fails
 *
 * @remarks
 * **Transaction Context**: This utility function is designed to be called from
 * repository methods that manage transaction context and error handling.
 *
 * **Usage Pattern**: Always called from HistoryRepository.addEntryInternal()
 * within an existing transaction context for proper atomicity.
 *
 * @internal
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
 * Bulk insert history entries (for import functionality).
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 * @param historyEntries - Array of StatusHistory objects with optional details
 *
 * @throws {@link Error} When database bulk insertion fails
 *
 * @remarks
 * **Transaction Context**: Assumes it's called within an existing transaction context.
 * Uses a prepared statement for better performance during bulk operations.
 *
 * **Performance**: Optimized for large datasets with prepared statement reuse.
 * The statement is properly finalized in the finally block to prevent resource leaks.
 *
 * **Status Validation**: StatusHistory.status is always "up" or "down" per domain contract.
 *
 * @internal
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
                    entry.status, // StatusHistory.status is always "up" or "down" per domain contract
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

/**
 * Clear all history from the database.
 *
 * @param db - Database connection instance
 *
 * @throws {@link Error} When database deletion fails
 *
 * @remarks
 * **WARNING**: This operation is destructive and irreversible.
 *
 * **Transaction Context**: Designed to be called from repository methods
 * that manage transaction context. Always used within HistoryRepository.deleteAllInternal().
 *
 * @internal
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
 * Delete history entries for a specific monitor.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 *
 * @throws {@link Error} When database deletion fails
 *
 * @remarks
 * **Transaction Context**: Designed to be called from repository methods
 * that manage transaction context. Used within HistoryRepository.deleteByMonitorIdInternal().
 *
 * @internal
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
 * Prune old history entries for a monitor, keeping only the most recent entries.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 * @param limit - Maximum number of history entries to retain
 *
 * @throws {@link Error} When database operations fail
 *
 * @remarks
 * **Algorithm**: Uses `LIMIT -1 OFFSET ?` to select all entries beyond the most recent `limit` entries.
 * In SQLite, `LIMIT -1` means "no limit", and combined with `OFFSET`, this efficiently
 * identifies excess entries for deletion.
 *
 * **Transaction Context**: Designed to be called from repository methods within transaction context.
 * Used by HistoryRepository.pruneHistoryInternal() and HistoryRepository.pruneAllHistoryInternal().
 *
 * **Performance**: Only executes DELETE when excess entries exist to avoid unnecessary operations.
 *
 * @internal
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
            // Convert numeric IDs to ensure type safety and validate they are numbers
            const excessIds = excess.map((row) => Number(row.id)).filter((id) => Number.isFinite(id) && id > 0);

            if (excessIds.length > 0) {
                // Use parameterized query to avoid SQL injection
                const placeholders = excessIds.map(() => "?").join(",");
                db.run(`DELETE FROM history WHERE id IN (${placeholders})`, excessIds);
                if (isDev()) {
                    logger.debug(
                        `[HistoryManipulation] Pruned ${excessIds.length} old history entries for monitor: ${monitorId}`
                    );
                }
            }
        }
    } catch (error) {
        logger.error(`[HistoryManipulation] Failed to prune history for monitor: ${monitorId}`, error);
        throw error;
    }
}
