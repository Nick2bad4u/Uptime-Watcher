import type { CloudBackupEntry, CloudProviderKind } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "./CloudStorageProvider.types";

import {
    decryptBuffer,
    encryptBuffer,
    isEncryptedPayload,
} from "../crypto/cloudCrypto";

const SYNC_PREFIX = "sync/" as const;
const MANIFEST_KEY = "manifest.json" as const;

function isAsciiDigits(value: string): boolean {
    if (value.length === 0) {
        return false;
    }

    for (const char of value) {
        const codePoint = char.codePointAt(0);
        if (codePoint === undefined || codePoint < 48 || codePoint > 57) {
            return false;
        }
    }

    return true;
}

function parseSyncObjectCreatedAt(key: string): null | number {
    if (key.startsWith("sync/snapshots/")) {
        const segments = key.split("/");
        if (segments.length !== 4) {
            return null;
        }

        const [syncSegment, snapshotsSegment, schemaSegment, fileName] =
            segments;

        if (
            !syncSegment ||
            !snapshotsSegment ||
            !schemaSegment ||
            !fileName ||
            syncSegment !== "sync" ||
            snapshotsSegment !== "snapshots" ||
            schemaSegment.length === 0 ||
            !fileName.endsWith(".json")
        ) {
            return null;
        }

        const stem = fileName.slice(0, -".json".length);
        if (!isAsciiDigits(stem)) {
            return null;
        }

        const createdAt = Number(stem);
        return Number.isSafeInteger(createdAt) && createdAt >= 0
            ? createdAt
            : null;
    }

    if (key.startsWith("sync/devices/")) {
        const segments = key.split("/");
        if (segments.length !== 5) {
            return null;
        }

        const [syncSegment, devicesSegment, deviceId, opsSegment, fileName] =
            segments;

        if (
            !syncSegment ||
            !devicesSegment ||
            !deviceId ||
            !opsSegment ||
            !fileName ||
            syncSegment !== "sync" ||
            devicesSegment !== "devices" ||
            deviceId.length === 0 ||
            opsSegment !== "ops" ||
            !fileName.endsWith(".ndjson")
        ) {
            return null;
        }

        const stem = fileName.slice(0, -".ndjson".length);
        const parts = stem.split("-");
        const [createdAtRaw] = parts;
        if (!createdAtRaw || !isAsciiDigits(createdAtRaw)) {
            return null;
        }

        const createdAt = Number(createdAtRaw);
        return Number.isSafeInteger(createdAt) && createdAt >= 0
            ? createdAt
            : null;
    }

    return null;
}

function shouldEncryptSyncObject(key: string): boolean {
    if (key === MANIFEST_KEY) {
        return false;
    }

    return key.startsWith(SYNC_PREFIX);
}

/**
 * Decorator around a {@link CloudStorageProvider} that encrypts/decrypts sync
 * artifacts under `sync/`.
 */
export class EncryptedSyncCloudStorageProvider implements CloudStorageProvider {
    private readonly inner: CloudStorageProvider;

    private readonly key: Buffer;

    private readonly encryptionEnabledAt: number | undefined;

    public get kind(): CloudProviderKind {
        return this.inner.kind;
    }

    public async deleteObject(key: string): Promise<void> {
        await this.inner.deleteObject(key);
    }

    public async downloadBackup(
        key: string
    ): Promise<{ buffer: Buffer; entry: CloudBackupEntry }> {
        return this.inner.downloadBackup(key);
    }

    public async downloadObject(key: string): Promise<Buffer> {
        const buffer = await this.inner.downloadObject(key);

        if (!shouldEncryptSyncObject(key)) {
            return buffer;
        }

        if (!isEncryptedPayload(buffer)) {
            if (this.encryptionEnabledAt === undefined) {
                return buffer;
            }

            const createdAt = parseSyncObjectCreatedAt(key);
            if (createdAt !== null && createdAt < this.encryptionEnabledAt) {
                return buffer;
            }

            // If encryption is enabled and the object appears "new" (or we
            // cannot determine its creation timestamp), refuse to accept
            // plaintext sync artifacts.
            throw new Error(
                "Refusing to read unencrypted sync object after encryption was enabled"
            );
        }

        return decryptBuffer({ ciphertext: buffer, key: this.key });
    }

    public async isConnected(): Promise<boolean> {
        return this.inner.isConnected();
    }

    public async listBackups(): Promise<CloudBackupEntry[]> {
        return this.inner.listBackups();
    }

    public async listObjects(prefix: string): Promise<CloudObjectEntry[]> {
        return this.inner.listObjects(prefix);
    }

    public async uploadBackup(args: {
        buffer: Buffer;
        encrypted: boolean;
        fileName: string;
        metadata: SerializedDatabaseBackupMetadata;
    }): Promise<CloudBackupEntry> {
        return this.inner.uploadBackup(args);
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry> {
        if (!shouldEncryptSyncObject(args.key)) {
            return this.inner.uploadObject(args);
        }

        const encryptedBuffer = encryptBuffer({
            key: this.key,
            plaintext: args.buffer,
        });

        return this.inner.uploadObject({
            ...args,
            buffer: encryptedBuffer,
        });
    }

    public constructor(args: {
        encryptionEnabledAt?: number | undefined;
        inner: CloudStorageProvider;
        key: Buffer;
    }) {
        this.inner = args.inner;
        this.key = args.key;
        this.encryptionEnabledAt = args.encryptionEnabledAt;
    }
}
