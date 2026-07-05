import type { Logger } from "@shared/utils/logger/interfaces";

import { STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StateSyncStatusTracker } from "../../../../services/ipc/internal/stateSyncStatusTracker";

const createLogger = (): Logger => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
});

describe(StateSyncStatusTracker, () => {
    let tracker: StateSyncStatusTracker;

    beforeEach(() => {
        tracker = new StateSyncStatusTracker(createLogger());
    });

    it("returns status snapshots without exposing internal mutable state", () => {
        const snapshot = tracker.getStatus();
        snapshot.siteCount = 99;
        snapshot.source = STATE_SYNC_SOURCE.DATABASE;
        snapshot.synchronized = true;

        expect(tracker.getStatus()).toEqual({
            lastSyncAt: null,
            siteCount: 0,
            source: STATE_SYNC_SOURCE.CACHE,
            synchronized: false,
        });
    });

    it("copies externally supplied status snapshots", () => {
        const summary = {
            lastSyncAt: 1_700_000_000_000,
            siteCount: 2,
            source: STATE_SYNC_SOURCE.DATABASE,
            synchronized: true,
        };

        tracker.setStatus(summary);
        summary.siteCount = 99;
        summary.source = STATE_SYNC_SOURCE.CACHE;
        summary.synchronized = false;

        expect(tracker.getStatus()).toEqual({
            lastSyncAt: 1_700_000_000_000,
            siteCount: 2,
            source: STATE_SYNC_SOURCE.DATABASE,
            synchronized: true,
        });
    });
});
