/**
 * Shared timeout resolution helpers for monitoring.
 *
 * @remarks
 * Monitoring uses multiple timeout concepts:
 *
 * - A **base/request timeout**: how long the actual check should be allowed to
 *   run (e.g. HTTP request timeout).
 * - An **operation timeout**: includes additional buffer for cleanup and
 *   bookkeeping when using correlated operations.
 *
 * Manual/direct checks should generally use the base timeout (no extra buffer)
 * so a "30s timeout" does not become "35s" for user-initiated actions.
 */

import {
    DEFAULT_MONITOR_TIMEOUT_SECONDS,
    MONITOR_TIMEOUT_BUFFER_MS,
    SECONDS_TO_MS_MULTIPLIER,
} from "../constants";

function isValidTimeoutMs(value: unknown): value is number {
    return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0
    );
}

/**
 * Resolves the base timeout in milliseconds.
 */
export function resolveMonitorBaseTimeoutMs(timeoutMs?: number): number {
    if (isValidTimeoutMs(timeoutMs)) {
        return timeoutMs;
    }

    return DEFAULT_MONITOR_TIMEOUT_SECONDS * SECONDS_TO_MS_MULTIPLIER;
}

/**
 * Resolves the monitoring operation timeout (base timeout + cleanup buffer).
 */
export function resolveMonitorOperationTimeoutMs(timeoutMs?: number): number {
    return resolveMonitorBaseTimeoutMs(timeoutMs) + MONITOR_TIMEOUT_BUFFER_MS;
}
