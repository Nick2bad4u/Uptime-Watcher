import type { CloudStatusSummary } from "@shared/types/cloud";
import type { CloudEncryptionMode } from "@shared/types/cloudEncryption";

import { ensureError } from "@shared/utils/errorHandling";

import type { CloudStorageProvider } from "../providers/CloudStorageProvider.types";

import { DropboxCloudStorageProvider } from "../providers/dropbox/DropboxCloudStorageProvider";
import { FilesystemCloudStorageProvider } from "../providers/FilesystemCloudStorageProvider";

/**
 * Common, provider-agnostic inputs used by the cloud status builder functions.
 *
 * @remarks
 * The values are sourced by `CloudService` from settings and the configured
 * secret store (for `localEncryptionKey`). Keeping this type centralised keeps
 * all provider summaries consistent.
 */
export type CloudStatusCommonArgs = Readonly<{
    lastBackupAt: null | number;
    lastError: string | undefined;
    lastSyncAt: null | number;
    localEncryptionKey: string | undefined;
    localEncryptionMode: CloudEncryptionMode;
    syncEnabled: boolean;
}>;

/**
 * Dependencies required by cloud status builder functions.
 *
 * @remarks
 * This module stays side-effect free by accepting callbacks rather than owning
 * provider resolution or remote manifest reads.
 */
export type CloudStatusBuilderDependencies = Readonly<{
    getEffectiveEncryptionMode: (
        provider: CloudStorageProvider
    ) => Promise<CloudEncryptionMode>;
    resolveProviderOrNull: () => Promise<CloudStorageProvider | null>;
}>;

function buildLastErrorSpread(lastError: string | undefined): {
    readonly lastError?: string;
} {
    return lastError ? { lastError } : {};
}

type CloudStatusBuildOverrides = Readonly<{
    backupsEnabled: boolean;
    configured: boolean;
    connected: boolean;
    encryptionMode: CloudEncryptionMode;
    lastError?: string;
    provider: CloudStatusSummary["provider"];
    providerDetails?: CloudStatusSummary["providerDetails"];
}>;

const buildCloudStatusSummary = (
    common: CloudStatusCommonArgs,
    overrides: CloudStatusBuildOverrides
): CloudStatusSummary => {
    const encryptionLocked =
        overrides.encryptionMode === "passphrase" && !common.localEncryptionKey;

    const lastError = overrides.lastError ?? common.lastError;

    return {
        backupsEnabled: overrides.backupsEnabled,
        configured: overrides.configured,
        connected: overrides.connected,
        encryptionLocked,
        encryptionMode: overrides.encryptionMode,
        lastBackupAt: common.lastBackupAt,
        ...buildLastErrorSpread(lastError),
        lastSyncAt: common.lastSyncAt,
        provider: overrides.provider,
        ...(overrides.providerDetails
            ? { providerDetails: overrides.providerDetails }
            : {}),
        syncEnabled: common.syncEnabled,
    };
};

/**
 * Builds a {@link CloudStatusSummary} for the Dropbox provider.
 *
 * @remarks
 * This logic intentionally mirrors CloudService's previous in-class
 * implementation to avoid any behavior change.
 */
export async function buildDropboxStatus(args: {
    readonly common: CloudStatusCommonArgs;
    readonly deps: CloudStatusBuilderDependencies;
}): Promise<CloudStatusSummary> {
    const { common, deps } = args;

    const provider = await deps.resolveProviderOrNull();
    let connected = false;
    let connectionError: string | undefined = undefined;
    let accountLabel: string | undefined = undefined;

    if (provider && provider instanceof DropboxCloudStorageProvider) {
        try {
            accountLabel = await provider.getAccountLabel();
            connected = true;
        } catch (error) {
            connected = false;
            connectionError = ensureError(error).message;
        }
    } else if (provider) {
        // Fallback for unexpected provider implementation.
        connected = await provider.isConnected().catch(() => false);
    }

    const encryptionMode =
        connected && provider
            ? await deps.getEffectiveEncryptionMode(provider)
            : common.localEncryptionMode;

    const encryptionLocked =
        encryptionMode === "passphrase" && !common.localEncryptionKey;

    const lastError = common.lastError ?? connectionError;

    return {
        backupsEnabled: connected,
        configured: true,
        connected,
        encryptionLocked,
        encryptionMode,
        lastBackupAt: common.lastBackupAt,
        ...buildLastErrorSpread(lastError),
        lastSyncAt: common.lastSyncAt,
        provider: "dropbox",
        providerDetails: {
            kind: "dropbox",
            ...(accountLabel ? { accountLabel } : {}),
        },
        syncEnabled: common.syncEnabled,
    };
}

