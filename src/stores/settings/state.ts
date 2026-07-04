import type { StoreApi } from "zustand";

import { safeNumberConversion } from "@shared/utils/safeConversions";
import { isFinite as isFiniteNumber, safeCastTo } from "ts-extras";

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
import { isThemeName } from "../../theme/types";
import { logStoreAction } from "../utils";

const DEFAULT_SETTINGS_HISTORY_LIMIT = DEFAULT_HISTORY_LIMIT;
const DEFAULT_IN_APP_ALERT_VOLUME = 1;

/**
 * Default app settings applied during initialization.
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
    const sanitizedFallback = isFiniteNumber(fallback)
        ? fallback
        : DEFAULT_IN_APP_ALERT_VOLUME;
    const numeric = safeNumberConversion(value, sanitizedFallback);

    if (!isFiniteNumber(numeric)) {
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

const normalizeBooleanSetting = (value: unknown, fallback: boolean): boolean =>
    typeof value === "boolean" ? value : fallback;

const normalizeHistoryLimitSetting = (
    value: unknown,
    fallback: number
): number =>
    typeof value === "number" && isFiniteNumber(value) ? value : fallback;

const normalizeMutedSiteIdentifiers = (
    value: unknown,
    fallback: string[]
): string[] =>
    value === undefined || value === fallback
        ? fallback
        : Array.isArray(value) &&
            value.every((entry) => typeof entry === "string")
          ? [...value]
          : fallback;

const normalizeThemeSetting = (
    value: unknown,
    fallback: AppSettings["theme"]
): AppSettings["theme"] =>
    typeof value === "string" && isThemeName(value) ? value : fallback;

/**
 * Normalizes persisted or partial settings objects into a complete
 * {@link AppSettings} structure.
 *
 * @remarks
 * Missing properties are filled with {@link defaultSettings} to guarantee a
 * fully-populated settings object.
 *
 * @param candidate - Partial settings snapshot.
 *
 * @returns A fully normalized settings object.
 */
export const normalizeAppSettings = (
    candidate: Partial<AppSettings> = {},
    fallback: AppSettings = defaultSettings
): AppSettings => {
    const rest = candidate;

    const merged: AppSettings = safeCastTo({
        ...defaultSettings,
        ...fallback,
        ...rest,
    });

    merged.autoStart = normalizeBooleanSetting(
        rest.autoStart,
        fallback.autoStart
    );
    merged.historyLimit = normalizeHistoryLimitSetting(
        rest.historyLimit,
        fallback.historyLimit
    );
    merged.inAppAlertsEnabled = normalizeBooleanSetting(
        rest.inAppAlertsEnabled,
        fallback.inAppAlertsEnabled
    );
    merged.inAppAlertsSoundEnabled = normalizeBooleanSetting(
        rest.inAppAlertsSoundEnabled,
        fallback.inAppAlertsSoundEnabled
    );
    merged.inAppAlertVolume = clampInAppAlertVolume(
        rest.inAppAlertVolume,
        fallback.inAppAlertVolume
    );
    merged.minimizeToTray = normalizeBooleanSetting(
        rest.minimizeToTray,
        fallback.minimizeToTray
    );
    merged.mutedSiteNotificationIdentifiers = normalizeMutedSiteIdentifiers(
        rest.mutedSiteNotificationIdentifiers,
        fallback.mutedSiteNotificationIdentifiers
    );
    merged.systemNotificationsEnabled = normalizeBooleanSetting(
        rest.systemNotificationsEnabled,
        fallback.systemNotificationsEnabled
    );
    merged.systemNotificationsSoundEnabled = normalizeBooleanSetting(
        rest.systemNotificationsSoundEnabled,
        fallback.systemNotificationsSoundEnabled
    );
    merged.theme = normalizeThemeSetting(rest.theme, fallback.theme);

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
            settings: normalizeAppSettings(
                {
                    ...state.settings,
                    ...newSettings,
                },
                state.settings
            ),
        }));
    },
});
