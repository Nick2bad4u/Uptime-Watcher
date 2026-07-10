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
                        fileName: "other.sqlite",
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

    it("throws when plaintext metadata size does not match downloaded bytes", async () => {
        const key = "backups/backup.sqlite";

        const downloadObject = vi
            .fn<(key: string) => Promise<Buffer>>()
            .mockImplementation(async (requestedKey) => {
                if (requestedKey.endsWith(".metadata.json")) {
                    const entry: CloudBackupEntry = {
                        encrypted: false,
                        fileName: "backup.sqlite",
                        key,
                        metadata: {
                            appVersion: "1.0.0",
                            checksum: "abc",
                            createdAt: 1,
                            originalPath: "backup.sqlite",
                            retentionHintDays: 30,
                            schemaVersion: 1,
                            sizeBytes: 999,
                        },
                    };
                    return Buffer.from(JSON.stringify(entry), "utf8");
                }

                return Buffer.from("backup", "utf8");
            });

        await expect(
            downloadBackupWithMetadata({ downloadObject, key })
        ).rejects.toThrow(/expected 999 bytes but downloaded 6 bytes/iv);
    });

    it("allows encrypted metadata size to describe decrypted plaintext bytes", async () => {
        const key = "backups/backup.sqlite.enc";

        const downloadObject = vi
            .fn<(key: string) => Promise<Buffer>>()
            .mockImplementation(async (requestedKey) => {
                if (requestedKey.endsWith(".metadata.json")) {
                    const entry: CloudBackupEntry = {
                        encrypted: true,
                        fileName: "backup.sqlite.enc",
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

                return Buffer.from("encrypted-payload", "utf8");
            });

        await expect(
            downloadBackupWithMetadata({ downloadObject, key })
        ).resolves.toMatchObject({
            buffer: Buffer.from("encrypted-payload", "utf8"),
            entry: {
                encrypted: true,
                metadata: { sizeBytes: 6 },
            },
        });
    });
});

describe(uploadBackupWithMetadata, () => {
    it.each([
        ["nested path", "nested/backup.sqlite"],
        ["windows path", String.raw`nested\backup.sqlite`],
        ["leading whitespace", " backup.sqlite"],
        ["trailing whitespace", "backup.sqlite "],
        ["windows drive token", "C:backup.sqlite"],
        ["control character", "backup\n.sqlite"],
        ["current directory segment", "."],
        ["parent directory segment", ".."],
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

    it("rejects plaintext metadata size mismatches before uploading backup bytes", async () => {
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
                    checksum: "abc",
                    createdAt: 1,
                    originalPath: "backup.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 999,
                },
                uploadObject,
            })
        ).rejects.toThrow(/expected 999 bytes but received 6 bytes/iv);

        expect(uploadObject).not.toHaveBeenCalled();
    });

    it("rejects overlong generated provider keys before uploading backup bytes", async () => {
        const uploadObject =
            vi.fn<(args: { buffer: Buffer; key: string }) => Promise<void>>();

        await expect(
            uploadBackupWithMetadata({
                backupsPrefix: "backups/",
                buffer: Buffer.from("backup", "utf8"),
                encrypted: false,
                fileName: `${"a".repeat(4090)}.sqlite`,
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
        ).rejects.toThrow(/4096 bytes/iv);

        expect(uploadObject).not.toHaveBeenCalled();
    });

    it("rejects overlong generated metadata sidecar keys before uploading backup bytes", async () => {
        const uploadObject =
            vi.fn<(args: { buffer: Buffer; key: string }) => Promise<void>>();

        await expect(
            uploadBackupWithMetadata({
                backupsPrefix: "backups/",
                buffer: Buffer.from("backup", "utf8"),
                encrypted: false,
                fileName: `${"a".repeat(4070)}.sqlite`,
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
        ).rejects.toThrow(/4096 bytes/iv);

        expect(uploadObject).not.toHaveBeenCalled();
    });

    it("allows encrypted uploads whose metadata size describes plaintext bytes", async () => {
        const uploadObject = vi
            .fn<(args: { buffer: Buffer; key: string }) => Promise<void>>()
            .mockResolvedValue(undefined);

        await expect(
            uploadBackupWithMetadata({
                backupsPrefix: "backups/",
                buffer: Buffer.from("encrypted-payload", "utf8"),
                encrypted: true,
                fileName: "backup.sqlite.enc",
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
        ).resolves.toMatchObject({
            encrypted: true,
            fileName: "backup.sqlite.enc",
            metadata: { sizeBytes: 6 },
        });

        expect(uploadObject).toHaveBeenCalledWith(
            expect.objectContaining({
                buffer: Buffer.from("encrypted-payload", "utf8"),
                key: "backups/backup.sqlite.enc",
            })
        );
    });

    it("preserves an existing backup when an immutable key collides", async () => {
        const backupKey = "backups/backup.sqlite";
        const metadataKey = `${backupKey}.metadata.json`;
        const originalBackup = Buffer.from("original-backup", "utf8");
        const originalMetadata = Buffer.from("original-metadata", "utf8");
        const objects = new Map<string, Buffer>([
            [backupKey, originalBackup],
            [metadataKey, originalMetadata],
        ]);
        const uploadObject = vi.fn(
            async (args: {
                buffer: Buffer;
                key: string;
                overwrite?: boolean;
            }): Promise<void> => {
                if (objects.has(args.key) && args.overwrite !== true) {
                    throw new Error(`Object already exists: ${args.key}`);
                }

                objects.set(args.key, args.buffer);
            }
        );
        const deleteObject = vi.fn(async (key: string): Promise<void> => {
            objects.delete(key);
        });

        await expect(
            uploadBackupWithMetadata({
                backupsPrefix: "backups/",
                buffer: Buffer.from("replacement", "utf8"),
                deleteObject,
                encrypted: false,
                fileName: "backup.sqlite",
                metadata: {
                    appVersion: "1.0.0",
                    checksum: "replacement-checksum",
                    createdAt: 2,
                    originalPath: "backup.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 11,
                },
                uploadObject,
            })
        ).rejects.toThrow(`Object already exists: ${backupKey}`);

        expect(uploadObject).toHaveBeenCalledOnce();
        expect(uploadObject).toHaveBeenCalledWith(
            expect.objectContaining({
                key: backupKey,
                overwrite: false,
            })
        );
        expect(deleteObject).not.toHaveBeenCalled();
        expect(objects.get(backupKey)).toEqual(originalBackup);
        expect(objects.get(metadataKey)).toEqual(originalMetadata);
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

    it("surfaces cleanup failure when metadata upload leaves an orphaned backup", async () => {
        const metadataUploadError = new Error("metadata upload failed");
        const cleanupError = new Error("cleanup failed");
        const uploadObject = vi
            .fn<(args: { buffer: Buffer; key: string }) => Promise<void>>()
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(metadataUploadError);

        const deleteObject = vi
            .fn<(key: string) => Promise<void>>()
            .mockRejectedValue(cleanupError);

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
        ).rejects.toMatchObject({
            errors: [metadataUploadError, cleanupError],
            message:
                "Failed to upload backup metadata and clean up orphaned backup object 'backups/backup.sqlite'",
        });

        expect(deleteObject).toHaveBeenCalledWith("backups/backup.sqlite");
    });
});
