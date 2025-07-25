/**
 * Comprehensive type guard utilities for enhanced type safety.
 * Centralizes type checking logic with proper TypeScript type predicates.
 */

/**
 * Maximum allowed future timestamp offset (24 hours in milliseconds).
 * Allows timestamps up to 1 day in the future for clock skew tolerance.
 */
const MAX_FUTURE_TIMESTAMP_OFFSET = 86_400_000;

/**
 * Type predicate for checking if value has multiple properties.
 */
export function hasProperties<K extends PropertyKey>(
    value: unknown,
    properties: readonly K[]
): value is Record<K, unknown> {
    return isObject(value) && properties.every((prop) => Object.hasOwn(value, prop));
}

/**
 * Type predicate for checking if value has a specific property.
 */
/**
 * Type predicate for checking if value has a specific property.
 *
 * @param value - Value to check for property existence
 * @param property - Property key to check for
 * @returns True if value is an object and has the specified property
 */
export function hasProperty<K extends PropertyKey>(value: unknown, property: K): value is Record<K, unknown> {
    return isObject(value) && Object.hasOwn(value, property);
}

/**
 * Type predicate for array values with optional item validation.
 *
 * @param value - Value to check for array type
 * @param itemValidator - Optional validator function for array items
 * @returns True if value is an array and all items pass validation (if provided)
 */
export function isArray<T = unknown>(value: unknown, itemValidator?: (item: unknown) => item is T): value is T[] {
    if (!Array.isArray(value)) {
        return false;
    }

    if (itemValidator) {
        return value.every(itemValidator);
    }

    return true;
}

/**
 * Type predicate for boolean values.
 *
 * @param value - Value to check for boolean type
 * @returns True if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

/**
 * Type predicate for Date instances.
 *
 * @param value - Value to check for Date type
 * @returns True if value is a valid Date instance (not Invalid Date)
 */
export function isDate(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime());
}

/**
 * Type predicate for Error instances.
 *
 * @param value - Value to check for Error type
 * @returns True if value is an Error instance
 */
export function isError(value: unknown): value is Error {
    return value instanceof Error;
}

/**
 * Type predicate for finite numbers (excludes Infinity and -Infinity).
 *
 * @param value - Value to check for finite number type
 * @returns True if value is a finite number (excludes NaN, Infinity, -Infinity)
 */
export function isFiniteNumber(value: unknown): value is number {
    return isNumber(value) && Number.isFinite(value);
}

/**
 * Type predicate for function values.
 *
 * @param value - Value to check for function type
 * @returns True if value is a function
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === "function";
}

/**
 * Type predicate for non-negative numbers.
 *
 * @param value - Value to check for non-negative number type
 * @returns True if value is a number greater than or equal to zero
 */
export function isNonNegativeNumber(value: unknown): value is number {
    return isNumber(value) && value >= 0;
}

/**
 * Type predicate for non-null object values.
 *
 * @param value - Value to check for non-null object type
 * @returns True if value is an object and not null
 *
 * @remarks
 * This is a convenience wrapper around isObject for cases where the
 * distinction from arrays and null needs to be explicit in the name.
 * Functionally equivalent to isObject but provides clearer intent.
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
    return isObject(value);
}

/**
 * Type predicate for number values (excludes NaN).
 *
 * @param value - Value to check for number type
 * @returns True if value is a number and not NaN
 */
export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Type predicate for object values (excludes null and arrays).
 *
 * @param value - Value to check for object type
 * @returns True if value is a plain object (not null, not array)
 *
 * @remarks
 * This function specifically excludes arrays and null values, returning only
 * true for plain objects. For objects that include arrays, use different validation.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Type predicate for positive numbers.
 *
 * @param value - Value to check for positive number type
 * @returns True if value is a number greater than zero
 */
export function isPositiveNumber(value: unknown): value is number {
    return isNumber(value) && value > 0;
}

/**
 * Type predicate for string values.
 *
 * @param value - Value to check for string type
 * @returns True if value is a string
 */
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

/**
 * Type predicate for valid port numbers.
 *
 * @param value - Value to check for valid port number
 * @returns True if value is an integer between 1 and 65535 (inclusive)
 */
export function isValidPort(value: unknown): value is number {
    return isNumber(value) && Number.isInteger(value) && value >= 1 && value <= 65_535;
}

/**
 * Type predicate for checking if value is a valid timestamp.
 *
 * @param value - Value to check for valid timestamp
 * @param now - Optional current time for testing (defaults to Date.now())
 * @returns True if value is a valid timestamp (positive number, not too far in future)
 *
 * @remarks
 * Validates timestamps to ensure they are positive and not unreasonably far in the future.
 * Allows timestamps up to 24 hours (86,400,000 ms) in the future to accommodate clock skew
 * between different systems, servers, or clients with slightly different system clocks.
 * This is particularly useful in distributed systems where perfect clock synchronization
 * cannot be guaranteed.
 *
 * The optional 'now' parameter allows for deterministic testing by providing a fixed
 * reference time instead of using the current system time.
 */
export function isValidTimestamp(value: unknown, now = Date.now()): value is number {
    return isNumber(value) && value > 0 && value <= now + MAX_FUTURE_TIMESTAMP_OFFSET;
}

/**
 * Type predicate for valid URL strings.
 *
 * @param value - Value to check for valid URL format
 * @returns True if value is a string that can be parsed as a valid URL
 *
 * @remarks
 * Uses the native URL constructor for validation, which accepts absolute URLs
 * and may allow various protocols (http, https, ftp, etc.) depending on the environment.
 * This validation throws and catches errors internally, so it may allow some URLs
 * that are technically valid but not suitable for all use cases. For stricter
 * HTTP/HTTPS-only validation, additional checks should be performed by the caller.
 *
 * Environment note: URL constructor behavior may vary between Node.js and browser environments.
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
