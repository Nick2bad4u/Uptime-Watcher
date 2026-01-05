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

import type { ChangeEvent, MouseEvent, ReactElement } from "react";

import { DEFAULT_HISTORY_LIMIT_RULES } from "@shared/constants/history";
import { ensureError } from "@shared/utils/errorHandling";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { safeInteger } from "@shared/validation/validatorUtils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AppSettings } from "../../stores/types";

import { DEFAULT_HISTORY_LIMIT } from "../../constants";
import { useConfirmDialog } from "../../hooks/ui/useConfirmDialog";
import { useDelayedButtonLoading } from "../../hooks/useDelayedButtonLoading";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { logger } from "../../services/logger";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useSettingsStore } from "../../stores/settings/useSettingsStore";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedCheckbox } from "../../theme/components/ThemedCheckbox";
import { ThemedSlider } from "../../theme/components/ThemedSlider";
import { ThemedText } from "../../theme/components/ThemedText";
import { isThemeName, type ThemeName } from "../../theme/types";
import { useTheme } from "../../theme/useTheme";
import { AppIcons } from "../../utils/icons";
import { waitForAnimation } from "../../utils/time/waitForAnimation";
import { playInAppAlertTone } from "../Alerts/alertCoordinator";
import { ErrorAlert } from "../common/ErrorAlert/ErrorAlert";
import { GalaxyBackground } from "../common/GalaxyBackground/GalaxyBackground";
import { CloudSettingsSection } from "./CloudSettingsSection";
import {
    ApplicationSection,
    type BackupSummary,
    MaintenanceSection,
    MonitoringSection,
    NotificationSection,
} from "./SettingsSections";
import "./Settings.css";

type SitesStoreState = ReturnType<typeof useSitesStore.getState>;

const selectDownloadSqliteBackup = (
    state: SitesStoreState
): SitesStoreState["downloadSqliteBackup"] => state.downloadSqliteBackup;
const selectRestoreSqliteBackup = (
    state: SitesStoreState
): SitesStoreState["restoreSqliteBackup"] => state.restoreSqliteBackup;

const selectFullResyncSites = (
    state: SitesStoreState
): SitesStoreState["fullResyncSites"] => state.fullResyncSites;

const selectLastBackupMetadata = (
    state: SitesStoreState
): SitesStoreState["lastBackupMetadata"] => state.lastBackupMetadata;

