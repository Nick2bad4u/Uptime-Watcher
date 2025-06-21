import { useStore } from "../store";
import { ThemeName } from "../theme/types";
import {
    ThemedBox,
    ThemedText,
    ThemedButton,
    StatusIndicator,
    ThemedInput,
    ThemedSelect,
    ThemedCheckbox,
} from "../theme/components";
import { useTheme } from "../theme/useTheme";
import { CHECK_INTERVALS, HISTORY_LIMIT_OPTIONS, TIMEOUT_CONSTRAINTS, UI_DELAYS } from "../constants";
import { useState, useEffect } from "react";
import logger from "../services/logger";

interface SettingsProps {
    onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
    const {
        settings,
        updateSettings,
        resetSettings,
        checkInterval,
        lastError,
        clearError,
        isLoading,
        updateCheckIntervalValue,
        updateHistoryLimitValue,
        exportAppData,
        importAppData,
    } = useStore();

    const { setTheme, availableThemes, isDark } = useTheme();

    // Delayed loading state for button spinners (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isLoading) {
            // Show button loading after 100ms delay
            timeoutId = setTimeout(() => {
                setShowButtonLoading(true);
            }, UI_DELAYS.LOADING_BUTTON);
        } else {
            // Hide button loading immediately when loading stops
            setShowButtonLoading(false);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isLoading]);

    const handleSettingChange = (key: keyof typeof settings, value: unknown) => {
        const oldValue = settings[key];
        updateSettings({ [key]: value });
        logger.user.settingsChange(key, oldValue, value);
    };

    const handleIntervalChange = async (interval: number) => {
        try {
            await updateCheckIntervalValue(interval);
            logger.user.settingsChange("checkInterval", checkInterval, interval);
        } catch (error) {
            logger.error("Failed to update check interval from settings", error);
            // Error is already handled by the store action
        }
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

    const handleExportData = async () => {
        try {
            const data = await exportAppData();
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `uptime-watcher-backup-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            logger.user.action("Exported app data");
        } catch (error) {
            logger.error("Failed to export data from settings", error);
            // Error is already handled by the store action
        }
    };

    const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const success = await importAppData(text);
            if (success) {
                logger.user.action("Imported app data successfully");
                // Refresh the page to show imported data
                window.location.reload();
            }
        } catch (error) {
            logger.error("Failed to import data from settings", error);
            // Error is already handled by the store action
        } finally {
            // Reset file input
            event.target.value = "";
        }
    };

    return (
        <div className="modal-overlay">
            <ThemedBox surface="overlay" padding="md" rounded="lg" shadow="xl" className="modal-container">
                {/* Header */}
                <ThemedBox surface="elevated" padding="lg" rounded="none" border={true} className="border-b">
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
                                    Check Interval
                                </ThemedText>
                                <ThemedSelect
                                    value={checkInterval}
                                    onChange={(e) => handleIntervalChange(Number(e.target.value))}
                                    disabled={isLoading}
                                    aria-label="Check interval for monitoring sites"
                                >
                                    {CHECK_INTERVALS.map((interval) => (
                                        <option key={interval.value} value={interval.value}>
                                            {interval.label}
                                        </option>
                                    ))}
                                </ThemedSelect>
                            </div>

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
                                <ThemedText size="xs" variant="tertiary" className="mt-1 block">
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
                                <ThemedText size="xs" variant="tertiary" className="mt-1 block">
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
                                <div className="mt-2 flex items-center gap-2">
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
                            <div>
                                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                                    Export Data
                                </ThemedText>
                                <ThemedButton
                                    variant="primary"
                                    size="sm"
                                    onClick={handleExportData}
                                    disabled={isLoading}
                                >
                                    Download Backup
                                </ThemedButton>
                                <ThemedText size="xs" variant="tertiary" className="mt-1 block">
                                    Backup your data and settings as a JSON file
                                </ThemedText>
                            </div>

                            <div>
                                <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                                    Import Data
                                </ThemedText>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportData}
                                    disabled={isLoading}
                                    aria-label="Import data from a JSON file"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark disabled:opacity-50"
                                />
                                <ThemedText size="xs" variant="tertiary" className="mt-1 block">
                                    Restore your data and settings from a backup file
                                </ThemedText>
                            </div>
                        </div>
                    </section>
                </ThemedBox>

                {/* Footer */}
                <ThemedBox surface="elevated" padding="lg" rounded="none" border={true} className="border-t">
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
