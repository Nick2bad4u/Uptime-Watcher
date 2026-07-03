import {
    CLOUD_SYNC_SNAPSHOT_VERSION,
    cloudSyncSnapshotSchema,
    parseCloudSyncSnapshot,
} from "@shared/types/cloudSyncSnapshot";
import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

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

    it("rejects createdAt outside the Date range", () => {
        const result = cloudSyncSnapshotSchema.safeParse({
            ...(createSnapshotCandidate() as Record<string, unknown>),
            createdAt: MAX_VALID_DATE_EPOCH_MS + 1,
        });

        expect(result.success).toBeFalsy();
    });

    it("rejects snapshot entities whose entityId differs from the map key", () => {
        const result = cloudSyncSnapshotSchema.safeParse({
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
        });

        expect(result.success).toBeFalsy();
        expect(result.error?.issues).toContainEqual(
            expect.objectContaining({
                message: "entityId must match its state map key",
                path: [
                    "state",
                    "site",
                    "site-1",
                    "entityId",
                ],
            })
        );
    });

    it("rejects snapshot entities whose entityType differs from the containing map", () => {
        const result = cloudSyncSnapshotSchema.safeParse({
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
        });

        expect(result.success).toBeFalsy();
        expect(result.error?.issues).toContainEqual(
            expect.objectContaining({
                message: "entityType must match its state map",
                path: [
                    "state",
                    "monitor",
                    "monitor-1",
                    "entityType",
                ],
            })
        );
    });
});
