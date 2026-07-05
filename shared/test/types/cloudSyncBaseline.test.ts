import {
    CLOUD_SYNC_BASELINE_VERSION,
    cloudSyncBaselineSchema,
    parseCloudSyncBaseline,
} from "@shared/types/cloudSyncBaseline";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

const PROTOTYPE_KEY = "__proto__" as const;

function createBaselineCandidate(): Record<string, unknown> {
    return {
        baselineVersion: CLOUD_SYNC_BASELINE_VERSION,
        createdAt: 0,
        monitors: {
            "monitor-1": {
                checkInterval: 60_000,
                id: "monitor-1",
                monitoring: true,
                retryAttempts: 3,
                siteIdentifier: "site-1",
                timeout: 10_000,
                type: "http",
                url: "https://example.com",
            },
        },
        settings: {
            "setting-1": "value",
        },
        sites: {
            "site-1": {
                identifier: "site-1",
                monitoring: true,
                name: "Example",
            },
        },
        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
    };
}

describe(parseCloudSyncBaseline, () => {
    it("normalizes parsed baseline maps into null-prototype dictionaries", () => {
        const baseline = parseCloudSyncBaseline(createBaselineCandidate());

        expect(Object.getPrototypeOf(baseline.monitors)).toBeNull();
        expect(Object.getPrototypeOf(baseline.settings)).toBeNull();
        expect(Object.getPrototypeOf(baseline.sites)).toBeNull();
        expect(baseline.monitors["monitor-1"]?.id).toBe("monitor-1");
        expect(baseline.settings["setting-1"]).toBe("value");
        expect(baseline.sites["site-1"]?.identifier).toBe("site-1");
    });

    it("accepts createdAt at the Date upper bound", () => {
        const baseline = parseCloudSyncBaseline({
            ...createBaselineCandidate(),
            createdAt: MAX_VALID_DATE_EPOCH_MS,
        });

        expect(baseline.createdAt).toBe(MAX_VALID_DATE_EPOCH_MS);
    });

    it("preserves prototype-named baseline map keys as own data", () => {
        const baseline = parseCloudSyncBaseline(
            JSON.parse(`{
                "baselineVersion": 1,
                "createdAt": 0,
                "monitors": {
                    "__proto__": {
                        "checkInterval": 60000,
                        "id": "__proto__",
                        "monitoring": true,
                        "retryAttempts": 3,
                        "siteIdentifier": "__proto__",
                        "timeout": 10000,
                        "type": "http",
                        "url": "https://example.com"
                    }
                },
                "settings": {
                    "__proto__": "setting-value"
                },
                "sites": {
                    "__proto__": {
                        "identifier": "__proto__",
                        "monitoring": true,
                        "name": "Prototype site"
                    }
                },
                "syncSchemaVersion": 1
            }`)
        );

        expect(Object.hasOwn(baseline.monitors, PROTOTYPE_KEY)).toBe(true);
        expect(Object.hasOwn(baseline.settings, PROTOTYPE_KEY)).toBe(true);
        expect(Object.hasOwn(baseline.sites, PROTOTYPE_KEY)).toBe(true);
        expect(baseline.monitors[PROTOTYPE_KEY]?.id).toBe(PROTOTYPE_KEY);
        expect(baseline.settings[PROTOTYPE_KEY]).toBe("setting-value");
        expect(baseline.sites[PROTOTYPE_KEY]?.identifier).toBe(PROTOTYPE_KEY);
    });

    it("rejects createdAt outside the Date range", () => {
        const result = cloudSyncBaselineSchema.safeParse({
            ...createBaselineCandidate(),
            createdAt: MAX_VALID_DATE_EPOCH_MS + 1,
        });

        expect(result.success).toBeFalsy();
    });

    it("rejects baseline sites whose identifier differs from the map key", () => {
        const result = cloudSyncBaselineSchema.safeParse({
            ...createBaselineCandidate(),
            sites: {
                "site-1": {
                    identifier: "site-2",
                    monitoring: true,
                    name: "Example",
                },
            },
        });

        expect(result.success).toBeFalsy();
        expect(result.error?.issues).toContainEqual(
            expect.objectContaining({
                message: "site identifier must match its baseline map key",
                path: [
                    "sites",
                    "site-1",
                    "identifier",
                ],
            })
        );
    });

    it("rejects baseline monitors whose id differs from the map key", () => {
        const result = cloudSyncBaselineSchema.safeParse({
            ...createBaselineCandidate(),
            monitors: {
                "monitor-1": {
                    checkInterval: 60_000,
                    id: "monitor-2",
                    monitoring: true,
                    retryAttempts: 3,
                    siteIdentifier: "site-1",
                    timeout: 10_000,
                    type: "http",
                    url: "https://example.com",
                },
            },
        });

        expect(result.success).toBeFalsy();
        expect(result.error?.issues).toContainEqual(
            expect.objectContaining({
                message: "monitor id must match its baseline map key",
                path: [
                    "monitors",
                    "monitor-1",
                    "id",
                ],
            })
        );
    });

    it("rejects baseline site identifiers with control characters", () => {
        const result = cloudSyncBaselineSchema.safeParse({
            ...createBaselineCandidate(),
            sites: {
                "site\n1": {
                    identifier: "site\n1",
                    monitoring: true,
                    name: "Example",
                },
            },
        });

        expect(result.success).toBeFalsy();
    });

    it("rejects baseline monitor identifiers with control characters", () => {
        const result = cloudSyncBaselineSchema.safeParse({
            ...createBaselineCandidate(),
            monitors: {
                "monitor\n1": {
                    checkInterval: 60_000,
                    id: "monitor\n1",
                    monitoring: true,
                    retryAttempts: 3,
                    siteIdentifier: "site-1",
                    timeout: 10_000,
                    type: "http",
                    url: "https://example.com",
                },
            },
        });

        expect(result.success).toBeFalsy();
    });
});
