/**
 * Dynamic database schema management for monitor types in Uptime Watcher.
 *
 * @remarks
 * Provides dynamic database schema management for monitor types. Automatically
 * generates database columns and mappings based on the monitor type registry.
 * All APIs are strictly typed and designed for extensibility.
 *
 * @public
 */

import type { Monitor, MonitorStatus, MonitorType } from "@shared/types";
import type { MonitorRow } from "@shared/types/database";

import { safeGetRowProperty } from "@shared/types/database";
import { safeStringify } from "@shared/utils/stringConversion";
import { isValidIdentifierArray } from "@shared/validation/validatorUtils";

import { getAllMonitorTypeConfigs } from "../../monitoring/MonitorTypeRegistry";

/**
 * Field mapping configuration for transforming monitor fields to database
 * columns.
 *
 * @internal
 */
interface FieldMapping {
    /** Database column name */
    dbField: string;
    /** Default value if field is undefined */
    defaultValue: unknown;
    /** Monitor object field name */
    sourceField: string;
    /** Optional transformation function */
    transform?: (value: unknown, monitor: Record<string, unknown>) => unknown;
}

/**
 * Interface for SQL parameters generation result.
 */
interface SqlParameters {
    columns: string[];
    placeholders: string;
}

/**
 * Converts a `lastChecked` value to a database-compatible timestamp.
 *
 * @remarks
 * Used internally to ensure `lastChecked` is stored as a number (timestamp) or
 * null.
 *
 * @param lastChecked - Value to convert (Date, number, or other).
 *
 * @returns Timestamp as number, or null if not convertible.
 *
 * @internal
 */
function convertLastCheckedField(lastChecked: unknown): null | number {
    if (lastChecked instanceof Date) {
        return lastChecked.getTime();
    }
    if (typeof lastChecked === "number") {
        return lastChecked;
    }
    return null;
}

/**
 * Configuration for standard field mappings between monitor objects and
 * database rows.
 *
 * @internal
 */
const STANDARD_FIELD_MAPPINGS: FieldMapping[] = [
    {
        dbField: "active_operations",
        defaultValue: "[]",
        sourceField: "activeOperations",
        transform: (value): string => {
            const activeOps = Array.isArray(value) ? value : [];
            return JSON.stringify(activeOps);
        },
    },
    {
        dbField: "check_interval",
        defaultValue: 300_000,
        sourceField: "checkInterval",
    },
    {
        dbField: "created_at",
        defaultValue: Date.now(),
        sourceField: "createdAt",
    },
    {
        dbField: "last_checked",
        defaultValue: null,
        sourceField: "lastChecked",
        transform: convertLastCheckedField,
    },
    {
        dbField: "last_error",
        defaultValue: null,
        sourceField: "lastError",
    },
    {
        dbField: "next_check",
        defaultValue: null,
        sourceField: "nextCheck",
    },
    {
        dbField: "response_time",
        defaultValue: -1,
        sourceField: "responseTime",
    },
    {
        dbField: "retry_attempts",
        defaultValue: 3,
        sourceField: "retryAttempts",
    },
    {
        dbField: "site_identifier",
        defaultValue: "",
        sourceField: "siteIdentifier",
    },
    {
        dbField: "status",
        defaultValue: "pending",
        sourceField: "status",
    },
    {
        dbField: "timeout",
        defaultValue: 10_000,
        sourceField: "timeout",
    },
    {
        dbField: "type",
        defaultValue: "http",
        sourceField: "type",
    },
    {
        dbField: "updated_at",
        defaultValue: Date.now(),
        sourceField: "updatedAt",
    },
];

/**
 * Database field definition for dynamic monitor schema.
 *
 * @remarks
 * Used to describe dynamically generated columns for monitor types. All fields
 * are mapped from monitor type registry definitions and used in dynamic schema
 * generation.
 *
 * @public
 */
