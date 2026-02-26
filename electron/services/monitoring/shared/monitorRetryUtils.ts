/**
 * Shared retry attempt normalization helpers for monitoring.
 *
 * @remarks
 * Monitoring configuration typically expresses retries as **additional
 * attempts** after the initial check (e.g. `retryAttempts = 0` means "try
 * once").
 *
 * Several retry wrappers (notably {@link withOperationalHooks}) expect a **total
 * attempt count** instead. This module provides small, explicit helpers to
 * avoid duplicating the same normalization logic across monitors.
 */

/**
 * Normalizes an "additional retries" value into a safe, non-negative integer.
 *
 * @remarks
 * - Non-finite numbers (NaN/Infinity) are treated as `0`.
 * - Values are truncated and clamped to a minimum of `0`.
 */
export function normalizeAdditionalRetryAttempts(value: unknown): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.trunc(value));
}

/**
 * Normalized retry plan for monitor checks.
 *
 * @public
 */
export interface MonitorRetryPlan {
    /** Number of additional retries after the initial attempt. */
    readonly additionalRetries: number;
    /** Total number of attempts (initial + retries). */
    readonly totalAttempts: number;
}

/**
 * Converts an "additional retries" value into a total attempt count.
 *
 * @remarks
 * Example: `additionalRetries = 3` becomes `totalAttempts = 4`.
 */
export function toTotalAttempts(additionalRetries: unknown): number {
    return normalizeAdditionalRetryAttempts(additionalRetries) + 1;
}

/**
 * Builds a normalized retry plan for monitor checks.
 *
 * @remarks
 * Example: `additionalRetries = 3` becomes `{ additionalRetries: 3,
 * totalAttempts: 4 }`.
 *
 * @public
 */
export function createMonitorRetryPlan(
    additionalRetries: unknown
): MonitorRetryPlan {
    const normalizedRetries =
        normalizeAdditionalRetryAttempts(additionalRetries);

    return {
        additionalRetries: normalizedRetries,
        totalAttempts: toTotalAttempts(normalizedRetries),
    };
}
