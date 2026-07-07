/**
 * Utilities for mapping between database history rows and {@link StatusHistory}
 * objects.
 *
 * @remarks
 * Provides consistent, type-safe transformation between raw database rows and
 * domain history objects, including validation, conversion, and error logging.
 *
 * @public
 *
 * @see {@link StatusHistory}
 */

import type { StatusHistory } from "@shared/types";
import type { HistoryRow as DatabaseHistoryRow } from "@shared/types/database";

import { RowValidationUtils } from "@shared/types/database";
import { ensureError } from "@shared/utils/errorHandling";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { isNonNegativeSafeInteger } from "@shared/utils/typeGuards";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { isDefined, isFinite as isFiniteNumber } from "ts-extras";

import { logger } from "../../../../utils/logger";
import { safeNumberConvert } from "../converters/valueConverters";

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
 * Safely converts a value to a number, returning a fallback if conversion
 * fails.
 *
 * @remarks
 * Used internally to ensure numeric fields are valid numbers.
 *
 * @defaultValue 0
 *
 * @param value - The value to convert to a number.
 * @param fallback - The fallback value to use if conversion fails.
 *
 * @returns The converted number, or the fallback value if conversion fails.
 *
 * @internal
 */
function parseFiniteNumber(value: unknown): number | undefined {
    if (typeof value === "number" && isFiniteNumber(value)) return value;
    return safeNumberConvert(value);
}

function safeNumber(value: unknown, fallback = 0): number {
    return parseFiniteNumber(value) ?? fallback;
}

function safeEpochMs(value: unknown, fallback = Date.now()): number {
    if (!RowValidationUtils.isValidTimestamp(value)) {
        return fallback;
    }

    const parsed = parseFiniteNumber(value);
    if (isNonNegativeSafeInteger(parsed) && parsed <= MAX_VALID_DATE_EPOCH_MS) {
        return parsed;
    }
    return fallback;
}

/**
 * Validates and converts a status value to a valid {@link StatusHistory.status}
 * value.
 *
 * @remarks
 * If the value is not "up", "degraded", or "down", logs a warning and returns
 * "down".
 *
 * @param status - The status value to validate.
 *
 * @returns The validated status value ("up", "degraded", or "down").
 *
 * @internal
 */
function validateStatus(status: unknown): StatusHistory["status"] {
    if (status === "up" || status === "degraded" || status === "down")
        return status;
    logger.warn(LOG_TEMPLATES.warnings.HISTORY_INVALID_STATUS, { status });
    return "down";
}

/**
 * Converts a single database row to a {@link StatusHistory} object.
 *
 * @remarks
 * Performs safe number conversion and status validation. If a value is invalid,
 * it defaults to a safe fallback and logs a warning or error.
 *
 * @example
 *
 * ```typescript
 * const entry = rowToHistoryEntry(dbRow);
 * ```
 *
 * @param row - The raw database row to convert.
 *
 * @returns The mapped {@link StatusHistory} object.
 *
 * @throws Error If mapping fails due to unexpected data types or missing
 *   fields.
 *
 * @public
 */
export function rowToHistoryEntry(row: DatabaseHistoryRow): StatusHistory {
    try {
        return {
            ...(isDefined(row.details) && {
                details:
                    typeof row.details === "string"
                        ? row.details
                        : JSON.stringify(row.details),
            }),
            responseTime: safeNumber(row.responseTime, 0),
            status: validateStatus(row.status),
            timestamp: safeEpochMs(row.timestamp),
        };
    } catch (error: unknown) {
        const normalizedError = ensureError(error);
        logger.error(
            LOG_TEMPLATES.errors.HISTORY_MAPPER_FAILED,
            normalizedError,
            {
                responseTime: row.responseTime,
                row,
                status: row.status,
                timestamp: row.timestamp,
            }
        );
        throw error;
    }
}
