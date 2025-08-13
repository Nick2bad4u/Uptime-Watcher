/**
 * Utilities for timeout conversion and validation.
 *
 * @remarks
 * Centralizes the logic for converting between seconds (UI) and milliseconds
 * (backend). Provides validation and clamping functions to ensure timeouts are
 * within acceptable ranges. The UI displays timeouts in seconds for better
 * user experience, while the backend uses milliseconds for precision in
 * network operations.
 *
 * @packageDocumentation
 */

import {
    DEFAULT_REQUEST_TIMEOUT_SECONDS,
    TIMEOUT_CONSTRAINTS,
    TIMEOUT_CONSTRAINTS_MS,
} from "../constants";

/**
 * Clamps timeout to valid range in milliseconds.
 *
 * @remarks
 * Ensures timeout values are within system-defined bounds to prevent
 * extreme values that could cause performance issues or timeouts that
 * are too short to be useful.
 *
 * @param timeoutMs - Timeout value in milliseconds
 * @returns Clamped timeout value within valid range
 *
 * @example
 * ```typescript
 * const clamped = clampTimeoutMs(100); // Returns minimum valid timeout
 * const large = clampTimeoutMs(999999); // Returns maximum valid timeout
 * ```
 */
export function clampTimeoutMs(timeoutMs: number): number {
    return Math.max(
        TIMEOUT_CONSTRAINTS_MS.MIN,
        Math.min(TIMEOUT_CONSTRAINTS_MS.MAX, timeoutMs)
    );
}

/**
 * Clamps timeout to valid range in seconds.
 *
 * @remarks
 * Ensures timeout values are within user-friendly bounds for UI display.
 * Works with second-based values that are more intuitive for users.
 *
 * @param timeoutSeconds - Timeout value in seconds
 * @returns Clamped timeout value within valid range
 *
 * @example
 * ```typescript
 * const userInput = clampTimeoutSeconds(0.5); // Returns minimum valid timeout
 * const reasonable = clampTimeoutSeconds(30); // Returns 30 if within bounds
 * ```
 */
export function clampTimeoutSeconds(timeoutSeconds: number): number {
    return Math.max(
        TIMEOUT_CONSTRAINTS.MIN,
        Math.min(TIMEOUT_CONSTRAINTS.MAX, timeoutSeconds)
    );
}

/**
 * Converts timeout from milliseconds to seconds for UI display.
 *
 * @remarks
 * Performs direct division without rounding to preserve precision.
 * For UI display where whole seconds are preferred, consider using
 * Math.round() or Math.floor() on the result.
 *
 * @param timeoutMs - Timeout value in milliseconds
 * @returns Timeout value in seconds (may include decimal places)
 *
 * @example
 * ```typescript
 * const seconds = timeoutMsToSeconds(5000); // Returns 5
 * const precise = timeoutMsToSeconds(5500); // Returns 5.5
 * const rounded = Math.round(timeoutMsToSeconds(5500)); // Returns 6
 * ```
 */
export function timeoutMsToSeconds(timeoutMs: number): number {
    return timeoutMs / 1000;
}

/**
 * Gets timeout in seconds from monitor configuration with default fallback.
 *
 * @remarks
 * Provides a safe way to extract timeout values from monitor configurations.
 * Always returns a valid timeout value, using the system default when
 * monitor timeout is not specified.
 *
 * @param monitorTimeout - Monitor timeout in milliseconds (optional)
 * @returns Timeout in seconds
 *
 * @example
 * ```typescript
 * const timeout1 = getTimeoutSeconds(); // Returns default timeout
 * const timeout2 = getTimeoutSeconds(5000); // Returns 5 seconds
 * ```
 */
export function getTimeoutSeconds(monitorTimeout?: number): number {
    return monitorTimeout
        ? timeoutMsToSeconds(monitorTimeout)
        : DEFAULT_REQUEST_TIMEOUT_SECONDS;
}

/**
 * Validates timeout value in milliseconds.
 *
 * @remarks
 * Checks if a timeout value is within acceptable system bounds.
 * Used for backend validation before storing or using timeout values.
 *
 * @param timeoutMs - Timeout value in milliseconds
 * @returns True if the timeout is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = isValidTimeoutMs(5000); // true for 5 seconds
 * const isTooShort = isValidTimeoutMs(100); // false if below minimum
 * ```
 */
export function isValidTimeoutMs(timeoutMs: number): boolean {
    return (
        timeoutMs >= TIMEOUT_CONSTRAINTS_MS.MIN &&
        timeoutMs <= TIMEOUT_CONSTRAINTS_MS.MAX
    );
}

/**
 * Validates timeout value in seconds.
 *
 * @remarks
 * Checks if a timeout value is within acceptable user-facing bounds.
 * Used for UI validation before converting to milliseconds for storage.
 *
 * @param timeoutSeconds - Timeout value in seconds
 * @returns True if the timeout is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = isValidTimeoutSeconds(30); // true for 30 seconds
 * const isTooLong = isValidTimeoutSeconds(1000); // false if above maximum
 * ```
 */
export function isValidTimeoutSeconds(timeoutSeconds: number): boolean {
    return (
        timeoutSeconds >= TIMEOUT_CONSTRAINTS.MIN &&
        timeoutSeconds <= TIMEOUT_CONSTRAINTS.MAX
    );
}

/**
 * Converts timeout from seconds to milliseconds for backend storage.
 *
 * @remarks
 * Performs direct multiplication without rounding to preserve precision.
 * Fractional seconds are preserved as fractional milliseconds.
 * For whole millisecond values, ensure input is whole seconds.
 *
 * @param timeoutSeconds - Timeout value in seconds (accepts fractional values)
 * @returns Timeout value in milliseconds (may be fractional)
 *
 * @example
 * ```typescript
 * const ms = timeoutSecondsToMs(5); // Returns 5000
 * const precise = timeoutSecondsToMs(5.5); // Returns 5500
 * const fractional = timeoutSecondsToMs(0.1); // Returns 100
 * ```
 */
export function timeoutSecondsToMs(timeoutSeconds: number): number {
    return timeoutSeconds * 1000;
}
