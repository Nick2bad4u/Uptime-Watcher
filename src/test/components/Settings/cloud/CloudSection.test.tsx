import type { CloudBackupEntry, CloudStatusSummary } from "@shared/types/cloud";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CloudSection } from "../../../../components/Settings/cloud/CloudSection";
import { AppIcons } from "../../../../utils/icons";

function createStatus(
    overrides: Partial<CloudStatusSummary> = {}
): CloudStatusSummary {
    return {
        backupsEnabled: true,
        configured: true,
        connected: true,
        encryptionLocked: false,
        encryptionMode: "none",
        lastBackupAt: null,
        lastSyncAt: null,
        provider: "dropbox",
        providerDetails: {
            kind: "dropbox",
            accountLabel: "someone@example.com",
        },
        syncEnabled: true,
        ...overrides,
    };
}

function createBackup(
    overrides: Partial<CloudBackupEntry> = {}
): CloudBackupEntry {
    return {
        encrypted: false,
        fileName: "backup.sqlite",
        key: "backup-key",
        metadata: {
            appVersion: "1.0.0",
            checksum: "abc123",
            createdAt: 1_700_000_000_000,
            originalPath: "C:\\data\\uptime-watcher.sqlite",
            retentionHintDays: 30,
            schemaVersion: 1,
            sizeBytes: 1024,
        },
        ...overrides,
    };
}

function renderSection(args?: {
    backups?: readonly CloudBackupEntry[];
    status?: CloudStatusSummary;
}): void {
    render(
        <CloudSection
            backups={args?.backups ?? []}
            deletingBackupKey={null}
            icon={AppIcons.ui.cloud}
            isClearingEncryptionKey={false}
            isConfiguringFilesystemProvider={false}
            isConnectingDropbox={false}
            isConnectingGoogleDrive={false}
            isDisconnecting={false}
            isListingBackups={false}
            isMigratingBackups={false}
            isRefreshingRemoteSyncResetPreview={false}
            isRefreshingStatus={false}
            isRequestingSyncNow={false}
            isResettingRemoteSyncState={false}
            isSettingEncryptionPassphrase={false}
            isUploadingBackup={false}
            lastBackupMigrationResult={null}
            lastRemoteSyncResetResult={null}
            onClearEncryptionKey={vi.fn()}
            onConfigureFilesystemProvider={vi.fn()}
            onConnectDropbox={vi.fn()}
            onConnectGoogleDrive={vi.fn()}
            onDeleteBackup={vi.fn()}
            onDisconnect={vi.fn()}
            onEncryptBackupsDeleteOriginals={vi.fn()}
            onEncryptBackupsKeepOriginals={vi.fn()}
            onListBackups={vi.fn()}
            onRefreshRemoteSyncResetPreview={vi.fn()}
            onRefreshStatus={vi.fn()}
            onRequestSyncNow={vi.fn()}
            onResetRemoteSyncState={vi.fn()}
            onRestoreBackup={vi.fn()}
            onSetEncryptionPassphrase={vi.fn()}
            onUploadLatestBackup={vi.fn()}
            remoteSyncResetPreview={null}
            restoringBackupKey={null}
            status={args?.status ?? createStatus()}
            syncEnabledControl={<span>Enabled</span>}
        />
    );
}

describe(CloudSection, () => {
    it("falls back for invalid cloud status and backup timestamps", () => {
        renderSection({
            backups: [
                createBackup({
                    metadata: {
                        ...createBackup().metadata,
                        createdAt: Number.POSITIVE_INFINITY,
                    },
                }),
            ],
            status: createStatus({
                lastBackupAt: Number.POSITIVE_INFINITY,
                lastSyncAt: Number.POSITIVE_INFINITY,
            }),
        });

        expect(screen.getAllByText("N/A")).toHaveLength(2);
        expect(screen.getByText(/backup\.sqlite/v)).toBeInTheDocument();
        expect(
            screen.getByText(
                (content) => content.includes("N/A") && content.includes("KB")
            )
        ).toBeInTheDocument();
        expect(screen.queryByText(/Invalid Date/v)).not.toBeInTheDocument();
    });
});
