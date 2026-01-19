/* eslint-disable @microsoft/sdl/no-insecure-url -- OAuth loopback redirects require http://localhost; https would require local certificates. */

import type { IncomingMessage, Server, ServerResponse } from "node:http";

import { ensureError } from "@shared/utils/errorHandling";
import { isRecord } from "@shared/utils/typeHelpers";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";

/**
 * Default port for all OAuth loopback flows.
 *
 * @remarks
 * Must remain stable because some providers require redirect URIs to be
 * registered explicitly.
 */
export const DEFAULT_OAUTH_LOOPBACK_PORT = 53_682;

/**
 * Default path for all OAuth loopback callbacks.
 *
 * @remarks
 * Google’s native/desktop OAuth guidance allows a loopback redirect to include
 * an optional path component (for example `/oauth2redirect`). We keep a stable
 * path here because some providers (e.g. Dropbox) require an exact redirect URI
 * to be registered.
 *
 * @see https://developers.google.com/identity/protocols/oauth2/native-app#redirect-uri_loopback
 */
export const DEFAULT_OAUTH_LOOPBACK_PATH = "/oauth2/callback";

const LOOPBACK_HOSTS = ["127.0.0.1", "::1"] as const;

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function assertSafeRedirectHost(redirectHost: string): void {
    // The redirect host is interpolated into the redirect URI.
    // Restrict it to typical loopback values to avoid accidental exposure.
    switch (redirectHost) {
        case "127.0.0.1":
        case "[::1]":
        case "localhost": {
            return;
        }

        default: {
            throw new Error(
                `Invalid redirectHost '${redirectHost}'. Expected one of: localhost, 127.0.0.1, [::1].`
            );
        }
    }
}

async function closeHttpServer(server: Server): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

async function listenHttpServer(
    server: Server,
    args: { host: string; port: number }
): Promise<void> {
    server.listen(args.port, args.host);
    await once(server, "listening");
}

/**
 * Result returned from {@link LoopbackOAuthServer.waitForCallback}.
 */
export interface LoopbackOAuthCallback {
    readonly code: string;
    readonly state: string;
}

/**
 * A loopback HTTP server used to capture OAuth redirects.
 */
export interface LoopbackOAuthServer {
    /**
     * Closes all underlying HTTP servers.
     */
    close: () => Promise<void>;

    readonly redirectUri: string;

    /**
     * Wait for the next OAuth callback.
     *
     * @throws If the server is closed or the timeout elapses.
     */
    waitForCallback: (args: {
        expectedState: string;
        timeoutMs: number;
    }) => Promise<LoopbackOAuthCallback>;
}

function writeHtml(
    response: ServerResponse,
    args: { body: string; statusCode: number; title: string }
): void {
    response.statusCode = args.statusCode;
    response.setHeader("Content-Type", "text/html; charset=utf-8");

    // Defensive security headers for the browser page.
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    );

    const title = escapeHtml(args.title);
    const body = escapeHtml(args.body);

    response.end(
        `<!doctype html><html><head><meta charset="utf-8" /><title>${title}</title></head><body><h2>${title}</h2><p>${body}</p></body></html>`
    );
}

function normalizeRedirectPath(path: string): string {
    if (path === "" || path === "/") {
        return "/";
    }

    return path.startsWith("/") ? path : `/${path}`;
}

function parseCallbackWithExpectedPath(
    request: IncomingMessage,
    expectedPath: string
): {
    readonly code: null | string;
    readonly error: null | string;
    readonly pathOk: boolean;
    readonly state: null | string;
} {
    const url = new URL(request.url ?? "/", "http://localhost");
    const pathOk = url.pathname === expectedPath;

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    return {
        code,
        error,
        pathOk,
        state,
    };
}

/**
 * Generates a cryptographically strong OAuth state value.
 */
export function createOAuthState(): string {
    return randomBytes(24).toString("base64url");
}

/**
 * Starts a loopback OAuth server.
 *
 * @remarks
 * The server listens on both IPv4 and IPv6 loopback addresses to support
 * environments where `localhost` resolves to `::1`.
 */
