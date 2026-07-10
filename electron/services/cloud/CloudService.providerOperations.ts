import type {
    CloudFilesystemProviderConfig,
    CloudStatusSummary,
} from "@shared/types/cloud";

import { ensureError } from "@shared/utils/errorHandling";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import {
    MAX_FILESYSTEM_BASE_DIRECTORY_BYTES,
    validateFilesystemBaseDirectoryCandidate,
} from "@shared/validation/filesystemBaseDirectoryValidation";
import * as path from "node:path";

import type { CloudServiceOperationContext } from "./CloudService.operationContext";

import { ensureDirectoryAndResolveRealPath } from "../../utils/fsSafeOps";
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
import {
    captureProviderConnectionState,
    restoreProviderConnectionState,
} from "./internal/providerConnectionState";
import { deleteProviderSecretsBestEffort } from "./internal/providerSecretCleanup";

function logTokenRevocationFailure(provider: string, error: unknown): void {
    logger.warn("[CloudService] Failed to revoke provider tokens", {
        message: getUserFacingErrorDetail(error),
        provider,
    });
}

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

            await tokenManager.revokeStoredTokens().catch((error: unknown) => {
                logTokenRevocationFailure(provider, error);
            });
        }

        if (provider === "google-drive") {
            const { GoogleDriveTokenManager } = await ctx.loadGoogleDriveDeps();
            const { clientId, clientSecret } = resolveGoogleDriveOAuthConfig();

            const tokenManager = new GoogleDriveTokenManager({
                clientId,
                ...(clientSecret && { clientSecret }),
                secretStore: ctx.secretStore,
                storageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
            });

            await tokenManager.revoke().catch((error: unknown) => {
                logTokenRevocationFailure(provider, error);
            });

            await ctx.settings.set(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL, "");
        }

        // Do not run these in parallel; settings are transaction-backed.
        await ctx.settings.set(SETTINGS_KEY_PROVIDER, "");
        await ctx.settings.set(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY, "");
        await ctx.settings.set(SETTINGS_KEY_ENCRYPTION_MODE, "");
        await ctx.settings.set(SETTINGS_KEY_ENCRYPTION_SALT, "");

        await deleteProviderSecretsBestEffort({
            operationLabel: "disconnect",
            secretKeys: [
                SETTINGS_KEY_DROPBOX_TOKENS,
                SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
                SECRET_KEY_ENCRYPTION_DERIVED_KEY,
            ],
            secretStore: ctx.secretStore,
        });

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
        const canonical = await ensureDirectoryAndResolveRealPath({
            directoryPath: resolved,
            notDirectoryMessage:
                "Filesystem base directory must be a directory",
        });

        const canonicalIssues = validateFilesystemBaseDirectoryCandidate(
            canonical,
            { maxBytes: MAX_FILESYSTEM_BASE_DIRECTORY_BYTES }
        );
        if (canonicalIssues.length > 0) {
            throw new Error(
                "Filesystem base directory resolved to an invalid canonical path"
            );
        }

        const previousProvider =
            (await ctx.settings.get(SETTINGS_KEY_PROVIDER)) ?? "";
        const previousFilesystemBaseDirectory =
            (await ctx.settings.get(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY)) ??
            "";
        const previousGoogleDriveAccountLabel =
            (await ctx.settings.get(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL)) ??
            "";

        let isFilesystemBaseDirectoryCommitted = false;
        let isProviderCommitted = false;
        let isGoogleDriveAccountLabelCommitted = false;

        try {
            await ctx.settings.set(
                SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
                canonical
            );
            isFilesystemBaseDirectoryCommitted = true;
            await ctx.settings.set(SETTINGS_KEY_PROVIDER, "filesystem");
            isProviderCommitted = true;
            await ctx.settings.set(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL, "");
            isGoogleDriveAccountLabelCommitted = true;
        } catch (error: unknown) {
            const persistenceError = ensureError(error);
            const rollbackErrors: Error[] = [];

            if (isProviderCommitted) {
                await ctx.settings
                    .set(SETTINGS_KEY_PROVIDER, previousProvider)
                    .catch((rollbackError: unknown) => {
                        rollbackErrors.push(ensureError(rollbackError));
                    });
            }

            if (isFilesystemBaseDirectoryCommitted) {
                await ctx.settings
                    .set(
                        SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY,
                        previousFilesystemBaseDirectory
                    )
                    .catch((rollbackError: unknown) => {
                        rollbackErrors.push(ensureError(rollbackError));
                    });
            }

            if (isGoogleDriveAccountLabelCommitted) {
                await ctx.settings
                    .set(
                        SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL,
                        previousGoogleDriveAccountLabel
                    )
                    .catch((rollbackError: unknown) => {
                        rollbackErrors.push(ensureError(rollbackError));
                    });
            }

            if (rollbackErrors.length > 0) {
                throw new AggregateError(
                    [persistenceError, ...rollbackErrors],
                    "Filesystem provider configuration failed and previous provider settings could not be restored",
                    { cause: error }
                );
            }

            throw persistenceError;
        }

        // Switching to the filesystem provider means OAuth-based providers are
        // no longer configured. Clear any stored OAuth secrets so we don't
        // retain unused credentials on disk.
        await deleteProviderSecretsBestEffort({
            operationLabel: "configureFilesystemProvider",
            secretKeys: [
                SETTINGS_KEY_DROPBOX_TOKENS,
                SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
            ],
            secretStore: ctx.secretStore,
        });

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
        const previousState = await captureProviderConnectionState({
            ctx,
            includeGoogleDriveAccountLabel: true,
            tokenStorageKey: SETTINGS_KEY_DROPBOX_TOKENS,
        });

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

        let statusSummary: CloudStatusSummary;
        let failurePrefix =
            "Dropbox connect failed while persisting credentials";
        try {
            await tokenManager.storeTokens(tokens);

            // Verify the connection immediately so the UI doesn't end up in a
            // confusing "configured but down" state.
            failurePrefix = "Dropbox connection verification failed";
            const provider = new DropboxCloudStorageProvider({
                tokenManager,
            });
            await provider.getAccountLabel();

            // Commit the provider switch only after the OAuth flow and
            // verification have succeeded. Keep the provider write last so
            // readers cannot observe a half-configured Dropbox provider.
            failurePrefix =
                "Dropbox connect failed while persisting configuration";
            await ctx.settings.set(SETTINGS_KEY_FILESYSTEM_BASE_DIRECTORY, "");
            await ctx.settings.set(SETTINGS_KEY_GOOGLE_DRIVE_ACCOUNT_LABEL, "");
            await ctx.settings.set(SETTINGS_KEY_PROVIDER, "dropbox");
            failurePrefix = "Dropbox connect failed while building status";
            statusSummary = await ctx.buildStatusSummary();
        } catch (error: unknown) {
            // Roll back any partial state so the user can retry cleanly.
            //
            // @remarks
            // This must restore the previous provider settings rather than
            // blindly clearing them. Otherwise a failed attempt to connect a
            // new provider would disconnect the previously configured one.
            const resolved = ensureError(error);
            try {
                await restoreProviderConnectionState({
                    ctx,
                    restoreGoogleDriveAccountLabel: true,
                    snapshot: previousState,
                    tokenStorageKey: SETTINGS_KEY_DROPBOX_TOKENS,
                });
            } catch (rollbackError: unknown) {
                throw new AggregateError(
                    [resolved, ensureError(rollbackError)],
                    "Dropbox connect failed and previous provider state could not be fully restored",
                    { cause: rollbackError }
                );
            }

            throw new Error(`${failurePrefix}: ${resolved.message}`, {
                cause: error,
            });
        }

        // Clear Google Drive secrets after a successful provider switch.
        await deleteProviderSecretsBestEffort({
            operationLabel: "connectDropbox",
            secretKeys: [SETTINGS_KEY_GOOGLE_DRIVE_TOKENS],
            secretStore: ctx.secretStore,
        });

        logger.info("[CloudService] Connected Dropbox provider");
        return statusSummary;
    });
}

