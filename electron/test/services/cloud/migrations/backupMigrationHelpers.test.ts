import { describe, expect, it, vi } from "vitest";

import type { CloudStorageProvider } from "../../../../services/cloud/providers/CloudStorageProvider.types";

import {
    collectSourceDeletionErrors,
    requireMigrationEncryptionKey,
} from "../../../../services/cloud/migrations/backupMigrationHelpers";
import { backupMetadataKeyForBackupKey } from "../../../../services/cloud/providers/CloudBackupMetadataFile";

function createProvider(
    deleteObject: (key: string) => Promise<void>
): CloudStorageProvider {
    return {
        deleteObject,
        downloadBackup: async () => {
            throw new Error("downloadBackup should not be called in this test");
        },
        downloadObject: async () => {
            throw new Error("downloadObject should not be called in this test");
        },
        isConnected: async () => true,
        kind: "filesystem",
        listBackups: async () => [],
        listObjects: async () => [],
        uploadBackup: async () => {
            throw new Error("uploadBackup should not be called in this test");
        },
        uploadObject: async () => {
            throw new Error("uploadObject should not be called in this test");
        },
    };
}

describe("backupMigrationHelpers", () => {
    describe("requireMigrationEncryptionKey", () => {
        it("returns provided key", () => {
            const key = Buffer.from("abc");

            expect(requireMigrationEncryptionKey(key, "missing key")).toBe(key);
        });

        it("throws with provided message when missing", () => {
            expect(() =>
                requireMigrationEncryptionKey(undefined, "missing key")
            ).toThrowError("missing key");
        });
    });

    describe("collectSourceDeletionErrors", () => {
        it("skips deletions when deleteSource is false", async () => {
            const deleteObject = vi.fn(async (_key: string) => {
                // no-op
            });

            const errors = await collectSourceDeletionErrors({
                deleteSource: false,
                provider: createProvider(deleteObject),
                sourceKey: "backup-1.enc",
            });

            expect(errors).toStrictEqual([]);
            expect(deleteObject).not.toHaveBeenCalled();
        });

        it("collects source and metadata deletion failures", async () => {
            const sourceKey = "backup-1.enc";
            const metadataKey = backupMetadataKeyForBackupKey(sourceKey);
            const deleteObject = vi.fn(async (key: string) => {
                throw new Error(`cannot delete ${key}`);
            });

            const errors = await collectSourceDeletionErrors({
                deleteSource: true,
                provider: createProvider(deleteObject),
                sourceKey,
            });

            expect(deleteObject).toHaveBeenNthCalledWith(1, sourceKey);
            expect(deleteObject).toHaveBeenNthCalledWith(2, metadataKey);
            expect(errors).toStrictEqual([
                `cannot delete ${sourceKey}`,
                `cannot delete ${metadataKey}`,
            ]);
        });
    });
});
