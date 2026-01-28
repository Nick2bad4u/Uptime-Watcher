/**
 * Internal bookkeeping for smart history pruning.
 */
export interface HistoryPruneState {
    /** Whether we've performed at least one expensive count check. */
    hasPerformedCountCheck: boolean;
    /** The history limit that this state was computed against. */
    lastHistoryLimit: number;
    /** How many writes since the last count check. */
    pendingWritesSinceCountCheck: number;
}
