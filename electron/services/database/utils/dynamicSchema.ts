/**
 * @packageDocumentation
 * @remarks
 * Provides dynamic database schema management for monitor types in Uptime Watcher.
 * Automatically generates database columns and mappings based on the monitor type registry.
 * All APIs are strictly typed and designed for extensibility.
 */

import { safeStringify } from "../../../../shared/utils/stringConversion";
import { getAllMonitorTypeConfigs } from "../../monitoring/MonitorTypeRegistry";

/**
 * Database field definition for dynamic monitor schema.
 *
 * @remarks
 * Used to describe dynamically generated columns for monitor types.
 * All fields are mapped from monitor type registry definitions.
 *
 * @public
 */
export interface DatabaseFieldDefinition {
    /**
     * Column name in database (snake_case).
     * @remarks
     * Generated from the monitor type field name.
     */
    columnName: string;
    /**
     * Default value for the column.
     * @remarks
     * Always `null` for dynamic fields.
     * @defaultValue null
     */
    defaultValue?: null | string;
    /**
     * Monitor type this field belongs to.
     */
    monitorType: string;
    /**
     * Whether column allows NULL values.
     * @remarks
     * All dynamic fields are nullable.
     * @defaultValue true
     */
    nullable: boolean;
    /**
     * Field name from monitor type definition (camelCase).
     */
    sourceField: string;
    /**
     * SQL data type for the column.
     * @remarks
     * Determined by monitor type registry field type.
     */
    sqlType: string;
}

/**
 * Generates database field definitions from the monitor type registry.
 *
 * @remarks
 * Avoids duplicate columns by tracking seen field names.
 * Converts field names to snake_case for database compatibility.
 *
 * @returns Array of {@link DatabaseFieldDefinition} objects for all monitor types.
 *
 * @example
 * ```typescript
 * const fields = generateDatabaseFieldDefinitions();
 * ```
 */
export function generateDatabaseFieldDefinitions(): DatabaseFieldDefinition[] {
    const configs = getAllMonitorTypeConfigs();
    const fields: DatabaseFieldDefinition[] = [];
    const seenFields = new Set<string>();

    for (const config of configs) {
        for (const field of config.fields) {
            // Convert field name to snake_case for database
            const columnName = toSnakeCase(field.name);

            // Skip if we've already seen this field (avoid duplicates)
            if (seenFields.has(columnName)) {
                continue;
            }
            seenFields.add(columnName);

            fields.push({
                columnName,
                defaultValue: null, // Actual null value, not string "NULL"
                monitorType: config.type,
                // All dynamic fields are nullable since they're only used by specific monitor types
                nullable: true,
                sourceField: field.name,
                sqlType: getSqlTypeFromFieldType(field.type),
            });
        }
    }

    return fields;
}

/**
 * Generates the CREATE TABLE SQL statement for the monitors table,
 * including all static and dynamic fields.
 *
 * @remarks
 * Static fields are always present; dynamic fields are generated from monitor type registry.
 *
 * @returns SQL string for creating the monitors table.
 *
 * @example
 * ```typescript
 * const sql = generateMonitorTableSchema();
 * ```
 */
