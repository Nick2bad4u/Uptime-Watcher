import { ensureError } from "@shared/utils/errorHandling";

import type { CloudStorageProvider } from "../providers/CloudStorageProvider.types";

import { backupMetadataKeyForBackupKey } from "../providers/CloudBackupMetadataFile";

/**
 * Ensures the migration encryption key exists when crypto operations are
 * required.
 *
 * @param encryptionKey - Optional key provided by migration caller.
 * @param errorMessage - Error message to throw when the key is missing.
 *
 * @returns The validated encryption key.
 */
export function requireMigrationEncryptionKey(
    encryptionKey: Buffer | undefined,
    errorMessage: string
): Buffer {
    if (!encryptionKey) {
        throw new Error(errorMessage);
    }

    return encryptionKey;
}

/**
 * Deletes source backup artifacts after successful migration when configured.
 *
 * @param args - Deletion options and provider dependencies.
 *
 * @returns A list of non-empty deletion error messages.
 */
export async function collectSourceDeletionErrors(args: {
    readonly deleteSource: boolean;
    readonly provider: CloudStorageProvider;
    readonly sourceKey: string;
}): Promise<string[]> {
    if (!args.deleteSource) {
        return [];
    }

    const deletions = await Promise.allSettled([
        args.provider.deleteObject(args.sourceKey),
        args.provider.deleteObject(
            backupMetadataKeyForBackupKey(args.sourceKey)
        ),
    ]);

    return deletions
        .flatMap((result) =>
            result.status === "rejected"
                ? [ensureError(result.reason).message]
                : []
        )
        .filter((message) => message.trim().length > 0);
}
