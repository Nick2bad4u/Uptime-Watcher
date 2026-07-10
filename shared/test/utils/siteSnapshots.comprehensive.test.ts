/**
 * Comprehensive tests for site snapshot and sync overlay utilities.
 */

import type { Monitor, Site, StatusHistory } from "@shared/types";
import type { SiteSyncDelta } from "@shared/types/stateSync";

import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import {
    deriveSiteSnapshot,
    hasSiteSyncChanges,
    isMonitorSnapshot,
    isSiteSnapshot,
    mergeMonitorSnapshots,
    prepareSiteSyncSnapshot,
} from "@shared/utils/siteSnapshots";
import { describe, expect, it } from "vitest";

function createHistory(partial: Partial<StatusHistory> = {}): StatusHistory {
    return {
        responseTime: 10,
        status: "up",
        timestamp: 1,
        ...partial,
    };
}

function createHistoryCandidate(
    partial: Partial<Record<keyof StatusHistory, unknown>> = {}
): Record<string, unknown> {
    return {
        ...createHistory(),
        ...partial,
    };
}

function createMonitor(partial: Partial<Monitor> = {}): Monitor {
    return {
        activeOperations: [],
        checkInterval: 1000,
        history: [],
        id: "monitor-1",
        monitoring: true,
        responseTime: 10,
        retryAttempts: 0,
        status: "up",
        timeout: 1000,
        type: "http",
        ...partial,
    };
}

function createMonitorCandidate(
    partial: Partial<Record<keyof Monitor, unknown>> = {}
): Record<string, unknown> {
    return {
        ...createMonitor(),
        ...partial,
    };
}

function createSite(partial: Partial<Site> = {}): Site {
    return {
        identifier: "site-1",
        monitoring: true,
        monitors: [createMonitor()],
        name: "Example",
        ...partial,
    };
}

function createSiteCandidate(
    partial: Partial<Record<keyof Site, unknown>> = {}
): Record<string, unknown> {
    return {
        ...createSite(),
        ...partial,
    };
}

function mergeSerializedMonitorOverlay(
    canonicalMonitor: Monitor,
    overlaySource: Record<string, unknown>
): Monitor {
    return mergeMonitorSnapshots(canonicalMonitor, overlaySource);
}

