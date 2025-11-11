import type { SettingsStore } from "./types";

import { logger } from "../../services/logger";
/**
 * Utilities for synchronizing the settings store after persistence hydration.
 */
import { SettingsService } from "../../services/SettingsService";
import { defaultSettings, normalizeAppSettings } from "./state";

const hasOwn = <T extends object>(
    target: T,
    property: keyof T | string
): boolean => Object.hasOwn(target, property);

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
    const normalizedSettings = normalizeAppSettings(settings);

    const requiresNormalization =
        !hasOwn(settings, "inAppAlertsEnabled") ||
        !hasOwn(settings, "inAppAlertsSoundEnabled") ||
        !hasOwn(settings, "systemNotificationsEnabled") ||
        !hasOwn(settings, "systemNotificationsSoundEnabled");

    if (requiresNormalization) {
        state.updateSettings(normalizedSettings);
    }

    const matchesDefaults =
        normalizedSettings.autoStart === defaultSettings.autoStart &&
        normalizedSettings.historyLimit === defaultSettings.historyLimit &&
        normalizedSettings.inAppAlertsEnabled ===
            defaultSettings.inAppAlertsEnabled &&
        normalizedSettings.inAppAlertsSoundEnabled ===
            defaultSettings.inAppAlertsSoundEnabled &&
        normalizedSettings.minimizeToTray === defaultSettings.minimizeToTray &&
        normalizedSettings.systemNotificationsEnabled ===
            defaultSettings.systemNotificationsEnabled &&
        normalizedSettings.systemNotificationsSoundEnabled ===
            defaultSettings.systemNotificationsSoundEnabled &&
        normalizedSettings.theme === defaultSettings.theme;

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
