/**
 * Tests for shared Zod schemas in validation/cloudBackupSchemas.
 */

import { describe, expect, it } from "vitest";

import {
    validateCloudBackupEntry,
    validateCloudBackupEntryArray,
} from "@shared/validation/cloudBackupSchemas";

describe("cloudBackupSchemas", () => {
    it("validates a CloudBackupEntry payload", () => {
        const parsed = validateCloudBackupEntry({
            encrypted: false,
            fileName: "backup.sqlite",
            key: "backups/backup.sqlite",
            metadata: {
                appVersion: "1.0.0",
                checksum: "abc",
                createdAt: 1,
                originalPath: "C:/x",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 8,
            },
        });

        expect(parsed.success).toBeTruthy();
    });

    it("validates a list of CloudBackupEntry payloads", () => {
        const parsed = validateCloudBackupEntryArray([
            {
                encrypted: true,
                fileName: "backup.sqlite",
                key: "backups/backup.sqlite",
                metadata: {
                    appVersion: "1.0.0",
                    checksum: "abc",
                    createdAt: 1,
                    originalPath: "C:/x",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 8,
                },
            },
        ]);

        expect(parsed.success).toBeTruthy();

        const invalid = validateCloudBackupEntryArray([{}]);
        expect(invalid.success).toBeFalsy();
    });
});
