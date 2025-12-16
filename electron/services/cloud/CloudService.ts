import type {
    CloudBackupEntry,
    CloudEnableSyncConfig,
    CloudFilesystemProviderConfig,
    CloudStatusSummary,
} from "@shared/types/cloud";
import type {
    CloudBackupMigrationRequest,
    CloudBackupMigrationResult,
} from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";
import type { SerializedDatabaseRestoreResult } from "@shared/types/ipc";

import {
    CLOUD_ENCRYPTION_CONFIG_VERSION,
    type CloudEncryptionConfigPassphrase,
    type CloudEncryptionMode,
} from "@shared/types/cloudEncryption";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import {
    CLOUD_SYNC_MANIFEST_VERSION,
    parseCloudSyncManifest,
} from "@shared/types/cloudSyncManifest";
import { ensureError } from "@shared/utils/errorHandling";
import { safeStorage } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { UptimeOrchestrator } from "../../UptimeOrchestrator";
import type {
    DatabaseBackupResult,
    DatabaseRestorePayload,
} from "../database/utils/databaseBackup";
import type { CloudSyncEngine } from "../sync/SyncEngine";
import type { CloudStorageProvider } from "./providers/CloudStorageProvider.types";

import { readProcessEnv } from "../../utils/environment";
import { logger } from "../../utils/logger";
import { ProviderCloudSyncTransport } from "../sync/ProviderCloudSyncTransport";
import {
    createKeyCheckBase64,
    decryptBuffer,
    derivePassphraseKey,
    encryptBuffer,
    generateEncryptionSalt,
    verifyKeyCheckBase64,
} from "./crypto/cloudCrypto";
import {
    buildDropboxStatus,
    buildFilesystemStatus,
    buildGoogleDriveStatus,
    buildUnconfiguredStatus,
    buildUnsupportedProviderStatus,
    type CloudStatusCommonArgs,
} from "./internal/CloudStatusBuilders";
import { migrateProviderBackups } from "./migrations/backupMigration";
import { resetProviderCloudSyncState } from "./migrations/syncReset";
import { buildCloudSyncResetPreview } from "./migrations/syncResetPreview";
import { backupMetadataKeyForBackupKey } from "./providers/CloudBackupMetadataFile";
import { DropboxAuthFlow } from "./providers/dropbox/DropboxAuthFlow";
import { DropboxCloudStorageProvider } from "./providers/dropbox/DropboxCloudStorageProvider";
import { DropboxTokenManager } from "./providers/dropbox/DropboxTokenManager";
import { EncryptedSyncCloudStorageProvider } from "./providers/EncryptedSyncCloudStorageProvider";
import { FilesystemCloudStorageProvider } from "./providers/FilesystemCloudStorageProvider";
import { fetchGoogleAccountLabel } from "./providers/googleDrive/fetchGoogleAccountLabel";
import { GoogleDriveAuthFlow } from "./providers/googleDrive/GoogleDriveAuthFlow";
import { GoogleDriveCloudStorageProvider } from "./providers/googleDrive/GoogleDriveCloudStorageProvider";
import { GoogleDriveTokenManager } from "./providers/googleDrive/GoogleDriveTokenManager";
import {
    EphemeralSecretStore,
    FallbackSecretStore,
    SafeStorageSecretStore,
    type SecretStore,
} from "./secrets/SecretStore";

/**
 * Minimal adapter describing how cloud configuration is persisted.
 *
 * @remarks
 * Production uses {@link SettingsRepository}. Tests may supply a fake.
 */
export interface CloudSettingsAdapter {
    get: (key: string) => Promise<string | undefined>;
    set: (key: string, value: string) => Promise<void>;
}

const SETTINGS_KEY_PROVIDER = "cloud.provider" as const;
const SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY =
    "cloud.filesystem.baseDirectory" as const;
const SETTINGS_KEY_DROPBOX_TOKENS = "cloud.dropbox.tokens" as const;
const SETTINGS_KEY_GOOGLE_DRIVE_TOKENS = "cloud.googleDrive.tokens" as const;
const SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL =
    "cloud.googleDrive.accountLabel" as const;

function isENOENT(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: unknown }).code === "ENOENT"
    );
}

