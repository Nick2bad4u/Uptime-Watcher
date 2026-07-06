import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
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

    it("normalizes only own non-empty site identifiers without trimming", () => {
        const inheritedIdentifier = Object.create({
            identifier: "inherited-site",
        }) as Record<string, unknown>;
        const accessorIdentifier = Object.create(null) as Record<
            string,
            unknown
        >;
        Object.defineProperty(accessorIdentifier, "identifier", {
            enumerable: true,
            get: () => "accessor-site",
        });

        expect(
            normalizeStateSyncPayload({
                ...validBulkSyncPayload,
                siteCount: 5,
                sites: [
                    { identifier: " site-a " },
                    { identifier: " ".repeat(3) },
                    inheritedIdentifier,
                    accessorIdentifier,
                    { identifier: 42 },
                ],
            })
        ).toMatchObject({
            siteCount: 5,
            sites: [{ identifier: " site-a " }],
        });
    });

    it("does not invoke top-level accessors while normalizing", () => {
        let getterCalls = 0;
        const payload = {
            action: STATE_SYNC_ACTION.BULK_SYNC,
            revision: 1,
            siteCount: 1,
            sites: [{ identifier: "site-a" }],
            source: STATE_SYNC_SOURCE.DATABASE,
            timestamp: 1_700_000_000_000,
        } as Record<string, unknown>;

        Object.defineProperty(payload, "truncated", {
            enumerable: true,
            get() {
                getterCalls += 1;
                throw new Error("truncated getter should not run");
            },
        });

        expect(normalizeStateSyncPayload(payload)).toMatchObject({
            action: STATE_SYNC_ACTION.BULK_SYNC,
            truncated: false,
        });
        expect(getterCalls).toBe(0);
    });

    it("does not invoke delta or array accessors while normalizing", () => {
        let getterCalls = 0;
        const addedSites = [{ identifier: "site-a" }] as unknown[];
        Object.defineProperty(addedSites, "1", {
            enumerable: true,
            get() {
                getterCalls += 1;
                throw new Error("site getter should not run");
            },
        });
        addedSites.length = 2;

        const delta = {
            addedSites,
            removedSiteIdentifiers: ["site-b"],
            updatedSites: [],
        } as Record<string, unknown>;

        Object.defineProperty(delta, "ignoredAccessor", {
            enumerable: true,
            get() {
                getterCalls += 1;
                throw new Error("delta getter should not run");
            },
        });

        const normalized = normalizeStateSyncPayload({
            action: STATE_SYNC_ACTION.UPDATE,
            delta,
            revision: 2,
            source: STATE_SYNC_SOURCE.DATABASE,
            timestamp: 1_700_000_000_001,
        });

        expect(normalized).toMatchObject({
            delta: {
                addedSites: [{ identifier: "site-a" }],
                removedSiteIdentifiers: ["site-b"],
                updatedSites: [],
            },
        });
        expect(getterCalls).toBe(0);
    });

    it("accepts timestamps at the JavaScript Date upper bound", () => {
        expect(
            normalizeStateSyncPayload({
                ...validBulkSyncPayload,
                timestamp: MAX_VALID_DATE_EPOCH_MS,
            })
        ).toMatchObject({
            timestamp: MAX_VALID_DATE_EPOCH_MS,
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
            {
                ...validBulkSyncPayload,
                timestamp: MAX_VALID_DATE_EPOCH_MS + 1,
            },
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
            {
                ...validDeltaPayload,
                timestamp: MAX_VALID_DATE_EPOCH_MS + 1,
            },
        ]) {
            expect(normalizeStateSyncPayload(invalidPayload)).toBeNull();
        }
    });

    it("preserves exact delta identifiers consistently with state-sync schemas", () => {
        const normalized = normalizeStateSyncPayload({
            action: STATE_SYNC_ACTION.UPDATE,
            delta: {
                addedSites: [{ identifier: " added-site " }],
                removedSiteIdentifiers: [
                    " removed-site ",
                    "",
                    " ".repeat(3),
                    123,
                ],
                updatedSites: [{ identifier: "\tupdated-site\n" }],
            },
            revision: 2,
            source: STATE_SYNC_SOURCE.DATABASE,
            timestamp: 1_700_000_000_001,
        });

        expect(normalized).toMatchObject({
            delta: {
                addedSites: [{ identifier: " added-site " }],
                removedSiteIdentifiers: [" removed-site "],
                updatedSites: [{ identifier: "\tupdated-site\n" }],
            },
        });
    });
});
