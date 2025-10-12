import type { UnknownRecord } from "type-fest";

/**
 * Checks whether a value is a non-null object excluding arrays.
 *
 * @remarks
 * Arrays are explicitly rejected so the guard can be safely used for record
 * inputs without further refinement.
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is a non-null object; otherwise `false`.
 */
export function isObject(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Checks whether a value is a `number` excluding `NaN`.
 *
 * @remarks
 * This guard considers both positive and negative infinity as numbers. Use
 * {@link isFiniteNumber} when infinities should be rejected.
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is a number and not `NaN`.
 */
export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Verifies that a value exposes a set of own properties.
 *
 * @remarks
 * Uses {@link Object.hasOwn} to avoid prototype traversal.
 *
 * @example
 *
 * ```ts
 * if (hasProperties(obj, ["foo", "bar"])) {
 *     // obj has both 'foo' and 'bar'
 * }
 * ```
 *
 * @typeParam K - Property keys that must exist on the value.
 *
 * @param value - Value to evaluate as an object.
 * @param properties - Property names that must be present on the value.
 *
 * @returns `true` when the value is an object containing every property.
 */
export function hasProperties<K extends PropertyKey>(
    value: unknown,
    properties: readonly K[]
): value is Record<K, unknown> {
    return (
        isObject(value) &&
        properties.every((prop) => Object.hasOwn(value, prop))
    );
}

/**
 * Checks if a value exposes a specific own property.
 *
 * @example
 *
 * ```ts
 * if (hasProperty(obj, "foo")) {
 *     // obj has the 'foo' property
 * }
 * ```
 *
 * @typeParam K - Property key that must exist on the value.
 *
 * @param value - Value to evaluate as an object.
 * @param property - Property name that must be present on the value.
 *
 * @returns `true` when the property exists directly on the value.
 */
export function hasProperty<K extends PropertyKey>(
    value: unknown,
    property: K
): value is Record<K, unknown> {
    return isObject(value) && Object.hasOwn(value, property);
}

/**
 * Determines whether a value is an array and optionally validates each element.
 *
 * @example
 *
 * ```ts
 * if (isArray(arr, isString)) {
 *     // arr is string[]
 * }
 * ```
 *
 * @typeParam T - Element type enforced by the optional validator.
 *
 * @param value - Value to evaluate.
 * @param itemValidator - Optional guard applied to each array element.
 *
 * @returns `true` when the value is an array and all elements pass the guard.
 */
export function isArray<T = unknown>(
    value: unknown,
    itemValidator?: (item: unknown) => item is T
): value is T[] {
    if (!Array.isArray(value)) {
        return false;
    }

    if (itemValidator) {
        return value.every(itemValidator);
    }

    return true;
}

/**
 * Checks whether a value is a boolean.
 *
 * @example
 *
 * ```ts
 * if (isBoolean(flag)) {
 *     // flag is boolean
 * }
 * ```
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is `true` or `false`.
 */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

/**
 * Checks whether a value is a valid {@link Date} instance.
 *
 * @example
 *
 * ```ts
 * if (isDate(dateCandidate)) {
 *     // dateCandidate is a Date
 * }
 * ```
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is a `Date` with a finite timestamp.
 */
export function isDate(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime());
}

/**
 * Checks whether a value extends {@link Error}.
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is an Error instance.
 */
export function isError(value: unknown): value is Error {
    return value instanceof Error;
}

/**
 * Checks whether a value is a finite number.
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is a number and not infinite.
 */
export function isFiniteNumber(value: unknown): value is number {
    return isNumber(value) && Number.isFinite(value);
}

/**
 * Checks whether a value is callable.
 *
 * @example
 *
 * ```ts
 * if (isFunction(fn)) {
 *     // fn is (...args: unknown[]) => unknown
 * }
 * ```
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is a function.
 */
export function isFunction(
    value: unknown
): value is (...args: unknown[]) => unknown {
    return typeof value === "function";
}

/**
 * Checks whether a value is a non-negative number.
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is a number greater than or equal to zero.
 */
export function isNonNegativeNumber(value: unknown): value is number {
    return isNumber(value) && !Number.isNaN(value) && value >= 0;
}

/**
 * Checks whether a value is an object that is not `null`.
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is a non-null object.
 */
export function isNonNullObject(value: unknown): value is UnknownRecord {
    return isObject(value);
}

/**
 * Checks whether a value is a positive number.
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is greater than zero.
 */
export function isPositiveNumber(value: unknown): value is number {
    return isNumber(value) && !Number.isNaN(value) && value > 0;
}

/**
 * Checks whether a value is a string.
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is of type `string`.
 */
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

/**
 * Checks whether a value falls within the valid TCP/UDP port range.
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is an integer between 1 and 65,535.
 */
export function isValidPort(value: unknown): value is number {
    return (
        isNumber(value) &&
        Number.isInteger(value) &&
        value >= 1 &&
        value <= 65_535
    );
}

/**
 * Checks whether a value represents a realistic Unix timestamp.
 *
 * @remarks
 * Accepts timestamps expressed in either seconds or milliseconds and permits
 * values up to 24 hours ahead of the current time.
 *
 * @param value - Value to evaluate.
 *
 * @returns `true` when the value is a positive number within the allowed range.
 */
export function isValidTimestamp(value: unknown): value is number {
    if (!isNumber(value) || value <= 0) {
        return false;
    }

    // Allow timestamps up to 1 day (86400000ms) in the future
    const maxFutureTimestamp = Date.now() + 86_400_000;
    return value <= maxFutureTimestamp;
}
