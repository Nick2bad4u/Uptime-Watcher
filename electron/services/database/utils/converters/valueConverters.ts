import { isStrictPlainDecimalNumberString } from "@shared/utils/decimalNumberString";
import { isFinite as isFiniteNumber } from "ts-extras";

/**
 * Database value conversion utilities. Provides type-safe conversions between
 * app types and database values.
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
export type DbValue =
    | null
    | number
    | string;

/**
 * Converts an unknown input to a SQLite-bindable {@link DbValue}.
 *
 * @remarks
 * -
 * - Finite `number` and `string` values pass through
 * - `boolean` becomes `1`/`0`
 * - `null` becomes `null`
 * - Non-finite numbers, `undefined`, and all other types return `undefined`
 *   (caller decides whether to skip the field or coerce to `null`)
 *
 * Prefer this helper instead of ad-hoc `typeof` chains so the conversion rules
 * stay consistent across repositories and mappers.
 */

export function convertToDbValue(value: unknown): DbValue | undefined {
    let result: DbValue | undefined;

    if (value === null) {
        result = null;
    } else if (
        typeof value === "string" ||
        (typeof value === "number" && isFiniteNumber(value))
    ) {
        result = value;
    } else if (typeof value === "boolean") {
        result = value ? 1 : 0;
    }

    return result;
}

/**
 * Safely convert a value to number or return undefined.
 *
 * @remarks
 * Provides safe number conversion with explicit handling of edge cases:
 *
 * - Already a finite number: returned as-is (including 0)
 * - Signed decimal string values are converted after trimming
 * - Non-finite or non-decimal values return undefined
 * - Nullish values and blank strings return undefined
 *
 * Note: This function treats 0 as a valid number that should be preserved,
 * unlike some truthy/falsy checks that would convert 0 to undefined.
 *
 * @param value - The value to convert to a number
 *
 * @returns Converted number value, or undefined if conversion fails, would rely
 *   on object coercion, or the value is nullish
 *
 * @public
 */
export function safeNumberConvert(value: unknown): number | undefined {
    if (typeof value === "number") {
        return isFiniteNumber(value) ? value : undefined;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!isStrictPlainDecimalNumberString(trimmed)) {
            return undefined;
        }

        const converted = Number(trimmed);
        return isFiniteNumber(converted) ? converted : undefined;
    }

    return undefined;
}