export interface DatabaseFieldDefinition {
    /**
     * Column name in database (snake_case).
     *
     * @remarks
     * Generated from the monitor type field name.
     */
    columnName: string;
    /**
     * Default value for the column.
     *
     * @remarks
     * Always `null` for dynamic fields.
     *
     * @defaultValue null
     */
    defaultValue?: null | string;
    /**
     * Monitor type this field belongs to.
     */
    monitorType: string;
    /**
     * Whether column allows NULL values.
     *
     * @remarks
     * All dynamic fields are nullable.
     *
     * @defaultValue true
     */
    nullable: boolean;
    /**
     * Field name from monitor type definition (camelCase).
     */
    sourceField: string;
    /**
     * SQL data type for the column.
     *
     * @remarks
     * Determined by monitor type registry field type.
     */
    sqlType: string;
}

/**
 * Converts enabled/monitoring fields to a database-compatible integer value.
 *
 * @remarks
 * Used internally to map boolean or truthy `enabled`/`monitoring` fields to
 * SQLite integer format (1 for true, 0 for false).
 *
 * @param monitor - Monitor object containing `enabled` and/or `monitoring`
 *   properties.
 *
 * @returns Database value: 1 for true, 0 for false.
 *
 * @internal
 */
function convertEnabledField(monitor: Record<string, unknown>): number {
    const { enabled, monitoring } = monitor;
    return monitoring === true || enabled === true ? 1 : 0;
}

/**
 * Core SQL value conversion logic shared between database conversion functions.
 *
 * @param value - Value to convert
 * @param sqlType - SQL type for conversion
 * @param defaultStrategy - Strategy for handling unknown types: 'raw' keeps
 *   original value, 'stringify' converts to string
 *
 * @returns Converted value according to SQL type and strategy
 *
 * @internal Helper function to eliminate type conversion duplication
 */
function convertSqlValue(
    value: unknown,
    sqlType: string,
    defaultStrategy: "raw" | "stringify"
): unknown {
    switch (sqlType) {
        case "INTEGER": {
            return Number(value);
        }
        case "TEXT": {
            return safeStringify(value);
        }
        default: {
            return defaultStrategy === "raw" ? value : safeStringify(value);
        }
    }
}

/**
 * Converts a database value to its corresponding JavaScript type.
 *
 * @remarks
 * Handles INTEGER and TEXT types; defaults to raw value for unknown types. Used
 * internally for dynamic field mapping.
 *
 * @example
 *
 * ```typescript
 * const jsValue = convertFromDatabase(dbValue, "INTEGER");
 * ```
 *
 * @param value - Value from the database.
 * @param sqlType - SQL type of the value (e.g., "INTEGER", "TEXT").
 *
 * @returns Converted JavaScript value.
 *
 * @internal
 */
function convertFromDatabase(value: unknown, sqlType: string): unknown {
    if (value === null || value === undefined) {
        return undefined;
    }

    return convertSqlValue(value, sqlType, "raw");
}

/**
 * Converts a JavaScript value to a database-compatible format for storage.
 *
 * @remarks
 * Handles INTEGER and TEXT types; defaults to stringified value for unknown
 * types. Used internally for dynamic field mapping.
 *
 * @example
 *
 * ```typescript
 * const dbValue = convertToDatabase(jsValue, "TEXT");
 * ```
 *
 * @param value - JavaScript value to convert.
 * @param sqlType - SQL type for the database column (e.g., "INTEGER", "TEXT").
 *
 * @returns Value suitable for database storage.
 *
 * @internal
 */
function convertToDatabase(value: unknown, sqlType: string): unknown {
    if (value === undefined || value === null) {
        return null;
    }

    return convertSqlValue(value, sqlType, "stringify");
}

/**
 * Maps a monitor field type to its corresponding SQL data type for SQLite.
 *
 * @remarks
 * Unknown field types default to TEXT for safety. Supported types: "number" →
 * INTEGER, "text"/"url" → TEXT.
 *
 * @example
 *
 * ```typescript
 * const sqlType = getSqlTypeFromFieldType("number");
 * ```
 *
 * @param fieldType - Field type from monitor configuration.
 *
 * @returns SQL data type for SQLite.
 *
 * @internal
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
 * Converts a camelCase or PascalCase string to snake_case for database columns.
 *
 * @remarks
 * Handles leading uppercase characters to avoid leading underscores. Used
 * internally for dynamic schema generation.
 *
 * @example
 *
 * ```typescript
 * const snake = toSnakeCase("SiteIdentifier"); // "site_identifier"
 * ```
 *
 * @param str - String to convert.
 *
 * @returns Snake_case version of the string.
 *
 * @internal
 */
