import type { StoreApi } from "zustand";

import {
    DEFAULT_HISTORY_LIMIT_RULES,
    normalizeHistoryLimit,
} from "@shared/constants/history";
import { MAX_MUTED_SITE_NOTIFICATION_IDENTIFIERS } from "@shared/types/notifications";
import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { safeNumberConversion } from "@shared/utils/safeConversions";
import { isValidSiteIdentifier } from "@shared/validation/identifierValidation";
import { isFinite as isFiniteNumber, objectKeys } from "ts-extras";

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
type AppSettingsCandidate = Partial<Record<keyof AppSettings, unknown>>;

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
): number => {
    if (typeof value !== "number") {
        return fallback;
    }

    try {
        return normalizeHistoryLimit(value, DEFAULT_HISTORY_LIMIT_RULES);
    } catch {
        return fallback;
    }
};

const isMutedSiteIdentifierArray = (value: unknown): value is string[] =>
    Array.isArray(value) &&
    value.every(
        (entry) => typeof entry === "string" && isValidSiteIdentifier(entry)
    );

const normalizeMutedSiteIdentifiers = (
    value: unknown,
    fallback: string[]
): string[] =>
    value === undefined || value === fallback
        ? fallback
        : isMutedSiteIdentifierArray(value)
          ? [...new Set(value)].slice(0, MAX_MUTED_SITE_NOTIFICATION_IDENTIFIERS)
          : fallback;

const normalizeThemeSetting = (
    value: unknown,
    fallback: AppSettings["theme"]
): AppSettings["theme"] =>
    typeof value === "string" && isThemeName(value) ? value : fallback;

const getSettingsCandidateValue = (
    candidate: AppSettingsCandidate,
    key: keyof AppSettings
): unknown => {
    const property = getOwnDataProperty(candidate, key);
    return property.found ? property.value : undefined;
};

const buildSettingsUpdateTelemetry = (
    newSettings: Partial<AppSettings>
): Record<string, unknown> => {
    const changedFields = objectKeys(newSettings)
        .filter((key) => getOwnDataProperty(newSettings, key).found)
        .toSorted((left, right) => left.localeCompare(right));
    const telemetry: Record<string, unknown> = { changedFields };

    const autoStart = getSettingsCandidateValue(newSettings, "autoStart");
    if (autoStart !== undefined) {
        telemetry["autoStart"] = autoStart;
    }

    const historyLimit = getSettingsCandidateValue(newSettings, "historyLimit");
    if (historyLimit !== undefined) {
        telemetry["historyLimit"] = historyLimit;
    }

    const inAppAlertsEnabled = getSettingsCandidateValue(
        newSettings,
        "inAppAlertsEnabled"
    );
    if (inAppAlertsEnabled !== undefined) {
        telemetry["inAppAlertsEnabled"] = inAppAlertsEnabled;
    }

    const inAppAlertsSoundEnabled = getSettingsCandidateValue(
        newSettings,
        "inAppAlertsSoundEnabled"
    );
    if (inAppAlertsSoundEnabled !== undefined) {
        telemetry["inAppAlertsSoundEnabled"] = inAppAlertsSoundEnabled;
    }

    const inAppAlertVolume = getSettingsCandidateValue(
        newSettings,
        "inAppAlertVolume"
    );
    if (inAppAlertVolume !== undefined) {
        telemetry["inAppAlertVolume"] = inAppAlertVolume;
    }

    const minimizeToTray = getSettingsCandidateValue(
        newSettings,
        "minimizeToTray"
    );
    if (minimizeToTray !== undefined) {
        telemetry["minimizeToTray"] = minimizeToTray;
    }

    const mutedIdentifiers = getSettingsCandidateValue(
        newSettings,
        "mutedSiteNotificationIdentifiers"
    );
    if (mutedIdentifiers !== undefined) {
        telemetry["mutedSiteNotificationIdentifierCount"] = Array.isArray(
            mutedIdentifiers
        )
            ? mutedIdentifiers.length
            : undefined;
    }

    const systemNotificationsEnabled = getSettingsCandidateValue(
        newSettings,
        "systemNotificationsEnabled"
    );
    if (systemNotificationsEnabled !== undefined) {
        telemetry["systemNotificationsEnabled"] = systemNotificationsEnabled;
    }

    const systemNotificationsSoundEnabled = getSettingsCandidateValue(
        newSettings,
        "systemNotificationsSoundEnabled"
    );
    if (systemNotificationsSoundEnabled !== undefined) {
        telemetry["systemNotificationsSoundEnabled"] =
            systemNotificationsSoundEnabled;
    }

    const theme = getSettingsCandidateValue(newSettings, "theme");
    if (theme !== undefined) {
        telemetry["theme"] = theme;
    }

    return telemetry;
};

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
    candidate: AppSettingsCandidate = {},
    fallback: AppSettings = defaultSettings
): AppSettings => {
    const rest = candidate;
    const autoStart = getSettingsCandidateValue(rest, "autoStart");
    const historyLimit = getSettingsCandidateValue(rest, "historyLimit");
    const inAppAlertsEnabled = getSettingsCandidateValue(
        rest,
        "inAppAlertsEnabled"
    );
    const inAppAlertsSoundEnabled = getSettingsCandidateValue(
        rest,
        "inAppAlertsSoundEnabled"
    );
    const inAppAlertVolume = getSettingsCandidateValue(
        rest,
        "inAppAlertVolume"
    );
    const minimizeToTray = getSettingsCandidateValue(rest, "minimizeToTray");
    const mutedSiteNotificationIdentifiers = getSettingsCandidateValue(
        rest,
        "mutedSiteNotificationIdentifiers"
    );
    const systemNotificationsEnabled = getSettingsCandidateValue(
        rest,
        "systemNotificationsEnabled"
    );
    const systemNotificationsSoundEnabled = getSettingsCandidateValue(
        rest,
        "systemNotificationsSoundEnabled"
    );
    const theme = getSettingsCandidateValue(rest, "theme");

    return {
        autoStart: normalizeBooleanSetting(autoStart, fallback.autoStart),
        historyLimit: normalizeHistoryLimitSetting(
            historyLimit,
            fallback.historyLimit
        ),
        inAppAlertsEnabled: normalizeBooleanSetting(
            inAppAlertsEnabled,
            fallback.inAppAlertsEnabled
        ),
        inAppAlertsSoundEnabled: normalizeBooleanSetting(
            inAppAlertsSoundEnabled,
            fallback.inAppAlertsSoundEnabled
        ),
        inAppAlertVolume: clampInAppAlertVolume(
            inAppAlertVolume,
            fallback.inAppAlertVolume
        ),
        minimizeToTray: normalizeBooleanSetting(
            minimizeToTray,
            fallback.minimizeToTray
        ),
        mutedSiteNotificationIdentifiers: normalizeMutedSiteIdentifiers(
            mutedSiteNotificationIdentifiers,
            fallback.mutedSiteNotificationIdentifiers
        ),
        systemNotificationsEnabled: normalizeBooleanSetting(
            systemNotificationsEnabled,
            fallback.systemNotificationsEnabled
        ),
        systemNotificationsSoundEnabled: normalizeBooleanSetting(
            systemNotificationsSoundEnabled,
            fallback.systemNotificationsSoundEnabled
        ),
        theme: normalizeThemeSetting(theme, fallback.theme),
    };
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
        logStoreAction(
            "SettingsStore",
            "updateSettings",
            buildSettingsUpdateTelemetry(newSettings)
        );
        setState((state) => ({
            settings: normalizeAppSettings(newSettings, state.settings),
        }));
    },
});
