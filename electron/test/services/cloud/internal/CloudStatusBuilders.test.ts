import {
    buildDropboxStatus,
    buildFilesystemStatus,
    buildGoogleDriveStatus,
    buildUnconfiguredStatus,
} from "@electron/services/cloud/internal/CloudStatusBuilders";
import { describe, expect, it, vi } from "vitest";

const mockFsPromises = vi.hoisted(() => ({
    mkdir: vi.fn(),
    stat: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
    default: mockFsPromises,
    ...mockFsPromises,
}));

const createCommonStatusArgs = (lastError?: string) => ({
    hasLocalEncryptionKey: true,
    lastBackupAt: null,
    lastError,
    lastSyncAt: null,
    localEncryptionMode: "none" as const,
    syncEnabled: true,
});

describe(buildDropboxStatus, () => {
    it("bounds Dropbox account labels exposed in status summaries", async () => {
        const provider = {
            deleteObject: vi.fn(),
            downloadBackup: vi.fn(),
            downloadObject: vi.fn(),
            getAccountLabel: vi
                .fn()
                .mockResolvedValue(` ${"x".repeat(1000)}\n\t`),
            isConnected: vi.fn(),
            kind: "dropbox",
            listBackups: vi.fn(),
            listObjects: vi.fn(),
            uploadBackup: vi.fn(),
            uploadObject: vi.fn(),
        } as never;

        const summary = await buildDropboxStatus({
            common: createCommonStatusArgs(),
            deps: {
                getEffectiveEncryptionMode: vi.fn().mockResolvedValue("none"),
                resolveProviderOrNull: vi.fn().mockResolvedValue(provider),
            },
        });

        expect(summary.providerDetails?.kind).toBe("dropbox");
        if (summary.providerDetails?.kind !== "dropbox") {
            throw new Error("Expected Dropbox provider details");
        }

        const { accountLabel } = summary.providerDetails;
        expect(accountLabel).toBeDefined();
        expect(accountLabel).toHaveLength(323);
        expect(accountLabel?.endsWith("...")).toBeTruthy();
        expect(accountLabel).not.toContain("\n");
        expect(accountLabel).not.toContain("\t");
    });

    it("sanitizes Dropbox connection errors exposed in status summaries", async () => {
        const provider = {
            deleteObject: vi.fn(),
            downloadBackup: vi.fn(),
            downloadObject: vi.fn(),
            getAccountLabel: vi
                .fn()
                .mockRejectedValue(
                    new Error(
                        `refresh_token=SUPER_SECRET_TOKEN&status=failed\n\t${"x".repeat(1200)}`
                    )
                ),
            isConnected: vi.fn(),
            kind: "dropbox",
            listBackups: vi.fn(),
            listObjects: vi.fn(),
            uploadBackup: vi.fn(),
            uploadObject: vi.fn(),
        } as never;

        const summary = await buildDropboxStatus({
            common: createCommonStatusArgs(),
            deps: {
                getEffectiveEncryptionMode: vi.fn(),
                resolveProviderOrNull: vi.fn().mockResolvedValue(provider),
            },
        });

        expect(summary.connected).toBeFalsy();
        expect(summary.lastError).toBeDefined();
        expect(summary.lastError).not.toContain("SUPER_SECRET_TOKEN");
        expect(summary.lastError).not.toContain("\n");
        expect(summary.lastError).not.toContain("\t");
        expect(summary.lastError).toContain(
            "refresh_token=[redacted]&status=failed"
        );
        expect(summary.lastError?.endsWith("...")).toBeTruthy();
        expect(summary.lastError?.length).toBeLessThanOrEqual(1003);
    });

    it("does not invoke accessor-backed Dropbox account label methods", async () => {
        let accessCount = 0;
        const provider = {
            deleteObject: vi.fn(),
            downloadBackup: vi.fn(),
            downloadObject: vi.fn(),
            isConnected: vi.fn().mockResolvedValue(false),
            kind: "dropbox",
            listBackups: vi.fn(),
            listObjects: vi.fn(),
            uploadBackup: vi.fn(),
            uploadObject: vi.fn(),
        } as never;
        Object.defineProperty(provider, "getAccountLabel", {
            configurable: true,
            enumerable: true,
            get() {
                accessCount += 1;
                return vi.fn().mockResolvedValue("hidden@example.com");
            },
        });

        const summary = await buildDropboxStatus({
            common: createCommonStatusArgs(),
            deps: {
                getEffectiveEncryptionMode: vi.fn(),
                resolveProviderOrNull: vi.fn().mockResolvedValue(provider),
            },
        });

        expect(accessCount).toBe(0);
        expect(summary.connected).toBeFalsy();
        expect(summary.providerDetails?.kind).toBe("dropbox");
        if (summary.providerDetails?.kind !== "dropbox") {
            throw new Error("Expected Dropbox provider details");
        }
        expect(summary.providerDetails.accountLabel).toBeUndefined();
    });
});

