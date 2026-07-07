/**
 * Utilities for timeout conversion and validation.
 *
 * @remarks
 * Centralizes the logic for converting between seconds (UI) and milliseconds
 * (backend). Provides validation and clamping functions to ensure timeouts are
 * within acceptable ranges. The UI displays timeouts in seconds for better user
 * experience, while the backend uses milliseconds for precision in network
 * operations.
 *
 * @packageDocumentation
 */

import { isFinite as isFiniteNumber } from "ts-extras";

import {
    DEFAULT_REQUEST_TIMEOUT_SECONDS,
    TIMEOUT_CONSTRAINTS,
} from "../constants";

/**
 * Clamps timeout to valid range in seconds.
 *
 * @remarks
 * Ensures timeout values are within user-friendly bounds for UI display. Works
 * with second-based values that are more intuitive for users.
 *
 * @example
 *
 * ```typescript
 * const userInput = clampTimeoutSeconds(0.5); // Returns minimum valid timeout
 * const reasonable = clampTimeoutSeconds(30); // Returns 30 if within bounds
 * ```
 *
 * @param timeoutSeconds - Timeout value in seconds.
 *
 * @returns Clamped timeout value within valid range.
 *
 * @public
 */
export function clampTimeoutSeconds(timeoutSeconds: number): number {
    if (!isFiniteNumber(timeoutSeconds)) {
        return TIMEOUT_CONSTRAINTS.MIN;
    }

    return Math.max(
        TIMEOUT_CONSTRAINTS.MIN,
        Math.min(TIMEOUT_CONSTRAINTS.MAX, timeoutSeconds)
    );
}

/**
 * Gets timeout in seconds from monitor configuration with default fallback.
 *
 * @remarks
 * Provides a safe way to extract timeout values from monitor configurations.
 * Always returns a valid timeout value, using the system default when monitor
 * timeout is not specified.
 *
 * @example
 *
 * ```typescript
 * const timeout1 = getTimeoutSeconds(); // Returns default timeout
 * const timeout2 = getTimeoutSeconds(5000); // Returns 5 seconds
 * ```
 *
 * @param monitorTimeout - Monitor timeout in milliseconds (optional).
 *
 * @returns Timeout in seconds.
 *
 * @public
 */
export function getTimeoutSeconds(monitorTimeout?: number): number {
    if (
        typeof monitorTimeout !== "number" ||
        !isFiniteNumber(monitorTimeout) ||
        monitorTimeout <= 0
    ) {
        return DEFAULT_REQUEST_TIMEOUT_SECONDS;
    }

    return timeoutMsToSeconds(monitorTimeout);
}

/**
 * Converts timeout from milliseconds to seconds for UI display.
 *
 * @remarks
 * Performs direct division without rounding to preserve precision. For UI
 * display where whole seconds are preferred, consider using Math.round() or
 * Math.floor() on the result.
 *
 * @example
 *
 * ```typescript
 * const seconds = timeoutMsToSeconds(5000); // Returns 5
 * const precise = timeoutMsToSeconds(5500); // Returns 5.5
 * const rounded = Math.round(timeoutMsToSeconds(5500)); // Returns 6
 * ```
 *
 * @param timeoutMs - Timeout value in milliseconds.
 *
 * @returns Timeout value in seconds (may include decimal places).
 */
function timeoutMsToSeconds(timeoutMs: number): number {
    return timeoutMs / 1000;
}

/**
 * Converts timeout from seconds to milliseconds for backend storage.
 *
 * @remarks
 * Performs direct multiplication without rounding to preserve precision.
 * Fractional seconds are preserved as fractional milliseconds. For whole
 * millisecond values, ensure input is whole seconds.
 *
 * @example
 *
 * ```typescript
 * const ms = timeoutSecondsToMs(5); // Returns 5000
 * const precise = timeoutSecondsToMs(5.5); // Returns 5500
 * const fractional = timeoutSecondsToMs(0.1); // Returns 100
 * ```
 *
 * @param timeoutSeconds - Timeout value in seconds (accepts fractional values).
 *
 * @returns Timeout value in milliseconds (may be fractional).
 *
 * @public
 */
export function timeoutSecondsToMs(timeoutSeconds: number): number {
    return timeoutSeconds * 1000;
}
