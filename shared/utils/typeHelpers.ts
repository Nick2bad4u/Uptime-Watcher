/**
 * Type-safe utility functions for common type manipulations.
 *
 * @remarks
 * These utilities provide type-safe alternatives to unsafe type assertions for
 * common patterns throughout the codebase. They centralize the necessary type
 * assertions with proper documentation and validation.
 *
 * @packageDocumentation
 */

import type { UnknownRecord } from "type-fest";

/**
 * Safely casts IPC response to expected type with basic validation.
 *
 * @remarks
 * Use this for IPC responses where we have a contract but can't guarantee
 * types. The validator provides additional runtime safety if provided.
 *
 * @param response - IPC response of unknown type
 * @param validator - Optional validation function
 *
 * @returns Response cast to expected type
 */
export function castIpcResponse<T>(
    response: unknown,
    validator?: (val: unknown) => val is T
): T {
    if (validator && !validator(response)) {
        throw new Error("IPC response validation failed");
    }

    // This assertion is necessary for IPC boundaries where TypeScript can't
    // verify types Runtime validation via validator parameter provides
    // additional safety

    return response as T;
}

/**
 * Safely checks if an unknown value is an array.
 *
 * @remarks
 * Type guard function for arrays. Use this to validate arrays before accessing
 * array methods.
 *
 * @param value - Value to check
 *
 * @returns True if value is an array, false otherwise
 */
export function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

/**
 * Safely checks if an unknown value is a record (object with string keys).
 *
 * @remarks
 * Type guard function for `UnknownRecord` types. Use this to validate
 * objects before accessing their properties.
 *
 * @param value - Value to check
 *
 * @returns True if value is a record, false otherwise
 */
export function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Safely extracts a property from an unknown object.
 *
 * @remarks
 * Provides safe property access from unknown objects without type assertions.
 * Returns undefined if object is not an object or property doesn't exist.
 *
 * @param obj - Unknown object to extract from
 * @param key - Property key to extract
 *
 * @returns Property value or undefined
 */
export function safePropertyAccess(obj: unknown, key: string): unknown {
    if (isRecord(obj) && key in obj) {
        return obj[key];
    }
    return undefined;
}

/**
 * Type-safe conversion from unknown to a specific type with validation.
 *
 * @remarks
 * Use this instead of direct type assertions when you can validate the type.
 * Provides runtime safety in addition to compile-time types.
 *
 * @param value - Unknown value to convert
 * @param validator - Validation function that returns true if value is of type
 *   T
 *
 * @returns Validated value of type T
 *
 * @throws Error if validation fails
 */
export function validateAndConvert<T>(
    value: unknown,
    validator: (val: unknown) => val is T,
    errorMessage?: string
): T {
    if (!validator(value)) {
        throw new Error(errorMessage ?? "Type validation failed");
    }
    return value;
}
