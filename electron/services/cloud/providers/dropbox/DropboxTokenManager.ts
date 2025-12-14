import axios, { type AxiosInstance } from "axios";
import * as z from "zod";

import type { SecretStore } from "../../secrets/SecretStore";

import { withDropboxRetry } from "./dropboxRetry";
import { type DropboxTokens, parseDropboxTokens } from "./DropboxTokens";

const DROPBOX_TOKEN_ENDPOINT =
    "https://api.dropboxapi.com/oauth2/token" as const;

const TOKEN_REFRESH_SAFETY_WINDOW_MS = 60_000;

const dropboxRefreshResponseSchema = z.looseObject({
    access_token: z.string().min(1),
    expires_in: z.number().positive(),
});

function nowEpochMs(): number {
    return Date.now();
}

/**
 * Manages persisted Dropbox OAuth tokens including refresh.
 */
export class DropboxTokenManager {
    private readonly appKey: string;

    private readonly http: AxiosInstance;

    private readonly secretStore: SecretStore;

    private readonly tokenStorageKey: string;

    public async getStoredTokens(): Promise<DropboxTokens | undefined> {
        const raw = await this.secretStore.getSecret(this.tokenStorageKey);
        if (!raw) {
            return undefined;
        }

        const parsed: unknown = JSON.parse(raw);
        return parseDropboxTokens(parsed);
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
        const body = new URLSearchParams({
            client_id: this.appKey,
            grant_type: "refresh_token",
            refresh_token: tokens.refreshToken,
        });

        const response = await withDropboxRetry({
            fn: async () =>
                this.http.post(DROPBOX_TOKEN_ENDPOINT, body, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }),
            operationName: "oauth2/token refresh",
        });

        const parsed = dropboxRefreshResponseSchema.parse(
            response.data as unknown
        );

        return {
            accessToken: parsed.access_token,
            expiresAtEpochMs: nowEpochMs() + parsed.expires_in * 1000,
            refreshToken: tokens.refreshToken,
        };
    }

    public constructor(args: {
        appKey: string;
        http?: AxiosInstance;
        secretStore: SecretStore;
        tokenStorageKey: string;
    }) {
        this.appKey = args.appKey;
        this.secretStore = args.secretStore;
        this.tokenStorageKey = args.tokenStorageKey;
        this.http = args.http ?? axios.create();
    }
}
