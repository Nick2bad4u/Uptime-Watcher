/**
 * Backup metadata serialization helpers used by {@link CloudService}.
 */

import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import type {
    DatabaseBackupMetadata,
    DatabaseBackupResult,
} from "../../database/utils/backup/databaseBackup";

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
    readonly metadata: DatabaseBackupResult["metadata"];
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

/** Convert serialized metadata back into the runtime
{@link DatabaseBackupMetadata} shape. */
export function toDatabaseBackupMetadata(
    serialized: SerializedDatabaseBackupMetadata
): DatabaseBackupMetadata {
    return {
        appVersion: serialized.appVersion,
        checksum: serialized.checksum,
        createdAt: serialized.createdAt,
        originalPath: serialized.originalPath,
        retentionHintDays: serialized.retentionHintDays,
        schemaVersion: serialized.schemaVersion,
        sizeBytes: serialized.sizeBytes,
    } satisfies DatabaseBackupMetadata;
}
