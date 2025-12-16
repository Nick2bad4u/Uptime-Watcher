import axios from "axios";
import * as z from "zod";

import type { SecretStore } from "../../secrets/SecretStore";

/**
 * Persisted Google Drive OAuth tokens.
 */
export interface GoogleDriveTokens {
    accessToken: string;
    expiresAt: number;
    refreshToken: string;
    scope?: string | undefined;
    tokenType?: string | undefined;
}

const googleTokenSchema: z.ZodType<GoogleDriveTokens> = z
    .object({
        accessToken: z.string().min(1),
        expiresAt: z.number().int().nonnegative(),
        refreshToken: z.string().min(1),
        scope: z.string().optional(),
        tokenType: z.string().optional(),
    })
    .strict();

const googleTokenResponseSchema = z.looseObject({
    access_token: z.string().min(1),
    expires_in: z.number().int().positive().optional(),
    refresh_token: z.string().min(1).optional(),
    scope: z.string().optional(),
    token_type: z.string().optional(),
});

/**
 * Manages OAuth tokens for Google Drive.
 */
export class GoogleDriveTokenManager {
    private readonly clientId: string;

    private readonly clientSecret: string | undefined;

    private readonly secretStore: SecretStore;

    private readonly storageKey: string;

    public async clear(): Promise<void> {
        await this.secretStore.deleteSecret(this.storageKey);
    }

    public async getTokens(): Promise<GoogleDriveTokens | undefined> {
        const raw = await this.secretStore.getSecret(this.storageKey);
        if (!raw) {
            return undefined;
        }

        try {
            const parsed = JSON.parse(raw) as unknown;
            return googleTokenSchema.parse(parsed);
        } catch {
            return undefined;
        }
    }

    public async setTokens(tokens: GoogleDriveTokens): Promise<void> {
        await this.secretStore.setSecret(
            this.storageKey,
            JSON.stringify(tokens)
        );
    }

    public async isConnected(): Promise<boolean> {
        const tokens = await this.getTokens();
        return Boolean(tokens?.refreshToken);
    }

    /**
     * Returns a valid access token, refreshing if required.
     */
    public async getValidAccessToken(): Promise<string> {
        const tokens = await this.getTokens();
        if (!tokens) {
            throw new Error("Google Drive is not connected.");
        }

        const now = Date.now();
        const refreshSkewMs = 60_000;
        if (tokens.expiresAt > now + refreshSkewMs) {
            return tokens.accessToken;
        }

        const refreshed = await this.refresh(tokens.refreshToken);
        const nextScope = refreshed.scope ?? tokens.scope;
        const nextTokenType = refreshed.token_type ?? tokens.tokenType;

        await this.setTokens({
            accessToken: refreshed.access_token,
            expiresAt: now + (refreshed.expires_in ?? 3600) * 1000,
            refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
            ...(nextScope === undefined ? {} : { scope: nextScope }),
            ...(nextTokenType === undefined
                ? {}
                : { tokenType: nextTokenType }),
        });

        return refreshed.access_token;
    }

    private async refresh(
        refreshToken: string
    ): Promise<z.infer<typeof googleTokenResponseSchema>> {
        const body = new URLSearchParams({
            client_id: this.clientId,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        });

        if (this.clientSecret) {
            body.set("client_secret", this.clientSecret);
        }

        const response = await axios.post(
            "https://oauth2.googleapis.com/token",
            body.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        return googleTokenResponseSchema.parse(response.data);
    }

    public async revoke(): Promise<void> {
        const tokens = await this.getTokens();
        if (!tokens) {
            return;
        }

        await axios
            .post(
                "https://oauth2.googleapis.com/revoke",
                new URLSearchParams({ token: tokens.refreshToken }).toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            )
            .catch(() => {
                // Best-effort.
            });

        await this.clear();
    }

    public constructor(args: {
        clientId: string;
        clientSecret?: string;
        secretStore: SecretStore;
        storageKey: string;
    }) {
        this.clientId = args.clientId;
        this.clientSecret = args.clientSecret;
        this.secretStore = args.secretStore;
        this.storageKey = args.storageKey;
    }
}
