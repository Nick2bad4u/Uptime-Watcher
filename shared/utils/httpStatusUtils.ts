/**
 * Utilities for evaluating HTTP status codes in uptime monitoring.
 *
 * @remarks
 * Maps HTTP response codes to monitor status ("up" or "down") for use in
 * monitoring services. All logic is type-safe and concise. Provides helpers for
 * status evaluation and validation.
 *
 * @public
 *
 * @see {@link determineMonitorStatus}
 */

/**
 * Validates that a value is a valid HTTP status code (100–599).
 *
 * @remarks
 * Used internally to ensure only valid HTTP status codes are evaluated for
 * monitor status. Returns true for integer values in the 100–599 range.
 *
 * @param httpStatus - The HTTP status code to validate.
 *
 * @returns True if the code is a valid HTTP status code, false otherwise.
 *
 * @internal
 */
function isValidHttpStatus(httpStatus: number): boolean {
    return (
        Number.isInteger(httpStatus) && httpStatus >= 100 && httpStatus <= 599
    );
}

/**
 * Determines monitor status ("up", "degraded", or "down") from an HTTP status
 * code.
 *
 * @remarks
 * -
 *
 * 1xx–4xx: "up" (site is responding)
 *
 * - 5xx degraded errors: "degraded" (server responding but with issues)
 *
 *   - 501 Not Implemented
 *   - 505 HTTP Version Not Supported
 *   - 510 Not Extended
 * - 5xx server errors: "down" (server not functioning properly)
 *
 *   - 500 Internal Server Error
 *   - 502 Bad Gateway
 *   - 503 Service Unavailable
 *   - 504 Gateway Timeout
 *   - Others
 * - `<100` or `>599`: "down" (invalid code)
 *
 * Used by monitoring services to classify site health with three-state model.
 *
 * @example
 *
 * ```typescript
 * determineMonitorStatus(200); // "up"
 * determineMonitorStatus(404); // "up"
 * determineMonitorStatus(501); // "degraded"
 * determineMonitorStatus(500); // "down"
 * determineMonitorStatus(999); // "down"
 * ```
 *
 * @param httpStatus - The HTTP status code to evaluate (integer).
 *
 * @returns Up if the site is responding normally, "degraded" if responding
 *   certain server issues, "down" if server error or invalid code.
 *
 * @public
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status | MDN: HTTP response status codes}
 */
export function determineMonitorStatus(
    httpStatus: number
): "degraded" | "down" | "up" {
    // Input validation - HTTP status codes are defined in 100-599 range
    if (!isValidHttpStatus(httpStatus)) {
        return "down";
    }

    // 5xx server errors - distinguish between degraded and down
    if (httpStatus >= 500 && httpStatus < 600) {
        // These codes indicate server is responding but has issues (degraded)
        const degradedCodes = [
            501,
            505,
            510,
        ]; // Not Implemented, HTTP Version Not Supported, Not Extended

        if (degradedCodes.includes(httpStatus)) {
            return "degraded";
        }

        // All other 5xx codes indicate server problems (down)
        return "down";
    }

    // 1xx-4xx = responding normally (up)
    return "up";
}
