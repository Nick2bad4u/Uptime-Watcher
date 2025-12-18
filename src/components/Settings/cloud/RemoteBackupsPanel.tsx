import type { CloudBackupEntry } from "@shared/types/cloud";
import type { JSX } from "react/jsx-runtime";

import { type MouseEvent as ReactMouseEvent, useCallback } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";

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
                                    disabled={
                                        !connected ||
                                        restoringBackupKey === backup.key
                                    }
                                    onClick={handleRestoreClick}
                                    size="sm"
                                    value={backup.key}
                                    variant="secondary"
                                >
                                    {restoringBackupKey === backup.key
                                        ? "Restoring…"
                                        : "Restore"}
                                </ThemedButton>

                                <ThemedButton
                                    disabled={
                                        !connected ||
                                        deletingBackupKey === backup.key
                                    }
                                    onClick={handleDeleteClick}
                                    size="sm"
                                    value={backup.key}
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