const formatBackupSize = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return `${bytes}`;
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB",
    ] as const;
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    const precision = value >= 10 || unitIndex === 0 ? 0 : 1;
    return `${value.toFixed(precision)} ${units[unitIndex]}`;
};

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
}: Readonly<SettingsProperties>): ReactElement => {
    type ErrorStoreState = ReturnType<typeof useErrorStore.getState>;
    type SettingsStoreState = ReturnType<typeof useSettingsStore.getState>;

    const selectClearError = useCallback((
        state: ErrorStoreState
    ): ErrorStoreState["clearError"] => state.clearError, []);
    const selectIsLoading = useCallback((state: ErrorStoreState): boolean =>
        state.isLoading, []);
    const selectLastError = useCallback((
        state: ErrorStoreState
    ): ErrorStoreState["lastError"] => state.lastError, []);
    const selectSetError = useCallback((
        state: ErrorStoreState
    ): ErrorStoreState["setError"] => state.setError, []);

    const clearError = useErrorStore(selectClearError);
    const isLoading = useErrorStore(selectIsLoading);
    const lastError = useErrorStore(selectLastError);
    const setError = useErrorStore(selectSetError);

    const selectPersistHistoryLimit = useCallback((
        state: SettingsStoreState
    ): SettingsStoreState["persistHistoryLimit"] => state.persistHistoryLimit, []);
    const selectResetSettings = useCallback((
        state: SettingsStoreState
    ): SettingsStoreState["resetSettings"] => state.resetSettings, []);
    const selectSettings = useCallback((
        state: SettingsStoreState
    ): SettingsStoreState["settings"] => state.settings, []);
    const selectUpdateSettings = useCallback((
        state: SettingsStoreState
    ): SettingsStoreState["updateSettings"] => state.updateSettings, []);

    const persistHistoryLimit = useSettingsStore(selectPersistHistoryLimit);
    const resetSettings = useSettingsStore(selectResetSettings);
    const settings = useSettingsStore(selectSettings);
    const updateSettings = useSettingsStore(selectUpdateSettings);
    const downloadSqliteBackup = useSitesStore(selectDownloadSqliteBackup);
    const restoreSqliteBackup = useSitesStore(selectRestoreSqliteBackup);
    const lastBackupMetadata = useSitesStore(selectLastBackupMetadata);

    const fullResyncSites = useSitesStore(selectFullResyncSites);
    const requestConfirmation = useConfirmDialog();

    const { availableThemes, isDark, setTheme } = useTheme();

    // Delayed loading state for button spinners (managed by custom hook)
    const showButtonLoading = useDelayedButtonLoading(isLoading);
    // Local state for sync success message
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const restoreFileInputRef = useRef<HTMLInputElement | null>(null);

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
                    0,
                    DEFAULT_HISTORY_LIMIT_RULES.maxLimit
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
        (themeName: ThemeName) => {
            const oldTheme = currentThemeName;
            setTheme(themeName);
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
            if (!systemNotificationsEnabled) {
                return;
            }

            applySettingChanges({
                systemNotificationsSoundEnabled: event.target.checked,
            });
        },
        [applySettingChanges, systemNotificationsEnabled]
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
            const { value } = event.target;

            if (!isThemeName(value)) {
                logger.warn("Unknown theme value selected", { value });
                return;
            }

            handleThemeChange(value);
        },
        [handleThemeChange]
    );

    const isVolumeControlDisabled =
        !inAppAlertsEnabled || !inAppAlertsSoundEnabled;
    const sliderDisabled = isLoading || isVolumeControlDisabled;
    const clampedVolume = Math.min(Math.max(inAppAlertVolume, 0), 1);
    const volumePercent = Math.round(clampedVolume * 100);
    const automaticPreviewSuppressed = prefersReducedMotion;
    const isVolumeSilent = clampedVolume <= 0;

    const backupSummary = useMemo<BackupSummary | null>(() => {
        if (!lastBackupMetadata) {
            return null;
        }

        const formattedDate = new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(lastBackupMetadata.createdAt));

        return {
            formattedDate,
            formattedSize: formatBackupSize(lastBackupMetadata.sizeBytes),
            retentionHintDays: lastBackupMetadata.retentionHintDays,
            schemaVersion: lastBackupMetadata.schemaVersion,
        };
    }, [lastBackupMetadata]);

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

    const notificationSectionProps = useMemo(
        () => ({
            icon: AppIcons.ui.bell,
            inAppAlertsControl,
            inAppAlertSoundControl,
            inAppAlertVolumeControl,
            isVolumeControlDisabled,
            systemNotificationsControl,
            systemNotificationSoundControl,
        }),
        [
            inAppAlertsControl,
            inAppAlertSoundControl,
            inAppAlertVolumeControl,
            isVolumeControlDisabled,
            systemNotificationsControl,
            systemNotificationSoundControl,
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
                `Failed to sync data: ${getUserFacingErrorDetail(error)}`
            );
        }
    }, [fullResyncSites, setError]);

    const handleDownloadSQLite = useCallback(async () => {
        clearError();
        try {
            const backup = await downloadSqliteBackup();
            logger.user.action("Downloaded SQLite backup", {
                checksum: backup.metadata.checksum,
                schemaVersion: backup.metadata.schemaVersion,
                sizeBytes: backup.metadata.sizeBytes,
            });
        } catch (error: unknown) {
            logger.error(
                "Failed to download SQLite backup",
                ensureError(error)
            );
            setError(
                `Failed to download SQLite backup: ${getUserFacingErrorDetail(error)}`
            );
        }
    }, [
        clearError,
        downloadSqliteBackup,
        setError,
    ]);

    const handleRestoreSQLite = useCallback(
        async (file: File) => {
            clearError();
            try {
                const payload = {
                    buffer: await file.arrayBuffer(),
                    fileName: file.name,
                };
                const restoreSummary = await restoreSqliteBackup(payload);
                setSyncSuccess(true);
                logger.user.action("Restored SQLite backup", {
                    checksum: restoreSummary.metadata.checksum,
                    schemaVersion: restoreSummary.metadata.schemaVersion,
                    sizeBytes: restoreSummary.metadata.sizeBytes,
                });
            } catch (error: unknown) {
                logger.error(
                    "Failed to restore SQLite backup",
                    ensureError(error)
                );
                setError(
                    `Failed to restore SQLite backup: ${getUserFacingErrorDetail(error)}`
                );
            }
        },
        [
            clearError,
            restoreSqliteBackup,
            setError,
        ]
    );

    const handleRestoreFileChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const input = event.currentTarget;
            const [file] = Array.from(input.files ?? []);
            if (!file) {
                return;
            }

            try {
                await handleRestoreSQLite(file);
            } finally {
                // Reset the input so the same file can be selected again
                input.value = "";
            }
        },
        [handleRestoreSQLite]
    );

    const handleRestoreInputChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            void handleRestoreFileChange(event);
        },
        [handleRestoreFileChange]
    );

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

    const handleRestoreSQLiteClick = useCallback(() => {
        restoreFileInputRef.current?.click();
    }, []);

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
    const ApplicationIcon = AppIcons.ui.home;
    const MaintenanceIcon = AppIcons.ui.database;
    const DownloadIcon = AppIcons.actions.download;
    const UploadIcon = AppIcons.actions.upload;
    const RefreshIcon = AppIcons.actions.refresh;
    const ResetIcon = AppIcons.actions.remove;
    // prettier-ignore
    const downloadButtonIcon = useMemo(() => <DownloadIcon size={16} />, [DownloadIcon]);
    // prettier-ignore
    const uploadButtonIcon = useMemo(() => <UploadIcon size={16} />, [UploadIcon]);
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
                        <ApplicationSection
                            autoStartControl={autoStartControl}
                            availableThemes={availableThemes}
                            currentThemeName={currentThemeName}
                            icon={ApplicationIcon}
                            isLoading={isLoading}
                            minimizeToTrayControl={minimizeToTrayControl}
                            onThemeChange={handleThemeSelectChange}
                        />

                        <NotificationSection {...notificationSectionProps} />

                        <MonitoringSection
                            currentHistoryLimit={currentHistoryLimit}
                            icon={MonitoringIcon}
                            isLoading={isLoading}
                            onHistoryLimitChange={
                                handleHistoryLimitSelectChange
                            }
                        />

                        <CloudSettingsSection />

                        <MaintenanceSection
                            backupSummary={backupSummary}
                            downloadButtonIcon={downloadButtonIcon}
                            icon={MaintenanceIcon}
                            isLoading={isLoading}
                            onDownloadBackup={handleDownloadSQLiteClick}
                            onRefreshHistory={handleSyncNowClick}
                            onResetData={handleResetClick}
                            onRestoreClick={handleRestoreSQLiteClick}
                            onRestoreFileChange={handleRestoreInputChange}
                            refreshButtonIcon={refreshButtonIcon}
                            resetButtonIcon={resetButtonIcon}
                            restoreFileInputRef={restoreFileInputRef}
                            showButtonLoading={showButtonLoading}
                            uploadButtonIcon={uploadButtonIcon}
                        />
                    </div>
                </div>
            </ThemedBox>
        </div>
    );
};
