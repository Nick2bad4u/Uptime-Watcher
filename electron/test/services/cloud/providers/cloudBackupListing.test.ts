import { describe, expect, it, vi } from "vitest";

import type { CloudObjectEntry } from "../../../../services/cloud/providers/CloudStorageProvider.types";

import {
    CLOUD_BACKUP_METADATA_READ_CONCURRENCY,
    listBackupsFromMetadataObjects,
} from "../../../../services/cloud/providers/cloudBackupListing";
import { MAX_CLOUD_BACKUP_METADATA_FILE_BYTES } from "../../../../services/cloud/providers/CloudBackupMetadataFile";

vi.mock("../../../../utils/logger", () => ({
    logger: {
        warn: vi.fn(),
    },
}));

describe(listBackupsFromMetadataObjects, () => {
    it("bounds concurrent metadata sidecar downloads", async () => {
        const backupCount = CLOUD_BACKUP_METADATA_READ_CONCURRENCY + 4;
        const metadataByKey = new Map<string, Buffer>();
        const objects = Array.from(
            { length: backupCount },
            (_, index): CloudObjectEntry[] => {
                const fileName = `backup-${index}.sqlite`;
                const backupKey = `backups/${fileName}`;
                const metadataKey = `${backupKey}.metadata.json`;
                metadataByKey.set(
                    metadataKey,
                    Buffer.from(
                        JSON.stringify({
                            encrypted: false,
                            fileName,
                            key: backupKey,
                            metadata: {
                                appVersion: "1.0.0",
                                checksum: `checksum-${index}`,
                                createdAt: index,
                                originalPath: fileName,
                                retentionHintDays: 30,
                                schemaVersion: 1,
                                sizeBytes: 10,
                            },
                        }),
                        "utf8"
                    )
                );

                return [
                    {
                        key: backupKey,
                        lastModifiedAt: index,
                        sizeBytes: 10,
                    },
                    {
                        key: metadataKey,
                        lastModifiedAt: index,
                        sizeBytes: 100,
                    },
                ];
            }
        ).flat();

        let activeDownloads = 0;
        let maxActiveDownloads = 0;
        const downloadObjectBuffer = vi
            .fn<(key: string) => Promise<Buffer>>()
            .mockImplementation(async (key) => {
                activeDownloads += 1;
                maxActiveDownloads = Math.max(
                    maxActiveDownloads,
                    activeDownloads
                );

                await new Promise((resolve) => {
                    setTimeout(resolve, 1);
                });

                activeDownloads -= 1;
                const buffer = metadataByKey.get(key);
                if (!buffer) {
                    throw new Error(`Unexpected download key: ${key}`);
                }

                return buffer;
            });

        const results = await listBackupsFromMetadataObjects({
            downloadObjectBuffer,
            objects,
        });

        expect(results).toHaveLength(backupCount);
        expect(downloadObjectBuffer).toHaveBeenCalledTimes(backupCount);
        expect(maxActiveDownloads).toBeLessThanOrEqual(
            CLOUD_BACKUP_METADATA_READ_CONCURRENCY
        );
    });

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

    it("skips metadata sidecars whose stored key does not match the sidecar path", async () => {
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
            {
                key: "backups/b.sqlite",
                lastModifiedAt: 1,
                sizeBytes: 10,
            },
        ];

        const downloadObjectBuffer = vi
            .fn<(key: string) => Promise<Buffer>>()
            .mockResolvedValue(
                Buffer.from(
                    JSON.stringify({
                        encrypted: false,
                        fileName: "b.sqlite",
                        key: "backups/b.sqlite",
                        metadata: {
                            appVersion: "1.0.0",
                            checksum: "abc",
                            createdAt: 2,
                            originalPath: "b.sqlite",
                            retentionHintDays: 30,
                            schemaVersion: 1,
                            sizeBytes: 10,
                        },
                    }),
                    "utf8"
                )
            );

        const results = await listBackupsFromMetadataObjects({
            downloadObjectBuffer,
            objects,
        });

        expect(results).toEqual([]);
    });

    it("skips metadata sidecars whose reported size is too large", async () => {
        const objects: CloudObjectEntry[] = [
            {
                key: "backups/a.sqlite",
                lastModifiedAt: 2,
                sizeBytes: 10,
            },
            {
                key: "backups/a.sqlite.metadata.json",
                lastModifiedAt: 2,
                sizeBytes: MAX_CLOUD_BACKUP_METADATA_FILE_BYTES + 1,
            },
        ];

        const downloadObjectBuffer = vi.fn<(key: string) => Promise<Buffer>>();

        const results = await listBackupsFromMetadataObjects({
            downloadObjectBuffer,
            objects,
        });

        expect(results).toEqual([]);
        expect(downloadObjectBuffer).not.toHaveBeenCalled();
    });

    it("skips metadata sidecars whose stored fileName does not match the backup key basename", async () => {
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
        ];

        const downloadObjectBuffer = vi
            .fn<(key: string) => Promise<Buffer>>()
            .mockResolvedValue(
                Buffer.from(
                    JSON.stringify({
                        encrypted: false,
                        fileName: "different.sqlite",
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
                )
            );

        const results = await listBackupsFromMetadataObjects({
            downloadObjectBuffer,
            objects,
        });

        expect(results).toEqual([]);
    });
});
