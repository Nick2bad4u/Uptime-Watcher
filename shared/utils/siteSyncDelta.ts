/**
 * Shared utilities for computing site synchronization deltas.
 */

import type { Site } from "@shared/types";
import type { SiteSyncDelta } from "@shared/types/stateSync";

import deepEqual from "fast-deep-equal";

/**
 * Performs a deep structural comparison of two site snapshots.
 *
 * @param left - Previous site snapshot.
 * @param right - Next site snapshot.
 *
 * @returns `true` when both snapshots are structurally equivalent.
 */
function areSitesEquivalent(left: Site, right: Site): boolean {
    return deepEqual(left, right);
}

/**
 * Calculates the delta between the previous and next site collections.
 *
 * @param previousSites - Snapshot before applying synchronization.
 * @param nextSites - Snapshot received from synchronization.
 *
 * @returns Structured delta describing additions, removals, and updates.
 */
export function calculateSiteSyncDelta(
    previousSites: Site[],
    nextSites: Site[]
): SiteSyncDelta {
    const previousMap = new Map<string, Site>();
    for (const site of previousSites) {
        previousMap.set(site.identifier, site);
    }

    const nextMap = new Map<string, Site>();
    for (const site of nextSites) {
        nextMap.set(site.identifier, site);
    }

    const addedSites: Site[] = [];
    const updatedSites: Site[] = [];

    for (const [identifier, nextSite] of nextMap.entries()) {
        const previousSite = previousMap.get(identifier);

        if (!previousSite) {
            addedSites.push(nextSite);
        } else if (!areSitesEquivalent(previousSite, nextSite)) {
            updatedSites.push(nextSite);
        }
    }

    const removedSiteIdentifiers: string[] = [];
    for (const identifier of previousMap.keys()) {
        if (!nextMap.has(identifier)) {
            removedSiteIdentifiers.push(identifier);
        }
    }

    return {
        addedSites,
        removedSiteIdentifiers,
        updatedSites,
    } satisfies SiteSyncDelta;
}
