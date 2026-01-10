/**
 * Shared history retention rules and helpers.
 *
 * @remarks
 * Provides a single source of truth for default history limit configuration
 * across the Electron main process and renderer. Exports strongly typed rules
 * and normalization utilities to keep validation and sanitisation logic
 * consistent between layers.
 */

/**
 * Business rules controlling history retention limits.
 *
 * @public
 */
export interface HistoryLimitRules {
    /** Default number of history entries retained per monitor. */
    readonly defaultLimit: number;
    /** Maximum number of history entries retained per monitor. */
    readonly maxLimit: number;
    /** Minimum non-zero number of history entries retained per monitor. */
    readonly minLimit: number;
}

/**
 * Error thrown when a history limit candidate exceeds the configured maximum.
 *
 * @remarks
 * This is a specialized {@link RangeError} so callers can branch on the error
 * type without parsing message strings.
 */
export class HistoryLimitMaximumExceededError extends RangeError {
    public readonly maxLimit: number;

    public readonly candidate: number;

    public constructor(args: { candidate: number; maxLimit: number }) {
        super(
            `History limit exceeds maximum of ${args.maxLimit}, received: ${args.candidate}`
        );
        this.name = "HistoryLimitMaximumExceededError";
        this.candidate = args.candidate;
        this.maxLimit = args.maxLimit;
    }
}

/**
 * Canonical history limit rules shared by all layers.
 */
export const DEFAULT_HISTORY_LIMIT_RULES: HistoryLimitRules = Object.freeze({
    defaultLimit: 500,
    maxLimit: Number.MAX_SAFE_INTEGER,
    minLimit: 25,
});

/**
 * Default history retention limit exported for convenience.
 */
export const DEFAULT_HISTORY_LIMIT: number =
    DEFAULT_HISTORY_LIMIT_RULES.defaultLimit;

/**
 * Computes the effective history limit after applying business rules.
 *
 * @remarks
 * Validates that the candidate is a finite number within the supported bounds,
 * then clamps values below the minimum to the configured minimum while treating
 * zero or negative inputs as "unlimited" (represented as `0`). Fractional
 * values above the minimum are floored.
 *
 * @param candidate - History limit provided by a consumer.
 * @param rules - Rules to use when normalising the value. Defaults to the
 *   shared history limit rules used across the application.
 *
 * @returns The normalised history limit ready for persistence.
 *
 * @throws TypeError - When the candidate cannot be coerced into a number.
 * @throws RangeError - When the candidate is non-finite (for example
 *   `Infinity`) or exceeds the configured maximum.
 */
export function normalizeHistoryLimit(
    candidate: number,
    rules: HistoryLimitRules = DEFAULT_HISTORY_LIMIT_RULES
): number {
    if (typeof candidate !== "number" || Number.isNaN(candidate)) {
        throw new TypeError(
            `History limit must be a number, received: ${String(candidate)}`
        );
    }

    if (!Number.isFinite(candidate)) {
        throw new RangeError(
            `History limit must be finite, received: ${candidate}`
        );
    }

    if (candidate > rules.maxLimit) {
        throw new HistoryLimitMaximumExceededError({
            candidate,
            maxLimit: rules.maxLimit,
        });
    }

    if (candidate <= 0) {
        return 0;
    }

    const normalizedCandidate = Math.floor(candidate);

    if (normalizedCandidate < rules.minLimit) {
        return rules.minLimit;
    }

    return normalizedCandidate;
}
