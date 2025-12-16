import axios from "axios";
import { shell } from "electron";
import * as z from "zod";

import {
    createOAuthState,
    startLoopbackOAuthServer,
} from "../../oauth/LoopbackOAuthServer";
import { createPkcePair } from "../../oauth/pkce";

const googleTokenResponseSchema = z.looseObject({
    access_token: z.string().min(1),
    expires_in: z.number().int().positive().optional(),
    refresh_token: z.string().min(1).optional(),
    scope: z.string().optional(),
    token_type: z.string().optional(),
});

/**
 * Result of a successful Google Drive OAuth connect flow.
 */
export interface GoogleDriveAuthResult {
    readonly accessToken: string;
    readonly expiresAt: number;
    readonly refreshToken: string;
    readonly scope?: string;
    readonly tokenType?: string;
}

/**
 * Performs Google OAuth 2.0 Authorization Code + PKCE using the system browser and
 * a loopback IP redirect.
 *
 * @remarks
 * Google’s native/desktop guidance recommends `http://127.0.0.1:port`.
 */
export class GoogleDriveAuthFlow {
    private readonly clientId: string;

    private readonly clientSecret: string | undefined;

    public async run(): Promise<GoogleDriveAuthResult> {
        const server = await startLoopbackOAuthServer();

        try {
            const pkce = createPkcePair();
            const state = createOAuthState();

            const authorizationUrl = new URL(
                "https://accounts.google.com/o/oauth2/v2/auth"
            );

            authorizationUrl.searchParams.set("client_id", this.clientId);
            authorizationUrl.searchParams.set("redirect_uri", server.redirectUri);
            authorizationUrl.searchParams.set("response_type", "code");
            authorizationUrl.searchParams.set(
                "scope",
                [
                    "openid",
                    "email",
                    "profile",
                    // App-private storage.
                    "https://www.googleapis.com/auth/drive.appdata",
                ].join(" ")
            );
            authorizationUrl.searchParams.set("state", state);
            authorizationUrl.searchParams.set("code_challenge", pkce.codeChallenge);
            authorizationUrl.searchParams.set(
                "code_challenge_method",
                pkce.codeChallengeMethod
            );
            authorizationUrl.searchParams.set("access_type", "offline");
            authorizationUrl.searchParams.set("prompt", "consent");
            authorizationUrl.searchParams.set("include_granted_scopes", "true");

            await shell.openExternal(authorizationUrl.toString());

            const callback = await server.waitForCallback({
                expectedState: state,
                timeoutMs: 2 * 60_000,
            });

            const token = await this.requestTokenFromAuthorizationCode({
                code: callback.code,
                codeVerifier: pkce.codeVerifier,
                redirectUri: server.redirectUri,
            });

            if (!token.refresh_token) {
                throw new Error(
                    "Google OAuth did not return a refresh token. Ensure prompt=consent and access_type=offline."
                );
            }

            const now = Date.now();

            return {
                accessToken: token.access_token,
                expiresAt: now + (token.expires_in ?? 3600) * 1000,
                refreshToken: token.refresh_token,
                ...(token.scope ? { scope: token.scope } : {}),
                ...(token.token_type ? { tokenType: token.token_type } : {}),
            };
        } finally {
            await server.close();
        }
    }

    private async requestTokenFromAuthorizationCode(args: {
        code: string;
        codeVerifier: string;
        redirectUri: string;
    }): Promise<z.infer<typeof googleTokenResponseSchema>> {
        const body = new URLSearchParams({
            client_id: this.clientId,
            code: args.code,
            code_verifier: args.codeVerifier,
            grant_type: "authorization_code",
            redirect_uri: args.redirectUri,
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

    public constructor(args: { clientId: string; clientSecret?: string }) {
        this.clientId = args.clientId;
        this.clientSecret = args.clientSecret;
    }
}
