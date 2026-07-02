import {
    CLOUD_SYNC_SCHEMA_VERSION,
    cloudSyncWriteKeySchema,
    parseCloudSyncOperation,
} from "@shared/types/cloudSync";
import {
    MAX_PERSISTED_DEVICE_ID_BYTES,
    getPersistedDeviceIdValidationError,
} from "@shared/validation/persistedDeviceIdValidation";
import { describe, expect, it } from "vitest";

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
            value: {
                key: 1,
                " key ": 2,
            },
        } as const;

        const parsed = parseCloudSyncOperation(input);

        expect(parsed.kind).toBe("set-field");
        if (parsed.kind === "set-field") {
            expect(typeof parsed.value).toBe("object");
            expect(parsed.value).not.toBeNull();
            expect(Array.isArray(parsed.value)).toBeFalsy();

            const parsedObject = parsed.value as Record<string, unknown>;
            expect(Object.keys(parsedObject).toSorted()).toEqual([
                " key ",
                "key",
            ]);
            expect(parsedObject[" key "]).toBe(2);
            expect(parsedObject["key"]).toBe(1);
        }
    });

    it.each([
        " device-1 ",
        "device/1",
        "device:1",
        "__proto__",
        "d".repeat(MAX_PERSISTED_DEVICE_ID_BYTES + 1),
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
});
