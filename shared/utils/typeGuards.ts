/**
 * Comprehensive type guard utilities for enhanced type safety.
 *
 * @remarks
 * This module provides centralized type checking logic using proper TypeScript type predicates.
 * Each utility function is a type guard that narrows the type of the checked value.
 * All TSDoc tags follow the official TSDoc standard.
 *
 * @packageDocumentation
 */

/**
 * Determines if an object contains all specified properties.
 *
 * @typeParam K - The type of property keys to check for.
 * @param value - The value to check.
 * @param properties - An array of property keys that must be present on the value.
 * @returns True if `value` is an object containing all specified properties; otherwise, false.
 *
 * @example
 * ```ts
 * if (hasProperties(obj, ['foo', 'bar'])) {
 *   // obj has both 'foo' and 'bar' properties
 * }
 * ```
 */
export function hasProperties<K extends PropertyKey>(
    value: unknown,
    properties: readonly K[]
): value is Record<K, unknown> {
    return isObject(value) && properties.every((prop) => Object.hasOwn(value, prop));
}

/**
 * Determines if an object contains a specific property.
 *
 * @typeParam K - The property key to check for.
 * @param value - The value to check.
 * @param property - The property key that must be present on the value.
 * @returns True if `value` is an object containing the specified property; otherwise, false.
 *
 * @example
 * ```ts
 * if (hasProperty(obj, 'foo')) {
 *   // obj has the 'foo' property
 * }
 * ```
 */
export function hasProperty<K extends PropertyKey>(value: unknown, property: K): value is Record<K, unknown> {
    return isObject(value) && Object.hasOwn(value, property);
}

/**
 * Determines if a value is an array, optionally validating each item.
 *
 * @typeParam T - The type of array items, inferred by the optional validator.
 * @param value - The value to check.
 * @param itemValidator - Optional type guard to validate each item in the array.
 * @returns True if `value` is an array (and all items pass `itemValidator`, if provided); otherwise, false.
 *
 * @example
 * ```ts
 * if (isArray(arr, isString)) {
 *   // arr is string[]
 * }
 * ```
 */
export function isArray<T = unknown>(value: unknown, itemValidator?: (item: unknown) => item is T): value is T[] {
    if (!Array.isArray(value)) {
        return false;
    }

    if (itemValidator) {
        // eslint-disable-next-line unicorn/no-array-callback-reference -- itemValidator is a proper type guard function
        return value.every(itemValidator);
    }

    return true;
}

/**
 * Determines if a value is a boolean.
 *
 * @param value - The value to check.
 * @returns True if `value` is a boolean; otherwise, false.
 *
 * @example
 * ```ts
 * if (isBoolean(flag)) {
 *   // flag is boolean
 * }
 * ```
 */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

/**
 * Determines if a value is a valid `Date` instance.
 *
 * @param value - The value to check.
 * @returns True if `value` is a valid `Date` object; otherwise, false.
 *
 * @example
 * ```ts
 * if (isDate(dateCandidate)) {
 *   // dateCandidate is a Date
 * }
 * ```
 */
export function isDate(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime());
}

/**
 * Determines if a value is an `Error` instance.
 *
 * @param value - The value to check.
 * @returns True if `value` is an instance of `Error`; otherwise, false.
 */
export function isError(value: unknown): value is Error {
    return value instanceof Error;
}

/**
 * Determines if a value is a finite number (excludes `Infinity` and `-Infinity`).
 *
 * @param value - The value to check.
 * @returns True if `value` is a finite number; otherwise, false.
 */
export function isFiniteNumber(value: unknown): value is number {
    return isNumber(value) && Number.isFinite(value);
}

/**
 * Determines if a value is a function.
 *
 * @param value - The value to check.
 * @returns True if `value` is a function; otherwise, false.
 *
 * @example
 * ```ts
 * if (isFunction(fn)) {
 *   // fn is (...args: unknown[]) => unknown
 * }
 * ```
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === "function";
}

/**
 * Determines if a value is a non-negative number (zero or positive).
 *
 * @param value - The value to check.
 * @returns True if `value` is a non-negative number; otherwise, false.
 */
export function isNonNegativeNumber(value: unknown): value is number {
    return isNumber(value) && value >= 0;
}

/**
 * Determines if a value is a non-null object.
 *
 * @param value - The value to check.
 * @returns True if `value` is a non-null object; otherwise, false.
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
    return isObject(value);
}

/**
 * Determines if a value is a number (excluding `NaN`).
 *
 * @param value - The value to check.
 * @returns True if `value` is a number and not `NaN`; otherwise, false.
 */
export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Determines if a value is an object (excluding `null` and arrays).
 *
 * @param value - The value to check.
 * @returns True if `value` is an object and not null or an array; otherwise, false.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Determines if a value is a positive number (greater than zero).
 *
 * @param value - The value to check.
 * @returns True if `value` is a positive number; otherwise, false.
 */
export function isPositiveNumber(value: unknown): value is number {
    return isNumber(value) && value > 0;
}

/**
 * Determines if a value is a string.
 *
 * @param value - The value to check.
 * @returns True if `value` is a string; otherwise, false.
 */
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

/**
 * Determines if a value is a valid TCP/IP port number (1–65535).
 *
 * @param value - The value to check.
 * @returns True if `value` is a valid port number; otherwise, false.
 */
export function isValidPort(value: unknown): value is number {
    return isNumber(value) && Number.isInteger(value) && value >= 1 && value <= 65_535;
}

/**
 * Determines if a value is a valid Unix timestamp (seconds or milliseconds).
 * Allows timestamps up to 1 day in the future from the current time.
 *
 * @param value - The value to check.
 * @returns True if `value` is a valid timestamp; otherwise, false.
 */
export function isValidTimestamp(value: unknown): value is number {
    return isNumber(value) && value > 0 && value <= Date.now() + 86_400_000;
}

/**
 * Determines if a value is a valid URL string.
 *
 * @param value - The value to check.
 * @returns True if `value` is a string representing a valid URL; otherwise, false.
 *
 * @example
 * ```ts
 * if (isValidUrl(str)) {
 *   // str is a valid URL string
 * }
 * ```
 */
export function isValidUrl(value: unknown): value is string {
    if (!isString(value)) {
        return false;
    }

    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}
