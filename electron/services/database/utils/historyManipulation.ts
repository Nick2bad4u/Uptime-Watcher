import type { StatusHistory } from "@shared/types";
import type { Database } from "node-sqlite3-wasm";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";

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
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant
 * is internal to the utility module and not exported.
 *
 * @internal
 */
const HISTORY_MANIPULATION_QUERIES = {
    DELETE_ALL: "DELETE FROM history",
    DELETE_BY_IDS: "DELETE FROM history WHERE id IN",
    DELETE_BY_MONITOR: "DELETE FROM history WHERE monitor_id = ?",
    INSERT_ENTRY:
        "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
    SELECT_EXCESS_ENTRIES:
        "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
} as const;

/**
 * Add a new history entry for a monitor.
 *
 * @remarks
 * **Transaction Context**: This utility function is designed to be called from
 * repository methods that manage transaction context and error handling.
 *
 * **Usage Pattern**: Always called from HistoryRepository.addEntryInternal()
 * within an existing transaction context for proper atomicity.
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
 * **Transaction Context**: Assumes it's called within an existing transaction
 * context. Uses a prepared statement for better performance during bulk
 * operations.
 *
 * **Performance**: Optimized for large datasets with prepared statement reuse.
 * The statement is properly finalized in the finally block to prevent resource
 * leaks.
 *
 * **Status Validation**: StatusHistory.status can be "up", "down", or
 * "degraded" per domain contract.
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 * @param historyEntries - Array of StatusHistory objects with optional details
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
                    entry.status, // StatusHistory.status can be "up", "down", or "degraded" per domain contract
                    entry.responseTime,
                    entry.details ?? null,
                ]);
            }

            logger.info(
                interpolateLogTemplate(
                    LOG_TEMPLATES.services.HISTORY_BULK_INSERT,
                    {
                        count: historyEntries.length,
                        monitorId,
                    }
                )
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
 * **WARNING**: This operation is destructive and irreversible.
 *
 * **Transaction Context**: Designed to be called from repository methods that
 * manage transaction context. Always used within
 * HistoryRepository.deleteAllInternal().
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
        logger.error(
            "[HistoryManipulation] Failed to clear all history",
            error
        );
        throw error;
    }
}

/**
 * Delete history entries for a specific monitor.
 *
 * @remarks
 * **Transaction Context**: Designed to be called from repository methods that
 * manage transaction context. Used within
 * HistoryRepository.deleteByMonitorIdInternal().
 *
 * @param db - Database connection instance
 * @param monitorId - Unique identifier of the monitor
 *
 * @throws {@link Error} When database deletion fails
 *
 * @internal
 */
export function deleteHistoryByMonitorId(
    db: Database,
    monitorId: string
): void {
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
 * **Algorithm**: Uses `LIMIT -1 OFFSET ?` to select all entries beyond the most
 * recent `limit` entries. In SQLite, `LIMIT -1` means "no limit", and combined
 * with `OFFSET`, this efficiently identifies excess entries for deletion.
 *
 * **Transaction Context**: Designed to be called from repository methods within
 * transaction context. Used by HistoryRepository.pruneHistoryInternal() and
 * HistoryRepository.pruneAllHistoryInternal().
 *
 * **Performance**: Only executes DELETE when excess entries exist to avoid
 * unnecessary operations.
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
        // Get entries to delete (keep only the most recent 'limit' entries)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Query result structure is known and controlled by our SQL
        const excess = db.all(
            HISTORY_MANIPULATION_QUERIES.SELECT_EXCESS_ENTRIES,
            [monitorId, limit]
        ) as
            | Array<{
                  id: number;
              }>
            | undefined;

        if (excess && excess.length > 0) {
            // Convert numeric IDs to ensure type safety and validate they are
            // numbers
            const excessIds = excess
                .map((row) => row.id)
                .filter((id) => Number.isFinite(id) && id > 0);

            if (excessIds.length > 0) {
                // Use parameterized query to avoid SQL injection
                const placeholders = excessIds.map(() => "?").join(",");
                db.run(
                    `${HISTORY_MANIPULATION_QUERIES.DELETE_BY_IDS} (${placeholders})`,
                    excessIds
                );
                if (isDev()) {
                    logger.debug(
                        `[HistoryManipulation] Pruned ${excessIds.length} old history entries for monitor: ${monitorId}`
                    );
                }
            }
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
