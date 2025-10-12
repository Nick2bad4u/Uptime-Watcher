/**
 * Frontend cache synchronization utilities.
 *
 * @remarks
 * Bridges cache invalidation events emitted by the backend into renderer-side
 * stores so client caches stay consistent without manual refresh workflows.
 *
 * @public
 */

import { ensureError } from "@shared/utils/errorHandling";

import { EventsService } from "../services/EventsService";
import { logger } from "../services/logger";
import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { clearMonitorTypeCache } from "./monitorTypeHelper";

/**
 * Cache invalidation data emitted by the backend.
 *
 * @remarks
 * Captures the invalidation scope (`type`), optional target identifier, and a
 * descriptive reason.
 *
 * @internal
 */
interface CacheInvalidationData {
    identifier?: string;
    reason: string;
    type: "all" | "monitor" | "site";
}

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
            logger.debug(`[CacheSync] Cleared ${cacheType} cache`);
        } catch (error) {
            logger.error(
                `[CacheSync] Failed to clear ${cacheType} cache:`,
                ensureError(error)
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
    logger.debug("[CacheSync] Clearing monitor-related caches", { identifier });

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
    logger.debug("[CacheSync] Clearing site-related caches", { identifier });

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
    let disposed = false;

    const handleInvalidation = (data: CacheInvalidationData): void => {
        try {
            logger.debug("Received cache invalidation event", data);

            const syncSitesFromBackend = async (
                context: "all" | "site"
            ): Promise<void> => {
                try {
                    await useSitesStore.getState().fullResyncSites();
                } catch (error) {
                    logger.error(
                        `Failed to resynchronize sites after cache invalidation (${context}):`,
                        ensureError(error)
                    );
                }
            };

            switch (data.type) {
                case "all": {
                    clearAllFrontendCaches();
                    const refreshMonitorTypes = async (): Promise<void> => {
                        try {
                            await useMonitorTypesStore
                                .getState()
                                .refreshMonitorTypes();
                        } catch (error) {
                            logger.error(
                                "Failed to refresh monitor types after cache invalidation:",
                                ensureError(error)
                            );
                        }
                    };
                    void refreshMonitorTypes();
                    void syncSitesFromBackend("all");
                    break;
                }
                case "monitor": {
                    clearMonitorRelatedCaches(data.identifier);
                    const refreshMonitorTypesMonitor =
                        async (): Promise<void> => {
                            try {
                                await useMonitorTypesStore
                                    .getState()
                                    .refreshMonitorTypes();
                            } catch (error) {
                                logger.error(
                                    "Failed to refresh monitor types after monitor cache invalidation:",
                                    ensureError(error)
                                );
                            }
                        };
                    void refreshMonitorTypesMonitor();
                    break;
                }
                case "site": {
                    clearSiteRelatedCaches(data.identifier);
                    void syncSitesFromBackend("site");
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

    void (async (): Promise<void> => {
        try {
            const serviceCleanup =
                await EventsService.onCacheInvalidated(handleInvalidation);

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Disposed flag can flip while awaiting subscription.
            if (disposed) {
                serviceCleanup();
                return;
            }

            cleanupHandler = serviceCleanup;
        } catch (error) {
            logger.warn(
                "Cache invalidation events not available - frontend cache sync disabled",
                ensureError(error)
            );
        }
    })();

    logger.debug("[CacheSync] Cache synchronization enabled");
    return (): void => {
        disposed = true;
        if (cleanupHandler) {
            cleanupHandler();
            cleanupHandler = null;
        }
    };
}
