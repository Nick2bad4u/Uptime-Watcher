import { DropboxTokenManager } from "@electron/services/cloud/providers/dropbox/DropboxTokenManager";
import { InMemorySecretStore } from "@electron/test/utils/InMemorySecretStore";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import type { DropboxResponse } from "dropbox";
import { describe, expect, it, vi } from "vitest";

const createVoidDropboxResponse = (): DropboxResponse<void> => ({
    headers: {},
    result: undefined,
    status: 200,
});

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
            authFactory: () => ({
                getAccessToken,
                getAccessTokenExpiresAt,
                getRefreshToken: () => "refresh",
                refreshAccessToken,
                setAccessToken: () => {},
                setAccessTokenExpiresAt: () => {},
                setClientId: () => {},
                setRefreshToken: () => {},
            }),
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

    it("persists a rotated refresh token when Dropbox returns one", async () => {
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
            authFactory: () => ({
                getAccessToken,
                getAccessTokenExpiresAt,
                getRefreshToken: () => "rotated-refresh",
                refreshAccessToken,
                setAccessToken: () => {},
                setAccessTokenExpiresAt: () => {},
                setClientId: () => {},
                setRefreshToken: () => {},
            }),
        });

        await manager.storeTokens({
            accessToken: "old-access",
            expiresAtEpochMs: Date.now() - 1,
            refreshToken: "old-refresh",
        });

        await expect(manager.getAccessToken()).resolves.toBe("new-access");

        const stored = await manager.getStoredTokens();
        expect(stored?.refreshToken).toBe("rotated-refresh");

        vi.useRealTimers();
    });

    it("does not invoke shadowed Date methods while refreshing tokens", async () => {
        const secretStore = new InMemorySecretStore();
        const expiresAt = new Date("2025-01-01T01:00:00.000Z");
        const getTime = vi.fn(() => {
            throw new Error("date getTime should not run");
        });
        Object.defineProperty(expiresAt, "getTime", {
            value: getTime,
        });

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
            authFactory: () => ({
                getAccessToken: () => "new-access",
                getAccessTokenExpiresAt: () => expiresAt,
                getRefreshToken: () => "refresh",
                refreshAccessToken: async () => undefined,
                setAccessToken: () => {},
                setAccessTokenExpiresAt: () => {},
                setClientId: () => {},
                setRefreshToken: () => {},
            }),
        });

        await expect(
            manager.refreshTokens({
                accessToken: "old-access",
                expiresAtEpochMs: Date.now() - 1,
                refreshToken: "refresh",
            })
        ).resolves.toEqual({
            accessToken: "new-access",
            expiresAtEpochMs: 1_735_693_200_000,
            refreshToken: "refresh",
        });
        expect(getTime).not.toHaveBeenCalled();
    });

    it("deduplicates concurrent refreshes", async () => {
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
            authFactory: () => ({
                getAccessToken,
                getAccessTokenExpiresAt,
                getRefreshToken: () => "refresh",
                refreshAccessToken,
                setAccessToken: () => {},
                setAccessTokenExpiresAt: () => {},
                setClientId: () => {},
                setRefreshToken: () => {},
            }),
        });

        await manager.storeTokens({
            accessToken: "old-access",
            expiresAtEpochMs: Date.now() - 1,
            refreshToken: "refresh",
        });

        const [token1, token2] = await Promise.all([
            manager.getAccessToken(),
            manager.getAccessToken(),
        ]);

        expect(token1).toBe("new-access");
        expect(token2).toBe("new-access");
        expect(refreshAccessToken).toHaveBeenCalledTimes(1);

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
        await expect(manager.getAccessToken()).rejects.toThrow(
            /dropbox is not connected/iv
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

    it("rejects token expirations outside the JavaScript Date range before storing", async () => {
        const secretStore = new InMemorySecretStore();

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
        });

        await expect(
            manager.storeTokens({
                accessToken: "access",
                expiresAtEpochMs: MAX_VALID_DATE_EPOCH_MS + 1,
                refreshToken: "refresh",
            })
        ).rejects.toThrow();

        await expect(
            secretStore.getSecret("cloud.dropbox.tokens")
        ).resolves.toBeUndefined();
    });

    it("treats stored expirations outside the JavaScript Date range as disconnected", async () => {
        const secretStore = new InMemorySecretStore();

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
        });

        await secretStore.setSecret(
            "cloud.dropbox.tokens",
            JSON.stringify({
                accessToken: "access",
                expiresAtEpochMs: MAX_VALID_DATE_EPOCH_MS + 1,
                refreshToken: "refresh",
            })
        );

        await expect(manager.getStoredTokens()).resolves.toBeUndefined();
    });

    it("clears stored tokens after successful revoke", async () => {
        const secretStore = new InMemorySecretStore();
        const authTokenRevoke = vi.fn(async () => createVoidDropboxResponse());

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            clientFactory: () => ({ authTokenRevoke }),
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
        });

        await manager.storeTokens({
            accessToken: "access",
            expiresAtEpochMs: Date.now() + 10 * 60_000,
            refreshToken: "refresh",
        });

        await expect(manager.revokeStoredTokens()).resolves.toBeUndefined();

        expect(authTokenRevoke).toHaveBeenCalledTimes(1);
        await expect(manager.getStoredTokens()).resolves.toBeUndefined();
        await expect(
            secretStore.getSecret("cloud.dropbox.tokens")
        ).resolves.toBeUndefined();
    });

    it("clears stored tokens when revoke fails", async () => {
        const secretStore = new InMemorySecretStore();
        const authTokenRevoke = vi.fn(async () => {
            throw new Error("network down");
        });

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            clientFactory: () => ({ authTokenRevoke }),
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
        });

        await manager.storeTokens({
            accessToken: "access",
            expiresAtEpochMs: Date.now() + 10 * 60_000,
            refreshToken: "refresh",
        });

        await expect(manager.revokeStoredTokens()).resolves.toBeUndefined();

        expect(authTokenRevoke).toHaveBeenCalledTimes(1);
        await expect(manager.getStoredTokens()).resolves.toBeUndefined();
        await expect(
            secretStore.getSecret("cloud.dropbox.tokens")
        ).resolves.toBeUndefined();
    });
});
