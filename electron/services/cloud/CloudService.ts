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
import type { CloudEncryptionMode } from "@shared/types/cloudEncryption";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { SerializedDatabaseRestoreResult } from "@shared/types/ipc";

import { readProcessEnv } from "@shared/utils/environment";
import { ensureError } from "@shared/utils/errorHandling";

import type { UptimeOrchestrator } from "../../UptimeOrchestrator";
import type { CloudSyncEngine } from "../sync/SyncEngine";
import type { CloudServiceOperationContext } from "./CloudService.operationContext";
import type { CloudSettingsAdapter } from "./CloudService.types";
import type { CloudStorageProvider } from "./providers/CloudStorageProvider.types";

import { logger } from "../../utils/logger";
import { ProviderCloudSyncTransport } from "../sync/ProviderCloudSyncTransport";
import {
    deleteBackup as deleteBackupOperation,
    listBackups as listBackupsOperation,
    migrateBackups as migrateBackupsOperation,
    restoreBackup as restoreBackupOperation,
    uploadLatestBackup as uploadLatestBackupOperation,
} from "./CloudService.backupOperations";
import {
    clearEncryptionKey as clearEncryptionKeyOperation,
    setEncryptionPassphrase as setEncryptionPassphraseOperation,
} from "./CloudService.encryptionOperations";
import {
    configureFilesystemProvider as configureFilesystemProviderOperation,
    connectDropbox as connectDropboxOperation,
    connectGoogleDrive as connectGoogleDriveOperation,
    disconnect as disconnectOperation,
} from "./CloudService.providerOperations";
import {
    enableSync as enableSyncOperation,
    previewResetRemoteSyncState as previewResetRemoteSyncStateOperation,
    requestSyncNow as requestSyncNowOperation,
    resetRemoteSyncState as resetRemoteSyncStateOperation,
} from "./CloudService.syncOperations";
import { decryptBuffer } from "./crypto/cloudCrypto";
import {
    type DropboxProviderDeps,
    type GoogleDriveProviderDeps,
    loadDropboxProviderDeps,
    loadGoogleDriveProviderDeps,
} from "./internal/cloudProviderDeps";
import {
    decodeStrictBase64,
    ENCRYPTION_KEY_BYTES,
    parseEncryptionMode,
} from "./internal/cloudServicePrimitives";
import {
    clearLastError,
    DEFAULT_DROPBOX_APP_KEY,
    parseBooleanSetting,
    parseNumberSetting,
    SECRET_KEY_ENCRYPTION_DERIVED_KEY,
    setLastError,
    SETTINGS_KEY_DROPBOX_TOKENS,
    SETTINGS_KEY_ENCRYPTION_MODE,
    SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
    SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
    SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
    SETTINGS_KEY_LAST_BACKUP_AT,
    SETTINGS_KEY_LAST_ERROR,
    SETTINGS_KEY_LAST_SYNC_AT,
    SETTINGS_KEY_PROVIDER,
    SETTINGS_KEY_SYNC_ENABLED,
} from "./internal/cloudServiceSettings";
import {
    buildDropboxStatus,
    buildFilesystemStatus,
    buildGoogleDriveStatus,
    buildUnconfiguredStatus,
    buildUnsupportedProviderStatus,
    type CloudStatusCommonArgs,
} from "./internal/CloudStatusBuilders";
import { resolveCloudProviderOrNull } from "./internal/resolveCloudProviderOrNull";
import { isCloudProviderOperationError } from "./providers/cloudProviderErrors";
import { EncryptedSyncCloudStorageProvider } from "./providers/EncryptedSyncCloudStorageProvider";
import {
    EphemeralSecretStore,
    FallbackSecretStore,
    SafeStorageSecretStore,
    type SecretStore,
} from "./secrets/SecretStore";

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

    private dropboxDepsPromise: Promise<DropboxProviderDeps> | undefined;

    private googleDriveDepsPromise:
        | Promise<GoogleDriveProviderDeps>
        | undefined;

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

            const providerDetails = isCloudProviderOperationError(resolved)
                ? {
                      code: resolved.code,
                      operation: resolved.operation,
                      providerKind: resolved.providerKind,
                      target: resolved.target,
                  }
                : undefined;

            logger.warn(`[CloudService] Operation '${operationName}' failed`, {
                message: resolved.message,
                name: resolved.name,
                ...(providerDetails ? { providerDetails } : {}),
            });
            throw resolved;
        }
    }

    /** Disconnects from the configured provider and clears persisted config. */
    public async disconnect(): Promise<CloudStatusSummary> {
        return disconnectOperation(this.createOperationContext());
    }

    /** Enables or disables multi-device sync (when supported). */
    public async enableSync(
        config: CloudEnableSyncConfig
    ): Promise<CloudStatusSummary> {
        return enableSyncOperation(this.createOperationContext(), config);
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
        return setEncryptionPassphraseOperation(
            this.createOperationContext(),
            passphrase
        );
    }

    /**
     * Clears the locally cached derived encryption key.
     *
     * @remarks
     * This does not disable encryption remotely. It simply forces the user to
     * re-enter the passphrase on this device.
     */
    public async clearEncryptionKey(): Promise<CloudStatusSummary> {
        return clearEncryptionKeyOperation(this.createOperationContext());
    }

    /** Requests a sync cycle as soon as possible. */
    public async requestSyncNow(): Promise<undefined> {
        await requestSyncNowOperation(this.createOperationContext());
        return undefined;
    }

    /**
     * Resets the remote sync history and re-seeds it from this device.
     *
     * @remarks
     * This is a destructive maintenance operation intended for advanced users.
     */
    public async resetRemoteSyncState(): Promise<CloudSyncResetResult> {
        return resetRemoteSyncStateOperation(this.createOperationContext());
    }

    /**
     * Previews a remote sync reset by counting remote `sync/` objects and
     * reading the current manifest.
     */
    public async previewResetRemoteSyncState(): Promise<CloudSyncResetPreview> {
        return previewResetRemoteSyncStateOperation(
            this.createOperationContext()
        );
    }

    /** Configures the filesystem provider to use the given base directory. */
    public async configureFilesystemProvider(
        config: CloudFilesystemProviderConfig
    ): Promise<CloudStatusSummary> {
        return configureFilesystemProviderOperation(
            this.createOperationContext(),
            config
        );
    }

    /**
     * Connects the Dropbox provider via system-browser OAuth.
     */
    public async connectDropbox(): Promise<CloudStatusSummary> {
        return connectDropboxOperation(this.createOperationContext());
    }

    public async connectGoogleDrive(): Promise<CloudStatusSummary> {
        return connectGoogleDriveOperation(this.createOperationContext());
    }

    /** Lists all backups stored in the configured provider. */
    public async listBackups(): Promise<CloudBackupEntry[]> {
        return listBackupsOperation(this.createOperationContext());
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
        return migrateBackupsOperation(this.createOperationContext(), request);
    }

    /** Creates a fresh SQLite backup and uploads it to the configured provider. */
    public async uploadLatestBackup(): Promise<CloudBackupEntry> {
        return uploadLatestBackupOperation(this.createOperationContext());
    }

    /** Downloads the specified backup from the provider and restores it. */
    public async restoreBackup(
        key: string
    ): Promise<SerializedDatabaseRestoreResult> {
        return restoreBackupOperation(this.createOperationContext(), key);
    }

    /** Deletes the specified remote backup and its metadata sidecar. */
    public async deleteBackup(key: string): Promise<CloudBackupEntry[]> {
        return deleteBackupOperation(this.createOperationContext(), key);
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

        const key = await this.loadDerivedEncryptionKeyOrClear(rawKey);

        if (!key) {
            if (args?.requireEncryptionUnlocked ?? true) {
                throw new Error(
                    "Cloud encryption is enabled but locked on this device"
                );
            }

            return provider;
        }

        return new EncryptedSyncCloudStorageProvider({
            inner: provider,
            key,
        });
    }

    /**
     * Decodes a derived encryption key and clears the stored secret when it is
     * corrupted.
     */
    private async loadDerivedEncryptionKeyOrClear(
        rawKeyBase64: string
    ): Promise<Buffer | undefined> {
        try {
            return decodeStrictBase64({
                expectedBytes: ENCRYPTION_KEY_BYTES,
                label: "encryption key",
                value: rawKeyBase64,
            });
        } catch {
            await this.secretStore
                .deleteSecret(SECRET_KEY_ENCRYPTION_DERIVED_KEY)
                .catch(() => {});
            return undefined;
        }
    }

    private async resolveProviderOrNull(): Promise<CloudStorageProvider | null> {
        return resolveCloudProviderOrNull({
            getDropboxAppKey: () => this.getDropboxAppKey(),
            keys: {
                dropboxTokens: SETTINGS_KEY_DROPBOX_TOKENS,
                filesystemBaseDirectory: SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
                googleDriveTokens: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
                provider: SETTINGS_KEY_PROVIDER,
            },
            secretStore: this.secretStore,
            settings: this.settings,
        });
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

        if (!raw) {
            return { encrypted: true, key: undefined };
        }

        const key = await this.loadDerivedEncryptionKeyOrClear(raw);

        return {
            encrypted: true,
            key,
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

        const key = await this.loadDerivedEncryptionKeyOrClear(raw);
        if (!key) {
            throw new Error(
                "Cloud encryption is enabled but locked on this device"
            );
        }

        return key;
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
            const transport = ProviderCloudSyncTransport.create(provider);
            const manifest = await transport.readManifest();
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
        const localEncryptionKeyRaw = await this.secretStore.getSecret(
            SECRET_KEY_ENCRYPTION_DERIVED_KEY
        );

        let hasLocalEncryptionKey = false;
        if (typeof localEncryptionKeyRaw === "string") {
            const candidateKey = await this.loadDerivedEncryptionKeyOrClear(
                localEncryptionKeyRaw
            );
            hasLocalEncryptionKey = candidateKey !== undefined;
            candidateKey?.fill(0);
        }

        const common: CloudStatusCommonArgs = {
            hasLocalEncryptionKey,
            lastBackupAt,
            lastError,
            lastSyncAt,
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

    private async loadDropboxDeps(): Promise<DropboxProviderDeps> {
        this.dropboxDepsPromise ??= loadDropboxProviderDeps();
        return this.dropboxDepsPromise;
    }

    private async loadGoogleDriveDeps(): Promise<GoogleDriveProviderDeps> {
        this.googleDriveDepsPromise ??= loadGoogleDriveProviderDeps();
        return this.googleDriveDepsPromise;
    }

    /**
     * Builds the internal operation context used by split-out operation
     * modules.
     */
    private createOperationContext(): CloudServiceOperationContext {
        return {
            buildStatusSummary: () => this.buildStatusSummary(),
            decryptBackupOrThrow: (buffer) => this.decryptBackupOrThrow(buffer),
            getDropboxAppKey: () => this.getDropboxAppKey(),
            getEncryptionKeyMaybe: () => this.getEncryptionKeyMaybe(),
            getEncryptionKeyOrThrow: () => this.getEncryptionKeyOrThrow(),
            loadDropboxDeps: () => this.loadDropboxDeps(),
            loadGoogleDriveDeps: () => this.loadGoogleDriveDeps(),
            orchestrator: this.orchestrator,
            resolveProviderOrThrow: (args) => this.resolveProviderOrThrow(args),
            runCloudOperation: (operationName, operation) =>
                this.runCloudOperation(operationName, operation),
            secretStore: this.secretStore,
            settings: this.settings,
            syncEngine: this.syncEngine,
        };
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

            // SafeStorage can be unavailable (or become unavailable) on some
            // systems (e.g., missing/locked keyring). Always wrap with an
            // in-memory fallback so cloud operations can remain usable even if
            // secrets cannot be persisted.
            this.secretStore = new FallbackSecretStore({
                fallback: new EphemeralSecretStore(),
                primary: persistent,
            });
        }
    }
}
