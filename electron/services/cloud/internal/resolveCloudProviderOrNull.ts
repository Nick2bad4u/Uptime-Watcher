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

import { isFilesystemBaseDirectoryValid } from "@shared/validation/filesystemBaseDirectoryValidation";

import type { CloudSettingsAdapter } from "../CloudService.types";
import type { CloudStorageProvider } from "../providers/CloudStorageProvider.types";
import type { SecretStore } from "../secrets/SecretStore";

import { FilesystemCloudStorageProvider } from "../providers/FilesystemCloudStorageProvider";
import { resolveGoogleDriveOAuthConfig } from "./googleOAuthConfig";

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

            const [{ DropboxTokenManager }, { DropboxCloudStorageProvider }] =
                await Promise.all([

                    import(/* webpackChunkName: "cloudDropboxTokens" */ "../providers/dropbox/DropboxTokenManager"),

                    import(/* webpackChunkName: "cloudDropboxProvider" */ "../providers/dropbox/DropboxCloudStorageProvider"),
                ]);

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

            if (!isFilesystemBaseDirectoryValid(baseDirectory)) {
                return null;
            }

            return new FilesystemCloudStorageProvider({ baseDirectory });
        }

        case "google-drive": {
            const { clientId, clientSecret } = resolveGoogleDriveOAuthConfig();

            const [
                { GoogleDriveTokenManager },
                { GoogleDriveCloudStorageProvider },
            ] = await Promise.all([

                import(/* webpackChunkName: "cloudGdriveTokens" */ "../providers/googleDrive/GoogleDriveTokenManager"),

                import(/* webpackChunkName: "cloudGdriveProvider" */ "../providers/googleDrive/GoogleDriveCloudStorageProvider"),
            ]);

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

            return new GoogleDriveCloudStorageProvider({ tokenManager });
        }

        default: {
            return null;
        }
    }
}
