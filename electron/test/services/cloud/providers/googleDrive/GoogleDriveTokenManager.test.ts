import { describe, expect, it, vi, beforeEach } from "vitest";

import { InMemorySecretStore } from "../../../../utils/InMemorySecretStore";
import { GoogleDriveTokenManager } from "@electron/services/cloud/providers/googleDrive/GoogleDriveTokenManager";

const axiosPost = vi.hoisted(() => vi.fn());

vi.mock("axios", () => ({
    default: {
        isAxiosError: (candidate: unknown): boolean =>
            typeof candidate === "object" &&
            candidate !== null &&
            Boolean((candidate as { isAxiosError?: unknown }).isAxiosError),
        post: axiosPost,
    },
}));

describe(GoogleDriveTokenManager, () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns existing access token when not near expiry", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        const now = Date.now();
        await manager.setTokens({
            accessToken: "access",
            expiresAt: now + 5 * 60_000,
            refreshToken: "refresh",
        });

        await expect(manager.getValidAccessToken()).resolves.toBe("access");
        expect(axiosPost).not.toHaveBeenCalled();
    });

    it("refreshes expired tokens and does not persist undefined optional fields", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        const now = Date.now();
        await manager.setTokens({
            accessToken: "old-access",
            expiresAt: now - 1,
            refreshToken: "refresh",
        });

        axiosPost.mockResolvedValueOnce({
            data: {
                access_token: "new-access",
                expires_in: 3600,
                // no scope / token_type returned
            },
        });

        await expect(manager.getValidAccessToken()).resolves.toBe("new-access");

        const raw = await secretStore.getSecret("cloud.googleDrive.tokens");
        expect(raw).toBeTruthy();
        expect(raw).not.toContain('"scope"');
        expect(raw).not.toContain('"tokenType"');

        expect(axiosPost).toHaveBeenCalledWith(
            "https://oauth2.googleapis.com/token",
            expect.stringContaining("grant_type=refresh_token"),
            expect.any(Object)
        );
    });

    it("deduplicates concurrent refreshes", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        await manager.setTokens({
            accessToken: "old-access",
            expiresAt: Date.now() - 1,
            refreshToken: "refresh",
        });

        axiosPost.mockResolvedValueOnce({
            data: {
                access_token: "new-access",
                expires_in: 3600,
            },
        });

        const [token1, token2] = await Promise.all([
            manager.getValidAccessToken(),
            manager.getValidAccessToken(),
        ]);

        expect(token1).toBe("new-access");
        expect(token2).toBe("new-access");
        expect(axiosPost).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it("revoke is best-effort and always clears stored tokens", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        await manager.setTokens({
            accessToken: "access",
            expiresAt: Date.now() + 1,
            refreshToken: "refresh",
        });

        axiosPost.mockRejectedValueOnce(new Error("network down"));

        await expect(manager.revoke()).resolves.toBeUndefined();
        await expect(manager.getTokens()).resolves.toBeUndefined();
    });

    it("treats invalid stored JSON as disconnected", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        await secretStore.setSecret("cloud.googleDrive.tokens", "not-json");

        await expect(manager.getTokens()).resolves.toBeUndefined();
        await expect(manager.isConnected()).resolves.toBeFalsy();
    });

    it("treats invalid stored token shape as disconnected", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        await secretStore.setSecret(
            "cloud.googleDrive.tokens",
            JSON.stringify({ accessToken: "", expiresAt: -1, refreshToken: "" })
        );

        await expect(manager.getTokens()).resolves.toBeUndefined();
    });

    it("redacts secrets from OAuth refresh error details", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        await manager.setTokens({
            accessToken: "old-access",
            expiresAt: Date.now() - 1,
            refreshToken: "SUPER_SECRET_REFRESH_TOKEN",
        });

        axiosPost.mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                data: {
                    error: "invalid_grant",
                    error_description:
                        "refresh_token=SUPER_SECRET_REFRESH_TOKEN was rejected",
                },
            },
        });

        let thrown: unknown;
        try {
            await manager.getValidAccessToken();
        } catch (error) {
            thrown = error;
        }

        expect(thrown).toBeInstanceOf(Error);
        const message = (thrown as Error).message;
        expect(message).toMatch(/google oauth refresh failed/i);
        expect(message).not.toContain("SUPER_SECRET_REFRESH_TOKEN");
        expect(message).toContain("refresh_token=[redacted]");
    });
});
