/**
 * History database row mapping utilities.
 * Provides consistent data transformation between database rows and history objects.
 */

import { StatusHistory } from "../../../types";
import { logger } from "../../../utils";

/**
 * History row interface for database operations.
 */
export interface HistoryRow {
    id: string;
    monitorId: string;
    status: StatusHistory["status"];
    responseTime: number;
    timestamp: number;
    details?: string;
}

/**
 * Convert database row to history entry.
 *
 * @param row - Raw database row
 * @returns Mapped StatusHistory object
 *
 * @public
 */
export function rowToHistoryEntry(row: Record<string, unknown>): StatusHistory {
    try {
        return {
            ...(row.details !== undefined &&
                row.details !== null && {
                    details: typeof row.details === "string" ? row.details : JSON.stringify(row.details),
                }),
            responseTime: typeof row.responseTime === "number" ? row.responseTime : Number(row.responseTime),
            status: row.status === "up" || row.status === "down" ? row.status : "down",
            timestamp: typeof row.timestamp === "number" ? row.timestamp : Number(row.timestamp),
        };
    } catch (error) {
        logger.error("[HistoryMapper] Failed to map database row to history entry", { row, error });
        throw error;
    }
}

/**
 * Convert multiple database rows to history entries.
 *
 * @param rows - Array of raw database rows
 * @returns Array of mapped StatusHistory objects
 *
 * @public
 */
export function rowsToHistoryEntries(rows: Record<string, unknown>[]): StatusHistory[] {
    return rows.map((row) => rowToHistoryEntry(row));
}

/**
 * Convert database row to history entry or return undefined if not found.
 *
 * @param row - Database row data or undefined
 * @returns Converted history entry or undefined
 *
 * @public
 */
export function rowToHistoryEntryOrUndefined(row: Record<string, unknown> | undefined): StatusHistory | undefined {
    if (!row) {
        return undefined;
    }

    return rowToHistoryEntry(row);
}

/**
 * Validate that a row contains the minimum required fields for a history entry.
 *
 * @param row - Database row to validate
 * @returns True if row is valid
 *
 * @public
 */
export function isValidHistoryRow(row: Record<string, unknown>): boolean {
    return (
        row.monitorId !== undefined &&
        row.status !== undefined &&
        row.timestamp !== undefined &&
        typeof row.monitorId === "string" &&
        (row.status === "up" || row.status === "down") &&
        !Number.isNaN(Number(row.timestamp))
    );
}

/**
 * Convert StatusHistory to database row format.
 *
 * @param monitorId - Monitor ID
 * @param entry - StatusHistory object
 * @param details - Optional details string
 * @returns Database row format
 *
 * @public
 */
export function historyEntryToRow(monitorId: string, entry: StatusHistory, details?: string): Record<string, unknown> {
    return {
        monitorId,
        status: entry.status,
        responseTime: entry.responseTime,
        timestamp: entry.timestamp,
        ...(details && { details }),
    };
}
