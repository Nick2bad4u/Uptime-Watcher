import {
    CLOUD_SYNC_SCHEMA_VERSION,
    type CloudSyncOperation,
    parseCloudSyncOperation,
} from "@shared/types/cloudSync";
import {
    CLOUD_SYNC_MANIFEST_VERSION,
    type CloudSyncManifest,
    parseCloudSyncManifest,
} from "@shared/types/cloudSyncManifest";
import {
    CLOUD_SYNC_SNAPSHOT_VERSION,
    type CloudSyncSnapshot,
    parseCloudSyncSnapshot,
} from "@shared/types/cloudSyncSnapshot";
import { isRecord } from "@shared/utils/typeHelpers";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "../cloud/providers/CloudStorageProvider.types";
import type { CloudSyncTransport } from "./CloudSyncTransport.types";

const MANIFEST_KEY = "manifest.json" as const;
const OPS_PREFIX = "sync/devices" as const;

function getSnapshotsPrefix(): string {
    return `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}`;
}

function encodeUtf8(value: string): Buffer {
    return Buffer.from(value, "utf8");
}

function decodeUtf8(buffer: Buffer): string {
    return buffer.toString("utf8");
}

function toNdjson(operations: readonly CloudSyncOperation[]): string {
    return `${operations.map((op) => JSON.stringify(op)).join("\n")}\n`;
}

function parseNdjsonOperations(raw: string): CloudSyncOperation[] {
    const lines = raw
        .split(/\r?\n/v)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    return lines.map((line) => parseCloudSyncOperation(JSON.parse(line)));
}

function createEmptyManifest(): CloudSyncManifest {
    return {
        devices: {},
        lastCompactionAt: undefined,
        latestSnapshotKey: undefined,
        manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
    };
}

function createSnapshotKey(createdAt: number): string {
    return `${getSnapshotsPrefix()}/${createdAt}.json`;
}

function createOpsKey(
    deviceId: string,
    createdAt: number,
    firstOpId: number,
    lastOpId: number
): string {
    return `${OPS_PREFIX}/${deviceId}/ops/${createdAt}-${firstOpId}-${lastOpId}.ndjson`;
}

/**
 * Provider-backed transport that stores sync artifacts as plain objects.
 */
export class ProviderCloudSyncTransport implements CloudSyncTransport {
    private readonly provider: CloudStorageProvider;

    public static create(
        provider: CloudStorageProvider
    ): ProviderCloudSyncTransport {
        return new ProviderCloudSyncTransport(provider);
    }

    public static createEmptyManifest(): CloudSyncManifest {
        return createEmptyManifest();
    }

    public static createSnapshot(
        createdAt: number,
        state: CloudSyncSnapshot["state"]
    ): CloudSyncSnapshot {
        return {
            createdAt,
            snapshotVersion: CLOUD_SYNC_SNAPSHOT_VERSION,
            state,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        };
    }

    public async appendOperations(
        deviceId: string,
        operations: readonly CloudSyncOperation[]
    ): Promise<CloudObjectEntry> {
        if (operations.length === 0) {
            throw new Error("appendOperations requires at least one operation");
        }

        const createdAt = Date.now();
        const firstOpId = operations[0]?.opId ?? 0;
        const lastOpId = operations.at(-1)?.opId ?? firstOpId;

        return this.provider.uploadObject({
            buffer: encodeUtf8(toNdjson(operations)),
            key: createOpsKey(deviceId, createdAt, firstOpId, lastOpId),
            overwrite: false,
        });
    }

    public async deleteObject(key: string): Promise<void> {
        await this.provider.deleteObject(key);
    }

    public async listOperationObjects(): Promise<CloudObjectEntry[]> {
        const objects = await this.provider.listObjects(`${OPS_PREFIX}/`);
        return objects.filter((entry) => entry.key.endsWith(".ndjson"));
    }

    public async readManifest(): Promise<CloudSyncManifest | null> {
        try {
            const raw = decodeUtf8(
                await this.provider.downloadObject(MANIFEST_KEY)
            );
            return parseCloudSyncManifest(JSON.parse(raw));
        } catch (error) {
            if (isRecord(error) && error["code"] === "ENOENT") {
                return null;
            }

            throw error;
        }
    }

    public async readOperationsObject(
        key: string
    ): Promise<CloudSyncOperation[]> {
        const raw = decodeUtf8(await this.provider.downloadObject(key));
        return parseNdjsonOperations(raw);
    }

    public async readSnapshot(key: string): Promise<CloudSyncSnapshot> {
        const raw = decodeUtf8(await this.provider.downloadObject(key));
        return parseCloudSyncSnapshot(JSON.parse(raw));
    }

    public async writeManifest(manifest: CloudSyncManifest): Promise<void> {
        const json = JSON.stringify(manifest, null, 2);
        await this.provider.uploadObject({
            buffer: encodeUtf8(json),
            key: MANIFEST_KEY,
            overwrite: true,
        });
    }

    public async writeSnapshot(
        snapshot: CloudSyncSnapshot
    ): Promise<CloudObjectEntry> {
        const json = JSON.stringify(snapshot, null, 2);
        return this.provider.uploadObject({
            buffer: encodeUtf8(json),
            key: createSnapshotKey(snapshot.createdAt),
            overwrite: true,
        });
    }

    public constructor(provider: CloudStorageProvider) {
        this.provider = provider;
    }
}
