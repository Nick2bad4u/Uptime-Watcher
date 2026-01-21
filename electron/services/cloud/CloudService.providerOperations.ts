import type {
    CloudFilesystemProviderConfig,
    CloudStatusSummary,
} from "@shared/types/cloud";

import { ensureError } from "@shared/utils/errorHandling";
import {
    MAX_FILESYSTEM_BASE_DIRECTORY_BYTES,
    validateFilesystemBaseDirectoryCandidate,
} from "@shared/validation/filesystemBaseDirectoryValidation";
import { promises as fs } from "node:fs";
import * as path from "node:path";

import type { CloudServiceOperationContext } from "./CloudService.operationContext";

import { logger } from "../../utils/logger";
import {
    SECRET_KEY_ENCRYPTION_DERIVED_KEY,
    SETTINGS_KEY_DROPBOX_TOKENS,
    SETTINGS_KEY_ENCRYPTION_MODE,
    SETTINGS_KEY_ENCRYPTION_SALT,
    SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
    SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
    SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
    SETTINGS_KEY_PROVIDER,
} from "./internal/cloudServiceSettings";
import {
    DEFAULT_GOOGLE_DRIVE_CLIENT_ID,
    resolveGoogleDriveOAuthConfig,
} from "./internal/googleOAuthConfig";

/**
 * Disconnects from the configured provider and clears persisted config.
 */
export async function disconnect(
    ctx: CloudServiceOperationContext
): Promise<CloudStatusSummary> {
    return ctx.runCloudOperation("disconnect", async () => {
        const provider = await ctx.settings.get(SETTINGS_KEY_PROVIDER);

        if (provider === "dropbox") {
            const { DropboxTokenManager } = await ctx.loadDropboxDeps();
            const appKey = ctx.getDropboxAppKey();
            const tokenManager = new DropboxTokenManager({
                appKey,
                secretStore: ctx.secretStore,
                tokenStorageKey: SETTINGS_KEY_DROPBOX_TOKENS,
            });

            await tokenManager.revokeStoredTokens().catch(() => {});
        }

        if (provider === "google-drive") {
            const { GoogleDriveTokenManager } = await ctx.loadGoogleDriveDeps();
            const { clientId, clientSecret } = resolveGoogleDriveOAuthConfig();

            const tokenManager = new GoogleDriveTokenManager({
                clientId,
                ...(clientSecret ? { clientSecret } : {}),
                secretStore: ctx.secretStore,
                storageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
            });

            await tokenManager.revoke().catch(() => {});

            await ctx.settings.set(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL, "");
        }

        // Do not run these in parallel; settings are transaction-backed.
        await ctx.settings.set(SETTINGS_KEY_PROVIDER, "");
        await ctx.settings.set(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY, "");
        await ctx.settings.set(SETTINGS_KEY_ENCRYPTION_MODE, "");
        await ctx.settings.set(SETTINGS_KEY_ENCRYPTION_SALT, "");

        await ctx.secretStore.deleteSecret(SETTINGS_KEY_DROPBOX_TOKENS);
        await ctx.secretStore.deleteSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS);
        await ctx.secretStore.deleteSecret(SECRET_KEY_ENCRYPTION_DERIVED_KEY);

        logger.info("[CloudService] Disconnected cloud provider");
        return ctx.buildStatusSummary();
    });
}

/**
 * Configures the filesystem provider to use the given base directory.
 */
