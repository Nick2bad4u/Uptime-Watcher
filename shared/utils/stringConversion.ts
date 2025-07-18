/**
 * String conversion utilities for safe type conversion across the application.
 * Provides consistent string conversion handling for database operations and data mapping.
 */

/**
 * Safely convert a value to string, handling complex objects appropriately.
 * 
 * @param value - Value to convert to string
 * @returns String representation of the value
 * 
 * @remarks
 * This function provides safe string conversion that:
 * - Returns empty string for null/undefined values
 * - Preserves strings as-is
 * - Converts numbers and booleans using String()
 * - Uses JSON.stringify for objects when possible
 * - Falls back to String() conversion for edge cases
 * 
 * This approach avoids the '[object Object]' issue that SonarCloud flags
 * by using JSON.stringify for proper object serialization.
 * 
 * @example
 * ```typescript
 * safeStringify(null) // ""
 * safeStringify("hello") // "hello"
 * safeStringify(42) // "42"
 * safeStringify({a: 1}) // '{"a":1}'
 * ```
 */
export function safeStringify(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    if (typeof value === "object") {
        // For objects, try JSON.stringify for better representation
        // This avoids the '[object Object]' issue that SonarCloud flags
        try {
            return JSON.stringify(value);
        } catch {
            // Fallback to toString if JSON.stringify fails (e.g., circular references)
            return String(value);
        }
    }
    return String(value);
}
