/**
 * Frontend cache synchronization utilities.
 * Automatically synchronizes frontend caches with backend cache invalidation events.
 */

import logger from "../services/logger";
import { ensureError } from "./errorHandling";
import { clearMonitorTypeCache } from "./monitorTypeHelper";

/**
 * Cache invalidation data from backend.
 *
 * @remarks
 * Contains information about cache invalidation events:
 * - identifier: Optional specific identifier for targeted invalidation
 * - reason: Human-readable reason for the cache invalidation
 * - type: Type of cache invalidation (all, monitor, or site-specific)
 */
interface CacheInvalidationData {
    identifier?: string;
    reason: string;
    type: "all" | "monitor" | "site";
}

/**
 * Set up automatic cache synchronization with backend.
 * Listens for cache invalidation events and clears appropriate frontend caches.
 *
 * @returns Cleanup function to remove event listeners. Call this function
 * when the component unmounts or cache sync is no longer needed to prevent
 * memory leaks and avoid processing events after cleanup.
 */
export function setupCacheSync(): () => void {
    // Check if we're in an Electron environment with cache invalidation events available
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof window === "undefined" || !window.electronAPI?.events) {
        logger.warn("Cache invalidation events not available - frontend cache sync disabled");
        return () => {
            // No-op cleanup
        };
    }

    const cleanup = window.electronAPI.events.onCacheInvalidated((data: CacheInvalidationData) => {
        try {
            logger.debug("Received cache invalidation event", data);

            // Clear appropriate frontend caches based on invalidation type
            switch (data.type) {
                case "all": {
                    clearAllFrontendCaches();
                    break;
                }
                case "monitor": {
                    clearMonitorRelatedCaches(data.identifier);
                    break;
                }
                case "site": {
                    clearSiteRelatedCaches(data.identifier);
                    break;
                }
                default: {
                    logger.warn("Unknown cache invalidation type:", data.type);
                }
            }
        } catch (error) {
            logger.error("Error handling cache invalidation:", ensureError(error));
        }
    });

    logger.debug("[CacheSync] Cache synchronization enabled");
    return cleanup;
}

/**
 * Registry of cache clearing functions for different cache types.
 * This makes it easy to add new cache types without modifying the core logic.
 */
const CACHE_CLEARERS = new Map<string, (identifier?: string) => void>([
    ["monitorType", () => clearMonitorTypeCache()],
    // Add new cache types here as they're implemented
    // ["siteData", (id) => clearSiteDataCache(id)],
    // ["monitorHistory", (id) => clearMonitorHistoryCache(id)],
    // ["analytics", (id) => clearAnalyticsCache(id)],
    // ["settings", () => clearSettingsCache()],
]);

/**
 * Clear all frontend caches.
 */
function clearAllFrontendCaches(): void {
    logger.debug("[CacheSync] Clearing all frontend caches");

    // Clear all registered cache types
    for (const [cacheType, clearer] of CACHE_CLEARERS) {
        try {
            clearer();
            logger.debug(`[CacheSync] Cleared ${cacheType} cache`);
        } catch (error) {
            logger.error(`[CacheSync] Failed to clear ${cacheType} cache:`, ensureError(error));
        }
    }
}

/**
 * Clear monitor-related frontend caches.
 *
 * @param identifier - Optional monitor identifier for targeted clearing
 *
 * @remarks
 * This function can be enhanced to support monitor-specific cache clearing
 * as new monitor-related caches are added to the application.
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
 * @param identifier - Optional site identifier for targeted clearing
 *
 * @remarks
 * Site-specific cache clearing can be enhanced as new site-related caches
 * are added to the application. Currently, sites are managed through
 * Zustand stores which handle their own cache invalidation.
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
