/**
 * Tests for shared Zod schemas in validation/cloudBackupSchemas.
 */

import {
    validateCloudBackupEntry,
    validateCloudBackupEntryArray,
} from "@shared/validation/cloudBackupSchemas";
import { describe, expect, it } from "vitest";

describe("cloudBackupSchemas", () => {
    const createMetadata = () => ({
        appVersion: "1.0.0",
        checksum: "abc",
        createdAt: 1,
        originalPath: "C:/x",
        retentionHintDays: 30,
        schemaVersion: 1,
        sizeBytes: 8,
    });

    it("validates a CloudBackupEntry payload", () => {
        const parsed = validateCloudBackupEntry({
            encrypted: false,
            fileName: "backup.sqlite",
            key: "backups/backup.sqlite",
            metadata: createMetadata(),
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects non-canonical CloudBackupEntry identity fields", () => {
        for (const entry of [
            {
                encrypted: false,
                fileName: " backup.sqlite",
                key: "backups/backup.sqlite",
                metadata: createMetadata(),
            },
            {
                encrypted: false,
                fileName: "backup.sqlite",
                key: " backups/backup.sqlite",
                metadata: createMetadata(),
            },
            {
                encrypted: false,
                fileName: "C:backup.sqlite",
                key: "backups/C:backup.sqlite",
                metadata: createMetadata(),
            },
            {
                encrypted: false,
                fileName: "nested/backup.sqlite",
                key: "backups/nested/backup.sqlite",
                metadata: createMetadata(),
            },
            {
                encrypted: false,
                fileName: "backup.sqlite",
                key: "sync/backup.sqlite",
                metadata: createMetadata(),
            },
            {
                encrypted: false,
                fileName: "different.sqlite",
                key: "backups/backup.sqlite",
                metadata: createMetadata(),
            },
        ]) {
            expect(validateCloudBackupEntry(entry).success).toBeFalsy();
        }
    });

    it("validates a list of CloudBackupEntry payloads", () => {
        const parsed = validateCloudBackupEntryArray([
            {
                encrypted: true,
                fileName: "backup.sqlite",
                key: "backups/backup.sqlite",
                metadata: createMetadata(),
            },
        ]);

        expect(parsed.success).toBeTruthy();

        const invalid = validateCloudBackupEntryArray([{}]);
        expect(invalid.success).toBeFalsy();
    });
});