describe("siteSnapshots", () => {
    it("deriveSiteSnapshot removes duplicates and deep clones results", () => {
        const site = createSite({ identifier: "dup" });
        const snapshot = deriveSiteSnapshot([site, { ...site, name: "Other" }]);

        expect(snapshot.sanitizedSites).toHaveLength(1);
        expect(snapshot.duplicates.length).toBeGreaterThanOrEqual(1);

        expect(snapshot.sanitizedSites[0]).not.toBe(site);
        expect(snapshot.sanitizedSites[0]?.identifier).toBe("dup");
    });

    it("prepareSiteSyncSnapshot returns emission snapshot clones and delta", () => {
        const site = createSite();
        const result = prepareSiteSyncSnapshot({
            sites: [site],
            previousSnapshot: [site],
        });

        expect(result.emissionSnapshot).toHaveLength(1);
        expect(result.emissionSnapshot[0]).not.toBe(result.sanitizedSites[0]);
        expect(hasSiteSyncChanges(result.delta)).toBeFalsy();
    });

    it("hasSiteSyncChanges detects empty and populated deltas", () => {
        const emptyDelta: SiteSyncDelta = {
            addedSites: [],
            removedSiteIdentifiers: [],
            updatedSites: [],
        };
        expect(hasSiteSyncChanges(emptyDelta)).toBeFalsy();

        const changedDelta: SiteSyncDelta = {
            addedSites: [createSite({ identifier: "a" })],
            removedSiteIdentifiers: [],
            updatedSites: [],
        };
        expect(hasSiteSyncChanges(changedDelta)).toBeTruthy();
    });

    it("validates status history through monitor snapshots", () => {
        expect(
            isMonitorSnapshot(createMonitor({ history: [createHistory()] }))
        ).toBeTruthy();
        expect(
            isMonitorSnapshot(createMonitorCandidate({ history: [{}] }))
        ).toBeFalsy();

        for (const invalidHistory of [
            createHistory({ responseTime: -2 }),
            createHistory({ responseTime: 10.5 }),
            createHistoryCandidate({ status: "pending" }),
            createHistory({ timestamp: -1 }),
            createHistory({ timestamp: 1.5 }),
            createHistory({ timestamp: MAX_VALID_DATE_EPOCH_MS + 1 }),
        ]) {
            expect(
                isMonitorSnapshot(
                    createMonitorCandidate({ history: [invalidHistory] })
                )
            ).toBeFalsy();
        }
    });

    it("validates monitor and site snapshot shapes", () => {
        expect(isMonitorSnapshot(createMonitor())).toBeTruthy();
        expect(isMonitorSnapshot({ id: "x" })).toBeFalsy();

        // Exercise the invalid-status branch while other fields are present.
        expect(
            isMonitorSnapshot(
                createMonitorCandidate({ status: "not-a-status" })
            )
        ).toBeFalsy();

        for (const responseTime of [-2, 10.5]) {
            expect(
                isMonitorSnapshot(createMonitor({ responseTime }))
            ).toBeFalsy();
        }

        for (const invalidTiming of [
            { checkInterval: 0 },
            { checkInterval: 1000.5 },
            { retryAttempts: -1 },
            { retryAttempts: 1.5 },
            { timeout: 0 },
            { timeout: 1000.5 },
        ]) {
            expect(isMonitorSnapshot(createMonitor(invalidTiming))).toBeFalsy();
        }

        expect(
            isMonitorSnapshot(createMonitorCandidate({ type: "unknown-type" }))
        ).toBeFalsy();

        expect(isSiteSnapshot(createSite())).toBeTruthy();
        expect(isSiteSnapshot({ identifier: "x" })).toBeFalsy();

        // Exercise the monitors.every(...) false branch.
        expect(
            isSiteSnapshot(
                createSiteCandidate({
                    monitors: [createMonitor(), { id: "bad" }],
                })
            )
        ).toBeFalsy();
    });

    it("mergeMonitorSnapshots omits empty history arrays and normalizes lastChecked", () => {
        const canonical = createMonitor({ id: "m" });

        expect(mergeMonitorSnapshots(canonical, undefined)).toBe(canonical);
        expect(mergeMonitorSnapshots(canonical, { history: [] })).toBe(
            canonical
        );

        const merged = mergeSerializedMonitorOverlay(canonical, {
            history: [createHistory()],
            lastChecked: "2025-01-01T00:00:00.000Z",
            monitoring: false,
            responseTime: 123,
            status: "up",
            activeOperations: ["op"],
        });

        expect(merged).not.toBe(canonical);
        expect(merged.history).toHaveLength(1);
        expect(merged.lastChecked).toBeInstanceOf(Date);
        expect(merged.monitoring).toBeFalsy();
        expect(merged.activeOperations).toEqual(["op"]);

        for (const responseTime of [-2, 10.5]) {
            expect(mergeMonitorSnapshots(canonical, { responseTime })).toBe(
                canonical
            );
        }

        // Cover Date passthrough branch.
        const overlayDate = mergeMonitorSnapshots(canonical, {
            lastChecked: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(overlayDate.lastChecked).toBeInstanceOf(Date);

        const shadowedDate = new Date("2025-01-02T12:00:00.000Z");
        const getTime = vi.fn(() => {
            throw new Error("date getTime should not run");
        });
        Object.defineProperty(shadowedDate, "getTime", {
            value: getTime,
        });
        const overlayShadowedDate = mergeMonitorSnapshots(canonical, {
            lastChecked: shadowedDate,
        });
        expect(overlayShadowedDate.lastChecked).toBeInstanceOf(Date);
        expect(overlayShadowedDate.lastChecked).not.toBe(shadowedDate);
        expect(overlayShadowedDate.lastChecked?.toISOString()).toBe(
            "2025-01-02T12:00:00.000Z"
        );
        expect(getTime).not.toHaveBeenCalled();

        const overlayEpoch = mergeSerializedMonitorOverlay(canonical, {
            lastChecked: Date.UTC(2025, 0, 3),
        });
        expect(overlayEpoch.lastChecked?.toISOString()).toBe(
            "2025-01-03T00:00:00.000Z"
        );

        const overlayMaxEpoch = mergeSerializedMonitorOverlay(canonical, {
            lastChecked: MAX_VALID_DATE_EPOCH_MS,
        });
        expect(overlayMaxEpoch.lastChecked?.getTime()).toBe(
            MAX_VALID_DATE_EPOCH_MS
        );

        for (const invalidLastChecked of [
            -1,
            1.5,
            MAX_VALID_DATE_EPOCH_MS + 1,
            new Date(MAX_VALID_DATE_EPOCH_MS + 1),
        ]) {
            expect(
                mergeSerializedMonitorOverlay(canonical, {
                    lastChecked: invalidLastChecked,
                })
            ).toBe(canonical);
        }

        expect(
            mergeSerializedMonitorOverlay(canonical, {
                lastChecked: "July 3, 2026",
            })
        ).toBe(canonical);
        expect(
            mergeSerializedMonitorOverlay(canonical, {
                lastChecked: "2026-02-30T00:00:00.000Z",
            })
        ).toBe(canonical);

        // Cover invalid status branch (should produce no overlay).
        expect(
            mergeMonitorSnapshots(canonical, {
                status: "not-a-status",
            })
        ).toBe(canonical);
    });

    it("mergeMonitorSnapshots returns canonical when no overlay and applies overlay when provided", () => {
        const canonical = createMonitor({ id: "m" });

        const noOverlayResult = mergeMonitorSnapshots(canonical, undefined);
        expect(noOverlayResult).toBe(canonical);

        const merged = mergeMonitorSnapshots(canonical, {
            monitoring: false,
            history: [createHistory({ timestamp: 2 })],
        });

        expect(merged).not.toBe(canonical);
        expect(merged.monitoring).toBeFalsy();
        expect(merged.history[0]?.timestamp).toBe(2);
        expect(merged.checkInterval).toBe(canonical.checkInterval);

        const mergedWithInvalidHistory = mergeMonitorSnapshots(canonical, {
            history: [
                createHistoryCandidate({
                    status: "not-a-history-status",
                }),
            ],
        });
        expect(mergedWithInvalidHistory).toBe(canonical);
    });
});
