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

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            // Actions
            initializeSettings: async () => {
                const errorStore = useErrorStore.getState();
                const result = await withErrorHandling(
                    async () => {
                        const historyLimit = await window.electronAPI.settings.getHistoryLimit();
                        get().updateSettings({ historyLimit });
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
            resetSettings: () => {
                // Note: This method currently performs a local reset only.
                // Future enhancement: Consider adding backend synchronization
                // if reset operations need to be persisted across application restarts
                // or synchronized with other application instances.
                set({ settings: defaultSettings });
                logStoreAction("SettingsStore", "resetSettings", {
                    message: "Settings reset to defaults",
                    success: true,
                });
            },
            // State
            settings: defaultSettings,
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
                        const backendLimit = await window.electronAPI.settings.getHistoryLimit();
                        
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
