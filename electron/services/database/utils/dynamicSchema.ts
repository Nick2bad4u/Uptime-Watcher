/**
 * Dynamic database schema management for monitor types.
 * Automatically generates database columns and mappings based on monitor type registry.
 */

import { getAllMonitorTypeConfigs } from "../../monitoring/MonitorTypeRegistry";

export interface DatabaseFieldDefinition {
    /** Column name in database */
    columnName: string;
    /** SQL data type */
    sqlType: string;
    /** Whether column allows NULL values */
    nullable: boolean;
    /** Default value for the column */
    defaultValue?: string;
    /** Field name from monitor type definition */
    sourceField: string;
    /** Monitor type this field belongs to */
    monitorType: string;
}

/**
 * Automatically generate database field definitions from monitor type registry.
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
                sqlType: getSqlTypeFromFieldType(field.type),
                // All dynamic fields are nullable since they're only used by specific monitor types
                nullable: true,
                defaultValue: "NULL",
                sourceField: field.name,
                monitorType: config.type,
            });
        }
    }

    return fields;
}

/**
 * Generate CREATE TABLE SQL with all monitor type fields.
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
 * Safely converts an error value to a string for database storage.
 */
function safeStringifyError(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }
    return JSON.stringify(value);
}

/**
 * Map database row to monitor object with dynamic field handling.
 */
export function mapRowToMonitor(row: Record<string, unknown>): Record<string, unknown> {
    const monitor: Record<string, unknown> = {
        id: Number(row.id),
        siteIdentifier: String(row.site_identifier),
        type: String(row.type),
        enabled: Boolean(row.enabled),
        monitoring: Boolean(row.enabled), // Map enabled -> monitoring for frontend
        checkInterval: Number(row.check_interval),
        timeout: Number(row.timeout),
        retryAttempts: Number(row.retry_attempts),
        status: row.status as "up" | "down" | "pending" | "paused",
        lastChecked: row.last_checked ? Number(row.last_checked) : undefined,
        nextCheck: row.next_check ? Number(row.next_check) : undefined,
        responseTime: row.response_time ? Number(row.response_time) : undefined,
        lastError: row.last_error ? safeStringifyError(row.last_error) : undefined,
        createdAt: Number(row.created_at),
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
 * Map monitor object to database row with dynamic field handling.
 */
export function mapMonitorToRow(monitor: Record<string, unknown>): Record<string, unknown> {
    const row: Record<string, unknown> = {
        site_identifier: monitor.siteIdentifier,
        type: monitor.type,
        enabled: (monitor.monitoring ?? monitor.enabled) ? 1 : 0,
        check_interval: monitor.checkInterval,
        timeout: monitor.timeout,
        retry_attempts: monitor.retryAttempts,
        status: monitor.status,
        last_checked: monitor.lastChecked,
        next_check: monitor.nextCheck,
        response_time: monitor.responseTime,
        last_error: monitor.lastError,
        created_at: monitor.createdAt,
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
 * Generate SQL parameter placeholders for INSERT/UPDATE operations.
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
 * Convert field type to SQL data type.
 */
function getSqlTypeFromFieldType(fieldType: string): string {
    switch (fieldType) {
        case "text":
        case "url": {
            return "TEXT";
        }
        case "number": {
            return "INTEGER";
        }
        default: {
            return "TEXT";
        }
    }
}

/**
 * Convert camelCase to snake_case for database columns.
 */
function toSnakeCase(str: string): string {
    return str.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert database value to JavaScript type.
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
            return typeof value === "string" ? value : JSON.stringify(value);
        }
        default: {
            return value;
        }
    }
}

/**
 * Convert JavaScript value to database format.
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
            return typeof value === "string" ? value : JSON.stringify(value);
        }
        default: {
            return typeof value === "string" ? value : JSON.stringify(value);
        } // Convert anything else to string to avoid object binding errors
    }
}
