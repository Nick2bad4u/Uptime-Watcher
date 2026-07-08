/**
 * Frontend cache synchronization utilities.
 *
 * @remarks
 * Bridges cache invalidation events emitted by the backend into renderer-side
 * stores so client caches stay consistent without manual refresh workflows.
 *
 * @public
 */
import {
    CACHE_INVALIDATION_REASON,
    type CacheInvalidatedEventData,
} from "@shared/types/events";
import { ensureError } from "@shared/utils/errorHandling";
import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";

import { EventsService } from "../services/EventsService";
import { logger } from "../services/logger";
import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { fireAndForget } from "./async/fireAndForget";
import { clearMonitorTypeCache } from "./monitorTypeHelper";

/**
 * Registry of cache clearing functions grouped by cache type.
 *
 * @internal
 */
const CACHE_CLEARERS = new Map<string, (identifier?: string) => void>([
    [
        "monitorType",
        (): void => {
            clearMonitorTypeCache();
        },
    ],
    // Add new cache types here as they're implemented
    // ["siteData", (id) => clearSiteDataCache(id)],
    // ["monitorHistory", (id) => clearMonitorHistoryCache(id)],
    // ["analytics", (id) => clearAnalyticsCache(id)],
    // ["settings", () => clearSettingsCache()],
]);

const SITE_UPDATE_DEBOUNCE_MS = 200;

const safeIdentifierForLogging = (
    identifier: string | undefined
): string | undefined => getSafeIdentifierForLogging(identifier);

const buildCacheInvalidationLogMetadata = (
    data: CacheInvalidatedEventData
): {
    identifier?: string | undefined;
    reason: CacheInvalidatedEventData["reason"];
    timestamp: CacheInvalidatedEventData["timestamp"];
    type: CacheInvalidatedEventData["type"];
} => ({
    identifier: safeIdentifierForLogging(data.identifier),
    reason: data.reason,
    timestamp: data.timestamp,
    type: data.type,
});

const refreshMonitorTypesAfterInvalidation = async (): Promise<void> => {
    await useMonitorTypesStore.getState().refreshMonitorTypes();
};

const syncSitesFromBackendAfterInvalidation = async (): Promise<void> => {
    await useSitesStore.getState().fullResyncSites();
};

const startMonitorTypeRefresh = (
    context: "all" | "monitor",
    message: string
): void => {
    fireAndForget(refreshMonitorTypesAfterInvalidation, {
        onError: (error) => {
            logger.error(message, ensureError(error), { context });
        },
    });
};

const startSiteResync = (context: "all" | "site"): void => {
    fireAndForget(syncSitesFromBackendAfterInvalidation, {
        onError: (error) => {
            logger.error(
                "Failed to resynchronize sites after cache invalidation",
                ensureError(error),
                { context }
            );
        },
    });
};

/**
 * Set up automatic cache synchronization with backend. Listens for cache
 * invalidation events, clears appropriate frontend caches, and triggers
 * asynchronous store refreshes for sites and monitor types when needed.
 *
 * @returns Cleanup function to remove event listeners. Call this function when
 *   the component unmounts or cache sync is no longer needed to prevent memory
 *   leaks and avoid processing events after cleanup.
 *
 * @public
 */
