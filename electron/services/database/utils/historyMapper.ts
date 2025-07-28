/**
 * Utilities for mapping between database history rows and {@link StatusHistory} objects.
 *
 * @remarks
 * Provides consistent, type-safe transformation between raw database rows and domain history objects,
 * including validation, conversion, and error logging.
 *
 * @see {@link StatusHistory}
 * @public
 */

import { StatusHistory } from "../../../types";
import { logger } from "../../../utils/logger";

/**
 * Represents a single row in the monitor history database table.
 *
 * @remarks
 * Used for low-level database operations and data mapping.
 *
 * @param details - Optional additional information about the history entry.
 * @param id - Unique identifier for the history record.
 * @param monitorId - Identifier of the monitor this history belongs to.
 * @param responseTime - Response time in milliseconds.
 * @param status - Monitor status ("up" or "down").
 * @param timestamp - Unix timestamp of when the check occurred.
 *
 * @public
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
 * Converts a {@link StatusHistory} object to a database row format.
 *
 * @remarks
 * Used when inserting or updating history entries in the database.
 *
 * @param monitorId - The unique identifier of the monitor.
 * @param entry - The {@link StatusHistory} object to convert.
 * @param details - Optional details string to include in the row.
 * @returns An object representing the database row for the history entry.
 *
 * @example
 * ```typescript
 * const row = historyEntryToRow("monitor-123", { status: "up", responseTime: 120, timestamp: 1680000000000 });
 * ```
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
 * Validates that a database row contains the minimum required fields for a history entry.
 *
 * @remarks
 * Ensures that the row has a valid monitor ID, status, and timestamp.
 *
 * @param row - The database row to validate.
 * @returns `true` if the row is valid for a history entry, otherwise `false`.
 *
 * @example
 * ```typescript
 * if (isValidHistoryRow(row)) { ... }
 * ```
 *
 * @public
 */
export function isValidHistoryRow(row: Record<string, unknown>): boolean {
    return (
        row["monitorId"] !== undefined &&
        row["status"] !== undefined &&
        row["timestamp"] !== undefined &&
        typeof row["monitorId"] === "string" &&
        (row["status"] === "up" || row["status"] === "down") &&
        !Number.isNaN(Number(row["timestamp"]))
    );
}

/**
 * Converts an array of raw database rows to an array of {@link StatusHistory} objects.
 *
 * @remarks
 * Each row is mapped using {@link rowToHistoryEntry}.
 *
 * @param rows - Array of raw database rows.
 * @returns Array of mapped {@link StatusHistory} objects.
 *
 * @example
 * ```typescript
 * const history = rowsToHistoryEntries(dbRows);
 * ```
 *
 * @public
 */
export function rowsToHistoryEntries(rows: Record<string, unknown>[]): StatusHistory[] {
    return rows.map((row) => rowToHistoryEntry(row));
}

/**
 * Converts a single database row to a {@link StatusHistory} object.
 *
 * @remarks
 * Performs safe number conversion and status validation. If a value is invalid,
 * it defaults to a safe fallback and logs a warning or error.
 *
 * @param row - The raw database row to convert.
 * @returns The mapped {@link StatusHistory} object.
 * @throws Error If mapping fails due to unexpected data types or missing fields.
 *
 * @example
 * ```typescript
 * const entry = rowToHistoryEntry(dbRow);
 * ```
 *
 * @public
 */
export function rowToHistoryEntry(row: Record<string, unknown>): StatusHistory {
    try {
        return {
            ...(row["details"] !== undefined &&
                row["details"] !== null && {
                    details: typeof row["details"] === "string" ? row["details"] : JSON.stringify(row["details"]),
                }),
            responseTime: safeNumber(row["responseTime"], 0),
            status: validateStatus(row["status"]),
            timestamp: safeNumber(row["timestamp"], Date.now()),
        };
    } catch (error) {
        logger.error("[HistoryMapper] Failed to map database row to history entry", {
            error,
            responseTime: row["responseTime"],
            row,
            status: row["status"],
            timestamp: row["timestamp"],
        });
        throw error;
    }
}

/**
 * Converts a database row to a {@link StatusHistory} object, or returns `undefined` if the row is not present.
 *
 * @remarks
 * Useful for optional row lookups where the row may be missing.
 *
 * @param row - The database row to convert, or `undefined`.
 * @returns The mapped {@link StatusHistory} object, or `undefined` if the row is not present.
 *
 * @example
 * ```typescript
 * const entry = rowToHistoryEntryOrUndefined(optionalRow);
 * ```
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
 * Safely converts a value to a number, returning a fallback if conversion fails.
 *
 * @remarks
 * Used internally to ensure numeric fields are valid numbers.
 *
 * @param value - The value to convert to a number.
 * @param fallback - The fallback value to use if conversion fails.
 * @returns The converted number, or the fallback value if conversion fails.
 *
 * @defaultValue 0
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
 * Validates and converts a status value to a valid {@link StatusHistory.status} value.
 *
 * @remarks
 * If the value is not "up" or "down", logs a warning and returns "down".
 *
 * @param status - The status value to validate.
 * @returns The validated status value ("up" or "down").
 *
 * @internal
 */
function validateStatus(status: unknown): StatusHistory["status"] {
    if (status === "up" || status === "down") return status;
    logger.warn("[HistoryMapper] Invalid status value, defaulting to 'down'", { status });
    return "down";
}