describe(buildGoogleDriveStatus, () => {
    it("bounds Google Drive account labels exposed in status summaries", async () => {
        const provider = {
            deleteObject: vi.fn(),
            downloadBackup: vi.fn(),
            downloadObject: vi.fn(),
            isConnected: vi.fn().mockResolvedValue(true),
            kind: "google-drive",
            listBackups: vi.fn(),
            listObjects: vi.fn(),
            uploadBackup: vi.fn(),
            uploadObject: vi.fn(),
        } as never;

        const summary = await buildGoogleDriveStatus({
            accountLabel: ` ${"y".repeat(1000)}\n\t`,
            common: createCommonStatusArgs(),
            deps: {
                getEffectiveEncryptionMode: vi.fn().mockResolvedValue("none"),
                resolveProviderOrNull: vi.fn().mockResolvedValue(provider),
            },
        });

        expect(summary.providerDetails?.kind).toBe("google-drive");
        if (summary.providerDetails?.kind !== "google-drive") {
            throw new Error("Expected Google Drive provider details");
        }

        const { accountLabel } = summary.providerDetails;
        expect(accountLabel).toBeDefined();
        expect(accountLabel).toHaveLength(323);
        expect(accountLabel?.endsWith("...")).toBeTruthy();
        expect(accountLabel).not.toContain("\n");
        expect(accountLabel).not.toContain("\t");
    });

    it("sanitizes Google Drive connection probe errors exposed in status summaries", async () => {
        const provider = {
            deleteObject: vi.fn(),
            downloadBackup: vi.fn(),
            downloadObject: vi.fn(),
            isConnected: vi
                .fn()
                .mockRejectedValue(
                    new Error(
                        `access_token=SUPER_SECRET_TOKEN&status=failed\n\t${"z".repeat(1200)}`
                    )
                ),
            kind: "google-drive",
            listBackups: vi.fn(),
            listObjects: vi.fn(),
            uploadBackup: vi.fn(),
            uploadObject: vi.fn(),
        } as never;
        const getEffectiveEncryptionMode = vi.fn();

        const summary = await buildGoogleDriveStatus({
            accountLabel: undefined,
            common: createCommonStatusArgs(),
            deps: {
                getEffectiveEncryptionMode,
                resolveProviderOrNull: vi.fn().mockResolvedValue(provider),
            },
        });

        expect(summary.connected).toBeFalsy();
        expect(summary.lastError).toBeDefined();
        expect(summary.lastError).not.toContain("SUPER_SECRET_TOKEN");
        expect(summary.lastError).not.toContain("\n");
        expect(summary.lastError).not.toContain("\t");
        expect(summary.lastError).toContain(
            "access_token=[redacted]&status=failed"
        );
        expect(summary.lastError?.endsWith("...")).toBeTruthy();
        expect(summary.lastError?.length).toBeLessThanOrEqual(1003);
        expect(getEffectiveEncryptionMode).not.toHaveBeenCalled();
    });
});

describe(buildFilesystemStatus, () => {
    it("sanitizes filesystem connection probe errors exposed in status summaries", async () => {
        mockFsPromises.mkdir.mockRejectedValueOnce(
            new Error(
                `refresh_token=SUPER_SECRET_TOKEN&status=failed\n\t${"f".repeat(1200)}`
            )
        );

        const summary = await buildFilesystemStatus({
            baseDirectory: "/tmp/uptime-watcher-cloud",
            common: createCommonStatusArgs(),
            deps: {
                getEffectiveEncryptionMode: vi.fn(),
                resolveProviderOrNull: vi.fn(),
            },
        });

        expect(summary.connected).toBeFalsy();
        expect(summary.lastError).toBeDefined();
        expect(summary.lastError).not.toContain("SUPER_SECRET_TOKEN");
        expect(summary.lastError).not.toContain("\n");
        expect(summary.lastError).not.toContain("\t");
        expect(summary.lastError).toContain(
            "refresh_token=[redacted]&status=failed"
        );
        expect(summary.lastError?.endsWith("...")).toBeTruthy();
        expect(summary.lastError?.length).toBeLessThanOrEqual(1003);
    });
});

describe(buildUnconfiguredStatus, () => {
    it("sanitizes persisted cloud errors exposed in status summaries", () => {
        const summary = buildUnconfiguredStatus(
            createCommonStatusArgs(
                `access_token=SUPER_SECRET_TOKEN&status=failed\n\t${"x".repeat(1200)}`
            )
        );

        expect(summary.lastError).toBeDefined();
        expect(summary.lastError).not.toContain("SUPER_SECRET_TOKEN");
        expect(summary.lastError).not.toContain("\n");
        expect(summary.lastError).not.toContain("\t");
        expect(summary.lastError).toContain(
            "access_token=[redacted]&status=failed"
        );
        expect(summary.lastError?.endsWith("...")).toBeTruthy();
        expect(summary.lastError?.length).toBeLessThanOrEqual(1003);
    });
});
