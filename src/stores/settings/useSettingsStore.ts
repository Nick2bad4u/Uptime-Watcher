/**
 * Settings store for managing application preferences and configuration.
 * Handles user settings, theme preferences, and backend synchronization.
 *
 * @remarks
 * This store manages all application settings with automatic persistence and
 * backend synchronization. It provides:
 * - Persistent storage using Zustand persist middleware
 * - Backend synchronization for critical settings
 * - Default value management and reset functionality
 * - Error handling integration with the error store
 *
 * The store uses a partialize function to persist only essential settings data,
 * avoiding persistence of transient state or computed values.
 *
 * @example
 * ```typescript
 * // Basic settings usage
 * const { settings, updateSettings } = useSettingsStore();
 * updateSettings({ theme: 'dark', notifications: true });
 *
 * // History limit with backend sync
 * const { updateHistoryLimitValue } = useSettingsStore();
 * await updateHistoryLimitValue(500);
 *
 * // Settings initialization
 * const { initializeSettings } = useSettingsStore();
 * const result = await initializeSettings();
 * ```
 *
 * @public
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AppSettings } from "../types";
import type { SettingsStore } from "./types";

import { DEFAULT_HISTORY_LIMIT } from "../../constants";
import { extractIpcData } from "../../types/ipc";
import { useErrorStore } from "../error/useErrorStore";
import { logStoreAction, withErrorHandling } from "../utils";

const defaultSettings: AppSettings = {
    autoStart: false,
    historyLimit: DEFAULT_HISTORY_LIMIT,
    minimizeToTray: true,
    notifications: true,
    soundAlerts: false,
    theme: "system",
};

const syncSettingsAfterRehydration = (state: SettingsStore | undefined) => {
    if (state) {
        // Use setTimeout to avoid blocking the rehydration process
        setTimeout(() => {
            // Use an IIFE to handle the async operation properly
            void (async () => {
                try {
                    const historyLimitResponse = await window.electronAPI.settings.getHistoryLimit();
                    const historyLimit = extractIpcData<number>(historyLimitResponse);
                    state.updateSettings({ historyLimit });
                } catch (error) {
                    console.warn("Failed to sync settings after rehydration:", error);
                }
            })();
        }, 100); // Small delay to ensure everything is initialized
    }
};

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            // Actions
            initializeSettings: async () => {
                const errorStore = useErrorStore.getState();
                const result = await withErrorHandling(
                    async () => {
                        // Fetch all available settings from backend
                        let historyLimitResponse;
                        try {
                            historyLimitResponse = await window.electronAPI.settings.getHistoryLimit();
                        } catch (error) {
                            console.error("Failed to get history limit from backend", error);
                            throw error;
                        }

                        let historyLimit;
                        try {
                            historyLimit = extractIpcData<number>(historyLimitResponse); // Extract the actual number
                        } catch (error) {
                            console.error("Failed to extract history limit from response", error);
                            throw error;
                        }

                        // Update local state with backend values, keeping defaults for others
                        const updatedSettings = {
                            ...defaultSettings,
                            historyLimit, // Use actual backend value
                        };

                        // Force update the state to ensure it overrides any persisted values
                        set({ settings: updatedSettings });

                        return {
                            message: "Successfully loaded settings",
                            settingsLoaded: true,
                            success: true,
                        };
                    },
                    {
                        clearError: () => errorStore.clearStoreError("settings"),
                        setError: (error) => errorStore.setStoreError("settings", error),
                        setLoading: (loading) => errorStore.setOperationLoading("initializeSettings", loading),
                    }
                );

                logStoreAction("SettingsStore", "initializeSettings", {
                    message: result.message,
                    settingsLoaded: result.settingsLoaded,
                    success: result.success,
                });

                return result;
            },
            resetSettings: async () => {
                const errorStore = useErrorStore.getState();
                const result = await withErrorHandling(
                    async () => {
                        // Call backend to reset all settings
                        await window.electronAPI.settings.resetSettings();

                        // Fetch the actual reset values from backend to ensure synchronization
                        const historyLimitResponse = await window.electronAPI.settings.getHistoryLimit();
                        let historyLimit;
                        try {
                            historyLimit = extractIpcData<number>(historyLimitResponse);
                        } catch (error) {
                            console.error("Failed to extract history limit from reset response", error);
                            throw error;
                        }

                        // Update local state to match backend defaults
                        set({
                            settings: {
                                ...defaultSettings,
                                historyLimit, // Use the actual value from backend
                            },
                        });

                        return {
                            message: "Settings successfully reset to defaults",
                            success: true,
                        };
                    },
                    {
                        clearError: () => errorStore.clearStoreError("settings"),
                        setError: (error) => errorStore.setStoreError("settings", error),
                        setLoading: (loading) => errorStore.setOperationLoading("resetSettings", loading),
                    }
                );

                logStoreAction("SettingsStore", "resetSettings", {
                    message: result.message,
                    success: result.success,
                });

                return result;
            },
            // State
            settings: defaultSettings,
            // Force sync settings from backend (useful for debugging persistence issues)
            syncFromBackend: async () => {
                const errorStore = useErrorStore.getState();
                const result = await withErrorHandling(
                    async () => {
                        const historyLimitResponse = await window.electronAPI.settings.getHistoryLimit();
                        let historyLimit;
                        try {
                            historyLimit = extractIpcData<number>(historyLimitResponse);
                        } catch (error) {
                            console.error("Failed to extract history limit from refresh response", error);
                            throw error;
                        }

                        const currentSettings = get().settings;
                        const updatedSettings = {
                            ...currentSettings,
                            historyLimit,
                        };

                        set({ settings: updatedSettings });

                        return {
                            message: "Settings synchronized from backend",
                            success: true,
                        };
                    },
                    {
                        clearError: () => errorStore.clearStoreError("settings"),
                        setError: (error) => errorStore.setStoreError("settings", error),
                        setLoading: (loading) => errorStore.setOperationLoading("syncFromBackend", loading),
                    }
                );

                return result;
            },
            updateHistoryLimitValue: async (limit: number) => {
                logStoreAction("SettingsStore", "updateHistoryLimitValue", { limit });

                const errorStore = useErrorStore.getState();
                const currentSettings = get().settings;

                await withErrorHandling(
                    async () => {
                        // Update local state immediately for responsive UI
                        get().updateSettings({ historyLimit: limit });

                        // Call backend to update and prune history
                        await window.electronAPI.settings.updateHistoryLimit(limit);

                        // Verify the value from backend to ensure sync
                        const backendLimitResponse = await window.electronAPI.settings.getHistoryLimit();
                        let backendLimit;
                        try {
                            backendLimit = extractIpcData<number>(backendLimitResponse);
                        } catch (error) {
                            console.error("Failed to extract backend limit from response", error);
                            throw error;
                        }

                        // Ensure we have a valid number from backend
                        const validBackendLimit =
                            typeof backendLimit === "number" && backendLimit > 0 ? backendLimit : limit;

                        // Update with backend value to ensure consistency
                        get().updateSettings({ historyLimit: validBackendLimit });
                    },
                    {
                        clearError: () => errorStore.clearStoreError("settings"),
                        setError: (error) => {
                            // Revert to previous state on error instead of using default
                            errorStore.setStoreError("settings", error);
                            get().updateSettings({ historyLimit: currentSettings.historyLimit });
                        },
                        setLoading: (loading) => errorStore.setOperationLoading("updateHistoryLimit", loading),
                    }
                );
            },
            updateSettings: (newSettings: Partial<AppSettings>) => {
                logStoreAction("SettingsStore", "updateSettings", { newSettings });
                set((state) => {
                    const updatedSettings = {
                        ...state.settings,
                        ...newSettings,
                    };
                    return { settings: updatedSettings };
                });
            },
        }),
        {
            name: "uptime-watcher-settings",
            // After rehydration, sync critical settings from backend
            onRehydrateStorage: () => syncSettingsAfterRehydration,
            // Persistence configuration - only persist essential settings data
            // This prevents persisting transient state, computed values, or functions
            // If additional state properties are added in the future, review this
            // partialize function to ensure appropriate data is persisted
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
);
