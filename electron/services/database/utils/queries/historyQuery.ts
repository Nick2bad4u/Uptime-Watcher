import type { StatusHistory } from "@shared/types";
import type { Database } from "node-sqlite3-wasm";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import { logger } from "../../../../utils/logger";
import { rowToHistoryEntry } from "../mappers/historyMapper";
import {
    queryForCount,
    queryHistoryRow,
    queryHistoryRows,
} from "./typedQueries";

/**
 * Utility functions for querying monitor history data from the database.
 *
 * @remarks
 * These are internal utility functions designed to be called from
 * {@link HistoryRepository} methods that handle async operations, error
 * recovery, and operational hooks. All functions assume transaction context and
 * error handling are managed by the caller.
 *
 * @internal
 */

/**
 * Common SQL queries for history query operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant
 * is internal to the utility module and not exported.
 *
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
 * @remarks
 * **Repository Context**: Designed to be called from
 * HistoryRepository.findByMonitorId() which handles async operations and error
 * recovery via withDatabaseOperation().
 *
 * **Query Performance**: Uses indexed monitor_id field with timestamp ordering
 * for efficiency. Results are ordered by timestamp DESC to show most recent
 * entries first.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 *
 * @returns Array of StatusHistory objects ordered by timestamp (newest first)
 *
 * @throws {@link Error} When database query fails
 *
 * @internal
 */
export function findHistoryByMonitorId(
    db: Database,
    monitorId: string
): StatusHistory[] {
    try {
        const historyRows = queryHistoryRows(
            db,
            HISTORY_QUERY_QUERIES.SELECT_ALL_BY_MONITOR,
            [monitorId]
        );

        return historyRows.map((row) => rowToHistoryEntry(row));
    } catch (error) {
        logger.error(
            interpolateLogTemplate(LOG_TEMPLATES.errors.HISTORY_FETCH_FAILED, {
                monitorId,
            }),
            error
        ); /* V8 ignore next */
        throw error;
    }
}

/**
 * Get the count of history entries for a monitor.
 *
 * @remarks
 * **Repository Context**: Called from HistoryRepository.getHistoryCount() and
 * HistoryRepository.getHistoryCountInternal() for transaction contexts.
 *
 * **Fallback Behavior**: Returns 0 if no results found or result is
 * null/undefined.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 *
 * @returns Number of history entries for the monitor (returns 0 if none found)
 *
 * @throws {@link Error} When database query fails
 *
 * @internal
 */
export function getHistoryCount(db: Database, monitorId: string): number {
    try {
        const result = queryForCount(
            db,
            HISTORY_QUERY_QUERIES.SELECT_COUNT_BY_MONITOR,
            [monitorId]
        );

        return result?.count ?? 0;
    } catch (error) {
        if (error instanceof Error && error.message.includes("CountResult")) {
            const logWarnOrError =
                typeof logger.warn === "function"
                    ? logger.warn.bind(logger)
                    : logger.error.bind(logger);
            logWarnOrError(
                `[HistoryQuery] Invalid count result for monitor: ${monitorId}`,
                error
            );
            return 0;
        }

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
 * @remarks
 * **Repository Context**: Called from HistoryRepository.getLatestEntry() which
 * handles async operations and error recovery via withDatabaseOperation().
 *
 * **Query Behavior**: Uses ORDER BY timestamp DESC LIMIT 1 to get the most
 * recent entry. Returns undefined for monitors with no history entries.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 *
 * @returns Most recent StatusHistory object, or undefined if no entries exist
 *
 * @throws {@link Error} When database query fails
 *
 * @internal
 */
export function getLatestHistoryEntry(
    db: Database,
    monitorId: string
): StatusHistory | undefined {
    try {
        const row = queryHistoryRow(
            db,
            HISTORY_QUERY_QUERIES.SELECT_LATEST_BY_MONITOR,
            [monitorId]
        );

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
