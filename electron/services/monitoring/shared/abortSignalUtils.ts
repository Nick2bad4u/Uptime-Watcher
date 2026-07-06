/**
 * AbortSignal helpers for monitoring.
 */

import { createCombinedAbortSignal } from "@shared/utils/abortUtils";
import { isFinite as isFiniteNumber } from "ts-extras";

/**
 * Creates a timeout signal and optionally merges it with an external signal.
 */
export function createTimeoutSignal(
    timeoutMs: number,
    signal?: AbortSignal
): AbortSignal {
    return createCombinedAbortSignal({
        ...(signal && { additionalSignals: [signal] }),
        timeoutMs,
    });
}

/**
 * Combines a base abort signal with optional additional signals and an optional
 * timeout.
 *
 * @remarks
 * Several monitoring modules need to merge:
 *
 * - A mandatory base signal (e.g. operation AbortController)
 * - Zero-or-more additional signals
 * - An optional timeout signal
 *
 * Centralizing the combination avoids drift and repeated `AbortSignal.any`
 * scaffolding.
 */
export function mergeAbortSignals(args: {
    readonly additionalSignals?: readonly AbortSignal[];
    readonly baseSignal: AbortSignal;
    readonly timeoutMs?: number;
}): AbortSignal {
    const hasAdditionalSignals = Boolean(args.additionalSignals?.length);
    const hasTimeout =
        typeof args.timeoutMs === "number" &&
        isFiniteNumber(args.timeoutMs) &&
        args.timeoutMs > 0;

    if (!hasAdditionalSignals && !hasTimeout) {
        return args.baseSignal;
    }

    return createCombinedAbortSignal({
        additionalSignals: [args.baseSignal, ...(args.additionalSignals ?? [])],
        ...(hasTimeout && { timeoutMs: args.timeoutMs }),
    });
}

/**
 * Returns an object containing `signal` only when the signal is defined.
 *
 * @remarks
 * This helper exists primarily for code clarity and to avoid repeating the same
 * spread pattern:
 *
 * ```ts
 * { ...(signal ? { signal } : {}) }
 * ```
 *
 * It also plays nicely with `exactOptionalPropertyTypes` by omitting the key
 * entirely when undefined.
 */
export function withOptionalAbortSignal(signal: AbortSignal | undefined): {
    signal?: AbortSignal;
} {
    return signal ? { signal } : {};
}
