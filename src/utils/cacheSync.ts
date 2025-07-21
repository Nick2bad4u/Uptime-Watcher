/**
 * Frontend cache synchronization utilities.
 * Automatically synchronizes frontend caches with backend cache invalidation events.
 */

import logger from "../services/logger";
import { ensureError } from "./errorHandling";
import { clearMonitorTypeCache } from "./monitorTypeHelper";

/**
 * Cache invalidation data from backend.
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
 * @returns Cleanup function to remove event listeners
 */
export function setupCacheSync(): () => void {
    // Check if we're in an Electron environment with cache invalidation events available
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof window === "undefined" || !window.electronAPI) {
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
    return cleanup as () => void;
}

/**
 * Clear all frontend caches.
 */
function clearAllFrontendCaches(): void {
    logger.debug("[CacheSync] Clearing all frontend caches");
    clearMonitorTypeCache();
    // Note: configCache in monitorUiHelpers is automatically cleared when monitorTypeCache is cleared
    // since getAvailableMonitorTypes will fetch fresh data
}

/**
 * Clear monitor-related frontend caches.
 *
 * @param identifier - Optional monitor identifier for targeted clearing
 */
function clearMonitorRelatedCaches(identifier?: string): void {
    logger.debug("[CacheSync] Clearing monitor-related caches", { identifier });
    clearMonitorTypeCache();
    // Monitor-specific cache clearing could be added here if needed
}

/**
 * Clear site-related frontend caches.
 *
 * @param identifier - Optional site identifier for targeted clearing
 */
function clearSiteRelatedCaches(identifier?: string): void {
    logger.debug("[CacheSync] Clearing site-related caches", { identifier });
    // Site-specific cache clearing could be added here if needed
    // For now, sites are managed through Zustand stores which handle their own cache invalidation
}
