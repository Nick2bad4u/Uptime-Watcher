import type { CloudBackupEntry } from "@shared/types/cloud";

import { describe, expect, it } from "vitest";

import {
    MAX_CLOUD_BACKUP_METADATA_FILE_BYTES,
    parseCloudBackupMetadataFileBuffer,
    serializeCloudBackupMetadataFile,
    tryParseCloudBackupMetadataFileBuffer,
} from "../../../../services/cloud/providers/CloudBackupMetadataFile";

function createEntry(): CloudBackupEntry {
    return {
        encrypted: false,
        fileName: "backup.sqlite",
        key: "backups/backup.sqlite",
        metadata: {
            appVersion: "1.0.0",
            checksum: "abc123",
            createdAt: 1,
            originalPath: "backup.sqlite",
            retentionHintDays: 30,
            schemaVersion: 1,
            sizeBytes: 6,
        },
    };
}

describe("CloudBackupMetadataFile buffer parsing", () => {
    it("round-trips serialized backup metadata", () => {
        const entry = createEntry();
        const buffer = Buffer.from(
            serializeCloudBackupMetadataFile(entry),
            "utf8"
        );

        expect(parseCloudBackupMetadataFileBuffer(buffer)).toEqual(entry);
    });

    it("throws when strict metadata parsing receives invalid UTF-8", () => {
        expect(() =>
            parseCloudBackupMetadataFileBuffer(
                Buffer.from([
                    0xff,
                    0xfe,
                    0xfd,
                ])
            )
        ).toThrow();
    });

    it("returns null when best-effort metadata parsing receives invalid UTF-8", () => {
        expect(
            tryParseCloudBackupMetadataFileBuffer(
                Buffer.from([
                    0xff,
                    0xfe,
                    0xfd,
                ])
            )
        ).toBeNull();
    });

    it("throws when strict metadata parsing receives an oversized sidecar", () => {
        expect(() =>
            parseCloudBackupMetadataFileBuffer(
                Buffer.alloc(MAX_CLOUD_BACKUP_METADATA_FILE_BYTES + 1)
            )
        ).toThrow(/exceeded/u);
    });

    it("returns null when best-effort metadata parsing receives an oversized sidecar", () => {
        expect(
            tryParseCloudBackupMetadataFileBuffer(
                Buffer.alloc(MAX_CLOUD_BACKUP_METADATA_FILE_BYTES + 1)
            )
        ).toBeNull();
    });
});
