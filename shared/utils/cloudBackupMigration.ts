import type { CloudBackupEntry } from "@shared/types/cloud";
import type { CloudBackupMigrationRequest } from "@shared/types/cloudBackupMigration";

/**
 * Determine whether a backup migration flow requires encryption-key material.
 */
export function determineBackupMigrationNeedsEncryptionKey(
    request: CloudBackupMigrationRequest,
    backups: readonly CloudBackupEntry[]
): boolean {
    if (request.target === "encrypted") {
        return true;
    }

    return backups.some((entry) => entry.encrypted);
}
