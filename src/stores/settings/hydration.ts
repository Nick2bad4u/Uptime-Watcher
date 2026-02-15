import { ensureError } from "@shared/utils/errorHandling";
import { objectHasOwn } from "ts-extras";

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
): boolean => objectHasOwn(target, property);

// Store timer reference for cleanup capability.
// Use a const ref object to avoid top-level `let` while still allowing
// deterministic cleanup in tests.
const settingsSyncTimer: {
    current: null | ReturnType<typeof setTimeout>;
} = {
    current: null,
};

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
    if (!settingsSyncTimer.current) {
        return;
    }

    clearTimeout(settingsSyncTimer.current);
    settingsSyncTimer.current = null;
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

    if (settingsSyncTimer.current) {
        clearTimeout(settingsSyncTimer.current);
        settingsSyncTimer.current = null;
    }

    settingsSyncTimer.current = setTimeout(() => {
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
            settingsSyncTimer.current = null;
        })();
    }, 100);
};
