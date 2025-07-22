/**
 * Comprehensive type guard utilities for enhanced type safety.
 * Centralizes type checking logic with proper TypeScript type predicates.
 */

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
export function hasProperty<K extends PropertyKey>(value: unknown, property: K): value is Record<K, unknown> {
    return isObject(value) && Object.hasOwn(value, property);
}

/**
 * Type predicate for array values with optional item validation.
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
 * Type predicate for boolean values.
 */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

/**
 * Type predicate for Date instances.
 */
export function isDate(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime());
}

/**
 * Type predicate for Error instances.
 */
export function isError(value: unknown): value is Error {
    return value instanceof Error;
}

/**
 * Type predicate for finite numbers (excludes Infinity and -Infinity).
 */
export function isFiniteNumber(value: unknown): value is number {
    return isNumber(value) && Number.isFinite(value);
}

/**
 * Type predicate for function values.
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === "function";
}

/**
 * Type predicate for non-negative numbers.
 */
export function isNonNegativeNumber(value: unknown): value is number {
    return isNumber(value) && value >= 0;
}

/**
 * Type predicate for non-null object values.
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
    return isObject(value);
}

/**
 * Type predicate for number values (excludes NaN).
 */
export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Type predicate for object values (excludes null and arrays).
 */
export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Type predicate for positive numbers.
 */
export function isPositiveNumber(value: unknown): value is number {
    return isNumber(value) && value > 0;
}

/**
 * Type predicate for string values.
 */
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

/**
 * Type predicate for valid port numbers.
 */
export function isValidPort(value: unknown): value is number {
    return isNumber(value) && Number.isInteger(value) && value >= 1 && value <= 65_535;
}

/**
 * Type predicate for checking if value is a valid timestamp.
 */
export function isValidTimestamp(value: unknown): value is number {
    return isNumber(value) && value > 0 && value <= Date.now() + 86_400_000; // Allow up to 1 day in future
}

/**
 * Type predicate for valid URL strings.
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
