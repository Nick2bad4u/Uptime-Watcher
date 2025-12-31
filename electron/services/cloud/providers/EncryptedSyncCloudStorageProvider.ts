import type { CloudBackupEntry, CloudProviderKind } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "./CloudStorageProvider.types";

import {
    decryptBuffer,
    encryptBuffer,
    isEncryptedPayload,
} from "../crypto/cloudCrypto";
import { CloudProviderOperationError } from "./cloudProviderErrors";

const SYNC_PREFIX = "sync/" as const;
const MANIFEST_KEY = "manifest.json" as const;

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
        try {
            const buffer = await this.inner.downloadObject(key);

            if (!shouldEncryptSyncObject(key)) {
                return buffer;
            }

            if (!isEncryptedPayload(buffer)) {
                throw new CloudProviderOperationError(
                    "Refusing to read unencrypted sync object",
                    {
                        operation: "downloadObject",
                        providerKind: this.kind,
                        target: key,
                    }
                );
            }

            return decryptBuffer({ ciphertext: buffer, key: this.key });
        } catch (error) {
            if (error instanceof CloudProviderOperationError) {
                throw error;
            }

            const code = tryGetErrorCode(error);
            const normalized = ensureError(error);
            throw new CloudProviderOperationError(
                `Failed to download encrypted sync object '${key}': ${normalized.message}`,
                {
                    cause: error,
                    code,
                    operation: "downloadObject",
                    providerKind: this.kind,
                    target: key,
                }
            );
        }
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
        try {
            if (!shouldEncryptSyncObject(args.key)) {
                return await this.inner.uploadObject(args);
            }

            const encryptedBuffer = encryptBuffer({
                key: this.key,
                plaintext: args.buffer,
            });

            return await this.inner.uploadObject({
                ...args,
                buffer: encryptedBuffer,
            });
        } catch (error) {
            if (error instanceof CloudProviderOperationError) {
                throw error;
            }

            const code = tryGetErrorCode(error);
            const normalized = ensureError(error);
            throw new CloudProviderOperationError(
                `Failed to upload encrypted sync object '${args.key}': ${normalized.message}`,
                {
                    cause: error,
                    code,
                    operation: "uploadObject",
                    providerKind: this.kind,
                    target: args.key,
                }
            );
        }
    }

    public constructor(args: { inner: CloudStorageProvider; key: Buffer }) {
        this.inner = args.inner;
        this.key = args.key;
    }
}
