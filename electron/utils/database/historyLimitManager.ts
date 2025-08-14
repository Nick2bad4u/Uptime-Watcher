import type { DatabaseService } from "../../services/database/DatabaseService";
/**
 * Utility for managing history limits in the database.
 */
import type { HistoryRepository } from "../../services/database/HistoryRepository";
import type { SettingsRepository } from "../../services/database/SettingsRepository";
import type { Logger } from "../interfaces";

import { withDatabaseOperation } from "../operationalHooks";

/**
 * Parameters for setting history limit
 */
interface SetHistoryLimitParams {
    /**
     * Database service for transactions
     */
    databaseService: DatabaseService;

    /**
     * The limit to set
     */
    limit: number;

    /**
     * Logger instance
     */
    logger?: Logger;

    /**
     * Repository instances
     */
    repositories: {
        history: HistoryRepository;
        settings: SettingsRepository;
    };

    /**
     * Callback to update the internal history limit
     *
     * @remarks
     * This callback updates the in-memory history limit value immediately,
     * providing synchronous access for other components while the database
     * update happens asynchronously. Should be called before database
     * operations to ensure consistency between memory and database state.
     */
    setHistoryLimit: (limit: number) => void;
}

/**
 * Get the current history limit.
 *
 * Simple getter function that provides access to the history limit.
 * This indirection enables dependency injection and testability.
 *
 * @param getHistoryLimitFn - Function to retrieve the current history limit
 * @returns The current history limit
 */
export function getHistoryLimit(getHistoryLimitFn: () => number): number {
    return getHistoryLimitFn();
}

/**
 * Set the history retention limit and prune older history entries if needed.
 *
 * Limit behavior:
 * - 0 or negative: Disables history retention (unlimited)
 * - 1-9: Will be increased to minimum of 10
 * - 10+: Used as specified
 *
 * @param params - Parameters for setting history limit
 * @throws Error when database operations fail
 */
export async function setHistoryLimit(
    params: SetHistoryLimitParams
): Promise<void> {
    const {
        databaseService,
        limit,
        logger,
        repositories,
        setHistoryLimit: updateHistoryLimit,
    } = params;

    // Determine the appropriate limit value
    // Special case: 0 or negative disables history retention (unlimited)
    // Otherwise: enforce minimum of 10 for meaningful history retention
    const finalLimit = limit <= 0 ? 0 : Math.max(10, limit);

    // Update the internal limit
    updateHistoryLimit(finalLimit);

    // Use single transaction for atomicity - either both operations succeed or
    // both fail
    await withDatabaseOperation(
        async () =>
            databaseService.executeTransaction((db) => {
                // Save to settings using internal method
                repositories.settings.setInternal(
                    db,
                    "historyLimit",
                    finalLimit.toString()
                );

                // Prune history for all monitors if limit > 0 using internal
                // method
                if (finalLimit > 0) {
                    repositories.history.pruneAllHistoryInternal(
                        db,
                        finalLimit
                    );
                }

                return Promise.resolve();
            }),
        "history-limit-manager-set",
        undefined,
        { limit: finalLimit }
    );

    if (logger) {
        logger.debug(`History limit set to ${finalLimit}`);
        if (finalLimit > 0) {
            logger.debug(`Pruned history to ${finalLimit} entries per monitor`);
        }
    }
}