/**
 * Connects the Google Drive provider via system-browser OAuth.
 */
export async function connectGoogleDrive(
    ctx: CloudServiceOperationContext
): Promise<CloudStatusSummary> {
    return ctx.runCloudOperation("connectGoogleDrive", async () => {
        const previousState = await captureProviderConnectionState({
            ctx,
            includeGoogleDriveAccountLabel: true,
            tokenStorageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
        });

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
            ...(clientSecret && { clientSecret }),
        });
        const auth = await authFlow.run();

        // Fetch the label before persisting anything so a failure doesn't
        // partially overwrite existing cloud configuration.
        const accountLabel = await fetchGoogleAccountLabel(auth.accessToken);

        const tokenManager = new GoogleDriveTokenManager({
            clientId,
            ...(clientSecret && { clientSecret }),
            secretStore: ctx.secretStore,
            storageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
        });

        let statusSummary: CloudStatusSummary;
        try {
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
            statusSummary = await ctx.buildStatusSummary();
        } catch (error: unknown) {
            // Roll back any partial state so a previously configured provider
            // remains intact.
            const resolved = ensureError(error);
            try {
                await restoreProviderConnectionState({
                    ctx,
                    restoreGoogleDriveAccountLabel: true,
                    snapshot: previousState,
                    tokenStorageKey: SETTINGS_KEY_GOOGLE_DRIVE_TOKENS,
                });
            } catch (rollbackError: unknown) {
                throw new AggregateError(
                    [resolved, ensureError(rollbackError)],
                    "Google Drive connect failed and previous provider state could not be fully restored",
                    { cause: rollbackError }
                );
            }

            throw new Error(
                `Google Drive connect failed while persisting configuration: ${resolved.message}`,
                { cause: error }
            );
        }

        // Clear Dropbox secrets after a successful provider switch.
        await deleteProviderSecretsBestEffort({
            operationLabel: "connectGoogleDrive",
            secretKeys: [SETTINGS_KEY_DROPBOX_TOKENS],
            secretStore: ctx.secretStore,
        });

        logger.info("[CloudService] Connected Google Drive provider");
        return statusSummary;
    });
}
