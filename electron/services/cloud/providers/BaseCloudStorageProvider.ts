import type { CloudBackupEntry, CloudProviderKind } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

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
    "downloadBackup" | "listBackups" | "uploadBackup"
> {
    /** Provider kind for error attribution and diagnostics. */
    public abstract readonly kind: CloudProviderKind;

    protected readonly backupsPrefix: string;

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

    /**
     * Downloads a backup and its metadata sidecar.
     */
    public async downloadBackup(
        key: string
    ): Promise<{ buffer: Buffer; entry: CloudBackupEntry }> {
        try {
            return await downloadBackupWithMetadata({
                downloadObject: (downloadKey) =>
                    this.downloadObject(downloadKey),
                key,
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

    protected constructor(backupsPrefix: string) {
        this.backupsPrefix = backupsPrefix;
    }

    /** Provider-specific primitive: list objects for the given prefix. */
    public abstract listObjects(prefix: string): Promise<CloudObjectEntry[]>;

    /** Provider-specific primitive: download a raw object buffer. */
    public abstract downloadObject(key: string): Promise<Buffer>;

    /** Provider-specific primitive: upload a raw object buffer. */
    public abstract uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry>;
}