async function ignoreENOENT(fn: () => Promise<void>): Promise<void> {
    try {
        await fn();
    } catch (error) {
        if (isENOENT(error)) {
            return;
        }
        throw ensureError(error);
    }
}

/**
 * Default Dropbox OAuth app key (client_id) shipped with the app.
 *
 * @remarks
 * This is **not** a secret. Desktop apps using OAuth + PKCE are public clients
 * and cannot keep an app secret confidential. The app key identifies the
 * Dropbox OAuth application.
 *
 * Developers can override the key for local testing/builds via
 * `UPTIME_WATCHER_DROPBOX_APP_KEY`.
 */
const DEFAULT_DROPBOX_APP_KEY = "c6wroqtgxztzq9t" as const;

const SETTINGS_KEY_LAST_BACKUP_AT = "cloud.lastBackupAt" as const;
const SETTINGS_KEY_LAST_SYNC_AT = "cloud.lastSyncAt" as const;
const SETTINGS_KEY_LAST_ERROR = "cloud.lastError" as const;
const SETTINGS_KEY_SYNC_ENABLED = "cloud.syncEnabled" as const;

const SETTINGS_KEY_ENCRYPTION_MODE = "cloud.encryption.mode" as const;
const SETTINGS_KEY_ENCRYPTION_SALT = "cloud.encryption.salt" as const;

const SECRET_KEY_ENCRYPTION_DERIVED_KEY = "cloud.encryption.key.v1" as const;

const MANIFEST_KEY = "manifest.json" as const;

function parseEncryptionMode(value: string | undefined): CloudEncryptionMode {
    return value === "passphrase" ? "passphrase" : "none";
}

function encodeBase64(buffer: Buffer): string {
    return buffer.toString("base64");
}

function decodeBase64(value: string): Buffer {
    return Buffer.from(value, "base64");
}

function determineBackupMigrationNeedsEncryptionKey(
    request: CloudBackupMigrationRequest,
    backups: readonly CloudBackupEntry[]
): boolean {
    if (request.target === "encrypted") {
        return true;
    }

    return backups.some((entry) => entry.encrypted);
}

async function setLastError(
    settings: CloudSettingsAdapter,
    message: string
): Promise<void> {
    await settings.set(SETTINGS_KEY_LAST_ERROR, message);
}

async function clearLastError(settings: CloudSettingsAdapter): Promise<void> {
    await settings.set(SETTINGS_KEY_LAST_ERROR, "");
}

function serializeBackupMetadata(
    metadata: DatabaseBackupResult["metadata"]
): SerializedDatabaseBackupMetadata {
    return {
        appVersion: metadata.appVersion,
        checksum: metadata.checksum,
        createdAt: metadata.createdAt,
        originalPath: metadata.originalPath,
        retentionHintDays: metadata.retentionHintDays,
        schemaVersion: metadata.schemaVersion,
        sizeBytes: metadata.sizeBytes,
    };
}

function parseBooleanSetting(value: string | undefined): boolean {
    return value === "true";
}

