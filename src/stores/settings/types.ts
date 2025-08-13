/**
 * Settings store types and interfaces.
 * Manages application preferences and configuration.
 *
 * @remarks
 * Defines the interface for the settings store which handles user preferences,
 * application configuration, and backend synchronization for persistent
 * settings.
 *
 * @packageDocumentation
 */

import type { AppSettings } from "../types";

/**
 * Settings store interface for managing application configuration.
 *
 * @remarks
 * Comprehensive interface for settings management that provides:
 * - Initialization from backend and local storage
 * - Real-time settings updates with persistence
 * - Backend synchronization for critical values
 * - Reset functionality to restore defaults
 * - History limit management with validation
 *
 * All operations include error handling and logging for debugging
 * and user feedback purposes.
 *
 * @public
 */
export interface SettingsStore {
    /**
     * Initializes settings from backend and local storage.
     *
     * @remarks
     * Performs comprehensive settings initialization by:
     * - Loading saved settings from persistent storage
     * - Synchronizing critical values with backend
     * - Merging default values for missing settings
     * - Handling initialization errors gracefully
     *
     * Should be called during application startup to ensure
     * settings are properly configured.
     *
     * @returns Promise resolving to initialization result with status indicators
     */
    initializeSettings: () => Promise<{
        message: string;
        settingsLoaded: boolean;
        success: boolean;
    }>;

    /**
     * Resets all settings to default values with backend synchronization.
     *
     * @remarks
     * Performs a complete settings reset by:
     * - Restoring all settings to default values
     * - Synchronizing reset values with backend
     * - Updating persistent storage
     * - Providing user feedback on operation status
     *
     * This operation cannot be undone and affects all user preferences.
     * Backend synchronization ensures settings are persisted across
     * application restarts and synchronized with other instances.
     *
     * @returns Promise resolving to reset operation result
     */
    resetSettings: () => Promise<{ message: string; success: boolean }>;

    /**
     * Current application settings configuration.
     *
     * @remarks
     * Contains all user preferences and application configuration
     * including theme settings, notification preferences, monitoring
     * parameters, and other customizable options.
     */
    settings: AppSettings;

    /**
     * Forces synchronization of settings from backend storage.
     *
     * @remarks
     * Fetches the latest settings from backend storage and merges
     * them with current local settings. Used to ensure consistency
     * between frontend state and backend storage, especially after
     * external configuration changes.
     *
     * @returns Promise resolving to synchronization result with status indicators
     */
    syncFromBackend: () => Promise<{ message: string; success: boolean }>;

    /**
     * Updates history retention limit with backend synchronization.
     *
     * @remarks
     * Updates the history limit setting with special handling:
     * - Validates the new limit value
     * - Synchronizes with backend immediately
     * - Updates local state and persistent storage
     *
     * This setting is critical for data management and requires
     * immediate backend synchronization.
     *
     * @param limit - New history limit value in number of records
     * @returns Promise that resolves when update is complete
     */
    updateHistoryLimitValue: (limit: number) => Promise<void>;

    /**
     * Updates multiple application settings with persistence.
     *
     * @remarks
     * Updates one or more settings values with automatic persistence
     * to local storage. Changes are merged with existing settings
     * to preserve unmodified values.
     *
     * For critical settings that require backend synchronization,
     * use the specific update methods instead.
     *
     * @param settings - Partial settings object with values to update
     */
    updateSettings: (settings: Partial<AppSettings>) => void;
}
