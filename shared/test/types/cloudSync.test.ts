import {
    CLOUD_SYNC_SCHEMA_VERSION,
    cloudSyncWriteKeySchema,
    compareCloudSyncWriteKey,
    parseCloudSyncOperation,
} from "@shared/types/cloudSync";
import { getPersistedDeviceIdValidationError } from "@shared/validation/persistedDeviceIdValidation";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

const PROTOTYPE_KEY = "__proto__" as const;
const OVERSIZED_DEVICE_ID = "d".repeat(257);

describe("cloudSync", () => {
    it("preserves leading and trailing whitespace in JSON string values", () => {
        const input = {
            deviceId: "device-1",
            entityId: "settings-key",
            entityType: "settings",
            field: "value",
            kind: "set-field",
            opId: 1,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: 1,
            value: "  preserve me  ",
        } as const;

        const parsed = parseCloudSyncOperation(input);

        expect(parsed.kind).toBe("set-field");
        if (parsed.kind === "set-field") {
            expect(parsed.value).toBe("  preserve me  ");
        }
    });

    it("preserves JSON object keys without trimming", () => {
        const input = {
            deviceId: "device-1",
            entityId: "settings-key",
            entityType: "settings",
            field: "value",
            kind: "set-field",
            opId: 2,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: 2,
            value: JSON.parse(
                '{"":0,"key":1," key ":2,"__proto__":{"nested":true}}'
            ),
        } as const;

        const parsed = parseCloudSyncOperation(input);

        expect(parsed.kind).toBe("set-field");
        if (parsed.kind === "set-field") {
            expect(typeof parsed.value).toBe("object");
            expect(parsed.value).not.toBeNull();
            expect(Array.isArray(parsed.value)).toBeFalsy();

            const parsedObject = parsed.value as Record<string, unknown>;
            expect(Object.keys(parsedObject).toSorted()).toEqual([
                "",
                " key ",
                PROTOTYPE_KEY,
                "key",
            ]);
            expect(Object.getPrototypeOf(parsedObject)).toBeNull();
            expect(parsedObject[""]).toBe(0);
            expect(parsedObject[" key "]).toBe(2);
            expect(parsedObject["key"]).toBe(1);
            expect(
                (parsedObject[PROTOTYPE_KEY] as Record<string, unknown>)[
                    "nested"
                ]
            ).toBe(true);
        }
    });

    it.each([
        " device-1 ",
        "device/1",
        "device:1",
        "__proto__",
        OVERSIZED_DEVICE_ID,
    ])("rejects unsafe operation deviceId %s", (deviceId) => {
        const input = {
            deviceId,
            entityId: "settings-key",
            entityType: "settings",
            kind: "delete-entity",
            opId: 3,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: 3,
        } as const;

        expect(() => parseCloudSyncOperation(input)).toThrow(
            getPersistedDeviceIdValidationError(deviceId) ?? "Invalid input"
        );
    });

    it("applies persisted deviceId validation to write keys", () => {
        expect(() =>
            cloudSyncWriteKeySchema.parse({
                deviceId: "device\n1",
                opId: 1,
                timestamp: 1,
            })
        ).toThrow("deviceId must not contain control characters");
    });

    it("compares write key deviceId tie-breakers without locale-sensitive ordering", () => {
        expect(
            compareCloudSyncWriteKey(
                { deviceId: "Z-device", opId: 1, timestamp: 1 },
                { deviceId: "a-device", opId: 1, timestamp: 1 }
            )
        ).toBeLessThan(0);
    });

    it("rejects monitor operation entity IDs with control characters", () => {
        expect(() =>
            parseCloudSyncOperation({
                deviceId: "device-1",
                entityId: "monitor\n1",
                entityType: "monitor",
                kind: "delete-entity",
                opId: 4,
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                timestamp: 4,
            })
        ).toThrow("monitor entityId is invalid");
    });

    it("rejects site operation entity IDs with control characters", () => {
        expect(() =>
            parseCloudSyncOperation({
                deviceId: "device-1",
                entityId: "site\n1",
                entityType: "site",
                field: "name",
                kind: "set-field",
                opId: 5,
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                timestamp: 5,
                value: "Example",
            })
        ).toThrow("site entityId is invalid");
    });

    it("rejects write key timestamps outside the Date range", () => {
        const result = cloudSyncWriteKeySchema.safeParse({
            deviceId: "device-1",
            opId: 1,
            timestamp: MAX_VALID_DATE_EPOCH_MS + 1,
        });

        expect(result.success).toBeFalsy();
    });

    it("accepts operation timestamps at the Date upper bound", () => {
        const parsed = parseCloudSyncOperation({
            deviceId: "device-1",
            entityId: "settings-key",
            entityType: "settings",
            kind: "delete-entity",
            opId: 6,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            timestamp: MAX_VALID_DATE_EPOCH_MS,
        });

        expect(parsed.timestamp).toBe(MAX_VALID_DATE_EPOCH_MS);
    });

    it("rejects operation timestamps outside the Date range", () => {
        expect(() =>
            parseCloudSyncOperation({
                deviceId: "device-1",
                entityId: "settings-key",
                entityType: "settings",
                kind: "delete-entity",
                opId: 7,
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                timestamp: MAX_VALID_DATE_EPOCH_MS + 1,
            })
        ).toThrow();
    });
});
