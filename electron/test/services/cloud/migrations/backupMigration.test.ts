import type {
    CloudBackupMigrationRequest,
    CloudBackupMigrationResult,
} from "@shared/types/cloudBackupMigration";
import type { CloudBackupEntry } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import { describe, expect, it } from "vitest";

import {
    decryptBuffer,
    derivePassphraseKey,
    generateEncryptionSalt,
    isEncryptedPayload,
} from "@electron/services/cloud/crypto/cloudCrypto";
import { migrateProviderBackups } from "@electron/services/cloud/migrations/backupMigration";
import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "@electron/services/cloud/providers/CloudStorageProvider.types";

class InMemoryBackupProvider implements CloudStorageProvider {
    public readonly kind = "filesystem" as const;

    private readonly blobs = new Map<string, Buffer>();

    private backups: CloudBackupEntry[] = [];

    public async deleteObject(key: string): Promise<void> {
        this.blobs.delete(key);

        if (key.endsWith(".metadata.json")) {
            const backupKey = key.slice(0, -".metadata.json".length);
            this.backups = this.backups.filter(
                (entry) => entry.key !== backupKey
            );
        }
    }

    public async downloadBackup(
        key: string
    ): Promise<{ buffer: Buffer; entry: CloudBackupEntry }> {
        const entry = this.backups.find((candidate) => candidate.key === key);
        if (!entry) {
            const error = new Error("not found") as Error & { code: string };
            error.code = "ENOENT";
            throw error;
        }

        const buffer = this.blobs.get(key);
        if (!buffer) {
            const error = new Error("not found") as Error & { code: string };
            error.code = "ENOENT";
            throw error;
        }

        return { buffer, entry };
    }

    public async downloadObject(key: string): Promise<Buffer> {
        const buffer = this.blobs.get(key);
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
        return [...this.backups].toSorted(
            (a, b) => b.metadata.createdAt - a.metadata.createdAt
        );
    }

    public async listObjects(prefix: string): Promise<CloudObjectEntry[]> {
        const entries: CloudObjectEntry[] = [];
        for (const [key, value] of this.blobs) {
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
        this.blobs.set(key, args.buffer);
        this.blobs.set(`${key}.metadata.json`, Buffer.from("{}"));

        const entry: CloudBackupEntry = {
            encrypted: args.encrypted,
            fileName: args.fileName,
            key,
            metadata: args.metadata,
        };

        this.backups = [entry, ...this.backups];
        return entry;
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean | undefined;
    }): Promise<CloudObjectEntry> {
        if (!args.overwrite && this.blobs.has(args.key)) {
            throw new Error("exists");
        }
        this.blobs.set(args.key, args.buffer);
        return {
            key: args.key,
            lastModifiedAt: 0,
            sizeBytes: args.buffer.length,
        };
    }

    public seedBackup(entry: {
        encrypted: boolean;
        fileName: string;
        key: string;
        buffer: Buffer;
        createdAt: number;
    }): void {
        const metadata: SerializedDatabaseBackupMetadata = {
            appVersion: "test",
            checksum: "",
            createdAt: entry.createdAt,
            originalPath: "",
            retentionHintDays: 1,
            schemaVersion: 1,
            sizeBytes: entry.buffer.length,
        };
        const backup: CloudBackupEntry = {
            encrypted: entry.encrypted,
            fileName: entry.fileName,
            key: entry.key,
            metadata,
        };
        this.backups = [backup, ...this.backups];
        this.blobs.set(entry.key, entry.buffer);
        this.blobs.set(`${entry.key}.metadata.json`, Buffer.from("{}"));
    }

    public readBlob(key: string): Buffer | undefined {
        return this.blobs.get(key);
    }
}

