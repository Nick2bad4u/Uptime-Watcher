import { ensureError } from "@shared/utils/errorHandling";

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
 * Clears the pending settings hydration sync timer.
 *
 * @remarks
 * Settings hydration uses a small deferred sync to pull authoritative backend
 * values (currently the history limit). Tests that re-import modules or create
 * multiple store instances benefit from being able to clear pending timeouts
 * deterministically.
 *
 * @internal
 */
export function resetSettingsHydrationTimerForTesting(): void {
    if (!settingsSyncTimer) {
        return;
    }

    clearTimeout(settingsSyncTimer);
    settingsSyncTimer = null;
}

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

    logger.debug("[SettingsHydration] sync invoked", {
        matchesDefaults: undefined,
        requiresNormalization,
    });

    if (requiresNormalization) {
        logger.debug("[SettingsHydration] applying normalization update");
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

    logger.debug("[SettingsHydration] post-normalization status", {
        matchesDefaults,
    });

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
                logger.info(
                    "[SettingsHydration] fetching history limit for sync"
                );
                const historyLimit = await SettingsService.getHistoryLimit();
                logger.debug(
                    "[SettingsHydration] applying backend history limit",
                    {
                        historyLimit,
                    }
                );
                state.updateSettings({ historyLimit });
            } catch (error) {
                logger.warn(
                    "Failed to sync settings after rehydration:",
                    ensureError(error)
                );
                logger.debug(
                    "[SettingsHydration] applying fallback history limit",
                    {
                        historyLimit: defaultSettings.historyLimit,
                    }
                );
                state.updateSettings({
                    historyLimit: defaultSettings.historyLimit,
                });
            }
            settingsSyncTimer = null;
        })();
    }, 100);
};