export function generateMonitorTableSchema(): string {
    const staticFields = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_identifier TEXT NOT NULL,
        type TEXT NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT 1,
        check_interval INTEGER NOT NULL DEFAULT 300000,
        timeout INTEGER NOT NULL DEFAULT 30000,
        retry_attempts INTEGER NOT NULL DEFAULT 3,
        status TEXT DEFAULT 'pending',
        last_checked INTEGER,
        next_check INTEGER,
        response_time INTEGER,
        last_error TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    `;

    const dynamicFields = generateDatabaseFieldDefinitions()
        .map((field) => `        ${field.columnName} ${field.sqlType}${field.nullable ? "" : " NOT NULL"}`)
        .join(",\n");

    return `CREATE TABLE IF NOT EXISTS monitors (
${staticFields}${dynamicFields ? ",\n" + dynamicFields : ""}
    )`;
}

/**
 * Generates SQL parameter columns and placeholders for INSERT/UPDATE operations.
 *
 * @remarks
 * Combines static and dynamic columns for parameterized queries.
 *
 * @returns Object containing `columns` (array of column names) and `placeholders` (comma-separated string).
 *
 * @example
 * ```typescript
 * const { columns, placeholders } = generateSqlParameters();
 * ```
 */
export function generateSqlParameters(): { columns: string[]; placeholders: string } {
    const staticColumns = [
        "site_identifier",
        "type",
        "enabled",
        "check_interval",
        "timeout",
        "retry_attempts",
        "status",
        "last_checked",
        "next_check",
        "response_time",
        "last_error",
        "created_at",
        "updated_at",
    ];

    const dynamicColumns = generateDatabaseFieldDefinitions().map((field) => field.columnName);

    const allColumns = [...staticColumns, ...dynamicColumns];
    const placeholders = allColumns.map(() => "?").join(", ");

    return { columns: allColumns, placeholders };
}

/**
 * Maps a monitor object to a database row, including dynamic fields.
 *
 * @remarks
 * Converts monitor properties to database-compatible values.
 * Handles both static and dynamic fields.
 *
 * @param monitor - Monitor object to map.
 * @returns Database row object suitable for SQL operations.
 *
 * @example
 * ```typescript
 * const row = mapMonitorToRow(monitor);
 * ```
 */
export function mapMonitorToRow(monitor: Record<string, unknown>): Record<string, unknown> {
    const row: Record<string, unknown> = {
        check_interval: monitor.checkInterval,
        created_at: monitor.createdAt,
        enabled: (monitor.monitoring ?? monitor.enabled) ? 1 : 0,
        last_checked: monitor.lastChecked instanceof Date ? monitor.lastChecked.getTime() : monitor.lastChecked,
        last_error: monitor.lastError,
        next_check: monitor.nextCheck,
        response_time: monitor.responseTime,
        retry_attempts: monitor.retryAttempts,
        site_identifier: monitor.siteIdentifier,
        status: monitor.status,
        timeout: monitor.timeout,
        type: monitor.type,
        updated_at: monitor.updatedAt,
    };

    // Dynamically map monitor type specific fields
    const fieldDefs = generateDatabaseFieldDefinitions();
    for (const fieldDef of fieldDefs) {
        if (monitor[fieldDef.sourceField] !== undefined) {
            row[fieldDef.columnName] = convertToDatabase(monitor[fieldDef.sourceField], fieldDef.sqlType);
        }
    }

    return row;
}

/**
 * Maps a database row to a monitor object, including dynamic fields.
 *
 * @remarks
 * Converts database values to JavaScript types.
 * Maps `enabled` to both `enabled` and `monitoring` for frontend compatibility.
 *
 * @param row - Database row to convert.
 * @returns Monitor object with all properties mapped.
 *
 * @example
 * ```typescript
 * const monitor = mapRowToMonitor(row);
 * ```
 */
export function mapRowToMonitor(row: Record<string, unknown>): Record<string, unknown> {
    const monitor: Record<string, unknown> = {
        checkInterval: Number(row.check_interval),
        createdAt: Number(row.created_at),
        enabled: row.enabled === 1, // Explicit SQLite boolean mapping
        id: Number(row.id),
        lastChecked: row.last_checked ? Number(row.last_checked) : undefined,
        lastError: row.last_error ? safeStringifyError(row.last_error) : undefined,
        monitoring: row.enabled === 1, // Map enabled -> monitoring for frontend consistency
        nextCheck: row.next_check ? Number(row.next_check) : undefined,
        responseTime: row.response_time ? Number(row.response_time) : undefined,
        retryAttempts: Number(row.retry_attempts),
        siteIdentifier: String(row.site_identifier),
        status: row.status as "down" | "paused" | "pending" | "up",
        timeout: Number(row.timeout),
        type: String(row.type),
        updatedAt: Number(row.updated_at),
    };

    // Dynamically map monitor type specific fields
    const fieldDefs = generateDatabaseFieldDefinitions();
    for (const fieldDef of fieldDefs) {
        if (row[fieldDef.columnName] !== undefined && row[fieldDef.columnName] !== null) {
            monitor[fieldDef.sourceField] = convertFromDatabase(row[fieldDef.columnName], fieldDef.sqlType);
        }
    }

    return monitor;
}

/**
 * Converts a database value to its corresponding JavaScript type.
 *
 * @remarks
 * Handles INTEGER and TEXT types; defaults to raw value for unknown types.
 *
 * @param value - Value from the database.
 * @param sqlType - SQL type of the value.
 * @returns Converted JavaScript value.
 *
 * @example
 * ```typescript
 * const jsValue = convertFromDatabase(dbValue, "INTEGER");
 * ```
 */
function convertFromDatabase(value: unknown, sqlType: string): unknown {
    if (value === null || value === undefined) {
        return undefined;
    }

    switch (sqlType) {
        case "INTEGER": {
            return Number(value);
        }
        case "TEXT": {
            return safeStringify(value);
        }
        default: {
            return value;
        }
    }
}

/**
 * Converts a JavaScript value to a database-compatible format.
 *
 * @remarks
 * Handles INTEGER and TEXT types; defaults to stringified value for unknown types.
 *
 * @param value - JavaScript value to convert.
 * @param sqlType - SQL type for the database column.
 * @returns Value suitable for database storage.
 *
 * @example
 * ```typescript
 * const dbValue = convertToDatabase(jsValue, "TEXT");
 * ```
 */
function convertToDatabase(value: unknown, sqlType: string): unknown {
    if (value === undefined || value === null) {
        return null;
    }

    switch (sqlType) {
        case "INTEGER": {
            return Number(value);
        }
        case "TEXT": {
            return safeStringify(value);
        }
        default: {
            return safeStringify(value);
        } // Convert anything else to string to avoid object binding errors
    }
}

/**
 * Maps a monitor field type to its corresponding SQL data type.
 *
 * @remarks
 * Unknown field types default to TEXT for safety.
 * Supported types: "number" → INTEGER, "text"/"url" → TEXT.
 *
 * @param fieldType - Field type from monitor configuration.
 * @returns SQL data type for SQLite.
 *
 * @example
 * ```typescript
 * const sqlType = getSqlTypeFromFieldType("number");
 * ```
 */
function getSqlTypeFromFieldType(fieldType: string): string {
    switch (fieldType) {
        case "number": {
            return "INTEGER";
        }
        case "text":
        case "url": {
            return "TEXT";
        }
        default: {
            return "TEXT"; // Safe default for unknown types
        }
    }
}

/**
 * Safely converts an error value to a string for database storage.
 *
 * @remarks
 * Handles Error objects, strings, and generic objects.
 * Provides fallback serialization for unknown types.
 *
 * @param value - Error value to serialize.
 * @returns String representation of the error.
 *
 * @example
 * ```typescript
 * const errorStr = safeStringifyError(errorObj);
 * ```
 */
function safeStringifyError(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }

    if (value instanceof Error) {
        return JSON.stringify({
            message: value.message,
            name: value.name,
            stack: value.stack,
        });
    }

    if (typeof value === "object" && value !== null) {
        try {
            const result = JSON.stringify(value);
            // Handle empty object case
            return result === "{}" ? "[Empty Object]" : result;
        } catch {
            return "[Non-Serializable Object]";
        }
    }

    return String(value);
}

/**
 * Converts a camelCase or PascalCase string to snake_case for database columns.
 *
 * @remarks
 * Handles leading uppercase characters to avoid leading underscores.
 *
 * @param str - String to convert.
 * @returns Snake_case version of the string.
 *
 * @example
 * ```typescript
 * const snake = toSnakeCase("SiteIdentifier"); // "site_identifier"
 * ```
 */
function toSnakeCase(str: string): string {
    if (!str || typeof str !== "string") return str;

    // Handle leading uppercase to avoid leading underscore
    return str
        .replace(/^[A-Z]/, (match) => match.toLowerCase())
        .replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
