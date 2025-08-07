/**
 * Utilities for mapping monitor data between database rows and application objects.
 *
 * @remarks
 * Provides conversion between raw database rows (snake_case) and application monitor objects (camelCase).
 * Integrates with the dynamic monitor type schema system for extensibility.
 * All mapping functions are type-safe and log errors with full context.
 */

import type { MonitorRow as DatabaseMonitorRow } from "../../../../shared/types/database";
import type { Monitor, Site } from "../../../types";

import { LOG_TEMPLATES } from "../../../../shared/utils/logTemplates";
import {
    isValidIdentifierArray,
    safeInteger,
} from "../../../../shared/validation/validatorUtils";
import { logger } from "../../../utils/logger";
import {
    generateSqlParameters,
    mapMonitorToRow,
    mapRowToMonitor,
} from "./dynamicSchema";
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
export function buildMonitorParameters(
    siteIdentifier: string,
    monitor: Site["monitors"][0]
): DbValue[] {
    try {
        // Convert monitor to row format
        const monitorWithMetadata = {
            ...monitor,
            createdAt: Date.now(),
            enabled: monitor.monitoring,
            siteIdentifier,
            updatedAt: Date.now(),
        };

        const row = mapMonitorToRow(monitorWithMetadata as Monitor);
        const { columns } = generateSqlParameters();

        // Return values in the same order as columns
        // eslint-disable-next-line sonarjs/function-return-type -- Returns DbValue which can be different types
        return columns.map((column): DbValue => {
            const value = (row as unknown as Record<string, unknown>)[column];
            if (value === undefined || value === null) {
                return null;
            }
            return value as DbValue;
        });
    } catch (error) {
        logger.error(LOG_TEMPLATES.errors.MONITOR_MAPPER_FAILED, {
            error,
            monitor,
            siteIdentifier,
        });
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
export function rowsToMonitors(rows: DatabaseMonitorRow[]): Site["monitors"] {
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
export function rowToMonitor(row: DatabaseMonitorRow): Site["monitors"][0] {
    try {
        const dynamicMonitor = mapRowToMonitor(row);
        const monitor = createBaseMonitor(dynamicMonitor);

        // Parse activeOperations with security validation
        monitor.activeOperations = parseActiveOperations(row);

        // Add lastChecked if available
        if (dynamicMonitor.lastChecked) {
            monitor.lastChecked = dynamicMonitor.lastChecked;
        }

        // Copy all dynamic fields (monitor type specific fields)
        copyDynamicFields(monitor, dynamicMonitor);

        return monitor;
    } catch (error) {
        logger.error(LOG_TEMPLATES.errors.MONITOR_MAPPER_FAILED, {
            error,
            row,
        });
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
export function rowToMonitorOrUndefined(
    row: DatabaseMonitorRow | undefined
): Site["monitors"][0] | undefined {
    if (!row) {
        return undefined;
    }

    return rowToMonitor(row);
}

/**
 * Copies dynamic fields to monitor object.
 *
 * @param monitor - Base monitor object
 * @param dynamicMonitor - Dynamic monitor data
 */
function copyDynamicFields(
    monitor: Site["monitors"][0],
    dynamicMonitor: Monitor
): void {
    const excludedFields = new Set([
        "checkInterval",
        "createdAt",
        "enabled",
        "history",
        "id",
        "lastChecked",
        "lastError",
        "monitoring",
        "name",
        "nextCheck",
        "responseTime",
        "retryAttempts",
        "siteIdentifier",
        "status",
        "timeout",
        "type",
        "updatedAt",
    ]);

    // Copy monitor-type specific fields
    for (const [key, value] of Object.entries(dynamicMonitor)) {
        if (!excludedFields.has(key)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment -- Dynamic field assignment required for monitor type system. Key is validated from dynamicMonitor which comes from typed database mapping.
            (monitor as any)[key] = value;
        }
    }
}

/**
 * Creates base monitor object from dynamic monitor data using safe validation.
 *
 * @remarks
 * Uses centralized validation utilities for safe integer conversion with bounds checking.
 * Replaces manual Number() conversions with validator-based safeInteger() function
 * to prevent invalid data from reaching the application layer.
 *
 * @param dynamicMonitor - Mapped monitor data from database
 * @returns Base monitor object with validated fields
 *
 * @see {@link safeInteger} - Safe integer conversion utility
 */
function createBaseMonitor(dynamicMonitor: Monitor): Site["monitors"][0] {
    return {
        activeOperations: dynamicMonitor.activeOperations ?? [],
        checkInterval: safeInteger(dynamicMonitor.checkInterval, 300_000, 5000),
        history: [], // History will be loaded separately
        id: String(dynamicMonitor.id || "-1"),
        monitoring: dynamicMonitor.monitoring,
        responseTime: safeInteger(dynamicMonitor.responseTime, -1, -1),
        retryAttempts: safeInteger(dynamicMonitor.retryAttempts, 3, 0, 10),
        status: dynamicMonitor.status,
        timeout: safeInteger(dynamicMonitor.timeout, 5000, 1000, 300_000),
        type: dynamicMonitor.type,
        // Include optional fields if present
        ...(dynamicMonitor.host && { host: dynamicMonitor.host }),
        ...(dynamicMonitor.port && { port: dynamicMonitor.port }),
        ...(dynamicMonitor.url && { url: dynamicMonitor.url }),
    };
}

/**
 * Safely parses activeOperations from database row using validator package for security.
 *
 * @remarks
 * Uses the centralized validator utilities to ensure consistent validation
 * across the application. Replaces manual regex validation with well-tested
 * validator.js functions for improved security and reliability.
 *
 * @param row - Database row
 * @returns Array of validated operation IDs
 *
 * @see {@link isValidIdentifierArray} - Validation function used
 */
function parseActiveOperations(row: DatabaseMonitorRow): string[] {
    if (!row.active_operations || typeof row.active_operations !== "string") {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(String(row.active_operations));

        if (isValidIdentifierArray(parsed)) {
            return parsed;
        } else {
            logger.warn(
                LOG_TEMPLATES.warnings.MONITOR_ACTIVE_OPERATIONS_INVALID,
                { parsed }
            );
            return [];
        }
    } catch (error) {
        logger.warn(
            LOG_TEMPLATES.warnings.MONITOR_ACTIVE_OPERATIONS_PARSE_FAILED,
            error
        );
        return [];
    }
}
