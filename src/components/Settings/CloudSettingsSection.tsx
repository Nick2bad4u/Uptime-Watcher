import {
    type ChangeEvent,
    type JSX,
    useCallback,
    useEffect,
    useMemo,
} from "react";

import { useConfirmDialog } from "../../hooks/ui/useConfirmDialog";
import { usePromptDialog } from "../../hooks/ui/usePromptDialog";
import {
    type CloudStoreState,
    useCloudStore,
} from "../../stores/cloud/useCloudStore";
import { ThemedCheckbox } from "../../theme/components/ThemedCheckbox";
import { ThemedText } from "../../theme/components/ThemedText";
import { AppIcons } from "../../utils/icons";
import { CloudSection } from "./SettingsSections";

const selectBackups = (state: CloudStoreState): CloudStoreState["backups"] =>
    state.backups;
const selectStatus = (state: CloudStoreState): CloudStoreState["status"] =>
    state.status;

const selectRefreshStatus = (
    state: CloudStoreState
): CloudStoreState["refreshStatus"] => state.refreshStatus;
const selectConnectDropbox = (
    state: CloudStoreState
): CloudStoreState["connectDropbox"] => state.connectDropbox;
const selectDisconnect = (
    state: CloudStoreState
): CloudStoreState["disconnect"] => state.disconnect;
const selectSetSyncEnabled = (
    state: CloudStoreState
): CloudStoreState["setSyncEnabled"] => state.setSyncEnabled;
const selectRequestSyncNow = (
    state: CloudStoreState
): CloudStoreState["requestSyncNow"] => state.requestSyncNow;
const selectListBackups = (
    state: CloudStoreState
): CloudStoreState["listBackups"] => state.listBackups;
const selectUploadLatestBackup = (
    state: CloudStoreState
): CloudStoreState["uploadLatestBackup"] => state.uploadLatestBackup;
const selectRestoreBackup = (
    state: CloudStoreState
): CloudStoreState["restoreBackup"] => state.restoreBackup;

const selectSetEncryptionPassphrase = (
    state: CloudStoreState
): CloudStoreState["setEncryptionPassphrase"] => state.setEncryptionPassphrase;
const selectClearEncryptionKey = (
    state: CloudStoreState
): CloudStoreState["clearEncryptionKey"] => state.clearEncryptionKey;

const selectMigrateBackups = (
    state: CloudStoreState
): CloudStoreState["migrateBackups"] => state.migrateBackups;

const selectResetRemoteSyncState = (
    state: CloudStoreState
): CloudStoreState["resetRemoteSyncState"] => state.resetRemoteSyncState;

const selectIsConnectingDropbox = (
    state: CloudStoreState
): CloudStoreState["isConnectingDropbox"] => state.isConnectingDropbox;
const selectIsDisconnecting = (
    state: CloudStoreState
): CloudStoreState["isDisconnecting"] => state.isDisconnecting;
const selectIsListingBackups = (
    state: CloudStoreState
): CloudStoreState["isListingBackups"] => state.isListingBackups;
const selectIsRefreshingStatus = (
    state: CloudStoreState
): CloudStoreState["isRefreshingStatus"] => state.isRefreshingStatus;
const selectIsRequestingSyncNow = (
    state: CloudStoreState
): CloudStoreState["isRequestingSyncNow"] => state.isRequestingSyncNow;
const selectIsUploadingBackup = (
    state: CloudStoreState
): CloudStoreState["isUploadingBackup"] => state.isUploadingBackup;
const selectRestoringBackupKey = (
    state: CloudStoreState
): CloudStoreState["restoringBackupKey"] => state.restoringBackupKey;

const selectIsSettingEncryptionPassphrase = (
    state: CloudStoreState
): CloudStoreState["isSettingEncryptionPassphrase"] =>
    state.isSettingEncryptionPassphrase;
const selectIsClearingEncryptionKey = (
    state: CloudStoreState
): CloudStoreState["isClearingEncryptionKey"] => state.isClearingEncryptionKey;

const selectIsMigratingBackups = (
    state: CloudStoreState
): CloudStoreState["isMigratingBackups"] => state.isMigratingBackups;

const selectIsResettingRemoteSyncState = (
    state: CloudStoreState
): CloudStoreState["isResettingRemoteSyncState"] =>
    state.isResettingRemoteSyncState;

const selectLastBackupMigrationResult = (
    state: CloudStoreState
): CloudStoreState["lastBackupMigrationResult"] =>
    state.lastBackupMigrationResult;

const selectLastRemoteSyncResetResult = (
    state: CloudStoreState
): CloudStoreState["lastRemoteSyncResetResult"] =>
    state.lastRemoteSyncResetResult;

const selectRemoteSyncResetPreview = (
    state: CloudStoreState
): CloudStoreState["remoteSyncResetPreview"] => state.remoteSyncResetPreview;

const selectRefreshRemoteSyncResetPreview = (
    state: CloudStoreState
): CloudStoreState["refreshRemoteSyncResetPreview"] =>
    state.refreshRemoteSyncResetPreview;

const selectIsRefreshingRemoteSyncResetPreview = (
    state: CloudStoreState
): CloudStoreState["isRefreshingRemoteSyncResetPreview"] =>
    state.isRefreshingRemoteSyncResetPreview;

/**
 * Wiring component for the "Cloud Sync & Backup" settings section.
 */
