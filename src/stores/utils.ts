import type { PersistOptions } from "zustand/middleware";

import { logger } from "@app/services/logger";
import { isDevelopment } from "@shared/utils/environment";

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
    ...(partialize ? { partialize } : {}),
});

/**
 * Debounces a function, delaying execution until after the wait period has
 * elapsed since the last call.
 */
export const debounce = <TArguments extends unknown[]>(
    function_: (...arguments_: TArguments) => void,
    wait: number
): ((...arguments_: TArguments) => void) => {
    // `wait` is treated as milliseconds. Negative values are coerced to 0.
    const delay = Math.max(0, wait);

    let timerId: null | ReturnType<typeof setTimeout> = null;
    let lastArguments: null | TArguments = null;

    return (...arguments_: TArguments): void => {
        lastArguments = arguments_;

        if (timerId !== null) {
            clearTimeout(timerId);
        }

        timerId = setTimeout(() => {
            const argsToExecute = lastArguments;
            timerId = null;
            lastArguments = null;

            if (!argsToExecute) {
                return;
            }

            function_(...argsToExecute);
        }, delay);
    };
};

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

    if (details === undefined) {
        logger.info(message);
        return;
    }

    logger.info(message, details);
};
