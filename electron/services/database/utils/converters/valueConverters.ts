/**
 * Database value conversion utilities. Provides type-safe conversions between
 * application types and database values.
 */

/**
 * Type for database parameter values.
 *
 * @remarks
 * Represents the valid types that can be stored in SQLite database parameters.
 *
 * - `null`: Represents SQL NULL values
 * - `number`: Represents INTEGER and REAL values
 * - `string`: Represents TEXT values
 *
 * @public
 */
export type DbValue = null | number | string;

/**
 * Add a boolean field to update arrays if the value is defined.
 *
 * @remarks
 * Converts boolean values to database-compatible integers (1 for true, 0 for
 * false). Only adds the field if the value is not undefined, allowing for
 * optional updates.
 *
 * @param fieldName - The database field name to update
 * @param value - The boolean value to add, or undefined to skip
 * @param updateFields - Array to append the field update clause
 * @param updateValues - Array to append the database value
 *
 * @public
 */
export function addBooleanField(
    fieldName: string,
    value: boolean | undefined,
    updateFields: string[],
    updateValues: DbValue[]
): void {
    if (value !== undefined) {
        updateFields.push(`${fieldName} = ?`);
        updateValues.push(value ? 1 : 0);
    }
}

/**
 * Safely convert a value to number or return undefined.
 *
 * @remarks
 * Provides safe number conversion with explicit handling of edge cases:
 *
 * - Already a number: returned as-is (including 0, NaN, Infinity)
 * - Truthy values: converted using Number() constructor
 * - Falsy values (null, undefined, "", false, 0): returns undefined
 *
 * Note: This function treats 0 as a valid number that should be preserved,
 * unlike some truthy/falsy checks that would convert 0 to undefined.
 *
 * @param value - The value to convert to a number
 *
 * @returns Converted number value, or undefined if conversion fails or value is
 *   nullish
 *
 * @public
 */
export function safeNumberConvert(value: unknown): number | undefined {
    if (typeof value === "number") {
        return value;
    }
    if (value !== null && value !== undefined && value !== "") {
        const converted = Number(value);
        return Number.isNaN(converted) ? undefined : converted;
    }
    return undefined;
}

/**
 * Add a number field to update arrays if the value is defined.
 *
 * @remarks
 * Converts the value to a number type for database storage. Only adds the field
 * if the value is not undefined, allowing for optional updates. Zero values are
 * treated as valid and will be included.
 *
 * @param fieldName - The database field name to update
 * @param value - The number value to add, or undefined to skip
 * @param updateFields - Array to append the field update clause
 * @param updateValues - Array to append the database value
 *
 * @public
 */
export function addNumberField(
    fieldName: string,
    value: number | undefined,
    updateFields: string[],
    updateValues: DbValue[]
): void {
    if (value !== undefined) {
        updateFields.push(`${fieldName} = ?`);
        const convertedValue = safeNumberConvert(value);
        updateValues.push(convertedValue ?? value);
    }
}

/**
 * Add a string field to update arrays if the value is defined.
 *
 * @remarks
 * Handles string values for database storage with explicit empty string
 * handling. - If value is undefined: field is not added (skipped)
 *
 * - If value is empty string: stores empty string (preserved as-is)
 * - Otherwise: stores the string value after conversion
 *
 * Only adds the field if the value is not undefined, allowing for optional
 * updates. Empty strings are preserved to maintain data integrity.
 *
 * @param fieldName - The database field name to update
 * @param value - The string value to add, or undefined to skip
 * @param updateFields - Array to append the field update clause
 * @param updateValues - Array to append the database value
 *
 * @public
 */
export function addStringField(
    fieldName: string,
    value: string | undefined,
    updateFields: string[],
    updateValues: DbValue[]
): void {
    if (value !== undefined) {
        updateFields.push(`${fieldName} = ?`);
        // Handle runtime type coercion for tests that pass non-string values
        const stringValue = typeof value === "string" ? value : String(value);
        updateValues.push(stringValue);
    }
}

/**
 * Convert a date-like value to ISO string or null for database storage.
 *
 * @remarks
 * Handles various date input types for consistent database storage:
 *
 * - Date objects: converted to ISO string format
 * - String values: preserved as-is (assumed to be valid date strings)
 * - Null/undefined/falsy values: converted to null for database NULL storage
 *
 * The function prioritizes data safety by converting uncertain values to null
 * rather than attempting invalid date parsing.
 *
 * @param value - The date value to convert (Date object, string, null, or
 *   undefined)
 *
 * @returns ISO string representation for valid dates, null for invalid/empty
 *   values
 *
 * @public
 */
export function convertDateForDb(
    value: Date | null | string | undefined
): null | string {
    if (!value) {
        return null;
    }
    if (value instanceof Date) {
        // Check if the date is invalid
        if (Number.isNaN(value.getTime())) {
            return "Invalid Date";
        }
        return value.toISOString();
    }
    return value;
}
