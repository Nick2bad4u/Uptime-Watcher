/**
 * Exhaustive coverage for site snapshot sanitation and synchronization helpers.
 */

import { describe, expect, it } from "vitest";

import {
    deriveSiteSnapshot,
    hasSiteSyncChanges,
    prepareSiteSyncSnapshot,
} from "@shared/utils/siteSnapshots";
import { calculateSiteSyncDelta } from "@shared/utils/siteSyncDelta";
import { sanitizeSitesByIdentifier } from "@shared/validation/siteIntegrity";

import { createSiteSnapshot } from "../fixtures/siteFactories";

describe(deriveSiteSnapshot, () => {
    it("deduplicates identifiers and clones sanitized payloads", () => {
        const duplicateIdentifier = "site-duplicate";
        const candidateSites = [
            createSiteSnapshot({
                identifier: duplicateIdentifier,
                name: "First",
            }),
            createSiteSnapshot({
                identifier: duplicateIdentifier,
                name: "Second",
            }),
            createSiteSnapshot({ identifier: "site-unique", name: "Unique" }),
        ];

        const sanitized = sanitizeSitesByIdentifier(candidateSites);
        const snapshot = deriveSiteSnapshot(candidateSites);

        expect(snapshot.sanitizedSites).toHaveLength(2);
        expect(snapshot.duplicates).toStrictEqual([
            { identifier: duplicateIdentifier, occurrences: 2 },
        ]);

        expect(snapshot.sanitizedSites[0]).not.toBe(
            sanitized.sanitizedSites[0]
        );
        expect(snapshot.sanitizedSites[0]).toStrictEqual(
            sanitized.sanitizedSites[0]
        );
        expect(snapshot.duplicates[0]).not.toBe(sanitized.duplicates[0]);

        snapshot.sanitizedSites[0]!.name = "Mutated";
        expect(sanitized.sanitizedSites[0]!.name).toBe("First");
    });
});

describe(prepareSiteSyncSnapshot, () => {
    it("produces deltas and defensively cloned payloads", () => {
        const previousSnapshot = [
            createSiteSnapshot({ identifier: "site-alpha", name: "Alpha" }),
            createSiteSnapshot({ identifier: "site-beta", name: "Beta" }),
        ];

        const candidateSites = [
            createSiteSnapshot({
                identifier: "site-alpha",
                name: "Alpha Updated",
            }),
            createSiteSnapshot({ identifier: "site-gamma", name: "Gamma" }),
            createSiteSnapshot({
                identifier: "site-gamma",
                name: "Gamma Duplicate",
            }),
        ];

        const snapshot = prepareSiteSyncSnapshot({
            previousSnapshot,
            sites: candidateSites,
        });

        expect(snapshot.duplicates).toStrictEqual([
            { identifier: "site-gamma", occurrences: 2 },
        ]);
        expect(
            snapshot.sanitizedSites.map((site) => site.identifier)
        ).toStrictEqual(["site-alpha", "site-gamma"]);

        expect(snapshot.emissionSnapshot).toHaveLength(2);
        expect(snapshot.emissionSnapshot[0]).not.toBe(
            snapshot.sanitizedSites[0]
        );
        expect(snapshot.emissionSnapshot[0]).toStrictEqual(
            snapshot.sanitizedSites[0]
        );

        const [updatedSite] = snapshot.delta.updatedSites;

        expect(
            snapshot.delta.addedSites.map((site) => site.identifier)
        ).toStrictEqual(["site-gamma"]);
        expect(snapshot.delta.removedSiteIdentifiers).toStrictEqual([
            "site-beta",
        ]);
        expect(updatedSite).toMatchObject({ identifier: "site-alpha" });
        expect(updatedSite?.previous).toBe(previousSnapshot[0]);
        expect(updatedSite?.next).toStrictEqual(snapshot.emissionSnapshot[0]);
    });
});

describe(hasSiteSyncChanges, () => {
    it("detects when no structural changes occurred", () => {
        const baseline = [createSiteSnapshot({ identifier: "baseline" })];
        const delta = calculateSiteSyncDelta(baseline, [
            structuredClone(baseline[0]!),
        ]);

        expect(hasSiteSyncChanges(delta)).toBeFalsy();
    });

    it("detects when additions, removals, or updates are present", () => {
        const previous = [createSiteSnapshot({ identifier: "site-1" })];
        const next = [
            createSiteSnapshot({ identifier: "site-1", name: "Renamed" }),
            createSiteSnapshot({ identifier: "site-2" }),
        ];

        const delta = calculateSiteSyncDelta(previous, next);

        expect(hasSiteSyncChanges(delta)).toBeTruthy();
    });
});
