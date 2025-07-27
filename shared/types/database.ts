/**
 * Database row type definitions.
 * Provides type-safe interfaces for database query results.
 *
 * @remarks
 * These interfaces define the expected structure of database rows returned
 * from SQLite queries. They help avoid index signature access issues while
 * maintaining type safety for database operations.
 *
 * @packageDocumentation
 */

/**
 * Base interface for database rows with common properties.
 */
export interface BaseRow {
    id?: number | string;
}

/**
 * Database row structure for history table.
 */
export interface HistoryRow extends BaseRow {
    details?: string;
    monitorId?: string;
    responseTime?: number;
    status?: string;
    timestamp?: number;
}

/**
 * Database row structure for monitor table.
 */
export interface MonitorRow extends BaseRow {
    check_interval?: number;
    created_at?: number;
    enabled?: number; // SQLite boolean (0/1)
    host?: string;
    id?: number;
    last_checked?: number;
    last_error?: string;
    monitoring?: number; // SQLite boolean (0/1)
    next_check?: number;
    port?: number;
    response_time?: number;
    retry_attempts?: number;
    site_identifier?: string;
    status?: string;
    timeout?: number;
    type?: string;
    updated_at?: number;
    url?: string;
}

/**
 * Database row structure for settings table.
 */
export interface SettingsRow extends BaseRow {
    key?: string;
    value?: string;
}

/**
 * Database row structure for site table.
 */
export interface SiteRow extends BaseRow {
    identifier?: string;
    monitoring?: number; // SQLite boolean (0/1)
    name?: string;
}

/**
 * Type guard to check if an object is a valid history row.
 *
 * @param obj - Object to check
 * @returns True if object matches HistoryRow interface
 */
export function isValidHistoryRow(obj: unknown): obj is HistoryRow {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    const row = obj as Record<string, unknown>;
    return (
        "monitorId" in row &&
        "status" in row &&
        "timestamp" in row &&
        row["monitorId"] !== undefined &&
        row["status"] !== undefined &&
        row["timestamp"] !== undefined &&
        typeof row["monitorId"] === "string" &&
        (row["status"] === "up" || row["status"] === "down") &&
        !Number.isNaN(Number(row["timestamp"]))
    );
}

/**
 * Type guard to check if an object is a valid monitor row.
 *
 * @param obj - Object to check
 * @returns True if object matches MonitorRow interface
 */
export function isValidMonitorRow(obj: unknown): obj is MonitorRow {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    const row = obj as Record<string, unknown>;
    return (
        "id" in row &&
        (typeof row["id"] === "string" || typeof row["id"] === "number") &&
        "site_identifier" in row &&
        typeof row["site_identifier"] === "string" &&
        "type" in row &&
        typeof row["type"] === "string"
    );
}

/**
 * Type guard to check if an object is a valid settings row.
 *
 * @param obj - Object to check
 * @returns True if object matches SettingsRow interface
 */
export function isValidSettingsRow(obj: unknown): obj is SettingsRow {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    const row = obj as Record<string, unknown>;
    return (
        "key" in row &&
        row["key"] !== undefined &&
        row["key"] !== null &&
        typeof row["key"] === "string" &&
        String(row["key"]).length > 0
    );
}

/**
 * Type guard to check if an object is a valid site row.
 *
 * @param obj - Object to check
 * @returns True if object matches SiteRow interface
 */
export function isValidSiteRow(obj: unknown): obj is SiteRow {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    const row = obj as Record<string, unknown>;
    return (
        "identifier" in row &&
        row["identifier"] !== undefined &&
        row["identifier"] !== null &&
        typeof row["identifier"] === "string" &&
        String(row["identifier"]).trim().length > 0
    );
}

/**
 * Utility to safely get a property from a database row.
 *
 * @param row - Database row object
 * @param property - Property name to access
 * @param defaultValue - Default value if property is undefined
 * @returns Property value or default
 */
export function safeGetRowProperty<T>(row: Record<string, unknown>, property: string, defaultValue: T): T {
    // eslint-disable-next-line security/detect-object-injection -- property is from validated database schema
    if (property in row && row[property] !== undefined) {
        // eslint-disable-next-line security/detect-object-injection -- property is from validated database schema
        return row[property] as T;
    }
    return defaultValue;
}
