import type { StoreApi } from "zustand";

import { safeNumberConversion } from "@shared/utils/safeConversions";

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
const DEFAULT_IN_APP_ALERT_VOLUME = 1;

interface LegacySettingsSnapshot {
    /** Legacy desktop notification toggle persisted before alert split */
    notifications?: boolean;
    /** Legacy shared sound toggle persisted before alert split */
    soundAlerts?: boolean;
}

/**
 * Default application settings applied during initialization.
 */
export const defaultSettings: AppSettings = {
    autoStart: false,
    historyLimit: DEFAULT_SETTINGS_HISTORY_LIMIT,
    inAppAlertsEnabled: true,
    inAppAlertsSoundEnabled: false,
    inAppAlertVolume: DEFAULT_IN_APP_ALERT_VOLUME,
    minimizeToTray: true,
    mutedSiteNotificationIdentifiers: [],
    systemNotificationsEnabled: false,
    systemNotificationsSoundEnabled: false,
    theme: "system",
};

/**
 * Normalizes the in-app alert volume slider value.
 *
 * @remarks
 * Ensures persisted values remain within the inclusive range [0, 1] while
 * defaulting to {@link DEFAULT_IN_APP_ALERT_VOLUME} when the candidate cannot be
 * represented as a finite number.
 *
 * @param value - Candidate volume value to sanitize.
 * @param fallback - Fallback volume applied when the candidate is invalid.
 *
 * @returns Sanitized volume within `[0, 1]`.
 */
const clampInAppAlertVolume = (
    value: unknown,
    fallback: number = DEFAULT_IN_APP_ALERT_VOLUME
): number => {
    const sanitizedFallback = Number.isFinite(fallback)
        ? fallback
        : DEFAULT_IN_APP_ALERT_VOLUME;
    const numeric = safeNumberConversion(value, sanitizedFallback);

    if (!Number.isFinite(numeric)) {
        return sanitizedFallback;
    }

    if (numeric <= 0) {
        return 0;
    }

    if (numeric >= 1) {
        return 1;
    }

    return numeric;
};

/**
 * Normalizes persisted or partial settings objects into a complete
 * {@link AppSettings} structure.
 *
 * @remarks
 * Handles migration from legacy fields (`notifications`, `soundAlerts`) by
 * mapping them to the new alert-specific toggles. Missing properties are filled
 * with {@link defaultSettings} to guarantee a fully-populated settings object.
 *
 * @param candidate - Partial settings snapshot, potentially containing legacy
 *   fields.
 *
 * @returns A fully normalized settings object.
 */
export const normalizeAppSettings = (
    candidate: LegacySettingsSnapshot & Partial<AppSettings> = {}
): AppSettings => {
    const { notifications, soundAlerts, ...rest } = candidate;

    const merged: AppSettings = {
        ...defaultSettings,
        ...rest,
    } as AppSettings;

    merged.inAppAlertVolume = clampInAppAlertVolume(
        rest.inAppAlertVolume,
        merged.inAppAlertVolume
    );

    const hasExplicitSystemNotificationOverride = Object.hasOwn(
        rest,
        "systemNotificationsEnabled"
    );

    if (notifications !== undefined && !hasExplicitSystemNotificationOverride) {
        merged.systemNotificationsEnabled = notifications;
    }

    if (soundAlerts !== undefined) {
        const soundPreference = soundAlerts;
        if (!Object.hasOwn(rest, "inAppAlertsSoundEnabled")) {
            merged.inAppAlertsSoundEnabled = soundPreference;
        }
        if (!Object.hasOwn(rest, "systemNotificationsSoundEnabled")) {
            merged.systemNotificationsSoundEnabled = soundPreference;
        }
    }

    return merged;
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
    settings: normalizeAppSettings(),
    updateSettings: (newSettings): void => {
        logStoreAction("SettingsStore", "updateSettings", {
            newSettings,
        });
        setState((state) => ({
            settings: normalizeAppSettings({
                ...state.settings,
                ...newSettings,
            }),
        }));
    },
});
