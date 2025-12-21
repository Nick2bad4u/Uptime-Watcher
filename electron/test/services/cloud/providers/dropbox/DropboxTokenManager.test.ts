import { describe, expect, it, vi } from "vitest";

import { DropboxTokenManager } from "@electron/services/cloud/providers/dropbox/DropboxTokenManager";
import { InMemorySecretStore } from "@electron/test/utils/InMemorySecretStore";

describe(DropboxTokenManager, () => {
    it("returns stored access token when not expired", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

        const secretStore = new InMemorySecretStore();

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
        });

        await manager.storeTokens({
            accessToken: "access",
            expiresAtEpochMs: Date.now() + 10 * 60_000,
            refreshToken: "refresh",
        });

        await expect(manager.getAccessToken()).resolves.toBe("access");

        vi.useRealTimers();
    });

    it("refreshes tokens when near expiry and persists the refreshed access token", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

        const secretStore = new InMemorySecretStore();

        const refreshAccessToken = vi.fn(async () => undefined);
        const getAccessToken = vi.fn(() => "new-access");
        const getAccessTokenExpiresAt = vi.fn(
            () => new Date(Date.now() + 3_600_000)
        );

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
            authFactory: () =>
                ({
                    getAccessToken,
                    getAccessTokenExpiresAt,
                    getRefreshToken: () => "refresh",
                    refreshAccessToken,
                    setAccessToken: () => {},
                    setAccessTokenExpiresAt: () => {},
                    setClientId: () => {},
                    setRefreshToken: () => {},
                }) as never,
        });

        await manager.storeTokens({
            accessToken: "old-access",
            expiresAtEpochMs: Date.now() - 1,
            refreshToken: "refresh",
        });

        await expect(manager.getAccessToken()).resolves.toBe("new-access");
        expect(refreshAccessToken).toHaveBeenCalledTimes(1);

        const stored = await manager.getStoredTokens();
        expect(stored?.accessToken).toBe("new-access");
        expect(stored?.refreshToken).toBe("refresh");
        expect(stored?.expiresAtEpochMs).toBeGreaterThan(Date.now());

        vi.useRealTimers();
    });

    it("treats invalid stored JSON as disconnected", async () => {
        const secretStore = new InMemorySecretStore();

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
        });

        await secretStore.setSecret("cloud.dropbox.tokens", "not-json");

        await expect(manager.getStoredTokens()).resolves.toBeUndefined();
        await expect(manager.getAccessToken()).rejects.toThrowError(
            /Dropbox is not connected/iu
        );
    });

    it("treats invalid stored token shape as disconnected", async () => {
        const secretStore = new InMemorySecretStore();

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
        });

        await secretStore.setSecret(
            "cloud.dropbox.tokens",
            JSON.stringify({ accessToken: "", expiresAtEpochMs: -1 })
        );

        await expect(manager.getStoredTokens()).resolves.toBeUndefined();
    });
});
