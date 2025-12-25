import type { CloudBackupEntry } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "./CloudStorageProvider.types";

import {
    downloadBackupWithMetadata,
    uploadBackupWithMetadata,
} from "./cloudBackupIo";
import { listBackupsFromMetadataObjects } from "./cloudBackupListing";

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
    protected readonly backupsPrefix: string;

    /**
     * Lists backups stored under this provider.
     */
    public async listBackups(): Promise<CloudBackupEntry[]> {
        const objects = await this.listObjects(this.backupsPrefix);

        return listBackupsFromMetadataObjects({
            downloadObjectBuffer: (key) => this.downloadObject(key),
            objects,
        });
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
        return uploadBackupWithMetadata({
            ...args,
            backupsPrefix: this.backupsPrefix,
            uploadObject: (uploadArgs) => this.uploadObject(uploadArgs),
        });
    }

    /**
     * Downloads a backup and its metadata sidecar.
     */
    public async downloadBackup(
        key: string
    ): Promise<{ buffer: Buffer; entry: CloudBackupEntry }> {
        return downloadBackupWithMetadata({
            downloadObject: (downloadKey) => this.downloadObject(downloadKey),
            key,
        });
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
