import type { CloudEncryptionConfigPassphrase } from "@shared/types/cloudEncryption";
import type { CloudSyncManifest } from "@shared/types/cloudSyncManifest";

import { describe, expect, it, vi } from "vitest";

import { CLOUD_ENCRYPTION_CONFIG_VERSION } from "@shared/types/cloudEncryption";
import { CLOUD_SYNC_MANIFEST_VERSION } from "@shared/types/cloudSyncManifest";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";

import { resetProviderCloudSyncState } from "@electron/services/cloud/migrations/syncReset";
import type { CloudStorageProvider } from "@electron/services/cloud/providers/CloudStorageProvider.types";
import type {
    CloudSyncEngine,
    SyncEngineResult,
} from "@electron/services/sync/SyncEngine";

class InMemoryProvider implements CloudStorageProvider {
    public readonly kind = "filesystem" as const;

    private readonly objects = new Map<string, Buffer>();

    public async deleteObject(key: string): Promise<void> {
        this.objects.delete(key);
    }

    public async downloadBackup(): Promise<never> {
        throw new Error("not implemented");
    }

    public async downloadObject(key: string): Promise<Buffer> {
        const value = this.objects.get(key);
        if (!value) {
            const error = new Error("not found") as Error & { code: string };
            error.code = "ENOENT";
            throw error;
        }
        return value;
    }

    public async isConnected(): Promise<boolean> {
        return true;
    }

    public async listBackups(): Promise<never> {
        throw new Error("not implemented");
    }

    public async listObjects(
        prefix: string
    ): Promise<{ key: string; lastModifiedAt: number; sizeBytes: number }[]> {
        const entries: {
            key: string;
            lastModifiedAt: number;
            sizeBytes: number;
        }[] = [];

        for (const [key, buffer] of this.objects) {
            if (key.startsWith(prefix)) {
                entries.push({
                    key,
                    lastModifiedAt: 0,
                    sizeBytes: buffer.length,
                });
            }
        }

        return entries;
    }

    public async uploadBackup(): Promise<never> {
        throw new Error("not implemented");
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean | undefined;
    }): Promise<{ key: string; lastModifiedAt: number; sizeBytes: number }> {
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

    public seedObject(key: string, value: string): void {
        this.objects.set(key, Buffer.from(value, "utf8"));
    }

    public readJson<T>(key: string): T {
        const buffer = this.objects.get(key);
        if (!buffer) {
            throw new Error("missing");
        }

        return JSON.parse(buffer.toString("utf8")) as T;
    }
}

describe(resetProviderCloudSyncState, () => {
    it("deletes sync objects and writes manifest.resetAt while preserving encryption config", async () => {
        const provider = new InMemoryProvider();
        const deleteSpy = vi.spyOn(provider, "deleteObject");

        provider.seedObject("sync/devices/a/ops/1-1-1.ndjson", "{}");
        provider.seedObject("sync/snapshots/1/1.json", "{}");
        provider.seedObject("sync/other.bin", "{}");
        // JSON-looking but invalid for sync transport (not under sync/snapshots).
        provider.seedObject("sync/other.json", "{}");

        const encryption: CloudEncryptionConfigPassphrase = {
            configVersion: CLOUD_ENCRYPTION_CONFIG_VERSION,
            kdf: "scrypt",
            keyCheckBase64: "abc",
            mode: "passphrase",
            saltBase64: "def",
        };

        const manifest: CloudSyncManifest = {
            devices: {},
            encryption,
            latestSnapshotKey: "sync/snapshots/1/1.json",
            manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        };
        provider.seedObject("manifest.json", JSON.stringify(manifest));

        const syncResult: SyncEngineResult = {
            appliedRemoteOperations: 0,
            emittedLocalOperations: 0,
            mergedEntities: 0,
            snapshotKey: "sync/snapshots/2/2.json",
        };

        const syncEngine: CloudSyncEngine = {
            syncNow: vi.fn(async () => syncResult),
        };

        const result = await resetProviderCloudSyncState({
            provider,
            syncEngine,
        });
        expect(result.deletedObjects).toBe(2);
        expect(result.failedDeletions).toEqual([]);
        expect(result.seededSnapshotKey).toBe("sync/snapshots/2/2.json");

        expect(deleteSpy.mock.calls.map(([key]) => key).toSorted()).toEqual(
            [
                "sync/devices/a/ops/1-1-1.ndjson",
                "sync/snapshots/1/1.json",
            ].toSorted()
        );

        // Unknown extensions are ignored during cleanup.
        await expect(
            provider.downloadObject("sync/other.bin")
        ).resolves.toBeTruthy();

        // Invalid-but-JSON-looking keys are also ignored.
        await expect(
            provider.downloadObject("sync/other.json")
        ).resolves.toBeTruthy();

        expect(syncEngine.syncNow).toHaveBeenCalledTimes(1);
        expect(syncEngine.syncNow).toHaveBeenCalledWith(provider);

        const nextManifest =
            provider.readJson<CloudSyncManifest>("manifest.json");
        expect(nextManifest.encryption?.mode).toBe("passphrase");
        expect(nextManifest.resetAt).toBeTypeOf("number");
        expect(nextManifest.latestSnapshotKey).toBeUndefined();
        expect(Object.keys(nextManifest.devices)).toHaveLength(0);
    });
});
