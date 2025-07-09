/**
 * Utility for managing history limits in the database.
 */
import type { HistoryRepository, SettingsRepository, DatabaseService } from "../../services/index";

interface Logger {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
}

/**
 * Parameters for setting history limit
 */
interface SetHistoryLimitParams {
    /**
     * The limit to set
     */
    limit: number;

    /**
     * Repository instances
     */
    repositories: {
        settings: SettingsRepository;
        history: HistoryRepository;
    };

    /**
     * Database service for transactions
     */
    databaseService: DatabaseService;

    /**
     * Callback to update the internal history limit
     */
    setHistoryLimit: (limit: number) => void;

    /**
     * Logger instance
     */
    logger?: Logger;
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

    // Save to settings using repository - Use transaction for consistency
    await databaseService.executeTransaction(async () => {
        repositories.settings.set("historyLimit", finalLimit.toString());
        return Promise.resolve();
    });

    if (logger) {
        logger.debug(`History limit set to ${finalLimit}`);
    }

    // Prune history for all monitors using repository if limit > 0 - Use transaction
    if (finalLimit > 0) {
        await databaseService.executeTransaction(async () => {
            repositories.history.pruneAllHistory(finalLimit);
            return Promise.resolve();
        });
        if (logger) {
            logger.debug(`Pruned history to ${finalLimit} entries per monitor`);
        }
    }
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
