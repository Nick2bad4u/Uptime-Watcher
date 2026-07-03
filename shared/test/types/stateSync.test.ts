/**
 * Tests for runtime helpers in types/stateSync.
 */

import {
    safeParseStateSyncFullSyncResult,
    safeParseStateSyncStatusSummary,
    STATE_SYNC_SOURCE,
} from "@shared/types/stateSync";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

describe("stateSync", () => {
    it("rejects status summaries with timestamps outside the Date range", () => {
        const parsed = safeParseStateSyncStatusSummary({
            lastSyncAt: MAX_VALID_DATE_EPOCH_MS + 1,
            siteCount: 0,
            source: STATE_SYNC_SOURCE.CACHE,
            synchronized: false,
        });

        expect(parsed.success).toBeFalsy();
    });

    it("accepts status summary timestamps at the Date upper bound", () => {
        const parsed = safeParseStateSyncStatusSummary({
            lastSyncAt: MAX_VALID_DATE_EPOCH_MS,
            siteCount: 0,
            source: STATE_SYNC_SOURCE.CACHE,
            synchronized: true,
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects full sync results with timestamps outside the Date range", () => {
        const parsed = safeParseStateSyncFullSyncResult({
            completedAt: MAX_VALID_DATE_EPOCH_MS + 1,
            revision: 1,
            siteCount: 0,
            sites: [],
            source: STATE_SYNC_SOURCE.DATABASE,
            synchronized: true,
        });

        expect(parsed.success).toBeFalsy();
    });

    it("accepts full sync result timestamps at the Date upper bound", () => {
        const parsed = safeParseStateSyncFullSyncResult({
            completedAt: MAX_VALID_DATE_EPOCH_MS,
            revision: 1,
            siteCount: 0,
            sites: [],
            source: STATE_SYNC_SOURCE.DATABASE,
            synchronized: true,
        });

        expect(parsed.success).toBeTruthy();
    });
});
