/**
 * Utilities for evaluating HTTP status codes in uptime monitoring.
 *
 * @remarks
 * Maps HTTP response codes to monitor status ("up" or "down") for use in monitoring services. All logic is type-safe and concise. Provides helpers for status evaluation and validation.
 *
 * @see {@link determineMonitorStatus}
 * @public
 */

/**
 * Validates that a value is a valid HTTP status code (100–599).
 *
 * @remarks
 * Used internally to ensure only valid HTTP status codes are evaluated for monitor status. Returns true for integer values in the 100–599 range.
 *
 * @param httpStatus - The HTTP status code to validate.
 * @returns True if the code is a valid HTTP status code, false otherwise.
 * @internal
 */
function isValidHttpStatus(httpStatus: number): boolean {
    return (
        Number.isInteger(httpStatus) && httpStatus >= 100 && httpStatus <= 599
    );
}

/**
 * Determines monitor status ("up" or "down") from an HTTP status code.
 *
 * @remarks
 * - 1xx–4xx: "up" (site is responding)
 * - 5xx: "down" (server error)
 * - \<100 or \>599: "down" (invalid code)
 * Used by monitoring services to classify site health.
 *
 * @param httpStatus - The HTTP status code to evaluate (integer).
 * @returns "up" if the site is responding (including client errors and redirects), "down" if server error or invalid code.
 * @example
 * ```typescript
 * determineMonitorStatus(200); // "up"
 * determineMonitorStatus(404); // "up"
 * determineMonitorStatus(500); // "down"
 * determineMonitorStatus(999); // "down"
 * ```
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status | MDN: HTTP response status codes}
 * @public
 */
export function determineMonitorStatus(httpStatus: number): "down" | "up" {
    // Input validation - HTTP status codes are defined in 100-599 range
    if (!isValidHttpStatus(httpStatus)) {
        return "down";
    }

    // 5xx = server error (down), all others are considered "up" (responding)
    return httpStatus >= 500 && httpStatus < 600 ? "down" : "up";
}
