import type { SettingsStore } from "./types";

import { logger } from "../../services/logger";
/**
 * Utilities for synchronizing the settings store after persistence hydration.
 */
import { SettingsService } from "../../services/SettingsService";
import { defaultSettings } from "./state";

// Store timer reference for cleanup capability
// eslint-disable-next-line eslint-plugin-toplevel/no-toplevel-let -- Mutable state required for timer management
let settingsSyncTimer: null | ReturnType<typeof setTimeout> = null;

/**
 * Synchronizes critical settings from the backend after the store rehydrates.
 */
export const syncSettingsAfterRehydration = (
    state: SettingsStore | undefined
): void => {
    if (!state?.settings) {
        return;
    }

    const { settings } = state;
    const matchesDefaults =
        settings.autoStart === defaultSettings.autoStart &&
        settings.historyLimit === defaultSettings.historyLimit &&
        settings.minimizeToTray === defaultSettings.minimizeToTray &&
        settings.notifications === defaultSettings.notifications &&
        settings.soundAlerts === defaultSettings.soundAlerts &&
        settings.theme === defaultSettings.theme;

    if (matchesDefaults) {
        return;
    }

    if (settingsSyncTimer) {
        clearTimeout(settingsSyncTimer);
        settingsSyncTimer = null;
    }

    settingsSyncTimer = setTimeout(() => {
        void (async (): Promise<void> => {
            try {
                const historyLimit = await SettingsService.getHistoryLimit();
                state.updateSettings({ historyLimit });
            } catch (error) {
                logger.warn(
                    "Failed to sync settings after rehydration:",
                    error instanceof Error ? error : new Error(String(error))
                );
                state.updateSettings({
                    historyLimit: defaultSettings.historyLimit,
                });
            }
            settingsSyncTimer = null;
        })();
    }, 100);
};
