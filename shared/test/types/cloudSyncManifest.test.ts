import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import {
    CLOUD_SYNC_MANIFEST_VERSION,
    createCloudSyncManifestDevices,
    parseCloudSyncManifest,
    setCloudSyncManifestDevice,
} from "@shared/types/cloudSyncManifest";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

describe("cloudSyncManifest", () => {
    it("returns a null-prototype devices map when all device IDs are valid", () => {
        const parsed = parseCloudSyncManifest({
            devices: {
                "device-a": { compactedUpToOpId: 1, lastSeenAt: 10 },
                "device-b": { compactedUpToOpId: 2, lastSeenAt: 20 },
            },
            manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        });

        expect(Object.getPrototypeOf(parsed.devices)).toBeNull();
        expect(Object.keys(parsed.devices)).toEqual(["device-a", "device-b"]);
        expect(parsed.devices["device-b"]?.compactedUpToOpId).toBe(2);
    });

    it("creates null-prototype manifest devices maps", () => {
        const devices = createCloudSyncManifestDevices([
            ["device-a", { compactedUpToOpId: 1, lastSeenAt: 10 }],
        ]);

        expect(Object.getPrototypeOf(devices)).toBeNull();
        expect(Object.hasOwn(devices, "device-a")).toBeTruthy();
        expect(devices["device-a"]?.lastSeenAt).toBe(10);
    });

    it("sets manifest device entries as own data properties", () => {
        const devices = createCloudSyncManifestDevices();
        const meta = { compactedUpToOpId: 3, lastSeenAt: 30 };

        setCloudSyncManifestDevice(devices, "toString", meta);

        expect(Object.getPrototypeOf(devices)).toBeNull();
        expect(Object.hasOwn(devices, "toString")).toBeTruthy();
        expect(Object.getOwnPropertyDescriptor(devices, "toString")).toEqual({
            configurable: true,
            enumerable: true,
            value: meta,
            writable: true,
        });
    });

    it("accepts manifest timestamps at the Date upper bound", () => {
        const parsed = parseCloudSyncManifest({
            devices: {
                "device-a": {
                    compactedUpToOpId: 1,
                    lastSeenAt: MAX_VALID_DATE_EPOCH_MS,
                },
            },
            lastCompactionAt: MAX_VALID_DATE_EPOCH_MS,
            manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
            resetAt: MAX_VALID_DATE_EPOCH_MS,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        });

        expect(parsed.devices["device-a"]?.lastSeenAt).toBe(
            MAX_VALID_DATE_EPOCH_MS
        );
        expect(parsed.lastCompactionAt).toBe(MAX_VALID_DATE_EPOCH_MS);
        expect(parsed.resetAt).toBe(MAX_VALID_DATE_EPOCH_MS);
    });

    it("rejects manifest timestamps outside the Date range", () => {
        expect(() =>
            parseCloudSyncManifest({
                devices: {
                    "device-a": {
                        compactedUpToOpId: 1,
                        lastSeenAt: MAX_VALID_DATE_EPOCH_MS + 1,
                    },
                },
                lastCompactionAt: MAX_VALID_DATE_EPOCH_MS + 1,
                manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
                resetAt: MAX_VALID_DATE_EPOCH_MS + 1,
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            })
        ).toThrow();
    });

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

    it("normalizes device IDs through manifest parsing", () => {
        const parsed = parseCloudSyncManifest({
            devices: {
                "ok-device": { compactedUpToOpId: 0, lastSeenAt: 1 },
                "bad/device": { compactedUpToOpId: 0, lastSeenAt: 2 },
            },
            manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        });

        expect(Object.keys(parsed.devices)).toEqual(["ok-device"]);
        expect(Object.getPrototypeOf(parsed.devices)).toBeNull();
    });

    it("caps the devices map to the most recently seen devices", () => {
        const devices: Record<
            string,
            { compactedUpToOpId: number; lastSeenAt: number }
        > = {};
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

    it("does not normalize whitespace-padded device IDs into valid IDs", () => {
        const parsed = parseCloudSyncManifest({
            devices: {
                "device-a": { compactedUpToOpId: 2, lastSeenAt: 20 },
                " device-a ": { compactedUpToOpId: 999, lastSeenAt: 999 },
                "\tdevice-b\t": { compactedUpToOpId: 7, lastSeenAt: 70 },
            },
            manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        });

        expect(Object.keys(parsed.devices)).toEqual(["device-a"]);
        expect(parsed.devices["device-a"]?.compactedUpToOpId).toBe(2);
    });
});
