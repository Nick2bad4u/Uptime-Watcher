/**
 * Type-safe object manipulation utilities.
 * Provides enhanced type safety for Object.keys, Object.values, Object.entries
 * operations.
 */

import { isObject } from "./typeGuards";

/**
 * Type-safe object property access with fallback.
 *
 * @param obj - Object to access property from
 * @param key - Property key (string or symbol only)
 * @param fallback - Fallback value if property doesn't exist or is wrong type
 * @param validator - Optional type guard function to validate the property value
 * @returns Property value or fallback
 *
 * @remarks
 * Only accepts string and symbol keys as these are the valid property key
 * types in JavaScript. Number keys are automatically converted to strings by
 * JavaScript, so use string keys directly to avoid confusion.
 *
 * @example
 * ```typescript
 * const config: unknown = { timeout: 5000 };
 * const timeout = safeObjectAccess(config, "timeout", 10000);
 * // Returns 5000 if timeout exists and is correct type, otherwise 10000
 * ```
 */
export function safeObjectAccess<T>(
    obj: unknown,
    key: PropertyKey,
    fallback: T,
    validator?: (value: unknown) => value is T
): T {
    if (!isObject(obj)) {
        return fallback;
    }

    if (!Object.hasOwn(obj, key)) {
        return fallback;
    }

    // Cast obj to Record type after validation for safe property access
    const typedObj = obj as Record<PropertyKey, unknown>;

    const value = typedObj[key];

    if (validator) {
        return validator(value) ? value : fallback;
    }

    // If no validator provided, check if value matches fallback type
    if (typeof value === typeof fallback) {
        return value as T;
    }

    return fallback;
}

/**
 * Safely iterate over object entries with type safety and error handling.
 *
 * @param obj - Object to iterate over (can be unknown)
 * @param callback - Function to call for each entry
 * @param context - Optional context for error logging
 * @returns void
 */
export function safeObjectIteration(
    obj: unknown,
    callback: (key: string, value: unknown) => void,
    context = "Safe object iteration"
): void {
    if (!isObject(obj)) {
        // Use basic console for shared utilities to avoid dependencies
        // This is acceptable in shared utilities that can't import loggers
        console.warn(`${context}: Expected object, got ${typeof obj}`);
        return;
    }

    try {
        for (const [key, value] of Object.entries(obj)) {
            // eslint-disable-next-line n/callback-return -- Callback doesn't need to return a value
            callback(key, value);
        }
    } catch (error) {
        // Use basic console for shared utilities to avoid dependencies
        console.error("Object iteration failed for context:", context, error);
    }
}

/**
 * Create a type-safe object with specified keys omitted.
 *
 * @param obj - Source object
 * @param keys - Keys to omit from the object
 * @returns New object without the specified keys
 *
 * @example
 * ```typescript
 * const user = { id: 1, name: "John", email: "john@example.com", password: "secret" };
 * const publicUser = safeObjectOmit(user, ["password"]);
 * // Type: { id: number; name: string; email: string; }
 * ```
 */
export function safeObjectOmit<
    T extends Record<PropertyKey, unknown>,
    K extends keyof T,
>(obj: T, keys: readonly K[]): Omit<T, K> {
    const keysToOmit = new Set(keys);

    // Handle both string/number keys and symbol keys
    const result = {} as Omit<T, K>;

    // Copy enumerable string/number properties
    for (const [key, value] of Object.entries(obj)) {
        if (!keysToOmit.has(key as K)) {
            (result as Record<PropertyKey, unknown>)[key] = value;
        }
    }

    // Copy symbol properties
    for (const symbol of Object.getOwnPropertySymbols(obj)) {
        if (!keysToOmit.has(symbol as K)) {
            (result as Record<PropertyKey, unknown>)[symbol] = obj[symbol];
        }
    }

    return result;
}

/**
 * Create a type-safe subset of an object with only specified keys.
 *
 * @param obj - Source object
 * @param keys - Keys to pick from the object
 * @returns New object with only the specified keys
 *
 * @example
 * ```typescript
 * const user = { id: 1, name: "John", email: "john@example.com", password: "secret" };
 * const publicUser = safeObjectPick(user, ["id", "name", "email"]);
 * // Type: { id: number; name: string; email: string; }
 * ```
 */
export function safeObjectPick<
    T extends Record<PropertyKey, unknown>,
    K extends keyof T,
>(obj: T, keys: readonly K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;

    for (const key of keys) {
        if (Object.hasOwn(obj, key)) {
            result[key] = obj[key];
        }
    }

    return result;
}

/**
 * Type-safe Object.entries that preserves key types for known object shapes.
 *
 * @param obj - Object to get entries from
 * @returns Array of [key, value] tuples with proper typing
 *
 * @remarks
 * This function uses type assertion to preserve compile-time type information.
 * The cast is safe for plain objects but should be used carefully with objects
 * that may have prototype pollution, non-enumerable properties, or symbol
 * keys. Object.entries() only returns enumerable string-keyed properties.
 *
 * @example
 * ```typescript
 * const config = { timeout: 5000, retries: 3 } as const;
 * const entries = typedObjectEntries(config);
 * // Type: ["timeout" | "retries", number][]
 * ```
 */
export function typedObjectEntries<T extends Record<PropertyKey, unknown>>(
    obj: T
): Array<[keyof T, T[keyof T]]> {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Type-safe Object.keys that preserves key types for known object shapes.
 *
 * @param obj - Object to get keys from
 * @returns Array of keys with proper typing
 *
 * @remarks
 * This function uses type assertion to preserve compile-time type information.
 * Note that Object.keys() only returns enumerable string-keyed properties,
 * so symbol keys are not included in the result. The cast assumes all keys
 * are of type keyof T, which is safe for plain objects but may not include
 * all possible keys for objects with symbol keys or inherited properties.
 *
 * @example
 * ```typescript
 * const config = { timeout: 5000, retries: 3 } as const;
 * const keys = typedObjectKeys(config);
 * // Type: ("timeout" | "retries")[]
 * ```
 */
export function typedObjectKeys<T extends Record<PropertyKey, unknown>>(
    obj: T
): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}

/**
 * Type-safe Object.values that preserves value types for known object shapes.
 *
 * @param obj - Object to get values from
 * @returns Array of values with proper typing
 *
 * @remarks
 * This function uses type assertion to preserve compile-time type information.
 * Object.values() only returns enumerable property values, so non-enumerable
 * properties and symbol-keyed properties are not included. The cast assumes
 * all values are of type T[keyof T], which is accurate for the enumerable
 * properties that Object.values() actually returns.
 *
 * @example
 * ```typescript
 * const config = { timeout: 5000, retries: 3 } as const;
 * const values = typedObjectValues(config);
 * // Type: number[]
 * ```
 */
export function typedObjectValues<T extends Record<PropertyKey, unknown>>(
    obj: T
): Array<T[keyof T]> {
    return Object.values(obj) as Array<T[keyof T]>;
}
