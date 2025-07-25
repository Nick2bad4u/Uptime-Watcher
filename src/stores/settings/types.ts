/**
 * Settings store types and interfaces.
 * Manages application preferences and configuration.
 *
 * @remarks
 * Defines the interface for the settings store which handles user preferences,
 * application configuration, and backend synchronization for persistent settings.
 *
 * @packageDocumentation
 */

import type { AppSettings } from "../types";

/**
 * Settings store interface for managing application configuration.
 *
 * @remarks
 * Manages user preferences and application configuration with backend synchronization.
 * Provides methods for initializing, updating, and resetting application settings.
 *
 * @public
 */
export interface SettingsStore {
    /** Initialize settings from backend */
    initializeSettings: () => Promise<{ message: string; settingsLoaded: boolean; success: boolean }>;

    /**
     * Reset all settings to default values
     *
     * @remarks
     * This method performs a synchronous reset to default values.
     * For consistency with other backend operations, this could be made async
     * in the future if backend synchronization is required for reset operations.
     */
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