export async function configureFilesystemProvider(
    ctx: CloudServiceOperationContext,
    config: CloudFilesystemProviderConfig
): Promise<CloudStatusSummary> {
    return ctx.runCloudOperation("configureFilesystemProvider", async () => {
        const issues = validateFilesystemBaseDirectoryCandidate(
            config.baseDirectory,
            { maxBytes: MAX_FILESYSTEM_BASE_DIRECTORY_BYTES }
        );

        if (issues.length > 0) {
            const [issue] = issues;
            if (!issue) {
                throw new Error("Filesystem base directory is invalid");
            }
            const candidate = config.baseDirectory;

            switch (issue.code) {
                case "not-string": {
                    throw new TypeError(
                        "Filesystem base directory must be a string"
                    );
                }
                case "empty": {
                    throw new Error(
                        "Filesystem base directory must not be empty"
                    );
                }
                case "whitespace": {
                    throw new Error(
                        "Filesystem base directory must not have leading or trailing whitespace"
                    );
                }
                case "too-large": {
                    throw new Error(
                        `Filesystem base directory must not exceed ${issue.maxBytes} bytes`
                    );
                }
                case "control-chars": {
                    throw new Error(
                        "Filesystem base directory must not contain control characters"
                    );
                }
                case "null-byte": {
                    throw new Error(
                        "Filesystem base directory must not contain a null byte"
                    );
                }
                case "windows-device-namespace": {
                    throw new Error(
                        String.raw`Filesystem base directory must not use Windows device namespace paths (\\?\ or \\.\)`
                    );
                }
                case "not-absolute": {
                    throw new Error(
                        `Filesystem base directory must be absolute. Received '${candidate}'`
                    );
                }
                default: {
                    throw new Error("Filesystem base directory is invalid");
                }
            }
        }

        const { baseDirectory } = config;
        const resolved = path.resolve(baseDirectory);

        await fs.mkdir(resolved, { recursive: true }); // eslint-disable-line security/detect-non-literal-fs-filename -- Dynamic but validated path supplied by the user.
        const stat = await fs.stat(resolved); // eslint-disable-line security/detect-non-literal-fs-filename -- Dynamic but validated path supplied by the user.
        if (!stat.isDirectory()) {
            throw new Error("Filesystem base directory must be a directory");
        }

        const canonical = await fs.realpath(resolved); // eslint-disable-line security/detect-non-literal-fs-filename -- Dynamic but validated path supplied by the user.

        const canonicalIssues = validateFilesystemBaseDirectoryCandidate(
            canonical,
            { maxBytes: MAX_FILESYSTEM_BASE_DIRECTORY_BYTES }
        );
        if (canonicalIssues.length > 0) {
            throw new Error(
                "Filesystem base directory resolved to an invalid canonical path"
            );
        }

        await ctx.settings.set(SETTINGS_KEY_PROVIDER, "filesystem");
        await ctx.settings.set(
            SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
            canonical
        );

        // Switching to the filesystem provider means OAuth-based providers are
        // no longer configured. Clear any stored OAuth secrets so we don't
        // retain unused credentials on disk.
        await ctx.secretStore.deleteSecret(SETTINGS_KEY_DROPBOX_TOKENS);
        await ctx.secretStore.deleteSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS);
        await ctx.settings.set(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL, "");

        logger.info("[CloudService] Configured filesystem provider", {
            baseDirectory: canonical,
        });

        return ctx.buildStatusSummary();
    });
}

/**
 * Connects the Dropbox provider via system-browser OAuth.
 */
