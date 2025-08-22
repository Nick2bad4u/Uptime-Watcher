/**
 * String conversion utilities for safe type conversion across the application.
 *
 * @remarks
 * Provides consistent and robust string conversion handling for database
 * operations, data mapping, and UI display. Ensures that all value types are
 * converted to meaningful string representations, avoiding ambiguous or
 * unhelpful outputs such as '[object Object]'.
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
 *
 * - Returns an empty string for `null` or `undefined`.
 * - Returns the value as-is if it is already a string.
 * - Converts numbers and booleans using `String()`.
 * - For objects, attempts to use {@link safeJsonStringifyWithFallback} for
 *   serialization. If serialization fails (e.g., circular references), returns
 *   a descriptive placeholder.
 * - For functions, returns the string `"[Function]"`.
 * - For symbols, returns the result of `Symbol.prototype.toString()`.
 * - For all other types, returns `"[Unknown Type]"`.
 *
 * This approach guarantees that the result is always a string and never the
 * ambiguous '[object Object]'. It is suitable for logging, UI display, and
 * database storage where type safety and clarity are required.
 *
 * @example
 *
 * ```typescript
 * safeStringify(null); // "null"
 * safeStringify("hello"); // "hello"
 * safeStringify(42); // "42"
 * safeStringify({ a: 1 }); // '{"a":1}'
 * safeStringify(() => {}); // "[Function]"
 * safeStringify(Symbol("test")); // "Symbol(test)"
 * const circular: any = {};
 * circular.self = circular;
 * safeStringify(circular); // "[Complex Object]"
 * ```
 *
 * @param value - The value to convert to a string. Can be any JavaScript type.
 *
 * @returns The string representation of the input value.
 *
 * @see {@link safeJsonStringifyWithFallback}
 */
export function safeStringify(value: unknown): string {
    // Handle null/undefined early
    if (value === null) {
        return "";
    }
    if (value === undefined) {
        return "";
    }

    // Handle each type explicitly to avoid redundant condition warnings
    switch (typeof value) {
        case "bigint": {
            return value.toString();
        }
        case "boolean": {
            return String(value);
        }
        case "function": {
            return "[Function]";
        }
        case "number": {
            return String(value);
        }
        case "object": {
            return safeJsonStringifyWithFallback(value, "[Complex Object]");
        }
        case "string": {
            return value;
        }
        case "symbol": {
            return value.toString();
        }
        case "undefined": {
            return "";
        }
        default: {
            return "[Unknown Type]";
        }
    }
}
