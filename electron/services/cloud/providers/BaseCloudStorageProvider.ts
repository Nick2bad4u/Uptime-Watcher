import type { CloudBackupEntry, CloudProviderKind } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import {
    assertCloudObjectKey,
    normalizeProviderObjectKey,
} from "@shared/utils/cloudKeyNormalization";
import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "./CloudStorageProvider.types";

import {
    downloadBackupWithMetadata,
    uploadBackupWithMetadata,
} from "./cloudBackupIo";
import { listBackupsFromMetadataObjects } from "./cloudBackupListing";
import { CloudProviderOperationError } from "./cloudProviderErrors";

function assertCanonicalBackupObjectKey(
    rawKey: string,
    backupsPrefix: string
): string {
    const normalized = normalizeProviderObjectKey(rawKey);
    assertCloudObjectKey(normalized);

    if (normalized !== rawKey) {
        throw new Error("Backup key must be a canonical provider object key");
    }

    if (!normalized.startsWith(backupsPrefix)) {
        throw new Error(`Backup key must start with '${backupsPrefix}'`);
    }

    if (normalized === backupsPrefix || normalized.endsWith("/")) {
        throw new Error("Backup key must reference a backup object key");
    }

    if (normalized.endsWith(".metadata.json")) {
        throw new Error(
            "Backup key must reference the backup object, not metadata"
        );
    }

    if (normalized.includes(":")) {
        throw new Error("Backup key must not contain drive tokens");
    }

    return normalized;
}

/**
 * Base class implementing the shared backup IO surface for cloud providers.
 *
 * @remarks
 * Multiple {@link CloudStorageProvider} implementations store backups using the
 * same physical layout:
 *
 * - Backup object stored at `backups/<fileName>`
 * - Sidecar metadata stored at `${backupKey}.metadata.json`
 *
 * This base class centralizes the shared `uploadBackup`, `downloadBackup`, and
 * `listBackups` logic so providers don't drift and so we avoid multiple
 * near-identical codepaths.
 */
export abstract class BaseCloudStorageProvider implements Pick<
    CloudStorageProvider,
    | "downloadBackup"
    | "listBackups"
    | "uploadBackup"
> {
    /** Provider kind for error attribution and diagnostics. */
    public abstract readonly kind: CloudProviderKind;

    protected readonly backupsPrefix: string;

    protected constructor(backupsPrefix: string) {
        this.backupsPrefix = backupsPrefix;
    }

    /** Provider-specific primitive: delete a raw object. */
    public abstract deleteObject(key: string): Promise<void>;

    /**
     * Downloads a backup and its metadata sidecar.
     */
    public async downloadBackup(
        key: string
    ): Promise<{ buffer: Buffer; entry: CloudBackupEntry }> {
        try {
            const normalizedKey = assertCanonicalBackupObjectKey(
                key,
                this.backupsPrefix
            );

            return await downloadBackupWithMetadata({
                downloadObject: (downloadKey) =>
                    this.downloadObject(downloadKey),
                key: normalizedKey,
            });
        } catch (error) {
            const code = tryGetErrorCode(error);
            const normalized = ensureError(error);
            throw new CloudProviderOperationError(
                `Failed to download backup '${key}': ${normalized.message}`,
                {
                    cause: error,
                    code,
                    operation: "downloadBackup",
                    providerKind: this.kind,
                    target: key,
                }
            );
        }
    }

    /** Provider-specific primitive: download a raw object buffer. */
    public abstract downloadObject(key: string): Promise<Buffer>;

    /**
     * Lists backups stored under this provider.
     */
    public async listBackups(): Promise<CloudBackupEntry[]> {
        try {
            const objects = await this.listObjects(this.backupsPrefix);

            return await listBackupsFromMetadataObjects({
                downloadObjectBuffer: (key) => this.downloadObject(key),
                objects,
            });
        } catch (error) {
            const code = tryGetErrorCode(error);
            const normalized = ensureError(error);
            throw new CloudProviderOperationError(
                `Failed to list backups: ${normalized.message}`,
                {
                    cause: error,
                    code,
                    operation: "listBackups",
                    providerKind: this.kind,
                    target: this.backupsPrefix,
                }
            );
        }
    }

    /** Provider-specific primitive: list objects for the given prefix. */
    public abstract listObjects(prefix: string): Promise<CloudObjectEntry[]>;

    /**
     * Uploads a backup and its metadata sidecar.
     */
    public async uploadBackup(args: {
        buffer: Buffer;
        encrypted: boolean;
        fileName: string;
        metadata: SerializedDatabaseBackupMetadata;
    }): Promise<CloudBackupEntry> {
        try {
            return await uploadBackupWithMetadata({
                ...args,
                backupsPrefix: this.backupsPrefix,
                deleteObject: (deleteKey) => this.deleteObject(deleteKey),
                uploadObject: (uploadArgs) => this.uploadObject(uploadArgs),
            });
        } catch (error) {
            const code = tryGetErrorCode(error);
            const normalized = ensureError(error);
            throw new CloudProviderOperationError(
                `Failed to upload backup '${args.fileName}': ${normalized.message}`,
                {
                    cause: error,
                    code,
                    operation: "uploadBackup",
                    providerKind: this.kind,
                    target: args.fileName,
                }
            );
        }
    }

    /** Provider-specific primitive: upload a raw object buffer. */
    public abstract uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry>;
}
