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

import type { DbValue } from "./valueConverters";

/**
 * Common database result shapes for type-safe queries.
 */
export interface CountResult {
    count: number;
}

export interface IdOnlyResult {
    id: number;
}

/**
 * Type-safe wrapper for INSERT queries with RETURNING clause.
 *
 * @param db - Database instance
 * @param sql - INSERT SQL with RETURNING clause
 * @param params - Query parameters
 * @returns Inserted record with generated fields
 *
 * @remarks
 * This function handles INSERT...RETURNING queries which return the inserted
 * record. Commonly used for getting auto-generated IDs. Callers should cast
 * the result to the expected type.
 */
export function insertWithReturning(
    db: Database,
    sql: string,
    params?: DbValue[]
): Record<string, unknown> {
    const result = db.get(sql, params);
    if (!result) {
        throw new Error("INSERT with RETURNING failed: no result returned");
    }
    return result as unknown as Record<string, unknown>;
}

/**
 * Type-safe wrapper for count queries.
 *
 * @param db - Database instance
 * @param sql - SQL query that returns a count
 * @param params - Query parameters
 * @returns Count result object
 *
 * @remarks
 * This function handles COUNT() queries which return \{count: number\}.
 */
export function queryForCount(
    db: Database,
    sql: string,
    params?: DbValue[]
): CountResult | undefined {
    return db.get(sql, params) as unknown as CountResult | undefined;
}

/**
 * Type-safe wrapper for database queries that return arrays of records with ID
 * fields.
 *
 * @param db - Database instance
 * @param sql - SQL query string that selects id fields
 * @param params - Query parameters
 * @returns Array of objects with id: number
 *
 * @remarks
 * This function centralizes the type assertion for queries that select ID
 * fields. It's safe because we control the SQL and know it returns numeric
 * IDs.
 */
export function queryForIds(
    db: Database,
    sql: string,
    params?: DbValue[]
): IdOnlyResult[] {
    return db.all(sql, params) as unknown as IdOnlyResult[];
}

/**
 * Type-safe wrapper for database queries that return arrays of records.
 *
 * @param db - Database instance
 * @param sql - SQL query string
 * @param params - Query parameters
 * @returns Array of records
 *
 * @remarks
 * This function centralizes the type assertion for multi-record queries.
 * Use this when you know the SQL structure and expected return type.
 */
export function queryForRecords<
    // eslint-disable-next-line etc/no-misused-generics -- Type parameter can be omitted for flexible usage
    T extends Record<string, unknown> = Record<string, unknown>,
>(db: Database, sql: string, params?: DbValue[]): T[] {
    return db.all(sql, params) as unknown as T[];
}

/**
 * Type-safe wrapper for database queries that return a single record or
 * undefined.
 *
 * @param db - Database instance
 * @param sql - SQL query string
 * @param params - Query parameters
 * @returns Single record or undefined
 *
 * @remarks
 * This function centralizes the type assertion for single-record queries.
 * Callers should cast the result to the expected type.
 */
export function queryForSingleRecord(
    db: Database,
    sql: string,
    params?: DbValue[]
): Record<string, unknown> | undefined {
    return db.get(sql, params) as unknown as
        | Record<string, unknown>
        | undefined;
}
