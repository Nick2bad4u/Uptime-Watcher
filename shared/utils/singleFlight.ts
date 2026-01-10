import type { Promisable } from "type-fest";

/**
 * Single-flight helper for deduplicating concurrent async work.
 *
 * @remarks
 * This utility wraps an async function so that only one invocation runs at a
 * time. Concurrent calls return the same in-flight promise until it settles.
 *
 * This is useful for:
 *
 * - Preventing expensive duplicated work (e.g. creating backups, refreshing
 *   caches),
 * - Mitigating amplification points (e.g. repeated UI/IPC triggers),
 * - Ensuring logically idempotent operations behave predictably under
 *   concurrency.
 *
 * It is intentionally **not** a rate limiter. Sequential calls still execute
 * normally.
 */

/**
 * Wrap an async function so that only one invocation runs at a time. Concurrent
 * calls return the in-flight promise.
 */
export function createSingleFlight<Args extends readonly unknown[], Result>(
    fn: (...args: Args) => Promisable<Result>
): (...args: Args) => Promise<Result> {
    let inFlight: Promise<Result> | undefined = undefined;

    return async (...args: Args): Promise<Result> => {
        // Ensure synchronous throws become a rejected promise so we can:
        // 1) share the same in-flight promise across concurrent callers, and
        // 2) always clear inFlight in the finally block.
        const invoke = async (): Promise<Result> => fn(...args);

        const current = inFlight ?? invoke();
        inFlight = current;
        try {
            return await current;
        } finally {
            if (inFlight === current) {
                inFlight = undefined;
            }
        }
    };
}
