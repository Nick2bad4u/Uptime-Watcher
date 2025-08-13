import type { StatusHistory } from "@shared/types";
import type { HistoryRow as DatabaseHistoryRow } from "@shared/types/database";
import type { Database } from "node-sqlite3-wasm";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import { logger } from "../../../utils/logger";
import { rowToHistoryEntry } from "./historyMapper";

/**
 * Utility functions for querying monitor history data from the database.
 *
 * @remarks
 * These are internal utility functions designed to be called from {@link
 * HistoryRepository} methods that handle async operations, error recovery, and
 * operational hooks. All functions assume transaction context and error
 * handling are managed by the caller.
 *
 * @internal
 */

/**
 * Common SQL queries for history query operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant is internal to the utility module and not exported.
 * @internal
 */
const HISTORY_QUERY_QUERIES = {
    SELECT_ALL_BY_MONITOR:
        "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
    SELECT_COUNT_BY_MONITOR:
        "SELECT COUNT(*) as count FROM history WHERE monitor_id = ?",
    SELECT_LATEST_BY_MONITOR:
        "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1",
} as const;

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
 * **Repository Context**: Designed to be called from
 * HistoryRepository.findByMonitorId() which handles async operations and error
 * recovery via withDatabaseOperation().
 *
 * **Query Performance**: Uses indexed monitor_id field with timestamp ordering
 * for efficiency. Results are ordered by timestamp DESC to show most recent
 * entries first.
 *
 * @internal
 */
export function findHistoryByMonitorId(
    db: Database,
    monitorId: string
): StatusHistory[] {
    try {
        const historyRows = db.all(
            HISTORY_QUERY_QUERIES.SELECT_ALL_BY_MONITOR,
            [monitorId]
        ) as DatabaseHistoryRow[];

        return historyRows.map((row) => rowToHistoryEntry(row));
    } catch (error) {
        logger.error(
            interpolateLogTemplate(LOG_TEMPLATES.errors.HISTORY_FETCH_FAILED, {
                monitorId,
            }),
            error
        ); /* v8 ignore next */
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
 * **Fallback Behavior**: Returns 0 if no results found or result is
 * null/undefined.
 *
 * @internal
 */
export function getHistoryCount(db: Database, monitorId: string): number {
    try {
        const result = db.get(HISTORY_QUERY_QUERIES.SELECT_COUNT_BY_MONITOR, [
            monitorId,
        ]) as undefined | { count: number };

        return result?.count ?? 0;
    } catch (error) {
        logger.error(
            `[HistoryQuery] Failed to get history count for monitor: ${monitorId}`,
            error
        );
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
 * which handles async operations and error recovery via
 * withDatabaseOperation().
 *
 * **Query Behavior**: Uses ORDER BY timestamp DESC LIMIT 1 to get the most
 * recent entry. Returns undefined for monitors with no history entries.
 *
 * @internal
 */
export function getLatestHistoryEntry(
    db: Database,
    monitorId: string
): StatusHistory | undefined {
    try {
        const row = db.get(HISTORY_QUERY_QUERIES.SELECT_LATEST_BY_MONITOR, [
            monitorId,
        ]) as DatabaseHistoryRow | undefined;

        if (!row) {
            return undefined;
        }

        return rowToHistoryEntry(row);
    } catch (error) {
        logger.error(
            interpolateLogTemplate(
                LOG_TEMPLATES.errors.HISTORY_LATEST_FETCH_FAILED,
                { monitorId }
            ),
            error
        );
        throw error;
    }
}
