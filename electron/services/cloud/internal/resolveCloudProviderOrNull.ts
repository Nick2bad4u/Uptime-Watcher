/**
 * Cloud provider resolution utilities.
 *
 * @remarks
 * This module contains the logic for mapping persisted settings + local secrets
 * into an instantiated {@link CloudStorageProvider} implementation.
 *
 * It intentionally does **not** perform connectivity checks or encryption
 * wrapping; those concerns are handled by {@link CloudService}.
 */

import type { CloudSettingsAdapter } from "../CloudService.types";
import type { CloudStorageProvider } from "../providers/CloudStorageProvider.types";
import type { SecretStore } from "../secrets/SecretStore";

import { readProcessEnv } from "../../../utils/environment";
import { DropboxCloudStorageProvider } from "../providers/dropbox/DropboxCloudStorageProvider";
import { DropboxTokenManager } from "../providers/dropbox/DropboxTokenManager";
import { FilesystemCloudStorageProvider } from "../providers/FilesystemCloudStorageProvider";
import { GoogleDriveCloudStorageProvider } from "../providers/googleDrive/GoogleDriveCloudStorageProvider";
import { GoogleDriveTokenManager } from "../providers/googleDrive/GoogleDriveTokenManager";

/**
 * Setting keys required to resolve a provider.
 */
export type CloudProviderResolutionKeys = Readonly<{
    dropboxTokens: string;
    filesystemBaseDirectory: string;
    googleDriveTokens: string;
    provider: string;
}>;

/**
 * Resolves the configured cloud provider, returning `null` when not configured
 * or when the required secret material is missing.
 */
export async function resolveCloudProviderOrNull(args: {
    readonly getDropboxAppKey: () => string;
    readonly keys: CloudProviderResolutionKeys;
    readonly secretStore: SecretStore;
    readonly settings: CloudSettingsAdapter;
}): Promise<CloudStorageProvider | null> {
    const { getDropboxAppKey, keys, secretStore, settings } = args;

    const providerKind = (await settings.get(keys.provider)) ?? "";

    switch (providerKind) {
        case "dropbox": {
            const appKey = getDropboxAppKey();

            const tokenManager = new DropboxTokenManager({
                appKey,
                secretStore,
                tokenStorageKey: keys.dropboxTokens,
            });

            const storedTokens = await tokenManager
                .getStoredTokens()
                .catch(() => {});

            if (!storedTokens) {
                return null;
            }

            return new DropboxCloudStorageProvider({ tokenManager });
        }

        case "filesystem": {
            const baseDirectory = await settings.get(
                keys.filesystemBaseDirectory
            );
            if (!baseDirectory) {
                return null;
            }

            return new FilesystemCloudStorageProvider({ baseDirectory });
        }

        case "google-drive": {
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
                secretStore,
                storageKey: keys.googleDriveTokens,
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

        default: {
            return null;
        }
    }
}
