import { openExternalOrThrow } from "@electron/services/shell/openExternalUtils";
import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { DropboxAuth } from "dropbox";
import * as crypto from "node:crypto";
import * as http from "node:http";
import * as z from "zod";

import type { DropboxTokens } from "./DropboxTokens";

import { validateOAuthAuthorizeUrl } from "../oauthAuthorizeUrl";

/* eslint-disable @microsoft/sdl/no-insecure-url -- OAuth loopback redirects require http://localhost; https would require local certificates. */

const DEFAULT_TIMEOUT_MS = 5 * 60_000;

const LOOPBACK_IP_HOST_4 = "127.0.0.1" as const;
const LOOPBACK_IP_HOST_6 = "::1" as const;
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

const dropboxTokenExchangeResponseSchema = z.looseObject({
    access_token: z.string().min(1),
    expires_in: z.number().positive(),
    refresh_token: z.string().min(1),
});

function createRandomState(): string {
    return crypto.randomBytes(16).toString("hex");
}

function handleUnexpectedOAuthRuntimeError(error: unknown): void {
    // Should never be used; replaced before listeners are registered.
    throw new Error(
        `Unexpected OAuth runtime error handler invocation: ${getUserFacingErrorDetail(error)}`
    );
}

function handleUnexpectedOAuthRequest(
    request: http.IncomingMessage,
    response: http.ServerResponse
): void {
    // Should never be used; replaced before listeners are registered.
    const url = request.url ?? "";
    response.writeHead(500, {
        "Content-Type": "text/plain; charset=utf-8",
    });
    response.end(`Unexpected OAuth request handler invocation: ${url}`);
}

function applyLoopbackResponseHeaders(
    response: http.ServerResponse,
    contentType: "text/html; charset=utf-8" | "text/plain; charset=utf-8"
): void {
    response.setHeader("Content-Type", contentType);

    // Defensive security headers for the browser page.
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    );
}

type DropboxAuthClient = Pick<
    DropboxAuth,
    "getAccessTokenFromCode" | "getAuthenticationUrl" | "setClientId"
>;

type DropboxOAuthCallback = Readonly<{ code: string; state: string }>;

/**
 * Best-effort close for loopback OAuth servers.
 *
 * @remarks
 * Node will throw `ERR_SERVER_NOT_RUNNING` if `close()` is called on a server
 * that never successfully started listening. Cleanup must never mask the
 * original OAuth error.
 */