export async function connectDropbox(
    ctx: CloudServiceOperationContext
): Promise<CloudStatusSummary> {
    return ctx.runCloudOperation("connectDropbox", async () => {
        const previousProvider = (await ctx.settings.get(SETTINGS_KEY_PROVIDER)) ?? "";
        const previousFilesystemBaseDirectory =
            (await ctx.settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)) ?? "";
        const previousStoredTokens = await ctx.secretStore.getSecret(
            SETTINGS_KEY_DROPBOX_TOKENS
        );

        const {
            DropboxAuthFlow,
            DropboxCloudStorageProvider,
            DropboxTokenManager,
        } = await ctx.loadDropboxDeps();
        const appKey = ctx.getDropboxAppKey();
        const authFlow = new DropboxAuthFlow({ appKey });
        const tokens = await authFlow.connect();

        const tokenManager = new DropboxTokenManager({
            appKey,
            secretStore: ctx.secretStore,
            tokenStorageKey: SETTINGS_KEY_DROPBOX_TOKENS,
        });

        await tokenManager.storeTokens(tokens);

        // Verify the connection immediately so the UI doesn't end up in a
        // confusing "configured but down" state.
        try {
            const provider = new DropboxCloudStorageProvider({
                tokenManager,
            });
            await provider.getAccountLabel();
        } catch (error) {
            // Roll back any partial state so the user can retry cleanly.
            //
            // @remarks
            // This must restore the previous provider settings rather than
            // blindly clearing them. Otherwise a failed attempt to connect a
            // new provider would disconnect the previously configured one.
            if (previousStoredTokens) {
                await ctx.secretStore.setSecret(
                    SETTINGS_KEY_DROPBOX_TOKENS,
                    previousStoredTokens
                );
            } else {
                await ctx.secretStore.deleteSecret(SETTINGS_KEY_DROPBOX_TOKENS);
            }

            await ctx.settings.set(SETTINGS_KEY_PROVIDER, previousProvider);
            await ctx.settings.set(
                SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
                previousFilesystemBaseDirectory
            );

            const resolved = ensureError(error);
            throw new Error(
                `Dropbox connection verification failed: ${resolved.message}`,
                { cause: error }
            );
        }

        // Commit the provider switch only after the OAuth flow + verification
        // has succeeded.
        await ctx.settings.set(SETTINGS_KEY_PROVIDER, "dropbox");
        await ctx.settings.set(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY, "");

        // Clear Google Drive secrets after a successful provider switch.
        await ctx.secretStore
            .deleteSecret(SETTINGS_KEY_GOOGLE_DRIVE_TOKENS)
            .catch(() => {});
        await ctx.settings.set(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL, "");

        logger.info("[CloudService] Connected Dropbox provider");
        return ctx.buildStatusSummary();
    });
}

/**
 * Connects the Google Drive provider via system-browser OAuth.
 */
export async function connectGoogleDrive(
    ctx: CloudServiceOperationContext
): Promise<CloudStatusSummary> {
    return ctx.runCloudOperation("connectGoogleDrive", async () => {
        const {
            fetchGoogleAccountLabel,
            GoogleDriveAuthFlow,
            GoogleDriveTokenManager,
        } = await ctx.loadGoogleDriveDeps();
        const { clientId, clientSecret } = resolveGoogleDriveOAuthConfig();

        logger.info("[CloudService] Google Drive OAuth config selected", {
            clientIdSource:
                clientId === DEFAULT_GOOGLE_DRIVE_CLIENT_ID ? "default" : "env",
            clientIdSuffix: clientId.slice(-8),
            hasClientSecret: Boolean(clientSecret),
        });

        const authFlow = new GoogleDriveAuthFlow({
            clientId,
            ...(clientSecret ? { clientSecret } : {}),
        });
        const auth = await authFlow.run();

        // Fetch the label before persisting anything so a failure doesn't
        // partially overwrite existing cloud configuration.
        const accountLabel = await fetchGoogleAccountLabel(auth.accessToken);

        const tokenManager = new GoogleDriveTokenManager({
            clientId,
            ...(clientSecret ? { clientSecret } : {}),
            secretStore: ctx.secretStore,
            storageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
        });

        await tokenManager.setTokens({
            accessToken: auth.accessToken,
            expiresAt: auth.expiresAt,
            refreshToken: auth.refreshToken,
            scope: auth.scope,
            tokenType: auth.tokenType,
        });

        await ctx.settings.set(
            SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
            accountLabel ?? ""
        );

        await ctx.settings.set(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY, "");
        await ctx.settings.set(SETTINGS_KEY_PROVIDER, "google-drive");

        // Clear Dropbox secrets after a successful provider switch.
        await ctx.secretStore
            .deleteSecret(SETTINGS_KEY_DROPBOX_TOKENS)
            .catch(() => {});

        logger.info("[CloudService] Connected Google Drive provider");
        return ctx.buildStatusSummary();
    });
}