function toSnakeCase(str: string): string {
    if (!str || typeof str !== "string") return str;

    // Handle leading uppercase to avoid leading underscore
    return str
        .replace(/^[A-Z]/v, (match) => match.toLowerCase())
        .replaceAll(/[A-Z]/gv, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Generates database field definitions from the monitor type registry.
 *
 * @remarks
 * Avoids duplicate columns by tracking seen field names. Converts field names
 * to snake_case for database compatibility.
 *
 * @example
 *
 * ```typescript
 * const fields = generateDatabaseFieldDefinitions();
 * ```
 *
 * @returns Array of {@link DatabaseFieldDefinition} objects for all monitor
 *   types.
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
            if (!seenFields.has(columnName)) {
                seenFields.add(columnName);

                fields.push({
                    columnName,
                    defaultValue: null, // Actual null value, not string "NULL"
                    monitorType: config.type,
                    // All dynamic fields are nullable since they're only used
                    // by specific monitor types
                    nullable: true,
                    sourceField: field.name,
                    sqlType: getSqlTypeFromFieldType(field.type),
                });
            }
        }
    }

    return fields;
}

/**
 * Maps dynamic monitor type-specific fields from a monitor object to a database
 * row.
 *
 * @remarks
 * Used internally to populate a database row with dynamic fields based on
 * monitor type definitions.
 *
 * @param monitor - Monitor object to map.
 * @param row - Database row object to populate.
 *
 * @internal
 */
function mapDynamicFields(
    monitor: Record<string, unknown>,
    row: Record<string, unknown>
): void {
    const fieldDefs = generateDatabaseFieldDefinitions();
    for (const fieldDef of fieldDefs) {
        if (monitor[fieldDef.sourceField] !== undefined) {
            row[fieldDef.columnName] = convertToDatabase(
                monitor[fieldDef.sourceField],
                fieldDef.sqlType
            );
        }
    }
}

/**
 * Maps standard monitor fields from a monitor object to a database row.
 *
 * @remarks
 * Uses a configuration-driven approach to map fields, reducing complexity and
 * improving maintainability.
 *
 * @param monitor - Monitor object to map.
 * @param row - Database row object to populate.
 *
 * @internal
 */
function mapStandardFields(
    monitor: Record<string, unknown>,
    row: Record<string, unknown>
): void {
    // Handle enabled/monitoring fields specially since they map to the same db
    // field
    if (
        monitor["monitoring"] !== undefined ||
        monitor["enabled"] !== undefined
    ) {
        row["enabled"] = convertEnabledField(monitor);
    }

    // Process all other standard field mappings
    for (const mapping of STANDARD_FIELD_MAPPINGS) {
        if (monitor[mapping.sourceField] !== undefined) {
            const value = mapping.transform
                ? mapping.transform(monitor[mapping.sourceField], monitor)
                : safeGetRowProperty(
                      monitor,
                      mapping.sourceField,
                      mapping.defaultValue
                  );

            row[mapping.dbField] = value;
        }
    }
}

/**
 * Generates the CREATE TABLE SQL statement for the monitors table, including
 * all static and dynamic fields.
 *
 * @remarks
 * Static fields are always present; dynamic fields are generated from monitor
 * type registry.
 *
 * @example
 *
 * ```typescript
 * const sql = generateMonitorTableSchema();
 * ```
 *
 * @returns SQL string for creating the monitors table.
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
        active_operations TEXT DEFAULT '[]',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    `;

    const dynamicFields = generateDatabaseFieldDefinitions()
        .map(
            (field) =>
                `        ${field.columnName} ${field.sqlType}${field.nullable ? "" : " NOT NULL"}`
        )
        .join(",\n");

    return `CREATE TABLE IF NOT EXISTS monitors (
${staticFields}${dynamicFields ? `,\n${dynamicFields}` : ""}
    )`;
}

/**
 * Generates SQL parameter columns and placeholders for INSERT/UPDATE
 * operations.
 *
 * @remarks
 * Combines static and dynamic columns for parameterized queries.
 *
 * @example
 *
 * ```typescript
 * const { columns, placeholders } = generateSqlParameters();
 * ```
 *
 * @returns Object containing `columns` (array of column names) and
 *   `placeholders` (comma-separated string).
 */
