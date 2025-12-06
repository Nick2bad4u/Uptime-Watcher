import type { ChangeEvent, ReactNode, RefObject } from "react";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import type { ThemeName } from "../../theme/types";

/* eslint-disable react/no-multi-comp -- Settings sections intentionally live together so they can share layout primitives and remain easy to discover when evolving the modal. */
import { HISTORY_LIMIT_OPTIONS } from "../../constants";
import { StatusIndicator } from "../../theme/components/StatusIndicator";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedSelect } from "../../theme/components/ThemedSelect";
import { ThemedText } from "../../theme/components/ThemedText";
import { Tooltip } from "../common/Tooltip/Tooltip";
import { SettingItem } from "../shared/SettingItem";

interface SettingsSectionProps {
    readonly children: ReactNode;
    readonly description: string;
    readonly icon: IconType;
    readonly testId: string;
    readonly title: string;
}

const SettingsSection = ({
    children,
    description,
    icon: SectionIcon,
    testId,
    title,
}: SettingsSectionProps): JSX.Element => (
    <section className="settings-section" data-testid={testId}>
        <header className="settings-section__header">
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
                <ThemedText
                    className="settings-section__description"
                    size="xs"
                    variant="secondary"
                >
                    {description}
                </ThemedText>
            </div>
        </header>
        <div className="settings-section__content">{children}</div>
    </section>
);

/**
 * Pre-formatted metadata summary for the latest backup record.
 */
export interface BackupSummary {
    readonly formattedDate: string;
    readonly formattedSize: string;
    readonly retentionHintDays: number;
    readonly schemaVersion: number;
}

interface MonitoringSectionProps {
    readonly currentHistoryLimit: number;
    readonly icon: IconType;
    readonly isLoading: boolean;
    readonly onHistoryLimitChange: (
        event: ChangeEvent<HTMLSelectElement>
    ) => void;
}

/**
 * Monitoring preferences section.
 */
