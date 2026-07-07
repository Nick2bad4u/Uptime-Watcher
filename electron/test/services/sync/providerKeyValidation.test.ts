import {
    assertOpsObjectKey,
    assertSnapshotKey,
    assertValidSyncDeviceId,
    isValidOpsObjectKey,
} from "@electron/services/sync/providerKeyValidation";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

describe("providerKeyValidation", () => {
    describe("assertValidSyncDeviceId behavior", () => {
        it("accepts valid persisted device IDs", () => {
            expect(() => {
                assertValidSyncDeviceId("device-a");
            }).not.toThrow();
        });

        it("rejects IDs containing path separators", () => {
            expect(() => {
                assertValidSyncDeviceId("device/a");
            }).toThrow(/path separators/i);
        });
    });

    describe("assertOpsObjectKey and isValidOpsObjectKey", () => {
        it("accepts canonical operations object keys", () => {
            expect(() => {
                assertOpsObjectKey("sync/devices/device-a/ops/123-1-9.ndjson");
            }).not.toThrow();
        });

        it("rejects unsafe provider-key syntax before parsing operation metadata", () => {
            expect(() => {
                assertOpsObjectKey("sync/devices/device-a/ops/../evil.ndjson");
            }).toThrow(/traversal/i);

            expect(() => {
                assertOpsObjectKey(
                    String.raw`sync\devices\device-a\ops\1-1-1.ndjson`
                );
            }).toThrow(/backslashes/i);
        });

        it("rejects invalid filename metadata", () => {
            expect(() => {
                assertOpsObjectKey(
                    "sync/devices/device-a/ops/not-valid-filename.ndjson"
                );
            }).toThrow(/expected <createdat>-<firstopid>-<lastopid>/i);
        });

        it("returns false for invalid operations keys", () => {
            expect(
                isValidOpsObjectKey(
                    "sync/devices/device-a/ops/not-valid-filename.ndjson"
                )
            ).toBeFalsy();
        });
    });

    describe("assertSnapshotKey behavior", () => {
        it("accepts schema-matching snapshot keys", () => {
            expect(() => {
                assertSnapshotKey(
                    `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/1-0123456789abcdef0123456789abcdef.json`
                );
            }).not.toThrow();
        });

        it("rejects mismatched schema versions", () => {
            expect(() => {
                assertSnapshotKey("sync/snapshots/999/1.json");
            }).toThrow(/invalid snapshot key/i);
        });

        it("rejects snapshot timestamps outside the JavaScript Date range", () => {
            expect(() => {
                assertSnapshotKey(
                    `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}/${MAX_VALID_DATE_EPOCH_MS + 1}.json`
                );
            }).toThrow(/invalid snapshot key/i);
        });
    });
});
