import type { CloudBackupEntry, CloudStatusSummary } from "@shared/types/cloud";
import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { ErrorAlert } from "../../common/ErrorAlert/ErrorAlert";
import { SettingItem } from "../../shared/SettingItem";
import { SettingsSection } from "../SettingsSections";
import { BackupMigrationPanel } from "./BackupMigrationPanel";
import { CloudProviderSetupPanel } from "./CloudProviderSetupPanel";
import { CloudSyncMaintenanceControl } from "./CloudSyncMaintenanceControl";
import { RemoteBackupsPanel } from "./RemoteBackupsPanel";

function formatOptionalTimestamp(value: null | number): string {
    if (value === null) {
        return "Never";
    }

    return new Date(value).toLocaleString();
}

function resolveEncryptionStatusLabel(args: {
    locked: boolean;
    mode: CloudStatusSummary["encryptionMode"];
}): string {
    if (args.mode === "none") {
        return "Off";
    }

    if (args.locked) {
        return "Locked";
    }

    return "Enabled";
}

function resolveEncryptionActionLabel(args: {
    locked: boolean;
    mode: CloudStatusSummary["encryptionMode"];
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

function resolveSyncNowLabel(args: { isRequestingSyncNow: boolean }): string {
    return args.isRequestingSyncNow ? "Syncing…" : "Sync now";
}

function resolveLockEncryptionLabel(args: {
    isClearingEncryptionKey: boolean;
}): string {
    return args.isClearingEncryptionKey ? "Clearing…" : "Lock encryption";
}

function renderOptionalErrorAlert(args: {
    lastError: string | undefined;
}): JSX.Element | null {
    if (!args.lastError) {
        return null;
    }

    return <ErrorAlert message={args.lastError} variant="error" />;
}

function renderCloudNotConfiguredHint(args: {
    configured: boolean;
}): JSX.Element | null {
    if (args.configured) {
        return null;
    }

    return (
        <ThemedText size="xs" variant="tertiary">
            Choose a provider above to enable cloud sync and remote backups.
        </ThemedText>
    );
}

/**
 * Props for the Cloud Sync & Backup settings section.
 */
export interface CloudSectionProperties {
    readonly backups: readonly CloudBackupEntry[];
    readonly deletingBackupKey: null | string;
    readonly icon: IconType;
    readonly isClearingEncryptionKey: boolean;
    readonly isConfiguringFilesystemProvider: boolean;
    readonly isConnectingDropbox: boolean;
    readonly isConnectingGoogleDrive: boolean;
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
    readonly onConfigureFilesystemProvider: (baseDirectory: string) => void;
    readonly onConnectDropbox: () => void;
    readonly onConnectGoogleDrive: () => void;
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
    readonly syncEnabledControl: JSX.Element;
}

export const CloudSection = ({
    backups,
    deletingBackupKey,
    icon,
    isClearingEncryptionKey,
    isConfiguringFilesystemProvider,
    isConnectingDropbox,
    isConnectingGoogleDrive,
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
    onConfigureFilesystemProvider,
    onConnectDropbox,
    onConnectGoogleDrive,
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

    const lastSyncLabel = formatOptionalTimestamp(status?.lastSyncAt ?? null);
    const lastBackupLabel = formatOptionalTimestamp(
        status?.lastBackupAt ?? null
    );

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

    const encryptionStatusControl = useMemo(
        (): JSX.Element => (
            <ThemedText size="sm" variant="secondary">
                {encryptionLabel}
            </ThemedText>
        ),
        [encryptionLabel]
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

    const lockEncryptionLabel = resolveLockEncryptionLabel({
        isClearingEncryptionKey,
    });

    const showLockEncryptionButton = encryptionMode === "passphrase";

    const handleRestoreButtonClick = useCallback(
        (key: string): void => {
            onRestoreBackup(key);
        },
        [onRestoreBackup]
    );

    const errorAlert = renderOptionalErrorAlert({
        lastError: status?.lastError,
    });

    const syncNowLabel = resolveSyncNowLabel({ isRequestingSyncNow });

    const buttonIconSize = getIconSize("sm");
    const rowIconSize = getIconSize("xs");

    const CloudIcon = AppIcons.ui.cloud;
    const LockIcon = AppIcons.ui.lock;
    const SyncIcon = AppIcons.actions.refreshAlt;
    const SyncNowIcon = AppIcons.actions.checkNow;
    const TimeIcon = AppIcons.metrics.time;
    const UnlockIcon = AppIcons.ui.unlock;
    const UploadIcon = AppIcons.actions.upload;

    const connectionHeaderIcon = useMemo(
        () => (
            <CloudIcon
                aria-hidden
                className="settings-accent--primary h-5 w-5"
            />
        ),
        [CloudIcon]
    );
    const syncHeaderIcon = useMemo(
        () => (
            <SyncIcon
                aria-hidden
                className="settings-accent--success h-5 w-5"
            />
        ),
        [SyncIcon]
    );
    const encryptionHeaderIcon = useMemo(
        () => (
            <LockIcon
                aria-hidden
                className="settings-accent--highlight h-5 w-5"
            />
        ),
        [LockIcon]
    );

    const lastSyncRowIcon = useMemo(
        () => (
            <TimeIcon
                aria-hidden
                className="settings-accent--primary-muted"
                size={rowIconSize}
            />
        ),
        [rowIconSize, TimeIcon]
    );
    const lastBackupRowIcon = useMemo(
        () => (
            <UploadIcon
                aria-hidden
                className="settings-accent--primary-muted"
                size={rowIconSize}
            />
        ),
        [rowIconSize, UploadIcon]
    );
    const syncEnabledRowIcon = useMemo(
        () => (
            <SyncIcon
                aria-hidden
                className="settings-accent--success-muted"
                size={rowIconSize}
            />
        ),
        [rowIconSize, SyncIcon]
    );
    const encryptionStatusRowIcon = useMemo(
        () => (
            <LockIcon
                aria-hidden
                className="settings-accent--highlight-muted"
                size={rowIconSize}
            />
        ),
        [LockIcon, rowIconSize]
    );

    const syncNowButtonIcon = useMemo(
        () => <SyncNowIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize, SyncNowIcon]
    );
    const lockEncryptionButtonIcon = useMemo(
        () => <LockIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize, LockIcon]
    );
    const encryptionActionButtonIcon = useMemo(() => {
        const IconComponent =
            encryptionMode === "passphrase" && encryptionLocked
                ? UnlockIcon
                : LockIcon;
        return <IconComponent aria-hidden size={buttonIconSize} />;
    }, [
        buttonIconSize,
        encryptionLocked,
        encryptionMode,
        LockIcon,
        UnlockIcon,
    ]);

    const notConfiguredHint = renderCloudNotConfiguredHint({ configured });

    return (
        <SettingsSection
            description="Opt-in cloud backup and true multi-device sync."
            icon={icon}
            testId="settings-section-cloud"
            title="Cloud Sync & Backup"
        >
            <div className="space-y-3">
                {errorAlert}

                <CloudProviderSetupPanel
                    isConfiguringFilesystemProvider={
                        isConfiguringFilesystemProvider
                    }
                    isConnectingDropbox={isConnectingDropbox}
                    isConnectingGoogleDrive={isConnectingGoogleDrive}
                    isDisconnecting={isDisconnecting}
                    isRefreshingStatus={isRefreshingStatus}
                    onConfigureFilesystemProvider={
                        onConfigureFilesystemProvider
                    }
                    onConnectDropbox={onConnectDropbox}
                    onConnectGoogleDrive={onConnectGoogleDrive}
                    onDisconnect={onDisconnect}
                    onRefreshStatus={onRefreshStatus}
                    status={status}
                />

                <div className="settings-subcard">
                    <div className="flex items-center gap-2">
                        {connectionHeaderIcon}
                        <ThemedText
                            size="sm"
                            variant="secondary"
                            weight="medium"
                        >
                            Connection & Status
                        </ThemedText>
                    </div>

                    <div className="settings-item-stack mt-4">
                        <SettingItem
                            control={lastSyncControl}
                            description="Last completed sync time (based on this device)."
                            icon={lastSyncRowIcon}
                            title="Last Sync"
                        />

                        <SettingItem
                            control={lastBackupControl}
                            description="Last completed remote backup upload time (based on this device)."
                            icon={lastBackupRowIcon}
                            title="Last Backup"
                        />
                    </div>
                </div>

                <div className="settings-subcard">
                    <div className="flex items-center gap-2">
                        {syncHeaderIcon}
                        <ThemedText
                            size="sm"
                            variant="secondary"
                            weight="medium"
                        >
                            Sync
                        </ThemedText>
                    </div>

                    <div className="settings-item-stack mt-4">
                        <SettingItem
                            control={syncEnabledControl}
                            description="When enabled, configuration changes are merged across devices."
                            icon={syncEnabledRowIcon}
                            title="Enable Sync"
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <ThemedButton
                            disabled={!connected || isRequestingSyncNow}
                            icon={syncNowButtonIcon}
                            onClick={onRequestSyncNow}
                            size="sm"
                            variant="secondary"
                        >
                            {syncNowLabel}
                        </ThemedButton>
                    </div>
                </div>

                <div className="settings-subcard">
                    <div className="flex items-center gap-2">
                        {encryptionHeaderIcon}
                        <ThemedText
                            size="sm"
                            variant="secondary"
                            weight="medium"
                        >
                            Encryption
                        </ThemedText>
                    </div>

                    <div className="settings-item-stack mt-4">
                        <SettingItem
                            control={encryptionStatusControl}
                            description="Optional client-side encryption for new cloud sync artifacts and backups."
                            icon={encryptionStatusRowIcon}
                            title="Status"
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <ThemedButton
                            disabled={
                                !connected || isSettingEncryptionPassphrase
                            }
                            icon={encryptionActionButtonIcon}
                            onClick={onSetEncryptionPassphrase}
                            size="sm"
                            variant="secondary"
                        >
                            {encryptionActionLabel}
                        </ThemedButton>

                        {showLockEncryptionButton ? (
                            <ThemedButton
                                disabled={isClearingEncryptionKey}
                                icon={lockEncryptionButtonIcon}
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

                {plaintextBackupCount > 0 ? (
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
                ) : null}

                <CloudSyncMaintenanceControl
                    connected={connected}
                    encryptionLocked={encryptionLocked}
                    encryptionMode={encryptionMode}
                    isRefreshingPreview={isRefreshingRemoteSyncResetPreview}
                    isResetting={isResettingRemoteSyncState}
                    lastResult={lastRemoteSyncResetResult}
                    onRefreshPreview={onRefreshRemoteSyncResetPreview}
                    onResetRemoteSyncState={onResetRemoteSyncState}
                    preview={remoteSyncResetPreview}
                    status={status}
                    syncEnabled={syncEnabled}
                />

                {notConfiguredHint}
            </div>
        </SettingsSection>
    );
};
