import { isFinite as isFiniteNumber } from "ts-extras";

/**
 * Default interval (in milliseconds) applied to monitors when no value is
 * provided or when incoming data fails validation.
 *
 * @remarks
 * Serves as the shared minimum cadence for routine monitor execution across
 * renderer and Electron processes.
 *
 * @public
 */
export const DEFAULT_MONITOR_CHECK_INTERVAL_MS = 300_000;

/**
 * Minimum allowed interval (in milliseconds) for monitor checks.
 *
 * @remarks
 * Values below this threshold are considered invalid and should be clamped to
 * {@link DEFAULT_MONITOR_CHECK_INTERVAL_MS} or rejected by validation.
 *
 * @public
 */
export const MIN_MONITOR_CHECK_INTERVAL_MS = 5000;

/**
 * Maximum number of edge endpoints a CDN edge consistency monitor may check in
 * a single run.
 *
 * @remarks
 * Keeps one monitor from launching an unbounded number of parallel HTTP
 * requests when data is imported, restored, or manually edited outside the UI.
 *
 * @public
 */
export const MAX_CDN_EDGE_CONSISTENCY_ENDPOINTS = 20;

/**
 * Validation bounds shared by monitor forms, import/export remediation, local
 * monitor schemas, and cloud-sync canonical payloads.
 *
 * @public
 */
export interface MonitorValidationConstraints {
    readonly CHECK_INTERVAL: {
        readonly MAX: number;
        readonly MIN: number;
    };
    readonly RETRY_ATTEMPTS: {
        readonly MAX: number;
        readonly MIN: number;
    };
    readonly TIMEOUT: {
        readonly MAX: number;
        readonly MIN: number;
    };
}

export const MONITOR_VALIDATION_CONSTRAINTS: MonitorValidationConstraints = {
    CHECK_INTERVAL: {
        MAX: 2_592_000_000, // 30 days
        MIN: MIN_MONITOR_CHECK_INTERVAL_MS,
    },
    RETRY_ATTEMPTS: {
        MAX: 10,
        MIN: 0,
    },
    TIMEOUT: {
        MAX: 300_000,
        MIN: 1000,
    },
};

/**
 * Determines whether a monitor check interval requires remediation.
 *
 * @param interval - The interval value to evaluate.
 *
 * @returns `true` if the interval is missing, not a number, or is below
 *   {@link MIN_MONITOR_CHECK_INTERVAL_MS}; otherwise, `false`.
 */
export function shouldRemediateMonitorInterval(interval: unknown): boolean {
    if (typeof interval !== "number" || !isFiniteNumber(interval)) {
        return true;
    }

    return interval < MIN_MONITOR_CHECK_INTERVAL_MS;
}
