import type { DropboxAuthFlow } from "../providers/dropbox/DropboxAuthFlow";
import type { DropboxCloudStorageProvider } from "../providers/dropbox/DropboxCloudStorageProvider";
import type { DropboxTokenManager } from "../providers/dropbox/DropboxTokenManager";
import type { fetchGoogleAccountLabel } from "../providers/googleDrive/fetchGoogleAccountLabel";
import type { GoogleDriveAuthFlow } from "../providers/googleDrive/GoogleDriveAuthFlow";
import type { GoogleDriveTokenManager } from "../providers/googleDrive/GoogleDriveTokenManager";

/**
 * Lazy-loaded Dropbox provider dependencies.
 */
export type DropboxProviderDeps = Readonly<{
    DropboxAuthFlow: typeof DropboxAuthFlow;
    DropboxCloudStorageProvider: typeof DropboxCloudStorageProvider;
    DropboxTokenManager: typeof DropboxTokenManager;
}>;

/**
 * Lazy-load Dropbox provider dependencies.
 */
export const loadDropboxProviderDeps =
    async (): Promise<DropboxProviderDeps> => {
        const [
            authFlowModule,
            providerModule,
            tokenModule,
        ] = await Promise.all([
            import(
                /* webpackChunkName: "cloudDropboxAuth" */ "../providers/dropbox/DropboxAuthFlow"
            ),
            import(
                /* webpackChunkName: "cloudDropboxProvider" */ "../providers/dropbox/DropboxCloudStorageProvider"
            ),
            import(
                /* webpackChunkName: "cloudDropboxTokens" */ "../providers/dropbox/DropboxTokenManager"
            ),
        ]);

        return {
            DropboxAuthFlow: authFlowModule.DropboxAuthFlow,
            DropboxCloudStorageProvider:
                providerModule.DropboxCloudStorageProvider,
            DropboxTokenManager: tokenModule.DropboxTokenManager,
        };
    };

/**
 * Lazy-loaded Google Drive provider dependencies.
 */
export type GoogleDriveProviderDeps = Readonly<{
    fetchGoogleAccountLabel: typeof fetchGoogleAccountLabel;
    GoogleDriveAuthFlow: typeof GoogleDriveAuthFlow;
    GoogleDriveTokenManager: typeof GoogleDriveTokenManager;
}>;

/**
 * Lazy-load Google Drive provider dependencies.
 */
export const loadGoogleDriveProviderDeps =
    async (): Promise<GoogleDriveProviderDeps> => {
        const [
            authFlowModule,
            tokenModule,
            labelModule,
        ] = await Promise.all([
            import(
                /* webpackChunkName: "cloudGdriveAuth" */ "../providers/googleDrive/GoogleDriveAuthFlow"
            ),
            import(
                /* webpackChunkName: "cloudGdriveTokens" */ "../providers/googleDrive/GoogleDriveTokenManager"
            ),
            import(
                /* webpackChunkName: "cloudGdriveLabel" */ "../providers/googleDrive/fetchGoogleAccountLabel"
            ),
        ]);

        return {
            fetchGoogleAccountLabel: labelModule.fetchGoogleAccountLabel,
            GoogleDriveAuthFlow: authFlowModule.GoogleDriveAuthFlow,
            GoogleDriveTokenManager: tokenModule.GoogleDriveTokenManager,
        };
    };
