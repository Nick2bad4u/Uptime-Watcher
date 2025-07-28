/**
 * Utilities for mapping monitor data between database rows and application objects.
 *
 * @remarks
 * Provides conversion between raw database rows (snake_case) and application monitor objects (camelCase).
 * Integrates with the dynamic monitor type schema system for extensibility.
 * All mapping functions are type-safe and log errors with full context.
 */

import { Site } from "../../../types";
import { logger } from "../../../utils/logger";
import { generateSqlParameters, mapMonitorToRow, mapRowToMonitor } from "./dynamicSchema";
import { DbValue } from "./valueConverters";

/**
 * Represents a monitor row as stored in the database.
 *
 * @remarks
 * Used for low-level database operations and mapping.
 * Field names use camelCase for consistency with TypeScript conventions.
 *
 * @public
 */
export interface MonitorRow {
    /** The interval (in ms) between checks. */
    checkInterval: number;
    /** The creation timestamp (ms since epoch). */
    createdAt: number;
    /** Whether the monitor is enabled for checking. */
    enabled: boolean;
    /** Unique identifier for the monitor. */
    id: string;
    /** The last time this monitor was checked, if available. */
    lastChecked?: Date;
    /** The last error message, if any. */
    lastError?: string;
    /** The last recorded response time in ms, if available. */
    responseTime?: number;
    /** Number of retry attempts for failed checks. */
    retryAttempts: number;
    /** The identifier of the site this monitor belongs to. */
    siteIdentifier: string;
    /** The current status of the monitor ("up" or "down"). */
    status: Site["monitors"][0]["status"];
    /** The timeout (in ms) for checks. */
    timeout: number;
    /** The monitor type (e.g., "http"). */
    type: Site["monitors"][0]["type"];
    /** The last updated timestamp (ms since epoch). */
    updatedAt: number;
}

/**
 * Builds a parameter array for inserting or updating a monitor in the database.
 *
 * @remarks
 * Converts a monitor object to a row format using the dynamic schema system, then
 * returns an array of values in the order expected by the SQL statement.
 * All values are type-safe and nulls are used for missing/undefined fields.
 *
 * @param siteIdentifier - The unique identifier of the site this monitor belongs to.
 * @param monitor - The monitor object to convert.
 * @returns An array of values for SQL parameterized queries.
 * @throws Error if mapping or parameter generation fails.
 *
 * @example
 * ```typescript
 * const params = buildMonitorParameters("site-123", monitorObj);
 * db.run("INSERT INTO monitors (...) VALUES (?, ?, ...)", params);
 * ```
 *
 * @see {@link mapMonitorToRow}
 * @see {@link generateSqlParameters}
 * @public
 */
export function buildMonitorParameters(siteIdentifier: string, monitor: Site["monitors"][0]): DbValue[] {
    try {
        // Convert monitor to row format
        const monitorWithMetadata = {
            ...monitor,
            createdAt: Date.now(),
            enabled: monitor.monitoring,
            siteIdentifier,
            updatedAt: Date.now(),
        };

        const row = mapMonitorToRow(monitorWithMetadata);
        const { columns } = generateSqlParameters();

        // Return values in the same order as columns
        // eslint-disable-next-line sonarjs/function-return-type -- Returns DbValue which can be different types
        return columns.map((column): DbValue => {
            // eslint-disable-next-line security/detect-object-injection
            const value = row[column];
            if (value === undefined || value === null) {
                return null;
            }
            return value as DbValue;
        });
    } catch (error) {
        logger.error("[MonitorMapper] Failed to build monitor parameters", { error, monitor, siteIdentifier });
        throw error;
    }
}

/**
 * Validates that a database row contains the minimum required fields for a monitor.
 *
 * @remarks
 * Checks for the presence and type of critical fields in a raw database row.
 * Expects snake_case keys as returned by SQLite.
 *
 * @param row - The raw database row to validate.
 * @returns `true` if the row is valid for monitor mapping, otherwise `false`.
 *
 * @example
 * ```typescript
 * if (isValidMonitorRow(row)) { ... }
 * ```
 * @public
 */
export function isValidMonitorRow(row: Record<string, unknown>): boolean {
    return (
        row["id"] !== undefined &&
        row["site_identifier"] !== undefined &&
        row["type"] !== undefined &&
        (typeof row["id"] === "string" || typeof row["id"] === "number") &&
        typeof row["site_identifier"] === "string" &&
        typeof row["type"] === "string"
    );
}

