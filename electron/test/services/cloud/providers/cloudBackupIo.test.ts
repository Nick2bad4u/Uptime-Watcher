import type { CloudBackupEntry } from "@shared/types/cloud";

import { describe, expect, it, vi } from "vitest";

import {
    downloadBackupWithMetadata,
    uploadBackupWithMetadata,
} from "../../../../services/cloud/providers/cloudBackupIo";

describe(downloadBackupWithMetadata, () => {
    it("throws when metadata key does not match the requested key", async () => {
        const key = "backups/backup.sqlite";

        const downloadObject = vi
            .fn<(key: string) => Promise<Buffer>>()
            .mockImplementation(async (requestedKey) => {
                if (requestedKey.endsWith(".metadata.json")) {
                    const entry: CloudBackupEntry = {
                        encrypted: false,
                        fileName: "backup.sqlite",
                        key: "backups/other.sqlite",
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
                    return Buffer.from(JSON.stringify(entry), "utf8");
                }

                return Buffer.from("backup", "utf8");
            });

        await expect(
            downloadBackupWithMetadata({ downloadObject, key })
        ).rejects.toThrow(/metadata mismatch/i);
    });

    it("throws when metadata fileName does not match the requested key basename", async () => {
        const key = "backups/backup.sqlite";

        const downloadObject = vi
            .fn<(key: string) => Promise<Buffer>>()
            .mockImplementation(async (requestedKey) => {
                if (requestedKey.endsWith(".metadata.json")) {
                    const entry: CloudBackupEntry = {
                        encrypted: false,
                        fileName: "different.sqlite",
                        key,
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
                    return Buffer.from(JSON.stringify(entry), "utf8");
                }

                return Buffer.from("backup", "utf8");
            });

        await expect(
            downloadBackupWithMetadata({ downloadObject, key })
        ).rejects.toThrow(/filename/iv);
    });
});

describe(uploadBackupWithMetadata, () => {
    it.each([
        ["nested path", "nested/backup.sqlite"],
        ["windows path", String.raw`nested\backup.sqlite`],
        ["leading whitespace", " backup.sqlite"],
        ["trailing whitespace", "backup.sqlite "],
        ["empty name", ""],
    ])(
        "rejects non-canonical backup fileName values from %s before uploading",
        async (_caseName, fileName) => {
            const uploadObject =
                vi.fn<
                    (args: { buffer: Buffer; key: string }) => Promise<void>
                >();

            await expect(
                uploadBackupWithMetadata({
                    backupsPrefix: "backups/",
                    buffer: Buffer.from("backup", "utf8"),
                    encrypted: false,
                    fileName,
                    metadata: {
                        appVersion: "1.0.0",
                        checksum: "abc",
                        createdAt: 1,
                        originalPath: "backup.sqlite",
                        retentionHintDays: 30,
                        schemaVersion: 1,
                        sizeBytes: 6,
                    },
                    uploadObject,
                })
            ).rejects.toThrow(/single normalized path segment/iv);

            expect(uploadObject).not.toHaveBeenCalled();
        }
    );

    it("rejects invalid metadata before uploading backup bytes", async () => {
        const uploadObject =
            vi.fn<(args: { buffer: Buffer; key: string }) => Promise<void>>();

        await expect(
            uploadBackupWithMetadata({
                backupsPrefix: "backups/",
                buffer: Buffer.from("backup", "utf8"),
                encrypted: false,
                fileName: "backup.sqlite",
                metadata: {
                    appVersion: "1.0.0",
                    checksum: "",
                    createdAt: 1,
                    originalPath: "backup.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 6,
                },
                uploadObject,
            })
        ).rejects.toThrow(/expected format/iv);

        expect(uploadObject).not.toHaveBeenCalled();
    });

    it("attempts to delete the backup when metadata upload fails", async () => {
        const uploadObject = vi
            .fn<(args: { buffer: Buffer; key: string }) => Promise<void>>()
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(new Error("metadata upload failed"));

        const deleteObject = vi
            .fn<(key: string) => Promise<void>>()
            .mockResolvedValue(undefined);

        await expect(
            uploadBackupWithMetadata({
                backupsPrefix: "backups/",
                buffer: Buffer.from("backup", "utf8"),
                deleteObject,
                encrypted: false,
                fileName: "backup.sqlite",
                metadata: {
                    appVersion: "1.0.0",
                    checksum: "abc",
                    createdAt: 1,
                    originalPath: "backup.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 6,
                },
                uploadObject,
            })
        ).rejects.toThrow(/metadata upload failed/iv);

        expect(deleteObject).toHaveBeenCalledWith("backups/backup.sqlite");
    });
});
