/**
 * Comprehensive tests for site snapshot and sync overlay utilities.
 */

import { describe, expect, it } from "vitest";

import type { Monitor, Site, StatusHistory } from "@shared/types";
import type { SiteSyncDelta } from "@shared/types/stateSync";

import {
    deriveSiteSnapshot,
    deriveSiteSyncChangeSet,
    hasSiteSyncChanges,
    isMonitorSnapshot,
    isSiteSnapshot,
    isStatusHistoryArray,
    isStatusHistoryEntry,
    mergeMonitorSnapshots,
    mergeSiteSnapshots,
    prepareSiteSyncSnapshot,
    toMonitorSnapshotOverlay,
    toSiteSnapshotOverlay,
} from "@shared/utils/siteSnapshots";

function createHistory(partial: Partial<StatusHistory> = {}): StatusHistory {
    return {
        responseTime: 10,
        status: "up",
        timestamp: 1,
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

function createSite(partial: Partial<Site> = {}): Site {
    return {
        identifier: "site-1",
        monitoring: true,
        monitors: [createMonitor()],
        name: "Example",
        ...partial,
    };
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

    it("deriveSiteSyncChangeSet returns null for empty delta and a subset for changes", () => {
        const emptyDelta: SiteSyncDelta = {
            addedSites: [],
            removedSiteIdentifiers: [],
            updatedSites: [],
        };
        expect(deriveSiteSyncChangeSet(emptyDelta)).toBeNull();

        const changedDelta: SiteSyncDelta = {
            addedSites: [createSite({ identifier: "a" })],
            removedSiteIdentifiers: [],
            updatedSites: [],
        };
        expect(deriveSiteSyncChangeSet(changedDelta)).toEqual({
            addedSites: changedDelta.addedSites,
        });
        expect(hasSiteSyncChanges(changedDelta)).toBeTruthy();
    });

    it("validates status history entries and arrays", () => {
        expect(isStatusHistoryEntry(createHistory())).toBeTruthy();
        expect(isStatusHistoryEntry({})).toBeFalsy();

        expect(isStatusHistoryArray([createHistory()])).toBeTruthy();
        expect(isStatusHistoryArray([{}])).toBeFalsy();
    });

    it("validates monitor and site snapshot shapes", () => {
        expect(isMonitorSnapshot(createMonitor())).toBeTruthy();
        expect(isMonitorSnapshot({ id: "x" })).toBeFalsy();

        // Exercise the invalid-status branch while other fields are present.
        expect(
            isMonitorSnapshot(
                createMonitor({
                    status: "not-a-status" as any,
                })
            )
        ).toBeFalsy();

        expect(isSiteSnapshot(createSite())).toBeTruthy();
        expect(isSiteSnapshot({ identifier: "x" })).toBeFalsy();

        // Exercise the monitors.every(...) false branch.
        expect(
            isSiteSnapshot(
                createSite({
                    monitors: [createMonitor(), { id: "bad" } as any],
                })
            )
        ).toBeFalsy();
    });

    it("toMonitorSnapshotOverlay omits empty history arrays and normalizes lastChecked", () => {
        expect(toMonitorSnapshotOverlay(undefined)).toBeUndefined();

        expect(toMonitorSnapshotOverlay({ history: [] })).toBeUndefined();

        const overlay = toMonitorSnapshotOverlay({
            history: [createHistory()],
            lastChecked: "2025-01-01T00:00:00.000Z",
            monitoring: false,
            responseTime: 123,
            status: "up",
            activeOperations: ["op"],
        });

        expect(overlay).toBeDefined();
        expect(overlay?.history).toHaveLength(1);
        expect(overlay?.lastChecked).toBeInstanceOf(Date);
        expect(overlay?.monitoring).toBeFalsy();
        expect(overlay?.activeOperations).toEqual(["op"]);

        // Cover Date passthrough branch.
        const overlayDate = toMonitorSnapshotOverlay({
            lastChecked: new Date("2025-01-02T00:00:00.000Z"),
        });
        expect(overlayDate?.lastChecked).toBeInstanceOf(Date);

        // Cover invalid status branch (should produce no overlay).
        expect(
            toMonitorSnapshotOverlay({ status: "not-a-status" as any })
        ).toBeUndefined();
    });

    it("toSiteSnapshotOverlay filters invalid monitors and returns undefined when empty", () => {
        expect(toSiteSnapshotOverlay(undefined)).toBeUndefined();

        expect(toSiteSnapshotOverlay({ monitors: [{}] })).toBeUndefined();

        const overlay = toSiteSnapshotOverlay({
            monitoring: false,
            monitors: [createMonitor({ id: "m1" }), { id: "bad" }],
        });

        expect(overlay?.monitoring).toBeFalsy();
        expect(overlay?.monitors).toHaveLength(1);
        expect(overlay?.monitors?.[0]?.id).toBe("m1");
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
    });

    it("mergeSiteSnapshots merges monitor overlays by id", () => {
        const canonicalSite = createSite({
            identifier: "site",
            monitors: [
                createMonitor({ id: "m1" }),
                createMonitor({ id: "m2" }),
            ],
        });

        const overlaySite: Site = {
            identifier: "site",
            monitoring: false,
            name: "Ignored",
            monitors: [
                createMonitor({
                    id: "m2",
                    monitoring: false,
                    responseTime: 999,
                }),
            ],
        };

        const merged = mergeSiteSnapshots(canonicalSite, overlaySite);

        expect(merged).not.toBe(canonicalSite);
        expect(merged.monitoring).toBeFalsy();
        expect(
            merged.monitors.find((m) => m.id === "m1")?.monitoring
        ).toBeTruthy();
        expect(
            merged.monitors.find((m) => m.id === "m2")?.monitoring
        ).toBeFalsy();
        expect(merged.monitors.find((m) => m.id === "m2")?.responseTime).toBe(
            999
        );

        // Exercise the merge path that skips invalid overlay monitors.
        const mergedWithInvalid = mergeSiteSnapshots(canonicalSite, {
            identifier: "site",
            monitoring: false,
            name: "Ignored",
            monitors: [{ id: "missing-fields" } as any],
        });
        expect(mergedWithInvalid.monitors).toHaveLength(2);
    });
});
