/**
 * Single-flight helper for IPC handlers.
 *
 * Electron IPC endpoints are a common amplification point: a compromised
 * renderer can spam `invoke()` calls and force the main process to repeatedly
 * perform expensive work.
 *
 * This utility provides a lightweight mitigation by deduplicating concurrent
 * invocations. Callers receive the same in-flight promise until it settles.
 *
 * Notes:
 *
 * - This is NOT a rate limiter. Sequential calls still execute normally.
 * - Prefer using this only for idempotent or "best effort" operations.
 */

/**
 * Wrap an async function so that only one invocation runs at a time. Concurrent
 * calls return the in-flight promise.
 */
export function createSingleFlight<Args extends readonly unknown[], Result>(
    fn: (...args: Args) => Promise<Result>
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
