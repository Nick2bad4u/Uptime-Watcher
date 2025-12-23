import {
    type ChangeEvent,
    type JSX,
    useCallback,
    useEffect,
    useMemo,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { useConfirmDialog } from "../../hooks/ui/useConfirmDialog";
import { usePromptDialog } from "../../hooks/ui/usePromptDialog";
import {
    type CloudStoreState,
    useCloudStore,
} from "../../stores/cloud/useCloudStore";
import { ThemedCheckbox } from "../../theme/components/ThemedCheckbox";
import { ThemedText } from "../../theme/components/ThemedText";
import { AppIcons } from "../../utils/icons";
import { CloudSection } from "./cloud/CloudSection";

/**
 * Wiring component for the "Cloud Sync & Backup" settings section.
 */
export const CloudSettingsSection = (): JSX.Element => {
    const requestConfirmation = useConfirmDialog();
    const requestPrompt = usePromptDialog();

    const {
        backups,
        clearEncryptionKey,
        configureFilesystemProvider,
        connectDropbox,
        connectGoogleDrive,
        deleteBackup,
        deletingBackupKey,
        disconnect,
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
        isSettingSyncEnabled,
        isUploadingBackup,
        lastBackupMigrationResult,
        lastRemoteSyncResetResult,
        listBackups,
        migrateBackups,
        refreshRemoteSyncResetPreview,
        refreshStatus,
        remoteSyncResetPreview,
        requestSyncNow,
        resetRemoteSyncState,
        restoreBackup,
        restoringBackupKey,
        setEncryptionPassphrase,
        setSyncEnabled,
        status,
        uploadLatestBackup,
    } = useCloudStore(
        useShallow(
            useCallback(
                (state: CloudStoreState) => ({
                    backups: state.backups,
                    clearEncryptionKey: state.clearEncryptionKey,
                    configureFilesystemProvider:
                        state.configureFilesystemProvider,
                    connectDropbox: state.connectDropbox,
                    connectGoogleDrive: state.connectGoogleDrive,
                    deleteBackup: state.deleteBackup,
                    deletingBackupKey: state.deletingBackupKey,
                    disconnect: state.disconnect,
                    isClearingEncryptionKey: state.isClearingEncryptionKey,
                    isConfiguringFilesystemProvider:
                        state.isConfiguringFilesystemProvider,
                    isConnectingDropbox: state.isConnectingDropbox,
                    isConnectingGoogleDrive: state.isConnectingGoogleDrive,
                    isDisconnecting: state.isDisconnecting,
                    isListingBackups: state.isListingBackups,
                    isMigratingBackups: state.isMigratingBackups,
                    isRefreshingRemoteSyncResetPreview:
                        state.isRefreshingRemoteSyncResetPreview,
                    isRefreshingStatus: state.isRefreshingStatus,
                    isRequestingSyncNow: state.isRequestingSyncNow,
                    isResettingRemoteSyncState:
                        state.isResettingRemoteSyncState,
                    isSettingEncryptionPassphrase:
                        state.isSettingEncryptionPassphrase,
                    isSettingSyncEnabled: state.isSettingSyncEnabled,
                    isUploadingBackup: state.isUploadingBackup,
                    lastBackupMigrationResult: state.lastBackupMigrationResult,
                    lastRemoteSyncResetResult: state.lastRemoteSyncResetResult,
                    listBackups: state.listBackups,
                    migrateBackups: state.migrateBackups,
                    refreshRemoteSyncResetPreview:
                        state.refreshRemoteSyncResetPreview,
                    refreshStatus: state.refreshStatus,
                    remoteSyncResetPreview: state.remoteSyncResetPreview,
                    requestSyncNow: state.requestSyncNow,
                    resetRemoteSyncState: state.resetRemoteSyncState,
                    restoreBackup: state.restoreBackup,
                    restoringBackupKey: state.restoringBackupKey,
                    setEncryptionPassphrase: state.setEncryptionPassphrase,
                    setSyncEnabled: state.setSyncEnabled,
                    status: state.status,
                    uploadLatestBackup: state.uploadLatestBackup,
                }),
                []
            )
        )
    );

    const fireAndForget = useCallback(
        (action: () => Promise<unknown>): void => {
            void (async (): Promise<void> => {
                try {
                    await action();
                } catch {
                    // Errors are already routed through the shared error handling.
                }
            })();
        },
        []
    );

    useEffect(
        function refreshCloudStatusOnMount(): void {
            fireAndForget(refreshStatus);
        },
        [fireAndForget, refreshStatus]
    );

    useEffect(
        function loadCloudBackupsWhenConnectedEffect(): void {
            if (status?.connected) {
                fireAndForget(listBackups);
            }
        },
        [
            fireAndForget,
            listBackups,
            status?.connected,
        ]
    );

    useEffect(
        function refreshRemoteSyncPreviewWhenConnectedEffect(): void {
            if (status?.connected && status.syncEnabled) {
                fireAndForget(refreshRemoteSyncResetPreview);
            }
        },
        [
            fireAndForget,
            refreshRemoteSyncResetPreview,
            status?.connected,
            status?.syncEnabled,
        ]
    );

    const handleConnectDropbox = useCallback((): void => {
        fireAndForget(connectDropbox);
    }, [connectDropbox, fireAndForget]);

    const handleConnectGoogleDrive = useCallback((): void => {
        fireAndForget(connectGoogleDrive);
    }, [connectGoogleDrive, fireAndForget]);
    const confirmDisconnect = useCallback(
        async function confirmDisconnect(): Promise<void> {
            const confirmed = await requestConfirmation({
                confirmLabel: "Disconnect",
                message:
                    "Disconnect the current cloud provider and clear stored credentials?",
                title: "Disconnect Cloud Provider",
                tone: "danger",
            });

            if (!confirmed) {
                return;
            }

            await disconnect();
        },
        [disconnect, requestConfirmation]
    );

    const handleDisconnect = useCallback(
        function handleDisconnect(): void {
            fireAndForget(confirmDisconnect);
        },
        [confirmDisconnect, fireAndForget]
    );

    const handleRefreshStatus = useCallback((): void => {
        fireAndForget(refreshStatus);
    }, [fireAndForget, refreshStatus]);

    const handleListBackups = useCallback((): void => {
        fireAndForget(listBackups);
    }, [fireAndForget, listBackups]);

    const handleRequestSyncNow = useCallback((): void => {
        fireAndForget(requestSyncNow);
    }, [fireAndForget, requestSyncNow]);

    const handleUploadLatestBackup = useCallback((): void => {
        fireAndForget(uploadLatestBackup);
    }, [fireAndForget, uploadLatestBackup]);

    const handleSyncEnabledChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            fireAndForget(() => setSyncEnabled(event.target.checked));
        },
        [fireAndForget, setSyncEnabled]
    );

    const confirmRestoreBackup = useCallback(
        async function confirmRestoreBackup(key: string): Promise<void> {
            const entry = backups.find((backup) => backup.key === key);

            const confirmed = await requestConfirmation({
                confirmLabel: "Restore",
                message: `Restore backup '${entry?.fileName ?? key}'? This will overwrite your current database.`,
                title: "Restore Backup",
                tone: "danger",
            });

            if (!confirmed) {
                return;
            }

            await restoreBackup(key);
        },
        [
            backups,
            requestConfirmation,
            restoreBackup,
        ]
    );

    const handleRestoreBackup = useCallback(
        function handleRestoreBackup(key: string): void {
            fireAndForget(() => confirmRestoreBackup(key));
        },
        [confirmRestoreBackup, fireAndForget]
    );

    const confirmDeleteBackup = useCallback(
        async function confirmDeleteBackup(key: string): Promise<void> {
            const entry = backups.find((backup) => backup.key === key);

            const confirmed = await requestConfirmation({
                confirmLabel: "Delete",
                message: `Delete remote backup '${entry?.fileName ?? key}'? This cannot be undone.`,
                title: "Delete Remote Backup",
                tone: "danger",
            });

            if (!confirmed) {
                return;
            }

            await deleteBackup(key);
        },
        [
            backups,
            deleteBackup,
            requestConfirmation,
        ]
    );

    const handleDeleteBackup = useCallback(
        (key: string): void => {
            fireAndForget(() => confirmDeleteBackup(key));
        },
        [confirmDeleteBackup, fireAndForget]
    );

    const handleSetEncryptionPassphrase = useCallback(
        function handleSetEncryptionPassphrase(): void {
            fireAndForget(async () => {
                const encryptionMode = status?.encryptionMode ?? "none";
                const result = await requestPrompt({
                    confirmLabel:
                        encryptionMode === "passphrase" ? "Unlock" : "Enable",
                    message:
                        encryptionMode === "passphrase"
                            ? "Enter your encryption passphrase to unlock sync and encrypted backups on this device."
                            : "Enter a passphrase to enable client-side encryption for new cloud sync artifacts and backups.",
                    placeholder: "Passphrase (min 8 characters)",
                    title:
                        encryptionMode === "passphrase"
                            ? "Unlock Encryption"
                            : "Enable Encryption",
                    type: "password",
                });

                if (result === null) {
                    return;
                }

                await setEncryptionPassphrase(result);
            });
        },
        [
            fireAndForget,
            requestPrompt,
            setEncryptionPassphrase,
            status?.encryptionMode,
        ]
    );

    const handleClearEncryptionKey = useCallback(
        function handleClearEncryptionKey(): void {
            fireAndForget(async () => {
                const confirmed = await requestConfirmation({
                    confirmLabel: "Clear key",
                    message:
                        "Clear the locally cached encryption key? You will need to re-enter the passphrase to sync or restore encrypted backups on this device.",
                    title: "Lock Encryption",
                    tone: "danger",
                });

                if (!confirmed) {
                    return;
                }

                await clearEncryptionKey();
            });
        },
        [
            clearEncryptionKey,
            fireAndForget,
            requestConfirmation,
        ]
    );

    const confirmEncryptBackups = useCallback(
        async function confirmEncryptBackups(args: {
            deleteSource: boolean;
        }): Promise<void> {
            const targetCount = backups.filter(
                (backup) => !backup.encrypted
            ).length;

            if (targetCount === 0) {
                return;
            }

            const confirmed = await requestConfirmation({
                confirmLabel: args.deleteSource
                    ? "Encrypt + delete"
                    : "Encrypt",
                message: args.deleteSource
                    ? `Encrypt ${targetCount} backup(s) and delete the original plaintext copies after successful upload? This cannot be undone.`
                    : `Encrypt ${targetCount} existing plaintext backup(s) and keep the originals?`,
                title: "Encrypt Existing Backups",
                tone: args.deleteSource ? "danger" : "default",
            });

            if (!confirmed) {
                return;
            }

            await migrateBackups({
                deleteSource: args.deleteSource,
                target: "encrypted",
            });
        },
        [
            backups,
            migrateBackups,
            requestConfirmation,
        ]
    );

    const handleEncryptBackupsKeepOriginals = useCallback(
        function handleEncryptBackupsKeepOriginals(): void {
            fireAndForget(() => confirmEncryptBackups({ deleteSource: false }));
        },
        [confirmEncryptBackups, fireAndForget]
    );

    const handleEncryptBackupsDeleteOriginals = useCallback(
        function handleEncryptBackupsDeleteOriginals(): void {
            fireAndForget(() => confirmEncryptBackups({ deleteSource: true }));
        },
        [confirmEncryptBackups, fireAndForget]
    );

    const confirmResetRemoteSyncState = useCallback(
        async function confirmResetRemoteSyncState(): Promise<void> {
            const preview =
                remoteSyncResetPreview ??
                (await refreshRemoteSyncResetPreview());
            if (!preview) {
                return;
            }

            const confirmed = await requestConfirmation({
                confirmLabel: "Reset remote sync",
                message:
                    "Reset the remote sync history and re-seed from this device? Other devices may lose unsynced changes and will need to resync.",
                title: "Reset Remote Sync",
                tone: "danger",
            });

            if (!confirmed) {
                return;
            }

            const uniqueDeviceCount = new Set([
                ...preview.deviceIds,
                ...preview.operationDeviceIds,
            ]).size;
            const expected = `RESET ${uniqueDeviceCount}`;
            const typed = await requestPrompt({
                confirmLabel: "Confirm reset",
                message: `Type ${expected} to confirm. This operation is destructive and cannot be undone.`,
                placeholder: expected,
                title: "Type RESET to Confirm",
                type: "text",
            });

            if (typed !== expected) {
                return;
            }

            await resetRemoteSyncState();
        },
        [
            refreshRemoteSyncResetPreview,
            remoteSyncResetPreview,
            requestConfirmation,
            requestPrompt,
            resetRemoteSyncState,
        ]
    );

    const handleResetRemoteSyncState = useCallback(
        function handleResetRemoteSyncState(): void {
            fireAndForget(confirmResetRemoteSyncState);
        },
        [confirmResetRemoteSyncState, fireAndForget]
    );

    const handleRefreshRemoteSyncResetPreview = useCallback(
        function handleRefreshRemoteSyncResetPreview(): void {
            fireAndForget(refreshRemoteSyncResetPreview);
        },
        [fireAndForget, refreshRemoteSyncResetPreview]
    );

    const handleConfigureFilesystemProvider = useCallback(
        (baseDirectory: string): void => {
            const trimmed = baseDirectory.trim();
            if (!trimmed) {
                return;
            }

            fireAndForget(() =>
                configureFilesystemProvider({ baseDirectory: trimmed })
            );
        },
        [configureFilesystemProvider, fireAndForget]
    );

    const syncEnabled = status?.syncEnabled ?? false;
    const connected = status?.connected ?? false;

    const syncEnabledControl = useMemo(
        (): JSX.Element => (
            <div className="flex items-center gap-2">
                <ThemedCheckbox
                    aria-label="Enable cloud sync"
                    checked={syncEnabled}
                    disabled={!connected || isSettingSyncEnabled}
                    onChange={handleSyncEnabledChange}
                />
                <ThemedText size="sm" variant="secondary">
                    {syncEnabled ? "Enabled" : "Disabled"}
                </ThemedText>
            </div>
        ),
        [
            connected,
            handleSyncEnabledChange,
            isSettingSyncEnabled,
            syncEnabled,
        ]
    );

    return (
        <CloudSection
            backups={backups}
            deletingBackupKey={deletingBackupKey}
            icon={AppIcons.ui.cloud}
            isClearingEncryptionKey={isClearingEncryptionKey}
            isConfiguringFilesystemProvider={isConfiguringFilesystemProvider}
            isConnectingDropbox={isConnectingDropbox}
            isConnectingGoogleDrive={isConnectingGoogleDrive}
            isDisconnecting={isDisconnecting}
            isListingBackups={isListingBackups}
            isMigratingBackups={isMigratingBackups}
            isRefreshingRemoteSyncResetPreview={
                isRefreshingRemoteSyncResetPreview
            }
            isRefreshingStatus={isRefreshingStatus}
            isRequestingSyncNow={isRequestingSyncNow}
            isResettingRemoteSyncState={isResettingRemoteSyncState}
            isSettingEncryptionPassphrase={isSettingEncryptionPassphrase}
            isUploadingBackup={isUploadingBackup}
            lastBackupMigrationResult={lastBackupMigrationResult}
            lastRemoteSyncResetResult={lastRemoteSyncResetResult}
            onClearEncryptionKey={handleClearEncryptionKey}
            onConfigureFilesystemProvider={handleConfigureFilesystemProvider}
            onConnectDropbox={handleConnectDropbox}
            onConnectGoogleDrive={handleConnectGoogleDrive}
            onDeleteBackup={handleDeleteBackup}
            onDisconnect={handleDisconnect}
            onEncryptBackupsDeleteOriginals={
                handleEncryptBackupsDeleteOriginals
            }
            onEncryptBackupsKeepOriginals={handleEncryptBackupsKeepOriginals}
            onListBackups={handleListBackups}
            onRefreshRemoteSyncResetPreview={
                handleRefreshRemoteSyncResetPreview
            }
            onRefreshStatus={handleRefreshStatus}
            onRequestSyncNow={handleRequestSyncNow}
            onResetRemoteSyncState={handleResetRemoteSyncState}
            onRestoreBackup={handleRestoreBackup}
            onSetEncryptionPassphrase={handleSetEncryptionPassphrase}
            onUploadLatestBackup={handleUploadLatestBackup}
            remoteSyncResetPreview={remoteSyncResetPreview}
            restoringBackupKey={restoringBackupKey}
            status={status}
            syncEnabledControl={syncEnabledControl}
        />
    );
};
