/**
 * Application settings component providing comprehensive configuration
 * interface.
 *
 * @remarks
 * This component serves as the primary settings interface for the entire
 * application, offering both basic user preferences and advanced system
 * configuration options. It integrates with multiple stores to provide a
 * centralized configuration experience.
 *
 * The component handles both local preference updates and backend data
 * synchronization, ensuring settings are properly persisted across application
 * sessions. Error handling is integrated throughout to provide user feedback on
 * any configuration issues.
 *
 * Key architectural features:
 *
 * - Uses Zustand stores for state management with persistence
 * - Implements optimistic updates with error rollback
 * - Provides data export/import capabilities for backup scenarios
 * - Integrates with system theme preferences
 *
 * @example
 *
 * ```tsx
 * // In a modal or dedicated settings view
 * <Settings onClose={() => setSettingsOpen(false)} />;
 * ```
 *
 * @param props - Component configuration properties
 *
 * @returns Fully configured settings interface component
 *
 * @public
 */

import type { ChangeEvent } from "react";
import type { JSX } from "react/jsx-runtime";

import { ensureError } from "@shared/utils/errorHandling";
import { safeInteger } from "@shared/validation/validatorUtils";
import { useCallback, useMemo, useState } from "react";

import type { AppSettings } from "../../stores/types";
import type { ThemeName } from "../../theme/types";

import { DEFAULT_HISTORY_LIMIT, HISTORY_LIMIT_OPTIONS } from "../../constants";
import { useDelayedButtonLoading } from "../../hooks/useDelayedButtonLoading";
import { logger } from "../../services/logger";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useSettingsStore } from "../../stores/settings/useSettingsStore";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { StatusIndicator } from "../../theme/components/StatusIndicator";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedCheckbox } from "../../theme/components/ThemedCheckbox";
import { ThemedSelect } from "../../theme/components/ThemedSelect";
import { ThemedText } from "../../theme/components/ThemedText";
import { useTheme } from "../../theme/useTheme";
import { ErrorAlert } from "../common/ErrorAlert/ErrorAlert";
import { SettingItem } from "../shared/SettingItem";

/**
 * Allowed settings keys that can be updated
 */
const ALLOWED_SETTINGS_KEYS = new Set<keyof AppSettings>([
    "autoStart",
    "historyLimit",
    "minimizeToTray",
    "notifications",
    "soundAlerts",
    "theme",
]);

/**
 * Props for the Settings component
 *
 * @public
 */
export interface SettingsProperties {
    /** Callback function to close the settings modal/view */
    onClose: () => void;
}

/*
 * ESLint disable: The Settings component has conflicts between rules:
 * - @arthurgeron/react-usememo/require-usememo wants JSX wrapped in useMemo
 * - react/no-unstable-nested-components forbids components in render
 * These requirements are mutually exclusive for complex forms.
 */
/* eslint-disable @arthurgeron/react-usememo/require-usememo, react/no-unstable-nested-components -- Performance vs clean code tradeoff: Form validation requires memoization but also needs nested components for dynamic validation rules */

/**
 * Settings component providing comprehensive application configuration.
 *
 * Actual features available:
 *
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
 *
 * @returns JSX element containing the settings interface
 */

