import type { CloudBackupEntry, CloudProviderKind } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

/**
 * Metadata describing an object stored in a provider.
 */
export interface CloudObjectEntry {
    /** Provider-relative key (POSIX-style paths). */
    key: string;
    /** Last modified time in epoch milliseconds, when available. */
    lastModifiedAt: number;
    /** Object size in bytes, when available. */
    sizeBytes: number;
}

/**
 * Provider interface for remote object storage.
 *
 * @remarks
 * Implementations are owned by the Electron main process and must perform any
 * network / filesystem IO. Renderers must never receive credentials.
 */
export interface CloudStorageProvider {
    /** Deletes an object by key (no-op if missing). */
    deleteObject: (key: string) => Promise<void>;

    /** Downloads a previously uploaded backup. */
    downloadBackup: (
        key: string
    ) => Promise<{ buffer: Buffer; entry: CloudBackupEntry }>;

    /** Downloads an arbitrary object by key. */
    downloadObject: (key: string) => Promise<Buffer>;

    /** Returns true when the provider can perform operations right now. */
    isConnected: () => Promise<boolean>;

    /** Provider identifier. */
    readonly kind: CloudProviderKind;

    /** Lists all backups currently stored with this provider. */
    listBackups: () => Promise<CloudBackupEntry[]>;

    /**
     * Lists objects under a prefix.
     *
     * @remarks
     * Keys must use POSIX separators (`/`). Implementations must ensure the
     * returned keys are confined to the provider root.
     */
    listObjects: (prefix: string) => Promise<CloudObjectEntry[]>;

    /**
     * Uploads a backup blob and associated metadata.
     *
     * @param args - Upload parameters.
     */
    uploadBackup: (args: {
        buffer: Buffer;
        encrypted: boolean;
        fileName: string;
        metadata: SerializedDatabaseBackupMetadata;
    }) => Promise<CloudBackupEntry>;

    /**
     * Uploads an arbitrary object by key.
     *
     * @remarks
     * `args.key` must be a POSIX-style key relative to provider root.
     */
    uploadObject: (args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }) => Promise<CloudObjectEntry>;
}
