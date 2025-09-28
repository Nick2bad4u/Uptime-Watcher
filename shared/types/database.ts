/**
 * Type definitions for database row objects returned from SQLite queries.
 *
 * @remarks
 * These interfaces and utilities provide type-safe access to database rows,
 * ensuring consistent structure and type checking for all database operations.
 */

import type { UnknownRecord } from "type-fest";

/**
 * Base interface for all database row types.
 *
 * @remarks
 * Provides a common optional `id` property for tables that use numeric or
 * string IDs.
 */
export interface BaseRow {
    /**
     * Unique identifier for the row.
     *
     * @remarks
     * May be a number (autoincrement) or string (custom).
     */
    id?: number | string;
}

/**
 * Represents a row in the `history` table.
 *
 * @remarks
 * Used for storing monitor status change history and related metadata.
 */
export interface HistoryRow extends BaseRow {
    /**
     * Additional details about the history entry.
     */
    details?: string;
    /**
     * The identifier of the monitor associated with this history entry.
     */
    monitorId?: string;
    /**
     * The response time recorded for this entry, in milliseconds.
     */
    responseTime?: number;
    /**
     * The status of the monitor at this point in history ("up" or "down").
     */
    status?: string;
    /**
     * The timestamp (epoch milliseconds) when this entry was recorded.
     */
    timestamp?: number;
}

/**
 * Represents a row in the `monitor` table.
 *
 * @remarks
 * Stores configuration and runtime state for each monitor.
 */
export interface MonitorRow extends BaseRow {
    /**
     * JSON string containing an array of active operation identifiers.
     */
    active_operations?: string;
    /**
     * Keyword required to be present in HTTP responses.
     */
    body_keyword?: string;
    /**
     * Interval between checks, in seconds.
     */
    check_interval?: number;
    /**
     * Timestamp (epoch ms) when the monitor was created.
     */
    created_at?: number;
    /**
     * Whether the monitor is enabled (1) or disabled (0).
     */
    enabled?: number;
    /**
     * Expected HTTP status code for status monitors.
     */
    expected_status_code?: number;
    /**
     * Hostname or IP address being monitored.
     */
    host?: string;
    /**
     * Unique monitor ID (autoincrement).
     */
    id?: number;
    /**
     * Timestamp (epoch ms) of the last check.
     */
    last_checked?: number;
    /**
     * Last error message encountered by the monitor.
     */
    last_error?: string;
    /**
     * Whether monitoring is active (1) or inactive (0).
     */
    monitoring?: number;
    /**
     * Timestamp (epoch ms) for the next scheduled check.
     */
    next_check?: number;
    /**
     * Port number being monitored (if applicable).
     */
    port?: number;
    /**
     * Last recorded response time, in milliseconds.
     */
    response_time?: number;
    /**
     * Number of retry attempts for failed checks.
     */
    retry_attempts?: number;
    /**
     * Identifier of the site this monitor belongs to.
     */
    site_identifier?: string;
    /**
     * Current status of the monitor ("up", "down", etc.).
     */
    status?: string;
    /**
     * Timeout for checks, in milliseconds.
     */
    timeout?: number;
    /**
     * Monitor type (e.g., "http", "tcp").
     */
    type?: string;
    /**
     * Timestamp (epoch ms) when the monitor was last updated.
     */
    updated_at?: number;
    /**
     * URL being monitored (for HTTP/HTTPS monitors).
     */
    url?: string;
}

/**
 * Represents a row in the `settings` table.
 *
 * @remarks
 * Used for storing application-wide key-value settings.
 */
export interface SettingsRow extends BaseRow {
    /**
     * The unique key for the setting.
     */
    key?: string;
    /**
     * The value associated with the key.
     */
    value?: string;
}

/**
 * Represents a row in the `site` table.
 *
 * @remarks
 * Stores metadata and monitoring state for each site.
 */
export interface SiteRow extends BaseRow {
    /**
     * Unique identifier for the site.
     */
    identifier?: string;
    /**
     * Whether monitoring is enabled for this site (1) or not (0).
     */
    monitoring?: number;
    /**
     * Human-readable name for the site.
     */
    name?: string;
}

/**
 * Validation utilities for database row type checking. Provides atomic
 * validation functions that can be composed for complex validation.
 */
export const RowValidationUtils = {
    /**
     * Validates that a value is a non-null object.
     */
    isValidObject: (obj: unknown): obj is UnknownRecord =>
        typeof obj === "object" && obj !== null && !Array.isArray(obj),

    /**
     * Validates monitor status value.
     */
    isValidStatus: (value: unknown): value is "down" | "up" =>
        value === "up" || value === "down",

    /**
     * Validates timestamp as numeric value.
     */
    isValidTimestamp: (value: unknown): boolean => {
        if (typeof value === "number") {
            return !Number.isNaN(value);
        }
        if (typeof value === "string") {
            const numValue = Number(value);
            return !Number.isNaN(numValue);
        }
        return false;
    },
} as const;

