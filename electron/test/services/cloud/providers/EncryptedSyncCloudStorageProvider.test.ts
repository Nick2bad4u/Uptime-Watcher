import type { CloudBackupEntry } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import { describe, expect, it } from "vitest";

import {
    derivePassphraseKey,
    generateEncryptionSalt,
    isEncryptedPayload,
} from "@electron/services/cloud/crypto/cloudCrypto";
import { EncryptedSyncCloudStorageProvider } from "@electron/services/cloud/providers/EncryptedSyncCloudStorageProvider";
import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "@electron/services/cloud/providers/CloudStorageProvider.types";

class InMemoryProvider implements CloudStorageProvider {
    public readonly kind = "filesystem" as const;

    public readonly objects = new Map<string, Buffer>();

    public async deleteObject(key: string): Promise<void> {
        this.objects.delete(key);
    }

    public async downloadBackup(
        key: string
    ): Promise<{ buffer: Buffer; entry: CloudBackupEntry }> {
        const buffer = await this.downloadObject(key);
        const entry: CloudBackupEntry = {
            encrypted: false,
            fileName: "backup.sqlite",
            key,
            metadata: {
                appVersion: "test",
                checksum: "",
                createdAt: 0,
                originalPath: "",
                retentionHintDays: 1,
                schemaVersion: 1,
                sizeBytes: buffer.length,
            },
        };

        return { buffer, entry };
    }

    public async downloadObject(key: string): Promise<Buffer> {
        const buffer = this.objects.get(key);
        if (!buffer) {
            const error = new Error("not found") as Error & { code: string };
            error.code = "ENOENT";
            throw error;
        }
        return buffer;
    }

    public async isConnected(): Promise<boolean> {
        return true;
    }

    public async listBackups(): Promise<CloudBackupEntry[]> {
        return [];
    }

    public async listObjects(prefix: string): Promise<CloudObjectEntry[]> {
        const entries: CloudObjectEntry[] = [];
        for (const [key, value] of this.objects) {
            if (key.startsWith(prefix)) {
                entries.push({
                    key,
                    lastModifiedAt: 0,
                    sizeBytes: value.length,
                });
            }
        }
        return entries;
    }

    public async uploadBackup(args: {
        buffer: Buffer;
        encrypted: boolean;
        fileName: string;
        metadata: SerializedDatabaseBackupMetadata;
    }): Promise<CloudBackupEntry> {
        const key = `backups/${args.fileName}`;
        await this.uploadObject({ buffer: args.buffer, key, overwrite: true });
        return {
            encrypted: args.encrypted,
            fileName: args.fileName,
            key,
            metadata: args.metadata,
        };
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry> {
        if (!args.overwrite && this.objects.has(args.key)) {
            throw new Error("exists");
        }
        this.objects.set(args.key, args.buffer);
        return {
            key: args.key,
            lastModifiedAt: 0,
            sizeBytes: args.buffer.length,
        };
    }
}

describe(EncryptedSyncCloudStorageProvider, () => {
    it("encrypts uploads under sync/ and decrypts on download", async () => {
        const inner = new InMemoryProvider();
        const key = await derivePassphraseKey({
            passphrase: "secret",
            salt: generateEncryptionSalt(),
        });

        const provider = new EncryptedSyncCloudStorageProvider({ inner, key });

        await provider.uploadObject({
            buffer: Buffer.from("hello", "utf8"),
            key: "sync/snapshots/1/123.json",
            overwrite: true,
        });

        const stored = inner.objects.get("sync/snapshots/1/123.json");
        expect(stored).toBeDefined();
        expect(isEncryptedPayload(stored!)).toBeTruthy();

        const read = await provider.downloadObject("sync/snapshots/1/123.json");
        expect(read.toString("utf8")).toBe("hello");
    });

    it("does not encrypt manifest.json", async () => {
        const inner = new InMemoryProvider();
        const key = await derivePassphraseKey({
            passphrase: "secret",
            salt: generateEncryptionSalt(),
        });

        const provider = new EncryptedSyncCloudStorageProvider({ inner, key });

        await provider.uploadObject({
            buffer: Buffer.from("{}", "utf8"),
            key: "manifest.json",
            overwrite: true,
        });

        const stored = inner.objects.get("manifest.json");
        expect(stored?.toString("utf8")).toBe("{}");
        expect(stored ? isEncryptedPayload(stored) : false).toBeFalsy();
    });

    it("rejects plaintext sync objects", async () => {
        const inner = new InMemoryProvider();
        const key = await derivePassphraseKey({
            passphrase: "secret",
            salt: generateEncryptionSalt(),
        });

        inner.objects.set("sync/devices/a/ops/30-1-1.ndjson", Buffer.from("x"));

        const provider = new EncryptedSyncCloudStorageProvider({ inner, key });

        await expect(
            provider.downloadObject("sync/devices/a/ops/30-1-1.ndjson")
        ).rejects.toThrowError(/refusing to read unencrypted sync object/i);
    });
});