export async function startLoopbackOAuthServer(args?: {
    readonly port?: number;
    readonly redirectHost?: string;
    /**
     * Optional path portion of the redirect URI.
     *
     * @remarks
     * Some providers (e.g. Google) recommend loopback redirect URIs without an
     * explicit path (e.g. `http://127.0.0.1:{port}`). Others require a fixed
     * callback path. This option supports both patterns.
     */
    readonly redirectPath?: string;
}): Promise<LoopbackOAuthServer> {
    const port = args?.port ?? DEFAULT_OAUTH_LOOPBACK_PORT;
    const redirectHost = args?.redirectHost ?? "localhost";
    const redirectPathRaw = args?.redirectPath;
    const expectedPath = normalizeRedirectPath(
        redirectPathRaw ?? DEFAULT_OAUTH_LOOPBACK_PATH
    );
    const omitPath = redirectPathRaw !== undefined && expectedPath === "/";

    assertSafeRedirectHost(redirectHost);

    const requiresIpv6 = redirectHost === "[::1]";

    const origin = `http://${redirectHost}:${port}`;
    const redirectUri = omitPath ? origin : `${origin}${expectedPath}`;

    let resolved = false;
    let resolvePromise: ((value: LoopbackOAuthCallback) => void) | null = null;
    let rejectPromise: ((error: unknown) => void) | null = null;
    let expectedStateValue: null | string = null;
    let pendingCallback: LoopbackOAuthCallback | null = null;

    const callbackPromise = new Promise<LoopbackOAuthCallback>(
        (resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
        }
    );

    const servers = LOOPBACK_HOSTS.map((host) => {
        const server = createServer((request, response) => {
            if (request.method && request.method !== "GET") {
                writeHtml(response, {
                    body: "Method not allowed.",
                    statusCode: 405,
                    title: "Uptime Watcher OAuth",
                });
                return;
            }

            const parsed = parseCallbackWithExpectedPath(request, expectedPath);

            if (!parsed.pathOk) {
                writeHtml(response, {
                    body: "Unexpected callback path.",
                    statusCode: 404,
                    title: "Uptime Watcher OAuth",
                });
                return;
            }

            if (parsed.error) {
                writeHtml(response, {
                    body: "Authorization failed. Please return to the app to retry.",
                    statusCode: 400,
                    title: "Authorization failed",
                });

                if (!resolved && expectedStateValue !== null) {
                    resolved = true;
                    rejectPromise?.(new Error(parsed.error));
                }

                return;
            }

            if (!parsed.code || !parsed.state) {
                writeHtml(response, {
                    body: "Missing required callback parameters.",
                    statusCode: 400,
                    title: "Authorization failed",
                });
                return;
            }

            if (
                expectedStateValue !== null &&
                parsed.state !== expectedStateValue
            ) {
                writeHtml(response, {
                    body: "OAuth state mismatch. Please retry the authorization flow.",
                    statusCode: 400,
                    title: "Authorization failed",
                });
                return;
            }

            if (expectedStateValue === null) {
                // The server can receive the callback before the app begins
                // awaiting it (race between opening the system browser and
                // awaiting waitForCallback()). Buffer the first callback and
                // avoid displaying a misleading "Connected" success page.
                pendingCallback ??= {
                    code: parsed.code,
                    state: parsed.state,
                };

                writeHtml(response, {
                    body: "Authorization received. Please return to the app to finish connecting.",
                    statusCode: 200,
                    title: "Authorization received",
                });
                return;
            }

            writeHtml(response, {
                body: "Authorization received. You can close this window and return to the app.",
                statusCode: 200,
                title: "Connected",
            });

            if (!resolved) {
                resolved = true;
                resolvePromise?.({ code: parsed.code, state: parsed.state });
            }
        });

        return { host, server };
    });

    // Listen on both IPv4 and IPv6 loopback when possible.
    // Some environments may not have ::1 configured; in that case we proceed
    // with IPv4 only.
    await Promise.all(
        servers.map(async ({ host, server }) => {
            try {
                await listenHttpServer(server, { host, port });
            } catch (error: unknown) {
                const normalizedError = ensureError(error);
                const code = isRecord(error) ? error["code"] : undefined;

                if (host === "::1" && code === "EADDRNOTAVAIL") {
                    if (requiresIpv6) {
                        await closeHttpServer(server).catch(() => {});
                        throw new Error(
                            "IPv6 loopback (::1) is not available but redirectHost is set to [::1]",
                            { cause: error }
                        );
                    }

                    await closeHttpServer(server).catch(() => {});
                    return;
                }

                await closeHttpServer(server).catch(() => {});
                throw normalizedError;
            }
        })
    );

    return {
        close: async (): Promise<void> => {
            await Promise.all(
                servers.map(async ({ server }) => {
                    if (!server.listening) {
                        return;
                    }

                    await closeHttpServer(server).catch(() => {});
                })
            );
        },
        redirectUri,
        waitForCallback: async ({
            expectedState,
            timeoutMs,
        }): Promise<LoopbackOAuthCallback> => {
            expectedStateValue = expectedState;

            if (
                pendingCallback?.state === expectedStateValue &&
                !resolved
            ) {
                resolved = true;
                resolvePromise?.(pendingCallback);
                pendingCallback = null;
            } else if (pendingCallback) {
                pendingCallback = null;
            }

            const timeoutHandle = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    rejectPromise?.(new Error("OAuth loopback timeout"));
                }
            }, timeoutMs);

            try {
                const callback = await callbackPromise;

                if (callback.state !== expectedStateValue) {
                    throw new Error("OAuth state mismatch");
                }

                return callback;
            } finally {
                clearTimeout(timeoutHandle);
                expectedStateValue = null;
            }
        },
    };
}

/* eslint-enable @microsoft/sdl/no-insecure-url -- End loopback OAuth URL exception. */
