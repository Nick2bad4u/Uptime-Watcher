/**
 * History database row mapping utilities.
 * Provides consistent data transformation between database rows and history objects.
 */

import { StatusHistory } from "../../../types";
import { logger } from "../../../utils/logger";

/**
 * History row interface for database operations.
 *
 * @remarks
 * Represents a database row containing history data with the following fields:
 * - details: Optional additional information about the history entry
 * - id: Unique identifier for the history record
 * - monitorId: Identifier of the monitor this history belongs to
 * - responseTime: Response time in milliseconds
 * - status: Monitor status ("up" or "down")
 * - timestamp: Unix timestamp of when the check occurred
 */
export interface HistoryRow {
    details?: string;
    id: string;
    monitorId: string;
    responseTime: number;
    status: StatusHistory["status"];
    timestamp: number;
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
        responseTime: entry.responseTime,
        status: entry.status,
        timestamp: entry.timestamp,
        ...(details && { details }),
    };
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
 * Convert database row to history entry.
 *
 * @param row - Raw database row
 * @returns Mapped StatusHistory object
 *
 * @throws {@link Error} When row mapping fails
 *
 * @remarks
 * Uses safe number conversion and status validation to ensure data integrity.
 * Invalid numbers default to 0, invalid status values default to "down" with logging.
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
            responseTime: safeNumber(row.responseTime, 0),
            status: validateStatus(row.status),
            timestamp: safeNumber(row.timestamp, Date.now()),
        };
    } catch (error) {
        logger.error("[HistoryMapper] Failed to map database row to history entry", {
            error,
            responseTime: row.responseTime,
            row,
            status: row.status,
            timestamp: row.timestamp,
        });
        throw error;
    }
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
 * Safely convert a value to a number with validation.
 *
 * @param value - Value to convert to number
 * @param fallback - Fallback value if conversion fails
 * @returns Converted number or fallback value
 *
 * @internal
 */
function safeNumber(value: unknown, fallback: number = 0): number {
    if (typeof value === "number" && !Number.isNaN(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) return parsed;
    }
    return fallback;
}

/**
 * Validate and convert status value with logging.
 *
 * @param status - Status value to validate
 * @returns Valid status value ("up" or "down")
 *
 * @internal
 */
function validateStatus(status: unknown): StatusHistory["status"] {
    if (status === "up" || status === "down") return status;
    logger.warn("[HistoryMapper] Invalid status value, defaulting to 'down'", { status });
    return "down";
}
