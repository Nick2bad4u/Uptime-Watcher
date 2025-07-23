import { Database } from "node-sqlite3-wasm";

import { StatusHistory } from "../../../types";
import { logger } from "../../../utils/logger";
import { rowToHistoryEntry } from "./historyMapper";

/**
 * Utility functions for querying history data from the database.
 */

/**
 * Find all history entries for a specific monitor.
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