function parseNumberSetting(value: string | undefined): null | number {
    if (value === undefined) {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Coordinates cloud provider configuration and remote backup operations.
 *
 * @remarks
 * This service supports multiple provider backends:
 *
 * - **Dropbox** (OAuth 2.0 Authorization Code + PKCE, loopback redirect)
 * - **Filesystem** (user-selected base directory; useful for development or
 *   delegating sync to a third-party sync client)
 *
 * Provider OAuth tokens and other secrets are stored via the {@link SecretStore}
 * abstraction and must never be exposed to the renderer.
 */
export class CloudService {
    private readonly orchestrator: UptimeOrchestrator;

    private readonly settings: CloudSettingsAdapter;

    private readonly syncEngine: CloudSyncEngine;

    private readonly secretStore: SecretStore;

    private async runCloudOperation<T>(
        operationName: string,
        operation: () => Promise<T>
    ): Promise<T> {
        await clearLastError(this.settings);

        try {
            return await operation();
        } catch (error: unknown) {
            const resolved = ensureError(error);
            await setLastError(this.settings, resolved.message);
            logger.warn(`[CloudService] Operation '${operationName}' failed`, {
                message: resolved.message,
                name: resolved.name,
            });
            throw resolved;
        }
    }

    /** Disconnects from the configured provider and clears persisted config. */
    public async disconnect(): Promise<CloudStatusSummary> {
        return this.runCloudOperation("disconnect", async () => {
            const provider = await this.settings.get(SETTINGS_KEY_PROVIDER);

            if (provider === "dropbox") {
                const appKey = this.getDropboxAppKey();
                const tokenManager = new DropboxTokenManager({
                    appKey,
                    secretStore: this.secretStore,
                    tokenStorageKey: SETTINGS_KEY_DROPBOX_TOKENS,
                });

                await tokenManager.revokeStoredTokens().catch(() => {});
            }

            if (provider === "google-drive") {
                const clientId = readProcessEnv(
                    "UPTIME_WATCHER_GOOGLE_CLIENT_ID"
                );
                const clientSecret = readProcessEnv(
                    "UPTIME_WATCHER_GOOGLE_CLIENT_SECRET"
                );

                if (clientId) {
                    const tokenManager = new GoogleDriveTokenManager({
                        clientId,
                        ...(clientSecret ? { clientSecret } : {}),
                        secretStore: this.secretStore,
                        storageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
                    });

                    await tokenManager.revoke().catch(() => {});
                }

                await this.settings.set(
                    SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
                    ""
                );
            }

            // NOTE: Do not run these in parallel.
            // Some settings adapters are transaction-backed and parallel writes can
            // trigger nested-transaction warnings.
            await this.settings.set(SETTINGS_KEY_PROVIDER, "");
            await this.settings.set(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY, "");
            await this.secretStore.deleteSecret(SETTINGS_KEY_DROPBOX_TOKENS);
            await this.secretStore.deleteSecret(
                SETTINGS_KEY_GOOGLE_DRIVE_TOKENS
            );

            logger.info("[CloudService] Disconnected cloud provider");
            return this.buildStatusSummary();
        });
    }

    /** Enables or disables multi-device sync (when supported). */
    public async enableSync(
        config: CloudEnableSyncConfig
    ): Promise<CloudStatusSummary> {
        return this.runCloudOperation("enableSync", async () => {
            await this.settings.set(
                SETTINGS_KEY_SYNC_ENABLED,
                config.enabled ? "true" : "false"
            );

            logger.info("[CloudService] Updated sync enabled flag", {
                enabled: config.enabled,
            });

            return this.buildStatusSummary();
        });
    }

    /** Returns the current cloud configuration state. */
    public async getStatus(): Promise<CloudStatusSummary> {
        return this.buildStatusSummary();
    }

    /**
     * Enables or unlocks passphrase-based encryption.
     *
     * @remarks
     * - Does **not** upload the passphrase anywhere.
     * - Stores the derived key in {@link SecretStore} so the user is not prompted
     *   every run.
     */
    public async setEncryptionPassphrase(
        passphrase: string
    ): Promise<CloudStatusSummary> {
        return this.runCloudOperation("setEncryptionPassphrase", async () => {
            if (
                typeof passphrase !== "string" ||
                passphrase.trim().length < 8
            ) {
                throw new Error(
                    "Passphrase must be at least 8 characters (after trimming)"
                );
            }

            const provider = await this.resolveProviderOrThrow({
                requireEncryptionUnlocked: false,
            });

            const manifest = await this.readRemoteManifest(provider);
            const remoteEncryption = manifest?.encryption;

            if (remoteEncryption?.mode === "passphrase") {
                const salt = decodeBase64(remoteEncryption.saltBase64);
                const key = await derivePassphraseKey({ passphrase, salt });

                const valid = verifyKeyCheckBase64({
                    key,
                    keyCheckBase64: remoteEncryption.keyCheckBase64,
                });

                if (!valid) {
                    throw new Error("Incorrect encryption passphrase");
                }

                await Promise.all([
                    this.settings.set(
                        SETTINGS_KEY_ENCRYPTION_MODE,
                        "passphrase"
                    ),
                    this.settings.set(
                        SETTINGS_KEY_ENCRYPTION_SALT,
                        remoteEncryption.saltBase64
                    ),
                    this.secretStore.setSecret(
                        SECRET_KEY_ENCRYPTION_DERIVED_KEY,
                        encodeBase64(key)
                    ),
                ]);

                return this.buildStatusSummary();
            }

            const salt = generateEncryptionSalt();
            const key = await derivePassphraseKey({ passphrase, salt });
            const encryptionConfig: CloudEncryptionConfigPassphrase = {
                configVersion: CLOUD_ENCRYPTION_CONFIG_VERSION,
                kdf: "scrypt",
                keyCheckBase64: createKeyCheckBase64(key),
                mode: "passphrase",
                saltBase64: encodeBase64(salt),
            };

            const nextManifest = {
                ...(manifest ?? {
                    devices: {},
                    manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
                    syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                }),
                encryption: encryptionConfig,
            };

            await provider.uploadObject({
                buffer: Buffer.from(
                    JSON.stringify(nextManifest, null, 2),
                    "utf8"
                ),
                key: MANIFEST_KEY,
                overwrite: true,
            });

            await Promise.all([
                this.settings.set(SETTINGS_KEY_ENCRYPTION_MODE, "passphrase"),
                this.settings.set(
                    SETTINGS_KEY_ENCRYPTION_SALT,
                    encodeBase64(salt)
                ),
                this.secretStore.setSecret(
                    SECRET_KEY_ENCRYPTION_DERIVED_KEY,
                    encodeBase64(key)
                ),
            ]);

            return this.buildStatusSummary();
        });
    }

    /**
     * Clears the locally cached derived encryption key.
     *
     * @remarks
     * This does not disable encryption remotely. It simply forces the user to
     * re-enter the passphrase on this device.
     */
    public async clearEncryptionKey(): Promise<CloudStatusSummary> {
        return this.runCloudOperation("clearEncryptionKey", async () => {
            await this.secretStore.deleteSecret(
                SECRET_KEY_ENCRYPTION_DERIVED_KEY
            );
            return this.buildStatusSummary();
        });
    }

    /** Requests a sync cycle as soon as possible. */
    public async requestSyncNow(): Promise<undefined> {
        await this.runCloudOperation("requestSyncNow", async () => {
            const syncEnabled = parseBooleanSetting(
                await this.settings.get(SETTINGS_KEY_SYNC_ENABLED)
            );

            if (!syncEnabled) {
                throw new Error("Cloud sync is disabled");
            }

            const provider = await this.resolveProviderOrThrow();
            await this.syncEngine.syncNow(provider);
            await this.settings.set(
                SETTINGS_KEY_LAST_SYNC_AT,
                String(Date.now())
            );

            logger.info("[CloudService] Sync completed");
        });

        return undefined;
    }

    /**
     * Resets the remote sync history and re-seeds it from this device.
     *
     * @remarks
     * This is a destructive maintenance operation intended for advanced users.
     */
    public async resetRemoteSyncState(): Promise<CloudSyncResetResult> {
        return this.runCloudOperation("resetRemoteSyncState", async () => {
            const syncEnabled = parseBooleanSetting(
                await this.settings.get(SETTINGS_KEY_SYNC_ENABLED)
            );

            if (!syncEnabled) {
                throw new Error("Sync must be enabled to reset remote sync");
            }

            const provider = await this.resolveProviderOrThrow({
                requireEncryptionUnlocked: true,
            });

            return resetProviderCloudSyncState({
                provider,
                syncEngine: this.syncEngine,
            });
        });
    }

    /**
     * Previews a remote sync reset by counting remote `sync/` objects and
     * reading the current manifest.
     */
    public async previewResetRemoteSyncState(): Promise<CloudSyncResetPreview> {
        return this.runCloudOperation(
            "previewResetRemoteSyncState",
            async () => {
                const provider = await this.resolveProviderOrThrow({
                    requireEncryptionUnlocked: false,
                });

                const transport = ProviderCloudSyncTransport.create(provider);
                const manifest =
                    (await transport.readManifest()) ??
                    ProviderCloudSyncTransport.createEmptyManifest();

                const syncObjects = await provider.listObjects("sync/");
                return buildCloudSyncResetPreview({ manifest, syncObjects });
            }
        );
    }

    /** Configures the filesystem provider to use the given base directory. */
    public async configureFilesystemProvider(
        config: CloudFilesystemProviderConfig
    ): Promise<CloudStatusSummary> {
        return this.runCloudOperation(
            "configureFilesystemProvider",
            async () => {
                const resolved = path.resolve(config.baseDirectory);

                if (!path.isAbsolute(resolved)) {
                    throw new Error(
                        `Filesystem base directory must be absolute. Received '${config.baseDirectory}'`
                    );
                }

                await fs.mkdir(resolved, { recursive: true }); // eslint-disable-line security/detect-non-literal-fs-filename -- Dynamic but validated path supplied by the user.
                const stat = await fs.stat(resolved); // eslint-disable-line security/detect-non-literal-fs-filename -- Dynamic but validated path supplied by the user.
                if (!stat.isDirectory()) {
                    throw new Error(
                        "Filesystem base directory must be a directory"
                    );
                }

                await this.settings.set(SETTINGS_KEY_PROVIDER, "filesystem");
                await this.settings.set(
                    SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
                    resolved
                );

                await this.secretStore.deleteSecret(
                    SETTINGS_KEY_DROPBOX_TOKENS
                );

                logger.info("[CloudService] Configured filesystem provider", {
                    baseDirectory: resolved,
                });

                return this.buildStatusSummary();
            }
        );
    }

    /**
     * Connects the Dropbox provider via system-browser OAuth.
     */
    public async connectDropbox(): Promise<CloudStatusSummary> {
        return this.runCloudOperation("connectDropbox", async () => {
            const appKey = this.getDropboxAppKey();
            const authFlow = new DropboxAuthFlow({ appKey });
            const tokens = await authFlow.connect();

            const tokenManager = new DropboxTokenManager({
                appKey,
                secretStore: this.secretStore,
                tokenStorageKey: SETTINGS_KEY_DROPBOX_TOKENS,
            });

            await tokenManager.storeTokens(tokens);
            await this.settings.set(SETTINGS_KEY_PROVIDER, "dropbox");
            await this.settings.set(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY, "");

            // Verify the connection immediately so the UI doesn't end up in a
            // confusing "configured but down" state.
            try {
                const provider = new DropboxCloudStorageProvider({
                    tokenManager,
                });
                await provider.getAccountLabel();
            } catch (error) {
                // Roll back any partial config so the user can retry cleanly.
                await this.settings.set(SETTINGS_KEY_PROVIDER, "");
                await this.settings.set(
                    SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
                    ""
                );
                await this.secretStore.deleteSecret(
                    SETTINGS_KEY_DROPBOX_TOKENS
                );

                const resolved = ensureError(error);
                throw new Error(
                    `Dropbox connection verification failed: ${resolved.message}`,
                    { cause: error }
                );
            }

            logger.info("[CloudService] Connected Dropbox provider");
            return this.buildStatusSummary();
        });
    }

    public async connectGoogleDrive(): Promise<CloudStatusSummary> {
        return this.runCloudOperation("connectGoogleDrive", async () => {
            const clientId = readProcessEnv("UPTIME_WATCHER_GOOGLE_CLIENT_ID");
            const clientSecret = readProcessEnv(
                "UPTIME_WATCHER_GOOGLE_CLIENT_SECRET"
            );

            if (!clientId) {
                throw new Error("UPTIME_WATCHER_GOOGLE_CLIENT_ID is not set.");
            }

            const tokenManager = new GoogleDriveTokenManager({
                clientId,
                ...(clientSecret ? { clientSecret } : {}),
                secretStore: this.secretStore,
                storageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
            });

            const authFlow = new GoogleDriveAuthFlow({
                clientId,
                ...(clientSecret ? { clientSecret } : {}),
            });
            const auth = await authFlow.run();

            await tokenManager.setTokens({
                accessToken: auth.accessToken,
                expiresAt: auth.expiresAt,
                refreshToken: auth.refreshToken,
                scope: auth.scope,
                tokenType: auth.tokenType,
            });

            const accountLabel = await fetchGoogleAccountLabel(
                auth.accessToken
            );
            if (accountLabel) {
                await this.settings.set(
                    SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
                    accountLabel
                );
            }

            await this.settings.set(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY, "");
            await this.secretStore.deleteSecret(SETTINGS_KEY_DROPBOX_TOKENS);

            await this.settings.set(SETTINGS_KEY_PROVIDER, "google-drive");

            logger.info("[CloudService] Connected Google Drive provider");
            return this.buildStatusSummary();
        });
    }

    /** Lists all backups stored in the configured provider. */
    public async listBackups(): Promise<CloudBackupEntry[]> {
        return this.runCloudOperation("listBackups", async () => {
            const provider = await this.resolveProviderOrThrow();
            return provider.listBackups();
        });
    }

    /**
     * Migrates remote backups between plaintext and encrypted forms.
     *
     * @remarks
     * This operation only affects `backups/` objects (not `sync/`).
     */
    public async migrateBackups(
        request: CloudBackupMigrationRequest
    ): Promise<CloudBackupMigrationResult> {
        return this.runCloudOperation("migrateBackups", async () => {
            const provider = await this.resolveProviderOrThrow({
                requireEncryptionUnlocked: false,
            });

            const backups = await provider.listBackups();
            const needsKey = determineBackupMigrationNeedsEncryptionKey(
                request,
                backups
            );

            const localEncryptionMode = parseEncryptionMode(
                await this.settings.get(SETTINGS_KEY_ENCRYPTION_MODE)
            );

            if (needsKey && localEncryptionMode !== "passphrase") {
                throw new Error(
                    "Passphrase encryption must be enabled/unlocked on this device to migrate encrypted backups"
                );
            }

            const encryptionKey = needsKey
                ? await this.getEncryptionKeyOrThrow()
                : undefined;

            const result = await migrateProviderBackups({
                encryptionKey,
                provider,
                request,
            });

            if (result.migrated > 0) {
                await this.settings.set(
                    SETTINGS_KEY_LAST_BACKUP_AT,
                    String(Date.now())
                );
            }

            logger.info("[CloudService] Backup migration finished", {
                failures: result.failures.length,
                migrated: result.migrated,
                processed: result.processed,
                target: result.target,
            });

            return result;
        });
    }

    /** Creates a fresh SQLite backup and uploads it to the configured provider. */
    public async uploadLatestBackup(): Promise<CloudBackupEntry> {
        return this.runCloudOperation("uploadLatestBackup", async () => {
            const provider = await this.resolveProviderOrThrow();

            const backup = await this.orchestrator.downloadBackup();
            const metadata = serializeBackupMetadata(backup.metadata);

            const { encrypted, key } = await this.getEncryptionKeyMaybe();
            const shouldEncrypt = encrypted && key !== undefined;
            if (encrypted && !key) {
                throw new Error(
                    "Cloud encryption is enabled but locked on this device"
                );
            }

            const fileName = shouldEncrypt
                ? `uptime-watcher-backup-${metadata.createdAt}.sqlite.enc`
                : `uptime-watcher-backup-${metadata.createdAt}.sqlite`;

            const payloadBuffer = shouldEncrypt
                ? encryptBuffer({ key, plaintext: backup.buffer })
                : backup.buffer;

            const entry = await provider.uploadBackup({
                buffer: payloadBuffer,
                encrypted: shouldEncrypt,
                fileName,
                metadata,
            });

            logger.info("[CloudService] Uploaded backup", {
                createdAt: entry.metadata.createdAt,
                key: entry.key,
            });

            await this.settings.set(
                SETTINGS_KEY_LAST_BACKUP_AT,
                String(Date.now())
            );
            return entry;
        });
    }

    /** Downloads the specified backup from the provider and restores it. */
    public async restoreBackup(
        key: string
    ): Promise<SerializedDatabaseRestoreResult> {
        return this.runCloudOperation("restoreBackup", async () => {
            const provider = await this.resolveProviderOrThrow();
            const downloaded = await provider.downloadBackup(key);

            const buffer = downloaded.entry.encrypted
                ? await this.decryptBackupOrThrow(downloaded.buffer)
                : downloaded.buffer;

            const payload: DatabaseRestorePayload = {
                buffer,
                fileName: downloaded.entry.fileName,
            };

            const summary = await this.orchestrator.restoreBackup(payload);

            return {
                metadata: serializeBackupMetadata(summary.metadata),
                preRestoreFileName: summary.preRestoreFileName,
                restoredAt: summary.restoredAt,
            };
        });
    }

    /** Deletes the specified remote backup and its metadata sidecar. */
    public async deleteBackup(key: string): Promise<CloudBackupEntry[]> {
        return this.runCloudOperation("deleteBackup", async () => {
            const provider = await this.resolveProviderOrThrow();
            const metadataKey = backupMetadataKeyForBackupKey(key);

            await ignoreENOENT(() => provider.deleteObject(key));
            await ignoreENOENT(() => provider.deleteObject(metadataKey));

            return provider.listBackups();
        });
    }

    private async resolveProviderOrThrow(args?: {
        requireEncryptionUnlocked?: boolean;
    }): Promise<CloudStorageProvider> {
        const provider = await this.resolveProviderOrNull();
        if (!provider) {
            throw new Error("Cloud provider is not configured");
        }

        if (!(await provider.isConnected())) {
            throw new Error("Cloud provider is not reachable");
        }

        const encryptionMode = await this.getEffectiveEncryptionMode(provider);
        if (encryptionMode !== "passphrase") {
            return provider;
        }

        const rawKey = await this.secretStore.getSecret(
            SECRET_KEY_ENCRYPTION_DERIVED_KEY
        );

        if (!rawKey) {
            if (args?.requireEncryptionUnlocked ?? true) {
                throw new Error(
                    "Cloud encryption is enabled but locked on this device"
                );
            }

            return provider;
        }

        return new EncryptedSyncCloudStorageProvider({
            inner: provider,
            key: decodeBase64(rawKey),
        });
    }

    private async resolveProviderOrNull(): Promise<CloudStorageProvider | null> {
        const providerKind = await this.settings.get(SETTINGS_KEY_PROVIDER);

        if (providerKind === "filesystem") {
            const baseDirectory = await this.settings.get(
                SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY
            );

            if (!baseDirectory) {
                return null;
            }

            return new FilesystemCloudStorageProvider({ baseDirectory });
        }

        if (providerKind === "dropbox") {
            const appKey = this.getDropboxAppKey();

            const tokenManager = new DropboxTokenManager({
                appKey,
                secretStore: this.secretStore,
                tokenStorageKey: SETTINGS_KEY_DROPBOX_TOKENS,
            });

            const storedTokens = await tokenManager
                .getStoredTokens()
                .catch(() => {});

            if (!storedTokens) {
                return null;
            }

            return new DropboxCloudStorageProvider({ tokenManager });
        }

        if (providerKind === "google-drive") {
            const clientId = readProcessEnv("UPTIME_WATCHER_GOOGLE_CLIENT_ID");
            const clientSecret = readProcessEnv(
                "UPTIME_WATCHER_GOOGLE_CLIENT_SECRET"
            );

            if (!clientId) {
                return null;
            }

            const tokenManager = new GoogleDriveTokenManager({
                clientId,
                ...(clientSecret ? { clientSecret } : {}),
                secretStore: this.secretStore,
                storageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
            });

            const connected = await tokenManager
                .isConnected()
                .catch(() => false);
            if (!connected) {
                return null;
            }

            return new GoogleDriveCloudStorageProvider({
                clientId,
                ...(clientSecret ? { clientSecret } : {}),
                tokenManager,
            });
        }

        return null;
    }

    private async readRemoteManifest(
        provider: CloudStorageProvider
    ): Promise<null | ReturnType<typeof parseCloudSyncManifest>> {
        try {
            const raw = await provider.downloadObject(MANIFEST_KEY);
            const parsed: unknown = JSON.parse(raw.toString("utf8"));
            return parseCloudSyncManifest(parsed);
        } catch (error: unknown) {
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                (error as { code?: unknown }).code === "ENOENT"
            ) {
                return null;
            }

            throw ensureError(error);
        }
    }

    private async getEncryptionKeyMaybe(): Promise<
        | { encrypted: false; key: undefined }
        | { encrypted: true; key: Buffer | undefined }
    > {
        const localMode = parseEncryptionMode(
            await this.settings.get(SETTINGS_KEY_ENCRYPTION_MODE)
        );
        if (localMode !== "passphrase") {
            return { encrypted: false, key: undefined };
        }

        const raw = await this.secretStore.getSecret(
            SECRET_KEY_ENCRYPTION_DERIVED_KEY
        );

        return {
            encrypted: true,
            key: raw ? decodeBase64(raw) : undefined,
        };
    }

    private async getEncryptionKeyOrThrow(): Promise<Buffer> {
        const raw = await this.secretStore.getSecret(
            SECRET_KEY_ENCRYPTION_DERIVED_KEY
        );
        if (!raw) {
            throw new Error(
                "Cloud encryption is enabled but no local key is available"
            );
        }

        return decodeBase64(raw);
    }

    private async decryptBackupOrThrow(buffer: Buffer): Promise<Buffer> {
        const key = await this.getEncryptionKeyOrThrow();
        return decryptBuffer({ ciphertext: buffer, key });
    }

    private async getEffectiveEncryptionMode(
        provider: CloudStorageProvider
    ): Promise<CloudEncryptionMode> {
        const localMode = parseEncryptionMode(
            await this.settings.get(SETTINGS_KEY_ENCRYPTION_MODE)
        );

        try {
            const manifest = await this.readRemoteManifest(provider);
            const remoteMode = manifest?.encryption?.mode;
            return remoteMode === "passphrase" ? "passphrase" : localMode;
        } catch (error) {
            logger.warn("[CloudService] Failed to read remote manifest", {
                message: ensureError(error).message,
            });
            return localMode;
        }
    }

    private async buildStatusSummary(): Promise<CloudStatusSummary> {
        const providerKind = await this.settings.get(SETTINGS_KEY_PROVIDER);
        const syncEnabled = parseBooleanSetting(
            await this.settings.get(SETTINGS_KEY_SYNC_ENABLED)
        );
        const lastBackupAt = parseNumberSetting(
            await this.settings.get(SETTINGS_KEY_LAST_BACKUP_AT)
        );
        const lastSyncAt = parseNumberSetting(
            await this.settings.get(SETTINGS_KEY_LAST_SYNC_AT)
        );
        const lastErrorRaw = await this.settings.get(SETTINGS_KEY_LAST_ERROR);
        const lastError =
            lastErrorRaw && lastErrorRaw.trim().length > 0
                ? lastErrorRaw
                : undefined;

        const localEncryptionMode = parseEncryptionMode(
            await this.settings.get(SETTINGS_KEY_ENCRYPTION_MODE)
        );
        const localEncryptionKey = await this.secretStore.getSecret(
            SECRET_KEY_ENCRYPTION_DERIVED_KEY
        );

        const common: CloudStatusCommonArgs = {
            lastBackupAt,
            lastError,
            lastSyncAt,
            localEncryptionKey,
            localEncryptionMode,
            syncEnabled,
        };

        if (!providerKind) {
            return buildUnconfiguredStatus(common);
        }

        const deps = {
            getEffectiveEncryptionMode: (provider: CloudStorageProvider) =>
                this.getEffectiveEncryptionMode(provider),
            resolveProviderOrNull: () => this.resolveProviderOrNull(),
        } as const;

        switch (providerKind) {
            case "dropbox": {
                return buildDropboxStatus({ common, deps });
            }
            case "filesystem": {
                const baseDirectory =
                    (await this.settings.get(
                        SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY
                    )) ?? "";
                return buildFilesystemStatus({ baseDirectory, common, deps });
            }
            case "google-drive": {
                const accountLabel =
                    (await this.settings.get(
                        SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL
                    )) ?? undefined;
                return buildGoogleDriveStatus({ accountLabel, common, deps });
            }
            default: {
                return buildUnsupportedProviderStatus(common);
            }
        }
    }

    private getDropboxAppKeyOverrideMaybe(): string | undefined {
        const value = readProcessEnv("UPTIME_WATCHER_DROPBOX_APP_KEY");
        return typeof value === "string" && value.trim().length > 0
            ? value.trim()
            : undefined;
    }

    private getDropboxAppKey(): string {
        return this.getDropboxAppKeyOverrideMaybe() ?? DEFAULT_DROPBOX_APP_KEY;
    }

    public constructor(args: {
        orchestrator: UptimeOrchestrator;
        secretStore?: SecretStore;
        settings: CloudSettingsAdapter;
        syncEngine: CloudSyncEngine;
    }) {
        this.orchestrator = args.orchestrator;
        this.settings = args.settings;
        this.syncEngine = args.syncEngine;
        if (args.secretStore) {
            this.secretStore = args.secretStore;
        } else {
            const persistent = new SafeStorageSecretStore({
                settings: args.settings,
            });

            // SafeStorage can be unavailable on some Linux environments without
            // a keyring. Fall back to an in-memory store to keep the app usable
            // (but secrets won't persist across restarts).
            this.secretStore = safeStorage.isEncryptionAvailable()
                ? persistent
                : new FallbackSecretStore({
                      fallback: new EphemeralSecretStore(),
                      primary: persistent,
                  });
        }
    }
}
