import type { CloudBackupEntry, CloudStatusSummary } from "@shared/types/cloud";
import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import {
    type ChangeEvent,
    type MouseEvent as ReactMouseEvent,
    type ReactNode,
    type RefObject,
    useCallback,
    useMemo,
} from "react";

import type { ThemeName } from "../../theme/types";

/* eslint-disable react/no-multi-comp -- Settings sections intentionally live together so they can share layout primitives and remain easy to discover when evolving the modal. */
import { HISTORY_LIMIT_OPTIONS } from "../../constants";
import { StatusIndicator } from "../../theme/components/StatusIndicator";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedSelect } from "../../theme/components/ThemedSelect";
import { ThemedText } from "../../theme/components/ThemedText";
import { ErrorAlert } from "../common/ErrorAlert/ErrorAlert";
import { Tooltip } from "../common/Tooltip/Tooltip";
import { SettingItem } from "../shared/SettingItem";
import { BackupMigrationPanel } from "./cloud/BackupMigrationPanel";
import { SyncMaintenancePanel } from "./cloud/SyncMaintenancePanel";

interface SettingsSectionProperties {
    readonly children: ReactNode;
    readonly description: string;
    readonly icon: IconType;
    readonly testId: string;
    readonly title: string;
}

export const SettingsSection = ({
    children,
    description,
    icon: SectionIcon,
    testId,
    title,
}: SettingsSectionProperties): JSX.Element => (
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
                <ThemedText size="sm" variant="secondary">
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

interface MonitoringSectionProperties {
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
}: MonitoringSectionProperties): JSX.Element => (
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

interface NotificationSectionProperties {
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
}: NotificationSectionProperties): JSX.Element => (
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

interface CloudSectionProperties {
    readonly backups: readonly CloudBackupEntry[];
    readonly deletingBackupKey: null | string;
    readonly icon: IconType;
    readonly isClearingEncryptionKey: boolean;
    readonly isConnectingDropbox: boolean;
    readonly isDisconnecting: boolean;
    readonly isListingBackups: boolean;
    readonly isMigratingBackups: boolean;
    readonly isRefreshingRemoteSyncResetPreview: boolean;
    readonly isRefreshingStatus: boolean;
    readonly isRequestingSyncNow: boolean;
    readonly isResettingRemoteSyncState: boolean;
    readonly isSettingEncryptionPassphrase: boolean;
    readonly isUploadingBackup: boolean;
    readonly lastBackupMigrationResult: CloudBackupMigrationResult | null;
    readonly lastRemoteSyncResetResult: CloudSyncResetResult | null;
    readonly onClearEncryptionKey: () => void;
    readonly onConnectDropbox: () => void;
    readonly onDeleteBackup: (key: string) => void;
    readonly onDisconnect: () => void;
    readonly onEncryptBackupsDeleteOriginals: () => void;
    readonly onEncryptBackupsKeepOriginals: () => void;
    readonly onListBackups: () => void;
    readonly onRefreshRemoteSyncResetPreview: () => void;

    readonly onRefreshStatus: () => void;
    readonly onRequestSyncNow: () => void;
    readonly onResetRemoteSyncState: () => void;
    readonly onRestoreBackup: (key: string) => void;
    readonly onSetEncryptionPassphrase: () => void;
    readonly onUploadLatestBackup: () => void;
    readonly remoteSyncResetPreview: CloudSyncResetPreview | null;
    readonly restoringBackupKey: null | string;
    readonly status: CloudStatusSummary | null;
    readonly syncEnabledControl: ReactNode;
}

type ConnectionSiteStatus = "down" | "pending" | "up";

function resolveEncryptionStatusLabel(args: {
    locked: boolean;
    mode: "none" | "passphrase";
}): string {
    if (args.mode === "none") {
        return "Off";
    }

    return args.locked ? "Passphrase (locked)" : "Passphrase (unlocked)";
}

function resolveEncryptionActionLabel(args: {
    locked: boolean;
    mode: "none" | "passphrase";
    working: boolean;
}): string {
    if (args.working) {
        return "Working…";
    }

    if (args.locked) {
        return "Unlock encryption";
    }

    if (args.mode === "passphrase") {
        return "Change/unlock passphrase";
    }

    return "Enable passphrase encryption";
}

function resolveProviderLabel(status: CloudStatusSummary | null): string {
    const provider = status?.provider ?? null;

    if (provider === "dropbox") {
        const accountLabel =
            status?.providerDetails?.kind === "dropbox"
                ? status.providerDetails.accountLabel
                : undefined;

        return accountLabel ? `Dropbox (${accountLabel})` : "Dropbox";
    }

    if (provider === "filesystem") {
        return "Filesystem";
    }

    return "Not configured";
}

function resolveConnectionSiteStatus(
    status: CloudStatusSummary | null
): ConnectionSiteStatus {
    if (status?.connected) {
        return "up";
    }

    if (status?.configured) {
        return "down";
    }

    return "pending";
}

interface CloudProviderStatusControlProperties {
    readonly providerLabel: string;
    readonly status: ConnectionSiteStatus;
}

const CloudProviderStatusControl = ({
    providerLabel,
    status,
}: CloudProviderStatusControlProperties): JSX.Element => (
    <div className="flex items-center gap-3">
        <StatusIndicator showText status={status} />
        <ThemedText size="sm" variant="secondary">
            {providerLabel}
        </ThemedText>
    </div>
);

interface CloudConnectionActionsProperties {
    readonly configured: boolean;
    readonly connected: boolean;
    readonly isConnectingDropbox: boolean;
    readonly isDisconnecting: boolean;
    readonly isRefreshingStatus: boolean;
    readonly onConnectDropbox: () => void;
    readonly onDisconnect: () => void;
    readonly onRefreshStatus: () => void;
}

const CloudConnectionActions = ({
    configured,
    connected,
    isConnectingDropbox,
    isDisconnecting,
    isRefreshingStatus,
    onConnectDropbox,
    onDisconnect,
    onRefreshStatus,
}: CloudConnectionActionsProperties): JSX.Element => (
    <div className="flex flex-wrap gap-2">
        <ThemedButton
            disabled={isRefreshingStatus}
            onClick={onRefreshStatus}
            size="sm"
            variant="secondary"
        >
            {isRefreshingStatus ? "Refreshing…" : "Refresh status"}
        </ThemedButton>

        {connected ? (
            <ThemedButton
                disabled={isDisconnecting}
                onClick={onDisconnect}
                size="sm"
                variant="error"
            >
                {isDisconnecting ? "Disconnecting…" : "Disconnect"}
            </ThemedButton>
        ) : (
            <>
                <ThemedButton
                    disabled={isConnectingDropbox}
                    onClick={onConnectDropbox}
                    size="sm"
                    variant="primary"
                >
                    {isConnectingDropbox ? "Connecting…" : "Connect Dropbox"}
                </ThemedButton>

                {configured ? (
                    <ThemedButton
                        disabled={isDisconnecting}
                        onClick={onDisconnect}
                        size="sm"
                        variant="secondary"
                    >
                        {isDisconnecting ? "Clearing…" : "Clear configuration"}
                    </ThemedButton>
                ) : null}
            </>
        )}
    </div>
);

interface CloudSyncActionsProperties {
    readonly connected: boolean;
    readonly isRequestingSyncNow: boolean;
    readonly onRequestSyncNow: () => void;
}

const CloudSyncActions = ({
    connected,
    isRequestingSyncNow,
    onRequestSyncNow,
}: CloudSyncActionsProperties): JSX.Element => (
    <div className="flex flex-wrap gap-2">
        <ThemedButton
            disabled={!connected || isRequestingSyncNow}
            onClick={onRequestSyncNow}
            size="sm"
            variant="secondary"
        >
            {isRequestingSyncNow ? "Syncing…" : "Sync now"}
        </ThemedButton>
    </div>
);

function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB",
    ] as const;
    const exponent = Math.min(
        units.length - 1,
        Math.floor(Math.log(bytes) / Math.log(1024))
    );
    const value = bytes / 1024 ** exponent;
    const formatted = exponent === 0 ? value.toFixed(0) : value.toFixed(1);
    return `${formatted} ${units[exponent]}`;
}

