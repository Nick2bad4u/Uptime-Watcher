import type { CloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";
import type { JSX } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";

function resolveBackupMigrationStatusText(args: {
    encryptionLocked: boolean;
    encryptionMode: "none" | "passphrase";
    plaintextBackupCount: number;
}): string {
    if (args.plaintextBackupCount === 0) {
        return "No plaintext backups to migrate.";
    }

    if (args.encryptionMode !== "passphrase") {
        return "Enable passphrase encryption to migrate backups.";
    }

    if (args.encryptionLocked) {
        return "Unlock encryption to migrate backups on this device.";
    }

    return `Ready to migrate ${args.plaintextBackupCount} plaintext backup(s).`;
}

function resolveBackupMigrationLastSummary(
    lastResult: CloudBackupMigrationResult | null
): null | string {
    if (!lastResult) {
        return null;
    }

    if (lastResult.target !== "encrypted") {
        return null;
    }

    return `Last migration: ${lastResult.migrated} migrated, ${lastResult.failures.length} failed.`;
}

/**
 * Props for {@link BackupMigrationPanel}.
 */
export interface BackupMigrationPanelProperties {
    /** Whether the cloud provider is connected. */
    readonly connected: boolean;
    /** Whether encryption is enabled but locked on this device. */
    readonly encryptionLocked: boolean;
    /** Current encryption mode. */
    readonly encryptionMode: "none" | "passphrase";
    /** Busy flag for backup migration. */
    readonly isMigratingBackups: boolean;
    /** Most recent migration result, if any. */
    readonly lastResult: CloudBackupMigrationResult | null;
    /** Action: encrypt backups and delete plaintext originals after success. */
    readonly onEncryptBackupsDeleteOriginals: () => void;
    /** Action: encrypt backups but keep plaintext originals. */
    readonly onEncryptBackupsKeepOriginals: () => void;
    /** Number of plaintext backups currently present. */
    readonly plaintextBackupCount: number;
}

/**
 * Advanced maintenance panel for migrating existing backups to encrypted form.
 */
export const BackupMigrationPanel = ({
    connected,
    encryptionLocked,
    encryptionMode,
    isMigratingBackups,
    lastResult,
    onEncryptBackupsDeleteOriginals,
    onEncryptBackupsKeepOriginals,
    plaintextBackupCount,
}: BackupMigrationPanelProperties): JSX.Element => {
    const canEncrypt =
        connected &&
        encryptionMode === "passphrase" &&
        !encryptionLocked &&
        plaintextBackupCount > 0;

    const statusText = resolveBackupMigrationStatusText({
        encryptionLocked,
        encryptionMode,
        plaintextBackupCount,
    });

    const lastSummary = resolveBackupMigrationLastSummary(lastResult);

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
                <ThemedText size="sm" variant="secondary" weight="medium">
                    Backup Migration
                </ThemedText>
            </div>

            <ThemedText size="sm" variant="tertiary">
                {statusText}
            </ThemedText>

            {lastSummary ? (
                <div className="mt-2">
                    <ThemedText size="xs" variant="tertiary">
                        {lastSummary}
                    </ThemedText>
                </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
                <ThemedButton
                    disabled={!canEncrypt || isMigratingBackups}
                    onClick={onEncryptBackupsKeepOriginals}
                    size="sm"
                    variant="secondary"
                >
                    {isMigratingBackups
                        ? "Migrating…"
                        : "Encrypt existing backups"}
                </ThemedButton>
                <ThemedButton
                    disabled={!canEncrypt || isMigratingBackups}
                    onClick={onEncryptBackupsDeleteOriginals}
                    size="sm"
                    variant="error"
                >
                    {isMigratingBackups
                        ? "Migrating…"
                        : "Encrypt + delete originals"}
                </ThemedButton>
            </div>
        </div>
    );
};
