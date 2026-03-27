import { describe, expect, it } from "vitest";

import {
    CLOUD_SYNC_SCHEMA_VERSION,
    parseCloudSyncOperation,
} from "@shared/types/cloudSync";

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
});
