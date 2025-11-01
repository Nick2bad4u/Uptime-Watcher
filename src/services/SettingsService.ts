/**
 * Service layer for handling all settings-related operations. Provides a clean
 * abstraction over electron API calls for settings management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. All
 * backend communication is performed via IPC and follows strict typing with
 * automatic error handling and logging.
 *
 * @packageDocumentation
 */

import {
    DEFAULT_HISTORY_LIMIT_RULES,
    normalizeHistoryLimit,
} from "@shared/constants/history";
import { ensureError } from "@shared/utils/errorHandling";

import { logger } from "./logger";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("SettingsService", {
            bridgeContracts: [
                {
                    domain: "settings",
                    methods: [
                        "getHistoryLimit",
                        "resetSettings",
                        "updateHistoryLimit",
                    ],
                },
            ],
        });
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

/**
 * Contract describing the renderer-facing settings service surface.
 */
interface SettingsServiceContract {
    getHistoryLimit: () => Promise<number>;
    initialize: () => Promise<void>;
    resetSettings: () => Promise<void>;
    updateHistoryLimit: (limit: number) => Promise<number>;
}

/**
 * Service for managing application settings through Electron IPC.
 *
 * @remarks
 * Provides a comprehensive interface for settings operations including history
 * limit management, settings reset, and configuration persistence with
 * automatic service initialization and type-safe IPC communication.
 *
 * @public
 */
export const SettingsService: SettingsServiceContract = {
    /**
     * Gets the current history retention limit.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const limit = await SettingsService.getHistoryLimit();
     * logger.info("Current history limit", { records: limit });
     * ```
     *
     * @returns The current history retention limit as a number.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    getHistoryLimit: wrap("getHistoryLimit", async (api) => {
        const rawLimit = await api.settings.getHistoryLimit();

        try {
            return normalizeHistoryLimit(rawLimit, DEFAULT_HISTORY_LIMIT_RULES);
        } catch (error: unknown) {
            const normalizedError = ensureError(error);
            logger.warn(
                "Received invalid history limit from backend; defaulting to shared rule",
                {
                    error: normalizedError.message,
                    receivedValue: rawLimit,
                }
            );

            return DEFAULT_HISTORY_LIMIT_RULES.defaultLimit;
        }
    }),

    /**
     * Ensures the electron API is available before making backend calls.
     *
     * @remarks
     * This method should be called before any backend operation.
     *
     * @returns A promise that resolves when the electron API is ready.
     *
     * @throws If the electron API is not available.
     */
    initialize: ensureInitialized,

    /**
     * Resets all application settings to their default values.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * await SettingsService.resetSettings();
     * logger.info("Settings reset to defaults");
     * ```
     *
     * @returns A promise that resolves when all settings have been reset.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    resetSettings: wrap("resetSettings", async (api) => {
        await api.settings.resetSettings();
    }),

    /**
     * Updates the history retention limit and prunes existing history.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * await SettingsService.updateHistoryLimit(1000);
     * logger.info("History limit updated", { records: 1000 });
     * ```
     *
     * @param limit - The new maximum number of history records to keep per
     *   monitor.
     *
     * @returns Sanitized history limit after update. If the backend returns a
     *   non-numeric value, the requested limit is used instead and a warning is
     *   logged.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    updateHistoryLimit: wrap(
        "updateHistoryLimit",
        async (api, limit: number): Promise<number> => {
            const updatedLimit = await api.settings.updateHistoryLimit(limit);

            try {
                return normalizeHistoryLimit(
                    updatedLimit,
                    DEFAULT_HISTORY_LIMIT_RULES
                );
            } catch (error: unknown) {
                const normalizedError = ensureError(error);
                logger.warn(
                    "Received invalid history limit from backend; falling back to requested value",
                    {
                        error: normalizedError.message,
                        receivedValue: updatedLimit,
                        requestedLimit: limit,
                    }
                );

                return normalizeHistoryLimit(
                    limit,
                    DEFAULT_HISTORY_LIMIT_RULES
                );
            }
        }
    ),
};
