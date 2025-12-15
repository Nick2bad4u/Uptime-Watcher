/**
 * Tests for the BackupMigrationPanel (Cloud Sync / Backup maintenance UI).
 */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";

import { BackupMigrationPanel } from "../../../../components/Settings/cloud/BackupMigrationPanel";

describe(BackupMigrationPanel, () => {
    it("renders appropriate status when no plaintext backups exist", () => {
        render(
            <BackupMigrationPanel
                connected={true}
                encryptionLocked={false}
                encryptionMode="passphrase"
                isMigratingBackups={false}
                lastResult={null}
                onEncryptBackupsDeleteOriginals={vi.fn()}
                onEncryptBackupsKeepOriginals={vi.fn()}
                plaintextBackupCount={0}
            />
        );

        expect(
            screen.getByText("No plaintext backups to migrate.")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Encrypt existing backups" })
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Encrypt + delete originals" })
        ).toBeDisabled();
    });

    it("requires passphrase encryption before enabling migration", () => {
        render(
            <BackupMigrationPanel
                connected={true}
                encryptionLocked={false}
                encryptionMode="none"
                isMigratingBackups={false}
                lastResult={null}
                onEncryptBackupsDeleteOriginals={vi.fn()}
                onEncryptBackupsKeepOriginals={vi.fn()}
                plaintextBackupCount={2}
            />
        );

        expect(
            screen.getByText("Enable passphrase encryption to migrate backups.")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Encrypt existing backups" })
        ).toBeDisabled();
    });

    it("enables actions when connected, unlocked, and plaintext backups exist", () => {
        const onKeep = vi.fn();
        const onDelete = vi.fn();

        const lastResult: CloudBackupMigrationResult = {
            completedAt: 10,
            deleteSource: false,
            failures: [],
            migrated: 2,
            processed: 2,
            skipped: 0,
            startedAt: 1,
            target: "encrypted",
        };

        render(
            <BackupMigrationPanel
                connected={true}
                encryptionLocked={false}
                encryptionMode="passphrase"
                isMigratingBackups={false}
                lastResult={lastResult}
                onEncryptBackupsDeleteOriginals={onDelete}
                onEncryptBackupsKeepOriginals={onKeep}
                plaintextBackupCount={2}
            />
        );

        expect(
            screen.getByText("Ready to migrate 2 plaintext backup(s).")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Last migration: 2 migrated, 0 failed.")
        ).toBeInTheDocument();

        const keepButton = screen.getByRole("button", {
            name: "Encrypt existing backups",
        });
        const deleteButton = screen.getByRole("button", {
            name: "Encrypt + delete originals",
        });

        expect(keepButton).toBeEnabled();
        expect(deleteButton).toBeEnabled();

        fireEvent.click(keepButton);
        fireEvent.click(deleteButton);

        expect(onKeep).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("shows Migrating… when busy", () => {
        render(
            <BackupMigrationPanel
                connected={true}
                encryptionLocked={false}
                encryptionMode="passphrase"
                isMigratingBackups={true}
                lastResult={null}
                onEncryptBackupsDeleteOriginals={vi.fn()}
                onEncryptBackupsKeepOriginals={vi.fn()}
                plaintextBackupCount={1}
            />
        );

        expect(screen.getAllByText("Migrating…")).toHaveLength(2);
        const migratingButtons = screen.getAllByRole("button", {
            name: "Migrating…",
        });
        expect(migratingButtons).toHaveLength(2);
        for (const button of migratingButtons) {
            expect(button).toBeDisabled();
        }
    });
});
