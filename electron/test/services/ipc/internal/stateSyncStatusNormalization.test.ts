import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { describe, expect, it } from "vitest";

import { normalizeStateSyncPayload } from "../../../../services/ipc/internal/stateSyncStatusNormalization";

describe(normalizeStateSyncPayload, () => {
    const validBulkSyncPayload = {
        action: STATE_SYNC_ACTION.BULK_SYNC,
        revision: 1,
        siteCount: 1,
        sites: [{ identifier: "site-a" }],
        source: STATE_SYNC_SOURCE.DATABASE,
        timestamp: 1_700_000_000_000,
    };

    it("normalizes valid bulk-sync payloads", () => {
        expect(normalizeStateSyncPayload(validBulkSyncPayload)).toEqual({
            action: STATE_SYNC_ACTION.BULK_SYNC,
            revision: 1,
            siteCount: 1,
            sites: [{ identifier: "site-a" }],
            source: STATE_SYNC_SOURCE.DATABASE,
            timestamp: 1_700_000_000_000,
            truncated: false,
        });
    });

    it("rejects invalid bulk-sync numeric invariants", () => {
        for (const invalidPayload of [
            { ...validBulkSyncPayload, revision: -1 },
            { ...validBulkSyncPayload, revision: 1.5 },
            { ...validBulkSyncPayload, siteCount: -1 },
            { ...validBulkSyncPayload, siteCount: 1.5 },
            { ...validBulkSyncPayload, timestamp: -1 },
            { ...validBulkSyncPayload, timestamp: 1.5 },
        ]) {
            expect(normalizeStateSyncPayload(invalidPayload)).toBeNull();
        }
    });

    it("rejects invalid delta numeric invariants", () => {
        const validDeltaPayload = {
            action: STATE_SYNC_ACTION.UPDATE,
            delta: {
                addedSites: [],
                removedSiteIdentifiers: [],
                updatedSites: [{ identifier: "site-a" }],
            },
            revision: 2,
            source: STATE_SYNC_SOURCE.DATABASE,
            timestamp: 1_700_000_000_001,
        };

        for (const invalidPayload of [
            { ...validDeltaPayload, revision: -1 },
            { ...validDeltaPayload, revision: 1.5 },
            { ...validDeltaPayload, timestamp: -1 },
            { ...validDeltaPayload, timestamp: 1.5 },
        ]) {
            expect(normalizeStateSyncPayload(invalidPayload)).toBeNull();
        }
    });
});
