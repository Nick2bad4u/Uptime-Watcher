/**
 * Type-safe utility functions for common type manipulations.
 *
 * @remarks
 * These utilities provide type-safe alternatives to unsafe type assertions
 * for common patterns throughout the codebase. They centralize the necessary
 * type assertions with proper documentation and validation.
 *
 * @packageDocumentation
 */

/**
 * Safely casts IPC response to expected type with basic validation.
 *
 * @param response - IPC response of unknown type
 * @param validator - Optional validation function
 * @returns Response cast to expected type
 *
 * @remarks
 * Use this for IPC responses where we have a contract but can't guarantee types.
 * The validator provides additional runtime safety if provided.
 */
export function castIpcResponse<T>(
    response: unknown,
    validator?: (val: unknown) => val is T
): T {
    if (validator && !validator(response)) {
        throw new Error("IPC response validation failed");
    }

    // This assertion is necessary for IPC boundaries where TypeScript can't verify types
    // Runtime validation via validator parameter provides additional safety

    return response as T;
}

/**
 * Safely checks if an unknown value is an array.
 *
 * @param value - Value to check
 * @returns True if value is an array, false otherwise
 *
 * @remarks
 * Type guard function for arrays.
 * Use this to validate arrays before accessing array methods.
 */
export function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

/**
 * Safely checks if an unknown value is a number.
 *
 * @param value - Value to check
 * @returns True if value is a number, false otherwise
 *
 * @remarks
 * Type guard function for numbers. Excludes NaN.
 */
export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !Number.isNaN(value);
}

/**
 * Safely checks if an unknown value is a record (object with string keys).
 *
 * @param value - Value to check
 * @returns True if value is a record, false otherwise
 *
 * @remarks
 * Type guard function for Record\<string, unknown\> types.
 * Use this to validate objects before accessing their properties.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Safely checks if an unknown value is a string.
 *
 * @param value - Value to check
 * @returns True if value is a string, false otherwise
 *
 * @remarks
 * Type guard function for strings.
 */
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

/**
 * Safely extracts a property from an unknown object.
 *
 * @param obj - Unknown object to extract from
 * @param key - Property key to extract
 * @returns Property value or undefined
 *
 * @remarks
 * Provides safe property access from unknown objects without type assertions.
 * Returns undefined if object is not an object or property doesn't exist.
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
 * @param value - Unknown value to convert
 * @param validator - Validation function that returns true if value is of type T
 * @returns Validated value of type T
 * @throws Error if validation fails
 *
 * @remarks
 * Use this instead of direct type assertions when you can validate the type.
 * Provides runtime safety in addition to compile-time types.
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
