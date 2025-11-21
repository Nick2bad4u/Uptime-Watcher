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

import type { ChangeEvent, MouseEvent, ReactNode } from "react";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import { ensureError } from "@shared/utils/errorHandling";
import { safeInteger } from "@shared/validation/validatorUtils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AppSettings } from "../../stores/types";
import type { ThemeName } from "../../theme/types";

import { DEFAULT_HISTORY_LIMIT, HISTORY_LIMIT_OPTIONS } from "../../constants";
import { useConfirmDialog } from "../../hooks/ui/useConfirmDialog";
import { useDelayedButtonLoading } from "../../hooks/useDelayedButtonLoading";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { logger } from "../../services/logger";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useSettingsStore } from "../../stores/settings/useSettingsStore";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { StatusIndicator } from "../../theme/components/StatusIndicator";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedCheckbox } from "../../theme/components/ThemedCheckbox";
import { ThemedSelect } from "../../theme/components/ThemedSelect";
import { ThemedSlider } from "../../theme/components/ThemedSlider";
import { ThemedText } from "../../theme/components/ThemedText";
import { useTheme } from "../../theme/useTheme";
import { AppIcons } from "../../utils/icons";
import { waitForAnimation } from "../../utils/time/waitForAnimation";
import { playInAppAlertTone } from "../Alerts/alertCoordinator";
import { ErrorAlert } from "../common/ErrorAlert/ErrorAlert";
import { GalaxyBackground } from "../common/GalaxyBackground/GalaxyBackground";
import { Tooltip } from "../common/Tooltip/Tooltip";
import { SettingItem } from "../shared/SettingItem";
import "./Settings.css";

type SitesStoreState = ReturnType<typeof useSitesStore.getState>;

const selectDownloadSqliteBackup = (
    state: SitesStoreState
): SitesStoreState["downloadSqliteBackup"] => state.downloadSqliteBackup;

const selectFullResyncSites = (
    state: SitesStoreState
): SitesStoreState["fullResyncSites"] => state.fullResyncSites;

/**
 * Allowed settings keys that can be updated
 */
const ALLOWED_SETTINGS_KEY_LIST = [
    "autoStart",
    "historyLimit",
    "inAppAlertsEnabled",
    "inAppAlertsSoundEnabled",
    "inAppAlertVolume",
    "minimizeToTray",
    "systemNotificationsEnabled",
    "systemNotificationsSoundEnabled",
    "theme",
] as const satisfies ReadonlyArray<keyof AppSettings>;