/**
 * Determines if an object conforms to the {@link HistoryRow} interface.
 *
 * @remarks
 * Checks for required properties and value types to ensure type safety.
 *
 * @param obj - The object to check.
 *
 * @returns True if the object matches the {@link HistoryRow} structure;
 *   otherwise, false.
 */
export function isValidHistoryRow(obj: unknown): obj is HistoryRow {
    // Basic object validation
    if (!RowValidationUtils.isValidObject(obj)) {
        return false;
    }

    // Explicit property and type checking
    return (
        "monitorId" in obj &&
        "status" in obj &&
        "timestamp" in obj &&
        obj["monitorId"] !== undefined &&
        obj["status"] !== undefined &&
        obj["timestamp"] !== undefined &&
        typeof obj["monitorId"] === "string" &&
        RowValidationUtils.isValidStatus(obj["status"]) &&
        RowValidationUtils.isValidTimestamp(obj["timestamp"])
    );
}

/**
 * Determines if an object conforms to the {@link MonitorRow} interface.
 *
 * @remarks
 * Checks for required properties and value types to ensure type safety.
 *
 * @param obj - The object to check.
 *
 * @returns True if the object matches the {@link MonitorRow} structure;
 *   otherwise, false.
 */
export function isValidMonitorRow(obj: unknown): obj is MonitorRow {
    // Basic object validation
    if (!RowValidationUtils.isValidObject(obj)) {
        return false;
    }

    // Explicit property and type checking
    return (
        "id" in obj &&
        "site_identifier" in obj &&
        "type" in obj &&
        obj["id"] !== undefined &&
        obj["site_identifier"] !== undefined &&
        obj["type"] !== undefined &&
        (typeof obj["id"] === "string" || typeof obj["id"] === "number") &&
        typeof obj["site_identifier"] === "string" &&
        typeof obj["type"] === "string"
    );
}

/**
 * Determines if an object conforms to the {@link SettingsRow} interface.
 *
 * @remarks
 * Checks for required properties and value types to ensure type safety.
 *
 * @param obj - The object to check.
 *
 * @returns True if the object matches the {@link SettingsRow} structure;
 *   otherwise, false.
 */
export function isValidSettingsRow(obj: unknown): obj is SettingsRow {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    // Type guard: ensure obj is a record before casting
    if (!RowValidationUtils.isValidObject(obj)) {
        return false;
    }

    const row = obj;
    return (
        "key" in row &&
        row["key"] !== undefined &&
        row["key"] !== null &&
        typeof row["key"] === "string" &&
        row["key"].length > 0
    );
}

/**
 * Determines if an object conforms to the {@link SiteRow} interface.
 *
 * @remarks
 * Checks for required properties and value types to ensure type safety.
 *
 * @param obj - The object to check.
 *
 * @returns True if the object matches the {@link SiteRow} structure; otherwise,
 *   false.
 */
export function isValidSiteRow(obj: unknown): obj is SiteRow {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    // Type guard: ensure obj is a record before casting
    if (!RowValidationUtils.isValidObject(obj)) {
        return false;
    }

    const row = obj;
    return (
        "identifier" in row &&
        row["identifier"] !== undefined &&
        row["identifier"] !== null &&
        typeof row["identifier"] === "string" &&
        row["identifier"].trim().length > 0
    );
}

/**
 * Safely retrieves a property value from a database row object.
 *
 * @remarks
 * Returns the value of the specified property if it exists and is not
 * undefined; otherwise, returns the provided default value.
 *
 * @example
 *
 * ```typescript
 * const name = safeGetRowProperty(row, "name", "Unknown");
 * ```
 *
 * @typeParam T - The expected type of the property value.
 *
 * @param row - The database row object.
 * @param property - The property name to access.
 * @param defaultValue - The value to return if the property is missing or
 *   undefined.
 *
 * @returns The property value if present; otherwise, the default value.
 */
export function safeGetRowProperty<T>(
    row: UnknownRecord,
    property: string,
    defaultValue: T
): T {
    // Handle null/undefined row objects - this check is needed despite the type
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Runtime safety check for database row objects that may be null/undefined despite types
    if (!row || typeof row !== "object") {
        return defaultValue;
    }

    // First check for exact property name match (including properties with dots)
    if (property in row && row[property] !== undefined) {
        // We can't safely assert the type here, so we need to trust the caller
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type assertion required for dynamic property access on generic database row objects
        return row[property] as T;
    }

    // Handle nested property access with dot notation
    if (property.includes(".")) {
        const parts = property.split(".");
        // Use unknown instead of any for type safety
        let current: unknown = row;

        for (const part of parts) {
            if (
                current &&
                typeof current === "object" &&
                part in current &&
                RowValidationUtils.isValidObject(current) &&
                current[part] !== undefined
            ) {
                current = current[part];
            } else {
                return defaultValue;
            }
        }

        // We can't safely assert the type here, so we need to trust the caller
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type assertion required for nested property access on dynamic database row objects
        return current as T;
    }

    return defaultValue;
}
