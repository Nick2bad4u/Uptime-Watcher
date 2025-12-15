/**
 * Tests for DropboxAuthFlow.
 *
 * @remarks
 * We run the loopback callback server on an ephemeral port (loopbackPort=0) to
 * avoid collisions in CI and parallel test workers.
 */

import type { AxiosInstance } from "axios";

import http from "node:http";

import { describe, expect, it, vi, type Mock } from "vitest";

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

        const httpClient: Pick<AxiosInstance, "post"> = {
            post: vi.fn().mockResolvedValue({
                data: {
                    access_token: "access",
                    expires_in: 3600,
                    refresh_token: "refresh",
                },
            }),
        };

        openExternalMock.mockImplementation(async (url: string) => {
            const authorizeUrl = new URL(url);
            const state = authorizeUrl.searchParams.get("state");
            const redirectUri = authorizeUrl.searchParams.get("redirect_uri");

            expect(authorizeUrl.searchParams.get("client_id")).toBe("app-key");
            expect(authorizeUrl.searchParams.get("response_type")).toBe("code");
            expect(authorizeUrl.searchParams.get("token_access_type")).toBe(
                "offline"
            );

            const scope = authorizeUrl.searchParams.get("scope") ?? "";
            expect(scope).toContain("account_info.read");
            expect(scope).toContain("files.content.read");

            expect(state).toBeTruthy();
            expect(redirectUri).toMatch(
                /^http:\/\/127\.0\.0\.1:\d+\/oauth2\/callback$/v
            );

            const callbackUrl = new URL(redirectUri!);
            callbackUrl.searchParams.set("code", "auth-code");
            callbackUrl.searchParams.set("state", state!);

            await httpGet(callbackUrl.toString());

            return true;
        });

        const flow = new DropboxAuthFlow({
            appKey: "app-key",
            httpClient: httpClient as AxiosInstance,
            loopbackPort: 0,
        });

        const tokens = await flow.connect({ timeoutMs: 5000 });

        expect(tokens.accessToken).toBe("access");
        expect(tokens.refreshToken).toBe("refresh");
        expect(tokens.expiresAtEpochMs).toBeGreaterThan(Date.now());

        expect(httpClient.post).toHaveBeenCalledTimes(1);
        const postMock = httpClient.post as unknown as Mock;
        const [tokenUrl, body] = postMock.mock.calls[0] ?? [];
        expect(String(tokenUrl)).toContain("/oauth2/token");

        const params = body as URLSearchParams;
        expect(params.get("client_id")).toBe("app-key");
        expect(params.get("code")).toBe("auth-code");
        expect(params.get("grant_type")).toBe("authorization_code");
        expect(params.get("redirect_uri")).toMatch(
            /^http:\/\/127\.0\.0\.1:\d+\/oauth2\/callback$/v
        );
        expect(params.get("code_verifier")).toBeTruthy();

        vi.useRealTimers();
    });

    it("rejects when the callback includes an error_description", async () => {
        const httpClient: Pick<AxiosInstance, "post"> = {
            post: vi.fn(),
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
            httpClient: httpClient as AxiosInstance,
            loopbackPort: 0,
        });

        await expect(flow.connect({ timeoutMs: 5000 })).rejects.toThrowError(
            "Dropbox OAuth error: denied"
        );
        expect(httpClient.post).not.toHaveBeenCalled();
    });

    it("rejects when the callback state does not match", async () => {
        const httpClient: Pick<AxiosInstance, "post"> = {
            post: vi.fn(),
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
            httpClient: httpClient as AxiosInstance,
            loopbackPort: 0,
        });

        await expect(flow.connect({ timeoutMs: 5000 })).rejects.toThrowError(
            "Dropbox OAuth state mismatch"
        );
        expect(httpClient.post).not.toHaveBeenCalled();
    });
});
