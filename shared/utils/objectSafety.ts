/**
 * Type-safe object manipulation utilities.
 *
 * @remarks
 * Provides enhanced type safety for Object.keys, Object.values, and
 * Object.entries operations with proper type checking and validation.
 */

import type { UnknownRecord, ValueOf } from "type-fest";

import { isObject } from "./typeGuards";
import { castUnchecked } from "./typeHelpers";

/**
 * Creates a null-prototype object with a specific compile-time shape.
 *
 * @remarks
 * This centralizes the only “unsafe” assertion needed for prototype-pollution
 * hardening so callers do not need their own eslint-disable comments.
 *
 * @public
 */
export function createNullPrototypeObject<T extends object>(shape?: T): T {
    if (shape) {
        // Touch the phantom parameter in a side-effect-free way so lints do not
        // treat it as unused.
        Object.keys(shape);
    }

    return castUnchecked<T>(Object.create(null));
}

/**
 * Type-safe object property access with fallback.
 *
 * @remarks
 * Only accepts string and symbol keys as these are the valid property key types
 * in JavaScript. Number keys are automatically converted to strings by
 * JavaScript, so use string keys directly to avoid confusion.
 *
 * @example
 *
 * ```typescript
 * const config: unknown = { timeout: 5000 };
 * const timeout = safeObjectAccess(config, "timeout", 10000);
 * // Returns 5000 if timeout exists and is correct type, otherwise 10000
 * ```
 *
 * @param obj - Object to access property from
 * @param key - Property key (string or symbol only)
 * @param fallback - Fallback value if property doesn't exist or is wrong type
 * @param validator - Optional type guard function to validate the property
 *   value
 *
 * @returns Property value or fallback
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

    const value = obj[key];

    if (validator) {
        return validator(value) ? value : fallback;
    }

    // If no validator provided, check if value matches fallback type
    if (typeof value === typeof fallback) {
        return castUnchecked<T>(value);
    }

    return fallback;
}

/**
 * Safely iterate over object entries with type safety and error handling.
 *
 * @param obj - Object to iterate over (can be unknown)
 * @param visitor - Function to call for each entry
 * @param context - Optional context for error logging
 *
 * @returns Void
 */
export function safeObjectIteration(
    obj: unknown,
    visitor: (key: string, value: unknown) => void,
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
            visitor(key, value);
        }
    } catch (error) {
        // Use basic console for shared utilities to avoid dependencies
        console.error("Object iteration failed for context:", context, error);
    }
}

/**
 * Create a type-safe object with specified keys omitted.
 *
 * @example
 *
 * ```typescript
 * const user = {
 *     id: 1,
 *     name: "John",
 *     email: "john@example.com",
 *     password: "secret",
 * };
 * const publicUser = safeObjectOmit(user, ["password"]);
 * // Type: { id: number; name: string; email: string; }
 * ```
 *
 * @param obj - Source object
 * @param keys - Keys to omit from the object
 *
 * @returns New object without the specified keys
 */
export interface SafeObjectOmit {
    /**
     * Omitting keys from a nullish input yields an empty object.
     */
    (
        obj: null | undefined,
        keys: readonly PropertyKey[]
    ): Record<string, never>;

    /**
     * Omits the provided keys from the object.
     */
    <T extends object, K extends keyof T>(
        obj: null | T | undefined,
        keys: readonly K[]
    ): Omit<T, K>;
}

function safeObjectOmitImpl<T extends object, K extends PropertyKey>(
    obj: null | T | undefined,
    keys: readonly K[]
): Omit<T, Extract<K, keyof T>> | Record<string, never> {
    // Handle null/undefined inputs by returning empty object
    if (obj === null || obj === undefined) {
        return createNullPrototypeObject<Record<string, never>>();
    }

    const stringKeysToOmit = new Set<string>();
    const symbolKeysToOmit = new Set<symbol>();

    for (const key of keys) {
        if (typeof key === "symbol") {
            symbolKeysToOmit.add(key);
        } else {
            stringKeysToOmit.add(String(key));
        }
    }

    // IMPORTANT: Use a null-prototype object and defineProperty to avoid
    // prototype-pollution edge cases such as "__proto__".
    //
    // - Assigning `result["__proto__"] = value` on a normal object can mutate
    //   the prototype instead of defining an own property.
    // - `Object.defineProperty` on a null-prototype object always defines an
    //   own property.
    //
    const result = createNullPrototypeObject<Omit<T, Extract<K, keyof T>>>();
    const record = castUnchecked<UnknownRecord>(obj);

    // Copy enumerable string/number properties
    for (const [key, value] of Object.entries(record)) {
        if (!stringKeysToOmit.has(key)) {
            Object.defineProperty(result, key, {
                configurable: true,
                enumerable: true,
                value,
                writable: true,
            });
        }
    }

    // Copy symbol properties
    for (const symbol of Object.getOwnPropertySymbols(obj)) {
        if (!symbolKeysToOmit.has(symbol)) {
            Object.defineProperty(result, symbol, {
                configurable: true,
                enumerable: true,
                value: record[symbol],
                writable: true,
            });
        }
    }

    return result;
}

