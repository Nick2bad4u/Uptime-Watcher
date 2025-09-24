/**
 * Shared monitoring constants for interval management.
 *
 * @remarks
 * Defines the single source of truth for monitor interval defaults and
 * validation thresholds. Both the Electron backend and renderer should import
 * from this module to ensure consistency when normalizing monitor data.
 */

/**
 * Default interval (in milliseconds) applied to monitors when no value is
 * provided or when incoming data fails validation.
 */
export const DEFAULT_MONITOR_CHECK_INTERVAL_MS = 300_000;

/**
 * Minimum allowed interval (in milliseconds) for monitor checks.
 *
 * @remarks
 * Values below this threshold are considered invalid and should be clamped to
 * {@link DEFAULT_MONITOR_CHECK_INTERVAL_MS} or rejected by validation.
 */
export const MIN_MONITOR_CHECK_INTERVAL_MS = 5000;

/**
 * Determines whether a monitor check interval requires remediation.
 *
 * @param interval - The interval value to evaluate.
 *
 * @returns `true` if the interval is missing, not a finite positive number, or
 *   is below {@link MIN_MONITOR_CHECK_INTERVAL_MS}; otherwise, `false`.
 */
export function shouldRemediateMonitorInterval(interval: unknown): boolean {
    if (typeof interval !== "number" || Number.isNaN(interval)) {
        return true;
    }

    return interval < MIN_MONITOR_CHECK_INTERVAL_MS;
}
