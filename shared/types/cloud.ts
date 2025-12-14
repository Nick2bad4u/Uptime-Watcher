/**
 * Shared cloud sync + remote backup types.
 *
 * @remarks
 * These types describe provider configuration and remote backup metadata at a
 * level that is safe to share across the renderer, preload, and Electron main
 * process.
 *
 * The initial implementation supports a filesystem-backed provider (useful for
 * development and for targeting synced folders such as Dropbox/Drive).
 *
 * Provider-specific OAuth tokens and secrets must never appear in this module.
 */

import type { CloudEncryptionMode } from "./cloudEncryption";
import type { SerializedDatabaseBackupMetadata } from "./databaseBackup";

/**
 * Supported cloud provider identifiers.
 *
 * @remarks
 * The app is offline-first. Providers are purely optional.
 */
export const CLOUD_PROVIDER_KIND = {
    DROPBOX: "dropbox",
    FILESYSTEM: "filesystem",
    GOOGLE_DRIVE: "google-drive",
    WEBDAV: "webdav",
} as const;

/** Union of supported cloud provider identifiers. */
export type CloudProviderKind =
    (typeof CLOUD_PROVIDER_KIND)[keyof typeof CLOUD_PROVIDER_KIND];

/**
 * High-level cloud status summary.
 *
 * @remarks
 * Returned by IPC so the renderer can display connection state and backup/sync
 * readiness.
 */
export interface CloudStatusSummary {
    /** True when remote backups can be uploaded. */
    backupsEnabled: boolean;
    /** True when the provider has enough config to perform operations. */
    configured: boolean;
    /** True when the provider is currently reachable/authenticated. */
    connected: boolean;
    /** True when encryption is enabled but this device does not have the key. */
    encryptionLocked: boolean;
    /** Encryption mode for remote artifacts. */
    encryptionMode: CloudEncryptionMode;
    /** Optional last backup timestamp (epoch ms) known to the app. */
    lastBackupAt: null | number;
    /** Optional last error message for UI display. */
    lastError?: string;
    /** Optional last sync timestamp (epoch ms) known to the app. */
    lastSyncAt: null | number;
    /** Configured provider kind, or null when disconnected. */
    provider: CloudProviderKind | null;
    /** Provider-specific configuration hints safe to show in UI. */
    providerDetails?: CloudProviderDetails;
    /** True when multi-device sync is enabled. */
    syncEnabled: boolean;
}

/**
 * Provider-specific details safe to expose to the renderer.
 */
export type CloudProviderDetails =
    | {
          /**
           * Human-readable account identifier (email, display name, etc.).
           *
           * @remarks
           * Optional because providers may not supply one.
           */
          accountLabel?: string;
          kind:
              | typeof CLOUD_PROVIDER_KIND.DROPBOX
              | typeof CLOUD_PROVIDER_KIND.GOOGLE_DRIVE
              | typeof CLOUD_PROVIDER_KIND.WEBDAV;
      }
    | {
          /** Base directory configured by the user. */
          baseDirectory: string;
          kind: typeof CLOUD_PROVIDER_KIND.FILESYSTEM;
      };

/**
 * Entry representing a remote backup artifact stored in a cloud provider.
 */
export interface CloudBackupEntry {
    /** Indicates whether the stored backup is encrypted client-side. */
    encrypted: boolean;
    /** File name presented to the user when downloading/restoring. */
    fileName: string;
    /** Provider key that uniquely identifies the backup object. */
    key: string;
    /** Metadata describing the backup contents. */
    metadata: SerializedDatabaseBackupMetadata;
}

/**
 * Payload used to configure the filesystem provider.
 */
export interface CloudFilesystemProviderConfig {
    /** Absolute path to a directory the app can read/write. */
    baseDirectory: string;
}

/**
 * Payload used to enable or disable multi-device cloud sync.
 */
export interface CloudEnableSyncConfig {
    /** True when sync should be enabled. */
    enabled: boolean;
}
