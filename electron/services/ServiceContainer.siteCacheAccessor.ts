/**
 * Site-manager cache accessor helpers for {@link ServiceContainer}.
 */

import type { Site } from "@shared/types";

import type { SiteManager } from "../managers/SiteManager";
import type { StandardizedCache } from "../utils/cache/StandardizedCache";

/**
 * Input for {@link createSitesCacheGetter}.
 */
export interface CreateSitesCacheGetterInput {
    /**
     * Returns the already-constructed
     * {@link electron/managers/SiteManager#SiteManager} instance (if any).
     */
    getSiteManager: () => SiteManager | undefined;
}

/**
 * Creates a defensive `getSitesCache` accessor.
 *
 * @remarks
 * `MonitorManager` depends on a sites cache accessor. This helper intentionally
 * throws if the container is in an inconsistent state (for example: a circular
 * dependency during bootstrap). That keeps failures loud and early rather than
 * failing later with confusing `undefined` property access.
 */
export function createSitesCacheGetter(
    input: CreateSitesCacheGetterInput
): () => StandardizedCache<Site> {
    const { getSiteManager } = input;

    return (): StandardizedCache<Site> => {
        const siteManager = getSiteManager();
        if (!siteManager) {
            throw new Error(
                "Service dependency error: SiteManager not fully initialized. " +
                    "This usually indicates a circular dependency or incorrect initialization order. " +
                    "Ensure ServiceContainer.initialize() completes before accessing SiteManager functionality."
            );
        }

        return siteManager.getSitesCache();
    };
}
