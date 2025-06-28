import { useState, useEffect, useCallback } from "react";

import { HISTORY_LIMIT_OPTIONS, TIMEOUT_CONSTRAINTS, UI_DELAYS } from "../../constants";
import logger from "../../services/logger";
import { useStore } from "../../store";
import {
    ThemedBox,
    ThemedText,
    ThemedButton,
    StatusIndicator,
    ThemedInput,
    ThemedSelect,
    ThemedCheckbox,
} from "../../theme/components";
import { ThemeName } from "../../theme/types";
import { useTheme } from "../../theme/useTheme";

interface SettingsProps {
    onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
    const {
        clearError,
        downloadSQLiteBackup, // <-- keep this
        fullSyncFromBackend,
        isLoading,
        lastError,
        resetSettings,
        setError, // <-- keep this
        settings,
        updateHistoryLimitValue,
        updateSettings,
    } = useStore();

    const { availableThemes, isDark, setTheme } = useTheme();

    // Delayed loading state for button spinners (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);
    // Local state for sync success message
    const [syncSuccess, setSyncSuccess] = useState(false);

    useEffect(() => {
        if (isLoading) {
            const timeoutId = setTimeout(() => {
                setShowButtonLoading(true);
            }, UI_DELAYS.LOADING_BUTTON);
            return () => {
                clearTimeout(timeoutId);
            };
        } else {
            setShowButtonLoading(false);
        }
    }, [isLoading]);

    // Only allow keys that are part of AppSettings
    const allowedKeys: Array<keyof typeof settings> = [
        "notifications",
        "autoStart",
        "minimizeToTray",
        "theme",
        "timeout",
        "maxRetries",
        "soundAlerts",
        "historyLimit",
    ];

