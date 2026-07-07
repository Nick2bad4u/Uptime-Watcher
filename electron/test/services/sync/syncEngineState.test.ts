import type { CloudSyncState } from "@shared/types/cloudSyncState";
import type { Site } from "@shared/types";

import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { CLOUD_SYNC_BASELINE_VERSION } from "@shared/types/cloudSyncBaseline";
import {
    buildCanonicalLocalState,
    buildDesiredMonitorsFromSyncState,
    buildDesiredSettingsFromSyncState,
    buildDesiredSitesFromSyncState,
    buildLocalOperations,
    getMaxOpIdByDevice,
    normalizeCloudSyncState,
    parseBaseline,
} from "@electron/services/sync/syncEngineState";
import { describe, expect, it, vi } from "vitest";

const PROTOTYPE_PROPERTY_NAME = "__proto__";
const INHERITED_PROPERTY_NAME = "toString";
const WRITE = {
    deviceId: "device-1",
    opId: 1,
    timestamp: 1,
} as const;

describe(parseBaseline, () => {
    it("recovers malformed stored JSON with baseline JSON context", () => {
        const result = parseBaseline("{not-json");

        expect(result.recovered).toBe(true);
        expect(result.error).toContain("Invalid baseline JSON");
        expect(result.baseline.baselineVersion).toBe(
            CLOUD_SYNC_BASELINE_VERSION
        );
        expect(result.baseline.syncSchemaVersion).toBe(
            CLOUD_SYNC_SCHEMA_VERSION
        );
        expect(Object.getPrototypeOf(result.baseline.sites)).toBeNull();
    });

    it("recovers oversized stored baselines before parsing JSON", () => {
        const envKey = "UW_CLOUD_SYNC_MAX_BASELINE_BYTES" as const;
        const original = process.env[envKey];
        const parseSpy = vi.spyOn(JSON, "parse");

        process.env[envKey] = "1";

        try {
            const result = parseBaseline("{}");

            expect(result.recovered).toBe(true);
            expect(result.error).toContain("exceeds size limit");
            expect(parseSpy).not.toHaveBeenCalled();
            expect(result.baseline.baselineVersion).toBe(
                CLOUD_SYNC_BASELINE_VERSION
            );
        } finally {
            parseSpy.mockRestore();
            if (original === undefined) {
                Reflect.deleteProperty(process.env, envKey);
            } else {
                process.env[envKey] = original;
            }
        }
    });

    it("parses prototype-named baseline keys as own null-prototype entries", () => {
        const result = parseBaseline(`{
            "baselineVersion": ${CLOUD_SYNC_BASELINE_VERSION},
            "createdAt": 0,
            "monitors": {},
            "settings": {
                "__proto__": "prototype-setting-value"
            },
            "sites": {},
            "syncSchemaVersion": ${CLOUD_SYNC_SCHEMA_VERSION}
        }`);

        expect(result.recovered).toBe(false);
        expect(Object.getPrototypeOf(result.baseline.settings)).toBeNull();
        expect(
            Object.hasOwn(result.baseline.settings, PROTOTYPE_PROPERTY_NAME)
        ).toBe(true);
        expect(result.baseline.settings[PROTOTYPE_PROPERTY_NAME]).toBe(
            "prototype-setting-value"
        );
    });
});

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

