import type { CloudBackupEntry } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseSerializedDatabaseBackupMetadata(
    candidate: unknown
): SerializedDatabaseBackupMetadata {
    if (!isUnknownRecord(candidate)) {
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
    if (!isUnknownRecord(candidate)) {
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
