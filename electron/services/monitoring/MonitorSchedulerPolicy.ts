import { randomInt } from "node:crypto";

import { MIN_CHECK_INTERVAL } from "./constants";

const JITTER_PERCENTAGE = 0.1;

// Backoff must be able to exceed typical monitoring intervals; otherwise
// repeated failures won't slow down and can amplify provider throttling or
// local resource contention.
//
// NOTE: This is a global cap. The effective cap is `max(baseIntervalMs, cap)`
// so user-configured intervals are never reduced by the backoff logic.
const MAX_BACKOFF_DELAY_MS = 60 * 60_000; // 60 minutes

type RandomInt = (min: number, max: number) => number;

export interface MonitorSchedulerDelayInput {
    readonly backoffAttempt: number;
    readonly baseIntervalMs: number;
}

/**
 * Applies bounded jitter around a target delay while respecting the scheduler
 * minimum.
 */
export function applySchedulerJitter(
    value: number,
    getRandomInt: RandomInt = randomInt
): number {
    if (value <= 0) {
        return MIN_CHECK_INTERVAL;
    }

    const jitterRange = Math.max(1, Math.round(value * JITTER_PERCENTAGE));
    const jitterOffset = getRandomInt(0, jitterRange * 2 + 1) - jitterRange;
    return Math.max(MIN_CHECK_INTERVAL, value + jitterOffset);
}

/**
 * Computes the next scheduler delay from base interval and backoff state.
 */
export function computeMonitorSchedulerDelay(
    input: MonitorSchedulerDelayInput,
    getRandomInt: RandomInt = randomInt
): number {
    const backoffMultiplier = 2 ** input.backoffAttempt;

    // Never reduce the user-configured base interval by applying a global cap
    // that is smaller than it.
    const maxDelayMs = Math.max(input.baseIntervalMs, MAX_BACKOFF_DELAY_MS);
    const targetInterval = Math.min(
        input.baseIntervalMs * backoffMultiplier,
        maxDelayMs
    );

    return applySchedulerJitter(targetInterval, getRandomInt);
}
