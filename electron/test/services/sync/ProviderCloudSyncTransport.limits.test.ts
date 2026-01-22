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
            transport.readOperationsObject("sync/devices/a/ops/../evil.ndjson")
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

    it("parses operation objects with CRLF newlines", async () => {
        const operationLine = JSON.stringify({
            deviceId: "a",
            entityId: "e",
            entityType: "site",
            field: "x",
            kind: "set-field",
            opId: 1,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: 1,
            value: true,
        } satisfies CloudSyncOperation);

        const provider = createProvider({
            downloadObject: async () =>
                Buffer.from(`${operationLine}\r\n`, "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject("sync/devices/a/ops/1-1-1.ndjson")
        ).resolves.toHaveLength(1);
    });

    it("parses operation objects without a trailing newline", async () => {
        const operationLine = JSON.stringify({
            deviceId: "a",
            entityId: "e",
            entityType: "site",
            field: "x",
            kind: "set-field",
            opId: 1,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: 1,
            value: true,
        } satisfies CloudSyncOperation);

        const provider = createProvider({
            downloadObject: async () => Buffer.from(operationLine, "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);
        await expect(
            transport.readOperationsObject("sync/devices/a/ops/1-1-1.ndjson")
        ).resolves.toHaveLength(1);
    });

    it("preserves error line numbering when blank lines precede invalid JSON", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.from("\n{not-json}\n", "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject("sync/devices/a/ops/1-1-1.ndjson")
        ).rejects.toThrowError(/at line 2:/i);
    });

    it("rejects operation objects that contain operations for a different deviceId", async () => {
        const operationLine = JSON.stringify({
            deviceId: "b",
            entityId: "e",
            entityType: "site",
            field: "x",
            kind: "set-field",
            opId: 1,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: 1,
            value: true,
        } satisfies CloudSyncOperation);

        const provider = createProvider({
            downloadObject: async () =>
                Buffer.from(`${operationLine}\n`, "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject("sync/devices/a/ops/1-1-1.ndjson")
        ).rejects.toThrowError(/unexpected deviceid/i);
    });

    it("rejects operation objects whose opId range does not match the key metadata", async () => {
        const operationLine = JSON.stringify({
            deviceId: "a",
            entityId: "e",
            entityType: "site",
            field: "x",
            kind: "set-field",
            opId: 2,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: 1,
            value: true,
        } satisfies CloudSyncOperation);

        const provider = createProvider({
            downloadObject: async () =>
                Buffer.from(`${operationLine}\n`, "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject("sync/devices/a/ops/1-1-1.ndjson")
        ).rejects.toThrowError(/opid range is inconsistent/i);
    });

    it("rejects operation objects containing invalid UTF-8", async () => {
        const provider = createProvider({
            downloadObject: async () =>
                Buffer.from([
                    0xff,
                    0xfe,
                    0xfd,
                ]),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject("sync/devices/a/ops/1-1-1.ndjson")
        ).rejects.toThrowError(/invalid utf-8/i);
    });
});

describe("ProviderCloudSyncTransport.readManifest decoding", () => {
    it("treats invalid UTF-8 manifest content as missing", async () => {
        const provider = createProvider({
            downloadObject: async (key) => {
                if (key === "manifest.json") {
                    return Buffer.from([
                        0xff,
                        0xfe,
                        0xfd,
                    ]);
                }
                return Buffer.from("", "utf8");
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);
        await expect(transport.readManifest()).resolves.toBeNull();
    });
});

describe("ProviderCloudSyncTransport.readSnapshot limits/decoding", () => {
    it("rejects snapshots containing invalid UTF-8", async () => {
        const provider = createProvider({
            downloadObject: async () =>
                Buffer.from([
                    0xff,
                    0xfe,
                    0xfd,
                ]),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readSnapshot(
                `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1.json`
            )
        ).rejects.toThrowError(/invalid utf-8/i);
    });

    it("rejects oversized snapshots", async () => {
        const envKey = "UW_CLOUD_SYNC_MAX_SNAPSHOT_BYTES" as const;
        const original = process.env[envKey];

        process.env[envKey] = "1";

        try {
            const provider = createProvider({
                downloadObject: async () => Buffer.from("{}", "utf8"),
            });

            const transport = ProviderCloudSyncTransport.create(provider);

            await expect(
                transport.readSnapshot(
                    `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1.json`
                )
            ).rejects.toThrowError(/exceeds size limit/i);
        } finally {
            // eslint-disable-next-line require-atomic-updates -- test-only env restore
            process.env[envKey] = original;
        }
    });
});

describe("ProviderCloudSyncTransport.appendOperations key metadata", () => {
    it("uses min/max opIds for key metadata even when operations are out of order", async () => {
        let uploadedKey: string | undefined;

        const provider = createProvider({
            uploadObject: async ({ key }): Promise<CloudObjectEntry> => {
                uploadedKey = key;
                return {
                    key,
                    lastModifiedAt: Date.now(),
                    sizeBytes: 1,
                };
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        const op5: CloudSyncOperation = {
            deviceId: "a",
            entityId: "e",
            entityType: "site",
            field: "x",
            kind: "set-field",
            opId: 5,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: 1,
            value: true,
        };

        const op2: CloudSyncOperation = {
            deviceId: "a",
            entityId: "e",
            entityType: "site",
            field: "y",
            kind: "set-field",
            opId: 2,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: 1,
            value: true,
        };

        await transport.appendOperations("a", [op5, op2], 123);
        expect(uploadedKey).toBe("sync/devices/a/ops/123-2-5.ndjson");
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

    it("accepts snapshot keys with a nonce suffix", async () => {
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
                `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1-0123456789abcdef0123456789abcdef.json`
            )
        ).resolves.toBeTruthy();
    });
});

describe("ProviderCloudSyncTransport.readManifest provider not-found", () => {
    it("treats ENOENT as missing manifest", async () => {
        const provider = createProvider({
            downloadObject: async () => {
                const error = new Error(
                    "Google Drive object not found: manifest.json"
                ) as NodeJS.ErrnoException;
                error.code = "ENOENT";
                throw error;
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(transport.readManifest()).resolves.toBeNull();
    });
});
