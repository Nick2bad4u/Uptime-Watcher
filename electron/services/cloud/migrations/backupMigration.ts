import type {
    CloudBackupMigrationRequest,
    CloudBackupMigrationResult,
} from "@shared/types/cloudBackupMigration";

import { ensureError } from "@shared/utils/errorHandling";

import type { CloudStorageProvider } from "../providers/CloudStorageProvider.types";

import { decryptBuffer, encryptBuffer } from "../crypto/cloudCrypto";

function backupMetadataKeyForBackupKey(backupKey: string): string {
    return `${backupKey}.metadata.json`;
}

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
 * - Operates on `CloudStorageProvider.listBackups()` entries.
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

    for (const entry of selected) {
        processed += 1;

        const needsMigration = entry.encrypted !== targetEncrypted;
        if (needsMigration) {
            try {
                // eslint-disable-next-line no-await-in-loop -- Migration is intentionally sequential to reduce provider load and keep delete-after-upload semantics simple.
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

                const targetFileName = normalizeBackupFileName({
                    fileName: entry.fileName,
                    target,
                });

                // eslint-disable-next-line no-await-in-loop -- Migration is intentionally sequential to reduce provider load and keep delete-after-upload semantics simple.
                await provider.uploadBackup({
                    buffer: targetBuffer,
                    encrypted: targetEncrypted,
                    fileName: targetFileName,
                    metadata: entry.metadata,
                });

                if (deleteSource) {
                    const sourceMetadataKey = backupMetadataKeyForBackupKey(
                        entry.key
                    );
                    // eslint-disable-next-line no-await-in-loop -- Delete is conditional on the just-completed upload.
                    await Promise.all([
                        provider.deleteObject(entry.key),
                        provider.deleteObject(sourceMetadataKey),
                    ]);
                }

                migrated += 1;
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
