import {
    CLOUD_SYNC_SNAPSHOT_VERSION,
    parseCloudSyncSnapshot,
} from "@shared/types/cloudSyncSnapshot";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

const PROTOTYPE_KEY = "__proto__" as const;

function createSnapshotCandidate(): unknown {
    return {
        createdAt: 0,
        snapshotVersion: CLOUD_SYNC_SNAPSHOT_VERSION,
        state: {
            monitor: {
                "monitor-1": {
                    entityId: "monitor-1",
                    entityType: "monitor",
                    fields: {},
                },
            },
            settings: {
                "settings-1": {
                    entityId: "settings-1",
                    entityType: "settings",
                    fields: {},
                },
            },
            site: {
                "site-1": {
                    entityId: "site-1",
                    entityType: "site",
                    fields: {},
                },
            },
        },
        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
    };
}

describe(parseCloudSyncSnapshot, () => {
    it("accepts snapshot entity maps whose keys match entity identity", () => {
        expect(() =>
            parseCloudSyncSnapshot(createSnapshotCandidate())
        ).not.toThrow();
    });

    it("accepts createdAt at the Date upper bound", () => {
        const parsed = parseCloudSyncSnapshot({
            ...(createSnapshotCandidate() as Record<string, unknown>),
            createdAt: MAX_VALID_DATE_EPOCH_MS,
        });

        expect(parsed.createdAt).toBe(MAX_VALID_DATE_EPOCH_MS);
    });

    it("preserves prototype-named entity and field keys as own data", () => {
        const parsed = parseCloudSyncSnapshot(
            JSON.parse(`{
                "createdAt": 0,
                "snapshotVersion": 1,
                "state": {
                    "monitor": {},
                    "settings": {},
                    "site": {
                        "__proto__": {
                            "entityId": "__proto__",
                            "entityType": "site",
                            "fields": {
                                "__proto__": {
                                    "value": "field-value",
                                    "write": {
                                        "deviceId": "device-1",
                                        "opId": 1,
                                        "timestamp": 1
                                    }
                                }
                            }
                        }
                    }
                },
                "syncSchemaVersion": 1
            }`)
        );

        const site = parsed.state.site[PROTOTYPE_KEY];

        expect(Object.getPrototypeOf(parsed.state.site)).toBeNull();
        expect(Object.hasOwn(parsed.state.site, PROTOTYPE_KEY)).toBe(true);
        expect(site?.entityId).toBe(PROTOTYPE_KEY);
        expect(Object.getPrototypeOf(site?.fields)).toBeNull();
        expect(Object.hasOwn(site?.fields ?? {}, PROTOTYPE_KEY)).toBe(true);
        expect(site?.fields[PROTOTYPE_KEY]?.value).toBe("field-value");
    });

    it("rejects createdAt outside the Date range", () => {
        expect(() =>
            parseCloudSyncSnapshot({
                ...(createSnapshotCandidate() as Record<string, unknown>),
                createdAt: MAX_VALID_DATE_EPOCH_MS + 1,
            })
        ).toThrow();
    });

    it("rejects snapshot entities whose entityId differs from the map key", () => {
        expect(() =>
            parseCloudSyncSnapshot({
                createdAt: 0,
                snapshotVersion: CLOUD_SYNC_SNAPSHOT_VERSION,
                state: {
                    monitor: {},
                    settings: {},
                    site: {
                        "site-1": {
                            entityId: "site-2",
                            entityType: "site",
                            fields: {},
                        },
                    },
                },
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            })
        ).toThrow("entityId must match its state map key");
    });

    it("rejects snapshot entities whose entityType differs from the containing map", () => {
        expect(() =>
            parseCloudSyncSnapshot({
                createdAt: 0,
                snapshotVersion: CLOUD_SYNC_SNAPSHOT_VERSION,
                state: {
                    monitor: {
                        "monitor-1": {
                            entityId: "monitor-1",
                            entityType: "site",
                            fields: {},
                        },
                    },
                    settings: {},
                    site: {},
                },
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            })
        ).toThrow("entityType must match its state map");
    });

    it("rejects monitor snapshot entity IDs with control characters", () => {
        expect(() =>
            parseCloudSyncSnapshot({
                createdAt: 0,
                snapshotVersion: CLOUD_SYNC_SNAPSHOT_VERSION,
                state: {
                    monitor: {
                        "monitor\n1": {
                            entityId: "monitor\n1",
                            entityType: "monitor",
                            fields: {},
                        },
                    },
                    settings: {},
                    site: {},
                },
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            })
        ).toThrow("monitor entityId is invalid");
    });

    it("rejects site snapshot entity IDs with control characters", () => {
        expect(() =>
            parseCloudSyncSnapshot({
                createdAt: 0,
                snapshotVersion: CLOUD_SYNC_SNAPSHOT_VERSION,
                state: {
                    monitor: {},
                    settings: {},
                    site: {
                        "site\n1": {
                            entityId: "site\n1",
                            entityType: "site",
                            fields: {},
                        },
                    },
                },
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
            })
        ).toThrow("site entityId is invalid");
    });
});
