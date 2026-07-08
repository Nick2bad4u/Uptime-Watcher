import { describe, expect, it } from "vitest";

import { CloudHandlerResultValidators } from "../../../../services/ipc/validators/cloud";

const createMetadata = () => ({
    appVersion: "1.0.0",
    checksum: "abc",
    createdAt: 1,
    originalPath: "C:/x",
    retentionHintDays: 30,
    schemaVersion: 1,
    sizeBytes: 8,
});

const createBackupEntry = () => ({
    encrypted: false,
    fileName: "backup.sqlite",
    key: "backups/backup.sqlite",
    metadata: createMetadata(),
});

const createStatusSummary = () => ({
    backupsEnabled: false,
    configured: false,
    connected: false,
    encryptionLocked: false,
    encryptionMode: "none" as const,
    lastBackupAt: null,
    lastSyncAt: null,
    provider: null,
    syncEnabled: false,
});

describe("CloudHandlerResultValidators", () => {
    it("accepts valid cloud IPC success payloads", () => {
        expect(
            CloudHandlerResultValidators.statusSummary(createStatusSummary())
        ).toBeNull();
        expect(
            CloudHandlerResultValidators.backupEntry(createBackupEntry())
        ).toBeNull();
        expect(
            CloudHandlerResultValidators.backupEntryArray([createBackupEntry()])
        ).toBeNull();
        expect(
            CloudHandlerResultValidators.backupMigrationResult({
                completedAt: 2,
                deleteSource: false,
                failures: [],
                migrated: 1,
                processed: 1,
                skipped: 0,
                startedAt: 1,
                target: "encrypted",
            })
        ).toBeNull();
        expect(
            CloudHandlerResultValidators.restoreBackup({
                metadata: createMetadata(),
                restoredAt: 2,
            })
        ).toBeNull();
        expect(
            CloudHandlerResultValidators.syncResetPreview({
                deviceIds: [],
                fetchedAt: 1,
                operationDeviceIds: [],
                operationObjectCount: 0,
                otherObjectCount: 0,
                perDevice: [],
                snapshotObjectCount: 0,
                syncObjectCount: 0,
            })
        ).toBeNull();
        expect(
            CloudHandlerResultValidators.syncResetResult({
                completedAt: 2,
                deletedObjects: 0,
                failedDeletions: [],
                resetAt: 2,
                startedAt: 1,
            })
        ).toBeNull();
    });

    it("rejects malformed cloud IPC success payloads", () => {
        expect(
            CloudHandlerResultValidators.statusSummary({
                ...createStatusSummary(),
                lastBackupAt: -1,
            })
        ).toEqual(expect.arrayContaining([expect.any(String)]));
        expect(
            CloudHandlerResultValidators.backupEntry({
                ...createBackupEntry(),
                key: "sync/backup.sqlite",
            })
        ).toEqual(expect.arrayContaining([expect.any(String)]));
        expect(
            CloudHandlerResultValidators.backupMigrationResult({
                completedAt: 2,
                deleteSource: false,
                failures: [],
                migrated: -1,
                processed: 1,
                skipped: 0,
                startedAt: 1,
                target: "encrypted",
            })
        ).toEqual(expect.arrayContaining([expect.any(String)]));
        expect(
            CloudHandlerResultValidators.restoreBackup({
                metadata: createMetadata(),
                restoredAt: -1,
            })
        ).toEqual(expect.arrayContaining([expect.any(String)]));
        expect(
            CloudHandlerResultValidators.syncResetPreview({
                deviceIds: [],
                fetchedAt: -1,
                operationDeviceIds: [],
                operationObjectCount: 0,
                otherObjectCount: 0,
                perDevice: [],
                snapshotObjectCount: 0,
                syncObjectCount: 0,
            })
        ).toEqual(expect.arrayContaining([expect.any(String)]));
        expect(
            CloudHandlerResultValidators.syncResetResult({
                completedAt: 2,
                deletedObjects: -1,
                failedDeletions: [],
                resetAt: 2,
                startedAt: 1,
            })
        ).toEqual(expect.arrayContaining([expect.any(String)]));
    });
});