/**
 * Builds a {@link CloudStatusSummary} for the Google Drive provider.
 *
 * @remarks
 * The account label is read by CloudService (from settings) and passed in to
 * keep this builder module side-effect free.
 */
export async function buildGoogleDriveStatus(args: {
    readonly accountLabel: string | undefined;
    readonly common: CloudStatusCommonArgs;
    readonly deps: CloudStatusBuilderDependencies;
}): Promise<CloudStatusSummary> {
    const { accountLabel, common, deps } = args;

    const provider = await deps.resolveProviderOrNull();
    const connected = provider
        ? await provider.isConnected().catch(() => false)
        : false;

    const encryptionMode =
        connected && provider
            ? await deps.getEffectiveEncryptionMode(provider)
            : common.localEncryptionMode;

    const encryptionLocked =
        encryptionMode === "passphrase" && !common.localEncryptionKey;

    return {
        backupsEnabled: connected,
        configured: true,
        connected,
        encryptionLocked,
        encryptionMode,
        lastBackupAt: common.lastBackupAt,
        ...buildLastErrorSpread(common.lastError),
        lastSyncAt: common.lastSyncAt,
        provider: "google-drive",
        providerDetails: {
            kind: "google-drive",
            ...(accountLabel ? { accountLabel } : {}),
        },
        syncEnabled: common.syncEnabled,
    };
}

/**
 * Builds a {@link CloudStatusSummary} for the filesystem provider.
 *
 * @remarks
 * This mirrors CloudService's previous behavior exactly, including returning a
 * providerDetails.baseDirectory value even when empty.
 */
export async function buildFilesystemStatus(args: {
    readonly baseDirectory: string;
    readonly common: CloudStatusCommonArgs;
    readonly deps: CloudStatusBuilderDependencies;
}): Promise<CloudStatusSummary> {
    const { baseDirectory, common, deps } = args;

    if (baseDirectory.length === 0) {
        return buildCloudStatusSummary(common, {
            backupsEnabled: false,
            configured: false,
            connected: false,
            encryptionMode: common.localEncryptionMode,
            provider: "filesystem",
            providerDetails: {
                baseDirectory,
                kind: "filesystem",
            },
        });
    }

    const provider = new FilesystemCloudStorageProvider({ baseDirectory });
    const connected = await provider.isConnected().catch(() => false);

    const encryptionMode = connected
        ? await deps.getEffectiveEncryptionMode(provider)
        : common.localEncryptionMode;

    return buildCloudStatusSummary(common, {
        backupsEnabled: connected,
        configured: true,
        connected,
        encryptionMode,
        provider: "filesystem",
        providerDetails: {
            baseDirectory,
            kind: "filesystem",
        },
    });
}

/**
 * Builds a {@link CloudStatusSummary} when no provider has been configured.
 */
export function buildUnconfiguredStatus(
    common: CloudStatusCommonArgs
): CloudStatusSummary {
    return buildCloudStatusSummary(common, {
        backupsEnabled: false,
        configured: false,
        connected: false,
        encryptionMode: common.localEncryptionMode,
        provider: null,
    });
}

/**
 * Builds a {@link CloudStatusSummary} when the stored provider kind is not
 * supported by the current app build.
 */
export function buildUnsupportedProviderStatus(
    common: CloudStatusCommonArgs
): CloudStatusSummary {
    return buildCloudStatusSummary(common, {
        backupsEnabled: false,
        configured: true,
        connected: false,
        encryptionMode: common.localEncryptionMode,
        provider: null,
    });
}
