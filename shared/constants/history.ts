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
 * Validates that the candidate is a finite integer within the supported bounds,
 * then clamps values below the minimum to the configured minimum while treating
 * zero or negative inputs as "unlimited" (represented as `0`).
 *
 * @param candidate - History limit provided by a consumer.
 * @param rules - Rules to use when normalising the value. Defaults to the
 *   shared history limit rules used across the application.
 *
 * @returns The normalised history limit ready for persistence.
 *
 * @throws TypeError - When the candidate is not a finite number or integer.
 * @throws RangeError - When the candidate exceeds the configured maximum.
 */
export function normalizeHistoryLimit(
    candidate: number,
    rules: HistoryLimitRules = DEFAULT_HISTORY_LIMIT_RULES
): number {
    if (typeof candidate !== "number" || Number.isNaN(candidate)) {
        throw new TypeError(
            `History limit must be a finite number, received: ${String(candidate)}`
        );
    }

    if (!Number.isFinite(candidate)) {
        throw new RangeError(
            `History limit must be finite, received: ${candidate}`
        );
    }

    if (!Number.isInteger(candidate)) {
        throw new TypeError(
            `History limit must be an integer, received: ${candidate}`
        );
    }

    if (candidate > rules.maxLimit) {
        throw new RangeError(
            `History limit exceeds maximum of ${rules.maxLimit}, received: ${candidate}`
        );
    }

    if (candidate <= 0) {
        return 0;
    }

    return Math.max(rules.minLimit, candidate);
}
