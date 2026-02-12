import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { describe, expect, it } from "vitest";

import {
    assertOpsObjectKey,
    assertSafeProviderKey,
    assertSnapshotKey,
    assertValidSyncDeviceId,
    isValidOpsObjectKey,
} from "@electron/services/sync/providerKeyValidation";

describe("providerKeyValidation", () => {
    describe("assertValidSyncDeviceId behavior", () => {
        it("accepts valid persisted device IDs", () => {
            expect(() => {
                assertValidSyncDeviceId("device-a");
            }).not.toThrowError();
        });

        it("rejects IDs containing path separators", () => {
            expect(() => {
                assertValidSyncDeviceId("device/a");
            }).toThrowError(/path separators/i);
        });
    });

    describe("assertSafeProviderKey behavior", () => {
        it("accepts canonical provider keys", () => {
            expect(() => {
                assertSafeProviderKey("sync/devices/device-a/ops/1-1-1.ndjson");
            }).not.toThrowError();
        });

        it("rejects traversal segments", () => {
            expect(() => {
                assertSafeProviderKey(
                    "sync/devices/device-a/ops/../evil.ndjson"
                );
            }).toThrowError(/traversal/i);
        });

        it("rejects backslashes", () => {
            expect(() => {
                assertSafeProviderKey(
                    String.raw`sync\devices\device-a\ops\1-1-1.ndjson`
                );
            }).toThrowError(/backslashes/i);
        });
    });

    describe("assertOpsObjectKey and isValidOpsObjectKey", () => {
        it("accepts canonical operations object keys", () => {
            expect(() => {
                assertOpsObjectKey("sync/devices/device-a/ops/123-1-9.ndjson");
            }).not.toThrowError();
        });

        it("rejects invalid filename metadata", () => {
            expect(() => {
                assertOpsObjectKey(
                    "sync/devices/device-a/ops/not-valid-filename.ndjson"
                );
            }).toThrowError(/expected <createdat>-<firstopid>-<lastopid>/i);
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
            }).not.toThrowError();
        });

        it("rejects mismatched schema versions", () => {
            expect(() => {
                assertSnapshotKey("sync/snapshots/999/1.json");
            }).toThrowError(/invalid snapshot key/i);
        });
    });
});
