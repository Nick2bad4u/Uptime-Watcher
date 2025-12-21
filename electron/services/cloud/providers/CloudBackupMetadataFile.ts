import type { CloudBackupEntry } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import { tryParseJsonRecord } from "@shared/utils/jsonSafety";
import { isObject } from "@shared/utils/typeGuards";

function parseSerializedDatabaseBackupMetadata(
    candidate: unknown
): SerializedDatabaseBackupMetadata {
    if (!isObject(candidate)) {
        throw new TypeError("Backup metadata has invalid 'metadata'");
    }

    const {
        appVersion,
        checksum,
        createdAt,
        originalPath,
        retentionHintDays,
        schemaVersion,
        sizeBytes,
    } = candidate;

    if (typeof appVersion !== "string") {
        throw new TypeError(
            "Backup metadata has invalid 'metadata.appVersion'"
        );
    }
    if (typeof checksum !== "string") {
        throw new TypeError("Backup metadata has invalid 'metadata.checksum'");
    }
    if (typeof createdAt !== "number") {
        throw new TypeError("Backup metadata has invalid 'metadata.createdAt'");
    }
    if (typeof originalPath !== "string") {
        throw new TypeError(
            "Backup metadata has invalid 'metadata.originalPath'"
        );
    }
    if (typeof retentionHintDays !== "number") {
        throw new TypeError(
            "Backup metadata has invalid 'metadata.retentionHintDays'"
        );
    }
    if (typeof schemaVersion !== "number") {
        throw new TypeError(
            "Backup metadata has invalid 'metadata.schemaVersion'"
        );
    }
    if (typeof sizeBytes !== "number") {
        throw new TypeError("Backup metadata has invalid 'metadata.sizeBytes'");
    }

    return {
        appVersion,
        checksum,
        createdAt,
        originalPath,
        retentionHintDays,
        schemaVersion,
        sizeBytes,
    };
}

/**
 * Parses a provider-stored backup metadata file.
 */
export function parseCloudBackupMetadataFile(
    candidate: unknown
): CloudBackupEntry {
    if (!isObject(candidate)) {
        throw new TypeError("Backup metadata file is not an object");
    }

    const { encrypted, fileName, key, metadata } = candidate;

    if (typeof encrypted !== "boolean") {
        throw new TypeError("Backup metadata has invalid 'encrypted'");
    }

    if (typeof fileName !== "string" || fileName.length === 0) {
        throw new TypeError("Backup metadata has invalid 'fileName'");
    }

    if (typeof key !== "string" || key.length === 0) {
        throw new TypeError("Backup metadata has invalid 'key'");
    }

    return {
        encrypted,
        fileName,
        key,
        metadata: parseSerializedDatabaseBackupMetadata(metadata),
    };
}

/**
 * Parses a provider-stored backup metadata buffer.
 *
 * @remarks
 * This is the strict variant used by `downloadBackup()` implementations. It
 * preserves the existing semantics of throwing on invalid JSON.
 */
export function parseCloudBackupMetadataFileBuffer(
    buffer: Buffer
): CloudBackupEntry {
    const parsed: unknown = JSON.parse(buffer.toString("utf8"));
    return parseCloudBackupMetadataFile(parsed);
}

/**
 * Best-effort parsing for provider-stored backup metadata buffers.
 *
 * @remarks
 * Used by provider `listBackups()` implementations so a single corrupted
 * metadata file doesn't prevent showing the rest of the backups.
 */
export function tryParseCloudBackupMetadataFileBuffer(
    buffer: Buffer
): CloudBackupEntry | null {
    const parsed = tryParseJsonRecord(buffer.toString("utf8"));
    if (!parsed) {
        return null;
    }

    try {
        return parseCloudBackupMetadataFile(parsed);
    } catch {
        return null;
    }
}

/**
 * Serializes a provider-stored backup metadata file.
 */
export function serializeCloudBackupMetadataFile(
    entry: CloudBackupEntry
): string {
    return JSON.stringify({
        encrypted: entry.encrypted,
        fileName: entry.fileName,
        key: entry.key,
        metadata: entry.metadata,
    });
}

/**
 * Returns the canonical metadata sidecar key for a backup object key.
 *
 * @remarks
 * Backups are stored as a binary object under `backups/<...>`. Their metadata
 * is stored next to the binary object using the `.metadata.json` suffix.
 */
export function backupMetadataKeyForBackupKey(backupKey: string): string {
    return `${backupKey}.metadata.json`;
}
