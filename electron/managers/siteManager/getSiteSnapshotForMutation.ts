/**
 * Site snapshot utilities.
 */

import type { Site } from "@shared/types";

import type { SiteRepositoryService } from "../../services/database/SiteRepositoryService";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

/**
 * Retrieves a mutable site snapshot for mutation operations.
 *
 * @remarks
 * Loads the site from cache when available, otherwise hydrates it from the
 * database and seeds the cache. Returns a deep clone suitable for mutation-safe
 * operations.
 */
export async function getSiteSnapshotForMutation(
    sitesCache: StandardizedCache<Site>,
    siteRepositoryService: SiteRepositoryService,
    identifier: string
): Promise<Site> {
    const cachedSite = sitesCache.get(identifier);
    if (cachedSite) {
        return structuredClone(cachedSite);
    }

    const siteFromDatabase =
        await siteRepositoryService.getSiteFromDatabase(identifier);

    if (!siteFromDatabase) {
        throw new Error(`Site with identifier ${identifier} not found`);
    }

    sitesCache.set(identifier, siteFromDatabase);
    return structuredClone(siteFromDatabase);
}
