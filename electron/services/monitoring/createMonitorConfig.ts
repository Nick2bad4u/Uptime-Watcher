import type { Monitor } from "@shared/types";

import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import { isValidInteger } from "@shared/validation/validatorUtils";
import { isDefined } from "ts-extras";

import {
    DEFAULT_CHECK_INTERVAL,
    DEFAULT_REQUEST_TIMEOUT,
} from "../../constants";
import { DEFAULT_RETRY_ATTEMPTS } from "./constants";

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
        resolveFiniteInteger(defaults.timeout) ?? DEFAULT_REQUEST_TIMEOUT;
    const fallbackTimeout =
        fallbackTimeoutCandidate > 0
            ? fallbackTimeoutCandidate
            : DEFAULT_REQUEST_TIMEOUT;

    const timeoutCandidate = resolveFiniteInteger(partial.timeout);
    const timeout =
        isDefined(timeoutCandidate) && timeoutCandidate > 0
            ? timeoutCandidate
            : fallbackTimeout;

    const fallbackRetryCandidate =
        resolveFiniteInteger(defaults.retryAttempts) ?? DEFAULT_RETRY_ATTEMPTS;
    const fallbackRetryAttempts =
        fallbackRetryCandidate >= 0
            ? Math.max(0, fallbackRetryCandidate)
            : DEFAULT_RETRY_ATTEMPTS;

    const retryCandidate = resolveFiniteInteger(partial.retryAttempts);
    const retryAttempts =
        isDefined(retryCandidate) && retryCandidate >= 0
            ? Math.max(0, retryCandidate)
            : fallbackRetryAttempts;

    const fallbackIntervalCandidate =
        resolveFiniteInteger(defaults.checkInterval) ?? DEFAULT_CHECK_INTERVAL;
    const normalizedFallbackInterval =
        fallbackIntervalCandidate > 0
            ? fallbackIntervalCandidate
            : DEFAULT_CHECK_INTERVAL;

    const intervalCandidate = resolveFiniteInteger(partial.checkInterval);
    const intervalSource =
        isDefined(intervalCandidate) && intervalCandidate > 0
            ? intervalCandidate
            : normalizedFallbackInterval;

    const checkInterval = Math.max(
        MIN_MONITOR_CHECK_INTERVAL_MS,
        intervalSource
    );

    return { checkInterval, retryAttempts, timeout };
}

function resolveFiniteInteger(source: unknown): number | undefined {
    if (typeof source === "number") {
        return Number.isSafeInteger(source) ? source : undefined;
    }

    if (typeof source === "string") {
        const trimmed = source.trim();
        if (!isValidInteger(trimmed)) {
            return undefined;
        }

        const parsed = Number.parseInt(trimmed, 10);
        return Number.isSafeInteger(parsed) ? parsed : undefined;
    }

    return undefined;
}
