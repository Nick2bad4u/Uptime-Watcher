import type { Site } from "@shared/types";

import deepEqual from "fast-deep-equal";

/**
 * Performs a deep structural comparison of two site snapshots.
 */
function areSitesEquivalent(left: Site, right: Site): boolean {
    return deepEqual(left, right);
}

/**
 * Describes the changes between two site collections produced by state sync.
 */
export interface SiteSyncDelta {
    /** Sites that were added in the latest snapshot. */
    readonly addedSites: Site[];
    /** Identifiers for sites that were removed in the latest snapshot. */
    readonly removedSiteIdentifiers: string[];
    /**
     * Sites whose identifiers persisted but whose serialized payload changed.
     */
    readonly updatedSites: Array<{
        readonly identifier: string;
        readonly next: Site;
        readonly previous: Site;
    }>;
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
    const updatedSites: SiteSyncDelta["updatedSites"] = [];

    for (const [identifier, nextSite] of nextMap.entries()) {
        const previousSite = previousMap.get(identifier);

        if (!previousSite) {
            addedSites.push(nextSite);
        } else if (!areSitesEquivalent(previousSite, nextSite)) {
            updatedSites.push({
                identifier,
                next: nextSite,
                previous: previousSite,
            });
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
