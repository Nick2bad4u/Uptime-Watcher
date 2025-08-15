/**
 * Type-safe conversion utilities for handling user input and data
 * transformation. Provides safe alternatives to parseInt, parseFloat, Number(),
 * etc.
 */

import { isNumber, isString } from "./typeGuards";

/**
 * Safely converts any value to a number with fallback.
 *
 * @remarks
 * Handles conversion from strings using Number() constructor, which supports
 * various formats including scientific notation, hexadecimal, and decimal.
 * Returns the default value for any value that cannot be converted to a valid
 * number.
 *
 * @example
 *
 * ```typescript
 * safeNumberConversion("123"); // 123
 * safeNumberConversion("12.34"); // 12.34
 * safeNumberConversion("invalid"); // 0
 * safeNumberConversion(null, 42); // 42
 * ```
 *
 * @param value - Value to convert (can be any type)
 * @param defaultValue - Fallback value if conversion fails (default: 0)
 *
 * @returns Valid number or the default value
 */
export function safeNumberConversion(value: unknown, defaultValue = 0): number {
    if (isNumber(value)) {
        return value;
    }

    if (isString(value)) {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? defaultValue : parsed;
    }

    return defaultValue;
}

/**
 * Safely converts a value to a check interval (minimum 1000ms) with fallback.
 */
