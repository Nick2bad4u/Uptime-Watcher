/**
 * Utilities for timeout conversion and validation.
 * Centralizes the logic for converting between seconds (UI) and milliseconds (backend).
 */

import { DEFAULT_REQUEST_TIMEOUT_SECONDS, TIMEOUT_CONSTRAINTS, TIMEOUT_CONSTRAINTS_MS } from "../constants";

/**
 * Clamp timeout to valid range in milliseconds.
 * @param timeoutMs - Timeout in milliseconds
 * @returns Clamped timeout in milliseconds
 */
export function clampTimeoutMs(timeoutMs: number): number {
    return Math.max(TIMEOUT_CONSTRAINTS_MS.MIN, Math.min(TIMEOUT_CONSTRAINTS_MS.MAX, timeoutMs));
}

/**
 * Clamp timeout to valid range in seconds.
 * @param timeoutSeconds - Timeout in seconds
 * @returns Clamped timeout in seconds
 */
export function clampTimeoutSeconds(timeoutSeconds: number): number {
    return Math.max(TIMEOUT_CONSTRAINTS.MIN, Math.min(TIMEOUT_CONSTRAINTS.MAX, timeoutSeconds));
}

/**
 * Get timeout in seconds from monitor, with default fallback.
 * @param monitorTimeout - Monitor timeout in milliseconds (optional)
 * @returns Timeout in seconds
 */
export function getTimeoutSeconds(monitorTimeout?: number): number {
    return monitorTimeout ? timeoutMsToSeconds(monitorTimeout) : DEFAULT_REQUEST_TIMEOUT_SECONDS;
}

/**
 * Validate timeout value in milliseconds.
 * @param timeoutMs - Timeout in milliseconds
 * @returns True if valid, false otherwise
 */
export function isValidTimeoutMs(timeoutMs: number): boolean {
    return timeoutMs >= TIMEOUT_CONSTRAINTS_MS.MIN && timeoutMs <= TIMEOUT_CONSTRAINTS_MS.MAX;
}

/**
 * Validate timeout value in seconds.
 * @param timeoutSeconds - Timeout in seconds
 * @returns True if valid, false otherwise
 */
export function isValidTimeoutSeconds(timeoutSeconds: number): boolean {
    return timeoutSeconds >= TIMEOUT_CONSTRAINTS.MIN && timeoutSeconds <= TIMEOUT_CONSTRAINTS.MAX;
}

/**
 * Convert timeout from milliseconds to seconds for UI display.
 * @param timeoutMs - Timeout in milliseconds
 * @returns Timeout in seconds (may include decimal places for precise conversion)
 *
 * @remarks
 * Performs direct division without rounding. For UI display where whole seconds
 * are preferred, consider using Math.round() or Math.floor() on the result.
 */
export function timeoutMsToSeconds(timeoutMs: number): number {
    return timeoutMs / 1000;
}

/**
 * Convert timeout from seconds to milliseconds for backend storage.
 * @param timeoutSeconds - Timeout in seconds (accepts fractional values)
 * @returns Timeout in milliseconds (result may be fractional if input has decimal places)
 *
 * @remarks
 * Performs direct multiplication without rounding. Fractional seconds are preserved
 * as fractional milliseconds. For whole millisecond values, ensure input is whole seconds.
 */
export function timeoutSecondsToMs(timeoutSeconds: number): number {
    return timeoutSeconds * 1000;
}