export const CloudSettingsSection = (): JSX.Element => {
    const requestConfirmation = useConfirmDialog();
    const requestPrompt = usePromptDialog();

    const backups = useCloudStore(selectBackups);
    const status = useCloudStore(selectStatus);

    const refreshStatus = useCloudStore(selectRefreshStatus);
    const connectDropbox = useCloudStore(selectConnectDropbox);
    const disconnect = useCloudStore(selectDisconnect);
    const setSyncEnabled = useCloudStore(selectSetSyncEnabled);
    const requestSyncNow = useCloudStore(selectRequestSyncNow);
    const listBackups = useCloudStore(selectListBackups);
    const uploadLatestBackup = useCloudStore(selectUploadLatestBackup);
    const restoreBackup = useCloudStore(selectRestoreBackup);

    const setEncryptionPassphrase = useCloudStore(
        selectSetEncryptionPassphrase
    );
    const clearEncryptionKey = useCloudStore(selectClearEncryptionKey);

    const migrateBackups = useCloudStore(selectMigrateBackups);
    const resetRemoteSyncState = useCloudStore(selectResetRemoteSyncState);
    const refreshRemoteSyncResetPreview = useCloudStore(
        selectRefreshRemoteSyncResetPreview
    );

    const isConnectingDropbox = useCloudStore(selectIsConnectingDropbox);
    const isDisconnecting = useCloudStore(selectIsDisconnecting);
    const isListingBackups = useCloudStore(selectIsListingBackups);
    const isRefreshingStatus = useCloudStore(selectIsRefreshingStatus);
    const isRequestingSyncNow = useCloudStore(selectIsRequestingSyncNow);
    const isUploadingBackup = useCloudStore(selectIsUploadingBackup);
    const restoringBackupKey = useCloudStore(selectRestoringBackupKey);

    const isSettingEncryptionPassphrase = useCloudStore(
        selectIsSettingEncryptionPassphrase
    );
    const isClearingEncryptionKey = useCloudStore(
        selectIsClearingEncryptionKey
    );

    const isMigratingBackups = useCloudStore(selectIsMigratingBackups);
    const isResettingRemoteSyncState = useCloudStore(
        selectIsResettingRemoteSyncState
    );
    const lastBackupMigrationResult = useCloudStore(
        selectLastBackupMigrationResult
    );
    const lastRemoteSyncResetResult = useCloudStore(
        selectLastRemoteSyncResetResult
    );

    const remoteSyncResetPreview = useCloudStore(selectRemoteSyncResetPreview);
    const isRefreshingRemoteSyncResetPreview = useCloudStore(
        selectIsRefreshingRemoteSyncResetPreview
    );

    useEffect(
        function refreshCloudStatusOnMount(): void {
            void refreshStatus();
        },
        [refreshStatus]
    );

    useEffect(
        function loadCloudBackupsWhenConnected(): void {
            if (status?.connected) {
                void listBackups();
            }
        },
        [listBackups, status?.connected]
    );

    useEffect(
        function refreshRemoteSyncPreviewWhenConnected(): void {
            if (status?.connected && status.syncEnabled) {
                void refreshRemoteSyncResetPreview();
            }
        },
        [
            refreshRemoteSyncResetPreview,
            status?.connected,
            status?.syncEnabled,
        ]
    );

    const handleConnectDropbox = useCallback((): void => {
        void connectDropbox();
    }, [connectDropbox]);

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
            void confirmDisconnect();
        },
        [confirmDisconnect]
    );

    const handleRefreshStatus = useCallback((): void => {
        void refreshStatus();
    }, [refreshStatus]);

    const handleListBackups = useCallback((): void => {
        void listBackups();
    }, [listBackups]);

    const handleRequestSyncNow = useCallback((): void => {
        void requestSyncNow();
    }, [requestSyncNow]);

    const handleUploadLatestBackup = useCallback((): void => {
        void uploadLatestBackup();
    }, [uploadLatestBackup]);

    const handleSyncEnabledChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            void setSyncEnabled(event.target.checked);
        },
        [setSyncEnabled]
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
            void confirmRestoreBackup(key);
        },
        [confirmRestoreBackup]
    );

    const handleSetEncryptionPassphrase = useCallback(
        function handleSetEncryptionPassphrase(): void {
            void (async function promptForPassphrase(): Promise<void> {
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
            })();
        },
        [
            requestPrompt,
            setEncryptionPassphrase,
            status?.encryptionMode,
        ]
    );

    const handleClearEncryptionKey = useCallback(
        function handleClearEncryptionKey(): void {
            void (async function confirmClear(): Promise<void> {
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
            })();
        },
        [clearEncryptionKey, requestConfirmation]
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
            void confirmEncryptBackups({ deleteSource: false });
        },
        [confirmEncryptBackups]
    );

    const handleEncryptBackupsDeleteOriginals = useCallback(
        function handleEncryptBackupsDeleteOriginals(): void {
            void confirmEncryptBackups({ deleteSource: true });
        },
        [confirmEncryptBackups]
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
            void confirmResetRemoteSyncState();
        },
        [confirmResetRemoteSyncState]
    );

    const handleRefreshRemoteSyncResetPreview = useCallback(
        function handleRefreshRemoteSyncResetPreview(): void {
            void refreshRemoteSyncResetPreview();
        },
        [refreshRemoteSyncResetPreview]
    );

    const syncEnabled = status?.syncEnabled ?? false;
    const connected = status?.connected ?? false;

    const syncEnabledControl = useMemo(
        (): JSX.Element => (
            <div className="flex items-center gap-2">
                <ThemedCheckbox
                    aria-label="Enable cloud sync"
                    checked={syncEnabled}
                    disabled={!connected}
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
            syncEnabled,
        ]
    );

    return (
        <CloudSection
            backups={backups}
            icon={AppIcons.ui.cloud}
            isClearingEncryptionKey={isClearingEncryptionKey}
            isConnectingDropbox={isConnectingDropbox}
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
            onConnectDropbox={handleConnectDropbox}
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
