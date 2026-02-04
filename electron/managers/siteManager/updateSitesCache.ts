import type { Site } from "@shared/types";
import type { StateSyncAction, StateSyncSource } from "@shared/types/stateSync";
import type { DuplicateSiteIdentifier } from "@shared/validation/siteIntegrity";

import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { deriveSiteSnapshot } from "@shared/utils/siteSnapshots";

import type { UptimeEvents } from "../../events/eventTypes";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

import { logger } from "../../utils/logger";

/**
 * Optional configuration for {@link updateSitesCache}.
 */
export interface UpdateSitesCacheOptions {
    /** Action emitted with the optional state-sync payload. */
    readonly action?: StateSyncAction;
    /** Whether to emit a `sites:state-synchronized` event after updating cache. */
    readonly emitSyncEvent?: boolean;
    /** Identifier correlated with the emitted sync event. */
    readonly siteIdentifier?: string;
    /**
     * Sites to use for the sync event payload (defaults to sanitized cache
     * snapshot).
     */
    readonly sites?: Site[];
    /** Source attributed to the emitted sync event. */
    readonly source?: StateSyncSource;
    /** Timestamp applied to the emitted sync event. */
    readonly timestamp?: number;
}

/**
 * Dependencies required by {@link updateSitesCache}.
 */
export interface UpdateSitesCacheDependencies {
    /** Emits an `internal:site:cache-updated` event. */
    readonly emitSiteCacheUpdated: (args: {
        identifier: string;
        operation: UptimeEvents["internal:site:cache-updated"]["operation"];
        timestamp?: number;
    }) => Promise<void>;
    /**
     * Emits a `sites:state-synchronized` event through the manager/state-sync
     * layer.
     */
    readonly emitSitesStateSynchronized: (payload: {
        action: StateSyncAction;
        siteIdentifier: string;
        sites?: Site[];
        source: StateSyncSource;
        timestamp?: number;
    }) => Promise<unknown>;
    /** Cache instance to update atomically. */
    readonly sitesCache: Pick<StandardizedCache<Site>, "replaceAll">;
}

/**
 * Updates the site cache atomically and optionally emits a state-sync event.
 *
 * @remarks
 * Extracted from `SiteManager.updateSitesCache` to reduce file size and isolate
 * snapshot/duplicate-handling logic.
 */
export async function updateSitesCache(
    deps: UpdateSitesCacheDependencies,
    input: {
        readonly context?: string;
        readonly options?: UpdateSitesCacheOptions;
        readonly sites: Site[];
    }
): Promise<void> {
    const snapshot = deriveSiteSnapshot(input.sites);

    if (snapshot.duplicates.length > 0) {
        logger.error(
            "[SiteManager] Duplicate site identifiers detected while updating cache",
            {
                context: input.context ?? "SiteManager.updateSitesCache",
                droppedIdentifiers: snapshot.duplicates.map(
                    (entry: DuplicateSiteIdentifier) => entry.identifier
                ),
                duplicates: snapshot.duplicates,
            }
        );
    }

    deps.sitesCache.replaceAll(
        snapshot.sanitizedSites.map((site: Site) => ({
            data: site,
            key: site.identifier,
        }))
    );

    await deps.emitSiteCacheUpdated({
        identifier: "all",
        operation: "cache-updated",
    });

    if (input.options?.emitSyncEvent) {
        const syncSourceSites = input.options.sites ?? snapshot.sanitizedSites;
        const syncSnapshot = deriveSiteSnapshot(syncSourceSites);

        if (syncSnapshot.duplicates.length > 0) {
            logger.error(
                "[SiteManager] Duplicate site identifiers detected in synchronization payload",
                {
                    context: input.context ?? "SiteManager.updateSitesCache",
                    droppedIdentifiers: syncSnapshot.duplicates.map(
                        (entry: DuplicateSiteIdentifier) => entry.identifier
                    ),
                    duplicates: syncSnapshot.duplicates,
                }
            );
        }

        const syncPayload: {
            action: StateSyncAction;
            siteIdentifier: string;
            sites: Site[];
            source: StateSyncSource;
            timestamp?: number;
        } = {
            action: input.options.action ?? STATE_SYNC_ACTION.BULK_SYNC,
            siteIdentifier: input.options.siteIdentifier ?? "all",
            sites: syncSnapshot.sanitizedSites,
            source: input.options.source ?? STATE_SYNC_SOURCE.CACHE,
        };

        if (typeof input.options.timestamp === "number") {
            syncPayload.timestamp = input.options.timestamp;
        }

        await deps.emitSitesStateSynchronized(syncPayload);
    }
}
