import type { Monitor } from "@shared/types";

import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";

import {
    DEFAULT_CHECK_INTERVAL,
    DEFAULT_REQUEST_TIMEOUT,
} from "../../constants";
import { DEFAULT_RETRY_ATTEMPTS } from "./constants";

function resolveFiniteNumber(source: unknown): number | undefined {
    if (typeof source === "number") {
        return Number.isFinite(source) ? source : undefined;
    }

    if (typeof source === "string") {
        const trimmed = source.trim();
        if (trimmed.length === 0) {
            return undefined;
        }

        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
}

/**
 * Normalized configuration values resolved for a monitor instance.
 *
 * @public
 */
export interface NormalizedMonitorConfig {
    /** Interval (in milliseconds) between monitor executions. */
    checkInterval: number;
    /** Number of retry attempts permitted before surfacing failure. */
    retryAttempts: number;
    /** Timeout (in milliseconds) applied to monitor execution. */
    timeout: number;
}

/**
 * Normalize effective monitor configuration by merging partial monitor fields
 * with service defaults and enforcing invariants.
 *
 * @param partial - Monitor properties that may include overrides for timeout,
 *   retry attempts, or check interval.
 * @param defaults - Optional fallback values supplied by the caller (typically
 *   service-level configuration) used when the monitor omits overrides.
 *
 * @returns Fully normalized configuration containing timeout, retry attempts,
 *   and check interval values guaranteed to satisfy baseline constraints.
 */
export function createMonitorConfig(
    partial: Partial<Monitor>,
    defaults: Partial<NormalizedMonitorConfig> = {}
): NormalizedMonitorConfig {
    const fallbackTimeoutCandidate =
        resolveFiniteNumber(defaults.timeout) ?? DEFAULT_REQUEST_TIMEOUT;
    const fallbackTimeout =
        fallbackTimeoutCandidate > 0
            ? Math.trunc(fallbackTimeoutCandidate)
            : DEFAULT_REQUEST_TIMEOUT;

    const timeoutCandidate = resolveFiniteNumber(partial.timeout);
    const timeout =
        timeoutCandidate !== undefined && timeoutCandidate > 0
            ? Math.trunc(timeoutCandidate)
            : fallbackTimeout;

    const fallbackRetryCandidate =
        resolveFiniteNumber(defaults.retryAttempts) ?? DEFAULT_RETRY_ATTEMPTS;
    const fallbackRetryAttempts =
        fallbackRetryCandidate >= 0
            ? Math.max(0, Math.trunc(fallbackRetryCandidate))
            : DEFAULT_RETRY_ATTEMPTS;

    const retryCandidate = resolveFiniteNumber(partial.retryAttempts);
    const retryAttempts =
        retryCandidate !== undefined && retryCandidate >= 0
            ? Math.max(0, Math.trunc(retryCandidate))
            : fallbackRetryAttempts;

    const fallbackIntervalCandidate =
        resolveFiniteNumber(defaults.checkInterval) ?? DEFAULT_CHECK_INTERVAL;
    const normalizedFallbackInterval =
        fallbackIntervalCandidate > 0
            ? Math.trunc(fallbackIntervalCandidate)
            : DEFAULT_CHECK_INTERVAL;

    const intervalCandidate = resolveFiniteNumber(partial.checkInterval);
    const intervalSource =
        intervalCandidate !== undefined && intervalCandidate > 0
            ? intervalCandidate
            : normalizedFallbackInterval;

    const checkInterval = Math.max(
        MIN_MONITOR_CHECK_INTERVAL_MS,
        Math.trunc(intervalSource)
    );

    return { checkInterval, retryAttempts, timeout };
}
