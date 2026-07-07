import type { PersistOptions } from "zustand/middleware";

import { logger } from "@app/services/logger";
import { isDevelopment } from "@shared/utils/environment";
import { isDefined } from "ts-extras";

/**
 * Store utility helpers.
 *
 * @remarks
 * This module intentionally does **not** provide a store-owned error/loading
 * abstraction (e.g. `lastError` / `isLoading` on every store). Domain stores
 * must report errors/loading via `useErrorStore` through
 * `createStoreErrorHandler`.
 */

/**
 * Creates a Zustand persist configuration object with a normalized storage key.
 */
export const createPersistConfig = <TState, TPersisted = Partial<TState>>(
    storeName: string,
    partialize?: (state: TState) => TPersisted
): PersistOptions<TState, TPersisted> => ({
    name: `uptime-watcher-${storeName}`,
    ...(partialize && { partialize }),
});

/**
 * Logs store actions and state changes in development mode.
 */
export const logStoreAction = (
    storeName: string,
    actionName: string,
    details?: unknown
): void => {
    if (!isDevelopment()) {
        return;
    }

    const message = `[${storeName}] ${actionName}`;

    if (!isDefined(details)) {
        logger.info(message);
        return;
    }

    logger.info(message, details);
};
