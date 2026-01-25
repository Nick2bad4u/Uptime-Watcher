import { app } from "electron";

import {
    computeDatabaseBackupChecksum,
    type DatabaseBackupMetadata,
    type DatabaseBackupResult,
    DEFAULT_BACKUP_RETENTION_HINT_DAYS,
    readDatabaseSchemaVersionFromFile,
} from "../utils/backup/databaseBackup";

/**
 * Normalizes the backup metadata so `metadata.originalPath` always matches the
 * safe file name we actually wrote.
 */
export function normalizeBackupResultMetadata(
    backup: DatabaseBackupResult
): DatabaseBackupResult {
    const safeOriginalPath = backup.fileName;
    return {
        ...backup,
        metadata: {
            ...backup.metadata,
            originalPath: safeOriginalPath,
        },
    };
}

/**
 * Builds metadata for a restored backup.
 */
export function buildRestoreMetadata(args: {
    readonly buffer: Buffer;
    readonly fileName: string;
    readonly filePath: string;
}): DatabaseBackupMetadata {
    const schemaVersion = readDatabaseSchemaVersionFromFile(args.filePath);
    const checksum = computeDatabaseBackupChecksum(args.buffer);

    return {
        appVersion: app.getVersion(),
        checksum,
        createdAt: Date.now(),
        originalPath: args.fileName,
        retentionHintDays: DEFAULT_BACKUP_RETENTION_HINT_DAYS,
        schemaVersion,
        sizeBytes: args.buffer.length,
    } satisfies DatabaseBackupMetadata;
}
