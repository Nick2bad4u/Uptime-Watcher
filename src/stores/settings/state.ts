import type { StoreApi } from "zustand";

/**
 * Basic state slice for the settings store.
 *
 * @remarks
 * Provides the default settings object and the core state mutation helpers used
 * by the rest of the settings store modules.
 */
import type { AppSettings } from "../types";
import type { SettingsStore } from "./types";

import { DEFAULT_HISTORY_LIMIT } from "../../constants";
import { logStoreAction } from "../utils";

const DEFAULT_SETTINGS_HISTORY_LIMIT = DEFAULT_HISTORY_LIMIT;

/**
 * Default application settings applied during initialization.
 */
export const defaultSettings: AppSettings = {
    autoStart: false,
    historyLimit: DEFAULT_SETTINGS_HISTORY_LIMIT,
    minimizeToTray: true,
    notifications: true,
    soundAlerts: false,
    theme: "system",
};

/**
 * Setter helper type for composing Zustand slices.
 */
export type SettingsStoreSetter = StoreApi<SettingsStore>["setState"];

/**
 * Getter helper type for composing Zustand slices.
 */
export type SettingsStoreGetter = StoreApi<SettingsStore>["getState"];

/**
 * Creates the state slice containing raw settings values and update helpers.
 */
export const createSettingsStateSlice = (
    setState: SettingsStoreSetter
): Pick<SettingsStore, "settings" | "updateSettings"> => ({
    settings: { ...defaultSettings },
    updateSettings: (newSettings): void => {
        logStoreAction("SettingsStore", "updateSettings", {
            newSettings,
        });
        setState((state) => ({
            settings: {
                ...state.settings,
                ...newSettings,
            },
        }));
    },
});
