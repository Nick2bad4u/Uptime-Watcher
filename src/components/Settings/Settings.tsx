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

import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent, MouseEvent, ReactNode } from "react";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import { ensureError } from "@shared/utils/errorHandling";
import { safeInteger } from "@shared/validation/validatorUtils";

import type { AppSettings } from "../../stores/types";
import type { ThemeName } from "../../theme/types";

import { DEFAULT_HISTORY_LIMIT, HISTORY_LIMIT_OPTIONS } from "../../constants";
import { useConfirmDialog } from "../../hooks/ui/useConfirmDialog";
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
import { AppIcons } from "../../utils/icons";
import { ErrorAlert } from "../common/ErrorAlert/ErrorAlert";
import { Tooltip } from "../common/Tooltip/Tooltip";
import { SettingItem } from "../shared/SettingItem";
import "./Settings.css";

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

/**
 * Parameters for {@link renderSettingsSection} helper.
 *
 * @internal
 */
interface SettingsSectionParameters {
    readonly children: ReactNode;
    readonly description?: string;
    readonly icon: IconType;
    readonly title: string;
}

/**
 * Decorative wrapper that renders a titled settings section with iconography.
 *
 * @param props - Section layout configuration
 *
 * @returns Structured section markup for the settings modal body
 */
function renderSettingsSection({
    children,
    description,
    icon: SectionIcon,
    title,
}: SettingsSectionParameters): JSX.Element {
    return (
        <section className="settings-section">
            <div className="settings-section__header">
                <div className="settings-section__icon">
                    <SectionIcon size={18} />
                </div>
                <div>
                    <ThemedText
                        className="settings-section__title"
                        size="md"
                        weight="semibold"
                    >
                        {title}
                    </ThemedText>
                    {description ? (
                        <ThemedText
                            className="settings-section__description"
                            size="xs"
                            variant="secondary"
                        >
                            {description}
                        </ThemedText>
                    ) : null}
                </div>
            </div>
            <div className="settings-section__content">{children}</div>
        </section>
    );
}

