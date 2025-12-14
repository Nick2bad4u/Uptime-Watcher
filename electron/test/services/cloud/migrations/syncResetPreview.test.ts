import type { CloudSyncManifest } from "@shared/types/cloudSyncManifest";

import { describe, expect, it } from "vitest";

import { CLOUD_SYNC_MANIFEST_VERSION } from "@shared/types/cloudSyncManifest";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";

import { buildCloudSyncResetPreview } from "@electron/services/cloud/migrations/syncResetPreview";

describe(buildCloudSyncResetPreview, () => {
    it("builds per-device breakdown from op object keys", () => {
        const manifest: CloudSyncManifest = {
            devices: { a: { compactedUpToOpId: 0, lastSeenAt: 0 } },
            manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        };

        const preview = buildCloudSyncResetPreview({
            manifest,
            syncObjects: [
                {
                    key: "sync/devices/a/ops/100-1-2.ndjson",
                    lastModifiedAt: 0,
                    sizeBytes: 1,
                },
                {
                    key: "sync/devices/a/ops/200-3-4.ndjson",
                    lastModifiedAt: 0,
                    sizeBytes: 1,
                },
                {
                    key: "sync/devices/b/ops/150-1-1.ndjson",
                    lastModifiedAt: 0,
                    sizeBytes: 1,
                },
                {
                    key: "sync/snapshots/1/1.json",
                    lastModifiedAt: 0,
                    sizeBytes: 1,
                },
                {
                    key: "sync/other.txt",
                    lastModifiedAt: 0,
                    sizeBytes: 1,
                },
            ],
        });

        expect(preview.syncObjectCount).toBe(5);
        expect(preview.operationObjectCount).toBe(3);
        expect(preview.snapshotObjectCount).toBe(1);
        expect(preview.otherObjectCount).toBe(1);

        expect(preview.deviceIds).toEqual(["a"]);
        expect(preview.operationDeviceIds).toEqual(["a", "b"]);

        const a = preview.perDevice.find((d) => d.deviceId === "a");
        const b = preview.perDevice.find((d) => d.deviceId === "b");
        expect(a?.operationObjectCount).toBe(2);
        expect(a?.oldestCreatedAtEpochMs).toBe(100);
        expect(a?.newestCreatedAtEpochMs).toBe(200);

        expect(b?.operationObjectCount).toBe(1);
        expect(b?.oldestCreatedAtEpochMs).toBe(150);
        expect(b?.newestCreatedAtEpochMs).toBe(150);
    });
});
