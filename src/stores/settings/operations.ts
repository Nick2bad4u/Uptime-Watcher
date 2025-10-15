/**
 * Operational slice housing settings persistence and synchronization actions.
 */
import { withErrorHandling } from "@shared/utils/errorHandling";

import type { SettingsStore } from "./types";

import { SettingsService } from "../../services/SettingsService";
import { useErrorStore } from "../error/useErrorStore";
import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import {
    defaultSettings,
    type SettingsStoreGetter,
    type SettingsStoreSetter,
} from "./state";

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
> => ({
    initializeSettings: async (): Promise<{
        message: string;
        settingsLoaded: boolean;
        success: boolean;
    }> => {
        try {
            const result = await withErrorHandling(
                async () => {
                    const historyLimit =
                        await SettingsService.getHistoryLimit();
                    const currentSettings = getState().settings;
                    const updatedSettings = {
                        ...defaultSettings,
                        ...currentSettings,
                        historyLimit,
                    };

                    setState({ settings: updatedSettings });

                    return {
                        message: "Successfully loaded settings",
                        settingsLoaded: true,
                        success: true,
                    } as const;
                },
                createStoreErrorHandler("settings", "initializeSettings")
            );

            logStoreAction("SettingsStore", "initializeSettings", {
                message: result.message,
                settingsLoaded: result.settingsLoaded,
                success: result.success,
            });

            return result;
        } catch (error) {
            const currentSettings = getState().settings;
            const fallbackSettings = {
                ...defaultSettings,
                ...currentSettings,
            };

            setState({ settings: fallbackSettings });

            const fallbackResult = {
                message: "Settings initialized with default values",
                settingsLoaded: true,
                success: false,
            } as const;

            logStoreAction("SettingsStore", "initializeSettings", {
                error: error instanceof Error ? error.message : String(error),
                message: fallbackResult.message,
                settingsLoaded: fallbackResult.settingsLoaded,
                success: fallbackResult.success,
            });

            return fallbackResult;
        }
    },
    persistHistoryLimit: async (limit: number): Promise<void> => {
        logStoreAction("SettingsStore", "persistHistoryLimit", { limit });

        const currentSettings = getState().settings;

        await withErrorHandling(
            async () => {
                getState().updateSettings({ historyLimit: limit });

                const backendLimit =
                    await SettingsService.updateHistoryLimit(limit);

                const validBackendLimit =
                    Number.isFinite(backendLimit) && backendLimit > 0
                        ? backendLimit
                        : limit;

                getState().updateSettings({
                    historyLimit: validBackendLimit,
                });
            },
            {
                clearError: () => {
                    useErrorStore.getState().clearStoreError("settings");
                },
                setError: (error) => {
                    const errorStore = useErrorStore.getState();
                    errorStore.setStoreError("settings", error);
                    getState().updateSettings({
                        historyLimit: currentSettings.historyLimit,
                    });
                },
                setLoading: (loading) => {
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
                const historyLimit = await SettingsService.getHistoryLimit();

                setState({
                    settings: {
                        ...defaultSettings,
                        historyLimit,
                    },
                });

                return {
                    message: "Settings successfully reset to defaults",
                    success: true,
                } as const;
            },
            createStoreErrorHandler("settings", "resetSettings")
        );

        logStoreAction("SettingsStore", "resetSettings", {
            message: result.message,
            success: result.success,
        });

        return result;
    },
    syncFromBackend: async () =>
        withErrorHandling(
            async () => {
                const historyLimit = await SettingsService.getHistoryLimit();
                const currentSettings = getState().settings;
                const updatedSettings = {
                    ...currentSettings,
                    historyLimit,
                };

                setState({ settings: updatedSettings });

                return {
                    message: "Settings synchronized from backend",
                    success: true,
                } as const;
            },
            createStoreErrorHandler("settings", "syncFromBackend")
        ),
});
