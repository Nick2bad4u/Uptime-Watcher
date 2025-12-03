/**
 * Utilities for mapping monitor data between database rows and application
 * objects.
 *
 * @remarks
 * Provides conversion between raw database rows (snake_case) and application
 * monitor objects (camelCase). Integrates with the dynamic monitor type schema
 * system for extensibility. All mapping functions are type-safe and log errors
 * with full context.
 */

import type { Monitor, Site } from "@shared/types";
import type { MonitorRow as DatabaseMonitorRow } from "@shared/types/database";
import type { UnknownRecord } from "type-fest";

import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import {
    isValidIdentifierArray,
    safeInteger,
} from "@shared/validation/validatorUtils";

import type { DbValue } from "./valueConverters";

import { logger } from "../../../utils/logger";
import {
    generateSqlParameters,
    mapMonitorToRow,
    mapRowToMonitor,
} from "./dynamicSchema";

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
            // Dynamic field assignment for monitor type system
            // Key is validated from dynamicMonitor which comes from typed database mapping
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Required for dynamic monitor field assignment system
            (monitor as unknown as Record<string, unknown>)[key] = value;
        }
    }
}

/**
 * Sanitizes the bodyKeyword field value for safe mapping.
 *
 * @param value - The value to sanitize.
 *
 * @returns The sanitized bodyKeyword value, or undefined if invalid.
 */
function getSanitizedBodyKeyword(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

/**
 * Sanitizes the expectedStatusCode field value for safe mapping.
 *
 * @param value - The value to sanitize.
 *
 * @returns The sanitized expectedStatusCode value, or undefined if invalid.
 */
function getSanitizedExpectedStatusCode(value: unknown): number | undefined {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return undefined;
    }

    return safeInteger(value, value, 100, 599);
}

/**
 * Creates base monitor object from dynamic monitor data using safe validation.
 *
 * @remarks
 * Uses centralized validation utilities for safe integer conversion with bounds
 * checking. Replaces manual Number() conversions with validator-based
 * safeInteger() function to prevent invalid data from reaching the application
 * layer.
 *
 * @param dynamicMonitor - Mapped monitor data from database
 *
 * @returns Base monitor object with validated fields
 *
 * @see {@link safeInteger} - Safe integer conversion utility
 */
function createBaseMonitor(dynamicMonitor: Monitor): Site["monitors"][0] {
    const bodyKeyword = getSanitizedBodyKeyword(dynamicMonitor.bodyKeyword);
    const expectedStatusCode = getSanitizedExpectedStatusCode(
        dynamicMonitor.expectedStatusCode
    );

    return {
        activeOperations: dynamicMonitor.activeOperations ?? [],
        checkInterval: safeInteger(dynamicMonitor.checkInterval, 300_000, 5000),
        history: [], // History will be loaded separately
        id: dynamicMonitor.id || "-1",
        monitoring: dynamicMonitor.monitoring,
        responseTime: safeInteger(dynamicMonitor.responseTime, -1, -1),
        retryAttempts: safeInteger(dynamicMonitor.retryAttempts, 3, 0, 10),
        status: dynamicMonitor.status,
        timeout: safeInteger(dynamicMonitor.timeout, 5000, 1000, 300_000),
        type: dynamicMonitor.type,
        // Include optional fields if present
        ...(bodyKeyword !== undefined && { bodyKeyword }),
        ...(expectedStatusCode !== undefined && { expectedStatusCode }),
        ...(dynamicMonitor.host && { host: dynamicMonitor.host }),
        ...(dynamicMonitor.port && { port: dynamicMonitor.port }),
        ...(dynamicMonitor.url && { url: dynamicMonitor.url }),
    };
}

/**
 * Safely parses activeOperations from database row using validator package for
 * security.
 *
 * @remarks
 * Uses the centralized validator utilities to ensure consistent validation
 * across the application. Replaces manual regex validation with well-tested
 * validator.js functions for improved security and reliability.
 *
 * @param row - Database row
 *
 * @returns Array of validated operation IDs
 *
 * @see {@link isValidIdentifierArray} - Validation function used
 */
function parseActiveOperations(row: DatabaseMonitorRow): string[] {
    if (!row.active_operations || typeof row.active_operations !== "string") {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(row.active_operations);

        if (isValidIdentifierArray(parsed)) {
            return parsed;
        }
        logger.warn(LOG_TEMPLATES.warnings.MONITOR_ACTIVE_OPERATIONS_INVALID, {
            parsed,
        });
        return [];
    } catch (error) {
        logger.warn(
            LOG_TEMPLATES.warnings.MONITOR_ACTIVE_OPERATIONS_PARSE_FAILED,
            error
        );
        return [];
    }
}

