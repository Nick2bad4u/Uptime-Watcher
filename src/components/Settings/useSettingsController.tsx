import type { ChangeEvent, ReactNode, RefObject } from "react";
import type { IconType } from "react-icons";

import { MAX_IPC_SQLITE_RESTORE_BYTES } from "@shared/constants/backup";
import { DEFAULT_HISTORY_LIMIT_RULES } from "@shared/constants/history";
import { ensureError } from "@shared/utils/errorHandling";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { safeInteger } from "@shared/validation/validatorUtils";
import { useCallback, useMemo, useRef, useState } from "react";

import type { AppSettings } from "../../stores/types";
import type { BackupSummary } from "./sections/BackupSummary";

import { DEFAULT_HISTORY_LIMIT } from "../../constants";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { logger } from "../../services/logger";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedCheckbox } from "../../theme/components/ThemedCheckbox";
import { ThemedSlider } from "../../theme/components/ThemedSlider";
import { ThemedText } from "../../theme/components/ThemedText";
import { isThemeName, type ThemeName } from "../../theme/types";
import { formatByteSize } from "../../utils/formatting/formatByteSize";
import { AppIcons } from "../../utils/icons";
import { waitForAnimation } from "../../utils/time/waitForAnimation";
import { playInAppAlertTone } from "../Alerts/alertCoordinator";
import { GalaxyBackground } from "../common/GalaxyBackground/GalaxyBackground";
import { useInAppAlertTonePreview } from "./useInAppAlertTonePreview";
import { useSettingsChangeHandlers } from "./useSettingsChangeHandlers";
import { useSettingsModel } from "./useSettingsModel";
import {
    tryBuildSerializedDatabaseRestorePayloadFromFile,
} from "./utils/sqliteRestorePayload";
import {
    clampNormalizedVolume,
    convertNormalizedVolumeToSliderPercent,
    convertSliderPercentToNormalizedVolume,
} from "./utils/volumeNormalization";

/**
 * The derived UI state/props for the Settings modal.
 *
 * @public
 */
export interface SettingsControllerState {
    readonly applicationSectionProps: {
        readonly autoStartControl: ReactNode;
        readonly availableThemes: readonly ThemeName[];
        readonly currentThemeName: ThemeName;
        readonly icon: IconType;
        readonly isLoading: boolean;
        readonly minimizeToTrayControl: ReactNode;
        readonly onThemeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    };
    readonly clearError: () => void;
    readonly handleCloseButtonClick: () => void;
    readonly headerBackground: ReactNode;
    readonly headerIcon: ReactNode;
    readonly isClosing: boolean;
    readonly isDark: boolean;
    readonly isLoading: boolean;
    readonly lastError: null | string;
    readonly maintenanceSectionProps: {
        readonly backupSummary: BackupSummary | null;
        readonly downloadButtonIcon: ReactNode;
        readonly icon: IconType;
        readonly isLoading: boolean;
        readonly onDownloadBackup: () => void;
        readonly onRefreshHistory: () => void;
        readonly onResetData: () => void;
        readonly onRestoreClick: () => void;
        readonly onRestoreFileChange: (
            event: ChangeEvent<HTMLInputElement>
        ) => void;
        readonly refreshButtonIcon: ReactNode;
        readonly resetButtonIcon: ReactNode;
        readonly restoreFileInputRef: RefObject<HTMLInputElement | null>;
        readonly showButtonLoading: boolean;
        readonly uploadButtonIcon: ReactNode;
    };
    readonly monitoringSectionProps: {
        readonly currentHistoryLimit: number;
        readonly icon: IconType;
        readonly isLoading: boolean;
        readonly onHistoryLimitChange: (
            event: ChangeEvent<HTMLSelectElement>
        ) => void;
    };
    readonly notificationSectionProps: {
        readonly icon: IconType;
        readonly inAppAlertsControl: ReactNode;
        readonly inAppAlertSoundControl: ReactNode;
        readonly inAppAlertVolumeControl: ReactNode;
        readonly isLoading: boolean;
        readonly isVolumeControlDisabled: boolean;
        readonly systemNotificationsControl: ReactNode;
        readonly systemNotificationSoundControl: ReactNode;
    };
    readonly overlayClassName: string;
    readonly shellClassName: string;
    readonly showSyncSuccessBanner: boolean;
    readonly subtitle: ReactNode;
}

