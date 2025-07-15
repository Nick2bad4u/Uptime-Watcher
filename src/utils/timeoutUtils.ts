/**
 * Utilities for timeout conversion and validation.
 * Centralizes the logic for converting between seconds (UI) and milliseconds (backend).
 */

import { TIMEOUT_CONSTRAINTS, TIMEOUT_CONSTRAINTS_MS, DEFAULT_REQUEST_TIMEOUT_SECONDS } from "../constants";

/**
 * Convert timeout from milliseconds to seconds for UI display.
 * @param timeoutMs - Timeout in milliseconds
 * @returns Timeout in seconds
 */
export function timeoutMsToSeconds(timeoutMs: number): number {
    return timeoutMs / 1000;
}

/**
 * Convert timeout from seconds to milliseconds for backend storage.
 * @param timeoutSeconds - Timeout in seconds
 * @returns Timeout in milliseconds
 */
export function timeoutSecondsToMs(timeoutSeconds: number): number {
    return timeoutSeconds * 1000;
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
 * Validate timeout value in milliseconds.
 * @param timeoutMs - Timeout in milliseconds
 * @returns True if valid, false otherwise
 */
export function isValidTimeoutMs(timeoutMs: number): boolean {
    return timeoutMs >= TIMEOUT_CONSTRAINTS_MS.MIN && timeoutMs <= TIMEOUT_CONSTRAINTS_MS.MAX;
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
 * Clamp timeout to valid range in seconds.
 * @param timeoutSeconds - Timeout in seconds
 * @returns Clamped timeout in seconds
 */
export function clampTimeoutSeconds(timeoutSeconds: number): number {
    return Math.max(TIMEOUT_CONSTRAINTS.MIN, Math.min(TIMEOUT_CONSTRAINTS.MAX, timeoutSeconds));
}

/**
 * Clamp timeout to valid range in milliseconds.
 * @param timeoutMs - Timeout in milliseconds
 * @returns Clamped timeout in milliseconds
 */
export function clampTimeoutMs(timeoutMs: number): number {
    return Math.max(TIMEOUT_CONSTRAINTS_MS.MIN, Math.min(TIMEOUT_CONSTRAINTS_MS.MAX, timeoutMs));
}
