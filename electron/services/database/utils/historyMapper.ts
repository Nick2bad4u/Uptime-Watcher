import { StatusHistory } from "../../../types";

/**
 * Utility functions for mapping database rows to history entries.
 */

/**
 * Convert database row to history entry.
 */
export function rowToHistoryEntry(row: Record<string, unknown>): StatusHistory {
    return {
        ...(row.details !== undefined && row.details !== null && { details: String(row.details) }),
        responseTime: typeof row.responseTime === "number" ? row.responseTime : Number(row.responseTime),
        status: row.status === "up" || row.status === "down" ? row.status : "down",
        timestamp: typeof row.timestamp === "number" ? row.timestamp : Number(row.timestamp),
    };
}