/*
 * ESLint disable: The Settings component has conflicts between rules:
 * - @arthurgeron/react-usememo/require-usememo wants JSX wrapped in useMemo
 * - react/no-unstable-nested-components forbids components in render
 * These requirements are mutually exclusive for complex forms.
 */
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
    const { downloadSqliteBackup, fullResyncSites } = useSitesStore();
    const requestConfirmation = useConfirmDialog();

    const { availableThemes, isDark, setTheme } = useTheme();

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
    const handleReset = useCallback(async () => {
        const confirmed = await requestConfirmation({
            cancelLabel: "Keep Settings",
            confirmLabel: "Reset",
            details: "All application settings will revert to their defaults.",
            message: "Are you sure you want to reset all settings to defaults?",
            title: "Reset Settings",
            tone: "danger",
        });

        if (!confirmed) {
            return;
        }

        await resetSettings();
        clearError();
        logger.user.action("Reset settings to defaults");
    }, [
        clearError,
        requestConfirmation,
        resetSettings,
    ]);

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

    const notificationsControl = useMemo(
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
    );

    const soundAlertsControl = useMemo(
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
    );

    const autoStartControl = useMemo(
        () => (
            <ThemedCheckbox
                aria-label="Launch Uptime Watcher automatically at login"
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
    );

    const minimizeToTrayControl = useMemo(
        () => (
            <ThemedCheckbox
                aria-label="Minimize Uptime Watcher to the system tray"
                checked={settings.minimizeToTray}
                disabled={isLoading}
                onChange={handleMinimizeToTrayChange}
            />
        ),
        [
            handleMinimizeToTrayChange,
            isLoading,
            settings.minimizeToTray,
        ]
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
            await downloadSqliteBackup();
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
        downloadSqliteBackup,
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

    const handleResetClick = useCallback(() => {
        void handleReset();
    }, [handleReset]);

    /**
     * Handles overlay clicks to support closing the modal when the user clicks
     * outside the dialog content.
     */
    const handleOverlayClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    const CloseIcon = AppIcons.ui.close;
    const SettingsHeaderIcon = AppIcons.settings.gearFilled;
    const SuccessIcon = AppIcons.status.upFilled;
    const MonitoringIcon = AppIcons.metrics.monitor;
    const NotificationsIcon = AppIcons.ui.bell;
    const ApplicationIcon = AppIcons.ui.home;
    const MaintenanceIcon = AppIcons.ui.database;
    const DownloadIcon = AppIcons.actions.download;
    const RefreshIcon = AppIcons.actions.refresh;
    const ResetIcon = AppIcons.actions.remove;
    // prettier-ignore
    const downloadButtonIcon = useMemo(() => <DownloadIcon size={16} />, [DownloadIcon]);
    // prettier-ignore
    const refreshButtonIcon = useMemo(() => <RefreshIcon size={16} />, [RefreshIcon]);
    // prettier-ignore
    const resetButtonIcon = useMemo(() => <ResetIcon size={16} />, [ResetIcon]);
    const showSyncSuccessBanner = syncSuccess && !lastError;

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Modal backdrop requires click handler for UX; keyboard support provided by modal focus management
        <div
            className={`modal-overlay modal-overlay--frosted ${
                isDark ? "dark" : ""
            }`}
            onClick={handleOverlayClick}
        >
            <ThemedBox
                as="dialog"
                className="modal-shell modal-shell--form modal-shell--accent-primary"
                data-testid="settings-modal"
                open
                padding="xl"
                rounded="xl"
                shadow="xl"
                surface="overlay"
            >
                <div className="modal-shell__header">
                    <div className="modal-shell__title-group">
                        <div className="flex items-center gap-2">
                            <div className="settings-modal__header-icon">
                                <SettingsHeaderIcon size={22} />
                            </div>
                            <ThemedText
                                className="modal-shell__title"
                                size="xl"
                                weight="semibold"
                            >
                                Settings
                            </ThemedText>
                        </div>
                        <ThemedText
                            className="modal-shell__subtitle"
                            size="sm"
                            variant="secondary"
                        >
                            Fine-tune monitoring, notifications, and data
                            workflows.
                        </ThemedText>
                    </div>
                    <div className="modal-shell__actions">
                        <button
                            aria-label="Close settings"
                            className="modal-shell__close"
                            onClick={onClose}
                            title="Close"
                            type="button"
                        >
                            <CloseIcon size={18} />
                        </button>
                    </div>
                </div>

                <div className="modal-shell__body modal-shell__body-scrollable">
                    {lastError ? (
                        <ErrorAlert
                            message={lastError}
                            onDismiss={clearError}
                            variant="error"
                        />
                    ) : null}

                    {showSyncSuccessBanner ? (
                        <output
                            aria-live="polite"
                            className="settings-modal__banner settings-modal__banner--success"
                        >
                            <SuccessIcon
                                aria-hidden="true"
                                className="settings-modal__banner-icon"
                                size={18}
                            />
                            <div>
                                <ThemedText size="sm" weight="medium">
                                    Sync complete
                                </ThemedText>
                                <ThemedText size="xs" variant="secondary">
                                    Latest data loaded from the monitoring
                                    database.
                                </ThemedText>
                            </div>
                        </output>
                    ) : null}

                    <div className="settings-modal__sections">
                        {renderSettingsSection({
                            children: (
                                <div className="settings-field">
                                    <ThemedText
                                        className="settings-field__label"
                                        size="sm"
                                        variant="secondary"
                                        weight="medium"
                                    >
                                        History Limit
                                    </ThemedText>
                                    <ThemedSelect
                                        aria-label="Maximum number of history records to keep per site"
                                        disabled={isLoading}
                                        onChange={
                                            handleHistoryLimitSelectChange
                                        }
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
                                        className="settings-field__helper"
                                        size="xs"
                                        variant="tertiary"
                                    >
                                        Limits the number of response records
                                        stored for each monitor.
                                    </ThemedText>
                                </div>
                            ),
                            description:
                                "Control how much monitoring history is retained.",
                            icon: MonitoringIcon,
                            title: "Monitoring",
                        })}

                        {renderSettingsSection({
                            children: (
                                <div className="settings-toggle-stack">
                                    <SettingItem
                                        control={notificationsControl}
                                        description="Show desktop alerts whenever a site changes status."
                                        title="Desktop notifications"
                                    />
                                    <SettingItem
                                        control={soundAlertsControl}
                                        description="Play an audible chime alongside desktop alerts."
                                        title="Sound alerts"
                                    />
                                </div>
                            ),
                            description:
                                "Choose how Uptime Watcher keeps you informed.",
                            icon: NotificationsIcon,
                            title: "Notifications",
                        })}

                        {renderSettingsSection({
                            children: (
                                <>
                                    <div className="settings-field">
                                        <ThemedText
                                            className="settings-field__label"
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
                                                <option
                                                    key={theme}
                                                    value={theme}
                                                >
                                                    {theme
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        theme.slice(1)}
                                                </option>
                                            ))}
                                        </ThemedSelect>
                                        <div className="settings-theme-preview">
                                            <ThemedText
                                                size="xs"
                                                variant="tertiary"
                                            >
                                                Preview:
                                            </ThemedText>
                                            <StatusIndicator
                                                size="sm"
                                                status="up"
                                            />
                                            <StatusIndicator
                                                size="sm"
                                                status="down"
                                            />
                                            <StatusIndicator
                                                size="sm"
                                                status="pending"
                                            />
                                        </div>
                                    </div>
                                    <div className="settings-toggle-stack">
                                        <SettingItem
                                            control={autoStartControl}
                                            description="Launch Uptime Watcher when you sign in to your computer (requires restart)."
                                            title="Start at login"
                                        />
                                        <SettingItem
                                            control={minimizeToTrayControl}
                                            description="Keep the app running in the background without cluttering the taskbar."
                                            title="Minimize to tray"
                                        />
                                    </div>
                                </>
                            ),
                            description: "Personalize the desktop experience.",
                            icon: ApplicationIcon,
                            title: "Application",
                        })}

                        {renderSettingsSection({
                            children: (
                                <div className="settings-actions">
                                    <ThemedButton
                                        className="settings-actions__primary"
                                        disabled={isLoading}
                                        icon={downloadButtonIcon}
                                        loading={showButtonLoading}
                                        onClick={handleDownloadSQLiteClick}
                                        size="sm"
                                        variant="primary"
                                    >
                                        Export monitoring data
                                    </ThemedButton>
                                    <Tooltip content="Refreshes monitoring history from the database">
                                        {(triggerProps) => (
                                            <ThemedButton
                                                {...triggerProps}
                                                disabled={isLoading}
                                                icon={refreshButtonIcon}
                                                loading={showButtonLoading}
                                                onClick={handleSyncNowClick}
                                                size="sm"
                                                variant="secondary"
                                            >
                                                Refresh history
                                            </ThemedButton>
                                        )}
                                    </Tooltip>
                                    <Tooltip content="Clear all monitoring data and reset settings">
                                        {(triggerProps) => (
                                            <ThemedButton
                                                {...triggerProps}
                                                disabled={isLoading}
                                                icon={resetButtonIcon}
                                                loading={showButtonLoading}
                                                onClick={handleResetClick}
                                                size="sm"
                                                variant="error"
                                            >
                                                Reset everything
                                            </ThemedButton>
                                        )}
                                    </Tooltip>
                                </div>
                            ),
                            description:
                                "Manage data exports and advanced utilities.",
                            icon: MaintenanceIcon,
                            title: "Data & Maintenance",
                        })}
                    </div>

                    <footer className="settings-modal__footer">
                        <div className="settings-modal__footer-actions">
                            <ThemedButton
                                disabled={isLoading}
                                onClick={onClose}
                                size="sm"
                                variant="secondary"
                            >
                                Close
                            </ThemedButton>
                        </div>
                    </footer>
                </div>
            </ThemedBox>
        </div>
    );
};
