/**
 * Type-safe database query helpers to eliminate unsafe type assertions.
 *
 * @remarks
 * These helpers provide compile-time type safety for database operations while
 * maintaining runtime safety through controlled SQL queries. This centralizes
 * the inevitable type assertions required when working with SQLite's untyped
 * results.
 *
 * @packageDocumentation
 */

import type { Database } from "node-sqlite3-wasm";
import type { UnknownRecord } from "type-fest";

import {
    type HistoryRow,
    isValidMonitorRow,
    isValidSettingsRow,
    isValidSiteRow,
    type MonitorRow,
    type SettingsRow,
    type SiteRow,
} from "@shared/types/database";
import { isRecord as isSharedRecord } from "@shared/utils/typeHelpers";

import type { DbValue } from "../converters/valueConverters";

/**
 * Validation options for typed database rows.
 */
type EnforcedRow<TRow extends object> = TRow & UnknownRecord;

/**
 * Configuration for validating SQLite rows returned from typed query helpers.
 */
export interface RowValidationOptions<TRow extends object> {
    /** Human-readable label for error messages. */
    readonly label?: string;
    /** Type guard used to validate each row. */
    readonly validate?: (row: UnknownRecord) => row is EnforcedRow<TRow>;
}

/**
 * Error thrown when a typed query helper receives an unexpected row shape.
 *
 * @remarks
 * This provides structured metadata (label/context) so callers don't need to
 * parse error message strings (e.g. `.message.includes("CountResult")`).
 */
export class TypedQueryRowValidationError extends Error {
    public readonly label?: string | undefined;

    public readonly context?: string | undefined;

    public constructor(
        message: string,
        args: { context?: string | undefined; label?: string | undefined } = {}
    ) {
        super(message);
        this.name = "TypedQueryRowValidationError";
        this.label = args.label;
        this.context = args.context;
    }
}

function describeRow(label?: string, context?: string): string {
    const base = label ?? "row";
    return context ? `${base} (${context})` : base;
}