export function safeParseCheckInterval(
    value: unknown,
    defaultValue = 300_000
): number {
    const parsed = safeNumberConversion(value, defaultValue);
    return parsed >= 1000 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a float with fallback.
 *
 * @remarks
 * Uses parseFloat() for string conversion, which stops parsing at the first
 * invalid character and returns the parsed portion. For non-string, non-number
 * values, returns the default value.
 *
 * @example
 *
 * ```typescript
 * safeParseFloat("123.45"); // 123.45
 * safeParseFloat("12.34px"); // 12.34
 * safeParseFloat("invalid"); // 0
 * safeParseFloat({}, 1.5); // 1.5
 * ```
 *
 * @param value - Value to convert to floating-point number
 * @param defaultValue - Fallback value if conversion fails (default: 0)
 *
 * @returns Valid floating-point number or the default value
 */
export function safeParseFloat(value: unknown, defaultValue = 0): number {
    if (isNumber(value)) {
        return value;
    }

    if (isString(value)) {
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? defaultValue : parsed;
    }

    return defaultValue;
}

/**
 * Safely converts a value to an integer with fallback.
 *
 * @remarks
 * For numbers, applies Math.floor() to ensure integer result. For strings, uses
 * parseInt() with base 10. Returns the default value for any value that cannot
 * be converted to a valid integer.
 *
 * @example
 *
 * ```typescript
 * safeParseInt("123"); // 123
 * safeParseInt("123.99"); // 123
 * safeParseInt(45.67); // 45
 * safeParseInt("invalid"); // 0
 * safeParseInt(null, 10); // 10
 * ```
 *
 * @param value - Value to convert to integer
 * @param defaultValue - Fallback value if conversion fails (default: 0)
 *
 * @returns Valid integer or the default value
 */
export function safeParseInt(value: unknown, defaultValue = 0): number {
    if (isNumber(value)) {
        return Number.isInteger(value) ? value : Math.floor(value);
    }

    if (isString(value)) {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? defaultValue : parsed;
    }

    return defaultValue;
}

/**
 * Safely converts a value to a percentage (0-100) with fallback.
 *
 * @remarks
 * First converts the value to a float, then clamps the result to the valid
 * percentage range of 0-100. Useful for progress indicators and completion
 * ratios.
 *
 * @example
 *
 * ```typescript
 * safeParsePercentage("75"); // 75
 * safeParsePercentage("150"); // 100 (clamped)
 * safeParsePercentage("-10"); // 0 (clamped)
 * safeParsePercentage("invalid"); // 0
 * ```
 *
 * @param value - Value to convert to percentage
 * @param defaultValue - Fallback value if conversion fails (default: 0)
 *
 * @returns Valid percentage clamped between 0 and 100, or the default value
 */
export function safeParsePercentage(value: unknown, defaultValue = 0): number {
    const parsed = safeParseFloat(value, defaultValue);
    return Math.max(0, Math.min(100, parsed));
}

/**
 * Safely converts a value to a port number (1-65535) with fallback.
 *
 * @remarks
 * Validates that the converted integer falls within the valid TCP/UDP port
 * range. Port 0 is reserved and not allowed. Returns the default value for any
 * value outside the valid range or that cannot be converted.
 *
 * @example
 *
 * ```typescript
 * safeParsePort("8080"); // 8080
 * safeParsePort("65536"); // 80 (out of range)
 * safeParsePort("0"); // 80 (invalid port)
 * safeParsePort("invalid"); // 80
 * ```
 *
 * @param value - Value to convert to port number
 * @param defaultValue - Fallback value if conversion fails (default: 80)
 *
 * @returns Valid port number in range 1-65535, or the default value
 */
export function safeParsePort(value: unknown, defaultValue = 80): number {
    const parsed = safeParseInt(value, defaultValue);
    return parsed >= 1 && parsed <= 65_535 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a positive integer with fallback.
 *
 * @remarks
 * Ensures the result is a positive integer greater than zero. Useful for
 * counts, IDs, and other values that must be positive. Zero and negative values
 * are considered invalid and will return the default.
 *
 * @example
 *
 * ```typescript
 * safeParsePositiveInt("5"); // 5
 * safeParsePositiveInt("0"); // 1 (not positive)
 * safeParsePositiveInt("-3"); // 1 (not positive)
 * safeParsePositiveInt("invalid"); // 1
 * ```
 *
 * @param value - Value to convert to positive integer
 * @param defaultValue - Fallback value if conversion fails (default: 1)
 *
 * @returns Valid positive integer `(> 0)`, or the default value
 */
export function safeParsePositiveInt(value: unknown, defaultValue = 1): number {
    const result = safeParseInt(value, defaultValue);
    return result > 0 ? result : defaultValue;
}

/**
 * Safely converts a value to a retry attempts count (0-10) with fallback.
 *
 * @remarks
 * Validates that the converted integer falls within a reasonable range for
 * retry attempts. Zero retries means no retries will be attempted. Values
 * outside the 0-10 range are considered unreasonable and will return the
 * default.
 *
 * @example
 *
 * ```typescript
 * safeParseRetryAttempts("3"); // 3
 * safeParseRetryAttempts("0"); // 0 (no retries)
 * safeParseRetryAttempts("15"); // 3 (out of range)
 * safeParseRetryAttempts("invalid"); // 3
 * ```
 *
 * @param value - Value to convert to retry attempts count
 * @param defaultValue - Fallback value if conversion fails (default: 3)
 *
 * @returns Valid retry attempts count between 0 and 10, or the default value
 */
export function safeParseRetryAttempts(
    value: unknown,
    defaultValue = 3
): number {
    const parsed = safeParseInt(value, defaultValue);
    return parsed >= 0 && parsed <= 10 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a timeout value (positive number) with fallback.
 *
 * @remarks
 * Ensures the result is a positive number suitable for timeout operations. Zero
 * and negative values are considered invalid for timeouts and will return the
 * default value. Accepts fractional values for sub-millisecond precision.
 *
 * @example
 *
 * ```typescript
 * safeParseTimeout("5000"); // 5000 (5 seconds)
 * safeParseTimeout("0"); // 10000 (invalid timeout)
 * safeParseTimeout("-1000"); // 10000 (negative timeout)
 * safeParseTimeout("invalid"); // 10000
 * ```
 *
 * @param value - Value to convert to timeout in milliseconds
 * @param defaultValue - Fallback value if conversion fails (default: 10000)
 *
 * @returns Valid positive timeout value in milliseconds, or the default value
 */
export function safeParseTimeout(
    value: unknown,
    defaultValue = 10_000
): number {
    const parsed = safeNumberConversion(value, defaultValue);
    return parsed > 0 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a timestamp with fallback.
 *
 * @remarks
 * Validates that the timestamp is positive and not unreasonably far in the
 * future (allows up to 1 day ahead to account for clock skew). Uses current
 * time as default when no defaultValue is provided. Useful for validating
 * timestamps from external sources.
 *
 * @example
 *
 * ```typescript
 * safeParseTimestamp("1640995200000"); // Valid timestamp
 * safeParseTimestamp("0"); // Current time (invalid)
 * safeParseTimestamp("-1000"); // Current time (negative)
 * const future = Date.now() + 86400000 * 2; // 2 days ahead
 * safeParseTimestamp(future.toString()); // Current time (too far in future)
 * ```
 *
 * @param value - Value to convert to timestamp
 * @param defaultValue - Fallback value if conversion fails (default: current
 *   time)
 *
 * @returns Valid timestamp in milliseconds, or the default value
 */
export function safeParseTimestamp(
    value: unknown,
    defaultValue?: number
): number {
    const fallback = defaultValue ?? Date.now();
    const parsed = safeNumberConversion(value, fallback);

    // Basic timestamp validation (must be positive and reasonable)
    return parsed > 0 && parsed <= Date.now() + 86_400_000 ? parsed : fallback;
}
