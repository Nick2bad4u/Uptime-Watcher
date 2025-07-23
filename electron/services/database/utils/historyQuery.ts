import { Database } from "node-sqlite3-wasm";

import { StatusHistory } from "../../../types";
import { logger } from "../../../utils/logger";
import { rowToHistoryEntry } from "./historyMapper";

/**
 * Utility functions for querying history data from the database.
 *
 * @remarks
 * These are internal utility functions designed to be called from HistoryRepository methods
 * that handle async operations, error recovery, and operational hooks.
 */

/**
 * Find all history entries for a specific monitor.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 * @returns Array of StatusHistory objects ordered by timestamp (newest first)
 *
 * @throws {@link Error} When database query fails
 *
 * @remarks
 * **Repository Context**: Designed to be called from HistoryRepository.findByMonitorId()
 * which handles async operations and error recovery via withDatabaseOperation().
 *
 * **Query Performance**: Uses indexed monitor_id field with timestamp ordering for efficiency.
 * Results are ordered by timestamp DESC to show most recent entries first.
 *
 * @internal
 */
export function findHistoryByMonitorId(db: Database, monitorId: string): StatusHistory[] {
    try {
        const historyRows = db.all(
            "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
            [monitorId]
        ) as Record<string, unknown>[];

        return historyRows.map((row) => rowToHistoryEntry(row));
    } catch (error) {
        logger.error(`[HistoryQuery] Failed to fetch history for monitor: ${monitorId}`, error); /* v8 ignore next */
        throw error;
    }
}

/**
 * Get the count of history entries for a monitor.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 * @returns Number of history entries for the monitor (returns 0 if none found)
 *
 * @throws {@link Error} When database query fails
 *
 * @remarks
 * **Repository Context**: Called from HistoryRepository.getHistoryCount() and
 * HistoryRepository.getHistoryCountInternal() for transaction contexts.
 *
 * **Fallback Behavior**: Returns 0 if no results found or result is null/undefined.
 *
 * @internal
 */
export function getHistoryCount(db: Database, monitorId: string): number {
    try {
        const result = db.get("SELECT COUNT(*) as count FROM history WHERE monitor_id = ?", [monitorId]) as
            | undefined
            | { count: number };

        return result?.count ?? 0;
    } catch (error) {
        logger.error(`[HistoryQuery] Failed to get history count for monitor: ${monitorId}`, error);
        throw error;
    }
}

/**
 * Get the most recent history entry for a monitor.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 * @returns Most recent StatusHistory object, or undefined if no entries exist
 *
 * @throws {@link Error} When database query fails
 *
 * @remarks
 * **Repository Context**: Called from HistoryRepository.getLatestEntry()
 * which handles async operations and error recovery via withDatabaseOperation().
 *
 * **Query Behavior**: Uses ORDER BY timestamp DESC LIMIT 1 to get the most recent entry.
 * Returns undefined for monitors with no history entries.
 *
 * @internal
 */
export function getLatestHistoryEntry(db: Database, monitorId: string): StatusHistory | undefined {
    try {
        const row = db.get(
            "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1",
            [monitorId]
        ) as Record<string, unknown> | undefined;

        if (!row) {
            return undefined;
        }

        return rowToHistoryEntry(row);
    } catch (error) {
        logger.error(`[HistoryQuery] Failed to get latest history entry for monitor: ${monitorId}`, error);
        throw error;
    }
}
