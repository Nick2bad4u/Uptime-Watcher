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

    it("rejects state sync event site identifiers with control characters", () => {
        for (const eventData of [
            {
                action: STATE_SYNC_ACTION.BULK_SYNC,
                revision: 1,
                siteCount: 0,
                siteIdentifier: "site\n1",
                sites: [],
                source: STATE_SYNC_SOURCE.DATABASE,
                timestamp: 1,
            },
            {
                action: STATE_SYNC_ACTION.UPDATE,
                delta: {
                    addedSites: [],
                    removedSiteIdentifiers: [],
                    updatedSites: [],
                },
                revision: 2,
                siteIdentifier: "site\n2",
                source: STATE_SYNC_SOURCE.DATABASE,
                timestamp: 2,
            },
            {
                action: STATE_SYNC_ACTION.DELETE,
                delta: {
                    addedSites: [],
                    removedSiteIdentifiers: ["site-3"],
                    updatedSites: [],
                },
                revision: 3,
                siteIdentifier: "site\n3",
                source: STATE_SYNC_SOURCE.DATABASE,
                timestamp: 3,
            },
        ]) {
            const parsed = safeParseStateSyncEventData(eventData);

            expect(parsed.success).toBeFalsy();
        }
    });

    it("preserves valid state sync event site identifiers exactly", () => {
        const parsed = safeParseStateSyncEventData({
            action: STATE_SYNC_ACTION.UPDATE,
            delta: {
                addedSites: [],
                removedSiteIdentifiers: [],
                updatedSites: [],
            },
            revision: 1,
            siteIdentifier: " site-a ",
            source: STATE_SYNC_SOURCE.DATABASE,
            timestamp: 1,
        });

        expect(parsed.success).toBeTruthy();
        expect(parsed.data?.siteIdentifier).toBe(" site-a ");
    });
});
