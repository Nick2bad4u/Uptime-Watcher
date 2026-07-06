import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "@electron/services/cloud/providers/CloudStorageProvider.types";
import type { CloudProviderKind } from "@shared/types/cloud";
import type {
    CloudSyncOperation,
    CloudSyncSetFieldOperation,
} from "@shared/types/cloudSync";
import type { CloudSyncManifest } from "@shared/types/cloudSyncManifest";
import type { CloudSyncSnapshot } from "@shared/types/cloudSyncSnapshot";

import { ProviderCloudSyncTransport } from "@electron/services/sync/ProviderCloudSyncTransport";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { CLOUD_SYNC_SNAPSHOT_VERSION } from "@shared/types/cloudSyncSnapshot";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
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

function createOperation(
    overrides: Partial<CloudSyncSetFieldOperation> = {}
): CloudSyncSetFieldOperation {
    return {
        deviceId: "a",
        entityId: "e",
        entityType: "site",
        field: "x",
        kind: "set-field",
        opId: 1,
        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        timestamp: 1,
        value: true,
        ...overrides,
    };
}

function createSnapshotBuffer(
    overrides: Partial<CloudSyncSnapshot> = {}
): Buffer {
    return Buffer.from(
        JSON.stringify({
            createdAt: 1,
            snapshotVersion: CLOUD_SYNC_SNAPSHOT_VERSION,
            state: { monitor: {}, settings: {}, site: {} },
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            ...overrides,
        }),
        "utf8"
    );
}

async function withEnvVar<T>(
    key: string,
    value: string,
    callback: () => Promise<T>
): Promise<T> {
    const original = process.env[key];
    process.env[key] = value;

    try {
        return await callback();
    } finally {
        if (original === undefined) {
            Reflect.deleteProperty(process.env, key);
        } else {
            process.env[key] = original;
        }
    }
}

describe("ProviderCloudSyncTransport.readOperationsObject limits", () => {
    it("rejects oversized operation objects", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.alloc(6 * 1024 * 1024, "a"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject("sync/devices/a/ops/1-1-1.ndjson")
        ).rejects.toThrow(/exceeds size limit/i);
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
        ).rejects.toThrow(/exceeds max length/i);
    });

    it("rejects operations keys containing traversal segments", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.from("{}\n", "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readOperationsObject("sync/devices/a/ops/../evil.ndjson")
        ).rejects.toThrow(/invalid/iv);
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
        ).rejects.toThrow(/expected/iv);
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
        ).rejects.toThrow(/backslashes/i);
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
        ).rejects.toThrow(/must not contain|tokens are not allowed/i);
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
        ).rejects.toThrow(/path separators/i);
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
        ).rejects.toThrow(/must not contain ':'/i);
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
        ).rejects.toThrow(/at line 2:/iv);
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
        ).rejects.toThrow(/unexpected deviceid/iv);
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
        ).rejects.toThrow(/opid range is inconsistent/i);
    });

    it("rejects operation objects whose opIds are inside but narrower than the key metadata", async () => {
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
            transport.readOperationsObject("sync/devices/a/ops/1-1-3.ndjson")
        ).rejects.toThrow(/opid range is inconsistent/i);
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
        ).rejects.toThrow(/invalid utf-8/iv);
    });
});

