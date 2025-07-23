/**
 * HTTP status code utilities for monitoring.
 * Provides logic for determining monitor status based on HTTP response codes.
 */

/**
 * Determine monitor status based on HTTP status code.
 *
 * @param httpStatus - HTTP status code to evaluate
 * @returns Monitor status: "up" if site is responding, "down" if server error or invalid code
 *
 * @remarks
 * Business rules for status determination:
 * - 1xx (Informational): "up" - rare but valid responses indicating server is active
 * - 2xx (Success): "up" - successful requests
 * - 3xx (Redirection): "up" - site is responding with redirects
 * - 4xx (Client Error): "up" - site is responding, client-side issue
 * - 5xx (Server Error): "down" - server-side issues indicate service problems
 * - Invalid codes (\< 100, \> 599): "down" - malformed or non-HTTP responses
 *
 * @example
 * ```typescript
 * determineMonitorStatus(200); // "up"
 * determineMonitorStatus(404); // "up" - site responding but resource not found
 * determineMonitorStatus(500); // "down" - server error
 * determineMonitorStatus(999); // "down" - invalid HTTP status code
 * ```
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
