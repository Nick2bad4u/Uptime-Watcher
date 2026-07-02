import type { CloudSyncState } from "@shared/types/cloudSyncState";

import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import {
    buildLocalOperations,
    normalizeCloudSyncState,
} from "@electron/services/sync/syncEngineState";
import { describe, expect, it } from "vitest";

const PROTOTYPE_PROPERTY_NAME = "__proto__";

describe(normalizeCloudSyncState, () => {
    it("normalizes remote-keyed maps into null-prototype dictionaries", () => {
        const state = JSON.parse(`{
            "monitor": {
                "__proto__": {
                    "entityId": "__proto__",
                    "entityType": "monitor",
                    "fields": {
                        "__proto__": {
                            "value": "monitor-field",
                            "write": {
                                "deviceId": "remote",
                                "opId": 1,
                                "timestamp": 1
                            }
                        }
                    }
                }
            },
            "settings": {
                "__proto__": {
                    "entityId": "__proto__",
                    "entityType": "settings",
                    "fields": {
                        "__proto__": {
                            "value": "settings-field",
                            "write": {
                                "deviceId": "remote",
                                "opId": 2,
                                "timestamp": 2
                            }
                        }
                    }
                }
            },
            "site": {
                "__proto__": {
                    "entityId": "__proto__",
                    "entityType": "site",
                    "fields": {
                        "__proto__": {
                            "value": "site-field",
                            "write": {
                                "deviceId": "remote",
                                "opId": 3,
                                "timestamp": 3
                            }
                        }
                    }
                }
            }
        }`) as CloudSyncState;

        const normalized = normalizeCloudSyncState(state);
        const monitor = normalized.monitor[PROTOTYPE_PROPERTY_NAME];
        const settings = normalized.settings[PROTOTYPE_PROPERTY_NAME];
        const site = normalized.site[PROTOTYPE_PROPERTY_NAME];

        expect(Object.getPrototypeOf(normalized.monitor)).toBeNull();
        expect(Object.getPrototypeOf(normalized.settings)).toBeNull();
        expect(Object.getPrototypeOf(normalized.site)).toBeNull();
        expect(Object.hasOwn(normalized.monitor, PROTOTYPE_PROPERTY_NAME)).toBe(
            true
        );
        expect(
            Object.hasOwn(normalized.settings, PROTOTYPE_PROPERTY_NAME)
        ).toBe(true);
        expect(Object.hasOwn(normalized.site, PROTOTYPE_PROPERTY_NAME)).toBe(
            true
        );

        expect(Object.getPrototypeOf(monitor?.fields)).toBeNull();
        expect(Object.getPrototypeOf(settings?.fields)).toBeNull();
        expect(Object.getPrototypeOf(site?.fields)).toBeNull();
        expect(monitor?.fields[PROTOTYPE_PROPERTY_NAME]?.value).toBe(
            "monitor-field"
        );
        expect(settings?.fields[PROTOTYPE_PROPERTY_NAME]?.value).toBe(
            "settings-field"
        );
        expect(site?.fields[PROTOTYPE_PROPERTY_NAME]?.value).toBe("site-field");

        expect(monitor?.fields["timeout"]?.value).toBeGreaterThan(0);
        expect(site?.fields["name"]?.value).toBe(PROTOTYPE_PROPERTY_NAME);
    });
});

describe(buildLocalOperations, () => {
    it("emits deletes for baseline keys that match inherited object properties", () => {
        const { operations } = buildLocalOperations({
            baseline: {
                baselineVersion: 1,
                createdAt: 0,
                monitors: {},
                settings: {},
                sites: {
                    toString: {
                        identifier: "toString",
                        monitoring: true,
                        name: "Inherited key site",
                    },
                },
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            },
            current: {
                monitors: {},
                settings: {},
                sites: {},
            },
            deviceId: "device-1",
            nextOpId: 1,
            now: 10,
        });

        expect(operations).toContainEqual(
            expect.objectContaining({
                entityId: "toString",
                entityType: "site",
                kind: "delete-entity",
            })
        );
    });
});
