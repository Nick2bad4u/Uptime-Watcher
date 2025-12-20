import { ProviderCloudSyncTransport } from "@electron/services/sync/ProviderCloudSyncTransport";
import type { CloudObjectEntry } from "@electron/services/cloud/providers/CloudStorageProvider.types";
import type { CloudStorageProvider } from "@electron/services/cloud/providers/CloudStorageProvider.types";
import type { CloudProviderKind } from "@shared/types/cloud";
import type { CloudSyncOperation } from "@shared/types/cloudSync";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { describe, expect, it } from "vitest";

function createProvider(
    overrides: Partial<CloudStorageProvider>
): CloudStorageProvider {
    const base: CloudStorageProvider = {
        deleteObject: async () => {},
        downloadBackup: async () => ({
            buffer: Buffer.from(""),
            entry: {
                encrypted: false,
                fileName: "test.json",
                key: "backups/test.json",
                metadata: {
                    appVersion: "0.0.0",
                    checksum: "",
                    createdAt: Date.now(),
                    originalPath: "",
                    retentionHintDays: 0,
                    schemaVersion: 1,
                    sizeBytes: 1,
                },
            },
        }),
        downloadObject: async () => Buffer.from(""),
        isConnected: async () => true,
        kind: "filesystem" satisfies CloudProviderKind,
        listBackups: async () => [],
        listObjects: async () => [],
        uploadBackup: async () => ({
            encrypted: false,
            fileName: "test.json",
            key: "backups/test.json",
            metadata: {
                appVersion: "0.0.0",
                checksum: "",
                createdAt: Date.now(),
                originalPath: "",
                retentionHintDays: 0,
                schemaVersion: 1,
                sizeBytes: 1,
            },
        }),
        uploadObject: async (): Promise<CloudObjectEntry> => ({
            key: "x",
            lastModifiedAt: Date.now(),
            sizeBytes: 1,
        }),
    };

    return {
        ...base,
        ...overrides,
    };
}

describe("ProviderCloudSyncTransport.readOperationsObject limits", () => {
    it("rejects oversized operation objects", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.alloc(6 * 1024 * 1024, "a"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject("sync/devices/a/ops/1-1-1.ndjson")
        ).rejects.toThrowError(/exceeds size limit/i);
    });

    it("rejects operation objects with a line that exceeds the max line length", async () => {
        const longLine = JSON.stringify({
            deviceId: "a",
            entityId: "e",
            entityType: "site",
            field: "x",
            kind: "set-field",
            opId: 1,
            syncSchemaVersion: 1,
            timestamp: 1,
            value: true,
        });
        const payload = `${longLine}${"a".repeat(300_000)}\n`;

        const provider = createProvider({
            downloadObject: async () => Buffer.from(payload, "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject("sync/devices/a/ops/1-1-1.ndjson")
        ).rejects.toThrowError(/exceeds max length/i);
    });

    it("rejects operations keys containing traversal segments", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.from("{}\n", "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject(
                "sync/devices/a/ops/../evil.ndjson"
            )
        ).rejects.toThrowError(/invalid/i);
    });

    it("rejects operations keys with an invalid filename format", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.from("{}\n", "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject(
                "sync/devices/a/ops/not-a-valid-name.ndjson"
            )
        ).rejects.toThrowError(/expected/i);
    });

    it("rejects operations keys containing backslashes", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.from("{}\n", "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject(
                String.raw`sync\devices\a\ops\1-1-1.ndjson`
            )
        ).rejects.toThrowError(/backslashes/i);
    });

    it("rejects operations keys containing ':' tokens", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.from("{}\n", "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject(
                "sync/devices/a:evil/ops/1-1-1.ndjson"
            )
        ).rejects.toThrowError(/tokens are not allowed|must not contain/i);
    });

    it("rejects appendOperations when deviceId contains path separators", async () => {
        const provider = createProvider({
            uploadObject: async () => ({
                key: "x",
                lastModifiedAt: Date.now(),
                sizeBytes: 1,
            }),
        });

        const transport = ProviderCloudSyncTransport.create(provider);
        const operation: CloudSyncOperation = {
            deviceId: "a",
            entityId: "e",
            entityType: "site",
            field: "x",
            kind: "set-field",
            opId: 1,
            syncSchemaVersion: 1,
            timestamp: 1,
            value: true,
        };

        await expect(
            transport.appendOperations("a/b", [operation])
        ).rejects.toThrowError(/path separators/i);
    });

    it("rejects appendOperations when deviceId contains ':'", async () => {
        const provider = createProvider({
            uploadObject: async () => ({
                key: "x",
                lastModifiedAt: Date.now(),
                sizeBytes: 1,
            }),
        });

        const transport = ProviderCloudSyncTransport.create(provider);
        const operation: CloudSyncOperation = {
            deviceId: "a",
            entityId: "e",
            entityType: "site",
            field: "x",
            kind: "set-field",
            opId: 1,
            syncSchemaVersion: 1,
            timestamp: 1,
            value: true,
        };

        await expect(
            transport.appendOperations("a:bad", [operation])
        ).rejects.toThrowError(/must not contain ':'/i);
    });
});

describe("ProviderCloudSyncTransport snapshot key validation", () => {
    it("rejects snapshot keys with the wrong schema version", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.from("{}", "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readSnapshot("sync/snapshots/999/1.json")
        ).rejects.toThrowError(/invalid snapshot key/i);
    });

    it("accepts snapshot keys matching schema version", async () => {
        const provider = createProvider({
            downloadObject: async () =>
                Buffer.from(
                    JSON.stringify({
                        createdAt: 1,
                        snapshotVersion: 1,
                        state: { monitor: {}, settings: {}, site: {} },
                        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                    }),
                    "utf8"
                ),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readSnapshot(
                `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1.json`
            )
        ).resolves.toBeTruthy();
    });
});

describe("ProviderCloudSyncTransport.readManifest provider not-found", () => {
    it("treats Google Drive 'object not found' as missing manifest", async () => {
        const provider = createProvider({
            downloadObject: async () => {
                throw new Error("Google Drive object not found: manifest.json");
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(transport.readManifest()).resolves.toBeNull();
    });
});
