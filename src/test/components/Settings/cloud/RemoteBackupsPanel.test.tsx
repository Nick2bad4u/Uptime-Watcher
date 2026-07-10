import type { CloudBackupEntry } from "@shared/types/cloud";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";

import { RemoteBackupsPanel } from "../../../../components/Settings/cloud/RemoteBackupsPanel";

function createBackup(key: string): CloudBackupEntry {
    return {
        encrypted: false,
        fileName: `${key}.sqlite`,
        key,
        metadata: {
            appVersion: "1.0.0",
            checksum: "abc123",
            createdAt: 1_700_000_000_000,
            originalPath: "C:\\data\\uptime-watcher.sqlite",
            retentionHintDays: 30,
            schemaVersion: 1,
            sizeBytes: 1024,
        },
    };
}

describe(RemoteBackupsPanel, () => {
    it("disables every destructive action while a restore is active", () => {
        render(
            <RemoteBackupsPanel
                backups={[createBackup("first"), createBackup("second")]}
                connected={true}
                deletingBackupKey={null}
                isListingBackups={false}
                isUploadingBackup={false}
                onDeleteBackupClick={vi.fn()}
                onListBackups={vi.fn()}
                onRestoreBackupClick={vi.fn()}
                onUploadLatestBackup={vi.fn()}
                restoringBackupKey="first"
            />
        );

        for (const button of screen.getAllByRole("button", {
            name: "Restore",
        })) {
            expect(button).toBeDisabled();
        }
        for (const button of screen.getAllByRole("button", {
            name: "Delete",
        })) {
            expect(button).toBeDisabled();
        }
        expect(
            screen.getByRole("button", { name: "Refresh list" })
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Upload latest backup" })
        ).toBeDisabled();
    });

    it("disables destructive actions while an upload is active", () => {
        render(
            <RemoteBackupsPanel
                backups={[createBackup("first"), createBackup("second")]}
                connected={true}
                deletingBackupKey={null}
                isListingBackups={false}
                isUploadingBackup={true}
                onDeleteBackupClick={vi.fn()}
                onListBackups={vi.fn()}
                onRestoreBackupClick={vi.fn()}
                onUploadLatestBackup={vi.fn()}
                restoringBackupKey={null}
            />
        );

        for (const button of screen.getAllByRole("button", {
            name: /^(?:Delete|Restore)$/u,
        })) {
            expect(button).toBeDisabled();
        }
    });
});
