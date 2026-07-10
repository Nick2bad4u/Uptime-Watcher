import type { CloudBackupEntry } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import {
    assertCloudObjectKey,
    normalizeProviderObjectKey,
} from "@shared/utils/cloudKeyNormalization";
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { stringSplit } from "ts-extras";

import {
    backupMetadataKeyForBackupKey,
    parseCloudBackupMetadataFile,
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

    const entry = parseCloudBackupMetadataFileBuffer(metadataBuffer);

    // Safety: the metadata file is untrusted input. Ensure it describes the
    // same object we asked for, otherwise consumers may restore a backup using
    // the wrong metadata (checksum/schema), or display misleading names.
    if (entry.key !== args.key) {
        throw new Error(
            `Backup metadata mismatch: expected key '${args.key}' but received '${entry.key}'`
        );
    }

    const expectedFileName = stringSplit(args.key, "/").pop() ?? "";
    if (expectedFileName && entry.fileName !== expectedFileName) {
        throw new Error(
            `Backup metadata mismatch: expected fileName '${expectedFileName}' but received '${entry.fileName}'`
        );
    }

    if (!entry.encrypted && entry.metadata.sizeBytes !== buffer.byteLength) {
        throw new Error(
            `Backup metadata mismatch: expected ${entry.metadata.sizeBytes} bytes but downloaded ${buffer.byteLength} bytes`
        );
    }

    return {
        buffer,
        entry,
    };
}

/**
 * Uploads a backup blob and its `.metadata.json` sidecar.
 *
 * @remarks
 * This helper enforces the canonical backup storage layout:
 *
 * - Backup object at `${backupsPrefix}${fileName}`
 * - Sidecar metadata at `${backupKey}.metadata.json`
 *
 * @param args - Upload parameters.
 *
 * @returns The {@link CloudBackupEntry} describing the uploaded backup.
 */
function assertCanonicalBackupFileName(fileName: string): void {
    const normalized = normalizePathSeparatorsToPosix(fileName);
    const basename = stringSplit(normalized, "/").pop() ?? "";

    if (
        fileName !== fileName.trim() ||
        normalized !== fileName ||
        basename !== fileName ||
        basename.length === 0 ||
        basename === "." ||
        basename === ".." ||
        fileName.includes(":") ||
        hasAsciiControlCharacters(fileName)
    ) {
        throw new Error(
            "Backup fileName must be a single normalized path segment"
        );
    }
}

function assertCanonicalProviderObjectKey(key: string, label: string): void {
    const normalized = normalizeProviderObjectKey(key);
    assertCloudObjectKey(normalized);

    if (normalized !== key) {
        throw new Error(`${label} must be a canonical provider object key`);
    }
}

export async function uploadBackupWithMetadata(args: {
    /** Provider-specific backups key prefix (typically `backups/`). */
    readonly backupsPrefix: string;
    /** Raw SQLite backup bytes (encrypted or plaintext). */
    readonly buffer: Buffer;
    /**
     * Optional provider delete primitive.
     *
     * @remarks
     * Used for best-effort cleanup if the metadata sidecar upload fails after
     * uploading the backup bytes.
     */
    readonly deleteObject?: (key: string) => Promise<unknown>;
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
    assertCanonicalBackupFileName(args.fileName);

    const backupKey = `${args.backupsPrefix}${args.fileName}`;
    assertCanonicalProviderObjectKey(backupKey, "Backup key");

    const metadataKey = backupMetadataKeyForBackupKey(backupKey);
    assertCanonicalProviderObjectKey(metadataKey, "Backup metadata key");

    const entry = parseCloudBackupMetadataFile({
        encrypted: args.encrypted,
        fileName: args.fileName,
        key: backupKey,
        metadata: args.metadata,
    });

    if (
        !entry.encrypted &&
        entry.metadata.sizeBytes !== args.buffer.byteLength
    ) {
        throw new Error(
            `Backup metadata mismatch: expected ${entry.metadata.sizeBytes} bytes but received ${args.buffer.byteLength} bytes`
        );
    }

    await args.uploadObject({
        buffer: args.buffer,
        key: backupKey,
        overwrite: false,
    });

    try {
        await args.uploadObject({
            buffer: Buffer.from(
                serializeCloudBackupMetadataFile(entry),
                "utf8"
            ),
            key: metadataKey,
            overwrite: false,
        });
    } catch (error) {
        // Best-effort cleanup: a backup object without its metadata sidecar is
        // effectively undiscoverable via listBackups(), so try to remove it.
        if (args.deleteObject) {
            try {
                await args.deleteObject(backupKey);
            } catch (cleanupError: unknown) {
                throw new AggregateError(
                    [error, cleanupError],
                    `Failed to upload backup metadata and clean up orphaned backup object '${backupKey}'`,
                    { cause: cleanupError }
                );
            }
        }

        throw error;
    }

    return entry;
}
