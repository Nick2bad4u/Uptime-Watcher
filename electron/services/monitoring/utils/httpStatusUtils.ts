/**
 * HTTP status code utilities for monitoring.
 * Provides logic for determining monitor status based on HTTP response codes.
 */

/**
 * Determine monitor status based on HTTP status code.
 *
 * Business rules:
 * - 2xx = success (up)
 * - 4xx = client error but site is responding (up)
 * - 5xx = server error (down)
 * - 3xx redirects or other unexpected codes (up - site is responding)
 */
export function determineMonitorStatus(httpStatus: number): "up" | "down" {
    // 2xx = success (up)
    if (httpStatus >= 200 && httpStatus < 300) {
        return "up";
    }

    // 4xx = client error but site is responding (up)
    if (httpStatus >= 400 && httpStatus < 500) {
        return "up";
    }

    // 5xx = server error (down)
    if (httpStatus >= 500) {
        return "down";
    }

    // 3xx redirects or other unexpected codes (up - site is responding)
    return "up";
}