export const safeObjectOmit: SafeObjectOmit =
    safeObjectOmitImpl as SafeObjectOmit;

/**
 * Create a type-safe subset of an object with only specified keys.
 *
 * @example
 *
 * ```typescript
 * const user = {
 *     id: 1,
 *     name: "John",
 *     email: "john@example.com",
 *     password: "secret",
 * };
 * const publicUser = safeObjectPick(user, ["id", "name", "email"]);
 * // Type: { id: number; name: string; email: string; }
 * ```
 *
 * @param obj - Source object
 * @param keys - Keys to pick from the object
 *
 * @returns New object with only the specified keys
 */
export function safeObjectPick<T extends UnknownRecord, K extends keyof T>(
    obj: T,
    keys: readonly K[]
): Pick<T, K> {
    // IMPORTANT: Use a null-prototype object and defineProperty to avoid
    // prototype-pollution edge cases such as "__proto__".
    //
    const result = createNullPrototypeObject<Pick<T, K>>();

    for (const key of keys) {
        if (Object.hasOwn(obj, key)) {
            Object.defineProperty(result, key, {
                configurable: true,
                enumerable: true,
                value: obj[key],
                writable: true,
            });
        }
    }

    return result;
}

/**
 * Type-safe Object.entries that preserves key types for known object shapes.
 *
 * @remarks
 * This function uses type assertion to preserve compile-time type information.
 * The cast is safe for plain objects but should be used carefully with objects
 * that may have prototype pollution, non-enumerable properties, or symbol keys.
 * Object.entries() only returns enumerable string-keyed properties.
 *
 * @example
 *
 * ```typescript
 * const config = { timeout: 5000, retries: 3 } as const;
 * const entries = typedObjectEntries(config);
 * // Type: ["timeout" | "retries", number][]
 * ```
 *
 * @param obj - Object to get entries from
 *
 * @returns Array of [key, value] tuples with proper typing
 */
export function typedObjectEntries<T extends UnknownRecord>(
    obj: T
): Array<[keyof T, ValueOf<T>]> {
    return castUnchecked<Array<[keyof T, ValueOf<T>]>>(Object.entries(obj));
}

/**
 * Type-safe Object.keys that preserves key types for known object shapes.
 *
 * @remarks
 * This function uses type assertion to preserve compile-time type information.
 * Note that Object.keys() only returns enumerable string-keyed properties, so
 * symbol keys are not included in the result. The cast assumes all keys are of
 * type keyof T, which is safe for plain objects but may not include all
 * possible keys for objects with symbol keys or inherited properties.
 *
 * @example
 *
 * ```typescript
 * const config = { timeout: 5000, retries: 3 } as const;
 * const keys = typedObjectKeys(config);
 * // Type: ("timeout" | "retries")[]
 * ```
 *
 * @param obj - Object to get keys from
 *
 * @returns Array of keys with proper typing
 */
export function typedObjectKeys<T extends UnknownRecord>(
    obj: T
): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}

/**
 * Type-safe Object.values that preserves value types for known object shapes.
 *
 * @remarks
 * This function uses type assertion to preserve compile-time type information.
 * Object.values() only returns enumerable property values, so non-enumerable
 * properties and symbol-keyed properties are not included. The cast assumes all
 * values are of type T[keyof T], which is accurate for the enumerable
 * properties that Object.values() actually returns.
 *
 * @example
 *
 * ```typescript
 * const config = { timeout: 5000, retries: 3 } as const;
 * const values = typedObjectValues(config);
 * // Type: number[]
 * ```
 *
 * @param obj - Object to get values from
 *
 * @returns Array of values with proper typing
 */
export function typedObjectValues<T extends UnknownRecord>(
    obj: T
): Array<ValueOf<T>> {
    return castUnchecked<Array<ValueOf<T>>>(Object.values(obj));
}
