/**
 * Utilities for synchronizing the settings store after persistence hydration.
 */
import { ensureError } from "@shared/utils/errorHandling";
import { objectHasOwn } from "ts-extras";

import type { SettingsStore } from "./types";

import { UI_DELAYS } from "../../constants";
import { logger } from "../../services/logger";
import { SettingsService } from "../../services/SettingsService";
import { fireAndForget } from "../../utils/async/fireAndForget";
import { defaultSettings, normalizeAppSettings } from "./state";

const hasOwn = <T extends object>(
    target: T,
    property: keyof T | string
): boolean => objectHasOwn(target, property);

// Store timer reference for cleanup capability.
// Use a const ref object to avoid top-level `let` while still allowing
// deterministic cleanup in tests.
const settingsSyncState: {
    generation: number;
    current: null | ReturnType<typeof setTimeout>;
} = {
    current: null,
    generation: 0,
};

function resetSettingsHydrationTimer(): void {
    if (!settingsSyncState.current) {
        return;
    }

    clearTimeout(settingsSyncState.current);
    settingsSyncState.current = null;
}

/**
 * Synchronizes critical settings from the backend after the store rehydrates.
 */
export const syncSettingsAfterRehydration = (
    state: SettingsStore | undefined
): void => {
    settingsSyncState.generation += 1;
    const generation = settingsSyncState.generation;
    resetSettingsHydrationTimer();

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

    const isMatchesDefaults =
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
        matchesDefaults: isMatchesDefaults,
    });

    if (isMatchesDefaults) {
        return;
    }

    const timer = setTimeout(() => {
        if (settingsSyncState.current === timer) {
            settingsSyncState.current = null;
        }

        fireAndForget(
            async () => {
                try {
                    logger.info(
                        "[SettingsHydration] fetching history limit for sync"
                    );
                    const historyLimit =
                        await SettingsService.getHistoryLimit();
                    if (generation !== settingsSyncState.generation) {
                        return;
                    }
                    logger.debug(
                        "[SettingsHydration] applying backend history limit",
                        {
                            historyLimit,
                        }
                    );
                    state.updateSettings({ historyLimit });
                } catch (error) {
                    if (generation !== settingsSyncState.generation) {
                        return;
                    }
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
            },
            {
                onError: (error) => {
                    logger.error(
                        "Unexpected settings hydration sync failure",
                        ensureError(error)
                    );
                },
            }
        );
    }, UI_DELAYS.STATE_UPDATE_DEFER);
    settingsSyncState.current = timer;
};
