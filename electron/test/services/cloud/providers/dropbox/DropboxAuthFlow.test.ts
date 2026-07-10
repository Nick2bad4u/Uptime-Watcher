/**
 * Tests for DropboxAuthFlow.
 *
 * @remarks
 * We run the loopback callback server on an ephemeral port (loopbackPort=0) to
 * avoid collisions in CI and parallel test workers.
 */

import { DropboxAuthFlow } from "@electron/services/cloud/providers/dropbox/DropboxAuthFlow";
import type { DropboxResponse } from "dropbox";
import * as http from "node:http";
import * as https from "node:https";
import { beforeEach, describe, expect, it, vi } from "vitest";

const openExternalMock = vi.hoisted(() => vi.fn(async (_url: string) => true));

vi.mock("electron", () => ({
    shell: {
        openExternal: openExternalMock,
    },
}));

beforeEach(() => {
    openExternalMock.mockReset();
});

async function httpGet(
    url: string
): Promise<{ body: string; statusCode: number }> {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const requestUrl =
            parsedUrl.protocol === "https:" &&
            parsedUrl.hostname === "127.0.0.1"
                ? new URL(
                      `http://${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}`
                  )
                : parsedUrl;
        const handleResponse = (response: http.IncomingMessage) => {
            const chunks: Buffer[] = [];
            response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
            response.on("end", () => {
                resolve({
                    statusCode: response.statusCode ?? 0,
                    body: Buffer.concat(chunks).toString("utf8"),
                });
            });
        };
        const request =
            requestUrl.protocol === "https:"
                ? https.get(requestUrl, handleResponse)
                : http.get(requestUrl, handleResponse);
        request.on("error", reject);
    });
}

