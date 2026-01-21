import { openExternalOrThrow } from "@electron/services/shell/openExternalUtils";
import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";
import { DropboxAuth } from "dropbox";
import * as z from "zod";

import type { DropboxTokens } from "./DropboxTokens";

import {
    createOAuthState,
    startLoopbackOAuthServer,
} from "../../oauth/LoopbackOAuthServer";
import { validateOAuthAuthorizeUrl } from "../oauthAuthorizeUrl";



const DEFAULT_TIMEOUT_MS = 5 * 60_000;

const LOOPBACK_IP_HOST_4 = "127.0.0.1" as const;
const LOOPBACK_REDIRECT_HOST = "localhost" as const;
const LOOPBACK_PATH = "/oauth2/callback" as const;

/**
 * Default loopback port used for Dropbox OAuth.
 *
 * @remarks
 * Using a fixed port allows the Dropbox console to be configured with a single
 * redirect URI.
 */
export const DEFAULT_DROPBOX_LOOPBACK_PORT = 53_682;

const DROPBOX_SCOPES = [
    "account_info.read",
    "files.content.read",
    "files.content.write",
    "files.metadata.read",
] as const;

const dropboxTokenExchangeResponseSchema = z
    .object({
        access_token: z.string().min(1),
        expires_in: z.number().positive(),
        refresh_token: z.string().min(1),
    })
    .loose();

function createRandomState(): string {
    // Legacy wrapper retained for readability.
    // Internally we use the shared helper so all providers share a strong
    // state generation policy.
    return createOAuthState();
}

type DropboxAuthClient = Pick<
    DropboxAuth,
    "getAccessTokenFromCode" | "getAuthenticationUrl" | "setClientId"
>;

/**
 * Performs a system-browser OAuth Authorization Code + PKCE flow for Dropbox.
 */
export class DropboxAuthFlow {
    private readonly appKey: string;

    private readonly loopbackPort: number;

    private readonly authFactory: () => DropboxAuthClient;

    public async connect(args?: {
        timeoutMs?: number;
    }): Promise<DropboxTokens> {
        const timeoutMs = args?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        const state = createRandomState();

        const auth = this.authFactory();
        auth.setClientId(this.appKey);

        const { code, redirectUri } = await this.acquireAuthorizationCode({
            auth,
            state,
            timeoutMs,
        });

        return this.fetchTokensForAuthorizationCode({
            auth,
            code,
            redirectUri,
        });
    }

    private async acquireAuthorizationCode(args: {
        auth: DropboxAuthClient;
        state: string;
        timeoutMs: number;
    }): Promise<{ code: string; redirectUri: string }> {
        const redirectHost =
            this.loopbackPort === 0 ? LOOPBACK_IP_HOST_4 : LOOPBACK_REDIRECT_HOST;

        const server = await startLoopbackOAuthServer({
            port: this.loopbackPort,
            redirectHost,
            redirectPath: LOOPBACK_PATH,
        });

        try {
            const {redirectUri} = server;
            const authorizeUrl = String(
                await args.auth.getAuthenticationUrl(
                    redirectUri,
                    args.state,
                    "code",
                    "offline",
                    Array.from(DROPBOX_SCOPES),
                    "none",
                    true
                )
            );

            const { normalizedUrl, urlForLog: authorizeUrlForLog } =
                validateOAuthAuthorizeUrl({
                    providerName: "Dropbox",
                    url: authorizeUrl,
                });

            const callbackPromise = server.waitForCallback({
                expectedState: args.state,
                timeoutMs: args.timeoutMs,
            });

            await openExternalOrThrow({
                failureMessagePrefix: "Failed to open Dropbox OAuth URL",
                normalizedUrl,
                safeUrlForLogging: authorizeUrlForLog,
            });

            try {
                const callback = await callbackPromise;
                return { code: callback.code, redirectUri };
            } catch (error: unknown) {
                const resolved = ensureError(error);

                if (resolved.message === "OAuth state mismatch") {
                    throw new Error("Dropbox OAuth state mismatch", {
                        cause: error,
                    });
                }

                if (resolved.message.startsWith("OAuth callback error: ")) {
                    const details = resolved.message.slice(
                        "OAuth callback error: ".length
                    );
                    throw new Error(`Dropbox OAuth error: ${details}`, {
                        cause: error,
                    });
                }

                if (resolved.message === "OAuth loopback timeout") {
                    throw new Error("Dropbox OAuth timed out", { cause: error });
                }

                throw resolved;
            }
        } catch (error: unknown) {
            const resolved = ensureError(error);

            const code = tryGetErrorCode(error);
            const isAddressBindingError =
                typeof code === "string" && code.startsWith("EADDR");

            if (this.loopbackPort !== 0 && isAddressBindingError) {
                throw new Error(
                    `Dropbox OAuth loopback server failed to start on port ${this.loopbackPort}. ` +
                        "Another instance of the app (or another process) may already be using that port.",
                    { cause: error }
                );
            }

            throw resolved;
        } finally {
            await server.close();
        }
    }

    private async fetchTokensForAuthorizationCode(args: {
        auth: DropboxAuthClient;
        code: string;
        redirectUri: string;
    }): Promise<DropboxTokens> {
        const response = await args.auth.getAccessTokenFromCode(
            args.redirectUri,
            args.code
        );

        const parsed = dropboxTokenExchangeResponseSchema.parse(
            (response as { result?: unknown }).result
        );

        return {
            accessToken: parsed.access_token,
            expiresAtEpochMs: Date.now() + parsed.expires_in * 1000,
            refreshToken: parsed.refresh_token,
        };
    }

    public constructor(args: {
        appKey: string;
        authFactory?: () => DropboxAuthClient;
        loopbackPort?: number;
    }) {
        this.appKey = args.appKey;
        this.loopbackPort = args.loopbackPort ?? DEFAULT_DROPBOX_LOOPBACK_PORT;

        this.authFactory =
            args.authFactory ??
            ((): DropboxAuthClient =>
                new DropboxAuth({
                    clientId: args.appKey,
                }));
    }
}