/**
 * Extracted controller hook for {@link Settings}.
 *
 * @remarks
 * This keeps the Settings view component mostly declarative by containing the
 * event-handler, memoization, and derived-props logic here.
 *
 * @public
 */
export const useSettingsController = ({
    onClose,
}: {
    readonly onClose: () => void;
}): SettingsControllerState => {
    const {
        availableThemes,
        clearError,
        fullResyncSites,
        isDark,
        isLoading,
        lastBackupMetadata,
        lastError,
        persistHistoryLimit,
        requestConfirmation,
        resetSettings,
        restoreSqliteBackup,
        saveSqliteBackup,
        setError,
        setTheme,
        settings,
        showButtonLoading,
        updateSettings,
    } = useSettingsModel();

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

    const {
        clearVolumePreviewTimeout,
        playPreviewAtVolume,
        scheduleVolumePreview,
        setPendingVolume,
    } = useInAppAlertTonePreview(
        useMemo(
            () => ({
                inAppAlertsSoundEnabled,
                inAppAlertVolume,
                playInAppAlertTone,
                prefersReducedMotion,
            }),
            [
                inAppAlertsSoundEnabled,
                inAppAlertVolume,
                prefersReducedMotion,
            ]
        )
    );

    const { applySettingChanges, handleSettingChange } =
        useSettingsChangeHandlers(
            useMemo(
                () => ({
                    settings,
                    updateSettings,
                }),
                [settings, updateSettings]
            )
        );

    const handleHistoryLimitChange = useCallback(
        async (limit: number) => {
            try {
                const oldLimit = safeInteger(
                    currentHistoryLimit,
                    DEFAULT_HISTORY_LIMIT,
                    0,
                    DEFAULT_HISTORY_LIMIT_RULES.maxLimit
                );

                await persistHistoryLimit(limit);
                logger.user.settingsChange("historyLimit", oldLimit, limit);
            } catch (error) {
                logger.error(
                    "Failed to update history limit from settings",
                    ensureError(error)
                );
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

            const normalizedVolume =
                convertSliderPercentToNormalizedVolume(sliderValue);

            applySettingChanges({
                inAppAlertVolume: normalizedVolume,
            });

            if (prefersReducedMotion) {
                setPendingVolume(normalizedVolume);
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
            setPendingVolume,
        ]
    );

    const handleInAppAlertPreviewClick = useCallback(() => {
        if (!inAppAlertsEnabled || !inAppAlertsSoundEnabled) {
            return;
        }

        clearVolumePreviewTimeout();

        const normalizedVolume = clampNormalizedVolume(inAppAlertVolume);

        if (normalizedVolume <= 0) {
            return;
        }

        playPreviewAtVolume(normalizedVolume);
    }, [
        clearVolumePreviewTimeout,
        inAppAlertsEnabled,
        inAppAlertsSoundEnabled,
        inAppAlertVolume,
        playPreviewAtVolume,
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
    const clampedVolume = clampNormalizedVolume(inAppAlertVolume);
    const volumePercent = convertNormalizedVolumeToSliderPercent(clampedVolume);
    const automaticPreviewSuppressed = prefersReducedMotion;
    const isVolumeSilent = clampedVolume <= 0;

    const backupSummary: BackupSummary | null = useMemo(() => {
        if (!lastBackupMetadata) {
            return null;
        }

        const formattedDate = new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(lastBackupMetadata.createdAt));

        return {
            formattedDate,
            formattedSize: formatByteSize(lastBackupMetadata.sizeBytes),
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
            isLoading,
            isVolumeControlDisabled,
            systemNotificationsControl,
            systemNotificationSoundControl,
        }),
        [
            inAppAlertsControl,
            inAppAlertSoundControl,
            inAppAlertVolumeControl,
            isLoading,
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
            setError(`Failed to sync data: ${getUserFacingErrorDetail(error)}`);
        }
    }, [fullResyncSites, setError]);

    const handleDownloadSQLite = useCallback(async () => {
        clearError();
        try {
            const result = await saveSqliteBackup();

            if (result.canceled) {
                logger.user.action("Canceled SQLite backup save");
                return;
            }

            logger.user.action("Saved SQLite backup", {
                checksum: result.metadata.checksum,
                filePath: result.filePath,
                schemaVersion: result.metadata.schemaVersion,
                sizeBytes: result.metadata.sizeBytes,
            });
        } catch (error: unknown) {
            logger.error("Failed to save SQLite backup", ensureError(error));
            setError(
                `Failed to save SQLite backup: ${getUserFacingErrorDetail(error)}`
            );
        }
    }, [
        clearError,
        saveSqliteBackup,
        setError,
    ]);

    const handleRestoreSQLite = useCallback(
        async (file: File) => {
            clearError();
            try {
                const payloadResult =
                    await tryBuildSerializedDatabaseRestorePayloadFromFile({
                        file,
                        maxBytes: MAX_IPC_SQLITE_RESTORE_BYTES,
                    });

                if (payloadResult.ok === false) {
                    throw new Error(payloadResult.message);
                }

                const restoreSummary = await restoreSqliteBackup(
                    payloadResult.payload
                );
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

    const SettingsHeaderIcon = AppIcons.settings.gearFilled;
    const normalizedLastError = lastError ?? null;
    const showSyncSuccessBanner = syncSuccess && !normalizedLastError;

    const MonitoringIcon = AppIcons.metrics.monitor;
    const ApplicationIcon = AppIcons.ui.home;
    const MaintenanceIcon = AppIcons.ui.database;

    const applicationSectionProps = useMemo(
        () => ({
            autoStartControl,
            availableThemes,
            currentThemeName,
            icon: ApplicationIcon,
            isLoading,
            minimizeToTrayControl,
            onThemeChange: handleThemeSelectChange,
        }),
        [
            ApplicationIcon,
            autoStartControl,
            availableThemes,
            currentThemeName,
            handleThemeSelectChange,
            isLoading,
            minimizeToTrayControl,
        ]
    );

    const monitoringSectionProps = useMemo(
        () => ({
            currentHistoryLimit,
            icon: MonitoringIcon,
            isLoading,
            onHistoryLimitChange: handleHistoryLimitSelectChange,
        }),
        [
            currentHistoryLimit,
            handleHistoryLimitSelectChange,
            isLoading,
            MonitoringIcon,
        ]
    );

    const maintenanceSectionProps = useMemo(
        () => ({
            backupSummary,
            downloadButtonIcon,
            icon: MaintenanceIcon,
            isLoading,
            onDownloadBackup: handleDownloadSQLiteClick,
            onRefreshHistory: handleSyncNowClick,
            onResetData: handleResetClick,
            onRestoreClick: handleRestoreSQLiteClick,
            onRestoreFileChange: handleRestoreInputChange,
            refreshButtonIcon,
            resetButtonIcon,
            restoreFileInputRef,
            showButtonLoading,
            uploadButtonIcon,
        }),
        [
            backupSummary,
            downloadButtonIcon,
            handleDownloadSQLiteClick,
            handleResetClick,
            handleRestoreInputChange,
            handleRestoreSQLiteClick,
            handleSyncNowClick,
            isLoading,
            MaintenanceIcon,
            refreshButtonIcon,
            resetButtonIcon,
            restoreFileInputRef,
            showButtonLoading,
            uploadButtonIcon,
        ]
    );

    const headerBackground = useMemo(
        () => (
            <GalaxyBackground
                className="galaxy-background--banner galaxy-background--banner-compact"
                isDark={isDark}
            />
        ),
        [isDark]
    );

    const headerIcon = useMemo(
        () => <SettingsHeaderIcon size={22} />,
        [SettingsHeaderIcon]
    );

    const subtitle = useMemo(
        () => (
            <ThemedText size="sm" variant="secondary">
                Fine-tune monitoring, notifications, and data workflows.
            </ThemedText>
        ),
        []
    );

    const overlayClassName = `${isDark ? "dark" : ""} ${
        isClosing ? "modal-overlay--closing" : ""
    }`;
    const shellClassName = `settings-modal ${
        isClosing ? "modal-shell--closing" : ""
    }`;

    return {
        applicationSectionProps,
        clearError,
        handleCloseButtonClick,
        headerBackground,
        headerIcon,
        isClosing,
        isDark,
        isLoading,
        lastError: normalizedLastError,
        maintenanceSectionProps,
        monitoringSectionProps,
        notificationSectionProps,
        overlayClassName,
        shellClassName,
        showSyncSuccessBanner,
        subtitle,
    };
};
