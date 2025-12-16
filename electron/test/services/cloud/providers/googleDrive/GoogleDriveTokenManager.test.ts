import { describe, expect, it, vi, beforeEach } from "vitest";

import { InMemorySecretStore } from "../../../../utils/InMemorySecretStore";
import { GoogleDriveTokenManager } from "@electron/services/cloud/providers/googleDrive/GoogleDriveTokenManager";

const axiosPost = vi.hoisted(() => vi.fn());

vi.mock("axios", () => ({
    default: {
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
        expect(raw).not.toContain("\"scope\"");
        expect(raw).not.toContain("\"tokenType\"");

        expect(axiosPost).toHaveBeenCalledWith(
            "https://oauth2.googleapis.com/token",
            expect.stringContaining("grant_type=refresh_token"),
            expect.any(Object)
        );
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
});
