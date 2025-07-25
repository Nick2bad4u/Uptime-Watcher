/**
 * Utilities for evaluating HTTP status codes in uptime monitoring.
 *
 * @remarks
 * Maps HTTP response codes to monitor status ("up" or "down") for use in monitoring services. All logic is type-safe and concise.
 *
 * @see {@link determineMonitorStatus}
 * @public
 */

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
 *
 * @example
 * ```typescript
 * determineMonitorStatus(200); // "up"
 * determineMonitorStatus(404); // "up"
 * determineMonitorStatus(500); // "down"
 * determineMonitorStatus(999); // "down"
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status | MDN: HTTP response status codes}
 * @public
 */
export function determineMonitorStatus(httpStatus: number): "down" | "up" {
    // Input validation - HTTP status codes are defined in 100-599 range
    if (!Number.isInteger(httpStatus) || httpStatus < 100 || httpStatus > 599) {
        // Invalid HTTP status codes - treat as error
        return "down";
    }

    // 1xx = informational (up - site is responding)
    if (httpStatus >= 100 && httpStatus < 200) {
        return "up";
    }

    // 2xx = success (up)
    if (httpStatus >= 200 && httpStatus < 300) {
        return "up";
    }

    // 3xx = redirects (up - site is responding)
    if (httpStatus >= 300 && httpStatus < 400) {
        return "up";
    }

    // 4xx = client error but site is responding (up)
    if (httpStatus >= 400 && httpStatus < 500) {
        return "up";
    }

    // 5xx = server error (down)
    if (httpStatus >= 500 && httpStatus < 600) {
        return "down";
    }

    // Should never reach here due to input validation, but defensive programming
    return "down";
}
