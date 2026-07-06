import type { CloudSyncEntityState } from "@shared/types/cloudSyncState";

import {
    createCloudSyncEntityStateMap,
    createCloudSyncFieldValueMap,
    setCloudSyncEntityValue,
    setCloudSyncFieldValue,
    setCloudSyncRecordValue,
} from "@shared/utils/cloudSyncStateMaps";
import { describe, expect, it } from "vitest";

const PROTOTYPE_PROPERTY_NAME = "__proto__";
const WRITE_KEY = {
    deviceId: "device",
    opId: 1,
    timestamp: 1,
} as const;

describe("cloudSyncStateMaps", () => {
    it("creates null-prototype entity and field maps", () => {
        expect(
            Object.getPrototypeOf(createCloudSyncEntityStateMap())
        ).toBeNull();
        expect(
            Object.getPrototypeOf(createCloudSyncFieldValueMap())
        ).toBeNull();
    });

    it("defines enumerable writable own data properties", () => {
        const record: Record<string, string> = Object.create(null);

        setCloudSyncRecordValue(record, PROTOTYPE_PROPERTY_NAME, "safe");

        expect(Object.hasOwn(record, PROTOTYPE_PROPERTY_NAME)).toBeTruthy();
        expect(Reflect.get(record, PROTOTYPE_PROPERTY_NAME)).toBe("safe");
        expect(Object.getPrototypeOf(record)).toBeNull();
        expect(Object.keys(record)).toEqual([PROTOTYPE_PROPERTY_NAME]);
        expect(
            Object.getOwnPropertyDescriptor(record, PROTOTYPE_PROPERTY_NAME)
        ).toEqual({
            configurable: true,
            enumerable: true,
            value: "safe",
            writable: true,
        });
    });

    it("sets entity and field values without prototype pollution", () => {
        const entities = createCloudSyncEntityStateMap();
        const fields = createCloudSyncFieldValueMap();
        const entity: CloudSyncEntityState = {
            entityId: "entity",
            entityType: "site",
            fields,
        };

        setCloudSyncFieldValue(fields, "toString", {
            value: "field value",
            write: WRITE_KEY,
        });
        setCloudSyncEntityValue(entities, PROTOTYPE_PROPERTY_NAME, entity);

        expect(Object.getPrototypeOf(entities)).toBeNull();
        expect(Object.getPrototypeOf(fields)).toBeNull();
        expect(Reflect.get(entities, PROTOTYPE_PROPERTY_NAME)).toBe(entity);
        expect(fields["toString"]?.value).toBe("field value");
    });
});