function formatOptionalTimestamp(value: null | number): string {
    if (value === null) {
        return "Never";
    }

    return new Date(value).toLocaleString();
}

/**
 * Cloud sync + remote backup section.
 */
interface RemoteBackupsPanelProperties {
    readonly backups: readonly CloudBackupEntry[];
    readonly connected: boolean;
    readonly deletingBackupKey: null | string;
    readonly isListingBackups: boolean;
    readonly isUploadingBackup: boolean;
    readonly onDeleteBackupClick: (key: string) => void;
    readonly onListBackups: () => void;
    readonly onRestoreBackupClick: (key: string) => void;
    readonly onUploadLatestBackup: () => void;
    readonly restoringBackupKey: null | string;
}

const RemoteBackupsPanel = ({
    backups,
    connected,
    deletingBackupKey,
    isListingBackups,
    isUploadingBackup,
    onDeleteBackupClick,
    onListBackups,
    onRestoreBackupClick,
    onUploadLatestBackup,
    restoringBackupKey,
}: RemoteBackupsPanelProperties): JSX.Element => {
    const handleRestoreClick = useCallback(
        (event: ReactMouseEvent<HTMLButtonElement>): void => {
            const key = event.currentTarget.dataset["backupKey"];
            if (key) {
                onRestoreBackupClick(key);
            }
        },
        [onRestoreBackupClick]
    );

    const handleDeleteClick = useCallback(
        (event: ReactMouseEvent<HTMLButtonElement>): void => {
            const key = event.currentTarget.dataset["backupKey"];
            if (key) {
                onDeleteBackupClick(key);
            }
        },
        [onDeleteBackupClick]
    );

    const content =
        backups.length === 0 ? (
            <ThemedText size="sm" variant="tertiary">
                {connected
                    ? "No remote backups found."
                    : "Connect a provider to see remote backups."}
            </ThemedText>
        ) : (
            <ul className="space-y-2">
                {backups.map((backup) => {
                    const encryptionSuffix = backup.encrypted
                        ? " · Encrypted"
                        : "";
                    const createdAt = new Date(
                        backup.metadata.createdAt
                    ).toLocaleString();

                    return (
                        <li
                            className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-950/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                            key={backup.key}
                        >
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-zinc-200">
                                    {backup.fileName}
                                </div>
                                <div className="text-xs text-zinc-400">
                                    {createdAt} ·{" "}
                                    {formatBytes(backup.metadata.sizeBytes)}
                                    {encryptionSuffix}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <ThemedButton
                                    data-backup-key={backup.key}
                                    disabled={
                                        !connected ||
                                        restoringBackupKey === backup.key
                                    }
                                    onClick={handleRestoreClick}
                                    size="sm"
                                    variant="secondary"
                                >
                                    {restoringBackupKey === backup.key
                                        ? "Restoring…"
                                        : "Restore"}
                                </ThemedButton>

                                <ThemedButton
                                    data-backup-key={backup.key}
                                    disabled={
                                        !connected ||
                                        deletingBackupKey === backup.key
                                    }
                                    onClick={handleDeleteClick}
                                    size="sm"
                                    variant="error"
                                >
                                    {deletingBackupKey === backup.key
                                        ? "Deleting…"
                                        : "Delete"}
                                </ThemedButton>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <ThemedText size="sm" variant="secondary" weight="medium">
                    Remote Backups
                </ThemedText>

                <div className="flex flex-wrap gap-2">
                    <ThemedButton
                        disabled={!connected || isListingBackups}
                        onClick={onListBackups}
                        size="sm"
                        variant="secondary"
                    >
                        {isListingBackups ? "Refreshing…" : "Refresh list"}
                    </ThemedButton>
                    <ThemedButton
                        disabled={!connected || isUploadingBackup}
                        onClick={onUploadLatestBackup}
                        size="sm"
                        variant="primary"
                    >
                        {isUploadingBackup
                            ? "Uploading…"
                            : "Upload latest backup"}
                    </ThemedButton>
                </div>
            </div>

            {content}
        </div>
    );
};

export const CloudSection = ({
    backups,
    deletingBackupKey,
    icon,
    isClearingEncryptionKey,
    isConnectingDropbox,
    isDisconnecting,
    isListingBackups,
    isMigratingBackups,
    isRefreshingRemoteSyncResetPreview,
    isRefreshingStatus,
    isRequestingSyncNow,
    isResettingRemoteSyncState,
    isSettingEncryptionPassphrase,
    isUploadingBackup,
    lastBackupMigrationResult,
    lastRemoteSyncResetResult,
    onClearEncryptionKey,
    onConnectDropbox,
    onDeleteBackup,
    onDisconnect,
    onEncryptBackupsDeleteOriginals,
    onEncryptBackupsKeepOriginals,
    onListBackups,
    onRefreshRemoteSyncResetPreview,
    onRefreshStatus,
    onRequestSyncNow,
    onResetRemoteSyncState,
    onRestoreBackup,
    onSetEncryptionPassphrase,
    onUploadLatestBackup,
    remoteSyncResetPreview,
    restoringBackupKey,
    status,
    syncEnabledControl,
}: CloudSectionProperties): JSX.Element => {
    const configured = status?.configured ?? false;
    const connected = status?.connected ?? false;
    const providerLabel = resolveProviderLabel(status);
    const connectionSiteStatus = resolveConnectionSiteStatus(status);

    const lastBackupLabel = formatOptionalTimestamp(
        status?.lastBackupAt ?? null
    );
    const lastSyncLabel = formatOptionalTimestamp(status?.lastSyncAt ?? null);

    const encryptionMode = status?.encryptionMode ?? "none";
    const encryptionLocked = status?.encryptionLocked ?? false;
    const syncEnabled = status?.syncEnabled ?? false;

    const plaintextBackupCount = backups.filter(
        (backup) => !backup.encrypted
    ).length;

    const encryptionLabel = resolveEncryptionStatusLabel({
        locked: encryptionLocked,
        mode: encryptionMode,
    });
    const encryptionActionLabel = resolveEncryptionActionLabel({
        locked: encryptionLocked,
        mode: encryptionMode,
        working: isSettingEncryptionPassphrase,
    });
    const lockEncryptionLabel = isClearingEncryptionKey
        ? "Clearing…"
        : "Lock encryption";
    const showLockEncryptionButton = encryptionMode === "passphrase";

    const handleRestoreButtonClick = useCallback(
        (key: string): void => {
            onRestoreBackup(key);
        },
        [onRestoreBackup]
    );

    const statusControl = useMemo(
        (): JSX.Element => (
            <CloudProviderStatusControl
                providerLabel={providerLabel}
                status={connectionSiteStatus}
            />
        ),
        [connectionSiteStatus, providerLabel]
    );

    const lastSyncControl = useMemo(
        (): JSX.Element => (
            <ThemedText size="sm" variant="secondary">
                {lastSyncLabel}
            </ThemedText>
        ),
        [lastSyncLabel]
    );

    const lastBackupControl = useMemo(
        (): JSX.Element => (
            <ThemedText size="sm" variant="secondary">
                {lastBackupLabel}
            </ThemedText>
        ),
        [lastBackupLabel]
    );

    const encryptionStatusControl = useMemo(
        (): JSX.Element => (
            <ThemedText size="sm" variant="secondary">
                {encryptionLabel}
            </ThemedText>
        ),
        [encryptionLabel]
    );
    return (
        <SettingsSection
            description="Opt-in cloud backup and true multi-device sync."
            icon={icon}
            testId="settings-section-cloud"
            title="Cloud Sync & Backup"
        >
            <div className="space-y-3">
                {status?.lastError ? (
                    <ErrorAlert message={status.lastError} variant="error" />
                ) : null}

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                    <ThemedText size="sm" variant="secondary" weight="medium">
                        Connection & Status
                    </ThemedText>

                    <div className="settings-toggle-stack mt-3">
                        <SettingItem
                            control={statusControl}
                            description="Current cloud provider connection status."
                            title="Status"
                        />

                        <SettingItem
                            control={lastSyncControl}
                            description="Last completed sync time (based on this device)."
                            title="Last Sync"
                        />

                        <SettingItem
                            control={lastBackupControl}
                            description="Last completed remote backup upload time (based on this device)."
                            title="Last Backup"
                        />
                    </div>

                    <div className="mt-3">
                        <CloudConnectionActions
                            configured={configured}
                            connected={connected}
                            isConnectingDropbox={isConnectingDropbox}
                            isDisconnecting={isDisconnecting}
                            isRefreshingStatus={isRefreshingStatus}
                            onConnectDropbox={onConnectDropbox}
                            onDisconnect={onDisconnect}
                            onRefreshStatus={onRefreshStatus}
                        />
                    </div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                    <ThemedText size="sm" variant="secondary" weight="medium">
                        Sync
                    </ThemedText>

                    <div className="settings-toggle-stack mt-3">
                        <SettingItem
                            control={syncEnabledControl}
                            description="When enabled, configuration changes are merged across devices."
                            title="Enable Sync"
                        />
                    </div>

                    <div className="mt-3">
                        <CloudSyncActions
                            connected={connected}
                            isRequestingSyncNow={isRequestingSyncNow}
                            onRequestSyncNow={onRequestSyncNow}
                        />
                    </div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                    <ThemedText size="sm" variant="secondary" weight="medium">
                        Encryption
                    </ThemedText>

                    <div className="settings-toggle-stack mt-3">
                        <SettingItem
                            control={encryptionStatusControl}
                            description="Optional client-side encryption for new cloud sync artifacts and backups."
                            title="Status"
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <ThemedButton
                            disabled={
                                !connected || isSettingEncryptionPassphrase
                            }
                            onClick={onSetEncryptionPassphrase}
                            size="sm"
                            variant="secondary"
                        >
                            {encryptionActionLabel}
                        </ThemedButton>

                        {showLockEncryptionButton ? (
                            <ThemedButton
                                disabled={isClearingEncryptionKey}
                                onClick={onClearEncryptionKey}
                                size="sm"
                                variant="secondary"
                            >
                                {lockEncryptionLabel}
                            </ThemedButton>
                        ) : null}
                    </div>
                </div>

                <RemoteBackupsPanel
                    backups={backups}
                    connected={connected}
                    deletingBackupKey={deletingBackupKey}
                    isListingBackups={isListingBackups}
                    isUploadingBackup={isUploadingBackup}
                    onDeleteBackupClick={onDeleteBackup}
                    onListBackups={onListBackups}
                    onRestoreBackupClick={handleRestoreButtonClick}
                    onUploadLatestBackup={onUploadLatestBackup}
                    restoringBackupKey={restoringBackupKey}
                />

                <BackupMigrationPanel
                    connected={connected}
                    encryptionLocked={encryptionLocked}
                    encryptionMode={encryptionMode}
                    isMigratingBackups={isMigratingBackups}
                    lastResult={lastBackupMigrationResult}
                    onEncryptBackupsDeleteOriginals={
                        onEncryptBackupsDeleteOriginals
                    }
                    onEncryptBackupsKeepOriginals={
                        onEncryptBackupsKeepOriginals
                    }
                    plaintextBackupCount={plaintextBackupCount}
                />

                <SyncMaintenancePanel
                    connected={connected}
                    encryptionLocked={encryptionLocked}
                    encryptionMode={encryptionMode}
                    isRefreshingPreview={isRefreshingRemoteSyncResetPreview}
                    isResetting={isResettingRemoteSyncState}
                    lastResult={lastRemoteSyncResetResult}
                    onRefreshPreview={onRefreshRemoteSyncResetPreview}
                    onResetRemoteSyncState={onResetRemoteSyncState}
                    preview={remoteSyncResetPreview}
                    syncEnabled={syncEnabled}
                />
            </div>
        </SettingsSection>
    );
};

interface ApplicationSectionProperties {
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
}: ApplicationSectionProperties): JSX.Element => (
    <SettingsSection
        description="Personalize the desktop experience."
        icon={icon}
        testId="settings-section-application"
        title="Application"
    >
        <div className="settings-field">
            <ThemedText size="sm" weight="medium">
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

interface MaintenanceSectionProperties {
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
}: MaintenanceSectionProperties): JSX.Element => (
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
