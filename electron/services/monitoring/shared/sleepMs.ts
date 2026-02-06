/**
 * Minimal sleep helper for monitoring utilities.
 */

import { setTimeout as delay } from "node:timers/promises";

/**
 * Sleeps for the given duration.
 *
 * @remarks
 * Uses Node's `timers/promises` implementation so callers can optionally
 * provide an {@link AbortSignal} to abort the sleep.
 */
export async function sleepMs(
    durationMs: number,
    signal?: AbortSignal
): Promise<void> {
    const ms = Math.max(0, Math.trunc(durationMs));

    if (ms === 0) {
        return;
    }

    if (signal) {
        await delay(ms, undefined, { signal });
        return;
    }

    await delay(ms);
}
