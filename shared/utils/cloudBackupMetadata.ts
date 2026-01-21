/**
 * Backup metadata serialization helpers used by {@link CloudService}.
 */

import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

/**
 * Sanitize a backup file name to a stable original-path value.
 *
 * @remarks
 * This avoids leaking local absolute paths into cloud metadata and handles both
 * Windows and POSIX separators.
 */
export function deriveCloudBackupOriginalPath(fileName: string): string {
    const trimmed = fileName.trim();
    if (!trimmed) {
        return "backup.sqlite";
    }

    const segments = trimmed.split(/[\\/]/u).filter(Boolean);
    return segments.at(-1) ?? "backup.sqlite";
}

/** Serialize backup metadata for storage in cloud provider sidecar files. */
export function serializeBackupMetadata(args: {
    readonly fileName: string;
    readonly metadata: SerializedDatabaseBackupMetadata;
}): SerializedDatabaseBackupMetadata {
    const { fileName, metadata } = args;

    return {
        appVersion: metadata.appVersion,
        checksum: metadata.checksum,
        createdAt: metadata.createdAt,
        originalPath: deriveCloudBackupOriginalPath(fileName),
        retentionHintDays: metadata.retentionHintDays,
        schemaVersion: metadata.schemaVersion,
        sizeBytes: metadata.sizeBytes,
    };
}

// No conversion helper is necessary: serialized backup metadata is already in
// a runtime-safe shape for cross-process transport.
