import { createHash } from "node:crypto";

import type { CloudBackupEntry, CloudStatusSummary } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import { isEncryptedPayload } from "@electron/services/cloud/crypto/cloudCrypto";
import {
    migrateBackups,
    uploadLatestBackup,
} from "@electron/services/cloud/CloudService.backupOperations";
import type { CloudServiceOperationContext } from "@electron/services/cloud/CloudService.operationContext";
import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "@electron/services/cloud/providers/CloudStorageProvider.types";
import { describe, expect, it, vi } from "vitest";

function checksum(buffer: Buffer): string {
    return createHash("sha256").update(buffer).digest("hex");
}

function createMetadata(buffer: Buffer): SerializedDatabaseBackupMetadata {
    return {
        appVersion: "test",
        checksum: checksum(buffer),
        createdAt: 1_700_000_000_000,
        originalPath: "backup.sqlite",
        retentionHintDays: 30,
        schemaVersion: 1,
        sizeBytes: buffer.byteLength,
    };
}

function createBaseStatus(): CloudStatusSummary {
    return {
        backupsEnabled: true,
        configured: true,
        connected: true,
        encryptionLocked: false,
        encryptionMode: "passphrase",
        lastBackupAt: null,
        lastSyncAt: null,
        provider: "filesystem",
        syncEnabled: false,
    };
}

class InMemoryBackupProvider implements CloudStorageProvider {
    public readonly backups = new Map<
        string,
        { buffer: Buffer; entry: CloudBackupEntry }
    >();

    public readonly kind = "filesystem" as const;

    public async deleteObject(key: string): Promise<void> {
        this.backups.delete(key);
    }

    public async downloadBackup(
        key: string
    ): Promise<{ buffer: Buffer; entry: CloudBackupEntry }> {
        const backup = this.backups.get(key);
        if (!backup) {
            throw new Error(`Missing backup ${key}`);
        }

        return backup;
    }

    public async downloadObject(): Promise<Buffer> {
        throw new Error("downloadObject should not be called");
    }

    public async isConnected(): Promise<boolean> {
        return true;
    }

    public async listBackups(): Promise<CloudBackupEntry[]> {
        return [...this.backups.values()].map((backup) => backup.entry);
    }

    public async listObjects(): Promise<CloudObjectEntry[]> {
        return [];
    }

    public seedBackup(args: {
        buffer: Buffer;
        encrypted: boolean;
        fileName: string;
        key: string;
    }): void {
        const entry: CloudBackupEntry = {
            encrypted: args.encrypted,
            fileName: args.fileName,
            key: args.key,
            metadata: createMetadata(args.buffer),
        };

        this.backups.set(args.key, {
            buffer: args.buffer,
            entry,
        });
    }

    public async uploadBackup(args: {
        buffer: Buffer;
        encrypted: boolean;
        fileName: string;
        metadata: SerializedDatabaseBackupMetadata;
    }): Promise<CloudBackupEntry> {
        const key = `backups/${args.fileName}`;
        const entry: CloudBackupEntry = {
            encrypted: args.encrypted,
            fileName: args.fileName,
            key,
            metadata: args.metadata,
        };

        this.backups.set(key, {
            buffer: args.buffer,
            entry,
        });

        return entry;
    }

    public async uploadObject(): Promise<CloudObjectEntry> {
        throw new Error("uploadObject should not be called");
    }
}

function createOperationContext(args: {
    encryptionKey: Buffer;
    provider: CloudStorageProvider;
}): CloudServiceOperationContext {
    const settings = new Map<string, string>([
        ["cloud.encryption.mode", "passphrase"],
    ]);
    const backupBuffer = Buffer.from("backup", "utf8");

    return {
        buildStatusSummary: async () => createBaseStatus(),
        decryptBackupOrThrow: async () => {
            throw new Error("decryptBackupOrThrow should not be called");
        },
        getDropboxAppKey: () => "app-key",
        getEncryptionKeyMaybe: async () => ({
            encrypted: true,
            key: args.encryptionKey,
        }),
        getEncryptionKeyOrThrow: async () => args.encryptionKey,
        loadDropboxDeps: async () => {
            throw new Error("loadDropboxDeps should not be called");
        },
        loadGoogleDriveDeps: async () => {
            throw new Error("loadGoogleDriveDeps should not be called");
        },
        orchestrator: {
            downloadBackup: vi.fn(async () => ({
                buffer: backupBuffer,
                fileName: "backup.sqlite",
                metadata: createMetadata(backupBuffer),
            })),
        } as never,
        resolveProviderOrThrow: async () => args.provider,
        runCloudOperation: async (_operationName, operation) => operation(),
        secretStore: {} as never,
        settings: {
            get: async (key) => settings.get(key),
            set: async (key, value) => {
                settings.set(key, value);
            },
        },
        syncEngine: {} as never,
    };
}

describe("CloudService.backupOperations", () => {
    it("zeroes the decoded encryption key after encrypted backup upload", async () => {
        const provider = new InMemoryBackupProvider();
        const encryptionKey = Buffer.alloc(32, 7);
        const zeroedKeyBytes = Array.from({ length: 32 }, () => 0);
        const ctx = createOperationContext({ encryptionKey, provider });

        const entry = await uploadLatestBackup(ctx);
        const stored = provider.backups.get(entry.key);

        expect(stored).toBeDefined();
        expect(stored ? isEncryptedPayload(stored.buffer) : false).toBeTruthy();
        expect([...encryptionKey]).toStrictEqual(zeroedKeyBytes);
    });

    it("zeroes the decoded encryption key after backup migration", async () => {
        const provider = new InMemoryBackupProvider();
        const sourceBuffer = Buffer.from("backup", "utf8");
        provider.seedBackup({
            buffer: sourceBuffer,
            encrypted: false,
            fileName: "backup.sqlite",
            key: "backups/backup.sqlite",
        });

        const encryptionKey = Buffer.alloc(32, 9);
        const zeroedKeyBytes = Array.from({ length: 32 }, () => 0);
        const ctx = createOperationContext({ encryptionKey, provider });

        const result = await migrateBackups(ctx, {
            deleteSource: false,
            target: "encrypted",
        });

        const stored = provider.backups.get("backups/backup.sqlite.enc");
        expect(result.migrated).toBe(1);
        expect(stored).toBeDefined();
        expect(stored ? isEncryptedPayload(stored.buffer) : false).toBeTruthy();
        expect([...encryptionKey]).toStrictEqual(zeroedKeyBytes);
    });
});
