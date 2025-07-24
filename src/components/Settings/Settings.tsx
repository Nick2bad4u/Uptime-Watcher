/**
 * Application settings component
 *
 * Provides a comprehensive settings interface for configuring application
 * behavior, theme preferences, monitoring settings, and data management.
 * Includes data synchronization and SQLite backup functionality.
 */

import { useCallback, useEffect, useState } from "react";

import { HISTORY_LIMIT_OPTIONS, UI_DELAYS } from "../../constants";
import logger from "../../services/logger";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useSettingsStore } from "../../stores/settings/useSettingsStore";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import {
    StatusIndicator,
    ThemedBox,
    ThemedButton,
    ThemedCheckbox,
    ThemedSelect,
    ThemedText,
} from "../../theme/components";
import { ThemeName } from "../../theme/types";
import { useTheme } from "../../theme/useTheme";
import { ensureError } from "../../utils/errorHandling";

/**
 * Props for the Settings component
 *
 * @public
 */
export interface SettingsProperties {
    /** Callback function to close the settings modal/view */
    onClose: () => void;
}

/**
 * Settings component providing comprehensive application configuration.
 *
 * Actual features available:
 * - Theme selection (light/dark/system)
 * - History retention limits (25-unlimited records)
 * - Desktop notifications (on/off)
 * - Sound alerts (on/off)
 * - Auto-start with system (on/off)
 * - Minimize to system tray (on/off)
 * - Data synchronization from SQLite backend
 * - SQLite database backup export
 * - Reset all settings to defaults
 *
 * @param props - Component props
 * @returns JSX element containing the settings interface
 */

