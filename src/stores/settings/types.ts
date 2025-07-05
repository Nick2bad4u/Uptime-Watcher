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
    // State
    /** Application settings */
    settings: AppSettings;

    // Actions
    /** Update multiple settings at once */
    updateSettings: (settings: Partial<AppSettings>) => void;

    /** Reset all settings to default values */
    resetSettings: () => void;

    /** Update history limit with backend sync */
    updateHistoryLimitValue: (limit: number) => Promise<void>;

    /** Initialize settings from backend */
    initializeSettings: () => Promise<{ success: boolean; settingsLoaded: boolean; message: string }>;
}
