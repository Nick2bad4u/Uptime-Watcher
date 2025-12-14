import type { AxiosInstance } from "axios";

import { describe, expect, it, vi } from "vitest";

import { DropboxTokenManager } from "@electron/services/cloud/providers/dropbox/DropboxTokenManager";
import { InMemorySecretStore } from "@electron/test/utils/InMemorySecretStore";

describe(DropboxTokenManager, () => {
    it("returns stored access token when not expired", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

        const secretStore = new InMemorySecretStore();
        const http: Pick<AxiosInstance, "post"> = {
            post: vi.fn(),
        };

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            http: http as AxiosInstance,
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
        });

        await manager.storeTokens({
            accessToken: "access",
            expiresAtEpochMs: Date.now() + 10 * 60_000,
            refreshToken: "refresh",
        });

        await expect(manager.getAccessToken()).resolves.toBe("access");
        expect(http.post).not.toHaveBeenCalled();

        vi.useRealTimers();
    });

    it("refreshes tokens when near expiry and persists the refreshed access token", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

        const secretStore = new InMemorySecretStore();
        const http: Pick<AxiosInstance, "post"> = {
            post: vi.fn().mockResolvedValue({
                data: {
                    access_token: "new-access",
                    expires_in: 3600,
                },
            }),
        };

        const manager = new DropboxTokenManager({
            appKey: "app-key",
            http: http as AxiosInstance,
            secretStore,
            tokenStorageKey: "cloud.dropbox.tokens",
        });

        await manager.storeTokens({
            accessToken: "old-access",
            expiresAtEpochMs: Date.now() - 1,
            refreshToken: "refresh",
        });

        await expect(manager.getAccessToken()).resolves.toBe("new-access");
        expect(http.post).toHaveBeenCalledTimes(1);

        const stored = await manager.getStoredTokens();
        expect(stored?.accessToken).toBe("new-access");
        expect(stored?.refreshToken).toBe("refresh");
        expect(stored?.expiresAtEpochMs).toBeGreaterThan(Date.now());

        vi.useRealTimers();
    });
});
