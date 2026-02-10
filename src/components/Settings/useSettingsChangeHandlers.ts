/**
 * Change application helpers for {@link src/components/Settings/Settings#Settings}.
 *
 * @remarks
 * Extracted from `Settings.tsx` to keep the component focused on rendering and
 * high-level orchestration.
 */

import { useCallback } from "react";

import type { AppSettings } from "../../stores/types";

import { logger } from "../../services/logger";

const ALLOWED_SETTINGS_KEY_LIST = [
    "autoStart",
    "historyLimit",
    "inAppAlertsEnabled",
    "inAppAlertsSoundEnabled",
    "inAppAlertVolume",
    "minimizeToTray",
    "systemNotificationsEnabled",
    "systemNotificationsSoundEnabled",
    "theme",
] as const satisfies ReadonlyArray<keyof AppSettings>;

const ALLOWED_SETTINGS_KEY_STRINGS = new Set(
    ALLOWED_SETTINGS_KEY_LIST.map(String)
);

interface ApplySettingChangesOptions {
    readonly forceKeys?: ReadonlyArray<keyof AppSettings>;
}

/**
 * Provides stable callbacks for applying settings changes.
 */
export function useSettingsChangeHandlers(args: {
    readonly settings: AppSettings;
    readonly updateSettings: (settings: Partial<AppSettings>) => void;
}): {
    readonly applySettingChanges: (
        changes: Partial<AppSettings>,
        options?: ApplySettingChangesOptions
    ) => void;
    readonly handleSettingChange: <K extends keyof AppSettings>(
        key: K,
        value: AppSettings[K]
    ) => void;
} {
    const { settings, updateSettings } = args;

    const applySettingChanges = useCallback(
        (
            changes: Partial<AppSettings>,
            options?: ApplySettingChangesOptions
        ) => {
            const forceSettingsKeys = new Set(options?.forceKeys);

            // Create a safe update object with validated keys
            const updateEntries: Array<
                [keyof AppSettings, AppSettings[keyof AppSettings]]
            > = [];

            // Log and apply changes for allowed keys
            for (const allowedKey of ALLOWED_SETTINGS_KEY_LIST) {
                if (allowedKey in changes) {
                    const oldValue = settings[allowedKey];
                    const newValue = changes[allowedKey];
                    const isForced = forceSettingsKeys.has(allowedKey);

                    if (
                        newValue !== undefined &&
                        (oldValue !== newValue || isForced)
                    ) {
                        updateEntries.push([
                            allowedKey,
                            newValue as AppSettings[keyof AppSettings],
                        ]);

                        logger.user.settingsChange(
                            allowedKey,
                            oldValue as unknown,
                            newValue as unknown
                        );
                    }
                }
            }

            // Warn about invalid keys
            for (const rawKey of Object.keys(changes)) {
                if (!ALLOWED_SETTINGS_KEY_STRINGS.has(rawKey)) {
                    logger.warn(
                        "Attempted to update invalid settings key",
                        rawKey
                    );
                }
            }

            if (updateEntries.length > 0) {
                updateSettings(
                    Object.fromEntries(updateEntries) as Partial<AppSettings>
                );
            }
        },
        [settings, updateSettings]
    );

    const handleSettingChange = useCallback(
        <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
            applySettingChanges({ [key]: value });
        },
        [applySettingChanges]
    );

    return {
        applySettingChanges,
        handleSettingChange,
    };
}