const ALLOWED_SETTINGS_KEY_STRINGS = new Set(
    ALLOWED_SETTINGS_KEY_LIST.map(String)
);

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
    readonly testId?: string;
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
    testId,
    title,
}: SettingsSectionParameters): JSX.Element {
    return (
        <section className="settings-section" data-testid={testId}>
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
    const downloadSqliteBackup = useSitesStore(selectDownloadSqliteBackup);

    const fullResyncSites = useSitesStore(selectFullResyncSites);
    const requestConfirmation = useConfirmDialog();

    const { availableThemes, isDark, setTheme } = useTheme();

    // Delayed loading state for button spinners (managed by custom hook)
    const showButtonLoading = useDelayedButtonLoading(isLoading);
    // Local state for sync success message
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const {
        autoStart,
        historyLimit: currentHistoryLimit,
        inAppAlertsEnabled,
        inAppAlertsSoundEnabled,
        inAppAlertVolume,
        minimizeToTray,
        systemNotificationsEnabled,
        systemNotificationsSoundEnabled,
        theme: currentThemeName,
    } = settings;
    const prefersReducedMotion = usePrefersReducedMotion();

    const volumePreviewTimeoutRef = useRef<number | undefined>(undefined);
    const pendingVolumeRef = useRef(inAppAlertVolume);

    const clearVolumePreviewTimeout = useCallback((): void => {
        if (volumePreviewTimeoutRef.current !== undefined) {
            window.clearTimeout(volumePreviewTimeoutRef.current);
            volumePreviewTimeoutRef.current = undefined;
        }
    }, []);

    const scheduleVolumePreview = useCallback(
        (volume: number) => {
            if (!inAppAlertsSoundEnabled) {
                return;
            }

            if (prefersReducedMotion) {
                clearVolumePreviewTimeout();
                pendingVolumeRef.current = volume;
                return;
            }

            const previousVolume = pendingVolumeRef.current;
            const volumeDelta = Math.abs(volume - previousVolume);

            if (volumeDelta < 0.005) {
                return;
            }

            pendingVolumeRef.current = volume;
            clearVolumePreviewTimeout();

            if (volume <= 0) {
                return;
            }

            volumePreviewTimeoutRef.current = window.setTimeout(() => {
                volumePreviewTimeoutRef.current = undefined;
                void playInAppAlertTone();
            }, 180);
        },
        [
            clearVolumePreviewTimeout,
            inAppAlertsSoundEnabled,
            prefersReducedMotion,
        ]
    );

    useEffect(
        function syncPendingVolumeWithState(): void {
            pendingVolumeRef.current = inAppAlertVolume;
        },
        [inAppAlertVolume]
    );

    useEffect(
        function stopPreviewWhenSoundDisabled(): void {
            if (!inAppAlertsSoundEnabled) {
                clearVolumePreviewTimeout();
            }
        },
        [clearVolumePreviewTimeout, inAppAlertsSoundEnabled]
    );

    useEffect(
        function cleanupVolumePreviewOnUnmount(): () => void {
            return () => {
                clearVolumePreviewTimeout();
            };
        },
        [clearVolumePreviewTimeout]
    );

    const applySettingChanges = useCallback(
        (
            changes: Partial<AppSettings>,
            options?: { forceKeys?: Array<keyof AppSettings> }
        ) => {
            const updateEntries: Array<
                [keyof AppSettings, AppSettings[keyof AppSettings]]
            > = [];
            const forcedKeys = new Set(options?.forceKeys);

            for (const key of ALLOWED_SETTINGS_KEY_LIST) {
                if (Object.hasOwn(changes, key)) {
                    const nextValue = changes[key];
                    if (nextValue !== undefined) {
                        const previousValue = settings[key];
                        if (
                            previousValue !== nextValue ||
                            forcedKeys.has(key)
                        ) {
                            const typedValue = nextValue;
                            updateEntries.push([key, typedValue]);
                            logger.user.settingsChange(
                                key,
                                previousValue,
                                nextValue
                            );
                        }
                    }
                }
            }

            for (const rawKey of Object.keys(changes)) {
                if (!ALLOWED_SETTINGS_KEY_STRINGS.has(rawKey)) {
                    logger.warn(
                        "Attempted to update invalid settings key",
                        rawKey
                    );
                }
            }

            if (updateEntries.length > 0) {
                updateSettings(
                    Object.fromEntries(updateEntries) as Partial<AppSettings>
                );
            }
        },
        [settings, updateSettings]
    );

    const handleSettingChange = useCallback(
        <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
            applySettingChanges({ [key]: value });
        },
        [applySettingChanges]
    );

    const handleHistoryLimitChange = useCallback(
        async (limit: number) => {
            try {
                // Get the actual primitive value from settings using safe
                // conversion
                const oldLimit = safeInteger(
                    currentHistoryLimit,
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
        [currentHistoryLimit, persistHistoryLimit]
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
            const oldTheme = currentThemeName;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: Theme name validation from known theme options
            setTheme(themeName as ThemeName);
            logger.user.settingsChange("theme", oldTheme, themeName);
        },
        [currentThemeName, setTheme]
    );

    // Memoized event handlers to prevent unnecessary re-renders
    const handleHistoryLimitSelectChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            void handleHistoryLimitChange(Number(event.target.value));
        },
        [handleHistoryLimitChange]
    );

    const handleInAppAlertsChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const enabled = event.target.checked;
            const updates: Partial<AppSettings> = {
                inAppAlertsEnabled: enabled,
            };

            if (!enabled) {
                updates.inAppAlertsSoundEnabled = false;
                applySettingChanges(updates, {
                    forceKeys: ["inAppAlertsSoundEnabled"],
                });
                return;
            }

            applySettingChanges(updates);
        },
        [applySettingChanges]
    );

    const handleInAppAlertSoundChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (!inAppAlertsEnabled) {
                return;
            }

            applySettingChanges({
                inAppAlertsSoundEnabled: event.target.checked,
            });
        },
        [applySettingChanges, inAppAlertsEnabled]
    );

    const handleInAppAlertVolumeChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (!inAppAlertsEnabled || !inAppAlertsSoundEnabled) {
                return;
            }

            const sliderValue = Number(event.target.value);

            if (Number.isNaN(sliderValue)) {
                return;
            }

            const normalizedVolume = Math.min(
                Math.max(sliderValue / 100, 0),
                1
            );

            applySettingChanges({
                inAppAlertVolume: normalizedVolume,
            });

            if (prefersReducedMotion) {
                pendingVolumeRef.current = normalizedVolume;
                clearVolumePreviewTimeout();
                return;
            }

            scheduleVolumePreview(normalizedVolume);
        },
        [
            applySettingChanges,
            clearVolumePreviewTimeout,
            inAppAlertsEnabled,
            inAppAlertsSoundEnabled,
            prefersReducedMotion,
            scheduleVolumePreview,
        ]
    );

    const handleInAppAlertPreviewClick = useCallback(() => {
        if (!inAppAlertsEnabled || !inAppAlertsSoundEnabled) {
            return;
        }

        clearVolumePreviewTimeout();

        const normalizedVolume = Math.min(Math.max(inAppAlertVolume, 0), 1);

        if (normalizedVolume <= 0) {
            return;
        }

        pendingVolumeRef.current = normalizedVolume;
        void playInAppAlertTone();
    }, [
        clearVolumePreviewTimeout,
        inAppAlertsEnabled,
        inAppAlertsSoundEnabled,
        inAppAlertVolume,
    ]);

    const handleSystemNotificationsChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const enabled = event.target.checked;
            const updates: Partial<AppSettings> = {
                systemNotificationsEnabled: enabled,
            };

            if (!enabled) {
                updates.systemNotificationsSoundEnabled = false;
                applySettingChanges(updates, {
                    forceKeys: ["systemNotificationsSoundEnabled"],
                });
                return;
            }

            applySettingChanges(updates);
        },
        [applySettingChanges]
    );

    const handleSystemNotificationSoundChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            applySettingChanges({
                systemNotificationsSoundEnabled: event.target.checked,
            });
        },
        [applySettingChanges]
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

    const sliderDisabled =
        isLoading || !inAppAlertsEnabled || !inAppAlertsSoundEnabled;
    const clampedVolume = Math.min(Math.max(inAppAlertVolume, 0), 1);
    const volumePercent = Math.round(clampedVolume * 100);
    const automaticPreviewSuppressed = prefersReducedMotion;
    const isVolumeSilent = clampedVolume <= 0;

    const inAppAlertsControl = useMemo(
        () => (
            <ThemedCheckbox
                aria-label="Enable in-app alerts"
                checked={inAppAlertsEnabled}
                disabled={isLoading}
                onChange={handleInAppAlertsChange}
            />
        ),
        [
            handleInAppAlertsChange,
            inAppAlertsEnabled,
            isLoading,
        ]
    );

    const inAppAlertSoundControl = useMemo(
        () => (
            <ThemedCheckbox
                aria-label="Play sound for in-app alerts"
                checked={inAppAlertsSoundEnabled}
                disabled={isLoading || !inAppAlertsEnabled}
                onChange={handleInAppAlertSoundChange}
            />
        ),
        [
            handleInAppAlertSoundChange,
            inAppAlertsEnabled,
            inAppAlertsSoundEnabled,
            isLoading,
        ]
    );

    const inAppAlertVolumeControl = useMemo(
        () => (
            <div className="settings-alert-volume-control">
                <ThemedSlider
                    aria-label="In-app alert volume"
                    aria-valuetext={`${volumePercent}%`}
                    disabled={sliderDisabled}
                    max={100}
                    min={0}
                    onChange={handleInAppAlertVolumeChange}
                    step={1}
                    value={volumePercent}
                />
                <div className="settings-alert-volume-control__row">
                    <ThemedText
                        className="settings-alert-volume-control__value"
                        size="sm"
                        variant="secondary"
                    >
                        {volumePercent}%
                    </ThemedText>
                    <ThemedButton
                        disabled={sliderDisabled || isVolumeSilent}
                        onClick={handleInAppAlertPreviewClick}
                        size="xs"
                        variant="secondary"
                    >
                        Preview tone
                    </ThemedButton>
                </div>
                {automaticPreviewSuppressed ? (
                    <ThemedText
                        className="settings-alert-volume-control__note"
                        size="xs"
                        variant="tertiary"
                    >
                        Automatic previews are disabled to respect your
                        reduced-motion preference.
                    </ThemedText>
                ) : null}
            </div>
        ),
        [
            automaticPreviewSuppressed,
            handleInAppAlertPreviewClick,
            handleInAppAlertVolumeChange,
            isVolumeSilent,
            sliderDisabled,
            volumePercent,
        ]
    );

    const systemNotificationsControl = useMemo(
        () => (
            <ThemedCheckbox
                aria-label="Enable system notifications"
                checked={systemNotificationsEnabled}
                disabled={isLoading}
                onChange={handleSystemNotificationsChange}
            />
        ),
        [
            handleSystemNotificationsChange,
            isLoading,
            systemNotificationsEnabled,
        ]
    );

    const systemNotificationSoundControl = useMemo(
        () => (
            <ThemedCheckbox
                aria-label="Play sound for system notifications"
                checked={systemNotificationsSoundEnabled}
                disabled={isLoading || !systemNotificationsEnabled}
                onChange={handleSystemNotificationSoundChange}
            />
        ),
        [
            handleSystemNotificationSoundChange,
            isLoading,
            systemNotificationsEnabled,
            systemNotificationsSoundEnabled,
        ]
    );

    const autoStartControl = useMemo(
        () => (
            <ThemedCheckbox
                aria-label="Launch Uptime Watcher automatically at login"
                checked={autoStart}
                disabled={isLoading}
                onChange={handleAutoStartChange}
            />
        ),
        [
            autoStart,
            handleAutoStartChange,
            isLoading,
        ]
    );

    const minimizeToTrayControl = useMemo(
        () => (
            <ThemedCheckbox
                aria-label="Minimize Uptime Watcher to the system tray"
                checked={minimizeToTray}
                disabled={isLoading}
                onChange={handleMinimizeToTrayChange}
            />
        ),
        [
            handleMinimizeToTrayChange,
            isLoading,
            minimizeToTray,
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
    const handleClose = useCallback(async () => {
        setIsClosing(true);
        await waitForAnimation();
        onClose();
    }, [onClose]);

    const handleCloseButtonClick = useCallback(() => {
        void handleClose();
    }, [handleClose]);

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
                void handleClose();
            }
        },
        [handleClose]
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
            } ${isClosing ? "modal-overlay--closing" : ""}`}
            data-testid="settings-modal-overlay"
            onClick={handleOverlayClick}
        >
            <ThemedBox
                as="dialog"
                className={`modal-shell modal-shell--form modal-shell--accent-success settings-modal ${
                    isClosing ? "modal-shell--closing" : ""
                }`}
                data-testid="settings-modal"
                open
                padding="xl"
                rounded="xl"
                shadow="xl"
                surface="overlay"
            >
                <div className="modal-shell__header settings-modal__header">
                    <GalaxyBackground
                        className="galaxy-background--banner galaxy-background--banner-compact"
                        isDark={isDark}
                    />
                    <div className="modal-shell__header-content">
                        <div className="modal-shell__title-group">
                            <div className="flex items-center gap-2">
                                <div className="modal-shell__accent-icon settings-modal__header-icon">
                                    <SettingsHeaderIcon size={22} />
                                </div>
                                {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- Modal header requires explicit role for testing and assistive tech */}
                                <ThemedText
                                    aria-level={1}
                                    as="h2"
                                    className="modal-shell__title"
                                    role="heading"
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
                                data-testid="settings-modal-close"
                                onClick={handleCloseButtonClick}
                                title="Close"
                                type="button"
                            >
                                <CloseIcon size={18} />
                            </button>
                        </div>
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
                            data-testid="settings-sync-success"
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
                                        value={currentHistoryLimit}
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
                            testId: "settings-section-monitoring",
                            title: "Monitoring",
                        })}

                        {renderSettingsSection({
                            children: (
                                <div className="settings-toggle-stack">
                                    <SettingItem
                                        control={inAppAlertsControl}
                                        description="Show toast notifications within the app when monitors change state."
                                        title="In-app alerts"
                                    />
                                    <SettingItem
                                        control={inAppAlertSoundControl}
                                        description="Play a sound when in-app alerts are displayed."
                                        title="In-app alert sound"
                                    />
                                    <SettingItem
                                        control={inAppAlertVolumeControl}
                                        description="Fine-tune how loud the in-app alert tone plays."
                                        disabled={
                                            !inAppAlertsEnabled ||
                                            !inAppAlertsSoundEnabled
                                        }
                                        title="In-app alert volume"
                                    />
                                    <SettingItem
                                        control={systemNotificationsControl}
                                        description="Trigger operating system notifications for status changes."
                                        title="System notifications"
                                    />
                                    <SettingItem
                                        control={systemNotificationSoundControl}
                                        description="Play a sound when system notifications are shown."
                                        title="System notification sound"
                                    />
                                </div>
                            ),
                            description:
                                "Choose how Uptime Watcher keeps you informed.",
                            icon: NotificationsIcon,
                            testId: "settings-section-notifications",
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
                                            value={currentThemeName}
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
                            testId: "settings-section-application",
                            title: "Application",
                        })}

                        {renderSettingsSection({
                            children: (
                                <div className="settings-actions">
                                    <ThemedButton
                                        className="settings-actions__primary"
                                        data-testid="settings-export-data"
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
                                                data-testid="settings-refresh-history"
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
                                                data-testid="settings-reset-all"
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
                            testId: "settings-section-data",
                            title: "Data & Maintenance",
                        })}
                    </div>

                    <footer className="settings-modal__footer">
                        <div className="settings-modal__footer-actions">
                            <ThemedButton
                                data-testid="settings-close"
                                disabled={isLoading}
                                onClick={handleCloseButtonClick}
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
