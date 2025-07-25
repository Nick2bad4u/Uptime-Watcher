/**
 * Type-safe conversion utilities for handling user input and data transformation.
 * Provides safe alternatives to parseInt, parseFloat, Number(), etc.
 */

import { isNumber, isString } from "./typeGuards";

/**
 * Maximum allowed future timestamp offset (24 hours in milliseconds).
 * Allows timestamps up to 1 day in the future for clock skew tolerance.
 */
const MAX_FUTURE_TIMESTAMP_OFFSET = 86_400_000;

/**
 * Safely converts any value to a number with fallback.
 *
 * @param value - The value to convert to a number
 * @param defaultValue - Default value to return if conversion fails (defaults to 0)
 * @returns The converted number or the default value
 *
 * @remarks
 * This function provides type-safe number conversion that handles both numeric values
 * and string representations of numbers. It uses Number() for string conversion which
 * handles decimal values and scientific notation properly.
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
 *
 * @param value - The value to convert to a check interval
 * @param defaultValue - Default interval in milliseconds (defaults to 300,000ms = 5 minutes)
 * @returns A valid check interval (minimum 1000ms) or the default value
 *
 * @remarks
 * Ensures the check interval is at least 1000ms (1 second) to prevent excessive
 * monitoring frequency that could impact performance or trigger rate limits.
 */
export function safeParseCheckInterval(value: unknown, defaultValue = 300_000): number {
    const parsed = safeNumberConversion(value, defaultValue);
    return parsed >= 1000 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a float with fallback.
 *
 * @param value - The value to convert to a float
 * @param defaultValue - Default value to return if conversion fails (defaults to 0)
 * @returns The converted float value or the default value
 *
 * @remarks
 * Uses parseFloat for string conversion which handles decimal values and scientific notation.
 * For number inputs, returns the value as-is (including integers as valid floats).
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
 * @param value - The value to convert to an integer
 * @param defaultValue - Default value to return if conversion fails (defaults to 0)
 * @returns The converted integer value or the default value
 *
 * @remarks
 * For number inputs, uses Math.floor() to convert to integer if not already an integer.
 * For string inputs, uses parseInt with base 10 for consistent parsing behavior.
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
 * @param value - The value to convert to a percentage
 * @param defaultValue - Default percentage value (defaults to 0)
 * @returns A percentage value clamped between 0 and 100
 *
 * @remarks
 * Automatically clamps the result to the valid percentage range of 0-100.
 * Values below 0 are set to 0, values above 100 are set to 100.
 */
export function safeParsePercentage(value: unknown, defaultValue = 0): number {
    const parsed = safeParseFloat(value, defaultValue);
    return Math.max(0, Math.min(100, parsed));
}

/**
 * Safely converts a value to a port number (1-65535) with fallback.
 *
 * @param value - The value to convert to a port number
 * @param defaultValue - Default port number (defaults to 80)
 * @returns A valid port number (1-65535) or the default value
 *
 * @remarks
 * Validates the port number is within the valid TCP/UDP port range (1-65535).
 * Port 0 is reserved and not allowed. Values outside the valid range return the default.
 */
export function safeParsePort(value: unknown, defaultValue = 80): number {
    const parsed = safeParseInt(value, defaultValue);
    return parsed >= 1 && parsed <= 65_535 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a positive integer with fallback.
 *
 * @param value - The value to convert to a positive integer
 * @param defaultValue - Default positive integer (defaults to 1)
 * @returns A positive integer (greater than 0) or the default value
 *
 * @remarks
 * Ensures the result is strictly greater than 0. Zero and negative values
 * are rejected and the default value is returned instead.
 */
export function safeParsePositiveInt(value: unknown, defaultValue = 1): number {
    const result = safeParseInt(value, defaultValue);
    return result > 0 ? result : defaultValue;
}

/**
 * Safely converts a value to a retry attempts count (0-10) with fallback.
 *
 * @param value - The value to convert to retry attempts
 * @param defaultValue - Default retry attempts count (defaults to 3)
 * @returns A valid retry attempts count (0-10) or the default value
 *
 * @remarks
 * Clamps retry attempts to a reasonable range of 0-10 to prevent excessive
 * retry loops that could impact performance. Zero attempts means no retries.
 */
export function safeParseRetryAttempts(value: unknown, defaultValue = 3): number {
    const parsed = safeParseInt(value, defaultValue);
    return parsed >= 0 && parsed <= 10 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a timeout value (positive number) with fallback.
 *
 * @param value - The value to convert to a timeout
 * @param defaultValue - Default timeout in milliseconds (defaults to 10,000ms = 10 seconds)
 * @returns A positive timeout value or the default value
 *
 * @remarks
 * Ensures the timeout is positive to prevent infinite waits or invalid timeout values.
 * Zero and negative values are rejected and the default value is returned.
 */
export function safeParseTimeout(value: unknown, defaultValue = 10_000): number {
    const parsed = safeNumberConversion(value, defaultValue);
    return parsed > 0 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a timestamp with fallback.
 *
 * @param value - The value to convert to a timestamp
 * @param defaultValue - Default timestamp in milliseconds (defaults to current time)
 * @returns A valid timestamp or the default value
 *
 * @remarks
 * Validates timestamps to ensure they are positive and not unreasonably far in the future.
 * Allows timestamps up to 24 hours in the future to accommodate clock skew between systems.
 * This is useful for handling timestamps from different servers or clients with slightly
 * different system clocks.
 */
export function safeParseTimestamp(value: unknown, defaultValue?: number): number {
    const fallback = defaultValue ?? Date.now();
    const parsed = safeNumberConversion(value, fallback);

    // Basic timestamp validation (must be positive and reasonable)
    return parsed > 0 && parsed <= Date.now() + MAX_FUTURE_TIMESTAMP_OFFSET ? parsed : fallback;
}
