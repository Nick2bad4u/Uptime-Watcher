/* eslint-disable @microsoft/sdl/no-insecure-url -- OAuth loopback redirects require http://localhost; https would require local certificates. */

import type { IncomingMessage, Server, ServerResponse } from "node:http";

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
    response.end(
        `<!doctype html><html><head><meta charset="utf-8" /><title>${args.title}</title></head><body><h2>${args.title}</h2><p>${args.body}</p></body></html>`
    );
}

function parseCallback(request: IncomingMessage): {
    readonly code: null | string;
    readonly error: null | string;
    readonly pathOk: boolean;
    readonly state: null | string;
} {
    const url = new URL(request.url ?? "/", "http://localhost");
    const pathOk = url.pathname === DEFAULT_OAUTH_LOOPBACK_PATH;

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
}): Promise<LoopbackOAuthServer> {
    const port = args?.port ?? DEFAULT_OAUTH_LOOPBACK_PORT;
    const redirectHost = args?.redirectHost ?? "localhost";

    const redirectUri = `http://${redirectHost}:${port}${DEFAULT_OAUTH_LOOPBACK_PATH}`;

    let resolved = false;
    let resolvePromise: ((value: LoopbackOAuthCallback) => void) | null = null;
    let rejectPromise: ((error: unknown) => void) | null = null;

    const callbackPromise = new Promise<LoopbackOAuthCallback>((
        resolve,
        reject
    ) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });

    const servers = LOOPBACK_HOSTS.map((host) => {
        const server = createServer((request, response) => {
            const parsed = parseCallback(request);

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
                    body: `Authorization failed: ${parsed.error}`,
                    statusCode: 400,
                    title: "Authorization failed",
                });

                if (!resolved) {
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

    await Promise.all(
        servers.map(async ({ host, server }) => {
            await listenHttpServer(server, { host, port });
        })
    );

    return {
        close: async (): Promise<void> => {
            await Promise.all(
                servers.map(({ server }) => closeHttpServer(server))
            );
        },
        redirectUri,
        waitForCallback: async ({
            expectedState,
            timeoutMs,
        }): Promise<LoopbackOAuthCallback> => {
            const timeoutHandle = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    rejectPromise?.(new Error("OAuth loopback timeout"));
                }
            }, timeoutMs);

            try {
                const callback = await callbackPromise;

                if (callback.state !== expectedState) {
                    throw new Error("OAuth state mismatch");
                }

                return callback;
            } finally {
                clearTimeout(timeoutHandle);
            }
        },
    };
}

/* eslint-enable @microsoft/sdl/no-insecure-url -- End loopback OAuth URL exception. */
