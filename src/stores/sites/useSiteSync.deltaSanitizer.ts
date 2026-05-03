/**
 * Site sync delta sanitization helpers.
 *
 * @remarks
 * Centralized here to keep `useSiteSync.ts` focused on orchestration and store
 * updates.
 */

import type { SiteSyncDelta } from "@shared/types/stateSync";

import { deriveSiteSnapshot } from "@shared/utils/siteSnapshots";
import { setHas } from "ts-extras";

const getUniqueStringsPreservingOrder = (
    values: readonly string[]
): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const value of values) {
        if (!setHas(seen, value)) {
            seen.add(value);
            result.push(value);
        }
    }

    return result;
};

/**
 * Normalize an incoming {@link SiteSyncDelta} payload.
 */
export const buildSanitizedIncomingSiteSyncDelta = (
    delta: SiteSyncDelta
): {
    delta: SiteSyncDelta;
    diagnostics: {
        addedDuplicates: ReturnType<typeof deriveSiteSnapshot>["duplicates"];
        overlapIdentifiers: string[];
        updatedDuplicates: ReturnType<typeof deriveSiteSnapshot>["duplicates"];
    };
} => {
    const removedSiteIdentifiers = getUniqueStringsPreservingOrder(
        delta.removedSiteIdentifiers
    );

    const removedIdentifiers = new Set(removedSiteIdentifiers);

    const addedSnapshot = deriveSiteSnapshot(delta.addedSites);
    const updatedSnapshot = deriveSiteSnapshot(delta.updatedSites);

    const updatedIdentifiers = new Set(
        updatedSnapshot.sanitizedSites.map((site) => site.identifier)
    );

    const overlapIdentifiers: string[] = [];

    const addedSites = addedSnapshot.sanitizedSites.filter((site) => {
        if (setHas(removedIdentifiers, site.identifier)) {
            return false;
        }

        if (setHas(updatedIdentifiers, site.identifier)) {
            overlapIdentifiers.push(site.identifier);
            return false;
        }

        return true;
    });

    const updatedSites = updatedSnapshot.sanitizedSites.filter(
        (site) => !setHas(removedIdentifiers, site.identifier)
    );

    return {
        delta: {
            addedSites,
            removedSiteIdentifiers,
            updatedSites,
        },
        diagnostics: {
            addedDuplicates: addedSnapshot.duplicates,
            overlapIdentifiers:
                getUniqueStringsPreservingOrder(overlapIdentifiers),
            updatedDuplicates: updatedSnapshot.duplicates,
        },
    };
};