export function Settings({ onClose }: Readonly<SettingsProperties>) {
    const { clearError, isLoading, lastError, setError } = useErrorStore();
    const { resetSettings, settings, updateHistoryLimitValue, updateSettings } = useSettingsStore();
    const { downloadSQLiteBackup, fullSyncFromBackend } = useSitesStore();

    const { availableThemes, isDark, setTheme } = useTheme();

    // Delayed loading state for button spinners (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);
    // Local state for sync success message
    const [syncSuccess, setSyncSuccess] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setShowButtonLoading(false);
            return () => {}; // Return empty cleanup function for consistency
        }

        const timeoutId = setTimeout(() => {
            setShowButtonLoading(true);
        }, UI_DELAYS.LOADING_BUTTON);

        return () => clearTimeout(timeoutId);
    }, [isLoading]);

    // Only allow keys that are part of AppSettings
    const allowedKeys = new Set<keyof typeof settings>([
        "autoStart",
        "historyLimit",
        "minimizeToTray",
        "notifications",
        "soundAlerts",
        "theme",
    ]);

    const handleSettingChange = (key: keyof typeof settings, value: unknown) => {
        if (!allowedKeys.has(key)) {
            logger.warn("Attempted to update invalid settings key", key);
            return;
        }
        // eslint-disable-next-line security/detect-object-injection
        const oldValue = settings[key];
        updateSettings({ [key]: value });
        logger.user.settingsChange(key, oldValue, value);
    };

    const handleHistoryLimitChange = async (limit: number) => {
        try {
            await updateHistoryLimitValue(limit);
            logger.user.settingsChange("historyLimit", settings.historyLimit, limit);
        } catch (error) {
            logger.error("Failed to update history limit from settings", ensureError(error));
            // Error is already handled by the store action
        }
    };

    const handleReset = () => {
        if (globalThis.confirm("Are you sure you want to reset all settings to defaults?")) {
            resetSettings();
            clearError(); // Clear any errors when resetting
            logger.user.action("Reset settings to defaults");
        }
    };

    const handleThemeChange = (themeName: string) => {
        const oldTheme = settings.theme;
        setTheme(themeName as ThemeName);
        logger.user.settingsChange("theme", oldTheme, themeName);
    };

    // Manual Sync Now handler (moved from Header)
    const handleSyncNow = useCallback(async () => {
        setSyncSuccess(false);
        try {
            await fullSyncFromBackend();
            setSyncSuccess(true);
            logger.user.action("Synced data from SQLite backend");
        } catch (error: unknown) {
            logger.error("Failed to sync data from backend", ensureError(error));
            setError(
                `Failed to sync data: ${
                    error && typeof error === "object" && "message" in error
                        ? (error as { message?: string }).message
                        : String(error)
                }`
            );
        }
    }, [fullSyncFromBackend, setError]);

    const handleDownloadSQLite = async () => {
        setShowButtonLoading(true);
        clearError();
        try {
            await downloadSQLiteBackup();
            logger.user.action("Downloaded SQLite backup");
        } catch (error: unknown) {
            logger.error("Failed to download SQLite backup", ensureError(error));
            setError(
                `Failed to download SQLite backup: ${
                    error && typeof error === "object" && "message" in error
                        ? (error as { message?: string }).message
                        : String(error)
                }`
            );
        } finally {
            setShowButtonLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <ThemedBox className="modal-container" padding="md" rounded="lg" shadow="xl" surface="overlay">
                {/* Header */}
                <ThemedBox border className="border-b" padding="lg" rounded="none" surface="elevated">
                    <div className="flex items-center justify-between">
                        <ThemedText size="xl" weight="semibold">
                            ⚙️ Settings
                        </ThemedText>
                        <ThemedButton className="hover-opacity" onClick={onClose} size="sm" variant="secondary">
                            ✕
                        </ThemedButton>
                    </div>
                </ThemedBox>

                {/* Error Display */}
                {lastError && (
                    <ThemedBox
                        className={`error-alert ${isDark ? "dark" : ""}`}
                        padding="md"
                        rounded="md"
                        surface="base"
                    >
                        <div className="flex items-center justify-between">
                            <ThemedText
                                className={`error-alert__text ${isDark ? "dark" : ""}`}
                                size="sm"
                                variant="primary"
                            >
                                ⚠️ {lastError}
                            </ThemedText>
                            <ThemedButton
                                className={`error-alert__close ${isDark ? "dark" : ""}`}
                                onClick={clearError}
                                size="xs"
                                variant="secondary"
                            >
                                ✕
                            </ThemedButton>
                        </div>
                    </ThemedBox>
                )}
                {/* Sync Success Display */}
                {syncSuccess && !lastError && (
                    <ThemedBox className="success-alert" padding="md" rounded="md" surface="base">
                        <ThemedText size="sm" variant="success">
                            ✅ Data synced from database.
                        </ThemedText>
                    </ThemedBox>
                )}

                {/* Content */}
                <ThemedBox className="space-y-6" padding="lg" surface="base">
                    {/* Monitoring Settings */}
                    <section>
                        <ThemedText className="mb-4" size="lg" weight="medium">
                            🔍 Monitoring
                        </ThemedText>
                        <div className="space-y-4">
                            <div>
                                <ThemedText className="block mb-2" size="sm" variant="secondary" weight="medium">
                                    History Limit
                                </ThemedText>
                                <ThemedSelect
                                    aria-label="Maximum number of history records to keep per site"
                                    disabled={isLoading}
                                    onChange={(event) => {
                                        void handleHistoryLimitChange(Number(event.target.value));
                                    }}
                                    value={settings.historyLimit}
                                >
                                    {HISTORY_LIMIT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </ThemedSelect>
                                <ThemedText className="mt-1" size="xs" variant="secondary">
                                    Maximum number of check results to store per site
                                </ThemedText>
                            </div>
                        </div>
                    </section>

                    {/* Notification Settings */}
                    <section>
                        <ThemedText className="mb-4" size="lg" weight="medium">
                            🔔 Notifications
                        </ThemedText>
                        <div className="space-y-4">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <ThemedText className="setting-title" size="sm" weight="medium">
                                        Desktop Notifications
                                    </ThemedText>
                                    <ThemedText className="setting-description" size="xs" variant="tertiary">
                                        Show notifications when sites go up or down
                                    </ThemedText>
                                </div>
                                <ThemedCheckbox
                                    aria-label="Enable desktop notifications"
                                    checked={settings.notifications}
                                    disabled={isLoading}
                                    onChange={(event) => handleSettingChange("notifications", event.target.checked)}
                                />
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <ThemedText className="setting-title" size="sm" weight="medium">
                                        Sound Alerts
                                    </ThemedText>
                                    <ThemedText className="setting-description" size="xs" variant="tertiary">
                                        Play sound when status changes occur
                                    </ThemedText>
                                </div>
                                <ThemedCheckbox
                                    aria-label="Enable sound alerts"
                                    checked={settings.soundAlerts}
                                    disabled={isLoading}
                                    onChange={(event) => handleSettingChange("soundAlerts", event.target.checked)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Application Settings */}
                    <section>
                        <ThemedText className="mb-4" size="lg" weight="medium">
                            🖥️ Application
                        </ThemedText>
                        <div className="space-y-4">
                            <div>
                                <ThemedText className="block mb-2" size="sm" variant="secondary" weight="medium">
                                    Theme
                                </ThemedText>
                                <ThemedSelect
                                    aria-label="Select application theme"
                                    disabled={isLoading}
                                    onChange={(event) => handleThemeChange(event.target.value)}
                                    value={settings.theme}
                                >
                                    {availableThemes.map((theme) => (
                                        <option key={theme} value={theme}>
                                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                        </option>
                                    ))}
                                </ThemedSelect>
                                <div className="flex items-center gap-2 mt-2">
                                    <ThemedText size="xs" variant="tertiary">
                                        Current theme preview:
                                    </ThemedText>
                                    <StatusIndicator size="sm" status="up" />
                                    <StatusIndicator size="sm" status="down" />
                                    <StatusIndicator size="sm" status="pending" />
                                </div>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <ThemedText className="setting-title" size="sm" weight="medium">
                                        Auto-start with System
                                    </ThemedText>
                                    <ThemedText className="setting-description" size="xs" variant="tertiary">
                                        Launch Uptime Watcher when your computer starts
                                    </ThemedText>
                                </div>
                                <ThemedCheckbox
                                    aria-label="Enable auto-start with system"
                                    checked={settings.autoStart}
                                    disabled={isLoading}
                                    onChange={(event) => handleSettingChange("autoStart", event.target.checked)}
                                />
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <ThemedText className="setting-title" size="sm" weight="medium">
                                        Minimize to System Tray
                                    </ThemedText>
                                    <ThemedText className="setting-description" size="xs" variant="tertiary">
                                        Keep app running in system tray when window is closed
                                    </ThemedText>
                                </div>
                                <ThemedCheckbox
                                    aria-label="Enable minimize to system tray"
                                    checked={settings.minimizeToTray}
                                    disabled={isLoading}
                                    onChange={(event) => handleSettingChange("minimizeToTray", event.target.checked)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Data Management */}
                    <section>
                        <ThemedText className="mb-4" size="lg" weight="medium">
                            📂 Data Management
                        </ThemedText>
                        <div className="space-y-4">
                            {/* Sync Data Button */}
                            <ThemedButton
                                className="w-full"
                                disabled={isLoading}
                                loading={showButtonLoading}
                                onClick={() => {
                                    void handleSyncNow();
                                }}
                                size="sm"
                                variant="secondary"
                            >
                                🔄 Sync Data
                            </ThemedButton>

                            {/* SQLite direct download */}
                            <div>
                                <ThemedText className="block mb-2" size="sm" variant="secondary" weight="medium">
                                    Export SQLite Database
                                </ThemedText>
                                <ThemedButton
                                    disabled={isLoading || showButtonLoading}
                                    loading={showButtonLoading}
                                    onClick={() => {
                                        void handleDownloadSQLite();
                                    }}
                                    size="sm"
                                    variant="primary"
                                >
                                    Download SQLite Backup
                                </ThemedButton>
                                <ThemedText className="block mt-1" size="xs" variant="tertiary">
                                    Download a direct backup of the raw SQLite database file for advanced backup or
                                    migration.
                                </ThemedText>
                            </div>
                        </div>
                    </section>
                </ThemedBox>

                {/* Footer */}
                <ThemedBox border className="border-t" padding="lg" rounded="none" surface="elevated">
                    <div className="flex items-center justify-between">
                        <ThemedButton
                            disabled={isLoading}
                            loading={showButtonLoading}
                            onClick={handleReset}
                            size="sm"
                            variant="error"
                        >
                            Reset to Defaults
                        </ThemedButton>
                        <div className="flex items-center space-x-3">
                            <ThemedButton disabled={isLoading} onClick={onClose} size="sm" variant="secondary">
                                Cancel
                            </ThemedButton>
                            <ThemedButton loading={showButtonLoading} onClick={onClose} size="sm" variant="primary">
                                Save Changes
                            </ThemedButton>
                        </div>
                    </div>
                </ThemedBox>
            </ThemedBox>
        </div>
    );
}
