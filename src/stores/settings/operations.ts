/**
 * Operational slice housing settings persistence and synchronization actions.
 */
import {
    DEFAULT_HISTORY_LIMIT_RULES,
    normalizeHistoryLimit,
} from "@shared/constants/history";
import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

import type { SettingsStore } from "./types";

import { EventsService } from "../../services/EventsService";
import { logger } from "../../services/logger";
import { SettingsService } from "../../services/SettingsService";
import { useErrorStore } from "../error/useErrorStore";
import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import {
    normalizeAppSettings,
    type SettingsStoreGetter,
    type SettingsStoreSetter,
} from "./state";

const historyLimitSubscriptionRef: {
    /** Cleanup function returned by the events subscription. */
    current: (() => void) | undefined;
} = {
    current: undefined,
};

/**
 * Resets the cached history-limit subscription.
 *
 * @remarks
 * Exposed for test environments to allow deterministic validation of the
 * history-limit listener lifecycle. Invokes any existing cleanup callback and
 * clears the cached reference so subsequent store initialization re-registers
 * the renderer listener.
 *
 * @internal
 */
export function resetHistoryLimitSubscriptionForTesting(): void {
    historyLimitSubscriptionRef.current?.();
    historyLimitSubscriptionRef.current = undefined;
}

/**
 * Creates the operational slice containing asynchronous settings actions.
 */
export const createSettingsOperationsSlice = (
    setState: SettingsStoreSetter,
    getState: SettingsStoreGetter
): Pick<
    SettingsStore,
    | "initializeSettings"
    | "persistHistoryLimit"
    | "resetSettings"
    | "syncFromBackend"
> => {
    const ensureHistoryLimitSubscription = async (): Promise<void> => {
        if (historyLimitSubscriptionRef.current) {
            return;
        }

        try {
            const cleanup = await EventsService.onHistoryLimitUpdated(
                (event) => {
                    const currentSettings = getState().settings;

                    if (currentSettings.historyLimit === event.limit) {
                        return;
                    }

                    logStoreAction(
                        "SettingsStore",
                        "historyLimitUpdatedEvent",
                        {
                            limit: event.limit,
                            previousLimit: event.previousLimit,
                            timestamp: event.timestamp,
                        }
                    );

                    logger.debug(
                        "[SettingsStore] Applying history limit update from backend",
                        {
                            limit: event.limit,
                            previousLimit: event.previousLimit,
                            timestamp: event.timestamp,
                        }
                    );

                    setState({
                        settings: normalizeAppSettings({
                            ...currentSettings,
                            historyLimit: event.limit,
                        }),
                    });
                }
            );

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Guard against race conditions when concurrent callers initialize after await.
            if (historyLimitSubscriptionRef.current) {
                cleanup();
                return;
            }

            historyLimitSubscriptionRef.current = cleanup;
        } catch (error: unknown) {
            const normalizedError = ensureError(error);
            logger.error(
                "[SettingsStore] Failed to subscribe to history limit updates",
                normalizedError
            );
        }
    };

    return {
        initializeSettings: async (): Promise<{
            message: string;
            settingsLoaded: boolean;
            success: boolean;
        }> => {
            try {
                // Standardized store error handling; context is created via
                // factory as recommended in ADR-003 ("Store Error Handling Contexts").
                const result = await withErrorHandling(
                    async () => {
                        const historyLimit =
                            await SettingsService.getHistoryLimit();
                        const currentSettings = getState().settings;
                        const updatedSettings = normalizeAppSettings({
                            ...currentSettings,
                            historyLimit,
                        });

                        setState({ settings: updatedSettings });

                        return {
                            message: "Successfully loaded settings",
                            settingsLoaded: true,
                            success: true,
                        } as const;
                    },
                    createStoreErrorHandler("settings", "initializeSettings")
                );

                await ensureHistoryLimitSubscription();

                logStoreAction("SettingsStore", "initializeSettings", {
                    message: result.message,
                    settingsLoaded: result.settingsLoaded,
                    success: result.success,
                });

                return result;
            } catch (error) {
                const currentSettings = getState().settings;
                const fallbackSettings = normalizeAppSettings({
                    ...currentSettings,
                });

                setState({ settings: fallbackSettings });

                await ensureHistoryLimitSubscription();

                const fallbackResult = {
                    message: "Settings initialized with default values",
                    settingsLoaded: true,
                    success: false,
                } as const;

                logStoreAction("SettingsStore", "initializeSettings", {
                    error: getUserFacingErrorDetail(error),
                    message: fallbackResult.message,
                    settingsLoaded: fallbackResult.settingsLoaded,
                    success: fallbackResult.success,
                });

                return fallbackResult;
            }
        },
        persistHistoryLimit: async (limit: number): Promise<void> => {
            logStoreAction("SettingsStore", "persistHistoryLimit", { limit });

            await ensureHistoryLimitSubscription();

            const currentSettings = getState().settings;

            // Inline ErrorHandlingFrontendStore context: in addition to updating
            // error/loading state, this operation must revert the optimistic
            // historyLimit update when backend persistence fails. See
            // ADR-003 section "Store Error Handling Contexts" for details
            // on when inline contexts are appropriate.
            await withErrorHandling(
                async () => {
                    const sanitizedLimit: number = normalizeHistoryLimit(
                        limit,
                        DEFAULT_HISTORY_LIMIT_RULES
                    );

                    getState().updateSettings({
                        historyLimit: sanitizedLimit,
                    });

                    const persistedLimit =
                        await SettingsService.updateHistoryLimit(
                            sanitizedLimit
                        );

                    getState().updateSettings({
                        historyLimit: persistedLimit,
                    });
                },
                {
                    clearError: (): void => {
                        useErrorStore.getState().clearStoreError("settings");
                    },
                    setError: (error: string | undefined): void => {
                        const errorStore = useErrorStore.getState();
                        errorStore.setStoreError("settings", error);
                        getState().updateSettings({
                            historyLimit: currentSettings.historyLimit,
                        });
                    },
                    setLoading: (loading: boolean): void => {
                        useErrorStore
                            .getState()
                            .setOperationLoading("updateHistoryLimit", loading);
                    },
                }
            );
        },
        resetSettings: async (): Promise<{
            message: string;
            success: boolean;
        }> => {
            const result = await withErrorHandling(
                async () => {
                    await SettingsService.resetSettings();
                    const historyLimit =
                        await SettingsService.getHistoryLimit();

                    setState({
                        settings: normalizeAppSettings({
                            historyLimit,
                        }),
                    });

                    await ensureHistoryLimitSubscription();

                    return {
                        message: "Settings successfully reset to defaults",
                        success: true,
                    } as const;
                },
                createStoreErrorHandler("settings", "resetSettings")
            );

            await ensureHistoryLimitSubscription();

            logStoreAction("SettingsStore", "resetSettings", {
                message: result.message,
                success: result.success,
            });

            return result;
        },
        syncFromBackend: async () =>
            withErrorHandling(
                async () => {
                    const historyLimit =
                        await SettingsService.getHistoryLimit();
                    const currentSettings = getState().settings;
                    const updatedSettings = normalizeAppSettings({
                        ...currentSettings,
                        historyLimit,
                    });

                    setState({ settings: updatedSettings });

                    await ensureHistoryLimitSubscription();

                    return {
                        message: "Settings synchronized from backend",
                        success: true,
                    } as const;
                },
                createStoreErrorHandler("settings", "syncFromBackend")
            ),
    };
};
