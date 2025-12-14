import { ensureError } from "@shared/utils/errorHandling";
import axios, { type AxiosInstance } from "axios";
import { shell } from "electron";
import crypto from "node:crypto";
import http from "node:http";
import * as z from "zod";

import type { DropboxTokens } from "./DropboxTokens";

import { createPkcePair } from "./DropboxPkce";

/* eslint-disable @microsoft/sdl/no-insecure-url -- OAuth loopback redirects require http://127.0.0.1; https would require local certificates. */

const DROPBOX_AUTHORIZE_URL =
    "https://www.dropbox.com/oauth2/authorize" as const;
const DROPBOX_TOKEN_ENDPOINT =
    "https://api.dropboxapi.com/oauth2/token" as const;

const DEFAULT_TIMEOUT_MS = 5 * 60_000;

const DROPBOX_SCOPES = [
    "files.content.read",
    "files.content.write",
    "files.metadata.read",
    "files.metadata.write",
] as const;

const dropboxTokenExchangeResponseSchema = z.looseObject({
    access_token: z.string().min(1),
    expires_in: z.number().positive(),
    refresh_token: z.string().min(1),
});

function createRandomState(): string {
    return crypto.randomBytes(16).toString("hex");
}

/**
 * Performs a system-browser OAuth PKCE flow for Dropbox.
 */
export class DropboxAuthFlow {
    private readonly appKey: string;

    private readonly httpClient: AxiosInstance;

    public async connect(args?: {
        timeoutMs?: number;
    }): Promise<DropboxTokens> {
        const timeoutMs = args?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        const { codeChallenge, codeVerifier } = createPkcePair();
        const state = createRandomState();

        const { code, redirectUri } = await this.acquireAuthorizationCode({
            codeChallenge,
            state,
            timeoutMs,
        });

        return this.fetchTokensForAuthorizationCode({
            code,
            codeVerifier,
            redirectUri,
        });
    }

    private async acquireAuthorizationCode(args: {
        codeChallenge: string;
        state: string;
        timeoutMs: number;
    }): Promise<{ code: string; redirectUri: string }> {
        const server = http.createServer();

        const listenPromise = new Promise<void>((resolve, reject) => {
            function handleListenError(error: unknown): void {
                server.off("error", handleListenError);
                reject(ensureError(error));
            }

            server.on("error", handleListenError);
            server.listen(0, "127.0.0.1", () => {
                server.off("error", handleListenError);
                resolve();
            });
        });

        await listenPromise;

        const address = server.address();
        if (!address || typeof address === "string") {
            await new Promise<void>((resolve) => {
                server.close(() => {
                    resolve();
                });
            });
            throw new Error("Dropbox OAuth server address unavailable");
        }

        const redirectUri = `http://127.0.0.1:${address.port}/oauth2/callback`;

        const authorizeUrl = new URL(DROPBOX_AUTHORIZE_URL);
        authorizeUrl.searchParams.set("client_id", this.appKey);
        authorizeUrl.searchParams.set("response_type", "code");
        authorizeUrl.searchParams.set("redirect_uri", redirectUri);
        authorizeUrl.searchParams.set("state", args.state);
        authorizeUrl.searchParams.set("code_challenge", args.codeChallenge);
        authorizeUrl.searchParams.set("code_challenge_method", "S256");
        authorizeUrl.searchParams.set("token_access_type", "offline");
        authorizeUrl.searchParams.set("scope", DROPBOX_SCOPES.join(" "));

        const codePromise = new Promise<{ code: string; state: string }>((
            resolve,
            reject
        ) => {
            let settled = false;

            let timeoutId: NodeJS.Timeout | null = null;

            function cleanup(): void {
                if (settled) {
                    return;
                }

                settled = true;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
            }

            timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error("Dropbox OAuth timed out"));
            }, args.timeoutMs);

            function handleRuntimeError(error: unknown): void {
                cleanup();
                reject(ensureError(error));
            }

            function handleRequest(
                request: http.IncomingMessage,
                response: http.ServerResponse
            ): void {
                try {
                    const requestUrl = new URL(
                        request.url ?? "/",
                        `http://${request.headers.host ?? "127.0.0.1"}`
                    );

                    if (requestUrl.pathname !== "/oauth2/callback") {
                        response.writeHead(404);
                        response.end();
                        server.once("request", handleRequest);
                        return;
                    }

                    const code = requestUrl.searchParams.get("code");
                    const state = requestUrl.searchParams.get("state");
                    const errorDescription =
                        requestUrl.searchParams.get("error_description");

                    if (errorDescription) {
                        response.writeHead(400, {
                            "Content-Type": "text/plain; charset=utf-8",
                        });
                        response.end(`OAuth error: ${errorDescription}`);
                        cleanup();
                        reject(
                            new Error(
                                `Dropbox OAuth error: ${errorDescription}`
                            )
                        );
                        return;
                    }

                    if (!code || !state) {
                        response.writeHead(400, {
                            "Content-Type": "text/plain; charset=utf-8",
                        });
                        response.end("Missing code/state");
                        cleanup();
                        reject(
                            new Error(
                                "Dropbox OAuth callback missing code/state"
                            )
                        );
                        return;
                    }

                    response.writeHead(200, {
                        "Content-Type": "text/html; charset=utf-8",
                    });
                    response.end(
                        "<html><body><h1>Connected</h1><p>You can close this tab and return to Uptime Watcher.</p></body></html>"
                    );

                    cleanup();
                    resolve({ code, state });
                } catch (error) {
                    cleanup();
                    reject(ensureError(error));
                }
            }

            server.once("request", handleRequest);
            server.once("error", handleRuntimeError);
        });

        try {
            await shell.openExternal(authorizeUrl.toString());

            const { code, state } = await codePromise;
            if (state !== args.state) {
                throw new Error("Dropbox OAuth state mismatch");
            }

            return { code, redirectUri };
        } finally {
            await new Promise<void>((resolve) => {
                server.close(() => {
                    resolve();
                });
            });
        }
    }

    private async fetchTokensForAuthorizationCode(args: {
        code: string;
        codeVerifier: string;
        redirectUri: string;
    }): Promise<DropboxTokens> {
        const body = new URLSearchParams({
            client_id: this.appKey,
            code: args.code,
            code_verifier: args.codeVerifier,
            grant_type: "authorization_code",
            redirect_uri: args.redirectUri,
        });

        const response = await this.httpClient.post(
            DROPBOX_TOKEN_ENDPOINT,
            body,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const parsed = dropboxTokenExchangeResponseSchema.parse(
            response.data as unknown
        );

        return {
            accessToken: parsed.access_token,
            expiresAtEpochMs: Date.now() + parsed.expires_in * 1000,
            refreshToken: parsed.refresh_token,
        };
    }

    public constructor(args: { appKey: string; httpClient?: AxiosInstance }) {
        this.appKey = args.appKey;
        this.httpClient = args.httpClient ?? axios.create();
    }
}

/* eslint-enable @microsoft/sdl/no-insecure-url -- End loopback OAuth URL exception. */
