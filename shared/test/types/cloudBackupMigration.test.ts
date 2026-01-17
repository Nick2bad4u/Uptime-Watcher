/**
 * Tests for runtime helpers in types/cloudBackupMigration.
 */

import { describe, expect, it } from "vitest";

import { safeParseCloudBackupMigrationResult } from "@shared/types/cloudBackupMigration";

describe("cloudBackupMigration", () => {
    it("safe parses CloudBackupMigrationResult", () => {
        const parsed = safeParseCloudBackupMigrationResult({
            completedAt: 2,
            deleteSource: false,
            failures: [],
            migrated: 1,
            processed: 1,
            skipped: 0,
            startedAt: 1,
            target: "encrypted",
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects malformed CloudBackupMigrationResult", () => {
        const parsed = safeParseCloudBackupMigrationResult({
            completedAt: "nope",
        });

        expect(parsed.success).toBeFalsy();
    });
});
