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
    HistoryLimitMaximumExceededError,
    normalizeHistoryLimit,
} from "@shared/constants/history";
import { ensureError } from "@shared/utils/errorHandling";

import { logger } from "./logger";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

/**
 * Normalises thrown history limit errors into the public shape required by
 * renderer callers.
 *
 * @remarks
 * The shared normaliser raises {@link RangeError} instances for both non-finite
 * values and numbers exceeding the configured maximum. Renderer consumers,
 * however, expect `TypeError` when the caller supplied a value that cannot be
 * represented (e.g. exceeding the configured maximum). This helper converts the
 * internal error types into the renderer-facing contract while preserving the
 * original diagnostics.
 *
 * @param backendError - Error raised when validating the backend response.
 * @param requestError - Optional error raised while validating the original
 *   request payload.
 *
 * @returns The error instance that should be re-thrown.
 */
const normalizeHistoryLimitError = (
    backendError: Error,
    requestError?: Error
): Error => {
    const primaryError = requestError ?? backendError;

    if (primaryError instanceof HistoryLimitMaximumExceededError) {
        return new TypeError(
            "History limit is too large to be represented. Please enter a smaller value."
        );
    }

    return primaryError;
};

type IpcServiceHelpers = ReturnType<typeof getIpcServiceHelpers>;

const { ensureInitialized, wrap } = ((): IpcServiceHelpers => {
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
    } catch (error) {
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
     * @remarks
     * For an end-to-end view of how history limit updates propagate through the
     * system (including database coordination and renderer events), see the
     * "History limit propagation (settings & database)" subsection in
     * `docs/Architecture/README.md`.
     *
     * The requested limit and the backend response are both validated using the
     * shared {@link DEFAULT_HISTORY_LIMIT_RULES}. This method behaves
     * differently depending on where validation fails:
     *
     * - If the caller supplies an invalid limit (for example, exceeding the
     *   configured maximum), the shared normaliser raises a {@link RangeError}.
     *   In that case, this method ultimately throws a {@link TypeError} via
     *   {@link normalizeHistoryLimitError} so renderer code can surface a
     *   user-facing validation failure.
     * - If the caller supplies a valid limit but the backend returns an invalid
     *   value, the method falls back to the sanitised version of the requested
     *   limit and logs a structured warning.
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
     * @returns Sanitized history limit after update. When the backend returns
     *   an invalid value but the requested limit is valid, the sanitised
     *   requested limit is returned instead and a warning is logged.
     *
     * @throws TypeError If the caller supplies a limit that cannot be
     *   normalised according to {@link DEFAULT_HISTORY_LIMIT_RULES} (for
     *   example, exceeding the configured maximum). Also throws if the electron
     *   API is unavailable or the backend operation fails fatally.
     */
    updateHistoryLimit: wrap(
        "updateHistoryLimit",
        async (api, limit: number): Promise<number> => {
            const historyRules = DEFAULT_HISTORY_LIMIT_RULES;
            let sanitizedRequestLimit: number | undefined = undefined;
            let requestNormalizationError: Error | undefined = undefined;

            try {
                sanitizedRequestLimit = normalizeHistoryLimit(
                    limit,
                    historyRules
                );
            } catch (error: unknown) {
                requestNormalizationError = ensureError(error);
            }

            const updatedLimit = await api.settings.updateHistoryLimit(limit);

            try {
                return normalizeHistoryLimit(updatedLimit, historyRules);
            } catch (error: unknown) {
                const normalizedError = ensureError(error);

                if (sanitizedRequestLimit === undefined) {
                    logger.warn(
                        "History limit update rejected: requested limit could not be normalised",
                        {
                            error: normalizedError.message,
                            receivedValue: updatedLimit,
                            requestedLimit: limit,
                        }
                    );

                    throw normalizeHistoryLimitError(
                        normalizedError,
                        requestNormalizationError
                    );
                }

                logger.warn(
                    "Received invalid history limit from backend; falling back to requested value",
                    {
                        error: normalizedError.message,
                        receivedValue: updatedLimit,
                        requestedLimit: limit,
                        sanitizedLimit: sanitizedRequestLimit,
                    }
                );

                return sanitizedRequestLimit;
            }
        }
    ),
};