async function closeServerSafely(server: http.Server): Promise<void> {
    return new Promise((resolve) => {
        try {
            server.close(() => {
                resolve();
            });
        } catch (error: unknown) {
            if (tryGetErrorCode(error) === "ERR_SERVER_NOT_RUNNING") {
                resolve();
                return;
            }

            resolve();
        }
    });
}

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
        const { listenHosts, redirectHost } =
            this.getLoopbackHostsAndRedirectHost();

        const servers = listenHosts.map(() => http.createServer());

        try {
            const port = await this.listenOnLoopback({
                hosts: listenHosts,
                servers,
            });

            const redirectUri = `http://${redirectHost}:${port}${LOOPBACK_PATH}`;
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

            const callbackPromise = this.waitForOAuthCallback({
                servers,
                timeoutMs: args.timeoutMs,
            });

            await openExternalOrThrow({
                failureMessagePrefix: "Failed to open Dropbox OAuth URL",
                normalizedUrl,
                safeUrlForLogging: authorizeUrlForLog,
            });

            const callback = await callbackPromise;
            if (callback.state !== args.state) {
                throw new Error("Dropbox OAuth state mismatch");
            }

            return { code: callback.code, redirectUri };
        } catch (error: unknown) {
            const resolved = ensureError(error);

            const code = tryGetErrorCode(error);
            const isAddressBindingError =
                typeof code === "string" && code.startsWith("EADDR");

            if (this.loopbackPort !== 0 && isAddressBindingError) {
                throw new Error(
                    "Dropbox OAuth loopback server failed to start on both IPv4 and IPv6. " +
                        "Ensure IPv6 is enabled or change the configured redirect URI to use 127.0.0.1.",
                    { cause: error }
                );
            }

            throw resolved;
        } finally {
            await this.closeServers(servers);
        }
    }

    private async closeServers(servers: readonly http.Server[]): Promise<void> {
        await Promise.all(servers.map(closeServerSafely));
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

    private async listenOnLoopback(args: {
        hosts: readonly string[];
        servers: readonly http.Server[];
    }): Promise<number> {
        const { loopbackPort } = this;

        await Promise.all(
            args.servers.map(
                (server, index) =>
                    new Promise<void>((resolve, reject) => {
                        const host = args.hosts[index];

                        const handleListenError = (error: unknown): void => {
                            server.off("error", handleListenError);
                            reject(ensureError(error));
                        };

                        server.on("error", handleListenError);
                        server.listen(loopbackPort, host, () => {
                            server.off("error", handleListenError);
                            resolve();
                        });
                    })
            )
        );

        const ports = args.servers.map((server) => {
            const address = server.address();
            if (!address || typeof address === "string") {
                throw new TypeError("Dropbox OAuth server address unavailable");
            }
            return address.port;
        });

        const [firstPort] = ports;
        if (typeof firstPort !== "number") {
            throw new TypeError("Dropbox OAuth server address unavailable");
        }

        if (ports.some((candidate) => candidate !== firstPort)) {
            throw new Error(
                "Dropbox OAuth loopback listeners did not share a port"
            );
        }

        return firstPort;
    }

    private async waitForOAuthCallback(args: {
        servers: readonly http.Server[];
        timeoutMs: number;
    }): Promise<DropboxOAuthCallback> {
        return new Promise<DropboxOAuthCallback>((resolve, reject) => {
            let settled = false;
            let timeoutId: NodeJS.Timeout | null = null;

            let handleRuntimeError: (error: unknown) => void =
                handleUnexpectedOAuthRuntimeError;
            let handleRequest: (
                request: http.IncomingMessage,
                response: http.ServerResponse
            ) => void = handleUnexpectedOAuthRequest;

            function cleanup(): void {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }

                for (const server of args.servers) {
                    server.off("request", handleRequest);
                    server.off("error", handleRuntimeError);
                }
            }

            const fail = (error: unknown): void => {
                if (settled) {
                    return;
                }

                settled = true;
                cleanup();
                reject(ensureError(error));
            };

            const succeed = (result: DropboxOAuthCallback): void => {
                if (settled) {
                    return;
                }

                settled = true;
                cleanup();
                resolve(result);
            };

            function handleRuntimeErrorImpl(error: unknown): void {
                fail(error);
            }

            function handleRequestImpl(
                request: http.IncomingMessage,
                response: http.ServerResponse
            ): void {
                if (settled) {
                    response.statusCode = 410;
                    applyLoopbackResponseHeaders(
                        response,
                        "text/plain; charset=utf-8"
                    );
                    response.end("Request already handled");
                    return;
                }

                if (request.method && request.method !== "GET") {
                    response.statusCode = 405;
                    applyLoopbackResponseHeaders(
                        response,
                        "text/plain; charset=utf-8"
                    );
                    response.end("Method not allowed");
                    return;
                }

                try {
                    const rawUrl = request.url ?? "/";
                    // Only accept origin-form URIs (path + query) to avoid
                    // ambiguous absolute-form requests.
                    if (!rawUrl.startsWith("/")) {
                        response.statusCode = 400;
                        applyLoopbackResponseHeaders(
                            response,
                            "text/plain; charset=utf-8"
                        );
                        response.end("Bad request");
                        return;
                    }

                    const requestUrl = new URL(rawUrl, "http://localhost");

                    if (requestUrl.pathname !== LOOPBACK_PATH) {
                        response.statusCode = 404;
                        applyLoopbackResponseHeaders(
                            response,
                            "text/plain; charset=utf-8"
                        );
                        response.end();
                        return;
                    }

                    const code = requestUrl.searchParams.get("code");
                    const state = requestUrl.searchParams.get("state");
                    const errorDescription =
                        requestUrl.searchParams.get("error_description");

                    if (errorDescription) {
                        response.statusCode = 400;
                        applyLoopbackResponseHeaders(
                            response,
                            "text/plain; charset=utf-8"
                        );
                        response.end(`OAuth error: ${errorDescription}`);
                        fail(
                            new Error(
                                `Dropbox OAuth error: ${errorDescription}`
                            )
                        );
                        return;
                    }

                    if (!code || !state) {
                        response.statusCode = 400;
                        applyLoopbackResponseHeaders(
                            response,
                            "text/plain; charset=utf-8"
                        );
                        response.end("Missing code/state");
                        fail(
                            new Error(
                                "Dropbox OAuth callback missing code/state"
                            )
                        );
                        return;
                    }
                    response.statusCode = 200;
                    applyLoopbackResponseHeaders(
                        response,
                        "text/html; charset=utf-8"
                    );
                    response.end(
                        "<html><body><h1>Connected</h1><p>You can close this tab and return to Uptime Watcher.</p></body></html>"
                    );

                    succeed({ code, state });
                } catch (error) {
                    fail(error);
                }
            }

            handleRuntimeError = handleRuntimeErrorImpl;
            handleRequest = handleRequestImpl;

            timeoutId = setTimeout(() => {
                fail(new Error("Dropbox OAuth timed out"));
            }, args.timeoutMs);

            for (const server of args.servers) {
                server.on("request", handleRequest);
                server.on("error", handleRuntimeError);
            }
        });
    }

    private getLoopbackHostsAndRedirectHost(): {
        listenHosts: readonly string[];
        redirectHost: string;
    } {
        if (this.loopbackPort !== 0) {
            return {
                listenHosts: [LOOPBACK_IP_HOST_4, LOOPBACK_IP_HOST_6],
                redirectHost: LOOPBACK_REDIRECT_HOST,
            };
        }

        return {
            listenHosts: [LOOPBACK_IP_HOST_4],
            redirectHost: LOOPBACK_IP_HOST_4,
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

/* eslint-enable @microsoft/sdl/no-insecure-url -- End loopback OAuth URL exception. */
