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
     * Reset all settings to default values with backend synchronization
     *
     * @returns Promise resolving to operation result
     *
     * @remarks
     * This method performs both local and backend reset operations.
     * Backend synchronization ensures settings are persisted across
     * application restarts and synchronized with other instances.
     */
    resetSettings: () => Promise<{ message: string; success: boolean }>;

    // State
    /** Application settings */
    settings: AppSettings;

    /** Force synchronize settings from backend */
    syncFromBackend: () => Promise<{ message: string; success: boolean }>;

    /** Update history limit with backend sync */
    updateHistoryLimitValue: (limit: number) => Promise<void>;

    /** Update multiple settings at once */
    updateSettings: (settings: Partial<AppSettings>) => void;
}
