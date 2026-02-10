import type { Monitor } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import type { EnhancedMonitoringDependencies } from "../EnhancedMonitoringDependencies";
import type { StatusUpdateMonitorCheckResult } from "../MonitorStatusUpdateService";
import type { HistoryPruneState } from "./historyPruningState";

/**
 * Persists a monitor history entry and prunes when needed.
 *
 * @remarks
 * Extracted from {@link electron/services/monitoring/EnhancedMonitorChecker#EnhancedMonitorChecker} to keep the checker focused on
 * orchestration.
 */
export async function saveMonitorHistoryEntry(args: {
    readonly checkResult: StatusUpdateMonitorCheckResult;
    readonly dependencies: Pick<
        EnhancedMonitoringDependencies,
        "getHistoryLimit" | "historyRepository"
    >;
    readonly historyPruneState: Map<string, HistoryPruneState>;
    readonly logger: Logger;
    readonly monitor: Monitor;
}): Promise<void> {
    const { checkResult, dependencies, historyPruneState, logger, monitor } =
        args;

    if (!monitor.id) {
        logger.warn("Cannot save history entry: monitor missing ID");
        return;
    }

    const historyEntry = {
        responseTime: checkResult.responseTime,
        status: checkResult.status,
        timestamp: checkResult.timestamp.getTime(),
    };

    try {
        // Pass the details field from the check result to the history repository.
        await dependencies.historyRepository.addEntry(
            monitor.id,
            historyEntry,
            checkResult.details
        );

        // Smart history pruning: Only prune when necessary to avoid
        // performance overhead
        const historyLimit = dependencies.getHistoryLimit();
        if (historyLimit > 0) {
            // Use a buffer strategy: only prune when we exceed limit + buffer.
            const bufferSize = Math.max(Math.floor(historyLimit * 0.2), 5);
            const pruneThreshold = historyLimit + bufferSize;

            const previousState = historyPruneState.get(monitor.id);
            const state = previousState ?? {
                hasPerformedCountCheck: false,
                lastHistoryLimit: historyLimit,
                pendingWritesSinceCountCheck: 0,
            };

            // If the configured history limit changed, reset the pruning state
            // so the new configuration is applied quickly.
            if (state.lastHistoryLimit !== historyLimit) {
                state.lastHistoryLimit = historyLimit;
                state.pendingWritesSinceCountCheck = 0;
                state.hasPerformedCountCheck = false;
            }

            state.pendingWritesSinceCountCheck += 1;

            const shouldCheckCount =
                !state.hasPerformedCountCheck ||
                state.pendingWritesSinceCountCheck >= bufferSize;

            if (shouldCheckCount) {
                state.pendingWritesSinceCountCheck = 0;
                state.hasPerformedCountCheck = true;
                historyPruneState.set(monitor.id, state);

                const currentCount =
                    await dependencies.historyRepository.getHistoryCount(
                        monitor.id
                    );

                if (currentCount > pruneThreshold) {
                    await dependencies.historyRepository.pruneHistory(
                        monitor.id,
                        historyLimit
                    );
                    logger.debug(
                        `[EnhancedMonitorChecker] Pruned history for monitor ${monitor.id}: ${currentCount} -> ${historyLimit} entries`
                    );
                }
            } else {
                historyPruneState.set(monitor.id, state);
            }
        } else {
            // Avoid unbounded memory usage if the history limit is disabled.
            historyPruneState.delete(monitor.id);
        }

        logger.debug(
            `Saved history entry for monitor ${monitor.id}: ${checkResult.status}`
        );
    } catch (error) {
        logger.error(
            `Failed to save history entry for monitor ${monitor.id}`,
            error
        );
        // Don't throw error - history saving failure shouldn't stop monitoring
    }
}
