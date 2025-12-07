import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

type BackupOverrides = Partial<SerializedDatabaseBackupResult> & {
    metadata?: Partial<SerializedDatabaseBackupResult["metadata"]>;
};

const DEFAULT_METADATA: SerializedDatabaseBackupResult["metadata"] = {
    appVersion: "1.0.0",
    checksum: "deadbeefdeadbeef",
    createdAt: 1_700_000_000_000,
    originalPath: "/tmp/uptime-watcher.sqlite",
    retentionHintDays: 30,
    schemaVersion: 1,
    sizeBytes: 16,
};

export const createSerializedBackupResult = (
    overrides: BackupOverrides = {}
): SerializedDatabaseBackupResult => ({
    buffer: overrides.buffer ?? new ArrayBuffer(16),
    fileName: overrides.fileName ?? "uptime-watcher-backup.sqlite",
    metadata: {
        checksum: overrides.metadata?.checksum ?? DEFAULT_METADATA.checksum,
        createdAt: overrides.metadata?.createdAt ?? DEFAULT_METADATA.createdAt,
        originalPath:
            overrides.metadata?.originalPath ?? DEFAULT_METADATA.originalPath,
        appVersion:
            overrides.metadata?.appVersion ?? DEFAULT_METADATA.appVersion,
        retentionHintDays:
            overrides.metadata?.retentionHintDays ??
            DEFAULT_METADATA.retentionHintDays,
        schemaVersion:
            overrides.metadata?.schemaVersion ?? DEFAULT_METADATA.schemaVersion,
        sizeBytes: overrides.metadata?.sizeBytes ?? DEFAULT_METADATA.sizeBytes,
    },
});

export const createSerializedRestoreResult = (
    overrides: Partial<SerializedDatabaseRestoreResult> & {
        metadata?: Partial<SerializedDatabaseRestoreResult["metadata"]>;
    } = {}
): SerializedDatabaseRestoreResult => ({
    metadata: {
        appVersion:
            overrides.metadata?.appVersion ?? DEFAULT_METADATA.appVersion,
        checksum: overrides.metadata?.checksum ?? DEFAULT_METADATA.checksum,
        createdAt: overrides.metadata?.createdAt ?? DEFAULT_METADATA.createdAt,
        originalPath:
            overrides.metadata?.originalPath ?? DEFAULT_METADATA.originalPath,
        retentionHintDays:
            overrides.metadata?.retentionHintDays ??
            DEFAULT_METADATA.retentionHintDays,
        schemaVersion:
            overrides.metadata?.schemaVersion ?? DEFAULT_METADATA.schemaVersion,
        sizeBytes: overrides.metadata?.sizeBytes ?? DEFAULT_METADATA.sizeBytes,
    },
    preRestoreFileName:
        overrides.preRestoreFileName ?? "uptime-watcher-backup.sqlite",
    restoredAt: overrides.restoredAt ?? DEFAULT_METADATA.createdAt,
});
