import type { Except } from "type-fest";

import { createSingleFlight } from "@shared/utils/singleFlight";
import { isPromiseLike } from "@shared/utils/typeHelpers";
import { Dropbox, DropboxAuth } from "dropbox";
import { isFinite as isFiniteNumber } from "ts-extras";

import type { SecretStore } from "../../secrets/SecretStore";

import { getNativeDateEpochMs } from "@shared/utils/nativeDate";
import { logger } from "../../../../utils/logger";
import { readStoredJsonSecret } from "../oauthStoredTokens";
import { withDropboxRetry } from "./dropboxRetry";
import { type DropboxTokens, parseDropboxTokens } from "./DropboxTokens";

const TOKEN_REFRESH_SAFETY_WINDOW_MS = 60_000;

/**
 * Manages persisted Dropbox OAuth tokens including refresh.
 */
export class DropboxTokenManager {
    private readonly appKey: string;

    private readonly authFactory: (tokens: DropboxTokens) => Pick<
        Except<DropboxAuth, "refreshAccessToken"> & {
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

    /**
     * Single-flight wrapper to prevent concurrent refresh storms when multiple
     * call sites request an access token at the same time.
     */
    private readonly refreshSingleFlight: () => Promise<DropboxTokens>;

    private readonly secretStore: SecretStore;

    private readonly tokenStorageKey: string;

    public constructor(args: {
        appKey: string;
        authFactory?: (tokens: DropboxTokens) => Pick<
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

        this.refreshSingleFlight = createSingleFlight(async () => {
            const tokens = await this.getStoredTokens();
            if (!tokens) {
                throw new Error("Dropbox is not connected");
            }

            const refreshed = await this.refreshTokens(tokens);
            await this.storeTokens(refreshed);
            return refreshed;
        });
    }

    public async clearTokens(): Promise<void> {
        await this.secretStore.deleteSecret(this.tokenStorageKey);
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

        const refreshed = await this.refreshSingleFlight();
        return refreshed.accessToken;
    }

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

    public async refreshTokens(tokens: DropboxTokens): Promise<DropboxTokens> {
        const auth = this.authFactory(tokens);

        await withDropboxRetry({
            fn: async () => {
                // Dropbox SDK types currently declare refreshAccessToken(): void,
                // but the implementation returns a Promise. Treat the return as
                // unknown and await if it is thenable.
                const maybePromise = auth.refreshAccessToken();
                if (isPromiseLike(maybePromise)) {
                    await maybePromise;
                }
            },
            operationName: "oauth2/token refresh",
        });

        const accessToken = auth.getAccessToken();
        const expiresAt = auth.getAccessTokenExpiresAt();
        const expiresAtEpochMs =
            expiresAt instanceof Date
                ? getNativeDateEpochMs(expiresAt)
                : undefined;

        if (!accessToken || typeof accessToken !== "string") {
            throw new Error("Dropbox refresh did not return an access token");
        }

        if (
            typeof expiresAtEpochMs !== "number" ||
            !isFiniteNumber(expiresAtEpochMs)
        ) {
            throw new TypeError(
                "Dropbox refresh did not return a valid access token expiration"
            );
        }

        const refreshedRefreshToken = auth.getRefreshToken();
        const refreshToken =
            typeof refreshedRefreshToken === "string" &&
            refreshedRefreshToken.trim().length > 0
                ? refreshedRefreshToken
                : tokens.refreshToken;

        return {
            accessToken,
            expiresAtEpochMs,
            refreshToken,
        };
    }

    /**
     * Revokes the currently stored access token (and corresponding refresh
     * token) via Dropbox's `/2/auth/token/revoke` endpoint.
     *
     * @remarks
     * Network revocation is best-effort. Local stored tokens are cleared after
     * the revoke attempt so disconnect does not leave stale credentials
     * behind.
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

        await this.clearTokens();
    }

    public async storeTokens(tokens: DropboxTokens): Promise<void> {
        const parsed = parseDropboxTokens(tokens);
        await this.secretStore.setSecret(
            this.tokenStorageKey,
            JSON.stringify(parsed)
        );
    }
}

function nowEpochMs(): number {
    return Date.now();
}
