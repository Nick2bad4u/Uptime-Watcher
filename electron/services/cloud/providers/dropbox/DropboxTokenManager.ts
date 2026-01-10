import { Dropbox, DropboxAuth } from "dropbox";

import type { SecretStore } from "../../secrets/SecretStore";

import { logger } from "../../../../utils/logger";
import { readStoredJsonSecret } from "../oauthStoredTokens";
import { withDropboxRetry } from "./dropboxRetry";
import { type DropboxTokens, parseDropboxTokens } from "./DropboxTokens";

const TOKEN_REFRESH_SAFETY_WINDOW_MS = 60_000;

function nowEpochMs(): number {
    return Date.now();
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        "then" in value &&
        typeof (value as { then?: unknown }).then === "function"
    );
}

/**
 * Manages persisted Dropbox OAuth tokens including refresh.
 */
export class DropboxTokenManager {
    private readonly appKey: string;

    private readonly secretStore: SecretStore;

    private readonly tokenStorageKey: string;

    private readonly authFactory: (tokens: DropboxTokens) => Pick<
        Omit<DropboxAuth, "refreshAccessToken"> & {
            refreshAccessToken: () => unknown;
        },
        | "getAccessToken"
        | "getAccessTokenExpiresAt"
        | "getRefreshToken"
        | "refreshAccessToken"
        | "setAccessToken"
        | "setAccessTokenExpiresAt"
        | "setClientId"
        | "setRefreshToken"
    >;

    private readonly clientFactory: (
        accessToken: string
    ) => Pick<Dropbox, "authTokenRevoke">;

    public async getStoredTokens(): Promise<DropboxTokens | undefined> {
        return readStoredJsonSecret({
            clear: () => this.clearTokens(),
            logger,
            logPrefix: "[DropboxTokenManager]",
            parse: parseDropboxTokens,
            secretStore: this.secretStore,
            storageKey: this.tokenStorageKey,
        });
    }

    public async clearTokens(): Promise<void> {
        await this.secretStore.deleteSecret(this.tokenStorageKey);
    }

    public async storeTokens(tokens: DropboxTokens): Promise<void> {
        await this.secretStore.setSecret(
            this.tokenStorageKey,
            JSON.stringify(tokens)
        );
    }

    public async getAccessToken(): Promise<string> {
        const tokens = await this.getStoredTokens();
        if (!tokens) {
            throw new Error("Dropbox is not connected");
        }

        const refreshThreshold = nowEpochMs() + TOKEN_REFRESH_SAFETY_WINDOW_MS;
        if (tokens.expiresAtEpochMs > refreshThreshold) {
            return tokens.accessToken;
        }

        const refreshed = await this.refreshTokens(tokens);
        await this.storeTokens(refreshed);
        return refreshed.accessToken;
    }

    public async refreshTokens(tokens: DropboxTokens): Promise<DropboxTokens> {
        const auth = this.authFactory(tokens);

        await withDropboxRetry({
            fn: async () => {
                // Dropbox SDK types currently declare refreshAccessToken(): void,
                // but the implementation returns a Promise. Treat the return as
                // unknown and await if it is thenable.
                const maybePromise = auth.refreshAccessToken();
                if (isThenable(maybePromise)) {
                    await maybePromise;
                }
            },
            operationName: "oauth2/token refresh",
        });

        const accessToken = auth.getAccessToken();
        const expiresAt = auth.getAccessTokenExpiresAt();

        if (!accessToken || typeof accessToken !== "string") {
            throw new Error("Dropbox refresh did not return an access token");
        }

        if (
            !(expiresAt instanceof Date) ||
            !Number.isFinite(expiresAt.getTime())
        ) {
            throw new TypeError(
                "Dropbox refresh did not return a valid access token expiration"
            );
        }

        return {
            accessToken,
            expiresAtEpochMs: expiresAt.getTime(),
            refreshToken: tokens.refreshToken,
        };
    }

    /**
     * Revokes the currently stored access token (and corresponding refresh
     * token) via Dropbox's `/2/auth/token/revoke` endpoint.
     *
     * @remarks
     * This is best-effort. Disconnect should still succeed even if the network
     * is unavailable.
     */
    public async revokeStoredTokens(): Promise<void> {
        const tokens = await this.getStoredTokens();
        if (!tokens) {
            return;
        }

        try {
            const accessToken = await this.getAccessToken();
            const client = this.clientFactory(accessToken);
            await withDropboxRetry({
                fn: async () => {
                    await client.authTokenRevoke();
                },
                operationName: "auth/token/revoke",
            });
        } catch {
            // Best-effort: ignore token revoke failures.
        }
    }

    public constructor(args: {
        appKey: string;
        authFactory?: (
            tokens: DropboxTokens
        ) => Pick<
            DropboxAuth,
            | "getAccessToken"
            | "getAccessTokenExpiresAt"
            | "getRefreshToken"
            | "refreshAccessToken"
            | "setAccessToken"
            | "setAccessTokenExpiresAt"
            | "setClientId"
            | "setRefreshToken"
        >;
        clientFactory?: (
            accessToken: string
        ) => Pick<Dropbox, "authTokenRevoke">;
        secretStore: SecretStore;
        tokenStorageKey: string;
    }) {
        this.appKey = args.appKey;
        this.secretStore = args.secretStore;
        this.tokenStorageKey = args.tokenStorageKey;

        this.authFactory =
            args.authFactory ??
            ((tokens): DropboxAuth =>
                new DropboxAuth({
                    accessToken: tokens.accessToken,
                    accessTokenExpiresAt: new Date(tokens.expiresAtEpochMs),
                    clientId: this.appKey,
                    refreshToken: tokens.refreshToken,
                }));

        this.clientFactory =
            args.clientFactory ??
            ((accessToken): Dropbox =>
                new Dropbox({
                    accessToken,
                }));
    }
}
