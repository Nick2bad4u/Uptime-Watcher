import {
    buildDropboxStatus,
    buildUnconfiguredStatus,
} from "@electron/services/cloud/internal/CloudStatusBuilders";
import { describe, expect, it, vi } from "vitest";

const createCommonStatusArgs = (lastError?: string) => ({
    hasLocalEncryptionKey: true,
    lastBackupAt: null,
    lastError,
    lastSyncAt: null,
    localEncryptionMode: "none" as const,
    syncEnabled: true,
});

describe(buildDropboxStatus, () => {
    it("sanitizes Dropbox connection errors exposed in status summaries", async () => {
        const provider = {
            deleteObject: vi.fn(),
            downloadBackup: vi.fn(),
            downloadObject: vi.fn(),
            getAccountLabel: vi.fn().mockRejectedValue(
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
