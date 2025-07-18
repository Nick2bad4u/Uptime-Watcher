/**
 * Database value conversion utilities.
 * Provides type-safe conversions between application types and database values.
 */

/**
 * Type for database parameter values.
 */
export type DbValue = null | number | string;

/**
 * Add a boolean field to update arrays if the value is defined.
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
 * Add a number field to update arrays if the value is defined.
 */
export function addNumberField(
    fieldName: string,
    value: number | undefined,
    updateFields: string[],
    updateValues: DbValue[]
): void {
    if (value !== undefined) {
        updateFields.push(`${fieldName} = ?`);
        updateValues.push(Number(value));
    }
}

/**
 * Add a string field to update arrays if the value is defined.
 */
export function addStringField(
    fieldName: string,
    value: string | undefined,
    updateFields: string[],
    updateValues: DbValue[]
): void {
    if (value !== undefined) {
        updateFields.push(`${fieldName} = ?`);

        updateValues.push(value ? String(value) : null);
    }
}

/**
 * Convert a date-like value to ISO string or null for database storage.
 */
export function convertDateForDb(value: Date | null | string | undefined): null | string {
    if (!value) {
        return null;
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return String(value);
}

/**
 * Safely convert a value to number or return undefined.
 */
export function safeNumberConvert(value: unknown): number | undefined {
    if (typeof value === "number") {
        return value;
    }
    if (value) {
        return Number(value);
    }
    return undefined;
}
