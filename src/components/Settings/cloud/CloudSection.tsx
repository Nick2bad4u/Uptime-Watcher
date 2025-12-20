import type { CloudBackupEntry, CloudStatusSummary } from "@shared/types/cloud";
import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
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

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                    <ThemedText size="sm" variant="secondary" weight="medium">
                        Connection & Status
                    </ThemedText>

                    <div className="settings-toggle-stack mt-3">
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

                    <div className="mt-3 flex flex-wrap gap-2">
                        <ThemedButton
                            disabled={!connected || isRequestingSyncNow}
                            onClick={onRequestSyncNow}
                            size="sm"
                            variant="secondary"
                        >
                            {syncNowLabel}
                        </ThemedButton>
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
                    syncEnabled={syncEnabled}
                />

                {notConfiguredHint}
            </div>
        </SettingsSection>
    );
};