    const handleSettingChange = (key: keyof typeof settings, value: unknown) => {
        if (!allowedKeys.includes(key)) {
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
            logger.error("Failed to update history limit from settings", error);
            // Error is already handled by the store action
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
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
            logger.error("Failed to sync data from backend", error);
            setError(
                "Failed to sync data: " +
                    (error && typeof error === "object" && "message" in error
                        ? (error as { message?: string }).message
                        : String(error))
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
            logger.error("Failed to download SQLite backup", error);
            setError(
                "Failed to download SQLite backup: " +
                    (error && typeof error === "object" && "message" in error
                        ? (error as { message?: string }).message
                        : String(error))
            );
        } finally {
            setShowButtonLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <ThemedBox surface="overlay" padding="md" rounded="lg" shadow="xl" className="modal-container">
                {/* Header */}
                <ThemedBox surface="elevated" padding="lg" rounded="none" border className="border-b">
                    <div className="flex items-center justify-between">
                        <ThemedText size="xl" weight="semibold">
                            ⚙️ Settings
                        </ThemedText>
                        <ThemedButton variant="secondary" size="sm" onClick={onClose} className="hover-opacity">
                            ✕
                        </ThemedButton>
                    </div>
                </ThemedBox>

                {/* Error Display */}
                {lastError && (
                    <ThemedBox
                        surface="base"
                        padding="md"
                        className={`error-alert ${isDark ? "dark" : ""}`}
                        rounded="md"
                    >
                        <div className="flex items-center justify-between">
                            <ThemedText
                                variant="primary"
                                size="sm"
                                className={`error-alert__text ${isDark ? "dark" : ""}`}
                            >
                                ⚠️ {lastError}
                            </ThemedText>
                            <ThemedButton
                                variant="secondary"
                                size="xs"
                                onClick={clearError}
                                className={`error-alert__close ${isDark ? "dark" : ""}`}
                            >
                                ✕
                            </ThemedButton>
                        </div>
                    </ThemedBox>
                )}
                {/* Sync Success Display */}
                {syncSuccess && !lastError && (
                    <ThemedBox surface="base" padding="md" className="success-alert" rounded="md">
                        <ThemedText variant="success" size="sm">
                            ✅ Data synced from database.
                        </ThemedText>
                    </ThemedBox>
                )}

                {/* Content */}
                <ThemedBox surface="base" padding="lg" className="space-y-6">
                    {/* Monitoring Settings */}
                    <section>
                        <ThemedText size="lg" weight="medium" className="mb-4">
                            🔍 Monitoring
                        </ThemedText>
                        <div className="space-y-4">
                            <div>
                                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                                    History Limit
                                </ThemedText>
                                <ThemedSelect
                                    value={settings.historyLimit}
                                    onChange={(e) => handleHistoryLimitChange(Number(e.target.value))}
                                    disabled={isLoading}
                                    aria-label="Maximum number of history records to keep per site"
                                >
                                    {HISTORY_LIMIT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </ThemedSelect>
                                <ThemedText size="xs" variant="secondary" className="mt-1">
                                    Maximum number of check results to store per site
                                </ThemedText>
                            </div>

                            <div>
                                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                                    Request Timeout (ms)
                                </ThemedText>
                                <ThemedInput
                                    type="number"
                                    min={TIMEOUT_CONSTRAINTS.MIN}
                                    max={TIMEOUT_CONSTRAINTS.MAX}
                                    step={TIMEOUT_CONSTRAINTS.STEP}
                                    value={settings.timeout}
                                    onChange={(e) => handleSettingChange("timeout", Number(e.target.value))}
                                    disabled={isLoading}
                                    aria-label="Request timeout in milliseconds"
                                />
                                <ThemedText size="xs" variant="tertiary" className="block mt-1">
                                    How long to wait for a response before considering a site down
                                </ThemedText>
                            </div>

                            <div>
                                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                                    Max Retries
                                </ThemedText>
                                <ThemedInput
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={settings.maxRetries}
                                    onChange={(e) => handleSettingChange("maxRetries", Number(e.target.value))}
                                    disabled={isLoading}
                                    aria-label="Maximum number of retry attempts"
                                />
                                <ThemedText size="xs" variant="tertiary" className="block mt-1">
                                    Number of retry attempts before marking a site as down
                                </ThemedText>
                            </div>
                        </div>
                    </section>

                    {/* Notification Settings */}
                    <section>
                        <ThemedText size="lg" weight="medium" className="mb-4">
                            🔔 Notifications
                        </ThemedText>
                        <div className="space-y-4">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <ThemedText size="sm" weight="medium" className="setting-title">
                                        Desktop Notifications
                                    </ThemedText>
                                    <ThemedText size="xs" variant="tertiary" className="setting-description">
                                        Show notifications when sites go up or down
                                    </ThemedText>
                                </div>
                                <ThemedCheckbox
                                    checked={settings.notifications}
                                    onChange={(e) => handleSettingChange("notifications", e.target.checked)}
                                    disabled={isLoading}
                                    aria-label="Enable desktop notifications"
                                />
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <ThemedText size="sm" weight="medium" className="setting-title">
                                        Sound Alerts
                                    </ThemedText>
                                    <ThemedText size="xs" variant="tertiary" className="setting-description">
                                        Play sound when status changes occur
                                    </ThemedText>
                                </div>
                                <ThemedCheckbox
                                    checked={settings.soundAlerts}
                                    onChange={(e) => handleSettingChange("soundAlerts", e.target.checked)}
                                    disabled={isLoading}
                                    aria-label="Enable sound alerts"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Application Settings */}
                    <section>
                        <ThemedText size="lg" weight="medium" className="mb-4">
                            🖥️ Application
                        </ThemedText>
                        <div className="space-y-4">
                            <div>
                                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                                    Theme
                                </ThemedText>
                                <ThemedSelect
                                    value={settings.theme}
                                    onChange={(e) => handleThemeChange(e.target.value)}
                                    disabled={isLoading}
                                    aria-label="Select application theme"
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
                                    <StatusIndicator status="up" size="sm" />
                                    <StatusIndicator status="down" size="sm" />
                                    <StatusIndicator status="pending" size="sm" />
                                </div>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <ThemedText size="sm" weight="medium" className="setting-title">
                                        Auto-start with System
                                    </ThemedText>
                                    <ThemedText size="xs" variant="tertiary" className="setting-description">
                                        Launch Uptime Watcher when your computer starts
                                    </ThemedText>
                                </div>
                                <ThemedCheckbox
                                    checked={settings.autoStart}
                                    onChange={(e) => handleSettingChange("autoStart", e.target.checked)}
                                    disabled={isLoading}
                                    aria-label="Enable auto-start with system"
                                />
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <ThemedText size="sm" weight="medium" className="setting-title">
                                        Minimize to System Tray
                                    </ThemedText>
                                    <ThemedText size="xs" variant="tertiary" className="setting-description">
                                        Keep app running in system tray when window is closed
                                    </ThemedText>
                                </div>
                                <ThemedCheckbox
                                    checked={settings.minimizeToTray}
                                    onChange={(e) => handleSettingChange("minimizeToTray", e.target.checked)}
                                    disabled={isLoading}
                                    aria-label="Enable minimize to system tray"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Data Management */}
                    <section>
                        <ThemedText size="lg" weight="medium" className="mb-4">
                            📂 Data Management
                        </ThemedText>
                        <div className="space-y-4">
                            {/* Sync Data Button */}
                            <ThemedButton
                                variant="secondary"
                                size="sm"
                                onClick={handleSyncNow}
                                loading={showButtonLoading}
                                disabled={isLoading}
                                className="w-full"
                            >
                                🔄 Sync Data
                            </ThemedButton>

                            {/* SQLite direct download */}
                            <div>
                                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                                    Export SQLite Database
                                </ThemedText>
                                <ThemedButton
                                    variant="primary"
                                    size="sm"
                                    onClick={handleDownloadSQLite}
                                    disabled={isLoading || showButtonLoading}
                                    loading={showButtonLoading}
                                >
                                    Download SQLite Backup
                                </ThemedButton>
                                <ThemedText size="xs" variant="tertiary" className="block mt-1">
                                    Download a direct backup of the raw SQLite database file for advanced backup or
                                    migration.
                                </ThemedText>
                            </div>
                        </div>
                    </section>
                </ThemedBox>

                {/* Footer */}
                <ThemedBox surface="elevated" padding="lg" rounded="none" border className="border-t">
                    <div className="flex items-center justify-between">
                        <ThemedButton
                            variant="error"
                            size="sm"
                            onClick={handleReset}
                            disabled={isLoading}
                            loading={showButtonLoading}
                        >
                            Reset to Defaults
                        </ThemedButton>
                        <div className="flex items-center space-x-3">
                            <ThemedButton variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
                                Cancel
                            </ThemedButton>
                            <ThemedButton variant="primary" size="sm" onClick={onClose} loading={showButtonLoading}>
                                Save Changes
                            </ThemedButton>
                        </div>
                    </div>
                </ThemedBox>
            </ThemedBox>
        </div>
    );
}
