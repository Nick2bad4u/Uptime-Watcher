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
 * - For objects that can't be JSON serialized, uses custom toString() if available
 * - Provides meaningful fallbacks for functions, symbols, and other types
 * - Never returns '[object Object]' - uses descriptive placeholders instead
 *
 * This approach completely avoids the '[object Object]' issue by providing
 * meaningful string representations for all value types.
 *
 * @example
 * ```typescript
 * safeStringify(null) // ""
 * safeStringify("hello") // "hello"
 * safeStringify(42) // "42"
 * safeStringify({a: 1}) // '{"a":1}'
 * safeStringify(() => {}) // "[Function]"
 * safeStringify(Symbol("test")) // "Symbol(test)"
 * const circular = {}; circular.self = circular;
 * safeStringify(circular) // "[Object]" (for circular references)
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
            // Fallback for objects that can't be JSON serialized (e.g., circular references)
            // Use a safer approach than String(value) which produces '[object Object]'
            if (value && typeof value.toString === "function" && value.toString !== Object.prototype.toString) {
                try {
                    return value.toString();
                } catch {
                    return "[Complex Object]";
                }
            }
            return "[Object]";
        }
    }

    // Handle remaining types (functions, symbols, etc.) without '[object Object]'
    if (typeof value === "function") {
        return "[Function]";
    }
    if (typeof value === "symbol") {
        return value.toString();
    }

    // Final fallback for any other types
    return "[Unknown Type]";
}
