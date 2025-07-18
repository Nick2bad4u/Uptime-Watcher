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
     */
    setHistoryLimit: (limit: number) => void;
}

/**
 * Get the current history limit.
 *
 * @param getHistoryLimit - Function to retrieve the current history limit
 * @returns The current history limit
 */
export function getHistoryLimit(getHistoryLimit: () => number): number {
    return getHistoryLimit();
}

/**
 * Set the history retention limit and prune older history entries if needed.
 *
 * @param params - Parameters for setting history limit
 */
export async function setHistoryLimit(params: SetHistoryLimitParams): Promise<void> {
    const { databaseService, limit, logger, repositories, setHistoryLimit } = params;

    // Determine the appropriate limit value
    const finalLimit = limit <= 0 ? 0 : Math.max(10, limit);

    // Update the internal limit
    setHistoryLimit(finalLimit);

    // Use single transaction for atomicity - either both operations succeed or both fail
    await withDatabaseOperation(
        () => {
            const db = databaseService.getDatabase();

            // Save to settings using internal method
            repositories.settings.setInternal(db, "historyLimit", finalLimit.toString());

            // Prune history for all monitors if limit > 0 using internal method
            if (finalLimit > 0) {
                repositories.history.pruneAllHistoryInternal(db, finalLimit);
            }

            return Promise.resolve();
        },
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
