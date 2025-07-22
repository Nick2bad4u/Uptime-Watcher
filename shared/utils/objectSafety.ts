/**
 * Type-safe object manipulation utilities.
 * Provides enhanced type safety for Object.keys, Object.values, Object.entries operations.
 */

import { isObject } from "./typeGuards";

/**
 * Type-safe object property access with fallback.
 *
 * @param obj - Object to access property from
 * @param key - Property key
 * @param fallback - Fallback value if property doesn't exist or is wrong type
 * @returns Property value or fallback
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
    key: number | string,
    fallback: T,
    typeValidator?: (value: unknown) => value is T
): T {
    if (!isObject(obj)) {
        return fallback;
    }

    if (!Object.hasOwn(obj, key)) {
        return fallback;
    }

    const value = obj[key];

    if (typeValidator) {
        return typeValidator(value) ? value : fallback;
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
 */
export function safeObjectIteration(
    obj: unknown,
    callback: (key: string, value: unknown) => void,
    context = "Safe object iteration"
): void {
    if (!isObject(obj)) {
        console.warn(`${context}: Expected object, got ${typeof obj}`);
        return;
    }

    try {
        for (const [key, value] of Object.entries(obj)) {
            callback(key, value);
        }
    } catch (error) {
        console.error(`${context} failed:`, error);
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
export function safeObjectOmit<T extends Record<PropertyKey, unknown>, K extends keyof T>(
    obj: T,
    keys: readonly K[]
): Omit<T, K> {
    const result = {
        ...obj,
    };

    for (const key of keys) {
        delete result[key];
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
export function safeObjectPick<T extends Record<PropertyKey, unknown>, K extends keyof T>(
    obj: T,
    keys: readonly K[]
): Pick<T, K> {
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
 * @example
 * ```typescript
 * const config = { timeout: 5000, retries: 3 } as const;
 * const entries = typedObjectEntries(config);
 * // Type: ["timeout" | "retries", number][]
 * ```
 */
export function typedObjectEntries<T extends Record<PropertyKey, unknown>>(obj: T): Array<[keyof T, T[keyof T]]> {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Type-safe Object.keys that preserves key types for known object shapes.
 *
 * @param obj - Object to get keys from
 * @returns Array of keys with proper typing
 *
 * @example
 * ```typescript
 * const config = { timeout: 5000, retries: 3 } as const;
 * const keys = typedObjectKeys(config);
 * // Type: ("timeout" | "retries")[]
 * ```
 */
export function typedObjectKeys<T extends Record<PropertyKey, unknown>>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}

/**
 * Type-safe Object.values that preserves value types for known object shapes.
 *
 * @param obj - Object to get values from
 * @returns Array of values with proper typing
 *
 * @example
 * ```typescript
 * const config = { timeout: 5000, retries: 3 } as const;
 * const values = typedObjectValues(config);
 * // Type: number[]
 * ```
 */
export function typedObjectValues<T extends Record<PropertyKey, unknown>>(obj: T): Array<T[keyof T]> {
    return Object.values(obj) as Array<T[keyof T]>;
}
