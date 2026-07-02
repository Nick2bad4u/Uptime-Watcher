import {
    CLOUD_SYNC_BASELINE_VERSION,
    cloudSyncBaselineSchema,
    parseCloudSyncBaseline,
} from "@shared/types/cloudSyncBaseline";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { describe, expect, it } from "vitest";

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
});
