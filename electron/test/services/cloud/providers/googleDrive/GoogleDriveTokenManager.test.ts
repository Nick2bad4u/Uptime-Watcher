import { GoogleDriveTokenManager } from "@electron/services/cloud/providers/googleDrive/GoogleDriveTokenManager";
import { logger } from "@electron/utils/logger";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InMemorySecretStore } from "../../../../utils/InMemorySecretStore";

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

interface Deferred<T> {
    readonly promise: Promise<T>;
    readonly resolve: (value: T | PromiseLike<T>) => void;
}

function createDeferred<T>(): Deferred<T> {
    let resolve: Deferred<T>["resolve"] = () => undefined;
    const promise = new Promise<T>((resolvePromise) => {
        resolve = resolvePromise;
    });

    return { promise, resolve };
}

describe(GoogleDriveTokenManager, () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
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

    it("does not restore credentials when a refresh completes after clear", async () => {
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

        const refreshResponse = createDeferred<{
            data: { access_token: string; expires_in: number };
        }>();
        axiosPost.mockImplementationOnce(async () => refreshResponse.promise);

        const refresh = manager.getValidAccessToken();
        await vi.waitFor(() => {
            expect(axiosPost).toHaveBeenCalledTimes(1);
        });
        await manager.clear();
        refreshResponse.resolve({
            data: { access_token: "new-access", expires_in: 3600 },
        });

        await expect(refresh).rejects.toThrow(/credentials changed/iv);
        await expect(manager.getTokens()).resolves.toBeUndefined();
    });

    it("trims non-empty optional token metadata before storing", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        await manager.setTokens({
            accessToken: "access",
            expiresAt: Date.now() + 5 * 60_000,
            refreshToken: "refresh",
            scope: "  https://www.googleapis.com/auth/drive.appdata  ",
            tokenType: "  Bearer  ",
        });

        await expect(manager.getTokens()).resolves.toMatchObject({
            scope: "https://www.googleapis.com/auth/drive.appdata",
            tokenType: "Bearer",
        });
    });

    it("rejects empty optional token metadata before storing", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        await expect(
            manager.setTokens({
                accessToken: "access",
                expiresAt: Date.now() + 5 * 60_000,
                refreshToken: "refresh",
                scope: " ".repeat(3),
            })
        ).rejects.toThrow();

        await expect(
            secretStore.getSecret("cloud.googleDrive.tokens")
        ).resolves.toBeUndefined();
    });

    it("rejects empty optional metadata from refresh responses without overwriting existing tokens", async () => {
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
                token_type: " ".repeat(3),
            },
        });

        await expect(manager.getValidAccessToken()).rejects.toThrow();

        await expect(manager.getTokens()).resolves.toMatchObject({
            accessToken: "old-access",
            refreshToken: "refresh",
        });
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
        const loggerWarn = vi
            .spyOn(logger, "warn")
            .mockImplementation(() => undefined);
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

        axiosPost.mockRejectedValueOnce(
            new Error(
                "network down refresh_token=VERY_SECRET_TOKEN Authorization: Bearer VERY_SECRET_TOKEN"
            )
        );

        await expect(manager.revoke()).resolves.toBeUndefined();
        expect(loggerWarn).toHaveBeenCalledWith(
            "[GoogleDriveTokenManager] Failed to revoke stored tokens",
            {
                message: "network down refresh_token=[redacted] [redacted]",
            }
        );
        expect(JSON.stringify(loggerWarn.mock.calls)).not.toContain(
            "VERY_SECRET_TOKEN"
        );
        await expect(manager.getTokens()).resolves.toBeUndefined();
    });

    it("does not clear a newer login when an older revoke completes", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });
        await manager.setTokens({
            accessToken: "old-access",
            expiresAt: Date.now() + 5 * 60_000,
            refreshToken: "old-refresh",
        });

        const revokeResponse = createDeferred<{ data: unknown }>();
        axiosPost.mockImplementationOnce(async () => revokeResponse.promise);

        const revoke = manager.revoke();
        await vi.waitFor(() => {
            expect(axiosPost).toHaveBeenCalledTimes(1);
        });
        await manager.setTokens({
            accessToken: "new-access",
            expiresAt: Date.now() + 5 * 60_000,
            refreshToken: "new-refresh",
        });
        revokeResponse.resolve({ data: undefined });
        await revoke;

        await expect(manager.getTokens()).resolves.toMatchObject({
            accessToken: "new-access",
            refreshToken: "new-refresh",
        });
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

    it("rejects token expirations outside the JavaScript Date range before storing", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        await expect(
            manager.setTokens({
                accessToken: "access",
                expiresAt: MAX_VALID_DATE_EPOCH_MS + 1,
                refreshToken: "refresh",
            })
        ).rejects.toThrow();

        await expect(
            secretStore.getSecret("cloud.googleDrive.tokens")
        ).resolves.toBeUndefined();
    });

    it("treats stored expirations outside the JavaScript Date range as disconnected", async () => {
        const secretStore = new InMemorySecretStore();
        const manager = new GoogleDriveTokenManager({
            clientId: "client-id",
            secretStore,
            storageKey: "cloud.googleDrive.tokens",
        });

        await secretStore.setSecret(
            "cloud.googleDrive.tokens",
            JSON.stringify({
                accessToken: "access",
                expiresAt: MAX_VALID_DATE_EPOCH_MS + 1,
                refreshToken: "refresh",
            })
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

    it("redacts secrets from non-Axios OAuth refresh failures", async () => {
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

        axiosPost.mockRejectedValueOnce(
            new Error(
                "refresh_token=SUPER_SECRET_REFRESH_TOKEN failed\nwith detail"
            )
        );

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
        expect(message).not.toContain("\n");
        expect(message).toContain("refresh_token=[redacted]");
    });

    it("bounds and compacts OAuth refresh error details", async () => {
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

        axiosPost.mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                data: {
                    error: "invalid_grant",
                    error_description: `denied\n\t${"x".repeat(700)}`,
                },
                status: 400,
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
        const messagePrefix = "Google OAuth refresh failed (400): ";
        expect(message.startsWith(messagePrefix)).toBeTruthy();
        expect(message).not.toContain("\n");
        expect(message).not.toContain("\t");
        expect(message).toContain("invalid_grant (denied ");
        expect(message.endsWith("...")).toBeTruthy();
        expect(message.length).toBeLessThanOrEqual(messagePrefix.length + 503);
    });
});
