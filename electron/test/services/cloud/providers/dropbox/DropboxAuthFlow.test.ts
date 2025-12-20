/**
 * Tests for DropboxAuthFlow.
 *
 * @remarks
 * We run the loopback callback server on an ephemeral port (loopbackPort=0) to
 * avoid collisions in CI and parallel test workers.
 */

import http from "node:http";

import { describe, expect, it, vi } from "vitest";

const openExternalMock = vi.hoisted(() => vi.fn(async (_url: string) => true));

vi.mock("electron", () => ({
    shell: {
        openExternal: openExternalMock,
    },
}));

import {
    DEFAULT_DROPBOX_LOOPBACK_PORT,
    DropboxAuthFlow,
} from "@electron/services/cloud/providers/dropbox/DropboxAuthFlow";

function httpGet(url: string): Promise<{ statusCode: number; body: string }> {
    return new Promise((resolve, reject) => {
        const request = http.get(url, (response) => {
            const chunks: Buffer[] = [];
            response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
            response.on("end", () => {
                resolve({
                    statusCode: response.statusCode ?? 0,
                    body: Buffer.concat(chunks).toString("utf8"),
                });
            });
        });
        request.on("error", reject);
    });
}

describe(DropboxAuthFlow, () => {
    it("exposes a fixed default loopback port", () => {
        expect(DEFAULT_DROPBOX_LOOPBACK_PORT).toBe(53_682);
    });

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
                        authType?: "token" | "code",
                        tokenAccessType?:
                            | null
                            | "legacy"
                            | "offline"
                            | "online",
                        scope?: string[],
                        includeGrantedScopes?: "none" | "user" | "team",
                        usePKCE?: boolean
                    ) => Promise<string>
                >()
                .mockImplementation(async (
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
                }),
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
                    /^http:\/\/127\.0\.0\.1:\d+\/oauth2\/callback$/u
            );

            const callbackUrl = new URL(capturedRedirectUri!);
            callbackUrl.searchParams.set("code", "auth-code");
            callbackUrl.searchParams.set("state", capturedState!);

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
            getAuthenticationUrl: vi.fn(async (
                redirectUri: string,
                state?: string
            ) => {
                const url = new URL("https://example.test");
                url.searchParams.set("redirect_uri", redirectUri);
                url.searchParams.set("state", state ?? "");
                return url.toString();
            }),
            getAccessTokenFromCode: vi.fn(),
        };

        openExternalMock.mockImplementation(async (url: string) => {
            const authorizeUrl = new URL(url);
            const state = authorizeUrl.searchParams.get("state");
            const redirectUri = authorizeUrl.searchParams.get("redirect_uri");

            const callbackUrl = new URL(redirectUri!);
            callbackUrl.searchParams.set("state", state!);
            callbackUrl.searchParams.set("error_description", "denied");

            await httpGet(callbackUrl.toString());
            return true;
        });

        const flow = new DropboxAuthFlow({
            appKey: "app-key",
            authFactory: () => auth as never,
            loopbackPort: 0,
        });

        await expect(flow.connect({ timeoutMs: 5000 })).rejects.toThrowError(
            "Dropbox OAuth error: denied"
        );
        expect(auth.getAccessTokenFromCode).not.toHaveBeenCalled();
    });

    it("rejects when the callback state does not match", async () => {
        const auth = {
            setClientId: vi.fn(),
            getAuthenticationUrl: vi.fn(async (
                redirectUri: string,
                state?: string
            ) => {
                const url = new URL("https://example.test");
                url.searchParams.set("redirect_uri", redirectUri);
                url.searchParams.set("state", state ?? "");
                return url.toString();
            }),
            getAccessTokenFromCode: vi.fn(),
        };

        openExternalMock.mockImplementation(async (url: string) => {
            const authorizeUrl = new URL(url);
            const redirectUri = authorizeUrl.searchParams.get("redirect_uri");

            const callbackUrl = new URL(redirectUri!);
            callbackUrl.searchParams.set("code", "auth-code");
            callbackUrl.searchParams.set("state", "wrong");

            await httpGet(callbackUrl.toString());
            return true;
        });

        const flow = new DropboxAuthFlow({
            appKey: "app-key",
            authFactory: () => auth as never,
            loopbackPort: 0,
        });

        await expect(flow.connect({ timeoutMs: 5000 })).rejects.toThrowError(
            "Dropbox OAuth state mismatch"
        );
        expect(auth.getAccessTokenFromCode).not.toHaveBeenCalled();
    });
});
