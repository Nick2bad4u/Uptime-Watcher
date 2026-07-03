import { STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { describe, expect, it } from "vitest";

import {
    createStateSyncStatusSummary,
    normalizeStateSyncStatusSummary,
} from "../../../../services/ipc/internal/stateSyncStatusSummary";

describe(createStateSyncStatusSummary, () => {
    it("preserves valid summary values", () => {
        expect(
            createStateSyncStatusSummary({
                lastSyncAt: 1_700_000_000_000,
                siteCount: 3,
                source: STATE_SYNC_SOURCE.DATABASE,
                synchronized: true,
            })
        ).toEqual({
            lastSyncAt: 1_700_000_000_000,
            siteCount: 3,
            source: STATE_SYNC_SOURCE.DATABASE,
            synchronized: true,
        });
    });

    it("drops invalid timestamp and count values", () => {
        for (const summary of [
            createStateSyncStatusSummary({
                lastSyncAt: -1,
                siteCount: 3,
                source: STATE_SYNC_SOURCE.CACHE,
                synchronized: false,
            }),
            createStateSyncStatusSummary({
                lastSyncAt: 1.5,
                siteCount: 1.5,
                source: STATE_SYNC_SOURCE.CACHE,
                synchronized: false,
            }),
        ]) {
            expect(summary.lastSyncAt).toBeNull();
        }

        expect(
            createStateSyncStatusSummary({
                lastSyncAt: null,
                siteCount: 1.5,
                source: STATE_SYNC_SOURCE.CACHE,
                synchronized: false,
            }).siteCount
        ).toBe(0);
    });
});

describe(normalizeStateSyncStatusSummary, () => {
    it("normalizes invalid live summary values before merging", () => {
        const normalized = normalizeStateSyncStatusSummary({
            cachedSiteCount: 4,
            currentStatus: {
                lastSyncAt: -1,
                siteCount: 1.5,
                source: STATE_SYNC_SOURCE.DATABASE,
                synchronized: true,
            },
        });

        expect(normalized).toEqual({
            lastSyncAt: null,
            siteCount: 4,
            source: STATE_SYNC_SOURCE.DATABASE,
            synchronized: true,
        });
    });

    it("ignores invalid cached site counts", () => {
        const normalized = normalizeStateSyncStatusSummary({
            cachedSiteCount: 1.5,
            currentStatus: {
                lastSyncAt: 1_700_000_000_000,
                siteCount: 2,
                source: STATE_SYNC_SOURCE.CACHE,
                synchronized: false,
            },
        });

        expect(normalized.siteCount).toBe(2);
    });
});
