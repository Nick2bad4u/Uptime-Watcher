import type { CloudBackupEntry } from "@shared/types/cloud";
import type { JSX } from "react/jsx-runtime";

import {
    type MouseEvent as ReactMouseEvent,
    useCallback,
    useMemo,
} from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons, getIconSize } from "../../../utils/icons";

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

/**
 * Props for {@link RemoteBackupsPanel}.
 */
export interface RemoteBackupsPanelProperties {
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

export const RemoteBackupsPanel = ({
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
    const buttonIconSize = getIconSize("sm");

    const DeleteIcon = AppIcons.actions.remove;
    const CloudIcon = AppIcons.ui.cloud;
    const RefreshIcon = AppIcons.actions.refresh;
    const RestoreIcon = AppIcons.actions.download;
    const UploadIcon = AppIcons.actions.upload;

    const deleteIcon = useMemo(
        () => <DeleteIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize, DeleteIcon]
    );
    const refreshIcon = useMemo(
        () => <RefreshIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize, RefreshIcon]
    );
    const restoreIcon = useMemo(
        () => <RestoreIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize, RestoreIcon]
    );
    const uploadIcon = useMemo(
        () => <UploadIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize, UploadIcon]
    );

    const panelIcon = useMemo(
        () => <CloudIcon aria-hidden className="size-5" />,
        [CloudIcon]
    );

    const handleRestoreClick = useCallback(
        (event: ReactMouseEvent<HTMLButtonElement>): void => {
            const key = event.currentTarget.value;
            if (key) {
                onRestoreBackupClick(key);
            }
        },
        [onRestoreBackupClick]
    );

    const handleDeleteClick = useCallback(
        (event: ReactMouseEvent<HTMLButtonElement>): void => {
            const key = event.currentTarget.value;
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
                            className="settings-subcard settings-subcard--compact flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                            key={backup.key}
                        >
                            <div className="min-w-0">
                                <ThemedText
                                    as="div"
                                    className="truncate"
                                    size="sm"
                                    weight="medium"
                                >
                                    {backup.fileName}
                                </ThemedText>
                                <ThemedText
                                    as="div"
                                    className="mt-0.5"
                                    size="xs"
                                    variant="tertiary"
                                >
                                    {createdAt} ·{" "}
                                    {formatBytes(backup.metadata.sizeBytes)}
                                    {encryptionSuffix}
                                </ThemedText>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <ThemedButton
                                    disabled={
                                        !connected ||
                                        restoringBackupKey === backup.key
                                    }
                                    icon={restoreIcon}
                                    loading={restoringBackupKey === backup.key}
                                    onClick={handleRestoreClick}
                                    size="sm"
                                    value={backup.key}
                                    variant="secondary"
                                >
                                    Restore
                                </ThemedButton>

                                <ThemedButton
                                    disabled={
                                        !connected ||
                                        deletingBackupKey === backup.key
                                    }
                                    icon={deleteIcon}
                                    loading={deletingBackupKey === backup.key}
                                    onClick={handleDeleteClick}
                                    size="sm"
                                    value={backup.key}
                                    variant="error"
                                >
                                    Delete
                                </ThemedButton>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );

    return (
        <div className="settings-subcard">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span aria-hidden className="settings-accent--primary">
                        {panelIcon}
                    </span>
                    <ThemedText size="sm" variant="secondary" weight="medium">
                        Remote Backups
                    </ThemedText>
                </div>

                <div className="flex flex-wrap gap-2">
                    <ThemedButton
                        disabled={!connected || isListingBackups}
                        icon={refreshIcon}
                        loading={isListingBackups}
                        onClick={onListBackups}
                        size="sm"
                        variant="secondary"
                    >
                        Refresh list
                    </ThemedButton>

                    <ThemedButton
                        disabled={!connected || isUploadingBackup}
                        icon={uploadIcon}
                        loading={isUploadingBackup}
                        onClick={onUploadLatestBackup}
                        size="sm"
                        variant="primary"
                    >
                        Upload latest backup
                    </ThemedButton>
                </div>
            </div>

            {content}
        </div>
    );
};