export function generateSqlParameters(): SqlParameters {
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
        "active_operations",
        "created_at",
        "updated_at",
    ];

    const dynamicColumns = generateDatabaseFieldDefinitions().map(
        (field) => field.columnName
    );

    const allColumns = [...staticColumns, ...dynamicColumns];
    const placeholders = allColumns.map(() => "?").join(", ");

    return { columns: allColumns, placeholders };
}

/**
 * Maps a monitor object to a database row, including dynamic fields.
 *
 * @remarks
 * Converts monitor properties to database-compatible values. Handles both
 * static and dynamic fields.
 *
 * @example
 *
 * ```typescript
 * const row = mapMonitorToRow(monitor);
 * ```
 *
 * @param monitor - Monitor object to map.
 *
 * @returns Database row object suitable for SQL operations.
 */
export function mapMonitorToRow(monitor: Monitor): MonitorRow {
    const monitorRecord = monitor as unknown as Record<string, unknown>;
    const row: Record<string, unknown> = {};

    // Map standard fields first
    mapStandardFields(monitorRecord, row);

    // Map dynamic monitor type-specific fields
    mapDynamicFields(monitorRecord, row);

    return row as MonitorRow;
}

/**
 * Maps a database row to a monitor object, including dynamic fields.
 *
 * @remarks
 * Converts database values to JavaScript types. Maps `enabled` to both
 * `enabled` and `monitoring` for frontend compatibility.
 *
 * @example
 *
 * ```typescript
 * const monitor = mapRowToMonitor(row);
 * ```
 *
 * @param row - Database row to convert.
 *
 * @returns Monitor object with all properties mapped.
 */
export function mapRowToMonitor(row: MonitorRow): Monitor {
    // Parse activeOperations safely
    const activeOperations = ((): string[] => {
        if (
            !row.active_operations ||
            typeof row.active_operations !== "string"
        ) {
            return [];
        }
        try {
            const parsed: unknown = JSON.parse(row.active_operations);
            return isValidIdentifierArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    })();

    // Create the base monitor object with proper type safety
    const monitor: Monitor = {
        activeOperations,
        checkInterval: row.check_interval ?? 300_000,
        history: [], // History will be loaded separately
        id: String(row.id ?? 0),
        monitoring: (row.enabled ?? 0) === 1, // Map enabled -> monitoring for frontend consistency
        responseTime: row.response_time ?? -1,
        retryAttempts: row.retry_attempts ?? 3,
        status: (row.status as MonitorStatus | undefined) ?? "down",
        timeout: row.timeout ?? 5000,
        type: (row.type as MonitorType | undefined) ?? "http",
        // Add conditional fields based on monitor type
        ...(row.host && { host: row.host }),
        ...(row.port && { port: row.port }),
        ...(row.url && { url: row.url }),
        // Only add lastChecked if it exists to avoid undefined assignment with
        // exactOptionalPropertyTypes
        ...(row.last_checked && { lastChecked: new Date(row.last_checked) }),
    };

    // Dynamically map monitor type specific fields
    const fieldDefs = generateDatabaseFieldDefinitions();
    for (const fieldDef of fieldDefs) {
        const value = row[fieldDef.columnName as keyof MonitorRow];
        // Check if value exists (handles both null and undefined from SQLite)
        if (value !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- Dynamic field assignment required for extensible monitor type system. fieldDef.sourceField is validated by generateDatabaseFieldDefinitions() from monitor type registry.
            (monitor as any)[fieldDef.sourceField] = convertFromDatabase(
                value,
                fieldDef.sqlType
            );
        }
    }

    return monitor;
}
