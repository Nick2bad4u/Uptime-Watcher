/**
 * Site synchronization operations module.
 * Handles syncing data from backend and status update subscriptions.
 */

import type { Site, StatusUpdate } from "../../types";

import { logStoreAction, withErrorHandling } from "../utils";
import { SiteService } from "./services";
import { StatusUpdateManager, createStatusUpdateHandler } from "./utils";

export interface SiteSyncActions {
    /** Sync sites from backend */
    syncSitesFromBackend: () => Promise<void>;
    /** Full sync from backend */
    fullSyncFromBackend: () => Promise<void>;
    /** Subscribe to status updates */
    subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => void;
    /** Unsubscribe from status updates */
    unsubscribeFromStatusUpdates: () => void;
}

export interface SiteSyncDependencies {
    getSites: () => Site[];
    setSites: (sites: Site[]) => void;
}

// Create a shared status update manager instance
const statusUpdateManager = new StatusUpdateManager();

export const createSiteSyncActions = (deps: SiteSyncDependencies): SiteSyncActions => {
    const actions: SiteSyncActions = {
        fullSyncFromBackend: async () => {
            logStoreAction("SitesStore", "fullSyncFromBackend");
            await actions.syncSitesFromBackend();
        },
        subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
            logStoreAction("SitesStore", "subscribeToStatusUpdates");

            const handler = createStatusUpdateHandler({
                fullSyncFromBackend: actions.fullSyncFromBackend,
                getSites: deps.getSites,
                onUpdate: callback,
                setSites: deps.setSites,
            });

            statusUpdateManager.subscribe(handler).catch((error) => {
                console.error("Failed to subscribe to status updates:", error);
            });
        },
        syncSitesFromBackend: async () => {
            logStoreAction("SitesStore", "syncSitesFromBackend");

            await withErrorHandling(
                async () => {
                    const backendSites = await SiteService.getSites();
                    // Handle null/undefined responses from backend by defaulting to empty array
                    deps.setSites(backendSites || []);
                },
                {
                    clearError: () => {},
                    setError: (error) => logStoreAction("SitesStore", "error", { error }),
                    setLoading: () => {},
                }
            );
        },
        unsubscribeFromStatusUpdates: () => {
            logStoreAction("SitesStore", "unsubscribeFromStatusUpdates");
            statusUpdateManager.unsubscribe();
        },
    };

    return actions;
};