export function setupCacheSync(): () => void {
    if (typeof window === "undefined") {
        logger.warn(
            "Cache invalidation events not available - frontend cache sync disabled"
        );
        return () => {
            // No-op cleanup
        };
    }

    let cleanupHandler: (() => void) | null = null;
    const disposed: { current: boolean } = { current: false };
    let lastSiteUpdateResyncAt = 0;

    const handleInvalidation = (data: CacheInvalidatedEventData): void => {
        try {
            // Avoid processing events after teardown.
            if (disposed.current) {
                return;
            }

            logger.debug(
                "Received cache invalidation event",
                buildCacheInvalidationLogMetadata(data)
            );

            switch (data.type) {
                case "all": {
                    clearAllFrontendCaches();
                    startMonitorTypeRefresh(
                        "all",
                        "Failed to refresh monitor types after cache invalidation:"
                    );
                    startSiteResync("all");
                    break;
                }
                case "monitor": {
                    clearMonitorRelatedCaches(data.identifier);
                    startMonitorTypeRefresh(
                        "monitor",
                        "Failed to refresh monitor types after monitor cache invalidation:"
                    );
                    break;
                }
                case "site": {
                    clearSiteRelatedCaches(data.identifier);
                    if (data.reason === CACHE_INVALIDATION_REASON.UPDATE) {
                        const now = Date.now();
                        if (
                            now - lastSiteUpdateResyncAt <
                            SITE_UPDATE_DEBOUNCE_MS
                        ) {
                            logger.debug(
                                "[CacheSync] Skipping duplicate site update resync",
                                {
                                    identifier: safeIdentifierForLogging(
                                        data.identifier
                                    ),
                                    lastSiteUpdateResyncAt,
                                    reason: data.reason,
                                    timestamp: now,
                                }
                            );
                            break;
                        }

                        lastSiteUpdateResyncAt = now;
                    }
                    startSiteResync("site");
                    break;
                }
                default: {
                    logger.warn("Unknown cache invalidation type:", data.type);
                }
            }
        } catch (error) {
            logger.error(
                "Error handling cache invalidation:",
                ensureError(error)
            );
        }
    };

    fireAndForget(
        async () => {
            const serviceCleanup =
                await EventsService.onCacheInvalidated(handleInvalidation);

            if (disposed.current) {
                serviceCleanup();
                return;
            }

            cleanupHandler = serviceCleanup;
        },
        {
            onError: (error) => {
                logger.warn(
                    "Cache invalidation events not available - frontend cache sync disabled",
                    ensureError(error)
                );
            },
        }
    );

    logger.debug("[CacheSync] Cache synchronization enabled");
    return (): void => {
        disposed.current = true;
        if (cleanupHandler) {
            cleanupHandler();
            cleanupHandler = null;
        }
    };
}

/**
 * Clear all registered frontend caches.
 *
 * @internal
 */
function clearAllFrontendCaches(): void {
    logger.debug("[CacheSync] Clearing all frontend caches");

    // Clear all registered cache types
    for (const [cacheType, clearer] of CACHE_CLEARERS) {
        try {
            clearer();
            logger.debug("[CacheSync] Cleared cache", { cacheType });
        } catch (error) {
            logger.error(
                "[CacheSync] Failed to clear cache",
                ensureError(error),
                { cacheType }
            );
        }
    }
}

/**
 * Clear monitor-related frontend caches.
 *
 * @remarks
 * Acts as the central hook for monitor cache invalidation. Additional monitor
 * caches should register in {@link CACHE_CLEARERS} and be triggered here.
 *
 * @param identifier - Optional monitor identifier for targeted clearing.
 *
 * @internal
 */
function clearMonitorRelatedCaches(identifier?: string): void {
    logger.debug("[CacheSync] Clearing monitor-related caches", {
        identifier: safeIdentifierForLogging(identifier),
    });

    // Clear monitor type cache (affects all monitors)
    const monitorTypeClearer = CACHE_CLEARERS.get("monitorType");
    if (monitorTypeClearer) {
        monitorTypeClearer(identifier);
    }

    // Future enhancement: Add monitor-specific cache clearing
    // if (identifier) {
    //     const monitorHistoryClearer = CACHE_CLEARERS.get("monitorHistory");
    //     if (monitorHistoryClearer) {
    //         monitorHistoryClearer(identifier);
    //     }
    // }
}

/**
 * Clear site-related frontend caches.
 *
 * @remarks
 * Placeholder that currently relies on Zustand stores for automatic state
 * invalidation. Extend as new site-specific caches are introduced.
 *
 * @param identifier - Optional site identifier for targeted clearing.
 *
 * @internal
 */
function clearSiteRelatedCaches(identifier?: string): void {
    logger.debug("[CacheSync] Clearing site-related caches", {
        identifier: safeIdentifierForLogging(identifier),
    });

    // Future enhancement: Add site-specific cache clearing
    // if (identifier) {
    //     const siteDataClearer = CACHE_CLEARERS.get("siteData");
    //     if (siteDataClearer) {
    //         siteDataClearer(identifier);
    //     }
    // }

    // Note: Sites are currently managed through Zustand stores which handle
    // their own cache invalidation and state management
}
