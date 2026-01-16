import type { StatusHistory } from "@shared/types";
import type { Database } from "node-sqlite3-wasm";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import { isDev } from "../../../../electronUtils";
import { logger } from "../../../../utils/logger";
import { queryForIds } from "../queries/typedQueries";

/**
 * Utility functions for manipulating monitor history data in the database.
 *
 * @remarks
 * Provides low-level helpers for adding, bulk inserting, deleting, and pruning
 * monitor history entries. All functions are intended for internal use by
 * repository classes and assume transaction context is managed by the caller.
 *
 * @internal
 */

/**
 * Common SQL queries for history manipulation operations.
 *
 * @internal
 */
const HISTORY_MANIPULATION_QUERIES = {
    DELETE_ALL: "DELETE FROM history",
    DELETE_BY_MONITOR: "DELETE FROM history WHERE monitor_id = ?",
    // Avoid building huge IN (...) lists (which can hit SQLite's
    // SQLITE_MAX_VARIABLE_NUMBER limit). This deletes all rows beyond the
    // newest `limit` entries for the monitor.
    DELETE_EXCESS_ENTRIES:
        "DELETE FROM history WHERE id IN (SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?)",
    INSERT_ENTRY:
        "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",

    // Cheap probe to determine whether any rows exist beyond the newest `limit`.
    SELECT_EXCESS_ENTRIES:
        "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1 OFFSET ?",
} as const;

/**
 * Add a new history entry for a monitor.
 *
 * @remarks
 * Designed to be called from repository methods that manage transaction
 * context and error handling.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 * @param entry - StatusHistory object containing check results
 * @param details - Optional additional details about the check
 *
 * @throws {@link Error} When database insertion fails
 *
 * @internal
 */
export function addHistoryEntry(
    db: Database,
    monitorId: string,
    entry: StatusHistory,
    details?: string
): void {
    try {
        db.run(HISTORY_MANIPULATION_QUERIES.INSERT_ENTRY, [
            monitorId,
            entry.timestamp,
            entry.status,
            entry.responseTime,
            details ?? null,
        ]);

        if (isDev()) {
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.HISTORY_ENTRY_ADDED,
                    { monitorId, status: entry.status }
                )
            );
        }
    } catch (error) {
        logger.error(
            interpolateLogTemplate(LOG_TEMPLATES.errors.HISTORY_ADD_FAILED, {
                monitorId,
            }),
            error
        );
        throw error;
    }
}

/**
 * Bulk insert history entries (for import functionality).
 *
 * @remarks
 * Assumes it's called within an existing transaction context. Uses a prepared
 * statement for better performance during bulk operations.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 * @param historyEntries - Array of StatusHistory objects
 *
 * @throws {@link Error} When database bulk insertion fails
 *
 * @internal
 */
export function bulkInsertHistory(
    db: Database,
    monitorId: string,
    historyEntries: StatusHistory[]
): void {
    if (historyEntries.length === 0) {
        return;
    }

    try {
        // Prepare the statement once for better performance
        const stmt = db.prepare(HISTORY_MANIPULATION_QUERIES.INSERT_ENTRY);

        try {
            for (const entry of historyEntries) {
                stmt.run([
                    monitorId,
                    entry.timestamp,
                    entry.status,
                    entry.responseTime,
                    entry.details ?? null,
                ]);
            }

            logger.info(
                interpolateLogTemplate(LOG_TEMPLATES.services.HISTORY_BULK_INSERT, {
                    count: historyEntries.length,
                    monitorId,
                })
            );
        } finally {
            stmt.finalize();
        }
    } catch (error) {
        logger.error(
            interpolateLogTemplate(
                LOG_TEMPLATES.errors.HISTORY_BULK_INSERT_FAILED,
                { monitorId }
            ),
            error
        );
        throw error;
    }
}

/**
 * Clear all history from the database.
 *
 * @remarks
 * WARNING: This operation is destructive and irreversible.
 *
 * @param db - Database connection instance
 *
 * @throws {@link Error} When database deletion fails
 *
 * @internal
 */
export function deleteAllHistory(db: Database): void {
    try {
        db.run(HISTORY_MANIPULATION_QUERIES.DELETE_ALL);
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
 * @internal
 */
export function deleteHistoryByMonitorId(db: Database, monitorId: string): void {
    try {
        db.run(HISTORY_MANIPULATION_QUERIES.DELETE_BY_MONITOR, [monitorId]);
        if (isDev()) {
            logger.debug(
                `[HistoryManipulation] Deleted history for monitor: ${monitorId}`
            );
        }
    } catch (error) {
        logger.error(
            interpolateLogTemplate(LOG_TEMPLATES.errors.HISTORY_PRUNE_FAILED, {
                monitorId,
            }),
            error
        );
        throw error;
    }
}

/**
 * Prune old history entries for a monitor, keeping only the most recent
 * entries.
 *
 * @remarks
 * Uses a cheap probe query (`LIMIT 1 OFFSET ?`) to determine whether pruning is
 * necessary. When pruning is needed, performs a single DELETE statement with a
 * subquery.
 *
 * This avoids building huge parameter lists that can hit SQLite's variable
 * limit.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 * @param limit - Maximum number of history entries to retain
 *
 * @throws {@link Error} When database operations fail
 *
 * @internal
 */
export function pruneHistoryForMonitor(
    db: Database,
    monitorId: string,
    limit: number
): void {
    if (limit <= 0) {
        return;
    }

    try {
        const excessProbe = queryForIds(
            db,
            HISTORY_MANIPULATION_QUERIES.SELECT_EXCESS_ENTRIES,
            [monitorId, limit]
        );

        if (excessProbe.length === 0) {
            return;
        }

        db.run(HISTORY_MANIPULATION_QUERIES.DELETE_EXCESS_ENTRIES, [
            monitorId,
            limit,
        ]);

        if (isDev()) {
            logger.debug(
                `[HistoryManipulation] Pruned history entries for monitor: ${monitorId} (limit: ${limit})`
            );
        }
    } catch (error) {
        logger.error(
            interpolateLogTemplate(LOG_TEMPLATES.errors.HISTORY_PRUNE_FAILED, {
                monitorId,
            }),
            error
        );
        throw error;
    }
}
