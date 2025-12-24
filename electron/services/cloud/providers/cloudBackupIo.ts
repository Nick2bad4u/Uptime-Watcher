import type { CloudBackupEntry } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import {
    backupMetadataKeyForBackupKey,
    parseCloudBackupMetadataFileBuffer,
    serializeCloudBackupMetadataFile,
} from "./CloudBackupMetadataFile";

/**
 * Shared backup upload/download helpers for {@link CloudStorageProvider}
 * implementations.
 *
 * @remarks
 * Multiple providers store backups using the same pattern:
 *
 * - Backups live at `backups/<fileName>`
 * - Metadata is stored next to the backup at `${backupKey}.metadata.json`
 *
 * This module centralizes the mechanics so providers don't drift.
 */

/**
 * Uploads a backup blob and its `.metadata.json` sidecar.
 *
 * @remarks
 * This helper enforces the canonical backup storage layout:
 * - Backup object at `${backupsPrefix}${fileName}`
 * - Sidecar metadata at `${backupKey}.metadata.json`
 *
 * @param args - Upload parameters.
 *
 * @returns The {@link CloudBackupEntry} describing the uploaded backup.
 */
export async function uploadBackupWithMetadata(args: {
    /** Provider-specific backups key prefix (typically `backups/`). */
    readonly backupsPrefix: string;
    /** Raw SQLite backup bytes (encrypted or plaintext). */
    readonly buffer: Buffer;
    /** Indicates whether the stored backup is encrypted. */
    readonly encrypted: boolean;
    /** User-facing file name used as the backup object name. */
    readonly fileName: string;
    /** Metadata describing the backup. */
    readonly metadata: SerializedDatabaseBackupMetadata;
    /** Provider upload primitive. Must accept POSIX-style keys. */
    readonly uploadObject: (args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }) => Promise<unknown>;
}): Promise<CloudBackupEntry> {
    const backupKey = `${args.backupsPrefix}${args.fileName}`;

    const entry: CloudBackupEntry = {
        encrypted: args.encrypted,
        fileName: args.fileName,
        key: backupKey,
        metadata: args.metadata,
    };

    await args.uploadObject({
        buffer: args.buffer,
        key: backupKey,
        overwrite: true,
    });

    const metadataKey = backupMetadataKeyForBackupKey(backupKey);
    await args.uploadObject({
        buffer: Buffer.from(serializeCloudBackupMetadataFile(entry), "utf8"),
        key: metadataKey,
        overwrite: true,
    });

    return entry;
}

/**
 * Downloads a backup object and its `.metadata.json` sidecar.
 *
 * @remarks
 * This helper assumes the provider stores backup metadata as UTF-8 JSON at the
 * canonical sidecar key returned by {@link backupMetadataKeyForBackupKey}.
 *
 * Providers are responsible for normalizing the backup key (POSIX separators,
 * no leading slashes, etc.) before calling this function.
 *
 * @param args - Download parameters.
 *
 * @returns Both the backup buffer and the parsed {@link CloudBackupEntry}.
 */
export async function downloadBackupWithMetadata(args: {
    /** Provider download primitive. Must accept POSIX-style keys. */
    readonly downloadObject: (key: string) => Promise<Buffer>;
    /** Backup key to download (must already be normalized by the provider). */
    readonly key: string;
}): Promise<{ buffer: Buffer; entry: CloudBackupEntry }> {
    const buffer = await args.downloadObject(args.key);
    const metadataKey = backupMetadataKeyForBackupKey(args.key);
    const metadataBuffer = await args.downloadObject(metadataKey);

    return {
        buffer,
        entry: parseCloudBackupMetadataFileBuffer(metadataBuffer),
    };
}
