/**
 * Settings store for managing application preferences and configuration.
 * Handles user settings, theme preferences, and backend synchronization.
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
                logStoreAction("SettingsStore", "initializeSettings");

                const errorStore = useErrorStore.getState();
                await withErrorHandling(
                    async () => {
                        const historyLimit = await window.electronAPI.settings.getHistoryLimit();
                        get().updateSettings({ historyLimit });
                    },
                    {
                        clearError: () => errorStore.clearStoreError("settings"),
                        setError: (error) => errorStore.setStoreError("settings", error),
                        setLoading: (loading) => errorStore.setOperationLoading("initializeSettings", loading),
                    }
                );
            },
            resetSettings: () => {
                logStoreAction("SettingsStore", "resetSettings");
                set({ settings: defaultSettings });
            },
            // State
            settings: defaultSettings,
            updateHistoryLimitValue: async (limit: number) => {
                logStoreAction("SettingsStore", "updateHistoryLimitValue", { limit });

                const errorStore = useErrorStore.getState();
                await withErrorHandling(
                    async () => {
                        // Call backend to update and prune history
                        await window.electronAPI.settings.updateHistoryLimit(limit);
                        // Reload the value from backend to ensure sync
                        const newLimit = await window.electronAPI.settings.getHistoryLimit();
                        get().updateSettings({ historyLimit: newLimit });
                    },
                    {
                        clearError: () => errorStore.clearStoreError("settings"),
                        setError: (error) => errorStore.setStoreError("settings", error),
                        setLoading: (loading) => errorStore.setOperationLoading("updateHistoryLimit", loading),
                    }
                );
            },
            updateSettings: (newSettings: Partial<AppSettings>) => {
                logStoreAction("SettingsStore", "updateSettings", { newSettings });
                set((state) => {
                    const updatedSettings = { ...state.settings, ...newSettings };
                    return { settings: updatedSettings };
                });
            },
        }),
        {
            name: "uptime-watcher-settings",
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
);