/**
 * Represents a monitor row as stored in the database.
 *
 * @remarks
 * Used for low-level database operations and mapping. Field names use camelCase
 * for consistency with TypeScript conventions.
 *
 * @public
 */
/**
 * Builds a parameter array for inserting or updating a monitor in the database.
 *
 * @remarks
 * Converts a monitor object to a row format using the dynamic schema system,
 * then returns an array of values in the order expected by the SQL statement.
 * All values are type-safe and nulls are used for missing/undefined fields.
 *
 * @example
 *
 * ```typescript
 * const params = buildMonitorParameters("site-123", monitorObj);
 * db.run("INSERT INTO monitors (...) VALUES (?, ?, ...)", params);
 * ```
 *
 * @param siteIdentifier - The unique identifier of the site this monitor
 *   belongs to.
 * @param monitor - The monitor object to convert.
 *
 * @returns An array of values for SQL parameterized queries.
 *
 * @throws Error if mapping or parameter generation fails.
 *
 * @public
 *
 * @see {@link mapMonitorToRow}
 * @see {@link generateSqlParameters}
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
        /* eslint-disable @typescript-eslint/no-unsafe-type-assertion, sonarjs/function-return-type -- Safe internal type conversions for database mapping. Row structure guaranteed by dynamic schema system. */
        return columns.map((column): DbValue => {
            const value = (row as unknown as UnknownRecord)[column];
            if (value === undefined || value === null) {
                return null;
            }
            return value as DbValue;
        });
        /* eslint-enable @typescript-eslint/no-unsafe-type-assertion, sonarjs/function-return-type -- Re-enable rules after database value mapping with appropriate type conversion */
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
 * Validates that a database row contains the minimum required fields for a
 * monitor.
 *
 * @remarks
 * Checks for the presence and type of critical fields in a raw database row.
 * Expects snake_case keys as returned by SQLite.
 *
 * @example
 *
 * ```typescript
 * if (isValidMonitorRow(row)) { ... }
 * ```
 *
 * @param row - The raw database row to validate.
 *
 * @returns `true` if the row is valid for monitor mapping, otherwise `false`.
 *
 * @public
 */
export function isValidMonitorRow(row: UnknownRecord): boolean {
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
 * Converts a single database row to a monitor object using the dynamic schema
 * system.
 *
 * @remarks
 * - Handles monitor type-specific fields via {@link mapRowToMonitor}.
 * - Adds security validation for activeOperations JSON.
 * - Performs safe type conversions with fallbacks.
 *
 * @example
 *
 * ```typescript
 * const monitor = rowToMonitor(dbRow);
 * ```
 *
 * @param row - The raw database row to convert.
 *
 * @returns The mapped monitor object.
 *
 * @throws Error if mapping fails or required fields are invalid.
 *
 * @public
 *
 * @see {@link mapRowToMonitor}
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
 * Converts an array of database rows to an array of monitor objects.
 *
 * @remarks
 * Each row is mapped using {@link rowToMonitor}. History is not loaded here.
 *
 * @example
 *
 * ```typescript
 * const monitors = rowsToMonitors(dbRows);
 * ```
 *
 * @param rows - Array of raw database rows.
 *
 * @returns Array of mapped monitor objects.
 *
 * @public
 *
 * @see {@link rowToMonitor}
 */
export function rowsToMonitors(rows: DatabaseMonitorRow[]): Site["monitors"] {
    return rows.map((row) => rowToMonitor(row));
}

/**
 * Converts a single database row to a monitor object using the dynamic schema
 * system.
 *
 * @remarks
 * - Maps snake_case DB fields to camelCase.
 * - Handles monitor type-specific fields via {@link mapRowToMonitor}.
 * - Applies default values for missing/invalid fields.
 * - Does not load history (history is loaded separately).
 * - Logs and re-throws errors for full traceability.
 */

/**
 * Converts a database row to a monitor object, or returns `undefined` if the
 * row is missing.
 *
 * @remarks
 * - Returns `undefined` if the input row is `undefined` or `null`.
 * - Otherwise, delegates to {@link rowToMonitor}.
 * - Used by repository methods where a missing monitor is not an error.
 *
 * @example
 *
 * ```typescript
 * const monitor = rowToMonitorOrUndefined(dbRowOrUndefined);
 * ```
 *
 * @param row - The raw database row or `undefined`.
 *
 * @returns The mapped monitor object, or `undefined` if the row is missing.
 *
 * @throws Error if mapping fails for a valid row.
 *
 * @public
 *
 * @see {@link rowToMonitor}
 */
export function rowToMonitorOrUndefined(
    row: DatabaseMonitorRow | null | undefined
): Site["monitors"][0] | undefined {
    if (!row) {
        return undefined;
    }

    return rowToMonitor(row);
}
