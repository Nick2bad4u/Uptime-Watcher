/**
 * Settings store types and interfaces.
 * Manages application preferences and configuration.
 */

import type { AppSettings } from "../types";

/**
 * Settings store interface.
 * Manages user preferences and application configuration.
 */
export interface SettingsStore {
    /** Initialize settings from backend */
    initializeSettings: () => Promise<{ message: string; settingsLoaded: boolean; success: boolean }>;

    /** Reset all settings to default values */
    resetSettings: () => void;

    // State
    /** Application settings */
    settings: AppSettings;

    /** Update history limit with backend sync */
    updateHistoryLimitValue: (limit: number) => Promise<void>;

    // Actions
    /** Update multiple settings at once */
    updateSettings: (settings: Partial<AppSettings>) => void;
}
