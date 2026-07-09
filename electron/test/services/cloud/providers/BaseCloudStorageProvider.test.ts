import type { CloudBackupEntry, CloudProviderKind } from "@shared/types/cloud";

import { describe, expect, it, vi } from "vitest";

import type { CloudObjectEntry } from "../../../../services/cloud/providers/CloudStorageProvider.types";

import { BaseCloudStorageProvider } from "../../../../services/cloud/providers/BaseCloudStorageProvider";
import { serializeCloudBackupMetadataFile } from "../../../../services/cloud/providers/CloudBackupMetadataFile";

const backupEntry: CloudBackupEntry = {
    encrypted: false,
    fileName: "backup.sqlite",
    key: "backups/backup.sqlite",
    metadata: {
        appVersion: "1.0.0",
        checksum: "abc",
        createdAt: 1,
        originalPath: "backup.sqlite",
        retentionHintDays: 30,
        schemaVersion: 1,
        sizeBytes: 6,
    },
};

class TestCloudStorageProvider extends BaseCloudStorageProvider {
    public readonly kind: CloudProviderKind = "filesystem";

    public readonly deleteObject = vi.fn<(key: string) => Promise<void>>();

    public readonly downloadObject = vi
        .fn<(key: string) => Promise<Buffer>>()
        .mockImplementation(async (key) => {
            if (key === backupEntry.key) {
                return Buffer.from("backup", "utf8");
            }

            if (key === `${backupEntry.key}.metadata.json`) {
                return Buffer.from(
                    serializeCloudBackupMetadataFile(backupEntry),
                    "utf8"
                );
            }

            throw new Error(`Unexpected download key: ${key}`);
        });

    public readonly listObjects =
        vi.fn<(prefix: string) => Promise<CloudObjectEntry[]>>();

    public readonly uploadObject =
        vi.fn<
            (args: {
                buffer: Buffer;
                key: string;
                overwrite?: boolean;
            }) => Promise<CloudObjectEntry>
        >();

    public constructor() {
        super("backups/");
    }
}

describe(BaseCloudStorageProvider, () => {
    it("downloads a canonical backup key", async () => {
        const provider = new TestCloudStorageProvider();

        await expect(
            provider.downloadBackup("backups/backup.sqlite")
        ).resolves.toEqual({
            buffer: Buffer.from("backup", "utf8"),
            entry: backupEntry,
        });

        expect(provider.downloadObject).toHaveBeenCalledWith(
            "backups/backup.sqlite"
        );
        expect(provider.downloadObject).toHaveBeenCalledWith(
            "backups/backup.sqlite.metadata.json"
        );
    });

    it.each([
        ["leading slash", "/backups/backup.sqlite"],
        ["windows separators", String.raw`backups\backup.sqlite`],
        ["metadata sidecar", "backups/backup.sqlite.metadata.json"],
        ["backup prefix", "backups/"],
        ["trailing slash", "backups/nested/"],
        ["drive token", "backups/C:backup.sqlite"],
        ["wrong prefix", "sync/backup.sqlite"],
    ])("rejects %s backup keys before downloading", async (_caseName, key) => {
        const provider = new TestCloudStorageProvider();

        await expect(provider.downloadBackup(key)).rejects.toThrow(
            /failed to download backup/iu
        );

        expect(provider.downloadObject).not.toHaveBeenCalled();
    });
});
