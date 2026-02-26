/**
 * Backoff delay helpers for retry loops.
 *
 * @remarks
 * Centralizes backoff math in shared code so retrying code paths (renderer,
 * main, and shared utilities) stay consistent and we avoid off-by-one drift
 * when different call sites interpret "attempt" differently.
 *
 * The primary API uses a 0-based `attemptIndex`:
 *
 * - `attemptIndex = 0` → first retry delay
 * - `attemptIndex = 1` → second retry delay
 *
 * This matches common patterns like `2 ** attemptIndex * baseDelayMs`.
 *
 * @packageDocumentation
 */

/** Supported retry backoff strategies. */
export type BackoffStrategy = "exponential" | "linear";

/**
 * Parameters for {@link calculateBackoffDelayMs}.
 */
export interface BackoffDelayOptions {
    /**
     * 0-based retry index.
     *
     * @remarks
     * This is intentionally **not** the same as an "attempt number" that starts
     * at 1. If you have an attempt number (1-based), convert via `attemptIndex
     * = attemptNumber - 1`.
     */
    readonly attemptIndex: number;

    /** Base delay (ms) for the first retry attempt. */
    readonly initialDelayMs: number;

    /**
     * Exponential multiplier.
     *
     * @defaultValue 2
     */
    readonly multiplier?: number;

    /** Backoff strategy. */
    readonly strategy: BackoffStrategy;
}

/**
 * Computes a retry delay in milliseconds.
 *
 * @remarks
 * - Negative / non-finite inputs are treated as `0` so retry helpers never
 *   schedule negative timeouts or throw while handling an already-failing
 *   operation.
 */
export function calculateBackoffDelayMs(options: BackoffDelayOptions): number {
    const attemptIndex = Number.isFinite(options.attemptIndex)
        ? Math.max(0, Math.trunc(options.attemptIndex))
        : 0;

    const initialDelayMs = Number.isFinite(options.initialDelayMs)
        ? Math.max(0, options.initialDelayMs)
        : 0;

    if (initialDelayMs === 0) {
        return 0;
    }

    if (options.strategy === "linear") {
        return initialDelayMs * (attemptIndex + 1);
    }

    const rawMultiplier = options.multiplier ?? 2;
    const multiplier = Number.isFinite(rawMultiplier)
        ? Math.max(0, rawMultiplier)
        : 2;

    if (multiplier === 0) {
        return 0;
    }

    return initialDelayMs * multiplier ** attemptIndex;
}