describe("ProviderCloudSyncTransport.appendOperations upload limits", () => {
    it("rejects operation batches that exceed the configured operation count before upload", async () => {
        let uploaded = false;
        const provider = createProvider({
            uploadObject: async (): Promise<CloudObjectEntry> => {
                uploaded = true;
                return {
                    key: "x",
                    lastModifiedAt: Date.now(),
                    sizeBytes: 1,
                };
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await withEnvVar(
            "UW_CLOUD_SYNC_MAX_OPS_OBJECT_LINES",
            "1",
            async () => {
                await expect(
                    transport.appendOperations("a", [
                        createOperation({ opId: 1 }),
                        createOperation({ field: "y", opId: 2 }),
                    ])
                ).rejects.toThrow(/max operation count/i);
            }
        );

        expect(uploaded).toBeFalsy();
    });

    it("rejects operation batches with oversized serialized lines before upload", async () => {
        let uploaded = false;
        const provider = createProvider({
            uploadObject: async (): Promise<CloudObjectEntry> => {
                uploaded = true;
                return {
                    key: "x",
                    lastModifiedAt: Date.now(),
                    sizeBytes: 1,
                };
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await withEnvVar("UW_CLOUD_SYNC_MAX_OPS_LINE_CHARS", "20", async () => {
            await expect(
                transport.appendOperations("a", [createOperation()])
            ).rejects.toThrow(/line exceeds max length/i);
        });

        expect(uploaded).toBeFalsy();
    });

    it("rejects operation batches that exceed the configured byte limit before upload", async () => {
        let uploaded = false;
        const provider = createProvider({
            uploadObject: async (): Promise<CloudObjectEntry> => {
                uploaded = true;
                return {
                    key: "x",
                    lastModifiedAt: Date.now(),
                    sizeBytes: 1,
                };
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await withEnvVar(
            "UW_CLOUD_SYNC_MAX_OPS_OBJECT_BYTES",
            "20",
            async () => {
                await expect(
                    transport.appendOperations("a", [createOperation()])
                ).rejects.toThrow(/exceeds size limit/i);
            }
        );

        expect(uploaded).toBeFalsy();
    });

    it("validates operation payloads before upload", async () => {
        let uploaded = false;
        const provider = createProvider({
            uploadObject: async (): Promise<CloudObjectEntry> => {
                uploaded = true;
                return {
                    key: "x",
                    lastModifiedAt: Date.now(),
                    sizeBytes: 1,
                };
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.appendOperations("a", [createOperation({ entityId: "" })])
        ).rejects.toThrow();

        expect(uploaded).toBeFalsy();
    });
});

describe("ProviderCloudSyncTransport outbound artifact validation", () => {
    it("validates manifests before upload", async () => {
        let uploaded = false;
        const provider = createProvider({
            uploadObject: async (): Promise<CloudObjectEntry> => {
                uploaded = true;
                return {
                    key: "manifest.json",
                    lastModifiedAt: Date.now(),
                    sizeBytes: 1,
                };
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);
        const invalidManifest = {
            devices: {},
            manifestVersion: 999,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        } as unknown as CloudSyncManifest;

        await expect(
            transport.writeManifest(invalidManifest)
        ).rejects.toThrow();

        expect(uploaded).toBeFalsy();
    });

    it("validates snapshots before upload", async () => {
        let uploaded = false;
        const provider = createProvider({
            uploadObject: async (): Promise<CloudObjectEntry> => {
                uploaded = true;
                return {
                    key: "snapshot.json",
                    lastModifiedAt: Date.now(),
                    sizeBytes: 1,
                };
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);
        const invalidSnapshot = {
            createdAt: MAX_VALID_DATE_EPOCH_MS + 1,
            snapshotVersion: CLOUD_SYNC_SNAPSHOT_VERSION,
            state: { monitor: {}, settings: {}, site: {} },
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        } as unknown as CloudSyncSnapshot;

        await expect(
            transport.writeSnapshot(invalidSnapshot)
        ).rejects.toThrow();

        expect(uploaded).toBeFalsy();
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

    it("treats invalid JSON manifest content as missing", async () => {
        const provider = createProvider({
            downloadObject: async (key) => {
                if (key === "manifest.json") {
                    return Buffer.from("{not-json", "utf8");
                }
                return Buffer.from("", "utf8");
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);
        await expect(transport.readManifest()).resolves.toBeNull();
    });

    it("treats manifests with invalid latestSnapshotKey as missing", async () => {
        const provider = createProvider({
            downloadObject: async (key) => {
                if (key === "manifest.json") {
                    return Buffer.from(
                        JSON.stringify({
                            devices: {},
                            latestSnapshotKey: "../evil.json",
                            manifestVersion: 1,
                            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                        }),
                        "utf8"
                    );
                }
                return Buffer.from("", "utf8");
            },
        });

        const transport = ProviderCloudSyncTransport.create(provider);
        await expect(transport.readManifest()).resolves.toBeNull();
    });
});

describe("ProviderCloudSyncTransport.readSnapshot limits/decoding", () => {
    it("rejects snapshots containing invalid JSON as corrupt remote objects", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.from("{not-json", "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readSnapshot(
                `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1.json`
            )
        ).rejects.toMatchObject({
            kind: "snapshot",
            name: "CloudSyncCorruptRemoteObjectError",
        });
    });

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
        ).rejects.toThrow(/invalid utf-8/iv);
    });

    it("rejects oversized snapshots", async () => {
        await withEnvVar("UW_CLOUD_SYNC_MAX_SNAPSHOT_BYTES", "1", async () => {
            const provider = createProvider({
                downloadObject: async () => Buffer.from("{}", "utf8"),
            });

            const transport = ProviderCloudSyncTransport.create(provider);

            await expect(
                transport.readSnapshot(
                    `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1.json`
                )
            ).rejects.toThrow(/exceeds size limit/i);
        });
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

    it("rejects createdAtEpochMs values outside the JavaScript Date range", async () => {
        const provider = createProvider({
            uploadObject: async ({ key }): Promise<CloudObjectEntry> => ({
                key,
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
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: 1,
            value: true,
        };

        await expect(
            transport.appendOperations(
                "a",
                [operation],
                MAX_VALID_DATE_EPOCH_MS + 1
            )
        ).rejects.toThrow(/createdatepochms.*javascript date range/i);
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
        ).rejects.toThrow(/invalid snapshot key/i);
    });

    it("accepts snapshot keys matching schema version", async () => {
        const provider = createProvider({
            downloadObject: async () => createSnapshotBuffer(),
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
            downloadObject: async () => createSnapshotBuffer(),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readSnapshot(
                `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1-0123456789abcdef0123456789abcdef.json`
            )
        ).resolves.toBeTruthy();
    });

    it("rejects snapshots whose payload createdAt does not match a legacy key", async () => {
        const provider = createProvider({
            downloadObject: async () => createSnapshotBuffer({ createdAt: 2 }),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readSnapshot(
                `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1.json`
            )
        ).rejects.toMatchObject({
            kind: "snapshot",
            name: "CloudSyncCorruptRemoteObjectError",
        });
    });

    it("rejects snapshots whose payload createdAt does not match a nonce-suffixed key", async () => {
        const provider = createProvider({
            downloadObject: async () => createSnapshotBuffer({ createdAt: 2 }),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readSnapshot(
                `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1-0123456789abcdef0123456789abcdef.json`
            )
        ).rejects.toThrow(/createdAt is inconsistent with key metadata/u);
    });

    it("rejects snapshot keys outside the JavaScript Date range", async () => {
        const provider = createProvider({
            downloadObject: async () => Buffer.from("{}", "utf8"),
        });

        const transport = ProviderCloudSyncTransport.create(provider);

        await expect(
            transport.readSnapshot(
                `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/${MAX_VALID_DATE_EPOCH_MS + 1}.json`
            )
        ).rejects.toThrow(/invalid snapshot key/i);
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