describe(migrateProviderBackups, () => {
    it("migrates plaintext backups to encrypted and keeps originals by default", async () => {
        const provider = new InMemoryBackupProvider();
        provider.seedBackup({
            buffer: Buffer.from("plain", "utf8"),
            createdAt: 10,
            encrypted: false,
            fileName: "uptime-watcher-backup-10.sqlite",
            key: "backups/uptime-watcher-backup-10.sqlite",
        });
        provider.seedBackup({
            buffer: Buffer.from("already", "utf8"),
            createdAt: 20,
            encrypted: true,
            fileName: "uptime-watcher-backup-20.sqlite.enc",
            key: "backups/uptime-watcher-backup-20.sqlite.enc",
        });

        const key = await derivePassphraseKey({
            passphrase: "correct horse battery staple",
            salt: generateEncryptionSalt(),
        });

        const request: CloudBackupMigrationRequest = {
            deleteSource: false,
            target: "encrypted",
        };

        const result = await migrateProviderBackups({
            encryptionKey: key,
            provider,
            request,
        });

        expect(result.migrated).toBe(1);
        expect(result.failures).toHaveLength(0);

        const backups = await provider.listBackups();
        expect(backups.some((b) => b.encrypted === false)).toBeTruthy();
        expect(backups.filter((b) => b.encrypted).length).toBeGreaterThan(0);

        const migratedEntry = backups.find(
            (b) => b.fileName === "uptime-watcher-backup-10.sqlite.enc"
        );
        expect(migratedEntry).toBeDefined();

        const stored = provider.readBlob(migratedEntry!.key);
        expect(stored).toBeDefined();
        expect(isEncryptedPayload(stored!)).toBeTruthy();

        const decrypted = decryptBuffer({ key, ciphertext: stored! });
        expect(decrypted.toString("utf8")).toBe("plain");
    });

    it("can delete plaintext originals after successful migration", async () => {
        const provider = new InMemoryBackupProvider();
        provider.seedBackup({
            buffer: Buffer.from("plain", "utf8"),
            createdAt: 10,
            encrypted: false,
            fileName: "uptime-watcher-backup-10.sqlite",
            key: "backups/uptime-watcher-backup-10.sqlite",
        });

        const key = await derivePassphraseKey({
            passphrase: "correct horse battery staple",
            salt: generateEncryptionSalt(),
        });

        const request: CloudBackupMigrationRequest = {
            deleteSource: true,
            target: "encrypted",
        };

        const result = await migrateProviderBackups({
            encryptionKey: key,
            provider,
            request,
        });

        expect(result.migrated).toBe(1);
        const backups = await provider.listBackups();
        expect(
            backups.some(
                (b) => b.key === "backups/uptime-watcher-backup-10.sqlite"
            )
        ).toBeFalsy();
        expect(
            backups.some(
                (b) => b.key === "backups/uptime-watcher-backup-10.sqlite.enc"
            )
        ).toBeTruthy();
    });

    it("throws when migrating to encrypted without an encryption key", async () => {
        const provider = new InMemoryBackupProvider();
        provider.seedBackup({
            buffer: Buffer.from("plain", "utf8"),
            createdAt: 10,
            encrypted: false,
            fileName: "uptime-watcher-backup-10.sqlite",
            key: "backups/uptime-watcher-backup-10.sqlite",
        });

        const request: CloudBackupMigrationRequest = {
            deleteSource: false,
            target: "encrypted",
        };

        await expect(
            migrateProviderBackups({ provider, request })
        ).rejects.toThrowError(/Encryption key is required/u);
    });

    it("returns failures when an entry cannot be downloaded", async () => {
        const provider = new InMemoryBackupProvider();
        provider.seedBackup({
            buffer: Buffer.from("plain", "utf8"),
            createdAt: 10,
            encrypted: false,
            fileName: "uptime-watcher-backup-10.sqlite",
            key: "backups/uptime-watcher-backup-10.sqlite",
        });

        // Remove the blob so downloadBackup fails.
        await provider.deleteObject("backups/uptime-watcher-backup-10.sqlite");

        const key = await derivePassphraseKey({
            passphrase: "correct horse battery staple",
            salt: generateEncryptionSalt(),
        });

        const request: CloudBackupMigrationRequest = {
            deleteSource: false,
            target: "encrypted",
        };

        const result: CloudBackupMigrationResult = await migrateProviderBackups(
            {
                encryptionKey: key,
                provider,
                request,
            }
        );

        expect(result.migrated).toBe(0);
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0]?.key).toBe(
            "backups/uptime-watcher-backup-10.sqlite"
        );
    });

    it("refuses to overwrite an existing migrated target backup", async () => {
        const provider = new InMemoryBackupProvider();

        provider.seedBackup({
            buffer: Buffer.from("plain", "utf8"),
            createdAt: 10,
            encrypted: false,
            fileName: "uptime-watcher-backup-10.sqlite",
            key: "backups/uptime-watcher-backup-10.sqlite",
        });

        provider.seedBackup({
            buffer: Buffer.from("existing", "utf8"),
            createdAt: 11,
            encrypted: true,
            fileName: "uptime-watcher-backup-10.sqlite.enc",
            key: "backups/uptime-watcher-backup-10.sqlite.enc",
        });

        const key = await derivePassphraseKey({
            passphrase: "correct horse battery staple",
            salt: generateEncryptionSalt(),
        });

        const request: CloudBackupMigrationRequest = {
            deleteSource: false,
            target: "encrypted",
        };

        const result = await migrateProviderBackups({
            encryptionKey: key,
            provider,
            request,
        });

        expect(result.migrated).toBe(0);
        expect(result.failures).toHaveLength(1);

        const stored = provider.readBlob(
            "backups/uptime-watcher-backup-10.sqlite.enc"
        );
        expect(stored?.toString("utf8")).toBe("existing");
    });

    it("counts upload as migrated even when deleteSource cleanup fails", async () => {
        class DeleteFailsProvider extends InMemoryBackupProvider {
            public override async deleteObject(key: string): Promise<void> {
                if (key.endsWith(".metadata.json")) {
                    throw new Error("metadata delete failed");
                }

                return super.deleteObject(key);
            }
        }

        const provider = new DeleteFailsProvider();
        provider.seedBackup({
            buffer: Buffer.from("plain", "utf8"),
            createdAt: 10,
            encrypted: false,
            fileName: "uptime-watcher-backup-10.sqlite",
            key: "backups/uptime-watcher-backup-10.sqlite",
        });

        const key = await derivePassphraseKey({
            passphrase: "correct horse battery staple",
            salt: generateEncryptionSalt(),
        });

        const request: CloudBackupMigrationRequest = {
            deleteSource: true,
            target: "encrypted",
        };

        const result = await migrateProviderBackups({
            encryptionKey: key,
            provider,
            request,
        });

        expect(result.migrated).toBe(1);
        expect(result.failures).toHaveLength(1);

        const encryptedBuffer = provider.readBlob(
            "backups/uptime-watcher-backup-10.sqlite.enc"
        );
        expect(encryptedBuffer).toBeDefined();
        expect(isEncryptedPayload(encryptedBuffer!)).toBeTruthy();
    });
});