describe("syncEngineState map builders", () => {
    it("builds canonical local state with null-prototype maps", () => {
        const site: Site = {
            identifier: PROTOTYPE_PROPERTY_NAME,
            monitoring: true,
            monitors: [
                {
                    checkInterval: 60_000,
                    history: [],
                    id: INHERITED_PROPERTY_NAME,
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending",
                    timeout: 10_000,
                    type: "http",
                    url: "https://example.com",
                },
            ],
            name: "Prototype site",
        };

        const settings = Object.create(null) as Record<string, string>;
        Object.defineProperty(settings, PROTOTYPE_PROPERTY_NAME, {
            configurable: true,
            enumerable: true,
            value: "prototype-setting-value",
            writable: true,
        });
        Object.defineProperty(settings, INHERITED_PROPERTY_NAME, {
            configurable: true,
            enumerable: true,
            value: "setting-value",
            writable: true,
        });

        const current = buildCanonicalLocalState([site], settings);

        expect(Object.getPrototypeOf(current.sites)).toBeNull();
        expect(Object.getPrototypeOf(current.monitors)).toBeNull();
        expect(Object.getPrototypeOf(current.settings)).toBeNull();
        expect(Object.hasOwn(current.sites, PROTOTYPE_PROPERTY_NAME)).toBe(
            true
        );
        expect(Object.hasOwn(current.monitors, INHERITED_PROPERTY_NAME)).toBe(
            true
        );
        expect(Object.hasOwn(current.settings, INHERITED_PROPERTY_NAME)).toBe(
            true
        );
        expect(Object.hasOwn(current.settings, PROTOTYPE_PROPERTY_NAME)).toBe(
            true
        );
        expect(current.settings[PROTOTYPE_PROPERTY_NAME]).toBe(
            "prototype-setting-value"
        );
    });

    it("builds desired site maps with prototype-named site ids", () => {
        const state = {
            [PROTOTYPE_PROPERTY_NAME]: {
                entityId: PROTOTYPE_PROPERTY_NAME,
                entityType: "site",
                fields: {
                    monitoring: {
                        value: true,
                        write: WRITE,
                    },
                    name: {
                        value: "Prototype site",
                        write: WRITE,
                    },
                },
            },
        } satisfies CloudSyncState["site"];

        const desired = buildDesiredSitesFromSyncState(state);

        expect(Object.getPrototypeOf(desired)).toBeNull();
        expect(Object.hasOwn(desired, PROTOTYPE_PROPERTY_NAME)).toBe(true);
        expect(desired[PROTOTYPE_PROPERTY_NAME]?.identifier).toBe(
            PROTOTYPE_PROPERTY_NAME
        );
    });

    it("builds desired monitor maps with inherited-property monitor ids", () => {
        const state = {
            [INHERITED_PROPERTY_NAME]: {
                entityId: INHERITED_PROPERTY_NAME,
                entityType: "monitor",
                fields: {
                    checkInterval: {
                        value: 60_000,
                        write: WRITE,
                    },
                    monitoring: {
                        value: true,
                        write: WRITE,
                    },
                    retryAttempts: {
                        value: 3,
                        write: WRITE,
                    },
                    siteIdentifier: {
                        value: "site-1",
                        write: WRITE,
                    },
                    timeout: {
                        value: 10_000,
                        write: WRITE,
                    },
                    type: {
                        value: "http",
                        write: WRITE,
                    },
                    url: {
                        value: "https://example.com",
                        write: WRITE,
                    },
                },
            },
        } as const satisfies CloudSyncState["monitor"];

        const desired = buildDesiredMonitorsFromSyncState(state);

        expect(Object.getPrototypeOf(desired)).toBeNull();
        expect(Object.hasOwn(desired, INHERITED_PROPERTY_NAME)).toBe(true);
        expect(desired[INHERITED_PROPERTY_NAME]?.id).toBe(
            INHERITED_PROPERTY_NAME
        );
    });

    it("builds desired settings maps with inherited-property keys", () => {
        const state = {
            [INHERITED_PROPERTY_NAME]: {
                entityId: INHERITED_PROPERTY_NAME,
                entityType: "settings",
                fields: {
                    value: {
                        value: "setting-value",
                        write: WRITE,
                    },
                },
            },
        } as const satisfies CloudSyncState["settings"];

        const desired = buildDesiredSettingsFromSyncState(state);

        expect(Object.getPrototypeOf(desired)).toBeNull();
        expect(Object.hasOwn(desired, INHERITED_PROPERTY_NAME)).toBe(true);
        expect(desired[INHERITED_PROPERTY_NAME]).toBe("setting-value");
    });
});

describe(getMaxOpIdByDevice, () => {
    it("aggregates device IDs that match inherited object properties", () => {
        const result = getMaxOpIdByDevice([
            {
                deviceId: INHERITED_PROPERTY_NAME,
                entityId: "site-1",
                entityType: "site",
                field: "name",
                kind: "set-field",
                opId: 1,
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                timestamp: 1,
                value: "Example",
            },
            {
                deviceId: INHERITED_PROPERTY_NAME,
                entityId: "site-1",
                entityType: "site",
                field: "monitoring",
                kind: "set-field",
                opId: 7,
                syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
                timestamp: 2,
                value: true,
            },
        ]);

        expect(Object.getPrototypeOf(result)).toBeNull();
        expect(result[INHERITED_PROPERTY_NAME]).toBe(7);
    });
});
