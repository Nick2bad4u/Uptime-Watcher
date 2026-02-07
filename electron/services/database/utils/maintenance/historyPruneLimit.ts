/**
 * Shared helpers for history pruning operations.
 */

/**
 * Normalizes a history prune limit into a positive integer.
 *
 * @returns A positive integer when pruning should occur, or `null` when the
 *   provided limit is invalid / disables pruning.
 */
export function normalizeHistoryPruneLimit(limit: number): null | number {
    if (!Number.isFinite(limit)) {
        return null;
    }

    const normalized = Math.floor(limit);
    return normalized > 0 ? normalized : null;
}