export const Settings = ({
    onClose,
}: Readonly<SettingsProperties>): JSX.Element => {
    const { clearError, isLoading, lastError, setError } = useErrorStore();
    const { persistHistoryLimit, resetSettings, settings, updateSettings } =
        useSettingsStore();
    const { downloadSQLiteBackup, fullResyncSites } = useSitesStore();

    const { availableThemes, setTheme } = useTheme();

    // Delayed loading state for button spinners (managed by custom hook)
    const showButtonLoading = useDelayedButtonLoading(isLoading);
    // Local state for sync success message
    const [syncSuccess, setSyncSuccess] = useState(false);

    const handleSettingChange = useCallback(
        (key: keyof typeof settings, value: unknown) => {
            if (!ALLOWED_SETTINGS_KEYS.has(key)) {
                logger.warn("Attempted to update invalid settings key", key);
                return;
            }

            const oldValue = settings[key];
            updateSettings({ [key]: value });
            logger.user.settingsChange(key, oldValue, value);
        },
        [settings, updateSettings]
    );

    const handleHistoryLimitChange = useCallback(
        async (limit: number) => {
            try {
                // Get the actual primitive value from settings using safe
                // conversion
                const oldLimit = safeInteger(
                    settings.historyLimit,
                    DEFAULT_HISTORY_LIMIT,
                    1,
                    50_000
                );

                await persistHistoryLimit(limit);

                // Log the change after successful update
                logger.user.settingsChange("historyLimit", oldLimit, limit);
            } catch (error) {
                logger.error(
                    "Failed to update history limit from settings",
                    ensureError(error)
                );
                // Error is already handled by the store action
            }
        },
        [persistHistoryLimit, settings.historyLimit]
    );

    const handleReset = useCallback(() => {
        // Use window.confirm instead of globalThis for better React
        // compatibility
        if (
            // eslint-disable-next-line no-alert -- Legacy confirmation dialog for destructive action, requires UI refactoring to replace
            window.confirm(
                "Are you sure you want to reset all settings to defaults?"
            )
        ) {
            void resetSettings(); // Explicitly mark promise as ignored for fire-and-forget operation
            clearError(); // Clear any errors when resetting
            logger.user.action("Reset settings to defaults");
        }
    }, [clearError, resetSettings]);

    const handleThemeChange = useCallback(
        (themeName: string) => {
            const oldTheme = settings.theme;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: Theme name validation from known theme options
            setTheme(themeName as ThemeName);
            logger.user.settingsChange("theme", oldTheme, themeName);
        },
        [setTheme, settings.theme]
    );

    // Memoized event handlers to prevent unnecessary re-renders
    const handleHistoryLimitSelectChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            void handleHistoryLimitChange(Number(event.target.value));
        },
        [handleHistoryLimitChange]
    );

    const handleNotificationsChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            handleSettingChange("notifications", event.target.checked);
        },
        [handleSettingChange]
    );

    const handleSoundAlertsChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            handleSettingChange("soundAlerts", event.target.checked);
        },
        [handleSettingChange]
    );

    const handleAutoStartChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            handleSettingChange("autoStart", event.target.checked);
        },
        [handleSettingChange]
    );

    const handleMinimizeToTrayChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            handleSettingChange("minimizeToTray", event.target.checked);
        },
        [handleSettingChange]
    );

    const handleThemeSelectChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            handleThemeChange(event.target.value);
        },
        [handleThemeChange]
    );

    // Manual Sync Now handler (moved from Header)
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Safe: Error message extraction with runtime validation */
    const handleSyncNow = useCallback(async () => {
        setSyncSuccess(false);
        try {
            await fullResyncSites();
            setSyncSuccess(true);
            logger.user.action("Synced data from SQLite backend");
        } catch (error: unknown) {
            logger.error(
                "Failed to sync data from backend",
                ensureError(error)
            );
            setError(
                `Failed to sync data: ${
                    error && typeof error === "object" && "message" in error
                        ? (error as { message?: string }).message
                        : String(error)
                }`
            );
        }
    }, [fullResyncSites, setError]);

    const handleDownloadSQLite = useCallback(async () => {
        clearError();
        try {
            await downloadSQLiteBackup();
            logger.user.action("Downloaded SQLite backup");
        } catch (error: unknown) {
            logger.error(
                "Failed to download SQLite backup",
                ensureError(error)
            );
            setError(
                `Failed to download SQLite backup: ${
                    error && typeof error === "object" && "message" in error
                        ? (error as { message?: string }).message
                        : String(error)
                }`
            );
        }
    }, [
        clearError,
        downloadSQLiteBackup,
        setError,
    ]);
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable after safe file system operations */

    // Click handlers for buttons
    const handleSyncNowClick = useCallback(() => {
        void handleSyncNow();
    }, [handleSyncNow]);

    const handleDownloadSQLiteClick = useCallback(() => {
        void handleDownloadSQLite();
    }, [handleDownloadSQLite]);

    return (
        <div className="modal-overlay">
            <ThemedBox
                className="modal-container"
                padding="md"
                rounded="lg"
                shadow="xl"
                surface="overlay"
            >
                {/* Header */}
                <ThemedBox
                    border
                    className="border-b"
                    padding="lg"
                    rounded="none"
                    surface="elevated"
                >
                    <div className="flex items-center justify-between">
                        <ThemedText size="xl" weight="semibold">
                            ⚙️ Settings
                        </ThemedText>
                        <ThemedButton
                            aria-label="Close settings"
                            className="hover-opacity"
                            onClick={onClose}
                            size="sm"
                            title="Close settings"
                            variant="secondary"
                        >
                            ✕
                        </ThemedButton>
                    </div>
                </ThemedBox>

                {/* Error Display */}
                {lastError ? (
                    <ErrorAlert
                        message={lastError}
                        onDismiss={clearError}
                        variant="error"
                    />
                ) : null}
                {/* Sync Success Display */}
                {/* eslint-disable-next-line @eslint-react/no-complex-conditional-rendering, @eslint-react/no-complicated-conditional-rendering -- success message should only show when no error present */}
                {syncSuccess && !lastError ? (
                    <ThemedBox
                        className="success-alert"
                        padding="md"
                        rounded="md"
                        surface="base"
                    >
                        <ThemedText size="sm" variant="success">
                            ✅ Data synced from database.
                        </ThemedText>
                    </ThemedBox>
                ) : null}

                {/* Content */}
                <ThemedBox className="space-y-6" padding="lg" surface="base">
                    {/* Monitoring Settings */}
                    <section>
                        <ThemedText className="mb-4" size="lg" weight="medium">
                            🔍 Monitoring
                        </ThemedText>
                        <div className="space-y-4">
                            <div>
                                <ThemedText
                                    className="mb-2 block"
                                    size="sm"
                                    variant="secondary"
                                    weight="medium"
                                >
                                    History Limit
                                </ThemedText>
                                <ThemedSelect
                                    aria-label="Maximum number of history records to keep per site"
                                    disabled={isLoading}
                                    onChange={handleHistoryLimitSelectChange}
                                    value={settings.historyLimit}
                                >
                                    {HISTORY_LIMIT_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </ThemedSelect>
                                <ThemedText
                                    className="mt-1"
                                    size="xs"
                                    variant="secondary"
                                >
                                    Maximum number of check results to store per
                                    site
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
                            {}
                            <SettingItem
                                control={useMemo(
                                    () => (
                                        <ThemedCheckbox
                                            aria-label="Enable desktop notifications"
                                            checked={settings.notifications}
                                            disabled={isLoading}
                                            onChange={handleNotificationsChange}
                                        />
                                    ),
                                    [
                                        handleNotificationsChange,
                                        isLoading,
                                        settings.notifications,
                                    ]
                                )}
                                description="Show notifications when sites go up or down"
                                title="Desktop Notifications"
                            />

                            <SettingItem
                                control={useMemo(
                                    () => (
                                        <ThemedCheckbox
                                            aria-label="Enable sound alerts"
                                            checked={settings.soundAlerts}
                                            disabled={isLoading}
                                            onChange={handleSoundAlertsChange}
                                        />
                                    ),
                                    [
                                        handleSoundAlertsChange,
                                        isLoading,
                                        settings.soundAlerts,
                                    ]
                                )}
                                description="Play sound when status changes occur"
                                title="Sound Alerts"
                            />
                        </div>
                    </section>

                    {/* Application Settings */}
                    <section>
                        <ThemedText className="mb-4" size="lg" weight="medium">
                            🖥️ Application
                        </ThemedText>
                        <div className="space-y-4">
                            <div>
                                <ThemedText
                                    className="mb-2 block"
                                    size="sm"
                                    variant="secondary"
                                    weight="medium"
                                >
                                    Theme
                                </ThemedText>
                                <ThemedSelect
                                    aria-label="Select application theme"
                                    disabled={isLoading}
                                    onChange={handleThemeSelectChange}
                                    value={settings.theme}
                                >
                                    {availableThemes.map((theme) => (
                                        <option key={theme} value={theme}>
                                            {theme.charAt(0).toUpperCase() +
                                                theme.slice(1)}
                                        </option>
                                    ))}
                                </ThemedSelect>
                                <div className="mt-2 flex items-center gap-2">
                                    <ThemedText size="xs" variant="tertiary">
                                        Current theme preview:
                                    </ThemedText>
                                    <StatusIndicator size="sm" status="up" />
                                    <StatusIndicator size="sm" status="down" />
                                    <StatusIndicator
                                        size="sm"
                                        status="pending"
                                    />
                                </div>
                            </div>

                            <SettingItem
                                control={useMemo(
                                    () => (
                                        <ThemedCheckbox
                                            aria-label="Start application automatically"
                                            checked={settings.autoStart}
                                            disabled={isLoading}
                                            onChange={handleAutoStartChange}
                                        />
                                    ),
                                    [
                                        handleAutoStartChange,
                                        isLoading,
                                        settings.autoStart,
                                    ]
                                )}
                                description="Launch Uptime Watcher when your computer starts"
                                title="Auto-start with System"
                            />

                            <SettingItem
                                control={useMemo(
                                    () => (
                                        <ThemedCheckbox
                                            aria-label="Minimize to system tray"
                                            checked={settings.minimizeToTray}
                                            disabled={isLoading}
                                            onChange={
                                                handleMinimizeToTrayChange
                                            }
                                        />
                                    ),
                                    [
                                        handleMinimizeToTrayChange,
                                        isLoading,
                                        settings.minimizeToTray,
                                    ]
                                )}
                                description="Keep app running in system tray when window is closed"
                                title="Minimize to System Tray"
                            />
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
                                onClick={handleSyncNowClick}
                                size="sm"
                                variant="secondary"
                            >
                                🔄 Sync Data
                            </ThemedButton>

                            {/* SQLite direct download */}
                            <div>
                                <ThemedText
                                    className="mb-2 block"
                                    size="sm"
                                    variant="secondary"
                                    weight="medium"
                                >
                                    Export SQLite Database
                                </ThemedText>
                                <ThemedButton
                                    disabled={isLoading || showButtonLoading}
                                    loading={showButtonLoading}
                                    onClick={handleDownloadSQLiteClick}
                                    size="sm"
                                    variant="primary"
                                >
                                    Download SQLite Backup
                                </ThemedButton>
                                <ThemedText
                                    className="mt-1 block"
                                    size="xs"
                                    variant="tertiary"
                                >
                                    Download a direct backup of the raw SQLite
                                    database file for advanced backup or
                                    migration.
                                </ThemedText>
                            </div>
                        </div>
                    </section>
                </ThemedBox>

                {/* Footer */}
                <ThemedBox
                    border
                    className="border-t"
                    padding="lg"
                    rounded="none"
                    surface="elevated"
                >
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
                            <ThemedButton
                                disabled={isLoading}
                                onClick={onClose}
                                size="sm"
                                variant="secondary"
                            >
                                Cancel
                            </ThemedButton>
                            <ThemedButton
                                loading={showButtonLoading}
                                onClick={onClose}
                                size="sm"
                                variant="primary"
                            >
                                Close
                            </ThemedButton>
                        </div>
                    </div>
                </ThemedBox>
            </ThemedBox>
        </div>
    );
};

/* eslint-enable @arthurgeron/react-usememo/require-usememo, react/no-unstable-nested-components -- Re-enable rules after complex form component */