function ensureValidRow<TRow extends object>(
    row: unknown,
    options?: RowValidationOptions<TRow>,
    context?: string
): TRow {
    if (!isSharedRecord(row)) {
        throw new TypedQueryRowValidationError(
            `Expected ${describeRow(options?.label, context)} to be an object`,
            {
                context,
                label: options?.label,
            }
        );
    }

    if (options?.validate && !options.validate(row)) {
        throw new TypedQueryRowValidationError(
            `Row validation failed for ${describeRow(options.label, context)}`,
            {
                context,
                label: options.label,
            }
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- SQLite returns unknown row shapes that are validated above
    return row as TRow;
}

function ensureValidRows<TRow extends object>(
    rows: unknown,
    options?: RowValidationOptions<TRow>,
    label?: string
): TRow[] {
    if (rows === undefined || rows === null) {
        return [];
    }

    if (!Array.isArray(rows)) {
        throw new TypeError(
            `Expected ${describeRow(label)} query to return an array`
        );
    }

    return rows.map((row, index) =>
        ensureValidRow(row, options, `${label ?? "row"} #${index}`)
    );
}

/**
 * Common database result shapes for type-safe queries.
 *
 * @remarks
 * These interfaces deliberately avoid extending {@link UnknownRecord} so callers
 * are encouraged to treat them as narrow, well-defined result contracts rather
 * than generic bags of data. The low-level validation layer still widens rows
 * to {@link UnknownRecord} internally via {@link EnforcedRow} where necessary.
 */
export interface CountResult {
    /** Aggregate row count returned by COUNT(*) style queries. */
    count: number;
}

/**
 * Database result shape containing only an identifier.
 */
export interface IdOnlyResult {
    /** Primary key identifier (numeric or text). */
    id: number | string;
}

const isValidCountResult = (
    row: UnknownRecord
): row is EnforcedRow<CountResult> => {
    const value = row["count"];
    return typeof value === "number" && Number.isFinite(value);
};

const COUNT_RESULT_VALIDATION: RowValidationOptions<CountResult> = {
    label: "CountResult",
    validate: isValidCountResult,
};

/**
 * Type-safe wrapper for INSERT queries with RETURNING clause.
 *
 * @remarks
 * This function handles INSERT...RETURNING queries which return the inserted
 * record. Commonly used for getting auto-generated IDs. Callers should cast the
 * result to the expected type.
 *
 * @param db - Database instance
 * @param sql - INSERT SQL with RETURNING clause
 * @param params - Query parameters
 *
 * @returns Inserted record with generated fields
 */
export function insertWithReturning<TRow extends object = UnknownRecord>(
    db: Database,
    sql: string,
    params?: DbValue[],
    options?: RowValidationOptions<TRow>
): TRow {
    const result: unknown = db.get(sql, params);
    if (!result) {
        throw new Error("INSERT with RETURNING failed: no result returned");
    }

    return ensureValidRow<TRow>(result, options, options?.label);
}

/**
 * Type-safe wrapper for count queries.
 *
 * @remarks
 * This function handles COUNT() queries which return `{count: number}`.
 *
 * @param db - Database instance
 * @param sql - SQL query that returns a count
 * @param params - Query parameters
 *
 * @returns Count result object
 */
export function queryForCount(
    db: Database,
    sql: string,
    params?: DbValue[]
): CountResult | undefined {
    const row: unknown = db.get(sql, params);
    if (row === undefined) {
        return undefined;
    }

    return ensureValidRow(row, COUNT_RESULT_VALIDATION, "CountResult");
}

/**
 * Type-safe wrapper for database queries that return arrays of records with ID
 * fields.
 *
 * @remarks
 * ```
 * const row = db.get(sql, params);
 * if (!row || typeof row !== "object") {
 *     return undefined;
 * }
 *
 * return row as SettingsRow;
 * ```
 *
 * @param params - Query parameters
 *
 * @returns Array of objects with id: number
 */
export function queryForIds(
    db: Database,
    sql: string,
    params?: DbValue[]
): IdOnlyResult[] {
    const rows: unknown = db.all(sql, params);

    if (!Array.isArray(rows)) {
        return [];
    }

    const validRows: IdOnlyResult[] = [];

    rows.forEach((row) => {
        if (!isSharedRecord(row)) {
            return;
        }

        const candidateId = row["id"];
        if (typeof candidateId === "number" && Number.isFinite(candidateId)) {
            validRows.push({ id: candidateId });
            return;
        }

        if (typeof candidateId === "string" && candidateId.length > 0) {
            validRows.push({ id: candidateId });
        }
    });

    return validRows;
}

/**
 * Type-safe wrapper for database queries that return arrays of records.
 *
 * @remarks
 * This function centralizes the type assertion for multi-record queries. Use
 * this when you know the SQL structure and expected return type.
 *
 * @param db - Database instance
 * @param sql - SQL query string
 * @param params - Query parameters
 *
 * @returns Array of records
 */
export function queryForRecords<T extends object = UnknownRecord>(
    db: Database,
    sql: string,
    params?: DbValue[],
    options?: RowValidationOptions<T>
): T[] {
    const rows: unknown = db.all(sql, params ?? undefined);
    return ensureValidRows<T>(rows, options, options?.label);
}

/**
 * Type-safe wrapper for database queries that return a single record or
 * undefined.
 *
 * @remarks
 * This function centralizes the type assertion for single-record queries.
 * Callers should cast the result to the expected type.
 *
 * @param db - Database instance
 * @param sql - SQL query string
 * @param params - Query parameters
 *
 * @returns Single record or undefined
 */
export function queryForSingleRecord<TRow extends object = UnknownRecord>(
    db: Database,
    sql: string,
    params?: DbValue[],
    options?: RowValidationOptions<TRow>
): null | TRow | undefined {
    const row: unknown = db.get(sql, params ?? undefined);
    if (row === undefined) {
        return undefined;
    }

    if (row === null) {
        return null;
    }

    return ensureValidRow(row, options, options?.label);
}

const isValidHistoryEntryRow = (
    row: UnknownRecord
): row is EnforcedRow<HistoryRow> => {
    const { responseTime, status, timestamp } = row;

    const hasValidStatus =
        typeof status === "string" &&
        (status === "up" || status === "down" || status === "degraded");

    if (!hasValidStatus) {
        return false;
    }

    let hasValidTimestamp = false;
    if (typeof timestamp === "number") {
        hasValidTimestamp = Number.isFinite(timestamp);
    } else if (typeof timestamp === "string") {
        hasValidTimestamp = !Number.isNaN(Number(timestamp));
    }

    if (!hasValidTimestamp) {
        return false;
    }

    if (
        responseTime !== undefined &&
        typeof responseTime !== "number" &&
        typeof responseTime !== "string"
    ) {
        return false;
    }

    return true;
};

const HISTORY_ROW_VALIDATION: RowValidationOptions<HistoryRow> = {
    label: "HistoryRow",
    validate: (row): row is EnforcedRow<HistoryRow> =>
        isValidHistoryEntryRow(row),
};

const MONITOR_ROW_VALIDATION: RowValidationOptions<MonitorRow> = {
    label: "MonitorRow",
    validate: (row): row is EnforcedRow<MonitorRow> => isValidMonitorRow(row),
};

const SETTINGS_ROW_VALIDATION: RowValidationOptions<SettingsRow> = {
    label: "SettingsRow",
    validate: (row): row is EnforcedRow<SettingsRow> => isValidSettingsRow(row),
};

const SITE_ROW_VALIDATION: RowValidationOptions<SiteRow> = {
    label: "SiteRow",
    validate: (row): row is EnforcedRow<SiteRow> => isValidSiteRow(row),
};

/**
 * Convenience helper for querying multiple history rows with validation.
 */
export function queryHistoryRows(
    db: Database,
    sql: string,
    params?: DbValue[]
): HistoryRow[] {
    return queryForRecords<HistoryRow>(db, sql, params, HISTORY_ROW_VALIDATION);
}

/**
 * Convenience helper for querying a single history row with validation.
 */
export function queryHistoryRow(
    db: Database,
    sql: string,
    params?: DbValue[]
): HistoryRow | null | undefined {
    return queryForSingleRecord<HistoryRow>(
        db,
        sql,
        params,
        HISTORY_ROW_VALIDATION
    );
}

/**
 * Convenience helper for querying multiple monitor rows with validation.
 */
export function queryMonitorRows(
    db: Database,
    sql: string,
    params?: DbValue[]
): MonitorRow[] {
    return queryForRecords<MonitorRow>(db, sql, params, MONITOR_ROW_VALIDATION);
}

/**
 * Convenience helper for querying a single monitor row with validation.
 */
export function queryMonitorRow(
    db: Database,
    sql: string,
    params?: DbValue[]
): MonitorRow | null | undefined {
    return queryForSingleRecord<MonitorRow>(
        db,
        sql,
        params,
        MONITOR_ROW_VALIDATION
    );
}

/**
 * Convenience helper for querying multiple settings rows with validation.
 */
export function querySettingsRows(
    db: Database,
    sql: string,
    params?: DbValue[]
): SettingsRow[] {
    return queryForRecords<SettingsRow>(
        db,
        sql,
        params,
        SETTINGS_ROW_VALIDATION
    );
}

/**
 * Convenience helper for querying a single settings row with validation.
 */
export function querySettingsRow(
    db: Database,
    sql: string,
    params?: DbValue[]
): null | SettingsRow | undefined {
    return queryForSingleRecord<SettingsRow>(
        db,
        sql,
        params,
        SETTINGS_ROW_VALIDATION
    );
}

/**
 * Convenience helper for querying multiple site rows with validation.
 */
export function querySiteRows(
    db: Database,
    sql: string,
    params?: DbValue[]
): SiteRow[] {
    return queryForRecords<SiteRow>(db, sql, params, SITE_ROW_VALIDATION);
}

/**
 * Convenience helper for querying a single site row with validation.
 */
export function querySiteRow(
    db: Database,
    sql: string,
    params?: DbValue[]
): null | SiteRow | undefined {
    return queryForSingleRecord<SiteRow>(db, sql, params, SITE_ROW_VALIDATION);
}