export const MonitoringSection = ({
    currentHistoryLimit,
    icon,
    isLoading,
    onHistoryLimitChange,
}: MonitoringSectionProps): JSX.Element => (
    <SettingsSection
        description="Control how much monitoring history is retained."
        icon={icon}
        testId="settings-section-monitoring"
        title="Monitoring"
    >
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
                onChange={onHistoryLimitChange}
                value={currentHistoryLimit}
            >
                {HISTORY_LIMIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </ThemedSelect>
            <ThemedText
                className="settings-field__helper"
                size="xs"
                variant="tertiary"
            >
                Limits the number of response records stored for each monitor.
            </ThemedText>
        </div>
    </SettingsSection>
);

interface NotificationSectionProps {
    readonly icon: IconType;
    readonly inAppAlertsControl: ReactNode;
    readonly inAppAlertSoundControl: ReactNode;
    readonly inAppAlertVolumeControl: ReactNode;
    readonly isVolumeControlDisabled: boolean;
    readonly systemNotificationsControl: ReactNode;
    readonly systemNotificationSoundControl: ReactNode;
}

/**
 * Notification preferences section.
 */
export const NotificationSection = ({
    icon,
    inAppAlertsControl,
    inAppAlertSoundControl,
    inAppAlertVolumeControl,
    isVolumeControlDisabled,
    systemNotificationsControl,
    systemNotificationSoundControl,
}: NotificationSectionProps): JSX.Element => (
    <SettingsSection
        description="Choose how Uptime Watcher keeps you informed."
        icon={icon}
        testId="settings-section-notifications"
        title="Notifications"
    >
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
                disabled={isVolumeControlDisabled}
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
    </SettingsSection>
);

interface ApplicationSectionProps {
    readonly autoStartControl: ReactNode;
    readonly availableThemes: readonly ThemeName[];
    readonly currentThemeName: ThemeName;
    readonly icon: IconType;
    readonly isLoading: boolean;
    readonly minimizeToTrayControl: ReactNode;
    readonly onThemeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Application/UX preferences section.
 */
export const ApplicationSection = ({
    autoStartControl,
    availableThemes,
    currentThemeName,
    icon,
    isLoading,
    minimizeToTrayControl,
    onThemeChange,
}: ApplicationSectionProps): JSX.Element => (
    <SettingsSection
        description="Personalize the desktop experience."
        icon={icon}
        testId="settings-section-application"
        title="Application"
    >
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
                onChange={onThemeChange}
                value={currentThemeName}
            >
                {availableThemes.map((theme) => (
                    <option key={theme} value={theme}>
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </option>
                ))}
            </ThemedSelect>
            <div className="settings-theme-preview">
                <ThemedText size="xs" variant="tertiary">
                    Preview:
                </ThemedText>
                <StatusIndicator size="sm" status="up" />
                <StatusIndicator size="sm" status="down" />
                <StatusIndicator size="sm" status="pending" />
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
    </SettingsSection>
);

interface MaintenanceSectionProps {
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
}

/**
 * Backup, restore, and maintenance utilities section.
 */
export const MaintenanceSection = ({
    /* eslint-enable react/no-multi-comp -- Section components below are colocated only within this file. */
    backupSummary,
    downloadButtonIcon,
    icon,
    isLoading,
    onDownloadBackup,
    onRefreshHistory,
    onResetData,
    onRestoreClick,
    onRestoreFileChange,
    refreshButtonIcon,
    resetButtonIcon,
    restoreFileInputRef,
    showButtonLoading,
    uploadButtonIcon,
}: MaintenanceSectionProps): JSX.Element => (
    <SettingsSection
        description="Manage data exports and advanced utilities."
        icon={icon}
        testId="settings-section-data"
        title="Data & Maintenance"
    >
        <div className="settings-actions">
            <ThemedButton
                className="settings-actions__primary"
                data-testid="settings-export-data"
                disabled={isLoading}
                icon={downloadButtonIcon}
                loading={showButtonLoading}
                onClick={onDownloadBackup}
                size="sm"
                variant="primary"
            >
                Export monitoring data
            </ThemedButton>
            <Tooltip content="Restore a previously exported SQLite backup (overwrites current data)">
                {(triggerProps) => (
                    <ThemedButton
                        {...triggerProps}
                        data-testid="settings-restore-backup"
                        disabled={isLoading}
                        icon={uploadButtonIcon}
                        loading={showButtonLoading}
                        onClick={onRestoreClick}
                        size="sm"
                        variant="secondary"
                    >
                        Restore backup
                    </ThemedButton>
                )}
            </Tooltip>
            <input
                accept=".sqlite,.sqlite3,.db,.db3"
                data-testid="settings-restore-input"
                hidden
                onChange={onRestoreFileChange}
                ref={restoreFileInputRef}
                type="file"
            />
            <Tooltip content="Refreshes monitoring history from the database">
                {(triggerProps) => (
                    <ThemedButton
                        {...triggerProps}
                        data-testid="settings-refresh-history"
                        disabled={isLoading}
                        icon={refreshButtonIcon}
                        loading={showButtonLoading}
                        onClick={onRefreshHistory}
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
                        onClick={onResetData}
                        size="sm"
                        variant="error"
                    >
                        Reset everything
                    </ThemedButton>
                )}
            </Tooltip>
            <div
                className="settings-field__helper"
                data-testid="settings-backup-metadata"
            >
                {backupSummary ? (
                    <>
                        <ThemedText size="xs" variant="secondary">
                            Latest backup: {backupSummary.formattedDate} ·{" "}
                            {backupSummary.formattedSize} · schema v
                            {backupSummary.schemaVersion}
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary">
                            Retain ~{backupSummary.retentionHintDays} day(s)
                        </ThemedText>
                    </>
                ) : (
                    <ThemedText size="xs" variant="tertiary">
                        Download a backup to view creation time, size, and
                        schema version metadata for restore validation.
                    </ThemedText>
                )}
            </div>
        </div>
    </SettingsSection>
);
