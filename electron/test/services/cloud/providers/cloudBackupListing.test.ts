import { describe, expect, it, vi } from "vitest";

import type { CloudObjectEntry } from "../../../../services/cloud/providers/CloudStorageProvider.types";

import { listBackupsFromMetadataObjects } from "../../../../services/cloud/providers/cloudBackupListing";

vi.mock("../../../../utils/logger", () => ({
    logger: {
        warn: vi.fn(),
    },
}));

describe(listBackupsFromMetadataObjects, () => {
    it("skips orphaned metadata sidecars (backup blob missing)", async () => {
        const objects: CloudObjectEntry[] = [
            {
                key: "backups/a.sqlite",
                lastModifiedAt: 2,
                sizeBytes: 10,
            },
            {
                key: "backups/a.sqlite.metadata.json",
                lastModifiedAt: 2,
                sizeBytes: 100,
            },
            // Orphaned metadata: no `backups/b.sqlite` in the object listing.
            {
                key: "backups/b.sqlite.metadata.json",
                lastModifiedAt: 1,
                sizeBytes: 100,
            },
        ];

        const downloadObjectBuffer = vi
            .fn<(key: string) => Promise<Buffer>>()
            .mockImplementation(async (key) => {
                if (key.endsWith("a.sqlite.metadata.json")) {
                    return Buffer.from(
                        JSON.stringify({
                            encrypted: false,
                            fileName: "a.sqlite",
                            key: "backups/a.sqlite",
                            metadata: {
                                appVersion: "1.0.0",
                                checksum: "abc",
                                createdAt: 2,
                                originalPath: "a.sqlite",
                                retentionHintDays: 30,
                                schemaVersion: 1,
                                sizeBytes: 10,
                            },
                        }),
                        "utf8"
                    );
                }

                throw new Error(`Unexpected download key: ${key}`);
            });

        const results = await listBackupsFromMetadataObjects({
            downloadObjectBuffer,
            objects,
        });

        expect(results).toHaveLength(1);
        expect(results[0]?.key).toBe("backups/a.sqlite");

        // Should not download orphaned metadata.
        expect(downloadObjectBuffer).toHaveBeenCalledTimes(1);
        expect(downloadObjectBuffer).toHaveBeenCalledWith(
            "backups/a.sqlite.metadata.json"
        );
    });
});
