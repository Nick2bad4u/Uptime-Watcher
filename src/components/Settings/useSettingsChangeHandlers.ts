/**
 * Change application helpers for
 * {@link src/components/Settings/Settings#Settings}.
 *
 * @remarks
 * Extracted from `Settings.tsx` to keep the component focused on rendering and
 * high-level orchestration.
 */

import { useCallback } from "react";
import { objectKeys, safeCastTo, setHas } from "ts-extras";

import type { AppSettings } from "../../stores/types";

import { logger } from "../../services/logger";

type AllowedSettingsKey = (typeof ALLOWED_SETTINGS_KEY_LIST)[number];

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
            const forceSettingsKeys = new Set<AllowedSettingsKey>(
                (options?.forceKeys ?? []).filter(
                    (key): key is AllowedSettingsKey =>
                        ALLOWED_SETTINGS_KEY_STRINGS.has(key)
                )
            );

            // Create a safe update object with validated keys
            const nextSettings = safeCastTo<Partial<AppSettings>>({});

            // Log and apply changes for allowed keys
            for (const allowedKey of ALLOWED_SETTINGS_KEY_LIST) {
                if (allowedKey in changes) {
                    const oldValue = settings[allowedKey];
                    const newValue = changes[allowedKey];
                    const isForced = setHas(forceSettingsKeys, allowedKey);

                    if (
                        newValue !== undefined &&
                        (oldValue !== newValue || isForced)
                    ) {
                        Reflect.set(nextSettings, allowedKey, newValue);

                        logger.user.settingsChange(
                            allowedKey,
                            oldValue,
                            newValue
                        );
                    }
                }
            }

            // Warn about invalid keys
            for (const rawKey of objectKeys(changes)) {
                if (!ALLOWED_SETTINGS_KEY_STRINGS.has(rawKey)) {
                    logger.warn(
                        "Attempted to update invalid settings key",
                        rawKey
                    );
                }
            }

            if (objectKeys(nextSettings).length > 0) {
                updateSettings(nextSettings);
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
