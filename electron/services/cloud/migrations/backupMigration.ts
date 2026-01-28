import type {
    CloudBackupMigrationRequest,
    CloudBackupMigrationResult,
} from "@shared/types/cloudBackupMigration";

import { ensureError } from "@shared/utils/errorHandling";

import type { CloudStorageProvider } from "../providers/CloudStorageProvider.types";

import { decryptBuffer, encryptBuffer } from "../crypto/cloudCrypto";
import { backupMetadataKeyForBackupKey } from "../providers/CloudBackupMetadataFile";

function normalizeBackupFileName(args: {
    fileName: string;
    target: CloudBackupMigrationRequest["target"];
}): string {
    const encSuffix = ".enc";

    if (args.target === "encrypted") {
        return args.fileName.endsWith(encSuffix)
            ? args.fileName
            : `${args.fileName}${encSuffix}`;
    }

    return args.fileName.endsWith(encSuffix)
        ? args.fileName.slice(0, -encSuffix.length)
        : args.fileName;
}

function isTargetEncrypted(
    target: CloudBackupMigrationRequest["target"]
): boolean {
    return target === "encrypted";
}

/**
 * Migrates backups stored in a {@link CloudStorageProvider}.
 *
 * @remarks
 * -
 *
 * Operates on `CloudStorageProvider.listBackups()` entries.
 *
 * - Uploads migrated backups with `uploadBackup()` to ensure consistent metadata
 *   serialization.
 * - Deletes source objects only after a successful upload when
 *   `request.deleteSource` is true.
 */
export async function migrateProviderBackups(args: {
    /**
     * Optional encryption key for encrypt/decrypt operations.
     *
     * @remarks
     * Required when migrating to encrypted, or when the source backup is
     * encrypted.
     */
    encryptionKey?: Buffer | undefined;
    provider: CloudStorageProvider;
    request: CloudBackupMigrationRequest;
}): Promise<CloudBackupMigrationResult> {
    const { encryptionKey, provider, request } = args;
    const { deleteSource, limit, target } = request;

    const startedAt = Date.now();
    const targetEncrypted = isTargetEncrypted(target);

    const failures: CloudBackupMigrationResult["failures"] = [];
    let migrated = 0;
    let skipped = 0;
    let processed = 0;

    const backups = await provider.listBackups();
    const selected =
        typeof limit === "number" ? backups.slice(0, limit) : backups;

    if (selected.length === 0) {
        return {
            completedAt: Date.now(),
            deleteSource,
            failures,
            migrated,
            processed,
            skipped,
            startedAt,
            target,
        };
    }

    // Preload existing backup object keys so we can refuse to overwrite an
    // already-migrated target.
    const backupsPrefix = selected[0]?.key.endsWith(selected[0].fileName)
        ? selected[0].key.slice(0, -selected[0].fileName.length)
        : "backups/";

    const backupObjects = await provider.listObjects(backupsPrefix);
    const existingBackupKeys = new Set(backupObjects.map((entry) => entry.key));

    const needsCryptoKey =
        targetEncrypted || selected.some((entry) => entry.encrypted);
    if (needsCryptoKey && encryptionKey === undefined) {
        throw new Error(
            "Encryption key is required to migrate backups involving encryption"
        );
    }

    function requireEncryptionKey(): Buffer {
        if (!encryptionKey) {
            throw new Error(
                "Encryption key is required to migrate backups involving encryption"
            );
        }

        return encryptionKey;
    }

    async function deleteSourceIfRequested(sourceKey: string): Promise<void> {
        if (!deleteSource) {
            return;
        }

        const deletions = await Promise.allSettled([
            provider.deleteObject(sourceKey),
            provider.deleteObject(backupMetadataKeyForBackupKey(sourceKey)),
        ]);

        const deletionErrors = deletions
            .flatMap((result) =>
                result.status === "rejected"
                    ? [ensureError(result.reason).message]
                    : []
            )
            .filter((message) => message.trim().length > 0);

        if (deletionErrors.length > 0) {
            failures.push({
                key: sourceKey,
                message: `Migration uploaded target but failed to delete source objects: ${deletionErrors.join(", ")}`,
            });
        }
    }

    /* eslint-disable no-await-in-loop -- Migration is intentionally sequential to reduce provider load and keep delete-after-upload semantics simple. */
    for (const entry of selected) {
        processed += 1;

        const needsMigration = entry.encrypted !== targetEncrypted;
        if (needsMigration) {
            try {
                const targetFileName = normalizeBackupFileName({
                    fileName: entry.fileName,
                    target,
                });
                const targetKey = `${backupsPrefix}${targetFileName}`;

                if (existingBackupKeys.has(targetKey)) {
                    failures.push({
                        key: entry.key,
                        message: `Target backup already exists (${targetKey}); refusing to overwrite`,
                    });
                } else {
                    const downloaded = await provider.downloadBackup(entry.key);

                    const plaintext = downloaded.entry.encrypted
                        ? decryptBuffer({
                              ciphertext: downloaded.buffer,
                              key: requireEncryptionKey(),
                          })
                        : downloaded.buffer;

                    const targetBuffer = targetEncrypted
                        ? encryptBuffer({
                              key: requireEncryptionKey(),
                              plaintext,
                          })
                        : plaintext;

                    await provider.uploadBackup({
                        buffer: targetBuffer,
                        encrypted: targetEncrypted,
                        fileName: targetFileName,
                        metadata: entry.metadata,
                    });

                    migrated += 1;
                    existingBackupKeys.add(targetKey);

                    await deleteSourceIfRequested(entry.key);
                }
            } catch (error) {
                const resolved = ensureError(error);
                failures.push({
                    key: entry.key,
                    message: resolved.message,
                });
            }
        } else {
            skipped += 1;
        }
    }

    /* eslint-enable no-await-in-loop -- Restore default rule behavior after migration loop. */

    return {
        completedAt: Date.now(),
        deleteSource,
        failures,
        migrated,
        processed,
        skipped,
        startedAt,
        target,
    };
}
