import { ensureError } from "@shared/utils/errorHandling";
import { normalizeLogValue } from "@shared/utils/loggingContext";
import { createSingleFlight } from "@shared/utils/singleFlight";
import axios from "axios";
import * as z from "zod";

import type { SecretStore } from "../../secrets/SecretStore";

import { logger } from "../../../../utils/logger";
import { readStoredJsonSecret } from "../oauthStoredTokens";
import { GOOGLE_OAUTH_REQUEST_TIMEOUT_MS } from "./googleDriveOAuthConstants";
import {
    googleTokenResponseSchema,
    tryParseGoogleOAuthErrorResponse,
} from "./googleDriveTokenSchemas";

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
        expiresAt: z.int().nonnegative(),
        refreshToken: z.string().min(1),
        scope: z.string().optional(),
        tokenType: z.string().optional(),
    })
    .strict();

/**
 * Manages OAuth tokens for Google Drive.
 */
export class GoogleDriveTokenManager {
    private readonly clientId: string;

    private readonly clientSecret: string | undefined;

    private readonly secretStore: SecretStore;

    private readonly storageKey: string;

    /**
     * Single-flight wrapper to prevent concurrent refresh storms when multiple
     * call sites request an access token at the same time.
     */
    private readonly refreshSingleFlight: () => Promise<string>;

    public async clear(): Promise<void> {
        await this.secretStore.deleteSecret(this.storageKey);
    }

    public async getTokens(): Promise<GoogleDriveTokens | undefined> {
        return readStoredJsonSecret({
            clear: () => this.clear(),
            logger,
            logPrefix: "[GoogleDriveTokenManager]",
            parse: (record) => googleTokenSchema.parse(record),
            secretStore: this.secretStore,
            storageKey: this.storageKey,
        });
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

        return this.refreshSingleFlight();
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

        try {
            const response = await axios.post(
                "https://oauth2.googleapis.com/token",
                body.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    timeout: GOOGLE_OAUTH_REQUEST_TIMEOUT_MS,
                }
            );

            return googleTokenResponseSchema.parse(response.data);
        } catch (error) {
            // Ensure we normalize the caught value so downstream logging or
            // rethrowing remains Error-shaped, but keep Axios shape checks on
            // the original value. In practice, some callers/tests provide
            // Axios-like objects that are not `instanceof Error`.
            const safeError = ensureError(error);

            if (axios.isAxiosError(error)) {
                const oauthError = tryParseGoogleOAuthErrorResponse(
                    error.response?.data
                );

                if (oauthError) {
                    const details = oauthError.error_description
                        ? `${oauthError.error} (${oauthError.error_description})`
                        : oauthError.error;
                    const sanitized = normalizeLogValue(details);
                    const safeDetails =
                        typeof sanitized === "string"
                            ? sanitized
                            : oauthError.error;

                    throw new Error(
                        `Google OAuth refresh failed: ${safeDetails}`,
                        {
                            cause: error,
                        }
                    );
                }
            }

            throw safeError;
        }
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
                    timeout: GOOGLE_OAUTH_REQUEST_TIMEOUT_MS,
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

        this.refreshSingleFlight = createSingleFlight(async () => {
            const tokens = await this.getTokens();
            if (!tokens) {
                throw new Error("Google Drive is not connected.");
            }

            const refreshed = await this.refresh(tokens.refreshToken);
            const nextScope = refreshed.scope ?? tokens.scope;
            const nextTokenType = refreshed.token_type ?? tokens.tokenType;

            const now = Date.now();
            const expiresInSeconds = refreshed.expires_in ?? 3600;

            await this.setTokens({
                accessToken: refreshed.access_token,
                expiresAt: now + expiresInSeconds * 1000,
                refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
                ...(nextScope === undefined ? {} : { scope: nextScope }),
                ...(nextTokenType === undefined
                    ? {}
                    : { tokenType: nextTokenType }),
            });

            return refreshed.access_token;
        });
    }
}
