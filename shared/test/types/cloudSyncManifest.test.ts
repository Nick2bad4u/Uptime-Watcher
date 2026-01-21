import { describe, expect, it } from "vitest";

import {
    CLOUD_SYNC_MANIFEST_VERSION,
    parseCloudSyncManifest,
} from "@shared/types/cloudSyncManifest";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";

describe("cloudSyncManifest", () => {
    it("drops invalid device IDs from the manifest devices map", () => {
        const parsed = parseCloudSyncManifest({
            devices: {
                "ok-device": { compactedUpToOpId: 0, lastSeenAt: 1 },
                "a/b": { compactedUpToOpId: 0, lastSeenAt: 2 },
                "": { compactedUpToOpId: 0, lastSeenAt: 3 },
                ["__proto__"]: { compactedUpToOpId: 0, lastSeenAt: 4 },
            },
            manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        });

        expect(Object.keys(parsed.devices)).toEqual(["ok-device"]);

        // Defense-in-depth: ensure the returned record is not susceptible to
        // __proto__ key tricks.
        expect(Object.getPrototypeOf(parsed.devices)).toBeNull();
    });

    it("caps the devices map to the most recently seen devices", () => {
        const devices: Record<string, { compactedUpToOpId: number; lastSeenAt: number }> = {};
        for (let index = 0; index < 600; index += 1) {
            devices[`device-${index}`] = {
                compactedUpToOpId: index,
                lastSeenAt: index,
            };
        }

        const parsed = parseCloudSyncManifest({
            devices,
            manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        });

        expect(Object.keys(parsed.devices)).toHaveLength(512);
        // Highest lastSeenAt should be retained.
        expect(parsed.devices["device-599"]?.lastSeenAt).toBe(599);
        // Oldest should be trimmed.
        expect(parsed.devices["device-0"]).toBeUndefined();
    });
});