/**
 * Converts an array of database rows to an array of monitor objects.
 *
 * @remarks
 * Each row is mapped using {@link rowToMonitor}. History is not loaded here.
 *
 * @param rows - Array of raw database rows.
 * @returns Array of mapped monitor objects.
 *
 * @example
 * ```typescript
 * const monitors = rowsToMonitors(dbRows);
 * ```
 * @see {@link rowToMonitor}
 * @public
 */
export function rowsToMonitors(rows: Record<string, unknown>[]): Site["monitors"] {
    return rows.map((row) => rowToMonitor(row));
}

/**
 * Converts a single database row to a monitor object using the dynamic schema system.
 *
 * @remarks
 * - Maps snake_case DB fields to camelCase.
 * - Handles monitor type-specific fields via {@link mapRowToMonitor}.
 * - Applies default values for missing/invalid fields.
 * - Does not load history (history is loaded separately).
 * - Logs and re-throws errors for full traceability.
 *
 * @param row - The raw database row to convert.
 * @returns The mapped monitor object.
 * @throws Error if mapping fails or required fields are invalid.
 *
 * @example
 * ```typescript
 * const monitor = rowToMonitor(dbRow);
 * ```
 * @see {@link mapRowToMonitor}
 * @public
 */
export function rowToMonitor(row: Record<string, unknown>): Site["monitors"][0] {
    try {
        const dynamicMonitor = mapRowToMonitor(row);

        // Convert to Site monitor format with defaults
        const monitor: Site["monitors"][0] = {
            checkInterval: Number(dynamicMonitor["checkInterval"]) || 300_000,
            history: [], // History will be loaded separately
            id:
                dynamicMonitor["id"] &&
                (typeof dynamicMonitor["id"] === "string" || typeof dynamicMonitor["id"] === "number")
                    ? String(dynamicMonitor["id"])
                    : "-1",
            monitoring: Boolean(dynamicMonitor["enabled"]),
            responseTime:
                Number(dynamicMonitor["responseTime"]) || (row["responseTime"] ? Number(row["responseTime"]) : -1),
            retryAttempts: Number(dynamicMonitor["retryAttempts"]) || 3,
            status: dynamicMonitor["status"] ? (dynamicMonitor["status"] as Site["monitors"][0]["status"]) : "down",
            timeout: Number(dynamicMonitor["timeout"]) || 5000,
            type: dynamicMonitor["type"] ? (dynamicMonitor["type"] as Site["monitors"][0]["type"]) : "http",
        };

        // Add lastChecked if available
        if (dynamicMonitor["lastChecked"]) {
            monitor.lastChecked = new Date(Number(dynamicMonitor["lastChecked"]));
        }

        // Copy all dynamic fields (monitor type specific fields)
        for (const [key, value] of Object.entries(dynamicMonitor)) {
            if (
                ![
                    "checkInterval",
                    "createdAt",
                    "enabled",
                    "id",
                    "lastChecked",
                    "lastError",
                    "name",
                    "nextCheck",
                    "responseTime",
                    "retryAttempts",
                    "siteIdentifier",
                    "status",
                    "timeout",
                    "type",
                    "updatedAt",
                ].includes(key)
            ) {
                // eslint-disable-next-line security/detect-object-injection
                (monitor as unknown as Record<string, unknown>)[key] = value;
            }
        }

        return monitor;
    } catch (error) {
        logger.error("[MonitorMapper] Failed to map database row to monitor", { error, row });
        throw error;
    }
}

/**
 * Converts a database row to a monitor object, or returns `undefined` if the row is missing.
 *
 * @remarks
 * - Returns `undefined` if the input row is `undefined` or `null`.
 * - Otherwise, delegates to {@link rowToMonitor}.
 * - Used by repository methods where a missing monitor is not an error.
 *
 * @param row - The raw database row or `undefined`.
 * @returns The mapped monitor object, or `undefined` if the row is missing.
 * @throws Error if mapping fails for a valid row.
 *
 * @example
 * ```typescript
 * const monitor = rowToMonitorOrUndefined(dbRowOrUndefined);
 * ```
 * @see {@link rowToMonitor}
 * @public
 */
export function rowToMonitorOrUndefined(row: Record<string, unknown> | undefined): Site["monitors"][0] | undefined {
    if (!row) {
        return undefined;
    }

    return rowToMonitor(row);
}
