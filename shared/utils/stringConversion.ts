/**
 * String conversion utilities for safe type conversion across the application.
 *
 * @remarks
 * Provides consistent and robust string conversion handling for database operations,
 * data mapping, and UI display. Ensures that all value types are converted to
 * meaningful string representations, avoiding ambiguous or unhelpful outputs such as
 * '[object Object]'.
 *
 * @see {@link safeStringify}
 */

import { safeJsonStringifyWithFallback } from "./jsonSafety";

/**
 * Safely converts any value to a string, handling all JavaScript types with
 * meaningful and predictable output.
 *
 * @remarks
 * This function provides comprehensive string conversion logic:
 * - Returns an empty string for `null` or `undefined`.
 * - Returns the value as-is if it is already a string.
 * - Converts numbers and booleans using `String()`.
 * - For objects, attempts to use {@link safeJsonStringifyWithFallback} for serialization.
 *   If serialization fails (e.g., circular references), returns a descriptive placeholder.
 * - For functions, returns the string `"[Function]"`.
 * - For symbols, returns the result of `Symbol.prototype.toString()`.
 * - For all other types, returns `"[Unknown Type]"`.
 *
 * This approach guarantees that the result is always a string and never the
 * ambiguous '[object Object]'. It is suitable for logging, UI display, and
 * database storage where type safety and clarity are required.
 *
 * @example
 * ```typescript
 * safeStringify(null); // ""
 * safeStringify("hello"); // "hello"
 * safeStringify(42); // "42"
 * safeStringify({ a: 1 }); // '{"a":1}'
 * safeStringify(() => {}); // "[Function]"
 * safeStringify(Symbol("test")); // "Symbol(test)"
 * const circular: any = {}; circular.self = circular;
 * safeStringify(circular); // "[Complex Object]"
 * ```
 *
 * @param value - The value to convert to a string. Can be any JavaScript type.
 * @returns The string representation of the input value.
 *
 * @see {@link safeJsonStringifyWithFallback}
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
        // For objects, use safe JSON stringify with comprehensive fallback handling
        return safeJsonStringifyWithFallback(value, "[Complex Object]");
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