describe(DropboxAuthFlow, () => {
    it("completes the PKCE flow and exchanges the authorization code for tokens", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

        let capturedRedirectUri: string | undefined;
        let capturedState: string | undefined;

        const auth = {
            setClientId: vi.fn(),
            getAuthenticationUrl: vi
                .fn<
                    (
                        redirectUri: string,
                        state?: string,
                        authType?: "code" | "token",
                        tokenAccessType?:
                            | "offline"
                            | "online"
                            | null,
                        scope?: string[],
                        includeGrantedScopes?:
                            | "none"
                            | "team"
                            | "user",
                        usePKCE?: boolean
                    ) => Promise<string>
                >()
                .mockImplementation(
                    async (
                        redirectUri,
                        state,
                        authType,
                        tokenAccessType,
                        scope,
                        includeGrantedScopes,
                        usePKCE
                    ) => {
                        capturedRedirectUri = redirectUri;
                        capturedState = state;

                        expect(authType).toBe("code");
                        expect(tokenAccessType).toBe("offline");
                        expect(includeGrantedScopes).toBe("none");
                        expect(usePKCE).toBeTruthy();

                        const scopeString = (scope ?? []).join(" ");
                        expect(scopeString).toContain("account_info.read");
                        expect(scopeString).toContain("files.content.read");
                        expect(scopeString).toContain("files.content.write");
                        expect(scopeString).toContain("files.metadata.read");

                        // Return an arbitrary URL; the flow only passes it to
                        // shell.openExternal.
                        return `https://www.dropbox.com/oauth2/authorize?redirect_uri=${encodeURIComponent(
                            redirectUri
                        )}&state=${encodeURIComponent(state ?? "")}`;
                    }
                ),
            getAccessTokenFromCode: vi
                .fn<
                    (
                        redirectUri: string,
                        code: string
                    ) => Promise<{
                        result: {
                            access_token: string;
                            expires_in: number;
                            refresh_token: string;
                        };
                    }>
                >()
                .mockImplementation(async (redirectUri, code) => {
                    expect(redirectUri).toBe(capturedRedirectUri);
                    expect(code).toBe("auth-code");

                    return {
                        result: {
                            access_token: "access",
                            expires_in: 3600,
                            refresh_token: "refresh",
                        },
                    };
                }),
        };

        openExternalMock.mockImplementation(async (url: string) => {
            expect(url).toContain("dropbox.com/oauth2/authorize");

            expect(capturedState).toBeTruthy();
            expect(capturedRedirectUri).toMatch(
                /^http:\/\/127\.0\.0\.1:\d+\/oauth2\/callback$/v
            );

            if (capturedRedirectUri === undefined) {
                throw new Error("Expected redirect URI to be captured");
            }

            if (capturedState === undefined) {
                throw new Error("Expected OAuth state to be captured");
            }

            const callbackUrl = new URL(capturedRedirectUri);
            callbackUrl.searchParams.set("code", "auth-code");
            callbackUrl.searchParams.set("state", capturedState);

            await httpGet(callbackUrl.toString());

            return true;
        });

        const flow = new DropboxAuthFlow({
            appKey: "app-key",
            authFactory: () => auth as never,
            loopbackPort: 0,
        });

        const tokens = await flow.connect({ timeoutMs: 5000 });

        expect(tokens.accessToken).toBe("access");
        expect(tokens.refreshToken).toBe("refresh");
        expect(tokens.expiresAtEpochMs).toBeGreaterThan(Date.now());

        expect(auth.getAccessTokenFromCode).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it("rejects when the callback includes an error_description", async () => {
        const auth = {
            setClientId: vi.fn(),
            getAuthenticationUrl: vi.fn(
                async (redirectUri: string, state?: string) => {
                    const url = new URL(
                        "https://www.dropbox.com/oauth2/authorize"
                    );
                    url.searchParams.set("redirect_uri", redirectUri);
                    url.searchParams.set("state", state ?? "");
                    return url.toString();
                }
            ),
            getAccessTokenFromCode: vi.fn(),
        };

        openExternalMock.mockImplementation(async (url: string) => {
            const authorizeUrl = new URL(url);
            const state = authorizeUrl.searchParams.get("state");
            const redirectUri = authorizeUrl.searchParams.get("redirect_uri");

            if (redirectUri === null || state === null) {
                throw new Error(
                    "Expected redirect_uri and state in authorize URL"
                );
            }

            const callbackUrl = new URL(redirectUri);
            callbackUrl.searchParams.set("state", state);
            callbackUrl.searchParams.set("error_description", "denied");

            await httpGet(callbackUrl.toString());
            return true;
        });

        const flow = new DropboxAuthFlow({
            appKey: "app-key",
            authFactory: () => auth,
            loopbackPort: 0,
        });

        await expect(flow.connect({ timeoutMs: 5000 })).rejects.toThrow(
            "Dropbox OAuth error: denied"
        );
        expect(auth.getAccessTokenFromCode).not.toHaveBeenCalled();
    });

    it("does not invoke accessor-backed token response result fields", async () => {
        let getterCalls = 0;
        const auth = {
            setClientId: vi.fn(),
            getAuthenticationUrl: vi.fn(
                async (redirectUri: string, state?: string) => {
                    const url = new URL(
                        "https://www.dropbox.com/oauth2/authorize"
                    );
                    url.searchParams.set("redirect_uri", redirectUri);
                    url.searchParams.set("state", state ?? "");
                    return url.toString();
                }
            ),
            getAccessTokenFromCode: vi.fn(async () => {
                const response: DropboxResponse<object> = {
                    headers: {},
                    result: {},
                    status: 200,
                };
                Object.defineProperty(response, "result", {
                    enumerable: true,
                    get: () => {
                        getterCalls += 1;
                        return {
                            access_token: "access",
                            expires_in: 3600,
                            refresh_token: "refresh",
                        };
                    },
                });

                return response;
            }),
        };

        openExternalMock.mockImplementation(async (url: string) => {
            const authorizeUrl = new URL(url);
            const state = authorizeUrl.searchParams.get("state");
            const redirectUri = authorizeUrl.searchParams.get("redirect_uri");

            if (redirectUri === null || state === null) {
                throw new Error(
                    "Expected redirect_uri and state in authorize URL"
                );
            }

            const callbackUrl = new URL(redirectUri);
            callbackUrl.searchParams.set("code", "auth-code");
            callbackUrl.searchParams.set("state", state);

            await httpGet(callbackUrl.toString());
            return true;
        });

        const flow = new DropboxAuthFlow({
            appKey: "app-key",
            authFactory: () => auth,
            loopbackPort: 0,
        });

        await expect(flow.connect({ timeoutMs: 5000 })).rejects.toThrow();
        expect(getterCalls).toBe(0);
    });

    it("rejects when the callback state does not match", async () => {
        const auth = {
            setClientId: vi.fn(),
            getAuthenticationUrl: vi.fn(
                async (redirectUri: string, state?: string) => {
                    const url = new URL(
                        "https://www.dropbox.com/oauth2/authorize"
                    );
                    url.searchParams.set("redirect_uri", redirectUri);
                    url.searchParams.set("state", state ?? "");
                    return url.toString();
                }
            ),
            getAccessTokenFromCode: vi.fn(),
        };

        openExternalMock.mockImplementation(async (url: string) => {
            const authorizeUrl = new URL(url);
            const redirectUri = authorizeUrl.searchParams.get("redirect_uri");

            if (redirectUri === null) {
                throw new Error("Expected redirect_uri in authorize URL");
            }

            const callbackUrl = new URL(redirectUri);
            callbackUrl.searchParams.set("code", "auth-code");
            callbackUrl.searchParams.set("state", "wrong");

            await httpGet(callbackUrl.toString());
            return true;
        });

        const flow = new DropboxAuthFlow({
            appKey: "app-key",
            authFactory: () => auth,
            loopbackPort: 0,
        });

        await expect(flow.connect({ timeoutMs: 5000 })).rejects.toThrow(
            "Dropbox OAuth state mismatch"
        );
        expect(auth.getAccessTokenFromCode).not.toHaveBeenCalled();
    });

    it("does not abandon a callback promise when browser launch fails", async () => {
        let callbackPort: number | undefined;
        const auth = {
            setClientId: vi.fn(),
            getAuthenticationUrl: vi.fn(
                async (redirectUri: string, state?: string) => {
                    callbackPort = Number(new URL(redirectUri).port);
                    const url = new URL(
                        "https://www.dropbox.com/oauth2/authorize"
                    );
                    url.searchParams.set("redirect_uri", redirectUri);
                    url.searchParams.set("state", state ?? "");
                    return url.toString();
                }
            ),
            getAccessTokenFromCode: vi.fn(),
        };
        openExternalMock.mockRejectedValue(new Error("browser unavailable"));
        const unhandledRejection = vi.fn();
        process.on("unhandledRejection", unhandledRejection);

        try {
            const flow = new DropboxAuthFlow({
                appKey: "app-key",
                authFactory: () => auth,
                loopbackPort: 0,
            });

            await expect(flow.connect({ timeoutMs: 5000 })).rejects.toThrow(
                "Failed to open Dropbox OAuth URL"
            );
            await new Promise((resolve) => setImmediate(resolve));

            expect(unhandledRejection).not.toHaveBeenCalled();
            expect(auth.getAccessTokenFromCode).not.toHaveBeenCalled();
            if (callbackPort === undefined || callbackPort === 0) {
                throw new Error("Expected an ephemeral callback port");
            }

            const probeAuth = {
                setClientId: vi.fn(),
                getAuthenticationUrl: vi.fn(
                    async () => "https://example.test/oauth2"
                ),
                getAccessTokenFromCode: vi.fn(),
            };
            const probeFlow = new DropboxAuthFlow({
                appKey: "app-key",
                authFactory: () => probeAuth,
                loopbackPort: callbackPort,
            });

            await expect(
                probeFlow.connect({ timeoutMs: 5000 })
            ).rejects.toThrow(/unexpected dropbox oauth url host/iu);
        } finally {
            process.off("unhandledRejection", unhandledRejection);
        }
    });

    it("rejects unexpected authorization URL hosts before opening the browser", async () => {
        const auth = {
            setClientId: vi.fn(),
            getAuthenticationUrl: vi.fn(
                async (redirectUri: string, state?: string) => {
                    const url = new URL("https://example.test/oauth2");
                    url.searchParams.set("redirect_uri", redirectUri);
                    url.searchParams.set("state", state ?? "");
                    return url.toString();
                }
            ),
            getAccessTokenFromCode: vi.fn(),
        };

        const flow = new DropboxAuthFlow({
            appKey: "app-key",
            authFactory: () => auth,
            loopbackPort: 0,
        });

        await expect(flow.connect({ timeoutMs: 5000 })).rejects.toThrow(
            /unexpected dropbox oauth url host/iu
        );
        expect(openExternalMock).not.toHaveBeenCalled();
        expect(auth.getAccessTokenFromCode).not.toHaveBeenCalled();
    });
});
