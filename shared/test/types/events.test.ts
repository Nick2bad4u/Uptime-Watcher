/**
 * Tests for runtime helpers in types/events.
 */

import {
    eventMetadataSchema,
    safeParseStateSyncEventData,
} from "@shared/types/events";
import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

describe("events", () => {
    it("rejects event metadata timestamps outside the Date range", () => {
        const parsed = eventMetadataSchema.safeParse({
            busId: "renderer",
            correlationId: "correlation-id",
            eventName: "state-sync-event",
            timestamp: MAX_VALID_DATE_EPOCH_MS + 1,
        });

        expect(parsed.success).toBeFalsy();
    });

    it("accepts event metadata timestamps at the Date upper bound", () => {
        const parsed = eventMetadataSchema.safeParse({
            busId: "renderer",
            correlationId: "correlation-id",
            eventName: "state-sync-event",
            timestamp: MAX_VALID_DATE_EPOCH_MS,
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects state sync event timestamps outside the Date range", () => {
        const parsed = safeParseStateSyncEventData({
            action: STATE_SYNC_ACTION.BULK_SYNC,
            revision: 1,
            siteCount: 0,
            sites: [],
            source: STATE_SYNC_SOURCE.DATABASE,
            timestamp: MAX_VALID_DATE_EPOCH_MS + 1,
        });

        expect(parsed.success).toBeFalsy();
    });

    it("accepts state sync event timestamps at the Date upper bound", () => {
        const parsed = safeParseStateSyncEventData({
            action: STATE_SYNC_ACTION.BULK_SYNC,
            revision: 1,
            siteCount: 0,
            sites: [],
            source: STATE_SYNC_SOURCE.DATABASE,
            timestamp: MAX_VALID_DATE_EPOCH_MS,
        });

        expect(parsed.success).toBeTruthy();
    });
});
